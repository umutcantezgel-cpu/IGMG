#!/usr/bin/env node
// Prüfwerkzeug F-18/K-07: Telefonmenü bei 390 px. Öffnen, Tab-Runde (Fokus bleibt im Dialog, nach dem letzten Ziel
// wieder das erste), Umschalt+Tab vom ersten auf das letzte, Escape schließt und gibt den Fokus an den Menü-Knopf.
// Optional --bilder <ordner>: fünf Bilder des Öffnens (0, 120, 240, 400, 700 ms).
// Aufruf: node menue-fokus.mjs [--basis URL] [--pfad /] [--bilder ordner]
import { mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { basisAdresse, neuerKontext, oeffne, starteBrowser, vollerUrl } from './hilfen.mjs';

const { values } = parseArgs({ options: { basis: { type: 'string' }, pfad: { type: 'string', default: '/' }, bilder: { type: 'string' } } });
const basis = basisAdresse(values.basis);
const browser = await starteBrowser();
const ergebnis = { pfad: values.pfad, schritte: [] };
const notiere = (name, ok, wert) => ergebnis.schritte.push({ name, ok, wert });
try {
  const kontext = await neuerKontext(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const seite = await kontext.newPage();
  await oeffne(seite, vollerUrl(basis, values.pfad), { warte: 2500 });
  const knopf = seite.locator('button[aria-haspopup="dialog"]').first();
  const imDialog = () => seite.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]')));
  const fokusName = () =>
    seite.evaluate(() => {
      const el = document.activeElement;
      return el ? `${el.tagName.toLowerCase()}:${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)}` : 'nichts';
    });

  if (values.bilder) {
    mkdirSync(values.bilder, { recursive: true });
    await knopf.click();
    const start = Date.now();
    for (const ms of [0, 120, 240, 400, 700]) {
      const warten = ms - (Date.now() - start);
      if (warten > 0) await seite.waitForTimeout(warten);
      await seite.screenshot({ path: `${values.bilder}/oeffnen-${String(ms).padStart(3, '0')}ms.jpg`, type: 'jpeg', quality: 70 });
    }
    await seite.keyboard.press('Escape');
    await seite.waitForTimeout(300);
  }

  await knopf.focus();
  await seite.keyboard.press('Enter');
  await seite.waitForTimeout(900);
  notiere('Dialog offen', await seite.locator('dialog[open]').count() === 1, await fokusName());
  const ziele = await seite.evaluate(
    () => [...document.querySelectorAll('dialog[open] a[href], dialog[open] button:not([disabled])')].filter((el) => el.getClientRects().length > 0).length,
  );
  let draussen = 0;
  const folge = [];
  for (let i = 0; i < ziele + 2; i++) {
    await seite.keyboard.press('Tab');
    if (!(await imDialog())) draussen++;
    folge.push(await fokusName());
  }
  notiere(`Tab-Runde (${ziele} Ziele, ${ziele + 2} Schritte): Fokus nie außerhalb`, draussen === 0, `${draussen} außerhalb`);
  // Kreis: nach genau `ziele` Schritten wiederholt sich die Folge
  notiere('nach dem letzten Ziel wieder das erste (Folge wiederholt sich)', folge[ziele] === folge[0] && folge[ziele + 1] === folge[1], `${folge[ziele - 1]} → ${folge[ziele]}`);
  // Umschalt+Tab vom ersten Ziel
  await seite.evaluate(() => {
    const z = [...document.querySelectorAll('dialog[open] a[href], dialog[open] button:not([disabled])')].filter((el) => el.getClientRects().length > 0);
    z[0]?.focus();
  });
  await seite.keyboard.press('Shift+Tab');
  const letzterName = await seite.evaluate(() => {
    const z = [...document.querySelectorAll('dialog[open] a[href], dialog[open] button:not([disabled])')].filter((el) => el.getClientRects().length > 0);
    return document.activeElement === z.at(-1);
  });
  notiere('Umschalt+Tab vom ersten auf das letzte Ziel', letzterName, await fokusName());
  await seite.keyboard.press('Escape');
  await seite.waitForTimeout(400);
  const zu = (await seite.locator('dialog[open]').count()) === 0;
  const zurueck = await seite.evaluate(() => document.activeElement?.getAttribute('aria-haspopup') === 'dialog');
  notiere('Escape schließt, Fokus auf dem Menü-Knopf', zu && zurueck, await fokusName());
  ergebnis.folge = folge;
  await kontext.close();
} finally {
  await browser.close();
}
ergebnis.bestanden = ergebnis.schritte.every((s) => s.ok);
console.log(JSON.stringify(ergebnis, null, 2));
process.exit(ergebnis.bestanden ? 0 : 1);
