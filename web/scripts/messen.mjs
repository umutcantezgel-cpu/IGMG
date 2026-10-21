// T7 (K-12, Z-09): Lighthouse mobil auf den Messrouten + JavaScript beim ersten Laden (gzip).
// Aufruf: pnpm messen [basis-url] [pfad …]  – Standard: http://localhost:3100 und alle vorhandenen Messrouten (PLAN L8).
// Zwei Läufe je Route (E-026): „devtools“ (angewandte Drosselung: 150 ms RTT, 1,6 Mbit/s, CPU ×4 – maßgeblich gegen
// localhost) und „simulate“ (Lighthouse-Standard; gegen localhost systematisch zu pessimistisch, weil im
// ungedrosselten Trace alle Anfragen vor dem ersten Zeichnen starten). Bewertet wird devtools, berichtet beides.
// Ergebnis: _lauf/release/belege/lighthouse/<zeitstempel>/ergebnis.md (G-01: nur _lauf/release/ beschreibbar) (+ volle Berichte lokal);
// mit MESSEN_ZIEL=<ordner> dorthin (z. B. Scratchpad im Tor). Exit 1, wenn eine Schwelle verfehlt ist.
// Lern-App (KERN 4.0 §9, PLAN §13 „Leistung“): Messrouten /lern-app/de, /lern-app/ar/de-aus-ar und
// /lern-app/tr/de-aus-tr/ueben?l=… (Testkurs); JS-Grenze je Route (Start/Lernpfad 180 kB, Spieler-Route 210 kB); Übungsseiten
// sind `noindex` (Hülle ohne eigenen Inhalt), dort zählt SEO nicht.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const SCHWELLEN = { performance: 90, accessibility: 100, 'best-practices': 95, seo: 95, lcpMs: 2500, cls: 0.1, tbtMs: 200, jsKb: 180 };
/**
 * Lern-App: Spieler-Routen gesamt ≤ 210 kB (KERN 4.0 §9, Fortschreibung S1) – Üben, Wiederholen und Einstufung (L2-04);
 * diese Übungsseiten sind `noindex`, dort zählt SEO nicht.
 */
const LERNAPP_SPIELER = /^\/lern-app\/(de|tr|ar)\/[a-z-]+\/(ueben|wiederholen|einstufung)(\?|$)/;
const jsGrenze = (pfad) => (LERNAPP_SPIELER.test(pfad) ? 210 : SCHWELLEN.jsKb);
const mitSeo = (pfad) => !LERNAPP_SPIELER.test(pfad);
const LERNAPP_ROUTEN = ['/lern-app/de', '/lern-app/ar/de-aus-ar', '/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.e01.l01'];
const [basis = 'http://localhost:3100', ...pfadeArg] = process.argv.slice(2);

async function standardPfade() {
  const liste = await (await fetch(`${basis}/veranstaltungen`)).text();
  const detail = /href="(\/veranstaltungen\/[a-z0-9-]+)"/.exec(liste)?.[1];
  // Messrouten laut PLAN L8; noch nicht gebaute Seiten (404) werden übersprungen und genannt
  const kandidaten = ['/', '/gebetszeiten', '/veranstaltungen', detail, '/nachrichten', '/bildung/voranmeldung', ...LERNAPP_ROUTEN].filter(
    Boolean,
  );
  const vorhanden = [];
  for (const p of kandidaten) {
    const s = (await fetch(`${basis}${p}`)).status;
    if (s === 200) vorhanden.push(p);
    else console.warn(`übersprungen (HTTP ${s}): ${p}`);
  }
  return vorhanden;
}

const pfade = pfadeArg.length ? pfadeArg : await standardPfade();
const zeit = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const ziel = process.env.MESSEN_ZIEL
  ? join(process.env.MESSEN_ZIEL, zeit)
  : join(import.meta.dirname, '..', '..', '_lauf', 'release', 'belege', 'lighthouse', zeit);
