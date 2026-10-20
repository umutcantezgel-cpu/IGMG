import type { FreiAntwort, FreiAufgabe } from '../frei';
import type { Auswertung, BewertungsKontext } from '../hilfen';
import { textAuswertung } from './text';

/** `frei` (Nutzlast in `../frei.ts`): toleranter Abgleich gegen alle Lösungen. */
export const bewerteFrei = (a: FreiAufgabe, antwort: FreiAntwort, kontext: BewertungsKontext = {}): Auswertung =>
  textAuswertung(antwort.text, a.loesungen, a.sprache, a.karten, kontext);
