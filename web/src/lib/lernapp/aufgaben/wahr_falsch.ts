import * as z from '../z';
import { basis, text } from './grundlagen';
import { wissen } from './wissen';

/**
 * Übungstyp `wahr_falsch` (Wissenskurs, PLAN §4): Stimmt die Aussage? Zwei Optionen („stimmt“, „stimmt nicht“) als
 * Radiogruppe; nach der Antwort steht immer die Begründung (mit Quellenzeile). Bewertung in `auswertung/wahr_falsch.ts`.
 * Die Aussage ist ein eigener Lehrsatz mit Beleg (ADR 0040 Nr. 4), nie ein Quellentext oder seine Übersetzung.
 */

export const WahrFalschSchema = z.strictObject({
  ...basis,
  ...wissen,
  typ: z.literal('wahr_falsch'),
  anweisung: z.enum(['stimmtDas']),
  aussage: text(600),
  /** stimmt die Aussage? */
  wahr: z.boolean(),
  /** Begründung, nach der Antwort gezeigt (auch bei „richtig“) */
  begruendung: text(1000),
});

export type WahrFalschAufgabe = z.infer<typeof WahrFalschSchema>;
export type WahrFalschAntwort = { typ: 'wahr_falsch'; wahr: boolean };
