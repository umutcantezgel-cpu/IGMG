import 'server-only';
import { and, asc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { TajwidSegment } from '@/lib/db/schema/quran';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { medienUrl } from '@/lib/medien/bild';
import { sichtbareAusgaben, type SichtbareAusgabe } from '@/lib/quran/ausgaben';
import { teileMitVersatz, type SatzTeil } from '@/lib/quran/satz';
import { REGEL_FAMILIE, type TajwidFamilie } from '@/lib/quran/tajwid';

/**
 * Koran-Leser (ADR 0009, 0025, 0029, 0030): alle Texte aus der importierten Quelle (Tanzil 1.1, `pnpm inhalte:import`).
 * Öffentlich gecacht (`'use cache: remote'`, Tag `quran`, Tajwid-Regeln `tajwid`, Rezitationen `rezitationen`).
 * Übersetzungen kommen aus `quran_uebersetzung` je Ausgabe (nie aus dem Altfeld `quran_vers.uebersetzung`);
 * welche Ausgabe sichtbar ist, entscheidet `sichtbareAusgaben` (lib/quran/ausgaben.ts). Wortbedeutungen und
 * Tajwid-Erklärungen nur mit Freigabe `geprueft`.
 */

export type QuranQuelle = { bezeichnung: string; url: string; version: string; lizenz: string };
export type Offenbarungsort = 'mekki' | 'medeni';
export type SureKurz = { nr: number; nameAr: string; umschrift: string; ort: Offenbarungsort | null; verseAnzahl: number };

export type VersDaten = {
  nr: number;
  /** Wörter (Position aus `quran_wort`) und Zeichen mit Versatz in Codepunkten für die Tajwid-Abschnitte */
  teile: SatzTeil[];
  tajwid: TajwidSegment[];
  /** Text der gewählten Ausgabe, sonst null */
  uebersetzung: string | null;
};

export type SureDaten = SureKurz & { basmala: string | null; verse: VersDaten[] };

/** Abschnitt eines Cüz: eine Sure (ganz oder teilweise) mit ihren Versen im Cüz. */
export type CuzAbschnitt = { sure: SureKurz & { basmala: string | null }; verse: VersDaten[] };
export type CuzDaten = { nr: number; abschnitte: CuzAbschnitt[] };
export type CuzBereich = { nr: number; von: { sure: number; vers: number }; bis: { sure: number; vers: number } };

/** Sure 1 und 9 haben keine vorangestellte Basmala (Tanzil-Attribut fehlt). */
const surenFelder = {
  nr: schema.quranSure.nr,
  nameAr: schema.quranSure.nameAr,
  umschrift: sql<string>`coalesce(${schema.quranSure.nameUmschrift}, '')`,
  ort: schema.quranSure.ort,
  verseAnzahl: schema.quranSure.verseAnzahl,
};

/** Quelle und alle Suren (Übersicht, Navigation, statische Parameter). Ohne Import: keine Quelle, keine Suren. */
export async function ladeQuranStand(): Promise<{ quelle: QuranQuelle | null; suren: SureKurz[] }> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  const [quelle] = await db
    .select({
      bezeichnung: schema.quranQuelle.bezeichnung,
      url: schema.quranQuelle.url,
      version: schema.quranQuelle.version,
      lizenz: schema.quranQuelle.lizenz,
    })
    .from(schema.quranQuelle)
    .limit(1);
  if (!quelle) return { quelle: null, suren: [] };
  const suren = await db.select(surenFelder).from(schema.quranSure).orderBy(asc(schema.quranSure.nr));
  return { quelle, suren };
}

/** Alle Übersetzungsausgaben, gefiltert nach Sichtbarkeit (`vorschau`: Betriebsart ist nicht Produktion). */
export async function ladeAusgaben(vorschau: boolean): Promise<SichtbareAusgabe[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  const alle = await db
    .select({
      id: schema.quranAusgabe.id,
      sprache: schema.quranAusgabe.sprache,
      titel: schema.quranAusgabe.titel,
      uebersetzer: schema.quranAusgabe.uebersetzer,
      aktiv: schema.quranAusgabe.aktiv,
      standard: schema.quranAusgabe.standard,
      freigegebenAm: schema.quranAusgabe.freigegebenAm,
    })
    .from(schema.quranAusgabe);
  return sichtbareAusgaben(alle, vorschau);
}

