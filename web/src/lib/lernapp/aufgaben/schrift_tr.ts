import type * as z from '../z';
import { schriftWahlSchema } from './schrift_wahl';

/**
 * Übungstyp `schrift_tr` (PLAN §4 „ç ğ ı İ ö ş ü“, §4.4): Vorkurs Türkisch für de/ar. Aufbau und Bewertung gemeinsam mit
 * `schrift_latein` (`schrift_wahl.ts`).
 */
export const SchriftTrSchema = schriftWahlSchema('schrift_tr');
export type SchriftTrAufgabe = z.infer<typeof SchriftTrSchema>;
export type SchriftTrAntwort = { typ: 'schrift_tr'; wahl: number };
