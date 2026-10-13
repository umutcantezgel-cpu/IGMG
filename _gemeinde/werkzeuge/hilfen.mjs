// Gemeinsame Hilfen der Prüfwerkzeuge (E0-PRUEFER-01). Node-ESM. Playwright kommt aus werkzeuge/node_modules
// (Symlink auf den Ordner im Scratchpad, siehe LIESMICH.md). Chromium: CHROME_PATH oder /opt/pw-browsers.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

export const WERKZEUGE = import.meta.dirname;
export const WURZEL = resolve(WERKZEUGE, '..', '..');
export const PROTOKOLLE = resolve(WERKZEUGE, '..', 'protokolle');
export const SCRATCHPAD = process.env.SCRATCHPAD ?? '/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad';
export const BILDER = join(SCRATCHPAD, 'bilder');
export const WEB = join(WURZEL, 'web');

/** Gerätegrößen laut AUFTRAG §0: Breite → Höhe. */
export const GERAETE = {
  390: { breite: 390, hoehe: 844 },
  768: { breite: 768, hoehe: 1024 },
  1440: { breite: 1440, hoehe: 900 },
};

const CHROME_STANDARD = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** Basisadresse: Argument, sonst ENV BASIS, sonst der lokale Prüfserver. */
export function basisAdresse(wert) {
  return (wert ?? process.env.BASIS ?? 'http://127.0.0.1:3100').replace(/\/$/, '');
}

export function vollerUrl(basis, pfad) {
  return /^https?:\/\//.test(pfad) ? pfad : `${basis}${pfad}`;
}

/** Chromium-Pfad: CHROME_PATH, sonst der Browser unter /opt/pw-browsers, sonst Playwright-Standard. */
export function chromePfad() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  return existsSync(CHROME_STANDARD) ? CHROME_STANDARD : undefined;
}

export async function starteBrowser(zusatz = {}) {
  const exe = chromePfad();
  return chromium.launch({ ...(exe ? { executablePath: exe } : {}), ...zusatz });
}

/** Schlüssel des Konzept-Hinweises (web/src/components/website/KonzeptHinweis.tsx, localStorage). */
const KONZEPTHINWEIS = 'igmg-konzepthinweis-gesehen';

/**
 * Neuer Browser-Kontext. Der Konzept-Hinweis (Modal beim ersten Besuch) wird als „gesehen“ markiert, damit er die
 * Ansichten nicht überdeckt. Mit HINWEIS_ZEIGEN=1 bleibt er sichtbar (z. B. für eine Bildprüfung des Hinweises).
 */
export async function neuerKontext(browser, optionen) {
  const kontext = await browser.newContext(optionen);
  if (process.env.HINWEIS_ZEIGEN !== '1') {
    await kontext.addInitScript((schluessel) => {
      try {
        localStorage.setItem(schluessel, '1');
      } catch {
        /* kein Speicher: Hinweis erscheint */
      }
    }, KONZEPTHINWEIS);
  }
  return kontext;
}

/** Routen-Datei: JSON-Liste aus Objekten {name, pfad} oder Zeichenketten (Pfade). */
export function lesePfade(datei) {
  const roh = JSON.parse(readFileSync(datei, 'utf8'));
  if (!Array.isArray(roh)) throw new Error(`Routen-Datei ${datei}: erwartet eine JSON-Liste.`);
  return roh.map((e) => (typeof e === 'string' ? { name: e, pfad: e } : e));
}

/** Dateiname aus Pfad: "/" → "start", "/tr/gebetszeiten" → "tr_gebetszeiten". */
export function dateiname(pfad) {
  return pfad.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+|\/+$/g, '').replace(/[^\w.-]+/g, '_').replace(/\//g, '_') || 'start';
}

export function zeitstempel() {
  return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
}

/** Lädt eine Seite, wartet auf Schriften und kurz auf den Einblendeffekt. Liefert den HTTP-Status. */
export async function oeffne(seite, url, { warte = 800 } = {}) {
  const antwort = await seite.goto(url, { waitUntil: 'load', timeout: 60000 });
  await seite.evaluate(() => document.fonts.ready);
  await seite.waitForTimeout(warte);
  return antwort?.status() ?? 0;
}

export function median(zahlen) {
  const s = zahlen.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Standardname für Protokolle: _werkstatt/protokolle/werkzeug-<name>-<zeit>. */
export function standardProtokoll(werkzeug) {
  return join(PROTOKOLLE, `werkzeug-${werkzeug}-${zeitstempel()}`);
}

/** Schreibt <basis>.json und/oder <basis>.md. */
export function schreibeProtokoll(basisname, { json, md }) {
  mkdirSync(dirname(basisname), { recursive: true });
  if (json !== undefined) writeFileSync(`${basisname}.json`, `${JSON.stringify(json, null, 2)}\n`);
  if (md !== undefined) writeFileSync(`${basisname}.md`, md.endsWith('\n') ? md : `${md}\n`);
  return [json !== undefined && `${basisname}.json`, md !== undefined && `${basisname}.md`].filter(Boolean);
}

export function hilfeAusgeben(text) {
  console.log(text.trim());
  process.exit(0);
}
