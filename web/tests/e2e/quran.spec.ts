import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import quran from '../../messages/bereiche/quran.json';

/**
 * E2E Quran (Blatt S13, Routen /quran und /quran/[sure]): Adresse und Sprache, genau eine h1, Platzhalter ohne
 * importierte Quelle (kein arabischer Verstext), Surwahl mit aria-current, Blättern nur innerhalb der vorhandenen
 * Suren, 404 für unbekannte Nummern, axe ohne Befund. Texte kommen aus messages/bereiche/quran.json, Selektoren über
 * Rollen und Beschriftungen. Die Test-Datenbank hat keinen Quran-Import: dann gibt es genau fünf Suren.
 */

type Sprache = 'de' | 'tr' | 'en';

const TEXTE = {
  de: quran.de.quranSeite,
  tr: quran.tr.quranSeite,
  en: quran.en.quranSeite,
} as const;

/** Adresse der Surenliste je Sprache (Deutsch ohne Präfix, /tr und /en mit Präfix). */
const WURZEL: Record<Sprache, string> = { de: '/quran', tr: '/tr/kuran', en: '/en/quran' };

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Einstieg /quran (Sure 1) und Surenansichten in allen drei Sprachen. */
const SEITEN: { sprache: Sprache; pfad: string; sure: number }[] = [
  { sprache: 'de', pfad: '/quran', sure: 1 },
  { sprache: 'de', pfad: '/quran/2', sure: 2 },
  { sprache: 'tr', pfad: '/tr/kuran', sure: 1 },
  { sprache: 'en', pfad: '/en/quran/5', sure: 5 },
];

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

function surenliste(seite: Page, sprache: Sprache) {
  return seite.getByRole('navigation', { name: TEXTE[sprache].liste, exact: true });
}

function blaettern(seite: Page, sprache: Sprache) {
  return seite.getByRole('navigation', { name: TEXTE[sprache].blaettern, exact: true });
}

for (const s of SEITEN) {
  test(`${s.pfad} antwortet mit 200, html lang="${s.sprache}", genau eine h1`, async ({ page }) => {
    const antwort = await page.goto(s.pfad);
    expect(antwort?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', s.sprache);
    const ueberschrift = page.getByRole('heading', { level: 1 });
    await expect(ueberschrift).toHaveCount(1);
    await expect(ueberschrift).toHaveText(TEXTE[s.sprache].titel);
  });

  test(`${s.pfad}: Platzhalter sichtbar, ohne Quelle kein arabischer Verstext`, async ({ page }) => {
    await page.goto(s.pfad);
    await expect(page.getByRole('status').filter({ hasText: TEXTE[s.sprache].platzhalter })).toBeVisible();
    await expect(page.locator('main [lang="ar"]')).toHaveCount(0);
    await expect(page.locator('main [dir="rtl"]')).toHaveCount(0);
  });

  test(`${s.pfad}: Zählzeile mit Strich, Audio ist deaktiviert`, async ({ page }) => {
    await page.goto(s.pfad);
    await expect(page.getByText(TEXTE[s.sprache].zaehlung.replace('{anzahl}', '–'), { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: TEXTE[s.sprache].audioFolgt, exact: true })).toBeDisabled();
  });

  test(`${s.pfad}: Surenliste mit fünf Suren, aria-current an Sure ${s.sure}`, async ({ page }) => {
    await page.goto(s.pfad);
    const liste = surenliste(page, s.sprache);
    await expect(liste.getByRole('link')).toHaveCount(5);
    const aktuell = liste.locator('[aria-current="page"]');
    await expect(aktuell).toHaveCount(1);
    await expect(aktuell).toHaveAttribute('href', `${WURZEL[s.sprache]}/${s.sure}`);
  });

  test(`${s.pfad}: kein horizontaler Seitenscroll`, async ({ page }) => {
    await page.goto(s.pfad);
    const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ueberlauf).toBeLessThanOrEqual(0);
  });

  test(`${s.pfad}: axe ohne Befund`, async ({ page }) => {
    await page.goto(s.pfad);
    const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(ergebnis.violations.map((verstoss) => `${verstoss.id} (${verstoss.nodes.length} Knoten)`)).toEqual([]);
  });
}

test('Surwahl: Link in der Surenliste führt zur Surenansicht', async ({ page }) => {
  await page.goto('/quran');
  await surenliste(page, 'de').getByRole('link', { name: TEXTE.de.sura['4'] }).click();
  await expect(page).toHaveURL(/\/quran\/4$/);
  await expect(page.getByRole('article').getByRole('heading', { level: 2 })).toHaveText(TEXTE.de.sura['4']);
  expect(await page.title()).toContain(TEXTE.de.sura['4']);
});

test('Blättern: Nächste Sura führt weiter, Vorherige fehlt auf Sure 1', async ({ page }) => {
  await page.goto('/quran/2');
  await blaettern(page, 'de').getByRole('link', { name: TEXTE.de.navNaechste, exact: true }).click();
  await expect(page).toHaveURL(/\/quran\/3$/);
  await expect(page.getByRole('article').getByRole('heading', { level: 2 })).toHaveText(TEXTE.de.sura['3']);

  await page.goto('/quran');
  await expect(blaettern(page, 'de').getByRole('link', { name: TEXTE.de.navVorher, exact: true })).toHaveCount(0);
  await expect(blaettern(page, 'de').getByRole('link', { name: TEXTE.de.navNaechste, exact: true })).toHaveAttribute('href', '/quran/2');
});

test('Blättern: auf der letzten Sure ohne Import fehlt „Nächste Sura“', async ({ page }) => {
  await page.goto('/en/quran/5');
  await expect(blaettern(page, 'en').getByRole('link', { name: TEXTE.en.navNaechste, exact: true })).toHaveCount(0);
  await expect(blaettern(page, 'en').getByRole('link', { name: TEXTE.en.navVorher, exact: true })).toHaveAttribute('href', '/en/quran/4');
});

test('unbekannte Suren antworten mit 404: /quran/6, /quran/02, /en/quran/0', async ({ page }) => {
  for (const pfad of ['/quran/6', '/quran/02', '/en/quran/0']) {
    const antwort = await page.goto(pfad);
    expect(antwort?.status(), pfad).toBe(404);
  }
});
