import * as z from '../z';
import { basis, InhaltSchema, Loesungen, SpracheSchema } from './grundlagen';

/**
 * Übungstyp `hoeren_schreiben` (Diktat, PLAN §4): Clip hören, Gehörtes schreiben. Abgleich wie `frei`
 * (`auswertung/hoeren_schreiben.ts`), im Arabischen
 * ohne Harakat (der normale Abgleich entfernt sie still, PLAN §4.1). Ohne Audio übersprungen („Audio folgt“), Abschrift
 * nach der Antwort.
 */

export const HoerenSchreibenSchema = z.strictObject({
  ...basis,
  typ: z.literal('hoeren_schreiben'),
  hoeren: InhaltSchema,
  /** Sprache der Antwort (= Sprache des Clips) */
  sprache: SpracheSchema,
  loesungen: Loesungen,
});

export type HoerenSchreibenAufgabe = z.infer<typeof HoerenSchreibenSchema>;
export type HoerenSchreibenAntwort = { typ: 'hoeren_schreiben'; text: string };
