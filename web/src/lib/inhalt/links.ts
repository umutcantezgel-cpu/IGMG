/**
 * Erlaubte Linkziele (ADR 0006): https, mailto, tel und relative Pfade. Relativ heißt: ein Schrägstrich, danach weder
 * „/“ noch „\\“ – Browser lesen „/\\host“ wie „//host“ (fremder Host, Tor A SP-A-16). Gilt beim Speichern
 * (`src/lib/validierung/richtext.ts`) und beim Rendern (`RichText`).
 */
export function istErlaubterLink(href: unknown): href is string {
  return typeof href === 'string' && (/^https:\/\//.test(href) || /^mailto:/.test(href) || /^tel:/.test(href) || /^\/(?![/\\])/.test(href));
}
