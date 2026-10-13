import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
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
 * Füllt ein Feld, bis das Formular den Wert übernommen hat. Vor der Hydrierung gehört das Feld noch dem Server-HTML;
 * React setzt es beim Hydrieren auf den Startwert zurück (unter Last in der Suite beobachtet, protokolle/C3-e2e-kontakt.md).
 * Maßstab ist das verborgene JSON-Feld „inhalt“, das aus dem Zustand des Formulars entsteht.
 */
async function fuelleUebernommen(page: Page, feld: Locator, wert: string) {
  await expect(async () => {
    await feld.fill(wert);
    await expect.poll(() => page.locator('input[name="inhalt"]').inputValue(), { timeout: 1000 }).toContain(JSON.stringify(wert));
  }).toPass({ timeout: 15_000, intervals: [500, 1000, 2000] });
}

/**
 * C05: Verwaltung › Seiteninhalte › Kontaktdaten und Organisationen. Die Organisationsredaktion sieht und ändert nur
 * die eigene Organisation (K-06); Speichern ist sofort öffentlich (Z-04). Nur Desktop (Anmelde-Ratenlimit).
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Organisationsredaktion GT sieht nur die eigene Organisation; fremde Seite ist kein Zugriff', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page, 'organisationsredaktion', 'gt');
  await page.goto('/verwaltung/seiteninhalte/organisationen');
  await expect(page.getByRole('heading', { level: 1, name: 'Organisationen' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bearbeiten: Gençlik Teşkilatı', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bearbeiten: Ana Teşkilatı', exact: true })).toHaveCount(0);
  await page.goto('/verwaltung/seiteninhalte/organisationen/kt');
  await expect(page).toHaveURL(/\/verwaltung\/kein-zugriff$/);
});

test('Organisationsredaktion GT speichert die eigene Organisation; die öffentliche Seite zeigt sie sofort', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page, 'organisationsredaktion', 'gt');
  const mission = `Testmission ${randomBytes(3).toString('hex')}`;
  await page.goto('/verwaltung/seiteninhalte/organisationen/gt');
  await expect(page.getByRole('heading', { level: 1, name: 'Gençlik Teşkilatı' })).toBeVisible();
  await fuelleUebernommen(page, page.getByLabel('Mission (Pflichtfeld)', { exact: true }), mission);
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Die Änderungen wurden gespeichert.' })).toBeVisible();
  await oeffentlichBis(page, '/organisationen/genclik-teskilati', () => expect(page.getByText(mission)).toBeVisible({ timeout: 1000 }));
});

test('Kontaktdaten: Fehler am Feld mit Sprungverweis, dann speichern; die Kontaktseite zeigt die Angaben', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page);
  const adresse = `Testadresse ${randomBytes(2).toString('hex')}, 00000 Testort`;
  await page.goto('/verwaltung/seiteninhalte/kontakt');
  await expect(page.getByRole('heading', { level: 1, name: 'Kontaktdaten' })).toBeVisible();
  await fuelleUebernommen(page, page.getByLabel('Adresse', { exact: true }), adresse);
  // Nur https ist erlaubt: die http-Adresse erzeugt einen Fehler am Feld (K-07)
  await page.getByLabel('Facebook', { exact: true }).fill('http://beispiel.example.test');
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  const meldung = page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' });
  await expect(meldung).toBeVisible();
  await expect(meldung.getByRole('link', { name: 'Soziale Netzwerke, Facebook' })).toBeVisible();
  await expect(page.getByLabel('Facebook', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Bitte eine Adresse eingeben, die mit https:// beginnt.').first()).toBeVisible();

  const axe = await new AxeBuilder({ page }).include('form').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  await page.getByLabel('Facebook', { exact: true }).fill('https://www.example.test/igmg');
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Die Änderungen wurden gespeichert.' })).toBeVisible();
  await oeffentlichBis(page, '/kontakt', () =>
    expect(page.locator('#inhalt').getByText(adresse, { exact: true })).toBeVisible({ timeout: 1000 }),
  );
});
