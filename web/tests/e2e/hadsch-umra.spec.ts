import { expect, test, type Page } from '@playwright/test';
import einbettung from '../../messages/bereiche/einbettung.json';
import hadschUmra from '../../messages/bereiche/hadsch-umra.json';
import wissen from '../../messages/bereiche/wissen.json';
import de from '../../messages/de.json';

/**
 * Seite „Hadsch & Umra“ (Plan Marktstart P4, K-03 mit E-045): h1 in drei Sprachen, beim Laden keine Anfrage an Dritte
 * (K-14), Videos erst nach Klick über youtube-nocookie mit `strict-origin-when-cross-origin` (YouTube selbst ist hier
 * abgefangen: `page.route` liefert eine leere Seite, damit der Test ohne Netz läuft) und ohne CSP-Meldung „Refused to
 * frame“, `rel="noopener noreferrer"` an allen externen Links, FAQPage im Kopf (ohne die Frage mit Platzhalter), Querlinks
 * von /ramadan und aus dem Fuß. Daten aus dem Seed `drizzle/seeds/bereiche/hadsch-umra.ts`, Texte aus messages.
 */
const SPRACHEN = [
  { kuerzel: 'de', pfad: '/hadsch-umra' },
  { kuerzel: 'tr', pfad: '/tr/hac-umre' },
  { kuerzel: 'en', pfad: '/en/hajj-umrah' },
] as const;
const T = hadschUmra.de.hadschUmra;
const V = einbettung.de.einbettung.video;
/** Erstes Video im Seed. */
const VIDEO = { id: 'ytTuELK2slU', titel: 'Wie wird der Hadsch verrichtet?' };

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Anfragen an fremde Herkünfte (data:/blob: ausgenommen) mitschreiben. */
function fremdeAnfragen(page: Page, basis: string): string[] {
  const herkunft = new URL(basis).origin;
  const fremd: string[] = [];
  page.on('request', (a) => {
    const url = a.url();
    if (!url.startsWith('data:') && !url.startsWith('blob:') && new URL(url).origin !== herkunft) fremd.push(url);
  });
  return fremd;
}

for (const s of SPRACHEN) {
  test(`${s.kuerzel}: h1, Abschnitte und keine Anfrage an Dritte beim Laden`, async ({ page, baseURL }) => {
    const t = hadschUmra[s.kuerzel].hadschUmra;
    const fremd = fremdeAnfragen(page, baseURL ?? 'http://localhost:3100');
    const antwort = await page.goto(s.pfad);
    expect(antwort?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.titel);
    await expect(page.locator('html')).toHaveAttribute('lang', s.kuerzel);
    for (const titel of [t.programme.titel, t.abfluege.titel, t.anmeldung.titel, t.unterlagen.titel, t.videos.titel])
      await expect(page.getByRole('heading', { level: 2, name: titel, exact: true })).toBeVisible();
    // Vor dem Klick: keine Einbettung, kein Vorschaubild
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('img[src*="ytimg"], img[src*="youtube"]')).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle');
    expect(fremd).toEqual([]);
  });
}

test('Abflüge: Tabelle mit Beschriftung und Spaltenköpfen, Stand und Hinweis auf die verbindliche Quelle', async ({ page }) => {
  await page.goto('/hadsch-umra');
  const abschnitt = page.getByRole('region', { name: T.abfluege.titel, exact: true });
  const tabellen = abschnitt.getByRole('table');
  // Vergangene Abflüge entfallen; nach dem letzten Termin im Seed (Oktober 2027) steht der Hinweis statt der Tabellen
  if ((await tabellen.count()) === 0) {
    await expect(abschnitt.getByText(T.abfluege.keine)).toBeVisible();
  } else {
    const erste = tabellen.first();
    await expect(erste.locator('caption')).not.toBeEmpty();
    for (const kopf of [T.abfluege.gruppe, T.abfluege.flug, T.abfluege.hin, T.abfluege.rueck])
      await expect(erste.getByRole('columnheader', { name: kopf, exact: true })).toBeVisible();
    await expect(erste.locator('tbody th[scope="row"]').first()).not.toBeEmpty();
  }
  await expect(abschnitt.getByText(T.abfluege.verbindlich)).toBeVisible();
});

