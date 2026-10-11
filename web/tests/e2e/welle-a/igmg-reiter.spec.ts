import { expect, test } from '@playwright/test';
import igmg from '../../../messages/bereiche/igmg.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 2: Die fünf Themen-Reiter der IGMG-Seite wechseln mit Pfeiltasten, Pos1 und Ende.
 * Nach jedem Schritt stimmen Fokus, aria-selected und das eine sichtbare Panel überein. Texte aus
 * messages/bereiche/igmg.json (de).
 */

const t = igmg.de.igmg;
const REITER = [t.tabUeberblick, t.tabBedeutung, t.tabGeschichte, t.tabStruktur, t.tabKontakt] as const;

/** Der Erstbesuch-Hinweis (Konzeptseite) ist vorab als gesehen markiert, damit er Tastatur und Klicks nicht verdeckt. */
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

test('Reiter wechseln mit Pfeil rechts/links, Pos1 und Ende; aria-selected und sichtbares Panel stimmen', async ({ page }) => {
  await page.goto('/igmg');
  const liste = page.getByRole('tablist', { name: t.themen, exact: true });
  const reiter = (name: string) => liste.getByRole('tab', { name, exact: true });

  async function pruefeAuswahl(name: string) {
    await expect(reiter(name)).toHaveAttribute('aria-selected', 'true');
    await expect(reiter(name)).toBeFocused();
    await expect(page.getByRole('tabpanel', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    for (const anderer of REITER.filter((r) => r !== name)) {
      await expect(reiter(anderer)).toHaveAttribute('aria-selected', 'false');
    }
  }

  await reiter(REITER[0]).focus();
  await pruefeAuswahl(REITER[0]);

  // Negativ: eine Taste ohne Bedeutung wechselt den Reiter nicht.
  await page.keyboard.press('x');
  await pruefeAuswahl(REITER[0]);

  await page.keyboard.press('ArrowRight');
  await pruefeAuswahl(REITER[1]);
  await page.keyboard.press('ArrowRight');
  await pruefeAuswahl(REITER[2]);
  await page.keyboard.press('End');
  await pruefeAuswahl(REITER[4]);
  await page.keyboard.press('ArrowRight');
  await pruefeAuswahl(REITER[0]);
  await page.keyboard.press('ArrowLeft');
  await pruefeAuswahl(REITER[4]);
  await page.keyboard.press('ArrowLeft');
  await pruefeAuswahl(REITER[3]);
  await page.keyboard.press('Home');
  await pruefeAuswahl(REITER[0]);
});

test('Klick auf einen Reiter wählt ihn aus; das Panel des vorherigen Reiters ist danach verborgen', async ({ page }) => {
  await page.goto('/igmg');
  const liste = page.getByRole('tablist', { name: t.themen, exact: true });
  await liste.getByRole('tab', { name: REITER[4], exact: true }).click();
  await expect(liste.getByRole('tab', { name: REITER[4], exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: REITER[4], exact: true })).toBeVisible();
  await expect(page.getByRole('tabpanel', { name: REITER[0], exact: true, includeHidden: true })).toBeHidden();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
});
