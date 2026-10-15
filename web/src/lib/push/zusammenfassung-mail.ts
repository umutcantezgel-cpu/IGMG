import 'server-only';
import { eq } from 'drizzle-orm';
import { createTranslator } from 'next-intl';
import { pfadFuer } from '@/i18n/navigation';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { istUnzustellbar } from '@/lib/mail/adresse';
import type { MailSprache } from '@/lib/mail/konto-vorlagen';
import { zusammenfassungMail } from '@/lib/mail/vorlagen/zusammenfassung';
import { basisUrl } from '@/lib/seo/metadaten';
import { BEREICHE } from '../../../messages/bereiche';
import { kindDarfPush } from './abo';
import { KEIN_NEUES, themenAus, ZUSAMMENFASSUNG_THEMEN, zeilenDerZusammenfassung, type NeuesZaehlung } from './rueckfall';

/**
 * Mail-Zusammenfassung im Mail-Ausgang (ADR 0034 Nr. 6, F-38): Die Zeile trägt als Empfänger nur
 * „zusammenfassung:<Konto-ID>“ und als Daten die Anzahl je Bereich. Die Adresse ermittelt erst der Versand – und nur,
 * solange die Zusammenfassung bestellt ist, die Adresse bestätigt und zustellbar ist, das Konto kein Kinderkonto und
 * nicht gesperrt ist und der Schalter `push` an ist. Wer zwischen Planung und Versand abbestellt, bekommt nichts.
 * Getrennt von `zusammenfassung.ts`, damit der Mail-Ausgang den Chat-Dienst nicht lädt.
 */
export const ZUSAMMENFASSUNG_VORLAGE = 'konto-zusammenfassung';
export const ZUSAMMENFASSUNG_EMPFAENGER = 'zusammenfassung:';

const SPRACHEN: readonly MailSprache[] = ['de', 'tr', 'en'];

export type ZusammenfassungLage =
  { moeglich: true; email: string; sprache: MailSprache } | { moeglich: false; grund: 'aus' | 'kind' | 'adresse' | 'einwilligung' };

/**
 * Darf dieses Konto eine Zusammenfassung per E-Mail bekommen? Schalter `push` und `konten` an; bestätigte, zustellbare
 * Adresse (nie `.invalid`); kein Kinderkonto, nicht gesperrt; Lernende (ab 16 mit eigenem Konto) nur mit gültiger
 * Einwilligung in Benachrichtigungen (D-07, D-11) – die Zusammenfassung ist der Rückfall des Push.
 */
export async function zusammenfassungsLage(benutzerId: string, jetzt = new Date()): Promise<ZusammenfassungLage> {
  if (!(await funktionAn('push')) || !(await funktionAn('konten'))) return { moeglich: false, grund: 'aus' };
  const [z] = await db
    .select({
      email: schema.user.email,
      bestaetigt: schema.user.emailVerified,
      gesperrtAm: schema.user.gesperrtAm,
      istKind: schema.kontoProfil.istKind,
      sprache: schema.kontoProfil.sprache,
    })
    .from(schema.user)
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.user.id))
    .where(eq(schema.user.id, benutzerId))
    .limit(1);
  if (!z || z.gesperrtAm) return { moeglich: false, grund: 'adresse' };
  if (z.istKind) return { moeglich: false, grund: 'kind' };
  if (!z.bestaetigt || istUnzustellbar(z.email)) return { moeglich: false, grund: 'adresse' };
  const [lernend] = await db
    .select({ id: schema.lernende.id })
    .from(schema.lernende)
    .where(eq(schema.lernende.benutzerId, benutzerId))
    .limit(1);
  if (lernend && !(await kindDarfPush(benutzerId, jetzt))) return { moeglich: false, grund: 'einwilligung' };
  const sprache = (SPRACHEN as readonly string[]).includes(z.sprache ?? '') ? (z.sprache as MailSprache) : 'de';
  return { moeglich: true, email: z.email, sprache };
}

/** Empfänger beim Versand: die Kontoadresse, solange alles noch gilt; sonst niemand (die Mail entfällt still). */
export async function zusammenfassungEmpfaenger(benutzerId: string): Promise<string[]> {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(benutzerId)) return [];
  const [zeile] = await db
    .select({ themen: schema.mailZusammenfassung.themen })
    .from(schema.mailZusammenfassung)
    .where(eq(schema.mailZusammenfassung.benutzerId, benutzerId));
  if (!zeile || !themenAus(zeile.themen).length) return [];
  const lage = await zusammenfassungsLage(benutzerId);
  return lage.moeglich ? [lage.email] : [];
}

type Uebersetzer = (schluessel: string, werte?: Record<string, string>) => string;

function uebersetzer(sprache: MailSprache): Uebersetzer {
  const datei = BEREICHE.konto;
  const messages = { ...(sprache === 'de' ? {} : datei.de), ...datei[sprache] } as Record<string, unknown>;
  return createTranslator({ locale: sprache, messages, namespace: 'konto.mails.zusammenfassung' } as never) as unknown as Uebersetzer;
}

/** Anzahl je Bereich aus den Daten der Ausgangszeile (nur ganze Zahlen ≥ 0). */
export function zahlAusDaten(daten: Record<string, string>): NeuesZaehlung {
  const zahl = { ...KEIN_NEUES };
  for (const t of ZUSAMMENFASSUNG_THEMEN) {
    const n = Number(daten[t] ?? 0);
    zahl[t] = Number.isInteger(n) && n > 0 && n < 10_000 ? n : 0;
  }
  return zahl;
}

/** Mail bauen: Betreff, Einleitung, eine Zeile je Bereich mit Anzahl, Knopf zu Mein Bereich, Link zu den Einstellungen. */
export async function baueZusammenfassungsMail(sprache: MailSprache, daten: Record<string, string>) {
  const t = uebersetzer(sprache);
  const zeilen = zeilenDerZusammenfassung(zahlAusDaten(daten)).map(({ thema, anzahl }) =>
    anzahl === 1 ? t(`${thema}.eins`) : t(`${thema}.mehr`, { anzahl: String(anzahl) }),
  );
  return zusammenfassungMail(sprache, {
    betreff: t('betreff'),
    einleitung: t('einleitung'),
    zeilen,
    knopf: t('knopf'),
    link: `${basisUrl()}${pfadFuer('/mein-bereich', sprache)}`,
    hinweis: t('hinweis'),
    abbestellen: t('abbestellen'),
    einstellungenLink: `${basisUrl()}${pfadFuer({ pathname: '/mein-bereich/benachrichtigungen', hash: 'zusammenfassung' }, sprache)}`,
  });
}
