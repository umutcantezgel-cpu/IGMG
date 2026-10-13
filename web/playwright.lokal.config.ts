import { defineConfig, devices } from '@playwright/test';

/**
 * Ersatzlauf ohne Docker (UMGEBUNGSAUSNAHME Docker-E2E): gegen einen laufenden Server (Entwicklung oder `next start`
 * mit Bau-Datenbank) unter E2E_BASIS; ohne Mailpit und ohne eigene E2E-Datenbank. Nur für Specs ohne Mail/Anmeldung.
 */
const BASIS = process.env.E2E_BASIS ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 90_000,
  use: {
    baseURL: BASIS,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    launchOptions: { executablePath: process.env.CHROMIUM_PFAD ?? '/opt/pw-browsers/chromium' },
  },
  projects: [
    { name: 'telefon', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
