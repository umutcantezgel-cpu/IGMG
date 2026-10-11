#!/usr/bin/env node
// Prüfwerkzeug d: Lighthouse mobil je Route, Median aus --laeufe Läufen (Standard 3).
// Je Lauf zwei Messungen wie web/scripts/messen.mjs: „devtools“ (angewandte Drosselung, maßgeblich, alle vier
// Kategorien) und „simulate“ (Lighthouse-Standard, nur Performance und LCP, zum Vergleich).
// Medianwerte: Performance, Barrierefreiheit, Best Practices, SEO, LCP, CLS, TBT; zusätzlich JS (gzip) je Route.
// Schwellen aus messen.mjs bzw. AUFTRAG §0. Befunde stehen im Protokoll; Exit-Code 0 auch bei verfehlten Schwellen.
// Aufruf: node lighthouse.mjs --routen datei.json [--laeufe 3] [--basis URL] [--protokoll basisname]
// CHROME_PATH setzt den Chromium-Pfad (Standard: /opt/pw-browsers). Vollständige Berichte: SCRATCHPAD/lighthouse/.
// Nicht parallel zu anderen schweren Läufen starten (4 Kerne).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import lighthouse from 'lighthouse';
import {
  SCRATCHPAD,
  basisAdresse,
  dateiname,
  hilfeAusgeben,
  lesePfade,
  median,
  schreibeProtokoll,
  standardProtokoll,
  starteBrowser,
  vollerUrl,
} from './hilfen.mjs';

const HILFE = `Aufruf: node lighthouse.mjs --routen datei.json [--laeufe 3] [--basis URL] [--protokoll basisname]
Beispiel: node lighthouse.mjs --routen routen-hauptansichten.json --laeufe 3
Zum Funktionsnachweis: node lighthouse.mjs --routen <datei mit einer Route> --laeufe 1`;

/** Schwellen wie web/scripts/messen.mjs (tbt: dort 200 ms als Labor-Ersatz für INP). */
const SCHWELLEN = { performance: 90, accessibility: 100, 'best-practices': 95, seo: 95, lcpMs: 2500, cls: 0.1, tbtMs: 200, jsKb: 180 };

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    laeufe: { type: 'string', default: '3' },
    basis: { type: 'string' },
    protokoll: { type: 'string' },
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

/** Eine Messung mit dem Lighthouse-Eintrag aus messen.mjs. */
async function messe(url, port, drosselung) {
  const optionen = { port, output: 'json', logLevel: 'error' };
  if (drosselung === 'devtools') {
    return lighthouse(url, { ...optionen, onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], throttlingMethod: 'devtools' });
  }
  return lighthouse(url, { ...optionen, onlyCategories: ['performance'], throttlingMethod: 'simulate' });
}

const port = 9300 + Math.floor(Math.random() * 400);
const browser = await starteBrowser({ args: [`--remote-debugging-port=${port}`] });
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
        simuliert: {
          performance: Math.round((sim.lhr.categories.performance.score ?? 0) * 100),
          lcpMs: Math.round(sim.lhr.audits['largest-contentful-paint']?.numericValue ?? NaN),
        },
      });
      console.log(`${route.pfad} Lauf ${n}/${laeufe}: P ${laufe.at(-1).performance} · A ${laufe.at(-1).accessibility} · BP ${laufe.at(-1)['best-practices']} · SEO ${laufe.at(-1).seo} · LCP ${laufe.at(-1).lcpMs} ms · CLS ${laufe.at(-1).cls} · TBT ${laufe.at(-1).tbtMs} ms`);
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
}

const md = [
  `# Lighthouse mobil (Median aus ${laeufe} ${laeufe === 1 ? "Lauf" : "Läufen"}) · ${zeit} · ${basis}`,
  '',
  `Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ ${SCHWELLEN.performance}, Barrierefreiheit ${SCHWELLEN.accessibility}, Best Practices ≥ ${SCHWELLEN['best-practices']}, SEO ≥ ${SCHWELLEN.seo}, LCP ≤ ${SCHWELLEN.lcpMs} ms, CLS ≤ ${SCHWELLEN.cls}, TBT ≤ ${SCHWELLEN.tbtMs} ms, JS ≤ ${SCHWELLEN.jsKb} kB (gzip).`,
  '',
  '| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...auswertung.map(
    (z) =>
      `| ${z.pfad} | ${z.median.performance} | ${z.median.accessibility} | ${z.median['best-practices']} | ${z.median.seo} | ${z.median.lcpMs} | ${z.median.cls} | ${z.median.tbtMs} | ${z.median.jsKb} | (${z.median.simuliertPerformance} / ${z.median.simuliertLcpMs} ms) | ${z.spanneLeistung[0]}–${z.spanneLeistung[1]} | ${z.verfehlt.length ? `verfehlt: ${z.verfehlt.join(', ')}` : 'erfüllt'} |`,
  ),
  '',
  `Vollständige Berichte (je Lauf): ${berichtOrdner}`,
].join('\n');
const protokoll = values.protokoll ?? standardProtokoll('lighthouse');
const dateien = schreibeProtokoll(protokoll, { json: { werkzeug: 'lighthouse', zeit, basis, laeufe, schwellen: SCHWELLEN, routen: auswertung }, md });
console.log(`Protokoll: ${dateien.join(', ')}`);
console.log(`Vollberichte: ${berichtOrdner}`);
