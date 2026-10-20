import { gemischteIndizes } from '../../engine/zufall';
import type { FallfrageAntwort, FallfrageAufgabe } from '../fallfrage';
import { type Auswertung, kartenMit } from '../hilfen';

/** `fallfrage` (Nutzlast in `../fallfrage.ts`): Wahl nach Index; Lösung ist die richtige Option. */

/** Anzeigereihenfolge der Optionen. */
export const fallfrageReihenfolge = (a: Pick<FallfrageAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

export function bewerteFallfrage(a: FallfrageAufgabe, antwort: FallfrageAntwort): Auswertung {
  const urteil = antwort.wahl === a.richtig ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: a.optionen[a.richtig] ?? null, karten: kartenMit(a.karten, urteil) };
}
