import { expect, test } from '@playwright/test';
import quran from '../../messages/bereiche/quran.json';

/**
 * Offline-Koran (H-O01, B-27): Sure im Leser speichern, ohne Netz neu laden (Text, Wortdaten), in der Übersicht als
 * gespeichert sehen und wieder entfernen. Nur im Produktionsbetrieb (Service Worker); der Vorrat überlebt Updates.
 */
const t = quran.de.quranSeite;

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Sure offline speichern, ohne Netz lesen und wieder entfernen', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.goto('/quran/1');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await page.getByRole('button', { name: t.leser.ansicht }).click();
  await page.getByRole('button', { name: t.offline.speichern }).click();
  await expect(page.getByRole('status').filter({ hasText: t.offline.fertig })).toBeVisible({ timeout: 30_000 });
  const gespeichert = await page.evaluate(async () => {
    const c = await caches.open('igmg-koran-v1');
    return (await c.keys()).map((r) => new URL(r.url).pathname);
  });
  expect(gespeichert).toContain('/quran/1');
  expect(gespeichert).toContain('/api/quran/1/woerter');
  expect(gespeichert.some((p) => p.startsWith('/_next/static/'))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.vers-ar').first()).toBeVisible();
  // Playwright wendet „offline“ nach dem Neuladen nicht auf den neu gestarteten Service Worker an – erneut setzen
  await context.setOffline(false);
  await context.setOffline(true);
  const abruf = (adresse: string) =>
    page.evaluate(
      async (a) =>
        fetch(a).then(
          (r) => r.ok,
          () => false,
        ),
      adresse,
    );
  expect(await abruf('/api/quran/1/woerter')).toBe(true);
  // Nicht Gespeichertes ist ohne Netz wirklich nicht erreichbar
  expect(await abruf('/api/quran/2/woerter')).toBe(false);
  await page.reload();
  await expect(page.locator('.vers-ar').first()).toBeVisible();
  await context.setOffline(false);

  await page.goto('/quran');
  const liste = page.getByRole('region', { name: t.offline.liste });
  await expect(liste).toBeVisible();
  await liste.getByRole('button').first().click();
  await expect(liste).toBeHidden();
  const rest = await page.evaluate(async () => (await (await caches.open('igmg-koran-v1')).keys()).length);
  expect(rest).toBe(0);
});
