/**
 * Erlaubte Linkziele (ADR 0006): https, mailto, tel und relative Pfade. Relativ heißt: ein Schrägstrich, danach weder
 * „/“ noch „\\“ – Browser lesen „/\\host“ wie „//host“ (fremder Host, Tor A SP-A-16). Gilt beim Speichern
 * (`src/lib/validierung/richtext.ts`) und beim Rendern (`RichText`).
 */
export function istErlaubterLink(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  // Steuerzeichen (Tab, Zeilenumbruch …) entfernt der URL-Parser still („/\t/host“ → „//host“, Tor B/C SP-B B7) –
  // ganz ablehnen. Leerzeichen bleiben erlaubt (tel:+49 …), sie werden nicht entfernt.
  if (/[\u0000-\u001f\u007f]/.test(href)) return false;
  return /^https:\/\//.test(href) || /^mailto:/.test(href) || /^tel:/.test(href) || /^\/(?![/\\])/.test(href);
}
