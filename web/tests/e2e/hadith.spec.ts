import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import barriere from '../../messages/bereiche/barrierefreiheit.json';
import hadith from '../../messages/bereiche/hadith.json';
import quellen from '../../messages/bereiche/quellen.json';

/**
 * E2E Hadith (AUFTRAG 3.3, H-D01) mit /quellen und /barrierefreiheit (H-R01). Ob die Gesamtsammlung sichtbar ist, hängt
 * vom Schalter `hadith_gesamt` (Produktion: aus bis MN-06) und vom Import ab; die Tests lesen den Zustand aus der
 * Bücherseite und prüfen jeweils das passende Verhalten: aus → Hinweis und 404 auf den Buchseiten, an → Raster, Karten
 * mit Anker, „Link kopieren“, Blättern und der Filter „Hadith“ in der Suche. Texte aus den Bereichsdateien.
 */
type Sprache = 'de' | 'tr' | 'en';
const SPRACHEN: Sprache[] = ['de', 'tr', 'en'];
const T = { de: hadith.de.hadith, tr: hadith.tr.hadith, en: hadith.en.hadith } as const;
const Q = { de: quellen.de.quellen, tr: quellen.tr.quellen, en: quellen.en.quellen } as const;
const B = { de: barriere.de.barrierefreiheit, tr: barriere.tr.barrierefreiheit, en: barriere.en.barrierefreiheit } as const;

const PFAD = {
  de: { start: '/hadith', auswahl: '/hadith/auswahl', bukhari: '/hadith/bukhari', buch: '/hadith/bukhari/1', suche: '/suche' },
  tr: { start: '/tr/hadis', auswahl: '/tr/hadis/secme', bukhari: '/tr/hadis/buhari', buch: '/tr/hadis/buhari/1', suche: '/tr/arama' },
  en: {
    start: '/en/hadith',
    auswahl: '/en/hadith/selection',
    bukhari: '/en/hadith/bukhari',
    buch: '/en/hadith/bukhari/1',
    suche: '/en/search',
  },
} as const;
const QUELLEN = { de: '/quellen', tr: '/tr/kaynaklar', en: '/en/sources' } as const;
const ERKLAERUNG = { de: '/barrierefreiheit', tr: '/tr/erisilebilirlik', en: '/en/accessibility' } as const;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

async function ohneBefund(page: Page) {
  const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(ergebnis.violations.map((v) => `${v.id} (${v.nodes.length} Knoten)`)).toEqual([]);
  const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(ueberlauf, 'kein horizontaler Seitenscroll').toBeLessThanOrEqual(0);
}

/** Anzahl der verlinkten Bücher auf der Bücherseite (0: Schalter aus oder kein Import). */
async function buecher(page: Page, sprache: Sprache): Promise<number> {
  const antwort = await page.goto(PFAD[sprache].bukhari);
  expect(antwort?.status()).toBe(200);
  return page.getByRole('navigation', { name: T[sprache].bukhari.liste, exact: true }).getByRole('link').count();
}

