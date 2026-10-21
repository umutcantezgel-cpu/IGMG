import { normalisiere } from '../abgleich/vergleichsform';
import * as z from '../z';
import { basis, InhaltSchema, Loesungen, roh, SpracheSchema } from './grundlagen';

/**
 * Übungstyp `luecke` (Lückentext, PLAN §4): Ein Satz mit einer Lücke (`vor` … `nach`). Mit `optionen` wird gewählt
 * (Radiogruppe; Abgleich ohne Tippfehler-Toleranz, die Optionen sind fertig geschrieben), sonst getippt (beschriftetes Feld,
 * toleranter Abgleich wie `frei`; `auswertung/luecke.ts`). Die Lösung im Rückmeldeblatt ist der ganze Satz.
 */

export const LueckeSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('luecke'),
    vor: roh(600, 0),
    nach: roh(600, 0),
    /** Sprache des Satzes und der Antwort */
    sprache: SpracheSchema,
    /** Optionen für die Lücke (Wahl); ohne: Freitext */
    optionen: z.optional(z.array(roh(60)).check(z.minLength(2), z.maxLength(6))),
    loesungen: Loesungen,
    /** Übersetzung des ganzen Satzes als Hilfe */
    hilfe: z.optional(InhaltSchema),
  })
  .check(
    z.superRefine((a, ctx) => {
      if (!a.vor.trim() && !a.nach.trim()) ctx.addIssue({ code: 'custom', message: 'Satz ohne Text um die Lücke', path: ['vor'] });
      if (!a.optionen) return;
      const n = (t: string) => normalisiere(t, a.sprache);
      if (new Set(a.optionen.map(n)).size !== a.optionen.length)
        ctx.addIssue({ code: 'custom', message: 'Optionen doppelt', path: ['optionen'] });
      const loesungen = new Set(a.loesungen.map(n));
      const passend = a.optionen.filter((o) => loesungen.has(n(o))).length;
      if (passend !== 1) ctx.addIssue({ code: 'custom', message: `${passend} Optionen passen (genau eine)`, path: ['optionen'] });
    }),
  );

export type LueckeAufgabe = z.infer<typeof LueckeSchema>;
export type LueckeAntwort = { typ: 'luecke'; wahl: number } | { typ: 'luecke'; text: string };
