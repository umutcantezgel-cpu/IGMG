import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import wissen from '../../messages/bereiche/wissen.json';

/**
 * Religiöse Erklärtexte als gekennzeichneter Entwurf (Plan Marktstart P5, ADR 0047): Mit dem Schalter
 * `website_wissen_vorschau` (Standard an, auch in der Produktion) sind die vier KI-Entwürfe öffentlich – Themenseite mit
 * Marke „Entwurf“ im Kopf, Hinweis „Entwurf zur Prüfung – noch nicht vom Imam geprüft“ oben im Inhalt, `noindex`, keine
 * Anfragen an Dritte (K-14), axe ohne Befund; Übersicht und Themenleiste mit Marke; nicht in der Sitemap. Läuft der
 * Server mit `FUNKTION_WEBSITE_WISSEN_VORSCHAU=aus`, antwortet die Themenseite mit 404 und die Fälle werden übersprungen.
 * Texte aus messages/bereiche/wissen.json, Themen aus dem Seed drizzle/seeds/bereiche/wissen-entwuerfe.ts.
 */
const SPRACHEN = [
  { kuerzel: 'de', seite: '/islamisches-wissen/hajj-umrah', uebersicht: '/islamisches-wissen', titel: 'Hadsch und Umra' },
  { kuerzel: 'tr', seite: '/tr/islami-bilgiler/hajj-umrah', uebersicht: '/tr/islami-bilgiler', titel: 'Hac ve Umre' },
  { kuerzel: 'en', seite: '/en/islamic-knowledge/hajj-umrah', uebersicht: '/en/islamic-knowledge', titel: 'Hajj and Umrah' },
] as const;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Öffnet die Seite; ohne Vorschau (404) wird der Fall übersprungen. */
async function oeffne(page: Page, pfad: string) {
  const antwort = await page.goto(pfad);
  test.skip(antwort?.status() === 404, 'Vorschau aus (FUNKTION_WEBSITE_WISSEN_VORSCHAU=aus) – Entwürfe sind nicht öffentlich');
  expect(antwort?.status()).toBe(200);
}

for (const s of SPRACHEN) {
  const e = wissen[s.kuerzel].wissen.entwurf;

  test(`${s.kuerzel}: Themenseite eines KI-Entwurfs – Marke, Hinweis oben, noindex, Quellenliste`, async ({ page, baseURL }) => {
    const fremd: string[] = [];
    page.on('request', (r) => {
      if (new URL(r.url()).origin !== new URL(baseURL ?? page.url()).origin && !r.url().startsWith('data:')) fremd.push(r.url());
    });
    await oeffne(page, s.seite);
    await expect(page.getByRole('heading', { level: 1, name: s.titel, exact: true })).toBeVisible();
    // Marke im Kopf vor dem Kurztext, Hinweis als erster Bereich des Inhalts
    await expect(page.locator('h1').locator('..').locator('[data-wissen-entwurf-marke]')).toHaveText(e.marke);
    const hinweis = page.getByRole('region', { name: e.titel, exact: true });
    await expect(hinweis).toBeVisible();
    await expect(hinweis).toContainText(e.textKi);
    await expect(page.locator('[data-wissen-entwurf="hinweis"]')).toHaveCount(1);
    // Nie als geprüfte Auskunft indexieren
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    // Quellen am Ende: externe Links mit rel, alle zu IGMG, IGMG Reisen oder Hasene
    const extern = page.locator('main a[href^="https://"]');
    expect(await extern.count()).toBeGreaterThanOrEqual(5);
    for (const href of await extern.evaluateAll((l) => l.map((a) => (a as HTMLAnchorElement).href)))
      expect(['www.igmg.org', 'www.igmgreisen.com', 'www.hasene.org']).toContain(new URL(href).hostname);
    await expect(extern.first()).toHaveAttribute('rel', 'noopener noreferrer');
    // Keine arabische Schrift im Text (G-06)
    expect(await page.locator('main').innerText()).not.toMatch(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/);
    expect(fremd).toEqual([]);
  });

  test(`${s.kuerzel}: Übersicht und Themenleiste kennzeichnen die Entwürfe`, async ({ page }) => {
    await oeffne(page, s.seite);
    const leiste = page.getByRole('link', { name: `${s.titel} ${e.marke}`, exact: true });
    await expect(leiste).toHaveAttribute('aria-current', 'page');
    await page.goto(s.uebersicht);
    const themen = page.getByRole('group', { name: wissen[s.kuerzel].wissen.themen.titel, exact: true });
    await expect(themen.getByRole('button', { name: `${s.titel} ${e.marke}`, exact: true })).toBeVisible();
    expect(await themen.locator('[data-wissen-entwurf-marke]').count()).toBeGreaterThanOrEqual(1);
  });
}

test('axe: Themenseite mit Entwurfshinweis ohne Befund (WCAG 2.2 AA)', async ({ page }) => {
  await oeffne(page, '/islamisches-wissen/zakat-fitra-qurban');
  const ergebnis = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(ergebnis.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});

test('Sitemap: Entwürfe fehlen, geprüfte Themen stehen darin', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('/islamisches-wissen/mosque');
  for (const slug of ['hajj-umrah', 'islamic-calendar', 'zakat-fitra-qurban', 'friday-prayer'])
    for (const pfad of ['islamisches-wissen', 'islami-bilgiler', 'islamic-knowledge']) expect(xml).not.toContain(`/${pfad}/${slug}`);
});
