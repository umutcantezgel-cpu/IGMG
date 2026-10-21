import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { AbschlussRing } from '@/components/lernapp/Abschluss';
import { Abzeichen } from '@/components/lernapp/Abzeichen';
import { Serie, SERIE_GEFUELLT } from '@/components/lernapp/Serie';
import { Pegel, zeigePegel } from '@/components/lernapp/sprechen/Pegel';
import type { WochenTag } from '@/lib/lernapp/ereignisse/serie';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';

/**
 * Bausteine mit Bewegung aus dem Register der Lern-App (KERN 4.0 §10): B-30 Abschluss (Ring zeichnet sich), B-33 Serie
 * (heutiger Stern füllt sich einmal am Tag), B-34 Abzeichen (Auftritt nur in CSS). Die reduzierte Variante prüft
 * `tests/unit/bewegung-regeln.test.ts`; hier Aufbau, Text statt Farbe und „einmal am Tag“.
 */
const HEUTE = '2026-10-21';
const WOCHE: WochenTag[] = [
  { tag: '2026-10-19', art: 'gelernt' },
  { tag: '2026-10-20', art: 'pause' },
  { tag: HEUTE, art: 'gelernt' },
  { tag: '2026-10-22', art: 'zukunft' },
  { tag: '2026-10-23', art: 'zukunft' },
  { tag: '2026-10-24', art: 'zukunft' },
  { tag: '2026-10-25', art: 'zukunft' },
];

class Speicher {
  daten = new Map<string, string>();
  getItem = (k: string) => this.daten.get(k) ?? null;
  setItem = (k: string, v: string) => void this.daten.set(k, v);
}
const g = globalThis as unknown as { localStorage?: Speicher };
afterEach(() => {
  delete g.localStorage;
});

describe('B-30 Abschluss', () => {
  it('Achtstern-Ring als Linie, die sich zeichnet (pathLength 1), rein dekorativ', () => {
    const h = renderToStaticMarkup(<AbschlussRing />);
    expect(h).toMatch(/^<svg aria-hidden="true"/);
    expect(h).toMatch(/pathLength="1" class="linie-zeichnet"/);
  });
});

describe('B-33 Serie (Wochenband)', () => {
  it('sieben Tage mit Zustand als Text; Zahl statisch; ohne Gerätespeicher steht der Stern gefüllt', () => {
    const h = renderToStaticMarkup(<Serie laenge={2} woche={WOCHE} heute={HEUTE} texte={de.serie} ui="de" ziffern="oestlich" />);
    expect([...h.matchAll(/<li /g)]).toHaveLength(7);
    expect(h).toContain('2 Lerntage in Folge');
    expect(h).toContain(`(${de.serie.heute}): ${de.serie.gelernt}`);
    expect(h).toContain(`: ${de.serie.pause}`);
    expect([...h.matchAll(/fill-gruen-700/g)]).toHaveLength(2);
    expect(h).not.toContain('stern-fuellt');
  });

  it('heute gelernt: der Stern füllt sich nur beim ersten Anzeigen am Tag', () => {
    g.localStorage = new Speicher();
    const erstes = renderToStaticMarkup(<Serie laenge={2} woche={WOCHE} heute={HEUTE} texte={de.serie} ui="de" ziffern="oestlich" />);
    expect([...erstes.matchAll(/stern-fuellt/g)]).toHaveLength(1);
    g.localStorage.setItem(SERIE_GEFUELLT, HEUTE);
    const zweites = renderToStaticMarkup(<Serie laenge={2} woche={WOCHE} heute={HEUTE} texte={de.serie} ui="de" ziffern="oestlich" />);
    expect(zweites).not.toContain('stern-fuellt');
  });

  it('arabische Oberfläche: Plural und östliche Ziffern', () => {
    const h = renderToStaticMarkup(<Serie laenge={3} woche={WOCHE} heute={HEUTE} texte={ar.serie} ui="ar" ziffern="oestlich" />);
    expect(h).toContain('\u0663');
  });
});

describe('B-34 Abzeichen', () => {
  it('neu: Auftritt mit Deckkraft und Skalierung 0,96 → 1 nur in CSS, reduziert ohne Skalierung', () => {
    const h = renderToStaticMarkup(<Abzeichen name="[Abzeichen]" neu neuText={de.abzeichen.neu} />);
    expect(h).toContain('starting:scale-96');
    expect(h).toContain('starting:opacity-0');
    expect(h).toContain('motion-reduce:starting:scale-100');
    expect(h).toContain(de.abzeichen.neu);
    expect(renderToStaticMarkup(<Abzeichen name="[Abzeichen]" />)).not.toContain('starting:');
  });
});

describe('B-35 Pegel (Aufnahme läuft)', () => {
  it('Balken startet leer, Text steht immer da; reduziert ohne Balken', () => {
    const h = renderToStaticMarkup(<Pegel balken={null} text={de.sprechen.laeuft} />);
    expect(h).toContain(`>${de.sprechen.laeuft}</span>`);
    expect(h).toContain('scale:0 1');
    expect(h).toContain('motion-reduce:hidden');
  });

  it('der Pegel geht direkt an den Balken (begrenzt auf 0…1), ohne React-Zustand je Animationsbild (INP)', () => {
    const balken = { style: { scale: '0 1' } };
    zeigePegel(balken, 0.42);
    expect(balken.style.scale).toBe('0.42 1');
    zeigePegel(balken, 3);
    expect(balken.style.scale).toBe('1 1');
    zeigePegel(balken, -1);
    expect(balken.style.scale).toBe('0 1');
    expect(() => zeigePegel(null, 0.5)).not.toThrow();
    const quelle = readFileSync(join(import.meta.dirname, '../../../src/components/lernapp/sprechen/Sprechen.tsx'), 'utf8');
    expect(quelle).not.toMatch(/setPegel|useState\([^)]*\)[^;]*pegel/i);
    expect(quelle).toContain('onPegel: (p) => zeigePegel(pegelBalken.current, p)');
  });
});
