/**
 * Tastenkürzel der Prüfoberfläche (L3-06, ADR 0041 Nr. 10): Sie wirken überall im Prüfbereich außer in Textfeldern, in denen
 * Ziffern und Buchstaben Eingaben sind. Auswahlknöpfe (Urteil, Kategorie) und Schaltflächen zählen nicht dazu; dort wirken
 * die Kürzel, und nur dort, wo sie wirken, steht `aria-keyshortcuts` (Restmangel L3-06). Rein, ohne DOM-Typen (Unit-Test).
 */
const OHNE_TEXT = new Set(['radio', 'checkbox', 'button', 'submit', 'reset', 'image', 'range', 'color', 'file']);

export function istTexteingabe(ziel: unknown): boolean {
  if (!ziel || typeof ziel !== 'object' || !('tagName' in ziel)) return false;
  const e = ziel as { tagName: string; type?: string; isContentEditable?: boolean };
  if (e.isContentEditable) return true;
  if (e.tagName === 'INPUT') return !OHNE_TEXT.has((e.type ?? 'text').toLowerCase());
  return e.tagName === 'TEXTAREA' || e.tagName === 'SELECT';
}
