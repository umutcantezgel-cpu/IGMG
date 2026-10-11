import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import de from '../../messages/de.json';
import formulare from '../../messages/bereiche/formulare.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * B04 (Z-05, K-07, ADR 0005): Anmeldung zu einer Veranstaltung über die öffentliche Detailseite – ALTCHA im Browser
 * unter der öffentlichen CSP, Bestätigung an die anmeldende Person und Benachrichtigung an die Verwaltung (Mailpit),
 * Platzzahl sofort aktualisiert, nach dem letzten Platz „Ausgebucht“. Nur Desktop (Anmelde- und Formular-Ratenlimit).
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const f = de.veranstaltung.formular;

type MailpitTreffer = { messages: { Subject: string; To: { Address: string }[] }[] };

/** Wartet, bis Mailpit eine Mail an `an` mit passendem Betreff hat (Versand läuft nach der Antwort, `after()`). */
async function mailAn(an: string, betreff: RegExp) {
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as MailpitTreffer).messages ?? [];
    expect(treffer.some((m) => betreff.test(m.Subject))).toBe(true);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
}

async function anmelden(page: Page, name: string, email: string) {
  const formular = page.locator('#anmeldung form');
  await formular.getByLabel(/^Name/).fill(name);
  await formular.getByLabel(/^E-Mail-Adresse/).fill(email);
  await formular.getByRole('checkbox', { name: /^Ich willige ein/ }).check();
  // ALTCHA lädt erst bei der ersten Interaktion und löst die Aufgabe dann selbst (auto: onload)
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await formular.getByRole('button', { name: f.senden }).click();
  await expect(page.getByText(f.erfolg)).toBeVisible();
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Formular- und Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Anmeldung mit ALTCHA: Bestätigung und Benachrichtigung in Mailpit, Plätze zählen, dann ausgebucht', async ({ page }) => {
  test.setTimeout(150_000);
  const konsole: string[] = [];
  // Link-Vorabrufe (?_rsc=) auf Seiten späterer Wellen sind nicht Gegenstand dieses Tests (Routen prüfen
  // barrierefreiheit/datenschutz.spec.ts); alle übrigen Fehlantworten und Konsolenfehler schon.
  const vorabruf = (url: string) => url.includes('_rsc=');
  page.on('console', (m) => m.type() === 'error' && !vorabruf(m.location().url) && konsole.push(m.text()));
  const fehlend: string[] = [];
  page.on('response', (r) => r.status() >= 400 && !vorabruf(r.url()) && fehlend.push(`${r.status()} ${r.url()}`));
  const { email: verwaltung } = await angemeldetesKonto(page);
  const titel = `Testanmeldung ${randomBytes(3).toString('hex')}`;

  // Verwaltung: Termin mit Anmeldung und 2 Plätzen anlegen
  await page.goto('/verwaltung/veranstaltungen/neu');
  await page.getByLabel('Titel (Pflichtfeld)', { exact: true }).fill(titel);
  await page.getByLabel('Datum (Pflichtfeld)', { exact: true }).fill('2026-12-05');
  await page.getByLabel('Startzeit (Pflichtfeld)', { exact: true }).fill('18:00');
  await page.getByLabel('Ort', { exact: true }).fill('Testraum');
  await page.getByRole('checkbox', { name: de.verwaltung.veranstaltungen.formular.anmeldungAktiv }).check();
  await page.getByLabel(de.verwaltung.veranstaltungen.formular.plaetze).fill('2');
  await page.getByLabel('Status', { exact: true }).selectOption('veroeffentlicht');
  await page.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/veranstaltungen\/[0-9a-f-]{36}\?angelegt=1$/);

  // Öffentlich: Detailseite mit Formular
  await expect(async () => {
    await page.goto('/veranstaltungen');
    await page.getByRole('link', { name: `Details ansehen: ${titel}` }).click({ timeout: 1000 });
  }).toPass({ timeout: 12_000 });
  await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible();
  await page.getByRole('link', { name: de.veranstaltung.jetztAnmelden }).click();
  await expect(page.locator('#anmeldung').getByText('Noch 2 Plätze frei.')).toBeVisible();

  // Absenden ohne Pflichtangaben → Zusammenfassung, Feldfehler
  const formular = page.locator('#anmeldung form');
  await formular.getByLabel(/^Name/).fill('Testperson Drei');
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await formular.getByRole('button', { name: f.senden }).click();
  const zusammenfassung = page.getByRole('alert').filter({ hasText: formulare.de.formulare.zusammenfassung });
  await expect(zusammenfassung).toBeVisible();
  await expect(zusammenfassung).toBeFocused();
  await expect(formular.getByLabel(/^E-Mail-Adresse/)).toHaveAttribute('aria-invalid', 'true');
  await expect(formular.getByLabel(/^Name/)).toHaveValue('Testperson Drei');
  // Sprungverweis führt zum Feld
  await zusammenfassung.getByRole('link', { name: /^E-Mail-Adresse/ }).click();
  await expect(formular.getByLabel(/^E-Mail-Adresse/)).toBeFocused();
  // Barrierefreiheit des Formulars im Fehlerzustand (kein Beispieltermin zeigt das Formular, T5)
  const axe = await new AxeBuilder({ page })
    .include('#anmeldung')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Erste Anmeldung ohne Neuladen: ALTCHA löst eine neue Aufgabe (Lösungen sind einmalig), Erfolg + beide Mails
  const person1 = `testperson.${randomBytes(4).toString('hex')}@example.test`;
  await anmelden(page, 'Testperson Drei', person1);
  await mailAn(person1, new RegExp(`Ihre Anmeldung: ${titel}`));
  await mailAn(verwaltung, /^Neuer Eingang: Anmeldung$/);

  // Platzzahl sofort aktualisiert (Tag anmeldungen:<id>)
  await expect(async () => {
    await page.reload();
    await expect(page.locator('#anmeldung').getByText('Noch 1 Platz frei.')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 12_000 });

  // Zweite Anmeldung belegt den letzten Platz → ausgebucht, kein Formular mehr
  await anmelden(page, 'Testperson Vier', `testperson.${randomBytes(4).toString('hex')}@example.test`);
  await expect(async () => {
    await page.reload();
    await expect(page.locator('#anmeldung').getByText(de.veranstaltung.ausgebucht, { exact: true })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 12_000 });
  await expect(page.locator('#anmeldung form')).toHaveCount(0);
  await expect(page.getByRole('link', { name: de.veranstaltung.jetztAnmelden })).toHaveCount(0);

  // Keine CSP-Verstöße (ALTCHA-Worker, Inline-Stile) und keine Konsolenfehler
  expect(fehlend).toEqual([]);
  expect(konsole.filter((k) => !k.includes('favicon'))).toEqual([]);
});
