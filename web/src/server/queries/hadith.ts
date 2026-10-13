import 'server-only';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { BUKHARI } from '@/lib/hadith/anzeige';

/**
 * Hadith (AUFTRAG 3.3, ADR 0025, ADR 0030): Sahih al-Bukhari arabisch aus dem Import (`pnpm inhalte:import`).
 * Übersetzungen verlassen die Datenbank nur mit Freigabe „geprueft“; Entwürfe erreichen nie eine öffentliche Seite.
 * Ob die Gesamtsammlung öffentlich ist, entscheidet der Aufrufer über den Schalter `hadith_gesamt` (MN-06).
 * Gecacht mit Tag `hadith`; nach einem Import oder einer Freigabe den Tag erneuern.
 */
export type HadithSammlung = { id: string; name: Mehrsprachig; quelle: string; url: string; version: string };
export type HadithBuchKurz = { nr: number; titelEn: string; anzahl: number };
export type HadithUebersetzung = { sprache: string; text: string; uebersetzer: string; quelle: string; freigabe: 'geprueft' };
export type HadithEintrag = {
  nummer: string;
  buchNr: number;
  imBuchNr: number | null;
  textAr: string;
  bewertung: string | null;
  bewertetVon: string | null;
  uebersetzungen: HadithUebersetzung[];
};
export type HadithUebersicht = {
  sammlung: HadithSammlung | null;
  buecher: HadithBuchKurz[];
  gesamt: number;
  /** Geprüfte Übersetzungen je Sprache (de/tr/en). */
  geprueft: Record<'de' | 'tr' | 'en', number>;
  auswahlAnzahl: number;
};
export type HadithBuch = {
  sammlung: HadithSammlung;
  buch: HadithBuchKurz;
  hadithe: HadithEintrag[];
  vorher: HadithBuchKurz | null;
  naechstes: HadithBuchKurz | null;
};

/** Liste der kuratierten Auswahl (hadith_auswahl.liste). */
export const AUSWAHL = 'auswahl';

async function sammlung(): Promise<HadithSammlung | null> {
  const [s] = await db
    .select({
      id: schema.hadithSammlung.id,
      name: schema.hadithSammlung.name,
      quelle: schema.hadithSammlung.quelle,
      url: schema.hadithSammlung.url,
      version: schema.hadithSammlung.version,
    })
    .from(schema.hadithSammlung)
    .where(eq(schema.hadithSammlung.id, BUKHARI))
    .limit(1);
  return s ?? null;
}

async function buecher(): Promise<HadithBuchKurz[]> {
  const zeilen = await db
    .select({ nr: schema.hadithBuch.nr, titel: schema.hadithBuch.titel, anzahl: count(schema.hadith.nummer) })
    .from(schema.hadithBuch)
    .leftJoin(
      schema.hadith,
      and(eq(schema.hadith.sammlungId, schema.hadithBuch.sammlungId), eq(schema.hadith.buchNr, schema.hadithBuch.nr)),
    )
    .where(eq(schema.hadithBuch.sammlungId, BUKHARI))
    .groupBy(schema.hadithBuch.nr, schema.hadithBuch.titel)
    .orderBy(asc(schema.hadithBuch.nr));
  return zeilen.map((z) => ({ nr: z.nr, titelEn: z.titel?.en ?? '', anzahl: Number(z.anzahl) }));
}

/** Nur geprüfte Übersetzungen zu den genannten Nummern, nach Nummer gruppiert. */
async function uebersetzungen(nummern: string[]): Promise<Map<string, HadithUebersetzung[]>> {
  const karte = new Map<string, HadithUebersetzung[]>();
  if (!nummern.length) return karte;
  const zeilen = await db
    .select({
      nummer: schema.hadithUebersetzung.nummer,
      sprache: schema.hadithUebersetzung.sprache,
      text: schema.hadithUebersetzung.text,
      uebersetzer: schema.hadithUebersetzung.uebersetzer,
      quelle: schema.hadithUebersetzung.quelle,
    })
    .from(schema.hadithUebersetzung)
    .where(
      and(
        eq(schema.hadithUebersetzung.sammlungId, BUKHARI),
        eq(schema.hadithUebersetzung.freigabe, 'geprueft'),
        inArray(schema.hadithUebersetzung.nummer, nummern),
      ),
    );
  for (const z of zeilen) {
    const liste = karte.get(z.nummer) ?? [];
    liste.push({ sprache: z.sprache, text: z.text, uebersetzer: z.uebersetzer, quelle: z.quelle, freigabe: 'geprueft' });
    karte.set(z.nummer, liste);
  }
  return karte;
}

