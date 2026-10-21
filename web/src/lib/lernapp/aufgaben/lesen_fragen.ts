import { normalisiere } from '../abgleich/vergleichsform';
import * as z from '../z';
import { ab, basis, InhaltSchema, liste, mitOptionen, Optionen, roh } from './grundlagen';
import { RFN } from './hilfen';

/**
 * Übungstyp `lesen_fragen` (PLAN §4 „Lesen“, ab B1): ein Lesetext, darunter Fragen – Auswahl oder „richtig / falsch /
 * nicht im Text“. Ein Wort im Text antippen (oder mit Tab und Enter wählen) zeigt seine Glosse in der Ausgangssprache
 * (Deckkraft + Skalierung .96 → 1 wie B-14, reduziert nur Deckkraft). Alle Fragen werden zusammen geprüft; danach sind
 * richtige und falsche Antworten je Frage als Text markiert. Urteil: alle richtig → richtig, sonst falsch. Hier nur die
 * Nutzlast (Zod); Bewertung, Glossen und Zerlegung ohne Zod in `auswertung/lesen_fragen.ts`.
 */

export { RFN, type Rfn } from './hilfen';

export const AuswahlFrageSchema = z
  .strictObject({ art: z.literal('auswahl'), frage: InhaltSchema, optionen: Optionen, richtig: ab(0) })
  .check(z.superRefine(mitOptionen));
export const RfnFrageSchema = z.strictObject({ art: z.literal('rfn'), aussage: InhaltSchema, richtig: z.enum(RFN) });
export const LeseFrageSchema = z.discriminatedUnion('art', [AuswahlFrageSchema, RfnFrageSchema]);

export const GlosseSchema = z.strictObject({
  /** Wortform im Text (verglichen in der Vergleichsform der Zielsprache) */
  wort: roh(80),
  /** Bedeutung in der Ausgangssprache */
  glosse: InhaltSchema,
});

export const LesenFragenSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('lesen_fragen'),
    titel: z.optional(InhaltSchema),
    /** Absätze des Lesetexts in der Zielsprache */
    text: liste(InhaltSchema, 1, 40),
    glossen: z.optional(liste(GlosseSchema, 1, 200)),
    fragen: liste(LeseFrageSchema, 1, 10),
  })
  .check(
    z.superRefine((a, ctx) => {
      const sprache = a.text[0]?.sprache;
      if (a.text.some((t) => t.sprache !== sprache))
        ctx.addIssue({ code: 'custom', message: 'Lesetext in mehreren Sprachen', path: ['text'] });
      if (sprache && a.glossen) {
        const formen = a.glossen.map((g) => normalisiere(g.wort, sprache));
        if (new Set(formen).size !== formen.length) ctx.addIssue({ code: 'custom', message: 'Glosse doppelt', path: ['glossen'] });
      }
    }),
  );

export type LesenFragenAufgabe = z.infer<typeof LesenFragenSchema>;
export type LeseFrage = z.infer<typeof LeseFrageSchema>;
/** Antwort je Frage: Index der Option bzw. Index in `RFN`. */
export type LesenFragenAntwort = { typ: 'lesen_fragen'; wahlen: number[] };
