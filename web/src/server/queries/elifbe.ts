import 'server-only';
import { and, asc, eq, isNull, like, or, sql } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { hex } from '@/lib/elifbe/alphabet';
import { medienUrl } from '@/lib/medien/bild';

/**
 * Elifbe (ADR 0030): Beispielwörter sind nur Verweise auf Stellen im Koran (`quran_wort`) – Text, Sure, Vers und
 * Position kommen aus der Datenbank, nie aus getipptem Text; Bedeutungen gibt es hier nicht. Lektionstexte und Audio
 * erscheinen erst nach Freigabe bzw. mit Vereinbarung. Gecacht mit `TAG.elifbe` (und `TAG.quran` für die Wörter).
 */
export type Beispielwort = { sure: number; vers: number; pos: number; textAr: string };

/**
 * Anfangszeichen, die als „beginnt mit dem Buchstaben“ zählen: Elif auch als Wasla-Elif; die Hamza auf ihrem
 * Träger Elif (oben/unten), weil sie am Wortanfang so geschrieben wird. Sonst nur der Buchstabe selbst.
 */
const ANFANG: Partial<Record<number, readonly number[]>> = {
  0x0627: [0x0627, 0x0671],
  0x0621: [0x0621, 0x0623, 0x0625],
};

/**
 * Beispielwörter zu einem Buchstaben: zuerst die von der Lehrkraft gewählten (`elifbe_beispielwort`), sonst die ersten
 * Wörter, die mit dem Buchstaben beginnen – Cüz 30 zuerst, dann der übrige Koran in Reihenfolge, je Wortform einmal.
 */
export async function ladeBeispielwoerter(codepunkt: number, anzahl = 3): Promise<Beispielwort[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.elifbe, TAG.quran);
  const w = schema.quranWort;
  const gewaehlt = await db
    .select({ sure: w.sure, vers: w.vers, pos: w.pos, textAr: w.textAr })
    .from(schema.elifbeBeispielwort)
    .innerJoin(
      w,
      and(eq(w.sure, schema.elifbeBeispielwort.sure), eq(w.vers, schema.elifbeBeispielwort.vers), eq(w.pos, schema.elifbeBeispielwort.pos)),
    )
    .where(eq(schema.elifbeBeispielwort.buchstabe, hex(codepunkt)))
    .orderBy(asc(w.sure), asc(w.vers), asc(w.pos))
    .limit(anzahl);
  if (gewaehlt.length) return gewaehlt;

  // Anfang von Cüz 30 aus den Tanzil-Einteilungen (ohne Import: kein Vorrang)
  const [cuz30] = await db
    .select({ sure: schema.quranEinteilung.sure, vers: schema.quranEinteilung.vers })
    .from(schema.quranEinteilung)
    .where(and(eq(schema.quranEinteilung.art, 'cuz'), eq(schema.quranEinteilung.nr, 30)))
    .limit(1);
  const imCuz30 = cuz30
    ? sql`case when ${w.sure} > ${cuz30.sure} or (${w.sure} = ${cuz30.sure} and ${w.vers} >= ${cuz30.vers}) then 0 else 1 end`
    : sql`0`;
  const muster = (ANFANG[codepunkt] ?? [codepunkt]).map((c) => like(w.textAr, `${String.fromCodePoint(c)}%`));
  const zeilen = await db
    .select({ sure: w.sure, vers: w.vers, pos: w.pos, textAr: w.textAr, formId: w.formId })
    .from(w)
    .where(or(...muster))
    .orderBy(imCuz30, asc(w.sure), asc(w.vers), asc(w.pos))
    .limit(anzahl * 12);
  const formen = new Set<number>();
  const aus: Beispielwort[] = [];
  for (const z of zeilen) {
    if (formen.has(z.formId)) continue;
    formen.add(z.formId);
    aus.push({ sure: z.sure, vers: z.vers, pos: z.pos, textAr: z.textAr });
    if (aus.length >= anzahl) break;
  }
  return aus;
}

export type ElifbeAudio = { url: string; sprecher: string };

/** Aussprache-Aufnahmen der Hoca (`buchstabe:0628`, `silbe:0628-064E`); leer, solange keine vorliegen. */
export async function ladeElifbeAudio(): Promise<Record<string, ElifbeAudio>> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.elifbe, TAG.medien);
  const zeilen = await db
    .select({ schluessel: schema.elifbeAudio.schluessel, sprecher: schema.elifbeAudio.sprecher, medium: schema.medium.schluessel })
    .from(schema.elifbeAudio)
    .innerJoin(schema.medium, eq(schema.medium.id, schema.elifbeAudio.mediumId))
    .where(isNull(schema.medium.imPapierkorbSeit));
  return Object.fromEntries(zeilen.map((z) => [z.schluessel, { url: medienUrl(z.medium), sprecher: z.sprecher }]));
}

export type Lektionstext = { titel: Mehrsprachig; ziel: Mehrsprachig | null; inhalt: MehrsprachigRich | null };

/** Freigegebene Lektionstexte je Nummer (religiöse Freigabe Pflicht, ADR 0030). */
export async function ladeLektionstexte(): Promise<Record<number, Lektionstext>> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.elifbe);
  const zeilen = await db
    .select({
      nr: schema.elifbeLektion.nr,
      titel: schema.elifbeLektion.titel,
      ziel: schema.elifbeLektion.ziel,
      inhalt: schema.elifbeLektion.inhalt,
    })
    .from(schema.elifbeLektion)
    .where(eq(schema.elifbeLektion.freigabe, 'geprueft'))
    .orderBy(asc(schema.elifbeLektion.nr));
  return Object.fromEntries(zeilen.map((z) => [z.nr, { titel: z.titel, ziel: z.ziel ?? null, inhalt: z.inhalt ?? null }]));
}
