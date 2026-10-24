// Rauchtest der Sprechübung (ADR 0042 Fortschreibung Nr. 4, 6 und 8; vor jedem Versionswechsel von transformers.js bzw.
// onnxruntime-web und für die Frage `useBrowserCache`): Laden vom eigenen Ursprung, Probelauf, eine Erkennung mit einem
// synthetischen Ton (keine Sprache, keine Aufnahme) und danach ohne Netz ein neuer Worker aus dem Vorrat – in zwei Varianten:
//   A = Worker wie ausgeliefert (cacheKey `igmg-lernapp-modelle`, useBrowserCache = true)
//   B = derselbe Worker mit useBrowserCache = false (Vorrat nur über den Service Worker der Lern-App)
// Ohne Next-Bau: ein kleiner Server liefert web/public/lern-app/** mit den Kopfzeilen der Lern-App (COOP/COEP, CSP wie
// cspLernApp() in der Produktion) und den echten Service Worker. Protokolliert werden Anfragen (auch aus Workern und dem SW),
// fremde Hosts, CSP-Verstöße, Konsolenfehler, der Vorrat und die Zeiten. Seit L8-02 zusätzlich: Online erreicht jede der 10
// Download-Dateien (`DOWNLOAD_PFADE`) den Server genau einmal – keine fehlt (Tokenizer, Prozessor), keine kommt doppelt.
// Voraussetzung: `pnpm lernapp:modelle` ohne E2E_ATTRAPPEN (echter Worker). Aufruf:
//   node scripts/lernapp/sprechen-rauchtest.mjs [--aus <datei.json>]   (Exit 1, wenn eine Variante nicht besteht)
// Für den Versionswechsel (Nr. 8) zusätzlich je Sprache 3 Sätze mit menschlicher Aufnahme – das geht nur lokal mit
// lizenziertem Testaudio (Beleg S2) und gehört nicht ins Repository.
import { createReadStream, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join, normalize } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import { build } from 'vite';
// Node ≥ 23.6 entfernt die Typen selbst; modell.ts hat nur Typ-Importe
import { DOWNLOAD_PFADE } from '../../src/lib/lernapp/sprechen/modell.ts';

const { values } = parseArgs({ options: { aus: { type: 'string' } } });
const web = join(import.meta.dirname, '..', '..');
const oeffentlich = join(web, 'public');
const arbeiter = join(oeffentlich, 'lern-app', 'modelle', 'sprechen', 'whisper.worker.mjs');
if (!existsSync(arbeiter) || readFileSync(arbeiter, 'utf8').includes('Attrappe'))
  throw new Error('Erst `pnpm lernapp:modelle` ohne E2E_ATTRAPPEN ausführen (echter Worker).');
const arbeit = mkdtempSync(join(tmpdir(), 'lernapp-rauchtest-'));

