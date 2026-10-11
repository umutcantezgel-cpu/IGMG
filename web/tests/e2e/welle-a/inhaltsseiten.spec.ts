import { expect, test } from '@playwright/test';
import vorstand from '../../../messages/bereiche/vorstand.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 6: Vorstand, Über uns und Projekte. Jede Seite hat genau eine h1 und zeigt
 * Platzhalter in eckigen Klammern; die Namen im Vorstand sind keine erfundenen Namen. Ein Link „Kontakt aufnehmen“
 * (falls vorhanden) führt auf /kontakt mit HTTP 200. Texte aus messages/bereiche/vorstand.json (de).
 */

const v = vorstand.de.vorstand;

const SEITEN = ['/vorstand', '/ueber-uns', '/projekte'] as const;

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

function normalisiere(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

for (const pfad of SEITEN) {
  test(`${pfad}: genau eine h1, Platzhalter in eckigen Klammern sichtbar`, async ({ page }) => {
    await page.goto(pfad);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page
        .getByRole('main')
        .getByText(/\[[^\]]+\]/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  });

  test(`${pfad}: Link „Kontakt aufnehmen“ (falls vorhanden) führt auf /kontakt mit HTTP 200`, async ({ page, request }) => {
    await page.goto(pfad);
    const links = await page.getByRole('link', { name: /^Kontakt aufnehmen/ }).all();
    if (links.length === 0) {
      test.info().annotations.push({ type: 'hinweis', description: 'Auf dieser Seite gibt es keinen Link „Kontakt aufnehmen“.' });
      return;
    }
    for (const link of links) {
      const ziel = normalisiere(await link.getAttribute('href'));
      expect(ziel).toBe('/kontakt');
      const antwort = await request.get(ziel);
      expect(antwort.status()).toBe(200);
    }
  });
}

test('/vorstand: die Namen im aktuellen Vorstand und bei den Vorsitzenden sind Platzhalter, keine erfundenen Namen', async ({ page }) => {
  await page.goto('/vorstand');
  for (const abschnitt of [v.aktuellTitel, v.vorsitzTitel]) {
    const namen = await page.getByRole('region', { name: abschnitt, exact: true }).getByRole('heading', { level: 3 }).allTextContents();
    expect(namen.length).toBeGreaterThan(0);
    for (const name of namen) {
      expect(normalisiere(name)).toMatch(/^\[[^\]]+\]$/);
    }
  }
});
