import { gemischteIndizes } from '../../engine/zufall';
import { type Auswertung, kartenMit } from '../hilfen';
import type { ReihenfolgeAntwort, ReihenfolgeAufgabe } from '../reihenfolge';

/**
 * `reihenfolge` (Nutzlast in `../reihenfolge.ts`): richtig nur in genau der Reihenfolge des Inhalts. Start ist eine
 * deterministisch gemischte Folge (nie schon die Lösung); verschoben wird um eine Stelle.
 */

/** Gemischte Startfolge (Indizes in `schritte`). */
export const startFolge = (a: Pick<ReihenfolgeAufgabe, 'schritte' | 'schluessel'>): number[] =>
  gemischteIndizes(a.schritte.length, a.schluessel);

/** Element an `pos` um `richtung` (−1 nach oben, +1 nach unten) verschieben; am Rand unverändert. */
export function verschiebe(folge: readonly number[], pos: number, richtung: -1 | 1): number[] {
  const ziel = pos + richtung;
  if (pos < 0 || pos >= folge.length || ziel < 0 || ziel >= folge.length) return [...folge];
  const neu = [...folge];
  [neu[pos], neu[ziel]] = [neu[ziel] as number, neu[pos] as number];
  return neu;
}

/** Je Stelle: steht dort der richtige Schritt? */
export const stellenRichtig = (folge: readonly number[]): boolean[] => folge.map((schritt, pos) => schritt === pos);

export function bewerteReihenfolge(a: ReihenfolgeAufgabe, antwort: ReihenfolgeAntwort): Auswertung {
  const f = antwort.folge;
  const urteil = f.length === a.schritte.length && stellenRichtig(f).every(Boolean) ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: a.schritte.join(' → '), karten: kartenMit(a.karten, urteil) };
}
