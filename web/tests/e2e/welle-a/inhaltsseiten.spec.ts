import { expect, test } from '@playwright/test';
import vorstand from '../../../messages/bereiche/vorstand.json';

/**
 * E2E Welle A (Kennung A23b), Ablauf 6: Vorstand, Über uns und Projekte. Jede Seite hat genau eine h1 und zeigt keine
 * Platzhalter in eckigen Klammern (Vorstellung 23.11.2026): Was die Gemeinde noch nicht geliefert hat, entfällt. Im
 * Vorstand steht statt eines Namens das Amt – keine erfundenen Namen. Ein Link „Kontakt aufnehmen“ (falls vorhanden)
 * führt auf /kontakt mit HTTP 200. Texte aus messages/bereiche/vorstand.json (de), Ämter aus dem Seed.
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
  test(`${pfad}: genau eine h1, keine Platzhalter in eckigen Klammern`, async ({ page }) => {
    await page.goto(pfad);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('main')).not.toContainText(/\[[^\]]+\]/);
    // Es bleibt auch keine leere Überschrift zurück
    const ueberschriften = await page.getByRole('main').getByRole('heading').allInnerTexts();
    expect(ueberschriften.filter((u) => normalisiere(u) === '')).toEqual([]);
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

/** Ämter des aktuellen Vorstands im Beispielbestand (drizzle/seeds/bereiche/vorstand.ts). */
const AEMTER = [
  'Vorsitzender',
  'Stellvertretender Vorsitzender',
  'Schatzmeister',
  'Bildungsbeauftragter',
  'Jugendbeauftragter',
  'Sozialbeauftragter',
];

test('/vorstand: ohne Namen steht das Amt in der Hauptzeile – keine Platzhalter, keine erfundenen Namen, keine Telefonzeile', async ({
  page,
}) => {
  await page.goto('/vorstand');
  const aktuell = page.getByRole('region', { name: v.aktuellTitel, exact: true });
  const aemter = (await aktuell.getByRole('heading', { level: 3 }).allTextContents()).map(normalisiere);
  expect(aemter).toEqual(AEMTER);
  const vorsitz = page.getByRole('region', { name: v.vorsitzTitel, exact: true });
  const rollen = (await vorsitz.getByRole('heading', { level: 3 }).allTextContents()).map(normalisiere);
  expect(rollen.length).toBeGreaterThan(0);
  for (const rolle of rollen) expect([v.rolleEhemalig, v.rolleAktuell]).toContain(rolle);
  expect(rollen.at(-1)).toBe(v.rolleAktuell);
  // Das Amt steht nur einmal je Karte (nicht noch als Etikett darunter); E-Mail bleibt, Telefonnummern fehlen noch
  const ersteKarte = aktuell.locator('article').first();
  await expect(ersteKarte.getByText(AEMTER[0], { exact: true })).toHaveCount(1);
  await expect(ersteKarte.locator('a[href^="mailto:"]')).toBeVisible();
  await expect(aktuell.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.getByRole('main')).not.toContainText(/\[[^\]]+\]/);
});
