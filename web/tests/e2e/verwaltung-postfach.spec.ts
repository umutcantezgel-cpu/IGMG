import { randomBytes } from 'node:crypto';
import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * C09 · Verwaltung › Nachrichten (internes Postfach, V09). Zwei Konten in zwei Browser-Kontexten: A schreibt an B,
 * B sieht die Unterhaltung ungelesen, öffnet sie (dabei gelesen) und antwortet, A sieht die Antwort. Die Auswahl der
 * Empfänger zeigt Name und Rolle; das Zweitkonto hat die Rolle Mitgliederverwaltung, damit die Anzeige im geteilten Lauf
 * eindeutig ist. Nur Desktop (Anmelde-Ratenlimit). Geschrieben, nicht ausgeführt.
 */
test.beforeEach(async ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
});

/** Eigener Browserkontext (Deutsch, Berliner Zeit, Desktop-Breite); der Konzept-Hinweis gilt als gesehen. */
async function eigenerKontext(browser: Browser): Promise<{ kontext: BrowserContext; seite: Page }> {
  const kontext = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin', viewport: { width: 1440, height: 900 } });
  await kontext.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
  return { kontext, seite: await kontext.newPage() };
}

test('Zwei Konten: senden, ungelesen sehen, öffnen und antworten', async ({ browser }) => {
  test.setTimeout(240_000); // zwei Konten mit Zwei-Faktor anlegen + Ablauf
  const a = await eigenerKontext(browser);
  const b = await eigenerKontext(browser);
  const konsole: string[] = [];
  a.seite.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  try {
    await angemeldetesKonto(a.seite); // A: Administration
    await angemeldetesKonto(b.seite, 'mitgliederverwaltung'); // B: Anzeige „Testperson Eins – Mitgliederverwaltung“

    const kennung = randomBytes(3).toString('hex');
    const betreff = `Terminabstimmung ${kennung}`;
    const frage = `Können wir den Termin am Freitag bestätigen? ${kennung}`;
    const antwort = `Ja, der Termin ist bestätigt. ${kennung}`;

    // A: über die Liste zur neuen Unterhaltung; leer abschicken zeigt Fehler am Feld und in der Zusammenfassung
    await a.seite.goto('/verwaltung/postfach');
    const hauptA = a.seite.getByRole('main');
    await hauptA.getByRole('link', { name: 'Neue Unterhaltung', exact: true }).click();
    await expect(a.seite).toHaveURL(/\/verwaltung\/postfach\/neu$/);
    await hauptA.getByRole('button', { name: 'Senden', exact: true }).click();
    await expect(hauptA.getByRole('alert').filter({ hasText: 'Bitte prüfen Sie die markierten Felder.' })).toBeVisible();
    await expect(hauptA.getByLabel('Betreff (Pflichtfeld)', { exact: true })).toHaveAttribute('aria-invalid', 'true');

    await hauptA.getByLabel('Betreff (Pflichtfeld)', { exact: true }).fill(betreff);
    await expect(hauptA.getByRole('checkbox', { name: /Mitgliederverwaltung/ })).toHaveCount(1);
    await hauptA.getByRole('checkbox', { name: /Mitgliederverwaltung/ }).check();
    await hauptA.getByLabel('Nachricht (Pflichtfeld)', { exact: true }).fill(frage);
    await hauptA.getByRole('button', { name: 'Senden', exact: true }).click();
    await expect(a.seite).toHaveURL(/\/verwaltung\/postfach\/[0-9a-f-]{36}\?gesendet=1$/);
    await expect(hauptA.getByRole('status').filter({ hasText: 'Die Nachricht wurde gesendet.' })).toBeVisible();
    await expect(hauptA.getByRole('list', { name: /Nachrichten dieser/ }).getByText(frage)).toBeVisible();

    // B: die Unterhaltung steht ungelesen in der Liste; Öffnen zeigt den Verlauf und markiert sie als gelesen
    await b.seite.goto('/verwaltung/postfach');
    const hauptB = b.seite.getByRole('main');
    const zeileB = hauptB.getByRole('link', { name: new RegExp(betreff) });
    await expect(zeileB).toContainText('1 ungelesen');
    await zeileB.click();
    await expect(hauptB.getByRole('heading', { level: 2, name: betreff })).toBeVisible();
    await expect(hauptB.getByRole('list', { name: /Nachrichten dieser/ }).getByText(frage)).toBeVisible();
    await expect(hauptB.getByRole('link', { name: new RegExp(betreff) })).not.toContainText('ungelesen');

    // B antwortet im Verlauf; die Antwort erscheint sofort
    await hauptB.getByLabel('Nachricht (Pflichtfeld)', { exact: true }).fill(antwort);
    await hauptB.getByRole('button', { name: 'Senden', exact: true }).click();
    await expect(hauptB.getByRole('list', { name: /Nachrichten dieser/ }).getByText(antwort)).toBeVisible();

    // A: die Liste zeigt die neue Antwort ungelesen; Öffnen zeigt sie im Verlauf
    await a.seite.goto('/verwaltung/postfach');
    const zeileA = hauptA.getByRole('link', { name: new RegExp(betreff) });
    await expect(zeileA).toContainText('1 ungelesen');
    await zeileA.click();
    await expect(hauptA.getByRole('list', { name: /Nachrichten dieser/ }).getByText(antwort)).toBeVisible();

    expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
  } finally {
    await a.kontext.close();
    await b.kontext.close();
  }
});

test('Ohne Anmeldung: Nachrichten leiten zur Anmeldung', async ({ page }) => {
  await page.goto('/verwaltung/postfach');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await page.goto('/verwaltung/postfach/neu');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
});
