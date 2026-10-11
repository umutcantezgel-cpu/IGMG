import { expect, test } from '@playwright/test';
import fehlerseiten from '../../messages/bereiche/fehlerseiten.json';
import gebetszeiten from '../../messages/bereiche/gebetszeiten.json';

/**
 * D-P1 (PWA, K-08): Manifest und Symbole, Service Worker aktiv, Gebetszeiten offline aus dem Vorrat, sonst die
 * Offline-Seite; Verwaltung wird nie vorgehalten.
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Manifest und Symbole', async ({ request }) => {
  const m = await request.get('/manifest.webmanifest');
  expect(m.status()).toBe(200);
  const daten = (await m.json()) as { name: string; start_url: string; icons: { src: string }[] };
  expect(daten).toMatchObject({ name: 'IGMG Wetzlar', start_url: '/' });
  for (const i of daten.icons) expect((await request.get(i.src)).status()).toBe(200);
});

test('offline: Gebetszeiten aus dem Vorrat, andere Seiten → Offline-Seite', async ({ page, context }) => {
  test.setTimeout(60_000);
  await page.goto('/gebetszeiten');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Seite einmal unter Kontrolle des Workers laden (vorhalten)
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const vorrat = await page.evaluate(async () => (await caches.keys()).join(','));
  expect(vorrat).toContain('igmg-v1-seiten');

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: gebetszeiten.de.gebetszeiten.titel })).toBeVisible();
  await page.goto('/veranstaltungen').catch(() => undefined);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(fehlerseiten.de.fehlerseiten.offline.titel);
  await context.setOffline(false);
});

test('Verwaltung wird nie vorgehalten', async ({ page }) => {
  await page.goto('/gebetszeiten');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.goto('/verwaltung/anmelden');
  const eintraege = await page.evaluate(async () => {
    const c = await caches.open('igmg-v1-seiten');
    return (await c.keys()).map((r) => new URL(r.url).pathname);
  });
  expect(eintraege.some((p) => p.startsWith('/verwaltung'))).toBe(false);
});
