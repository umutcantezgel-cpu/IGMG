import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * V14 Verwaltung › Styleguide: Aufruf über die Seitenleiste, Sprungnavigation, Token-Namen aus der Liste,
 * Kontrastangabe nur dort, wo der Token-Kommentar sie nennt, Fehlerzustand eines Feldes mit Text, und keine
 * axe-Befunde nach WCAG 2.2 AA. Nur Desktop (Anmelde-Ratenlimit). Werte und Texte prüft der Unit-Test
 * `tests/unit/styleguide-tokens.test.ts` gegen globals.css und die Messages.
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Styleguide: Aufruf, Abschnitte, Tokens, Felder und Barrierefreiheit', async ({ page }) => {
  test.setTimeout(120_000);
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page);

  await page.getByRole('navigation', { name: 'Dashboard-Bereiche' }).getByRole('link', { name: 'Styleguide', exact: true }).click();
  await expect(page).toHaveURL(/\/verwaltung\/styleguide$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Styleguide & Design System' })).toBeVisible();

  // Sprungnavigation führt zum Abschnitt
  await page.getByRole('navigation', { name: 'Abschnitte dieser Seite' }).getByRole('link', { name: 'Radien', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Radien' })).toBeVisible();

  // Farben: Name und Verwendung aus der Liste; Kontrast nur bei Rand (Kommentar: „≥ 3:1“), nicht bei Grün-950
  const rand = page.locator('article').filter({ has: page.getByText('--color-rand', { exact: true }) });
  await expect(rand).toContainText('Ränder von Bedienelementen');
  await expect(rand).toContainText('Kontrast');
  const gruen950 = page.locator('article').filter({ has: page.getByText('--color-gruen-950', { exact: true }) });
  await expect(gruen950).not.toContainText('Kontrast');

  // Felder: Pflichtkennzeichnung und Fehler am Feld mit Text
  await expect(page.getByLabel('Name (Pflichtfeld)', { exact: true })).toBeVisible();
  await expect(page.getByText('Bitte geben Sie eine gültige E-Mail-Adresse ein.')).toBeVisible();

  // Knöpfe und Pillen sind sichtbar
  await expect(page.getByRole('button', { name: 'Primär', exact: true })).toBeVisible();
  // im Abschnitt suchen: Next.js hält die zuvor besuchte Übersicht (mit Status-Pillen) versteckt im DOM
  await expect(page.locator('#pillen').getByText('Veröffentlicht', { exact: true })).toBeVisible();

  // Barrierefreiheit: axe mit den WCAG-Regelsätzen aus tests/e2e/barrierefreiheit.spec.ts
  const ergebnis = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const befunde = ergebnis.violations.map(
    (v) =>
      `${v.id}: ${v.nodes
        .slice(0, 3)
        .map((n) => n.target.join(' '))
        .join(' | ')}`,
  );
  expect(befunde).toEqual([]);

  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Ohne Anmeldung leitet die Seite zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung/styleguide');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
