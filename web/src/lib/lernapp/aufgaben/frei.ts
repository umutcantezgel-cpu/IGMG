import { gleicheAb, type Sprache } from '../abgleich';
import * as z from '../z';
import {
  ANTWORT_MAX,
  type Auswertung,
  basis,
  type BewertungsKontext,
  InhaltSchema,
  kartenMit,
  Loesungen,
  SpracheSchema,
} from './grundlagen';

/**
 * Übungstyp `frei` (PLAN §4): Freitext mit tolerantem Abgleich (PLAN §4.1: Normalisierung, Lockerungen mit Hinweis,
 * Tippfehler-Toleranz, Lexikonschutz). Eingabe mit `lang`/`dir` der Antwortsprache, Sonderzeichenleiste (de, tr) bzw.
 * arabische Bildschirmtastatur (ar, erst bei Bedarf geladen).
 */

export const FreiSchema = z.strictObject({
  ...basis,
  typ: z.literal('frei'),
  /** `uebersetze` (Standard): Vorgabe übersetzen; `antworte`: auf die Vorgabe antworten */
  anweisung: z.optional(z.enum(['uebersetze', 'antworte'])),
  vorgabe: InhaltSchema,
  /** Sprache der Antwort */
  sprache: SpracheSchema,
  loesungen: Loesungen,
});

export type FreiAufgabe = z.infer<typeof FreiSchema>;
export type FreiAntwort = { typ: 'frei'; text: string };

/** Getippte Antwort gegen Lösungen (gemeinsam für frei, hoeren_schreiben, luecke und formen). */
export function textAuswertung(
  eingabe: string,
  loesungen: readonly string[],
  sprache: Sprache,
  karten: readonly string[] | undefined,
  kontext: BewertungsKontext,
  { toleranz = true }: { toleranz?: boolean } = {},
): Auswertung {
  const e = gleicheAb(eingabe.slice(0, ANTWORT_MAX), loesungen, sprache, { toleranz, lexikon: kontext.lexikon });
  return { urteil: e.urteil, hinweise: e.hinweise, loesung: e.loesung, karten: kartenMit(karten, e.urteil) };
}

export const bewerteFrei = (a: FreiAufgabe, antwort: FreiAntwort, kontext: BewertungsKontext = {}): Auswertung =>
  textAuswertung(antwort.text, a.loesungen, a.sprache, a.karten, kontext);
