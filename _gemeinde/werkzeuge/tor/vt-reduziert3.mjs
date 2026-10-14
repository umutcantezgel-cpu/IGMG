// E2-TOR2-PRUEFER: Seitenwechsel B-05 bei reduzierter Bewegung (prefers-reduced-motion: reduce).
// Erwartung: startViewTransition wird nicht aufgerufen (vt=0), die Navigation gelingt trotzdem.
// Umgebung: BASIS. Ausgabe: JSON auf stdout.
import { basisAdresse, neuerKontext, oeffne, starteBrowser } from '/home/user/IGMG/_gemeinde/werkzeuge/hilfen.mjs';

const BASIS = basisAdresse(process.env.BASIS ?? 'http://127.0.0.1:3400');
const FAELLE = [
  ['/', '/veranstaltungen'],
  ['/veranstaltungen', '/'],
  ['/impressum', '/datenschutz'],
];
const browser = await starteBrowser();
const ausgabe = [];
try {
  for (const [start, ziel] of FAELLE) {
    const kontext = await neuerKontext(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await kontext.addInitScript(() => {
      window.__vt = 0;
      const orig = Document.prototype.startViewTransition;
      Document.prototype.startViewTransition = function (...a) {
        window.__vt++;
        return orig.apply(this, a);
      };
    });
    const seite = await kontext.newPage();
    await oeffne(seite, BASIS + start, { warte: 1500 });
    const media = await seite.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    await seite.locator(`a[href="${ziel}"]:visible`).first().click();
    await seite.waitForURL((u) => new URL(u).pathname === ziel, { timeout: 15000 }).catch(() => {});
    await seite.waitForTimeout(2500);
    const nach = await seite.evaluate(() => ({ adresse: location.pathname, vt: window.__vt, inhalt: document.querySelector('main')?.textContent?.trim().slice(0, 40) ?? '' }));
    ausgabe.push({ von: start, nach: ziel, reduziertGemeldet: media, adresseNachNavigation: nach.adresse, zielErreicht: nach.adresse === ziel, vt: nach.vt, inhaltsanfang: nach.inhalt });
    await kontext.close();
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ basis: BASIS, modus: 'prefers-reduced-motion: reduce', ergebnis: ausgabe }, null, 2));
