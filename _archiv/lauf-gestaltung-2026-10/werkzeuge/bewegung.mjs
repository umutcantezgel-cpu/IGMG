#!/usr/bin/env node
// Prüfwerkzeug e: Bewegungsprüfung einer Route in drei Teilen.
//  (1) reducedMotion „reduce“: Elemente mit laufenden Animationen/Übergängen dürfen ihre Lage oder Größe nicht ändern
//      (Keyframes mit transform/translate/scale/rotate/width/height/top/left/right/bottom/inset/margin ⇒ Befund, und
//      tatsächliche Messung der Rechtecke über 2 s); Elemente mit opacity 0 müssen nach 2 s sichtbar sein
//      (auch nach Durchscrollen der Seite).
//  (2) ohne Reduktion: fünf Einzelbilder gleichmäßig über --dauer (Start bis Ende), mit Zahl laufender Animationen.
//  (3) Bildrate: CPU-Drosselung 4× (CDP), Fenster 390×844, rAF-Abstände über --dauer. Verworfen: Abstand > 1,5 × 16,7 ms;
//      verworfene Bilder je Lücke = max(1, round(Abstand/16,7) − 1). Anteil = verworfen / (gezeigt + verworfen).
//      Vergleich ohne Drosselung als Grundwert.
// Aufruf: node bewegung.mjs --route <pfad> [--dauer 2000] [--scrollen] [--basis URL] [--protokoll basisname]
// Beispiel: node bewegung.mjs --route / --dauer 2000
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { BILDER, basisAdresse, dateiname, hilfeAusgeben, neuerKontext, oeffne, schreibeProtokoll, standardProtokoll, starteBrowser, vollerUrl } from './hilfen.mjs';

const HILFE = `Aufruf: node bewegung.mjs --route <pfad> [--dauer 2000] [--scrollen] [--basis URL] [--protokoll basisname]
Beispiel: node bewegung.mjs --route / --dauer 2000`;

