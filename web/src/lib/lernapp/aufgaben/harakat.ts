import { normalisiere } from '../abgleich/vergleichsform';
import * as z from '../z';
import { ab, basis, InhaltSchema, liste, mitOptionen } from './grundlagen';

/**
 * Übungstyp `harakat` (Arabisch: Vokalzeichen, Iʿrāb; PLAN §4): Unter Schreibungen mit demselben Buchstabengerüst wird
 * die richtig vokalisierte gewählt. Bewertung im **strengen Modus** des Abgleichs (PLAN §4.1): Vokal- und Hamzazeichen
 * zählen, keine Lockerungen, keine Tippfehler; der Hinweis „harakat“ nennt die Ursache (`auswertung/harakat.ts`).
 *
 * Screenreader lesen Vokalzeichen oft nicht vor. Jede Option bekommt deshalb eine Beschreibung aus den Namen ihrer Zeichen
 * („Lesen mit Codepunkt-Namen“, `beschreibe` in `auswertung/harakat.ts`): je Buchstabe sein Name und die Namen seiner
 * Zeichen (Texte unter `aufgaben.harakat.zeichen.u<Codepunkt>`).
 */

export const HarakatSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('harakat'),
    anweisung: z.enum(['waehleVokalisierung']),
    /** Bedeutung als Hilfe (Ausgangssprache) */
    vorgabe: z.optional(InhaltSchema),
    /** Schreibungen (arabisch), gleiches Gerüst, verschiedene Vokalisierung */
    optionen: liste(InhaltSchema, 2, 4),
    richtig: ab(0),
  })
  .check(
    z.superRefine(mitOptionen),
    z.superRefine((a, ctx) => {
      if (a.optionen.some((o) => o.sprache !== 'ar'))
        ctx.addIssue({ code: 'custom', message: 'Optionen nicht arabisch', path: ['optionen'] });
      const geruest = new Set(a.optionen.map((o) => normalisiere(o.text, 'ar')));
      if (geruest.size !== 1) ctx.addIssue({ code: 'custom', message: 'Optionen mit verschiedenem Gerüst', path: ['optionen'] });
      const streng = new Set(a.optionen.map((o) => normalisiere(o.text, 'ar', true)));
      if (streng.size !== a.optionen.length)
        ctx.addIssue({ code: 'custom', message: 'Optionen mit gleicher Vokalisierung', path: ['optionen'] });
    }),
  );

export type HarakatAufgabe = z.infer<typeof HarakatSchema>;
export type HarakatAntwort = { typ: 'harakat'; wahl: number };
