import { expect, test, type Page } from '@playwright/test';
import lernDe from '../../messages/lernapp/de.json';
import lernTr from '../../messages/lernapp/tr.json';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';
import { entscheide } from '../../src/lib/funktionen-regeln';

/**
 * E2E „Ein Rahmen für Website und Lernbereich“ (ADR 0050), Projekte „telefon“ (390 px) und „desktop“ (1440 px):
 * - Startseite: Abschnitt „Was Sie hier finden“ mit sechs Einstiegen; die Lern-App führt in den Lernbereich der Sprache
 *   (tr → tr, de und en → de).
 * - Lernbereich: derselbe Kopf und Fuß wie die Website (Logo, Hauptmenü bzw. Telefonmenü, Fuß), darunter die Leiste
 *   „Lern-App“; Logo und Menü führen zurück auf die Website, das Menü „Bildung“ wieder hinein.
 * - Sprachwahl im Kopf des Lernbereichs: de, tr, ar – dieselbe Lernseite in der anderen Oberflächensprache.
 * - Arabische Oberfläche: Kopf und Fuß deutsch und von links nach rechts, der Lernbereich `rtl`.
 * - Öffentliche Seiten zeigen im Fuß keine Platzhalter „[…]“.
 * Der Konzept-Hinweis gilt als gesehen. Nur mit dem Schalter `lernapp` (wie der Bau).
 */
const LERNAPP = entscheide('lernapp', process.env, null);
const HAUPT = { de, tr, en } as const;

test.beforeEach(async ({ context }) => {
  test.skip(!LERNAPP, 'Schalter lernapp aus');
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

const telefon = (page: Page) => (page.viewportSize()?.width ?? 0) < 1240;

/** Öffnet im Kopf das Menü „Bildung“ (Desktop: Aufklapp-Menü, Telefon: Schublade) und gibt den Bereich mit den Punkten zurück. */
async function oeffneBildung(page: Page, texte: typeof de) {
  if (telefon(page)) {
    await page.getByRole('button', { name: texte.kopf.menueOeffnen, exact: true }).click();
    const schublade = page.locator('dialog[open]');
    await expect(schublade).toBeVisible();
    const knopf = schublade.getByRole('button', { name: texte.kopf.bildung, exact: true });
    if ((await knopf.getAttribute('aria-expanded')) !== 'true') await knopf.click();
    return schublade;
  }
  await page.locator('header').getByRole('button', { name: texte.kopf.bildung, exact: true }).click();
  return page.locator('#menue-bildung');
}

test('Startseite: „Was Sie hier finden“ mit sechs Einstiegen, die Lern-App führt in den Lernbereich (de, tr, en)', async ({ page }) => {
  for (const [sprache, pfad, ui] of [
    ['de', '/', 'de'],
    ['tr', '/tr', 'tr'],
    ['en', '/en', 'de'],
  ] as const) {
    const t = HAUPT[sprache].start.ueberblick;
    await page.goto(pfad);
    const abschnitt = page.locator('section[aria-labelledby="ueberblick-titel"]');
    await expect(abschnitt.getByRole('heading', { level: 2 })).toHaveText(t.titel);
    await expect(abschnitt.getByRole('listitem')).toHaveCount(6);
    await expect(abschnitt.getByRole('link', { name: t.lernApp.titel, exact: true })).toHaveAttribute('href', `/lern-app/${ui}`);
    for (const k of ['gebetszeiten', 'quran', 'lernApp', 'elifbe', 'veranstaltungen', 'mitglied'] as const)
      await expect(abschnitt.getByRole('heading', { level: 3, name: t[k].titel })).toBeVisible();
    // keine eckigen Klammern im Abschnitt
    expect(await abschnitt.innerText()).not.toMatch(/\[[^\]]+\]/);
  }
});

test('von der Startseite in die Lern-App und über Logo und Menü zurück', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('section[aria-labelledby="ueberblick-titel"]')
    .getByRole('link', { name: de.start.ueberblick.lernApp.titel, exact: true })
    .click();
  await expect(page).toHaveURL((u) => u.pathname === '/lern-app/de');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(lernDe.start.titel);

  // derselbe Kopf wie auf der Website, darunter die Leiste „Lern-App“ mit vier Bereichen
  const kopf = page.locator('header');
  await expect(kopf).toHaveCount(1);
  await expect(kopf.getByRole('link', { name: de.kopf.logoLabel, exact: true })).toHaveAttribute('href', '/');
  const leiste = page.getByRole('navigation', { name: lernDe.rahmen.navigation, exact: true });
  await expect(leiste.getByRole('link')).toHaveCount(telefon(page) ? 4 : 5);
  await expect(leiste.locator('a[aria-current="page"]')).toHaveText(lernDe.rahmen.start);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.locator('footer').getByRole('link', { name: de.fuss.impressum, exact: true })).toHaveAttribute('href', '/impressum');

  // Leiste: Fortschritt
  await leiste.getByRole('link', { name: lernDe.rahmen.fortschritt, exact: true }).click();
  await expect(page).toHaveURL((u) => u.pathname === '/lern-app/de/fortschritt');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(lernDe.fortschritt.titel);

  // Menü „Bildung“: „Lern-App“ ist die aktuelle Seite; „Lernen“ führt auf die Website
  const bildung = await oeffneBildung(page, de);
  await expect(bildung.getByRole('link', { name: new RegExp(`^${de.kopf.lernApp}`) })).toHaveAttribute('aria-current', 'page');
  await bildung
    .getByRole('link', { name: new RegExp(`^${de.kopf.lernen}`) })
    .first()
    .click();
  await expect(page).toHaveURL((u) => u.pathname === '/lernen');
  await expect(page.locator('html')).not.toHaveAttribute('data-oberflaeche', 'lernapp');

  // und wieder hinein über das Menü der Website, zurück über das Logo
  const wieder = await oeffneBildung(page, de);
  await wieder.getByRole('link', { name: new RegExp(`^${de.kopf.lernApp}`) }).click();
  await expect(page).toHaveURL((u) => u.pathname === '/lern-app/de');
  await page.locator('header').getByRole('link', { name: de.kopf.logoLabel, exact: true }).click();
  await expect(page).toHaveURL((u) => u.pathname === '/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(de.start.titel);
});

