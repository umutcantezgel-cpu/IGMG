import * as z from '../z';
import { basis, InhaltSchema, Loesungen, SpracheSchema } from './grundlagen';

/**
 * Übungstyp `frei` (PLAN §4): Freitext mit tolerantem Abgleich (PLAN §4.1: Normalisierung, Lockerungen mit Hinweis,
 * Tippfehler-Toleranz, Lexikonschutz; `auswertung/frei.ts`). Eingabe mit `lang`/`dir` der Antwortsprache,
 * Sonderzeichenleiste (de, tr) bzw.
 * arabische Bildschirmtastatur (ar, erst bei Bedarf geladen).
 */

export const FreiSchema = z.strictObject({
  ...basis,
  typ: z.literal('frei'),
  /** `uebersetze` (Standard): Vorgabe übersetzen; `antworte`: auf die Vorgabe antworten */
  anweisung: z.optional(z.enum(['uebersetze', 'antworte'])),
  vorgabe: InhaltSchema,
  /** Sprache der Antwort */
  sprache: SpracheSchema,
  loesungen: Loesungen,
});

export type FreiAufgabe = z.infer<typeof FreiSchema>;
export type FreiAntwort = { typ: 'frei'; text: string };
