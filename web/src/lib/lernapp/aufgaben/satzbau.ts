import { normalisiere, type Sprache } from '../abgleich';
import { zerlege } from '../abgleich/tokens';
import * as z from '../z';
import { basis, InhaltSchema, liste, Loesungen, SpracheSchema, text } from './grundlagen';

/**
 * Übungstyp `satzbau` (Satz ordnen, PLAN §4): Alle Wörter eines Satzes liegen als Kacheln bereit, ohne Ablenker; die
 * Reihenfolge wird gegen alle angenommenen Fassungen abgeglichen (ohne Tippfehler-Toleranz, wie die Wortbank;
 * `auswertung/satzbau.ts`). Jede Fassung
 * besteht genau aus den Kacheln. Bedienung wie `wortbank` (Werkzeugleiste mit wanderndem Tabindex, Antwortzeile als Liste).
 */

/** Wörter eines Satzes als Mehrfachmenge in Vergleichsform (sortiert). */
const woerterMenge = (satz: string, sprache: Sprache) =>
  zerlege(satz)
    .map((w) => normalisiere(w, sprache))
    .sort();

export const SatzbauSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('satzbau'),
    /** Übersetzung des Satzes als Hilfe */
    vorgabe: z.optional(InhaltSchema),
    sprache: SpracheSchema,
    kacheln: liste(text(60), 2, 24),
    loesungen: Loesungen,
  })
  .check(
    z.superRefine((a, ctx) => {
      const kacheln = a.kacheln.map((k) => normalisiere(k, a.sprache)).sort();
      a.loesungen.forEach((l, i) => {
        const w = woerterMenge(l, a.sprache);
        if (w.length !== kacheln.length || w.some((x, j) => x !== kacheln[j]))
          ctx.addIssue({ code: 'custom', message: `Fassung ${i + 1} passt nicht zu den Kacheln`, path: ['loesungen', i] });
      });
    }),
  );

export type SatzbauAufgabe = z.infer<typeof SatzbauSchema>;
export type SatzbauAntwort = { typ: 'satzbau'; kacheln: number[] };
