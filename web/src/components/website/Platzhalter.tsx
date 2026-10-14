import type { ReactNode } from 'react';

/** Teile „[…]“ eines Textes (G-05: Fakten, die nur die Gemeinde liefern kann, stehen bis zur Lieferung in eckigen Klammern). */
const KLAMMER = /(\[[^\]]*\])/;

/** True, wenn der Text nur aus einem Platzhalter besteht, z. B. „[Datum]“. */
export function istNurPlatzhalter(text: string): boolean {
  return /^\s*\[[^\]]*\]\s*$/.test(text);
}

/**
 * Ein Platzhalter der Gemeinde, sichtbar als solcher (Sichtabnahme Runde 2, X-9/PR-3): gestrichelt umrandet, in der
 * zweiten Textfarbe, mit `data-platzhalter` (Prüfungen und Tests finden ihn). Bricht er um, trägt jede Zeile ihren Rand.
 */
export function Platzhalter({ children }: { children: ReactNode }) {
  return (
    <span data-platzhalter className="rounded-sm border border-dashed border-rand box-decoration-clone px-1 text-tinte-2">
      {children}
    </span>
  );
}

/** Text mit Platzhaltern „[…]“: Jeder Platzhalter wird als `Platzhalter` gesetzt, der übrige Text bleibt unverändert. */
export function MitPlatzhaltern({ text }: { text: string }) {
  return text
    .split(KLAMMER)
    .map((teil, i) => (teil.startsWith('[') && teil.endsWith(']') ? <Platzhalter key={i}>{teil}</Platzhalter> : teil));
}
