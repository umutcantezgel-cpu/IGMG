import 'server-only';
import { sql, type SQL } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { TAG } from '@/lib/cache/tags';
import { db } from '@/lib/db';

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
  if (q.length < 2) return [];
  const frage = sql`websearch_to_tsquery(${sql.raw(`'${KONFIG[sprache]}'`)}::regconfig, ${q})`;
  const muster = teilwortMuster(q);
  const veroeffentlicht = (t: string) => sql`${sql.raw(t)}.status = 'veroeffentlicht' and ${sql.raw(t)}.im_papierkorb_seit is null`;
  const anfrage = sql`select * from (
    ${teil('nachricht', 'nachricht', sprache, frage, sql`${veroeffentlicht('nachricht')} and nachricht.veroeffentlicht_am <= now()`, muster)}
    union all
    ${teil('veranstaltung', 'veranstaltung', sprache, frage, veroeffentlicht('veranstaltung'), muster)}
    union all
    ${teil('wissen', 'wissen_thema', sprache, frage, veroeffentlicht('wissen_thema'), muster)}
  ) as treffer order by rang desc, titel asc limit 30`;
  const ergebnis = await db.execute<{ art: SuchArt; slug: string; titel: string; ausschnitt: string; rang: number | string }>(anfrage);
  const zeilen =
    'rows' in ergebnis
      ? ergebnis.rows
      : (ergebnis as unknown as { art: SuchArt; slug: string; titel: string; ausschnitt: string; rang: number | string }[]);
  return zeilen.map((z) => ({ art: z.art, slug: z.slug, titel: z.titel, ausschnitt: z.ausschnitt ?? '', rang: Number(z.rang) }));
}
