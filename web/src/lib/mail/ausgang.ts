import 'server-only';
import { and, eq, inArray, isNull, lt, lte, sql } from 'drizzle-orm';
import { createTranslator } from 'next-intl';
import { db, schema } from '@/lib/db';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { AKTIONEN, EINGANG_AKTION, MATRIX, ROLLEN, type Aktion, type OrganisationKuerzel } from '@/lib/rechte/matrix';
import { baueNewsletterMail, NEWSLETTER_EMPFAENGER, newsletterEmpfaenger } from '@/lib/newsletter/mails';
import {
  baueZusammenfassungsMail,
  ZUSAMMENFASSUNG_EMPFAENGER,
  ZUSAMMENFASSUNG_VORLAGE,
  zusammenfassungEmpfaenger,
} from '@/lib/push/zusammenfassung-mail';
import { basisUrl } from '@/lib/seo/metadaten';
import { BEREICHE } from '../../../messages/bereiche';
import de from '../../../messages/de.json';
import { VERWALTUNG } from '../../../messages/verwaltung';
import { istUnzustellbar, MailUnzustellbar } from './adresse';
import {
  istKontoVorlage,
  KONTO_MAIL_SCHLUESSEL,
  kontoSpracheAusLink,
  SICHERHEITS_VORLAGEN,
  type KontoVorlage,
  type MailSprache,
} from './konto-vorlagen';
import { versende } from './transport';
import { benachrichtigungMail, bestaetigungMail, kontoMail } from './vorlagen';

/**
 * Mail-Ausgang (ADR 0005): Einträge entstehen in der Transaktion des Formulars, der Versand läuft danach
 * (after()) und bei Bedarf erneut (Wartung). Empfänger und Daten sind verschlüsselt gespeichert.
 * Fehlversuche: exponentielles Warten (2^n Minuten), höchstens 6 Versuche; Fehlertext ohne Personendaten.
 */
type Inhalt = { an: string; daten: Record<string, string> };
type EingangArt = keyof typeof EINGANG_AKTION;
export const MAX_VERSUCHE = 6;

/**
 * Empfänger „rolle:<art>[:<organisation>]“ (Leserecht der Eingangsart) oder „recht:<aktion>[:<organisation>]“
 * (z. B. `recht:ticket.bearbeiten` für Meldungen, E-037) → E-Mail-Adressen aller zuständigen, nicht gesperrten Konten.
 * „schutzrollen:“ → alle Konten mit der Rolle `leitung` oder `kinderschutz` (Hinweise zu Schutzrollen, S2/S3) – nicht
 * die Administration, die solche Vorgänge selbst auslöst.
 */
export const SCHUTZROLLEN_EMPFAENGER = 'schutzrollen:';

async function empfaenger(an: string): Promise<string[]> {
  // Newsletter (AUFTRAG 3.10): Adresse erst beim Versand und nur bei bestätigter Anmeldung
  if (an.startsWith(NEWSLETTER_EMPFAENGER)) return newsletterEmpfaenger(an.slice(NEWSLETTER_EMPFAENGER.length));
  // Tägliche Zusammenfassung (F-38): Adresse erst beim Versand und nur, solange sie bestellt und zustellbar ist
  if (an.startsWith(ZUSAMMENFASSUNG_EMPFAENGER)) return zusammenfassungEmpfaenger(an.slice(ZUSAMMENFASSUNG_EMPFAENGER.length));
  if (an === SCHUTZROLLEN_EMPFAENGER) {
    const zeilen = await db
      .selectDistinct({ email: schema.user.email })
      .from(schema.rolleZuweisung)
      .innerJoin(schema.user, eq(schema.user.id, schema.rolleZuweisung.benutzerId))
      .where(and(inArray(schema.rolleZuweisung.rolle, ['leitung', 'kinderschutz']), isNull(schema.user.gesperrtAm)));
    return zeilen.map((z) => z.email);
  }
  if (!an.startsWith('rolle:') && !an.startsWith('recht:')) return [an];
  const [art, schluessel, organisation] = an.split(':') as ['rolle' | 'recht', string, OrganisationKuerzel | undefined];
  const aktion: Aktion | undefined =
    art === 'rolle'
      ? EINGANG_AKTION[schluessel as EingangArt]?.lesen
      : (AKTIONEN as readonly string[]).includes(schluessel)
        ? (schluessel as Aktion)
        : undefined;
  if (!aktion) return [];
  const rollen = ROLLEN.filter((r) => MATRIX[r].has(aktion));
  const zeilen = await db
    .select({ email: schema.user.email, rolle: schema.rolleZuweisung.rolle, organisation: schema.rolleZuweisung.organisation })
    .from(schema.rolleZuweisung)
    .innerJoin(schema.user, eq(schema.user.id, schema.rolleZuweisung.benutzerId))
    .where(and(inArray(schema.rolleZuweisung.rolle, rollen), isNull(schema.user.gesperrtAm)));
  // Organisationsredaktion nur für Eingänge der eigenen Organisation
  const passend = zeilen.filter((z) => z.rolle !== 'organisationsredaktion' || (organisation && z.organisation === organisation));
  return [...new Set(passend.map((z) => z.email))];
}

