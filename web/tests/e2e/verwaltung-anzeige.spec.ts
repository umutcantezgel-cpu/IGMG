import { expect, test, type Page } from '@playwright/test';
import v from '../../messages/verwaltung/anzeige.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * O-K05 (AUFTRAG 3.10, B-25): Verwaltung › Anzeige. Textfolie anlegen, sichtbar schalten → steht in `/api/anzeige`;
 * Einstellungen (Iqama je Gebet, leer = ausgeblendet) mit Fehlern am Feld; Versfolie einreichen → die verfassende
 * Person sieht keinen Freigabe-Knopf → eine zweite Person (religiöse Prüfung, eigener Browser-Kontext) gibt frei.
 * Leitung sieht das Modul nicht. Nur Desktop (Anmelde-Ratenlimit). Texte aus messages, Inhalte als Platzhalter.
 * Nicht ausgeführt: Der Test ist geschrieben, läuft beim Orchestrator am Tor.
 */
const t = v.anzeige;

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

const modul = (page: Page) => page.getByRole('navigation', { name: 'Dashboard-Bereiche' }).getByRole('link', { name: /^Anzeige/ });

test('Textfolie anlegen, sichtbar schalten, öffentlich über /api/anzeige; Einstellungen mit Fehlern am Feld', async ({ page }) => {
  test.setTimeout(150_000);
  await angemeldetesKonto(page, 'redaktion');
  await modul(page).click();
  await expect(page.getByRole('heading', { level: 1, name: t.titel })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: t.jetzt.titel })).toBeVisible();

  await page.getByRole('link', { name: t.neu }).filter({ visible: true }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: t.neuTitel })).toBeVisible();
  // Ohne Überschrift: Fehler am Feld, Fokus auf der Zusammenfassung
  await page.getByRole('button', { name: t.formular.anlegen }).click();
  await expect(page.getByRole('alert').filter({ hasText: t.fehler.pruefen })).toBeVisible();
  await expect(page.getByRole('link', { name: `${t.formular.titel}: ${t.fehler.pflicht}` })).toBeVisible();

  const titel = `[Hinweis E2E ${Date.now()}]`;
  await page.getByLabel(t.formular.titel, { exact: true }).fill(titel);
  await page.getByLabel(t.formular.text, { exact: true }).fill('[Text der Folie]');
  await page.getByRole('checkbox', { name: t.wochentagLang['5'] }).check();
  await page.getByRole('button', { name: t.formular.anlegen }).click();
  await expect(page.getByText(t.angelegt)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible();

  await page.getByRole('button', { name: t.aktion.veroeffentlichen }).click();
  await expect(page.getByText(t.status.veroeffentlicht, { exact: true }).first()).toBeVisible();
  await expect(async () => {
    const daten = (await (await page.request.get('/api/anzeige')).json()) as { folien: { titel?: { de: string }; wochentage: number[] }[] };
    expect(daten.folien.find((f) => f.titel?.de === titel)?.wochentage).toEqual([5]);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });

  // Einstellungen: Zahl außerhalb des Bereichs → Fehler am Feld; gültig → gespeichert
  await page.goto('/verwaltung/anzeige/einstellungen');
  await expect(page.getByRole('heading', { level: 1, name: t.einstellung.titel })).toBeVisible();
  const ruhe = page.getByLabel(t.einstellung.ruheNachIqama, { exact: true });
  await ruhe.fill('99');
  await page.getByRole('button', { name: t.einstellung.speichern }).click();
  await expect(page.getByRole('alert').filter({ hasText: t.fehler.pruefen })).toBeVisible();
  await expect(page.getByText(t.fehler.bereich)).toBeVisible();
  await page.getByLabel(t.einstellung.ruheNachIqama, { exact: true }).fill('15');
  await page.getByLabel(t.einstellung.iqamaFeld.replace('{gebet}', 'Dhuhr'), { exact: true }).fill('10');
  await page.getByRole('button', { name: t.einstellung.speichern }).click();
  await expect(page.getByText(t.einstellung.gespeichert)).toBeVisible();
});

test('Versfolie: einreichen, Vier-Augen-Freigabe durch die religiöse Prüfung', async ({ page, browser }) => {
  test.setTimeout(180_000);
  await angemeldetesKonto(page, 'redaktion');
  await page.goto('/verwaltung/anzeige/neu');
  await page.getByRole('radio', { name: new RegExp(`^${t.art.vers}`) }).check();
  await expect(page.getByText(t.formular.religioesHinweis)).toBeVisible();
  await page.getByLabel(t.formular.stelle, { exact: false }).fill('1:1');
  await page.getByRole('button', { name: t.formular.anlegenEinreichen }).click();
  const unbekannt = page.getByText(t.fehler.versUnbekannt);
  await expect(page.getByText(t.angelegt).or(unbekannt)).toBeVisible();
  test.skip(await unbekannt.isVisible(), 'Ohne Koran-Import (E2E-Datenbank ohne Inhaltsimport)');
  const adresse = page.url();
  await expect(page.getByText(t.freigabe.zur_pruefung, { exact: true }).first()).toBeVisible();
  // Redaktion darf nicht freigeben
  await expect(page.getByRole('button', { name: t.detail.freigeben })).toHaveCount(0);

  const zweite = await browser.newContext();
  const seite2 = await zweite.newPage();
  await seite2.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
  await angemeldetesKonto(seite2, 'religioese_pruefung');
  await expect(modul(seite2)).toBeVisible();
  await seite2.goto(adresse);
  // Prüfung sieht kein Bearbeitungsformular, nur Vorschau und Freigabe
  await expect(seite2.getByRole('button', { name: t.formular.speichern })).toHaveCount(0);
  await seite2.getByRole('button', { name: t.detail.freigeben }).click();
  await expect(seite2.getByRole('status').filter({ hasText: t.freigabe.geprueft })).toBeVisible();
  await zweite.close();
});

test('Leitung: kein Modul in der Seitenleiste, direkte Adresse führt zu „Kein Zugriff“', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page, 'leitung');
  await expect(modul(page)).toHaveCount(0);
  await page.goto('/verwaltung/anzeige');
  await expect(page).toHaveURL(/\/verwaltung\/kein-zugriff$/);
});
