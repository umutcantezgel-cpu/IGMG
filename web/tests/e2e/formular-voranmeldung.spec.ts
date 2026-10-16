import AxeBuilder from '@axe-core/playwright';
import { randomBytes } from 'node:crypto';
import { expect, test } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';
import bereich from '../../messages/bereiche/voranmeldung.json';
import { ALTCHA_MS } from './hilfen/altcha';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * B01/B05 (Z-05, Z-08, K-07, K-11): Schüler-Voranmeldung im FormWizard – Schritte vom Server (E-028):
 * Fehler-Zusammenfassung mit Fokus und Sprungverweis, Eingabetaste geht weiter, Zurück behält Eingaben,
 * ALTCHA nur im letzten Schritt, Erfolgsansicht, Bestätigung an Elternteil 1 und Benachrichtigung (Mailpit).
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const v = bereich.de.voranmeldung;
const fw = formulare.de.formulare;

async function mailAn(an: string, betreff: RegExp) {
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as { messages?: { Subject: string }[] }).messages ?? [];
    expect(treffer.some((m) => betreff.test(m.Subject))).toBe(true);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Formular- und Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Voranmeldung in vier Schritten bis zur Bestätigung', async ({ page }) => {
  test.setTimeout(150_000);
  const konsole: string[] = [];
  const vorabruf = (url: string) => url.includes('_rsc=');
  page.on('console', (m) => m.type() === 'error' && !vorabruf(m.location().url) && konsole.push(m.text()));
  const { email: verwaltung } = await angemeldetesKonto(page);
  const eltern = `testperson.${randomBytes(4).toString('hex')}@example.test`;

  await page.goto('/bildung/voranmeldung');
  await expect(page.getByRole('heading', { level: 1, name: v.titel })).toBeVisible();
  const form = page.locator('main form');
  const zeile = (nr: number, titel: string) => page.getByText(`Schritt ${nr} von 4: ${titel}`, { exact: true });
  await expect(zeile(1, v.schritt.kind)).toBeVisible();
  await expect(form.getByRole('button', { name: fw.wizard.zurueck })).toHaveCount(0);

  // Schritt 1 leer → Zusammenfassung mit Fokus, Fehler am Feld, Sprungverweis
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  const zusammenfassung = page.getByRole('alert').filter({ hasText: fw.fehler.pruefen });
  await expect(zusammenfassung).toBeFocused();
  await expect(form.getByLabel(new RegExp(`^${v.feld.vorname}`))).toHaveAttribute('aria-invalid', 'true');
  await expect(zusammenfassung.getByRole('link')).toHaveCount(5);
  await zusammenfassung.getByRole('link', { name: new RegExp(`^${v.feld.vorname}`) }).click();
  await expect(form.getByLabel(new RegExp(`^${v.feld.vorname}`))).toBeFocused();
  const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Schritt 1 ausfüllen, Eingabetaste → Schritt 2 (unsichtbarer „Weiter“-Knopf zuerst im Formular)
  await form.getByRole('radio', { name: new RegExp(`^${v.klasse.vorbereitung.replace(/[()]/g, '.')}`) }).check();
  await form.getByRole('radio', { name: v.feld.weiblich }).check();
  await form.getByLabel(new RegExp(`^${v.feld.vorname}`)).fill('Testkind');
  await form.getByLabel(new RegExp(`^${v.feld.geburtsdatum}`)).fill('2018-05-04');
  await form.getByLabel(new RegExp(`^${v.feld.nachname}`)).fill('Zwei');
  await form.getByLabel(new RegExp(`^${v.feld.nachname}`)).press('Enter');
  await expect(zeile(2, v.schritt.adresse)).toBeFocused();
  await expect(page.getByRole('alert').filter({ hasText: fw.fehler.pruefen })).toHaveCount(0);

  // Schritt 2 → Zurück: Werte aus Schritt 1 und 2 bleiben erhalten
  await form.getByLabel(new RegExp(`^${v.feld.strasse}`)).fill('Teststraße 2');
  await form.getByLabel(new RegExp(`^${v.feld.plz}`)).fill('12345');
  await form.getByLabel(new RegExp(`^${v.feld.ort}`)).fill('Testort');
  await form.getByRole('button', { name: fw.wizard.zurueck }).click();
  await expect(zeile(1, v.schritt.kind)).toBeFocused();
  await expect(form.getByLabel(new RegExp(`^${v.feld.vorname}`))).toHaveValue('Testkind');
  await expect(form.getByRole('radio', { name: v.feld.weiblich })).toBeChecked();
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  await expect(form.getByLabel(new RegExp(`^${v.feld.strasse}`))).toHaveValue('Teststraße 2');
  await form.getByRole('button', { name: fw.wizard.weiter }).click();

  // Schritt 3: Elternteil 1 Pflicht, Elternteil 2 freiwillig
  await expect(zeile(3, v.schritt.eltern)).toBeFocused();
  const gruppe1 = form.getByRole('group', { name: v.gruppe.eltern1 });
  await gruppe1.getByLabel(new RegExp(`^${v.feld.elternName}`)).fill('Testperson Sechs');
  await gruppe1.getByLabel(new RegExp(`^${v.feld.elternTelefon}`)).fill('+49 000 000000');
  await gruppe1.getByLabel(new RegExp(`^${v.feld.elternEmail}`)).fill(eltern);
  await form.getByRole('button', { name: fw.wizard.weiter }).click();

  // Schritt 4: Einwilligungen, ALTCHA erst hier, Absenden
  await expect(zeile(4, v.schritt.einwilligungen)).toBeFocused();
  await form.getByLabel(new RegExp(`^${v.feld.ausgefuelltVon}`)).fill('Testperson Sechs');
  await form.getByRole('checkbox', { name: new RegExp(`^${v.einwilligung.kontakt}`) }).check();
  await form.getByRole('checkbox', { name: new RegExp(`^${v.einwilligung.datenschutz.slice(0, 30)}`) }).check();
  await expect(form.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: ALTCHA_MS });
  await form.getByRole('button', { name: v.absenden }).click();

  const erfolg = page.getByRole('status').filter({ hasText: v.erfolg.titel });
  await expect(erfolg).toBeFocused();
  await expect(erfolg.getByRole('link', { name: v.erfolg.korankurse })).toHaveAttribute('href', '/bildung/korankurse');
  await mailAn(eltern, /^Ihre Voranmeldung an die IGMG Wetzlar$/);
  await mailAn(verwaltung, /^Neuer Eingang: Voranmeldung$/);
  expect(konsole).toEqual([]);
});
