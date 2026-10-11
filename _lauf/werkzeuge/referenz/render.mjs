// Lichtung (c): Rendert die Claude-Design-Artboards als Bildreferenzen.
// Aufruf: node render.mjs [Filter-Teilstring]
// - liefert den Design-Ordner (Workspace-Wurzel) nur lesend über 127.0.0.1 aus
// - React/ReactDOM von unpkg werden einmal geladen und lokal zwischengespeichert (gleiche Bytes, SRI bleibt gültig)
// - rendert jede Seite bei 390 und 1440 px, dazu jede Option der Eigenschaften (enum, boolean, int mit max)
// - schreibt PNGs und index.json nach _lauf/belege/referenz/
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright';

const WURZEL = resolve(import.meta.dirname, '../../..');
const AUS = resolve(WURZEL, '_lauf/belege/referenz');
const CACHE = resolve(import.meta.dirname, 'cache');
const FILTER = process.argv[2] ?? '';
const BREITEN = [390, 1440];

const SEITEN = [
  'Home', 'PrayerTimes', 'FullscreenPrayerTimes', 'Events', 'EventDetails', 'News', 'NewsDetails',
  'AboutUs', 'BoardMembers', 'Projects', 'Contact', 'IGMGInfo', 'Quran', 'IslamicKnowledge',
  'QuranCourses', 'StudentRegistration', 'AnatolianOrganization', 'WomensOrganization',
  'YouthOrganization', 'WomensYouthOrganization', 'JoinUs', 'MosqueRequest', 'Dashboard',
  'Styleguide', 'Rechtliches',
];
const KOMPONENTEN = [
  'Header', 'PrayerTimesBar', 'Breadcrumbs', 'Footer', 'PageHeader', 'EventCard', 'NewsCard', 'OrgCard',
  'CourseCard', 'PersonCard', 'OrganizationPage', 'FormWizard', 'BaseComponents', 'LoginDialog',
  'TicketDialog', 'DisclaimerDialog', 'Icon',
];
const TAFELN = ['01 Grundlagen', '02 Komponenten'];
// Dialoge mit fester Überlagerung: Bildschirmfoto des Ansichtsfensters statt des Rahmens
const DIALOGE = ['DisclaimerDialog', 'TicketDialog'];

const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

function server() {
  return new Promise((ok) => {
    const s = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://x');
        const pfad = decodeURIComponent(url.pathname);
        if (pfad === '/__ref.html') {
          res.writeHead(200, { 'content-type': TYPEN['.html'] }).end(huelle(url.searchParams.get('name'), Number(url.searchParams.get('w')), JSON.parse(url.searchParams.get('p') || '{}')));
          return;
        }
        const datei = resolve(WURZEL, '.' + pfad);
        if (!datei.startsWith(WURZEL) || datei.includes('/_lauf/') || datei.includes('/uploads/')) { res.writeHead(403).end(); return; }
        const inhalt = await readFile(datei);
        res.writeHead(200, { 'content-type': TYPEN[extname(datei)] ?? 'application/octet-stream' }).end(inhalt);
      } catch { res.writeHead(404).end(); }
    });
    s.listen(0, '127.0.0.1', () => ok(s));
  });
}

// Hülle: bindet das Artboard wie 08/09 per dc-import in einen Rahmen fester Breite ein (Artboards selbst sind 1280 px breit).
const kebab = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
function huelle(name, breite, props) {
  const attrs = Object.entries(props).map(([k, v]) => ` ${kebab(k)}="${attr(v)}"`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="./support.js"></script></head><body><x-dc><helmet>` +
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;700&amp;display=swap">` +
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600&amp;display=swap">` +
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&amp;display=swap">` +
    `<style>*{box-sizing:border-box}body{margin:0;background:#FCFAF6;color:#1D1A17;font-family:'Atkinson Hyperlegible Next',system-ui,sans-serif}</style>` +
    `</helmet><div id="ref-rahmen" style="width:${breite}px;position:relative;transform:translateZ(0)"><dc-import name="${attr(name)}"${attrs} hint-size="100%,3000px"></dc-import></div></x-dc></body></html>`;
}

function eigenschaften(html) {
  const m = html.match(/data-props="([^"]*)"/);
  if (!m) return {};
  const json = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
  try { const o = JSON.parse(json); delete o.$preview; return o; } catch { return {}; }
}

function varianten(props) {
  const v = [];
  for (const [name, def] of Object.entries(props)) {
    if (!def || typeof def !== 'object') continue;
    if (def.editor === 'enum' && Array.isArray(def.options)) {
      for (const opt of def.options) if (opt !== def.default) v.push({ [name]: opt });
    } else if (def.editor === 'boolean') {
      v.push({ [name]: !def.default });
    } else if (def.editor === 'int' && Number.isFinite(def.max)) {
      for (let i = def.min ?? 1; i <= def.max; i++) if (i !== def.default) v.push({ [name]: i });
    }
  }
  return v;
}

