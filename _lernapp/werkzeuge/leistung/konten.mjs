#!/usr/bin/env node
// Anmeldungen für die Messung der Lern-App-Seiten in „Mein Bereich“ (L8-02): legt mit `scripts/beispielkonten.ts` (eigenes
// Präfix, nur Platzhalter-Namen, Adressen unter `.invalid`) Lehrkraft, Eltern, Kinder und eine Beispielgruppe in der
// Wegwerf-Datenbank an, erteilt die Einwilligung `lernapp` der Eltern für ein Kind (Testdaten wie gruppe.spec.ts) und meldet
// Lehrkraft (mit Einrichtung des zweiten Faktors), Eltern und Kind über die Anmeldeseiten an. Ergebnis: storageState je
// Konto und `konten.json` ({ lehrkraft, eltern, kind, gruppe, kindId }) im Ausgabeordner – Eingabe für routen.mjs.
// Umgebung: E2E_DATABASE_URL (Name endet auf `_e2e`), BEISPIEL_PASSWORT (nur im Speicher), Server mit PROXY_VERTRAUEN=1.
// Aufruf (im Ordner web/): node ../_lernapp/werkzeuge/leistung/konten.mjs
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as OTPAuth from 'otpauth';
import pg from 'pg';
import { BASIS, WEB, ZIEL, schreibe, starteBrowser } from './gemeinsam.mjs';

const ziel = process.env.E2E_DATABASE_URL ?? '';
if (!/\/[a-z_][a-z0-9_]*_e2e$/.test(ziel)) throw new Error('E2E_DATABASE_URL fehlt oder endet nicht auf _e2e (nur Wegwerf-Datenbank)');
if (!process.env.BEISPIEL_PASSWORT) throw new Error('BEISPIEL_PASSWORT fehlt');
const PW = process.env.BEISPIEL_PASSWORT;

const lies = (datei) => JSON.parse(readFileSync(join(WEB, 'messages', 'bereiche', datei), 'utf8'));
const k = lies('konto.json').de.konto;
const m = lies('mein-bereich.json').de.meinBereich;

// 1. Beispielkonten mit eigenem Präfix (Platzhalter-Namen)
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
  { cwd: WEB, encoding: 'utf8', env: { ...process.env, DATABASE_URL: ziel } },
);
const z = JSON.parse(ausgabe.trim().split('\n').pop() ?? '{}');
const kind = z.lernplattform.kinder.emre;

// 2. Einwilligung `lernapp` der Eltern für das Kind (Testdaten, G-04)
const client = new pg.Client({ connectionString: ziel });
await client.connect();
try {
  const { rows } = await client.query('select id from "user" where email = $1', [z.eltern.email]);
  if (!rows[0]) throw new Error('Elternkonto fehlt');
  await client.query(
    `insert into konto_einwilligung (lernende_id, art, text_version, erteilt_von)
     select $1, 'lernapp', 'messung-testdaten', $2
     where not exists (select 1 from konto_einwilligung where lernende_id = $1 and art = 'lernapp' and widerrufen_am is null)`,
    [kind.id, rows[0].id],
  );
} finally {
  await client.end();
}

// 3. Anmeldungen über die Seiten (je Konto eine eigene Absenderadresse aus dem Testnetz, wie hilfen/konto.ts)
const adresse = () => `198.18.${1 + Math.floor(Math.random() * 250)}.${1 + Math.floor(Math.random() * 250)}`;
const browser = await starteBrowser();
const zustand = {};
async function anmelden(name, ablauf) {
  const kontext = await browser.newContext({ baseURL: BASIS, extraHTTPHeaders: { 'x-forwarded-for': adresse() } });
  const seite = await kontext.newPage();
  seite.setDefaultTimeout(60_000);
  await ablauf(seite);
  zustand[name] = join(ZIEL, `zustand-${name}.json`);
  await kontext.storageState({ path: zustand[name] });
  await kontext.close();
}
async function emailAnmelden(seite, email) {
  await seite.goto('/anmelden');
  await seite.getByLabel(k.felder.email).fill(email);
  await seite.getByLabel(k.felder.passwort, { exact: true }).filter({ visible: true }).fill(PW);
  await seite.getByRole('button', { name: k.anmelden.absenden, exact: true }).filter({ visible: true }).click();
  await seite.waitForURL(/\/mein-bereich/);
}
try {
  await anmelden('lehrkraft', async (s) => {
    await emailAnmelden(s, z.lehrkraft.email);
    await s.waitForURL(/\/mein-bereich\/konto\?faktor=pflicht$/);
    await s.getByLabel(m.konto.zweiFaktor.schritt1).fill(PW);
    await s.getByRole('button', { name: m.konto.zweiFaktor.weiter }).click();
    const geheimnis = (await s.getByTestId('totp-geheimnis').innerText()).trim();
    const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(geheimnis), digits: 6, period: 30 });
    await s.getByLabel(m.konto.zweiFaktor.code).fill(totp.generate());
    await s.getByRole('button', { name: m.konto.zweiFaktor.bestaetigen }).click();
    await s.waitForURL(/faktor=eingerichtet/);
  });
  await anmelden('eltern', (s) => emailAnmelden(s, z.eltern.email));
  await anmelden('kind', async (s) => {
    await s.goto('/anmelden?zugang=kind');
    await s.getByLabel(k.felder.benutzername).fill(z.kind.benutzername);
    await s.locator('#kinder-passwort').fill(PW);
    await s.getByRole('button', { name: k.kinder.absenden }).filter({ visible: true }).click();
    await s.waitForURL(/\/mein-bereich$/);
  });
} finally {
  await browser.close();
}

const datei = schreibe('konten.json', { ...zustand, gruppe: z.lernplattform.gruppeId, kindId: kind.id, praefix });
console.log(`Anmeldungen bereit (Präfix ${praefix}): ${datei}`);
