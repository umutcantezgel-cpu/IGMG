// E3-TOR-PRUEFER: Große Momente B-06 bis B-09 (Register KERN K-007). Drei Modi:
//   bilder     – fünf Bilder zu 0/200/500/900/1500 ms nach Auslösung. Die Animationen der Auslösung (Startzeit ±60 ms
//                und alle Animationen im Auslöser-Element) werden im Browser angehalten und auf den Sollzeitstand gesetzt
//                (Animation.currentTime). Die Bilder zeigen damit exakte Zeitpunkte, unabhängig von Ladezeit und Last.
//                Die echte Bildrate misst der Modus bildrate.
//   bildrate   – Bildrate über 2 s nach Auslösung, CPU 4× gedrosselt (CDP) und ohne Drosselung zum Vergleich.
//                Verworfen wie bewegung.mjs: Abstand > 1,5 × 16,7 ms; verworfene je Lücke = max(1, round(Abstand/16,7) − 1).
//   reduziert  – reduzierte Bewegung: Endzustand sichtbar, keine laufende Animation mit Lage/Größe nach 2,5 s,
//                Deckkraft und Skalierung der Momentelemente im Endzustand (auch in <mask>).
// Auslöser: b06 = Animation enthuellen auf .bogen-enthuellt (nach Hydrierung, ohne Scrollen);
//           b09 = Animation aufziehen auf .familie-eigen (seit ae274ac) (ab dem ersten Bild);
//           b07/b08 = Scroll zum ersten [data-sicht]-Element, Auslösung bei data-sicht="laeuft".
// Aufruf: node momente3.mjs --ziel b06|b07|b08|b09 --modus bilder|bildrate|reduziert [--laeufe 2] [--aus ordner]
//         [--basis URL] [--protokoll basisname]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { basisAdresse, neuerKontext, oeffne, starteBrowser, vollerUrl } from '/home/user/IGMG/_werkstatt/werkzeuge/hilfen.mjs';

const ZIELE = {
  b06: { pfad: '/', ausloeser: 'anim', anim: 'enthuellen', ziel: '.bogen-enthuellt', scrollen: false, bildScrollen: true, register: 'B-06 Tagesbogen' },
  b07: { pfad: '/ueber-uns', ausloeser: 'sicht', scrollen: true, register: 'B-07 Weg der Gemeinde' },
  b08: { pfad: '/projekte', ausloeser: 'sicht', scrollen: true, register: 'B-08 Meilensteinlinie' },
  b09: { pfad: '/organisationen/ana-teskilati', ausloeser: 'anim', anim: 'aufziehen', ziel: '.familie-eigen', scrollen: false, register: 'B-09 Familie der vier' },
};
const SOLL = [0, 200, 500, 900, 1500];
const FENSTER = { width: 390, height: 844 };

const { values } = parseArgs({
  options: {
    ziel: { type: 'string' },
    modus: { type: 'string', default: 'bilder' },
    laeufe: { type: 'string', default: '2' },
    aus: { type: 'string' },
    basis: { type: 'string' },
    protokoll: { type: 'string' },
  },
});
const cfg0 = ZIELE[values.ziel];
if (!cfg0) {
  console.error(`--ziel fehlt oder unbekannt (${Object.keys(ZIELE).join(', ')})`);
  process.exit(2);
}
const BASIS = basisAdresse(values.basis ?? 'http://127.0.0.1:3400');
const MODUS = values.modus;
const LAEUFE = Number(values.laeufe);
const BILDORDNER = values.aus ?? '/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e3-tor/momente';

/**
 * Im Browser (Init-Skript, läuft vor dem Seitenaufbau): hält die Auslösung je Frame fest. Mit `pausieren` werden die
 * Animationen der Auslösung angehalten, damit die Bilder exakte Zeitstände zeigen.
 */
