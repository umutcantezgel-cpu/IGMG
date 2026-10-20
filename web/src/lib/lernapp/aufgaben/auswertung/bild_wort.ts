import { gemischteIndizes } from '../../engine/zufall';
import type { BildWortAntwort, BildWortAufgabe } from '../bild_wort';
import { type Auswertung, nachIndex } from '../hilfen';

/** `bild_wort` (Nutzlast in `../bild_wort.ts`): Anzeigereihenfolge der Optionen (deterministisch gemischt). */
export const bildWortReihenfolge = (a: Pick<BildWortAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

/** Bewertung nach Index. */
export const bewerteBildWort = (a: BildWortAufgabe, antwort: BildWortAntwort): Auswertung => nachIndex(a, antwort.wahl);
