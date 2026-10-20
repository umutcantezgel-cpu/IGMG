// JS-Budgets der Lern-App (KERN 4.0 §9 in der Fassung nach Spike S1, PLAN §3.6) am laufenden Produktionsbau messen.
// Aufruf (nach `pnpm build`, Server läuft): node scripts/lernapp-budget.mjs [basis-url] [--aus <datei.json>]
// Gemessen wird wie `messen.mjs` (`jsKb`): JavaScript, das eine Route beim Laden holt, je Datei gzip -9 (Service Worker
// gesperrt, damit jede Datei aus dem Netz kommt). Testkurs aus dem Seed (Bau mit Datenbank bzw. Beispielmodus).
// - Grundstock (Next/React) = Programmteile, die die Website `/` und die Hülle `/lern-app/de/quellen` gemeinsam laden.
// - Hülle: eigener Anteil von `/lern-app/de/quellen` über dem Grundstock ≤ 20 KB.
// - Start `/lern-app/de`, Lernpfad `/lern-app/ar/de-aus-ar`, Fortschritt `/lern-app/de/fortschritt`: gesamt ≤ 180 KB,
//   eigener Anteil ≤ 30 KB.
// - Spieler `/lern-app/tr/de-aus-tr/ueben?l=…` (erste Aufgabe sichtbar): gesamt ≤ 210 KB, zusätzlich zur Hülle ≤ 60 KB.
// - je Übungstyp ≤ 15 KB: der Chunk des Typs (`TYP_ERKENNUNG`: Datei aus `.next/static/chunks`, in der alle
//   Erkennungstexte des Typs stehen – Turbopack legt die gemeinsamen Bausteine wie Optionsgruppe oder Texteingabe in jeden
//   Typ-Chunk; mehrere passende Dateien sind Chunks verschiedener Typen gleicher Bauart, gezählt wird die größte) plus
//   jede Datei mit einem Baustein des Typs, die zu keinem Typ gehört (falls ein Baustein als eigener Chunk ausgelagert ist).
// - arabische Bildschirmtastatur ≤ 10 KB (eigener Chunk, erst bei arabischem Freitext).
// Exit 1, wenn ein Budget verfehlt ist.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const ausIndex = args.indexOf('--aus');
const aus = ausIndex >= 0 ? args[ausIndex + 1] : null;
const basis = args.find((a, i) => !a.startsWith('--') && (ausIndex < 0 || i !== ausIndex + 1)) ?? 'http://localhost:3100';
const KB = 1024;

const ROUTEN = {
  website: { pfad: '/' },
  huelle: { pfad: '/lern-app/de/quellen' },
  start: { pfad: '/lern-app/de' },
  lernpfad: { pfad: '/lern-app/ar/de-aus-ar', warte: 'main a[href*="/ueben?l="]' },
  fortschritt: { pfad: '/lern-app/de/fortschritt' },
  spieler: { pfad: '/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.e01.l01', warte: 'main input[type="radio"]' },
  spielerWortbank: { pfad: '/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.e01.l02', warte: 'main [role="toolbar"]' },
};

/** Erkennungstexte der Komponenten (lange Klassenketten, je genau eine Quelldatei; geprüft in tests/unit/lernapp/bundle-regeln). */
const ERKENNUNG = JSON.parse(readFileSync(join(import.meta.dirname, 'lernapp-budget-erkennung.json'), 'utf8'));

/**
 * Erkennung je Übungstyp: `alle` stehen in der Datei des Typ-Chunks (eigene Komponente bzw. Bauart: Hören + Wahl,
 * Hören + Eingabe), `bausteine` sind gemeinsame Bausteine, die der Typ nachlädt.
 */
const TEXT = ['texteingabe', 'zeichenhilfe', 'sonderzeichen'];
const TYP_ERKENNUNG = {
  auswahl: { alle: ['auswahl'] },
  paare: { alle: ['paare'] },
  wortbank: { alle: ['wortbank'] },
  bild_wort: { alle: ['bild_wort'], bausteine: ['optionsgruppe'] },
  frei: { alle: ['frei'], bausteine: TEXT },
  hoeren_waehlen: { alle: ['abspieler', 'optionsgruppe'] },
  hoeren_schreiben: { alle: ['abspieler', 'texteingabe'], bausteine: TEXT },
  minimalpaare: { alle: ['abspieler', 'optionsgruppe'] },
  luecke: { alle: ['luecke'], bausteine: ['optionsgruppe', ...TEXT] },
  satzbau: { alle: ['wortbank'] },
  formen: { alle: ['formen'], bausteine: TEXT },
  harakat: { alle: ['harakat'], bausteine: ['optionsgruppe'] },
};
/** Texte, die eine Datei einem Typ-Chunk zuordnen (eigene Komponenten und der Abspieler der Hörtypen). */
const TYP_TEXTE = ['auswahl', 'paare', 'wortbank', 'bild_wort', 'frei', 'luecke', 'formen', 'harakat', 'abspieler'];

