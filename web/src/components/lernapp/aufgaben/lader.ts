import type { ComponentType } from 'react';
import type { Bewerter, BewertungsKontext } from '@/lib/lernapp/aufgaben/hilfen';
import type { AntwortVon, AufgabeVon, AufgabenTyp, Auswertung, ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import type { AufgabenProps } from '../typen';

/**
 * Übungstypen als eigene Chunks (KERN §9: je Typ ≤ 15 KB gz, `import()` beim ersten Auftreten und vorab für die nächste
 * Aufgabe). Nur hier stehen die Importe der Übungskomponenten; der Spieler importiert keine davon statisch.
 *
 * Jedes Modul bringt neben der Komponente (`default`) seine Bewertung mit (`bewerte`, aus `lib/lernapp/aufgaben`), damit
 * keine Bewertung in der Spieler-Route liegt. `ladeTyp` merkt sie sich; `bewerterFuer` gibt sie der Engine
 * (`pruefe(s, antwort, bewerte)`). Geprüft wird erst, wenn die Komponente steht – also nach dem Laden.
 */
export type AufgabenModul<T extends ImplementierterTyp> = {
  default: ComponentType<AufgabenProps<T>>;
  bewerte: (aufgabe: AufgabeVon<T>, antwort: AntwortVon<T>, kontext?: BewertungsKontext) => Auswertung;
};

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
  wahr_falsch: () => import('./WahrFalsch'),
  zuordnen: () => import('./Zuordnen'),
  reihenfolge: () => import('./Reihenfolge'),
  fallfrage: () => import('./Fallfrage'),
  koran_wort: () => import('./KoranWort'),
};

const BEWERTER: Partial<Record<AufgabenTyp, Bewerter>> = {};

/** Chunk eines Übungstyps laden und seine Bewertung merken. */
export function ladeTyp<T extends ImplementierterTyp>(typ: T): Promise<AufgabenModul<T>> {
  return AUFGABEN_LADER[typ]().then((m) => {
    BEWERTER[typ] = m.bewerte as unknown as Bewerter;
    return m;
  });
}

/** Bewertung eines geladenen Übungstyps (sonst `undefined`). */
export const bewerterFuer = (typ: AufgabenTyp): Bewerter | undefined => BEWERTER[typ];
