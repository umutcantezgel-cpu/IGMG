#!/usr/bin/env node
// Prüfwerkzeug d: Lighthouse mobil je Route, Median aus --laeufe Läufen (Standard 3).
// Je Lauf zwei Messungen wie web/scripts/messen.mjs: „devtools“ (angewandte Drosselung, maßgeblich, alle vier
// Kategorien) und „simulate“ (Lighthouse-Standard, nur Performance und LCP, zum Vergleich).
// Medianwerte: Performance, Barrierefreiheit, Best Practices, SEO, LCP, CLS, TBT; zusätzlich JS (gzip) je Route.
// Schwellen aus messen.mjs bzw. AUFTRAG §0. Befunde stehen im Protokoll; Exit-Code 0 auch bei verfehlten Schwellen.
// Aufruf: node lighthouse.mjs --routen datei.json [--laeufe 3] [--basis URL] [--zustand storageState.json] [--protokoll basisname]
//        [--wiederbesuch]
// --wiederbesuch: vor jeder Messung Speicher der Herkunft und HTTP-Cache leeren, nur den Merker des Konzept-Hinweises
// setzen (localStorage), Lighthouse ohne Speicher-Reset – Wiederbesuch mit leerem Cache. Ohne die Option: Erstbesuch
// (Lighthouse leert den Speicher, der Hinweis öffnet).
// CHROME_PATH setzt den Chromium-Pfad (Standard: /opt/pw-browsers). Vollständige Berichte: SCRATCHPAD/lighthouse/.
// Nicht parallel zu anderen schweren Läufen starten (4 Kerne).
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import lighthouse from 'lighthouse';
import {
  KONZEPTHINWEIS,
  SCRATCHPAD,
  basisAdresse,
  dateiname,
  hilfeAusgeben,
  lesePfade,
  median,
  schreibeProtokoll,
  standardProtokoll,
  starteBrowser,
  starteProfilBrowser,
  vollerUrl,
} from './hilfen.mjs';

const HILFE = `Aufruf: node lighthouse.mjs --routen datei.json [--laeufe 3] [--basis URL] [--zustand storageState.json] [--protokoll basisname] [--wiederbesuch]
Beispiel: node lighthouse.mjs --routen routen-hauptansichten.json --laeufe 3
Wiederbesuch (Konzept-Hinweis gesehen, leerer HTTP-Cache): node lighthouse.mjs --routen routen-hauptansichten.json --wiederbesuch
Zum Funktionsnachweis: node lighthouse.mjs --routen <datei mit einer Route> --laeufe 1`;

/** Schwellen wie web/scripts/messen.mjs (tbt: dort 200 ms als Labor-Ersatz für INP). */
const SCHWELLEN = { performance: 90, accessibility: 100, 'best-practices': 95, seo: 95, lcpMs: 2500, cls: 0.1, tbtMs: 200, jsKb: 180 };

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    laeufe: { type: 'string', default: '3' },
    basis: { type: 'string' },
    protokoll: { type: 'string' },
    zustand: { type: 'string' },
    wiederbesuch: { type: 'boolean', default: false },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || !values.routen) hilfeAusgeben(HILFE);

const basis = basisAdresse(values.basis);
const laeufe = Math.max(1, Number(values.laeufe));
const routen = lesePfade(values.routen);
const zeit = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const berichtOrdner = join(SCRATCHPAD, 'lighthouse', zeit);
mkdirSync(berichtOrdner, { recursive: true });

/** Anmeldestand (storageState) als Cookie-Kopfzeile für den Host der Basis (Verwaltungsansichten, nur lesend). */
const kopfzeilen = (() => {
  if (!values.zustand) return undefined;
  const host = new URL(basis).hostname;
  const kekse = JSON.parse(readFileSync(values.zustand, 'utf8')).cookies.filter((k) => host.endsWith(k.domain.replace(/^\./, '')));
  return kekse.length ? { Cookie: kekse.map((k) => `${k.name}=${k.value}`).join('; ') } : undefined;
})();

const wiederbesuch = values.wiederbesuch;
const besuch = wiederbesuch ? 'Wiederbesuch (Merker des Konzept-Hinweises gesetzt, leerer HTTP-Cache)' : 'Erstbesuch';

/**
 * Eine Messung; ein Lauf mit Laufzeitfehler von Lighthouse (z. B. NO_NAVSTART: Spur ohne Navigationsbeginn) wird bis zu
 * zweimal wiederholt und im Protokoll gezählt, statt als Leistung 0 in den Median zu gehen.
 */
let wiederholungen = 0;
async function messe(url, port, drosselung) {
  for (let versuch = 1; ; versuch++) {
    const ergebnis = await messeEinmal(url, port, drosselung);
    const fehler = ergebnis?.lhr?.runtimeError?.code;
    if (!fehler || versuch === 3) return ergebnis;
    wiederholungen++;
    console.log(`${url} (${drosselung}): Laufzeitfehler ${fehler}, Wiederholung ${versuch}`);
  }
}