test('Menü „Bildung“: fünf Punkte ohne Dopplung, die Lern-App in der Sprache der Seite', async ({ page }) => {
  for (const [sprache, pfad, ui] of [
    ['de', '/', 'de'],
    ['tr', '/tr', 'tr'],
    ['en', '/en', 'de'],
  ] as const) {
    const texte = HAUPT[sprache] as typeof de;
    await page.goto(pfad);
    const bildung = await oeffneBildung(page, texte);
    const ziele = await bildung.locator(telefon(page) ? '#mobil-bildung a' : 'a').evaluateAll((a) => a.map((e) => e.getAttribute('href')));
    expect(ziele).toHaveLength(5);
    expect(new Set(ziele).size).toBe(5);
    expect(ziele[1]).toBe(`/lern-app/${ui}`);
  }
});

test('Sprachwahl im Kopf des Lernbereichs: de, tr, ar auf derselben Lernseite', async ({ page }) => {
  await page.goto('/lern-app/de/fortschritt');
  if (telefon(page)) {
    await page.getByRole('button', { name: de.kopf.menueOeffnen, exact: true }).click();
    const sprachen = page.locator('dialog[open]').getByRole('group', { name: de.kopf.spracheGruppe });
    await expect(sprachen.getByRole('link')).toHaveCount(3);
    await expect(sprachen.locator('a[hreflang="ar"]')).toHaveAttribute('href', '/lern-app/ar/fortschritt');
    await sprachen.locator('a[hreflang="tr"]').click();
  } else {
    await page.locator('header').getByRole('button', { name: de.sprachwahl.aendern, exact: true }).click();
    const liste = page.locator('#sprachwahl-liste');
    await expect(liste.getByRole('link')).toHaveCount(3);
    await expect(liste.locator('a[hreflang="ar"]')).toHaveAttribute('href', '/lern-app/ar/fortschritt');
    await liste.locator('a[hreflang="tr"]').click();
  }
  await expect(page).toHaveURL((u) => u.pathname === '/lern-app/tr/fortschritt');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(lernTr.fortschritt.titel);
  // Kopf der Website jetzt türkisch
  await expect(page.locator('header').getByRole('link', { name: tr.kopf.logoLabel, exact: true })).toHaveAttribute('href', '/tr');
});

test('arabische Oberfläche: Kopf und Fuß deutsch und ltr, Lernbereich rtl, kein waagrechter Überlauf', async ({ page }) => {
  await page.goto('/lern-app/ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const rahmen = page.locator('[data-website-rahmen]');
  await expect(rahmen).toHaveCount(2);
  for (const teil of await rahmen.all()) {
    await expect(teil).toHaveAttribute('lang', 'de');
    await expect(teil).toHaveAttribute('dir', 'ltr');
  }
  await expect(page.locator('header').getByRole('link', { name: de.kopf.logoLabel, exact: true })).toHaveAttribute('href', '/');
  const schrift = await page
    .locator('header a span')
    .first()
    .evaluate((e) => getComputedStyle(e).fontFamily);
  expect(schrift).toMatch(/^"?schriftTitel/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test('Fuß ohne Platzhalter „[…]“ auf Website und im Lernbereich', async ({ page }) => {
  for (const pfad of ['/', '/tr', '/en', '/kontakt', '/lern-app/de', '/lern-app/ar']) {
    await page.goto(pfad);
    const fuss = page.locator('footer');
    await expect(fuss).toBeVisible();
    expect(await fuss.innerText(), pfad).not.toMatch(/\[[^\]]+\]/);
  }
});
