import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import kontoTexte from '../../messages/bereiche/konto.json';
import kinderTexte from '../../messages/bereiche/kinder.json';
import meinTexte from '../../messages/bereiche/mein-bereich.json';
import { ALTCHA_MS } from './hilfen/altcha';
import { eigeneAbsenderAdresse } from './hilfen/konto';

/**
 * Gemeinde-Konten (ADR 0026, Paket O-A01/O-A02): Registrierung mit Bestätigungsmail (Mailpit) und Anmeldung,
 * Kinderzugang per Benutzername, Lehrkraft mit Pflicht-Einrichtung des zweiten Faktors und erneuter Anmeldung mit Code.
 * Unter der strikten Nonce-CSP der Konto-Seiten ohne Konsolenfehler.
 *
 * Voraussetzung: Funktion `konten` an (Server mit FUNKTION_KONTEN=an; Produktions-Build schaltet sie sonst aus) –
 * ist sie aus, liefert /anmelden 404 und die Tests werden übersprungen (mit Hinweis).
 * Kind und Lehrkraft entstehen über `scripts/beispielkonten.ts --praefix <zufall> --json` in der E2E-Datenbank.
 */
const MAILPIT = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
const k = kontoTexte.de.konto;
const m = meinTexte.de.meinBereich;
const lw = kinderTexte.de.lernweg;
const PASSWORT = 'Testpasswort-Gemeinde-2026';

type Zugaenge = {
  lehrkraft: { email: string; passwort: string };
  kind: { benutzername: string; passwort: string };
};

