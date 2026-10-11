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
 * V06: Verwaltung › Kurse (Rolle Bildung, K-06). Anlegen mit Pflichtfeld-Fehler → veröffentlichen → erscheint auf
 * /bildung/korankurse → ändern → Papierkorb → nicht mehr öffentlich → endgültig löschen. Nur Desktop (Anmelde-Ratenlimit).
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die öffentlichen Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Kurs anlegen, auf den Korankursen sehen, ändern, Papierkorb und endgültig löschen', async ({ page }) => {
  test.setTimeout(120_000); // Konto anlegen + vollständiger Lebenszyklus
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page, 'bildung');
  const titel = `Testkurs ${randomBytes(3).toString('hex')}`;

  await page.goto('/verwaltung/kurse');
  await expect(page.getByRole('heading', { level: 1, name: 'Kurse verwalten' })).toBeVisible();
  await page.getByRole('link', { name: 'Neuer Kurs' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Neuer Kurs' })).toBeVisible();

  // Pflichtfeld leer → Fehler-Zusammenfassung, Fehler am Feld
  await page.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
  await expect(page.getByLabel('Titel (Pflichtfeld)', { exact: true })).toHaveAttribute('aria-invalid', 'true');

  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titel);
  await page.getByLabel('Beschreibung', { exact: true }).fill('Kurzer Testtext für den Kurs.');
  await page.getByLabel('Zielgruppe', { exact: true }).fill('Testgruppe Eins');
  await page.getByLabel('Zeiten', { exact: true }).fill('Samstag 13:00 bis 15:00 Uhr');
  await page.getByLabel('Leitung', { exact: true }).fill('[Name der Lehrkraft]');
  await page.getByLabel('Kursinhalte', { exact: true }).fill('Tajwid\nHifz');
  await page.getByLabel('Verfügbarkeit', { exact: true }).selectOption('voranmeldung');
  await page.getByLabel('Status', { exact: true }).selectOption('veroeffentlicht');
  await page.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/kurse\/[0-9a-f-]{36}\?angelegt=1$/);
  await expect(page.getByText('Der Kurs wurde angelegt.')).toBeVisible();

  // Sofort öffentlich (updateTag): Karte auf den Korankursen mit Voranmeldung
  await oeffentlichBis(page, '/bildung/korankurse', () =>
    expect(page.getByRole('heading', { level: 3, name: titel })).toBeVisible({ timeout: 1000 }),
  );
  await expect(page.getByRole('link', { name: `Zur Voranmeldung: ${titel}`, exact: true })).toBeVisible();

  // Ändern: neuer Titel → öffentlich sofort sichtbar
  await page.goto('/verwaltung/kurse');
  await page.getByRole('link', { name: `Bearbeiten: ${titel}` }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Kurs bearbeiten' })).toBeVisible();
  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(`${titel} geändert`);
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Die Änderungen wurden gespeichert.' })).toBeVisible();
  await oeffentlichBis(page, '/bildung/korankurse', () =>
    expect(page.getByRole('heading', { level: 3, name: `${titel} geändert` })).toBeVisible({ timeout: 1000 }),
  );

  // Papierkorb → nicht mehr öffentlich
  await page.goto('/verwaltung/kurse');
  await page.getByRole('button', { name: `In den Papierkorb: ${titel} geändert` }).click();
  await expect(page.getByRole('button', { name: `In den Papierkorb: ${titel} geändert` })).toHaveCount(0);
  await oeffentlichBis(page, '/bildung/korankurse', () =>
    expect(page.getByRole('heading', { level: 3, name: `${titel} geändert` })).toHaveCount(0, { timeout: 1000 }),
  );

  // Aus dem Papierkorb endgültig löschen (mit Rückfrage, Abbrechen hat den Fokus)
  await page.goto('/verwaltung/kurse?ansicht=papierkorb');
  await page.getByRole('button', { name: `Endgültig löschen: ${titel} geändert` }).click();
  const dialog = page.getByRole('dialog', { name: 'Kurs endgültig löschen?' });
  await expect(dialog.getByRole('button', { name: 'Abbrechen' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Endgültig löschen' }).click();
  await expect(page.getByRole('button', { name: `Endgültig löschen: ${titel} geändert` })).toHaveCount(0);

  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Redaktion ohne Kursrecht: die Kursverwaltung leitet zu „kein Zugriff“', async ({ page }) => {
  await angemeldetesKonto(page, 'redaktion');
  await page.goto('/verwaltung/kurse');
  await expect(page).toHaveURL(/\/verwaltung\/kein-zugriff$/);
});

test('Ohne Anmeldung: Kursverwaltung leitet zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung/kurse');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await page.goto('/verwaltung/kurse/neu');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
