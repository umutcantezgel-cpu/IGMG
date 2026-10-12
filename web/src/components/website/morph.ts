import type { CSSProperties } from 'react';

/**
 * Gemeinsame Elemente im Seitenwechsel (B-05, O-13): Die Detailseite trägt den Übergangsnamen fest, die Karte bekommt
 * ihn erst beim Klick von `SeitenUebergang` (Markierung `data-morph-karte` an der Karte, `data-morph` am Element).
 * So gibt es nie zwei gleiche Namen auf einer Seite. Klasse `morph`: 400 ms, `ease-eintritt` (globals.css).
 * Titel (`text`) tragen zusätzlich die Klasse `text`: Sie brechen auf Karte und Detailseite verschieden um und werden
 * deshalb nicht gestreckt und nicht gleichzeitig überblendet (Sichtabnahme E3: Geisterbilder).
 */
export function morphStil(name: string, art: 'text' | 'bild' = 'bild'): CSSProperties {
  return { viewTransitionName: name, viewTransitionClass: morphKlasse(art) } as CSSProperties;
}

/** Übergangsklasse(n) eines gemeinsamen Elements. */
export function morphKlasse(art: string | undefined): string {
  return art === 'titel' || art === 'text' ? 'morph text' : 'morph';
}
