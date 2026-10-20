import { type Auswertung, kartenMit } from '../hilfen';
import type { WahrFalschAntwort, WahrFalschAufgabe } from '../wahr_falsch';

/**
 * `wahr_falsch` (Nutzlast in `../wahr_falsch.ts`): richtig, wenn das Urteil „stimmt“/„stimmt nicht“ zur Aussage passt.
 * Die Lösung ist die Begründung (Rückmeldeblatt und Live-Region); welches Urteil stimmt, zeigt die Übung selbst.
 */

/** Index der Option in der Anzeige: 0 = „stimmt“, 1 = „stimmt nicht“. */
export const wahrIndex = (wahr: boolean): 0 | 1 => (wahr ? 0 : 1);

export function bewerteWahrFalsch(a: WahrFalschAufgabe, antwort: WahrFalschAntwort): Auswertung {
  const urteil = antwort.wahr === a.wahr ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: a.begruendung, karten: kartenMit(a.karten, urteil) };
}
