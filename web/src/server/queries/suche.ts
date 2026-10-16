import 'server-only';
import { sql, type SQL } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { BUKHARI, enthaeltArabisch, hadithNummerAus, suchAusschnitt, teilVon, type Ausschnitt } from '@/lib/hadith/anzeige';
import { normalisiereArabisch } from '@/lib/hadith/import';
import { sucheHadithNummer, sucheTitel, type FesteSeite, type TitelTreffer } from '@/lib/suche/titelindex';
import { ladeSuchIndex } from './suchindex';

/**
 * Volltextsuche (ADR 0013, D-S1): PostgreSQL-tsvector je Sprache (generierte Spalten `suche_de|tr|en` aus `klartext`),
 * Abfrage mit `websearch_to_tsquery` (parametrisiert, versteht „Wort1 Wort2“, "Phrase" und -Ausschluss), nur sichtbare
 * Inhalte. Ausschnitte über `ts_headline` mit eigenen Steuerzeichen – die Seite setzt daraus <mark>-Elemente zusammen,
 * es wird nie HTML aus der Datenbank ausgegeben. Gecacht je Begriff und Sprache; Änderungen in der Verwaltung leeren
 * den Cache über die Inhalts-Tags.
 */
export type SuchArt = 'nachricht' | 'veranstaltung' | 'wissen';
export type SuchTreffer = { art: SuchArt; slug: string; titel: string; ausschnitt: string; rang: number };

export const SUCHE_MAX_LAENGE = 100;
/** Steuerzeichen für Treffer im Ausschnitt (kommen in Inhalten nicht vor). */
export const MARKE_AN = '\u0002';
export const MARKE_AUS = '\u0003';

const KONFIG = { de: 'german', tr: 'turkish', en: 'english' } as const;
type Sprache = keyof typeof KONFIG;

/**
 * Teilwort-Abgleich für genau ein Suchwort (ab 3 Zeichen, ohne Leerzeichen, Phrase oder Ausschluss): Die Volltextsuche
 * zerlegt keine zusammengesetzten Wörter – „Gebet“ fände „Freitagsgebet“ oder „Gebetsraum“ nicht (Funktionsliste F-14).
 * Solche Treffer kommen mit Rang 0 nach den Volltext-Treffern. Platzhalter der Eingabe (`%`, `_`, `\`) sind maskiert.
 */
export function teilwortMuster(q: string): string | null {
  if (q.length < 3 || /\s|"|^-/.test(q)) return null;
  return `%${q.replace(/[\\%_]/g, (z) => `\\${z}`)}%`;
}

function teil(art: SuchArt, tabelle: string, sprache: Sprache, frage: SQL, sichtbar: SQL, muster: string | null): SQL {
  const spalte = sql.raw(`suche_${sprache}`);
  const titel = sql`coalesce(${sql.raw(tabelle)}.titel->>${sprache}, ${sql.raw(tabelle)}.titel->>'de')`;
  const text = sql`coalesce(${sql.raw(tabelle)}.klartext->>${sprache}, ${sql.raw(tabelle)}.klartext->>'de', '')`;
  const volltext = sql`${sql.raw(tabelle)}.${spalte} @@ ${frage}`;
  const trifft = muster ? sql`(${volltext} or ${titel} ilike ${muster} or ${text} ilike ${muster})` : volltext;
  return sql`select ${art} as art, ${sql.raw(tabelle)}.slug as slug, ${titel} as titel,
    ts_headline(${sql.raw(`'${KONFIG[sprache]}'`)}::regconfig, ${text}, ${frage},
      ${`StartSel=${MARKE_AN}, StopSel=${MARKE_AUS}, MaxWords=28, MinWords=12, MaxFragments=1, FragmentDelimiter=" … "`}) as ausschnitt,
    ts_rank(${sql.raw(tabelle)}.${spalte}, ${frage}) as rang
    from ${sql.raw(tabelle)} where ${trifft} and ${sichtbar}`;
}

/** Bereinigt die Eingabe (Länge, Steuerzeichen); leer = keine Suche. */
export function bereinigeSuche(roh: unknown): string {
  if (typeof roh !== 'string') return '';
  return roh
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SUCHE_MAX_LAENGE);
}

