import { distance } from 'fastest-levenshtein';

/**
 * Tippfehler-Toleranz (PLAN §4.1): Levenshtein-Abstand je Wort (`fastest-levenshtein`), eine Vertauschung benachbarter
 * Buchstaben zählt als ein Fehler. „Tippfehler, trotzdem richtig“ gilt nur innerhalb der Grenzen je Wortlänge und nie,
 * wenn die Antwort ein anderes gültiges Kurswort ist (Lexikonschutz).
 */

/** Erlaubte Fehler je Wort nach der Länge (in Zeichen) des längeren Wortes: unter 4 keiner, 4–9 einer, ab 10 zwei. */
export function erlaubteFehler(laenge: number): number {
  if (laenge < 4) return 0;
  return laenge < 10 ? 1 : 2;
}

/** Höchstens so viele Wörter eines Satzes dürfen einen Tippfehler haben (ein Wort je angefangene drei, mindestens eins). */
export function maxTippfehlerWoerter(woerter: number): number {
  return Math.max(1, Math.floor(woerter / 3));
}

const zeichen = (w: string) => Array.from(w);

/** Genau eine Vertauschung zweier benachbarter, verschiedener Zeichen. */
export function istVertauschung(a: string, b: string): boolean {
  const x = zeichen(a);
  const y = zeichen(b);
  if (x.length !== y.length || x.length < 2) return false;
  const abweichend = x.flatMap((z, i) => (z === y[i] ? [] : [i]));
  if (abweichend.length !== 2) return false;
  const [i, j] = abweichend as [number, number];
  return j === i + 1 && x[i] === y[j] && x[j] === y[i];
}

/** Abstand zweier Wörter: Levenshtein, eine Vertauschung benachbarter Zeichen zählt 1. Symmetrisch. */
export function tippAbstand(a: string, b: string): number {
  if (a === b) return 0;
  return istVertauschung(a, b) ? 1 : distance(a, b);
}

/** Länge in Zeichen (Codepunkte). */
export function laenge(w: string): number {
  return zeichen(w).length;
}

/**
 * Liegt `antwort` als Tippfehler innerhalb der Grenze zu `loesung`? `formen` sind weitere Vergleichsformen desselben
 * Paares (z. B. nach allen Lockerungen); es zählt der kleinste Abstand. Die Grenze richtet sich nach dem längeren Wort,
 * damit der Vergleich symmetrisch bleibt.
 */
export function imTippfehlerBereich(antwort: string, loesung: string, formen: readonly (readonly [string, string])[] = []): boolean {
  const grenze = erlaubteFehler(Math.max(laenge(antwort), laenge(loesung)));
  if (grenze === 0) return false;
  const abstand = Math.min(tippAbstand(antwort, loesung), ...formen.map(([a, b]) => tippAbstand(a, b)));
  return abstand <= grenze;
}
