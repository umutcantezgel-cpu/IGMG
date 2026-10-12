// Leistungsspur (H-L01 Ursachen): lädt eine Route mobil (390×844, CPU 4× gedrosselt über CDP) und zeichnet eine
// Chromium-Spur auf. Ausgabe: lange Aufgaben (> 50 ms) des Hauptthreads mit ihren größten Unterereignissen
// (Skript, Stil, Layout, Zeichnen), Summe der Blockierzeit-Anteile zwischen erstem Zeichnen und Ende, dazu die
// Animationen, die beim Laden laufen. Kein Ersatz für Lighthouse (Median), sondern Zuordnung der Ursachen.
// Aufruf: [HINWEIS_ZEIGEN=1] node spur.mjs <pfad> [--basis URL] [--dauer 6000] [--aus <datei.json>]
//   HINWEIS_ZEIGEN=1 zeigt den Konzept-Hinweis wie beim ersten Besuch (so misst Lighthouse); sonst gilt er als gesehen (hilfen.mjs)
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { basisAdresse, neuerKontext, starteBrowser, vollerUrl } from './hilfen.mjs';
import { auswerten } from './spur-auswertung.mjs';

const { values: a, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    basis: { type: 'string' },
    dauer: { type: 'string', default: '6000' },
    aus: { type: 'string' },
  },
});
const pfad = positionals[0] ?? '/';
const basis = basisAdresse(a.basis);
const browser = await starteBrowser();
const kontext = await neuerKontext(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const seite = await kontext.newPage();
const cdp = await kontext.newCDPSession(seite);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const ereignisse = [];
cdp.on('Tracing.dataCollected', (d) => ereignisse.push(...d.value));
const fertig = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
await cdp.send('Tracing.start', {
  categories: ['toplevel', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'loading', 'v8.execute'].join(','),
  transferMode: 'ReportEvents',
});
await seite.goto(vollerUrl(basis, pfad), { waitUntil: 'load' });
await seite.waitForTimeout(Number(a.dauer));
const animationen = await seite.evaluate(() =>
  document.getAnimations().map((x) => ({
    name: x.animationName ?? x.transitionProperty ?? x.constructor.name,
    ziel: x.effect?.target ? `${x.effect.target.tagName.toLowerCase()}.${String(x.effect.target.className?.baseVal ?? x.effect.target.className).slice(0, 60)}` : '',
    zustand: x.playState,
  })),
);
await cdp.send('Tracing.end');
await fertig;
await browser.close();

if (process.env.ROH) writeFileSync(process.env.ROH, JSON.stringify(ereignisse));
const auswertung = auswerten(ereignisse);
const ergebnis = {
  pfad,
  basis,
  mitHinweis: process.env.HINWEIS_ZEIGEN === '1',
  ...auswertung,
  animationenNachDauer: animationen,
};
if (a.aus) writeFileSync(a.aus, JSON.stringify(ergebnis, null, 1));
console.log(JSON.stringify(ergebnis, null, 1));
