import * as z from '../z';
import { basis, eindeutig, liste, text } from './grundlagen';
import { wissen } from './wissen';

/**
 * Übungstyp `reihenfolge` (Wissenskurs, PLAN §4): Schritte in die richtige Reihenfolge bringen. Angezeigt gemischt als
 * geordnete Liste; jeder Schritt hat „nach oben“ und „nach unten“, Alt + Pfeil verschiebt (Ziehen nie nötig, WCAG 2.5.7).
 * Bewertung: richtig nur in genau der Reihenfolge des Inhalts (`auswertung/reihenfolge.ts`).
 *
 * `frage`: die inhaltliche Frage der Quizfrage (in der Inhaltsdatei `anweisung`, z. B. nach welchem Maßstab geordnet wird) –
 * im Wissenskurs immer gesetzt (`paket/wissen.ts`); die Überschrift bleibt die feste Anweisung `ordne`.
 */

export const ReihenfolgeSchema = z
  .strictObject({
    ...basis,
    ...wissen,
    typ: z.literal('reihenfolge'),
    anweisung: z.enum(['ordne']),
    frage: z.optional(text(300)),
    /** Schritte in der richtigen Reihenfolge */
    schritte: liste(text(300), 2, 12),
  })
  .check(
    z.superRefine((a, ctx) => {
      if (!eindeutig(a.schritte)) ctx.addIssue({ code: 'custom', message: 'Schritte doppelt', path: ['schritte'] });
    }),
  );

export type ReihenfolgeAufgabe = z.infer<typeof ReihenfolgeSchema>;
/** Gelegte Reihenfolge als Indizes in `schritte`. */
export type ReihenfolgeAntwort = { typ: 'reihenfolge'; folge: number[] };
