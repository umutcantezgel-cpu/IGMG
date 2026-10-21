import { normalisiere } from '../../abgleich/vergleichsform';
import { gemischteIndizes } from '../../engine/zufall';
import type { Sprache } from '../../kurse';
import type { Inhalt } from '../grundlagen';
import { type Auswertung, kartenMit, RFN } from '../hilfen';
import type { LeseFrage, LesenFragenAntwort, LesenFragenAufgabe } from '../lesen_fragen';

export { RFN, type Rfn } from '../hilfen';

/** `lesen_fragen` (Nutzlast in `../lesen_fragen.ts`): Zahl der Antwortmöglichkeiten einer Frage. */
export const optionenAnzahl = (f: LeseFrage): number => (f.art === 'auswahl' ? f.optionen.length : RFN.length);
/** Index der richtigen Antwort einer Frage. */
export const richtigerIndex = (f: LeseFrage): number => (f.art === 'auswahl' ? f.richtig : RFN.indexOf(f.richtig));

/** Anzeigereihenfolge der Optionen (Auswahl gemischt, „richtig / falsch / nicht im Text“ fest). */
export function leseReihenfolge(a: Pick<LesenFragenAufgabe, 'fragen' | 'schluessel'>, frage: number): number[] {
  const f = a.fragen[frage];
  if (!f) return [];
  return f.art === 'auswahl' ? gemischteIndizes(f.optionen.length, `${a.schluessel}#${frage}`) : RFN.map((_, i) => i);
}

/** Je Frage: richtig beantwortet? */
export const richtigJeFrage = (a: Pick<LesenFragenAufgabe, 'fragen'>, wahlen: readonly number[]): boolean[] =>
  a.fragen.map((f, i) => wahlen[i] === richtigerIndex(f));

/** Alle Fragen richtig → richtig, sonst falsch. */
export function bewerteLesenFragen(a: LesenFragenAufgabe, antwort: LesenFragenAntwort): Auswertung {
  const ok = richtigJeFrage(a, antwort.wahlen);
  const urteil = antwort.wahlen.length === a.fragen.length && ok.every(Boolean) ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: null, karten: kartenMit(a.karten, urteil) };
}

/** Ein Stück eines Absatzes: Wort (antippbar, wenn es eine Glosse hat) oder Zwischenraum/Satzzeichen. */
export type Stueck = { text: string; wort: boolean };

const WORT = /[\p{L}\p{M}\p{N}]+(?:['’-][\p{L}\p{M}\p{N}]+)*/gu;

/** Absatz in Wörter und Zwischenräume zerlegen; zusammengesetzt ergibt sich wieder genau der Text. */
export function stuecke(text: string): Stueck[] {
  const teile: Stueck[] = [];
  let pos = 0;
  for (const m of text.matchAll(WORT)) {
    const i = m.index ?? 0;
    if (i > pos) teile.push({ text: text.slice(pos, i), wort: false });
    teile.push({ text: m[0], wort: true });
    pos = i + m[0].length;
  }
  if (pos < text.length) teile.push({ text: text.slice(pos), wort: false });
  return teile;
}

/** Glossen nach Vergleichsform (einmal je Aufgabe). */
export function glossenVerzeichnis(a: Pick<LesenFragenAufgabe, 'glossen'>, sprache: Sprache): Map<string, Inhalt> {
  return new Map((a.glossen ?? []).map((g) => [normalisiere(g.wort, sprache), g.glosse]));
}

/** Glosse zu einem Wort des Texts, sonst null. */
export function glosseFuer(verzeichnis: ReadonlyMap<string, Inhalt>, wort: string, sprache: Sprache): Inhalt | null {
  return verzeichnis.get(normalisiere(wort, sprache)) ?? null;
}
