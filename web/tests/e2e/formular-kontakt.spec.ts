import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';
import kontakt from '../../messages/bereiche/kontaktformular.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * B03 (Z-05, K-07, ADR 0005): Kontaktformular auf /kontakt – ALTCHA im Browser unter der öffentlichen CSP,
 * Bestätigung an die anfragende Person und Benachrichtigung an die Verwaltung (Mailpit). Nach einem Fehler:
 * Fokus auf der Zusammenfassung, Sprungverweis zum Feld, zweiter Versuch ohne Neuladen. Nur Desktop (Formular-Ratenlimit).
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const f = kontakt.de.kontaktformular;
const fo = formulare.de.formulare;

type MailpitTreffer = { messages: { Subject: string; To: { Address: string }[] }[] };

/** Wartet, bis Mailpit eine Mail an `an` mit passendem Betreff hat (Versand läuft nach der Antwort, `after()`). */
async function mailAn(an: string, betreff: RegExp) {
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as MailpitTreffer).messages ?? [];
    expect(treffer.some((m) => betreff.test(m.Subject))).toBe(true);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Formular- und Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Kontaktformular: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Bestätigung und Benachrichtigung in Mailpit', async ({
  page,
}) => {
  test.setTimeout(150_000);
  const konsole: string[] = [];
  // Link-Vorabrufe (?_rsc=) sind nicht Gegenstand dieses Tests; alle übrigen Fehlantworten und Konsolenfehler schon.
  const vorabruf = (url: string) => url.includes('_rsc=');
  page.on('console', (m) => m.type() === 'error' && !vorabruf(m.location().url) && konsole.push(m.text()));
  const fehlend: string[] = [];
  page.on('response', (r) => r.status() >= 400 && !vorabruf(r.url()) && fehlend.push(`${r.status()} ${r.url()}`));
  const { email: verwaltung } = await angemeldetesKonto(page);

  await page.goto('/kontakt');
  await expect(page.getByRole('heading', { level: 2, name: f.titel })).toBeVisible();
  const formular = page.locator('#nachricht form');

  // Absenden mit fehlenden Pflichtangaben → Zusammenfassung mit Fokus, Feldfehler, Eingaben bleiben erhalten
  await formular.getByLabel(/^Name/).fill('Testperson Drei');
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await formular.getByRole('button', { name: fo.senden }).click();
  const zusammenfassung = page.getByRole('alert').filter({ hasText: fo.zusammenfassung });
  await expect(zusammenfassung).toBeVisible();
  await expect(zusammenfassung).toBeFocused();
  await expect(formular.getByLabel(/^E-Mail/)).toHaveAttribute('aria-invalid', 'true');
  await expect(formular.getByLabel(/^Name/)).toHaveValue('Testperson Drei');
  // Sprungverweis führt zum Feld
  await zusammenfassung.getByRole('link', { name: /^E-Mail/ }).click();
  await expect(formular.getByLabel(/^E-Mail/)).toBeFocused();
  // Barrierefreiheit des Formulars im Fehlerzustand
  const axe = await new AxeBuilder({ page })
    .include('#nachricht')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Zweiter Versuch ohne Neuladen: ALTCHA löst eine neue Aufgabe (Lösungen sind einmalig), Erfolg und beide Mails
  const person = `testperson.${randomBytes(4).toString('hex')}@example.test`;
  await formular.getByLabel(/^E-Mail/).fill(person);
  await formular.getByLabel(/^Nachricht/).fill('Testnachricht aus dem End-to-End-Test.');
  await formular.getByRole('checkbox', { name: /^Ich willige ein/ }).check();
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await formular.getByRole('button', { name: fo.senden }).click();
  await expect(page.getByText(fo.erfolg)).toBeVisible();
  await mailAn(person, /^Ihre Nachricht an die IGMG Wetzlar$/);
  await mailAn(verwaltung, /^Neuer Eingang: Nachricht$/);

  // Keine CSP-Verstöße (ALTCHA-Worker, Inline-Stile) und keine Konsolenfehler
  expect(fehlend).toEqual([]);
  expect(konsole.filter((k) => !k.includes('favicon'))).toEqual([]);
});
