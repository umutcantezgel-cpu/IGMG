import type { ReactElement, ReactNode } from 'react';

/**
 * Kleiner Ersatz für die React-Hooks EINER Komponente, damit Unit-Tests ohne Browser (environment node, kein jsdom)
 * Klicks, Eingaben und Ankerwechsel einer Client-Insel nachstellen können. Nachgebildet ist, was React dabei verspricht:
 * Zustand nach Aufrufreihenfolge; gleicher Wert bricht ohne Neuzeichnen ab (Object.is); Änderungen in einem Ereignis
 * werden gebündelt und danach einmal gezeichnet; Zustand beim Rendern angepasst zeichnet sofort neu; useSyncExternalStore
 * liest den Stand bei jedem Rendern, beim Hydrieren zuerst den Server-Stand, und zeichnet neu, wenn das Abo eine Änderung
 * meldet. Kinder werden nicht gerendert (flach): Tests suchen Elemente im Baum und rufen deren Handler auf.
 *
 * Einbinden (vor dem Import der Komponente, die Datei darf react-dom nicht nutzen):
 * `vi.mock('react', async (original) => ({ ...(await original<object>()), ...(await import('../hilfen/haken')).HAKEN }))`.
 * Diese Datei importiert React nur als Typ, sonst wäre der Mock zirkulär.
 */
let plaetze: unknown[] = [];
let platz = 0;
let veraltet = false;
let hydrierend = false;
/** Abos der zuletzt montierten Komponente (beim nächsten Montieren abgemeldet). */
let abmelden: (() => void)[] = [];

function useState<T>(start: T | (() => T)): [T, (neu: T | ((alt: T) => T)) => void] {
  const i = platz++;
  if (!(i in plaetze)) plaetze[i] = typeof start === 'function' ? (start as () => T)() : start;
  const setze = (neu: T | ((alt: T) => T)) => {
    const wert = typeof neu === 'function' ? (neu as (alt: T) => T)(plaetze[i] as T) : neu;
    if (Object.is(wert, plaetze[i])) return;
    plaetze[i] = wert;
    veraltet = true;
  };
  return [plaetze[i] as T, setze];
}

function useRef<T>(start: T): { current: T } {
  const i = platz++;
  if (!(i in plaetze)) plaetze[i] = { current: start };
  return plaetze[i] as { current: T };
}

function useId(): string {
  return ':test:';
}

function useSyncExternalStore<T>(abonniere: (melden: () => void) => () => void, lies: () => T, server?: () => T): T {
  const i = platz++;
  const wert = hydrierend && server ? server() : lies();
  if (!(i in plaetze)) {
    const eintrag = { wert };
    plaetze[i] = eintrag;
    abmelden.push(
      abonniere(() => {
        if (!Object.is(lies(), eintrag.wert)) veraltet = true;
      }),
    );
  }
  (plaetze[i] as { wert: T }).wert = wert;
  return wert;
}

/** Die nachgebildeten Hooks für `vi.mock('react', …)`. */
export const HAKEN = { useState, useRef, useId, useSyncExternalStore };

/**
 * Montiert eine Komponente (Zustand frisch). `hydrieren`: erster Durchlauf mit dem Server-Stand, danach wie React ein
 * zweiter mit dem Stand im Browser. `nach` führt ein Ereignis aus und zeichnet danach, falls sich etwas geändert hat;
 * `mitProps` zeichnet mit neuen Props des Elternteils (Zustand bleibt).
 */
export function montiere<P>(komponente: (props: P) => ReactNode, props: P, { hydrieren = false } = {}) {
  for (const abo of abmelden) abo();
  abmelden = [];
  plaetze = [];
  let aktuelleProps = props;
  let baum: ReactNode = null;
  const zeichne = () => {
    for (let runde = 0; runde < 25; runde++) {
      veraltet = false;
      platz = 0;
      baum = komponente(aktuelleProps);
      if (!veraltet) return;
    }
    throw new Error('Rendern kommt nicht zur Ruhe');
  };
  hydrierend = hydrieren;
  zeichne();
  hydrierend = false;
  if (hydrieren) zeichne();
  return {
    get baum() {
      return baum;
    },
    nach(ereignis: () => void) {
      veraltet = false;
      ereignis();
      if (veraltet) zeichne();
    },
    mitProps(neu: P) {
      aktuelleProps = neu;
      zeichne();
    },
  };
}

type Element = ReactElement<Record<string, unknown>>;

const istElement = (knoten: unknown): knoten is Element =>
  typeof knoten === 'object' && knoten !== null && '$$typeof' in knoten && 'props' in knoten;

/** Alle Elemente des Baums in Dokumentreihenfolge (Komponenten werden nicht aufgerufen). */
export function elemente(knoten: unknown): Element[] {
  if (Array.isArray(knoten)) return knoten.flatMap(elemente);
  if (!istElement(knoten)) return [];
  return [knoten, ...elemente(knoten.props.children)];
}
