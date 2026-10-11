import { defineConfig, devices } from '@playwright/test';

/**
 * E2E-Tests (T4, T5, T8). Läuft gegen den standalone-Produktions-Build (wie Docker) auf Port 3100,
 * Datenbank und Mailpit aus docker compose (ADR 0011). Breiten 390 und 1440 px (K-11, T5).
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASIS = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 2,
  retries: 0,
  forbidOnly: true,
  reporter: [['list'], ['json', { outputFile: 'test-results/ergebnis.json' }]],
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
    command: 'node scripts/start-standalone.mjs',
    url: `${BASIS}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PORT: String(PORT), APP_URL: BASIS, BETTER_AUTH_URL: BASIS, NEXT_TELEMETRY_DISABLED: '1' },
  },
});
