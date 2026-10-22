import { expect, test } from '@playwright/test';
import de from '../../../messages/lernapp/de.json';
import { ernsteBefunde } from './hilfen';

/**
 * Koran-Arabisch-Pfad (L6-05, ADR 0040 Nr. 5, KERN 4.0 §2.3/§4) gegen die E2E-Datenbank mit dem gepinnten Tanzil-Text und ohne
 * Bedeutungen oder Freigaben: Die erste Einheit zeigt ihre Wortformen (aus den gepinnten Daten, `lang="ar"`) mit
 * „Bedeutung folgt“, keine Übungen, keine Wiedergabe und keinen Weg zur Wiederholung; axe ohne ernste Befunde.
 */

test.use({ serviceWorkers: 'block' });

test('Koran-Kurs ohne Freigaben zeigt „Bedeutung folgt“ und keine Übungen', async ({ page }) => {
  await page.goto('/lern-app/de/koran');
  await expect(page.getByRole('heading', { level: 2, name: de.lernpfad.einheiten })).toBeVisible();
  await expect(page.locator('a[href="/lern-app/de/koran/wiederholen"]')).toHaveCount(0);

  const einheit = page.locator('details[data-einheit="koran.grund.e01"]');
  await expect(einheit).toBeVisible();
  await einheit.locator('summary').click();
  const woerter = einheit.locator('li[data-stelle]');
  await expect(woerter.first()).toBeVisible();
  const anzahl = await woerter.count();
  expect(anzahl).toBeGreaterThan(0);
  await expect(einheit.locator('[data-bedeutung="folgt"]')).toHaveCount(anzahl);
  await expect(einheit.locator('[data-bedeutung="ja"]')).toHaveCount(0);
  await expect(einheit.locator('[data-bedeutung="folgt"]').first()).toHaveText(de.koranpfad.bedeutungFolgt);
  await expect(woerter.first().locator('[lang="ar"][dir="rtl"]')).toBeVisible();
  await expect(einheit.getByText(de.koranpfad.uebungenFolgen)).toBeVisible();
  await expect(einheit.locator('a[href*="/ueben?l="]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: de.koranpfad.anhoeren })).toHaveCount(0);

  expect(await ernsteBefunde(page, 'koran')).toEqual([]);
});
