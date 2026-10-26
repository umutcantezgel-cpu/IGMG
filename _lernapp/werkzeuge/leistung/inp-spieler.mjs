#!/usr/bin/env node
// Reaktion auf Eingaben (INP, Labor) im Lektionsspieler und beim Öffnen des Lernpfads (L8-02, KERN 4.0 §9: INP ≤ 200 ms).
// Telefon 390×844 mit Berührung, CPU ×6 gedrosselt ab dem Laden (über CDP), Testkurs der E2E. Gemessen über die
// Event-Timing-API (PerformanceObserver type "event", durationThreshold 16): je interactionId die längste Dauer (Eingabe bis zum
// nächsten Bild); jede Interaktion wird dem Schritt zugeordnet, der sie ausgelöst hat. Je Schritt und Szenario: Median über
// --laeufe Läufe des größten Werts im Lauf. Muster: _gemeinde/werkzeuge/inp.mjs (dort unverändert).
// Schritte: Antwort wählen, Prüfen, Weiter, Paare antippen, Wortbank antippen, Tastatur-Eingabe (Freitext), Bildschirmtastatur
// (arabischer Freitext), Lernpfad öffnen (Antippen der Kurskarte bis die Lektionen sichtbar sind) und „Einheit offline speichern“.
// Mit --echt (Stufe C N6): Szenarien mit echten Lektionen (routen.mjs `ECHT`: A1 Auswahl/Paare, B1 mit Geschichte zuerst,
// ar-Oberfläche RTL) statt des Testkurses; gewählt wird ohne Kenntnis der Lösung (erste Option), der Lernpfad zeigt alle
// echten Einheiten.
// Aufruf: node inp-spieler.mjs [--laeufe 3] [--drossel 6] [--echt] [--aus name]
import { parseArgs } from 'node:util';
import { BASIS, LAST_GRENZE, last, lernTexte, median, schreibe, starteBrowser, warteAufLast } from './gemeinsam.mjs';
import { ECHT } from './routen.mjs';

const { values } = parseArgs({
  options: {
    laeufe: { type: 'string', default: '3' },
    drossel: { type: 'string', default: '6' },
    echt: { type: 'boolean', default: false },
    aus: { type: 'string' },
  },
});
values.aus ??= values.echt ? 'inp-echt' : 'inp';
const LAEUFE = Math.max(1, Number(values.laeufe));
const DROSSEL = Number(values.drossel);
const de = lernTexte('de');
const f = (vorlage, werte) => vorlage.replace(/\{(\w+)\}/g, (_, k) => String(werte[k]));

function BEOBACHTER() {
  // Jede Interaktion sofort an Node melden (`__inpMelde`, exposeFunction): Die Kurskarte ist ein gewöhnlicher Link, „Lernpfad
  // öffnen“ wechselt also das Dokument – Einträge des alten Dokuments wären danach verloren. Zeiten absolut (timeOrigin +
  // startTime), Kennung je Dokument (interactionId zählt je Dokument neu).
  try {
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries())
        if (e.interactionId)
          window.__inpMelde?.({
            id: `${performance.timeOrigin}-${e.interactionId}`,
            name: e.name,
            start: performance.timeOrigin + e.startTime,
            dauer: e.duration,
            verarbeitung: e.processingEnd - e.processingStart,
            verzoegerung: e.processingStart - e.startTime,
          });
    }).observe({ type: 'event', durationThreshold: 16, buffered: true });
  } catch {
    /* Event Timing fehlt */
  }
}

/** Zwei Bilder abwarten (der Spieler setzt den Fokus im nächsten Bild). */
const bilder = (s) => s.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
const knopf = (s, name) => s.getByRole('button', { name, exact: true });
const radio = (s, name) => s.locator('main label').filter({ has: s.getByRole('radio', { name, exact: true }) });

