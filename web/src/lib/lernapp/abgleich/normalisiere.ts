/**
 * Antwortabgleich der Lern-App (PLAN §4.1) – Grundschritte für alle Sprachen. Rein, ohne Abhängigkeiten; läuft im
 * Spieler-Chunk und in Unit-Tests.
 *
 * Zwei Stufen:
 * - `bereite` vereinheitlicht, ohne die Schreibung zu ändern (NFC, Steuerzeichen weg, Apostrophe gleich, Satzzeichen und
 *   Leerraum vereinheitlicht). Die Groß- und Kleinschreibung bleibt für die Prüfung „Großschreibung“ (de) erhalten.
 * - `normalisiere` ergibt die Vergleichsform: dazu Kleinschreibung je Sprache und die stillen Vereinheitlichungen der
 *   Sprache (ohne Hinweis, z. B. Harakat im Arabischen). Abweichungen, die einen Hinweis verdienen (ß/ss, Umlaut-Ersatz,
 *   türkische Sonderbuchstaben, Alif maqsura, Taa marbuta), sind „Lockerungen“ und stehen in den Sprachregeln.
 *
 * Arabische Zeichen stehen hier und in den Sprachregeln nur als Codepunkt-Escapes (KERN §3, ADR 0040).
 */

import type { Sprache } from '../kurse';

/** Sprachen der Lern-App: Typ und Liste aus `kurse.ts` (eine Quelle für alle Pakete). */
export { SPRACHEN, type Sprache } from '../kurse';

/** Schlüssel der Hinweise; Texte unter `spieler.hinweis.<schluessel>` in `messages/lernapp/*.json`. */
export type HinweisSchluessel =
  | 'leer'
  | 'tippfehler'
  | 'leerzeichen'
  | 'apostroph'
  | 'grossschreibung'
  | 'eszett'
  | 'umlaut'
  | 'sonderzeichen'
  | 'alifMaqsura'
  | 'taMarbuta'
  | 'harakat';

export const HINWEIS_SCHLUESSEL: readonly HinweisSchluessel[] = [
  'leer',
  'tippfehler',
  'leerzeichen',
  'apostroph',
  'grossschreibung',
  'eszett',
  'umlaut',
  'sonderzeichen',
  'alifMaqsura',
  'taMarbuta',
  'harakat',
];

/** Hinweise, die das Urteil nicht mindern (nur Auskunft, Urteil bleibt „richtig“). */
export const AUSKUNFT_HINWEISE: ReadonlySet<HinweisSchluessel> = new Set<HinweisSchluessel>(['apostroph']);

/** Unsichtbare Zeichen: weiches Trennzeichen, arabische Buchstabenmarke, Null-Breite, Richtungsmarken, BOM. */
const STEUERZEICHEN = /[\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
/** Apostroph-Varianten → `'` (typografisch, Akzente, Modifikator-Buchstaben, Hochkomma). */
const APOSTROPHE = /[\u2018\u2019\u201B\u2032\u02BC\u02B9\u00B4`]/g;
/**
 * Satzzeichen werden zu Leerraum: lateinische Satzzeichen, Anführungen, Klammern, Striche, Schrägstriche sowie das
 * arabische Komma, Semikolon, Fragezeichen und der arabische Punkt.
 */
const SATZZEICHEN = /[.,;:!?¿¡"„“”‚«»‹›()[\]{}…\u2010-\u2015\-/\\|*_~·\u060C\u061B\u061F\u06D4]/g;
/** Ziffern östlich-arabisch und persisch → westlich (still, alle Sprachen). */
const OESTLICHE_ZIFFERN = /[\u0660-\u0669\u06F0-\u06F9]/g;

function westlicheZiffer(z: string): string {
  const c = z.charCodeAt(0);
  return String(c >= 0x06f0 ? c - 0x06f0 : c - 0x0660);
}

/** Leerraum zusammenfassen; Apostrophe am Rand eines Wortes gelten als Anführungszeichen und fallen weg. */
function vereinheitlicheLeerraum(text: string): string {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ''))
    .filter(Boolean)
    .join(' ');
}

/** Vereinheitlichung ohne Änderung der Schreibung (Groß/Klein bleibt). */
export function bereite(text: string): string {
  const ohneSteuer = text.replace(STEUERZEICHEN, '').normalize('NFC');
  return vereinheitlicheLeerraum(ohneSteuer.replace(APOSTROPHE, "'").replace(SATZZEICHEN, ' ').replace(OESTLICHE_ZIFFERN, westlicheZiffer));
}

/** Wörter einer vorbereiteten Zeichenkette (Leerzeichen getrennt). */
export function woerter(text: string): string[] {
  return text === '' ? [] : text.split(' ');
}

/** Eine Lockerung: Abweichung, die mit Hinweis angenommen wird. Wirkt auf ein normalisiertes Wort. */
export type Lockerung = { hinweis: HinweisSchluessel; wende: (wort: string) => string };

/** Für alle Sprachen: fehlender oder zusätzlicher Apostroph (z. B. Eigennamen im Türkischen) – nur Auskunft. */
export const APOSTROPH_LOCKERUNG: Lockerung = { hinweis: 'apostroph', wende: (w) => w.replace(/'/g, '') };

/** Regeln einer Sprache (de.ts, tr.ts, ar.ts). */
export type SprachRegeln = {
  sprache: Sprache;
  /** Kleinschreibung nach den Regeln der Sprache. */
  klein: (text: string) => string;
  /** Stille Vereinheitlichung ohne Hinweis; `streng` nur für die Übung `harakat` (Vokalzeichen zählen). */
  still: (text: string, streng: boolean) => string;
  /** Lockerungen mit Hinweis (ohne den allgemeinen Apostroph). */
  lockerungen: readonly Lockerung[];
  /** Zusätzliche Prüfung auf den Wörtern in Originalschreibung (nur angenommene Paare gleicher Länge). */
  pruefeSchreibung?: (antwort: readonly string[], loesung: readonly string[]) => HinweisSchluessel[];
};

/**
 * Vergleichsform: `bereite`, Kleinschreibung und stille Regeln der Sprache. Idempotent:
 * `normalisiereMit(normalisiereMit(x)) === normalisiereMit(x)` (Eigenschaftstest).
 */
export function normalisiereMit(text: string, regeln: SprachRegeln, streng = false): string {
  const klein = regeln.klein(bereite(text)).normalize('NFC');
  return vereinheitlicheLeerraum(regeln.still(klein, streng).normalize('NFC'));
}