/** Eine Messung mit dem Lighthouse-Eintrag aus messen.mjs. */
async function messeEinmal(url, port, drosselung) {
  if (wiederbesuch) await merkerSetzen(url);
  const optionen = {
    port,
    output: 'json',
    logLevel: 'error',
    ...(kopfzeilen ? { extraHeaders: kopfzeilen } : {}),
    ...(wiederbesuch ? { disableStorageReset: true } : {}),
  };
  if (drosselung === 'devtools') {
    return lighthouse(url, { ...optionen, onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], throttlingMethod: 'devtools' });
  }
  return lighthouse(url, { ...optionen, onlyCategories: ['performance'], throttlingMethod: 'simulate' });
}

const port = 9300 + Math.floor(Math.random() * 400);
const profil = wiederbesuch ? mkdtempSync(join(SCRATCHPAD, 'lh-profil-')) : null;
const browser = profil
  ? await starteProfilBrowser(profil, { headless: true, args: [`--remote-debugging-port=${port}`] })
  : await starteBrowser({ args: [`--remote-debugging-port=${port}`] });

/** Wiederbesuch: Speicher der Herkunft leeren (alles, auch Service Worker), nur den Merker setzen, HTTP-Cache leeren. */
async function merkerSetzen(url) {
  const herkunft = new URL(url).origin;
  const seite = await browser.newPage();
  try {
    const cdp = await browser.newCDPSession(seite);
    // Service Worker früherer Läufe beenden (sonst laufen sie im Profil weiter), dann den Speicher leeren
    await cdp.send('ServiceWorker.enable');
    await cdp.send('ServiceWorker.stopAllWorkers');
    await cdp.send('Storage.clearDataForOrigin', { origin: herkunft, storageTypes: 'all' });
    await cdp.send('Network.enable');
    await cdp.send('Network.clearBrowserCache');
    await seite.goto(`${herkunft}/robots.txt`);
    await seite.evaluate(async (schluessel) => {
      // Anmeldungen, die das Leeren noch nicht entfernt hat, ausdrücklich abmelden (der Worker der Seite hält sonst Seiten vor)
      for (const anmeldung of await navigator.serviceWorker.getRegistrations()) await anmeldung.unregister();
      localStorage.setItem(schluessel, '1');
    }, KONZEPTHINWEIS);
    await cdp.send('Network.clearBrowserCache');
  } finally {
    await seite.close();
  }
}

/** Selektor des LCP-Elements gekürzt auf die letzten ganzen Glieder (höchstens etwa 70 Zeichen). */
function selektorKurz(selektor) {
  const glieder = selektor.split(' > ');
  let kurz = glieder.pop();
  while (glieder.length && kurz.length + glieder.at(-1).length + 3 <= 70) kurz = `${glieder.pop()} > ${kurz}`;
  return kurz;
}

