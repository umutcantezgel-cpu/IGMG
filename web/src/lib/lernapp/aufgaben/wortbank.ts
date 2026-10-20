import { gleicheAb } from '../abgleich';
import { satzAus } from '../abgleich/tokens';
import { gemischteIndizes } from '../engine/zufall';
import { type AntwortVon, type Auswertung, type BewertungsKontext, kartenMit, type WortbankAufgabe } from './schema';

/**
 * Übungstyp `wortbank` (PLAN §4): Kacheln in die Antwortzeile legen; der zusammengesetzte Satz wird ohne
 * Tippfehler-Toleranz gegen alle Lösungen abgeglichen (Kacheln sind fertig geschrieben, ein Ablenker ist nie ein
 * Tippfehler). Interaktion als reine Funktionen für Tastatur und Zeiger: hinzufügen, entfernen, verschieben.
 */

/** Anzeigereihenfolge der Kachelbank. */
export const kachelReihenfolge = (a: WortbankAufgabe): number[] => gemischteIndizes(a.kacheln.length, a.schluessel);

export function bewerteWortbank(a: WortbankAufgabe, antwort: AntwortVon<'wortbank'>, _kontext: BewertungsKontext = {}): Auswertung {
  const satz = satzAus(antwort.kacheln.map((i) => a.kacheln[i] ?? ''));
  const e = gleicheAb(satz, a.loesungen, a.sprache, { toleranz: false });
  return { urteil: e.urteil, hinweise: e.hinweise, loesung: e.loesung, karten: kartenMit(a.karten, e.urteil) };
}

/** Gewählte Kacheln (Indizes in `kacheln`) in der Reihenfolge der Antwortzeile. */
export type WortbankAuswahl = readonly number[];

/** Kachel anhängen (jede Kachel höchstens einmal). */
export const legeKachel = (z: WortbankAuswahl, kachel: number): number[] => (z.includes(kachel) ? [...z] : [...z, kachel]);

/** Kachel an Position `pos` der Antwortzeile zurück in die Bank. */
export const nimmKachel = (z: WortbankAuswahl, pos: number): number[] => z.filter((_, i) => i !== pos);

/** Kachel in der Antwortzeile um `schritt` Plätze verschieben (am Rand bleibt sie stehen). */
export function verschiebeKachel(z: WortbankAuswahl, pos: number, schritt: number): number[] {
  const ziel = Math.max(0, Math.min(z.length - 1, pos + schritt));
  const a = [...z];
  const [k] = a.splice(pos, 1);
  if (k === undefined) return a;
  a.splice(ziel, 0, k);
  return a;
}