async function pruefenWeiter(s, schritt) {
  await schritt('pruefen', () => knopf(s, de.spieler.pruefen).tap());
  await knopf(s, de.spieler.weiter).waitFor();
  await schritt('weiter', () => knopf(s, de.spieler.weiter).tap());
}

const SZENARIEN = [
  {
    name: 'Spieler l01 (Auswahl, Paare, Wortbank)',
    pfad: '/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l01',
    bereit: (s) => s.getByRole('radio', { name: 'Wasser', exact: true }).waitFor({ state: 'attached', timeout: 60_000 }),
    ablauf: async (s, schritt) => {
      await schritt('antwortWaehlen', () => radio(s, 'Wasser').tap());
      await pruefenWeiter(s, schritt);
      await knopf(s, 'su').waitFor({ timeout: 30_000 });
      for (const [a, b] of [
        ['su', 'Wasser'],
        ['ekmek', 'Brot'],
        ['ev', 'Haus'],
        ['kitap', 'Buch'],
      ]) {
        await schritt('paareAntippen', () => knopf(s, a).tap());
        await schritt('paareAntippen', () => knopf(s, b).tap());
      }
      await knopf(s, de.spieler.weiter).waitFor();
      await schritt('weiter', () => knopf(s, de.spieler.weiter).tap());
      const kachel = (w) => knopf(s, f(de.aufgaben.wortbank.hinzufuegen, { wort: w }));
      await kachel('Su').waitFor({ timeout: 30_000 });
      for (const w of ['Su', 'içiyorum']) {
        await schritt('wortbankAntippen', () => kachel(w).tap());
        await kachel(w).waitFor({ state: 'detached' });
      }
      await pruefenWeiter(s, schritt);
    },
  },
  {
    name: 'Spieler l03 (Bildkarte, Freitext mit Tastatur)',
    pfad: '/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l03',
    bereit: (s) => s.locator('main input[type="radio"]').first().waitFor({ state: 'attached', timeout: 60_000 }),
    ablauf: async (s, schritt) => {
      await schritt('antwortWaehlen', () =>
        s
          .locator('main label')
          .filter({ has: s.locator('input[type="radio"]') })
          .first()
          .tap(),
      );
      await pruefenWeiter(s, schritt);
      const feld = s.locator('main input[type="text"], main textarea').first();
      await feld.waitFor({ timeout: 30_000 });
      await feld.tap();
      await bilder(s);
      await schritt('tastaturEingabe', () => s.keyboard.type('ekmek', { delay: 150 }));
      await pruefenWeiter(s, schritt);
    },
  },
  {
    name: 'Spieler l03 ar-aus-de (Freitext mit Bildschirmtastatur)',
    pfad: '/lern-app/de/ar-aus-de/ueben?l=ar-aus-de.a1.test.l03',
    bereit: (s) => s.locator('main input[type="radio"]').first().waitFor({ state: 'attached', timeout: 60_000 }),
    ablauf: async (s, schritt) => {
      await schritt('antwortWaehlen', () =>
        s
          .locator('main label')
          .filter({ has: s.locator('input[type="radio"]') })
          .first()
          .tap(),
      );
      await pruefenWeiter(s, schritt);
      const schalter = s.locator('main button[aria-expanded][aria-controls]').filter({ hasText: de.tastatur.arabisch }).first();
      await schalter.waitFor({ timeout: 30_000 });
      await schritt('tastaturOeffnen', () => schalter.tap());
      const tasten = s.getByRole('toolbar', { name: de.tastatur.arabisch }).getByRole('button');
      await tasten.first().waitFor({ timeout: 30_000 });
      for (const n of [10, 11, 12]) await schritt('bildschirmtastatur', () => tasten.nth(n).tap());
      await pruefenWeiter(s, schritt);
    },
  },
  {
    name: 'Lernpfad öffnen (Start → Lernpfad) und Einheit offline speichern',
    pfad: '/lern-app/de',
    bereit: (s) => s.locator('main a[href="/lern-app/de/tr-aus-de"]').first().waitFor({ timeout: 60_000 }),
    ablauf: async (s, schritt, mess) => {
      // Antippen der Kurskarte (gewöhnlicher Link, Dokumentwechsel) bis die Lektionen sichtbar sind; die Interaktion selbst
      // meldet das alte Dokument, die Ladezeit bis zu den Lektionen steht getrennt als „Öffnen“
      const t0 = Date.now();
      await schritt('lernpfadOeffnen', async () => {
        await s.locator('main a[href="/lern-app/de/tr-aus-de"]').first().tap();
        await s.waitForURL(/\/lern-app\/de\/tr-aus-de$/);
        await s.locator('main a[href*="/ueben?l="]').first().waitFor({ timeout: 60_000 });
      });
      mess.oeffnenMs = Date.now() - t0;
      const speichern = knopf(s, de.lernpfad.offline);
      if (await speichern.count()) await schritt('offlineSpeichern', () => speichern.first().tap());
    },
  },
];

