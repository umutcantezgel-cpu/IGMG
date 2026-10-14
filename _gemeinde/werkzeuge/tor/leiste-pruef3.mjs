// H-G03 Prüfskript (Scratchpad, nicht im Repo). Modi:
//   stand     – Bild der Leiste zu einer festen Uhrzeit, Messwerte (Breite, Überlauf, Höhe)
//   wechsel   – Uhr kurz vor einer Gebetszeit, runFor über die Zeit, Bilder vor/während(150 ms)/nach,
//               Animationen im Leisten-Bereich, Tick ohne neue Animation
//   erstladen – Uhr vor einer Gebetszeit, Laden: keine Überblendung beim ersten Erscheinen der Hervorhebung
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '/home/user/IGMG/_gemeinde/werkzeuge/node_modules/playwright/index.mjs';

const { values } = parseArgs({
  options: {
    modus: { type: 'string', default: 'stand' },
    breite: { type: 'string', default: '1440' },
    hoehe: { type: 'string' },
    zeit: { type: 'string' },
    aus: { type: 'string' },
    basis: { type: 'string', default: 'http://localhost:3200' },
    pfad: { type: 'string', default: '/veranstaltungen' },
    reduziert: { type: 'boolean', default: false },
    aufgeklappt: { type: 'boolean', default: false },
    warte: { type: 'string', default: '4000' },
  },
});

const breite = Number(values.breite);
const hoehe = Number(values.hoehe ?? (breite <= 500 ? 844 : 900));
const LEISTE = 'aside:has(#leiste-alle)';
const ergebnis = { modus: values.modus, breite, zeit: values.zeit ?? null, reduziert: values.reduziert };

