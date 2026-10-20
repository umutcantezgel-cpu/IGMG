import { gemischteIndizes } from '../../engine/zufall';
import type { Auswertung } from '../hilfen';
import { nachIndex } from '../hilfen';
import type { HoerenWaehlenAntwort, HoerenWaehlenAufgabe } from '../hoeren_waehlen';

/** Anzeigereihenfolge der Optionen einer Hörwahl (`hoeren_waehlen`, `minimalpaare`). */
export const hoerenReihenfolge = (a: { optionen: readonly unknown[]; schluessel: string }): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

/** `hoeren_waehlen` (Nutzlast in `../hoeren_waehlen.ts`): Bewertung nach Index. */
export const bewerteHoerenWaehlen = (a: HoerenWaehlenAufgabe, antwort: HoerenWaehlenAntwort): Auswertung => nachIndex(a, antwort.wahl);
