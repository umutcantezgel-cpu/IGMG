import { gemischteIndizes } from '../engine/zufall';
import * as z from '../z';
import { ab, basis, InhaltSchema, kartenMit, MitAudio, mitOptionen, Optionen } from './bausteine';
import type { Auswertung } from './schema';

/**
 * Gemeinsamer Aufbau der Schrift-Vorkurse mit Lateinschrift (PLAN §4.4): `schrift_tr` (ç ğ ı İ ö ş ü, Vorkurs für de/ar → tr)
 * und `schrift_latein` (Lateinalphabet, Groß/Klein, Umlaute, Vorkurs für ar → de/tr). Bewertung nach Index, Bedienung wie
 * `minimalpaare`: Radiogruppe, Ziffern 1–n, optional ein Hörbeispiel mit „langsam“ und „Ich kann gerade nicht hören“.
 *
 * Anweisungen:
 * - `waehleBuchstabe`: Laut hören bzw. Wort mit Lücke sehen, Buchstaben wählen.
 * - `waehleWort`: Buchstaben bzw. Laut vorgegeben, das Wort wählen, in dem er vorkommt.
 * - `grossKlein`: Buchstaben sehen, die andere Schreibung (groß ↔ klein) wählen.
 */

export const SCHRIFT_ANWEISUNGEN = ['waehleBuchstabe', 'waehleWort', 'grossKlein'] as const;

export function schriftWahlSchema<T extends 'schrift_tr' | 'schrift_latein'>(typ: T) {
  return z
    .strictObject({
      ...basis,
      typ: z.literal(typ),
      anweisung: z.enum(SCHRIFT_ANWEISUNGEN),
      /** Sichtbare Vorgabe (Buchstabe, Wort mit Lücke `_`) */
      vorgabe: z.optional(InhaltSchema),
      /** Hörbeispiel (nur mit Audio; ohne Vorgabe fällt die Aufgabe ohne Ton weg) */
      hoeren: z.optional(MitAudio),
      optionen: Optionen,
      richtig: ab(0),
    })
    .check(
      z.superRefine(mitOptionen),
      z.superRefine((a, ctx) => {
        if (!a.vorgabe && !a.hoeren) ctx.addIssue({ code: 'custom', message: 'Vorgabe oder Hörbeispiel fehlt', path: ['vorgabe'] });
      }),
    );
}

export type SchriftWahlAufgabe = {
  schluessel: string;
  karten?: string[];
  typ: 'schrift_tr' | 'schrift_latein';
  anweisung: (typeof SCHRIFT_ANWEISUNGEN)[number];
  vorgabe?: z.infer<typeof InhaltSchema>;
  hoeren?: z.infer<typeof MitAudio>;
  optionen: z.infer<typeof InhaltSchema>[];
  richtig: number;
};

/** Ohne Ton (Hörübungen aus oder kein Audio) bleibt nur die sichtbare Vorgabe; ohne sie gibt es nichts zu lösen. */
export const ohneTonLoesbar = (a: Pick<SchriftWahlAufgabe, 'vorgabe'>): boolean => Boolean(a.vorgabe);

/** Anzeigereihenfolge der Optionen (deterministisch gemischt). */
export const schriftWahlReihenfolge = (a: Pick<SchriftWahlAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

export function bewerteSchriftWahl(a: SchriftWahlAufgabe, wahl: number): Auswertung {
  const urteil = wahl === a.richtig ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: a.optionen[a.richtig]?.text ?? null, karten: kartenMit(a.karten, urteil) };
}
