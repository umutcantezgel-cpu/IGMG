import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { UebersetzungsVermerk } from '@/lib/db/schema/quran';

/**
 * Quran (ADR 0009, D-Q1, G-06): Texte nur aus der importierten Quelle (Tanzil, `pnpm quran:import`). Ohne Import ist
 * `quelle` null – die Seiten zeigen dann die fünf Surennamen des Bestands (messages, `quran.sura.1…5`) und den
 * Platzhalter `[Koranvers – Text von der Gemeinde]`. Übersetzungen nur mit Quelle und Lizenz je Sprache (M-036b).
 * Gecacht mit Tag `quran`; nach einem Import Cache erneuern (BETRIEB.md, ADR 0017).
 */
export type QuranQuelle = { bezeichnung: string; url: string; version: string };
export type SureKurz = { nr: number; nameAr: string; verseAnzahl: number };
export type Vers = {
  nr: number;
  textAr: string;
  uebersetzung: { de?: UebersetzungsVermerk; tr?: UebersetzungsVermerk; en?: UebersetzungsVermerk } | null;
};
export type SureDaten = SureKurz & { verse: Vers[] };

/** Anzahl der Suren, wenn keine Quelle importiert ist: die fünf Surennamen des Bestands (Navigation ohne Verstext). */
export const SUREN_OHNE_QUELLE = 5;

export async function ladeQuranStand(): Promise<{ quelle: QuranQuelle | null; suren: SureKurz[] }> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  const [quelle] = await db
    .select({ bezeichnung: schema.quranQuelle.bezeichnung, url: schema.quranQuelle.url, version: schema.quranQuelle.version })
    .from(schema.quranQuelle)
    .limit(1);
  if (!quelle) return { quelle: null, suren: [] };
  const suren = await db
    .select({ nr: schema.quranSure.nr, nameAr: schema.quranSure.nameAr, verseAnzahl: schema.quranSure.verseAnzahl })
    .from(schema.quranSure)
    .orderBy(asc(schema.quranSure.nr));
  return { quelle, suren };
}

/** Eine Sure mit Versen; null ohne Import oder bei unbekannter Nummer. */
export async function ladeSure(nr: number): Promise<SureDaten | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  if (!Number.isInteger(nr) || nr < 1 || nr > 114) return null;
  const [sure] = await db
    .select({ nr: schema.quranSure.nr, nameAr: schema.quranSure.nameAr, verseAnzahl: schema.quranSure.verseAnzahl })
    .from(schema.quranSure)
    .where(eq(schema.quranSure.nr, nr))
    .limit(1);
  if (!sure) return null;
  const verse = await db
    .select({ nr: schema.quranVers.vers, textAr: schema.quranVers.textAr, uebersetzung: schema.quranVers.uebersetzung })
    .from(schema.quranVers)
    .where(eq(schema.quranVers.sure, nr))
    .orderBy(asc(schema.quranVers.vers));
  return { ...sure, verse };
}
