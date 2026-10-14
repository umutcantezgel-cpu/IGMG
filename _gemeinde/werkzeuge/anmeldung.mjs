#!/usr/bin/env node
// Prüfwerkzeug (Schritt 7): Testkonto (Attrappe) für die Verwaltung und Anmeldung mit Zwei-Faktor gegen den lokalen Server.
// Nur Testdaten (G-04): Standard-E-Mail pruefer@example.test. Kein Versand, keine echten Daten.
//
//   node anmeldung.mjs einladen [--email pruefer@example.test]
//       Legt eine Einladung direkt in der PGlite-Datenbank des Servers an. Verlangt, dass der Server GESTOPPT ist
//       (PGlite erlaubt nur einen Prozess je Datenbankordner). Schreibt Einladung nach SCRATCHPAD/verwaltung-einladung.json.
//   node anmeldung.mjs anmelden [--basis URL]
//       Server läuft: öffnet den Einladungslink, legt Passwort fest, richtet TOTP ein (Code aus dem Geheimnis),
//       meldet an und schreibt den Anmeldezustand nach SCRATCHPAD/verwaltung-state.json (storageState).
//
// Ablauf: server-starten.sh stop → anmeldung.mjs einladen → server-starten.sh start → anmeldung.mjs anmelden
// Datenbank-Ordner: DB_VERZEICHNIS (Standard: SCRATCHPAD/basis-standalone/.pglite-bau).
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { SCRATCHPAD, basisAdresse, hilfeAusgeben, neuerKontext, starteBrowser } from './hilfen.mjs';

const HILFE = `Aufruf:
  node anmeldung.mjs einladen [--email pruefer@example.test]   (Server gestoppt)
  node anmeldung.mjs anmelden [--basis URL]                    (Server läuft)`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    email: { type: 'string', default: 'pruefer@example.test' },
    basis: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || positionals.length === 0) hilfeAusgeben(HILFE);

const befehl = positionals[0];
const basis = basisAdresse(values.basis);
const DB_VERZEICHNIS = process.env.DB_VERZEICHNIS ?? join(SCRATCHPAD, 'basis-standalone', '.pglite-bau');
const EINLADUNG = join(SCRATCHPAD, 'verwaltung-einladung.json');
const ZUSTAND = join(SCRATCHPAD, 'verwaltung-state.json');
const PASSWORT = 'Testpasswort-Eins-2026';
const NAME = 'Prüfer Testkonto';

/** RFC 6238, 6 Stellen, 30 s, SHA-1 (wie otpauth im Projekt). */
function base32Dekodiere(text) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let wert = 0;
  const ausgabe = [];
  for (const zeichen of text.replace(/[\s=]/g, '').toUpperCase()) {
    const index = alphabet.indexOf(zeichen);
    if (index < 0) throw new Error(`Ungültiges Base32-Zeichen im Geheimnis: ${zeichen}`);
    wert = ((wert << 5) | index) & 0xffff;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      ausgabe.push((wert >>> bits) & 0xff);
      wert &= (1 << bits) - 1;
    }
  }
  return Buffer.from(ausgabe);
}

function totpCode(geheimnis, zeitpunktMs = Date.now()) {
  const zaehler = Buffer.alloc(8);
  zaehler.writeBigUInt64BE(BigInt(Math.floor(zeitpunktMs / 30000)));
  const hash = createHmac('sha1', base32Dekodiere(geheimnis)).update(zaehler).digest();
  const versatz = hash[hash.length - 1] & 0x0f;
  const zahl =
    ((hash[versatz] & 0x7f) << 24) | (hash[versatz + 1] << 16) | (hash[versatz + 2] << 8) | hash[versatz + 3];
  return String(zahl % 1_000_000).padStart(6, '0');
}

async function serverLaeuft() {
  try {
    const antwort = await fetch(`${basis}/api/health`, { signal: AbortSignal.timeout(3000) });
    return antwort.ok;
  } catch {
    return false;
  }
}

/** Legt eine Einladung direkt in der PGlite-Datenbank an (Tabelle einladung, siehe drizzle/migrations/0000_grundstock.sql). */
async function einladen() {
  if (await serverLaeuft()) {
    console.error(`Der Server läuft unter ${basis}. Erst stoppen: _gemeinde/werkzeuge/server-starten.sh stop`);
    process.exitCode = 1;
    return;
  }
  if (!existsSync(join(DB_VERZEICHNIS, 'PG_VERSION'))) {
    console.error(`Keine PGlite-Datenbank in ${DB_VERZEICHNIS}`);
    process.exitCode = 1;
    return;
  }
  // PGLITE_PAKET: Modulpfad, wenn der Datenbankordner nicht neben node_modules liegt (z. B. Entwicklungsserver)
  const paket = process.env.PGLITE_PAKET ?? join(DB_VERZEICHNIS, '..', 'node_modules', '@electric-sql', 'pglite', 'dist', 'index.js');
  const { PGlite } = await import(pathToFileURL(paket).href);
  const db = new PGlite(DB_VERZEICHNIS);
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
  const laeuftAb = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
  try {
    await db.query(
      `INSERT INTO einladung (email, name, rollen, token_hash, laeuft_ab, erstellt_von)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6)`,
      [values.email, NAME, JSON.stringify([{ rolle: 'administration' }]), tokenHash, laeuftAb, 'pruefwerkzeug'],
    );
  } finally {
    await db.close();
  }
  writeFileSync(
    EINLADUNG,
    JSON.stringify({ email: values.email, token, laeuftAb, link: `${basis}/verwaltung/einladung/${token}` }, null, 2),
    { mode: 0o600 },
  );
  console.log(`Einladung angelegt für ${values.email} (gültig 72 h). Datei: ${EINLADUNG} (nur Testdaten, Token außerhalb des Repos).`);
}

