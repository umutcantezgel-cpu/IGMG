import 'server-only';
import { and, asc, eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { DES_TAGES, eintragDesTages } from '@/lib/religioes/des-tages';
import { loeseHadithe, loeseVerse, type AufgeloesterHadith, type AufgeloesterVers } from './religioese-verweise';

export type DesTages = { vers: AufgeloesterVers | null; hadith: AufgeloesterHadith | null };

/**
 * Vers und Hadith des Tages (AUFTRAG 3.10, Kür K-A) für ein Datum (Europe/Berlin): Auswahl nach Datum aus den Listen
 * `des-tages` der Verwaltung „Koran & Hadith“. Nur Verweise auf importierte Texte; Übersetzungen nur freigegeben.
 * Leere Liste oder unbekannter Verweis → null (die Startseite zeigt dann nichts). Gecacht je Datum (Tags `quran`,
 * `hadith`). Beispielmodus ohne Datenbank: nichts.
 */
export async function ladeDesTages(datum: string): Promise<DesTages> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.quran, TAG.hadith);
  if (!datenbankVerfuegbar()) return { vers: null, hadith: null };
  const v = schema.quranVersAuswahl;
  const h = schema.hadithAuswahl;
  const [verse, hadithe] = await Promise.all([
    db.select({ sure: v.sure, vers: v.vers }).from(v).where(eq(v.liste, DES_TAGES)).orderBy(asc(v.reihenfolge), asc(v.sure), asc(v.vers)),
    db
      .select({ nummer: h.nummer })
      .from(h)
      .where(and(eq(h.liste, DES_TAGES), eq(h.sammlungId, BUKHARI)))
      .orderBy(asc(h.reihenfolge), asc(h.nummer)),
  ]);
  const vers = eintragDesTages(verse, datum);
  const hadith = eintragDesTages(hadithe, datum);
  const [versKarte, hadithKarte] = await Promise.all([
    loeseVerse(vers ? [{ sure: vers.sure, von: vers.vers, bis: vers.vers }] : []),
    loeseHadithe(hadith ? [hadith.nummer] : []),
  ]);
  return {
    vers: vers ? (versKarte.get(`${vers.sure}:${vers.vers}-${vers.vers}`) ?? null) : null,
    hadith: hadith ? (hadithKarte.get(hadith.nummer) ?? null) : null,
  };
}
