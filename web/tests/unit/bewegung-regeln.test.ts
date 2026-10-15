import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Bewegungsregister B-01 (Kern K-007, Stufe C Z-05): Bei reduzierter Bewegung gibt es keine Größen- oder Lageänderung auf
 * Hover und Druck – die Rückmeldung bleibt allein die Farbe. Die Druck-Skalierung kommt nur aus der Utility `druck`
 * (globals.css, nur bei `prefers-reduced-motion: no-preference`); Skalieren über die active-Variante und Verschieben auf
 * Hover ohne `motion-safe:` sind im Quelltext verboten.
 */
const WURZEL = join(import.meta.dirname, '..', '..', 'src');
const CSS = readFileSync(join(WURZEL, 'app', 'globals.css'), 'utf8');

function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}
const quellen = dateien(WURZEL).map((p) => ({ name: p.slice(WURZEL.length + 1), text: readFileSync(p, 'utf8') }));

/** Klassen-Token (durch Leerraum, Anführungszeichen oder Backticks getrennt) mit Zustand und Bewegung. */
const BEWEGUNG_AUF_ZUSTAND = /(?:^|:)(?:group-|peer-)?(?:hover|active|focus|focus-visible|focus-within):-?(?:scale|translate|rotate)-/;

function funde(muster: (token: string) => boolean): string[] {
  return quellen.flatMap(({ name, text }) =>
    text.split('\n').flatMap((zeile, i) =>
      zeile
        .split(/[\s'"`{}()]+/)
        .filter(muster)
        .map((t) => `${name}:${i + 1} ${t}`),
    ),
  );
}

describe('B-01 Druck-Rückmeldung und reduzierte Bewegung', () => {
  it('die Prüfung greift (Quelltext gelesen, `druck` im Einsatz)', () => {
    expect(quellen.length).toBeGreaterThan(300);
    expect(funde((t) => t === 'druck').length).toBeGreaterThan(100);
  });

  it('keine Skalierung über die active-Variante im Quelltext – stattdessen die Utility `druck`', () => {
    expect(funde((t) => /(?:^|:)active:scale-/.test(t))).toEqual([]);
  });

  it('keine Größe oder Lage auf Hover, Fokus oder Druck ohne `motion-safe:`', () => {
    expect(funde((t) => BEWEGUNG_AUF_ZUSTAND.test(t) && !t.startsWith('motion-safe:'))).toEqual([]);
  });

  it('`druck` skaliert nur ohne Wunsch nach reduzierter Bewegung', () => {
    const block = /@utility druck \{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';
    expect(block).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*&:active \{\s*scale: 98%;\s*\}\s*\}/);
    // außerhalb der Medienabfrage keine Skalierung
    expect(block.replace(/@media[\s\S]*$/, '')).not.toMatch(/scale/);
  });
});
