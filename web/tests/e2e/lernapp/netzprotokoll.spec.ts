import { expect, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { KURS, LEKTION_1, spieleLektion1 } from './hilfen';

/**
 * Netzprotokoll ohne Konto (KERN 4.0 §6, ADR 0038 Nr. 1, Abnahme Z-L08): Start, Lernpfad, Einheit offline speichern, eine
 * Lektion, Einstellung ändern, Wiederholen und Tipps – alle Anfragen der Seiten und des Service Workers sind GET an den eigenen
 * Ursprung; keine API (auch nicht `/api/lernapp/sitzung`), keine Cookies.
 */
test('ohne Konto: nur GET an den eigenen Ursprung, keine API, keine Cookies', async ({ page, context, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'einmal je Lauf genügt');
  test.setTimeout(150_000);
  const ursprung = new URL(baseURL ?? 'http://localhost').origin;
  const anfragen: { methode: string; url: string; worker: boolean }[] = [];
  context.on('request', (r) => anfragen.push({ methode: r.method(), url: r.url(), worker: Boolean(r.serviceWorker()) }));

  await page.goto('/lern-app/de');
  await expect(page.getByText(de.heute.nochNichts)).toBeVisible();
  await page.goto(`/lern-app/de/${KURS}`);
  await page.getByRole('button', { name: de.lernpfad.offline }).click();
  await expect(page.locator('main').getByText(de.lernpfad.offlineFertig.split(' (')[0]!).first()).toBeVisible({ timeout: 60_000 });
  await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, 'tastatur');
  await page.goto('/lern-app/de/einstellungen');
  await page.getByRole('radio', { name: de.einstellungen.zielKeins, exact: true }).check();
  await expect(page.getByRole('status').filter({ hasText: de.einstellungen.gespeichert })).toBeVisible();
  await page.goto(`/lern-app/de/${KURS}/wiederholen`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.wiederholen.titel);
  await page.goto(`/lern-app/de/${KURS}/tipps?e=tr.a1.e01`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.tipps.titel);
  await page.goto('/lern-app/de');
  await expect(page.getByText(de.heute.nochNichts)).toHaveCount(0);

  expect(anfragen.length).toBeGreaterThan(10);
  const fremd = anfragen.filter((a) => a.methode !== 'GET' || new URL(a.url).origin !== ursprung);
  expect(fremd).toEqual([]);
  expect(anfragen.filter((a) => new URL(a.url).pathname.startsWith('/api/'))).toEqual([]);
  // der Worker hat Pakete bzw. Seiten selbst geholt (auch seine Anfragen sind im Protokoll)
  expect(anfragen.some((a) => a.worker)).toBe(true);
  expect(await context.cookies()).toEqual([]);
});
