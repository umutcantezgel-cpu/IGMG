import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * P4 (echte E2E): Skripte unter `tsx --conditions=react-server` laden die Module der App außerhalb von Next. Seit N4 zog
 * der Chat-Dienst den Mail-Ausgang und damit den Einstieg von next-intl nach; dessen Client-Teil bricht dort mit
 * „createContext is not a function“ ab – `scripts/beispielkonten.ts` lief nicht mehr, und mit ihm alle E2E-Abläufe der
 * Lernplattform (konten, mein-bereich-lernen). Geprüft wird je Skript: Alle eigenen Module lassen sich so laden.
 */
const WEB = resolve(import.meta.dirname, '..', '..');
const SKRIPTE = [
  'scripts/beispielkonten.ts',
  'scripts/startklar.ts',
  'scripts/inhalte-import.ts',
  'scripts/inhalte-2026.ts',
  'drizzle/seeds/index.ts',
  'scripts/lernapp/import.ts',
  'scripts/lernapp/pruefen.ts',
];

/** Eigene Module (relative Pfade) eines Skripts als absolute Pfade. */
function eigeneModule(skript: string): string[] {
  const quelle = readFileSync(join(WEB, skript), 'utf8');
  const pfade = [...quelle.matchAll(/(?:from|import)\s+'(\.{1,2}\/[^']+)'/g)].map((t) => t[1]);
  return pfade.map((p) => resolve(dirname(join(WEB, skript)), p));
}

describe('Skripte mit --conditions=react-server', () => {
  it('laden alle eigenen Module (ohne next-intl-Client-Teil)', () => {
    const pfade = [...new Set(SKRIPTE.flatMap(eigeneModule))];
    expect(pfade.length).toBeGreaterThan(10);
    const ordner = mkdtempSync(join(tmpdir(), 'igmg-react-server-'));
    try {
      const datei = join(ordner, 'laden.mts');
      // Nacheinander laden: Bei einem Fehler nennt die Ausgabe das Modul
      writeFileSync(
        datei,
        `for (const m of ${JSON.stringify(pfade)}) {\n  try { await import(m); } catch (e) { console.error('MODUL ' + m + ': ' + String(e)); process.exitCode = 1; }\n}\n`,
      );
      let ausgabe = '';
      try {
        execFileSync('pnpm', ['-s', 'exec', 'tsx', '--conditions=react-server', datei], {
          cwd: WEB,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, DATABASE_URL: '', NODE_ENV: 'test' },
        });
      } catch (e) {
        ausgabe = String((e as { stderr?: string }).stderr ?? e);
      }
      expect(ausgabe.split('\n').filter((z) => z.startsWith('MODUL '))).toEqual([]);
      expect(ausgabe).toBe('');
    } finally {
      rmSync(ordner, { recursive: true, force: true });
    }
  }, 120_000);
});
