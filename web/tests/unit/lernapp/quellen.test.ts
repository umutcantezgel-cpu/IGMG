import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LIZENZTEXTE } from '@/lib/lernapp/lizenztexte';
import { BIBLIOTHEKEN, SCHRIFTEN } from '@/lib/lernapp/quellen';

/**
 * Quellen und Lizenzen der Lern-App (ADR 0044 Nr. 7): Fassungen wie in node_modules, Lizenzen wie in den Paketen,
 * Lizenztexte gleich den Lizenzdateien (ohne Urheberzeile), Urheberzeilen aus den Lizenzdateien.
 */
const WEB = join(import.meta.dirname, '..', '..', '..');
const paket = (name: string) => JSON.parse(readFileSync(join(WEB, 'node_modules', name, 'package.json'), 'utf8'));
const normal = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('Quellen der Lern-App', () => {
  it('Bibliotheken: Fassung und Lizenz wie das installierte Paket', () => {
    const zuPaket: Record<string, string> = {
      next: 'next',
      react: 'react',
      'lucide-react': 'lucide-react',
      idb: 'idb',
      'ts-fsrs': 'ts-fsrs',
      'fastest-levenshtein': 'fastest-levenshtein',
    };
    for (const b of BIBLIOTHEKEN) {
      const p = paket(zuPaket[b.id]);
      expect(b.version, b.id).toBe(p.version);
      expect(b.lizenz, b.id).toBe(p.license);
    }
  });

  it('Schriften: Fassung der @fontsource-Pakete, OFL, Urheber aus der Lizenzdatei', () => {
    const datei: Record<string, [string, string]> = {
      'atkinson-hyperlegible-next': ['@fontsource/atkinson-hyperlegible-next', 'src/fonts/atkinson-hyperlegible-next-OFL.txt'],
      'noto-sans-arabic': ['@fontsource/noto-sans-arabic', 'src/fonts/noto-sans-arabic-OFL.txt'],
      amiri: ['@fontsource/amiri', 'src/fonts/amiri-OFL.txt'],
    };
    for (const s of SCHRIFTEN) {
      expect(s.lizenz, s.id).toBe('OFL-1.1');
      if (!datei[s.id]) continue;
      const [name, lizenz] = datei[s.id];
      expect(s.version, s.id).toBe(paket(name).version);
      expect(normal(readFileSync(join(WEB, lizenz), 'utf8')), s.id).toContain(normal(s.urheber));
    }
    expect(SCHRIFTEN.map((s) => s.id)).toEqual(['atkinson-hyperlegible-next', 'noto-sans-arabic', 'amiri', 'igmg-wetzlar-titel']);
  });

  it('Lizenztexte gleich den Lizenzdateien', () => {
    expect(normal(readFileSync(join(WEB, 'node_modules', 'fastest-levenshtein', 'LICENSE.md'), 'utf8'))).toContain(normal(LIZENZTEXTE.MIT));
    expect(normal(readFileSync(join(WEB, 'node_modules', 'next', 'license.md'), 'utf8'))).toContain(normal(LIZENZTEXTE.MIT));
    expect(normal(readFileSync(join(WEB, 'node_modules', 'idb', 'LICENSE'), 'utf8'))).toContain(normal(LIZENZTEXTE.ISC));
    for (const ofl of ['noto-sans-arabic-OFL.txt', 'amiri-OFL.txt', 'atkinson-hyperlegible-next-OFL.txt'])
      expect(normal(readFileSync(join(WEB, 'src', 'fonts', ofl), 'utf8')), ofl).toContain(normal(LIZENZTEXTE['OFL-1.1']));
    expect(LIZENZTEXTE['OFL-1.1']).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });
});