export async function suche(begriff: string, sprache: Sprache): Promise<SuchTreffer[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.nachrichten, TAG.veranstaltungen, TAG.wissen);
  const q = bereinigeSuche(begriff);
  // Beispielmodus ohne Datenbank (ADR 0019): keine Treffer statt Absturz
  if (q.length < 2 || !datenbankVerfuegbar()) return [];
  const frage = sql`websearch_to_tsquery(${sql.raw(`'${KONFIG[sprache]}'`)}::regconfig, ${q})`;
  const muster = teilwortMuster(q);
  const veroeffentlicht = (t: string) => sql`${sql.raw(t)}.status = 'veroeffentlicht' and ${sql.raw(t)}.im_papierkorb_seit is null`;
  const anfrage = sql`select * from (
    ${teil('nachricht', 'nachricht', sprache, frage, sql`${veroeffentlicht('nachricht')} and nachricht.veroeffentlicht_am <= now()`, muster)}
    union all
    ${teil('veranstaltung', 'veranstaltung', sprache, frage, veroeffentlicht('veranstaltung'), muster)}
    union all
    ${teil('wissen', 'wissen_thema', sprache, frage, sql`${veroeffentlicht('wissen_thema')} and wissen_thema.freigabe = 'geprueft'`, muster)}
  ) as treffer order by rang desc, titel asc limit 30`;
  const ergebnis = await db.execute<{ art: SuchArt; slug: string; titel: string; ausschnitt: string; rang: number | string }>(anfrage);
  const zeilen =
    'rows' in ergebnis
      ? ergebnis.rows
      : (ergebnis as unknown as { art: SuchArt; slug: string; titel: string; ausschnitt: string; rang: number | string }[]);
  return zeilen.map((z) => ({ art: z.art, slug: z.slug, titel: z.titel, ausschnitt: z.ausschnitt ?? '', rang: Number(z.rang) }));
}

/** Treffer der Hadith-Suche: Bezug und Ausschnitt aus dem unveränderten arabischen Text (Trefferwörter markiert). */
export type HadithTreffer = { nummer: string; buchNr: number; imBuchNr: number | null; teil: number; ausschnitt: Ausschnitt; rang: number };

type HadithZeile = {
  nummer: string;
  buch_nr: number;
  im_buch_nr: number | null;
  text_ar: string;
  position: number | string;
  rang: number | string;
};

/** Position im Buch (0-basiert) für den Teil, auf dem der Treffer steht. */
const POSITION = sql`(select count(*) from hadith as frueher where frueher.sammlung_id = h.sammlung_id
  and frueher.buch_nr = h.buch_nr and frueher.sortierung < h.sortierung) as position`;

/**
 * Hadith-Suche (AUFTRAG 3.3, Filter „Hadith“ in /suche): Volltext über `hadith.suche` (tsvector 'simple' aus dem Text
 * ohne Harakat und Tatweel). Die Eingabe wird genauso normalisiert (`normalisiereArabisch`) und mit `plainto_tsquery`
 * parametrisiert abgefragt – mit oder ohne Vokalzeichen findet sie dieselben Hadithe. Eine reine Nummer („1“, „402.2“,
 * „Bukhari 7“) findet den Hadith direkt. Ohne arabische Buchstaben und ohne Nummer keine Abfrage. Ob die Suche
 * angeboten wird (Schalter `hadith_gesamt`), entscheidet die Seite.
 */
