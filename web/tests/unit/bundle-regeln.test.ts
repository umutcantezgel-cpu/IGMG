import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * K-12 (JS ≤ 180 kB): Regeln für Client-Code öffentlicher Seiten, die `pnpm messen` sonst erst spät zeigt
 * (FEHLERSTATISTIK A18, E-026, E-030).
 */
const WURZEL = join(import.meta.dirname, '..', '..', 'src');
function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}
const OEFFENTLICH = [
  join(WURZEL, 'components', 'website'),
  join(WURZEL, 'components', 'formular'),
  join(WURZEL, 'app', '[locale]', '(website)'),
];
const client = OEFFENTLICH.flatMap(dateien).filter((p) => readFileSync(p, 'utf8').startsWith("'use client'"));

describe('Client-Code öffentlicher Seiten', () => {
  it('es gibt Client-Komponenten (Prüfung greift)', () => {
    expect(client.length).toBeGreaterThan(10);
  });

  it.each(client.map((p) => [p.slice(WURZEL.length + 1), p]))(
    '%s: kein tailwind-merge (cn), kein next-intl, keine Pfadtabelle aus next-intl',
    (_n, p) => {
      // nur Laufzeit-Importe zählen (`import type` entfällt beim Kompilieren)
      const laufzeit = readFileSync(p, 'utf8')
        .split('\n')
        .filter((z) => z.startsWith('import ') && !z.startsWith('import type '));
      expect(laufzeit.filter((z) => /from '(@\/lib\/utils|next-intl[^']*|@\/i18n\/routing)'/.test(z))).toEqual([]);
    },
  );

  it('nur eine Fehlergrenze (global-error.tsx), sie importiert keine gemeinsamen Seitenbausteine', () => {
    expect(() => statSync(join(WURZEL, 'app', '[locale]', 'error.tsx'))).toThrow();
    const s = readFileSync(join(WURZEL, 'app', 'global-error.tsx'), 'utf8');
    expect(s).not.toMatch(/PageHeader|Seitenkopf|Statusblock|lucide-react|@\/i18n\//);
  });
});
