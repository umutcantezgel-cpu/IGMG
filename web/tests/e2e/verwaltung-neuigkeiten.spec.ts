import { randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Öffentliche Seite neu laden, bis die Erwartung erfüllt ist (höchstens 12 s): Eine Änderung ist sofort sichtbar;
 * nur wenn parallel ein Seitenaufbau mit alten Daten lief, greift die zweite Invalidierung nach 5 s (F-002).
 */
async function oeffentlichBis(page: Page, pfad: string, pruefe: () => Promise<void>) {
  await expect(async () => {
    await page.goto(pfad);
    await pruefe();
  }).toPass({ timeout: 12_000, intervals: [500, 1000, 2000] });
}

/**
 * V03 · Verwaltung › Neuigkeiten (K-06, K-07, ADR 0006): anlegen mit Rich-Text → veröffentlichen → öffentlich unter
 * /nachrichten/<slug> → in den Papierkorb → öffentlich nicht mehr abrufbar (404). Nur Desktop (Anmelde-Ratenlimit).
 * Die Seite ist noch nicht in der Seitenleiste eingetragen (module.ts, gebaut: false): der Test ruft die Adresse direkt auf.
 */
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  // Konzept-Hinweis gilt als gesehen (sonst verdeckt der Dialog die öffentlichen Seiten)
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Nachricht anlegen, veröffentlichen, öffentlich sehen, in den Papierkorb legen und danach 404', async ({ page }) => {
  test.setTimeout(120_000); // Konto anlegen + vollständiger Lebenszyklus
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page);
  const hex = randomBytes(3).toString('hex');
  const titel = `Testnachricht ${hex}`;
  const slug = `testnachricht-${hex}`;
  const absatz = 'Dies ist ein fiktiver Testabsatz für die Neuigkeit.';

  await page.goto('/verwaltung/neuigkeiten');
  await expect(page.getByRole('heading', { level: 1, name: 'Neuigkeiten verwalten' })).toBeVisible();
  await page.getByRole('link', { name: 'Neue Nachricht', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Neue Nachricht' })).toBeVisible();

  // Pflichtfeld leer → Fehler-Zusammenfassung und Fehler am Feld
  await page.getByRole('button', { name: 'Erstellen', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
  await expect(page.getByLabel('Titel (Pflichtfeld)', { exact: true })).toHaveAttribute('aria-invalid', 'true');

  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titel);
  await page.getByLabel('Kurztext', { exact: true }).fill('Kurztext des fiktiven Testbeitrags.');
  // Rich-Text: der Editor lädt erst im Browser; die Beschriftung „Text“ gehört zum deutschen Feld
  const editor = page.getByRole('textbox', { name: 'Text', exact: true });
  await expect(editor).toBeVisible();
  await editor.fill(absatz);
  await page.getByLabel('Status', { exact: true }).selectOption('veroeffentlicht');
  await page.getByRole('button', { name: 'Erstellen', exact: true }).click();
  await expect(page).toHaveURL(/\/verwaltung\/neuigkeiten\/[0-9a-f-]{36}\?angelegt=1$/);
  await expect(page.getByText('Die Nachricht wurde angelegt.')).toBeVisible();

  // Sofort öffentlich unter /nachrichten/<slug> (updateTag), mit dem Text aus dem Editor
  await oeffentlichBis(page, `/nachrichten/${slug}`, async () => {
    await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible({ timeout: 1000 });
    await expect(page.getByText(absatz)).toBeVisible({ timeout: 1000 });
  });

  // In den Papierkorb → nicht mehr öffentlich, Adresse liefert 404
  await page.goto('/verwaltung/neuigkeiten');
  await page.getByRole('button', { name: `In den Papierkorb: ${titel}`, exact: true }).click();
  await expect(page.getByRole('button', { name: `In den Papierkorb: ${titel}`, exact: true })).toHaveCount(0);
  await expect(async () => {
    const antwort = await page.goto(`/nachrichten/${slug}`);
    expect(antwort?.status()).toBe(404);
  }).toPass({ timeout: 12_000, intervals: [500, 1000, 2000] });

  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Ohne Anmeldung: die Neuigkeiten-Seiten leiten zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung/neuigkeiten');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await page.goto('/verwaltung/neuigkeiten/neu');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
