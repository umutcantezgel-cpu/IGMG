import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import gz from '../../messages/verwaltung/gebetszeiten.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * C07 (K-08, ADR 0008): Tabelle hochladen → prüfen (Vorschau) → übernehmen → die öffentliche Seite zeigt die
 * importierten Zeiten; danach Import entfernen und Quelle zurück auf Berechnung (andere Specs bleiben unberührt).
 */
const t = gz.gebetszeiten;

function heutePlus(n: number): string {
  const teile = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(),
  );
  const [j, m, d] = teile.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, d + n)).toISOString().slice(0, 10);
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Gebetszeiten: Import prüfen, übernehmen, öffentlich sehen, wieder entfernen', async ({ page }) => {
  test.setTimeout(150_000);
  await angemeldetesKonto(page);
  await page.goto('/verwaltung/gebetszeiten');
  await expect(page.getByRole('heading', { level: 1, name: t.titel })).toBeVisible();
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  const importBereich = page.getByRole('region', { name: t.import.titel });
  // Fehlerhafte Datei: Lücke → Zeilenfehler, nichts übernommen
  const fehlerhaft = [
    'datum;imsak;gunes;ogle;ikindi;aksam;yatsi',
    `${heutePlus(0)};04:44;06:40;13:05;16:20;19:10;20:45`,
    `${heutePlus(2)};04:44;06:40;13:05;16:20;19:10;20:45`,
  ].join('\n');
  await importBereich
    .getByLabel(t.import.datei)
    .setInputFiles({ name: 'zeiten.csv', mimeType: 'text/csv', buffer: Buffer.from(fehlerhaft) });
  await importBereich.getByRole('button', { name: t.import.pruefen }).click();
  await expect(importBereich.getByText(t.import.fehlerTitel)).toBeVisible();

  // Gültige Datei: drei Tage ab heute mit unverwechselbarer Imsak-Zeit
  const gueltig = [
    'datum;imsak;gunes;ogle;ikindi;aksam;yatsi',
    ...[0, 1, 2].map((n) => `${heutePlus(n)};04:44;06:40;13:05;16:20;19:10;20:45`),
  ].join('\n');
  await importBereich.getByLabel(t.import.datei).setInputFiles({ name: 'zeiten.csv', mimeType: 'text/csv', buffer: Buffer.from(gueltig) });
  await importBereich.getByRole('button', { name: t.import.pruefen }).click();
  await expect(importBereich.getByText(/^Die Datei ist gültig: 3 Tage/)).toBeVisible();
  await importBereich.getByRole('button', { name: t.import.uebernehmen }).click();
  await expect(importBereich.getByText('3 Tage wurden übernommen.', { exact: false })).toBeVisible();

  // Öffentlich: heutige Imsak-Zeit aus dem Import
  await page.goto('/gebetszeiten');
  await expect(page.locator('main').getByText('04:44').first()).toBeVisible();

  // Aufräumen: Import entfernen, Quelle zurück auf Berechnung
  await page.goto('/verwaltung/gebetszeiten');
  const zeile = page.getByRole('region', { name: t.importe.titel }).getByRole('row').filter({ hasText: 'zeiten.csv' }).first();
  await zeile.getByRole('button', { name: t.importe.entfernen }).click();
  await page.getByRole('dialog', { name: t.importe.entfernenTitel }).getByRole('button', { name: t.importe.entfernenBestaetigen }).click();
  await expect(page).toHaveURL(/\/verwaltung\/gebetszeiten\?entfernt=1$/);
  const quelle = page.getByRole('region', { name: t.quelle.titel });
  await quelle.getByRole('radio', { name: new RegExp(`^${t.quelle.berechnung}`) }).check();
  await quelle.getByRole('button', { name: t.quelle.speichern }).click();
  await expect(quelle.getByText(t.quelle.gespeichert)).toBeVisible();
});