/**
 * Verse einer Sure im Bereich [von, bis] mit Wörtern aus `quran_wort` (Position und Versatz), Tajwid und – mit
 * `ausgabeId` – Übersetzung. Ein Wort, das nicht zum Verstext passt, bleibt ohne Wortnummer (wird nicht anklickbar),
 * statt eine falsche Zuordnung zu zeigen.
 */
async function verseIm(sure: number, von: number, bis: number, ausgabeId: string | null): Promise<VersDaten[]> {
  const { quranVers: v, quranWort: w, quranUebersetzung: u } = schema;
  const [verse, woerter, uebersetzungen] = await Promise.all([
    db
      .select({ nr: v.vers, text: v.textAr, tajwid: v.tajwid })
      .from(v)
      .where(and(eq(v.sure, sure), gte(v.vers, von), lte(v.vers, bis)))
      .orderBy(asc(v.vers)),
    db
      .select({ vers: w.vers, pos: w.pos, text: w.textAr })
      .from(w)
      .where(and(eq(w.sure, sure), gte(w.vers, von), lte(w.vers, bis))),
    ausgabeId
      ? db
          .select({ vers: u.vers, text: u.text })
          .from(u)
          .where(and(eq(u.ausgabeId, ausgabeId), eq(u.sure, sure), gte(u.vers, von), lte(u.vers, bis)))
      : Promise.resolve([]),
  ]);
  const wortJe = new Map(woerter.map((w) => [`${w.vers}:${w.pos}`, w.text]));
  const textJe = new Map(uebersetzungen.map((u) => [u.vers, u.text]));
  return verse.map((z) => ({
    nr: z.nr,
    teile: teileMitVersatz(z.text).map((t) => (t.pos !== null && wortJe.get(`${z.nr}:${t.pos}`) !== t.text ? { ...t, pos: null } : t)),
    tajwid: z.tajwid ?? [],
    uebersetzung: textJe.get(z.nr) ?? null,
  }));
}

async function sureKopf(nr: number): Promise<(SureKurz & { basmala: string | null }) | null> {
  const [sure] = await db
    .select({ ...surenFelder, basmala: schema.quranSure.basmala })
    .from(schema.quranSure)
    .where(eq(schema.quranSure.nr, nr))
    .limit(1);
  return sure ?? null;
}

/** Eine Sure mit allen Versen; `ausgabeId` wählt die Übersetzung (vorher mit `ladeAusgaben` geprüft). */
export async function ladeSure(nr: number, ausgabeId: string | null): Promise<SureDaten | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  if (!Number.isInteger(nr) || nr < 1 || nr > 114) return null;
  const kopf = await sureKopf(nr);
  if (!kopf) return null;
  return { ...kopf, verse: await verseIm(nr, 1, kopf.verseAnzahl, ausgabeId) };
}

/** Die 30 Cüz mit Anfang und Ende (Ende = Vers vor dem nächsten Anfang, beim letzten das Koranende). */
export async function ladeCuzBereiche(): Promise<CuzBereich[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  const anfaenge = await db
    .select({ nr: schema.quranEinteilung.nr, sure: schema.quranEinteilung.sure, vers: schema.quranEinteilung.vers })
    .from(schema.quranEinteilung)
    .where(eq(schema.quranEinteilung.art, 'cuz'))
    .orderBy(asc(schema.quranEinteilung.nr));
  if (!anfaenge.length) return [];
  const suren = await db.select({ nr: schema.quranSure.nr, verse: schema.quranSure.verseAnzahl }).from(schema.quranSure);
  const verseJe = new Map(suren.map((s) => [s.nr, s.verse]));
  return anfaenge.map((a, i) => {
    const naechster = anfaenge[i + 1];
    let bis: { sure: number; vers: number };
    if (!naechster) bis = { sure: 114, vers: verseJe.get(114) ?? 0 };
    else if (naechster.vers > 1) bis = { sure: naechster.sure, vers: naechster.vers - 1 };
    else bis = { sure: naechster.sure - 1, vers: verseJe.get(naechster.sure - 1) ?? 0 };
    return { nr: a.nr, von: { sure: a.sure, vers: a.vers }, bis };
  });
}