const EINTRAG = {
  nummer: schema.hadith.nummer,
  buchNr: schema.hadith.buchNr,
  imBuchNr: schema.hadith.imBuchNr,
  textAr: schema.hadith.textAr,
  bewertung: schema.hadith.bewertung,
  bewertetVon: schema.hadith.bewertetVon,
};

/** Übersicht für /hadith und /hadith/bukhari: Sammlung, Bücher mit Anzahl, Stand der Übersetzungen, Größe der Auswahl. */
export async function ladeHadithUebersicht(): Promise<HadithUebersicht> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.hadith);
  const s = await sammlung();
  const leer = { de: 0, tr: 0, en: 0 };
  if (!s) return { sammlung: null, buecher: [], gesamt: 0, geprueft: leer, auswahlAnzahl: 0 };
  const [liste, stand, [auswahl]] = await Promise.all([
    buecher(),
    db
      .select({ sprache: schema.hadithUebersetzung.sprache, anzahl: count() })
      .from(schema.hadithUebersetzung)
      .where(and(eq(schema.hadithUebersetzung.sammlungId, BUKHARI), eq(schema.hadithUebersetzung.freigabe, 'geprueft')))
      .groupBy(schema.hadithUebersetzung.sprache),
    db
      .select({ anzahl: count() })
      .from(schema.hadithAuswahl)
      .where(and(eq(schema.hadithAuswahl.liste, AUSWAHL), eq(schema.hadithAuswahl.sammlungId, BUKHARI))),
  ]);
  const geprueft = { ...leer };
  for (const z of stand) if (z.sprache === 'de' || z.sprache === 'tr' || z.sprache === 'en') geprueft[z.sprache] = Number(z.anzahl);
  return {
    sammlung: s,
    buecher: liste,
    gesamt: liste.reduce((summe, b) => summe + b.anzahl, 0),
    geprueft,
    auswahlAnzahl: Number(auswahl?.anzahl ?? 0),
  };
}

/** Ein Buch mit allen Hadithen in der Reihenfolge der Quelle; null ohne Import oder bei unbekannter Nummer. */
export async function ladeHadithBuch(nr: number): Promise<HadithBuch | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.hadith);
  if (!Number.isInteger(nr) || nr < 1) return null;
  const s = await sammlung();
  if (!s) return null;
  const liste = await buecher();
  const index = liste.findIndex((b) => b.nr === nr);
  if (index < 0) return null;
  const zeilen = await db
    .select(EINTRAG)
    .from(schema.hadith)
    .where(and(eq(schema.hadith.sammlungId, BUKHARI), eq(schema.hadith.buchNr, nr)))
    .orderBy(asc(schema.hadith.sortierung));
  const ue = await uebersetzungen(zeilen.map((z) => z.nummer));
  return {
    sammlung: s,
    buch: liste[index],
    hadithe: zeilen.map((z) => ({ ...z, uebersetzungen: ue.get(z.nummer) ?? [] })),
    vorher: liste[index - 1] ?? null,
    naechstes: liste[index + 1] ?? null,
  };
}

/** Kuratierte Auswahl in fester Reihenfolge (nur Verweise auf importierte Hadithe). */
export async function ladeHadithAuswahl(liste: string = AUSWAHL): Promise<{ sammlung: HadithSammlung | null; hadithe: HadithEintrag[] }> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.hadith);
  const s = await sammlung();
  if (!s) return { sammlung: null, hadithe: [] };
  const zeilen = await db
    .select(EINTRAG)
    .from(schema.hadithAuswahl)
    .innerJoin(
      schema.hadith,
      and(eq(schema.hadith.sammlungId, schema.hadithAuswahl.sammlungId), eq(schema.hadith.nummer, schema.hadithAuswahl.nummer)),
    )
    .where(and(eq(schema.hadithAuswahl.liste, liste), eq(schema.hadithAuswahl.sammlungId, BUKHARI)))
    .orderBy(asc(schema.hadithAuswahl.reihenfolge), asc(schema.hadith.sortierung));
  const ue = await uebersetzungen(zeilen.map((z) => z.nummer));
  return { sammlung: s, hadithe: zeilen.map((z) => ({ ...z, uebersetzungen: ue.get(z.nummer) ?? [] })) };
}

/** Nummern aller Bücher für `generateStaticParams` (leer ohne Import). */
export async function ladeHadithBuchNummern(): Promise<number[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.hadith);
  const zeilen = await db
    .select({ nr: schema.hadithBuch.nr })
    .from(schema.hadithBuch)
    .where(eq(schema.hadithBuch.sammlungId, BUKHARI))
    .orderBy(asc(schema.hadithBuch.nr));
  return zeilen.map((z) => z.nr);
}
