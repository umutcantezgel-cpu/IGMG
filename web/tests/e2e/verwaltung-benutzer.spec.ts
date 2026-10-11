import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import benutzer from '../../messages/verwaltung/benutzer.json';
import { TESTPASSWORT } from './hilfen/einladung';
import { angemeldetesKonto, eigeneAbsenderAdresse } from './hilfen/konto';

/**
 * C12 (K-06, Z-06): Administration lädt eine Person ein (Mail in Mailpit, Link einmalig sichtbar), die Person nimmt
 * an und richtet Zwei-Faktor ein; danach Rollen ändern, Zwei-Faktor zurücksetzen und Konto endgültig löschen.
 * Ohne Recht benutzer.lesen: „Kein Zugriff“. Mein Konto: Passwort ändern.
 */
const t = benutzer.benutzer;
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';

async function barrierefrei(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Einladen → annehmen → Rollen ändern → Zwei-Faktor zurücksetzen → Konto löschen', async ({ page, browser }) => {
  test.setTimeout(180_000);
  await angemeldetesKonto(page);
  const email = `testperson.${randomBytes(4).toString('hex')}@example.test`;

  await page.goto('/verwaltung/benutzer');
  await expect(page.getByRole('heading', { level: 1, name: t.titel })).toBeVisible();
  await barrierefrei(page);
  await page.getByRole('link', { name: t.einladen }).click();
  await expect(page.getByRole('heading', { level: 1, name: t.formular.einladenTitel })).toBeVisible();
  const formular = page.locator('main form');

  // Ohne Rolle → Fehler am Feldsatz, Fokus auf der Meldung
  await formular.getByLabel(/^E-Mail-Adresse/).fill(email);
  await formular.getByLabel(/^Name/).fill('Testperson Neu');
  await formular.getByRole('button', { name: t.formular.senden }).click();
  await expect(page.getByRole('alert').filter({ hasText: t.fehler.pruefen })).toBeFocused();
  await expect(formular.getByText(t.fehler.rolleFehlt)).toBeVisible();
  await barrierefrei(page);
  await formular.getByRole('checkbox', { name: /^Redaktion/ }).check();
  await formular.getByRole('button', { name: t.formular.senden }).click();
  await expect(page.getByText(t.formular.erfolgTitel)).toBeVisible();
  const link = await page.getByLabel(t.formular.link).inputValue();
  expect(link).toMatch(/\/verwaltung\/einladung\/[\w-]{20,}$/);

  // Mail in Mailpit mit demselben Link
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`);
    const treffer = ((await r.json()) as { messages?: { ID: string; Subject: string }[] }).messages ?? [];
    const mail = treffer.find((m) => m.Subject === 'Einladung zur Verwaltung der IGMG Wetzlar');
    expect(mail).toBeTruthy();
    const text = await (await fetch(`${MAILPIT}/api/v1/message/${mail!.ID}`)).json();
    expect(JSON.stringify(text)).toContain(new URL(link).pathname);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });

  // Die eingeladene Person nimmt an (eigener Browser-Kontext)
  const kontext = await browser.newContext();
  const neu = await kontext.newPage();
  await eigeneAbsenderAdresse(neu);
  await neu.goto(new URL(link).pathname);
  await neu.getByLabel('Neues Passwort').filter({ visible: true }).fill(TESTPASSWORT);
  await neu.getByLabel('Passwort wiederholen').filter({ visible: true }).fill(TESTPASSWORT);
  await neu.getByRole('button', { name: 'Konto anlegen' }).click();
  await expect(neu).toHaveURL(/\/verwaltung\/anmelden\?eingeladen=1$/);
  await kontext.close();

  // In der Liste: Konto mit Zwei-Faktor „Ausstehend“, Einladung nicht mehr offen
  await page.goto('/verwaltung/benutzer');
  const zeile = page.locator('main').getByRole('row').filter({ hasText: email });
  await expect(zeile).toContainText(t.zweiFaktorStatus.ausstehend);
  await zeile.getByRole('link', { name: `Bearbeiten: Testperson Neu` }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Testperson Neu' })).toBeVisible();

  // Rollen ändern
  const rollen = page.getByRole('region', { name: t.detail.rollenTitel });
  await rollen.getByRole('checkbox', { name: /^Redaktion/ }).uncheck();
  await rollen.getByRole('checkbox', { name: /^Bildung/ }).check();
  await rollen.getByRole('button', { name: t.formular.rollenSpeichern }).click();
  await expect(rollen.getByText(t.formular.rollenGespeichert)).toBeVisible();
  await barrierefrei(page);

  // Zwei-Faktor zurücksetzen (mit Rückfrage)
  await page.getByRole('button', { name: t.detail.zweiFaktorZuruecksetzen }).click();
  await page.getByRole('dialog', { name: t.detail.zweiFaktorTitel }).getByRole('button', { name: t.detail.zweiFaktorBestaetigen }).click();
  await expect(page.getByText(t.meldung.zweiFaktor)).toBeVisible();

  // Konto endgültig löschen
  await page.getByRole('button', { name: t.detail.loeschen }).click();
  await page.getByRole('dialog', { name: t.detail.loeschenTitel }).getByRole('button', { name: t.detail.loeschenBestaetigen }).click();
  await expect(page).toHaveURL(/\/verwaltung\/benutzer\?meldung=geloescht$/);
  // nur Sichtbares zählen: Next.js hält die zuvor besuchte Detailseite versteckt im DOM
  await expect(page.locator('main').getByText(email).filter({ visible: true })).toHaveCount(0);
});

test('Ohne Recht benutzer.lesen: „Kein Zugriff“; Mein Konto ist für alle erreichbar', async ({ page }) => {
  test.setTimeout(120_000);
  await angemeldetesKonto(page, 'redaktion');
  await page.goto('/verwaltung/benutzer');
  await expect(page).toHaveURL(/\/verwaltung\/kein-zugriff$/);
  // „Kein Zugriff“ liegt außerhalb der Hülle – Kontomenü von der Übersicht aus
  await page.goto('/verwaltung');
  await page.getByRole('button', { name: /Kontomenü öffnen/ }).click();
  await page.getByRole('menuitem', { name: 'Mein Konto' }).click();
  await expect(page.getByRole('heading', { level: 1, name: t.konto.titel })).toBeVisible();
  await barrierefrei(page);
  // Passwort ändern: falsches aktuelles Passwort → Fehler am Feld; richtiges → Erfolg
  const passwort = page.getByRole('region', { name: t.konto.passwortTitel });
  await passwort.getByLabel(/^Aktuelles Passwort/).fill('Falsches-Passwort-123');
  await passwort.getByLabel(/^Neues Passwort \(/).fill('Neues-Testpasswort-2026');
  await passwort.getByLabel(/^Neues Passwort wiederholen/).fill('Neues-Testpasswort-2026');
  await passwort.getByRole('button', { name: t.konto.passwortSpeichern }).click();
  await expect(passwort.getByText(t.fehler.passwortFalsch)).toBeVisible();
  await passwort.getByLabel(/^Aktuelles Passwort/).fill(TESTPASSWORT);
  await passwort.getByLabel(/^Neues Passwort \(/).fill('Neues-Testpasswort-2026');
  await passwort.getByLabel(/^Neues Passwort wiederholen/).fill('Neues-Testpasswort-2026');
  await passwort.getByRole('button', { name: t.konto.passwortSpeichern }).click();
  await expect(page).toHaveURL(/\/verwaltung\/konto\?passwort=geaendert$/);
  await expect(page.getByRole('status').filter({ hasText: t.konto.passwortGeaendert })).toBeVisible();
});