/** Verse eines Cüz über Surengrenzen hinweg, gegliedert nach Suren. */
export async function ladeCuz(nr: number, ausgabeId: string | null): Promise<CuzDaten | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  if (!Number.isInteger(nr) || nr < 1 || nr > 30) return null;
  const bereich = (await ladeCuzBereiche()).find((b) => b.nr === nr);
  if (!bereich) return null;
  const abschnitte: CuzAbschnitt[] = [];
  for (let s = bereich.von.sure; s <= bereich.bis.sure; s++) {
    const kopf = await sureKopf(s);
    if (!kopf) continue;
    const von = s === bereich.von.sure ? bereich.von.vers : 1;
    const bis = s === bereich.bis.sure ? bereich.bis.vers : kopf.verseAnzahl;
    abschnitte.push({ sure: kopf, verse: await verseIm(s, von, bis, ausgabeId) });
  }
  return { nr, abschnitte };
}

/** Text einer Ausgabe für eine Sure (statische JSON-Route); nur sichtbare Ausgaben, sonst null. */
export async function ladeUebersetzungstext(
  sure: number,
  ausgabeId: string,
  vorschau: boolean,
): Promise<{ ausgabe: SichtbareAusgabe; verse: [number, string][] } | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  const ausgabe = (await ladeAusgaben(vorschau)).find((a) => a.id === ausgabeId);
  if (!ausgabe) return null;
  const zeilen = await db
    .select({ vers: schema.quranUebersetzung.vers, text: schema.quranUebersetzung.text })
    .from(schema.quranUebersetzung)
    .where(and(eq(schema.quranUebersetzung.ausgabeId, ausgabeId), eq(schema.quranUebersetzung.sure, sure)))
    .orderBy(asc(schema.quranUebersetzung.vers));
  return { ausgabe, verse: zeilen.map((z) => [z.vers, z.text]) };
}

/** Tajwid-Regel für Seite, Seitenleiste und Wortkarte. Erklärung, Kurztext und Hörbeispiel nur mit Freigabe. */
export type TajwidRegelDaten = {
  schluessel: string;
  familie: TajwidFamilie;
  name: Mehrsprachig;
  kurz: Mehrsprachig | null;
  erklaerung: MehrsprachigRich | null;
  hoerbeispiel: string | null;
};

export async function ladeTajwidRegeln(): Promise<TajwidRegelDaten[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.tajwid);
  const zeilen = await db
    .select({
      schluessel: schema.tajwidRegel.schluessel,
      familie: schema.tajwidRegel.familie,
      name: schema.tajwidRegel.name,
      kurz: schema.tajwidRegel.kurz,
      erklaerung: schema.tajwidRegel.erklaerung,
      freigabe: schema.tajwidRegel.freigabe,
      hoerbeispiel: schema.medium.schluessel,
    })
    .from(schema.tajwidRegel)
    .leftJoin(schema.medium, and(eq(schema.medium.id, schema.tajwidRegel.hoerbeispielMediumId), isNull(schema.medium.imPapierkorbSeit)))
    .orderBy(asc(schema.tajwidRegel.sortierung), asc(schema.tajwidRegel.schluessel));
  return zeilen.flatMap((z) => {
    // Familie aus der festen Zuordnung (Farbe und Muster); unbekannte Regeln erscheinen nicht
    const familie = REGEL_FAMILIE[z.schluessel];
    if (!familie) return [];
    const geprueft = z.freigabe === 'geprueft';
    return [
      {
        schluessel: z.schluessel,
        familie,
        name: z.name,
        kurz: geprueft ? (z.kurz ?? null) : null,
        erklaerung: geprueft ? (z.erklaerung ?? null) : null,
        hoerbeispiel: geprueft && z.hoerbeispiel ? medienUrl(z.hoerbeispiel) : null,
      },
    ];
  });
}

/** Erstes Vorkommen jeder Regel im Koran (Beispielvers der Tajwid-Seite). */
export type TajwidBeispiel = { regel: string; sure: number; vers: number; teile: SatzTeil[]; tajwid: TajwidSegment[] };

