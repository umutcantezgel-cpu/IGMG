import * as z from '../z';
import { ab, basis, eindeutig, liste, text } from './grundlagen';
import { wissen } from './wissen';

/**
 * Übungstyp `fallfrage` (Wissenskurs, PLAN §4): ein beschriebener Übungsfall, eine Frage, eine richtige Option
 * (Radiogruppe). Der Fall ist ein Lehrbeispiel aus einer geprüften Aussage – keine Auskunft zu persönlichen Fällen und keine
 * Fatwa (KERN 4.0 §2.2 Nr. 3); die Oberfläche sagt das neben jedem Fall. Bewertung nach Index (`auswertung/fallfrage.ts`).
 */

export const FallfrageSchema = z
  .strictObject({
    ...basis,
    ...wissen,
    typ: z.literal('fallfrage'),
    anweisung: z.enum(['waehleAntwort']),
    fall: text(1200),
    frage: text(300),
    optionen: liste(text(300), 2, 6),
    richtig: ab(0),
    /** Begründung, nach der Antwort gezeigt */
    begruendung: z.optional(text(1000)),
  })
  .check(
    z.superRefine((a, ctx) => {
      if (a.richtig >= a.optionen.length) ctx.addIssue({ code: 'custom', message: 'richtig außerhalb der Optionen', path: ['richtig'] });
      if (!eindeutig(a.optionen)) ctx.addIssue({ code: 'custom', message: 'Optionen doppelt', path: ['optionen'] });
    }),
  );

export type FallfrageAufgabe = z.infer<typeof FallfrageSchema>;
export type FallfrageAntwort = { typ: 'fallfrage'; wahl: number };
