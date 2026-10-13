import 'server-only';
import { and, asc, between, desc, eq, isNotNull } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/**
 * Daten der religiösen Verweis-Bausteine (ADR 0030, ADR 0032). Arabischer Text nur aus der importierten Quelle,
 * Übersetzungen nur, wenn freigegeben: Koran aus einer aktiven und freigegebenen Ausgabe (`quran_ausgabe`), Hadith aus
 * `hadith_uebersetzung` mit Status „geprueft“. Der Hadith-Text selbst erscheint erst, wenn die Sammlung freigegeben ist
 * oder der Hadith in einer kuratierten Auswahl steht (MN-06). Nichts davon wird hier erzeugt oder umformuliert.
 */
export type VersUebersetzung = { verse: { nr: number; text: string }[]; titel: string; uebersetzer: string };
export type VersDaten = {
  sure: number;
  nameUmschrift: string | null;
  name: { de?: string; tr?: string; en?: string } | null;
  verse: { nr: number; textAr: string }[];
  uebersetzungen: Partial<Record<'de' | 'tr' | 'en', VersUebersetzung>>;
};

export async function ladeVerse(sure: number, von: number, bis: number): Promise<VersDaten | null> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.quran);
  if (![sure, von, bis].every(Number.isInteger) || sure < 1 || sure > 114 || von < 1 || bis < von || bis - von > 20) return null;
  const [kopf] = await db
    .select({ nr: schema.quranSure.nr, nameUmschrift: schema.quranSure.nameUmschrift, name: schema.quranSure.name })
    .from(schema.quranSure)
    .where(eq(schema.quranSure.nr, sure))
    .limit(1);
  if (!kopf) return null;
  const verse = await db
    .select({ nr: schema.quranVers.vers, textAr: schema.quranVers.textAr })
    .from(schema.quranVers)
    .where(and(eq(schema.quranVers.sure, sure), between(schema.quranVers.vers, von, bis)))
    .orderBy(asc(schema.quranVers.vers));
  if (!verse.length) return null;
  const a = schema.quranAusgabe;
  const ausgaben = await db
    .select({ id: a.id, sprache: a.sprache, titel: a.titel, uebersetzer: a.uebersetzer })
    .from(a)
    .where(and(eq(a.aktiv, true), isNotNull(a.freigegebenAm)))
    .orderBy(desc(a.standard), asc(a.id));
  const uebersetzungen: VersDaten['uebersetzungen'] = {};
  for (const sprache of ['de', 'tr', 'en'] as const) {
    const ausgabe = ausgaben.find((x) => x.sprache === sprache);
    if (!ausgabe) continue;
    const u = schema.quranUebersetzung;
    const texte = await db
      .select({ nr: u.vers, text: u.text })
      .from(u)
      .where(and(eq(u.ausgabeId, ausgabe.id), eq(u.sure, sure), between(u.vers, von, bis)))
      .orderBy(asc(u.vers));
    if (texte.length) uebersetzungen[sprache] = { verse: texte, titel: ausgabe.titel, uebersetzer: ausgabe.uebersetzer };
  }
  return { sure, nameUmschrift: kopf.nameUmschrift, name: kopf.name, verse, uebersetzungen };
}

export type HadithDaten = {
  sammlung: string;
  sammlungName: Mehrsprachig;
  nummer: string;
  buchNr: number;
  /** Arabischer Text – nur bei freigegebener Sammlung oder kuratierter Auswahl, sonst null. */
  textAr: string | null;
  uebersetzungen: Partial<Record<'de' | 'tr' | 'en', { text: string; uebersetzer: string }>>;
};

export async function ladeHadith(sammlung: string, nummer: string): Promise<HadithDaten | null> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.hadith);
  if (!/^[a-z]{2,20}$/.test(sammlung) || !/^\d{1,5}(\.\d{1,2})?$/.test(nummer)) return null;
  const [s] = await db
    .select({ id: schema.hadithSammlung.id, name: schema.hadithSammlung.name, freigegeben: schema.hadithSammlung.freigegeben })
    .from(schema.hadithSammlung)
    .where(eq(schema.hadithSammlung.id, sammlung))
    .limit(1);
  if (!s) return null;
  const h = schema.hadith;
  const [z] = await db
    .select({ nummer: h.nummer, buchNr: h.buchNr, textAr: h.textAr })
    .from(h)
    .where(and(eq(h.sammlungId, sammlung), eq(h.nummer, nummer)))
    .limit(1);
  if (!z) return null;
  const [inAuswahl] = await db
    .select({ liste: schema.hadithAuswahl.liste })
    .from(schema.hadithAuswahl)
    .where(and(eq(schema.hadithAuswahl.sammlungId, sammlung), eq(schema.hadithAuswahl.nummer, nummer)))
    .limit(1);
  const u = schema.hadithUebersetzung;
  const texte = await db
    .select({ sprache: u.sprache, text: u.text, uebersetzer: u.uebersetzer })
    .from(u)
    .where(and(eq(u.sammlungId, sammlung), eq(u.nummer, nummer), eq(u.freigabe, 'geprueft')));
  const uebersetzungen: HadithDaten['uebersetzungen'] = {};
  for (const t of texte)
    if (t.sprache === 'de' || t.sprache === 'tr' || t.sprache === 'en') uebersetzungen[t.sprache] = { text: t.text, uebersetzer: t.uebersetzer };
  return {
    sammlung,
    sammlungName: s.name,
    nummer: z.nummer,
    buchNr: z.buchNr,
    textAr: s.freigegeben || inAuswahl ? z.textAr : null,
    uebersetzungen,
  };
}