/** Beispielkonten mit eigenem Präfix je Lauf (Passwörter zufällig, nur in diesem Prozess). */
function beispielkonten(): Zugaenge {
  const praefix = randomBytes(4).toString('hex');
  const ausgabe = execFileSync(
    'pnpm',
    [
      '-s',
      'exec',
      'tsx',
      '--conditions=react-server',
      '--env-file-if-exists=.env',
      'scripts/beispielkonten.ts',
      '--praefix',
      praefix,
      '--json',
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
  return JSON.parse(ausgabe.trim().split('\n').pop() ?? '{}') as Zugaenge;
}

function sammleKonsolenfehler(page: Page): string[] {
  const fehler: string[] = [];
  page.on('console', (n) => n.type() === 'error' && fehler.push(n.text()));
  page.on('pageerror', (e) => fehler.push(String(e)));
  return fehler;
}

async function emailAnmelden(page: Page, email: string, passwort: string) {
  await page.goto('/anmelden');
  await page.getByLabel(k.felder.email).fill(email);
  await page.getByLabel(k.felder.passwort, { exact: true }).filter({ visible: true }).fill(passwort);
  await page.getByRole('button', { name: k.anmelden.absenden, exact: true }).filter({ visible: true }).click();
}

async function abmelden(page: Page) {
  await page.getByRole('button', { name: m.nav.abmelden }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/anmelden\?hinweis=abgemeldet$/);
}

test.beforeEach(async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop', 'Anmeldeabläufe nur einmal je Lauf');
  const antwort = await request.get('/anmelden');
  test.skip(antwort.status() === 404, 'Funktion „konten“ ist aus – E2E-Server mit FUNKTION_KONTEN=an starten');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
  await eigeneAbsenderAdresse(page);
});

test('Gemeinde: registrieren → Adresse bestätigen (Mail) → anmelden → Mein Bereich → abmelden', async ({ page }) => {
  test.setTimeout(150_000);
  const fehler = sammleKonsolenfehler(page);
  const email = `testperson.${randomBytes(4).toString('hex')}@example.test`;

  await page.goto('/registrieren');
  await expect(page.getByRole('heading', { level: 1, name: k.registrieren.titel })).toBeVisible();
  await page.getByLabel(k.felder.name).fill('Testperson Eins');
  await page.getByLabel(k.felder.email).fill(email);
  await page.getByLabel(k.felder.passwortNeu, { exact: true }).fill(PASSWORT);
  // Nur die Einwilligung: Das ALTCHA-Widget bringt nach der ersten Eingabe ein eigenes Kontrollkästchen mit
  await page.locator('#registrieren-einwilligung').check();
  await expect(page.locator('input[name="altcha"]')).not.toHaveValue('', { timeout: ALTCHA_MS });
  await page.getByRole('button', { name: k.registrieren.absenden }).click();
  await expect(page.getByRole('heading', { name: k.registrieren.erfolgTitel })).toBeVisible();

  // Link aus der Mail „Adresse bestätigen“ (Mailpit)
  let link = '';
  await expect(async () => {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`);
    const treffer = ((await r.json()) as { messages?: { ID: string; Subject: string }[] }).messages ?? [];
    const mail = treffer.find((x) => x.Subject === k.mails.bestaetigen.betreff);
    expect(mail).toBeTruthy();
    const text = ((await (await fetch(`${MAILPIT}/api/v1/message/${mail!.ID}`)).json()) as { Text: string }).Text;
    // Die Mail enthält keine Daten außer dem Link
    expect(text).not.toContain('Testperson');
    link = text.match(/https?:\/\/\S+\/konto\/bestaetigen\?token=[A-Za-z0-9_-]+/)?.[0] ?? '';
    expect(link).not.toBe('');
  }).toPass({ timeout: 30_000, intervals: [500, 1000, 2000] });

  // Vor der Bestätigung: keine Anmeldung
  await emailAnmelden(page, email, PASSWORT);
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toContainText(k.anmelden.unbestaetigt);

  await page.goto(new URL(link).pathname + new URL(link).search);
  // Seit S1 H-2 bestätigt nur, wer das Passwort der Registrierung kennt (vorbelegte Registrierungen)
  await page.getByLabel(k.bestaetigen.passwort, { exact: true }).fill(PASSWORT);
  await page.getByRole('button', { name: k.bestaetigen.absenden }).click();
  await expect(page).toHaveURL(/\/anmelden\?hinweis=bestaetigt$/);
  await expect(page.getByText(k.hinweis.bestaetigt)).toBeVisible();

  await emailAnmelden(page, email, PASSWORT);
  await expect(page).toHaveURL(/\/mein-bereich$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Willkommen, Testperson' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: m.nav.label })).toBeVisible();
  // Noch nicht gebaute Bereiche sind kein Link (Gemeinde hat keine) – Konto-Seite erreichbar
  await page.getByRole('link', { name: m.nav.konto, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: m.konto.titel })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: m.konto.zweiFaktor.titel })).toBeVisible();
  await abmelden(page);
  await page.goto('/mein-bereich');
  await expect(page).toHaveURL(/\/anmelden$/);

  expect(fehler.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Kinderzugang: Anmeldung mit Benutzername, Mein Bereich mit Lernweg (mit Funktion „lernplattform“)', async ({ page }) => {
  test.setTimeout(120_000);
  const fehler = sammleKonsolenfehler(page);
  const { kind } = beispielkonten();
  await page.goto('/anmelden?zugang=kind');
  await expect(page.getByRole('tab', { name: k.anmelden.reiter.kinder })).toHaveAttribute('aria-selected', 'true');
  // Falsches Passwort: allgemeine Meldung
  await page.getByLabel(k.felder.benutzername).fill(kind.benutzername);
  await page.locator('#kinder-passwort').fill('Falsches-Passwort-123');
  await page.getByRole('button', { name: k.kinder.absenden }).filter({ visible: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toContainText(k.kinder.fehler);
  // Richtig (Großschreibung egal)
  await page.getByLabel(k.felder.benutzername).fill(kind.benutzername.toUpperCase());
  await page.locator('#kinder-passwort').fill(kind.passwort);
  await page.getByRole('button', { name: k.kinder.absenden }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/mein-bereich$/);
  await expect(page.getByRole('heading', { level: 1, name: /^Willkommen, Emre/ })).toBeVisible();
  // Lernweg (B-24) als Abschnitt der Startseite – nur mit Funktion „lernplattform“, sonst verschwindet er ganz (ADR 0035)
  const lernweg = page.getByRole('heading', { level: 2, name: lw.titel, exact: true });
  if (await page.getByRole('navigation', { name: m.nav.label }).getByRole('link', { name: m.nav.lernweg }).count()) {
    await expect(lernweg).toBeVisible();
  } else {
    await expect(lernweg).toHaveCount(0);
  }
  // Kinder: keine Benachrichtigungen, kein zweiter Faktor, keine Passkeys
  await expect(page.getByRole('navigation', { name: m.nav.label }).getByRole('link', { name: m.nav.benachrichtigungen })).toHaveCount(0);
  await page.goto('/mein-bereich/konto');
  await expect(page.getByRole('heading', { level: 2, name: m.konto.zweiFaktor.titel })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: m.konto.passkeys.titel })).toHaveCount(0);
  await abmelden(page);
  expect(fehler.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Lehrkraft: zweiter Faktor ist Pflicht (Einrichtung), danach Anmeldung nur mit Code', async ({ page }) => {
  test.setTimeout(150_000);
  const fehler = sammleKonsolenfehler(page);
  const { lehrkraft } = beispielkonten();

  await emailAnmelden(page, lehrkraft.email, lehrkraft.passwort);
  await expect(page).toHaveURL(/\/mein-bereich\/konto\?faktor=pflicht$/);
  await expect(page.getByRole('heading', { level: 1, name: m.konto.pflicht.titel })).toBeVisible();
  // Andere Bereiche führen zurück zur Einrichtung
  await page.goto('/mein-bereich/lesezeichen');
  await expect(page).toHaveURL(/\/mein-bereich\/konto\?faktor=pflicht$/);

  await page.getByLabel(m.konto.zweiFaktor.schritt1).fill(lehrkraft.passwort);
  await page.getByRole('button', { name: m.konto.zweiFaktor.weiter }).click();
  await expect(page.getByRole('img', { name: m.konto.zweiFaktor.qrAlt })).toBeVisible();
  const geheimnis = (await page.getByTestId('totp-geheimnis').innerText()).trim();
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(geheimnis), digits: 6, period: 30 });
  await page.getByLabel(m.konto.zweiFaktor.code).fill(totp.generate());
  await page.getByRole('button', { name: m.konto.zweiFaktor.bestaetigen }).click();
  await expect(page).toHaveURL(/\/mein-bereich\/konto\?faktor=eingerichtet$/);
  await expect(page.getByText(m.konto.zweiFaktor.eingerichtet)).toBeVisible();
  // Pflicht: kein Abschalten
  await expect(page.getByText(m.konto.zweiFaktor.pflicht)).toBeVisible();
  await page.goto('/mein-bereich');
  // Kachel „Unterricht“ nur mit Funktion „lernplattform“ (ADR 0035), sonst die Konto-Kachel
  const unterricht = await page.getByRole('navigation', { name: m.nav.label }).getByRole('link', { name: m.nav.unterricht }).count();
  await expect(page.getByText(unterricht ? m.kachel.unterricht.text : m.kachel.konto.text)).toBeVisible();

  await abmelden(page);
  await emailAnmelden(page, lehrkraft.email, lehrkraft.passwort);
  await expect(page).toHaveURL(/\/anmelden\?schritt=zwei-faktor$/);
  await page.getByLabel(k.zweiFaktor.code).fill('000000');
  await page.getByRole('button', { name: k.zweiFaktor.absenden }).click();
  await expect(page.getByText(k.zweiFaktor.fehler)).toBeVisible();
  await page.getByLabel(k.zweiFaktor.code).fill(totp.generate());
  await page.getByRole('button', { name: k.zweiFaktor.absenden }).click();
  await expect(page).toHaveURL(/\/mein-bereich$/);

  expect(fehler.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});

test('Konto-Seiten: Verwaltungsanmeldung verlinkt, no-store, noindex, Nonce-CSP', async ({ page }) => {
  await page.goto('/anmelden');
  await expect(page.getByRole('link', { name: k.anmelden.verwaltung })).toHaveAttribute('href', '/verwaltung/anmelden');
  const antwort = await page.request.get('/anmelden');
  expect(antwort.headers()['cache-control']).toContain('no-store');
  expect(antwort.headers()['x-robots-tag']).toContain('noindex');
  expect(antwort.headers()['content-security-policy']).toMatch(/script-src 'self' 'nonce-/);
});