/** Erste Option der aktuellen Auswahl antippen (ohne Kenntnis der Lösung), dann Prüfen und Weiter (Texte der Oberfläche). */
async function ersteOptionPruefenWeiter(s, schritt, t) {
  await s.locator('main input[type="radio"]').first().waitFor({ state: 'attached', timeout: 30_000 });
  await schritt('antwortWaehlen', () =>
    s
      .locator('main label')
      .filter({ has: s.locator('input[type="radio"]') })
      .first()
      .tap(),
  );
  await schritt('pruefen', () => knopf(s, t.spieler.pruefen).tap());
  await knopf(s, t.spieler.weiter).waitFor();
  await schritt('weiter', () => knopf(s, t.spieler.weiter).tap());
}

/** Paare: je ein Wort der linken und der rechten Liste antippen (zwei Paare, richtig oder nicht). */
async function paareAntippen(s, schritt) {
  const listen = s.locator('main form[data-aufgabe="paare"] ul');
  await listen.nth(1).locator('button').first().waitFor({ timeout: 30_000 });
  for (const n of [0, 1]) {
    await schritt('paareAntippen', () => listen.nth(0).locator('button').nth(n).tap());
    await schritt('paareAntippen', () => listen.nth(1).locator('button').nth(n).tap());
  }
}

const SZENARIEN_ECHT = [
  {
    name: `Spieler echt ${ECHT.a1} (Auswahl, Auswahl, Paare)`,
    pfad: `/lern-app/de/tr-aus-de/ueben?l=${ECHT.a1}`,
    bereit: (s) => s.locator('main input[type="radio"]').first().waitFor({ state: 'attached', timeout: 60_000 }),
    ablauf: async (s, schritt) => {
      await ersteOptionPruefenWeiter(s, schritt, de);
      await ersteOptionPruefenWeiter(s, schritt, de);
      await paareAntippen(s, schritt);
    },
  },
  {
    // gemessen wird „Weiter lesen“: In tr.b1.e01.l06 erreichen die sechs Schritte noch keine Frage (Stand 26.10.2026); erscheint
    // eine, wird sie gewählt und geprüft
    name: `Spieler echt ${ECHT.b1Geschichte} (Geschichte zuerst: Weiter lesen)`,
    pfad: `/lern-app/de/tr-aus-de/ueben?l=${ECHT.b1Geschichte}`,
    bereit: (s) => s.locator('main form[data-aufgabe="geschichte"] li').first().waitFor({ state: 'attached', timeout: 60_000 }),
    ablauf: async (s, schritt) => {
      const g = de.aufgaben2.geschichte;
      const letzte = 'main form[data-aufgabe="geschichte"] li:last-child';
      for (let i = 0; i < 6; i++) {
        const frage = s.locator(`${letzte} input[type="radio"]:not(:disabled)`);
        if (await frage.count()) {
          await schritt('antwortWaehlen', () => s.locator(`${letzte} label`).filter({ has: frage.first() }).first().tap());
          await schritt('fragePruefen', () => knopf(s, g.fragePruefen).tap());
          continue;
        }
        const weiterLesen = knopf(s, g.weiterLesen);
        if (!(await weiterLesen.count())) break;
        await schritt('weiterLesen', () => weiterLesen.tap());
      }
    },
  },
  {
    name: `Spieler echt ar-Oberfläche ${ECHT.ar} (RTL: Auswahl, Auswahl, Paare)`,
    pfad: `/lern-app/ar/de-aus-ar/ueben?l=${ECHT.ar}`,
    bereit: (s) => s.locator('main input[type="radio"]').first().waitFor({ state: 'attached', timeout: 60_000 }),
    ablauf: async (s, schritt) => {
      const ar = lernTexte('ar');
      await ersteOptionPruefenWeiter(s, schritt, ar);
      await ersteOptionPruefenWeiter(s, schritt, ar);
      await paareAntippen(s, schritt);
    },
  },
  // Lernpfad mit allen echten Einheiten (A1–B1) öffnen und die erste Einheit offline speichern
  SZENARIEN[SZENARIEN.length - 1],
];

