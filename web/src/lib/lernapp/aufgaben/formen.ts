import { HINWEIS_SCHLUESSEL, type HinweisSchluessel, type Urteil } from '../abgleich';
import * as z from '../z';
import { textAuswertung } from './frei';
import {
  ab,
  type Auswertung,
  basis,
  type BewertungsKontext,
  InhaltSchema,
  kartenMit,
  liste,
  Loesungen,
  SpracheSchema,
  text,
} from './grundlagen';

/**
 * Übungstyp `formen` (Konjugation, Endungen, PLAN §4): Eine Tabelle mit Zeilen- und Spaltenköpfen; offene Zellen sind
 * Eingabefelder mit Kopfbezug (Beschriftung aus Zeile und Spalte), vorgegebene Zellen stehen als Text. Jede offene Zelle
 * wird wie `frei` abgeglichen; das Urteil der Aufgabe ist das schwächste der Zellen, Hinweise werden vereinigt.
 */

const ZelleSchema = z.strictObject({
  zeile: ab(0),
  spalte: ab(0),
  loesungen: Loesungen,
  /** vorgegeben (als Text gezeigt, nicht abgefragt) */
  vorgabe: z.optional(z.boolean()),
});

export const FormenSchema = z
  .strictObject({
    ...basis,
    typ: z.literal('formen'),
    /** Sprache der Formen */
    sprache: SpracheSchema,
    /** Sprache der Köpfe (Standard: wie die Formen) */
    kopfsprache: z.optional(SpracheSchema),
    /** z. B. das Lemma, dessen Formen gefragt sind */
    titel: z.optional(InhaltSchema),
    zeilen: liste(text(60), 1, 12),
    spalten: liste(text(60), 1, 8),
    zellen: liste(ZelleSchema, 1, 96),
  })
  .check(
    z.superRefine((a, ctx) => {
      const orte = new Set<string>();
      a.zellen.forEach((c, i) => {
        if (c.zeile >= a.zeilen.length || c.spalte >= a.spalten.length)
          ctx.addIssue({ code: 'custom', message: 'Zelle außerhalb der Tabelle', path: ['zellen', i] });
        const ort = `${c.zeile}:${c.spalte}`;
        if (orte.has(ort)) ctx.addIssue({ code: 'custom', message: 'Zelle doppelt', path: ['zellen', i] });
        orte.add(ort);
      });
      if (!a.zellen.some((c) => !c.vorgabe)) ctx.addIssue({ code: 'custom', message: 'keine offene Zelle', path: ['zellen'] });
    }),
  );

export type FormenAufgabe = z.infer<typeof FormenSchema>;
/** Eingaben je Zelle (Index wie `zellen`; vorgegebene Zellen werden nicht gelesen). */
export type FormenAntwort = { typ: 'formen'; werte: string[] };

const RANG: Record<Urteil, number> = { richtig: 0, tippfehler: 1, falsch: 2 };

export type ZellenErgebnis = { index: number; urteil: Urteil; loesung: string };

/** Ergebnis je offener Zelle (für die Anzeige nach dem Prüfen). */
export function pruefeZellen(
  a: FormenAufgabe,
  werte: readonly string[],
  kontext: BewertungsKontext = {},
): (ZellenErgebnis & {
  hinweise: HinweisSchluessel[];
})[] {
  return a.zellen.flatMap((c, index) => {
    if (c.vorgabe) return [];
    const e = textAuswertung(werte[index] ?? '', c.loesungen, a.sprache, undefined, kontext);
    return [{ index, urteil: e.urteil, loesung: e.loesung ?? c.loesungen[0] ?? '', hinweise: e.hinweise }];
  });
}

/** Beschriftung einer Zelle aus ihren Köpfen (eine Spalte: nur die Zeile). */
export const zellenKopf = (a: Pick<FormenAufgabe, 'zeilen' | 'spalten'>, c: { zeile: number; spalte: number }): string =>
  a.spalten.length > 1 ? `${a.zeilen[c.zeile] ?? ''}, ${a.spalten[c.spalte] ?? ''}` : (a.zeilen[c.zeile] ?? '');

export function bewerteFormen(a: FormenAufgabe, antwort: FormenAntwort, kontext: BewertungsKontext = {}): Auswertung {
  const zellen = pruefeZellen(a, antwort.werte, kontext);
  const urteil = zellen.reduce<Urteil>((u, z) => (RANG[z.urteil] > RANG[u] ? z.urteil : u), 'richtig');
  const alle = new Set(zellen.flatMap((z) => z.hinweise));
  // „leer“ nur, wenn gar nichts eingetragen ist
  if (zellen.some((z) => !z.hinweise.includes('leer'))) alle.delete('leer');
  const hinweise = HINWEIS_SCHLUESSEL.filter((h) => alle.has(h));
  const loesung = zellen.map((z) => `${zellenKopf(a, a.zellen[z.index]!)}: ${z.loesung}`).join(' · ');
  return { urteil, hinweise, loesung, karten: kartenMit(a.karten, urteil) };
}
