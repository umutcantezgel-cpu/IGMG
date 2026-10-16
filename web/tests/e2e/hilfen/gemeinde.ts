import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import kontoTexte from '../../../messages/bereiche/konto.json';
import meinTexte from '../../../messages/bereiche/mein-bereich.json';

/**
 * Zugänge der Gemeinde-Plattform für E2E (wie mein-bereich-lernen.spec.ts): `scripts/beispielkonten.ts` mit eigenem
 * Präfix legt Eltern, Lehrkraft, Aufsicht, drei Kinder und eine Beispielgruppe mit Chat (08–20 Uhr) an. Gegen einen
 * Entwicklungsserver mit PGlite die Datei vorher anlegen und mit E2E_BEISPIELKONTEN=<pfad> übergeben.
 */
export type Zugaenge = {
  lehrkraft: { email: string; passwort: string | null };
  aufsicht: { email: string; passwort: string | null };
  eltern: { email: string; passwort: string | null };
  kind: { benutzername: string; passwort: string | null };
  lernplattform: { gruppeId: string; gruppe: string; kinder: Record<'emre' | 'zeynep' | 'yunus', { id: string; name: string }> };
};

const k = kontoTexte.de.konto;
const m = meinTexte.de.meinBereich;

export function beispielkonten(): Zugaenge {
  if (process.env.E2E_BEISPIELKONTEN) return JSON.parse(readFileSync(process.env.E2E_BEISPIELKONTEN, 'utf8')) as Zugaenge;
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
      randomBytes(4).toString('hex'),
      '--json',
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
  return JSON.parse(ausgabe.trim().split('\n').pop() ?? '{}') as Zugaenge;
}

export const passwort = (p: string | null) => p ?? process.env.BEISPIEL_PASSWORT ?? '';

/** Anmeldung mit E-Mail und Passwort auf /anmelden (Erwachsene). */
export async function emailAnmelden(page: Page, email: string, pw: string) {
  await page.goto('/anmelden');
  await page.getByLabel(k.felder.email).fill(email);
  await page.getByLabel(k.felder.passwort, { exact: true }).filter({ visible: true }).fill(pw);
  await page.getByRole('button', { name: k.anmelden.absenden, exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/mein-bereich/);
}

/** Erste Anmeldung von Lehrkraft oder Aufsicht: zweiter Faktor ist Pflicht und wird hier eingerichtet. */
export async function leitungAnmelden(page: Page, zugang: { email: string; passwort: string | null }) {
  await emailAnmelden(page, zugang.email, passwort(zugang.passwort));
  await expect(page).toHaveURL(/\/mein-bereich\/konto\?faktor=pflicht$/);
  await page.getByLabel(m.konto.zweiFaktor.schritt1).fill(passwort(zugang.passwort));
  await page.getByRole('button', { name: m.konto.zweiFaktor.weiter }).click();
  const geheimnis = (await page.getByTestId('totp-geheimnis').innerText()).trim();
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(geheimnis), digits: 6, period: 30 });
  await page.getByLabel(m.konto.zweiFaktor.code).fill(totp.generate());
  await page.getByRole('button', { name: m.konto.zweiFaktor.bestaetigen }).click();
  await expect(page).toHaveURL(/faktor=eingerichtet/);
}

/** Anmeldung eines Kindes mit Benutzername (Reiter „Kinder“). */
export async function kindAnmelden(page: Page, zugang: { benutzername: string; passwort: string | null }) {
  await page.goto('/anmelden?zugang=kind');
  await page.getByLabel(k.felder.benutzername).fill(zugang.benutzername);
  await page.locator('#kinder-passwort').fill(passwort(zugang.passwort));
  await page.getByRole('button', { name: k.kinder.absenden }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/mein-bereich$/);
}