const auswertung = [];
try {
  for (const route of routen) {
    const url = vollerUrl(basis, route.pfad);
    const name = dateiname(route.pfad);
    const laufe = [];
    for (let n = 1; n <= laeufe; n++) {
      const dt = await messe(url, port, 'devtools');
      const sim = await messe(url, port, 'simulate');
      if (!dt || !sim) throw new Error(`Keine Messung für ${url} (Lauf ${n})`);
      writeFileSync(join(berichtOrdner, `${name}-lauf${n}-devtools.report.json`), dt.report);
      writeFileSync(join(berichtOrdner, `${name}-lauf${n}-simulate.report.json`), sim.report);
      const lhr = dt.lhr;
      const a = lhr.audits;
      const kat = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
      const skripte = (a['network-requests']?.details?.items ?? []).filter((r) => r.resourceType === 'Script');
      // LCP-Element: Lighthouse 13 führt es in lcp-breakdown-insight (Eintrag vom Typ „node“), ältere Fassungen in
      // largest-contentful-paint-element. Nur der Selektor, kein Text (Leseseiten: keine religiösen Texte im Protokoll).
      const lcpKnoten = ['lcp-breakdown-insight', 'largest-contentful-paint-element']
        .flatMap((id) => a[id]?.details?.items ?? [])
        .flatMap((e) => [e, e.node, ...(e.items ?? []).map((i) => i.node)])
        .find((e) => e?.type === 'node' && e.selector);
      laufe.push({
        lauf: n,
        performance: kat.performance,
        accessibility: kat.accessibility,
        'best-practices': kat['best-practices'],
        seo: kat.seo,
        lcpMs: Math.round(a['largest-contentful-paint']?.numericValue ?? NaN),
        cls: Number((a['cumulative-layout-shift']?.numericValue ?? NaN).toFixed(3)),
        tbtMs: Math.round(a['total-blocking-time']?.numericValue ?? NaN),
        jsKb: Math.round((skripte.reduce((s, r) => s + (r.transferSize ?? 0), 0) / 1024) * 10) / 10,
        lcpElement: lcpKnoten ? selektorKurz(lcpKnoten.selector) : '',
        simuliert: {
          performance: Math.round((sim.lhr.categories.performance.score ?? 0) * 100),
          lcpMs: Math.round(sim.lhr.audits['largest-contentful-paint']?.numericValue ?? NaN),
        },
      });
      console.log(`${route.pfad} Lauf ${n}/${laeufe}: P ${laufe.at(-1).performance} · A ${laufe.at(-1).accessibility} · BP ${laufe.at(-1)['best-practices']} · SEO ${laufe.at(-1).seo} · LCP ${laufe.at(-1).lcpMs} ms · CLS ${laufe.at(-1).cls} · TBT ${laufe.at(-1).tbtMs} ms · LCP-Element ${laufe.at(-1).lcpElement || '–'}`);
    }
    const med = (feld) => median(laufe.map((l) => l[feld]));
    const mittel = {
      performance: med('performance'),
      accessibility: med('accessibility'),
      'best-practices': med('best-practices'),
      seo: med('seo'),
      lcpMs: med('lcpMs'),
      cls: Number(med('cls').toFixed(3)),
      tbtMs: med('tbtMs'),
      jsKb: Math.round(med('jsKb') * 10) / 10,
      simuliertPerformance: median(laufe.map((l) => l.simuliert.performance)),
      simuliertLcpMs: median(laufe.map((l) => l.simuliert.lcpMs)),
    };
    const verfehlt = [
      mittel.performance < SCHWELLEN.performance && 'Performance',
      mittel.accessibility < SCHWELLEN.accessibility && 'Barrierefreiheit',
      mittel['best-practices'] < SCHWELLEN['best-practices'] && 'Best Practices',
      mittel.seo < SCHWELLEN.seo && 'SEO',
      mittel.lcpMs > SCHWELLEN.lcpMs && 'LCP',
      mittel.cls > SCHWELLEN.cls && 'CLS',
      mittel.tbtMs > SCHWELLEN.tbtMs && 'TBT',
      mittel.jsKb > SCHWELLEN.jsKb && 'JS',
    ].filter(Boolean);
    auswertung.push({
      name: route.name,
      pfad: route.pfad,
      laeufe: laufe,
      median: mittel,
      spanneLeistung: [Math.min(...laufe.map((l) => l.performance)), Math.max(...laufe.map((l) => l.performance))],
      verfehlt,
    });
  }
} finally {
  await browser.close();
  if (profil) rmSync(profil, { recursive: true, force: true });
}

const md = [
  `# Lighthouse mobil (Median aus ${laeufe} ${laeufe === 1 ? "Lauf" : "Läufen"}) · ${besuch} · ${zeit} · ${basis}`,
  '',
  `Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ ${SCHWELLEN.performance}, Barrierefreiheit ${SCHWELLEN.accessibility}, Best Practices ≥ ${SCHWELLEN['best-practices']}, SEO ≥ ${SCHWELLEN.seo}, LCP ≤ ${SCHWELLEN.lcpMs} ms, CLS ≤ ${SCHWELLEN.cls}, TBT ≤ ${SCHWELLEN.tbtMs} ms, JS ≤ ${SCHWELLEN.jsKb} kB (gzip).`,
  '',
  '| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...auswertung.map(
    (z) =>
      `| ${z.pfad} | ${z.median.performance} | ${z.median.accessibility} | ${z.median['best-practices']} | ${z.median.seo} | ${z.median.lcpMs} | ${z.median.cls} | ${z.median.tbtMs} | ${z.median.jsKb} | (${z.median.simuliertPerformance} / ${z.median.simuliertLcpMs} ms) | ${z.spanneLeistung[0]}–${z.spanneLeistung[1]} | ${z.verfehlt.length ? `verfehlt: ${z.verfehlt.join(', ')}` : 'erfüllt'} |`,
  ),
  ...(wiederholungen ? ['', `Wiederholte Läufe nach Laufzeitfehler von Lighthouse: ${wiederholungen}`] : []),
  '',
  'LCP-Element je Lauf (devtools):',
  '',
  ...auswertung.map((z) => `- ${z.pfad}: ${z.laeufe.map((l) => `${l.lcpMs} ms ${l.lcpElement || '–'}`).join(' · ')}`),
  '',
  `Vollständige Berichte (je Lauf): ${berichtOrdner}`,
].join('\n');
const protokoll = values.protokoll ?? standardProtokoll('lighthouse');
const dateien = schreibeProtokoll(protokoll, { json: { werkzeug: 'lighthouse', zeit, basis, besuch, laeufe, wiederholungen, schwellen: SCHWELLEN, routen: auswertung }, md });
console.log(`Protokoll: ${dateien.join(', ')}`);
console.log(`Vollberichte: ${berichtOrdner}`);
