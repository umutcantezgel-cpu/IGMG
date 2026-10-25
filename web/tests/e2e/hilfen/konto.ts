import { expect, type Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import { erzeugeEinladung, TESTPASSWORT } from './einladung';
import { schutzrolleWirksam } from './schutzrolle';

/**
 * Eigene Absender-Adresse je Test (`x-forwarded-for`, Testnetz 198.18.0.0/15): Die Anmeldegrenzen (5 je Minute und IP,
 * `src/lib/auth/optionen.ts`) und die Formular-Ratenbegrenzung gelten dann je Test – nicht für den ganzen Lauf mit
 * zwei parallelen Workern. Die Regeln selbst bleiben unverändert.
 */
export async function eigeneAbsenderAdresse(page: Page) {
  const b = () => Math.floor(Math.random() * 254) + 1;
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `198.${18 + (b() % 2)}.${b()}.${b()}` });
}

/**
 * Legt per Einladung ein Testkonto an, richtet TOTP ein und meldet es an (G-04: nur Testdaten).
 * `nachAnlegen` läuft nach dem Annehmen der Einladung und vor der ersten Anmeldung (z. B. Testdaten zur Rolle). Die Rolle
 * „religiöse Prüfung“ ist Schutzrolle (Stufe C N2): Die Annahme ergibt nur einen Antrag; ohne eigenes `nachAnlegen` macht
 * ihn die Testdaten-Hilfe sofort wirksam (G-04; den Ablauf mit zweiter Person prüft
 * `tests/integration/sicherheit-n2-religioese-pruefung.test.ts`).
 * Ergebnis: angemeldete Seite auf /verwaltung (`ziel`: andere Startseite der Rolle, z. B. die Sprachprüfung der Lern-App).
 */
export async function angemeldetesKonto(
  page: Page,
  rolle = 'administration',
  organisation?: string,
  nachAnlegen?: (email: string) => Promise<void>,
  ziel: RegExp = /\/verwaltung$/,
) {
  await eigeneAbsenderAdresse(page);
  const { email, token } = erzeugeEinladung(rolle, organisation);
  await page.goto(`/verwaltung/einladung/${token}`);
  await page.getByLabel('Neues Passwort').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByLabel('Passwort wiederholen').filter({ visible: true }).fill(TESTPASSWORT);
  await page.getByRole('button', { name: 'Konto anlegen' }).click();
  await expect(page).toHaveURL(/\/verwaltung\/anmelden\?eingeladen=1$/);
  if (nachAnlegen) await nachAnlegen(email);
  else if (rolle === 'religioese_pruefung') await schutzrolleWirksam(email, rolle);
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
  await expect(page).toHaveURL(ziel);
  return { email, totp };
}
