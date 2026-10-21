import * as z from '../z';
import { ab, basis, InhaltSchema, liste, mitOptionen, Optionen } from './grundlagen';

/**
 * Übungstyp `dialog` (PLAN §4 „Gespräch“): ein kurzer Gesprächsverlauf zweier Personen in der Zielsprache, danach die
 * passende Antwort wählen. Bewertung nach Index. Anzeige: Verlauf als Liste (jede Zeile mit `lang`/`dir`, optional Audio),
 * Antworten als Radiogruppe; die Rückmeldung läuft über die eine Live-Region des Spielers. Hier nur die Nutzlast (Zod);
 * Bewertung und Anzeige-Hilfen ohne Zod in `auswertung/dialog.ts` (nur im Übungs-Chunk, KERN 4.0 §9).
 *
 * Die Personen heißen nur `a` und `b` (Texte „Person A“/„Person B“ aus `messages/lernapp`, keine Namen im Inhalt). Wer
 * antwortet, ergibt sich aus der letzten Zeile: die jeweils andere Person.
 */

export const SPRECHER = ['a', 'b'] as const;
export type Sprecher = (typeof SPRECHER)[number];

export const DialogZeileSchema = z.strictObject({
  sprecher: z.enum(SPRECHER),
  zeile: InhaltSchema,
  /** Übersetzung in die Ausgangssprache (aufklappbar) */
  uebersetzung: z.optional(InhaltSchema),
});

export const DialogSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('dialog'),
    verlauf: liste(DialogZeileSchema, 1, 20),
    /** Antwortmöglichkeiten in der Zielsprache */
    optionen: Optionen,
    richtig: ab(0),
  })
  .check(z.superRefine(mitOptionen));

export type DialogAufgabe = z.infer<typeof DialogSchema>;
export type DialogAntwort = { typ: 'dialog'; wahl: number };
