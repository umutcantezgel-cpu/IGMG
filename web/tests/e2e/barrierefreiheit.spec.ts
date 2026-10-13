import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * T5: Barrierefreiheit der öffentlichen Routen (K-11, WCAG 2.2 AA).
 *
 * Jede Route aus ROUTEN wird auf Deutsch, Türkisch und Englisch in den Projekten „telefon“ (390 px) und „desktop“
 * (1440 px) aus playwright.config.ts geprüft: axe mit den WCAG-Regelsätzen, lang-Attribut, genau ein h1,
 * ein main-Landmark und ein alt-Attribut an jedem img. Erscheint der Hinweis „Konzept-Website“, wird die Seite zuerst
 * mit offenem Dialog geprüft, danach geschlossen und erneut geprüft. Befunde werden nicht ausgeschlossen.
 *
 * Neue Wellen: je Route eine Zeile in ROUTEN (Pfade aus src/i18n/routing.ts, localePrefix „as-needed“).
 */

type Sprache = 'de' | 'tr' | 'en';

type Route = {
  name: string;
  /** Pfad je Sprache. Ein Platzhalter [slug] wird zur Laufzeit ersetzt. */
  pfad: Record<Sprache, string>;
  /** Nur Detailseiten: Name der Listenroute, deren erster Link „Details ansehen“ den Slug liefert. */
  slugAus?: string;
};

/** Öffentliche Routen; Deutsch ohne Präfix, /tr und /en mit Präfix. */
const ROUTEN: Route[] = [
  { name: 'Startseite', pfad: { de: '/', tr: '/tr', en: '/en' } },
  { name: 'Veranstaltungen', pfad: { de: '/veranstaltungen', tr: '/tr/etkinlikler', en: '/en/events' } },
  {
    name: 'Veranstaltungsdetail',
    pfad: { de: '/veranstaltungen/[slug]', tr: '/tr/etkinlikler/[slug]', en: '/en/events/[slug]' },
    slugAus: 'Veranstaltungen',
  },
  { name: 'Schüler-Voranmeldung', pfad: { de: '/bildung/voranmeldung', tr: '/tr/egitim/on-kayit', en: '/en/education/pre-registration' } },
  { name: 'Mitglied werden', pfad: { de: '/mitglied-werden', tr: '/tr/uye-ol', en: '/en/become-a-member' } },
  { name: 'Meldung', pfad: { de: '/meldung', tr: '/tr/bildirim', en: '/en/report' } },
  { name: 'Suche', pfad: { de: '/suche?q=Gebet', tr: '/tr/arama?q=namaz', en: '/en/search?q=prayer' } },
  {
    name: 'Webseite für Moscheen',
    pfad: { de: '/webseite-fuer-moscheen', tr: '/tr/camiler-icin-web-sitesi', en: '/en/website-for-mosques' },
  },
  { name: 'Nachrichten', pfad: { de: '/nachrichten', tr: '/tr/haberler', en: '/en/news' } },
  {
    name: 'Nachricht-Detail',
    pfad: {
      de: '/nachrichten/neue-gebetszeiten-fuer-den-winter',
      tr: '/tr/haberler/neue-gebetszeiten-fuer-den-winter',
      en: '/en/news/neue-gebetszeiten-fuer-den-winter',
    },
  },
  { name: 'Über uns', pfad: { de: '/ueber-uns', tr: '/tr/hakkimizda', en: '/en/about-us' } },
  { name: 'Vorstand', pfad: { de: '/vorstand', tr: '/tr/yonetim', en: '/en/board' } },
  { name: 'Projekte', pfad: { de: '/projekte', tr: '/tr/projeler', en: '/en/projects' } },
  { name: 'Kontakt', pfad: { de: '/kontakt', tr: '/tr/iletisim', en: '/en/contact' } },
  { name: 'IGMG', pfad: { de: '/igmg', tr: '/tr/igmg', en: '/en/igmg' } },
  {
    name: 'Organisation (Ana Teşkilatı)',
    pfad: { de: '/organisationen/ana-teskilati', tr: '/tr/organizasyonlar/ana-teskilati', en: '/en/organizations/ana-teskilati' },
  },
  { name: 'Korankurse', pfad: { de: '/bildung/korankurse', tr: '/tr/egitim/kuran-kurslari', en: '/en/education/quran-courses' } },
  { name: 'Gebetszeiten', pfad: { de: '/gebetszeiten', tr: '/tr/namaz-vakitleri', en: '/en/prayer-times' } },
  { name: 'Islamisches Wissen', pfad: { de: '/islamisches-wissen', tr: '/tr/islami-bilgiler', en: '/en/islamic-knowledge' } },
  {
    name: 'Islamisches Wissen, Thema',
    pfad: { de: '/islamisches-wissen/mosque', tr: '/tr/islami-bilgiler/mosque', en: '/en/islamic-knowledge/mosque' },
  },
  { name: 'Impressum', pfad: { de: '/impressum', tr: '/tr/kunye', en: '/en/imprint' } },
  { name: 'Datenschutz', pfad: { de: '/datenschutz', tr: '/tr/gizlilik', en: '/en/privacy' } },
  { name: 'Seite nicht gefunden', pfad: { de: '/gibt-es-nicht', tr: '/tr/gibt-es-nicht', en: '/en/gibt-es-nicht' } },
  // Konto-Einstieg (ADR 0026; mit Funktion `konten` aus liefern sie die 404-Seite, die ebenso geprüft wird)
  { name: 'Anmelden', pfad: { de: '/anmelden', tr: '/tr/giris', en: '/en/sign-in' } },
  { name: 'Registrieren', pfad: { de: '/registrieren', tr: '/tr/kayit', en: '/en/register' } },
  { name: 'Passwort vergessen', pfad: { de: '/passwort-vergessen', tr: '/tr/sifremi-unuttum', en: '/en/forgot-password' } },
];

