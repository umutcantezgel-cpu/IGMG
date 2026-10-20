import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Rechts-nach-links-Regeln der Lern-App (KERN 4.0 §7, ADR 0037 Nr. 6): In `src/components/lernapp/**` und
 * `src/app/lern-app/**` nur logische Richtungen (`ms-/me-/ps-/pe-/start-/end-/text-start/text-end`, `rounded-s/-e`,
 * `border-s/-e`); Spiegelung gerichteter Zeichen über `rtl:`. Physische Richtungen (links/rechts) sind verboten – in
 * Klassen wie in Stilobjekten.
 */
const WURZEL = join(import.meta.dirname, '..', '..', '..', 'src');
const ORDNER = [join(WURZEL, 'components', 'lernapp'), join(WURZEL, 'app', 'lern-app')];

function dateien(ordner: string): string[] {
  if (!existsSync(ordner)) return [];
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.(tsx?|css)$/.test(n) ? [p] : [];
  });
}

/** Physische Richtung in einem Klassen-Token (mit beliebigen Varianten davor, z. B. `md:hover:ml-2`, `-mr-1`). */
const PHYSISCH_KLASSE =
  /(?:^|:)-?(?:m[lr]|p[lr]|scroll-m[lr]|scroll-p[lr]|left|right|border-[lr]|rounded-[lr]|rounded-[tb][lr]|inset-[lr]|space-x-reverse)(?:-|$)|(?:^|:)(?:text|float|clear)-(?:left|right)$|(?:^|:)origin-(?:top-|bottom-)?(?:left|right)$/;
/** Physische Richtung in Stilobjekten oder CSS. */
const PHYSISCH_STIL =
  /\b(?:margin|padding|border)(?:Left|Right)\b|\b(?:margin|padding|border)-(?:left|right)\s*:|(?:^|[\s{;,])(?:left|right)\s*:\s*[-\d]/;

function tokens(text: string): string[] {
  return text.split(/[\s'"`{}()[\],;]+/).filter(Boolean);
}

const quellen = ORDNER.flatMap(dateien).map((p) => ({ name: p.slice(WURZEL.length + 1), text: readFileSync(p, 'utf8') }));

describe('Lern-App: nur logische Richtungen', () => {
  it('die Prüfung greift (Dateien gelesen; Muster erkennen physische Richtungen)', () => {
    expect(quellen.length).toBeGreaterThan(20);
    for (const boese of [
      'ml-2',
      'md:mr-4',
      '-pl-1',
      'pr-6',
      'left-0',
      'hover:right-2',
      'text-left',
      'text-right',
      'rounded-l-md',
      'rounded-tr-lg',
      'border-r',
      'border-l-2',
      'float-left',
      'origin-left',
      'scroll-ml-4',
    ])
      expect(PHYSISCH_KLASSE.test(boese), boese).toBe(true);
    for (const gut of [
      'ms-2',
      'me-auto',
      'ps-4',
      'pe-1',
      'start-4',
      'end-0',
      'text-start',
      'text-end',
      'rounded-s-md',
      'border-e',
      'rtl:rotate-180',
      'leading-ueberschrift',
      'inset-x-0',
      'lern-leiste',
      'mt-1',
      'pb-5',
      'max-w-einleitung',
    ])
      expect(PHYSISCH_KLASSE.test(gut), gut).toBe(false);
    expect(PHYSISCH_STIL.test('style={{ marginLeft: 4 }}')).toBe(true);
    expect(PHYSISCH_STIL.test('padding-right: 2px;')).toBe(true);
    expect(PHYSISCH_STIL.test("{ '--anteil': anteil }")).toBe(false);
  });

  it('keine physischen Richtungen in Klassen', () => {
    const funde = quellen.flatMap(({ name, text }) =>
      text.split('\n').flatMap((zeile, i) =>
        tokens(zeile)
          .filter((t) => PHYSISCH_KLASSE.test(t))
          .map((t) => `${name}:${i + 1} ${t}`),
      ),
    );
    expect(funde).toEqual([]);
  });

  it('keine physischen Richtungen in Stilobjekten oder CSS', () => {
    const funde = quellen.flatMap(({ name, text }) =>
      text.split('\n').flatMap((zeile, i) => (PHYSISCH_STIL.test(zeile) ? [`${name}:${i + 1} ${zeile.trim()}`] : [])),
    );
    expect(funde).toEqual([]);
  });

  it('gerichtete Zeichen spiegeln sich: Pfeile nach vorn/zurück tragen eine rtl-Variante', () => {
    const funde = quellen.flatMap(({ name, text }) =>
      text
        .split('\n')
        .flatMap((zeile, i) =>
          /<(?:ArrowLeft|ArrowRight|ChevronLeft|ChevronRight)\b/.test(zeile) && !/rtl:/.test(zeile) ? [`${name}:${i + 1}`] : [],
        ),
    );
    expect(funde).toEqual([]);
  });
});
