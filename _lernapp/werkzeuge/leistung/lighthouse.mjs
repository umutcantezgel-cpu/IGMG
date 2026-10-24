#!/usr/bin/env node
// Lighthouse mobil je Route der Lern-App (L8-02), Median aus --laeufe Läufen (Standard 3). Kopie und Anpassung von
// _gemeinde/werkzeuge/lighthouse.mjs (dort unverändert):
// - Drosselung „devtools“ mit dem mobilen Profil (Nennwerte 150 ms RTT, 1,6 Mbit/s, CPU ×4 – maßgeblich gegen localhost,
//   E-026). Angewandt werden bei „devtools“ laut configSettings 562,5 ms Anfragelatenz (RTT × 3,75) und 1474,56 kbit/s
//   (Durchsatz × 0,9) – strenger als die Nennwerte. „simulate“ nur mit --simulate (gegen localhost zu pessimistisch).
// - Schwellen je Art (routen.mjs): JS gesamt 180/210/230 KB nach KERN 4.0 §9; SEO nur auf indexierbaren Seiten.
// - JS je Route als Summe gz -9 je Datei (wie scripts/lernapp-budget.mjs), dazu die Übertragungsgröße laut Lighthouse.
// - Je Route die Last der Maschine (`uptime`); verfehlt eine Route eine Schwelle bei Last > 1,5, wird sie einmal nachgemessen,
//   sobald die Last sinkt (höchstens 10 min warten), sonst als „unter Last“ ausgewiesen.
// - Anmeldung (Mein Bereich): storageState je Route (`zustand`) als Cookie-Kopfzeile.
// Aufruf: node lighthouse.mjs --routen <datei.json> [--laeufe 3] [--simulate] [--aus name]
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import lighthouse from 'lighthouse';
import {
  BASIS,
  LAST_GRENZE,
  cookieKopf,
  dateiname,
  gzKb,
  last,
  median,
  runde,
  schreibe,
  starteBrowser,
  warteAufLast,
} from './gemeinsam.mjs';
import { JS_GRENZE } from './routen.mjs';

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    laeufe: { type: 'string', default: '3' },
    simulate: { type: 'boolean', default: false },
    aus: { type: 'string', default: 'lighthouse' },
    nachmessen: { type: 'boolean', default: true },
  },
});
const routen = JSON.parse(readFileSync(values.routen, 'utf8'));
const LAEUFE = Math.max(1, Number(values.laeufe));
const SCHWELLEN = { performance: 90, accessibility: 100, 'best-practices': 95, seo: 95, lcpMs: 2500, cls: 0.1, tbtMs: 200 };

const port = 9300 + Math.floor(Math.random() * 400);
const browser = await starteBrowser({ args: [`--remote-debugging-port=${port}`] });

async function messeEinmal(url, kopf, drosselung) {
  const optionen = { port, output: 'json', logLevel: 'error', ...(kopf ? { extraHeaders: kopf } : {}) };
  for (let versuch = 1; ; versuch++) {
    const e =
      drosselung === 'devtools'
        ? await lighthouse(url, {
            ...optionen,
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            throttlingMethod: 'devtools',
          })
        : await lighthouse(url, { ...optionen, onlyCategories: ['performance'], throttlingMethod: 'simulate' });
    if (!e?.lhr?.runtimeError?.code || versuch === 3) return e;
    console.log(`${url}: Laufzeitfehler ${e.lhr.runtimeError.code}, Wiederholung ${versuch}`);
  }
}