/** Übersetzer ohne Typbindung an die Sprachdateien (Schlüssel prüft `pnpm sprachen:pruefen`). */
type Uebersetzer = (schluessel: string, werte?: Record<string, string>) => string;
function uebersetzer(locale: string, messages: Record<string, unknown>, namespace: string): Uebersetzer {
  return createTranslator({ locale, messages, namespace } as never) as unknown as Uebersetzer;
}

function nachrichten(sprache: 'de' | 'tr' | 'en') {
  const datei = BEREICHE.mails;
  return { ...(sprache === 'de' ? {} : datei.de), ...datei[sprache] } as Record<string, unknown>;
}

/** Texte der Konto-Mails (messages/bereiche/konto.json, Namensraum `konto.mails`), mit Rückfall auf Deutsch. */
function kontoNachrichten(sprache: MailSprache) {
  const datei = BEREICHE.konto;
  return { ...(sprache === 'de' ? {} : datei.de), ...datei[sprache] } as Record<string, unknown>;
}

/** Konto-Mail rendern: nur Betreff, ein Satz, Knopf mit Link und Fußhinweis (ADR 0026, keine Inhalte). */
async function kontoMailBauen(vorlage: KontoVorlage, sprache: MailSprache, inhalt: Inhalt) {
  const t = uebersetzer(sprache, kontoNachrichten(sprache), `konto.mails.${KONTO_MAIL_SCHLUESSEL[vorlage]}`);
  return kontoMail(sprache, {
    betreff: t('betreff'),
    text: t('text', { gueltigBis: inhalt.daten.gueltigBis ?? '', zeitpunkt: inhalt.daten.zeitpunkt ?? '' }),
    knopf: t('knopf'),
    hinweis: t('hinweis'),
    link: inhalt.daten.link ?? basisUrl(),
  });
}

/**
 * Hinweis zur Kenntnis (Vorlage „hinweis“, ohne Namen und Inhalte) in der Transaktion des Aufrufers planen – an
 * `recht:meldung.chat.bearbeiten` (kinderschutz) oder `SCHUTZROLLEN_EMPFAENGER` (Leitung und Kinderschutz).
 */
export async function planeHinweis(
  o: {
    an: string;
    art:
      | 'kanal_fortgesetzt'
      | 'rollenantrag'
      | 'rolle_vergeben'
      | 'rollenentzug'
      | 'rolle_entzogen'
      | 'schutzrolle_gesperrt'
      | 'leitungszuweisung'
      | 'elternbezug'
      | 'elterneinladung'
      | 'elternbezug_beenden'
      | 'elternbezug_beendet'
      | 'schuelerkonto';
    pfad: string;
  },
  tx: Pick<typeof db, 'insert'> = db,
): Promise<void> {
  const paket = verschluessele({ an: o.an, daten: { art: o.art, pfad: o.pfad } });
  await tx
    .insert(schema.mailAusgang)
    .values({ vorlage: 'hinweis', sprache: 'de', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId });
}

/** Empfänger der Hinweise zum IGMG-Abgleich: alle, die die Gebetszeiten bearbeiten dürfen (ADR 0048). */
export const GEBETSZEITEN_EMPFAENGER = 'recht:gebetszeiten.bearbeiten';

/**
 * Hinweis zum IGMG-Abgleich der Gebetszeiten (Vorlage „gebetszeiten“, ADR 0048), nur beim Zustandswechsel: Abgleich
 * gestört, Lieferung auffällig, Abdeckung zu kurz oder neue Konflikte mit dem Import. Ohne Daten, nur der Pfad zur Verwaltung.
 */
