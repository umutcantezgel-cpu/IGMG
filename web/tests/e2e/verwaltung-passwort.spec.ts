import { expect, test } from '@playwright/test';
import de from '../../messages/de.json';
import { angemeldetesKonto, eigeneAbsenderAdresse } from './hilfen/konto';

/**
 * Passwort vergessen (C12, M-092): Link per Mail (Mailpit), neues Passwort, danach Anmeldung nur mit zweitem Faktor;
 * unbekannte Adresse bekommt dieselbe Antwort; ein Link gilt nur einmal.
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const v = de.verwaltung;

test.beforeEach(async ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'Anmeldeabläufe nur einmal je Lauf');
});

async function linkAusMail(an: string): Promise<string> {
  let link = '';
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${an}"`)}`);
    const treffer = ((await r.json()) as { messages?: { ID: string; Subject: string }[] }).messages ?? [];
    const mail = treffer.find((m) => m.Subject === v.mails.passwort.betreff);
    expect(mail).toBeTruthy();
    const text = ((await (await fetch(`${MAILPIT}/api/v1/message/${mail!.ID}`)).json()) as { Text: string }).Text;
    link = text.match(/https?:\/\/\S+\/api\/auth\/reset-password\/[^\s)\]]+/)?.[0] ?? '';
    expect(link).not.toBe('');
  }).toPass({ timeout: 20_000, intervals: [500, 1000, 2000] });
  return link;
}

test('Passwort vergessen → Link → neues Passwort → Anmeldung mit TOTP', async ({ page, browser }) => {
  test.setTimeout(150_000);
  const { email, totp } = await angemeldetesKonto(page, 'redaktion');
  const kontext = await browser.newContext();
  const seite = await kontext.newPage();
  await eigeneAbsenderAdresse(seite);

  // Unbekannte Adresse: dieselbe Antwort
  await seite.goto('/verwaltung/anmelden');
  await seite.getByRole('link', { name: v.anmelden.passwortVergessen }).click();
  await expect(seite.getByRole('heading', { level: 1, name: v.passwortVergessen.titel })).toBeVisible();
  await seite.getByLabel(/^E-Mail-Adresse/).fill('niemand@example.test');
  await seite.getByRole('button', { name: v.passwortVergessen.absenden }).click();
  await expect(seite.getByText(v.passwortVergessen.gesendet)).toBeVisible();

  // Bekannte Adresse: Link per Mail
  await seite.goto('/verwaltung/passwort-vergessen');
  await seite.getByLabel(/^E-Mail-Adresse/).fill(email);
  await seite.getByRole('button', { name: v.passwortVergessen.absenden }).click();
  await expect(seite.getByText(v.passwortVergessen.gesendet)).toBeVisible();
  const link = await linkAusMail(email);
  await seite.goto(link);
  await expect(seite).toHaveURL(/\/verwaltung\/passwort-neu\?token=/);
  await seite.getByLabel(/^Neues Passwort \(/).fill('Ganz-neues-Testpasswort-2026');
  await seite.getByLabel(/^Neues Passwort wiederholen/).fill('Ganz-neues-Testpasswort-2026');
  await seite.getByRole('button', { name: v.passwortNeu.absenden }).click();
  await expect(seite).toHaveURL(/\/verwaltung\/anmelden\?passwort=neu$/);
  await expect(seite.getByText(v.anmelden.passwortNeu)).toBeVisible();

  // Anmelden: neues Passwort, dann zweiter Faktor
  await seite.getByLabel('E-Mail').filter({ visible: true }).fill(email);
  await seite.getByLabel('Passwort', { exact: true }).filter({ visible: true }).fill('Ganz-neues-Testpasswort-2026');
  await seite.getByRole('button', { name: 'Anmelden' }).click();
  await expect(seite).toHaveURL(/\/verwaltung\/anmelden\/zwei-faktor$/);
  await seite.getByLabel('Code aus Ihrer Authentifizierungs-App').filter({ visible: true }).fill(totp.generate());
  await seite.getByRole('button', { name: 'Bestätigen' }).click();
  await expect(seite).toHaveURL(/\/verwaltung$/);

  // Derselbe Link gilt nicht noch einmal
  await seite.goto(link);
  await expect(seite.getByText(v.passwortNeu.ungueltig)).toBeVisible();
  await kontext.close();
});