const { values } = parseArgs({
  options: {
    route: { type: 'string' },
    dauer: { type: 'string', default: '2000' },
    scrollen: { type: 'boolean', default: false },
    basis: { type: 'string' },
    protokoll: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || !values.route) hilfeAusgeben(HILFE);

const basis = basisAdresse(values.basis);
const pfad = values.route;
const dauer = Number(values.dauer);
const url = vollerUrl(basis, pfad);
const name = dateiname(pfad);
const ordner = join(BILDER, `bewegung-${name}`);
mkdirSync(ordner, { recursive: true });
const zeit = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const FENSTER = { width: 390, height: 844 };
const LAYOUT_EIGENSCHAFTEN = ['transform', 'translate', 'scale', 'rotate', 'width', 'height', 'top', 'left', 'right', 'bottom', 'inset', 'margin'];

/** Im Browser: laufende Animationen mit Keyframe-Eigenschaften und Zielelement. */
const laufendeAnimationen = () => {
  const sel = (el) => (el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...(el.classList ?? [])].slice(0, 2).map((c) => `.${c}`).join('')}` : '?');
  return document.getAnimations().map((a) => {
    const eff = a.effect;
    const kf = eff?.getKeyframes?.() ?? [];
    const props = [...new Set(kf.flatMap((k) => Object.keys(k)).filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)))];
    const art = a.transitionProperty ? 'Übergang' : a.animationName ? 'Animation' : 'Sonstige';
    return {
      art,
      name: a.animationName || a.transitionProperty || '',
      zustand: a.playState,
      eigenschaften: props,
      ziel: sel(eff?.target),
      ziele: eff?.target ?? null,
    };
  });
};

const result = { werkzeug: 'bewegung', zeit, basis, pfad, dauer, teile: {} };
const konsole = [];
const browser = await starteBrowser();
try {
  // (1) Reduzierte Bewegung
  const kontextR = await neuerKontext(browser, { viewport: FENSTER, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const seiteR = await kontextR.newPage();
  const status = await oeffne(seiteR, url, { warte: 300 });
  const t0 = await seiteR.evaluate(laufendeAnimationen);
  const elementAnzahl = await seiteR.evaluate(() => new Set(document.getAnimations().map((a) => a.effect?.target).filter(Boolean)).size);
  // Rechtecke der animierten Elemente zu Beginn und nach 0,5 s, 1 s und 2 s. Die Elementliste wird je Messung neu
  // gebildet; Elemente, deren Animation endet, fallen nur aus der Liste, wenn sie beim Start noch fehlen.
  // Jedes Element bekommt eine feste Kennung (WeakMap im Browser), damit Messungen gleicher Elemente verglichen werden.
  const messung = () =>
    seiteR.evaluate(() => {
      window.__bewKennung ??= { karte: new WeakMap(), naechste: 0 };
      const { karte } = window.__bewKennung;
      const aus = {};
      for (const el of new Set(document.getAnimations().map((a) => a.effect?.target).filter(Boolean))) {
        if (!karte.has(el)) karte.set(el, ++window.__bewKennung.naechste);
        const b = el.getBoundingClientRect();
        aus[karte.get(el)] = [b.x, b.y, b.width, b.height];
      }
      return aus;
    });
  const messungen = [await messung()];
  let verstrichen = 0;
  for (const ziel of [500, 1000, 2000]) {
    await seiteR.waitForTimeout(ziel - verstrichen);
    verstrichen = ziel;
    messungen.push(await messung());
  }
  // Größte Abweichung von Lage oder Größe zwischen aufeinanderfolgenden Messungen je Element
  let groesteAbweichung = 0;
  for (let i = 1; i < messungen.length; i++) {
    for (const [id, werte] of Object.entries(messungen[i])) {
      const davor = messungen[i - 1][id];
      if (!davor) continue;
      werte.forEach((wert, k) => { groesteAbweichung = Math.max(groesteAbweichung, Math.abs(wert - davor[k])); });
    }
  }
  const keyframeBefunde = t0.filter((a) => a.eigenschaften.some((p) => LAYOUT_EIGENSCHAFTEN.includes(p)));
  // Opacity-0-Elemente nach 2 s (vor und nach Durchscrollen)
  const unsichtbar = () =>
    seiteR.evaluate(() => {
      const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''} „${(el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)}“`;
      const liste = [];
      for (const el of document.body.querySelectorAll('*')) {
        if (getComputedStyle(el).opacity !== '0') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (liste.length < 50) liste.push({ el: sel(el), imSichtfeld: r.bottom > 0 && r.top < innerHeight });
      }
      return liste;
    });
  const nachZweiSekunden = await unsichtbar();
  await seiteR.evaluate(async () => {
    const hoehe = document.documentElement.scrollHeight;
    for (let y = 0; y < hoehe; y += 400) { window.scrollTo(0, y); await new Promise((f) => setTimeout(f, 120)); }
    window.scrollTo(0, 0);
  });
  await seiteR.waitForTimeout(2000);
  const nachScrollen = await unsichtbar();
  await kontextR.close();
  result.teile.reduziert = {
    http: status,
    animierteElemente: elementAnzahl,
    laufendeAnimationen: t0.length,
    keyframeBefunde: keyframeBefunde.map((a) => ({ art: a.art, name: a.name, eigenschaften: a.eigenschaften, ziel: a.ziel })),
    groesteLageAenderungPx: Math.round(groesteAbweichung * 10) / 10,
    unsichtbarNach2s: nachZweiSekunden,
    unsichtbarNachScrollen: nachScrollen,
    befund: {
      lageOderGroesse: keyframeBefunde.length > 0 || groesteAbweichung > 0.5,
      opacityNull: nachScrollen.length > 0,
    },
  };
  konsole.push(
    `(1) reduziert: HTTP ${status} · laufende Animationen ${t0.length} · mit Lage/Größe-Keyframes ${keyframeBefunde.length} · größte Lageänderung ${Math.round(groesteAbweichung * 10) / 10} px · Opacity 0 nach 2 s ${nachZweiSekunden.length} (nach Scrollen ${nachScrollen.length})`,
  );

  // (2) Einzelbilder ohne Reduktion
  const kontextN = await neuerKontext(browser, { viewport: FENSTER, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const seiteN = await kontextN.newPage();
  await oeffne(seiteN, url, { warte: 300 });
  const bilder = [];
  const start = Date.now();
  for (let k = 0; k <= 4; k++) {
    const soll = (dauer * k) / 4;
    const wartezeit = soll - (Date.now() - start);
    if (wartezeit > 0) await seiteN.waitForTimeout(wartezeit);
    const zeitpunkt = Date.now() - start;
    const laufend = await seiteN.evaluate(laufendeAnimationen);
    const pfadBild = join(ordner, `bewegung-${k + 1}.jpg`);
    await seiteN.screenshot({ path: pfadBild, type: 'jpeg', quality: 70 });
    bilder.push({
      nr: k + 1,
      sollMs: Math.round(soll),
      istMs: zeitpunkt,
      bild: pfadBild,
      laufendeAnimationen: laufend.filter((a) => a.zustand === 'running').length,
      eigenschaften: [...new Set(laufend.flatMap((a) => a.eigenschaften))],
    });
  }
  await kontextN.close();
  result.teile.einzelbilder = bilder;
  konsole.push(`(2) Einzelbilder: ${bilder.map((b) => `${b.nr}: ${b.istMs} ms, ${b.laufendeAnimationen} laufend`).join(' · ')} → ${ordner}`);

  // (3) Bildrate unter CPU-Drosselung 4× und ohne Drosselung
  const messeBildrate = async (drossel) => {
    const kontext = await neuerKontext(browser, { viewport: FENSTER, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const seite = await kontext.newPage();
    await oeffne(seite, url, { warte: 300 });
    const cdp = await kontext.newCDPSession(seite);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: drossel });
    const zeitstempel = await seite.evaluate(
      ({ ms, scrollen }) =>
        new Promise((fertig) => {
          const liste = [];
          const beginn = performance.now();
          let letzteScroll = beginn;
          const schritt = (t) => {
            liste.push(t);
            if (scrollen && t - letzteScroll > 100) { window.scrollBy(0, 24); letzteScroll = t; }
            if (t - beginn < ms) requestAnimationFrame(schritt);
            else fertig(liste);
          };
          requestAnimationFrame(schritt);
        }),
      { ms: dauer, scrollen: values.scrollen },
    );
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await kontext.close();
    const SCHWELLE = 1.5 * (1000 / 60);
    const abstaende = zeitstempel.slice(1).map((t, i) => t - zeitstempel[i]);
    const lange = abstaende.filter((d) => d > SCHWELLE);
    const verworfen = lange.reduce((s, d) => s + Math.max(1, Math.round(d / (1000 / 60)) - 1), 0);
    const gezeigt = zeitstempel.length;
    const sortiert = [...abstaende].sort((a, b) => a - b);
    return {
      drosselung: drossel,
      bilder: gezeigt,
      langeAbstaende: lange.length,
      verworfen,
      anteilVerworfenProzent: Math.round((verworfen / (gezeigt + verworfen)) * 1000) / 10,
      medianAbstandMs: Math.round((sortiert[Math.floor(sortiert.length / 2)] ?? NaN) * 10) / 10,
      p95AbstandMs: Math.round((sortiert[Math.floor(sortiert.length * 0.95)] ?? NaN) * 10) / 10,
    };
  };
  const ohne = await messeBildrate(1);
  const gedrosselt = await messeBildrate(4);
  result.teile.bildrate = { ohneDrosselung: ohne, drossel4: gedrosselt, scrollen: values.scrollen, fenster: FENSTER };
  konsole.push(
    `(3) Bildrate: ohne Drosselung ${ohne.anteilVerworfenProzent} % verworfen (${ohne.bilder} Bilder) · CPU 4× ${gedrosselt.anteilVerworfenProzent} % verworfen (${gedrosselt.bilder} Bilder, Median-Abstand ${gedrosselt.medianAbstandMs} ms)`,
  );
} finally {
  await browser.close();
}

// Werte aus dem Ergebnis für den Bericht (die Variablen oben liegen im try-Block)
const bilder = result.teile.einzelbilder;
const ohne = result.teile.bildrate.ohneDrosselung;
const gedrosselt = result.teile.bildrate.drossel4;

const md = [
  `# Bewegungsprüfung · ${pfad} · ${zeit} · ${basis}`,
  '',
  `## (1) Reduzierte Bewegung`,
  '',
  `- Laufende Animationen beim Laden: ${result.teile.reduziert.laufendeAnimationen} (Elemente: ${result.teile.reduziert.animierteElemente})`,
  `- Keyframes mit Lage/Größe (transform, translate, scale, rotate, width, height, top, left, right, bottom, inset, margin): ${result.teile.reduziert.keyframeBefunde.length}`,
  ...result.teile.reduziert.keyframeBefunde.map((a) => `  - ${a.art} ${a.name || ''} → ${a.eigenschaften.join(', ')} an ${a.ziel}`),
  `- Größte Lageänderung über 2 s: ${result.teile.reduziert.groesteLageAenderungPx} px`,
  `- Elemente mit opacity 0 nach 2 s: ${result.teile.reduziert.unsichtbarNach2s.length} · nach Durchscrollen: ${result.teile.reduziert.unsichtbarNachScrollen.length}`,
  ...result.teile.reduziert.unsichtbarNachScrollen.slice(0, 10).map((e) => `  - ${e.el}${e.imSichtfeld ? ' (im Sichtfeld)' : ''}`),
  '',
  `## (2) Einzelbilder (ohne Reduktion)`,
  '',
  '| Nr | Soll ms | Ist ms | laufend | Eigenschaften | Bild |',
  '|---|---|---|---|---|---|',
  ...bilder.map((b) => `| ${b.nr} | ${b.sollMs} | ${b.istMs} | ${b.laufendeAnimationen} | ${b.eigenschaften.join(', ') || '–'} | ${b.bild} |`),
  '',
  `## (3) Bildrate (rAF, Fenster 390×844, ${dauer} ms${values.scrollen ? ', mit Scrollen' : ''})`,
  '',
  `- Ohne Drosselung: ${ohne.anteilVerworfenProzent} % verworfen · ${ohne.bilder} Bilder · lange Abstände ${ohne.langeAbstaende} · Median ${ohne.medianAbstandMs} ms`,
  `- CPU 4×: ${gedrosselt.anteilVerworfenProzent} % verworfen · ${gedrosselt.bilder} Bilder · lange Abstände ${gedrosselt.langeAbstaende} · Median ${gedrosselt.medianAbstandMs} ms · p95 ${gedrosselt.p95AbstandMs} ms`,
].join('\n');
const protokoll = values.protokoll ?? standardProtokoll(`bewegung-${name}`);
const dateien = schreibeProtokoll(protokoll, { json: result, md });
for (const zeile of konsole) console.log(zeile);
console.log(`Protokoll: ${dateien.join(', ')}`);
