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
  dialog: () => import('./Dialog'),
  geschichte: () => import('./Geschichte'),
  lesen_fragen: () => import('./LesenFragen'),
  grammatik_tipp: () => import('./GrammatikTipp'),
  schrift_ar: () => import('./SchriftAr'),
  // ein Chunk für beide Lateinschrift-Vorkurse (gleicher Aufbau)
  schrift_tr: () => import('./SchriftWahl') as Promise<AufgabenModul<'schrift_tr'>>,
  schrift_latein: () => import('./SchriftWahl') as Promise<AufgabenModul<'schrift_latein'>>,
  sprechen: () => import('../sprechen/Sprechen'),
  schreiben: () => import('../schreiben/Schreiben'),
};
