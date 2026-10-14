// E3-TOR-PRUEFER: B-10 Gebetszeit-Wechsel in der Leiste (KERN K-007). Ablauf:
//   1. Uhr per page.clock kurz vor dem Ende des Gebets setzen (Standard 16:09:30 Berlin, nächstes Gebet Asr 16:10).
//   2. Animationen auf dem Dokument-Zeitstrahl auf 0,1× bremsen (CDP Animation.setPlaybackRate).
//   3. Uhr vorstellen, bis das nächste Gebet Maghrib ist; danach fünf Bilder im Abstand --schritt (Echtzeit).
//   4. Je Bild: Zeitstand der laufenden Animationen in der Leiste und Hintergrundfarbe der Gebetszeilen.
// Modus reduziert: gleicher Ablauf bei prefers-reduced-motion; erwartet ist der Wechsel ohne Animation.
// Aufruf: node leiste3.mjs --breite 390|1440 [--modus wechsel|reduziert] [--zeit ISO] [--schritt 800] [--aus ordner]
//         [--basis URL] [--protokoll basisname]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { basisAdresse, neuerKontext, starteBrowser, vollerUrl } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';

const { values } = parseArgs({
  options: {
    breite: { type: 'string', default: '390' },
    modus: { type: 'string', default: 'wechsel' },
    zeit: { type: 'string', default: '2026-10-11T14:09:30Z' },
    schritt: { type: 'string', default: '800' },
    rate: { type: 'string', default: '0.1' },
    pfad: { type: 'string', default: '/' },
    aufgeklappt: { type: 'boolean', default: false },
    aus: { type: 'string' },
    basis: { type: 'string' },
    protokoll: { type: 'string' },
  },
});
const BASIS = basisAdresse(values.basis ?? 'http://127.0.0.1:3400');
const breite = Number(values.breite);
const hoehe = breite <= 500 ? 844 : 900;
const LEISTE = 'aside:has(#leiste-alle)';
const ORDNER = values.aus ?? '/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e3-tor/leiste';
mkdirSync(ORDNER, { recursive: true });

/** Im Browser: Name und Restzeit der Leiste (sichtbarer Text) und Zustand der Gebetszeilen. */
function lesen(sel) {
  const a = document.querySelector(sel);
  if (!a) return null;
  const text = a.innerText.replace(/\s+/g, ' ');
  const naechstes = text.match(/N(ä|ae)chstes Gebet\s+(\S+)/)?.[2] ?? null;
  const zeilen = [...a.querySelectorAll('li')].filter((l) => l.getClientRects().length).map((l) => ({
    text: l.textContent.trim().slice(0, 24),
    aktuell: l.getAttribute('aria-current'),
    hintergrund: getComputedStyle(l).backgroundColor,
  }));
  return { naechstes, zeilen };
}

/** Im Browser: laufende Animationen innerhalb der Leiste. */
function animationen(sel) {
  const a = document.querySelector(sel);
  if (!a) return [];
  return document
    .getAnimations()
    .filter((x) => x.effect?.target && a.contains(x.effect.target))
    .map((x) => ({
      art: x.transitionProperty ? 'Übergang' : x.animationName ? 'Animation' : 'sonst',
      name: x.animationName || x.transitionProperty || '',
      zustand: x.playState,
      zeitstandMs: x.currentTime === null ? null : Math.round(x.currentTime),
      dauerMs: x.effect?.getTiming().duration ?? null,
      ziel: String(x.effect?.target?.className?.baseVal ?? x.effect?.target?.className ?? x.effect?.target?.tagName ?? '').slice(0, 60),
    }));
}

