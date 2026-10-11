import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * C13: Verwaltung › Audit-Log (G-07, K-06). Nur Administration sieht das Log (Recht `audit.lesen`); andere Rollen
 * landen auf „Kein Zugriff“. Filter und Seiten wirken über die Adresse; die Seite ist nur lesend (keine Schaltflächen
 * je Zeile, kein Export). Nur Desktop (Anmelde-Ratenlimit). NICHT AUSGEFÜHRT: braucht den Produktionsbuild.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die Seite)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Administration liest das Audit-Log, filtert nach Aktion und sieht keine Personendaten in Details', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page);
  await page.goto('/verwaltung/audit');
  await expect(page.getByRole('heading', { level: 1, name: 'Audit-Log' })).toBeVisible();

  const tabelle = page.getByRole('table', { name: 'Protokoll der Verwaltung, neueste Einträge zuerst' });
  await expect(tabelle).toBeVisible();
  // Die eigene Anmeldung ist protokolliert (neueste zuerst, Konto mit Name)
  await expect(tabelle.getByRole('cell', { name: 'Anmeldung erfolgreich' }).first()).toBeVisible();
  await expect(tabelle.getByRole('rowheader').first()).toBeVisible();
  // Nur lesen: keine Schaltflächen in der Tabelle
  await expect(tabelle.getByRole('button')).toHaveCount(0);

  // Filter Aktion über die Auswahl und den Absendeknopf; die Adresse trägt den Filter
  await page.getByLabel('Aktion', { exact: true }).selectOption('anmeldung.erfolg');
  await page.getByRole('button', { name: 'Filtern', exact: true }).click();
  await expect(page).toHaveURL(/[?&]aktion=anmeldung\.erfolg/);
  await expect(tabelle.getByRole('cell', { name: 'Anmeldung fehlgeschlagen' })).toHaveCount(0);

  // Details enthalten nie Personendaten: keine E-Mail-Adresse in der Spalte Details
  const details = await tabelle.locator('tbody tr td:last-child').allInnerTexts();
  for (const text of details) expect(text).not.toContain('@');

  // Ungültiger Zeitraum: Fehler am Feld, Zusammenfassung oben, keine Einträge
  await page.goto('/verwaltung/audit?von=2026-05-10&bis=2026-05-01');
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
  await expect(page.getByLabel('Zeitraum bis', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Keine Einträge zu diesen Filtern gefunden.')).toBeVisible();

  // Barrierefreiheit (axe, WCAG 2.2 AA) auf Filter und Tabelle
  await page.goto('/verwaltung/audit');
  const befunde = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(befunde.violations.map((v) => `${v.id}: ${v.nodes.length} Knoten`)).toEqual([]);
});

test('Redaktion ohne Recht audit.lesen wird auf „Kein Zugriff“ umgeleitet', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page, 'redaktion');
  await page.goto('/verwaltung/audit');
  await expect(page).toHaveURL(/\/verwaltung\/kein-zugriff$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Kein Zugriff' })).toBeVisible();
});
