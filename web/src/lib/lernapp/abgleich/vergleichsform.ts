import { REGELN_AR } from './ar';
import { REGELN_DE } from './de';
import { normalisiereMit, type Sprache, type SprachRegeln, woerter } from './normalisiere';
import { REGELN_TR } from './tr';

/**
 * Vergleichsform und Lexikon des Antwortabgleichs (PLAN §4.1) ohne den eigentlichen Abgleich: Regeln je Sprache,
 * `normalisiere`, `bereiteLexikon`, Urteile. Eigenes Modul, damit Engine, Paketprüfung und Schemas den Abgleich mit
 * Tippfehler-Toleranz (`index.ts` `gleicheAb`, Levenshtein) nicht laden – der kommt nur mit den Übungs-Chunks, die Text
 * abgleichen (KERN 4.0 §9). `index.ts` reicht alles weiter.
 */

export type { Sprache } from './normalisiere';

export const REGELN: Readonly<Record<Sprache, SprachRegeln>> = { de: REGELN_DE, tr: REGELN_TR, ar: REGELN_AR };

export type Urteil = 'richtig' | 'tippfehler' | 'falsch';
export const URTEILE: readonly Urteil[] = ['richtig', 'tippfehler', 'falsch'];

/** Gültige Kurswörter in Vergleichsform (für den Lexikonschutz), einmal je Lektion vorbereitet. */
export type Lexikon = { sprache: Sprache; woerter: ReadonlySet<string> };

/** Vergleichsform eines Textes in einer Sprache (idempotent). */
export function normalisiere(text: string, sprache: Sprache, streng = false): string {
  return normalisiereMit(text, REGELN[sprache], streng);
}

/** Lexikon aus Wörtern oder Wendungen des Kurses (jedes Wort einer Wendung zählt). */
export function bereiteLexikon(eintraege: Iterable<string>, sprache: Sprache): Lexikon {
  const menge = new Set<string>();
  for (const e of eintraege) for (const w of woerter(normalisiere(e, sprache))) menge.add(w);
  return { sprache, woerter: menge };
}

/** Angenommen heißt `richtig` oder `tippfehler`. */
export const angenommen = (e: { urteil: Urteil }) => e.urteil !== 'falsch';
