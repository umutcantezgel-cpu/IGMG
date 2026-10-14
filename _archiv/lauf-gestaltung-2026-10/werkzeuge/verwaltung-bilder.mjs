#!/usr/bin/env node
// Prüfwerkzeug: Bilder der angemeldeten Verwaltung für die Sichtabnahme (Übersicht, Postfach, Veranstaltungen, Startklar)
// je 390 und 1440 px. Braucht den Anmeldezustand aus anmeldung.mjs (storageState). Nur lesend: keine Formulare, POST
// außerhalb von /_next/ wird abgebrochen.
// Aufruf: node verwaltung-bilder.mjs --zustand <storageState.json> --aus <ordner> [--basis URL]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { basisAdresse, hilfeAusgeben, neuerKontext, starteBrowser, vollerUrl } from './hilfen.mjs';

const HILFE = 'Aufruf: node verwaltung-bilder.mjs --zustand <storageState.json> --aus <ordner> [--basis URL]';
const { values } = parseArgs({ options: { zustand: { type: 'string' }, aus: { type: 'string' }, basis: { type: 'string' }, hilfe: { type: 'boolean', short: 'h', default: false } } });
if (values.hilfe || !values.zustand || !values.aus) hilfeAusgeben(HILFE);
const BASIS = basisAdresse(values.basis ?? 'http://127.0.0.1:3500');
const SEITEN = [
  ['verwaltung', '/verwaltung'],
  ['postfach', '/verwaltung/postfach'],
  ['veranstaltungen', '/verwaltung/veranstaltungen'],
  ['startklar', '/verwaltung/startklar'],
];
mkdirSync(values.aus, { recursive: true });
const browser = await starteBrowser();
for (const breite of [390, 1440]) {
  const kontext = await neuerKontext(browser, { viewport: { width: breite, height: breite < 768 ? 844 : 900 }, deviceScaleFactor: 1, storageState: values.zustand });
  const seite = await kontext.newPage();
  await seite.route('**/*', (r) => (r.request().method() === 'POST' && !r.request().url().includes('/_next/') ? r.abort() : r.continue()));
  for (const [name, pfad] of SEITEN) {
    const antwort = await seite.goto(vollerUrl(BASIS, pfad), { waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);
    await seite.waitForTimeout(800);
    const ziel = join(values.aus, `${name}-${breite}.jpg`);
    await seite.screenshot({ path: ziel, type: 'jpeg', quality: 80, fullPage: false });
    console.log(`${pfad} ${breite}: HTTP ${antwort?.status() ?? '–'} · URL ${seite.url().replace(BASIS, '')} · ${ziel}`);
  }
  await kontext.close();
}
await browser.close();
