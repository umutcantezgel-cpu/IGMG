import { expect, test } from '@playwright/test';
import kalender from '../../messages/bereiche/kalender.json';
import korankurse from '../../messages/bereiche/korankurse.json';
import nachrichten from '../../messages/bereiche/nachrichten.json';
import vorstand from '../../messages/bereiche/vorstand.json';

/**
 * E2E SVG- und Bewegungsprogramm der Arbeitsansichten (AUFTRAG 4, O-B01/H-B01…B08): Wochenband der Veranstaltungen
 * (sieben Tage, statisch), Kategorie-Marken der Nachrichten (Form vor dem Namen, dekorativ), Kurs-Lernweg der Korankurse
 * (B-24: zeichnet sich einmal, reduziert ohne Animation, Sprung zur Karte) und Verbindungslinie der Vorsitzenden.
 * Texte aus messages/bereiche/*.json; die Inhalte kommen aus den Seeds (Beispielinhalte).
 */
const WOCHE = kalender.de.wochenband;
const KURSE = korankurse.de.korankurse;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

test.describe('Veranstaltungen: Wochenband', () => {
  test('sieben Tage ab heute, heute markiert, ohne Bewegung', async ({ page }) => {
    await page.goto('/veranstaltungen');
    const band = page.getByRole('region', { name: WOCHE.kennung });
    await expect(band).toBeVisible();
    const tage = band.locator('ol > li');
    await expect(tage).toHaveCount(7);
    await expect(tage.first()).toHaveAttribute('aria-current', 'date');
    await expect(tage.first()).toContainText(WOCHE.heute);
    // Jeder Tag hat eine Terminliste mit Achtstern-Punkt oder ist für Bildschirmleser als frei benannt
    for (let i = 0; i < 7; i++) {
      const tag = tage.nth(i);
      if (await tag.locator('ul').count()) await expect(tag.locator('svg[aria-hidden="true"]')).toHaveCount(1);
      else await expect(tag).toContainText(WOCHE.keinTermin);
    }
    const bewegungen = await band.evaluate((el) => el.getAnimations({ subtree: true }).length);
    expect(bewegungen).toBe(0);
  });
});

test.describe('Nachrichten: Kategorie-Marken', () => {
  test('Filter-Chips und Karten tragen die Marke vor dem Namen, dekorativ', async ({ page }) => {
    await page.goto('/nachrichten');
    const chips = page.getByRole('group', { name: nachrichten.de.nachrichten.gruppe }).getByRole('button');
    const anzahl = await chips.count();
    expect(anzahl).toBeGreaterThan(1);
    // „Alle“ ohne Marke, jede Kategorie mit genau einer verborgenen Marke
    await expect(chips.first().locator('svg[data-marke]')).toHaveCount(0);
    for (let i = 1; i < anzahl; i++) await expect(chips.nth(i).locator('svg[data-marke][aria-hidden="true"]')).toHaveCount(1);
    await expect(page.locator('article span.rounded-pill svg[data-marke]').first()).toBeVisible();
  });
});

test.describe('Korankurse: Kurs-Lernweg (B-24)', () => {
  test('Stationen je Kurs, Linie zeichnet sich einmal, Titel springt zur Karte', async ({ page }) => {
    await page.goto('/bildung/korankurse');
    const weg = page.getByRole('list', { name: KURSE.wegLabel });
    await expect(weg).toBeVisible();
    const stationen = weg.locator(':scope > li');
    expect(await stationen.count()).toBeGreaterThan(1);
    const animationen = await weg.evaluate((el) => el.getAnimations({ subtree: true }).map((a) => (a as CSSAnimation).animationName));
    expect(animationen).toContain('hervortreten');
    const link = stationen.first().getByRole('link');
    const ziel = await link.getAttribute('href');
    expect(ziel).toMatch(/^#kurs-/);
    await link.click();
    await expect(page.locator(ziel!)).toBeInViewport();
  });

  test.describe('reduzierte Bewegung', () => {
    test.use({ reducedMotion: 'reduce' });

    test('Endzustand sofort, keine Animation', async ({ page }) => {
      await page.goto('/bildung/korankurse');
      const weg = page.getByRole('list', { name: KURSE.wegLabel });
      await expect(weg).toBeVisible();
      expect(await weg.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    });
  });
});

test.describe('Vorstand: Verbindungslinie', () => {
  test('Linie der Amtszeiten bis „Heute“ über den Karten der Vorsitzenden', async ({ page }) => {
    await page.goto('/vorstand');
    const abschnitt = page.locator('section[aria-labelledby="vorstand-vorsitz"]');
    const linie = abschnitt.locator('div[aria-hidden="true"]').first();
    await expect(linie).toBeVisible();
    await expect(linie).toContainText(vorstand.de.vorstand.heute);
    const karten = await abschnitt.locator('ol > li').count();
    expect(await linie.locator('span.rounded-pill').count()).toBe(karten);
  });
});
