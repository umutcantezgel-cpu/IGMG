import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { kartenstand, KARTE_WASSER, KURS, LEKTION_1, spieleLektion1, swSteuert } from './hilfen';

/**
 * Regressionen nach den Prüfungen von L1 (Gegenprüfung und S-L1):
 * - ADR 0042 Fortschreibung S2 Nr. 3: Die Lern-App ist `crossOriginIsolated` (COOP/COEP) – auch auf den Übungsseiten, auf
 *   denen Whisper mit Threads läuft; die Website nicht.
 * - ADR 0037 Folgen: Ein Update des Root-Service-Workers der Website löscht die Vorräte `igmg-lernapp-*` nicht.
 * - KERN 4.0 §6, ADR 0038 Nr. 8: Lernstand als Datei sichern und auf einem anderen Gerät einlesen.
 * - S-L1 N-1: Seitennamen an der Stelle der Oberflächensprache liefern die 404 der Lern-App, nie die echte Seite.
 */

test('crossOriginIsolated auf den Übungsseiten und im ganzen /lern-app, nicht auf der Website', async ({ page }) => {
  for (const pfad of [
    `/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`,
    '/lern-app/ar/de-aus-ar/ueben',
    '/lern-app/tr',
    '/lern-app/de/einstellungen',
  ]) {
    await page.goto(pfad);
    expect(await page.evaluate(() => self.crossOriginIsolated), pfad).toBe(true);
  }
  await page.goto('/');
  expect(await page.evaluate(() => self.crossOriginIsolated)).toBe(false);
});

test('Update des Root-Service-Workers behält die Vorräte der Lern-App', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/lern-app/de');
  await swSteuert(page);
  const lernVorraete = () => page.evaluate(async () => (await caches.keys()).filter((n) => n.startsWith('igmg-lernapp-')).sort());
  await expect.poll(lernVorraete, { timeout: 30_000 }).toEqual(expect.arrayContaining([expect.stringMatching(/^igmg-lernapp-schale-v/)]));
  const vorher = await lernVorraete();

  // Website: Root-Worker zweimal mit neuer Adresse anmelden (= zwei Updates); jedes Aktivieren räumt seine alten Vorräte –
  // ein veralteter Vorrat der Website verschwindet (Beleg, dass aufgeräumt wurde), die der Lern-App bleiben
  await page.goto('/');
  await page.evaluate(async () => void (await caches.open('igmg-v0-veraltet')));
  for (const v of ['regression-1', 'regression-2'])
    await page.evaluate(async (v) => {
      const r = await navigator.serviceWorker.register(`/sw.js?${v}`, { scope: '/' });
      const w = r.installing ?? r.waiting ?? r.active;
      if (w && w.state !== 'activated')
        await new Promise<void>((fertig) => w.addEventListener('statechange', () => w.state === 'activated' && fertig()));
    }, v);
  const scopes = await page.evaluate(async () =>
    (await navigator.serviceWorker.getRegistrations()).map((r) => new URL(r.scope).pathname).sort(),
  );
  expect(scopes).toEqual(['/', '/lern-app/']);
  expect(await lernVorraete()).toEqual(vorher);
  expect(await page.evaluate(async () => (await caches.keys()).includes('igmg-v0-veraltet'))).toBe(false);
});

test('Lernstand als Datei sichern und auf einem anderen Gerät einlesen', async ({ page, browser }, info) => {
  test.setTimeout(120_000);
  await page.goto(`/lern-app/de/${KURS}/ueben?l=${LEKTION_1}`);
  await spieleLektion1(page, info.project.name === 'telefon' ? 'tippen' : 'tastatur');
  const stand = await kartenstand(page, KARTE_WASSER);
  expect(stand).not.toBeNull();

  await page.goto('/lern-app/de/einstellungen');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: de.einstellungen.sichern }).click(),
  ]);
  await expect(page.getByText(de.einstellungen.gesichert, { exact: true })).toBeVisible();
  expect(download.suggestedFilename()).toMatch(/^igmg-lernapp-\d{4}-\d{2}-\d{2}\.json$/);
  const pfad = info.outputPath('sicherung.json');
  await download.saveAs(pfad);
  const datei = JSON.parse(readFileSync(pfad, 'utf8')) as { format: string; ereignisse: unknown[]; profil: Record<string, unknown> };
  expect(datei.format).toBe('igmg-lernapp-export');
  expect(datei.ereignisse.length).toBeGreaterThan(3);
  expect(JSON.stringify(datei)).not.toMatch(/benutzerId|konto/);

  // anderes Gerät: leerer Kontext, Datei einlesen → derselbe Kartenstand
  const neu = await browser.newContext();
  const seite = await neu.newPage();
  await seite.goto('/lern-app/de/einstellungen');
  const [auswahl] = await Promise.all([
    seite.waitForEvent('filechooser'),
    seite.getByRole('button', { name: de.einstellungen.einlesen }).click(),
  ]);
  await auswahl.setFiles(pfad);
  await expect(seite.getByText(formatiere(de.einstellungen.eingelesen, { n: datei.ereignisse.length }, 'de'), { exact: true })).toBeVisible(
    {
      timeout: 30_000,
    },
  );
  expect(await kartenstand(seite, KARTE_WASSER)).toEqual(stand);
  // noch einmal: nichts Neues (idempotent)
  const [nochmal] = await Promise.all([
    seite.waitForEvent('filechooser'),
    seite.getByRole('button', { name: de.einstellungen.einlesen }).click(),
  ]);
  await nochmal.setFiles(pfad);
  await expect(seite.getByText(formatiere(de.einstellungen.eingelesen, { n: 0 }, 'de'), { exact: true })).toBeVisible();
  // eine fremde Datei wird abgelehnt
  const [fremd] = await Promise.all([
    seite.waitForEvent('filechooser'),
    seite.getByRole('button', { name: de.einstellungen.einlesen }).click(),
  ]);
  await fremd.setFiles({ name: 'fremd.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"etwas"}') });
  await expect(seite.getByText(de.einstellungen.fehlerFormat, { exact: true })).toBeVisible();
  await neu.close();
});

test('Seitennamen statt Oberflächensprache: 404 der Lern-App, nie die echte Seite (S-L1 N-1)', async ({ page }) => {
  for (const pfad of ['/lern-app/anmelden', '/lern-app/einstellungen', `/lern-app/${KURS}`]) {
    const antwort = await page.goto(pfad);
    expect(antwort?.headers()['x-robots-tag'], pfad).toContain('noindex');
    await expect(page.getByRole('heading', { level: 1 }), pfad).toHaveText(de.nichtGefunden.titel);
    await expect(page.locator('input[type="password"]'), pfad).toHaveCount(0);
  }
});
