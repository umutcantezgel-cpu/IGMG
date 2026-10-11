import { randomBytes } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { expect as erwarte, type Page } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Öffentliche Seite neu laden, bis die Erwartung erfüllt ist (höchstens 12 s): Eine Änderung ist sofort sichtbar;
 * nur wenn parallel ein Seitenaufbau mit alten Daten lief, greift die zweite Invalidierung nach 5 s (F-002).
 */
async function oeffentlichBis(page: Page, pfad: string, pruefe: () => Promise<void>) {
  await erwarte(async () => {
    await page.goto(pfad);
    await pruefe();
  }).toPass({ timeout: 12_000, intervals: [500, 1000, 2000] });
}

/**
 * D05/D09b: Verwaltung › Veranstaltungen (V02, K-06, K-09, Z-04). Anlegen mit Wiederholung und Ausfall →
 * sofort öffentlich (updateTag) → Papierkorb → nicht mehr öffentlich → wiederherstellen → endgültig löschen.
 * Organisationsredaktion: nur eigene Organisation wählbar, fremde Termine nur lesen. Nur Desktop (Anmelde-Ratenlimit).
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die öffentlichen Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Veranstaltung anlegen, öffentlich sehen, Papierkorb und endgültig löschen', async ({ page }) => {
  test.setTimeout(120_000); // Konto anlegen + vollständiger Lebenszyklus
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page);
  const titel = `Testtermin ${randomBytes(3).toString('hex')}`;

  await page
    .getByRole('navigation', { name: 'Dashboard-Bereiche' })
    .getByRole('link', { name: /Veranstaltungen/ })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Veranstaltungen verwalten' })).toBeVisible();
  await page.getByRole('link', { name: 'Neue Veranstaltung' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Neue Veranstaltung' })).toBeVisible();

  // Pflichtfelder leer → Fehler-Zusammenfassung mit Fokus, Fehler am Feld
  await page.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
  await expect(page.getByLabel('Titel (Pflichtfeld)', { exact: true })).toHaveAttribute('aria-invalid', 'true');

  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titel);
  await page.getByLabel('Kurzbeschreibung', { exact: true }).fill('Kurzbeschreibung des Testtermins.');
  await page.getByLabel('Datum (Pflichtfeld)', { exact: true }).fill('2026-11-07');
  await page.getByLabel('Startzeit (Pflichtfeld)', { exact: true }).fill('19:00');
  await page.getByLabel('Endzeit', { exact: true }).fill('21:00');
  await page.getByLabel('Wiederholt sich').selectOption('woechentlich');
  await expect(page.getByRole('checkbox', { name: 'Samstag' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Samstag' }).check();
  await page.getByLabel('Datum des Ausfalls').fill('2026-11-14');
  await page.getByRole('button', { name: 'Ausfall hinzufügen' }).click();
  // Vorschau: 7.11. ja, 14.11. fällt aus, 21.11. ja – über die Zeitumstellung hinweg 19:00 Uhr
  const vorschau = page.getByRole('region', { name: 'Nächste Termine' }).or(page.locator('section', { hasText: 'Nächste Termine' }));
  await expect(vorschau).toContainText('7. November 2026');
  await expect(vorschau).not.toContainText('14. November 2026');
  await expect(vorschau).toContainText('21. November 2026');
  await page.getByLabel('Ort', { exact: true }).fill('Testraum');
  await page.getByLabel('Status', { exact: true }).selectOption('veroeffentlicht');
  await page.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/veranstaltungen\/[0-9a-f-]{36}\?angelegt=1$/);
  await expect(page.getByText('Die Veranstaltung wurde angelegt.')).toBeVisible();

  // Sofort öffentlich (updateTag): Liste und Detailseite
  await oeffentlichBis(page, '/veranstaltungen', () => expect(page.getByRole('heading', { name: titel })).toBeVisible({ timeout: 1000 }));
  await page.getByRole('link', { name: `Details ansehen: ${titel}` }).click();
  await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible();
  await expect(page.getByRole('main').getByText('Jeden Samstag')).toBeVisible();

  // Bearbeiten: Titel ändern → öffentlich sofort sichtbar
  await page.goto('/verwaltung/veranstaltungen');
  await page.getByRole('link', { name: `Bearbeiten: ${titel}` }).click();
  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(`${titel} geändert`);
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Die Änderungen wurden gespeichert.' })).toBeVisible();
  await oeffentlichBis(page, '/veranstaltungen', () =>
    expect(page.getByRole('heading', { name: `${titel} geändert` })).toBeVisible({ timeout: 1000 }),
  );

  // Papierkorb → nicht mehr öffentlich
  await page.goto('/verwaltung/veranstaltungen');
  await page.getByRole('button', { name: `In den Papierkorb: ${titel} geändert` }).click();
  await expect(page.getByRole('button', { name: `In den Papierkorb: ${titel} geändert` })).toHaveCount(0);
  await oeffentlichBis(page, '/veranstaltungen', () =>
    expect(page.getByRole('heading', { name: `${titel} geändert` })).toHaveCount(0, { timeout: 1000 }),
  );

  // Wiederherstellen und endgültig löschen
  await page.goto('/verwaltung/veranstaltungen?ansicht=papierkorb');
  await page.getByRole('button', { name: `Wiederherstellen: ${titel} geändert` }).click();
  await expect(page.getByRole('button', { name: `Wiederherstellen: ${titel} geändert` })).toHaveCount(0);
  await page.goto('/verwaltung/veranstaltungen');
  await page.getByRole('button', { name: `In den Papierkorb: ${titel} geändert` }).click();
  await expect(page.getByRole('button', { name: `In den Papierkorb: ${titel} geändert` })).toHaveCount(0);
  await page.goto('/verwaltung/veranstaltungen?ansicht=papierkorb');
  await page.getByRole('button', { name: `Endgültig löschen: ${titel} geändert` }).click();
  const dialog = page.getByRole('dialog', { name: 'Veranstaltung endgültig löschen?' });
  await expect(dialog.getByRole('button', { name: 'Abbrechen' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Endgültig löschen' }).click();
  await expect(page.getByRole('button', { name: `Endgültig löschen: ${titel} geändert` })).toHaveCount(0);

  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Organisationsredaktion: nur eigene Organisation wählbar und sichtbar', async ({ page }) => {
  await angemeldetesKonto(page, 'organisationsredaktion', 'gt');
  await page.goto('/verwaltung/veranstaltungen/neu');
  const optionen = await page.getByLabel('Organisation', { exact: true }).locator('option').allInnerTexts();
  expect(optionen).toEqual(['Gençlik Teşkilatı (GT)']);
  // Liste: nur GT-Termine, keine anderer Organisationen oder allgemeine (K-06, SP-P3 M1)
  await page.goto('/verwaltung/veranstaltungen');
  const zeilen = page
    .getByRole('table')
    .getByRole('row')
    .filter({ has: page.getByRole('cell') });
  await expect(zeilen.first()).toBeVisible();
  for (const kuerzel of ['AT', 'KT', 'KGT', 'Allgemein']) {
    await expect(zeilen.filter({ has: page.getByRole('cell', { name: new RegExp(`^${kuerzel} `) }) })).toHaveCount(0);
  }
  await expect(zeilen.filter({ has: page.getByRole('cell', { name: /^GT / }) }).first()).toBeVisible();
});

test('Ohne Anmeldung: Verwaltungsseiten leiten zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung/veranstaltungen');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await page.goto('/verwaltung/veranstaltungen/neu');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
