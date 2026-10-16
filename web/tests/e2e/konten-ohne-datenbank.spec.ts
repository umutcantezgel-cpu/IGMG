import { expect, test } from '@playwright/test';

/**
 * Soft-404 der Konto-Seiten (Endprüfung Stufe C; Nacharbeit 2, P3): Ohne Laufzeit-Datenbank – ein frisch importiertes
 * Vercel-Projekt im Beispielmodus – sind die Konten aus. Die teilweise vorgerenderten Konto-Seiten antworteten dann mit
 * Status 200 und Nicht-gefunden-Inhalt; jetzt schreibt der Proxy sie vor dem Rendern auf die 404-Seite der Sprache um
 * (`src/lib/konto/ohne-konten.ts`). Geprüft wird der echte HTTP-Status gegen `next start` ohne Datenbank
 * (`E2E_BASIS=… pnpm exec playwright test -c playwright.lokal.config.ts tests/e2e/konten-ohne-datenbank.spec.ts`).
 * Mit verbundener Datenbank (echter E2E-Lauf, Entwicklungsserver mit PGlite) übersprungen: Dort entscheidet die Seite.
 */
const KONTO_PFADE = [
  '/anmelden',
  '/registrieren',
  '/mein-bereich',
  '/mein-bereich/kinder',
  '/konto',
  '/passwort-vergessen',
  '/einladung/abc',
  '/de/anmelden',
  '/tr/giris',
  '/tr/kayit',
  '/tr/hesabim',
  '/en/sign-in',
  '/en/register',
  '/en/my-account',
];

test('ohne Laufzeit-Datenbank: Konto-Seiten mit echtem Status 404, öffentliche Seiten unverändert', async ({ request }, info) => {
  test.skip(info.project.name !== 'desktop', 'Statusprüfung ohne Browser nur einmal je Lauf');
  const gesundheit = await request.get('/api/health');
  test.skip(gesundheit.ok(), 'Datenbank verbunden: Konten sind an, die Seite entscheidet');

  for (const pfad of KONTO_PFADE) {
    const antwort = await request.get(pfad, { maxRedirects: 0 });
    expect(antwort.status(), pfad).toBe(404);
    expect(antwort.headers()['x-robots-tag'], pfad).toBe('noindex, nofollow');
    expect(antwort.headers()['cache-control'], pfad).toBe('private, no-store');
  }

  expect((await request.get('/gebetszeiten')).status()).toBe(200);
  expect((await request.get('/gibtsnicht')).status()).toBe(404);
  expect((await request.get('/verwaltung', { maxRedirects: 0 })).status()).not.toBe(404);
});
