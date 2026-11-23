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

/**
 * Rundgang (23.11.2026): Ohne Laufzeit-Datenbank zeigt jede Adresse der Verwaltung statt der Anmeldung die Aufnahmen aller
 * Bildschirme hinter der Anmeldung (`src/components/verwaltung/rundgang/Rundgang.tsx`).
 */
test('ohne Laufzeit-Datenbank: die Verwaltung zeigt den Rundgang mit Aufnahmen', async ({ page, request }) => {
  const gesundheit = await request.get('/api/health');
  test.skip(gesundheit.ok(), 'Datenbank verbunden: Die Verwaltung zeigt die Anmeldung');

  await page.goto('/verwaltung/anmelden');
  await expect(page.getByRole('heading', { level: 1, name: 'Rundgang durch Verwaltung und Mitgliederbereich' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8);
  expect(await page.locator('main article').count()).toBeGreaterThan(50);
  // Sprungmarke aus der Leiste führt zum Bereich, die erste Aufnahme dort lädt wirklich
  await page.getByRole('navigation', { name: 'Bereiche des Rundgangs' }).getByRole('link', { name: 'Mitgliederbereich' }).click();
  await expect(page).toHaveURL(/#mitglieder$/);
  const bild = page.locator('#mein-bereich img').first();
  await bild.scrollIntoViewIfNeeded();
  await expect.poll(() => bild.evaluate((b: HTMLImageElement) => b.complete && b.naturalWidth > 0)).toBe(true);
  // kein waagrechtes Scrollen der Seite, weder am Telefon noch am Computer
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  // jede Adresse der Verwaltung zeigt den Rundgang
  await page.goto('/verwaltung');
  await expect(page.getByRole('heading', { level: 1, name: 'Rundgang durch Verwaltung und Mitgliederbereich' })).toBeVisible();
});

/**
 * Weg der Besucher: Startseite, im Kopf „Anmelden“. Ohne Konten führt der Link in die Verwaltung; dorthin gibt es keinen
 * Seitenwechsel-Übergang (`ohneUebergang` in SeitenUebergang.tsx) – sonst blieb die Startseite sekundenlang über dem
 * Rundgang stehen. Nur am Computer (am Telefon liegt der Link im Menü) und nur, wenn der Bau die Konten aus hat.
 */
test('ohne Laufzeit-Datenbank: „Anmelden“ im Kopf führt ohne hängenden Übergang zum Rundgang', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop', 'der Link im Kopf steht nur in der breiten Ansicht');
  const gesundheit = await request.get('/api/health');
  test.skip(gesundheit.ok(), 'Datenbank verbunden: Die Verwaltung zeigt die Anmeldung');

  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
  await page.goto('/');
  const link = page.getByRole('banner').locator('a[href="/verwaltung/anmelden"]').filter({ visible: true });
  test.skip((await link.count()) === 0, 'Bau mit Konten: „Anmelden“ führt zum Gemeinde-Konto');
  await link.first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Rundgang durch Verwaltung und Mitgliederbereich' })).toBeVisible();
  // kein laufender Übergang, die Startseite ist nicht mehr zu sehen
  const uebergaenge = await page.evaluate(
    () => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.includes('view-transition')).length,
  );
  expect(uebergaenge).toBe(0);
  await expect(page.locator('[data-seite]').filter({ visible: true })).toHaveCount(0);
  // und zurück zur Website
  await page.getByRole('link', { name: 'Zur Website' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('[data-seite]').filter({ visible: true })).toHaveCount(1);
});
