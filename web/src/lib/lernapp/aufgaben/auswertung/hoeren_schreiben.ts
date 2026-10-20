import type { Auswertung, BewertungsKontext } from '../hilfen';
import type { HoerenSchreibenAntwort, HoerenSchreibenAufgabe } from '../hoeren_schreiben';
import { textAuswertung } from './text';

/** `hoeren_schreiben` (Nutzlast in `../hoeren_schreiben.ts`): Abgleich wie `frei` (im Arabischen ohne Harakat). */
export const bewerteHoerenSchreiben = (
  a: HoerenSchreibenAufgabe,
  antwort: HoerenSchreibenAntwort,
  kontext: BewertungsKontext = {},
): Auswertung => textAuswertung(antwort.text, a.loesungen, a.sprache, a.karten, kontext);
