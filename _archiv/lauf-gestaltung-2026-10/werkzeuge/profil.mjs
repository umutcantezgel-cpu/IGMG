// CPU-Profil beim Laden (H-L01 Ursachen): 390×844, CPU 4× gedrosselt, Konzept-Hinweis wie beim ersten Besuch.
// Ausgabe: Eigenzeit je Funktion (Datei:Zeile:Spalte), oberste N, und Eigenzeit je Datei. Minifizierte Namen:
// Stelle mit `--zeige datei:spalte` im ausgelieferten Chunk nachsehen.
// Aufruf: node profil.mjs <pfad> [--basis URL] [--top 30] [--aus datei.json]
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { basisAdresse, neuerKontext, starteBrowser, vollerUrl } from './hilfen.mjs';

const { values: a, positionals } = parseArgs({ allowPositionals: true, options: { basis: { type: 'string' }, top: { type: 'string', default: '30' }, aus: { type: 'string' } } });
process.env.HINWEIS_ZEIGEN = '1';
const basis = basisAdresse(a.basis);
const browser = await starteBrowser();
const kontext = await neuerKontext(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const seite = await kontext.newPage();
const cdp = await kontext.newCDPSession(seite);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
await cdp.send('Profiler.start');
await seite.goto(vollerUrl(basis, positionals[0] ?? '/'), { waitUntil: 'load' });
await seite.waitForTimeout(4000);
const { profile } = await cdp.send('Profiler.stop');
await browser.close();
const dauer = new Map();
const zeiten = profile.timeDeltas;
profile.samples.forEach((id, i) => dauer.set(id, (dauer.get(id) ?? 0) + (zeiten[i] ?? 0)));
const jeFunktion = new Map();
const jeDatei = new Map();
for (const k of profile.nodes) {
  const f = k.callFrame;
  const us = dauer.get(k.id) ?? 0;
  if (!us) continue;
  const datei = f.url ? f.url.split('/').pop() || f.url : `(${f.functionName || 'intern'})`;
  const schluessel = `${f.functionName || '(anonym)'} ${datei}:${f.lineNumber}:${f.columnNumber}`;
  jeFunktion.set(schluessel, (jeFunktion.get(schluessel) ?? 0) + us);
  jeDatei.set(datei, (jeDatei.get(datei) ?? 0) + us);
}
const ms = (us) => Math.round(us / 100) / 10;
const top = Number(a.top);
const ergebnis = {
  funktionen: [...jeFunktion.entries()].sort((x, y) => y[1] - x[1]).slice(0, top).map(([k, v]) => [k, ms(v)]),
  dateien: [...jeDatei.entries()].sort((x, y) => y[1] - x[1]).slice(0, 15).map(([k, v]) => [k, ms(v)]),
};
if (a.aus) writeFileSync(a.aus, JSON.stringify(ergebnis, null, 1));
console.log(JSON.stringify(ergebnis, null, 1));
