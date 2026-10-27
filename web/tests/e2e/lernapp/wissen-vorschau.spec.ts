import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import type { IslamEinheitDatei } from '../../../src/lib/lernapp/inhalt/schema';
import { WISSENS_QUELLEN } from '../../../src/lib/lernapp/inhalt/wissen-quellen';
import { ernsteBefunde, liveRegion } from './hilfen';

/**
 * Vorschau des Wissenskurses (Schalter `lernapp_wissen_vorschau`, `_lernapp/ENTSCHEIDUNGEN.md` L3-E22): Die importierten
 * Einheiten (Status „Entwurf“, ohne Freigaben) sind im Bau mit eingeschalteter Vorschau erreichbar und deutlich als
 * ungeprüfter Entwurf gekennzeichnet – Startseite, Hinweis „Entwurf zur Prüfung“ auf der Kursseite (de, tr, ar), Marke an
 * der Einheit, Vermerk „Entwurf“ statt Prüfvermerk je Lektion, Hinweis über dem Spieler, Quellenzeile je Aufgabe. Gespielt wird
 * die echte Lektion `islam.grund.e01.l01` (Inhalte unverändert aus `inhalte/lernapp/islam`, KI-Regel 2); geantwortet wird ohne
 * Kenntnis der Lösung. axe ohne ernste Befunde.
 */

test.use({ serviceWorkers: 'block' });

const E = 'islam.grund.e01';
const L = `${E}.l01`;
const DATEI = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../../inhalte/lernapp/islam/taharah/islam.grund.e01.json'), 'utf8'),
) as IslamEinheitDatei;

test('Startseite → Kurs: Hinweis „Entwurf zur Prüfung“, Einheiten mit Marke, Lektion mit Vermerk „Entwurf“', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/lern-app/de');
  await expect(page.getByText(de.kurse.wissenTextVorschau, { exact: true })).toBeVisible();
  await expect(page.getByText(de.kurse.wissenText, { exact: true })).toHaveCount(0);
  await page.locator('main a[href="/lern-app/de/islam"]').first().click();
  await expect(page).toHaveURL(/\/lern-app\/de\/islam$/);

  const hinweis = page.locator('[data-wissen-entwurf="kurs"]');
  await expect(hinweis.getByRole('heading', { name: de.lernpfad.vorschauTitel })).toBeVisible();
  await expect(hinweis).toContainText(de.lernpfad.vorschauText);
  // nicht mehr „erst nach zwei Prüfungen“
  await expect(page.getByText(de.lernpfad.pruefHinweis, { exact: true })).toHaveCount(0);

  // erste Station: echte Einheit mit Marke; ihre Lektionen kommen automatisch aufs Gerät (aktuelle Einheit)
  await expect(page.locator(`[data-einheit-entwurf="${E}"]`)).toHaveText(de.lernpfad.einheitEntwurf);
  const link = page.locator(`main a[href="/lern-app/de/islam/ueben?l=${L}"]`);
  await expect(link).toBeVisible({ timeout: 30_000 });
  await expect(link).toContainText(DATEI.lektionen[0]!.titel);
  const vermerk = page.locator(`[data-entwurf="${L}"]`);
  await expect(vermerk).toContainText(de.lernpfad.entwurfVermerk);
  await expect(page.locator(`[data-pruefvermerk="${L}"]`)).toHaveCount(0);
  // Inhalt der Lektion: alle Aussagen mit Quellenzeile (Werk und Verfasser aus dem Register)
  const inhalt = page.locator(`[data-lektionsinhalt="${L}"]`);
  await inhalt.locator('summary').click();
  await expect(inhalt.locator('p[lang="de"]')).toHaveCount(DATEI.lektionen[0]!.aussagen.length);
  const ersterBeleg = DATEI.lektionen[0]!.aussagen[0]!.belege[0]!;
  const register = WISSENS_QUELLEN[ersterBeleg.werk];
  await expect(inhalt.locator('bdi[lang="de"]').first()).toContainText(`${register.werk} (${register.autor})`);
  expect(await ernsteBefunde(page, 'wissen-vorschau Lernpfad')).toEqual([]);
});

test('echte Lektion spielen: Hinweis über dem Spieler, Quellenzeile nach „Quelle zeigen“', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(`/lern-app/de/islam/ueben?l=${L}`);
  const hinweis = page.locator('[data-wissen-entwurf="lektion"]');
  await expect(hinweis.getByRole('heading', { name: de.ueben.entwurfTitel })).toBeVisible({ timeout: 30_000 });
  await expect(hinweis).toContainText(de.ueben.entwurfText);
  const form = page.locator('main form[data-aufgabe]');
  await expect(form).toBeVisible({ timeout: 20_000 });
  expect(await ernsteBefunde(page, 'wissen-vorschau Spieler')).toEqual([]);

  // erste Quizfrage der Datei, ohne Kenntnis der Lösung beantwortet: je Gruppe (Zuordnen) bzw. einmal die erste Option
  const q = DATEI.lektionen[0]!.aufgaben[0]!;
  await expect(form).toHaveAttribute('data-aufgabe', q.typ);
  await expect(form.getByRole('radio').first()).toBeAttached({ timeout: 20_000 });
  const gruppen = form.getByRole('group');
  const n = await gruppen.count();
  if (n > 0)
    for (let i = 0; i < n; i++)
      await gruppen
        .nth(i)
        .locator('label')
        .filter({ has: page.getByRole('radio') })
        .first()
        .click();
  else
    await form
      .locator('label')
      .filter({ has: page.getByRole('radio') })
      .first()
      .click();
  await page.getByRole('button', { name: de.spieler.pruefen, exact: true }).click();
  await expect(liveRegion(page)).not.toBeEmpty();
  await page.getByText(de.aufgaben.wissen.quelleZeigen, { exact: true }).click();
  const aussage = DATEI.lektionen[0]!.aussagen.find((a) => a.schluessel === q.aussage)!;
  const werk = WISSENS_QUELLEN[aussage.belege[0]!.werk];
  // Quellenzeile der Aussage (Erklärung nach der Antwort, aufgeklappt)
  const quelle = page.locator('main details[open] bdi[lang="de"]');
  await expect(quelle).toContainText(`${werk.werk} (${werk.autor})`);
  await expect(quelle).toContainText(aussage.belege[0]!.kapitel);
  expect(await ernsteBefunde(page, 'wissen-vorschau Spieler nach der Antwort')).toEqual([]);
});

for (const [ui, t] of [
  ['tr', tr],
  ['ar', ar],
] as const)
  test(`${ui}-Oberfläche: Hinweis „Entwurf zur Prüfung“ und Vermerk in der Sprache der Oberfläche`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/lern-app/${ui}/islam`);
    await expect(page.locator('html')).toHaveAttribute('dir', ui === 'ar' ? 'rtl' : 'ltr');
    const hinweis = page.locator('[data-wissen-entwurf="kurs"]');
    await expect(hinweis.getByRole('heading', { name: t.lernpfad.vorschauTitel })).toBeVisible();
    await expect(hinweis).toContainText(t.lernpfad.vorschauText);
    await expect(page.locator(`[data-entwurf="${L}"]`)).toContainText(t.lernpfad.entwurfVermerk, { timeout: 30_000 });
    expect(await ernsteBefunde(page, `wissen-vorschau ${ui}`)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
