import 'server-only';
import type { JSONContent } from '@tiptap/core';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';
import { gueltigeBloecke } from '@/lib/validierung/bloecke';

/**
 * Freigaben (ADR 0030, ADR 0032): Warteschlange aller Inhalte „zur Prüfung“ – freie Seiten (Antrag im Verlauf
 * `freigabe`, redaktionell oder religiös) und religiöse Inhalte mit eigener Freigabespalte (Wortbedeutungen,
 * Tajwid-Regeln, Hadith-Übersetzungen, Elifbe-Lektionen, besondere Tage). Ungecacht; Aufrufer prüfen `freigabe.lesen`.
 * Die Texte stammen von Menschen bzw. aus importierten Quellen und werden hier nur angezeigt.
 */
export const RELIGIOESE_TYPEN = [
  'quran_wortbedeutung',
  'quran_wortbedeutung_ort',
  'tajwid_regel',
  'hadith_uebersetzung',
  'elifbe_lektion',
  'besonderer_tag',
] as const;
export type ReligioeserTyp = (typeof RELIGIOESE_TYPEN)[number];
export type FreigabeTyp = 'seite' | ReligioeserTyp;
export const FREIGABE_TYPEN = ['seite', ...RELIGIOESE_TYPEN] as const;

/** Angabe in der Karte: `label` ist ein Schlüssel unter `verwaltung.freigaben.angabe`. */
export type FreigabeAngabe = { label: string; wert: string; lang?: string; dir?: 'rtl'; lang2?: boolean };

export type FreigabeEintrag = {
  inhaltTyp: FreigabeTyp;
  inhaltId: string;
  art: 'redaktion' | 'religioes';
  titel: string;
  angaben: FreigabeAngabe[];
  /** Ausführlicher Text (Tiptap-JSON) zum Lesen vor der Entscheidung. */
  text: JSONContent | null;
  eingereichtAm: Date | null;
  eingereichtVon: string | null;
  organisation: OrganisationKuerzel | null;
};

const GRENZE = 200;

