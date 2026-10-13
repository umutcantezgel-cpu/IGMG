#!/usr/bin/env node
// Prüfwerkzeug b: Bildsatz je Route in 390×844, 768×1024 und 1440×900. Je Bildschirmhöhe ein Ausschnitt (scrollen,
// nicht fullPage), dazu Überlaufprüfung je Ausschnitt:
//   - horizontales Scrollen: document.documentElement.scrollWidth > innerWidth
//   - abgeschnittener Text: Elemente mit overflow hidden/clip, deren scrollWidth > clientWidth bzw. scrollHeight > clientHeight
//     (mit Auslassungszeichen oder Zeilenkürzung markiert: vermutlich beabsichtigt)
//   - Elemente, die über den rechten Rand ragen (zur Ursachensuche beim Querscrollen)
// Aufruf: node bildsatz.mjs --routen datei.json [--aus ordner] [--reduziert] [--max-schirme 16] [--basis URL]
//         [--warte ms] [--schirm-warte ms] [--zustand storageState.json] [--protokoll basisname]
//   --schirm-warte: Wartezeit nach jedem Scrollen (Vorgabe 350; für Endzustände von Momenten ≥ 1600)
//   --zustand: Anmeldestand (storageState) für Verwaltungsansichten; POST außerhalb von /_next/ wird abgebrochen
// Beispiel: node bildsatz.mjs --routen routen-hauptansichten.json --reduziert
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  BILDER,
  GERAETE,
  basisAdresse,
  dateiname,
  hilfeAusgeben,
  lesePfade,
  neuerKontext,
  oeffne,
  schreibeProtokoll,
  standardProtokoll,
  starteBrowser,
  vollerUrl,
} from './hilfen.mjs';

const HILFE = `Aufruf: node bildsatz.mjs --routen datei.json [--aus ordner] [--reduziert] [--max-schirme 16] [--basis URL] [--warte ms] [--schirm-warte ms] [--zustand storageState.json] [--protokoll basisname]
Beispiel: node bildsatz.mjs --routen routen-hauptansichten.json --aus /tmp/bildsatz --max-schirme 4`;

