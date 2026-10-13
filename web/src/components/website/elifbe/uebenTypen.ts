import type { FormArt, UebungsArt, UebungsDaten } from '@/lib/elifbe/uebung';

/** Texte der Übungsinsel (vom Server; Platzhalter {nr}, {anzahl}, {antwort}, {name} ersetzt die Insel selbst). */
export type UebenTexte = Record<
  | 'wahl'
  | 'alle'
  | 'alleText'
  | 'frageErkennen'
  | 'frageZuordnen'
  | 'frageLesen'
  | 'frageNachspuren'
  | 'richtig'
  | 'falsch'
  | 'spurNochmal'
  | 'spurLoeschen'
  | 'spurUeberspringen'
  | 'spurGeschafft'
  | 'weiter'
  | 'fertigTitel'
  | 'nochEineRunde'
  | 'andereUebung'
  | 'aufgabe'
  | 'sterne'
  | 'geuebt'
  | 'vergessen'
  | 'laden'
  | 'zeichenfeld',
  string
> & {
  arten: Record<UebungsArt, { titel: string; text: string }>;
  formen: Record<FormArt, string>;
  /** Abschlusstext je Zahl richtiger Antworten (Index 0 … Rundenlänge). */
  fertig: string[];
};

/** Glyphe zum Nachspuren: Umriss, Punkte und Hauptzüge im Koordinatensystem von glyphen.json. */
export type SpurGlyphe = {
  slug: string;
  name: string;
  viewBox: string;
  rumpf: string;
  punkte: string[];
  zuege: { d: string; breite: number }[];
};

export type UebenDaten = UebungsDaten & { spur: SpurGlyphe[] };

/** Länge einer Runde. */
export const RUNDE = 8;

/** Platzhalter `{name}` in einem Text ersetzen (ohne next-intl im Browser). */
export function fuelle(text: string, werte: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in werte ? String(werte[k]) : m));
}
