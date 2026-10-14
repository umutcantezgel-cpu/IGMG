// Prüft B-05: Läuft die Navigation clientseitig, und ruft React dabei document.startViewTransition auf?
// Aufruf: node vt-probe.mjs [basis] [start] [linkText]
import { chromium } from 'playwright';
const basis = process.argv[2] ?? 'http://127.0.0.1:3300';
const start = process.argv[3] ?? '/';
const ziel = process.argv[4] ?? '/veranstaltungen';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const seite = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const meldungen = [];
seite.on('console', (m) => meldungen.push(`${m.type()}: ${m.text()}`));
await seite.addInitScript(() => {
  window.__vt = 0;
  const orig = Document.prototype.startViewTransition;
  if (orig) Document.prototype.startViewTransition = function (...a) { window.__vt++; return orig.apply(this, a); };
});
await seite.goto(basis + start, { waitUntil: 'networkidle' });
await seite.evaluate(() => { window.__marke = 'gleiches-dokument'; document.querySelectorAll('dialog[open]').forEach((d) => d.close()); });
const link = seite.locator(`a[href="${ziel}"]:visible`).first();
console.log('link', await link.getAttribute('href'));
await link.click();
await seite.waitForTimeout(4000);
const r = await seite.evaluate(() => ({ url: location.pathname, marke: window.__marke ?? null, vt: window.__vt, reactVt: typeof document.startViewTransition }));
console.log(JSON.stringify(r));
console.log(meldungen.slice(0, 10).join('\n'));
await browser.close();
