import { gemischteIndizes } from '../../engine/zufall';
import { type Auswertung, nachIndex } from '../hilfen';
import type { KoranWortAntwort, KoranWortAufgabe } from '../koran_wort';

/** `koran_wort` (Nutzlast in `../koran_wort.ts`): Wahl nach Index; Lösung ist die freigegebene Bedeutung bzw. Wurzel. */

/** Anzeigereihenfolge der Optionen. */
export const koranWortReihenfolge = (a: Pick<KoranWortAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

export const bewerteKoranWort = (a: KoranWortAufgabe, antwort: KoranWortAntwort): Auswertung => nachIndex(a, antwort.wahl);