mkdirSync(ziel, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 400);
const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
const zeilen = [];
let verfehlt = 0;
try {
  for (const pfad of pfade) {
    const url = `${basis}${pfad}`;
    const optionen = { port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };
    const ergebnis = await lighthouse(url, { ...optionen, throttlingMethod: 'devtools' });
    const simuliert = await lighthouse(url, { ...optionen, onlyCategories: ['performance'], throttlingMethod: 'simulate' });
    if (!ergebnis || !simuliert) throw new Error(`Keine Messung für ${url}`);
    const sim = {
      performance: Math.round((simuliert.lhr.categories.performance.score ?? 0) * 100),
      lcpMs: Math.round(simuliert.lhr.audits['largest-contentful-paint']?.numericValue ?? NaN),
    };
    const lhr = ergebnis.lhr;
    const name = pfad === '/' ? 'start' : pfad.replace(/^\//, '').replace(/[/?=]/g, '_');
    writeFileSync(join(ziel, `${name}.report.json`), ergebnis.report);
    const kat = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
    const a = lhr.audits;
    const anfragen = a['network-requests']?.details?.items ?? [];
    const jsKb = anfragen.filter((r) => r.resourceType === 'Script').reduce((s, r) => s + (r.transferSize ?? 0), 0) / 1024;
    const w = {
      pfad,
      ...kat,
      lcpMs: Math.round(a['largest-contentful-paint']?.numericValue ?? NaN),
      cls: Number((a['cumulative-layout-shift']?.numericValue ?? NaN).toFixed(3)),
      tbtMs: Math.round(a['total-blocking-time']?.numericValue ?? NaN),
      jsKb: Math.round(jsKb * 10) / 10,
    };
    const fehler = [
      w.performance < SCHWELLEN.performance && 'Performance',
      w.accessibility < SCHWELLEN.accessibility && 'Barrierefreiheit',
      w['best-practices'] < SCHWELLEN['best-practices'] && 'Best Practices',
      mitSeo(pfad) && w.seo < SCHWELLEN.seo && 'SEO',
      w.lcpMs > SCHWELLEN.lcpMs && 'LCP',
      w.cls > SCHWELLEN.cls && 'CLS',
      w.tbtMs > SCHWELLEN.tbtMs && 'TBT',
      w.jsKb > jsGrenze(pfad) && 'JS',
    ].filter(Boolean);
    if (fehler.length) verfehlt++;
    // Nicht bestandene Prüfungen der Kategorien (für Reparaturen)
    const offen = Object.values(lhr.categories)
      .flatMap((k) => k.auditRefs.filter((r) => r.weight > 0).map((r) => a[r.id]))
      .filter((x) => x && x.score !== null && x.score < 0.9)
      .map((x) => x.id);
    zeilen.push({ ...w, fehler, offen, sim });
    console.log(
      `${pfad}: P ${w.performance} · A ${w.accessibility} · BP ${w['best-practices']} · SEO ${w.seo} · LCP ${w.lcpMs} ms · CLS ${w.cls} · TBT ${w.tbtMs} ms · JS ${w.jsKb} kB · (simuliert: P ${sim.performance}, LCP ${sim.lcpMs} ms)${fehler.length ? ` · VERFEHLT: ${fehler.join(', ')}` : ''}`,
    );
  }
} finally {
  await browser.close();
}

const md = [
  `# Lighthouse mobil (T7, K-12) · ${zeit} · ${basis}`,
  '',
  `Schwellen: Performance ≥ ${SCHWELLEN.performance}, Barrierefreiheit ${SCHWELLEN.accessibility}, Best Practices ≥ ${SCHWELLEN['best-practices']}, SEO ≥ ${SCHWELLEN.seo}, LCP ≤ ${SCHWELLEN.lcpMs} ms, CLS ≤ ${SCHWELLEN.cls}, TBT ≤ ${SCHWELLEN.tbtMs} ms (Labor-Ersatz für INP), JS ≤ ${SCHWELLEN.jsKb} kB gzip.`,
  '',
  'Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).',
  '',
  '| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...zeilen.map(
    (z) =>
      `| ${z.pfad} | ${z.performance} | ${z.accessibility} | ${z['best-practices']} | ${z.seo} | ${z.lcpMs} | ${z.cls} | ${z.tbtMs} | ${z.jsKb} | ${z.sim.performance} / ${z.sim.lcpMs} | ${z.fehler.length ? `verfehlt: ${z.fehler.join(', ')}` : 'erfüllt'} | ${z.offen.join(', ') || '–'} |`,
  ),
  '',
].join('\n');
writeFileSync(join(ziel, 'ergebnis.md'), md);
writeFileSync(join(ziel, 'ergebnis.json'), JSON.stringify(zeilen, null, 2));
console.log(`\nZusammenfassung: ${join(ziel, 'ergebnis.md')}`);
process.exit(verfehlt ? 1 : 0);