export async function planeGebetszeitenHinweis(
  o: { art: 'stoerung' | 'auffaellig' | 'abdeckung' | 'konflikte' },
  tx: Pick<typeof db, 'insert'> = db,
): Promise<void> {
  const paket = verschluessele({ an: GEBETSZEITEN_EMPFAENGER, daten: { art: o.art, pfad: '/verwaltung/gebetszeiten' } });
  await tx
    .insert(schema.mailAusgang)
    .values({ vorlage: 'gebetszeiten', sprache: 'de', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId });
}

/**
 * Hinweis an die betroffene Person eines Verwaltungskontos (Nacharbeit N4, Vorlage „betroffen“, Deutsch): Entzug einer
 * Schutzrolle beantragt bzw. vollzogen, Konto mit Schutzrolle gesperrt. Nur die Art des Vorgangs und die Rolle, keine
 * Namen. Geht an die Kontoadresse – auch eines gesperrten Kontos (die Person soll davon erfahren).
 */
export async function planeBetroffenenHinweis(
  o: { an: string; art: 'rollenentzug' | 'rolle_entzogen' | 'gesperrt'; rolle?: string },
  tx: Pick<typeof db, 'insert'> = db,
): Promise<boolean> {
  if (istUnzustellbar(o.an)) return false;
  const paket = verschluessele({ an: o.an, daten: { art: o.art, rolle: o.rolle ?? '' } });
  await tx
    .insert(schema.mailAusgang)
    .values({ vorlage: 'betroffen', sprache: 'de', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId });
  return true;
}

/**
 * Geplante Konto-Mail (verschlüsselt im Ausgang). Unzustellbare Adressen (`.invalid`, z. B. Kinderkonten) werden gar
 * nicht erst geplant (ADR 0026). Rückgabe: true, wenn eine Mail geplant wurde.
 */
export async function planeKontoMail(
  o: { an: string; vorlage: KontoVorlage; sprache: MailSprache; daten: Record<string, string> },
  tx: Pick<typeof db, 'insert'> = db,
): Promise<boolean> {
  if (istUnzustellbar(o.an)) return false;
  const paket = verschluessele({ an: o.an, daten: o.daten });
  await tx
    .insert(schema.mailAusgang)
    .values({ vorlage: o.vorlage, sprache: o.sprache, datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId });
  return true;
}

async function kontaktZeile(): Promise<{ adresse: string; email: string }> {
  const [z] = await db
    .select({ inhalt: schema.seiteninhalt.inhalt })
    .from(schema.seiteninhalt)
    .where(eq(schema.seiteninhalt.bereich, 'kontakt'))
    .limit(1);
  const k = (z?.inhalt ?? {}) as { adresse?: string; email?: string };
  return { adresse: k.adresse ?? '[Adresse]', email: k.email ?? '[E-Mail-Adresse]' };
}