export async function ladeTajwidBeispiele(): Promise<TajwidBeispiel[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran);
  const zeilen = await db.execute<{ regel: string; sure: number; vers: number; text_ar: string; tajwid: TajwidSegment[] }>(sql`
    select distinct on (x.regel) x.regel, v.sure, v.vers, v.text_ar, v.tajwid
    from ${schema.quranVers} v
    cross join lateral (select distinct e->>2 as regel from jsonb_array_elements(coalesce(v.tajwid, '[]'::jsonb)) e) x
    order by x.regel, v.sure, v.vers`);
  return zeilen.rows.map((z) => ({
    regel: z.regel,
    sure: Number(z.sure),
    vers: Number(z.vers),
    teile: teileMitVersatz(z.text_ar),
    tajwid: (z.tajwid ?? []).filter((s) => s[2] === z.regel),
  }));
}

/**
 * Wortdaten einer Sure für die Wortkarte (statische JSON-Route, lazy): je Vers die Wörter als [Form, Versatz, Länge]
 * und die Tajwid-Segmente, Vorkommen je Form, geprüfte Bedeutungen (Form und Ort) und die Tajwid-Regeln.
 */
export type WortDaten = {
  sure: number;
  verse: Record<number, { w: [number, number, number][]; tj: TajwidSegment[] }>;
  formen: Record<number, number>;
  bedeutungen: Record<number, Record<string, { b: string; wurzel: string | null }>>;
  orte: Record<string, Record<string, string>>;
  regeln: TajwidRegelDaten[];
};

export async function ladeWortDaten(sure: number): Promise<WortDaten | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.quran, TAG.tajwid);
  if (!Number.isInteger(sure) || sure < 1 || sure > 114) return null;
  const [verse, woerter] = await Promise.all([
    db
      .select({ nr: schema.quranVers.vers, text: schema.quranVers.textAr, tajwid: schema.quranVers.tajwid })
      .from(schema.quranVers)
      .where(eq(schema.quranVers.sure, sure)),
    db
      .select({
        vers: schema.quranWort.vers,
        pos: schema.quranWort.pos,
        formId: schema.quranWort.formId,
        vorkommen: schema.quranWortform.vorkommen,
      })
      .from(schema.quranWort)
      .innerJoin(schema.quranWortform, eq(schema.quranWortform.id, schema.quranWort.formId))
      .where(eq(schema.quranWort.sure, sure)),
  ]);
  if (!verse.length) return null;
  const formJe = new Map(woerter.map((w) => [`${w.vers}:${w.pos}`, w.formId]));
  const formen: WortDaten['formen'] = {};
  for (const w of woerter) formen[w.formId] = w.vorkommen;
  const daten: WortDaten = { sure, verse: {}, formen, bedeutungen: {}, orte: {}, regeln: await ladeTajwidRegeln() };
  for (const v of verse) {
    const w: [number, number, number][] = [];
    for (const t of teileMitVersatz(v.text)) {
      if (t.pos === null) continue;
      w.push([formJe.get(`${v.nr}:${t.pos}`) ?? 0, t.versatz, Array.from(t.text).length]);
    }
    daten.verse[v.nr] = { w, tj: v.tajwid ?? [] };
  }
  const formIds = Object.keys(formen).map(Number);
  if (formIds.length) {
    const bedeutungen = await db
      .select({
        formId: schema.quranWortbedeutung.formId,
        sprache: schema.quranWortbedeutung.sprache,
        bedeutung: schema.quranWortbedeutung.bedeutung,
        wurzel: schema.quranWortbedeutung.wurzel,
      })
      .from(schema.quranWortbedeutung)
      .where(and(inArray(schema.quranWortbedeutung.formId, formIds), eq(schema.quranWortbedeutung.freigabe, 'geprueft')));
    for (const b of bedeutungen) {
      (daten.bedeutungen[b.formId] ??= {})[b.sprache] = { b: b.bedeutung, wurzel: b.wurzel };
    }
  }
  const orte = await db
    .select({
      vers: schema.quranWortbedeutungOrt.vers,
      pos: schema.quranWortbedeutungOrt.pos,
      sprache: schema.quranWortbedeutungOrt.sprache,
      bedeutung: schema.quranWortbedeutungOrt.bedeutung,
    })
    .from(schema.quranWortbedeutungOrt)
    .where(and(eq(schema.quranWortbedeutungOrt.sure, sure), eq(schema.quranWortbedeutungOrt.freigabe, 'geprueft')));
  for (const o of orte) (daten.orte[`${o.vers}:${o.pos}`] ??= {})[o.sprache] = o.bedeutung;
  return daten;
}

