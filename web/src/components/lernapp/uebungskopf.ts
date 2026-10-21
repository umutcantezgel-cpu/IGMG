import type { Aufgabe, AufgabenTyp } from '@/lib/lernapp/aufgaben/schema';
import type { SpielerTexte, UiSprache } from './typen';

/**
 * Was Spieler und Einstufung (`Einstufung.tsx`) um jede Übung herum gleich zeigen: Überschrift (Anweisung), Sprache der
 * Lösung im Rückmeldeblatt und ob „Prüfen“ erscheint. Ohne Zod und ohne Bewertung (KERN 4.0 §9).
 */

/** Anweisung ohne eigenes Feld: ein fester Text je Typ (`aufgaben.<typ>.<anweisung>`). */
const ANWEISUNG: Partial<Record<AufgabenTyp, string>> = {
  frei: 'uebersetze',
  hoeren_schreiben: 'schreibeGehoertes',
  minimalpaare: 'waehleGehoertes',
  luecke: 'ergaenze',
  satzbau: 'ordne',
  formen: 'ergaenze',
};

/** Überschrift der Aufgabe: L2-02-Typen aus `aufgaben2`, `sprechen`, `schreiben`; sonst `aufgaben.<typ>.<anweisung>`. */
export function anweisung(a: Aufgabe, texte: SpielerTexte): string {
  const z = texte.aufgaben2;
  if (a.typ === 'dialog') return z.dialog.anweisung;
  if (a.typ === 'geschichte') return z.geschichte.anweisung;
  if (a.typ === 'lesen_fragen') return z.lesenFragen.anweisung;
  if (a.typ === 'grammatik_tipp') return z.grammatikTipp.anweisung;
  if (a.typ === 'schrift_ar') return z.schriftAr[a.art];
  if (a.typ === 'schrift_tr' || a.typ === 'schrift_latein') return z.schriftWahl[a.anweisung];
  if (a.typ === 'sprechen') return texte.sprechen.anweisung;
  if (a.typ === 'schreiben') return texte.schreiben.anweisung;
  const k = ('anweisung' in a && a.anweisung) || ANWEISUNG[a.typ] || '';
  return (texte.aufgaben as unknown as Partial<Record<string, Record<string, string>>>)[a.typ]?.[k] ?? '';
}

/** Sprache der Lösung: Antwortsprache oder Sprache der richtigen Option. */
export const loesungSprache = (a: Aufgabe): UiSprache | null =>
  'sprache' in a
    ? a.sprache
    : 'richtig' in a && 'optionen' in a
      ? ((a.optionen[a.richtig] as { sprache?: UiSprache } | undefined)?.sprache ?? null)
      : null;

/**
 * Typen mit eigenem Abschluss (kein „Prüfen“ des Spielers): Paare und Geschichte geben selbst ab, Tipp, Sprechen und
 * Schreiben ebenso, Nachspuren über „Geschrieben“/„auf Papier“.
 */
export function mitPruefen(a: Aufgabe): boolean {
  if (a.typ === 'schrift_ar') return a.art !== 'nachspuren';
  return !['paare', 'geschichte', 'grammatik_tipp', 'sprechen', 'schreiben'].includes(a.typ);
}
