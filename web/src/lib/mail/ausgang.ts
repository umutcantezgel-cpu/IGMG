import 'server-only';
import { and, eq, inArray, isNull, lt, lte, sql } from 'drizzle-orm';
import { createTranslator } from 'next-intl';
import { db, schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import { AKTIONEN, EINGANG_AKTION, MATRIX, ROLLEN, type Aktion, type OrganisationKuerzel } from '@/lib/rechte/matrix';
import { baueNewsletterMail, NEWSLETTER_EMPFAENGER, newsletterEmpfaenger } from '@/lib/newsletter/mails';
import { basisUrl } from '@/lib/seo/metadaten';
import { BEREICHE } from '../../../messages/bereiche';
import de from '../../../messages/de.json';
import { versende } from './transport';
import { benachrichtigungMail, bestaetigungMail } from './vorlagen';

/**
 * Mail-Ausgang (ADR 0005): Einträge entstehen in der Transaktion des Formulars, der Versand läuft danach
 * (after()) und bei Bedarf erneut (Wartung). Empfänger und Daten sind verschlüsselt gespeichert.
 * Fehlversuche: exponentielles Warten (2^n Minuten), höchstens 6 Versuche; Fehlertext ohne Personendaten.
 */
type Inhalt = { an: string; daten: Record<string, string> };
type EingangArt = keyof typeof EINGANG_AKTION;
const MAX_VERSUCHE = 6;

/**
 * Empfänger „rolle:<art>[:<organisation>]“ (Leserecht der Eingangsart) oder „recht:<aktion>[:<organisation>]“
 * (z. B. `recht:ticket.bearbeiten` für Meldungen, E-037) → E-Mail-Adressen aller zuständigen, nicht gesperrten Konten.
 */
async function empfaenger(an: string): Promise<string[]> {
  // Newsletter (AUFTRAG 3.10): Adresse erst beim Versand und nur bei bestätigter Anmeldung
  if (an.startsWith(NEWSLETTER_EMPFAENGER)) return newsletterEmpfaenger(an.slice(NEWSLETTER_EMPFAENGER.length));
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
  const newsletter = await baueNewsletterMail(vorlage, sprache, inhalt.daten);
  if (newsletter) return newsletter;
  if (vorlage === 'passwort') {
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
      for (const an of await empfaenger(inhalt.an)) await versende({ an, betreff: mail.betreff, html: mail.html, text: mail.text });
      await db.update(schema.mailAusgang).set({ gesendetAm: new Date(), fehler: null }).where(eq(schema.mailAusgang.id, id));
      gesendet++;
    } catch (e) {
      fehler++;
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
