// Prüft O-13: Nach Klick auf eine Karte laufen View-Transition-Gruppen mit den Morph-Namen (Titel, Bild).
import { chromium } from 'playwright';
const [basis, start, auswahl] = [process.argv[2] ?? 'http://localhost:3200', process.argv[3] ?? '/nachrichten', process.argv[4] ?? '[data-morph-karte^="n-"] a'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(basis + start, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
await p.waitForTimeout(1500);
const link = p.locator(`${auswahl}:visible`).first();
const ziel = await link.getAttribute('href');
await link.click();
const gruppen = new Set();
for (let i = 0; i < 200; i++) {
  const g = await p.evaluate(() => document.getAnimations().map((a) => a.effect?.pseudoElement ?? '').filter(Boolean));
  g.forEach((x) => gruppen.add(x));
  await p.waitForTimeout(25);
}
await p.waitForTimeout(1500);
console.log(JSON.stringify({ ziel, url: await p.evaluate(() => location.pathname), gruppen: [...gruppen].filter((x) => x.includes('group')) }, null, 1));
await b.close();
