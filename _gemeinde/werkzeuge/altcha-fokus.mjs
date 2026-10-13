#!/usr/bin/env node
// Prüfwerkzeug: Fokus auf dem ALTCHA-Kästchen (Z-07). Tabbt auf /kontakt bis zum Kästchen und fotografiert den
// Zustand direkt nach dem Fokus (Prüfung läuft, Kästchen durch den Ladekreis ersetzt) und nach 4 s.
// Sendet nichts ab (alle POST werden abgebrochen). Aufruf: node altcha-fokus.mjs --basis <url> --aus <ordner> [--breite 1440]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { neuerKontext, starteBrowser } from './hilfen.mjs';

const { values } = parseArgs({ options: { basis: { type: 'string' }, aus: { type: 'string' }, breite: { type: 'string', default: '1440' } } });
const breite = Number(values.breite);
mkdirSync(values.aus, { recursive: true });
const browser = await starteBrowser();
const kontext = await neuerKontext(browser, { viewport: { width: breite, height: 900 } });
const s = await kontext.newPage();
await s.route('**/*', (r) => (r.request().method() === 'POST' && !r.request().url().includes('altcha') ? r.abort() : r.continue()));
await s.goto(new URL('/kontakt', values.basis).href, { waitUntil: 'networkidle' });
let gefunden = false;
for (let i = 0; i < 80; i++) {
  await s.keyboard.press('Tab');
  const ist = await s.evaluate(() => !!document.activeElement?.closest('.altcha-checkbox'));
  if (ist) { gefunden = true; break; }
}
const messen = () =>
  s.evaluate(() => {
    const el = document.activeElement;
    const box = el.closest('.altcha-checkbox');
    const st = getComputedStyle(box);
    const r = box.getBoundingClientRect();
    return { laden: box.dataset.loading ?? null, umriss: `${st.outlineStyle} ${st.outlineWidth} ${st.outlineColor}`, kasten: [Math.round(r.width), Math.round(r.height)], eingabeSichtbar: el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) };
  });
const ergebnis = { breite, gefunden };
if (gefunden) {
  ergebnis.sofort = await messen();
  const box = await s.evaluate(() => { const r = document.activeElement.closest('.altcha').getBoundingClientRect(); return { x: r.x - 16, y: r.y - 16, width: r.width + 32, height: r.height + 32 }; });
  await s.screenshot({ path: join(values.aus, `altcha-${breite}-sofort.png`), clip: box });
  await s.waitForTimeout(4000);
  ergebnis.nach4s = await messen();
  await s.screenshot({ path: join(values.aus, `altcha-${breite}-nach-4s.png`), clip: box });
}
console.log(JSON.stringify(ergebnis, null, 2));
await browser.close();
