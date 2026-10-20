import { gemischteIndizes } from '../engine/zufall';
import { type AntwortVon, type Auswertung, type AuswahlAufgabe, kartenMit } from './schema';

/**
 * Übungstyp `auswahl` (PLAN §4): eine richtige Option; Bewertung nach Index. Anzeige als Radiogruppe (Pfeiltasten,
 * Ziffern 1–n), Reihenfolge der Optionen deterministisch gemischt.
 */

/** Anzeigereihenfolge der Optionen (Indizes in die Inhaltsreihenfolge). */
export const auswahlReihenfolge = (a: AuswahlAufgabe): number[] => gemischteIndizes(a.optionen.length, a.schluessel);

export function bewerteAuswahl(a: AuswahlAufgabe, antwort: AntwortVon<'auswahl'>): Auswertung {
  const urteil = antwort.wahl === a.richtig ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: a.optionen[a.richtig]?.text ?? null, karten: kartenMit(a.karten, urteil) };
}
