import type { Auswertung } from '../hilfen';

/** `grammatik_tipp` (Nutzlast in `../grammatik_tipp.ts`): kein Richtig oder Falsch – angenommen, ohne Karten. */
export function bewerteGrammatikTipp(): Auswertung {
  return { urteil: 'richtig', hinweise: [], loesung: null, karten: [] };
}
