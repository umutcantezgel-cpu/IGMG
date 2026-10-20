import 'server-only';
import { eq, inArray, sql } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
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
  await db
    .update(schema.lernappKurs)
    .set({ version: sql`${schema.lernappKurs.version} + 1` })
    .where(inArray(schema.lernappKurs.id, eindeutig));
  for (const k of eindeutig) updateTag(TAG.lernappKurs(k));
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

/**
 * Baustein zurückziehen (Status `gesperrt`, nie sichtbar). `schluessel` ist der stabile Schlüssel, bei Übersetzungen
 * `<bezug>@<sprache>` (wie im Paket). Ergebnis: ob es den Baustein gab.
 */
export async function zieheZurueck(art: Zurueckziehbar, schluessel: string): Promise<boolean> {
  const kurs = schluessel.split('.')[0];
  if (!istKurs(kurs)) return false;
  let getroffen = 0;
  if (art === 'uebersetzung') {
    const [bezug, sprache] = schluessel.split('@');
    if (!bezug || (sprache !== 'de' && sprache !== 'tr' && sprache !== 'ar')) return false;
    const r = await db
      .update(schema.lernappUebersetzung)
      .set({ status: 'gesperrt' })
      .where(
        sql`${schema.lernappUebersetzung.sprache} = ${sprache} and (${schema.lernappUebersetzung.lemmaId} in (select id from lernapp_lemma where schluessel = ${bezug}) or ${schema.lernappUebersetzung.satzId} in (select id from lernapp_satz where schluessel = ${bezug}))`,
      )
      .returning({ id: schema.lernappUebersetzung.id });
    getroffen = r.length;
  } else {
    const t = TABELLE[art] as typeof schema.lernappSatz;
    const r = await db.update(t).set({ status: 'gesperrt' }).where(eq(t.schluessel, schluessel)).returning({ id: t.id });
    getroffen = r.length;
  }
  if (getroffen) await kursGeaendert([kurs]);
  return getroffen > 0;
}