const SPRACHEN: Sprache[] = ['de', 'tr', 'en'];

/** Beschriftung des Listen-Links je Sprache (messages/*.json, Schlüssel karten.details). */
const DETAIL_LINK: Record<Sprache, string> = { de: 'Details ansehen', tr: 'Detayları gör', en: 'View details' };

/** Erwartete Breite je Projekt aus playwright.config.ts. */
const BREITE: Record<string, number> = { telefon: 390, desktop: 1440 };

/** Regelsätze für WCAG 2.2 Stufe AA. Best-Practice-Regeln gehören nicht zu diesem Test. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Befunde als lesbare Zeilen: Regel-id, impact und die ersten drei Ziel-Selektoren (kein JSON). */
async function axeBefunde(page: Page, kennzeichen: string): Promise<string[]> {
  const ergebnis = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return ergebnis.violations.map((verstoss) => {
    const ziele = verstoss.nodes
      .slice(0, 3)
      .map((knoten) => knoten.target.flat().join(' '))
      .join(' ; ');
    return `${kennzeichen}${verstoss.id} (impact: ${verstoss.impact ?? 'unbekannt'}, ${verstoss.nodes.length} Knoten): ${ziele}`;
  });
}

/**
 * Prüft die geladene Seite. Ist der Hinweis „Konzept-Website“ im HTML vorhanden (alertdialog), wird er zuerst mit
 * offenem Dialog geprüft, danach geschlossen und die Seite erneut geprüft.
 */
async function pruefeSeite(page: Page): Promise<string[]> {
  const hinweis = page.getByRole('alertdialog', { includeHidden: true });
  const befunde: string[] = [];
  if ((await hinweis.count()) > 0) {
    await expect(hinweis, 'Hinweis „Konzept-Website“ öffnet sich nicht').toBeVisible();
    befunde.push(...(await axeBefunde(page, '[Dialog offen] ')));
    await hinweis.getByRole('button').click();
    await expect(hinweis, 'Hinweis „Konzept-Website“ schließt sich nicht').toBeHidden();
  }
  befunde.push(...(await axeBefunde(page, '')));
  return befunde;
}

/** Strukturprüfung mit weichen Erwartungen, damit auch bei Fehlern die axe-Befunde vollständig gemeldet werden. */
async function pruefeStruktur(page: Page, sprache: Sprache): Promise<void> {
  await expect.soft(page.locator('html'), 'lang-Attribut passt zur Sprache').toHaveAttribute('lang', sprache);
  await expect.soft(page.getByRole('heading', { level: 1, includeHidden: true }), 'genau ein h1').toHaveCount(1);
  await expect.soft(page.getByRole('main', { includeHidden: true }), 'ein main-Landmark').toHaveCount(1);
  const ohneAlt = await page
    .locator('img:not([alt])')
    .evaluateAll((bilder) => bilder.map((bild) => bild.getAttribute('src') ?? '(ohne src)'));
  expect.soft(ohneAlt, 'jedes img hat ein alt-Attribut').toEqual([]);
}

/** Detailpfad: Slug aus dem ersten Link „Details ansehen“ der Listenseite in derselben Sprache. */
async function detailPfad(page: Page, route: Route, sprache: Sprache): Promise<string> {
  const liste = ROUTEN.find((r) => r.name === route.slugAus);
  if (!liste) throw new Error(`Listenroute „${route.slugAus}“ fehlt in ROUTEN`);
  await page.goto(liste.pfad[sprache]);
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  const link = page.getByRole('link', { name: DETAIL_LINK[sprache] }).first();
  await expect(link, `Kein Link „${DETAIL_LINK[sprache]}“ auf ${liste.pfad[sprache]}`).toHaveAttribute('href', /\S/);
  const href = (await link.getAttribute('href')) ?? '';
  const slug = href.split('/').filter(Boolean).pop() ?? '';
  expect(slug, `Slug im Link „${href}“ nicht lesbar`).not.toBe('');
  return route.pfad[sprache].replace('[slug]', slug);
}

for (const route of ROUTEN) {
  for (const sprache of SPRACHEN) {
    test(`${route.name} (${sprache}) ist barrierefrei`, async ({ page }, info) => {
      const breite = BREITE[info.project.name];
      expect(breite, `Projekt „${info.project.name}“ hat keine Breite in BREITE`).toBeDefined();
      expect(page.viewportSize()?.width, 'Viewport-Breite des Projekts').toBe(breite);

      const pfad = route.slugAus ? await detailPfad(page, route, sprache) : route.pfad[sprache];
      await page.goto(pfad);
      // Vor der Prüfung: Seite geladen (load) und sichtbare h1. Keine festen Wartezeiten.
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

      const befunde = await pruefeSeite(page);
      await pruefeStruktur(page, sprache);
      expect(befunde, `axe-Befunde bei ${info.project.name} (${breite} px) auf ${pfad}`).toEqual([]);
    });
  }
}