async function lauf(route, n) {
  const url = `${BASIS}${route.pfad}`;
  const kopf = cookieKopf(route.zustand);
  const lastVorher = last();
  const dt = await messeEinmal(url, kopf, 'devtools');
  const sim = values.simulate ? await messeEinmal(url, kopf, 'simulate') : null;
  const lhr = dt.lhr;
  const a = lhr.audits;
  const kat = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
  const skripte = (a['network-requests']?.details?.items ?? []).filter((r) => r.resourceType === 'Script');
  const eigen = skripte.filter((r) => r.url.startsWith(BASIS));
  const gz = (await Promise.all(eigen.map((r) => gzKb(r.url, kopf)))).reduce((s, x) => s + (Number.isFinite(x) ? x : 0), 0);
  const lcpKnoten = ['lcp-breakdown-insight', 'largest-contentful-paint-element']
    .flatMap((id) => a[id]?.details?.items ?? [])
    .flatMap((e) => [e, e.node, ...(e.items ?? []).map((i) => i.node)])
    .find((e) => e?.type === 'node' && e.selector);
  const offen = Object.values(lhr.categories)
    .flatMap((k) => k.auditRefs.filter((r) => r.weight > 0).map((r) => a[r.id]))
    .filter((x) => x && x.score !== null && x.score < 0.9)
    .map((x) => x.id);
  const w = {
    lauf: n,
    endUrl: lhr.finalDisplayedUrl?.replace(BASIS, '') ?? '',
    performance: kat.performance,
    accessibility: kat.accessibility,
    'best-practices': kat['best-practices'],
    seo: kat.seo,
    lcpMs: Math.round(a['largest-contentful-paint']?.numericValue ?? NaN),
    fcpMs: Math.round(a['first-contentful-paint']?.numericValue ?? NaN),
    cls: Number((a['cumulative-layout-shift']?.numericValue ?? NaN).toFixed(3)),
    tbtMs: Math.round(a['total-blocking-time']?.numericValue ?? NaN),
    jsKbGz: runde(gz),
    jsKbUebertragen: runde(skripte.reduce((s, r) => s + (r.transferSize ?? 0), 0) / 1024),
    jsDateien: eigen.length,
    drittanfragen: (a['network-requests']?.details?.items ?? []).filter((r) => !r.url.startsWith(BASIS) && !r.url.startsWith('data:'))
      .length,
    lcpElement: lcpKnoten ? lcpKnoten.selector.split(' > ').slice(-2).join(' > ') : '',
    offen,
    last: lastVorher,
    ...(sim
      ? {
          simuliert: {
            performance: Math.round((sim.lhr.categories.performance.score ?? 0) * 100),
            lcpMs: Math.round(sim.lhr.audits['largest-contentful-paint']?.numericValue ?? NaN),
          },
        }
      : {}),
  };
  // voller Bericht nur vom ersten Lauf je Route (Platte knapp; Fehlersuche: offene Prüfungen stehen in der Auswertung)
  if (n === 1) schreibe(`lighthouse-berichte/${dateiname(route.pfad)}.report.json`, dt.report);
  console.log(
    `${route.pfad} Lauf ${n}: P ${w.performance} · A ${w.accessibility} · BP ${w['best-practices']} · SEO ${w.seo} · LCP ${w.lcpMs} ms · CLS ${w.cls} · TBT ${w.tbtMs} ms · JS ${w.jsKbGz} KB gz · Last ${lastVorher.l1}`,
  );
  return w;
}

function bewerte(route, laeufe) {
  const med = (f) => median(laeufe.map((l) => l[f]));
  const m = {
    performance: med('performance'),
    accessibility: med('accessibility'),
    'best-practices': med('best-practices'),
    seo: med('seo'),
    lcpMs: med('lcpMs'),
    fcpMs: med('fcpMs'),
    cls: Number(med('cls').toFixed(3)),
    tbtMs: med('tbtMs'),
    jsKbGz: runde(med('jsKbGz')),
    jsKbUebertragen: runde(med('jsKbUebertragen')),
  };
  const grenze = JS_GRENZE[route.art] ?? 180;
  // Schwellen der Abnahme (KERN 4.0 §9, Z-L07): Leistung, Zugänglichkeit, LCP, CLS, JS gesamt je Art
  const verfehlt = [
    m.performance < SCHWELLEN.performance && 'Leistung',
    m.accessibility < SCHWELLEN.accessibility && 'Zugänglichkeit',
    m.lcpMs > SCHWELLEN.lcpMs && 'LCP',
    m.cls > SCHWELLEN.cls && 'CLS',
    m.jsKbGz > grenze && 'JS',
  ].filter(Boolean);
  // Hinweise (Website-Schwellen K-12; TBT ist nur der Labor-Ersatz für INP, maßgeblich ist inp-spieler.mjs)
  const hinweise = [
    m['best-practices'] < SCHWELLEN['best-practices'] && 'Best Practices',
    route.seo && m.seo < SCHWELLEN.seo && 'SEO',
    m.tbtMs > SCHWELLEN.tbtMs && 'TBT',
  ].filter(Boolean);
  const lastMax = Math.max(...laeufe.map((l) => l.last.l1));
  return { median: m, jsGrenze: grenze, verfehlt, hinweise, lastMax };
}

