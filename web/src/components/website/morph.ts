import type { CSSProperties } from 'react';

/**
 * Gemeinsame Elemente im Seitenwechsel (B-05, O-13): Die Detailseite trägt den Übergangsnamen fest, die Karte bekommt
 * ihn erst beim Klick von `SeitenUebergang` (Markierung `data-morph-karte` an der Karte, `data-morph` am Element).
 * So gibt es nie zwei gleiche Namen auf einer Seite. Klasse `morph`: 400 ms, `ease-standard` (globals.css).
 */
export function morphStil(name: string): CSSProperties {
  return { viewTransitionName: name, viewTransitionClass: 'morph' } as CSSProperties;
}
