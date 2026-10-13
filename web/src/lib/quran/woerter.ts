/**
 * Wortzerlegung des Tanzil-Verstexts (ADR 0025). Wörter sind die durch Leerzeichen getrennten Teile, die arabische
 * Buchstaben enthalten; Pausen- und Sajda-Zeichen stehen als eigene Teile ohne Wortnummer. Die Zerlegung ist
 * verlustfrei: `zusammensetzen(zerlege(text)) === text` (Rundreise, im Import für alle 6.236 Verse geprüft).
 */
export type Teil = { text: string; pos: number | null };

/** Arabische Buchstaben (Grundbuchstaben inkl. Alef Wasla und erweiterter Block); keine Zeichen, Ziffern oder Marken. */
const BUCHSTABE = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FC]/u;

export function istWort(teil: string): boolean {
  return BUCHSTABE.test(teil);
}

export function zerlege(text: string): Teil[] {
  let pos = 0;
  return text.split(' ').map((t) => (istWort(t) ? { text: t, pos: ++pos } : { text: t, pos: null }));
}

export function zusammensetzen(teile: readonly Teil[]): string {
  return teile.map((t) => t.text).join(' ');
}

/** Nur die Wörter (mit Position 1…n). */
export function woerter(text: string): { text: string; pos: number }[] {
  return zerlege(text).flatMap((t) => (t.pos === null ? [] : [{ text: t.text, pos: t.pos }]));
}
