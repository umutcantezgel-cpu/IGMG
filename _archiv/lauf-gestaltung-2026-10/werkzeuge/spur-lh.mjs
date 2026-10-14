// Leistungsspur unter Lighthouse-Bedingungen (H-L01 Ursachen): ein Lighthouse-Lauf mobil mit angewandter Drosselung
// („devtools“, wie lighthouse.mjs), die Spur des Laufs wird mit spur-auswertung.mjs zerlegt (lange Aufgaben, Anteile
// Skript/Stil/Layout/Zeichnen, größte Skripte). Konzept-Hinweis erscheint wie bei Lighthouse (frisches Profil).
// Aufruf: node spur-lh.mjs <pfad> [--basis URL] [--aus <datei.json>]
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import lighthouse from 'lighthouse';
import { basisAdresse, starteBrowser, vollerUrl } from './hilfen.mjs';
import { auswerten } from './spur-auswertung.mjs';

const { values: a, positionals } = parseArgs({ allowPositionals: true, options: { basis: { type: 'string' }, aus: { type: 'string' } } });
const pfad = positionals[0] ?? '/';
const basis = basisAdresse(a.basis);
const port = 9300 + Math.floor(Math.random() * 400);
const browser = await starteBrowser({ args: [`--remote-debugging-port=${port}`] });
let ergebnis;
try {
  const r = await lighthouse(vollerUrl(basis, pfad), { port, output: 'json', logLevel: 'error', onlyCategories: ['performance'], throttlingMethod: 'devtools' });
  const spur = r.artifacts.Trace ?? r.artifacts.traces?.defaultPass;
  const A = r.lhr.audits;
  ergebnis = {
    pfad,
    basis,
    performance: Math.round(r.lhr.categories.performance.score * 100),
    tbtMs: Math.round(A['total-blocking-time'].numericValue),
    ...auswerten(spur.traceEvents),
  };
} finally {
  await browser.close();
}
if (a.aus) writeFileSync(a.aus, JSON.stringify(ergebnis, null, 1));
console.log(JSON.stringify(ergebnis, null, 1));
