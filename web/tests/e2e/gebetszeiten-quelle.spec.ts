import { expect, test } from '@playwright/test';
import dachverband from '../../messages/bereiche/dachverband.json';
import gebetszeiten from '../../messages/bereiche/gebetszeiten.json';

/**
 * Herkunft der Gebetszeiten (ADR 0048): Auf /gebetszeiten stehen die Quellen- und Standzeile als Server-Text, der Direktlink
 * auf den IGMG-Gebetskalender für Wetzlar (erst der Klick ruft igmg.org auf, K-14), „berechnet (vorläufig)“ für gerechnete
 * Tage und die sichtbaren Fragen „Woher stammen die Gebetszeiten?“. Die Lese-API liefert JSON mit Quelle je Tag und CORS
 * nur für GET. Texte aus messages/bereiche/*.json (de).
 */
const t = gebetszeiten.de.gebetszeiten;
const faq = gebetszeiten.de.gebetszeitenFaq;
const KALENDER = dachverband.de.dachverband.ziele.gebetskalender.titel;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      // Kein Speicher verfügbar: der Hinweis bleibt sichtbar.
    }
  });
});

test('Quellenzeile, Direktlink und „berechnet (vorläufig)“ ohne Anfrage an igmg.org beim Aufruf', async ({ page }) => {
  const fremd: string[] = [];
  page.on('request', (r) => {
    if (/igmg\.org/.test(new URL(r.url()).hostname)) fremd.push(r.url());
  });
  await page.goto('/gebetszeiten');
  await page.getByRole('tab', { name: t.tabMonat, exact: true }).click();
  const monat = page.getByRole('tabpanel', { name: t.tabMonat, exact: true });
  const link = monat.getByRole('link', { name: new RegExp(`^${KALENDER}`) });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', 'https://www.igmg.org/gebetskalender?stadt=Wetzlar&id=20238');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  // Ohne Datenbank (Beispielmodus) und ohne IGMG-Tabelle sind alle Tage gerechnet
  await expect(monat.getByText(t.berechnetVorlaeufig).first()).toBeVisible();
  await expect(monat.getByText(gebetszeiten.de.gebetszeitenQuelle.berechnet)).toBeVisible();
  expect(fremd).toEqual([]);
});

test('Fragen „Woher stammen die Gebetszeiten?“ sichtbar und ohne JavaScript aufklappbar', async ({ page }) => {
  await page.goto('/gebetszeiten');
  const bereich = page.getByRole('region', { name: faq.titel });
  await expect(bereich).toBeVisible();
  const frage = bereich.getByText(faq.quelle.frage, { exact: true });
  await frage.click();
  await expect(bereich.getByText(/Islamischen Gemeinschaft Millî Görüş \(IGMG\)/)).toBeVisible();
});

test('Lese-API: Monat als JSON mit Quelle je Tag, CORS nur für GET; außerhalb von ±12 Monaten 404', async ({ request }) => {
  const heute = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit' }).format(new Date());
  const antwort = await request.get(`/api/gebetszeiten/${heute}`);
  expect(antwort.status()).toBe(200);
  expect(antwort.headers()['access-control-allow-origin']).toBe('*');
  expect(antwort.headers()['access-control-allow-methods']).toBe('GET');
  const json = (await antwort.json()) as { monat: string; zeitzone: string; tage: { datum: string; quelle: string; imsak: string }[] };
  expect(json.monat).toBe(heute);
  expect(json.zeitzone).toBe('Europe/Berlin');
  expect(json.tage.length).toBeGreaterThanOrEqual(28);
  expect(json.tage[0].imsak).toMatch(/^\d{2}:\d{2}$/);
  expect(['import', 'igmg', 'berechnet']).toContain(json.tage[0].quelle);
  expect((await request.get('/api/gebetszeiten/2000-01')).status()).toBe(404);
});
