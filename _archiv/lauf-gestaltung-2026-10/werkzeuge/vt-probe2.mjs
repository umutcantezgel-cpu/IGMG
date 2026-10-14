import { chromium } from 'playwright';
const basis = process.argv[2] ?? 'http://127.0.0.1:3300';
const faelle = JSON.parse(process.argv[3]);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [start, ziel, art] of faelle) {
  const seite = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await seite.addInitScript(() => {
    window.__vt = 0;
    const orig = Document.prototype.startViewTransition;
    Document.prototype.startViewTransition = function (...a) { window.__vt++; return orig.apply(this, a); };
  });
  await seite.goto(basis + start, { waitUntil: 'networkidle' });
  await seite.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await seite.waitForTimeout(1500);
  if (art === 'push') await seite.evaluate((z) => window.next.router.push(z), ziel);
  else await seite.locator(`a[href="${ziel}"]:visible`).first().click();
  await seite.waitForTimeout(3000);
  console.log(start, '→', ziel, art, JSON.stringify(await seite.evaluate(() => ({ url: location.pathname, vt: window.__vt }))));
  await seite.close();
}
await browser.close();
