import { expect, test } from '@playwright/test';
import dachverband from '../../messages/bereiche/dachverband.json';
import organisationen from '../../messages/bereiche/organisationen.json';
import ueberUns from '../../messages/bereiche/ueber-uns.json';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';

/**
 * E2E Fakten der Gemeinde (Plan Marktstart, Paket P2; E-044 Nr. 4): Über uns beginnt 1978, zeigt 2008 und 2011 vor der
 * Eröffnung als letzter Station und ordnet die Gemeinde mit Link auf /igmg in den Dachverband ein; die Organisationsseiten
 * verweisen auf ihre Seite bei der IGMG (nur ein Link, keine Anfrage beim Aufruf, K-14). Texte aus messages, Daten aus den
 * Seeds. Der Konzept-Hinweis gilt als gesehen.
 */
const HAUPT = { de, tr, en } as const;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

/** Sichtbarer Text eines Satzes mit `<link>…</link>` (die Markierung entfällt in der Seite). */
const ohneMarken = (text: string) => text.replace(/<\/?link>/g, '');

test('Startseite: Einleitung nennt die Fatih-Moschee Wetzlar und 1978 (de, tr, en)', async ({ page }) => {
  for (const [sprache, pfad] of [
    ['de', '/'],
    ['tr', '/tr'],
    ['en', '/en'],
  ] as const) {
    await page.goto(pfad);
    await expect(page.getByText(HAUPT[sprache].start.untertitel, { exact: true })).toBeVisible();
  }
});

test.describe('Über uns', () => {
  test('Weg der Gemeinde: 1978 zuerst, 2008 und 2011 vor 2019, Eröffnung zuletzt; Platzhalter bleiben sichtbar', async ({ page }) => {
    await page.goto('/ueber-uns');
    const titel = await page.locator('section[aria-labelledby="ueber-reise"] ol > li').getByRole('heading', { level: 3 }).allInnerTexts();
    expect(titel[0]).toMatch(/^1978 - /);
    const jahr = (j: string) => titel.findIndex((t) => t.startsWith(`${j} - `));
    expect(jahr('2008')).toBeGreaterThan(0);
    expect(jahr('2011')).toBe(jahr('2008') + 1);
    expect(jahr('2019')).toBe(jahr('2011') + 1);
    expect(titel.at(-1)).toContain('Eröffnung der neuen Fatih-Moschee');
    await expect(
      page
        .getByRole('main')
        .getByText(/\[Foto – von der Gemeinde\]/)
        .first(),
    ).toBeVisible();
    await expect(page.getByRole('main')).not.toContainText('[Gründungsjahr]');
  });

  test('Einordnung in den Dachverband mit Link auf /igmg und Quellenzeile (de, tr)', async ({ page }) => {
    await page.goto('/ueber-uns');
    const satz = ohneMarken(ueberUns.de.ueberUns.dachverband);
    await expect(page.getByText(satz, { exact: true })).toBeVisible();
    // Im Inhalt: Der Fuß führt denselben Link im Block „IGMG-Netzwerk“ (P7)
    const inhalt = page.getByRole('main');
    await expect(inhalt.getByRole('link', { name: 'Mehr über die IGMG', exact: true })).toHaveAttribute('href', '/igmg');
    await expect(inhalt.getByRole('link', { name: dachverband.de.dachverband.quellenLink, exact: true })).toHaveAttribute(
      'href',
      '/quellen#dachverband',
    );

    await page.goto('/tr/hakkimizda');
    await expect(page.getByText(ohneMarken(ueberUns.tr.ueberUns.dachverband), { exact: true })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'IGMG hakkında daha fazla bilgi', exact: true })).toHaveAttribute(
      'href',
      '/tr/igmg',
    );
  });
});

test.describe('Organisationen', () => {
  test('KT verweist auf die Frauenorganisation der IGMG (externer Link) und auf /igmg', async ({ page }) => {
    await page.goto('/organisationen/kadin-teskilati');
    const o = organisationen.de.organisation.dachverband;
    await expect(page.getByRole('heading', { level: 3, name: o.titel, exact: true })).toBeVisible();
    const extern = page.getByRole('link', { name: `${dachverband.de.dachverband.ziele.frauenorganisation.titel}: externe Seite` });
    await expect(extern).toHaveAttribute('href', 'https://www.igmg.org/frauenorganisation/');
    await expect(extern).toHaveAttribute('rel', 'noopener noreferrer');
    // Im Inhalt: Der Fuß führt denselben Link im Block „IGMG-Netzwerk“ (P7)
    await expect(page.getByRole('main').getByRole('link', { name: o.mehr, exact: true })).toHaveAttribute('href', '/igmg');
    await expect(page.getByRole('main')).toContainText('2009');
  });

  test('englische AT-Seite: Verweis auf die deutsche Selbstdarstellung mit Hinweis, keine Anatolien-Deutung im Text', async ({ page }) => {
    await page.goto('/en/organizations/ana-teskilati');
    const z = dachverband.en.dachverband;
    const link = page.getByRole('link', { name: `${z.ziele.selbstdarstellung.titel} ${z.aufDeutsch}: ${z.externeSeite}` });
    await expect(link).toHaveAttribute('href', 'https://www.igmg.org/selbstdarstellung/');
    await expect(link).toHaveAttribute('hreflang', 'de');
    // Der englische Titel „Anatolian Organization“ bleibt bis zur Entscheidung der Gemeinde (M-105); die Texte deuten „Ana“
    // nicht mehr als Anatolien
    const absaetze = await page.locator('section[aria-labelledby="at-ueber"] p').allInnerTexts();
    expect(absaetze.join(' ')).toContain('Ana Teşkilatı (AT)');
    expect(absaetze.join(' ')).not.toMatch(/Anatoli/);
  });
});
