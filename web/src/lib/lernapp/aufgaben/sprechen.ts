import type { Note } from '../bewertung';
import * as z from '../z';
import { basis, InhaltSchema } from './grundlagen';

/**
 * Übungstyp `sprechen` (PLAN §4.2, ADR 0042 mit Fortschreibung S2/S5): den Zielsatz vorlesen. Die Aufnahme bleibt im
 * Arbeitsspeicher des Geräts; die Spracherkennung (Whisper im Worker, `components/lernapp/sprechen/whisper.worker.ts`)
 * markiert nur die Wörter des Zielsatzes („gut verständlich“ / „teilweise verstanden“), nie die freie Abschrift. Für die
 * Wiederholung bewerten sich Lernende selbst (ADR 0038 Nr. 3): „noch üben“ → nochmal (die Aufgabe kommt am Ende noch
 * einmal), „ging so“ → schwer, „gut“ → gut. Arabisch und jeder Rückfall: eigene Aufnahme anhören, vergleichen, selbst
 * bewerten. „Ich kann gerade nicht sprechen“ überspringt ohne Wertung.
 */

export const SprechenSchema = z.strictObject({
  ...basis,
  typ: z.literal('sprechen'),
  /** Zielsatz in der Zielsprache (mit Audio, wo es eines gibt) */
  vorgabe: InhaltSchema,
  /** Übersetzung in die Ausgangssprache */
  uebersetzung: z.optional(InhaltSchema),
});

export type SprechenAufgabe = z.infer<typeof SprechenSchema>;
/** Selbstbewertung; `automatisch` nur zur Anzeige im Ereignis-freien Zustand der Komponente (keine Abschrift). */
export type SprechenAntwort = { typ: 'sprechen'; selbst: Note };