function INIT(cfg) {
  window.__ursprung = (c) => {
    if (c.ausloeser === 'anim') {
      const a = document.getAnimations().find((x) => x.animationName === c.anim && x.effect?.target?.matches?.(c.ziel));
      return a && a.startTime !== null ? a.startTime : null;
    }
    const el = document.querySelector('[data-sicht]');
    if (!el || el.dataset.sicht !== 'laeuft') return null;
    const starts = document.getAnimations().filter((x) => x.effect?.target && el.contains(x.effect.target) && x.startTime !== null).map((x) => x.startTime);
    return starts.length ? Math.min(...starts) : null;
  };
  window.__ausloesung = null;
  window.__gruppe = [];
  const pruefe = () => {
    if (window.__ausloesung === null) {
      const o = window.__ursprung(cfg);
      if (o !== null) {
        window.__ausloesung = o;
        const wurzel = cfg.ausloeser === 'anim' ? document.querySelector(cfg.ziel) : document.querySelector('[data-sicht]');
        window.__gruppe = document
          .getAnimations()
          .filter((x) => (x.startTime !== null && Math.abs(x.startTime - o) <= 60) || (wurzel && x.effect?.target && wurzel.contains(x.effect.target)));
        if (cfg.pausieren) window.__gruppe.forEach((x) => x.pause());
      }
    }
    requestAnimationFrame(pruefe);
  };
  requestAnimationFrame(pruefe);
}

/** Im Browser: Stand relativ zur Auslösung und laufende Animationen. */
function stand() {
  const o = window.__ausloesung;
  if (o === null) return null;
  const rel = document.timeline.currentTime - o;
  const laufend = document
    .getAnimations()
    .filter((a) => a.playState === 'running')
    .map((a) => ({
      name: a.animationName || a.transitionProperty || '(sonst)',
      ziel: a.effect?.target ? `${a.effect.target.tagName.toLowerCase()}${a.effect.target.getAttribute?.('class') ? '.' + String(a.effect.target.getAttribute('class')).split(' ')[0] : ''}` : '?',
      zeitstandMs: a.currentTime === null ? null : Math.round(a.currentTime),
    }));
  return { relMs: Math.round(rel), laufend };
}

/** Im Browser: Zeitstand der angehaltenen Gruppe auf `ms` setzen; liefert die Zahl noch laufender Animationen. */
function zeitstandSetzen(ms) {
  let laufend = 0;
  const namen = new Set();
  for (const a of window.__gruppe) {
    a.currentTime = ms;
    const ende = a.effect.getComputedTiming().endTime;
    if (ms < ende) {
      laufend += 1;
      namen.add(a.animationName || a.transitionProperty || '(sonst)');
    }
  }
  return { gruppe: window.__gruppe.length, laufend, namen: [...namen] };
}

/** Im Browser: Bildzeiten (rAF) bis `ms` nach Auslösung. */
function bildzeiten(ms) {
  return new Promise((fertig) => {
    const zeiten = [];
    const beginn = performance.now();
    const schritt = (t) => {
      zeiten.push(t);
      const o = window.__ausloesung;
      const rel = o === null ? null : document.timeline.currentTime - o;
      if ((rel !== null && rel >= ms) || performance.now() - beginn > 15000) return fertig(zeiten);
      requestAnimationFrame(schritt);
    };
    requestAnimationFrame(schritt);
  });
}

/** Im Browser: Zustand der Momentelemente im Endzustand (reduzierte Bewegung). */
function endzustand() {
  const elemente = ['.bogen-enthuellt', '.weg-linie', '.weg-punkt', '.meilenstein-fortschritt', '.meilenstein-erreicht', '.maske-oeffnet', '.marke-tritt-hervor'];
  const alle = [];
  for (const sel of elemente) {
    for (const el of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(el);
      alle.push({ sel, inMaske: !!el.closest('mask'), opazitaet: Number(cs.opacity), skalierung: cs.scale, transform: cs.transform });
    }
  }
  const laufendLayout = document
    .getAnimations()
    .filter((a) => a.playState === 'running')
    .map((a) => ({ name: a.animationName || a.transitionProperty || '(sonst)', eigenschaften: [...new Set((a.effect?.getKeyframes?.() ?? []).flatMap((k) => Object.keys(k)))] }))
    .filter((a) => a.eigenschaften.some((p) => ['transform', 'translate', 'scale', 'rotate', 'width', 'height', 'top', 'left', 'right', 'bottom', 'inset', 'margin'].includes(p)));
  const nichtStandard = alle.filter((e) => e.skalierung !== 'none' && e.skalierung !== '1' && e.skalierung !== '1 1');
  return {
    gezaehlt: alle.length,
    opazitaetKleiner1: alle.filter((e) => e.opazitaet < 1).length,
    nichtStandardSkalierung: nichtStandard.length,
    laufendLayout,
    beispiele: alle.slice(0, 8),
  };
}