const BUDGET = {
  huelleEigen: 20,
  startGesamt: 180,
  startEigen: 30,
  lernpfadGesamt: 180,
  lernpfadEigen: 30,
  fortschrittGesamt: 180,
  fortschrittEigen: 30,
  spielerGesamt: 210,
  spielerZusaetzlich: 60,
  uebungstyp: 15,
  arabischeTastatur: 10,
};

async function skripte(browser, { pfad, warte }) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const dateien = new Map();
  const offen = [];
  page.on('response', (r) => {
    const url = new URL(r.url());
    if (r.request().resourceType() !== 'script' || url.origin !== new URL(basis).origin) return;
    offen.push(
      r
        .body()
        .then((b) => dateien.set(url.pathname, gzipSync(b, { level: 9 }).length))
        .catch(() => undefined),
    );
  });
  const antwort = await page.goto(basis + pfad, { waitUntil: 'networkidle' });
  if (!antwort || antwort.status() !== 200) throw new Error(`${pfad}: HTTP ${antwort?.status()}`);
  if (warte) await page.waitForSelector(warte, { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await Promise.all(offen);
  await context.close();
  return dateien;
}

const summe = (m, filter = () => true) => [...m].filter(([d]) => filter(d)).reduce((s, [, b]) => s + b, 0);
const kb = (b) => Math.round((b / KB) * 10) / 10;

function chunkDateien(ordner) {
  const liste = [];
  for (const n of readdirSync(ordner)) {
    const p = join(ordner, n);
    if (statSync(p).isDirectory()) liste.push(...chunkDateien(p));
    else if (n.endsWith('.js')) liste.push(p);
  }
  return liste;
}

const browser = await chromium.launch();
const gemessen = {};
try {
  for (const [name, route] of Object.entries(ROUTEN)) gemessen[name] = await skripte(browser, route);
} finally {
  await browser.close();
}

const grundstock = new Set([...gemessen.website.keys()].filter((d) => gemessen.huelle.has(d)));
const ohneGrundstock = (d) => !grundstock.has(d);
const grundstockBytes = summe(gemessen.huelle, (d) => grundstock.has(d));

// Übungstypen und Spieler: Dateien mit dem Erkennungstext im Bauergebnis
const ordner = join(import.meta.dirname, '..', '.next', 'static', 'chunks');
const inhalt = new Map(chunkDateien(ordner).map((p) => [p.slice(ordner.length), readFileSync(p, 'utf8')]));
const gzVon = (d) => gzipSync(readFileSync(join(ordner, d)), { level: 9 }).length;
const typen = {};
for (const [name, { text }] of Object.entries(ERKENNUNG)) {
  const treffer = [...inhalt].filter(([, t]) => t.includes(text)).map(([d]) => d);
  typen[name] = { dateien: treffer, gz: treffer.reduce((s, d) => s + gzVon(d), 0) };
}
const hat = (d, name) => typen[name].dateien.includes(d);

/** Chunk eines Übungstyps (größte passende Datei) und ausgelagerte Bausteine; 0 = nicht gefunden. */
function typChunk({ alle, bausteine = [] }) {
  const eigene = [...inhalt.keys()].filter((d) => alle.every((n) => hat(d, n)));
  if (!eigene.length) return { gz: 0, dateien: [] };
  const groesste = eigene.map((d) => [d, gzVon(d)]).sort((a, b) => b[1] - a[1])[0];
  const ausgelagert = [...new Set(bausteine.flatMap((n) => typen[n].dateien))].filter((d) => !TYP_TEXTE.some((n) => hat(d, n)));
  return { gz: groesste[1] + ausgelagert.reduce((s, d) => s + gzVon(d), 0), dateien: [groesste[0], ...ausgelagert] };
}
const uebungstypen = Object.fromEntries(Object.entries(TYP_ERKENNUNG).map(([t, e]) => [t, typChunk(e)]));

const werte = {
  grundstock: kb(grundstockBytes),
  huelleGesamt: kb(summe(gemessen.huelle)),
  huelleEigen: kb(summe(gemessen.huelle, ohneGrundstock)),
  startGesamt: kb(summe(gemessen.start)),
  startEigen: kb(summe(gemessen.start, ohneGrundstock)),
  lernpfadGesamt: kb(summe(gemessen.lernpfad)),
  lernpfadEigen: kb(summe(gemessen.lernpfad, ohneGrundstock)),
  fortschrittGesamt: kb(summe(gemessen.fortschritt)),
  fortschrittEigen: kb(summe(gemessen.fortschritt, ohneGrundstock)),
  spielerGesamt: kb(summe(gemessen.spieler)),
  spielerZusaetzlich: kb(summe(gemessen.spieler, (d) => !gemessen.huelle.has(d))),
  spielerWortbankGesamt: kb(summe(gemessen.spielerWortbank)),
  uebungstyp: Object.fromEntries(Object.entries(uebungstypen).map(([t, { gz }]) => [t, kb(gz)])),
  arabischeTastatur: kb(typen.arabischeTastatur.gz),
  spielerChunk: kb(typen.spieler.gz),
};

const verfehlt = [];
for (const [k, grenze] of Object.entries(BUDGET)) {
  if (k === 'uebungstyp') {
    for (const [t, v] of Object.entries(werte.uebungstyp))
      if (!v || v > grenze) verfehlt.push(`Übungstyp ${t}: ${v} KB (≤ ${grenze}, 0 = nicht gefunden)`);
  } else if (k === 'arabischeTastatur') {
    if (!werte[k] || werte[k] > grenze) verfehlt.push(`arabische Tastatur: ${werte[k]} KB (≤ ${grenze}, 0 = nicht gefunden)`);
  } else if (werte[k] > grenze) verfehlt.push(`${k}: ${werte[k]} KB > ${grenze}`);
}
if (!werte.spielerChunk) verfehlt.push('Spieler-Chunk nicht gefunden (Erkennungstext)');

const zeilen = [
  `Lern-App JS-Budgets (gz -9, ${basis})`,
  `Grundstock Next/React: ${werte.grundstock} KB (${grundstock.size} Dateien)`,
  `Hülle /lern-app/de/quellen: gesamt ${werte.huelleGesamt} KB, eigener Anteil ${werte.huelleEigen} KB (≤ ${BUDGET.huelleEigen})`,
  `Start /lern-app/de: gesamt ${werte.startGesamt} KB (≤ ${BUDGET.startGesamt}), eigener Anteil ${werte.startEigen} KB (≤ ${BUDGET.startEigen})`,
  `Lernpfad /lern-app/ar/de-aus-ar: gesamt ${werte.lernpfadGesamt} KB (≤ ${BUDGET.lernpfadGesamt}), eigener Anteil ${werte.lernpfadEigen} KB (≤ ${BUDGET.lernpfadEigen})`,
  `Fortschritt /lern-app/de/fortschritt: gesamt ${werte.fortschrittGesamt} KB (≤ ${BUDGET.fortschrittGesamt}), eigener Anteil ${werte.fortschrittEigen} KB (≤ ${BUDGET.fortschrittEigen})`,
  `Spieler-Route (Lektion 1, erste Aufgabe): gesamt ${werte.spielerGesamt} KB (≤ ${BUDGET.spielerGesamt}), zusätzlich zur Hülle ${werte.spielerZusaetzlich} KB (≤ ${BUDGET.spielerZusaetzlich})`,
  `Spieler-Route (Lektion 2, Wortbank zuerst): gesamt ${werte.spielerWortbankGesamt} KB`,
  `Spieler-Chunk: ${werte.spielerChunk} KB · Übungstypen: ${Object.entries(werte.uebungstyp)
    .map(([t, v]) => `${t} ${v} KB`)
    .join(', ')} (je ≤ ${BUDGET.uebungstyp})`,
  `Arabische Bildschirmtastatur: ${werte.arabischeTastatur} KB (≤ ${BUDGET.arabischeTastatur})`,
  verfehlt.length ? `VERFEHLT: ${verfehlt.join(' · ')}` : 'Alle Budgets eingehalten.',
];
console.log(zeilen.join('\n'));
if (aus)
  writeFileSync(aus, JSON.stringify({ basis, werte, budget: BUDGET, typen, uebungstypen, verfehlt, grundstock: [...grundstock] }, null, 2));
process.exit(verfehlt.length ? 1 : 0);
