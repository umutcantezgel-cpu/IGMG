import 'server-only';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { DES_TAGES, eintragDesTages } from '@/lib/religioes/des-tages';

/**
 * Verwaltung „Koran & Hadith“ › Des Tages (Kür K-A): Liste „Vers des Tages“ mit Surennamen und Versanfang (aus dem
 * Import), Größe der Liste „Hadith des Tages“ und die heutige Auswahl. Ungecacht; Aufrufer prüfen das Recht.
 */
export type TagesVers = { sure: number; vers: number; sureName: string; anfangAr: string };

export async function ladeTagesVerse(): Promise<TagesVers[]> {
  const a = schema.quranVersAuswahl;
  const zeilen = await db
    .select({ sure: a.sure, vers: a.vers })
    .from(a)
    .where(eq(a.liste, DES_TAGES))
    .orderBy(asc(a.reihenfolge), asc(a.sure), asc(a.vers));
  if (!zeilen.length) return [];
  const suren = [...new Set(zeilen.map((z) => z.sure))];
  const [namen, verse] = await Promise.all([
    db
      .select({ nr: schema.quranSure.nr, umschrift: schema.quranSure.nameUmschrift, nameAr: schema.quranSure.nameAr })
      .from(schema.quranSure)
      .where(inArray(schema.quranSure.nr, suren)),
    db
      .select({ sure: schema.quranVers.sure, vers: schema.quranVers.vers, textAr: schema.quranVers.textAr })
      .from(schema.quranVers)
      .where(inArray(schema.quranVers.sure, suren)),
  ]);
  return zeilen.map((z) => {
    const n = namen.find((x) => x.nr === z.sure);
    const text = verse.find((v) => v.sure === z.sure && v.vers === z.vers)?.textAr ?? '';
    const woerter = text.split(' ');
    return {
      ...z,
      sureName: n?.umschrift || n?.nameAr || String(z.sure),
      anfangAr: woerter.length > 8 ? `${woerter.slice(0, 8).join(' ')} …` : text,
    };
  });
}

/** Einträge der Liste „Hadith des Tages“ (Nummern in der gepflegten Reihenfolge). */
export async function ladeTagesHadithe(): Promise<string[]> {
  const h = schema.hadithAuswahl;
  const zeilen = await db
    .select({ nummer: h.nummer })
    .from(h)
    .where(and(eq(h.liste, DES_TAGES), eq(h.sammlungId, BUKHARI)))
    .orderBy(asc(h.reihenfolge), asc(h.nummer));
  return zeilen.map((z) => z.nummer);
}

/** Heutige Auswahl (für die Verwaltung): Stelle bzw. Nummer. */
export function heutigeAuswahl(verse: readonly TagesVers[], hadithe: readonly string[], datum: string) {
  return { vers: eintragDesTages(verse, datum), hadith: eintragDesTages(hadithe, datum) };
}

/** Freigabe-Verlauf der Liste „Vers des Tages“ (neueste zuerst), mit Namen der handelnden Personen. */
export async function ladeTagesVerlauf(
  grenze = 8,
): Promise<{ status: 'entwurf' | 'zur_pruefung' | 'geprueft'; am: Date; von: string | null; kommentar: string | null }[]> {
  const f = schema.freigabe;
  const zeilen = await db
    .select({ status: f.status, am: f.am, von: schema.user.name, kommentar: f.kommentar })
    .from(f)
    .leftJoin(schema.user, eq(schema.user.id, f.von))
    .where(and(eq(f.inhaltTyp, 'quran_vers_auswahl'), eq(f.inhaltId, DES_TAGES)))
    .orderBy(desc(f.am), desc(f.id))
    .limit(grenze);
  return zeilen;
}
