/**
 * Elifbe-Lektionen als Stationen nach der Systematik des Elifbâ-Unterrichts (Diyanet): erst die Buchstaben und ihre
 * Formen, dann die Lesezeichen Schritt für Schritt. Die Silbentafeln werden aus Codepunkten berechnet (`silben.ts`).
 *
 * Platzhalter (MENSCHEN MN-07): Reihenfolge, Zuschnitt und Ziele der Lektionen bestätigt die Hoca. Erklärtexte stehen
 * nicht hier – sie kommen nach der religiösen Freigabe aus `elifbe_lektion` (Status „geprueft“); bis dahin zeigt die
 * Seite einen ehrlichen Platzhalter. Titel sind Fachbegriffe (Namen der Lesezeichen) in `messages/bereiche/elifbe.json`.
 */
import { BUCHSTABEN, type Buchstabe } from './alphabet';
import type { SilbenArt } from './silben';

export type Lektion = {
  nr: number;
  /** Adresse (`/elifbe/lektion/[lektion]`), gleich der Nummer. */
  slug: string;
  /** Schlüssel der Texte unter `elifbe.lektionen.<schluessel>`. */
  schluessel: string;
  /** Spalten der Silbentafel. */
  arten: readonly SilbenArt[];
  /** Buchstaben der Lektion (Slugs); leer = alle 29. */
  buchstaben: readonly string[];
};

export const LEKTIONEN: readonly Lektion[] = [
  { nr: 1, slug: '1', schluessel: 'fatha', arten: ['fatha'], buchstaben: [] },
  { nr: 2, slug: '2', schluessel: 'kasra', arten: ['kasra'], buchstaben: [] },
  { nr: 3, slug: '3', schluessel: 'damma', arten: ['damma'], buchstaben: [] },
  { nr: 4, slug: '4', schluessel: 'harakat', arten: ['fatha', 'kasra', 'damma'], buchstaben: [] },
  { nr: 5, slug: '5', schluessel: 'sukun', arten: ['sukun'], buchstaben: [] },
  { nr: 6, slug: '6', schluessel: 'shadda', arten: ['shadda'], buchstaben: [] },
  { nr: 7, slug: '7', schluessel: 'tanwin', arten: ['fathatan', 'kasratan', 'dammatan'], buchstaben: [] },
  { nr: 8, slug: '8', schluessel: 'med', arten: ['med-fatha', 'med-kasra', 'med-damma'], buchstaben: [] },
];

export function lektionFuer(slug: string): Lektion | undefined {
  return LEKTIONEN.find((l) => l.slug === slug);
}

export function buchstabenDer(l: Lektion): readonly Buchstabe[] {
  if (!l.buchstaben.length) return BUCHSTABEN;
  return BUCHSTABEN.filter((b) => l.buchstaben.includes(b.slug));
}

/** Stationen des Elifbe-Wegs: Buchstaben, Formen, die Lektionen, dann Üben. */
export type Station = { art: 'buchstaben' } | { art: 'formen' } | { art: 'lektion'; lektion: Lektion } | { art: 'ueben' };

export const STATIONEN: readonly Station[] = [
  { art: 'buchstaben' },
  { art: 'formen' },
  ...LEKTIONEN.map((lektion) => ({ art: 'lektion' as const, lektion })),
  { art: 'ueben' },
];