const browser = await starteBrowser();
const ergebnis = { basis: BASIS, drossel: DROSSEL, laeufe: LAEUFE, echt: values.echt, schwelleMs: 200, szenarien: [] };
/** Drei (--laeufe) Läufe eines Szenarios. */
async function messe(sz) {
  const laeufe = [];
  for (let n = 1; n <= LAEUFE; n++) {
    const kontext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const seite = await kontext.newPage();
    const gesammelt = [];
    await seite.exposeFunction('__inpMelde', (e) => void gesammelt.push(e));
    await seite.addInitScript(BEOBACHTER);
    const cdp = await kontext.newCDPSession(seite);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });
    const lastVorher = last();
    const marken = [];
    const mess = {};
    let fehler = null;
    const schritt = async (name, fn) => {
      marken.push({ name, ab: await seite.evaluate(() => performance.timeOrigin + performance.now()), url: seite.url() });
      await fn();
      await bilder(seite);
    };
    try {
      await seite.goto(`${BASIS}${sz.pfad}`, { waitUntil: 'load', timeout: 90_000 });
      await sz.bereit(seite);
      await bilder(seite);
      await sz.ablauf(seite, schritt, mess);
      await seite.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    } catch (e) {
      fehler = String(e.message ?? e).split('\n')[0];
    }
    // gemeldete Einträge der letzten Bilder abwarten (Bindung ist asynchron)
    await bilder(seite).catch(() => undefined);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }).catch(() => undefined);
    await kontext.close();
    const jeInteraktion = new Map();
    for (const e of gesammelt) {
      const alt = jeInteraktion.get(e.id);
      if (!alt || e.dauer > alt.dauer) jeInteraktion.set(e.id, e);
    }
    // Marken und Einträge auf derselben absoluten Zeitachse (über Seitenwechsel hinweg)
    const zuordnen = (t) => [...marken].reverse().find((m) => m.ab <= t)?.name ?? 'vorher';
    const liste = [...jeInteraktion.values()].map((e) => ({ ...e, schritt: zuordnen(e.start) })).sort((a, b) => b.dauer - a.dauer);
    const jeSchritt = {};
    for (const e of liste) jeSchritt[e.schritt] = Math.max(jeSchritt[e.schritt] ?? 0, Math.round(e.dauer));
    const inp = liste.length ? Math.round(liste[0].dauer) : null;
    laeufe.push({
      lauf: n,
      fehler,
      last: lastVorher,
      interaktionen: liste.length,
      inpMs: inp,
      jeSchrittMs: jeSchritt,
      ...mess,
      laengste: liste.slice(0, 3).map((e) => ({
        schritt: e.schritt,
        name: e.name,
        dauerMs: Math.round(e.dauer),
        verarbeitungMs: Math.round(e.verarbeitung),
        verzoegerungMs: Math.round(e.verzoegerung),
      })),
    });
    console.log(
      `${sz.name} Lauf ${n}: INP ${inp ?? '–'} ms · ${JSON.stringify(jeSchritt)}${mess.oeffnenMs ? ` · Öffnen ${mess.oeffnenMs} ms` : ''} · Last ${lastVorher.l1}${fehler ? ` · FEHLER ${fehler}` : ''}`,
    );
  }
  return laeufe;
}

