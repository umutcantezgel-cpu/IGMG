import { expect, test, type Page } from '@playwright/test';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';

/**
 * E2E Startseite (Blatt S01): Adresse und Sprache, genau eine h1, Tastaturweg zum Hauptinhalt, keine Konsolenfehler.
 * Texte kommen aus messages/{de,tr,en}.json, Selektoren über Rollen und Beschriftungen.
 * Der Erstbesuch-Hinweis wird vorab als gesehen markiert, weil er Tab-Reihenfolge und Hauptinhalt verdeckt.
 * Ob und wie er erscheint, ist offen (Blatt S01, Auffälligkeit 5) und nicht Teil dieser Tests.
 */

const SPRACHEN = [
  { kuerzel: 'de', pfad: '/', lang: 'de', texte: de },
  { kuerzel: 'tr', pfad: '/tr', lang: 'tr', texte: tr },
  { kuerzel: 'en', pfad: '/en', lang: 'en', texte: en },
] as const;

/**
 * Der Erstbesuch-Hinweis (Konzeptseite) setzt beim Bestätigen den Schlüssel igmg-konzepthinweis-gesehen = "1" im
 * localStorage (beobachtet). Dieser Zustand wird vor dem Laden gesetzt, damit der Hinweis Tab-Reihenfolge und Klicks nicht verdeckt.
 */
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

function sammleKonsolenfehler(seite: Page): string[] {
  const fehler: string[] = [];
  seite.on('console', (nachricht) => {
    if (nachricht.type() === 'error') fehler.push(`${nachricht.text()} (${nachricht.location().url})`);
  });
  seite.on('pageerror', (ausnahme) => fehler.push(String(ausnahme)));
  return fehler;
}

/** Nach dem Sprung über „Zum Inhalt“ liegt der Fokus im Hauptbereich (main) oder die Adresse steht auf #main-content. */
function sprungzielErreicht(seite: Page): Promise<boolean> {
  return seite.evaluate(() => window.location.hash === '#main-content' || Boolean(document.activeElement?.closest('main')));
}

for (const s of SPRACHEN) {
  test(`${s.kuerzel}: ${s.pfad} antwortet mit 200, html lang="${s.lang}", genau eine sichtbare h1`, async ({ page }) => {
    const antwort = await page.goto(s.pfad);
    expect(antwort?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', s.lang);
    const ueberschrift = page.getByRole('heading', { level: 1 });
    await expect(ueberschrift).toHaveCount(1);
    await expect(ueberschrift).toBeVisible();
  });

  test(`${s.kuerzel}: erster Tab-Schritt erreicht „${s.texte.kopf.zumInhalt}“, Enter springt zum Hauptinhalt`, async ({ page }) => {
    await page.goto(s.pfad);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: s.texte.kopf.zumInhalt, exact: true })).toBeFocused();
    await expect(page.getByRole('main')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect.poll(() => sprungzielErreicht(page)).toBe(true);
  });

  test(`${s.kuerzel}: Laden der Startseite meldet keine Konsolenfehler`, async ({ page }) => {
    const fehler = sammleKonsolenfehler(page);
    await page.goto(s.pfad);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(fehler).toEqual([]);
  });
}
