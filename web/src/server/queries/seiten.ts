import 'server-only';
import { and, eq, gt, inArray, isNull, lte, min, or } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import type { Locale } from '@/i18n/routing';
import { TAG } from '@/lib/cache/tags';
import { seitenAdressen, type SeitenSlugs } from '@/lib/cms/slugs';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { ladeBilder, medienUrl, type BildKarte } from '@/lib/medien/bild';
import { gueltigeBloecke, medienIdsAus, type Block } from '@/lib/validierung/bloecke';

/**
 * Freie Seiten öffentlich (ADR 0032, MUSTER 2): gecacht mit `TAG.seiten` (+ `TAG.seite(id)`, `TAG.medien`).
 * Sichtbar ist eine Seite, wenn sie veröffentlicht ist, nicht im Papierkorb liegt und ihr Zeitpunkt „veröffentlichen am“
 * erreicht ist. Den Zeitplan löst die Cache-Lebensdauer: Steht eine geplante Seite bevor, verfällt der Eintrag
 * spätestens zu ihrem Zeitpunkt (mindestens 60 s, höchstens 1 h) – ohne Uhrzeit im Render.
 */
const s = schema.seite;

/** Datei eines Download-Bausteins (PDF aus der Mediathek). */
export type DateiDaten = { id: string; url: string; dateiname: string | null; groesse: number; typ: string };
export type DateiKarte = Record<string, DateiDaten>;

export type SeiteOeffentlich = {
  id: string;
  slugs: SeitenSlugs;
  titel: Mehrsprachig;
  beschreibung: Mehrsprachig | null;
  bloecke: Block[];
  organisation: 'at' | 'kt' | 'gt' | 'kgt' | null;
  istBeispiel: boolean;
  aktualisiertAm: string;
  bilder: BildKarte;
  dateien: DateiKarte;
};

function sichtbar(jetzt: Date) {
  return and(eq(s.status, 'veroeffentlicht'), isNull(s.imPapierkorbSeit), or(isNull(s.veroeffentlichenAm), lte(s.veroeffentlichenAm, jetzt)));
}

/**
 * Cache-Lebensdauer nach dem Zeitplan: die nächste geplante Veröffentlichung begrenzt `revalidate`. `stale` 60 s und
 * `expire` 1 Tag halten die Vorgaben von `ensureStatic` ein (stale ≥ 30 s, expire ≥ 5 min).
 */
export async function zeitplanLebensdauer(jetzt: Date): Promise<void> {
  const [naechste] = await db
    .select({ am: min(s.veroeffentlichenAm) })
    .from(s)
    .where(and(eq(s.status, 'veroeffentlicht'), isNull(s.imPapierkorbSeit), gt(s.veroeffentlichenAm, jetzt)));
  if (!naechste?.am) {
    cacheLife('hours');
    return;
  }
  const sekunden = Math.min(3600, Math.max(60, Math.ceil((naechste.am.getTime() - jetzt.getTime()) / 1000)));
  cacheLife({ stale: 60, revalidate: sekunden, expire: 86_400 });
}

/** Dateien (Download) nach Medien-ID; nur vorhandene Medien außerhalb des Papierkorbs, keine Bilder. */
export async function ladeDateien(ids: readonly string[]): Promise<DateiKarte> {
  if (!ids.length) return {};
  const m = schema.medium;
  const zeilen = await db
    .select({ id: m.id, schluessel: m.schluessel, dateiname: m.dateiname, groesse: m.groesse, typ: m.typ })
    .from(m)
    .where(and(inArray(m.id, [...ids]), isNull(m.imPapierkorbSeit)));
  const karte: DateiKarte = {};
  for (const z of zeilen)
    if (!z.typ.startsWith('image/'))
      karte[z.id] = { id: z.id, url: medienUrl(z.schluessel), dateiname: z.dateiname, groesse: z.groesse, typ: z.typ };
  return karte;
}

