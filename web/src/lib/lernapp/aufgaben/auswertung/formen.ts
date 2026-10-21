import { HINWEIS_SCHLUESSEL, type HinweisSchluessel, type Urteil } from '../../abgleich';
import type { FormenAntwort, FormenAufgabe } from '../formen';
import { type Auswertung, type BewertungsKontext, kartenMit } from '../hilfen';
import { textAuswertung } from './text';

/**
 * `formen` (Nutzlast in `../formen.ts`): Jede offene Zelle wird wie `frei` abgeglichen; das Urteil der Aufgabe ist das
 * schwächste der Zellen, Hinweise werden vereinigt („leer“ nur, wenn gar nichts eingetragen ist).
 */

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
