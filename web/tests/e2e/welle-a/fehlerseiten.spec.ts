import { expect, test } from '@playwright/test';
import fehlerseiten from '../../../messages/bereiche/fehlerseiten.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 7: Unbekannte Adressen antworten mit HTTP 404; nach dem Laden zeigt die Seite
 * „Seite nicht gefunden“ und einen Link zur Startseite, der dorthin führt. Texte aus messages/bereiche/fehlerseiten.json (de).
 */

const f = fehlerseiten.de.fehlerseiten;

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

for (const adresse of ['/gibt-es-nicht', '/veranstaltungen/gibt-es-nicht'] as const) {
  test(`${adresse}: HTTP 404, danach „${f.nichtGefunden.titel}“ mit Link zur Startseite`, async ({ page }) => {
    const antwort = await page.goto(adresse);
    expect(antwort?.status()).toBe(404);

    await expect(page.getByRole('heading', { level: 1, name: f.nichtGefunden.titel, exact: true })).toBeVisible();
    const startseite = page.getByRole('link', { name: f.aktion.startseite, exact: true });
    await expect(startseite).toHaveAttribute('href', '/');

    await startseite.click();
    await page.waitForURL((url) => url.pathname === '/');
    await expect(page.getByRole('heading', { level: 1, name: f.nichtGefunden.titel, exact: true })).toHaveCount(0);
  });
}