const browser = await starteBrowser();
const ergebnis = { werkzeug: 'leiste3', modus: values.modus, breite, hoehe, zeitAnfang: values.zeit, rate: Number(values.rate), basis: BASIS, rahmen: [] };
try {
  const reduziert = values.modus === 'reduziert';
  const kontext = await neuerKontext(browser, { viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1, reducedMotion: reduziert ? 'reduce' : 'no-preference' });
  const seite = await kontext.newPage();
  const fehler = [];
  seite.on('pageerror', (e) => fehler.push(String(e.message ?? e).slice(0, 200)));
  await seite.clock.install({ time: new Date(values.zeit) });
  await seite.goto(vollerUrl(BASIS, values.pfad), { waitUntil: 'load', timeout: 60000 });
  await seite.evaluate(() => document.fonts.ready);
  await seite.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await seite.waitForFunction((sel) => {
    const a = document.querySelector(sel);
    return !!a && a.getClientRects().length > 0;
  }, LEISTE, { timeout: 30000 });
  await seite.waitForTimeout(1500);
  ergebnis.vorher = await seite.evaluate(lesen, LEISTE);
  ergebnis.animationenVorWechsel = await seite.evaluate(animationen, LEISTE);

  if (values.aufgeklappt) {
    // Liste „Alle Zeiten“ aufklappen: dort wandert die Hervorhebung (B-10)
    await seite.locator(`${LEISTE} button[aria-controls="leiste-alle"]`).click();
    await seite.waitForTimeout(700);
    ergebnis.aufgeklappt = true;
  }
  const cdp = await kontext.newCDPSession(seite);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: ergebnis.rate });
  // Uhr vorstellen, bis der Wechsel eintritt (Maghrib); höchstens 4 Minuten Zeit
  let gewechselt = false;
  for (let i = 0; i < 12 && !gewechselt; i++) {
    await seite.clock.runFor(20_000);
    gewechselt = await seite.evaluate((sel) => /N(ä|ae)chstes Gebet\s+Maghrib/.test(document.querySelector(sel)?.innerText.replace(/\s+/g, ' ') ?? ''), LEISTE);
  }
  ergebnis.gewechselt = gewechselt;
  const start = Date.now();
  if (!reduziert) {
    for (let k = 0; k < 5; k++) {
      const bild = join(ORDNER, `leiste-${breite}-${k + 1}.jpg`);
      const stand = await seite.evaluate(lesen, LEISTE);
      const anim = await seite.evaluate(animationen, LEISTE);
      await seite.locator(LEISTE).screenshot({ path: bild, type: 'jpeg', quality: 80 });
      ergebnis.rahmen.push({ nr: k + 1, msNachErkennung: Date.now() - start, naechstes: stand?.naechstes ?? null, zeilen: stand?.zeilen ?? [], animationen: anim, bild });
      await seite.waitForTimeout(Number(values.schritt));
    }
    await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
    await seite.waitForTimeout(1500);
    ergebnis.nachAnimation = await seite.evaluate(lesen, LEISTE);
    ergebnis.nachAnimationLaufend = (await seite.evaluate(animationen, LEISTE)).filter((x) => x.zustand === 'running').length;
  } else {
    // Sofortzustand: ohne Zeitlupe, direkt nach dem Wechsel
    await seite.waitForTimeout(400);
    const stand = await seite.evaluate(lesen, LEISTE);
    const anim = await seite.evaluate(animationen, LEISTE);
    const bild = join(ORDNER, `leiste-${breite}-reduziert.jpg`);
    await seite.locator(LEISTE).screenshot({ path: bild, type: 'jpeg', quality: 80 });
    ergebnis.rahmen.push({ nr: 1, naechstes: stand?.naechstes ?? null, zeilen: stand?.zeilen ?? [], animationen: anim, bild });
  }
  ergebnis.pageerrors = fehler;
  await kontext.close();
} finally {
  await browser.close();
}
if (values.protokoll) {
  mkdirSync(dirname(values.protokoll), { recursive: true });
  writeFileSync(`${values.protokoll}.json`, `${JSON.stringify(ergebnis, null, 2)}\n`);
}
process.stdout.write(`${JSON.stringify(ergebnis, null, 2)}\n`);