/** Zählt verworfene Bilder aus Bildzeiten (wie bewegung.mjs). */
function auswertenRate(zeiten) {
  const SCHWELLE = 1.5 * (1000 / 60);
  const abstaende = zeiten.slice(1).map((t, i) => t - zeiten[i]);
  const lange = abstaende.filter((d) => d > SCHWELLE);
  const verworfen = lange.reduce((s, d) => s + Math.max(1, Math.round(d / (1000 / 60)) - 1), 0);
  const gezeigt = zeiten.length;
  const sortiert = [...abstaende].sort((a, b) => a - b);
  return {
    bilder: gezeigt,
    verworfen,
    anteilVerworfenProzent: gezeigt + verworfen ? Math.round((verworfen / (gezeigt + verworfen)) * 1000) / 10 : null,
    medianAbstandMs: Math.round((sortiert[Math.floor(sortiert.length / 2)] ?? NaN) * 10) / 10,
    p95AbstandMs: Math.round((sortiert[Math.floor(sortiert.length * 0.95)] ?? NaN) * 10) / 10,
  };
}

async function ausloesen(seite, cfg) {
  if (cfg.scrollen) {
    await seite.waitForSelector('[data-sicht]', { state: 'attached', timeout: 30000 });
    await seite.evaluate(() => document.querySelector('[data-sicht]').scrollIntoView({ block: 'center', behavior: 'instant' }));
  }
  await seite.waitForFunction(() => window.__ausloesung !== null, null, { timeout: 30000 });
}

