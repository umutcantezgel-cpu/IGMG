import { gemischteIndizes } from '../../engine/zufall';
import { type Auswertung, kartenMit } from '../hilfen';
import type { ZuordnenAntwort, ZuordnenAufgabe } from '../zuordnen';

/**
 * `zuordnen` (Nutzlast in `../zuordnen.ts`): Paarmenge Eintrag → Kategorie; richtig nur, wenn jeder Eintrag stimmt (ein
 * Teilerfolg ist „noch nicht ganz“, die Übung zeigt je Eintrag, was stimmt). Die Lösung nennt jede Zuordnung.
 */

/** Anzeigereihenfolge der Einträge (Indizes in `eintraege`); die Kategorien stehen in Inhaltsreihenfolge. */
export const zuordnenReihenfolge = (a: Pick<ZuordnenAufgabe, 'eintraege' | 'schluessel'>): number[] =>
  gemischteIndizes(a.eintraege.length, a.schluessel);

/** Je Eintrag: stimmt die gewählte Kategorie? (fehlende Wahl zählt als falsch) */
export const pruefeZuordnung = (a: Pick<ZuordnenAufgabe, 'eintraege'>, zuordnung: readonly number[]): boolean[] =>
  a.eintraege.map((e, i) => zuordnung[i] === e.kategorie);

/** Antwort nur, wenn jeder Eintrag eine Kategorie hat. */
export const vollstaendig = (a: Pick<ZuordnenAufgabe, 'eintraege' | 'kategorien'>, zuordnung: readonly (number | undefined)[]): boolean =>
  a.eintraege.every((_, i) => {
    const k = zuordnung[i];
    return k !== undefined && k >= 0 && k < a.kategorien.length;
  });

export function bewerteZuordnen(a: ZuordnenAufgabe, antwort: ZuordnenAntwort): Auswertung {
  const urteil = pruefeZuordnung(a, antwort.zuordnung).every(Boolean) ? 'richtig' : 'falsch';
  const loesung = a.eintraege.map((e) => `${e.text}: ${a.kategorien[e.kategorie] ?? ''}`).join(' · ');
  return { urteil, hinweise: [], loesung, karten: kartenMit(a.karten, urteil) };
}
