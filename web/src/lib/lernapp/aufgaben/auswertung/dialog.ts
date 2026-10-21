import { gemischteIndizes } from '../../engine/zufall';
import type { DialogAntwort, DialogAufgabe, Sprecher } from '../dialog';
import { type Auswertung, nachIndex } from '../hilfen';

/** `dialog` (Nutzlast in `../dialog.ts`): Wer antwortet – die andere Person als in der letzten Zeile. */
export function antwortSprecher(a: Pick<DialogAufgabe, 'verlauf'>): Sprecher {
  return a.verlauf.at(-1)?.sprecher === 'a' ? 'b' : 'a';
}

/** Anzeigereihenfolge der Antworten (deterministisch gemischt). */
export const dialogReihenfolge = (a: Pick<DialogAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

/** Bewertung nach Index. */
export const bewerteDialog = (a: DialogAufgabe, antwort: DialogAntwort): Auswertung => nachIndex(a, antwort.wahl);
