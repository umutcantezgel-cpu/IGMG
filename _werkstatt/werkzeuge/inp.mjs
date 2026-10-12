#!/usr/bin/env node
// Prüfwerkzeug: Reaktion auf Eingaben (AUFTRAG BUDGETS „Reaktion auf Eingaben höchstens 200 ms“, ABNAHME Z-08 INP).
// Je Route: Telefon 390×844, CPU 4× gedrosselt ab dem Laden (wie Lighthouse mobil), nach dem Laden typische Eingaben
// ohne Seitenwechsel: Menü öffnen und mit Escape schließen, Leiste auf- und zuklappen, erster Reiter (role=tab) wechseln,
// erstes Textfeld anklicken und drei Zeichen tippen, dreimal Tab. Gemessen über die Event-Timing-API
// (PerformanceObserver type "event", durationThreshold 16): je interactionId die längste Dauer (Eingabe bis zum nächsten
// Bild). INP je Lauf = längste Interaktion (bei < 50 Interaktionen); Ergebnis je Route = Median über --laeufe Läufe.
// Keine Absendungen: POST-Anfragen werden abgebrochen.
// Aufruf: node inp.mjs --routen datei.json [--basis URL] [--laeufe 3] [--drossel 4] [--protokoll basisname]
import { parseArgs } from 'node:util';
import { basisAdresse, hilfeAusgeben, lesePfade, neuerKontext, schreibeProtokoll, standardProtokoll, starteBrowser, vollerUrl } from './hilfen.mjs';

const HILFE = `Aufruf: node inp.mjs --routen datei.json [--basis URL] [--laeufe 3] [--drossel 4] [--protokoll basisname]
Beispiel: node inp.mjs --routen routen-hauptansichten.json --basis http://127.0.0.1:3500`;
const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    basis: { type: 'string' },
    laeufe: { type: 'string', default: '3' },
    drossel: { type: 'string', default: '4' },
    protokoll: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || !values.routen) hilfeAusgeben(HILFE);
const BASIS = basisAdresse(values.basis ?? 'http://127.0.0.1:3500');
const LAEUFE = Math.max(1, Number(values.laeufe));
const DROSSEL = Number(values.drossel);
const routen = lesePfade(values.routen);

function BEOBACHTER() {
  window.__ereignisse = [];
  try {
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries()) {
        if (e.interactionId) window.__ereignisse.push({ id: e.interactionId, name: e.name, start: e.startTime, dauer: e.duration, verarbeitung: e.processingEnd - e.processingStart, verzoegerung: e.processingStart - e.startTime });
      }
    }).observe({ type: 'event', durationThreshold: 16, buffered: true });
  } catch {
    /* Event Timing fehlt: keine Werte */
  }
}

async function eingaben(seite) {
  const getan = [];
  const marken = [];
  const versuch = async (name, fn) => {
    marken.push({ name, ab: await seite.evaluate(() => performance.now()) });
    try {
      if (await fn()) getan.push(name);
    } catch {
      /* Element fehlt oder ist verdeckt: Eingabe entfällt */
    }
    await seite.waitForTimeout(700);
  };
  await versuch('menue', async () => {
    const knopf = seite.locator('header button[aria-haspopup="dialog"], header button[aria-controls]').filter({ visible: true }).first();
    if (!(await knopf.count())) return false;
    await knopf.click({ timeout: 2000 });
    await seite.waitForTimeout(700);
    await seite.keyboard.press('Escape');
    return true;
  });
  await versuch('leiste', async () => {
    const knopf = seite.locator('[aria-expanded]').filter({ visible: true }).filter({ hasNot: seite.locator('header') });
    const kandidat = seite.locator('footer [aria-expanded], [data-leiste] [aria-expanded], aside [aria-expanded]').filter({ visible: true }).first();
    const ziel = (await kandidat.count()) ? kandidat : knopf.first();
    if (!(await ziel.count())) return false;
    await ziel.click({ timeout: 2000 });
    await seite.waitForTimeout(500);
    await ziel.click({ timeout: 2000 });
    return true;
  });
  await versuch('reiter', async () => {
    const reiter = seite.locator('[role="tab"]').filter({ visible: true });
    if ((await reiter.count()) < 2) return false;
    await reiter.nth(1).click({ timeout: 2000 });
    return true;
  });
  await versuch('tippen', async () => {
    const feld = seite.locator('main input[type="text"], main input[type="email"], main input:not([type]), main textarea').filter({ visible: true }).first();
    if (!(await feld.count())) return false;
    await feld.click({ timeout: 2000 });
    await seite.keyboard.type('abc', { delay: 120 });
    return true;
  });
  await versuch('tab', async () => {
    for (let i = 0; i < 3; i++) {
      await seite.keyboard.press('Tab');
      await seite.waitForTimeout(200);
    }
    return true;
  });
  return { getan, marken };
}

