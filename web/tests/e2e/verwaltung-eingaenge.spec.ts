import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';
import eingaenge from '../../messages/verwaltung/eingaenge.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * C08/C16 (Z-04, Z-06, G-07): Eine Kontaktanfrage kommt in der Verwaltung an – Liste ohne Personendaten, Detail
 * entschlüsselt, Status „Erledigt“ startet die Löschfrist, Notiz, Export als JSON, endgültiges Löschen.
 */
const t = eingaenge.eingaenge;
const fo = formulare.de.formulare;

async function barrierefrei(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Eingänge: Kontaktanfrage ansehen, abschließen, Notiz, Export und endgültig löschen', async ({ page }) => {
  test.setTimeout(150_000);
  await angemeldetesKonto(page);
  const name = `Testperson ${randomBytes(3).toString('hex')}`;

  // Öffentliche Kontaktanfrage (ALTCHA im Browser)
  await page.goto('/kontakt');
  const formular = page.locator('#nachricht form');
  await formular.getByLabel(/^Name/).fill(name);
  await formular.getByLabel(/^E-Mail/).fill(`testperson.${randomBytes(4).toString('hex')}@example.test`);
  await formular.getByLabel(/^Nachricht/).fill('Testnachricht für die Eingänge.');
  await formular.getByRole('checkbox', { name: /^Ich willige ein/ }).check();
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await formular.getByRole('button', { name: fo.senden }).click();
  await expect(page.getByText(fo.erfolg)).toBeVisible();

  // Liste: Art und Status, aber keine Personendaten
  await page.goto('/verwaltung/eingaenge?art=kontakt&status=neu');
  await expect(page.getByRole('heading', { level: 1, name: t.titel })).toBeVisible();
  await expect(page.getByText(name)).toHaveCount(0);
  await barrierefrei(page);
  await page
    .getByRole('link', { name: /^Ansehen: Eingang vom/ })
    .first()
    .click();

  // Detail: entschlüsselte Angaben, Einwilligung mit Textfassung
  await expect(page.getByRole('heading', { level: 1, name: /^Eingang vom/ })).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  await expect(page.getByText(/^kontaktformular\.einwilligung – erteilt am/)).toBeVisible();
  await expect(page.getByText(t.detail.keineFrist)).toBeVisible();
  await barrierefrei(page);

  // Abschließen startet die Löschfrist
  // Im Abschnitt suchen: Next.js hält die zuvor besuchte Liste (mit Statusfilter) versteckt im DOM
  await page.getByRole('region', { name: t.detail.status }).locator('select[name="status"]').selectOption('erledigt');
  await page.getByRole('button', { name: t.detail.statusSpeichern }).click();
  await expect(page.getByText(/^Wird automatisch gelöscht ab /)).toBeVisible();

  // Interne Notiz
  await page.getByLabel(t.detail.notizNeu).fill('Rückruf erledigt (Test).');
  await page.getByRole('button', { name: t.detail.notizSpeichern }).click();
  await expect(page.getByText('Rückruf erledigt (Test).')).toBeVisible();

  // Export als JSON (mit Sitzung)
  const href = await page.getByRole('link', { name: t.detail.export }).getAttribute('href');
  const antwort = await page.request.get(href!);
  expect(antwort.status()).toBe(200);
  expect(antwort.headers()['content-type']).toContain('application/json');
  expect(await antwort.text()).toContain(name);

  // Endgültig löschen mit Rückfrage
  await page.getByRole('button', { name: t.detail.loeschen }).click();
  const dialog = page.getByRole('dialog', { name: t.detail.loeschenTitel });
  await dialog.getByRole('button', { name: t.detail.loeschenBestaetigen }).click();
  await expect(page).toHaveURL(/\/verwaltung\/eingaenge\?geloescht=1$/);
  await expect(page.getByText(t.geloescht)).toBeVisible();
  expect((await page.request.get(href!)).status()).toBe(200);
  expect(await (await page.request.get(href!)).text()).not.toContain(name);
});
