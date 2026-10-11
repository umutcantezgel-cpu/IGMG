import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import medien from '../../messages/verwaltung/medien.json';
import { angemeldetesKonto } from './hilfen/konto';

/** C11 (ADR 0007, K-10): Bild hochladen (Alt-Text Pflicht), ausliefern, in den Papierkorb, endgültig löschen. */
const t = medien.medien;

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Medien: hochladen mit Alt-Text, ausliefern, Papierkorb, endgültig löschen', async ({ page }) => {
  test.setTimeout(150_000);
  await angemeldetesKonto(page);
  await page.goto('/verwaltung/medien');
  await expect(page.getByRole('heading', { level: 1, name: t.titel })).toBeVisible();
  const bereich = page.getByRole('region', { name: t.hochladen.titel });
  // Einmaliges Bild (zufällige Farbe), damit kein vorhandener Eintrag wiederverwendet wird
  const farbe = `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
  const bild = await sharp({ create: { width: 64, height: 48, channels: 3, background: farbe } })
    .png()
    .toBuffer();

  // Ohne Alt-Text: Fehler am Feld
  await bereich.getByLabel(/^Datei/).setInputFiles({ name: 'testbild.png', mimeType: 'image/png', buffer: bild });
  await bereich.getByRole('button', { name: t.hochladen.senden }).click();
  await expect(bereich.getByText(t.fehler.altKurz)).toBeVisible();
  // SVG wird abgelehnt
  await bereich.getByLabel(/^Datei/).setInputFiles({
    name: 'zeichen.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
  });
  await bereich.getByLabel(/^Alt-Text \(Deutsch\)/).fill('Testbild farbige Fläche');
  await bereich.getByRole('button', { name: t.hochladen.senden }).click();
  await expect(bereich.getByText(t.fehler.datei_typ)).toBeVisible();
  // Gültig → Detailseite
  await bereich.getByLabel(/^Datei/).setInputFiles({ name: 'testbild.png', mimeType: 'image/png', buffer: bild });
  await bereich.getByLabel(/^Alt-Text \(Deutsch\)/).fill('Testbild farbige Fläche');
  await bereich.getByRole('button', { name: t.hochladen.senden }).click();
  await expect(page).toHaveURL(/\/verwaltung\/medien\/[0-9a-f-]{36}\?meldung=hochgeladen$/);
  await expect(page.getByRole('img', { name: 'Testbild farbige Fläche' })).toBeVisible();
  const adresse = (await page.locator('dd.font-mono').innerText()).trim();
  const antwort = await page.request.get(adresse);
  expect(antwort.status()).toBe(200);
  expect(antwort.headers()['content-type']).toBe('image/png');
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Papierkorb → nicht mehr ausgeliefert → endgültig löschen
  await page.getByRole('button', { name: t.detail.inPapierkorb }).click();
  await expect(page).toHaveURL(/meldung=papierkorb/);
  expect((await page.request.get(adresse)).status()).toBe(404);
  await page.goto('/verwaltung/medien?ansicht=papierkorb');
  await page
    .getByRole('main')
    .getByRole('link', { name: /^Bearbeiten: testbild\.png/ })
    .filter({ visible: true })
    .first()
    .click();
  await page.getByRole('button', { name: t.detail.loeschen }).click();
  await page.getByRole('dialog', { name: t.detail.loeschenTitel }).getByRole('button', { name: t.detail.loeschenBestaetigen }).click();
  await expect(page).toHaveURL(/meldung=geloescht/);
});
