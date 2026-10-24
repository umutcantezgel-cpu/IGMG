// Gemeinsame Hilfen der Leistungsmessung der Lern-App (L8-02). Abhängigkeiten aus web/node_modules über den Verweis
// `node_modules` in diesem Ordner (per .gitignore ausgeschlossen; messlauf.sh legt ihn an, für Einzelaufrufe hier
// `ln -sfn ../../../web/node_modules node_modules`): @playwright/test, lighthouse, @axe-core/playwright, pg.
// Chromium aus PLAYWRIGHT_BROWSERS_PATH (wie die E2E). Keine Drittanfragen: alle Messungen nur gegen den lokalen Server.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadavg } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';

export const HIER = import.meta.dirname;
export const WURZEL = resolve(HIER, '..', '..', '..');
export const WEB = join(WURZEL, 'web');

/** Basisadresse des Messservers (E2E_PORT wie die E2E). */
export const BASIS = (process.env.MESS_BASIS ?? `http://localhost:${process.env.E2E_PORT ?? 3224}`).replace(/\/$/, '');

/** Ausgabeordner eines Messlaufs (Rohdaten, außerhalb des Repos). */
export const ZIEL = process.env.MESS_ZIEL ?? join(process.env.TMPDIR ?? '/tmp', 'leistung');
mkdirSync(ZIEL, { recursive: true });

export const lernTexte = (ui) => JSON.parse(readFileSync(join(WEB, 'messages', 'lernapp', `${ui}.json`), 'utf8'));

/** Last der Maschine (1/5/15 min) und die Zeile von `uptime` (Protokoll je Messung, Auftrag L8-02 Nr. 5). */
export function last() {
  const [l1, l5, l15] = loadavg().map((x) => Math.round(x * 100) / 100);
  let zeile = '';
  try {
    zeile = execFileSync('uptime', { encoding: 'utf8' }).trim();
  } catch {
    zeile = `load average: ${l1}, ${l5}, ${l15}`;
  }
  return { l1, l5, l15, uptime: zeile, am: new Date().toISOString() };
}

/** Schwelle der Auftragsregel: über 1,5 gilt eine Messung als „unter Last“. */
export const LAST_GRENZE = 1.5;

/**
 * Wartet, bis die 1-Minuten-Last unter `grenze` fällt – höchstens `hoechstensMs` (until-Schleife mit Zeitgrenze, Prüfung alle
 * 15 s; kein `sleep`). Ergebnis: Last beim Ende und ob die Grenze erreicht wurde.
 */
export async function warteAufLast(grenze = LAST_GRENZE, hoechstensMs = 10 * 60_000) {
  const ende = Date.now() + hoechstensMs;
  for (;;) {
    const l = last();
    if (l.l1 < grenze) return { ...l, erreicht: true };
    if (Date.now() >= ende) return { ...l, erreicht: false };
    await new Promise((r) => setTimeout(r, 15_000));
  }
}

export function median(zahlen) {
  const s = zahlen.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const runde = (x, stellen = 1) => (Number.isFinite(x) ? Math.round(x * 10 ** stellen) / 10 ** stellen : x);

export async function starteBrowser(zusatz = {}) {
  return chromium.launch(zusatz);
}

/** Dateiname aus Pfad: "/lern-app/de" → "lern-app_de". */
export const dateiname = (pfad) => pfad.replace(/^\/+|\/+$/g, '').replace(/[^\w.-]+/g, '_') || 'start';

export function schreibe(name, daten) {
  const pfad = join(ZIEL, name);
  mkdirSync(dirname(pfad), { recursive: true });
  writeFileSync(pfad, typeof daten === 'string' ? daten : `${JSON.stringify(daten, null, 2)}\n`);
  return pfad;
}

/** JS einer Adresse in KB gzip -9 (wie scripts/lernapp-budget.mjs); Zwischenspeicher je Adresse. */
const gzCache = new Map();
export async function gzKb(url, kopf = {}) {
  if (!gzCache.has(url))
    gzCache.set(
      url,
      fetch(url, { headers: kopf })
        .then(async (r) => (r.ok ? gzipSync(Buffer.from(await r.arrayBuffer()), { level: 9 }).length / 1024 : NaN))
        .catch(() => NaN),
    );
  return gzCache.get(url);
}

/**
 * Titel der Fehlerseiten der Lern-App (nicht gefunden, Fehlergrenze) und der Website, aus den Sprachdateien (keine eigenen
 * Texte; der Vergleich läuft im Speicher, ins Protokoll kommt nur die Art).
 */
export function fehlerTitel() {
  const titel = [];
  for (const ui of ['de', 'tr', 'ar']) {
    const t = lernTexte(ui);
    titel.push(
      { titel: t.nichtGefunden.titel, art: 'nicht gefunden (Lern-App)' },
      { titel: t.fehler.titel, art: 'Fehlergrenze (Lern-App)' },
    );
  }
  const lies = (datei) => JSON.parse(readFileSync(join(WEB, 'messages', 'bereiche', datei), 'utf8'));
  const nf = lies('fehlerseiten.json');
  const fg = lies('fehlergrenze.json');
  for (const l of ['de', 'tr', 'en'])
    titel.push(
      { titel: nf[l].fehlerseiten.nichtGefunden.titel, art: 'nicht gefunden' },
      { titel: fg[l].fehlergrenze.titel, art: 'Fehlergrenze' },
    );
  return titel;
}

/** Art der Fehlerseite (oder null): Fehlerhülle von Next, sonst Seitentitel bzw. h1 gleich einem Fehlertitel. */
export async function fehlerseite(seite, liste = fehlerTitel()) {
  return seite.evaluate((l) => {
    if (document.documentElement.id === '__next_error__') return 'Fehlerhülle von Next';
    const titel = document.title.trim();
    const h1 = (document.querySelector('h1')?.textContent ?? '').trim();
    const treffer = l.find((f) => h1 === f.titel || titel === f.titel || titel.startsWith(`${f.titel} `));
    return treffer ? treffer.art : null;
  }, liste);
}

/** Cookie-Kopfzeile aus einem storageState für den Host der Basis. */
export function cookieKopf(zustandDatei) {
  if (!zustandDatei) return undefined;
  const host = new URL(BASIS).hostname;
  const kekse = JSON.parse(readFileSync(zustandDatei, 'utf8')).cookies.filter((k) => host.endsWith(k.domain.replace(/^\./, '')));
  return kekse.length ? { Cookie: kekse.map((k) => `${k.name}=${k.value}`).join('; ') } : undefined;
}
