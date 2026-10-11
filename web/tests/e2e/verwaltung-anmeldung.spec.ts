import { expect, test, type Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import { erzeugeEinladung, TESTPASSWORT } from './hilfen/einladung';

/**
 * Tor P2: „Anmelden mit Zwei-Faktor“ (K-06, Z-06). Ablauf: Einladung annehmen → anmelden →
 * Zwei-Faktor einrichten (Pflicht) → abmelden → erneut anmelden mit TOTP-Code.
 * Nur im Desktop-Projekt, damit die Ratenbegrenzung der Anmeldung nicht durch zwei Projekte ausgelöst wird.
 */
test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'Anmeldeablauf nur einmal je Lauf');
});

function sammleKonsolenfehler(seite: Page) {
  const fehler: string[] = [];
  seite.on('console', (m) => {
    if (m.type() === 'error') fehler.push(m.text());
  });
  seite.on('pageerror', (e) => fehler.push(String(e)));
  return fehler;
}

test('Öffentliche Registrierung über HTTP ist gesperrt', async ({ request }) => {
  const antwort = await request.post('/api/auth/sign-up/email', {
    data: { email: 'fremd@example.test', password: TESTPASSWORT, name: 'Fremd' },
    headers: { origin: 'http://localhost:3100' },
  });
  expect(antwort.status()).toBe(403);
});

test('Ohne Anmeldung führt die Verwaltung zur Anmeldeseite', async ({ page }) => {
  await page.goto('/verwaltung');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Anmelden' })).toBeVisible();
});

test('Ungültige Einladung zeigt eine Fehlermeldung', async ({ page }) => {
  await page.goto('/verwaltung/einladung/ungueltiges-token-0123456789abcdef');
  await expect(page.getByText('Diese Einladung ist ungültig oder abgelaufen.', { exact: false })).toBeVisible();
});

test('Einladung annehmen, Zwei-Faktor einrichten und mit TOTP anmelden', async ({ page }) => {
  const konsole = sammleKonsolenfehler(page);
  const { email, token } = erzeugeEinladung();

  // 1 Einladung annehmen
  await page.goto(`/verwaltung/einladung/${token}`);
  await page.getByLabel('Neues Passwort').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByLabel('Passwort wiederholen').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Konto anlegen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/anmelden\?eingeladen=1$/);
  await expect(page.getByRole('status')).toContainText('Ihr Konto ist angelegt');

  // Einladung ist nur einmal gültig
  await page.goto(`/verwaltung/einladung/${token}`);
  await expect(page.getByText('Diese Einladung ist ungültig oder abgelaufen.', { exact: false })).toBeVisible();

  // 2 Falsches Passwort → Fehlermeldung ohne Details
  await page.goto('/verwaltung/anmelden');
  await page.getByLabel('E-Mail').filter({ visible: true }).fill(email);
  await page.getByLabel('Passwort', { exact: true }).filter({ visible: true }).fill('falsches-passwort-123');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toContainText('E-Mail-Adresse oder Passwort ist nicht korrekt.');

  // 3 Anmelden → Zwei-Faktor-Einrichtung ist Pflicht
  await page.getByLabel('E-Mail').filter({ visible: true }).fill(email);
  await page.getByLabel('Passwort', { exact: true }).filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/zwei-faktor$/);
  // Übersicht ist ohne zweiten Faktor nicht erreichbar
  await page.goto('/verwaltung');
  await expect(page).toHaveURL(/\/verwaltung\/zwei-faktor$/);

  // 4 Einrichten: Passwort → Schlüssel → Code
  await page.getByLabel('Schritt 1: Passwort bestätigen').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Weiter' }).click();
  await expect(page.getByRole('img', { name: 'QR-Code zum Einrichten der Zwei-Faktor-Anmeldung' })).toBeVisible();
  const geheimnis = (await page.getByTestId('totp-geheimnis').innerText()).trim();
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(geheimnis), digits: 6, period: 30 });
  await page.getByLabel('Schritt 3: Code eingeben').filter({ visible: true }).fill(totp.generate());
  await page.getByRole('button', { name: 'Einrichtung abschließen' }).click();
  await expect(page).toHaveURL(/\/verwaltung$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Übersicht' })).toBeVisible();

  // 5 Abmelden (Kontomenü der Verwaltung, ADR 0016)
  await page.getByRole('button', { name: /Kontomenü öffnen/ }).click();
  await page.getByRole('menuitem', { name: 'Abmelden' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/anmelden\?abgemeldet=1$/);

  // 6 Erneut anmelden → Code verlangt; falscher Code abgelehnt; richtiger Code führt zur Übersicht
  await page.getByLabel('E-Mail').filter({ visible: true }).fill(email);
  await page.getByLabel('Passwort', { exact: true }).filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/anmelden\/zwei-faktor$/);
  await page.goto('/verwaltung');
  await expect(page).toHaveURL(/\/verwaltung\/anmelden$/);
  await page.goBack();
  await page.goto('/verwaltung/anmelden/zwei-faktor');
  await page.getByLabel('Code aus Ihrer Authentifizierungs-App').filter({ visible: true }).fill('000000');
  await page.getByRole('button', { name: 'Bestätigen' }).click();
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toContainText('Der Code ist nicht gültig.');
  await page.getByLabel('Code aus Ihrer Authentifizierungs-App').filter({ visible: true }).fill(totp.generate());
  await page.getByRole('button', { name: 'Bestätigen' }).click();
  await expect(page).toHaveURL(/\/verwaltung$/);
  await expect(page.getByText('Willkommen, Testperson Eins.')).toBeVisible();

  // Keine CSP- oder Laufzeitfehler (Nonce-CSP der Verwaltung, ADR 0012)
  expect(konsole.filter((f) => /Content Security Policy|Refused to/.test(f))).toEqual([]);
});
