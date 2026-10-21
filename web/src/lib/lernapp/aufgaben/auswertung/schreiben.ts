import { normalisiere } from '../../abgleich/vergleichsform';
import { woerter } from '../../abgleich/normalisiere';
import type { Sprache } from '../../kurse';
import { type Auswertung, kartenMit } from '../hilfen';
import type { SchreibenAntwort, SchreibenAufgabe } from '../schreiben';

/** `schreiben` (Nutzlast in `../schreiben.ts`). */

/** Kriterien der Prüfliste nach GER (Texte in `schreiben.pruefliste.<kriterium>`), je 4 Stufen (0–3). */
export const KRITERIEN = ['aufgabe', 'zusammenhang', 'wortschatz', 'grammatik'] as const;
export type Kriterium = (typeof KRITERIEN)[number];
export type Pruefliste = Partial<Record<Kriterium, 0 | 1 | 2 | 3>>;

/** Wörter eines Textes (wie die Zählung im Formular). */
export function wortzahl(text: string, sprache: Sprache): number {
  return woerter(normalisiere(text, sprache)).length;
}

export type Pruefung = {
  woerter: number;
  /** im Bereich min…max */
  laengeOk: boolean;
  /** zu kurz bzw. zu lang (für den Hinweis) */
  laenge: 'kurz' | 'passt' | 'lang';
  /** je Pflichtwort: kommt vor (Vergleichsform der Sprache; ein Wort auch mit Endung, mehrere als Wortfolge) */
  pflicht: boolean[];
};

/** Automatische Prüfung: nur Länge und Pflichtwörter. */
export function pruefeText(a: Pick<SchreibenAufgabe, 'woerter' | 'pflichtwoerter' | 'aufgabe'>, eingabe: string): Pruefung {
  const sprache = a.aufgabe.sprache;
  const w = woerter(normalisiere(eingabe, sprache));
  const n = w.length;
  const laenge = n < a.woerter.min ? 'kurz' : n > a.woerter.max ? 'lang' : 'passt';
  const kette = ` ${w.join(' ')} `;
  const pflicht = (a.pflichtwoerter ?? []).map((p) => {
    const teile = woerter(normalisiere(p, sprache));
    if (teile.length !== 1) return teile.length > 0 && kette.includes(` ${teile.join(' ')} `);
    const form = teile[0] as string;
    // ein Wort: gleich, oder (ab 3 Zeichen) mit Endung bzw. – im Arabischen – mit angehängten Klitika
    return w.some((x) => x === form || (form.length >= 3 && (x.startsWith(form) || (sprache === 'ar' && x.includes(form)))));
  });
  return { woerter: n, laengeOk: laenge === 'passt', laenge, pflicht };
}

/** Jede Selbsteinschätzung nimmt die Aufgabe an; die Note geht an die Karten. */
export function bewerteSchreiben(a: SchreibenAufgabe, antwort: SchreibenAntwort): Auswertung {
  return { urteil: 'richtig', hinweise: [], loesung: null, karten: kartenMit(a.karten, 'richtig'), selbst: antwort.selbst };
}
