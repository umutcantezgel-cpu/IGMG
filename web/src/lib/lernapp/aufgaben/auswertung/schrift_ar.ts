import { gemischteIndizes } from '../../engine/zufall';
import { type Auswertung, kartenMit } from '../hilfen';
import type { BuchstabeSlug, SchriftArAntwort, SchriftArAufgabe } from '../schrift_ar';

/** `schrift_ar` (Nutzlast in `../schrift_ar.ts`): Optionen als Buchstaben, Ziel zuerst. */
export const schriftOptionen = (a: Pick<SchriftArAufgabe, 'ziel' | 'ablenker'>): BuchstabeSlug[] => [a.ziel, ...(a.ablenker ?? [])];

/** Anzeigereihenfolge der Optionen (deterministisch gemischt). */
export const schriftReihenfolge = (a: Pick<SchriftArAufgabe, 'ziel' | 'ablenker' | 'schluessel'>): number[] =>
  gemischteIndizes(schriftOptionen(a).length, a.schluessel);

/** Wahl: Index 0 ist richtig; Nachspuren: gezeichnet oder auf Papier geschrieben gilt als richtig. */
export function bewerteSchriftAr(a: SchriftArAufgabe, antwort: SchriftArAntwort): Auswertung {
  if (a.art === 'nachspuren') {
    const urteil = 'spur' in antwort ? 'richtig' : 'falsch';
    return { urteil, hinweise: [], loesung: null, karten: kartenMit(a.karten, urteil) };
  }
  const urteil = 'wahl' in antwort && antwort.wahl === 0 ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: null, karten: kartenMit(a.karten, urteil) };
}
