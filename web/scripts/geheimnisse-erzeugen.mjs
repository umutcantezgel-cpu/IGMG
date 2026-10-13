#!/usr/bin/env node
/**
 * Geheimnisse für die Umgebung erzeugen (K-13, V-03, BETRIEB.md 2).
 *
 * Aufruf (im Verzeichnis web/, pnpm reicht die Optionen durch):
 *   pnpm geheimnisse:erzeugen                  NAME=wert je Zeile auf die Standardausgabe
 *   pnpm geheimnisse:erzeugen --datei <pfad>   schreibt eine neue Datei (Modus 600), überschreibt nie
 *   pnpm geheimnisse:erzeugen --vercel         zusätzlich Befehle `vercel env add NAME production` (ohne Wert)
 *
 * Die Werte stammen aus crypto.randomBytes. Das Skript schreibt nie in das Repository (Wurzel und web/ sind gesperrt),
 * ruft keine Dienste auf und liest keine vorhandenen Umgebungsdateien. Die Anleitung für Vercel geht auf die
 * Fehlerausgabe, damit die Standardausgabe nur NAME=wert enthält.
 *
 * Länge und Kodierung entsprechen den Prüfregeln in src/lib/umgebung.ts; tests/unit/umgebung.test.ts prüft das.
 */
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { chmodSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKRIPT_DATEI = fileURLToPath(import.meta.url);
const APP_VERZEICHNIS = resolve(dirname(SKRIPT_DATEI), '..');
const REPO_VERZEICHNIS = resolve(APP_VERZEICHNIS, '..');

/** Erzeugbare Geheimnisse. Kodierung und Zufallsbytes ergeben die Länge; alle erfüllen die Prüfregel. */
export const GEHEIMNISSE = [
  { name: 'BETTER_AUTH_SECRET', kodierung: 'base64', bytes: 32 }, // 44 Zeichen
  { name: 'EINGANG_SCHLUESSEL', kodierung: 'base64', bytes: 32 }, // genau 32 Byte
  { name: 'RATE_GEHEIMNIS', kodierung: 'base64', bytes: 32 },
  { name: 'ALTCHA_GEHEIMNIS', kodierung: 'base64', bytes: 32 },
  { name: 'WARTUNG_TOKEN', kodierung: 'base64url', bytes: 48 }, // 64 Zeichen, ohne + / = (URL-sicher)
  { name: 'CRON_SECRET', kodierung: 'base64url', bytes: 48 },
  // Web Push (ADR 0034): geheimer P-256-Skalar, 32 Byte base64url; der öffentliche Schlüssel wird daraus berechnet
  { name: 'VAPID_PRIVAT', kodierung: 'vapid', bytes: 32 },
];

/** Gültiger P-256-Schlüssel (nicht jede Zufallszahl ist ein gültiger Skalar). */
function vapidPrivat() {
  return generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey.export({ format: 'jwk' }).d;
}

/** Frische Werte; jeder Aufruf liefert neue Zufallswerte. */
export function erzeugeWerte() {
  return GEHEIMNISSE.map(({ name, kodierung, bytes }) => ({
    name,
    wert: kodierung === 'vapid' ? vapidPrivat() : randomBytes(bytes).toString(kodierung),
  }));
}

/** Liegt der Pfad im Repository oder im App-Ordner web/? */
export function liegtImRepo(pfad) {
  return [REPO_VERZEICHNIS, APP_VERZEICHNIS].some((wurzel) => {
    const rel = relative(wurzel, pfad);
    return rel === '' || (!isAbsolute(rel) && rel.split(sep)[0] !== '..');
  });
}

/** Fehlermeldung, wenn der Zielpfad im Repository liegt; sonst null. */
export function pruefeZielPfad(pfad) {
  const absolut = resolve(process.cwd(), pfad);
  if (liegtImRepo(absolut)) return `Der Pfad liegt im Repository (${absolut}). Die Datei wird dort nicht angelegt.`;
  return null;
}

/** Schreibt eine neue Datei mit Modus 600. Eine vorhandene Datei wird nie überschrieben. */
export function schreibeDatei(pfad, inhalt) {
  const fehler = pruefeZielPfad(pfad);
  if (fehler) throw new Error(fehler);
  const absolut = resolve(process.cwd(), pfad);
  try {
    writeFileSync(absolut, inhalt, { flag: 'wx', mode: 0o600 });
  } catch (fehlerObjekt) {
    if (fehlerObjekt?.code === 'EEXIST') throw new Error(`Die Datei existiert bereits (${absolut}). Nichts geschrieben.`);
    throw fehlerObjekt;
  }
  chmodSync(absolut, 0o600);
  return absolut;
}

const KOPF = '# Erzeugt mit pnpm geheimnisse:erzeugen. Nicht ins Repository übernehmen (ADR 0010).\n';

export function zeilenAus(werte) {
  return werte.map(({ name, wert }) => `${name}=${wert}`).join('\n') + '\n';
}

export function vercelBefehle() {
  return GEHEIMNISSE.map(({ name }) => `vercel env add ${name} production`);
}

function optionenAus(argv) {
  const optionen = { datei: undefined, vercel: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--vercel') optionen.vercel = true;
    else if (arg === '--datei') {
      if (!argv[i + 1]) throw new Error('--datei braucht einen Pfad.');
      optionen.datei = argv[++i];
    } else if (arg.startsWith('--datei=')) optionen.datei = arg.slice('--datei='.length);
    else throw new Error(`Unbekannte Option „${arg}“. Erlaubt: --datei <pfad>, --vercel.`);
  }
  if (optionen.datei === '') throw new Error('--datei braucht einen Pfad.');
  return optionen;
}

function hauptprogramm(argv) {
  const optionen = optionenAus(argv);
  const werte = erzeugeWerte();
  if (optionen.datei !== undefined) {
    const ziel = schreibeDatei(optionen.datei, KOPF + zeilenAus(werte));
    console.error(`Geschrieben: ${ziel} (Modus 600). Die Werte wurden nicht ausgegeben.`);
  } else {
    process.stdout.write(zeilenAus(werte));
  }
  if (optionen.vercel) {
    console.error('# Befehle für Vercel, ohne Werte. Der Befehl fragt den Wert ab: Wert aus der Datei oder Ausgabe einfügen.');
    for (const befehl of vercelBefehle()) console.error(befehl);
  }
  console.error('Die Werte nie in das Repository, in Berichte oder in Bildschirmfotos übernehmen.');
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === SKRIPT_DATEI) {
  try {
    hauptprogramm(process.argv.slice(2));
  } catch (fehler) {
    console.error(`Fehler: ${fehler.message}`);
    process.exitCode = 1;
  }
}
