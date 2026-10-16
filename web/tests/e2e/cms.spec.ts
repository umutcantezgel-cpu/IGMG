import { randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * CMS (ADR 0032): Seite im Editor anlegen und veröffentlichen → öffentlich unter ihrer Adresse; Menüeintrag im Fuß
 * (Schnellzugriff) → erscheint auf der Website; Weiterleitung alte → neue Adresse. Nur Desktop (Anmelde-Ratenlimit).
 * Am Ende wird das Standardmenü wiederhergestellt, damit andere Prüfungen den Bestand sehen.
 */
async function oeffentlichBis(page: Page, pfad: string, pruefe: () => Promise<void>) {
  await expect(async () => {
    await page.goto(pfad);
    await pruefe();
  }).toPass({ timeout: 15_000, intervals: [500, 1000, 2000] });
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Seite anlegen und veröffentlichen, Menüeintrag und Weiterleitung erscheinen öffentlich', async ({ page }) => {
  test.setTimeout(180_000);
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page);
  const hex = randomBytes(3).toString('hex');
  const titel = `Testseite ${hex}`;
  const slug = `testseite-${hex}`;
  const absatz = 'Ein fiktiver Absatz der Testseite.';

  // Seite anlegen: Titel, Text im ersten Baustein, Veröffentlichen
  await page.goto('/verwaltung/seiten');
  await expect(page.getByRole('heading', { level: 1, name: 'Seiten verwalten' })).toBeVisible();
  await page.getByRole('link', { name: 'Neue Seite', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Neue Seite' })).toBeVisible();
  // Der Texteditor entsteht erst im Browser: sichtbar = Formular ist hydriert (sonst gingen Eingaben verloren)
  const editor = page.getByRole('textbox', { name: 'Text', exact: true });
  await expect(editor).toBeVisible();
  await page.getByLabel('Titel der Seite (Pflichtfeld)').fill(titel);
  await editor.fill(absatz);
  // Bausteinauswahl: „Fragen und Antworten“ hinzufügen und mit der Tastatur nach oben verschieben
  await page.getByRole('button', { name: 'Baustein hinzufügen', exact: true }).click();
  await page.getByRole('button', { name: /^Fragen und Antworten/ }).click();
  await page.getByLabel('Frage (Pflichtfeld)').fill('Fiktive Frage?');
  await page.getByLabel('Antwort (Pflichtfeld)').fill('Fiktive Antwort.');
  const nachOben = page.getByRole('button', { name: 'Nach oben: Baustein 2 (Fragen und Antworten)' });
  await nachOben.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Nach unten: Baustein 1 (Fragen und Antworten)' })).toBeVisible();
  await page.getByText('Veröffentlichen', { exact: true }).click();
  await page.getByRole('button', { name: 'Seite anlegen', exact: true }).click();
  await expect(page).toHaveURL(/\/verwaltung\/seiten\/[0-9a-f-]{36}\?angelegt=1/);
  await expect(
    page.getByText('Gespeichert und veröffentlicht. Die Seite ist jetzt auf der Website zu sehen.', { exact: true }),
  ).toBeVisible();

  await oeffentlichBis(page, `/${slug}`, async () => {
    await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible({ timeout: 1000 });
    await expect(page.getByText(absatz)).toBeVisible({ timeout: 1000 });
    await expect(page.getByText('Fiktive Frage?')).toBeVisible({ timeout: 1000 });
  });

  // Menüeintrag im Schnellzugriff (Fuß) auf die neue Seite
  await page.goto('/verwaltung/menues?menue=fuss');
  await expect(page.getByRole('heading', { level: 1, name: 'Menüs bearbeiten' })).toBeVisible();
  // Neuer Eintrag öffnet sich zum Bearbeiten (die übrigen bleiben zugeklappt); erneut klicken, falls noch nicht hydriert
  const beschriftung = page.getByLabel('Beschriftung (Pflichtfeld)');
  await expect(async () => {
    if ((await beschriftung.count()) === 0) await page.getByRole('button', { name: 'Eintrag hinzufügen', exact: true }).click();
    await expect(beschriftung).toHaveCount(1, { timeout: 1000 });
  }).toPass({ timeout: 15_000, intervals: [500, 1000, 2000] });
  await beschriftung.fill(`Menü ${hex}`);
  await page.getByLabel('Führt zu (Pflichtfeld)').selectOption({ label: `${titel} (/${slug})` });
  await page.getByRole('button', { name: 'Menü speichern', exact: true }).click();
  await expect(page.getByText('Die Website zeigt Ihr gespeichertes Menü', { exact: false })).toBeVisible();

  await oeffentlichBis(page, '/', async () => {
    const fuss = page.getByRole('navigation', { name: 'Schnellzugriff' });
    await expect(fuss.getByRole('link', { name: `Menü ${hex}`, exact: true })).toHaveAttribute('href', `/${slug}`, { timeout: 1000 });
  });

  // Weiterleitung von einer alten Adresse auf die neue Seite
  await page.goto('/verwaltung/weiterleitungen');
  await page.getByLabel('Alte Adresse (Pflichtfeld)').fill(`/alt-${hex}`);
  await page.getByLabel('Neue Adresse (Pflichtfeld)').fill(`/${slug}`);
  await page.getByRole('button', { name: 'Weiterleitung speichern', exact: true }).click();
  await expect(page.getByText(`/alt-${hex}`, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await expect(async () => {
    await page.goto(`/alt-${hex}`);
    await expect(page).toHaveURL(new RegExp(`/${slug}$`), { timeout: 5000 });
    await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible({ timeout: 5000 });
  }).toPass({ timeout: 30_000, intervals: [500, 1000, 2000] });

  // Aufräumen: Standardmenü wiederherstellen
  await page.goto('/verwaltung/menues?menue=fuss');
  await page.getByText('Standardmenü wiederherstellen', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Standardmenü wiederherstellen', exact: true }).click();
  await expect(page.getByText('Die Website zeigt zurzeit das Standardmenü.', { exact: false })).toBeVisible();

  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Ohne Anmeldung: Seiten, Menüs, Startseite, Weiterleitungen, Wissen und Freigaben leiten zur Anmeldung; Vorschau ohne gültigen Link', async ({
  page,
}) => {
  for (const pfad of [
    '/verwaltung/seiten',
    '/verwaltung/seiten/neu',
    '/verwaltung/menues',
    '/verwaltung/startseite',
    '/verwaltung/weiterleitungen',
    '/verwaltung/wissen',
    '/verwaltung/wissen/neu',
    '/verwaltung/freigaben',
  ]) {
    await page.goto(pfad);
    await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  }
  const antwort = await page.goto(`/verwaltung/vorschau/${'a'.repeat(43)}`);
  expect(antwort?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.getByRole('heading', { level: 1, name: 'Vorschau nicht verfügbar' })).toBeVisible();
});
