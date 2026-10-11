import AxeBuilder from '@axe-core/playwright';
import { randomBytes } from 'node:crypto';
import { expect, test } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';
import bereich from '../../messages/bereiche/moschee-anfrage.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * B07 (Z-05, Z-08, K-07, K-11, G-07): Webseite für Moscheen im FormWizard – drei Schritte vom Server (E-028):
 * Fehler-Zusammenfassung mit Fokus und Sprungverweisen, Eingabetaste geht weiter, Zurück behält Eingaben,
 * ALTCHA erst im letzten Schritt, Erfolgsansicht, Bestätigung an die Person und Benachrichtigung (Mailpit).
 * Nicht ausgeführt: braucht einen Produktionsbuild; der Orchestrator führt diesen Test aus.
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const m = bereich.de.moscheeAnfrage;
const fw = formulare.de.formulare;

/** Beschriftung als Muster; Klammern und Fragezeichen werden wörtlich genommen. */
const beschriftung = (text: string) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

async function mailAn(an: string, betreff: RegExp) {
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as { messages?: { Subject: string }[] }).messages ?? [];
    expect(treffer.some((x) => betreff.test(x.Subject))).toBe(true);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Webseite-Anfrage in drei Schritten bis zur Bestätigung', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Formular- und Verwaltungsabläufe nur einmal je Lauf');
  test.setTimeout(150_000);
  const konsole: string[] = [];
  const vorabruf = (url: string) => url.includes('_rsc=');
  page.on('console', (x) => x.type() === 'error' && !vorabruf(x.location().url) && konsole.push(x.text()));
  const { email: verwaltung } = await angemeldetesKonto(page);
  const kontakt = `testperson.${randomBytes(4).toString('hex')}@example.test`;

  await page.goto('/webseite-fuer-moscheen');
  await expect(page.getByRole('heading', { level: 1, name: m.seite.titel })).toBeVisible();
  const form = page.locator('main form');
  const zeile = (nr: number, titel: string) => page.getByText(`Schritt ${nr} von 3: ${titel}`, { exact: true });
  const feld = (name: string) => form.getByLabel(beschriftung(name));
  await expect(zeile(1, m.schritt.grund)).toBeVisible();
  await expect(form.getByRole('button', { name: fw.wizard.zurueck })).toHaveCount(0);
  await expect(form.locator('input[name="altcha"]')).toHaveCount(0);

  // Schritt 1 leer → Zusammenfassung mit Fokus, sieben Sprungverweise (Pflichtfelder), Fehler am Feld
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  const zusammenfassung = page.getByRole('alert').filter({ hasText: fw.fehler.pruefen });
  await expect(zusammenfassung).toBeFocused();
  await expect(zusammenfassung.getByRole('link')).toHaveCount(7);
  await expect(feld(m.feld.mosqueName)).toHaveAttribute('aria-invalid', 'true');
  await zusammenfassung.getByRole('link', { name: beschriftung(m.feld.mosqueName) }).click();
  await expect(feld(m.feld.mosqueName)).toBeFocused();
  const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Schritt 1 ausfüllen, Eingabetaste → Schritt 2
  await feld(m.feld.mosqueName).fill('Testmoschee Zwei');
  await feld(m.feld.contactPerson).fill('Testperson Acht');
  await feld(m.feld.email).fill(kontakt);
  await feld(m.feld.address).fill('Teststraße 4');
  await feld(m.feld.city).fill('Testort');
  await feld(m.feld.postalCode).fill('12345');
  await feld(m.feld.country).fill('Testland');
  await feld(m.feld.country).press('Enter');
  await expect(zeile(2, m.schritt.details)).toBeFocused();
  await expect(page.getByRole('alert').filter({ hasText: fw.fehler.pruefen })).toHaveCount(0);

  // Schritt 2 ausfüllen → Zurück: Werte aus Schritt 1 bleiben erhalten, dann wieder vorwärts
  await feld(m.feld.currentWebsite).fill('https://www.testmoschee.example.test');
  await feld(m.feld.memberCount).fill('500');
  await form.getByRole('checkbox', { name: m.anforderung.events, exact: true }).check();
  await form.getByRole('button', { name: fw.wizard.zurueck }).click();
  await expect(zeile(1, m.schritt.grund)).toBeFocused();
  await expect(feld(m.feld.mosqueName)).toHaveValue('Testmoschee Zwei');
  await form.getByRole('button', { name: fw.wizard.weiter }).click();
  await expect(feld(m.feld.currentWebsite)).toHaveValue('https://www.testmoschee.example.test');
  await expect(form.getByRole('checkbox', { name: m.anforderung.events, exact: true })).toBeChecked();
  await form.getByRole('checkbox', { name: m.anforderung.news, exact: true }).check();
  await form.getByRole('button', { name: fw.wizard.weiter }).click();

  // Schritt 3: Auswahl, Datenschutz-Einwilligung, ALTCHA erst hier, Absenden
  await expect(zeile(3, m.schritt.projekt)).toBeFocused();
  await feld(m.feld.budget).selectOption({ value: 'b2' });
  await feld(m.feld.timeline).selectOption({ value: 't1' });
  await form.getByRole('checkbox', { name: beschriftung(m.feld.einwilligung) }).check();
  await expect(form.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await form.getByRole('button', { name: m.absenden, exact: true }).click();

  const erfolg = page.getByRole('status').filter({ hasText: m.erfolg.titel });
  await expect(erfolg).toBeFocused();
  await expect(erfolg.getByRole('link', { name: m.nav.startseite })).toHaveAttribute('href', '/');
  await mailAn(kontakt, /^Ihre Anfrage zur Moschee-Webseite an die IGMG Wetzlar$/);
  await mailAn(verwaltung, /^Neuer Eingang: Anfrage zur Moschee-Webseite$/);
  expect(konsole).toEqual([]);
});

test('Schrittleiste ohne Querscrollen im 390-px-Rahmen', async ({ page }, info) => {
  test.skip(info.project.name !== 'telefon', 'nur im Telefon-Rahmen (390 px)');
  await page.goto('/webseite-fuer-moscheen');
  await expect(page.getByRole('heading', { level: 1, name: m.seite.titel })).toBeVisible();
  await expect(page.getByText(`Schritt 1 von 3: ${m.schritt.grund}`, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
