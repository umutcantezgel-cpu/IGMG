import { expect, test, type Page } from '@playwright/test';
import dachverband from '../../messages/bereiche/dachverband.json';

/**
 * E2E „Aus dem Dachverband“ (Plan Marktstart P3, E-044 Nr. 2): Startseite mit datierter Freitagspredigt und
 * Gemeinschaftsthemen, Kasten auf /nachrichten, Karte auf /islamisches-wissen, Abschnitt auf den Organisationsseiten
 * (KT ja, AT nein). Nur Links mit `rel="noopener noreferrer"`, beim Laden keine Anfrage an igmg.org (K-14). Daten aus dem
 * Seed (`drizzle/seeds/bereiche/dachverband.ts`), Texte aus messages. Der Konzept-Hinweis gilt als gesehen.
 */
const T = dachverband.de.dachverband;
const TR = dachverband.tr.dachverband;
/** Neueste Freitagspredigt im Seed (Feed vom 22.10.2026, Freitag 23.10.2026); der Seed selbst zieht Server-Module nach. */
const neueste = {
  titel: { de: 'Mit Würde gegen Islamfeindlichkeit' },
  url: 'https://www.igmg.org/vorurteile-und-gesellschaftlicher-frieden-2/',
};

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Alle Anfragen beim Laden einer Seite mitschreiben (inklusive Unterressourcen). */
function protokolliere(page: Page): string[] {
  const anfragen: string[] = [];
  page.on('request', (a) => anfragen.push(a.url()));
  return anfragen;
}
const anIgmg = (anfragen: string[]) => anfragen.filter((u) => /(^|\.)igmg\.org|igmgreisen\.com|hasene\.org/.test(new URL(u).hostname));

test('Startseite: Abschnitt mit datierter Freitagspredigt, Gemeinschaftsthemen und externen Links; keine Anfrage an igmg.org', async ({
  page,
}) => {
  const anfragen = protokolliere(page);
  await page.goto('/');
  const abschnitt = page.getByRole('region', { name: T.abschnitt.titel, exact: true });
  await abschnitt.scrollIntoViewIfNeeded();
  await expect(abschnitt).toBeVisible();
  // Überschrift immer datiert, nie „der Woche“
  const datiert = abschnitt.getByRole('heading', { level: 3, name: /^Freitagspredigt vom \d{1,2}\. \S+ \d{4}$/ });
  await expect(datiert).toBeVisible();
  await expect(abschnitt).not.toContainText('der Woche');
  await expect(abschnitt.getByText(neueste.titel.de, { exact: true })).toBeVisible();
  const predigt = abschnitt.getByRole('link', { name: `${T.hutba.lesen}: ${neueste.titel.de}` });
  await expect(predigt).toHaveAttribute('href', neueste.url);
  await expect(predigt).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(abschnitt.getByRole('link', { name: `${T.abschnitt.alleHutbas}: ${T.externeSeite}` })).toHaveAttribute(
    'href',
    'https://www.igmg.org/freitagspredigt/',
  );
  await expect(abschnitt.getByRole('link', { name: T.abschnitt.mehrIgmg })).toHaveAttribute('href', '/igmg');
  // bis zu drei Gemeinschaftsthemen, je mit externem Link
  const themen = abschnitt.getByRole('link', { name: new RegExp(`^${T.karte.lesen}`) });
  await expect(themen).toHaveCount(3);
  for (const link of await themen.all()) {
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(new URL((await link.getAttribute('href')) ?? '').protocol).toBe('https:');
  }
  // keine Bilder oder Einbettungen vom Dachverband, keine Anfrage beim Laden (K-14)
  await expect(abschnitt.locator('img, iframe')).toHaveCount(0);
  await page.waitForLoadState('networkidle');
  expect(anIgmg(anfragen)).toEqual([]);
});

test('Startseite auf Türkisch: türkische Texte, deutscher Titel mit sichtbarem Sprachhinweis', async ({ page }) => {
  await page.goto('/tr');
  const abschnitt = page.getByRole('region', { name: TR.abschnitt.titel, exact: true });
  await abschnitt.scrollIntoViewIfNeeded();
  await expect(abschnitt.getByRole('heading', { level: 3, name: /tarihli cuma hutbesi$/ })).toBeVisible();
  await expect(abschnitt.getByText(neueste.titel.de, { exact: true })).toHaveAttribute('lang', 'de');
  await expect(abschnitt.getByRole('link', { name: `${TR.hutba.lesen} ${TR.aufDeutsch}: ${neueste.titel.de}` })).toHaveAttribute(
    'hreflang',
    'de',
  );
});

test('/nachrichten: Kasten „Aus dem Dachverband“ mit den fünf neuesten Einträgen', async ({ page }) => {
  const anfragen = protokolliere(page);
  await page.goto('/nachrichten');
  const kasten = page.getByRole('region', { name: T.abschnitt.kennung, exact: true });
  await expect(kasten).toBeVisible();
  await expect(kasten.getByRole('listitem')).toHaveCount(5);
  await expect(kasten.getByRole('heading', { level: 3 }).first()).toHaveText(neueste.titel.de);
  await page.waitForLoadState('networkidle');
  expect(anIgmg(anfragen)).toEqual([]);
});

test('/islamisches-wissen: Karte „Freitagspredigt vom …“ vor den Wissensinhalten, ohne Auszug', async ({ page }) => {
  await page.goto('/islamisches-wissen');
  const karte = page.getByRole('article', { name: /^Freitagspredigt vom / });
  await expect(karte).toBeVisible();
  await expect(karte.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(karte.getByText(neueste.titel.de, { exact: true })).toBeVisible();
  await expect(karte.getByRole('link', { name: `${T.hutba.lesen}: ${neueste.titel.de}` })).toHaveAttribute('rel', 'noopener noreferrer');
});

test.describe('Organisationsseiten', () => {
  test('KT zeigt „Bayram unter Nachbarn“ mit Link zur IGMG', async ({ page }) => {
    await page.goto('/organisationen/kadin-teskilati');
    const abschnitt = page.getByRole('region', { name: T.abschnitt.organisationTitel, exact: true });
    await expect(abschnitt).toBeVisible();
    await expect(abschnitt.getByRole('heading', { level: 4, name: 'Bayram unter Nachbarn' })).toBeVisible();
    const link = abschnitt.getByRole('link', { name: `${T.karte.lesen}: Bayram unter Nachbarn` });
    await expect(link).toHaveAttribute('href', 'https://www.igmg.org/bayram-unter-nachbarn-aktion-erfolgreich-durchgefuehrt/');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('AT zeigt keinen Abschnitt „Aus dem Dachverband“', async ({ page }) => {
    await page.goto('/organisationen/ana-teskilati');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('region', { name: T.abschnitt.organisationTitel, exact: true })).toHaveCount(0);
  });
});