const { values } = parseArgs({
  options: {
    routen: { type: 'string' },
    aus: { type: 'string' },
    reduziert: { type: 'boolean', default: false },
    'max-schirme': { type: 'string', default: '16' },
    basis: { type: 'string' },
    warte: { type: 'string', default: '600' },
    'schirm-warte': { type: 'string', default: '350' },
    zustand: { type: 'string' },
    protokoll: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe || !values.routen) hilfeAusgeben(HILFE);

const basis = basisAdresse(values.basis);
const routen = lesePfade(values.routen);
const zeit = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const aus = values.aus ?? join(BILDER, `bildsatz-${zeit}${values.reduziert ? '-reduziert' : ''}`);
const maxSchirme = Number(values['max-schirme']);
mkdirSync(aus, { recursive: true });

/** Läuft im Browser: Überlauf und abgeschnittener Text an der aktuellen Scrollposition. */
const ueberlaufPruefung = () => {
  const etikett = (el) => {
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50);
    const klassen = [...el.classList].slice(0, 2).map((c) => `.${c}`).join('');
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${klassen} „${text}“`;
  };
  const horizontal = document.documentElement.scrollWidth > window.innerWidth + 1;
  const abgeschnitten = [];
  const ausserhalb = [];
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > window.innerWidth + 1 && ausserhalb.length < 20) ausserhalb.push({ el: etikett(el), rechts: Math.round(r.right) });
    const beschnitten = ['hidden', 'clip'].includes(cs.overflowX) || ['hidden', 'clip'].includes(cs.overflowY);
    if (!beschnitten || !(el.textContent ?? '').trim()) continue;
    // Visuell verborgener Text für Bildschirmleser (sr-only, 1 px): absichtlich abgeschnitten, kein Befund
    if (el.classList.contains('sr-only') || el.offsetWidth <= 2 || el.offsetHeight <= 2) continue;
    const kuerzung = cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none');
    if (el.scrollWidth > el.clientWidth + 1 && abgeschnitten.length < 60)
      abgeschnitten.push({ art: 'waagerecht', el: etikett(el), vermutlichBeabsichtigt: kuerzung, luecke: el.scrollWidth - el.clientWidth });
    if (el.scrollHeight > el.clientHeight + 1 && abgeschnitten.length < 60)
      abgeschnitten.push({ art: 'senkrecht', el: etikett(el), vermutlichBeabsichtigt: kuerzung, luecke: el.scrollHeight - el.clientHeight });
  }
  return {
    innenBreite: window.innerWidth,
    dokumentBreite: document.documentElement.scrollWidth,
    horizontal,
    abgeschnitten,
    ausserhalb,
  };
};

const browser = await starteBrowser();
const ergebnis = [];
try {
  for (const route of routen) {
    const eintrag = { name: route.name, pfad: route.pfad, groessen: {} };
    for (const [schluessel, geraet] of Object.entries(GERAETE)) {
      const { breite, hoehe } = geraet;
      const ordner = join(aus, dateiname(route.pfad), `${breite}x${hoehe}`);
      mkdirSync(ordner, { recursive: true });
      const kontext = await neuerKontext(browser, {
        viewport: { width: breite, height: hoehe },
        deviceScaleFactor: 1,
        reducedMotion: values.reduziert ? 'reduce' : 'no-preference',
        ...(values.zustand ? { storageState: values.zustand } : {}),
      });
      const seite = await kontext.newPage();
      if (values.zustand) await seite.route('**/*', (r) => (r.request().method() === 'POST' && !r.request().url().includes('/_next/') ? r.abort() : r.continue()));
      const status = await oeffne(seite, vollerUrl(basis, route.pfad), { warte: Number(values.warte) });
      const gesamtHoehe = await seite.evaluate(() => document.documentElement.scrollHeight);
      const anzahl = Math.max(1, Math.min(maxSchirme, Math.ceil(gesamtHoehe / hoehe)));
      const bilder = [];
      const befunde = new Map();
      let horizontal = false;
      let dokumentBreite = breite;
      for (let i = 0; i < anzahl; i++) {
        const y = Math.min(i * hoehe, Math.max(0, gesamtHoehe - hoehe));
        await seite.evaluate((pos) => window.scrollTo(0, pos), y);
        await seite.waitForTimeout(Number(values['schirm-warte']));
        const bildPfad = join(ordner, `schirm-${String(i + 1).padStart(2, '0')}.jpg`);
        await seite.screenshot({ path: bildPfad, type: 'jpeg', quality: 70 });
        bilder.push(bildPfad);
        const pruef = await seite.evaluate(ueberlaufPruefung);
        horizontal ||= pruef.horizontal;
        dokumentBreite = Math.max(dokumentBreite, pruef.dokumentBreite);
        for (const b of pruef.abgeschnitten) befunde.set(`abgeschnitten|${b.art}|${b.el}`, { ...b, schirm: i + 1 });
        for (const a of pruef.ausserhalb) befunde.set(`ausserhalb|${a.el}`, { art: 'ausserhalb', ...a, schirm: i + 1 });
      }
      await kontext.close();
      const liste = [...befunde.values()];
      eintrag.groessen[`${breite}x${hoehe}`] = {
        http: status,
        schirmHoehe: hoehe,
        gesamtHoehe,
        bildschirme: anzahl,
        gekuerzt: Math.ceil(gesamtHoehe / hoehe) > anzahl,
        horizontalesScrollen: horizontal,
        dokumentBreite,
        befunde: liste,
        ordner,
      };
      console.log(
        `${route.pfad} ${breite}×${hoehe}: HTTP ${status} · ${anzahl} Ausschnitte${eintrag.groessen[`${breite}x${hoehe}`].gekuerzt ? ' (gekürzt)' : ''} · horizontal ${horizontal ? 'JA' : 'nein'} · Befunde ${liste.length}`,
      );
    }
    ergebnis.push(eintrag);
  }
} finally {
  await browser.close();
}

const kurzzeile = (g) =>
  `| ${g.http} | ${g.bildschirme}${g.gekuerzt ? ' (gekürzt)' : ''} | ${g.horizontalesScrollen ? '**ja**' : 'nein'} | ${g.befunde.filter((b) => b.art !== 'ausserhalb' && !b.vermutlichBeabsichtigt).length} | ${g.befunde.filter((b) => b.vermutlichBeabsichtigt).length} |`;
const md = [
  `# Bildsatz und Überlaufprüfung · ${zeit} · ${basis}${values.reduziert ? ' · reduzierte Bewegung' : ''}`,
  '',
  'Je Route und Größe: HTTP-Status, Anzahl Ausschnitte, horizontales Scrollen, abgeschnittene Elemente (ohne Kürzung mit Auslassungszeichen), vermutlich beabsichtigte Kürzungen.',
  '',
  ...ergebnis.flatMap((e) => [
    `## ${e.name} (${e.pfad})`,
    '',
    '| Größe | HTTP | Ausschnitte | horizontal | abgeschnitten | Kürzung (beabsichtigt?) |',
    '|---|---|---|---|---|---|',
    ...Object.entries(e.groessen).map(([gr, g]) => `| ${gr} ${kurzzeile(g)}`),
    '',
    ...Object.entries(e.groessen)
      .filter(([, g]) => g.befunde.length)
      .flatMap(([gr, g]) => [
        `Befunde ${gr} (erste 8):`,
        ...g.befunde.slice(0, 8).map((b) => `- Schirm ${b.schirm}: ${b.art}${b.luecke ? ` (Lücke ${b.luecke} px)` : ''} ${b.el}`),
        '',
      ]),
  ]),
  `Bilder: ${aus}`,
].join('\n');
const protokoll = values.protokoll ?? standardProtokoll(`bildsatz${values.reduziert ? '-reduziert' : ''}`);
const dateien = schreibeProtokoll(protokoll, {
  json: { werkzeug: 'bildsatz', zeit, basis, reduziert: values.reduziert, bilder: aus, routen: ergebnis },
  md,
});
writeFileSync(join(aus, 'zusammenfassung.md'), `${md}\n`);
console.log(`Protokoll: ${dateien.join(', ')}`);
console.log(`Bilder: ${aus}`);