async function namen(ids: readonly (string | null | undefined)[]): Promise<Map<string, string>> {
  const eindeutig = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (!eindeutig.length) return new Map();
  const zeilen = await db
    .select({ id: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .where(inArray(schema.user.id, eindeutig));
  return new Map(zeilen.map((z) => [z.id, z.name]));
}

/** Offene Anträge freier Seiten: letzter Verlaufseintrag je Seite mit Status „zur_pruefung“. */
async function offeneSeiten(): Promise<FreigabeEintrag[]> {
  const f = schema.freigabe;
  const letzte = await db
    .selectDistinctOn([f.inhaltId], { inhaltId: f.inhaltId, art: f.art, status: f.status, am: f.am, von: f.von })
    .from(f)
    .where(eq(f.inhaltTyp, 'seite'))
    .orderBy(f.inhaltId, desc(f.am), desc(f.id));
  const offen = letzte.filter((z) => z.status === 'zur_pruefung').slice(0, GRENZE);
  if (!offen.length) return [];
  const seiten = await db
    .select()
    .from(schema.seite)
    .where(
      and(
        inArray(
          schema.seite.id,
          offen.map((o) => o.inhaltId),
        ),
        isNull(schema.seite.imPapierkorbSeit),
      ),
    );
  const nachId = new Map(seiten.map((s) => [s.id, s]));
  const wer = await namen(offen.map((o) => o.von));
  return offen.flatMap((o): FreigabeEintrag[] => {
    const s = nachId.get(o.inhaltId);
    if (!s) return [];
    const bloecke = gueltigeBloecke(s.bloecke);
    const angaben: FreigabeAngabe[] = [{ label: 'adresse', wert: `/${s.slugDe}` }];
    for (const b of bloecke) {
      if (b.typ === 'vers') angaben.push({ label: 'vers', wert: `${b.sure}:${b.von}–${b.bis}` });
      if (b.typ === 'hadith') angaben.push({ label: 'hadith', wert: `${b.sammlung} ${b.nummer}` });
    }
    angaben.push({ label: 'bausteine', wert: String(bloecke.length) });
    return [
      {
        inhaltTyp: 'seite',
        inhaltId: s.id,
        art: o.art,
        titel: s.titel.de,
        angaben,
        text: null,
        eingereichtAm: o.am,
        eingereichtVon: o.von ? (wer.get(o.von) ?? null) : null,
        organisation: s.organisation,
      },
    ];
  });
}

async function offeneReligioese(): Promise<FreigabeEintrag[]> {
  const offen = 'zur_pruefung' as const;
  const wb = schema.quranWortbedeutung;
  const wbo = schema.quranWortbedeutungOrt;
  const tr = schema.tajwidRegel;
  const hu = schema.hadithUebersetzung;
  const el = schema.elifbeLektion;
  const bt = schema.besondererTag;
  const [bedeutungen, orte, regeln, hadithe, lektionen, tage] = await Promise.all([
    db
      .select({
        id: wb.id,
        sprache: wb.sprache,
        bedeutung: wb.bedeutung,
        wurzel: wb.wurzel,
        anmerkung: wb.anmerkung,
        von: wb.verfasstVon,
        wort: schema.quranWortform.textAr,
      })
      .from(wb)
      .innerJoin(schema.quranWortform, eq(schema.quranWortform.id, wb.formId))
      .where(eq(wb.freigabe, offen))
      .limit(GRENZE),
    db.select().from(wbo).where(eq(wbo.freigabe, offen)).limit(GRENZE),
    db.select().from(tr).where(eq(tr.freigabe, offen)).limit(GRENZE),
    db.select().from(hu).where(eq(hu.freigabe, offen)).limit(GRENZE),
    db.select().from(el).where(eq(el.freigabe, offen)).limit(GRENZE),
    db.select().from(bt).where(eq(bt.freigabe, offen)).limit(GRENZE),
  ]);
  const wer = await namen([
    ...bedeutungen.map((z) => z.von),
    ...orte.map((z) => z.verfasstVon),
    ...regeln.map((z) => z.verfasstVon),
    ...hadithe.map((z) => z.verfasstVon),
    ...lektionen.map((z) => z.verfasstVon),
    ...tage.map((z) => z.verfasstVon),
  ]);
  const name = (id: string | null) => (id ? (wer.get(id) ?? null) : null);
  const basis = { art: 'religioes' as const, eingereichtAm: null, organisation: null, text: null };
  return [
    ...bedeutungen.map((z): FreigabeEintrag => ({
      ...basis,
      inhaltTyp: 'quran_wortbedeutung',
      inhaltId: z.id,
      titel: z.wort,
      angaben: [
        { label: 'wort', wert: z.wort, lang: 'ar', dir: 'rtl' },
        { label: 'sprache', wert: z.sprache },
        { label: 'bedeutung', wert: z.bedeutung, lang: z.sprache },
        ...(z.wurzel ? [{ label: 'wurzel', wert: z.wurzel, lang: 'ar', dir: 'rtl' as const }] : []),
        ...(z.anmerkung ? [{ label: 'anmerkung', wert: z.anmerkung }] : []),
      ],
      eingereichtVon: name(z.von),
    })),
    ...orte.map((z): FreigabeEintrag => ({
      ...basis,
      inhaltTyp: 'quran_wortbedeutung_ort',
      inhaltId: `${z.sure}|${z.vers}|${z.pos}|${z.sprache}`,
      titel: `${z.sure}:${z.vers} · ${z.pos}`,
      angaben: [
        { label: 'stelle', wert: `${z.sure}:${z.vers} · ${z.pos}` },
        { label: 'sprache', wert: z.sprache },
        { label: 'bedeutung', wert: z.bedeutung, lang: z.sprache },
      ],
      eingereichtVon: name(z.verfasstVon),
    })),
    ...regeln.map((z): FreigabeEintrag => ({
      ...basis,
      inhaltTyp: 'tajwid_regel',
      inhaltId: z.schluessel,
      titel: z.name.de,
      angaben: [{ label: 'schluessel', wert: z.schluessel }, ...(z.kurz?.de ? [{ label: 'kurz', wert: z.kurz.de }] : [])],
      text: z.erklaerung?.de ?? null,
      eingereichtVon: name(z.verfasstVon),
    })),
    ...hadithe.map((z): FreigabeEintrag => ({
      ...basis,
      inhaltTyp: 'hadith_uebersetzung',
      inhaltId: `${z.sammlungId}|${z.nummer}|${z.sprache}`,
      titel: `${z.sammlungId} ${z.nummer}`,
      angaben: [
        { label: 'sprache', wert: z.sprache },
        { label: 'uebersetzung', wert: z.text, lang: z.sprache },
        { label: 'uebersetzer', wert: z.uebersetzer },
        { label: 'quelle', wert: `${z.quelle} · ${z.lizenz}` },
      ],
      eingereichtVon: name(z.verfasstVon),
    })),
    ...lektionen.map((z): FreigabeEintrag => ({
      ...basis,
      inhaltTyp: 'elifbe_lektion',
      inhaltId: z.id,
      titel: `${z.nr} · ${z.titel.de}`,
      angaben: z.ziel?.de ? [{ label: 'ziel', wert: z.ziel.de }] : [],
      text: z.inhalt?.de ?? null,
      eingereichtVon: name(z.verfasstVon),
    })),
    ...tage.map((z): FreigabeEintrag => ({
      ...basis,
      inhaltTyp: 'besonderer_tag',
      inhaltId: z.id,
      titel: z.titel.de,
      angaben: [
        { label: 'datum', wert: z.datum },
        { label: 'tagArt', wert: z.art },
      ],
      text: z.beschreibung?.de ?? null,
      eingereichtVon: name(z.verfasstVon),
    })),
  ];
}

/** Alle offenen Prüfungen: religiöse zuerst, dann redaktionelle; je Art die ältesten Anträge zuerst. */
export async function ladeWarteschlange(): Promise<FreigabeEintrag[]> {
  const [seiten, religioes] = await Promise.all([offeneSeiten(), offeneReligioese()]);
  const alle = [...seiten, ...religioes];
  const zeit = (e: FreigabeEintrag) => e.eingereichtAm?.getTime() ?? 0;
  return alle.sort((a, b) => (a.art === b.art ? zeit(a) - zeit(b) : a.art === 'religioes' ? -1 : 1));
}

export type VerlaufZeile = {
  id: string;
  inhaltTyp: string;
  inhaltId: string;
  titel: string | null;
  art: 'redaktion' | 'religioes';
  status: 'entwurf' | 'zur_pruefung' | 'geprueft';
  am: Date;
  von: string | null;
  kommentar: string | null;
};

/** Letzte Einträge des Freigabe-Verlaufs (neueste zuerst); Titel nur für freie Seiten. */
export async function ladeVerlauf(grenze = 50): Promise<VerlaufZeile[]> {
  const f = schema.freigabe;
  const zeilen = await db
    .select({
      id: f.id,
      inhaltTyp: f.inhaltTyp,
      inhaltId: f.inhaltId,
      art: f.art,
      status: f.status,
      am: f.am,
      von: schema.user.name,
      kommentar: f.kommentar,
    })
    .from(f)
    .leftJoin(schema.user, eq(schema.user.id, f.von))
    .orderBy(desc(f.am), desc(f.id))
    .limit(grenze);
  const seitenIds = [...new Set(zeilen.filter((z) => z.inhaltTyp === 'seite').map((z) => z.inhaltId))].filter((id) =>
    /^[0-9a-f-]{36}$/.test(id),
  );
  const titel = seitenIds.length
    ? new Map(
        (
          await db.select({ id: schema.seite.id, titel: schema.seite.titel }).from(schema.seite).where(inArray(schema.seite.id, seitenIds))
        ).map((s) => [s.id, s.titel.de]),
      )
    : new Map<string, string>();
  return zeilen.map((z) => ({ ...z, titel: z.inhaltTyp === 'seite' ? (titel.get(z.inhaltId) ?? null) : null }));
}
