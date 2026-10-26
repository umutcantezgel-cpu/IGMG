import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * E2E-Tests (T4, T5, T8). Läuft gegen den standalone-Produktions-Build (wie Docker) auf Port 3100,
 * Datenbank und Mailpit aus docker compose (ADR 0011). Breiten 390 und 1440 px (K-11, T5).
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASIS = `http://localhost:${PORT}`;

// Eigene Datenbank igmg_e2e (E-019): gilt für den Server und für Hilfsskripte der Tests (Einladungen),
// weil `tsx --env-file` bereits gesetzte Variablen nicht überschreibt.
if (existsSync('.env')) process.loadEnvFile('.env');
if (!process.env.E2E_DATENBANK_GESETZT) {
  const basis = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
  if (basis && !process.env.E2E_DATABASE_URL) {
    const url = new URL(basis);
    url.pathname = '/igmg_e2e';
    process.env.E2E_DATABASE_URL = url.toString();
  }
  process.env.ENTWICKLUNG_DATABASE_URL = process.env.DATABASE_URL;
  if (process.env.E2E_DATABASE_URL) process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;
  process.env.E2E_DATENBANK_GESETZT = '1';
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 2,
  retries: 0,
  forbidOnly: true,
  reporter: [['list'], ['json', { outputFile: 'test-results/ergebnis.json' }]],
  globalSetup: './tests/e2e/hilfen/global-setup.ts',
  use: {
    baseURL: BASIS,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'telefon', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'node scripts/e2e-datenbank.mjs && node scripts/start-standalone.mjs',
    url: `${BASIS}/api/health`,
    reuseExistingServer: false,
    // Die E2E-Datenbank importiert alle Lern-App-Inhalte (Stand 25.10.2026: ≈ 147.000 Einträge, gemessen 158 s) vor dem Start;
    // unter Last deutlich länger.
    timeout: 600_000,
    env: {
      PORT: String(PORT),
      APP_URL: BASIS,
      BETTER_AUTH_URL: BASIS,
      NEXT_TELEMETRY_DISABLED: '1',
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      // Vorgerenderte Seiten stammen aus der Entwicklungsdatenbank → beim Start verfallen lassen (ADR 0017)
      CACHE_ERNEUERN_BEIM_START: '1',
      // Die Tests spielen den vertrauten Proxy: je Test eine eigene Absenderadresse (hilfen/konto.ts, E-041)
      PROXY_VERTRAUEN: '1',
    },
  },
});