for (const s of SPRACHEN) {
  test(`${PFAD[s].start}: Einstieg mit h1, Weg zur Auswahl, Fußlinks, axe ohne Befund`, async ({ page }) => {
    const antwort = await page.goto(PFAD[s].start);
    expect(antwort?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', s);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(T[s].titel);
    const fuss = page.getByRole('contentinfo');
    await expect(fuss.getByRole('link', { name: Q[s].fussLink, exact: true })).toHaveAttribute('href', QUELLEN[s]);
    await expect(fuss.getByRole('link', { name: B[s].fussLink, exact: true })).toHaveAttribute('href', ERKLAERUNG[s]);
    await ohneBefund(page);
    await page
      .getByRole('link', { name: new RegExp(T[s].wege.auswahlTitel) })
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`${PFAD[s].auswahl}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(T[s].auswahl.titel);
  });

  test(`${PFAD[s].auswahl}: Liste oder ehrlicher Leerzustand`, async ({ page }) => {
    const antwort = await page.goto(PFAD[s].auswahl);
    expect(antwort?.status()).toBe(200);
    const liste = page.getByRole('list', { name: T[s].auswahl.liste, exact: true });
    if ((await liste.count()) === 0) await expect(page.getByRole('heading', { name: T[s].auswahl.leerTitel })).toBeVisible();
    else await expect(liste.locator('article[id^="h-"]').first()).toBeVisible();
    await ohneBefund(page);
  });
}

test('Bücherseite und Buch 1 folgen dem Schalter hadith_gesamt', async ({ page }) => {
  const anzahl = await buecher(page, 'de');
  if (anzahl === 0) {
    // Aus (oder ohne Import): Hinweis bzw. Leerzustand, Buchseiten antworten mit 404
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const antwort = await page.goto(PFAD.de.buch);
    expect(antwort?.status()).toBe(404);
    return;
  }
  expect(anzahl).toBe(97);
  await ohneBefund(page);
  // Kachel → Buchseite (Morph-Paar Buch → Kopf): Titel der Kachel ist die h1
  const kachel = page.getByRole('navigation', { name: T.de.bukhari.liste, exact: true }).getByRole('link').first();
  const titel = (await kachel.locator('[data-morph="titel"]').textContent())?.trim() ?? '';
  await kachel.click();
  await expect(page).toHaveURL(/\/hadith\/bukhari\/1$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(titel);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('lang', 'en');
  const erste = page.locator('article#h-1');
  await expect(erste.getByRole('heading', { level: 2 })).toContainText('Sahih al-Bukhari 1');
  await expect(erste.locator('p[lang="ar"][dir="rtl"]')).toBeVisible();
  await expect(erste.getByText(T.de.buch.uebersetzungInArbeit)).toBeVisible();
  await expect(page.getByRole('navigation', { name: T.de.buch.blaettern })).toHaveCount(1);
  await ohneBefund(page);
});

test('Link kopieren legt die Adresse mit Anker in die Zwischenablage', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop', 'Zwischenablage nur im Desktop-Projekt (Chromium)');
  if ((await buecher(page, 'de')) === 0) test.skip(true, 'Gesamtsammlung nicht freigeschaltet');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(PFAD.de.buch);
  await page.getByRole('link', { name: `${T.de.buch.linkKopieren}: Sahih al-Bukhari 2`, exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: T.de.buch.kopiert })).toContainText('Sahih al-Bukhari 2');
  await expect(page).toHaveURL(/#h-2$/);
  const kopiert = await page.evaluate(() => navigator.clipboard.readText());
  expect(kopiert).toMatch(/\/hadith\/bukhari\/1#h-2$/);
});

test('/tr/hadis/buhari/2: türkische Buchseite oder 404', async ({ page }) => {
  const sichtbar = (await buecher(page, 'tr')) > 0;
  const antwort = await page.goto('/tr/hadis/buhari/2');
  expect(antwort?.status()).toBe(sichtbar ? 200 : 404);
  if (sichtbar) {
    await expect(page.locator('article[id^="h-"]').first().getByRole('heading', { level: 2 })).toContainText('Sahîh-i Buhârî');
    await expect(page.getByText(T.tr.buch.uebersetzungInArbeit).first()).toBeVisible();
  }
});

test('Suche: Filter „Hadith“ nur mit freigeschalteter Sammlung; Nummernsuche führt zum Anker', async ({ page }) => {
  const sichtbar = (await buecher(page, 'de')) > 0;
  await page.goto(`${PFAD.de.suche}?q=Gebet`);
  const filter = page.getByRole('group', { name: T.de.suche.filter });
  if (!sichtbar) {
    await expect(filter).toHaveCount(0);
    return;
  }
  await expect(filter.getByRole('radio', { name: T.de.suche.hadith })).toBeVisible();
  await page.goto(`${PFAD.de.suche}?q=${encodeURIComponent('Bukhari 1')}&bereich=hadith`);
  const treffer = page.getByRole('region', { name: new RegExp(T.de.suche.gruppe.replace(/[()]/g, '\\$&')) });
  await expect(treffer.getByRole('link', { name: 'Sahih al-Bukhari 1', exact: true })).toHaveAttribute('href', '/hadith/bukhari/1#h-1');
  await ohneBefund(page);
});

for (const s of SPRACHEN) {
  test(`${QUELLEN[s]}: Abschnitte mit Ankern, Hadith-Quelle, axe ohne Befund`, async ({ page }) => {
    const antwort = await page.goto(QUELLEN[s]);
    expect(antwort?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(Q[s].titel);
    for (const id of ['koran', 'uebersetzungen', 'hadith', 'orte', 'gebetszeiten', 'schriften', 'bibliotheken']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    for (const id of ['tanzil', 'tajwid', 'hadith-api', 'geonames', 'adhan', 'amiri-quran']) {
      await expect(page.locator(`article#${id}`)).toHaveCount(1);
    }
    await expect(page.locator('section#hadith')).toContainText('fawazahmed0');
    await expect(page.locator('section#hadith').getByRole('link', { name: 'Unlicense' })).toHaveAttribute('href', 'https://unlicense.org/');
    await expect(page.locator('section#koran').getByRole('link', { name: 'CC BY 3.0' })).toHaveAttribute('href', /creativecommons\.org/);
    await ohneBefund(page);
  });

  test(`${ERKLAERUNG[s]}: Entwurf mit Platzhaltern und Weg zum Kontakt`, async ({ page }) => {
    const antwort = await page.goto(ERKLAERUNG[s]);
    expect(antwort?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(B[s].titel);
    await expect(page.getByRole('note').filter({ hasText: B[s].entwurf })).toBeVisible();
    await expect(page.locator('section#einschraenkungen li')).toHaveCount(B[s].einschraenkungen.punkte.length);
    await page.getByRole('link', { name: B[s].feedback.kontakt }).click();
    await expect(page).toHaveURL(new RegExp(`${{ de: '/kontakt', tr: '/tr/iletisim', en: '/en/contact' }[s]}$`));
  });
}
