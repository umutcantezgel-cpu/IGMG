import { gemischteIndizes } from '../engine/zufall';
import * as z from '../z';
import { ab, basis, InhaltSchema, kartenMit, liste, mitOptionen, Optionen } from './bausteine';
import type { Auswertung } from './schema';

/**
 * Übungstyp `dialog` (PLAN §4 „Gespräch“): ein kurzer Gesprächsverlauf zweier Personen in der Zielsprache, danach die
 * passende Antwort wählen. Bewertung nach Index. Anzeige: Verlauf als Liste (jede Zeile mit `lang`/`dir`, optional Audio),
 * Antworten als Radiogruppe; die Rückmeldung läuft über die eine Live-Region des Spielers.
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

/** Wer antwortet: die andere Person als in der letzten Zeile. */
export function antwortSprecher(a: Pick<DialogAufgabe, 'verlauf'>): Sprecher {
  return a.verlauf.at(-1)?.sprecher === 'a' ? 'b' : 'a';
}

/** Anzeigereihenfolge der Antworten (deterministisch gemischt). */
export const dialogReihenfolge = (a: Pick<DialogAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

export function bewerteDialog(a: DialogAufgabe, antwort: DialogAntwort): Auswertung {
  const urteil = antwort.wahl === a.richtig ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: a.optionen[a.richtig]?.text ?? null, karten: kartenMit(a.karten, urteil) };
}