// Variante B bauen
const transformers = realpathSync(join(web, 'node_modules', '@huggingface', 'transformers'));
writeFileSync(
  join(arbeit, 'eingang.ts'),
  "import { env } from '@huggingface/transformers';\nimport '@worker';\nenv.useBrowserCache = false;\n",
);
await build({
  configFile: false,
  root: arbeit,
  publicDir: false,
  logLevel: 'error',
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${join(web, 'src')}/` },
      { find: /^@huggingface\/transformers$/, replacement: join(transformers, 'dist', 'transformers.min.js') },
      { find: /^@worker$/, replacement: join(web, 'src', 'components', 'lernapp', 'sprechen', 'whisper.worker.ts') },
    ],
  },
  build: {
    outDir: join(arbeit, 'b'),
    target: 'es2022',
    copyPublicDir: false,
    reportCompressedSize: false,
    lib: { entry: join(arbeit, 'eingang.ts'), formats: ['es'], fileName: () => 'whisper.worker.mjs' },
    rollupOptions: { output: { codeSplitting: false } },
  },
});

const PROBE = `<!doctype html><html lang="de"><meta charset="utf-8"><title>Rauchtest</title><script>
window.verstoesse = [];
document.addEventListener('securitypolicyviolation', (e) => window.verstoesse.push(e.violatedDirective + ' ' + e.blockedURI));
window.swBereit = async () => { await navigator.serviceWorker.register('/lern-app/sw.js?v=rauch', { scope: '/lern-app/' }); await navigator.serviceWorker.ready; };
window.lauf = (v, mitErkennung) => new Promise((ok) => {
  const w = new Worker('/lern-app/modelle/sprechen/whisper.worker.mjs?v=' + v, { type: 'module', name: 'whisper' });
  const t0 = performance.now();
  const aus = { isoliert: self.crossOriginIsolated, ladenMs: null, probeMs: null, ergebnis: null, felder: null, fehler: [] };
  const ende = () => { w.terminate(); ok(aus); };
  w.onerror = (e) => { aus.fehler.push('onerror ' + (e.message || '')); ende(); };
  w.onmessage = (e) => {
    const n = e.data;
    if (n.art === 'bereit') { aus.ladenMs = Math.round(performance.now() - t0); w.postMessage({ art: 'probe' }); }
    else if (n.art === 'probe') {
      aus.probeMs = n.ms;
      if (!mitErkennung) return ende();
      const pcm = new Float32Array(48000);
      for (let i = 16000; i < 32000; i++) pcm[i] = 0.3 * Math.sin((2 * Math.PI * 220 * i) / 16000);
      w.postMessage({ art: 'erkenne', id: 1, pcm, sprache: 'de', ziel: 'Ich trinke Wasser.' }, [pcm.buffer]);
    } else if (n.art === 'ergebnis') { aus.ergebnis = n.ergebnis; aus.felder = Object.keys(n).sort(); ende(); }
    else if (n.art === 'fehler') { aus.fehler.push(n.bei); ende(); }
  };
  w.postMessage({ art: 'laden' });
});
window.vorrat = async () => { const a = {}; for (const n of await caches.keys()) a[n] = (await (await caches.open(n)).keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search); return a; };
</script></html>`;

const CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
].join('; ');
const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
};
const serverAnfragen = [];
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  serverAnfragen.push(url.pathname + url.search);
  const kopf = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': url.pathname.startsWith('/lern-app/modelle/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  };
  if (url.pathname === '/lern-app/probe/') {
    res.writeHead(200, { ...kopf, 'Content-Type': TYPEN['.html'] });
    return res.end(PROBE);
  }
  let datei = normalize(join(oeffentlich, decodeURIComponent(url.pathname)));
  if (url.pathname === '/lern-app/modelle/sprechen/whisper.worker.mjs' && url.searchParams.get('v') === 'b')
    datei = join(arbeit, 'b', 'whisper.worker.mjs');
  else if (!datei.startsWith(join(oeffentlich, 'lern-app'))) datei = '';
  if (!datei || !existsSync(datei) || !statSync(datei).isFile()) {
    res.writeHead(404, kopf);
    return res.end();
  }
  const typ = TYPEN[datei.slice(datei.lastIndexOf('.'))] ?? 'application/octet-stream';
  res.writeHead(200, { ...kopf, 'Content-Type': typ, 'Content-Length': statSync(datei).size });
  createReadStream(datei).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const basis = `http://127.0.0.1:${server.address().port}`;

const ergebnis = {};
try {
  for (const [name, v] of [
    ['A', 'a'],
    ['B', 'b'],
  ]) {
    const ctx = await chromium.launchPersistentContext(mkdtempSync(join(arbeit, 'profil-')), { headless: true, serviceWorkers: 'allow' });
    const anfragen = [];
    const konsole = [];
    ctx.on('request', (r) => anfragen.push(r.url()));
    const page = ctx.pages()[0] ?? (await ctx.newPage());
    page.on('console', (m) => m.type() === 'error' && konsole.push(m.text().slice(0, 300)));
    page.on('worker', (w) =>
      w.on('console', (m) => ['error', 'warning'].includes(m.type()) && konsole.push(`Worker: ${m.text().slice(0, 300)}`)),
    );
    await page.goto(`${basis}/lern-app/probe/`);
    await page.evaluate(() => window.swBereit());
    await page.reload();
    const vorOnline = serverAnfragen.length;
    const online = await page.evaluate((x) => window.lauf(x, true), v);
    const vorrat = await page.evaluate(() => window.vorrat());
    const vorOffline = serverAnfragen.length;
    // je Download-Datei die Abrufe am Server während der Online-Phase (Pfad ohne Suchteil)
    const abrufe = Object.fromEntries(
      DOWNLOAD_PFADE.map((d) => [d, serverAnfragen.slice(vorOnline, vorOffline).filter((p) => p.split('?')[0] === d).length]),
    );
    const fehlend = DOWNLOAD_PFADE.filter((d) => abrufe[d] === 0);
    const mehrfach = DOWNLOAD_PFADE.filter((d) => abrufe[d] > 1);
    await ctx.route('**/*', (r) => r.abort('internetdisconnected'));
    await ctx.setOffline(true);
    const offline = await page.evaluate((x) => window.lauf(x, false), v);
    const verstoesse = await page.evaluate(() => window.verstoesse);
    const modelle = vorrat['igmg-lernapp-modelle'] ?? [];
    const fremd = [...new Set(anfragen.map((u) => new URL(u).host))].filter((h) => h !== new URL(basis).host);
    // Während der Offline-Phase darf den Server höchstens die Aktualisierungsprüfung des Service Workers erreichen
    const offlineAmServer = serverAnfragen.slice(vorOffline).filter((p) => !p.startsWith('/lern-app/sw.js'));
    const ok =
      online.isoliert &&
      online.ladenMs !== null &&
      online.probeMs !== null &&
      online.felder?.join() === 'art,ergebnis,id' &&
      offline.ladenMs !== null &&
      offline.probeMs !== null &&
      modelle.length === 10 &&
      !fehlend.length &&
      !mehrfach.length &&
      !fremd.length &&
      !verstoesse.length &&
      !offlineAmServer.length;
    ergebnis[name] = { ok, online, offline, modelle, abrufe, fehlend, mehrfach, fremd, verstoesse, konsole, offlineAmServer };
    await ctx.close();
  }
} finally {
  server.close();
  rmSync(arbeit, { recursive: true, force: true });
}
for (const [name, e] of Object.entries(ergebnis))
  console.log(
    `${name}: ${e.ok ? 'bestanden' : 'NICHT bestanden'} – online Laden ${e.online.ladenMs} ms, Probelauf ${e.online.probeMs} ms; ` +
      `ohne Netz Laden ${e.offline.ladenMs} ms, Probelauf ${e.offline.probeMs} ms; Vorrat ${e.modelle.length} Dateien; ` +
      `Download-Dateien am Server: fehlend ${e.fehlend.length}, mehrfach ${e.mehrfach.length}${e.mehrfach.length ? ` (${e.mehrfach.join(', ')})` : ''}; ` +
      `fremde Hosts ${e.fremd.length}, CSP-Verstöße ${e.verstoesse.length}, Konsolenfehler ${e.konsole.length}`,
  );
if (values.aus) writeFileSync(values.aus, JSON.stringify(ergebnis, null, 2));
process.exit(Object.values(ergebnis).every((e) => e.ok) ? 0 : 1);
