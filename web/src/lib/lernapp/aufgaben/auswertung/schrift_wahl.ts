import { gemischteIndizes } from '../../engine/zufall';
import { type Auswertung, nachIndex } from '../hilfen';
import type { SchriftLateinAntwort, SchriftLateinAufgabe } from '../schrift_latein';
import type { SchriftTrAntwort, SchriftTrAufgabe } from '../schrift_tr';
import type { SchriftWahlAufgabe } from '../schrift_wahl';

/** `schrift_tr`/`schrift_latein` (Nutzlast in `../schrift_wahl.ts`): ohne Ton bleibt nur die sichtbare Vorgabe. */
export const ohneTonLoesbar = (a: Pick<SchriftWahlAufgabe, 'vorgabe'>): boolean => Boolean(a.vorgabe);

/** Anzeigereihenfolge der Optionen (deterministisch gemischt). */
export const schriftWahlReihenfolge = (a: Pick<SchriftWahlAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

/** Bewertung nach Index. */
export const bewerteSchriftWahl = (a: SchriftWahlAufgabe, wahl: number): Auswertung => nachIndex(a, wahl);

/** Bewertung beider Lateinschrift-Vorkurse aus der Antwort (ein Chunk für `schrift_tr` und `schrift_latein`, `lader.ts`). */
export const bewerteSchriftWahlAntwort = (a: SchriftWahlAufgabe, antwort: { wahl: number }): Auswertung =>
  bewerteSchriftWahl(a, antwort.wahl);

export const bewerteSchriftTr = (a: SchriftTrAufgabe, antwort: SchriftTrAntwort): Auswertung => bewerteSchriftWahl(a, antwort.wahl);
export const bewerteSchriftLatein = (a: SchriftLateinAufgabe, antwort: SchriftLateinAntwort): Auswertung =>
  bewerteSchriftWahl(a, antwort.wahl);
