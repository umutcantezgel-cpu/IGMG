#!/usr/bin/env node
// Prüfwerkzeug: Druckansicht einer Seite (K-06, K-20). Chromium druckt die Seite als A4-PDF (Hintergründe wie beim
// normalen Drucken AUS, also so, wie Nutzerinnen und Nutzer es mit Standardeinstellungen sehen) und wandelt die ersten
// Seiten mit pdftoppm in PNG-Bilder um.
// Aufruf: node druck.mjs <pfad> --aus <ordner/name> [--basis URL] [--warte ms] [--seiten 3] [--klick selektor]
// Ausgabe: <name>.pdf und <name>-<n>.png; auf stdout JSON mit Seitenzahl und Bilddateien.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { basisAdresse, hilfeAusgeben, neuerKontext, oeffne, starteBrowser, vollerUrl } from './hilfen.mjs';

const HILFE = `Aufruf: node druck.mjs <pfad> --aus <ordner/name> [--basis URL] [--warte ms] [--seiten 3] [--klick selektor]
Beispiel: node druck.mjs /gebetszeiten --aus /tmp/druck/gebetszeiten --basis http://localhost:3200`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    aus: { type: 'string' },
    basis: { type: 'string' },
    warte: { type: 'string', default: '1500' },
    seiten: { type: 'string', default: '3' },
    klick: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || positionals.length !== 1 || !values.aus) hilfeAusgeben(HILFE);

const basis = basisAdresse(values.basis);
const aus = values.aus;
mkdirSync(dirname(aus), { recursive: true });

const browser = await starteBrowser();
try {
  const kontext = await neuerKontext(browser, { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const seite = await kontext.newPage();
  const http = await oeffne(seite, vollerUrl(basis, positionals[0]), { warte: Number(values.warte) });
  if (values.klick) {
    await seite.locator(values.klick).first().click();
    await seite.waitForTimeout(600);
  }
  await seite.pdf({ path: `${aus}.pdf`, format: 'A4', printBackground: false, preferCSSPageSize: true });
  await kontext.close();
  const anzahl = Number(execFileSync('pdfinfo', [`${aus}.pdf`]).toString().match(/Pages:\s+(\d+)/)?.[1] ?? 0);
  execFileSync('pdftoppm', ['-png', '-r', '60', '-f', '1', '-l', values.seiten, `${aus}.pdf`, aus]);
  const bilder = readdirSync(dirname(aus))
    .filter((d) => d.startsWith(`${basename(aus)}-`) && d.endsWith('.png'))
    .sort()
    .map((d) => `${dirname(aus)}/${d}`);
  console.log(JSON.stringify({ pfad: positionals[0], http, seiten: anzahl, pdf: `${aus}.pdf`, bilder }, null, 2));
} finally {
  await browser.close();
}
