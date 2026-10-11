import { expect, test } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * C01 (Blatt V01): Verwaltung › Übersicht. Begrüßung und Kacheln nur für gebaute Module mit Leserecht, Kurzlisten nur mit
 * dem jeweiligen Leserecht, kein waagerechter Seitenrand auf dem Telefon. Inhalte im Hauptbereich suchen, weil Next zuvor
 * besuchte Seiten versteckt im DOM hält. Nur Desktop-Projekt (Anmelde-Ratenlimit).
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Administration: Begrüßung, Kacheln gebauter Module und beide Kurzlisten', async ({ page }) => {
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page);
  const inhalt = page.getByRole('main');
  await expect(inhalt.getByRole('heading', { level: 1, name: 'Übersicht', exact: true })).toBeVisible();
  await expect(inhalt.getByText(/^Willkommen, /)).toBeVisible();
  const kennzahlen = inhalt.getByRole('region', { name: 'Kennzahlen', exact: true });
  await expect(kennzahlen.getByRole('link', { name: /^Veranstaltungen / })).toHaveAttribute('href', '/verwaltung/veranstaltungen');
  await expect(kennzahlen.getByRole('link', { name: /^Eingänge / })).toHaveAttribute('href', '/verwaltung/eingaenge');
  await expect(inhalt.getByRole('heading', { level: 2, name: 'Kommende Veranstaltungen', exact: true })).toBeVisible();
  await expect(inhalt.getByRole('heading', { level: 2, name: 'Aktuelle Neuigkeiten', exact: true })).toBeVisible();
  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Bildung: nur die Kachel Eingänge, keine Kurzlisten', async ({ page }) => {
  await angemeldetesKonto(page, 'bildung');
  const inhalt = page.getByRole('main');
  await expect(inhalt.getByRole('heading', { level: 1, name: 'Übersicht', exact: true })).toBeVisible();
  const kennzahlen = inhalt.getByRole('region', { name: 'Kennzahlen', exact: true });
  await expect(kennzahlen.getByRole('link', { name: /^Eingänge / })).toBeVisible();
  await expect(kennzahlen.getByRole('link', { name: /^Veranstaltungen / })).toHaveCount(0);
  await expect(inhalt.getByRole('heading', { name: 'Kommende Veranstaltungen', exact: true })).toHaveCount(0);
  await expect(inhalt.getByRole('heading', { name: 'Aktuelle Neuigkeiten', exact: true })).toHaveCount(0);
});

test('Organisationsredaktion GT: Kachel Veranstaltungen und Kurzliste sichtbar', async ({ page }) => {
  await angemeldetesKonto(page, 'organisationsredaktion', 'gt');
  const inhalt = page.getByRole('main');
  const kennzahlen = inhalt.getByRole('region', { name: 'Kennzahlen', exact: true });
  await expect(kennzahlen.getByRole('link', { name: /^Veranstaltungen / })).toBeVisible();
  await expect(inhalt.getByRole('heading', { level: 2, name: 'Kommende Veranstaltungen', exact: true })).toBeVisible();
});

test('Telefon (390 px): kein waagerechter Seitenrand auf der Übersicht', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await angemeldetesKonto(page);
  const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(ueberlauf).toBeLessThanOrEqual(0);
});

test('Ohne Anmeldung: die Übersicht leitet zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
