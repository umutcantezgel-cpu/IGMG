import type { ReactNode } from 'react';

/**
 * Platzhalter der Gemeinde „[…]“ (G-05). Öffentliche Seiten zeigen sie nicht – die Regeln stehen in
 * `src/lib/inhalt/platzhalter.ts` (`angabe`, `ohnePlatzhalter`). Nur die Rechtstexte kennzeichnen sie weiterhin sichtbar
 * (`MitPlatzhaltern`): Dort darf nichts stillschweigend fehlen.
 */
export { angabe, hatPlatzhalter, istNurPlatzhalter, ohnePlatzhalter } from '@/lib/inhalt/platzhalter';

/** Teile „[…]“ eines Textes (G-05: Fakten, die nur die Gemeinde liefern kann, stehen bis zur Lieferung in eckigen Klammern). */
const KLAMMER = /(\[[^\]]*\])/;

/**
 * Ein Platzhalter der Gemeinde, sichtbar als solcher (Sichtabnahme Runde 2, X-9/PR-3): gestrichelt umrandet, in der
 * zweiten Textfarbe, mit `data-platzhalter` (Prüfungen und Tests finden ihn). Bricht er um, trägt jede Zeile ihren Rand.
 * Nur noch in den Rechtstexten.
 */
export function Platzhalter({ children }: { children: ReactNode }) {
  return (
    <span data-platzhalter className="rounded-sm border border-dashed border-rand box-decoration-clone px-1 text-tinte-2">
      {children}
    </span>
  );
}

/**
 * Text mit Platzhaltern „[…]“: Jeder Platzhalter wird als `Platzhalter` gesetzt, der übrige Text bleibt unverändert.
 * Für die Rechtstexte (Impressum, Datenschutz, Barrierefreiheit); alle anderen öffentlichen Texte nutzen
 * `ohnePlatzhalter` bzw. `Text platzhalter`.
 */
export function MitPlatzhaltern({ text }: { text: string }) {
  return text
    .split(KLAMMER)
    .map((teil, i) => (teil.startsWith('[') && teil.endsWith(']') ? <Platzhalter key={i}>{teil}</Platzhalter> : teil));
}
