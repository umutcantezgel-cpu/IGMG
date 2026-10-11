#!/usr/bin/env node
// Prüfwerkzeug a: ein Bild einer Seite. Standard: erster Bildschirm, JPEG Qualität 70 (PNG mit --png oder .png-Endung).
// Aufruf: node einzelbild.mjs <pfad> [--breite 390|768|1440] [--hoehe N] [--aus datei.png] [--voll] [--png]
//         [--basis URL] [--warte ms] [--reduziert]
// Beispiel: node einzelbild.mjs / --breite 1440
// Ausgabe ohne --aus: SCRATCHPAD/bilder/<name>-<breite>x<hoehe>[-voll].jpg (außerhalb des Repos).
import { mkdirSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { BILDER, GERAETE, basisAdresse, dateiname, hilfeAusgeben, neuerKontext, oeffne, starteBrowser, vollerUrl } from './hilfen.mjs';

const HILFE = `Aufruf: node einzelbild.mjs <pfad> [--breite 390|768|1440] [--hoehe N] [--aus datei] [--voll] [--png] [--basis URL] [--warte ms] [--reduziert] [--zustand anmeldung.json]
Beispiel: node einzelbild.mjs /gebetszeiten --breite 390 --aus /tmp/x.jpg
Mit Anmeldung: node einzelbild.mjs /verwaltung --zustand <scratchpad>/verwaltung-state.json --breite 1440`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    breite: { type: 'string', default: '390' },
    hoehe: { type: 'string' },
    aus: { type: 'string' },
    voll: { type: 'boolean', default: false },
    png: { type: 'boolean', default: false },
    basis: { type: 'string' },
    warte: { type: 'string', default: '800' },
    reduziert: { type: 'boolean', default: false },
    zustand: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || positionals.length === 0) hilfeAusgeben(HILFE);

const pfad = positionals[0];
const breite = Math.min(Number(values.breite), 1440);
if (!Number.isFinite(breite) || breite <= 0) throw new Error(`Ungültige Breite: ${values.breite}`);
const hoehe = Number(values.hoehe ?? GERAETE[breite]?.hoehe ?? 844);
const basis = basisAdresse(values.basis);
const typ = values.png || extname(values.aus ?? '') === '.png' ? 'png' : 'jpeg';
const ziel =
  values.aus ??
  join(BILDER, `${dateiname(pfad)}-${breite}x${hoehe}${values.voll ? '-voll' : ''}.${typ === 'png' ? 'png' : 'jpg'}`);
mkdirSync(dirname(ziel), { recursive: true });

const browser = await starteBrowser();
try {
  const kontext = await neuerKontext(browser, {
    viewport: { width: breite, height: hoehe },
    deviceScaleFactor: 1,
    reducedMotion: values.reduziert ? 'reduce' : 'no-preference',
    ...(values.zustand ? { storageState: values.zustand } : {}),
  });
  const seite = await kontext.newPage();
  const status = await oeffne(seite, vollerUrl(basis, pfad), { warte: Number(values.warte) });
  await seite.screenshot({
    path: ziel,
    fullPage: values.voll,
    type: typ,
    ...(typ === 'jpeg' ? { quality: 70 } : {}),
  });
  const maße = await seite.evaluate(() => ({
    seitenHoehe: document.documentElement.scrollHeight,
    seitenBreite: document.documentElement.scrollWidth,
  }));
  const kb = Math.round(statSync(ziel).size / 1024);
  console.log(`Bild: ${ziel}`);
  console.log(`Seite: ${basis}${pfad} · HTTP ${status} · Fenster ${breite}×${hoehe} · ${values.voll ? 'ganze Seite' : 'erster Bildschirm'} · ${typ} · ${kb} kB`);
  console.log(`Seitenhöhe ${maße.seitenHoehe} px · Seitenbreite ${maße.seitenBreite} px`);
  if (status >= 400) {
    console.error(`WARNUNG: HTTP ${status} – das Bild zeigt eine Fehlerseite.`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
