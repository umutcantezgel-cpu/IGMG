import { normalisiere } from '../abgleich';
import * as z from '../z';
import { ab, basis, InhaltSchema, liste, mitOptionen } from './grundlagen';

/**
 * Übungstyp `minimalpaare` (PLAN §4): Ein Wort hören und unter fast gleichen Wörtern das gehörte wählen (tr ı/i, ü/u;
 * ar ṣād/sīn, ḥāʾ/hāʾ; de lang/kurz). Bedienung wie `hoeren_waehlen`; Bewertung nach Index (`auswertung/minimalpaare.ts`).
 * Der gehörte Text ist die
 * richtige Option; die Optionen tragen sonst keinen Hinweis (keine Übersetzung, die das Paar verraten würde).
 */

export const MinimalpaareSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('minimalpaare'),
    hoeren: InhaltSchema,
    optionen: liste(InhaltSchema, 2, 4),
    richtig: ab(0),
  })
  .check(
    z.superRefine(mitOptionen),
    z.superRefine((a, ctx) => {
      const r = a.optionen[a.richtig];
      if (!r) return;
      if (r.sprache !== a.hoeren.sprache || normalisiere(r.text, r.sprache, true) !== normalisiere(a.hoeren.text, a.hoeren.sprache, true))
        ctx.addIssue({ code: 'custom', message: 'gehörter Text ist nicht die richtige Option', path: ['hoeren'] });
      if (a.optionen.some((o) => o.sprache !== a.hoeren.sprache))
        ctx.addIssue({ code: 'custom', message: 'Optionen in anderer Sprache', path: ['optionen'] });
    }),
  );

export type MinimalpaareAufgabe = z.infer<typeof MinimalpaareSchema>;
export type MinimalpaareAntwort = { typ: 'minimalpaare'; wahl: number };
