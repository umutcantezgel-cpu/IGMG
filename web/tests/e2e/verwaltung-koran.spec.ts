import { expect, test, type Page } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * H-Q03/Q04 (ADR 0030): Verwaltung › Koran & Hadith. Bereiche erreichbar; Tajwid-Kurztext erfassen und einreichen →
 * die verfassende Person sieht keinen Freigabe-Knopf (Vier-Augen) → eine zweite Person (eigener Browser-Kontext) gibt
 * frei. Redaktion sieht das Modul nicht und erhält „Kein Zugriff“. Texte sind Platzhalter in eckigen Klammern.
 * Nur Desktop (Anmelde-Ratenlimit). Nicht ausgeführt: Der Test ist geschrieben, aber noch nicht gelaufen.
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

const modul = (page: Page) => page.getByRole('navigation', { name: 'Dashboard-Bereiche' }).getByRole('link', { name: /Koran & Hadith/ });
const bereich = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Bereiche von Koran & Hadith' }).getByRole('link', { name, exact: true });

test('Bereiche, Tajwid-Text einreichen, Vier-Augen-Freigabe durch eine zweite Person', async ({ page, browser }) => {
  test.setTimeout(180_000);
  await angemeldetesKonto(page, 'religioese_pruefung');
  await modul(page).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Koran & Hadith' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Freigaben religiös' })).toBeVisible();

  for (const [link, titel] of [
    ['Ausgaben', 'Übersetzungsausgaben'],
    ['Wortbedeutungen', 'Wortbedeutungen'],
    ['Hadith', 'Hadith'],
    ['Tajwid', 'Tajwid-Regeltexte'],
  ] as const) {
    await bereich(page, link).click();
    await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible();
  }

  const bearbeiten = page.getByRole('link', { name: /^Texte bearbeiten: / }).filter({ visible: true });
  test.skip((await bearbeiten.count()) === 0, 'Ohne importierte Tajwid-Regeln (E2E-Datenbank ohne Inhaltsimport)');
  await bearbeiten.first().click();
  // Erst nach dem Seitenwechsel lesen: click() wartet nicht auf die Navigation (sonst stünde hier die Liste, P4)
  await expect(page).toHaveURL(/\/verwaltung\/koran\/tajwid\/[^/?#]+$/);
  const adresse = page.url();
  await page.getByLabel('Kurztext (Deutsch)', { exact: true }).fill('[Kurztext E2E]');
  await page.getByRole('button', { name: 'Speichern und zur Prüfung geben' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Stand jetzt: Zur Prüfung' })).toBeVisible();
  await expect(page.getByText('Von Ihnen verfasst – freigeben muss eine zweite Person.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Prüfen und freigeben' })).toHaveCount(0);

  const zweite = await browser.newContext();
  const seite2 = await zweite.newPage();
  await seite2.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
  await angemeldetesKonto(seite2, 'religioese_pruefung');
  await seite2.goto(adresse);
  await seite2.getByRole('button', { name: 'Prüfen und freigeben' }).click();
  await expect(seite2.getByRole('status').filter({ hasText: 'Stand jetzt: Geprüft' })).toBeVisible();
  await zweite.close();
});

test('Redaktion: kein Modul in der Seitenleiste, direkte Adresse führt zu „Kein Zugriff“', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page, 'redaktion');
  await expect(modul(page)).toHaveCount(0);
  await page.goto('/verwaltung/koran/ausgaben');
  await expect(page).toHaveURL(/\/verwaltung\/kein-zugriff$/);
});