const sicher = (s) => String(s).replace(/[^a-zA-Z0-9äöüÄÖÜß_-]+/g, '-');

async function bereit(page) {
  await page.waitForFunction(() => {
    const root = document.getElementById('dc-root');
    return root && !document.querySelector('.sc-placeholder') && !document.documentElement.classList.contains('sc-dc-streaming');
  }, null, { timeout: 30000 });
  await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
}

async function main() {
  await mkdir(AUS, { recursive: true });
  await mkdir(CACHE, { recursive: true });
  const srv = await server();
  const basis = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const kontext = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await kontext.route('https://unpkg.com/**', async (route) => {
    const name = sicher(new URL(route.request().url()).pathname);
    const datei = join(CACHE, name);
    if (existsSync(datei)) return route.fulfill({ body: await readFile(datei), contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' } });
    const antwort = await route.fetch();
    const body = await antwort.body();
    await writeFile(datei, body);
    return route.fulfill({ response: antwort, body });
  });

  const jobs = [];
  for (const name of [...SEITEN, ...KOMPONENTEN, ...TAFELN]) {
    if (FILTER && !name.includes(FILTER)) continue;
    const html = await readFile(join(WURZEL, `${name}.dc.html`), 'utf8');
    const props = eigenschaften(html);
    const breiten = TAFELN.includes(name) ? [1440] : BREITEN;
    const vs = SEITEN.includes(name) || ['Header', 'LoginDialog', 'TicketDialog', 'FormWizard', 'PrayerTimesBar', 'Footer', 'Breadcrumbs'].includes(name) ? varianten(props) : [];
    for (const w of breiten) {
      jobs.push({ name, w, props: null });
      for (const v of vs) jobs.push({ name, w, props: v });
    }
  }

  const index = [];
  let i = 0;
  async function arbeiter() {
    while (i < jobs.length) {
      const job = jobs[i++];
      const page = await kontext.newPage({ viewport: { width: job.w, height: 900 } });
      const fehler = [];
      page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text().slice(0, 300)); });
      page.on('pageerror', (e) => fehler.push(String(e).slice(0, 300)));
      const suffix = job.props ? '__' + Object.entries(job.props).map(([k, v]) => `${k}-${sicher(v)}`).join('_') : '';
      const datei = `${sicher(job.name)}${suffix}__${job.w}.png`;
      try {
        const ziel = TAFELN.includes(job.name)
          ? basis + encodeURI(`${job.name}.dc.html`)
          : `${basis}__ref.html?name=${encodeURIComponent(job.name)}&w=${job.w}&p=${encodeURIComponent(JSON.stringify(job.props ?? {}))}`;
        await page.goto(ziel, { waitUntil: 'load', timeout: 60000 });
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
        await bereit(page);
        const kaputt = await page.$('.sc-logic-error, .sc-placeholder-error, .sc-interp.sc-unresolved');
        const rahmen = TAFELN.includes(job.name) || DIALOGE.includes(job.name) ? null : await page.$('#ref-rahmen');
        if (rahmen) await rahmen.screenshot({ path: join(AUS, datei) });
        else await page.screenshot({ path: join(AUS, datei), fullPage: !DIALOGE.includes(job.name) });
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        index.push({ datei, seite: job.name, breite: job.w, props: job.props, hoehe: h, fehler, laufzeitfehler: Boolean(kaputt) });
      } catch (e) {
        index.push({ datei, seite: job.name, breite: job.w, props: job.props, fehler: [...fehler, String(e).slice(0, 300)], abbruch: true });
      } finally {
        await page.close();
      }
      process.stdout.write(`\r${index.length}/${jobs.length}`);
    }
  }
  await Promise.all([arbeiter(), arbeiter(), arbeiter(), arbeiter()]);
  index.sort((a, b) => a.datei.localeCompare(b.datei));
  await writeFile(join(AUS, FILTER ? `index-${sicher(FILTER)}.json` : 'index.json'), JSON.stringify(index, null, 2) + '\n');
  await browser.close();
  srv.close();
  const abbrueche = index.filter((x) => x.abbruch).length;
  const mitFehlern = index.filter((x) => x.fehler?.length || x.laufzeitfehler).length;
  console.log(`\nfertig: ${index.length} Bilder, ${abbrueche} Abbrüche, ${mitFehlern} mit Konsolen-/Laufzeitfehlern`);
}

main().catch((e) => { console.error(e); process.exit(1); });
