import { type Auswertung, kartenMit } from '../hilfen';
import type { SprechenAntwort, SprechenAufgabe } from '../sprechen';

/** `sprechen` (Nutzlast in `../sprechen.ts`): Selbstbewertung – „noch üben“ → falsch (kommt wieder), sonst richtig. */
export function bewerteSprechen(a: SprechenAufgabe, antwort: SprechenAntwort): Auswertung {
  const urteil = antwort.selbst === 'nochmal' ? 'falsch' : 'richtig';
  return { urteil, hinweise: [], loesung: null, karten: kartenMit(a.karten, urteil), selbst: antwort.selbst };
}