export async function sucheHadith(begriff: string): Promise<HadithTreffer[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(TAG.hadith);
  const q = bereinigeSuche(begriff);
  const nummer = hadithNummerAus(q);
  const normalisiert = normalisiereArabisch(q);
  if (!nummer && (normalisiert.length < 2 || !enthaeltArabisch(normalisiert))) return [];
  if (!datenbankVerfuegbar()) return [];
  const anfrage = nummer
    ? sql`select h.nummer, h.buch_nr, h.im_buch_nr, h.text_ar, ${POSITION}, 1 as rang
        from hadith as h where h.sammlung_id = ${BUKHARI} and h.nummer = ${nummer}`
    : sql`select h.nummer, h.buch_nr, h.im_buch_nr, h.text_ar, ${POSITION},
          ts_rank(h.suche, plainto_tsquery('simple', ${normalisiert})) as rang
        from hadith as h where h.sammlung_id = ${BUKHARI} and h.suche @@ plainto_tsquery('simple', ${normalisiert})
        order by rang desc, h.sortierung asc limit 30`;
  const ergebnis = await db.execute<HadithZeile>(anfrage);
  const zeilen = 'rows' in ergebnis ? ergebnis.rows : (ergebnis as unknown as HadithZeile[]);
  return zeilen.map((z) => ({
    nummer: z.nummer,
    buchNr: Number(z.buch_nr),
    imBuchNr: z.im_buch_nr === null ? null : Number(z.im_buch_nr),
    teil: teilVon(Number(z.position)),
    ausschnitt: suchAusschnitt(z.text_ar, nummer ? '' : normalisiert),
    rang: Number(z.rang),
  }));
}

/**
 * Ergebnis der Seite /suche je Betriebsart (Endprüfung Stufe C: ohne Datenbank stand live immer „Keine Treffer“):
 * - `datenbank`: Volltext und Hadith-Suche wie bisher (`suche`, `sucheHadith`) – unverändert, sobald eine Datenbank da ist;
 * - `titel`: ohne Laufzeit-Datenbank die Titel aus dem beim Bau erzeugten Index (`titelindex.ts`) und die Nummernsuche
 *   der Hadithe – ehrlich als Titel-Suche ausgewiesen;
 * - `ohne`: weder Datenbank noch Index – die Seite sagt, dass die Suche hier noch nicht läuft.
 * `hadithFilter`: Ob der Filter „Hadith“ Ergebnisse liefern kann (Schalter an und – ohne Datenbank – Nummern im Index).
 */
export type SuchErgebnis =
  | { modus: 'datenbank'; hadithFilter: boolean; treffer: SuchTreffer[]; hadith: HadithTreffer[] }
  | { modus: 'titel'; hadithFilter: boolean; titel: TitelTreffer[]; hadith: HadithTreffer[] }
  | { modus: 'ohne'; hadithFilter: false };

export async function sucheFuerSeite(eingabe: {
  begriff: string;
  sprache: Sprache;
  /** Schalter `hadith_gesamt` */
  hadithAn: boolean;
  /** Filter „Hadith“ gewählt */
  nurHadith: boolean;
  /** Feste Seiten aus dem Menü (nur ohne Datenbank; mit Datenbank sucht der Volltext wie bisher) */
  feste?: () => FesteSeite[] | Promise<FesteSeite[]>;
}): Promise<SuchErgebnis> {
  const { begriff, sprache, hadithAn } = eingabe;
  if (datenbankVerfuegbar()) {
    const nurHadith = hadithAn && eingabe.nurHadith;
    const [treffer, hadith] =
      begriff.length >= 2 ? await Promise.all([nurHadith ? [] : suche(begriff, sprache), hadithAn ? sucheHadith(begriff) : []]) : [[], []];
    return { modus: 'datenbank', hadithFilter: hadithAn, treffer, hadith };
  }
  const index = await ladeSuchIndex();
  if (!index) return { modus: 'ohne', hadithFilter: false };
  const hadithFilter = hadithAn && index.hadith !== null;
  const nurHadith = hadithFilter && eingabe.nurHadith;
  if (begriff.length < 2) return { modus: 'titel', hadithFilter, titel: [], hadith: [] };
  return {
    modus: 'titel',
    hadithFilter,
    titel: nurHadith ? [] : sucheTitel(index, begriff, sprache, (await eingabe.feste?.()) ?? []),
    hadith: hadithFilter ? sucheHadithNummer(index, begriff) : [],
  };
}
