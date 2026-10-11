import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Unit-Tests (T2) und Integrationstests (T3). Integration läuft gegen eine frische PGlite-Datenbank
 * je Testdatei (tests/integration/hilfen/db.ts). `server-only` wird im Test durch eine leere Datei ersetzt.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      'server-only': resolve(import.meta.dirname, 'tests/hilfen/leer.ts'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
          environment: 'node',
          // next-intl (nur Referenz in tests/unit/navigation.test.ts) importiert „next/navigation“ ohne Endung
          server: { deps: { inline: ['next-intl'] } },
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['tests/integration/hilfen/umgebung.ts'],
          // Formular-Tests lösen bis zu vier echte ALTCHA-Aufgaben (PBKDF2, Zähler bis 10 000); eine Lösung dauert auf
          // 4 Kernen unter Last bis ≈40 s. Die Grenze gilt der Rechenzeit, nicht den Prüfungen.
          testTimeout: 240_000,
          hookTimeout: 60_000,
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/db/schema/**', 'src/lib/**/*.d.ts'],
      reporter: ['text-summary', 'json-summary'],
      thresholds: { lines: 80, statements: 80 },
    },
  },
});
