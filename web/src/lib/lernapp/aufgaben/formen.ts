import * as z from '../z';
import { ab, basis, InhaltSchema, liste, Loesungen, SpracheSchema, text } from './grundlagen';

/**
 * Übungstyp `formen` (Konjugation, Endungen, PLAN §4): Eine Tabelle mit Zeilen- und Spaltenköpfen; offene Zellen sind
 * Eingabefelder mit Kopfbezug (Beschriftung aus Zeile und Spalte), vorgegebene Zellen stehen als Text. Jede offene Zelle
 * wird wie `frei` abgeglichen; das Urteil der Aufgabe ist das schwächste der Zellen, Hinweise werden vereinigt
 * (`auswertung/formen.ts`).
 */

const ZelleSchema = z.strictObject({
  zeile: ab(0),
  spalte: ab(0),
  loesungen: Loesungen,
  /** vorgegeben (als Text gezeigt, nicht abgefragt) */
  vorgabe: z.optional(z.boolean()),
});

export const FormenSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('formen'),
    /** Sprache der Formen */
    sprache: SpracheSchema,
    /** Sprache der Köpfe (Standard: wie die Formen) */
    kopfsprache: z.optional(SpracheSchema),
    /** z. B. das Lemma, dessen Formen gefragt sind */
    titel: z.optional(InhaltSchema),
    zeilen: liste(text(60), 1, 12),
    spalten: liste(text(60), 1, 8),
    zellen: liste(ZelleSchema, 1, 96),
  })
  .check(
    z.superRefine((a, ctx) => {
      const orte = new Set<string>();
      a.zellen.forEach((c, i) => {
        if (c.zeile >= a.zeilen.length || c.spalte >= a.spalten.length)
          ctx.addIssue({ code: 'custom', message: 'Zelle außerhalb der Tabelle', path: ['zellen', i] });
        const ort = `${c.zeile}:${c.spalte}`;
        if (orte.has(ort)) ctx.addIssue({ code: 'custom', message: 'Zelle doppelt', path: ['zellen', i] });
        orte.add(ort);
      });
      if (!a.zellen.some((c) => !c.vorgabe)) ctx.addIssue({ code: 'custom', message: 'keine offene Zelle', path: ['zellen'] });
    }),
  );

export type FormenAufgabe = z.infer<typeof FormenSchema>;
/** Eingaben je Zelle (Index wie `zellen`; vorgegebene Zellen werden nicht gelesen). */
export type FormenAntwort = { typ: 'formen'; werte: string[] };
