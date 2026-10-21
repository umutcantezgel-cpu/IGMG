import type * as z from '../z';
import { schriftWahlSchema } from './schrift_wahl';

/**
 * Übungstyp `schrift_latein` (PLAN §4 „Lateinalphabet, Groß/Klein, Umlaute“, §4.4): Vorkurs für ar → de/tr. Aufbau und
 * Bewertung gemeinsam mit `schrift_tr` (`schrift_wahl.ts`).
 */
export const SchriftLateinSchema = schriftWahlSchema('schrift_latein');
export type SchriftLateinAufgabe = z.infer<typeof SchriftLateinSchema>;
export type SchriftLateinAntwort = { typ: 'schrift_latein'; wahl: number };