async function anmelden() {
  if (!existsSync(EINLADUNG)) throw new Error(`Keine Einladung: zuerst "anmeldung.mjs einladen" bei gestopptem Server.`);
  if (!(await serverLaeuft())) throw new Error(`Server nicht erreichbar unter ${basis}. Zuerst server-starten.sh start.`);
  const { email, token } = JSON.parse(readFileSync(EINLADUNG, 'utf8'));
  const browser = await starteBrowser();
  const bilder = [];
  try {
    const kontext = await neuerKontext(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    // Eigene Absenderadresse aus dem Testnetz (Anmeldegrenze je IP, PROXY_VERTRAUEN=1), wie tests/e2e/hilfen/konto.ts
    await kontext.setExtraHTTPHeaders({ 'x-forwarded-for': `198.18.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}` });
    const seite = await kontext.newPage();
    seite.setDefaultTimeout(20000);

    // Bei einem Fehler: Adresse und Bild des Zustands festhalten (Fehlersuche, z. B. langsames erstes Kompilieren im Dev-Server)
    seite.on('pageerror', (f) => console.error(`Seitenfehler: ${f.message}`));
    globalThis.__anmeldeSeite = seite;
    await seite.goto(`${basis}/verwaltung/einladung/${token}`, { waitUntil: 'load' });
    await seite.getByLabel('Neues Passwort').filter({ visible: true }).fill(PASSWORT);
    await seite.getByLabel('Passwort wiederholen').filter({ visible: true }).fill(PASSWORT);
    await seite.getByRole('button', { name: 'Konto anlegen' }).click();
    await seite.waitForURL(/\/verwaltung\/anmelden\?eingeladen=1$/);

    await seite.getByLabel('E-Mail').filter({ visible: true }).fill(email);
    await seite.getByLabel('Passwort', { exact: true }).filter({ visible: true }).fill(PASSWORT);
    await seite.getByRole('button', { name: 'Anmelden' }).click();
    await seite.waitForURL(/\/verwaltung\/zwei-faktor$/);

    await seite.getByLabel('Schritt 1: Passwort bestätigen').filter({ visible: true }).fill(PASSWORT);
    await seite.getByRole('button', { name: 'Weiter' }).click();
    const geheimnis = (await seite.getByTestId('totp-geheimnis').innerText()).trim();
    await seite.getByLabel('Schritt 3: Code eingeben').filter({ visible: true }).fill(totpCode(geheimnis));
    await seite.getByRole('button', { name: 'Einrichtung abschließen' }).click();
    await seite.waitForURL(/\/verwaltung$/);

    await kontext.storageState({ path: ZUSTAND });
    const schirm = join(SCRATCHPAD, 'bilder', 'verwaltung-390x844-nach-anmeldung.jpg');
    await seite.screenshot({ path: schirm, type: 'jpeg', quality: 70 });
    bilder.push(schirm);
    console.log(`Angemeldet als ${email} (Testkonto). Anmeldezustand: ${ZUSTAND}`);
    console.log(`Bild nach Anmeldung: ${schirm}`);
    console.log(`Einzelbild von /verwaltung mit Anmeldung: node einzelbild.mjs /verwaltung --zustand ${ZUSTAND} --breite 1440`);
    await kontext.close();
  } catch (fehler) {
    const seite = globalThis.__anmeldeSeite;
    if (seite) {
      const bild = join(SCRATCHPAD, 'bilder', 'anmeldung-fehler.jpg');
      await seite.screenshot({ path: bild, type: 'jpeg', quality: 70 }).catch(() => {});
      console.error(`Stand beim Fehler: ${seite.url()} · Bild: ${bild}`);
    }
    throw fehler;
  } finally {
    await browser.close();
  }
}

try {
  if (befehl === 'einladen') await einladen();
  else if (befehl === 'anmelden') await anmelden();
  else hilfeAusgeben(HILFE);
} catch (fehler) {
  console.error(`FEHLER: ${fehler instanceof Error ? fehler.message : fehler}`);
  process.exitCode = 1;
}
