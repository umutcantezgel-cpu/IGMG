// Nur lokal für den Probelauf von tests/e2e/elifbe.spec.ts gegen den Entwicklungsserver (Port 3104); wird nicht eingecheckt.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /elifbe\.spec\.ts/,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 120_000,
  use: { baseURL: 'http://localhost:3104', locale: 'de-DE', timezoneId: 'Europe/Berlin', launchOptions: { executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' } },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'telefon', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, browserName: 'chromium' } },
  ],
});