const browser = await starteBrowser();
const ergebnis = { werkzeug: 'momente3', ziel: values.ziel, register: cfg0.register, pfad: cfg0.pfad, modus: MODUS, basis: BASIS, fenster: FENSTER, zeit: new Date().toISOString(), laeufe: [] };
try {
  if (MODUS === 'bilder') {
    mkdirSync(BILDORDNER, { recursive: true });
    for (let lauf = 1; lauf <= LAEUFE; lauf++) {
      const kontext = await neuerKontext(browser, { viewport: FENSTER, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
      const seite = await kontext.newPage();
      // UHR (ISO): feste Browser-Uhr, damit zeitabhängige Momente (B-06 nachts ohne Linie) aufgenommen werden können
      if (process.env.UHR) await seite.clock.setFixedTime(new Date(process.env.UHR));
      const fehler = [];
      seite.on('pageerror', (e) => fehler.push(String(e.message ?? e).slice(0, 200)));
      await seite.addInitScript(INIT, { ...cfg0, pausieren: true });
      const http = await oeffne(seite, vollerUrl(BASIS, cfg0.pfad), { warte: 0 });
      await ausloesen(seite, cfg0);
      // Bildausschnitt: Der Tagesbogen liegt auf dem Telefon unter dem ersten Bildschirm; für die Bilder dorthin scrollen (die Animation bleibt angehalten)
      if (cfg0.bildScrollen) await seite.evaluate(() => document.querySelector('.bogen-enthuellt').closest('svg').scrollIntoView({ block: 'center', behavior: 'instant' }));
      const rahmen = [];
      for (let k = 0; k < SOLL.length; k++) {
        const info = await seite.evaluate(zeitstandSetzen, SOLL[k]);
        await seite.evaluate(() => new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f))));
        const bild = join(BILDORDNER, `${values.ziel}-l${lauf}-${k + 1}.jpg`);
        await seite.screenshot({ path: bild, type: 'jpeg', quality: 70 });
        rahmen.push({ nr: k + 1, zeitstandMs: SOLL[k], gruppe: info.gruppe, laufend: info.laufend, laufendeNamen: info.namen, bild });
      }
      await kontext.close();
      ergebnis.laeufe.push({ lauf, http, pageerrors: fehler, methode: 'Animationen angehalten, Zeitstand gesetzt', rahmen });
      console.error(`${cfg0.pfad} lauf ${lauf}: HTTP ${http} · ${rahmen.map((r) => `${r.zeitstandMs} ms (${r.laufend} laufend von ${r.gruppe})`).join(' · ')}`);
    }
  } else if (MODUS === 'bildrate') {
    for (let lauf = 1; lauf <= LAEUFE; lauf++) {
      for (const drossel of [1, 4]) {
        const kontext = await neuerKontext(browser, { viewport: FENSTER, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
        const seite = await kontext.newPage();
      // UHR (ISO): feste Browser-Uhr, damit zeitabhängige Momente (B-06 nachts ohne Linie) aufgenommen werden können
      if (process.env.UHR) await seite.clock.setFixedTime(new Date(process.env.UHR));
        await seite.addInitScript(INIT, { ...cfg0, pausieren: false });
        const http = await oeffne(seite, vollerUrl(BASIS, cfg0.pfad), { warte: 0 });
        const cdp = await kontext.newCDPSession(seite);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: drossel });
        await ausloesen(seite, cfg0);
        const beispiel = await seite.evaluate(stand);
        const zeiten = await seite.evaluate(bildzeiten, 2000);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
        await kontext.close();
        const werte = auswertenRate(zeiten);
        ergebnis.laeufe.push({ lauf, drosselung: drossel, http, laufendBeiAuslosung: beispiel?.laufend.length ?? null, ...werte });
        console.error(`${cfg0.pfad} lauf ${lauf} CPU ${drossel}×: ${werte.bilder} Bilder · verworfen ${werte.anteilVerworfenProzent} % · Median ${werte.medianAbstandMs} ms`);
      }
    }
  } else if (MODUS === 'reduziert') {
    const kontext = await neuerKontext(browser, { viewport: FENSTER, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const seite = await kontext.newPage();
      // UHR (ISO): feste Browser-Uhr, damit zeitabhängige Momente (B-06 nachts ohne Linie) aufgenommen werden können
      if (process.env.UHR) await seite.clock.setFixedTime(new Date(process.env.UHR));
    await seite.addInitScript(INIT, { ...cfg0, pausieren: false });
    const http = await oeffne(seite, vollerUrl(BASIS, cfg0.pfad), { warte: 800 });
    if (cfg0.scrollen) {
      // Reduzierte Bewegung setzt kein data-sicht (Komponente kehrt früh zurück): zur Momentlinie scrollen
      await seite.waitForSelector('.weg-linie, .meilenstein-fortschritt, .meilenstein-erreicht', { state: 'attached', timeout: 30000 });
      await seite.evaluate(() => (document.querySelector('.weg-linie, .meilenstein-fortschritt') ?? document.querySelector('.meilenstein-erreicht')).scrollIntoView({ block: 'center', behavior: 'instant' }));
    }
    await seite.waitForTimeout(2500);
    const reduziert = await seite.evaluate(endzustand);
    const laufendNach2s = await seite.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    const dataSicht = await seite.evaluate(() => document.querySelector('[data-sicht]')?.dataset?.sicht ?? null);
    mkdirSync(BILDORDNER, { recursive: true });
    const bild = join(BILDORDNER, `${values.ziel}-reduziert.jpg`);
    await seite.screenshot({ path: bild, type: 'jpeg', quality: 70 });
    await kontext.close();
    ergebnis.laeufe.push({ http, dataSicht, laufendNach2s, endzustand: reduziert, bild });
    console.error(`${cfg0.pfad} reduziert: HTTP ${http} · laufend ${laufendNach2s} · Layout-Animationen ${reduziert.laufendLayout.length} · Deckkraft<1 ${reduziert.opazitaetKleiner1} von ${reduziert.gezaehlt}`);
  } else {
    throw new Error(`Unbekannter --modus ${MODUS}`);
  }
} finally {
  await browser.close();
}
if (values.protokoll) {
  mkdirSync(dirname(values.protokoll), { recursive: true });
  writeFileSync(`${values.protokoll}.json`, `${JSON.stringify(ergebnis, null, 2)}\n`);
}
process.stdout.write(`${JSON.stringify(ergebnis, null, 2)}\n`);
