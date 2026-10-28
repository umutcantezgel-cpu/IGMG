import { expect, test } from '@playwright/test';
import dachverband from '../../../messages/bereiche/dachverband.json';
import igmg from '../../../messages/bereiche/igmg.json';

/**
 * E2E Marktstart P1: /igmg mit belegten Fakten aus dem Seed (ADR 0046). Kennzahlen mit Stand, Zentralkontakt mit echtem
 * Website-Link, unter den Reitern „Mehr bei der IGMG“, Fragen und Quellenzeile – immer sichtbar, kein sechster Reiter.
 * Reiter sind per Anker verlinkbar (docs/ABWEICHUNGEN.md). Texte aus messages (de, tr).
 */
const t = igmg.de.igmg;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

test('Kennzahlen mit Stand und Quelle, keine Platzhalter auf der Seite', async ({ page }) => {
  await page.goto('/igmg');
  const zahlen = page.getByRole('region', { name: t.zahlenTitel, exact: true });
  await expect(zahlen.getByText('über 700', { exact: true })).toBeVisible();
  await expect(zahlen.getByText('rund 2.500', { exact: true })).toBeVisible();
  await expect(zahlen.getByText('Stand: Juni 2026')).toBeVisible();
  await expect(page.locator('main')).not.toContainText('[Zahl fehlt');
  await expect(page.getByRole('tab')).toHaveCount(5);
});

test('Kontakt: Website als externer Link, Register sichtbar', async ({ page }) => {
  await page.goto('/igmg#kontakt');
  const liste = page.getByRole('tablist', { name: t.themen, exact: true });
  await expect(liste.getByRole('tab', { name: t.tabKontakt, exact: true })).toHaveAttribute('aria-selected', 'true');
  const feld = page.getByRole('tabpanel', { name: t.tabKontakt, exact: true });
  await expect(feld.getByText('Colonia-Allee 3')).toBeVisible();
  const website = feld.getByRole('link', { name: /^www\.igmg\.org/ });
  await expect(website).toHaveAttribute('href', 'https://www.igmg.org/');
  await expect(website).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(feld.getByText('Amtsgericht Köln, VR 17018')).toBeVisible();
});

test('Reiterwechsel setzt den Anker, ohne neuen Verlaufseintrag', async ({ page }) => {
  await page.goto('/igmg');
  const laengeVorher = await page.evaluate(() => window.history.length);
  await page.getByRole('tablist', { name: t.themen, exact: true }).getByRole('tab', { name: t.tabGeschichte, exact: true }).click();
  await expect(page).toHaveURL(/#geschichte$/);
  expect(await page.evaluate(() => window.history.length)).toBe(laengeVorher);
  await page.reload();
  await expect(page.getByRole('tabpanel', { name: t.tabGeschichte, exact: true })).toBeVisible();
});

test('unter den Reitern: Mehr bei der IGMG, Fragen und Quellenzeile (Türkisch)', async ({ page }) => {
  await page.goto('/tr/igmg');
  const tr = igmg.tr.igmg;
  const mehr = page.getByRole('region', { name: dachverband.tr.dachverband.mehrTitel, exact: true });
  await expect(mehr.getByRole('link').first()).toHaveAttribute('rel', 'noopener noreferrer');
  const fragen = page.getByRole('region', { name: tr.faqTitel, exact: true });
  await expect(fragen.locator('details')).toHaveCount(5);
  await expect(page.getByRole('link', { name: dachverband.tr.dachverband.quellenLink, exact: true })).toBeVisible();
});
