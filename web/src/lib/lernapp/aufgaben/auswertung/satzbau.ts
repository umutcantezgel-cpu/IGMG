import { gleicheAb } from '../../abgleich';
import { satzAus } from '../../abgleich/tokens';
import { gemischteIndizes } from '../../engine/zufall';
import { type Auswertung, kartenMit } from '../hilfen';
import type { SatzbauAntwort, SatzbauAufgabe } from '../satzbau';

/** `satzbau` (Nutzlast in `../satzbau.ts`): Anzeigereihenfolge der Kacheln (nie die Reihenfolge des Satzes). */
export const satzbauReihenfolge = (a: Pick<SatzbauAufgabe, 'kacheln' | 'schluessel'>): number[] =>
  gemischteIndizes(a.kacheln.length, a.schluessel);

/** Gelegte Reihenfolge gegen alle Fassungen, ohne Tippfehler-Toleranz (wie die Wortbank). */
export function bewerteSatzbau(a: SatzbauAufgabe, antwort: SatzbauAntwort): Auswertung {
  const satz = satzAus(antwort.kacheln.map((i) => a.kacheln[i] ?? ''));
  const e = gleicheAb(satz, a.loesungen, a.sprache, { toleranz: false });
  return { urteil: e.urteil, hinweise: e.hinweise, loesung: e.loesung, karten: kartenMit(a.karten, e.urteil) };
}
