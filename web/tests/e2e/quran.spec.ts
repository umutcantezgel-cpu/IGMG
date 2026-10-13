import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import quran from '../../messages/bereiche/quran.json';

/**
 * E2E Quran-Seiten (O-Q01): Übersicht, Surenseite, Cüz und Tajwid in allen drei Sprachen – Status, Sprache, genau
 * eine h1, arabischer Text mit lang/dir, Quellenzeile mit tanzil.net, Blättern, 404 für unbekannte Nummern, kein
 * horizontaler Seitenscroll, axe ohne Befund. Voraussetzung: Inhaltsimport in der E2E-Datenbank (Tanzil 1.1).
 */
type Sprache = 'de' | 'tr' | 'en';
const T = { de: quran.de.quranSeite, tr: quran.tr.quranSeite, en: quran.en.quranSeite } as const;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const fuelle = (vorlage: string, werte: Record<string, string | number>) =>
  vorlage.replace(/\{(\w+)\}/g, (_g, k: string) => String(werte[k] ?? ''));

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

const SEITEN: { sprache: Sprache; pfad: string; h1: string | RegExp }[] = [
  { sprache: 'de', pfad: '/quran', h1: T.de.titel },
  { sprache: 'tr', pfad: '/tr/kuran', h1: T.tr.titel },
  { sprache: 'de', pfad: '/quran/1', h1: 'Al-Faatiha' },
  { sprache: 'tr', pfad: '/tr/kuran/36', h1: 'Yaseen' },
  { sprache: 'en', pfad: '/en/quran/114', h1: 'An-Naas' },
  { sprache: 'de', pfad: '/quran/cuz/30', h1: fuelle(T.de.cuz.titel, { nr: 30 }) },
  { sprache: 'en', pfad: '/en/quran/juz/1', h1: fuelle(T.en.cuz.titel, { nr: 1 }) },
  { sprache: 'de', pfad: '/quran/tajwid', h1: T.de.tajwidSeite.titel },
  { sprache: 'tr', pfad: '/tr/kuran/tecvid', h1: T.tr.tajwidSeite.titel },
];

for (const s of SEITEN) {
  test(`${s.pfad}: 200, lang="${s.sprache}", genau eine h1, kein Seitenscroll, axe ohne Befund`, async ({ page }) => {
    const antwort = await page.goto(s.pfad);
    expect(antwort?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', s.sprache);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(s.h1);
    const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ueberlauf).toBeLessThanOrEqual(0);
    const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(ergebnis.violations.map((v) => `${v.id} (${v.nodes.length} Knoten)`)).toEqual([]);
  });
}

test('Surenseite: arabischer Text rechtsläufig, Basmala nur ab Sure 2 (nicht 9), Quellenzeile mit tanzil.net', async ({ page }) => {
  await page.goto('/quran/1');
  await expect(page.locator('.vers-ar')).toHaveCount(7);
  await expect(page.locator('.vers-ar').first()).toHaveAttribute('lang', 'ar');
  await expect(page.locator('.vers-ar').first()).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.basmala')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'tanzil.net' })).toHaveAttribute('href', 'https://tanzil.net');
  await expect(page.getByRole('link', { name: T.de.quelle.link })).toHaveAttribute('href', '/quellen');

  await page.goto('/quran/9');
  await expect(page.locator('.basmala')).toHaveCount(0);
  await page.goto('/quran/36');
  await expect(page.locator('.basmala')).toHaveCount(1);
  await expect(page.locator('.vers-ar')).toHaveCount(83);
});

test('Kachel → Surenseite, Blättern zur nächsten und vorigen Sure', async ({ page }) => {
  await page.goto('/quran');
  await page.locator('li[data-nr="4"] a').click();
  await expect(page).toHaveURL(/\/quran\/4$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('An-Nisaa');
  const blaettern = page.getByRole('navigation', { name: T.de.sure.blaettern });
  await blaettern.getByRole('link', { name: new RegExp(T.de.sure.navNaechste) }).click();
  await expect(page).toHaveURL(/\/quran\/5$/);
  await page.goto('/quran/1');
  await expect(
    page.getByRole('navigation', { name: T.de.sure.blaettern }).getByRole('link', { name: new RegExp(T.de.sure.navVorher) }),
  ).toHaveCount(0);
});

test('unbekannte Suren und Cüz antworten mit 404', async ({ page }) => {
  for (const pfad of ['/quran/0', '/quran/02', '/quran/115', '/en/quran/999', '/quran/cuz/31', '/quran/cuz/0']) {
    const antwort = await page.goto(pfad);
    expect(antwort?.status(), pfad).toBe(404);
  }
});

test('Tajwid-Seite: 18 Regeln in sechs Familien, Erklärung nur freigegeben (sonst Platzhalter), Beispielvers markiert', async ({
  page,
}) => {
  await page.goto('/quran/tajwid');
  await expect(page.locator('li[id^="regel-"]')).toHaveCount(18);
  await expect(page.locator('section[id^="familie-"]')).toHaveCount(6);
  await expect(page.getByText(T.de.tajwidLeiste.platzhalter).first()).toBeVisible();
  await expect(page.locator('#regel-madd_2 .beispiel-vers .tj-madd').first()).toBeAttached();
  await expect(page.locator('#regel-madd_2 .beispiel-vers .tj:not(.tj-madd)')).toHaveCount(0);
});

test('statische Wortdaten: JSON ohne Cookies, nur geprüfte Bedeutungen', async ({ request }) => {
  const antwort = await request.get('/api/quran/1/woerter');
  expect(antwort.status()).toBe(200);
  expect(antwort.headers()['set-cookie']).toBeUndefined();
  const daten = (await antwort.json()) as { sure: number; verse: Record<string, { w: unknown[] }>; regeln: unknown[] };
  expect(daten.sure).toBe(1);
  expect(Object.keys(daten.verse)).toHaveLength(7);
  expect(daten.regeln.length).toBeGreaterThan(0);
  expect((await request.get('/api/quran/115/woerter')).status()).toBe(404);
});