const median = (w) => {
  const s = w.filter((x) => typeof x === 'number').sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : null;
};

const browser = await starteBrowser();
const ergebnis = { werkzeug: 'inp', basis: BASIS, drossel: DROSSEL, laeufe: LAEUFE, schwelleMs: 200, routen: [] };
for (const route of routen) {
  const laeufe = [];
  for (let n = 1; n <= LAEUFE; n++) {
    const kontext = await neuerKontext(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: false });
    const seite = await kontext.newPage();
    await seite.route('**/*', (r) => (r.request().method() === 'POST' && !r.request().url().includes('/_next/') ? r.abort() : r.continue()));
    await seite.addInitScript(BEOBACHTER);
    const cdp = await kontext.newCDPSession(seite);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });
    const antwort = await seite.goto(vollerUrl(BASIS, route.pfad), { waitUntil: 'load', timeout: 60000 });
    await Promise.race([seite.waitForLoadState('networkidle').catch(() => undefined), seite.waitForTimeout(8000)]);
    await seite.waitForTimeout(1500);
    const { getan, marken } = await eingaben(seite);
    await seite.waitForTimeout(500);
    const ereignisse = await seite.evaluate(() => window.__ereignisse ?? []);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await kontext.close();
    const jeInteraktion = new Map();
    for (const e of ereignisse) {
      const alt = jeInteraktion.get(e.id);
      if (!alt || e.dauer > alt.dauer) jeInteraktion.set(e.id, e);
    }
    const zuordnen = (t) => [...marken].reverse().find((m) => m.ab <= t)?.name ?? 'vorher';
    const liste = [...jeInteraktion.values()].map((e) => ({ ...e, eingabe: zuordnen(e.start) })).sort((a, b) => b.dauer - a.dauer);
    const jeEingabe = {};
    for (const e of liste) jeEingabe[e.eingabe] = Math.max(jeEingabe[e.eingabe] ?? 0, Math.round(e.dauer));
    const inp = liste.length ? Math.round(liste[0].dauer) : null;
    laeufe.push({ lauf: n, http: antwort?.status() ?? null, eingaben: getan, interaktionen: liste.length, inpMs: inp, jeEingabeMs: jeEingabe, laengste: liste.slice(0, 3).map((e) => ({ eingabe: e.eingabe, name: e.name, dauerMs: Math.round(e.dauer), verarbeitungMs: Math.round(e.verarbeitung), verzoegerungMs: Math.round(e.verzoegerung) })) });
    console.log(`${route.pfad} Lauf ${n}: INP ${inp ?? '–'} ms · ${liste.length} Interaktionen · je Eingabe ${JSON.stringify(jeEingabe)}`);
  }
  const inpMedian = median(laeufe.map((l) => l.inpMs));
  ergebnis.routen.push({ name: route.name, pfad: route.pfad, inpMedianMs: inpMedian, erfuellt: inpMedian !== null && inpMedian <= 200, laeufe });
}
await browser.close();

const zeilen = [
  `# Reaktion auf Eingaben (INP, Labor) · ${BASIS} · CPU ${DROSSEL}× · ${LAEUFE} Läufe je Route`,
  '',
  'Telefon 390×844; Eingaben ohne Seitenwechsel (Menü, Leiste, Reiter, Tippen, Tab). INP je Lauf = längste Interaktion (Event Timing); Ergebnis = Median der Läufe. Schwelle 200 ms (AUFTRAG BUDGETS).',
  '',
  '| Route | INP Median (ms) | Läufe (ms) | Interaktionen je Lauf | Eingaben | ≤ 200 ms |',
  '|---|---|---|---|---|---|',
  ...ergebnis.routen.map((r) => `| ${r.pfad} | ${r.inpMedianMs ?? '–'} | ${r.laeufe.map((l) => l.inpMs ?? '–').join(' · ')} | ${r.laeufe.map((l) => l.interaktionen).join(' · ')} | ${[...new Set(r.laeufe.flatMap((l) => l.eingaben))].join(', ')} | ${r.erfuellt ? 'ja' : 'nein'} |`),
  '',
  `Erfüllt auf ${ergebnis.routen.filter((r) => r.erfuellt).length} von ${ergebnis.routen.length} Routen.`,
];
const basisname = values.protokoll ?? standardProtokoll('inp');
console.log(`Protokoll: ${schreibeProtokoll(basisname, { json: ergebnis, md: zeilen.join('\n') }).join(', ')}`);
