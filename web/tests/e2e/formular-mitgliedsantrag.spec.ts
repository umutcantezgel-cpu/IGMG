import AxeBuilder from '@axe-core/playwright';
import { randomBytes } from 'node:crypto';
import { expect, test } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';
import bereich from '../../messages/bereiche/mitglied.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * B06 (Z-05, Z-08, K-07, K-11): Mitgliedsantrag im FormWizard in drei Schritten – Schritte vom Server (E-028):
 * Fehler-Zusammenfassung mit Fokus und Sprungverweis, Eingabetaste geht weiter, Zurück behält Eingaben (auch die
 * Mehrfachauswahl), ALTCHA erst im letzten Schritt, Erfolgsansicht, Bestätigung an die Person und Benachrichtigung (Mailpit).
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const m = bereich.de.mitglied;
const fw = formulare.de.formulare;

/** Feldbeschriftung als Anfang des Textes (Beschriftungen tragen „(Pflichtfeld)“ oder „(optional)“ dahinter). */
const feld = (text: string) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

async function mailAn(an: string, betreff: RegExp) {
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as { messages?: { Subject: string }[] }).messages ?? [];
    expect(treffer.some((x) => betreff.test(x.Subject))).toBe(true);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Formular- und Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Mitgliedsantrag in drei Schritten bis zur Bestätigung', async ({ page }) => {
  test.setTimeout(150_000);
  const konsole: string[] = [];
  const vorabruf = (url: string) => url.includes('_rsc=');
  page.on('console', (nachricht) => nachricht.type() === 'error' && !vorabruf(nachricht.location().url) && konsole.push(nachricht.text()));
  const { email: verwaltung } = await angemeldetesKonto(page);
  const person = `testperson.${randomBytes(4).toString('hex')}@example.test`;

  await page.goto('/mitglied-werden');
  await expect(page.getByRole('heading', { level: 1, name: m.titel })).toBeVisible();
  const form = page.locator('main form');
  const zeile = (nr: number, titel: string) => page.getByText(`Schritt ${nr} von 3: ${titel}`, { exact: true });
  await expect(zeile(1, m.schritt.kontakt)).toBeVisible();
  await expect(form.getByRole('button', { name: fw.wizard.zurueck })).toHaveCount(0);

  // Schritt 1 leer → Zusammenfassung mit Fokus, Fehler am Feld, Sprungverweis
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  const zusammenfassung = page.getByRole('alert').filter({ hasText: fw.fehler.pruefen });
  await expect(zusammenfassung).toBeFocused();
  await expect(form.getByLabel(feld(m.feld.vorname))).toHaveAttribute('aria-invalid', 'true');
  await expect(zusammenfassung.getByRole('link')).toHaveCount(3);
  await zusammenfassung.getByRole('link', { name: feld(m.feld.vorname) }).click();
  await expect(form.getByLabel(feld(m.feld.vorname))).toBeFocused();
  const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Schritt 1 ausfüllen, Eingabetaste → Schritt 2 (unsichtbarer „Weiter“-Knopf zuerst im Formular)
  await form.getByLabel(feld(m.feld.vorname)).fill('Testperson');
  await form.getByLabel(feld(m.feld.nachname)).fill('Sieben');
  await form.getByLabel(feld(m.feld.email)).fill(person);
  await form.getByLabel(feld(m.feld.stadt)).fill('Testort');
  await form.getByLabel(feld(m.feld.email)).press('Enter');
  await expect(zeile(2, m.schritt.interessen)).toBeFocused();
  await expect(page.getByRole('alert').filter({ hasText: fw.fehler.pruefen })).toHaveCount(0);

  // Schritt 2: Mehrfachauswahl und Erfahrung, dann Zurück: Werte aus Schritt 1 und 2 bleiben erhalten
  await form.getByRole('checkbox', { name: m.interessen.prayer, exact: true }).check();
  await form.getByRole('checkbox', { name: m.interessen.youth, exact: true }).check();
  await form.getByLabel(feld(m.erfahrung.label)).fill('Testerfahrung');
  await form.getByRole('button', { name: fw.wizard.zurueck }).click();
  await expect(zeile(1, m.schritt.kontakt)).toBeFocused();
  await expect(form.getByLabel(feld(m.feld.vorname))).toHaveValue('Testperson');
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  await expect(form.getByRole('checkbox', { name: m.interessen.prayer, exact: true })).toBeChecked();
  await expect(form.getByRole('checkbox', { name: m.interessen.youth, exact: true })).toBeChecked();
  await expect(form.getByLabel(feld(m.erfahrung.label))).toHaveValue('Testerfahrung');
  await form.getByRole('button', { name: fw.wizard.weiter }).click();

  // Schritt 3 ohne Angaben absenden → Fehler an Motivation und Datenschutz-Einwilligung, ALTCHA noch nicht gesendet
  await expect(zeile(3, m.schritt.motivation)).toBeFocused();
  await form.getByRole('button', { name: m.absenden }).click();
  const fehlerAntwort = page.getByRole('alert').filter({ hasText: fw.fehler.pruefen });
  await expect(fehlerAntwort).toBeFocused();
  await expect(fehlerAntwort.getByRole('link')).toHaveCount(2);
  const axeFehler = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axeFehler.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Zweiter Versuch ohne Neuladen: Angaben ergänzen, ALTCHA lösen, absenden
  await form.getByLabel(feld(m.motivation.label)).fill('Testmotivation');
  await form.getByRole('checkbox', { name: feld(m.einwilligung.datenschutz) }).check();
  await expect(form.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await form.getByRole('button', { name: m.absenden }).click();

  const erfolg = page.getByRole('status').filter({ hasText: m.erfolg.titel });
  await expect(erfolg).toBeFocused();
  await expect(erfolg.getByRole('link', { name: m.erfolg.veranstaltungen })).toHaveAttribute('href', '/veranstaltungen');
  await mailAn(person, /^Ihre Mitgliedsanfrage an die IGMG Wetzlar$/);
  await mailAn(verwaltung, /^Neuer Eingang: Mitgliedsanfrage$/);
  expect(konsole).toEqual([]);
});