async function baue(vorlage: string, sprache: 'de' | 'tr' | 'en', inhalt: Inhalt, eingangId: string | null) {
  if (istKontoVorlage(vorlage)) return kontoMailBauen(vorlage, sprache, inhalt);
  // Tägliche Zusammenfassung (ADR 0034 Nr. 6): nur Bereich und Anzahl, keine Namen, keine Inhalte
  if (vorlage === ZUSAMMENFASSUNG_VORLAGE) return baueZusammenfassungsMail(sprache, inhalt.daten);
  const newsletter = await baueNewsletterMail(vorlage, sprache, inhalt.daten);
  if (newsletter) return newsletter;
  if (vorlage === 'passwort') {
    // Gemeinde-Konto (Rücksprung nicht in die Verwaltung): Mail in der Sprache des Rücksprungs
    const kontoSprache = kontoSpracheAusLink(inhalt.daten.link);
    if (kontoSprache) return kontoMailBauen('konto-passwort', kontoSprache, inhalt);
    // Passwort vergessen (C12): Link von Better Auth, 60 Minuten gültig
    const t = uebersetzer('de', { verwaltung: de.verwaltung }, 'verwaltung.mails');
    return benachrichtigungMail({
      betreff: t('passwort.betreff'),
      text: t('passwort.text', { name: inhalt.daten.name ?? '' }),
      knopf: t('passwort.knopf'),
      hinweis: t('passwort.hinweis'),
      link: inhalt.daten.link ?? `${basisUrl()}/verwaltung/anmelden`,
    });
  }
  if (vorlage === SICHERHEITS_VORLAGEN.passkey || vorlage === SICHERHEITS_VORLAGEN.zwei_faktor) {
    // Konto der Verwaltung: neuer Passkey bzw. Zwei-Faktor-Anmeldung eingerichtet – Zeitpunkt, keine Geheimnisse
    const art = vorlage === SICHERHEITS_VORLAGEN.passkey ? 'passkey' : 'zweiFaktor';
    const t = uebersetzer('de', { verwaltung: VERWALTUNG.sicherheit }, `verwaltung.sicherheit.mails.${art}`);
    return benachrichtigungMail({
      betreff: t('betreff'),
      text: t('text', { zeitpunkt: inhalt.daten.zeitpunkt ?? '' }),
      knopf: t('knopf'),
      hinweis: t('hinweis'),
      link: inhalt.daten.link ?? `${basisUrl()}/verwaltung/konto`,
    });
  }
  if (vorlage === 'einladung') {
    // Einladung in die Verwaltung (C12): Layout der Benachrichtigung mit Knopf; der Link kommt aus der Action
    const t = uebersetzer('de', { verwaltung: de.verwaltung }, 'verwaltung.mails');
    return benachrichtigungMail({
      betreff: t('einladung.betreff'),
      text: t('einladung.text', { name: inhalt.daten.name ?? '', gueltigBis: inhalt.daten.gueltigBis ?? '' }),
      knopf: t('einladung.knopf'),
      hinweis: t('einladung.hinweis'),
      link: inhalt.daten.link ?? `${basisUrl()}/verwaltung/anmelden`,
    });
  }
  if (vorlage === 'hinweis') {
    // Hinweis zur Kenntnis an Leitung/Kinderschutz (S2/S3): nur die Art des Vorgangs, keine Namen, keine Inhalte
    const t = uebersetzer('de', { verwaltung: de.verwaltung }, 'verwaltung.mails');
    const art = t(`art.${inhalt.daten.art}`);
    return benachrichtigungMail({
      betreff: t('hinweis.betreff', { art }),
      text: t('hinweis.text', { art }),
      knopf: t('hinweis.knopf'),
      hinweis: t('hinweis.hinweis'),
      link: `${basisUrl()}${/^\/verwaltung\//.test(inhalt.daten.pfad ?? '') ? inhalt.daten.pfad : '/verwaltung'}`,
    });
  }
  if (vorlage === 'gebetszeiten') {
    // IGMG-Abgleich (ADR 0048): nur die Art des Zustands, keine Zeiten und keine Daten
    const t = uebersetzer('de', { verwaltung: VERWALTUNG.gebetszeiten }, 'verwaltung.gebetszeiten.mail');
    const art = t(`art.${inhalt.daten.art}`);
    return benachrichtigungMail({
      betreff: t('betreff', { art }),
      text: t('text', { art }),
      knopf: t('knopf'),
      hinweis: t('hinweis'),
      link: `${basisUrl()}/verwaltung/gebetszeiten`,
    });
  }
  if (vorlage === 'betroffen') {
    // Hinweis an die betroffene Person (N4): Art des Vorgangs und Rolle, keine Namen
    const t = uebersetzer('de', { verwaltung: de.verwaltung }, 'verwaltung.mails');
    const tr = uebersetzer('de', { verwaltung: de.verwaltung }, 'verwaltung.rollen');
    const rolle = (ROLLEN as readonly string[]).includes(inhalt.daten.rolle ?? '') ? tr(inhalt.daten.rolle) : '';
    const art = t(`betroffenArt.${inhalt.daten.art}`, { rolle });
    return benachrichtigungMail({
      betreff: t('betroffen.betreff', { art }),
      text: t('betroffen.text', { art }),
      knopf: t('betroffen.knopf'),
      hinweis: t('betroffen.hinweis'),
      link: `${basisUrl()}/verwaltung/konto`,
    });
  }
  if (vorlage === 'benachrichtigung') {
    const t = uebersetzer('de', { verwaltung: de.verwaltung }, 'verwaltung.mails');
    const art = t(`art.${inhalt.daten.art}`);
    return benachrichtigungMail({
      betreff: t('benachrichtigung.betreff', { art }),
      text: t('benachrichtigung.text', { art }),
      knopf: t('benachrichtigung.knopf'),
      hinweis: t('benachrichtigung.hinweis'),
      // Ziel in der Verwaltung oder in „Mein Bereich“ (Chat-Meldung an die Gruppenleitung): eigener Pfad oder der Eingang
      link: `${basisUrl()}${/^\/(verwaltung|mein-bereich)\//.test(inhalt.daten.pfad ?? '') ? inhalt.daten.pfad : `/verwaltung/eingaenge${eingangId ? `/${eingangId}` : ''}`}`,
    });
  }
  const t = uebersetzer(sprache, nachrichten(sprache), 'mails');
  const art = t(`art.${inhalt.daten.art}`);
  const kontakt = await kontaktZeile();
  const veranstaltung = inhalt.daten.veranstaltung;
  return bestaetigungMail(sprache, {
    betreff: veranstaltung ? t('bestaetigung.betreffVeranstaltung', { veranstaltung }) : t('bestaetigung.betreff', { art }),
    anrede: t('bestaetigung.anrede'),
    text: veranstaltung
      ? t('bestaetigung.textVeranstaltung', { veranstaltung, termin: inhalt.daten.termin ?? '', datum: inhalt.daten.datum ?? '' })
      : t('bestaetigung.text', { art, datum: inhalt.daten.datum ?? '' }),
    hinweis: t('bestaetigung.hinweis'),
    gruss: t('bestaetigung.gruss'),
    kontakt: t('bestaetigung.kontakt', kontakt),
  });
}

