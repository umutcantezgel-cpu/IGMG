import * as z from '../z';
import { basis, InhaltSchema, liste, SpracheSchema, text } from './grundlagen';
import type { Auswertung } from './schema';

/**
 * Übungstyp `grammatik_tipp` (PLAN §4 „Tipps“, L3-E03): eine Karte mit Überschriften, Absätzen in der Sprache der
 * Erklärung (Ausgangssprache) und Beispielen in der Zielsprache (je mit `lang`/`dir`, optional Übersetzung). Keine
 * Bewertung: „Verstanden“ führt ohne Wertung weiter (Spieler `ueberspringe`, keine Karte, zählt nicht in die Quote).
 * Grammatik-Tipps sind Sprachinhalte ohne Religionsbezug (KERN 4.0 §2.1 Nr. 1).
 */

export const BeispielSchema = z.strictObject({ ziel: InhaltSchema, uebersetzung: z.optional(InhaltSchema) });

export const AbschnittSchema = z.strictObject({
  ueberschrift: z.optional(text(200)),
  absaetze: liste(text(2000), 1, 10),
  beispiele: z.optional(liste(BeispielSchema, 1, 10)),
});

export const GrammatikTippSchema = z.strictObject({
  ...basis,
  typ: z.literal('grammatik_tipp'),
  /** Sprache der Erklärung (Titel, Überschriften, Absätze) */
  sprache: SpracheSchema,
  titel: text(200),
  abschnitte: liste(AbschnittSchema, 1, 12),
});

export type GrammatikTippAufgabe = z.infer<typeof GrammatikTippSchema>;
/** „Gelesen“ (wird nicht bewertet; der Spieler überspringt ohne Wertung). */
export type GrammatikTippAntwort = { typ: 'grammatik_tipp' };

/** Ein Tipp hat kein Richtig oder Falsch: angenommen, ohne Karten. */
export function bewerteGrammatikTipp(): Auswertung {
  return { urteil: 'richtig', hinweise: [], loesung: null, karten: [] };
}