const median2 = (laeufe) => median(laeufe.map((l) => l.inpMs ?? NaN));
const lastMax = (laeufe) => Math.max(...laeufe.map((l) => l.last.l1));
// Lastregel (Auftrag L8-02 Nr. 5): über 200 ms bei Last > 1,5 einmal nachmessen, sobald die Last sinkt (höchstens 5 min,
// nach einem vergeblichen Warten 2 min); sonst „unter Last“
let wartenMs = 5 * 60_000;
for (const sz of values.echt ? SZENARIEN_ECHT : SZENARIEN) {
  let laeufe = await messe(sz);
  let nachgemessen = null;
  if (median2(laeufe) > 200 && lastMax(laeufe) > LAST_GRENZE) {
    const warten = await warteAufLast(LAST_GRENZE, wartenMs);
    console.log(
      `${sz.name}: INP ${median2(laeufe)} ms bei Last ${lastMax(laeufe)} – Last jetzt ${warten.l1} (${warten.erreicht ? 'gesunken' : 'nicht gesunken'})`,
    );
    if (warten.erreicht) {
      nachgemessen = { inpMedianMs: median2(laeufe), lastMax: lastMax(laeufe) };
      laeufe = await messe(sz);
    } else wartenMs = 2 * 60_000;
  }
  const schritte = [...new Set(laeufe.flatMap((l) => Object.keys(l.jeSchrittMs)))];
  const jeSchrittMedian = Object.fromEntries(schritte.map((k) => [k, median(laeufe.map((l) => l.jeSchrittMs[k] ?? NaN))]));
  ergebnis.szenarien.push({
    name: sz.name,
    pfad: sz.pfad,
    inpMedianMs: median(laeufe.map((l) => l.inpMs ?? NaN)),
    jeSchrittMedianMs: jeSchrittMedian,
    oeffnenMedianMs: laeufe.some((l) => l.oeffnenMs) ? median(laeufe.map((l) => l.oeffnenMs ?? NaN)) : null,
    lastMax: lastMax(laeufe),
    unterLast: median2(laeufe) > 200 && lastMax(laeufe) > LAST_GRENZE,
    nachgemessen,
    fehler: laeufe.filter((l) => l.fehler).map((l) => `Lauf ${l.lauf}: ${l.fehler}`),
    laeufe,
  });
}
await browser.close();

const md = [
  `# INP (Labor) · CPU ×${DROSSEL} · ${LAEUFE} Läufe je Szenario · ${values.echt ? 'echte Lektionen' : 'Testkurs'} · ${BASIS}`,
  '',
  '| Szenario | INP Median (ms) | je Schritt (Median, ms) | Öffnen (ms) | Last (max) | Ergebnis | Fehler |',
  '|---|---|---|---|---|---|---|',
  ...ergebnis.szenarien.map(
    (z) =>
      `| ${z.name} | ${z.inpMedianMs} | ${Object.entries(z.jeSchrittMedianMs)
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ' · ',
        )} | ${z.oeffnenMedianMs ?? '–'} | ${z.lastMax} | ${z.inpMedianMs <= 200 ? 'erfüllt' : `verfehlt${z.unterLast ? ' (unter Last)' : ''}`}${z.nachgemessen ? ` · nachgemessen (vorher ${z.nachgemessen.inpMedianMs} ms bei Last ${z.nachgemessen.lastMax})` : ''} | ${z.fehler.length ? z.fehler.join('; ') : '–'} |`,
  ),
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, ergebnis);
console.log(md);
