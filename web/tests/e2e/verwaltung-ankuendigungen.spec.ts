import { randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Öffentliche Seite neu laden, bis die Erwartung erfüllt ist (höchstens 12 s): Eine Änderung ist sofort sichtbar;
 * nur wenn parallel ein Seitenaufbau mit alten Daten lief, greift die zweite Invalidierung nach 5 s (F-002).
 */
async function oeffentlichBis(page: Page, pfad: string, pruefe: () => Promise<void>) {
  await expect(async () => {
    await page.goto(pfad);
    await pruefe();
  }).toPass({ timeout: 12_000, intervals: [500, 1000, 2000] });
}

/**
 * V04: Verwaltung › Ankündigungen (E-033). Anlegen und veröffentlichen → erscheint als Block oberhalb der Nachrichtenliste
 * → in den Papierkorb → verschwindet von der Nachrichtenseite → endgültig löschen. Die Organisationsredaktion sieht nur
 * die eigene Organisation. Nur Desktop (Anmelde-Ratenlimit); das Modul ist noch nicht freigeschaltet, daher über die Adresse.
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die öffentlichen Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Ankündigung anlegen, öffentlich oberhalb der Nachrichten sehen, Papierkorb und endgültig löschen', async ({ page }) => {
  test.setTimeout(120_000); // Konto anlegen + vollständiger Lebenszyklus
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page);
  const titel = `Testankündigung ${randomBytes(3).toString('hex')}`;

  await page.goto('/verwaltung/ankuendigungen/neu');
  await expect(page.getByRole('heading', { level: 1, name: 'Neue Ankündigung' })).toBeVisible();

  // Pflichtfelder leer → Fehler-Zusammenfassung mit Fokus, Fehler am Feld
  await page.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
  await expect(page.getByLabel('Titel (Pflichtfeld)', { exact: true })).toHaveAttribute('aria-invalid', 'true');

  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titel);
  await page.getByLabel('Text (Pflichtfeld)', { exact: true }).fill('Testtext für die Ankündigung. Alle Angaben sind fiktiv.');
  await page.getByLabel('Priorität', { exact: true }).selectOption('hoch');
  await page.getByLabel('Status', { exact: true }).selectOption('veroeffentlicht');
  await page.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/ankuendigungen\/[0-9a-f-]{36}\?angelegt=1$/);
  await expect(page.getByText('Die Ankündigung wurde angelegt.')).toBeVisible();

  // Sofort öffentlich (updateTag): Block oberhalb der Filter-Gruppe der Nachrichtenliste
  await oeffentlichBis(page, '/nachrichten', async () => {
    const block = page.getByRole('region', { name: 'Ankündigungen' });
    await expect(block).toContainText(titel, { timeout: 1000 });
    const blockBox = await block.boundingBox();
    const filterBox = await page.getByRole('group', { name: 'Kategorie' }).boundingBox();
    expect(blockBox && filterBox && blockBox.y < filterBox.y).toBe(true);
  });

  // Papierkorb → nicht mehr öffentlich
  await page.goto('/verwaltung/ankuendigungen');
  await page.getByRole('button', { name: `In den Papierkorb: ${titel}` }).click();
  await expect(page.getByRole('button', { name: `In den Papierkorb: ${titel}` })).toHaveCount(0);
  await oeffentlichBis(page, '/nachrichten', () =>
    expect(page.getByRole('region', { name: 'Ankündigungen' }).getByText(titel)).toHaveCount(0, { timeout: 1000 }),
  );

  // Endgültig löschen – nur aus dem Papierkorb, mit Rückfrage
  await page.goto('/verwaltung/ankuendigungen?ansicht=papierkorb');
  await page.getByRole('button', { name: `Endgültig löschen: ${titel}` }).click();
  const dialog = page.getByRole('dialog', { name: 'Ankündigung endgültig löschen?' });
  await expect(dialog.getByRole('button', { name: 'Abbrechen' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Endgültig löschen' }).click();
  await expect(page.getByRole('button', { name: `Endgültig löschen: ${titel}` })).toHaveCount(0);

  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Organisationsredaktion: nur die eigene Organisation wählbar und in der Liste sichtbar', async ({ page }) => {
  await angemeldetesKonto(page, 'organisationsredaktion', 'gt');
  await page.goto('/verwaltung/ankuendigungen/neu');
  const optionen = await page.getByLabel('Organisation', { exact: true }).locator('option').allInnerTexts();
  expect(optionen).toEqual(['Gençlik Teşkilatı (GT)']);
  // Liste: keine Ankündigungen anderer Organisationen und keine allgemeinen (K-06)
  await page.goto('/verwaltung/ankuendigungen');
  const zeilen = page
    .getByRole('table')
    .getByRole('row')
    .filter({ has: page.getByRole('cell') });
  for (const kuerzel of ['AT', 'KT', 'KGT', 'Allgemein']) {
    await expect(zeilen.filter({ has: page.getByRole('cell', { name: new RegExp(`^${kuerzel}$`) }) })).toHaveCount(0);
  }
});

test('Ohne Anmeldung: Verwaltungsseiten der Ankündigungen leiten zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung/ankuendigungen');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await page.goto('/verwaltung/ankuendigungen/neu');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
