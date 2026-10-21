import { gemischteIndizes } from '../../engine/zufall';
import type { Auswertung, BewertungsKontext } from '../hilfen';
import type { LueckeAntwort, LueckeAufgabe } from '../luecke';
import { textAuswertung } from './text';

/** `luecke` (Nutzlast in `../luecke.ts`): Anzeigereihenfolge der Optionen. */
export const lueckeReihenfolge = (a: Pick<LueckeAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen?.length ?? 0, a.schluessel);

/** Satz mit gefüllter Lücke (Leerraum an den Rändern zusammengefasst). */
export const satzMit = (a: Pick<LueckeAufgabe, 'vor' | 'nach'>, wort: string): string =>
  `${a.vor}${wort}${a.nach}`.replace(/\s+/g, ' ').trim();

/** Gewählte Option ohne Tippfehler-Toleranz, getippte Antwort tolerant; die Lösung ist der ganze Satz. */
export function bewerteLuecke(a: LueckeAufgabe, antwort: LueckeAntwort, kontext: BewertungsKontext = {}): Auswertung {
  const gewaehlt = 'wahl' in antwort;
  const eingabe = gewaehlt ? (a.optionen?.[antwort.wahl] ?? '') : antwort.text;
  const e = textAuswertung(eingabe, a.loesungen, a.sprache, a.karten, kontext, { toleranz: !gewaehlt });
  return { ...e, loesung: e.loesung === null ? null : satzMit(a, e.loesung) };
}
