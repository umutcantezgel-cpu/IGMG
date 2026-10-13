import { expect, test } from '@playwright/test';
import ort from '../../messages/bereiche/mein-ort.json';

/**
 * Gebetszeiten „Mein Ort“ (AUFTRAG 3.8, Z-19): Standort erlaubt → Zeiten in der Nähe von Gießen, Unterschied zu Wetzlar,
 * Qibla; Standort abgelehnt → Hinweis und Ortsliste. Keine Anfrage enthält Koordinaten (Netz-Abhörung), der Rechner
 * lädt erst nach dem Klick.
 */
const t = ort.de.meinOrt;
const GIESSEN = { latitude: 50.58412, longitude: 8.67841 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Standort erlaubt: Zeiten am Ort, nichts verlässt das Gerät', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation(GIESSEN);
  const anfragen: string[] = [];
  page.on('request', (r) => anfragen.push(`${r.url()} ${r.postData() ?? ''}`));

  await page.goto('/de/gebetszeiten');
  await page.getByRole('tab', { name: t.tab }).click();
  const vorKlick = anfragen.length;
  await page.getByRole('button', { name: t.standortVerwenden }).click();
  await expect(page.getByRole('heading', { name: t.naehe.replace('{ort}', 'Gießen') })).toBeVisible();
  await expect(page.getByRole('table')).toContainText(':');
  await expect(page.getByRole('img', { name: /Qibla/ })).toBeVisible();
  // Nach dem Klick lädt nur Code (JS-Chunk), keine Anfrage trägt die Lage
  const danach = anfragen.slice(vorKlick);
  expect(danach.every((a) => !/50\.5|8\.6/.test(a))).toBe(true);
  expect(anfragen.every((a) => !/latitude|longitude|breite=|laenge=/.test(a))).toBe(true);
});

test('Standort abgelehnt: Hinweis und Ortsliste', async ({ page }) => {
  // Ablehnung wie nach „Nicht erlauben“ (headless Chromium fragt sonst nicht und läuft in die Zeitgrenze)
  await page.addInitScript(() => {
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      value: (_ok: PositionCallback, fehler?: PositionErrorCallback) =>
        fehler?.({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: 'denied' } as GeolocationPositionError),
    });
  });
  await page.goto('/de/gebetszeiten');
  await page.getByRole('tab', { name: t.tab }).click();
  await page.getByRole('button', { name: t.standortVerwenden }).click();
  await expect(page.getByRole('status').filter({ hasText: t.verweigert.slice(0, 30) })).toBeVisible({ timeout: 20_000 });
  await page.getByLabel(t.ortLabel).selectOption('Limburg an der Lahn');
  await expect(page.getByRole('heading', { name: t.zeitenFuer.replace('{ort}', 'Limburg an der Lahn') })).toBeVisible();
});

test('Ort merken überlebt Neuladen und lässt sich vergessen', async ({ page }) => {
  await page.goto('/de/gebetszeiten');
  await page.getByRole('tab', { name: t.tab }).click();
  await page.getByRole('button', { name: t.ortWaehlen }).click();
  await page.getByLabel(t.ortLabel).selectOption('Solms');
  await page.getByLabel(t.merken).check();
  await page.reload();
  await page.getByRole('tab', { name: t.tab }).click();
  await expect(page.getByRole('heading', { name: t.zeitenFuer.replace('{ort}', 'Solms') })).toBeVisible();
  await page.getByRole('button', { name: t.vergessen }).click();
  await expect(page.getByRole('button', { name: t.standortVerwenden })).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem('igmg.gebetszeiten.ort'))).toBeNull();
});