const auswertung = [];
// Wartezeit auf sinkende Last je Route: 5 min; ist sie einmal nicht gesunken, für die übrigen Routen nur noch 2 min
let wartenMs = 5 * 60_000;
try {
  for (const route of routen) {
    let laeufe = [];
    for (let n = 1; n <= LAEUFE; n++) laeufe.push(await lauf(route, n));
    let b = bewerte(route, laeufe);
    let nachgemessen = null;
    // Lastregel (Auftrag L8-02 Nr. 5): Last- und Zeitschwellen nur bei Last > 1,5 einmal nachmessen; JS und Zugänglichkeit
    // hängen nicht an der Last
    const lastAbhaengig = b.verfehlt.filter((v) => ['Leistung', 'LCP', 'CLS'].includes(v));
    if (values.nachmessen && lastAbhaengig.length && b.lastMax > LAST_GRENZE) {
      const warten = await warteAufLast(LAST_GRENZE, wartenMs);
      if (!warten.erreicht) wartenMs = 2 * 60_000;
      console.log(
        `${route.pfad}: verfehlt ${lastAbhaengig.join(', ')} bei Last ${b.lastMax} – Last jetzt ${warten.l1} (${warten.erreicht ? 'gesunken' : 'nicht gesunken'})`,
      );
      if (warten.erreicht) {
        const neu = [];
        for (let n = 1; n <= LAEUFE; n++) neu.push(await lauf(route, n));
        nachgemessen = { vorher: b, laeufe: laeufe };
        laeufe = neu;
        b = bewerte(route, laeufe);
      }
    }
    const unterLast = b.verfehlt.some((v) => ['Leistung', 'LCP', 'CLS'].includes(v)) && b.lastMax > LAST_GRENZE;
    auswertung.push({
      ...route,
      laeufe,
      ...b,
      unterLast,
      nachgemessen: nachgemessen
        ? { median: nachgemessen.vorher.median, verfehlt: nachgemessen.vorher.verfehlt, lastMax: nachgemessen.vorher.lastMax }
        : null,
    });
  }
} finally {
  await browser.close();
}

const md = [
  `# Lighthouse mobil (devtools, Median aus ${LAEUFE} Läufen) · ${BASIS}`,
  '',
  '| Route | Perf. | A11y | BP | SEO | LCP ms | CLS | TBT ms | JS KB gz (Grenze) | Last (max) | Ergebnis |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...auswertung.map(
    (z) =>
      `| ${z.pfad} | ${z.median.performance} | ${z.median.accessibility} | ${z.median['best-practices']} | ${z.seo ? z.median.seo : `(${z.median.seo})`} | ${z.median.lcpMs} | ${z.median.cls} | ${z.median.tbtMs} | ${z.median.jsKbGz} (${z.jsGrenze}) | ${z.lastMax} | ${z.verfehlt.length ? `verfehlt: ${z.verfehlt.join(', ')}${z.unterLast ? ' (unter Last)' : ''}` : 'erfüllt'}${z.hinweise.length ? ` · Hinweis: ${z.hinweise.join(', ')}` : ''}${z.nachgemessen ? ' · nachgemessen' : ''} |`,
  ),
].join('\n');
schreibe(`${values.aus}.md`, md);
schreibe(`${values.aus}.json`, { basis: BASIS, laeufe: LAEUFE, schwellen: SCHWELLEN, routen: auswertung });
console.log(md);
