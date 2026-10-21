import { SchluesselSchema } from '../ereignisse/typen';
import * as z from '../z';
import { ab, basis, InhaltSchema, liste, mitOptionen, Optionen } from './grundlagen';

/**
 * Übungstyp `geschichte` (PLAN §4 „Geschichten“): eine kurze Geschichte, Zeile für Zeile aufgedeckt (mit Audio, wo es
 * eines gibt), dazwischen Fragen. Jede Frage steht nach der Zeile `nach` und wird sofort geprüft (Rückmeldung in der
 * Live-Region); erst danach geht es weiter. Am Ende gibt die Komponente alle ersten Antworten ab.
 *
 * Urteil wie bei `paare`: alle Fragen im ersten Versuch richtig → richtig, sonst falsch (die Geschichte kommt am Ende der
 * Lektion noch einmal). Karten einer Frage (`karte`) bekommen ihr eigenes Urteil, die Karten der Aufgabe das Gesamturteil.
 * Hier nur die Nutzlast (Zod); Ablauf und Bewertung ohne Zod in `auswertung/geschichte.ts`.
 */

export const GeschichteFrageSchema = z
  .strictObject({
    /** steht nach dieser Zeile (Index in `zeilen`) */
    nach: ab(0),
    frage: InhaltSchema,
    optionen: Optionen,
    richtig: ab(0),
    karte: z.optional(SchluesselSchema),
  })
  .check(z.superRefine(mitOptionen));

export const GeschichteZeileSchema = z.strictObject({
  /** Person der Zeile (Texte „Person A“ …); ohne Angabe Erzähltext */
  sprecher: z.optional(z.enum(['a', 'b', 'c'])),
  zeile: InhaltSchema,
  /** Übersetzung in die Ausgangssprache (aufklappbar) */
  uebersetzung: z.optional(InhaltSchema),
});

export const GeschichteSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('geschichte'),
    titel: z.optional(InhaltSchema),
    zeilen: liste(GeschichteZeileSchema, 1, 60),
    fragen: z.array(GeschichteFrageSchema).check(z.maxLength(10)),
  })
  .check(
    z.superRefine((a, ctx) => {
      a.fragen.forEach((f, i) => {
        if (f.nach >= a.zeilen.length) ctx.addIssue({ code: 'custom', message: 'Frage nach dem Ende', path: ['fragen', i, 'nach'] });
        const vorige = a.fragen[i - 1];
        if (vorige && vorige.nach > f.nach)
          ctx.addIssue({ code: 'custom', message: 'Fragen nicht in Reihenfolge', path: ['fragen', i, 'nach'] });
      });
    }),
  );

export type GeschichteAufgabe = z.infer<typeof GeschichteSchema>;
/** Erste Antwort je Frage (Index in den Optionen der Frage, Reihenfolge wie `fragen`). */
export type GeschichteAntwort = { typ: 'geschichte'; wahlen: number[] };
