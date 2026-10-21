import { normalisiere } from './vergleichsform';
import { bereite, type Sprache, woerter } from './normalisiere';

/**
 * Wortbank-Kacheln (PLAN §4 `wortbank`, `satzbau`): Ein Satz zerfällt in Wörter ohne Satzzeichen; die Schreibung bleibt.
 * Kacheln tragen eine Kennung, weil ein Wort mehrfach vorkommen kann. Die Bewertung setzt die gewählten Kacheln zu einem
 * Satz zusammen und gleicht ihn ohne Tippfehler-Toleranz ab (aufgaben/wortbank.ts).
 */

export type Kachel = { id: number; text: string };

/** Wörter eines Satzes als Kacheltexte (Satzzeichen und doppelter Leerraum fallen weg). */
export function zerlege(satz: string): string[] {
  return woerter(bereite(satz));
}

/** Kacheltexte mit fortlaufender Kennung (Reihenfolge des Inhalts; gemischt wird in der Anzeige). */
export function kachelnMitId(texte: readonly string[]): Kachel[] {
  return texte.map((text, id) => ({ id, text }));
}

/** Gewählte Kacheln als Satz. */
export function satzAus(texte: readonly string[]): string {
  return texte.join(' ');
}

/**
 * Wörter der Lösung, die im Kachelvorrat fehlen (als Mehrfachmenge, verglichen in Vergleichsform). Leer heißt: Die Lösung
 * ist mit den Kacheln legbar.
 */
export function fehlendeKacheln(loesung: string, vorrat: readonly string[], sprache: Sprache): string[] {
  const rest = new Map<string, number>();
  for (const k of vorrat) {
    const n = normalisiere(k, sprache);
    rest.set(n, (rest.get(n) ?? 0) + 1);
  }
  const fehlt: string[] = [];
  for (const w of zerlege(loesung)) {
    const n = normalisiere(w, sprache);
    const anzahl = rest.get(n) ?? 0;
    if (anzahl > 0) rest.set(n, anzahl - 1);
    else fehlt.push(w);
  }
  return fehlt;
}