test('Video erst nach Klick: youtube-nocookie mit Herkunftsangabe, keine CSP-Meldung', async ({ page }) => {
  const csp: string[] = [];
  page.on('console', (m) => {
    if (/Refused to frame|Content Security Policy/i.test(m.text())) csp.push(m.text());
  });
  const youtube: { url: string; referer?: string }[] = [];
  await page.route('https://www.youtube-nocookie.com/**', async (route) => {
    youtube.push({ url: route.request().url(), referer: route.request().headers()['referer'] });
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Video</title><p>Video</p>' });
  });
  await page.goto('/hadsch-umra');
  const knopf = page.getByRole('button', { name: `${V.laden}: ${VIDEO.titel}`, exact: true });
  await knopf.scrollIntoViewIfNeeded();
  expect(youtube).toEqual([]);
  await knopf.click();
  const rahmen = page.locator(`iframe[src^="https://www.youtube-nocookie.com/embed/${VIDEO.id}"]`);
  await expect(rahmen).toHaveCount(1);
  await expect(rahmen).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  await expect(rahmen).toHaveAttribute('title', V.iframeTitel.replace('{titel}', VIDEO.titel));
  await expect.poll(() => youtube.length).toBeGreaterThan(0);
  // Nur die Herkunft wird übertragen, kein Pfad der Seite
  expect(youtube[0].referer ?? '').not.toContain('/hadsch-umra');
  // Nur dieses eine Video lädt
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.getByRole('link', { name: `${V.aufYoutube}: ${VIDEO.titel}`, exact: true })).toHaveAttribute(
    'href',
    `https://www.youtube.com/watch?v=${VIDEO.id}`,
  );
  expect(csp).toEqual([]);
});

test('externe Links mit rel="noopener noreferrer" und hreflang; Sprachhinweis bei Seiten ohne Fassung', async ({ page, baseURL }) => {
  await page.goto('/en/hajj-umrah');
  const herkunft = new URL(baseURL ?? 'http://localhost:3100').origin;
  const links = page.locator('main a[href^="http"]');
  const anzahl = await links.count();
  expect(anzahl).toBeGreaterThan(5);
  for (let i = 0; i < anzahl; i++) {
    const link = links.nth(i);
    const href = (await link.getAttribute('href')) ?? '';
    if (new URL(href).origin === herkunft) continue;
    await expect(link, href).toHaveAttribute('rel', 'noopener noreferrer');
    if (/igmgreisen\.com|igmg\.org/.test(href)) await expect(link, href).toHaveAttribute('hreflang', /^(de|tr|en)$/);
  }
  // IGMG Reisen hat keine englische Fassung: Programme verlinken die deutsche Seite mit sichtbarem Hinweis
  const hadsch = page.getByRole('link', { name: /^Go to the programme \(in German\): Hajj 2027$/ });
  await expect(hadsch).toHaveAttribute('href', 'https://www.igmgreisen.com/de/hadsch/');
  await expect(hadsch).toHaveAttribute('hreflang', 'de');
});

test('FAQPage im Kopf: parsebar, nur Fragen ohne Platzhalter; sichtbare Fragen als Aufklapper', async ({ page }) => {
  await page.goto('/hadsch-umra');
  const daten = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = daten.map((d) => JSON.parse(d) as Record<string, unknown>).find((d) => d['@type'] === 'FAQPage');
  expect(faq).toBeTruthy();
  const fragen = faq?.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  expect(fragen.length).toBeGreaterThanOrEqual(5);
  for (const f of fragen) expect(`${f.name} ${f.acceptedAnswer.text}`).not.toMatch(/\[[^\]]*\]/);
  const bereich = page.getByRole('region', { name: T.faqTitel, exact: true });
  await expect(bereich.locator('details')).toHaveCount(fragen.length + 1);
  await bereich.locator('summary').first().click();
  await expect(bereich.locator('details').first()).toHaveAttribute('open', '');
});

test('Erklärung aus „Islamisches Wissen“: als Entwurf gekennzeichnet, wenn sichtbar', async ({ page }) => {
  await page.goto('/hadsch-umra');
  const abschnitt = page.getByRole('region', { name: T.wissen.titel, exact: true });
  test.skip((await abschnitt.count()) === 0, 'Wissensthema nicht sichtbar (Vorschau aus oder ohne Datenbank)');
  const e = wissen.de.wissen.entwurf;
  await expect(abschnitt.getByText(e.titel)).toBeVisible();
  await expect(abschnitt.getByRole('link', { name: new RegExp(`^${e.mehr}: `) })).toHaveAttribute('href', '/islamisches-wissen/hajj-umrah');
});

test('Querlinks: /ramadan „Umra im Ramadan“ und der Fuß führen zur Seite', async ({ page }) => {
  await page.goto('/ramadan');
  const kasten = page.getByRole('region', { name: T.ramadan.titel, exact: true });
  await expect(kasten.getByRole('link', { name: T.ramadan.link })).toHaveAttribute('href', '/hadsch-umra');
  await expect(page.locator('footer').getByRole('link', { name: de.fuss.qHadschUmra, exact: true })).toHaveAttribute(
    'href',
    '/hadsch-umra',
  );
  await page.goto('/tr/ramazan');
  const tr = hadschUmra.tr.hadschUmra.ramadan;
  await expect(page.getByRole('region', { name: tr.titel, exact: true }).getByRole('link', { name: tr.link })).toHaveAttribute(
    'href',
    '/tr/hac-umre',
  );
});
