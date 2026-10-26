import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { feldKlasse } from '@/components/lernapp/aufgaben/schreibmarke';

/**
 * Sichtbarer Fokus (WCAG 2.4.7, KERN 4.0 §8; Stufe C N9b): In Tailwind 4 setzt `outline-none` die Variable
 * `--tw-outline-style` auf `none`; `focus-visible:outline-2` übernimmt sie (`outline-style: var(--tw-outline-style)`). Steht
 * beides an einem Element, bleibt der Fokusring unsichtbar – so war es bei allen Antwortfeldern (`feldKlasse`). Erlaubt bleibt
 * `outline-none` nur ohne eigenen Fokusring (programmatisch fokussierte Überschriften und Zeilen mit `tabIndex={-1}`).
 */
const WURZEL = join(import.meta.dirname, '..', '..', '..', 'src', 'components', 'lernapp');
const dateien = (ordner: string): string[] =>
  readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.(tsx?|mts)$/.test(n) ? [p] : [];
  });

describe('Fokusring der Lern-App', () => {
  it('Antwortfelder: kein outline-none neben dem eigenen Fokusring', () => {
    for (const status of [null, 'angenommen', 'nicht'] as const) {
      const k = feldKlasse('de', status).split(/\s+/);
      expect(k).toContain('focus-visible:outline-2');
      expect(k).not.toContain('outline-none');
    }
  });

  it('keine Klassenliste mit outline-none und focus-visible:outline-* zugleich', () => {
    const funde: string[] = [];
    for (const datei of dateien(WURZEL)) {
      const text = readFileSync(datei, 'utf8');
      for (const m of text.matchAll(/(['"`])([^'"`]*?)\1/g)) {
        const klassen = m[2]!.split(/\s+/);
        if (klassen.includes('outline-none') && klassen.some((k) => k.startsWith('focus-visible:outline') || k.startsWith('focus:outline')))
          funde.push(`${relative(WURZEL, datei)}: ${m[2]!.slice(0, 80)}`);
      }
    }
    expect(funde).toEqual([]);
  });
});
