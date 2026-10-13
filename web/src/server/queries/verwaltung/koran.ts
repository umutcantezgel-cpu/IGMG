import 'server-only';
import { and, asc, count, desc, eq, inArray, isNull, ne, or, sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { abrufVeraltet, RELIGIOESE_ARTEN, type FreigabeStatus, type ReligioeseArt } from '@/lib/religioes/freigabe';
import { HADITH_LISTEN, type HadithListe } from '@/lib/validierung/koran';

/**
 * Verwaltung „Koran & Hadith“ (H-Q03/Q04, ADR 0025, ADR 0030): Ausgaben, Wortbedeutungen, Tajwid-Regeltexte,
 * Hadith-Übersetzungen und kuratierte Listen. Ungecacht (Verwaltungsseiten sind dynamisch); Aufrufer prüfen vorher das
 * Recht. Alle arabischen Texte kommen aus der Datenbank (Import), Bedeutungen und Übersetzungen von Menschen.
 */

export type Status = FreigabeStatus;
const OFFEN: Status = 'zur_pruefung';

/** Namen der Konten zu IDs (verfasst/geprüft von). Gelöschte Konten fehlen in der Karte. */
async function namen(ids: readonly (string | null | undefined)[]): Promise<Map<string, string>> {
  const eindeutig = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (!eindeutig.length) return new Map();
  const zeilen = await db.select({ id: schema.user.id, name: schema.user.name }).from(schema.user).where(inArray(schema.user.id, eindeutig));
  return new Map(zeilen.map((z) => [z.id, z.name]));
}

/** Nicht von dieser Person verfasst (sie darf es nach dem Vier-Augen-Prinzip prüfen). */
const fremd = (spalte: AnyPgColumn, benutzerId: string) => or(isNull(spalte), ne(spalte, benutzerId));

/**
 * Zähler der Seitenleiste: Einträge „zur Prüfung“, die diese Person prüfen darf (nicht selbst verfasst). Nur für
 * Personen mit `religioes.freigeben` aufrufen.
 */
export async function zaehleOffeneFreigaben(benutzerId: string): Promise<number> {
  const [a, b, c, d] = await Promise.all([
    db
      .select({ n: count() })
      .from(schema.quranWortbedeutung)
      .where(and(eq(schema.quranWortbedeutung.freigabe, OFFEN), fremd(schema.quranWortbedeutung.verfasstVon, benutzerId))),
    db
      .select({ n: count() })
      .from(schema.quranWortbedeutungOrt)
      .where(and(eq(schema.quranWortbedeutungOrt.freigabe, OFFEN), fremd(schema.quranWortbedeutungOrt.verfasstVon, benutzerId))),
    db
      .select({ n: count() })
      .from(schema.tajwidRegel)
      .where(and(eq(schema.tajwidRegel.freigabe, OFFEN), fremd(schema.tajwidRegel.verfasstVon, benutzerId))),
    db
      .select({ n: count() })
      .from(schema.hadithUebersetzung)
      .where(and(eq(schema.hadithUebersetzung.freigabe, OFFEN), fremd(schema.hadithUebersetzung.verfasstVon, benutzerId))),
  ]);
  return [a, b, c, d].reduce((summe, [z]) => summe + Number(z?.n ?? 0), 0);
}

// ————————————————————————————————————————— Übersicht „Freigaben religiös“

export type StatusZahlen = Record<Status, number>;
const leer = (): StatusZahlen => ({ entwurf: 0, zur_pruefung: 0, geprueft: 0 });

export type OffenerEintrag = {
  art: ReligioeseArt;
  kennung: string;
  /** Arabische Wortform (aus der Datenbank) oder Bezeichnung (Regel, Hadith-Nummer, Stelle). */
  titel: string;
  arabisch: boolean;
  sprache: string | null;
  /** Kurzer Auszug des verfassten Texts (Bedeutung, Übersetzung, Kurztext). */
  auszug: string | null;
  verfasstVon: string | null;
  /** Von der angemeldeten Person verfasst: Sie darf ihn nicht selbst freigeben. */
  eigen: boolean;
  pfad: string;
};

export type KoranUebersicht = {
  ausgaben: { gesamt: number; freigegeben: number; veraltet: number };
  arten: Record<ReligioeseArt, StatusZahlen>;
  offen: OffenerEintrag[];
  listen: Record<HadithListe, number>;
};

const AUSZUG = 140;
const auszug = (text: string | null | undefined) => {
  if (!text) return null;
  const zeichen = Array.from(text.replace(/\s+/g, ' ').trim());
  return zeichen.length > AUSZUG ? `${zeichen.slice(0, AUSZUG).join('')}…` : zeichen.join('');
};

/** Erste Sure, in der eine Wortform vorkommt (Ziel des Links in die Werkstatt). */
async function ersteSure(formIds: number[]): Promise<Map<number, number>> {
  if (!formIds.length) return new Map();
  const zeilen = await db
    .select({ formId: schema.quranWort.formId, sure: sql<number>`min(${schema.quranWort.sure})`.mapWith(Number) })
    .from(schema.quranWort)
    .where(inArray(schema.quranWort.formId, formIds))
    .groupBy(schema.quranWort.formId);
  return new Map(zeilen.map((z) => [z.formId, z.sure]));
}

export async function ladeKoranUebersicht(benutzerId: string, jetzt: Date, grenze = 30): Promise<KoranUebersicht> {
  const zaehle = async (
    tabelle:
      | typeof schema.quranWortbedeutung
      | typeof schema.quranWortbedeutungOrt
      | typeof schema.tajwidRegel
      | typeof schema.hadithUebersetzung,
  ) => {
    const zeilen = await db.select({ status: tabelle.freigabe, n: count() }).from(tabelle).groupBy(tabelle.freigabe);
    const z = leer();
    for (const r of zeilen) z[r.status] = Number(r.n);
    return z;
  };
  const wb = schema.quranWortbedeutung;
  const wo = schema.quranWortbedeutungOrt;
  const tr = schema.tajwidRegel;
  const hu = schema.hadithUebersetzung;
  const [ausgaben, zWb, zWo, zTr, zHu, bedeutungen, orte, regeln, hadithe, listen] = await Promise.all([
    db.select({ aktiv: schema.quranAusgabe.aktiv, am: schema.quranAusgabe.freigegebenAm, abgerufenAm: schema.quranAusgabe.abgerufenAm }).from(schema.quranAusgabe),
    zaehle(wb),
    zaehle(wo),
    zaehle(tr),
    zaehle(hu),
    db
      .select({ id: wb.id, formId: wb.formId, sprache: wb.sprache, bedeutung: wb.bedeutung, von: wb.verfasstVon, wort: schema.quranWortform.textAr })
      .from(wb)
      .innerJoin(schema.quranWortform, eq(schema.quranWortform.id, wb.formId))
      .where(eq(wb.freigabe, OFFEN))
      .orderBy(asc(wb.aktualisiertAm))
      .limit(grenze),
    db
      .select({ sure: wo.sure, vers: wo.vers, pos: wo.pos, sprache: wo.sprache, bedeutung: wo.bedeutung, von: wo.verfasstVon, formId: schema.quranWort.formId })
      .from(wo)
      .leftJoin(schema.quranWort, and(eq(schema.quranWort.sure, wo.sure), eq(schema.quranWort.vers, wo.vers), eq(schema.quranWort.pos, wo.pos)))
      .where(eq(wo.freigabe, OFFEN))
      .orderBy(asc(wo.sure), asc(wo.vers), asc(wo.pos))
      .limit(grenze),
    db
      .select({ schluessel: tr.schluessel, name: tr.name, kurz: tr.kurz, von: tr.verfasstVon })
      .from(tr)
      .where(eq(tr.freigabe, OFFEN))
      .orderBy(asc(tr.sortierung))
      .limit(grenze),
    db
      .select({ nummer: hu.nummer, sprache: hu.sprache, text: hu.text, von: hu.verfasstVon })
      .from(hu)
      .leftJoin(schema.hadith, and(eq(schema.hadith.sammlungId, hu.sammlungId), eq(schema.hadith.nummer, hu.nummer)))
      .where(and(eq(hu.freigabe, OFFEN), eq(hu.sammlungId, BUKHARI)))
      .orderBy(asc(schema.hadith.sortierung), asc(hu.sprache))
      .limit(grenze),
    db
      .select({ liste: schema.hadithAuswahl.liste, n: count() })
      .from(schema.hadithAuswahl)
      .where(and(inArray(schema.hadithAuswahl.liste, [...HADITH_LISTEN]), eq(schema.hadithAuswahl.sammlungId, BUKHARI)))
      .groupBy(schema.hadithAuswahl.liste),
  ]);
  const sure = await ersteSure(bedeutungen.map((b) => b.formId));
  const wer = await namen([...bedeutungen, ...orte, ...regeln, ...hadithe].map((z) => z.von));
  const person = (id: string | null) => (id ? (wer.get(id) ?? null) : null);
  const offen: OffenerEintrag[] = [
    ...bedeutungen.map((b) => ({
      art: 'quran_wortbedeutung' as const,
      kennung: b.id,
      titel: b.wort,
      arabisch: true,
      sprache: b.sprache,
      auszug: auszug(b.bedeutung),
      verfasstVon: person(b.von),
      eigen: b.von === benutzerId,
      pfad: `/verwaltung/koran/woerter/${sure.get(b.formId) ?? 1}/${b.formId}`,
    })),
    ...orte.map((o) => ({
      art: 'quran_wortbedeutung_ort' as const,
      kennung: `${o.sure}|${o.vers}|${o.pos}|${o.sprache}`,
      titel: `${o.sure}:${o.vers} · ${o.pos}`,
      arabisch: false,
      sprache: o.sprache,
      auszug: auszug(o.bedeutung),
      verfasstVon: person(o.von),
      eigen: o.von === benutzerId,
      pfad: o.formId ? `/verwaltung/koran/woerter/${o.sure}/${o.formId}` : `/verwaltung/koran/woerter/${o.sure}`,
    })),
    ...regeln.map((r) => ({
      art: 'tajwid_regel' as const,
      kennung: r.schluessel,
      titel: r.name.de,
      arabisch: false,
      sprache: null,
      auszug: auszug(r.kurz?.de),
      verfasstVon: person(r.von),
      eigen: r.von === benutzerId,
      pfad: `/verwaltung/koran/tajwid/${r.schluessel}`,
    })),
    ...hadithe.map((h) => ({
      art: 'hadith_uebersetzung' as const,
      kennung: `${BUKHARI}|${h.nummer}|${h.sprache}`,
      titel: h.nummer,
      arabisch: false,
      sprache: h.sprache,
      auszug: auszug(h.text),
      verfasstVon: person(h.von),
      eigen: h.von === benutzerId,
      pfad: `/verwaltung/koran/hadith/${h.nummer}`,
    })),
  ];
  const listenZahl = Object.fromEntries(HADITH_LISTEN.map((l) => [l, 0])) as Record<HadithListe, number>;
  for (const l of listen) if ((HADITH_LISTEN as readonly string[]).includes(l.liste)) listenZahl[l.liste as HadithListe] = Number(l.n);
  return {
    ausgaben: {
      gesamt: ausgaben.length,
      freigegeben: ausgaben.filter((a) => a.aktiv && a.am !== null).length,
      veraltet: ausgaben.filter((a) => abrufVeraltet(a.abgerufenAm, jetzt)).length,
    },
    arten: { quran_wortbedeutung: zWb, quran_wortbedeutung_ort: zWo, tajwid_regel: zTr, hadith_uebersetzung: zHu },
    offen,
    listen: listenZahl,
  };
}

// ————————————————————————————————————————— Ausgaben

export type AusgabeVerwaltung = {
  id: string;
  sprache: string;
  titel: string;
  uebersetzer: string;
  quelle: string;
  version: string;
  lizenz: string;
  url: string;
  sha256: string;
  abgerufenAm: Date;
  aktiv: boolean;
  standard: boolean;
  freigegebenVon: string | null;
  freigegebenAm: Date | null;
  verse: number;
};

export async function ladeAusgabenVerwaltung(): Promise<AusgabeVerwaltung[]> {
  const a = schema.quranAusgabe;
  const [zeilen, verse] = await Promise.all([
    db.select().from(a).orderBy(asc(a.sprache), asc(a.titel)),
    db
      .select({ id: schema.quranUebersetzung.ausgabeId, n: count() })
      .from(schema.quranUebersetzung)
      .groupBy(schema.quranUebersetzung.ausgabeId),
  ]);
  const verseJe = new Map(verse.map((v) => [v.id, Number(v.n)]));
  const wer = await namen(zeilen.map((z) => z.freigegebenVon));
  const rang = (s: string) => {
    const i = ['de', 'tr', 'en'].indexOf(s);
    return i < 0 ? 3 : i;
  };
  return zeilen
    .map((z) => ({
      ...z,
      freigegebenVon: z.freigegebenVon ? (wer.get(z.freigegebenVon) ?? null) : null,
      verse: verseJe.get(z.id) ?? 0,
    }))
    .sort((x, y) => rang(x.sprache) - rang(y.sprache) || x.sprache.localeCompare(y.sprache) || x.titel.localeCompare(y.titel));
}

// ————————————————————————————————————————— Wortbedeutungen

export type SureFortschritt = {
  nr: number;
  nameAr: string;
  umschrift: string;
  verse: number;
  formen: number;
  de: number;
  tr: number;
  offen: number;
};

/** Fortschritt je Sure: eindeutige Wortformen, davon mit geprüfter Bedeutung de/tr, Einträge zur Prüfung. */
export async function ladeSurenFortschritt(): Promise<{ suren: SureFortschritt[]; cuz30Ab: number }> {
  const [ergebnis, [cuz]] = await Promise.all([
    db.execute<{ nr: number; name_ar: string; umschrift: string | null; verse: number; formen: number; de: number; tr: number; offen: number }>(sql`
      with f as (select distinct sure, form_id from ${schema.quranWort}),
      b as (
        select form_id,
          bool_or(sprache = 'de' and freigabe = 'geprueft') as de,
          bool_or(sprache = 'tr' and freigabe = 'geprueft') as tr,
          bool_or(freigabe = 'zur_pruefung') as offen
        from ${schema.quranWortbedeutung} group by form_id
      )
      select s.nr, s.name_ar, s.name_umschrift as umschrift, s.verse_anzahl as verse,
        count(f.form_id)::int as formen,
        (count(*) filter (where b.de))::int as de,
        (count(*) filter (where b.tr))::int as tr,
        (count(*) filter (where b.offen))::int as offen
      from ${schema.quranSure} s
      left join f on f.sure = s.nr
      left join b on b.form_id = f.form_id
      group by s.nr order by s.nr`),
    db
      .select({ sure: schema.quranEinteilung.sure })
      .from(schema.quranEinteilung)
      .where(and(eq(schema.quranEinteilung.art, 'cuz'), eq(schema.quranEinteilung.nr, 30)))
      .limit(1),
  ]);
  return {
    suren: ergebnis.rows.map((z) => ({
      nr: Number(z.nr),
      nameAr: z.name_ar,
      umschrift: z.umschrift ?? '',
      verse: Number(z.verse),
      formen: Number(z.formen),
      de: Number(z.de),
      tr: Number(z.tr),
      offen: Number(z.offen),
    })),
    cuz30Ab: cuz?.sure ?? 78,
  };
}

export const WOERTER_JE_SEITE = 40;
export const WORT_FILTER = ['alle', 'fehlt', 'pruefung'] as const;
export type WortFilter = (typeof WORT_FILTER)[number];

export type BedeutungKurz = { status: Status; bedeutung: string } | null;
export type SurenWort = {
  formId: number;
  textAr: string;
  /** Vorkommen im ganzen Koran bzw. in dieser Sure */
  vorkommen: number;
  hier: number;
  /** Erste Stelle in dieser Sure */
  vers: number;
  pos: number;
  de: BedeutungKurz;
  tr: BedeutungKurz;
};

export type SureKopf = { nr: number; nameAr: string; umschrift: string; verse: number };

async function sureKopf(nr: number): Promise<SureKopf | null> {
  const [s] = await db
    .select({ nr: schema.quranSure.nr, nameAr: schema.quranSure.nameAr, umschrift: schema.quranSure.nameUmschrift, verse: schema.quranSure.verseAnzahl })
    .from(schema.quranSure)
    .where(eq(schema.quranSure.nr, nr))
    .limit(1);
  return s ? { ...s, umschrift: s.umschrift ?? '' } : null;
}

/** Wortformen einer Sure in der Reihenfolge ihres ersten Vorkommens, seitenweise, mit dem Stand der Bedeutungen. */
export async function ladeSureWoerter(
  nr: number,
  filter: WortFilter,
  seite: number,
): Promise<{ sure: SureKopf; woerter: SurenWort[]; gesamt: number; seiten: number; zahlen: Record<WortFilter, number> } | null> {
  if (!Number.isInteger(nr) || nr < 1 || nr > 114) return null;
  const sure = await sureKopf(nr);
  if (!sure) return null;
  const bedingung =
    filter === 'fehlt'
      ? sql`not (coalesce(de.freigabe = 'geprueft', false) and coalesce(tr.freigabe = 'geprueft', false))`
      : filter === 'pruefung'
        ? sql`(de.freigabe = 'zur_pruefung' or tr.freigabe = 'zur_pruefung')`
        : sql`true`;
  const basis = sql`
    with w as (
      select form_id, min(vers * 1000 + pos) as erst, count(*)::int as hier
      from ${schema.quranWort} where sure = ${nr} group by form_id
    )`;
  const verbunden = sql`
    from w
    join ${schema.quranWortform} f on f.id = w.form_id
    left join ${schema.quranWortbedeutung} de on de.form_id = w.form_id and de.sprache = 'de'
    left join ${schema.quranWortbedeutung} tr on tr.form_id = w.form_id and tr.sprache = 'tr'`;
  const [zahlen] = (
    await db.execute<{ alle: number; fehlt: number; pruefung: number }>(sql`${basis}
      select count(*)::int as alle,
        (count(*) filter (where not (coalesce(de.freigabe = 'geprueft', false) and coalesce(tr.freigabe = 'geprueft', false))))::int as fehlt,
        (count(*) filter (where de.freigabe = 'zur_pruefung' or tr.freigabe = 'zur_pruefung'))::int as pruefung
      ${verbunden}`)
  ).rows;
  const z = { alle: Number(zahlen?.alle ?? 0), fehlt: Number(zahlen?.fehlt ?? 0), pruefung: Number(zahlen?.pruefung ?? 0) };
  const gesamt = z[filter];
  const seiten = Math.max(1, Math.ceil(gesamt / WOERTER_JE_SEITE));
  const aktuell = Math.min(Math.max(1, seite), seiten);
  const zeilen = await db.execute<{
    form_id: number;
    text_ar: string;
    vorkommen: number;
    hier: number;
    erst: number;
    de_status: Status | null;
    de_bedeutung: string | null;
    tr_status: Status | null;
    tr_bedeutung: string | null;
  }>(sql`${basis}
    select w.form_id, f.text_ar, f.vorkommen, w.hier, w.erst,
      de.freigabe as de_status, de.bedeutung as de_bedeutung, tr.freigabe as tr_status, tr.bedeutung as tr_bedeutung
    ${verbunden}
    where ${bedingung}
    order by w.erst
    limit ${WOERTER_JE_SEITE} offset ${(aktuell - 1) * WOERTER_JE_SEITE}`);
  return {
    sure,
    woerter: zeilen.rows.map((r) => ({
      formId: Number(r.form_id),
      textAr: r.text_ar,
      vorkommen: Number(r.vorkommen),
      hier: Number(r.hier),
      vers: Math.floor(Number(r.erst) / 1000),
      pos: Number(r.erst) % 1000,
      de: r.de_status ? { status: r.de_status, bedeutung: r.de_bedeutung ?? '' } : null,
      tr: r.tr_status ? { status: r.tr_status, bedeutung: r.tr_bedeutung ?? '' } : null,
    })),
    gesamt,
    seiten,
    zahlen: z,
  };
}

export type BedeutungVoll = {
  id: string;
  sprache: string;
  bedeutung: string;
  wurzel: string | null;
  anmerkung: string | null;
  status: Status;
  verfasstVonId: string | null;
  verfasstVon: string | null;
  geprueftVon: string | null;
  geprueftAm: Date | null;
  aktualisiertAm: Date;
};

export type OrtBedeutung = {
  sure: number;
  vers: number;
  pos: number;
  sprache: string;
  bedeutung: string;
  status: Status;
  verfasstVonId: string | null;
  verfasstVon: string | null;
  geprueftVon: string | null;
};

/** Ein Vers als Wortliste (für den Zusammenhang einer Stelle), dazu die Übersetzung einer deutschen Ausgabe. */
export type VersZusammenhang = { vers: number; pos: number; woerter: { pos: number; text: string }[] };

export type WortformDetail = {
  sure: SureKopf;
  formId: number;
  textAr: string;
  vorkommen: number;
  stellen: { vers: number; pos: number }[];
  andereSuren: { sure: number; anzahl: number }[];
  bedeutungen: Partial<Record<'de' | 'tr', BedeutungVoll>>;
  orte: OrtBedeutung[];
  zusammenhang: VersZusammenhang[];
  vorher: number | null;
  naechste: number | null;
};

const ZUSAMMENHANG = 3;

/** Eine Wortform in der Werkstatt einer Sure: Stellen, Bedeutungen de/tr, abweichende Bedeutungen an Stellen, Nachbarn. */
export async function ladeWortform(nr: number, formId: number): Promise<WortformDetail | null> {
  if (!Number.isInteger(nr) || nr < 1 || nr > 114 || !Number.isInteger(formId) || formId < 1) return null;
  const [sure, [form]] = await Promise.all([
    sureKopf(nr),
    db.select().from(schema.quranWortform).where(eq(schema.quranWortform.id, formId)).limit(1),
  ]);
  if (!sure || !form) return null;
  const w = schema.quranWort;
  const [stellen, andere, reihenfolge, bedeutungen, orte] = await Promise.all([
    db
      .select({ vers: w.vers, pos: w.pos })
      .from(w)
      .where(and(eq(w.sure, nr), eq(w.formId, formId)))
      .orderBy(asc(w.vers), asc(w.pos)),
    db
      .select({ sure: w.sure, anzahl: count() })
      .from(w)
      .where(and(eq(w.formId, formId), ne(w.sure, nr)))
      .groupBy(w.sure)
      .orderBy(asc(w.sure)),
    db.execute<{ form_id: number }>(
      sql`select form_id from ${w} where sure = ${nr} group by form_id order by min(vers * 1000 + pos)`,
    ),
    db.select().from(schema.quranWortbedeutung).where(eq(schema.quranWortbedeutung.formId, formId)),
    db
      .select({
        sure: schema.quranWortbedeutungOrt.sure,
        vers: schema.quranWortbedeutungOrt.vers,
        pos: schema.quranWortbedeutungOrt.pos,
        sprache: schema.quranWortbedeutungOrt.sprache,
        bedeutung: schema.quranWortbedeutungOrt.bedeutung,
        status: schema.quranWortbedeutungOrt.freigabe,
        verfasstVon: schema.quranWortbedeutungOrt.verfasstVon,
        geprueftVon: schema.quranWortbedeutungOrt.geprueftVon,
      })
      .from(schema.quranWortbedeutungOrt)
      .innerJoin(
        w,
        and(eq(w.sure, schema.quranWortbedeutungOrt.sure), eq(w.vers, schema.quranWortbedeutungOrt.vers), eq(w.pos, schema.quranWortbedeutungOrt.pos)),
      )
      .where(eq(w.formId, formId))
      .orderBy(asc(schema.quranWortbedeutungOrt.sure), asc(schema.quranWortbedeutungOrt.vers), asc(schema.quranWortbedeutungOrt.pos)),
  ]);
  if (!stellen.length) return null;
  const folge = reihenfolge.rows.map((r) => Number(r.form_id));
  const i = folge.indexOf(formId);
  const wer = await namen([...bedeutungen.flatMap((b) => [b.verfasstVon, b.geprueftVon]), ...orte.flatMap((o) => [o.verfasstVon, o.geprueftVon])]);
  const name = (id: string | null) => (id ? (wer.get(id) ?? null) : null);
  const auswahl = stellen.slice(0, ZUSAMMENHANG);
  const verse = await db
    .select({ vers: w.vers, pos: w.pos, text: w.textAr })
    .from(w)
    .where(and(eq(w.sure, nr), inArray(w.vers, [...new Set(auswahl.map((s) => s.vers))])))
    .orderBy(asc(w.vers), asc(w.pos));
  const ergebnis: WortformDetail = {
    sure,
    formId,
    textAr: form.textAr,
    vorkommen: form.vorkommen,
    stellen,
    andereSuren: andere.map((a) => ({ sure: a.sure, anzahl: Number(a.anzahl) })),
    bedeutungen: {},
    orte: orte.map((o) => ({ ...o, verfasstVonId: o.verfasstVon, verfasstVon: name(o.verfasstVon), geprueftVon: name(o.geprueftVon) })),
    zusammenhang: auswahl.map((s) => ({ ...s, woerter: verse.filter((v) => v.vers === s.vers).map((v) => ({ pos: v.pos, text: v.text })) })),
    vorher: i > 0 ? folge[i - 1] : null,
    naechste: i >= 0 && i < folge.length - 1 ? folge[i + 1] : null,
  };
  for (const b of bedeutungen) {
    if (b.sprache !== 'de' && b.sprache !== 'tr') continue;
    ergebnis.bedeutungen[b.sprache] = {
      id: b.id,
      sprache: b.sprache,
      bedeutung: b.bedeutung,
      wurzel: b.wurzel,
      anmerkung: b.anmerkung,
      status: b.freigabe,
      verfasstVonId: b.verfasstVon,
      verfasstVon: name(b.verfasstVon),
      geprueftVon: name(b.geprueftVon),
      geprueftAm: b.geprueftAm,
      aktualisiertAm: b.aktualisiertAm,
    };
  }
  return ergebnis;
}

// ————————————————————————————————————————— Tajwid

export type TajwidVerwaltung = {
  schluessel: string;
  familie: string;
  name: Mehrsprachig;
  kurz: Mehrsprachig | null;
  erklaerung: MehrsprachigRich | null;
  status: Status;
  verfasstVonId: string | null;
  verfasstVon: string | null;
  geprueftVon: string | null;
  geprueftAm: Date | null;
};

async function tajwidZeilen(wo?: SQL): Promise<TajwidVerwaltung[]> {
  const t = schema.tajwidRegel;
  const zeilen = await db.select().from(t).where(wo).orderBy(asc(t.sortierung), asc(t.schluessel));
  const wer = await namen(zeilen.flatMap((z) => [z.verfasstVon, z.geprueftVon]));
  const name = (id: string | null) => (id ? (wer.get(id) ?? null) : null);
  return zeilen.map((z) => ({
    schluessel: z.schluessel,
    familie: z.familie,
    name: z.name,
    kurz: z.kurz ?? null,
    erklaerung: z.erklaerung ?? null,
    status: z.freigabe,
    verfasstVonId: z.verfasstVon,
    verfasstVon: name(z.verfasstVon),
    geprueftVon: name(z.geprueftVon),
    geprueftAm: z.geprueftAm,
  }));
}

export const ladeTajwidVerwaltung = () => tajwidZeilen();
export async function ladeTajwidRegelVerwaltung(schluessel: string): Promise<TajwidVerwaltung | null> {
  return (await tajwidZeilen(eq(schema.tajwidRegel.schluessel, schluessel)))[0] ?? null;
}

// ————————————————————————————————————————— Hadith

export type HadithSammlungKurz = { id: string; version: string; lizenz: string; freigegeben: boolean; anzahl: number };
export type HadithUebersetzungZeile = {
  nummer: string;
  sprache: string;
  auszug: string;
  uebersetzer: string;
  status: Status;
  verfasstVon: string | null;
};
export const HADITH_FILTER = ['offen', 'zur_pruefung', 'geprueft', 'alle'] as const;
export type HadithFilter = (typeof HADITH_FILTER)[number];

async function sammlung(): Promise<HadithSammlungKurz | null> {
  const [s] = await db
    .select({ id: schema.hadithSammlung.id, version: schema.hadithSammlung.version, lizenz: schema.hadithSammlung.lizenz, freigegeben: schema.hadithSammlung.freigegeben })
    .from(schema.hadithSammlung)
    .where(eq(schema.hadithSammlung.id, BUKHARI))
    .limit(1);
  if (!s) return null;
  const [n] = await db.select({ n: count() }).from(schema.hadith).where(eq(schema.hadith.sammlungId, BUKHARI));
  return { ...s, anzahl: Number(n?.n ?? 0) };
}

/** Hadith-Übersetzungen der Sammlung mit Stand je Sprache und Liste nach Filter (höchstens 200). */
export async function ladeHadithVerwaltung(filter: HadithFilter): Promise<{
  sammlung: HadithSammlungKurz | null;
  zahlen: Record<string, StatusZahlen>;
  zeilen: HadithUebersetzungZeile[];
}> {
  const s = await sammlung();
  if (!s) return { sammlung: null, zahlen: {}, zeilen: [] };
  const hu = schema.hadithUebersetzung;
  const wo =
    filter === 'offen'
      ? ne(hu.freigabe, 'geprueft')
      : filter === 'alle'
        ? undefined
        : eq(hu.freigabe, filter);
  const [stand, zeilen] = await Promise.all([
    db
      .select({ sprache: hu.sprache, status: hu.freigabe, n: count() })
      .from(hu)
      .where(eq(hu.sammlungId, BUKHARI))
      .groupBy(hu.sprache, hu.freigabe),
    db
      .select({ nummer: hu.nummer, sprache: hu.sprache, text: hu.text, uebersetzer: hu.uebersetzer, status: hu.freigabe, von: hu.verfasstVon })
      .from(hu)
      .leftJoin(schema.hadith, and(eq(schema.hadith.sammlungId, hu.sammlungId), eq(schema.hadith.nummer, hu.nummer)))
      .where(and(eq(hu.sammlungId, BUKHARI), wo))
      .orderBy(asc(schema.hadith.sortierung), asc(hu.sprache))
      .limit(200),
  ]);
  const zahlen: Record<string, StatusZahlen> = {};
  for (const z of stand) (zahlen[z.sprache] ??= leer())[z.status] = Number(z.n);
  const wer = await namen(zeilen.map((z) => z.von));
  return {
    sammlung: s,
    zahlen,
    zeilen: zeilen.map((z) => ({
      nummer: z.nummer,
      sprache: z.sprache,
      auszug: auszug(z.text) ?? '',
      uebersetzer: z.uebersetzer,
      status: z.status,
      verfasstVon: z.von ? (wer.get(z.von) ?? null) : null,
    })),
  };
}

export type HadithUebersetzungVoll = {
  sprache: string;
  text: string;
  uebersetzer: string;
  quelle: string;
  lizenz: string;
  status: Status;
  verfasstVonId: string | null;
  verfasstVon: string | null;
  geprueftVon: string | null;
  geprueftAm: Date | null;
};

export type HadithDetail = {
  nummer: string;
  buchNr: number;
  imBuchNr: number | null;
  buchTitelEn: string | null;
  textAr: string;
  bewertung: string | null;
  bewertetVon: string | null;
  uebersetzungen: HadithUebersetzungVoll[];
  listen: HadithListe[];
};

/** Ein importierter Hadith mit allen Übersetzungen (alle Stände) und Listen, in denen er steht. */
export async function ladeHadithDetail(nummer: string): Promise<HadithDetail | null> {
  const [h] = await db
    .select({
      nummer: schema.hadith.nummer,
      buchNr: schema.hadith.buchNr,
      imBuchNr: schema.hadith.imBuchNr,
      textAr: schema.hadith.textAr,
      bewertung: schema.hadith.bewertung,
      bewertetVon: schema.hadith.bewertetVon,
      buchTitel: schema.hadithBuch.titel,
    })
    .from(schema.hadith)
    .leftJoin(schema.hadithBuch, and(eq(schema.hadithBuch.sammlungId, schema.hadith.sammlungId), eq(schema.hadithBuch.nr, schema.hadith.buchNr)))
    .where(and(eq(schema.hadith.sammlungId, BUKHARI), eq(schema.hadith.nummer, nummer)))
    .limit(1);
  if (!h) return null;
  const [ue, listen] = await Promise.all([
    db
      .select()
      .from(schema.hadithUebersetzung)
      .where(and(eq(schema.hadithUebersetzung.sammlungId, BUKHARI), eq(schema.hadithUebersetzung.nummer, nummer))),
    db
      .select({ liste: schema.hadithAuswahl.liste })
      .from(schema.hadithAuswahl)
      .where(and(eq(schema.hadithAuswahl.sammlungId, BUKHARI), eq(schema.hadithAuswahl.nummer, nummer))),
  ]);
  const wer = await namen(ue.flatMap((u) => [u.verfasstVon, u.geprueftVon]));
  const name = (id: string | null) => (id ? (wer.get(id) ?? null) : null);
  const rang = (s: string) => ['de', 'tr', 'en'].indexOf(s);
  return {
    nummer: h.nummer,
    buchNr: h.buchNr,
    imBuchNr: h.imBuchNr,
    buchTitelEn: h.buchTitel?.en ?? null,
    textAr: h.textAr,
    bewertung: h.bewertung,
    bewertetVon: h.bewertetVon,
    uebersetzungen: ue
      .map((u) => ({
        sprache: u.sprache,
        text: u.text,
        uebersetzer: u.uebersetzer,
        quelle: u.quelle,
        lizenz: u.lizenz,
        status: u.freigabe,
        verfasstVonId: u.verfasstVon,
        verfasstVon: name(u.verfasstVon),
        geprueftVon: name(u.geprueftVon),
        geprueftAm: u.geprueftAm,
      }))
      .sort((x, y) => rang(x.sprache) - rang(y.sprache)),
    listen: listen.map((l) => l.liste).filter((l): l is HadithListe => (HADITH_LISTEN as readonly string[]).includes(l)),
  };
}

/** Gibt es diesen Hadith im Import? (Listen und Übersetzungen nur als Verweis auf importierte Hadithe.) */
export async function hadithVorhanden(nummer: string): Promise<boolean> {
  const [h] = await db
    .select({ n: schema.hadith.nummer })
    .from(schema.hadith)
    .where(and(eq(schema.hadith.sammlungId, BUKHARI), eq(schema.hadith.nummer, nummer)))
    .limit(1);
  return Boolean(h);
}

export type ListenEintrag = {
  nummer: string;
  buchNr: number;
  imBuchNr: number | null;
  /** Anfang des arabischen Texts aus dem Import (zum Wiedererkennen). */
  anfangAr: string;
  /** Sprachen mit geprüfter Übersetzung */
  geprueft: string[];
};

const ANFANG = 160;

/** Beide kuratierten Listen in ihrer Reihenfolge. */
export async function ladeHadithListen(): Promise<Record<HadithListe, ListenEintrag[]>> {
  const a = schema.hadithAuswahl;
  const zeilen = await db
    .select({
      liste: a.liste,
      nummer: a.nummer,
      buchNr: schema.hadith.buchNr,
      imBuchNr: schema.hadith.imBuchNr,
      textAr: schema.hadith.textAr,
    })
    .from(a)
    .innerJoin(schema.hadith, and(eq(schema.hadith.sammlungId, a.sammlungId), eq(schema.hadith.nummer, a.nummer)))
    .where(and(eq(a.sammlungId, BUKHARI), inArray(a.liste, [...HADITH_LISTEN])))
    .orderBy(asc(a.liste), asc(a.reihenfolge), asc(schema.hadith.sortierung));
  const nummern = [...new Set(zeilen.map((z) => z.nummer))];
  const geprueft = nummern.length
    ? await db
        .select({ nummer: schema.hadithUebersetzung.nummer, sprache: schema.hadithUebersetzung.sprache })
        .from(schema.hadithUebersetzung)
        .where(
          and(
            eq(schema.hadithUebersetzung.sammlungId, BUKHARI),
            eq(schema.hadithUebersetzung.freigabe, 'geprueft'),
            inArray(schema.hadithUebersetzung.nummer, nummern),
          ),
        )
    : [];
  const ergebnis = Object.fromEntries(HADITH_LISTEN.map((l) => [l, [] as ListenEintrag[]])) as Record<HadithListe, ListenEintrag[]>;
  for (const z of zeilen) {
    const zeichen = Array.from(z.textAr);
    ergebnis[z.liste as HadithListe].push({
      nummer: z.nummer,
      buchNr: z.buchNr,
      imBuchNr: z.imBuchNr,
      anfangAr: zeichen.length > ANFANG ? `${zeichen.slice(0, ANFANG).join('')}…` : z.textAr,
      geprueft: geprueft.filter((g) => g.nummer === z.nummer).map((g) => g.sprache),
    });
  }
  return ergebnis;
}

/** Nummern einer Liste in Reihenfolge (für Verschieben). */
export async function listenNummern(liste: HadithListe): Promise<string[]> {
  const zeilen = await db
    .select({ nummer: schema.hadithAuswahl.nummer })
    .from(schema.hadithAuswahl)
    .where(and(eq(schema.hadithAuswahl.liste, liste), eq(schema.hadithAuswahl.sammlungId, BUKHARI)))
    .orderBy(asc(schema.hadithAuswahl.reihenfolge), asc(schema.hadithAuswahl.nummer));
  return zeilen.map((z) => z.nummer);
}

/** Jüngste Einträge des Freigabe-Verlaufs zu einem Inhalt (wer hat wann eingereicht, geprüft, zurückgewiesen). */
export type VerlaufEintrag = { status: Status; am: Date; von: string | null; kommentar: string | null };
export async function ladeVerlauf(art: ReligioeseArt | 'quran_ausgabe', kennung: string, grenze = 8): Promise<VerlaufEintrag[]> {
  if (art !== 'quran_ausgabe' && !RELIGIOESE_ARTEN.includes(art)) return [];
  const f = schema.freigabe;
  const zeilen = await db
    .select({ status: f.status, am: f.am, von: f.von, kommentar: f.kommentar })
    .from(f)
    .where(and(eq(f.inhaltTyp, art), eq(f.inhaltId, kennung)))
    .orderBy(desc(f.am), desc(f.id))
    .limit(grenze);
  const wer = await namen(zeilen.map((z) => z.von));
  return zeilen.map((z) => ({ ...z, von: z.von ? (wer.get(z.von) ?? null) : null }));
}
