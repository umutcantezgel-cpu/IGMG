import { randomBytes } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * V10 (K-06, G-07): Verwaltung › Tickets. Anlegen mit Kategorie und Priorität → Kommentar (intern vorbelegt) → Status und
 * Priorität ändern → Liste filtern. Organisationsredaktion: nur eigene und allgemeine Tickets sichtbar, Status nicht
 * änderbar, Neues Ticket nur mit eigener Organisation oder ohne. Nur Desktop (Anmelde-Ratenlimit).
 * Nicht ausgeführt: Der Test ist geschrieben, aber noch nicht gelaufen.
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die Verwaltung)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Ticket anlegen, kommentieren, Status ändern und in der Liste filtern', async ({ page }) => {
  test.setTimeout(120_000); // Konto anlegen + Ablauf
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page);
  const titel = `Testticket ${randomBytes(3).toString('hex')}`;

  await page
    .getByRole('navigation', { name: 'Dashboard-Bereiche' })
    .getByRole('link', { name: /Tickets/ })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tickets verwalten' })).toBeVisible();
  await page.getByRole('link', { name: 'Neues Ticket' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Neues Ticket' })).toBeVisible();

  // Pflichtfelder leer: Fehler-Zusammenfassung und Fehler am Feld
  await page.getByRole('button', { name: 'Ticket erstellen' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
  await expect(page.getByLabel('Titel (Pflichtfeld)', { exact: true })).toHaveAttribute('aria-invalid', 'true');

  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titel);
  await page.getByLabel('Beschreibung (Pflichtfeld)', { exact: true }).fill('Die Heizung im Gebetsraum funktioniert nicht.');
  await page.getByLabel('Kategorie', { exact: true }).fill('Technik');
  await page.getByLabel('Priorität', { exact: true }).filter({ visible: true }).selectOption('hoch');
  await page.getByRole('button', { name: 'Ticket erstellen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/tickets\/[0-9a-f-]{36}\?angelegt=1$/);
  await expect(page.getByText('Das Ticket wurde angelegt.')).toBeVisible();

  // Kommentar: „Intern“ ist vorbelegt und bleibt im Verlauf sichtbar
  await expect(page.getByRole('checkbox', { name: /Intern/ })).toBeChecked();
  await page.getByLabel('Kommentar (Pflichtfeld)', { exact: true }).fill('Die Technik ist informiert.');
  await page.getByRole('button', { name: 'Kommentar speichern' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Der Kommentar wurde gespeichert.' })).toBeVisible();
  const verlauf = page.locator('section[aria-labelledby="ticket-verlauf"]');
  await expect(verlauf).toContainText('Die Technik ist informiert.');
  await expect(verlauf).toContainText('Intern');

  // Status und Priorität ändern (nur Administration)
  const aenderung = page.locator('section[aria-labelledby="ticket-aenderung"]');
  await aenderung.getByLabel('Status', { exact: true }).filter({ visible: true }).selectOption('in_bearbeitung');
  await aenderung.getByLabel('Priorität', { exact: true }).filter({ visible: true }).selectOption('dringend');
  await aenderung.getByRole('button', { name: 'Änderungen speichern' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Die Änderungen wurden gespeichert.' })).toBeVisible();
  await expect(
    page
      .getByRole('main')
      .locator('span')
      .filter({ hasText: /^In Bearbeitung$/ })
      .first(),
  ).toBeVisible();

  // Liste: Filter nach Status und Priorität mit Knopf „Filtern“
  await page
    .getByRole('navigation', { name: 'Dashboard-Bereiche' })
    .getByRole('link', { name: /Tickets/ })
    .click();
  // erst die Listenseite abwarten, sonst greift die Auswahl noch auf der alten Seite
  await expect(page).toHaveURL(/\/verwaltung\/tickets$/);
  await page.getByRole('combobox', { name: 'Status', exact: true }).filter({ visible: true }).selectOption('in_bearbeitung');
  await page.getByRole('combobox', { name: 'Priorität', exact: true }).filter({ visible: true }).selectOption('dringend');
  await page.getByRole('button', { name: 'Filtern' }).click();
  await expect(page).toHaveURL(/status=in_bearbeitung/);
  await expect(page.getByRole('row').filter({ hasText: titel })).toBeVisible();
  await page.getByRole('combobox', { name: 'Status', exact: true }).filter({ visible: true }).selectOption('offen');
  await page.getByRole('button', { name: 'Filtern' }).click();
  await expect(page.getByRole('row').filter({ hasText: titel })).toHaveCount(0);

  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Organisationsredaktion: nur eigene und allgemeine Tickets, Status nicht änderbar', async ({ browser, page }) => {
  test.setTimeout(150_000);
  await angemeldetesKonto(page);
  const kt = `Testticket KT ${randomBytes(3).toString('hex')}`;
  const gt = `Testticket GT ${randomBytes(3).toString('hex')}`;
  const allgemein = `Testticket Allgemein ${randomBytes(3).toString('hex')}`;

  // Administration legt je eine Meldung für KT, GT und ohne Organisation an
  const anlegen = async (titelText: string, organisation: string) => {
    await page.goto('/verwaltung/tickets/neu');
    await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titelText);
    await page.getByLabel('Beschreibung (Pflichtfeld)', { exact: true }).fill('Testbeschreibung für die Organisationsprüfung.');
    await page.getByLabel('Organisation', { exact: true }).selectOption({ value: organisation });
    await page.getByRole('button', { name: 'Ticket erstellen' }).click();
    await expect(page).toHaveURL(/\/verwaltung\/tickets\/[0-9a-f-]{36}\?angelegt=1$/);
    return (
      page
        .url()
        .replace(/\?angelegt=1$/, '')
        .split('/')
        .pop() ?? ''
    );
  };
  const ktId = await anlegen(kt, 'kt');
  const gtId = await anlegen(gt, 'gt');
  await anlegen(allgemein, '');

  // Organisationsredaktion GT in einem zweiten, getrennten Browserkontext
  const zweit = await browser.newContext();
  const seite = await zweit.newPage();
  try {
    await seite.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
    await angemeldetesKonto(seite, 'organisationsredaktion', 'gt');

    await seite.goto('/verwaltung/tickets/neu');
    const optionen = await seite.getByLabel('Organisation', { exact: true }).locator('option').allInnerTexts();
    expect(optionen).toEqual(['Allgemein (ohne Organisation)', 'Gençlik Teşkilatı (GT)']);

    await seite.goto('/verwaltung/tickets');
    const zeilen = seite
      .getByRole('table')
      .getByRole('row')
      .filter({ has: seite.getByRole('rowheader') });
    await expect(zeilen.filter({ hasText: gt })).toHaveCount(1);
    await expect(zeilen.filter({ hasText: allgemein })).toHaveCount(1);
    await expect(zeilen.filter({ hasText: kt })).toHaveCount(0);

    // Fremde Meldung ist nicht gefunden; eigene Meldung hat keinen Statusbereich
    await seite.goto(`/verwaltung/tickets/${ktId}`);
    await expect(seite.getByRole('heading', { name: kt })).toHaveCount(0);
    await seite.goto(`/verwaltung/tickets/${gtId}`);
    await expect(seite.getByRole('heading', { level: 1, name: gt })).toBeVisible();
    await expect(seite.getByRole('main').getByText('Status und Priorität ändert nur die Administration.')).toBeVisible();
    await expect(seite.locator('section[aria-labelledby="ticket-aenderung"]')).toHaveCount(0);
  } finally {
    await zweit.close();
  }
});

test('Ohne Anmeldung: Ticketseiten leiten zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung/tickets');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await page.goto('/verwaltung/tickets/neu');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
