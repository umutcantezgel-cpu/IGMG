// T6 für die Verwaltung: legt per Einladung ein Testkonto an (G-04: „Testperson Eins“, @example.test), richtet TOTP ein,
// meldet sich an und fotografiert die angegebenen Verwaltungsseiten bei 390 und 1440 px (ganze Seite).
// Aufruf (im Ordner web/, DATABASE_URL = Datenbank des laufenden Servers):
//   node ../_lauf/werkzeuge/verwaltung-bilder.mjs <basis-url> <ausgabe-ordner> <pfad>[=name] …
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const web = createRequire(join(process.cwd(), 'package.json'));
const { chromium } = web('playwright');
const OTPAuth = web('otpauth');
const [basis, aus, ...pfade] = process.argv.slice(2);
await mkdir(aus, { recursive: true });

const email = `testperson.${randomBytes(4).toString('hex')}@example.test`;
const token = execFileSync('pnpm', ['-s', 'verwaltung:einladen', '--email', email, '--name', 'Testperson Eins', '--rolle', 'administration', '--nur_token'], {
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .pop();
const PASSWORT = `Testpasswort-${randomBytes(6).toString('hex')}`;

const browser = await chromium.launch();
const anmelde = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', timezoneId: 'Europe/Berlin' });
const s = await anmelde.newPage();
await s.goto(`${basis}/verwaltung/einladung/${token}`);
await s.getByLabel('Neues Passwort').filter({ visible: true }).fill(PASSWORT);
await s.getByLabel('Passwort wiederholen').filter({ visible: true }).fill(PASSWORT);
await s.getByRole('button', { name: 'Konto anlegen' }).click();
await s.waitForURL(/\/verwaltung\/anmelden\?eingeladen=1$/);
await s.getByLabel('E-Mail').filter({ visible: true }).fill(email);
await s.getByLabel('Passwort', { exact: true }).filter({ visible: true }).fill(PASSWORT);
await s.getByRole('button', { name: 'Anmelden' }).click();
await s.waitForURL(/\/verwaltung\/zwei-faktor$/);
await s.getByLabel('Schritt 1: Passwort bestätigen').filter({ visible: true }).fill(PASSWORT);
await s.getByRole('button', { name: 'Weiter' }).click();
const geheimnis = (await s.getByTestId('totp-geheimnis').innerText()).trim();
const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(geheimnis), digits: 6, period: 30 });
await s.getByLabel('Schritt 3: Code eingeben').filter({ visible: true }).fill(totp.generate());
await s.getByRole('button', { name: 'Einrichtung abschließen' }).click();
await s.waitForURL(/\/verwaltung$/);
const zustand = await anmelde.storageState();
await anmelde.close();

for (const eintrag of pfade) {
  const [pfad, name = pfad.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'verwaltung'] = eintrag.split('=');
  for (const breite of [390, 1440]) {
    const kontext = await browser.newContext({ viewport: { width: breite, height: 900 }, storageState: zustand, reducedMotion: 'reduce', locale: 'de-DE', timezoneId: 'Europe/Berlin' });
    const seite = await kontext.newPage();
    const fehler = [];
    seite.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
    await seite.goto(basis + pfad, { waitUntil: 'networkidle' });
    await seite.evaluate(() => document.fonts.ready);
    await seite.screenshot({ path: join(aus, `${name}__${breite}.png`), fullPage: true });
    if (fehler.length) console.log(`${name} ${breite}: ${fehler.join(' | ').slice(0, 300)}`);
    await kontext.close();
  }
}
await browser.close();
console.log('fertig');
