import { expect, test } from '@playwright/test';
import kontakt from '../../../messages/bereiche/kontakt.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 5: Kontakt. Die Kartenfläche der Anfahrt zeigt den Hinweis zur Datenübertragung;
 * beim Laden der Seite gibt es keine Anfrage an fremde Hosts (die Karte lädt erst nach einem Klick). Texte aus
 * messages/bereiche/kontakt.json (de).
 */

const t = kontakt.de.kontakt;

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

test('Kartenfläche der Anfahrt zeigt den Hinweis zur Datenübertragung', async ({ page }) => {
  // Gewolltes Verhalten (M-010): Ohne bestätigte Koordinaten wird keine Karte angeboten, also fließen keine Daten und der
  // Hinweis entfällt – geprüft im Negativfall unten. Mit Koordinaten im Testbestand diesen Test aktivieren.
  test.skip(true, 'Karte und Hinweis erst mit bestätigten Koordinaten (M-010)');
  await page.goto('/kontakt');
  const anfahrt = page.getByRole('region', { name: t.anfahrt.titel, exact: true });
  await expect(anfahrt.getByText(t.karte.hinweis, { exact: true })).toBeVisible();
});

test('ohne bestätigte Koordinaten lädt die Kartenfläche keine Karte und bietet keinen Ladeknopf', async ({ page }) => {
  // Negativfall zum Hinweis: Solange die Lage nicht bestätigt ist (M-010), gibt es weder Einbettung noch Ladeknopf.
  await page.goto('/kontakt');
  const anfahrt = page.getByRole('region', { name: t.anfahrt.titel, exact: true });
  await expect(anfahrt.getByText(t.karte.ohneKoordinaten, { exact: true })).toBeVisible();
  await expect(anfahrt.getByRole('button', { name: t.karte.laden, exact: true })).toHaveCount(0);
  await expect(anfahrt.locator('iframe')).toHaveCount(0);
});

test('beim Laden der Kontaktseite keine Anfrage an fremde Hosts', async ({ page, baseURL }) => {
  const anfragen: string[] = [];
  page.on('request', (anfrage) => anfragen.push(anfrage.url()));

  await page.goto('/kontakt');
  await expect(page.getByRole('heading', { level: 1, name: t.titel, exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');

  const eigenerHost = new URL(baseURL ?? 'http://localhost:3100').host;
  const fremd = anfragen.filter((adresse) => {
    const ziel = new URL(adresse);
    return (ziel.protocol === 'http:' || ziel.protocol === 'https:') && ziel.host !== eigenerHost;
  });
  expect(fremd).toEqual([]);
});
