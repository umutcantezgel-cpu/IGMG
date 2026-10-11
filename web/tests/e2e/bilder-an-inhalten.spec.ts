import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import medien from '../../messages/verwaltung/medien.json';
import medienwahl from '../../messages/verwaltung/medienwahl.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * C11b (ADR 0007): Bild hochladen, in einer Neuigkeit als Titelbild und im Text wählen, veröffentlichen – öffentlich
 * erscheinen beide Bilder über die Bildoptimierung mit dem Alt-Text der Mediathek, auch in der Nachrichtenliste.
 */
const tm = medien.medien;
const tw = medienwahl.medienwahl;

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Neuigkeit mit Titelbild und Bild im Text: Auswahl in der Verwaltung, Anzeige öffentlich', async ({ page }) => {
  test.setTimeout(180_000);
  await angemeldetesKonto(page);
  const kennung = Math.random().toString(36).slice(2, 8);
  const alt = `Testbild Saal ${kennung}`;

  // Hochladen (eigene Farbe, damit keine Dublette entsteht)
  await page.goto('/verwaltung/medien');
  const bereich = page.getByRole('region', { name: tm.hochladen.titel });
  const farbe = `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
  const bild = await sharp({ create: { width: 640, height: 360, channels: 3, background: farbe } })
    .jpeg()
    .toBuffer();
  await bereich.getByLabel(/^Datei/).setInputFiles({ name: 'saal.jpg', mimeType: 'image/jpeg', buffer: bild });
  await bereich.getByLabel(/^Alt-Text \(Deutsch\)/).fill(alt);
  await bereich.getByRole('button', { name: tm.hochladen.senden }).click();
  await expect(page).toHaveURL(/\/verwaltung\/medien\/[0-9a-f-]{36}\?meldung=hochgeladen$/);

  // Neuigkeit: Titelbild über das Bildfeld
  const titel = `Testbeitrag mit Bild ${kennung}`;
  await page.goto('/verwaltung/neuigkeiten/neu');
  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titel);
  await page.getByRole('button', { name: tw.bildWaehlen, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: tw.titel });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel(tw.filter)).toBeFocused();
  await dialog.getByLabel(tw.filter).fill(kennung);
  const axe = await new AxeBuilder({ page })
    .include('dialog[open]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  await dialog.getByRole('button', { name: tw.waehlen.replace('{alt}', alt), exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: tw.bildAendern, exact: true })).toBeVisible();

  // Bild im Text über den Editor
  const editor = page.getByRole('textbox', { name: 'Text', exact: true });
  await editor.fill('Absatz vor dem Bild.');
  await page.getByRole('button', { name: 'Bild einfügen', exact: true }).click();
  const dialogText = page.getByRole('dialog', { name: tw.titel }).filter({ visible: true });
  await dialogText.getByLabel(tw.filter).fill(kennung);
  await dialogText.getByRole('button', { name: tw.waehlen.replace('{alt}', alt), exact: true }).click();
  await expect(editor.locator('[data-medium-id]')).toHaveCount(1);

  await page.getByLabel('Status', { exact: true }).selectOption('veroeffentlicht');
  await page.getByRole('button', { name: 'Erstellen', exact: true }).click();
  await expect(page).toHaveURL(/\/verwaltung\/neuigkeiten\/[0-9a-f-]{36}\?angelegt=1$/);

  // Öffentlich: Liste und Detail zeigen das Bild (Bildoptimierung, Alt-Text aus der Mediathek)
  await expect(async () => {
    await page.goto('/nachrichten');
    await expect(page.getByRole('img', { name: alt }).first()).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000, intervals: [500, 1000, 2000] });
  await page
    .getByRole('link', { name: new RegExp(titel) })
    .first()
    .click();
  await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible();
  const bilder = page.getByRole('main').getByRole('img', { name: alt });
  await expect(bilder).toHaveCount(2);
  for (const i of [0, 1]) {
    await expect(bilder.nth(i)).toHaveAttribute('src', /^\/_next\/image\?url=%2Fmedien%2F/);
    await expect(bilder.nth(i)).toHaveAttribute('srcset', /w$|w,/);
  }
  // Das Bild lädt tatsächlich (Optimierung erreicht die Medienroute)
  await expect.poll(async () => bilder.first().evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});
