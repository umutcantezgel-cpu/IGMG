import { randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Öffentliche Seite neu laden, bis die Erwartung erfüllt ist (höchstens 12 s): Eine Änderung ist sofort sichtbar;
 * nur bei parallelem Seitenaufbau mit alten Daten greift die zweite Invalidierung nach 5 s (F-002).
 */
async function oeffentlichBis(page: Page, pfad: string, pruefe: () => Promise<void>) {
  await expect(async () => {
    await page.goto(pfad);
    await pruefe();
  }).toPass({ timeout: 12_000, intervals: [500, 1000, 2000] });
}

/**
 * V05 „Seiteninhalte I“: Verwaltung › Seiteninhalte. Über uns ändern → die öffentliche Seite /ueber-uns zeigt den Text.
 * Die Organisationsredaktion sieht nur die Karte ihrer Organisation. Nur Desktop (Anmelde-Ratenlimit).
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die öffentlichen Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Über uns ändern: die öffentliche Seite zeigt den neuen Text', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page);
  const text = `Testabsatz ${randomBytes(3).toString('hex')} zur Geschichte, fiktiv.`;

  await page.goto('/verwaltung/seiteninhalte');
  await expect(page.getByRole('heading', { level: 1, name: 'Seiteninhalte' })).toBeVisible();
  await page.getByRole('link', { name: 'Bearbeiten: Über uns' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Über uns' })).toBeVisible();

  // Abschnitt „Geschichte“: einen Absatz hinzufügen und Deutsch ausfüllen
  const geschichte = page.getByRole('region', { name: 'Geschichte' });
  await geschichte.getByRole('group', { name: 'Absätze' }).getByRole('button', { name: 'Eintrag hinzufügen' }).click();
  // der neue Absatz steht am Ende der Liste
  await geschichte.getByLabel('Absatz (Pflichtfeld)', { exact: true }).last().fill(text);

  // Speichern mit Pflichtfeld gefüllt: Rückmeldung als Status, Änderung ist sofort öffentlich
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Die Angaben wurden gespeichert.' })).toBeVisible();
  await oeffentlichBis(page, '/ueber-uns', () => expect(page.getByText(text)).toBeVisible({ timeout: 1000 }));
});

test('Pflichtfeld leer: Fehler am Feld und Zusammenfassung mit Fokus', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page);
  await page.goto('/verwaltung/seiteninhalte/vorstand');
  await expect(page.getByRole('heading', { level: 1, name: 'Vorstand' })).toBeVisible();

  // Ein neues Mitglied, Name geleert (der Vorschlag ist ein Platzhalter): die Zusammenfassung nennt das Feld
  const vorstand = page.getByRole('group', { name: 'Aktueller Vorstand' });
  // äußere Liste: ihr „Eintrag hinzufügen“ steht nach allen Einträgen (die inneren gehören zu den Aufgaben)
  await vorstand.getByRole('button', { name: 'Eintrag hinzufügen' }).last().click();
  await vorstand.getByLabel('Name (Pflichtfeld)', { exact: true }).first().fill('');
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
  await expect(page.getByRole('alert').getByRole('link', { name: /Eintrag 1 › Name/ })).toBeVisible();
  await expect(vorstand.getByLabel('Name (Pflichtfeld)', { exact: true }).first()).toHaveAttribute('aria-invalid', 'true');
});

test('Organisationsredaktion sieht nur die Karte der eigenen Organisation', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page, 'organisationsredaktion', 'gt');
  await page.goto('/verwaltung/seiteninhalte');
  await expect(page.getByRole('heading', { level: 1, name: 'Seiteninhalte' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Gençlik Teşkilatı (GT)' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Über uns' })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 3, name: 'Ana Teşkilatı (AT)' })).toHaveCount(0);
});
