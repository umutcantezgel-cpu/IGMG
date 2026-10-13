// Zeichnet den Ausgang jedes View Transitions auf (ready/skip mit Grund) und die beteiligten Namen.
import { chromium } from 'playwright';
const [basis, start, auswahl] = [process.argv[2] ?? 'http://localhost:3200', process.argv[3] ?? '/nachrichten', process.argv[4] ?? '[data-morph-karte^="n-"] a'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => {
  window.__vt = [];
  const orig = Document.prototype.startViewTransition;
  Document.prototype.startViewTransition = function (...a) {
    const t = orig.apply(this, a);
    const e = { start: performance.now() };
    window.__vt.push(e);
    t.ready.then(() => {
      e.ready = performance.now() - e.start;
      e.namen = [...new Set(document.getAnimations().map((x) => x.effect?.pseudoElement).filter(Boolean))];
    }, (f) => { e.fehler = String(f); });
    t.finished.then(() => { e.ende = performance.now() - e.start; });
    return t;
  };
});
await p.goto(basis + start, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
await p.waitForTimeout(1500);
const link = p.locator(`${auswahl}:visible`).first();
await link.click();
await p.waitForTimeout(4000);
console.log(JSON.stringify({ url: await p.evaluate(() => location.pathname), vt: await p.evaluate(() => window.__vt) }, null, 1));
await b.close();
