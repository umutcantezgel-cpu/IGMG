import 'server-only';
import { and, asc, count, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { VersTripel } from '@/lib/audio/werkstatt';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/**
 * Verwaltung › Rezitationen (O-Q02, H-Q05, ADR 0029): Liste mit Vollständigkeit, Suren-Raster und die Daten der
 * Werkstatt je Sure. Ohne Cache (dynamische Verwaltungsseiten); Aufrufer prüfen vorher `rezitation.bearbeiten`.
 * Arabischer Text nur aus `quran_wort` (ADR 0030).
 */
export type RezitationArt = (typeof schema.rezitationArtEnum.enumValues)[number];

/** Stand einer Sure: leer → Audio → Verszeiten vollständig → alle Wortzeiten geprüft. */
export type SurenStufe = 'leer' | 'audio' | 'verse' | 'fertig';
export type SurenStand = {
  nr: number;
  umschrift: string;
  verseAnzahl: number;
  audio: 'keine' | 'sure' | 'vers';
  /** Verse mit Zeitfenster (Verszeit oder eigene Datei) */
  verse: number;
  woerter: number;
  /** Wortzeiten gesamt und davon geprüft */
  wortzeiten: number;
  geprueft: number;
  stufe: SurenStufe;
};

export type RezitationKopf = {
  id: string;
  name: Mehrsprachig;
  rezitator: string;
  art: RezitationArt;
  lizenz: string;
  aktiv: boolean;
  standard: boolean;
  erstelltAm: Date;
  vereinbarung: { id: string; dateiname: string | null; schluessel: string; imPapierkorb: boolean } | null;
};

export type RezitationZeile = RezitationKopf & { mitAudio: number; mitVerszeiten: number; mitWortzeiten: number };

const r = schema.quranRezitation;

async function ladeKoepfe(id?: string): Promise<RezitationKopf[]> {
  const zeilen = await db
    .select({
      id: r.id,
      name: r.name,
      rezitator: r.rezitator,
      art: r.art,
      lizenz: r.lizenz,
      aktiv: r.aktiv,
      standard: r.standard,
      erstelltAm: r.erstelltAm,
      mediumId: schema.medium.id,
      dateiname: schema.medium.dateiname,
      schluessel: schema.medium.schluessel,
      papierkorb: schema.medium.imPapierkorbSeit,
    })
    .from(r)
    .leftJoin(schema.medium, eq(schema.medium.id, r.vereinbarungMediumId))
    .where(id ? eq(r.id, id) : undefined)
    .orderBy(desc(r.standard), desc(r.aktiv), asc(r.id));
  return zeilen.map(({ mediumId, dateiname, schluessel, papierkorb, ...z }) => ({
    ...z,
    vereinbarung: mediumId && schluessel ? { id: mediumId, dateiname, schluessel, imPapierkorb: papierkorb !== null } : null,
  }));
}

/** Wörter je Sure (für „alle Wortzeiten geprüft“). */
async function woerterJeSure(): Promise<Map<number, number>> {
  const zeilen = await db.select({ sure: schema.quranWort.sure, n: count() }).from(schema.quranWort).groupBy(schema.quranWort.sure);
  return new Map(zeilen.map((z) => [z.sure, z.n]));
}

/** Stand aller 114 Suren je Rezitation. */
async function surenStand(ids: string[]): Promise<Map<string, SurenStand[]>> {
  if (!ids.length) return new Map();
  const a = schema.quranAudio;
  const v = schema.quranVerszeit;
  const w = schema.quranWortzeit;
  const [suren, woerter, audio, verszeiten, wortzeiten] = await Promise.all([
    db
      .select({
        nr: schema.quranSure.nr,
        umschrift: sql<string>`coalesce(${schema.quranSure.nameUmschrift}, '')`,
        verse: schema.quranSure.verseAnzahl,
      })
      .from(schema.quranSure)
      .orderBy(asc(schema.quranSure.nr)),
    woerterJeSure(),
    db.select({ id: a.rezitationId, sure: a.sure, vers: a.vers }).from(a).where(inArray(a.rezitationId, ids)),
    db.select({ id: v.rezitationId, sure: v.sure, vers: v.vers }).from(v).where(inArray(v.rezitationId, ids)),
    db
      .select({
        id: w.rezitationId,
        sure: w.sure,
        n: count(),
        geprueft: sql<number>`count(*) filter (where ${w.geprueft})`.mapWith(Number),
      })
      .from(w)
      .where(inArray(w.rezitationId, ids))
      .groupBy(w.rezitationId, w.sure),
  ]);
  const schluessel = (id: string, sure: number) => `${id}:${sure}`;
  const modus = new Map<string, 'sure' | 'vers'>();
  const zeitVerse = new Map<string, Set<number>>();
  const merke = (k: string, vers: number) => {
    const s = zeitVerse.get(k) ?? new Set<number>();
    s.add(vers);
    zeitVerse.set(k, s);
  };
  for (const z of audio) {
    const k = schluessel(z.id, z.sure);
    modus.set(k, z.vers === 0 ? 'sure' : 'vers');
    if (z.vers > 0) merke(k, z.vers);
  }
  for (const z of verszeiten) merke(schluessel(z.id, z.sure), z.vers);
  const wz = new Map(wortzeiten.map((z) => [schluessel(z.id, z.sure), z]));
  return new Map(
    ids.map((id) => [
      id,
      suren.map((s): SurenStand => {
        const k = schluessel(id, s.nr);
        const audioArt = modus.get(k) ?? 'keine';
        const verse = zeitVerse.get(k)?.size ?? 0;
        const anzahlWoerter = woerter.get(s.nr) ?? 0;
        const zeiten = wz.get(k);
        const geprueft = zeiten?.geprueft ?? 0;
        const stufe: SurenStufe =
          audioArt === 'keine' ? 'leer' : verse < s.verse ? 'audio' : anzahlWoerter > 0 && geprueft >= anzahlWoerter ? 'fertig' : 'verse';
        return {
          nr: s.nr,
          umschrift: s.umschrift,
          verseAnzahl: s.verse,
          audio: audioArt,
          verse,
          woerter: anzahlWoerter,
          wortzeiten: zeiten?.n ?? 0,
          geprueft,
          stufe,
        };
      }),
    ]),
  );
}

/** Liste mit Vollständigkeit: Suren mit Audio, mit vollständigen Verszeiten, mit geprüften Wortzeiten. */
export async function ladeRezitationsListe(): Promise<RezitationZeile[]> {
  const koepfe = await ladeKoepfe();
  const stand = await surenStand(koepfe.map((k) => k.id));
  return koepfe.map((k) => {
    const suren = stand.get(k.id) ?? [];
    return {
      ...k,
      mitAudio: suren.filter((s) => s.stufe !== 'leer').length,
      mitVerszeiten: suren.filter((s) => s.stufe === 'verse' || s.stufe === 'fertig').length,
      mitWortzeiten: suren.filter((s) => s.stufe === 'fertig').length,
    };
  });
}

export async function ladeRezitation(id: string): Promise<(RezitationKopf & { suren: SurenStand[] }) | null> {
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return null;
  const [kopf] = await ladeKoepfe(id);
  if (!kopf) return null;
  const stand = await surenStand([id]);
  return { ...kopf, suren: stand.get(id) ?? [] };
}

/** PDF-Dateien aus den Medien (außerhalb des Papierkorbs) für die Verknüpfung als Vereinbarung, neueste zuerst. */
export async function ladeVereinbarungsAuswahl(): Promise<{ id: string; dateiname: string | null; alt: string; erstelltAm: Date }[]> {
  const m = schema.medium;
  const zeilen = await db
    .select({ id: m.id, dateiname: m.dateiname, alt: m.alt, erstelltAm: m.erstelltAm })
    .from(m)
    .where(and(eq(m.typ, 'application/pdf'), isNull(m.imPapierkorbSeit)))
    .orderBy(desc(m.erstelltAm))
    .limit(100);
  return zeilen.map((z) => ({ ...z, alt: z.alt.de }));
}

/** Daten der Werkstatt einer Sure. */
export type WerkstattDaten = {
  rezitation: { id: string; name: Mehrsprachig; rezitator: string; lizenz: string; art: RezitationArt; aktiv: boolean };
  sure: { nr: number; nameAr: string; umschrift: string; verseAnzahl: number };
  verse: { nr: number; woerter: { pos: number; text: string }[] }[];
  /** Datei je Sure (vers 0) oder je Vers; Adresse spielt der Browser direkt ab */
  audio: { vers: number; url: string; mime: string; bytes: number; dauerMs: number | null }[];
  verszeiten: VersTripel[];
  /** [Vers, Wort, Start, Ende, geprüft] */
  wortzeiten: [number, number, number, number, boolean][];
};

export async function ladeWerkstatt(id: string, sure: number): Promise<WerkstattDaten | null> {
  if (!/^[a-z0-9-]{2,40}$/.test(id) || !Number.isInteger(sure) || sure < 1 || sure > 114) return null;
  const [rez] = await db
    .select({ id: r.id, name: r.name, rezitator: r.rezitator, lizenz: r.lizenz, art: r.art, aktiv: r.aktiv })
    .from(r)
    .where(eq(r.id, id))
    .limit(1);
  const [s] = await db
    .select({
      nr: schema.quranSure.nr,
      nameAr: schema.quranSure.nameAr,
      umschrift: sql<string>`coalesce(${schema.quranSure.nameUmschrift}, '')`,
      verseAnzahl: schema.quranSure.verseAnzahl,
    })
    .from(schema.quranSure)
    .where(eq(schema.quranSure.nr, sure))
    .limit(1);
  if (!rez || !s) return null;
  const a = schema.quranAudio;
  const v = schema.quranVerszeit;
  const w = schema.quranWortzeit;
  const [woerter, audio, verszeiten, wortzeiten] = await Promise.all([
    db
      .select({ vers: schema.quranWort.vers, pos: schema.quranWort.pos, text: schema.quranWort.textAr })
      .from(schema.quranWort)
      .where(eq(schema.quranWort.sure, sure))
      .orderBy(asc(schema.quranWort.vers), asc(schema.quranWort.pos)),
    db
      .select({ vers: a.vers, url: a.pfad, mime: a.mime, bytes: a.bytes, dauerMs: a.dauerMs })
      .from(a)
      .where(and(eq(a.rezitationId, id), eq(a.sure, sure)))
      .orderBy(asc(a.vers)),
    db
      .select({ vers: v.vers, start: v.startMs, ende: v.endeMs })
      .from(v)
      .where(and(eq(v.rezitationId, id), eq(v.sure, sure)))
      .orderBy(asc(v.vers)),
    db
      .select({ vers: w.vers, pos: w.pos, start: w.startMs, ende: w.endeMs, geprueft: w.geprueft })
      .from(w)
      .where(and(eq(w.rezitationId, id), eq(w.sure, sure)))
      .orderBy(asc(w.vers), asc(w.pos)),
  ]);
  const verse = Array.from({ length: s.verseAnzahl }, (_, i) => ({ nr: i + 1, woerter: [] as { pos: number; text: string }[] }));
  for (const wort of woerter) verse[wort.vers - 1]?.woerter.push({ pos: wort.pos, text: wort.text });
  return {
    rezitation: rez,
    sure: s,
    verse,
    audio,
    verszeiten: verszeiten.map((z) => [z.vers, z.start, z.ende]),
    wortzeiten: wortzeiten.map((z) => [z.vers, z.pos, z.start, z.ende, z.geprueft]),
  };
}