function bild(name) {
  const ziel = `${values.aus}-${name}.jpg`;
  mkdirSync(dirname(ziel), { recursive: true });
  return ziel;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
try {
  const kontext = await browser.newContext({
    viewport: { width: breite, height: hoehe },
    deviceScaleFactor: 1,
    reducedMotion: values.reduziert ? 'reduce' : 'no-preference',
  });
  await kontext.addInitScript(() => {
    try {
      localStorage.setItem('igmg-konzepthinweis-gesehen', '1');
    } catch {
      /* ohne Speicher */
    }
    // Übergänge und Animationen protokollieren (nur zur Prüfung)
    window.__ev = [];
    const erfasse = (art) => (e) => window.__ev.push({ art, eigenschaft: e.propertyName ?? e.animationName, ziel: e.target?.className?.toString?.().slice(0, 80) ?? e.target?.tagName, zeit: Math.round(performance.now()), dauer: e.elapsedTime });
    document.addEventListener('transitionrun', erfasse('transitionrun'), true);
    document.addEventListener('transitionstart', erfasse('transitionstart'), true);
    document.addEventListener('animationstart', erfasse('animationstart'), true);
  });
  const seite = await kontext.newPage();
  ergebnis.konsole = [];
  seite.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') ergebnis.konsole.push(`${m.type()}: ${m.text().slice(0, 160)}`); });
  seite.on('pageerror', (e) => ergebnis.konsole.push(`pageerror: ${String(e).slice(0, 160)}`));
  if (values.zeit) await seite.clock.install({ time: new Date(values.zeit) });
  await seite.goto(`${values.basis}${values.pfad}`, { waitUntil: 'load', timeout: 60000 });
  await seite.evaluate(() => document.fonts.ready);
  await seite.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));

  // Sichtbare Leiste (Desktop- oder Telefonansicht, je nach Breite)
  const sichtbar = `() => { const a = document.querySelector('${LEISTE}'); return !!a && a.getClientRects().length > 0; }`;
  await seite.waitForFunction(new Function(`return (${sichtbar})();`), null, { timeout: 30000 });
  if (values.aufgeklappt) {
    await seite.locator(`${LEISTE} button[aria-controls="leiste-alle"]`).click();
  }
  await seite.waitForTimeout(600);
  const leiste = seite.locator(LEISTE);

  if (values.modus === 'stand') {
    await leiste.screenshot({ path: bild('stand'), type: 'jpeg', quality: 80 });
    ergebnis.messung = await seite.evaluate((sel) => {
      const a = document.querySelector(sel);
      const r = a.getBoundingClientRect();
      const abgeschnitten = [...a.querySelectorAll('*')]
        .filter((el) => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible')
        .map((el) => el.tagName + '.' + String(el.className).slice(0, 60));
      const schmal = [...a.querySelectorAll('li, span')]
        .filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > r.right + 1)
        .map((el) => el.textContent.trim().slice(0, 40));
      return {
        leisteHoehe: Math.round(r.height),
        leisteBreite: Math.round(r.width),
        seiteUeberlauf: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        abgeschnitten,
        ueberRand: schmal,
      };
    }, LEISTE);
  }

  if (values.modus === 'wechsel') {
    // Vor dem Wechsel: Hervorhebung steht auf dem aktuellen Gebet
    const vorher = await seite.evaluate((sel) => {
      const li = [...document.querySelectorAll(`${sel} li[aria-current="time"]`)].find((e) => e.getClientRects().length);
      return li ? li.textContent.trim() : null;
    }, LEISTE);
    ergebnis.vorher = vorher;
    await leiste.screenshot({ path: bild('vor'), type: 'jpeg', quality: 80 });

    // Zeit läuft über die Gebetszeit; der Takt (30 s) löst den Wechsel aus
    await seite.clock.runFor(40_000);
    await seite.waitForFunction(
      (sel) => {
        const a = document.querySelector(sel);
        return !!a && [...a.querySelectorAll('li[aria-current="time"]')].some((li) => li.textContent.includes('Maghrib'));
      },
      LEISTE,
      { timeout: 10000 },
    );
    ergebnis.nachWechsel = await seite.evaluate((sel) => {
      const li = [...document.querySelectorAll(`${sel} li[aria-current="time"]`)].find((e) => e.getClientRects().length);
      return li ? li.textContent.trim() : null;
    }, LEISTE);

    // Alle Animationen im Leisten-Bereich anhalten und auf 150 ms setzen (Zwischenstand)
    const liste = await seite.evaluate((sel) => {
      const a = document.querySelector(sel);
      const alle = document.getAnimations().filter((an) => an.effect?.target && a.contains(an.effect.target));
      return alle.map((an) => ({
        art: an.transitionProperty ? 'transition' : an.animationName ? 'animation' : 'andere',
        eigenschaft: an.transitionProperty ?? an.animationName ?? '',
        ziel: String(an.effect.target.className).slice(0, 70) || an.effect.target.tagName,
        dauerMs: an.effect.getTiming().duration,
        verzoegerungMs: an.effect.getTiming().delay,
      }));
    }, LEISTE);
    ergebnis.animationenNachWechsel = liste;
    const zwischen = await seite.evaluate((sel) => {
      const a = document.querySelector(sel);
      const an = document.getAnimations().filter((x) => x.effect?.target && a.contains(x.effect.target));
      for (const x of an) {
        x.pause();
        x.currentTime = 150;
      }
      const farben = [...a.querySelectorAll('li')]
        .filter((li) => li.getClientRects().length)
        .map((li) => ({ text: li.textContent.trim().slice(0, 20), bg: getComputedStyle(li).backgroundColor, hervor: li.getAttribute('aria-current') === 'time' }));
      return { anzahl: an.length, farben };
    }, LEISTE);
    ergebnis.zwischen150 = zwischen;
    await leiste.screenshot({ path: bild('waehrend-150ms'), type: 'jpeg', quality: 80 });

    // Nach dem Wechsel: alle Übergänge abgeschlossen
    await seite.evaluate(() => document.getAnimations().forEach((x) => x.play()));
    await seite.waitForTimeout(1200);
    await leiste.screenshot({ path: bild('nach'), type: 'jpeg', quality: 80 });

    // Tick: die Restzeit läuft weiter, ohne neue Animation im Leisten-Bereich
    const vorTick = await seite.evaluate((sel) => document.getAnimations().filter((x) => x.effect?.target && document.querySelector(sel).contains(x.effect.target)).length, LEISTE);
    const restVorher = await seite.evaluate((sel) => document.querySelector(sel).innerText.match(/\d+\s*(Std|Min)\.[^\n]*/)?.[0] ?? null, LEISTE);
    await seite.clock.runFor(60_000);
    await seite.waitForTimeout(500);
    const nachTick = await seite.evaluate((sel) => document.getAnimations().filter((x) => x.effect?.target && document.querySelector(sel).contains(x.effect.target)).length, LEISTE);
    const restNachher = await seite.evaluate((sel) => document.querySelector(sel).innerText.match(/\d+\s*(Std|Min)\.[^\n]*/)?.[0] ?? null, LEISTE);
    ergebnis.tick = { animationenVorTick: vorTick, animationenNachTick: nachTick, restVorher, restNachher };
    ergebnis.ereignisse = await seite.evaluate(() => window.__ev.slice(-30));
  }

  if (values.modus === 'erstladen') {
    await seite.waitForTimeout(800);
    ergebnis.ereignisse = await seite.evaluate((sel) => {
      const a = document.querySelector(sel);
      return window.__ev.filter((e) => e.ziel && (e.art !== '') ).slice(0, 40);
    }, LEISTE);
    const hervor = await seite.evaluate((sel) => {
      const li = [...document.querySelectorAll(`${sel} li[aria-current="time"]`)].find((e) => e.getClientRects().length);
      return li ? li.textContent.trim() : null;
    }, LEISTE);
    ergebnis.hervorhebungBeimLaden = hervor;
    ergebnis.animationenJetzt = await seite.evaluate((sel) => {
      const a = document.querySelector(sel);
      return document.getAnimations().filter((x) => x.effect?.target && a.contains(x.effect.target)).map((x) => x.transitionProperty ?? x.animationName);
    }, LEISTE);
    await leiste.screenshot({ path: bild('erstladen'), type: 'jpeg', quality: 80 });
  }

  console.log(JSON.stringify(ergebnis, null, 2));
} finally {
  await browser.close();
}
