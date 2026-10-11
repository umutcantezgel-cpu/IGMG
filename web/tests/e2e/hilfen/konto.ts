import { expect, type Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import { erzeugeEinladung, TESTPASSWORT } from './einladung';

/**
 * Legt per Einladung ein Testkonto an, richtet TOTP ein und meldet es an (G-04: nur Testdaten).
 * Ergebnis: angemeldete Seite auf /verwaltung.
 */
export async function angemeldetesKonto(page: Page, rolle = 'administration', organisation?: string) {
  const { email, token } = erzeugeEinladung(rolle, organisation);
  await page.goto(`/verwaltung/einladung/${token}`);
  await page.getByLabel('Neues Passwort').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByLabel('Passwort wiederholen').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Konto anlegen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/anmelden\?eingeladen=1$/);
  await page.getByLabel('E-Mail').filter({ visible: true }).fill(email);
  await page.getByLabel('Passwort', { exact: true }).filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/zwei-faktor$/);
  await page.getByLabel('Schritt 1: Passwort bestätigen').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Weiter' }).click();
  const geheimnis = (await page.getByTestId('totp-geheimnis').innerText()).trim();
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(geheimnis), digits: 6, period: 30 });
  await page.getByLabel('Schritt 3: Code eingeben').filter({ visible: true }).fill(totp.generate());
  await page.getByRole('button', { name: 'Einrichtung abschließen' }).click();
  await expect(page).toHaveURL(/\/verwaltung$/);
  return { email, totp };
}
