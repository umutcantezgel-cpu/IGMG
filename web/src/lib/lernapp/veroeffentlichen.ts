import 'server-only';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { type Datenbank, db, schema, type Transaktion } from '@/lib/db';
import type { Status } from './freigabe';
import { istKurs, type KursId } from './kurse';

/**
 * Wirkung von Freigabe, Veröffentlichung und Zurückziehen auf die Auslieferung (ADR 0039 Nr. 2, KERN 4.0 §2.3): Kursstand
 * erhöhen und `updateTag(TAG.lernappKurs(id))` – Verzeichnis und Pakete entstehen neu, ein zurückgezogener Baustein ist
 * sofort nirgends mehr sichtbar (das CDN verwirft Einheitenpakete über denselben Tag `lernapp-kurs-<id>`).
 *
 * Nur aus Server Actions aufrufen (`updateTag`); die Rechte prüft die Action (Verwaltung L3/L6) vorher selbst.
 */
export async function kursGeaendert(kurse: readonly KursId[]): Promise<void> {
  const eindeutig = [...new Set(kurse)];
  if (!eindeutig.length) return;
  await erhoeheKursstand(db, eindeutig);
  for (const k of eindeutig) updateTag(TAG.lernappKurs(k));
}

/** Kursstand erhöhen (in einer offenen Transaktion oder direkt); `updateTag` folgt erst nach dem Abschluss. */
async function erhoeheKursstand(tx: Pick<Datenbank, 'update'>, kurse: readonly KursId[]): Promise<void> {
  await tx
    .update(schema.lernappKurs)
    .set({ version: sql`${schema.lernappKurs.version} + 1` })
    .where(inArray(schema.lernappKurs.id, [...kurse]));
}

export type Zurueckziehbar = 'einheit' | 'lektion' | 'aufgabe' | 'lemma' | 'satz' | 'tipp' | 'uebersetzung';

const TABELLE = {
  einheit: schema.lernappEinheit,
  lektion: schema.lernappLektion,
  aufgabe: schema.lernappAufgabe,
  lemma: schema.lernappLemma,
  satz: schema.lernappSatz,
  tipp: schema.lernappTipp,
} as const;

/** Stand eines Bausteins vor einer Sperre: Status und Inhalts-Hash (für „Wieder freigeben“, L3-06b). */
export type BausteinStand = { status: Status; inhaltHash: string };

/**
 * Baustein zurückziehen (Status `gesperrt`, nie sichtbar). `schluessel` ist der stabile Schlüssel, bei Übersetzungen
 * `<bezug>@<sprache>` (wie im Paket). Ergebnis: ob es den Baustein gab.
 *
 * `danach` läuft in derselben Transaktion wie Sperre und Kursstand (Audit, Meldung erledigen) und bekommt den Stand davor
 * (gelesen mit `for update`); scheitert es, bleibt nichts gesperrt. `updateTag` erst nach dem Abschluss.
 */
export async function zieheZurueck(
  art: Zurueckziehbar,
  schluessel: string,
  danach?: (tx: Transaktion, vorher: readonly BausteinStand[]) => Promise<void>,
): Promise<boolean> {
  const kurs = schluessel.split('.')[0];
  if (!istKurs(kurs)) return false;
  let bedingung: ReturnType<typeof eq>;
  // gleiche Spalten für Status und Hash in allen Bausteintabellen (bausteinSpalten)
  let t: typeof schema.lernappSatz;
  if (art === 'uebersetzung') {
    const [bezug, sprache] = schluessel.split('@');
    if (!bezug || (sprache !== 'de' && sprache !== 'tr' && sprache !== 'ar')) return false;
    t = schema.lernappUebersetzung as unknown as typeof schema.lernappSatz;
    bedingung = sql`${schema.lernappUebersetzung.sprache} = ${sprache} and (${schema.lernappUebersetzung.lemmaId} in (select id from lernapp_lemma where schluessel = ${bezug}) or ${schema.lernappUebersetzung.satzId} in (select id from lernapp_satz where schluessel = ${bezug}))`;
  } else {
    t = TABELLE[art] as typeof schema.lernappSatz;
    bedingung = eq(t.schluessel, schluessel);
  }
  const getroffen = await db.transaction(async (tx) => {
    const vorher = await tx.select({ status: t.status, inhaltHash: t.inhaltHash }).from(t).where(bedingung).for('update');
    if (!vorher.length) return false;
    await tx.update(t).set({ status: 'gesperrt' }).where(bedingung);
    await erhoeheKursstand(tx, [kurs]);
    await danach?.(tx, vorher);
    return true;
  });
  if (getroffen) updateTag(TAG.lernappKurs(kurs));
  return getroffen;
}

/** Was die Verwaltung sperren und wieder freigeben kann (Meldungen: die Aufgabe oder ein Eintrag, auf den sie verweist). */
export type Entsperrbar = 'aufgabe' | 'lemma' | 'satz';

/**
 * Gesperrten Baustein wieder freigeben (Verwaltung › Meldungen, L3-06b), ohne Neuimport: Status `status` (der Stand vor der
 * Sperre), nur wenn er gerade `gesperrt` ist und noch den Inhalts-Hash `hash` von der Sperre trägt – ein geänderter Inhalt
 * bekommt nie den Status eines anderen Stands (ADR 0041). Kursstand und `danach` (Audit) in derselben Transaktion; wirkt
 * sofort wie das Zurückziehen (Cache-Tag nach dem Abschluss). Freigabe- und Sichtbarkeitsregeln (`freigabe.ts`) gelten
 * weiter: Religionsbezug braucht zwei Freigaben, Urteile zum Hash bleiben.
 */
export async function gibWiederFrei(
  art: Entsperrbar,
  schluessel: string,
  status: Exclude<Status, 'gesperrt'>,
  hash: string,
  danach: (tx: Transaktion) => Promise<void>,
): Promise<boolean> {
  const kurs = schluessel.split('.')[0];
  if (!istKurs(kurs)) return false;
  const t = TABELLE[art] as typeof schema.lernappSatz;
  const frei = await db.transaction(async (tx) => {
    const r = await tx
      .update(t)
      .set({ status })
      .where(and(eq(t.schluessel, schluessel), eq(t.status, 'gesperrt'), eq(t.inhaltHash, hash)))
      .returning({ id: t.id });
    if (!r.length) return false;
    await erhoeheKursstand(tx, [kurs]);
    await danach(tx);
    return true;
  });
  if (frei) updateTag(TAG.lernappKurs(kurs));
  return frei;
}
