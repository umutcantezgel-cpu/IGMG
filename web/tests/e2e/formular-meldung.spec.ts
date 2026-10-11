import { randomBytes } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import formulare from '../../messages/bereiche/formulare.json';
import meldung from '../../messages/bereiche/meldung.json';
import { angemeldetesKonto } from './hilfen/konto';

/**
 * C10b (E-034, E-037, Z-05, K-07, ADR 0005): öffentliche Meldung auf /meldung – ALTCHA im Browser unter der öffentlichen
 * CSP, Ticket in der Verwaltung, Benachrichtigung an die Administration ohne Formulardaten und Bestätigung an die Person
 * (Mailpit). Nach einem Fehler: Fokus auf der Zusammenfassung, Sprungverweis zum Feld, zweiter Versuch ohne Neuladen.
 * Nur Desktop (Formular-Ratenlimit).
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const f = meldung.de.meldung;
const fo = formulare.de.formulare;

type MailpitTreffer = { messages?: { ID: string; Subject: string; To: { Address: string }[] }[] };

/** Wartet, bis Mailpit eine Mail an `an` mit passendem Betreff hat (Versand läuft nach der Antwort, `after()`). */
async function mailAn(an: string, betreff: RegExp) {
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as MailpitTreffer).messages ?? [];
    expect(treffer.some((m) => betreff.test(m.Subject))).toBe(true);
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
}

/** Text der ersten Mail an `an` mit passendem Betreff (Mailpit-API: Nachricht je Kennung). */
async function mailText(an: string, betreff: RegExp): Promise<string> {
  let text = '';
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const mail = ((await r.json()) as MailpitTreffer).messages?.find((m) => betreff.test(m.Subject));
    expect(mail).toBeDefined();
    const nachricht = (await (await fetch(`${MAILPIT}/api/v1/message/${mail?.ID}`)).json()) as { Text: string };
    text = nachricht.Text;
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
  return text;
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Formular- und Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

test('Meldung: Fehler mit Sprungverweis, zweiter Versuch ohne Neuladen, Ticket in der Verwaltung und Mails in Mailpit', async ({
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

  await page.goto('/meldung');
  await expect(page.getByRole('heading', { level: 1, name: f.titel, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: f.titelFormular, exact: true })).toBeVisible();
  const formular = page.locator('#meldung form');
  const vorname = formular.getByRole('textbox', { name: /^Vorname/ });
  const meldungstyp = formular.getByRole('combobox', { name: /^Meldungstyp/ });

  // Absenden mit fehlenden Angaben → Zusammenfassung mit Fokus, Feldfehler, Eingaben bleiben erhalten
  await vorname.fill('Testperson Drei');
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await formular.getByRole('button', { name: f.senden, exact: true }).click();
  const zusammenfassung = page.getByRole('alert').filter({ hasText: fo.zusammenfassung });
  await expect(zusammenfassung).toBeVisible();
  await expect(zusammenfassung).toBeFocused();
  await expect(meldungstyp).toHaveAttribute('aria-invalid', 'true');
  await expect(vorname).toHaveValue('Testperson Drei');
  // Sprungverweis führt zum Feld
  await zusammenfassung.getByRole('link', { name: /^Meldungstyp/ }).click();
  await expect(meldungstyp).toBeFocused();
  // Barrierefreiheit des Formulars im Fehlerzustand
  const axe = await new AxeBuilder({ page })
    .include('#meldung')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);

  // Zweiter Versuch ohne Neuladen: ALTCHA löst eine neue Aufgabe, Erfolg, Ticket und beide Mails
  const person = `testperson.${randomBytes(4).toString('hex')}@example.test`;
  const betreff = 'Testbetreff aus dem End-to-End-Test';
  const nachricht = 'Testmeldung aus dem End-to-End-Test.';
  await meldungstyp.selectOption('wunsch');
  await formular.getByRole('textbox', { name: /^Betreff/ }).fill(betreff);
  await formular.getByRole('textbox', { name: /^Nachricht/ }).fill(nachricht);
  await formular.getByRole('textbox', { name: /^Nachname/ }).fill('Eins');
  await formular.getByRole('radio', { name: 'Ja', exact: true }).check();
  await formular.getByRole('radio', { name: 'E-Mail', exact: true }).check();
  await formular.getByRole('textbox', { name: /^E-Mail/ }).fill(person);
  await formular.getByRole('checkbox', { name: /^Ich willige ein/ }).check();
  await expect(formular.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: 20_000 });
  await formular.getByRole('button', { name: f.senden, exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: f.erfolg.titel, exact: true })).toBeVisible();
  await expect(page.getByText(f.erfolg.mitBestaetigung)).toBeVisible();
  await mailAn(person, /^Ihre Meldung an die IGMG Wetzlar$/);
  await mailAn(verwaltung, /^Neuer Eingang: Meldung$/);

  // Das Ticket liegt in der Verwaltung; die Benachrichtigung enthält keine Formulardaten (ADR 0005)
  const benachrichtigung = await mailText(verwaltung, /^Neuer Eingang: Meldung$/);
  expect(benachrichtigung).not.toContain('Testperson Drei');
  expect(benachrichtigung).not.toContain(person);
  expect(benachrichtigung).not.toContain(nachricht);
  await page.goto('/verwaltung/tickets');
  await expect(page.getByRole('row').filter({ hasText: betreff })).toBeVisible();

  // Keine CSP-Verstöße (ALTCHA-Worker, Inline-Stile) und keine Konsolenfehler
  expect(fehlend).toEqual([]);
  expect(konsole.filter((k) => !k.includes('favicon'))).toEqual([]);
});