/** Datensatz → öffentliche Daten mit Bildern und Dateien der Bausteine (auch für die Vorschau der Verwaltung). */
export async function seiteMitMedien(z: typeof s.$inferSelect): Promise<SeiteOeffentlich> {
  const bloecke = gueltigeBloecke(z.bloecke);
  const ids = medienIdsAus(bloecke);
  const [bilder, dateien] = await Promise.all([ladeBilder(ids.bilder), ladeDateien(ids.dateien)]);
  return {
    id: z.id,
    slugs: { de: z.slugDe, tr: z.slugTr, en: z.slugEn },
    titel: z.titel,
    beschreibung: z.beschreibung,
    bloecke,
    organisation: z.organisation,
    istBeispiel: z.istBeispiel,
    aktualisiertAm: z.aktualisiertAm.toISOString(),
    bilder,
    dateien,
  };
}

export type SeitenTreffer = { art: 'seite'; seite: SeiteOeffentlich } | { art: 'umleitung'; nach: string } | null;

/**
 * Freie Seite zu einem Pfadteil in einer Sprache. Reihenfolge: eigener Slug der Sprache; sonst der deutsche Slug einer
 * Seite ohne eigenen Slug dieser Sprache (Rückfall). Hat die Seite für diese Sprache einen anderen Slug, kommt eine
 * Umleitung dorthin (Sprachwechsel über die Adresse).
 */
export async function ladeSeite(sprache: Locale, slug: string): Promise<SeitenTreffer> {
  'use cache: remote';
  cacheTag(TAG.seiten, TAG.medien);
  const jetzt = new Date();
  await zeitplanLebensdauer(jetzt);
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const bedingung =
    sprache === 'de' ? eq(s.slugDe, slug) : or(eq(sprache === 'tr' ? s.slugTr : s.slugEn, slug), eq(s.slugDe, slug));
  const zeilen = await db.select().from(s).where(and(sichtbar(jetzt), bedingung)).limit(5);
  const eigen = sprache === 'de' ? undefined : zeilen.find((z) => (sprache === 'tr' ? z.slugTr : z.slugEn) === slug);
  const z = eigen ?? zeilen.find((x) => x.slugDe === slug);
  if (!z) return null;
  cacheTag(TAG.seite(z.id));
  const slugs = { de: z.slugDe, tr: z.slugTr, en: z.slugEn };
  const ziel = seitenAdressen(slugs)[sprache];
  if (ziel !== (sprache === 'de' ? `/${slug}` : `/${sprache}/${slug}`)) return { art: 'umleitung', nach: ziel };
  return { art: 'seite', seite: await seiteMitMedien(z) };
}

/** Slugs aller sichtbaren Seiten in einer Sprache (generateStaticParams; dieselbe Auswahl wie `ladeSeite`). */
export async function ladeSeitenSlugs(sprache: Locale): Promise<string[]> {
  'use cache: remote';
  cacheTag(TAG.seiten);
  const jetzt = new Date();
  await zeitplanLebensdauer(jetzt);
  const zeilen = await db.select({ de: s.slugDe, tr: s.slugTr, en: s.slugEn }).from(s).where(sichtbar(jetzt));
  return [...new Set(zeilen.map((z) => (sprache === 'de' ? z.de : (z[sprache] ?? z.de))))];
}

/** Öffentliche Adressen aller sichtbaren Seiten nach ID (Menüs, Knöpfe im Baustein „Aufruf“). */
export async function ladeSeitenAdressen(): Promise<Record<string, Record<Locale, string>>> {
  'use cache: remote';
  cacheTag(TAG.seiten);
  const jetzt = new Date();
  await zeitplanLebensdauer(jetzt);
  const zeilen = await db.select({ id: s.id, de: s.slugDe, tr: s.slugTr, en: s.slugEn }).from(s).where(sichtbar(jetzt));
  return Object.fromEntries(zeilen.map((z) => [z.id, seitenAdressen({ de: z.de, tr: z.tr, en: z.en })]));
}

/** Weiterleitung für einen öffentlichen Pfad (mit Sprachpräfix wie im Browser), sonst null. */
export async function ladeWeiterleitung(pfad: string): Promise<{ nach: string; code: number } | null> {
  'use cache: remote';
  cacheLife('days');
  cacheTag(TAG.weiterleitungen);
  if (pfad.length > 300) return null;
  const w = schema.weiterleitung;
  const [z] = await db.select({ nach: w.nach, code: w.code }).from(w).where(eq(w.von, pfad)).limit(1);
  return z ?? null;
}
