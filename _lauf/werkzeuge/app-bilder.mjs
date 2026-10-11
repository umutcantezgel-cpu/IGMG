// T6: Bildschirmfotos der App bei 390 und 1440 px (für den Darstellungsprüfer).
// Aufruf: node app-bilder.mjs <basis-url> <ausgabe-ordner> <pfad>[=name] [<pfad>[=name] …]
// Zustände über Abfrage-Hilfen sind nicht nötig; Hinweisdialog wird per localStorage unterdrückt.
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(join(import.meta.dirname, 'referenz', 'package.json'));
const { chromium } = require('playwright');
const [basis, aus, ...pfade] = process.argv.slice(2);
await mkdir(aus, { recursive: true });
const browser = await chromium.launch();
for (const eintrag of pfade) {
  const [pfad, name = pfad.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'start'] = eintrag.split('=');
  for (const breite of [390, 1440]) {
    const kontext = await browser.newContext({ viewport: { width: breite, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: 'de-DE', timezoneId: 'Europe/Berlin' });
    await kontext.addInitScript(() => {
      try {
        localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
      } catch {}
    });
    const seite = await kontext.newPage();
    const fehler = [];
    seite.on('console', (m) => m.type() === 'error' && fehler.push(m.text()));
    await seite.goto(basis + pfad, { waitUntil: 'networkidle' });
    await seite.evaluate(() => document.fonts.ready);
    await seite.screenshot({ path: join(aus, `${name}__${breite}.png`), fullPage: true });
    if (fehler.length) console.log(`${name} ${breite}: ${fehler.join(' | ').slice(0, 300)}`);
    await kontext.close();
  }
}
await browser.close();
console.log('fertig');
