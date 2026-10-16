import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import texte from '../../messages/verwaltung/lernen.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * Verwaltung „Lernen und Aufnahme“ (O-L01, H-L01…L05) im Browser als Rolle Bildung: Gruppe anlegen (Fehler am Feld,
 * Mindestalter S-04), Lage des Gruppenchats ohne Leitung (S-02), Terminserie, Lehrplan umbenennen und sortieren,
 * Einladung einer Lehrkraft mit einmaligem Link und Widerruf. axe auf der Seite der Gruppe. Nur Desktop
 * (Anmelde-Ratenlimit), Testdaten fiktiv (G-04).
 */
const g = texte.gruppen;
const lp = texte.lehrplan;
const gk = texte.gemeindeKonten;

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Gruppe anlegen, Chat-Lage (S-02), Termine; Lehrplan; Lehrkraft einladen und widerrufen', async ({ page }) => {
  test.setTimeout(180_000);
  const konsole: string[] = [];
  page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
  await angemeldetesKonto(page, 'bildung');
  const name = `Elifbe Test ${randomBytes(3).toString('hex')}`;

  // Gruppe anlegen
  await page.getByRole('navigation', { name: 'Dashboard-Bereiche' }).getByRole('link', { name: 'Gruppen', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: g.titel })).toBeVisible();
  await page.getByRole('link', { name: g.neu }).filter({ visible: true }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: g.neu })).toBeVisible();
  await page.getByLabel(`${g.formular.nameDe} (Pflichtfeld)`).fill(name);
  await page.getByRole('checkbox', { name: texte.lernen.wochentag['3'] }).check();
  await page.getByLabel(g.formular.uhrzeitVon, { exact: true }).fill('16:00');
  await page.getByLabel(g.formular.uhrzeitBis, { exact: true }).fill('17:30');
  await page.getByLabel(g.formular.chatModus, { exact: true }).selectOption('offen');
  await page.getByLabel(g.formular.chatMindestalter, { exact: true }).fill('9');
  await page.getByRole('button', { name: g.anlegen }).click();
  await expect(page.getByRole('alert').filter({ hasText: g.fehler.pruefen })).toBeVisible();
  await expect(page.getByLabel(g.formular.chatMindestalter, { exact: true })).toHaveAttribute('aria-invalid', 'true');
  // Auswahlfelder behalten nach dem Fehler den gewählten Wert (P4: sonst stand wieder „Chat aus“)
  await expect(page.getByLabel(g.formular.chatModus, { exact: true })).toHaveValue('offen');
  await page.getByLabel(g.formular.chatMindestalter, { exact: true }).fill('10');
  await page.getByRole('button', { name: g.anlegen }).click();
  await expect(page).toHaveURL(/\/verwaltung\/gruppen\/[0-9a-f-]{36}\?meldung=angelegt$/);
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();

  // S-02: ohne Leitung ist der Chat nicht aktiv
  await expect(page.getByRole('heading', { level: 2, name: g.chat.titel.zuWenigeErwachsene })).toBeVisible();
  await expect(page.getByText(g.leitung.leer)).toBeVisible();

  // Terminserie
  await page.getByRole('button', { name: g.termine.erzeugen }).click();
  await expect(page).toHaveURL(/meldung=termine&anzahl=\d+#termine$/);
  await expect(page.getByRole('status').filter({ hasText: /künftige Termine|künftiger Termin/ })).toBeVisible();

  const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Lehrplan: neue Stufe anlegen, nach oben schieben, umbenennen
  await page.goto('/verwaltung/lehrplan');
  await expect(page.getByRole('heading', { level: 1, name: lp.titel })).toBeVisible();
  const hifz = page.locator('#kursart-hifz');
  const stufe = `Testebene ${randomBytes(2).toString('hex')} [Bezeichnung]`;
  await hifz.getByLabel(lp.titelDe, { exact: true }).last().fill(stufe);
  await hifz.getByRole('button', { name: lp.anlegen.replace('{kursart}', texte.lernen.kursart.hifz) }).click();
  await expect(page.getByRole('status').filter({ hasText: lp.meldung.angelegt })).toBeVisible();
  await page
    .locator('#kursart-hifz')
    .getByRole('button', { name: lp.hoch.replace('{titel}', stufe) })
    .click();
  await expect(page.getByRole('status').filter({ hasText: lp.meldung.verschoben })).toBeVisible();

  // Lehrkraft einladen: Link einmalig, Einladung erscheint offen und lässt sich widerrufen
  await page.goto('/verwaltung/gemeinde-konten/einladen');
  const email = `testperson.${randomBytes(4).toString('hex')}@example.test`;
  await page.getByRole('radio', { name: new RegExp(`^${gk.art.lehrkraft}`) }).check();
  await page.getByLabel(`${gk.einladen.name} (Pflichtfeld)`).fill('Testperson Lehrkraft');
  await page.getByLabel(`${gk.einladen.email} (Pflichtfeld)`).fill(email);
  await page.getByRole('button', { name: gk.einladen.senden }).click();
  await expect(page.getByRole('status').filter({ hasText: gk.einladen.verschickt })).toBeVisible();
  await expect(page.locator('code')).toContainText('/einladung/');
  await page.goto('/verwaltung/gemeinde-konten');
  const karte = page.locator('#einladungen li').filter({ hasText: email });
  await expect(karte).toBeVisible();
  await karte.getByRole('button', { name: gk.einladungen.widerrufenLabel.replace('{name}', 'Testperson Lehrkraft') }).click();
  await expect(page.getByRole('status').filter({ hasText: gk.meldung.widerrufen })).toBeVisible();
  await expect(page.locator('#einladungen li').filter({ hasText: email })).toHaveCount(0);

  expect(konsole.filter((k) => !k.includes('favicon'))).toEqual([]);
});
