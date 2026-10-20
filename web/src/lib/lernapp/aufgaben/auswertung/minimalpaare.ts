import { type Auswertung, nachIndex } from '../hilfen';
import type { MinimalpaareAntwort, MinimalpaareAufgabe } from '../minimalpaare';

/** `minimalpaare` (Nutzlast in `../minimalpaare.ts`): Bewertung nach Index; Reihenfolge wie `hoeren_waehlen`. */
export const bewerteMinimalpaare = (a: MinimalpaareAufgabe, antwort: MinimalpaareAntwort): Auswertung => nachIndex(a, antwort.wahl);
