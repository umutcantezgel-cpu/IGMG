import { SchluesselSchema } from '../ereignisse/typen';
import * as z from '../z';
import { ab, basis, eindeutig, liste, mitOptionen, SpracheSchema, text } from './grundlagen';

/**
 * Übungstyp `koran_wort` (Koran-Arabisch, PLAN §4, ADR 0040 Nr. 5): eine Wortform und ihre freigegebene Bedeutung
 * (`waehleBedeutung`) bzw. ihre Wurzel aus der geprüften Wurzeltabelle (`waehleWurzel`); Wahl nach Index (Radiogruppe).
 *
 * - Die Wortform kommt nur aus den gepinnten Koran-Daten (`web/daten`), aufgelöst über ihre Stelle `Sure:Vers:Wort` beim
 *   Paketbau – nie von Hand oder von einer KI geschrieben (KERN 4.0 §2.2 Nr. 1, Nr. 4).
 * - Bedeutungen tragen die Kennung ihres Eintrags in `quran_wortbedeutung` (von Menschen verfasst, MN-05), Wurzeln die
 *   Kennung in der eigenen Wurzeltabelle (L0-E12, LM-31). Sichtbar erst mit zwei Freigaben je Bedeutung bzw. der Tabelle –
 *   entschieden nur in `freigabe.ts` (`koranWortSichtbar`).
 * - Keine Sprachausgabe (KERN 4.0 §4); der Koran-Pfad nutzt später nur Wortzeiten freigegebener Rezitationen.
 */

/** Stelle einer Wortform: Sure, Vers, Wort (Zählung der gepinnten Wortdaten). */
export const KoranStelleSchema = z.string().check(z.regex(/^\d{1,3}:\d{1,3}:\d{1,3}$/));

const OptionSchema = z.strictObject({ kennung: SchluesselSchema, text: text(200), sprache: SpracheSchema });

export const KoranWortSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('koran_wort'),
    anweisung: z.enum(['waehleBedeutung', 'waehleWurzel']),
    wort: z.strictObject({ stelle: KoranStelleSchema, text: text(80), sprache: z.literal('ar') }),
    optionen: liste(OptionSchema, 2, 6),
    richtig: ab(0),
  })
  .check(
    z.superRefine(mitOptionen),
    z.superRefine((a, ctx) => {
      if (!eindeutig(a.optionen.map((o) => o.kennung))) ctx.addIssue({ code: 'custom', message: 'Kennungen doppelt', path: ['optionen'] });
      // Wurzeln stehen in arabischer Schrift, Bedeutungen in der Sprache der Oberfläche (de oder tr)
      const passt = (o: { sprache: string }) => (a.anweisung === 'waehleWurzel' ? o.sprache === 'ar' : o.sprache !== 'ar');
      if (!a.optionen.every(passt)) ctx.addIssue({ code: 'custom', message: 'Sprache der Optionen passt nicht', path: ['optionen'] });
    }),
  );

export type KoranWortAufgabe = z.infer<typeof KoranWortSchema>;
export type KoranWortAntwort = { typ: 'koran_wort'; wahl: number };
