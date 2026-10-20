import type { ComponentType } from 'react';
import type { ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import type { AufgabenProps } from '../typen';

/**
 * Übungstypen als eigene Chunks (KERN §9: je Typ ≤ 15 KB gz, `import()` beim ersten Auftreten und vorab für die nächste
 * Aufgabe). Nur hier stehen die Importe der Übungskomponenten; der Spieler importiert keine davon statisch.
 */
export type AufgabenModul<T extends ImplementierterTyp> = { default: ComponentType<AufgabenProps<T>> };

export const AUFGABEN_LADER: { [T in ImplementierterTyp]: () => Promise<AufgabenModul<T>> } = {
  auswahl: () => import('./Auswahl'),
  wortbank: () => import('./Wortbank'),
  paare: () => import('./Paare'),
  bild_wort: () => import('./BildWort'),
  frei: () => import('./Frei'),
  hoeren_waehlen: () => import('./HoerenWaehlen'),
  hoeren_schreiben: () => import('./HoerenSchreiben'),
  minimalpaare: () => import('./Minimalpaare'),
  luecke: () => import('./Luecke'),
  satzbau: () => import('./Satzbau'),
  formen: () => import('./Formen'),
  harakat: () => import('./Harakat'),
};