/** Aktive Rezitation (Vereinbarung hinterlegt, ADR 0029) für den Player. */
export type RezitationKurz = { id: string; name: Mehrsprachig; rezitator: string; lizenz: string; standard: boolean };

export async function ladeRezitationen(): Promise<RezitationKurz[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.rezitationen);
  return db
    .select({
      id: schema.quranRezitation.id,
      name: schema.quranRezitation.name,
      rezitator: schema.quranRezitation.rezitator,
      lizenz: schema.quranRezitation.lizenz,
      standard: schema.quranRezitation.standard,
    })
    .from(schema.quranRezitation)
    .where(eq(schema.quranRezitation.aktiv, true))
    .orderBy(sql`${schema.quranRezitation.standard} desc`, asc(schema.quranRezitation.id));
}

/** Suren mit Audio je aktiver Rezitation (statische Parameter der Zeiten-Route). */
export async function ladeRezitationsSuren(): Promise<{ rezitation: string; sure: number }[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.rezitationen);
  const zeilen = await db
    .selectDistinct({ rezitation: schema.quranAudio.rezitationId, sure: schema.quranAudio.sure })
    .from(schema.quranAudio)
    .innerJoin(schema.quranRezitation, eq(schema.quranRezitation.id, schema.quranAudio.rezitationId))
    .where(eq(schema.quranRezitation.aktiv, true));
  return zeilen;
}

/** Audio und Zeiten einer Sure für eine aktive Rezitation (statische JSON-Route des Players). */
export type ZeitenDaten = {
  rezitation: string;
  sure: number;
  /** Datei je Sure (vers 0) oder je Vers */
  audio: { vers: number; pfad: string; mime: string }[];
  /** [Vers, Start, Ende] in ms innerhalb der Datei */
  verse: [number, number, number][];
  /** [Vers, Wort, Start, Ende] in ms; nur Zeiten mit Prüfung */
  woerter: [number, number, number, number][];
};

export async function ladeZeiten(sure: number, rezitationId: string): Promise<ZeitenDaten | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(TAG.rezitationen, TAG.rezitation(rezitationId));
  const [rezitation] = await db
    .select({ id: schema.quranRezitation.id })
    .from(schema.quranRezitation)
    .where(and(eq(schema.quranRezitation.id, rezitationId), eq(schema.quranRezitation.aktiv, true)))
    .limit(1);
  if (!rezitation) return null;
  const [audio, verse, woerter] = await Promise.all([
    db
      .select({ vers: schema.quranAudio.vers, pfad: schema.quranAudio.pfad, mime: schema.quranAudio.mime })
      .from(schema.quranAudio)
      .where(and(eq(schema.quranAudio.rezitationId, rezitationId), eq(schema.quranAudio.sure, sure)))
      .orderBy(asc(schema.quranAudio.vers)),
    db
      .select({ vers: schema.quranVerszeit.vers, start: schema.quranVerszeit.startMs, ende: schema.quranVerszeit.endeMs })
      .from(schema.quranVerszeit)
      .where(and(eq(schema.quranVerszeit.rezitationId, rezitationId), eq(schema.quranVerszeit.sure, sure)))
      .orderBy(asc(schema.quranVerszeit.vers)),
    db
      .select({
        vers: schema.quranWortzeit.vers,
        pos: schema.quranWortzeit.pos,
        start: schema.quranWortzeit.startMs,
        ende: schema.quranWortzeit.endeMs,
      })
      .from(schema.quranWortzeit)
      .where(
        and(
          eq(schema.quranWortzeit.rezitationId, rezitationId),
          eq(schema.quranWortzeit.sure, sure),
          eq(schema.quranWortzeit.geprueft, true),
        ),
      )
      .orderBy(asc(schema.quranWortzeit.vers), asc(schema.quranWortzeit.pos)),
  ]);
  if (!audio.length) return null;
  return {
    rezitation: rezitationId,
    sure,
    audio,
    verse: verse.map((v) => [v.vers, v.start, v.ende]),
    woerter: woerter.map((w) => [w.vers, w.pos, w.start, w.ende]),
  };
}