/** Offene Mails versenden (höchstens `max`). Jede Zeile wird vorher „reserviert“, damit parallele Läufe nicht doppelt senden. */
export async function versendeOffeneMails(max = 20): Promise<{ gesendet: number; fehler: number }> {
  const offen = await db
    .select({ id: schema.mailAusgang.id })
    .from(schema.mailAusgang)
    .where(
      and(
        isNull(schema.mailAusgang.gesendetAm),
        lte(schema.mailAusgang.naechsterVersuch, sql`now()`),
        lt(schema.mailAusgang.versuche, MAX_VERSUCHE),
      ),
    )
    .limit(max);
  let gesendet = 0;
  let fehler = 0;
  for (const { id } of offen) {
    const [zeile] = await db
      .update(schema.mailAusgang)
      .set({ naechsterVersuch: sql`now() + interval '10 minutes'`, versuche: sql`${schema.mailAusgang.versuche} + 1` })
      .where(
        and(eq(schema.mailAusgang.id, id), isNull(schema.mailAusgang.gesendetAm), lte(schema.mailAusgang.naechsterVersuch, sql`now()`)),
      )
      .returning();
    if (!zeile) continue;
    try {
      const inhalt = entschluessele<Inhalt>(zeile.datenVerschluesselt, zeile.schluesselId);
      const mail = await baue(
        zeile.vorlage,
        (['de', 'tr', 'en'].includes(zeile.sprache) ? zeile.sprache : 'de') as 'de' | 'tr' | 'en',
        inhalt,
        zeile.bezugEingangId,
      );
      // Unzustellbare Empfänger (`.invalid`: Kinder- und Beispielkonten) nie ansprechen; eine Mail nur an sie ist ein
      // endgültiger Fehler ohne weitere Versuche (ADR 0026)
      const alle = await empfaenger(inhalt.an);
      const zustellbar = alle.filter((a) => !istUnzustellbar(a));
      if (alle.length > 0 && zustellbar.length === 0) throw new MailUnzustellbar();
      for (const an of zustellbar) await versende({ an, betreff: mail.betreff, html: mail.html, text: mail.text });
      await db.update(schema.mailAusgang).set({ gesendetAm: new Date(), fehler: null }).where(eq(schema.mailAusgang.id, id));
      gesendet++;
    } catch (e) {
      fehler++;
      if (e instanceof MailUnzustellbar) {
        await db.update(schema.mailAusgang).set({ fehler: e.name, versuche: MAX_VERSUCHE }).where(eq(schema.mailAusgang.id, id));
        continue;
      }
      const warten = 2 ** zeile.versuche;
      await db
        .update(schema.mailAusgang)
        .set({
          fehler: (e instanceof Error ? e.name : 'Fehler').slice(0, 60),
          naechsterVersuch: sql`now() + make_interval(mins => ${warten})`,
        })
        .where(eq(schema.mailAusgang.id, id));
    }
  }
  return { gesendet, fehler };
}
