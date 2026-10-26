// JS-Budgets der Lern-App (KERN 4.0 §9 in der Fassung nach Spike S1, PLAN §3.6) am laufenden Produktionsbau messen.
// Aufruf (nach `pnpm build`, Server läuft): node scripts/lernapp-budget.mjs [basis-url] [--aus <datei.json>]
// Gemessen wird wie `messen.mjs` (`jsKb`): JavaScript, das eine Route beim Laden holt, je Datei gzip -9 (Service Worker
// gesperrt, damit jede Datei aus dem Netz kommt). Testkurs aus dem Seed (Bau mit Datenbank bzw. Beispielmodus).
// - Grundstock (Next/React) = Programmteile, die die Website `/` und die Hülle `/lern-app/de/quellen` gemeinsam laden.
// - Hülle: eigener Anteil von `/lern-app/de/quellen` über dem Grundstock ≤ 20 KB.
// - Start `/lern-app/de`, Lernpfad `/lern-app/ar/de-aus-ar`, Fortschritt `/lern-app/de/fortschritt`: gesamt ≤ 180 KB,
//   eigener Anteil ≤ 30 KB.
// - Spieler `/lern-app/tr/de-aus-tr/ueben?l=…` (erste Aufgabe sichtbar): gesamt ≤ 210 KB, zusätzlich zur Hülle ≤ 60 KB. Der
//   Typ-Chunk der ersten Aufgabe zählt mit. Gemessen werden die Testlektion (Auswahl zuerst) und echte Lektionen: je Typ der
//   ersten Aufgabe (Lücke ohne Ablenker als eigene Form `luecke_frei`) eine Lektion aus `inhalte/lernapp`, deren Einheit der
//   Server ausliefert (Kursverzeichnis der Richtung). Formen ohne ausgelieferte Lektion (Entwurf, z. B. `formen` in
//   tr.b1.e16, oder der Wissenskurs) werden geschätzt: Spielerkern (Testlektion ohne Typ-Chunks) + Typ-Chunk der ersten
//   Aufgabe (+ bei `luecke_frei` das Feld). Es zählt jeweils die ungünstigste; das Budget gilt für Messung und Schätzung
//   (Stufe C N6). Gemessen wird nur mit den Inhalten der E2E-Datenbank bzw. des Import-Baus; `--ohne-echt` lässt Messung und
//   Schätzung aus.
// - je Übungstyp ≤ 15 KB: der Chunk des Typs (`TYP_ERKENNUNG`: Datei aus `.next/static/chunks`, in der alle
//   Erkennungstexte des Typs stehen – Turbopack legt die gemeinsamen Bausteine wie Optionsgruppe oder Texteingabe in jeden
//   Typ-Chunk; mehrere passende Dateien sind Chunks verschiedener Typen gleicher Bauart, gezählt wird die größte) plus
//   jede Datei mit einem Baustein des Typs, die zu keinem Typ gehört (falls ein Baustein als eigener Chunk ausgelagert ist).
// - arabische Bildschirmtastatur ≤ 10 KB (eigener Chunk, erst bei arabischem Freitext).
// - Wiederholen (ohne Karten) und Einstufung (vor dem Start) auf einem neuen Gerät: gesamt ≤ 210 KB und ohne Zod (L2-04).
// Exit 1, wenn ein Budget verfehlt ist.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2).filter((a) => a !== '--ohne-echt');
const ohneEcht = process.argv.includes('--ohne-echt');
const ausIndex = args.indexOf('--aus');
const aus = ausIndex >= 0 ? args[ausIndex + 1] : null;
const basis = args.find((a, i) => !a.startsWith('--') && (ausIndex < 0 || i !== ausIndex + 1)) ?? 'http://localhost:3100';
const KB = 1024;

/** Erste Aufgabe steht: Formular mit Typ, ohne „wird geladen“ (Ersatz während des Typ-Chunks). */
const ERSTE_AUFGABE = (typ) => `main form[data-aufgabe="${typ}"] > :nth-child(2):not(p)`;

/** Ausgangssprachen je Zielsprache, in dieser Reihenfolge versucht (Oberfläche = Ausgangssprache). */
const AUSGANG = { de: ['tr', 'ar'], tr: ['de', 'ar'], ar: ['de', 'tr'] };

/**
 * Lektionen je Form der ersten Aufgabe aus `inhalte/lernapp` (alle Stände, auch Entwurf): Typ, bei der Lücke ohne Ablenker
 * `luecke_frei` (Feld und Zeichenhilfe laden sofort mit). `ziel` nur bei Sprachkursen (`sprache/<ziel>/…`).
 */
function ersteAufgaben() {
  const wurzel = join(import.meta.dirname, '..', 'inhalte', 'lernapp');
  const je = new Map();
  const lies = (ordner) => {
    for (const n of readdirSync(ordner).sort()) {
      const p = join(ordner, n);
      if (statSync(p).isDirectory()) lies(p);
      else if (n.endsWith('.json')) {
        let d;
        try {
          d = JSON.parse(readFileSync(p, 'utf8'));
        } catch {
          continue;
        }
        if (!d || !Array.isArray(d.lektionen)) continue;
        const teile = p.slice(wurzel.length + 1).split(sep);
        const ziel = teile[0] === 'sprache' ? teile[1] : null;
        for (const l of d.lektionen) {
          const a = l?.aufgaben?.[0];
          if (!a?.typ || typeof l.schluessel !== 'string') continue;
          const form = a.typ === 'luecke' && !a.ablenker ? 'luecke_frei' : a.typ;
          if (!je.has(form)) je.set(form, []);
          je.get(form).push({ lektion: l.schluessel, einheit: l.schluessel.split('.').slice(0, -1).join('.'), ziel, status: d.status });
        }
      }
    }
  };
  lies(wurzel);
  return je;
}

/** Ausgelieferte Einheiten je Richtung (Kursverzeichnis des laufenden Servers; 404 = Lern-App aus → leer). */
async function ausgeliefert(richtung) {
  try {
    const r = await fetch(`${basis}/lern-app/pakete/${richtung}`);
    if (!r.ok) return new Set();
    return new Set((await r.json()).einheiten.map((e) => e.schluessel));
  } catch {
    return new Set();
  }
}

/** Je Form bis zu drei Lektionen, deren Einheit ausgeliefert wird (Routen in dieser Reihenfolge versucht); sonst keine. */
async function echteLektionen() {
  const verzeichnisse = new Map();
  const liefert = async (richtung, einheit) => {
    if (!verzeichnisse.has(richtung)) verzeichnisse.set(richtung, await ausgeliefert(richtung));
    return verzeichnisse.get(richtung).has(einheit);
  };
  const ergebnis = {};
  for (const [form, lektionen] of [...ersteAufgaben()].sort(([a], [b]) => a.localeCompare(b))) {
    const routen = [];
    ergebnis[form] = { lektionen: lektionen.length, beispiel: lektionen[0].lektion, routen };
    for (const l of lektionen) {
      if (routen.length >= 3) break;
      for (const ausgang of AUSGANG[l.ziel] ?? []) {
        const richtung = `${l.ziel}-aus-${ausgang}`;
        if (!(await liefert(richtung, l.einheit))) continue;
        const id = `${richtung}.${l.lektion.split('.').slice(1).join('.')}`;
        const warte = ERSTE_AUFGABE(form === 'luecke_frei' ? 'luecke' : form);
        routen.push({ lektion: id, pfad: `/lern-app/${ausgang}/${richtung}/ueben?l=${id}`, warte, zeit: 15_000, darfFehlen: true });
        break;
      }
    }
  }
  return ergebnis;
}
const ECHT = ohneEcht ? {} : await echteLektionen();

const ROUTEN = {
  website: { pfad: '/' },
  huelle: { pfad: '/lern-app/de/quellen' },
  start: { pfad: '/lern-app/de' },
  lernpfad: { pfad: '/lern-app/ar/de-aus-ar', warte: 'main a[href*="/ueben?l="]' },
  fortschritt: { pfad: '/lern-app/de/fortschritt' },
  spieler: { pfad: '/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.test.l01', warte: 'main input[type="radio"]' },
  spielerWortbank: { pfad: '/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.test.l02', warte: 'main [role="toolbar"]' },
  // echte Lektionen: die erste der Kandidaten, deren erste Aufgabe erscheint (`kandidaten`)
  ...Object.fromEntries(
    Object.entries(ECHT)
      .filter(([, e]) => e.routen.length)
      .map(([form, e]) => [`echt_${form}`, { kandidaten: e.routen }]),
  ),
  // L2-04: neues Gerät – ohne Karten bzw. vor „Test beginnen“ darf kein Zod laden (TBT der Spieler-Routen)
  wiederholen: { pfad: '/lern-app/de/tr-aus-de/wiederholen', warte: '#wiederholen-sitzung p' },
  einstufung: { pfad: '/lern-app/de/tr-aus-de/einstufung', warte: '#einstufung-test button' },
};
/** zod/mini trägt den Namen seines Grundtyps als Zeichenkette – Kennzeichen „Zod geladen“. */
const ZOD_MARKE = '$ZodType';

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
  luecke: { alle: ['luecke'], bausteine: ['optionsgruppe', ...TEXT], nachgeladen: ['luecke_feld'] },
  satzbau: { alle: ['wortbank'] },
  // Stufe C N6: Zeichenhilfe erst mit dem ersten Fokus (eigener Chunk, zählt hier mit)
  formen: { alle: ['formen'], bausteine: TEXT },
  harakat: { alle: ['harakat'], bausteine: ['optionsgruppe'] },
  // L2-03: Wissenskurs und Koran-Arabisch (Begründung und Quellenzeile aus dem Baustein `Erklaerung`)
  wahr_falsch: { alle: ['wahr_falsch'], bausteine: ['optionsgruppe', 'erklaerung'] },
  zuordnen: { alle: ['zuordnen'], bausteine: ['optionsgruppe', 'erklaerung'] },
  reihenfolge: { alle: ['reihenfolge'], bausteine: ['erklaerung'] },
  fallfrage: { alle: ['fallfrage'], bausteine: ['optionsgruppe', 'erklaerung'] },
  koran_wort: { alle: ['koran_wort'], bausteine: ['optionsgruppe'] },
  // L2-02: Wahl über die Wahlgruppe, Hörbeispiel über Anhoeren (Nachspuren lädt bei Bedarf einen eigenen Chunk nach)
  dialog: { alle: ['dialog'], bausteine: ['wahlgruppe', 'anhoeren'] },
  geschichte: { alle: ['geschichte'], bausteine: ['wahlgruppe', 'anhoeren'] },
  lesen_fragen: { alle: ['lesen_fragen'], bausteine: ['wahlgruppe'] },
  grammatik_tipp: { alle: ['grammatik_tipp'] },
  schrift_ar: { alle: ['schrift_ar'], bausteine: ['wahlgruppe'] },
  schrift_tr: { alle: ['schrift_wahl'], bausteine: ['wahlgruppe', 'anhoeren'] },
  schrift_latein: { alle: ['schrift_wahl'], bausteine: ['wahlgruppe', 'anhoeren'] },
  sprechen: { alle: ['sprechen'], bausteine: ['anhoeren'] },
  schreiben: { alle: ['schreiben'] },
};
/** Texte, die eine Datei einem Typ-Chunk zuordnen (eigene Komponenten und der Abspieler der Hörtypen). */
const TYP_TEXTE = [
  'luecke_feld',
  'auswahl',
  'paare',
  'wortbank',
  'bild_wort',
  'frei',
  'luecke',
  'formen',
  'harakat',
  'abspieler',
  'wahr_falsch',
  'zuordnen',
  'reihenfolge',
  'fallfrage',
  'koran_wort',
  'dialog',
  'geschichte',
  'lesen_fragen',
  'grammatik_tipp',
  'schrift_ar',
  'schrift_wahl',
  'sprechen',
  'schreiben',
];

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
  ...(ohneEcht ? {} : { spielerEchtGesamt: 210, spielerEchtZusaetzlich: 60 }),
  wiederholenGesamt: 210,
  einstufungGesamt: 210,
  uebungstyp: 15,
  arabischeTastatur: 10,
};

async function skripte(browser, { pfad, warte, zeit = 30_000, darfFehlen = false }) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const dateien = new Map();
  dateien.zod = new Set();
  const offen = [];
  page.on('response', (r) => {
    const url = new URL(r.url());
    if (r.request().resourceType() !== 'script' || url.origin !== new URL(basis).origin) return;
    offen.push(
      r
        .body()
        .then((b) => {
          dateien.set(url.pathname, gzipSync(b, { level: 9 }).length);
          if (b.includes(ZOD_MARKE)) dateien.zod.add(url.pathname);
        })
        .catch(() => undefined),
    );
  });
  const antwort = await page.goto(basis + pfad, { waitUntil: 'networkidle' });
  if (!antwort || antwort.status() !== 200) throw new Error(`${pfad}: HTTP ${antwort?.status()}`);
  if (warte)
    try {
      await page.waitForSelector(warte, { timeout: zeit });
    } catch (e) {
      // echte Lektion, deren erste Aufgabe nicht erscheint (z. B. verborgen): nicht gemessen, dann geschätzt
      await context.close();
      if (darfFehlen) return null;
      throw e;
    }
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
  for (const [name, route] of Object.entries(ROUTEN))
    for (const r of route.kandidaten ?? [route]) {
      const m = await skripte(browser, r);
      if (!m) continue;
      gemessen[name] = m;
      if (r.lektion) m.lektion = r.lektion;
      break;
    }
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

const istTypDatei = (d) => TYP_TEXTE.some((n) => hat(d, n));
/**
 * Chunk eines Übungstyps (größte passende Datei), nachgeladene Teile (`nachgeladen`, z. B. das Feld der Lücke) und
 * ausgelagerte Bausteine (nur solche, die weder der Chunk noch ein nachgeladener Teil enthält, aus Dateien ohne eigenen
 * Typ); 0 = nicht gefunden. `haupt`: nur die größte Datei (lädt mit der ersten Aufgabe). Für die Schätzung der ersten
 * Aufgabe ist die größte Datei eine obere Schranke: Liegt der Typ in mehreren Chunks (z. B. Geschichte, Dialog, Sprechen
 * auch in anderen Routen), lädt der Spieler oft den kleineren (Stufe C N6: bis 2,3 KB weniger).
 */
function typChunk({ alle, bausteine = [], nachgeladen = [] }) {
  const eigene = [...inhalt.keys()].filter((d) => alle.every((n) => hat(d, n)));
  if (!eigene.length) return { gz: 0, haupt: 0, dateien: [] };
  const [datei, gz] = eigene.map((d) => [d, gzVon(d)]).sort((a, b) => b[1] - a[1])[0];
  const dazu = [...new Set(nachgeladen.flatMap((n) => typen[n].dateien))].filter((d) => d !== datei);
  const fehlend = bausteine.filter((n) => !hat(datei, n) && !dazu.some((d) => hat(d, n)));
  const ausgelagert = [...new Set(fehlend.flatMap((n) => typen[n].dateien))].filter((d) => !istTypDatei(d) && !dazu.includes(d));
  const weitere = [...ausgelagert, ...dazu];
  return { gz: gz + weitere.reduce((s, d) => s + gzVon(d), 0), haupt: gz, dateien: [datei, ...weitere] };
}
const uebungstypen = Object.fromEntries(Object.entries(TYP_ERKENNUNG).map(([t, e]) => [t, typChunk(e)]));

// Spielerkern: was die Testlektion über die Hülle hinaus lädt, ohne Typ-Chunks (Grundlage der Schätzung)
const chunkPfad = (d) => d.replace(/^\/_next\/static\/chunks/, '');
const zusaetzlich = (m) => summe(m, (d) => !gemessen.huelle.has(d));
const kernBytes = summe(gemessen.spieler, (d) => !gemessen.huelle.has(d) && !(inhalt.has(chunkPfad(d)) && istTypDatei(chunkPfad(d))));
const testGesamtOhneTyp = summe(gemessen.spieler) - (zusaetzlich(gemessen.spieler) - kernBytes);
/** Schätzung je Form der ersten Aufgabe: Kern + Hauptchunk des Typs (+ Feld bei `luecke_frei`). */
function schaetzung(form) {
  const typ = form === 'luecke_frei' ? 'luecke' : form;
  const e = TYP_ERKENNUNG[typ];
  if (!e) return null;
  const c = typChunk(e);
  if (!c.haupt) return null;
  const feld = form === 'luecke_frei' ? typen.luecke_feld.gz : 0;
  return { zusaetzlich: kernBytes + c.haupt + feld, gesamt: testGesamtOhneTyp + c.haupt + feld };
}
const echt = Object.fromEntries(
  Object.entries(ECHT).map(([form, e]) => {
    const m = gemessen[`echt_${form}`];
    const s = schaetzung(form);
    return [
      form,
      {
        lektionen: e.lektionen,
        beispiel: e.beispiel,
        ausgeliefert: e.routen.map((r) => r.lektion),
        gemessen: m ? { lektion: m.lektion, gesamt: kb(summe(m)), zusaetzlich: kb(zusaetzlich(m)) } : null,
        geschaetzt: s ? { gesamt: kb(s.gesamt), zusaetzlich: kb(s.zusaetzlich) } : null,
      },
    ];
  }),
);

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
  spielerKern: kb(kernBytes),
  // echte Lektionen je Form der ersten Aufgabe (gemessen, sonst geschätzt); Budget gegen die ungünstigste
  spielerEcht: echt,
  wiederholenGesamt: kb(summe(gemessen.wiederholen)),
  einstufungGesamt: kb(summe(gemessen.einstufung)),
  uebungstyp: Object.fromEntries(Object.entries(uebungstypen).map(([t, { gz }]) => [t, kb(gz)])),
  arabischeTastatur: kb(typen.arabischeTastatur.gz),
  spielerChunk: kb(typen.spieler.gz),
};

if (!ohneEcht) {
  // gemessen, wo eine Lektion ausgeliefert wird; sonst die Schätzung
  const wert = Object.values(echt)
    .map((x) => x.gemessen ?? x.geschaetzt)
    .filter(Boolean);
  werte.spielerEchtGesamt = Math.max(...wert.map((x) => x.gesamt));
  werte.spielerEchtZusaetzlich = Math.max(...wert.map((x) => x.zusaetzlich));
}

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
for (const [form, x] of Object.entries(echt))
  if (!x.gemessen && !x.geschaetzt) verfehlt.push(`erste Aufgabe ${form}: weder gemessen noch geschätzt (Typ unbekannt)`);
for (const r of ['wiederholen', 'einstufung'])
  if (gemessen[r].zod.size) verfehlt.push(`${r}: Zod schon beim Laden (${[...gemessen[r].zod].join(', ')})`);

const zeilen = [
  `Lern-App JS-Budgets (gz -9, ${basis})`,
  `Grundstock Next/React: ${werte.grundstock} KB (${grundstock.size} Dateien)`,
  `Hülle /lern-app/de/quellen: gesamt ${werte.huelleGesamt} KB, eigener Anteil ${werte.huelleEigen} KB (≤ ${BUDGET.huelleEigen})`,
  `Start /lern-app/de: gesamt ${werte.startGesamt} KB (≤ ${BUDGET.startGesamt}), eigener Anteil ${werte.startEigen} KB (≤ ${BUDGET.startEigen})`,
  `Lernpfad /lern-app/ar/de-aus-ar: gesamt ${werte.lernpfadGesamt} KB (≤ ${BUDGET.lernpfadGesamt}), eigener Anteil ${werte.lernpfadEigen} KB (≤ ${BUDGET.lernpfadEigen})`,
  `Fortschritt /lern-app/de/fortschritt: gesamt ${werte.fortschrittGesamt} KB (≤ ${BUDGET.fortschrittGesamt}), eigener Anteil ${werte.fortschrittEigen} KB (≤ ${BUDGET.fortschrittEigen})`,
  `Spieler-Route (Lektion 1, erste Aufgabe): gesamt ${werte.spielerGesamt} KB (≤ ${BUDGET.spielerGesamt}), zusätzlich zur Hülle ${werte.spielerZusaetzlich} KB (≤ ${BUDGET.spielerZusaetzlich})`,
  `Spieler-Route (Lektion 2, Wortbank zuerst): gesamt ${werte.spielerWortbankGesamt} KB`,
  ohneEcht
    ? 'Spieler-Route echte Lektionen: nicht gemessen (--ohne-echt)'
    : [
        `Spieler-Route echte Lektionen je erste Aufgabe (gesamt/+zusätzlich KB; Kern ohne Typ-Chunk ${werte.spielerKern} KB):`,
        ...Object.entries(echt).map(
          ([form, x]) =>
            `  ${form} (${x.lektionen} Lektionen): ${
              x.gemessen
                ? `gemessen ${x.gemessen.lektion} ${x.gemessen.gesamt}/+${x.gemessen.zusaetzlich}`
                : x.ausgeliefert.length
                  ? `erste Aufgabe nicht erschienen (${x.ausgeliefert.join(', ')})`
                  : `nicht ausgeliefert (${x.beispiel})`
            }${x.geschaetzt ? `, geschätzt ${x.geschaetzt.gesamt}/+${x.geschaetzt.zusaetzlich}` : ''}`,
        ),
        `  ungünstigste (gemessen, sonst geschätzt): gesamt ${werte.spielerEchtGesamt} KB (≤ ${BUDGET.spielerEchtGesamt}), zusätzlich zur Hülle ${werte.spielerEchtZusaetzlich} KB (≤ ${BUDGET.spielerEchtZusaetzlich})`,
      ].join('\n'),
  `Wiederholen ohne Karten: gesamt ${werte.wiederholenGesamt} KB (≤ ${BUDGET.wiederholenGesamt}), Zod: ${gemessen.wiederholen.zod.size ? 'ja' : 'nein'}`,
  `Einstufung vor dem Start: gesamt ${werte.einstufungGesamt} KB (≤ ${BUDGET.einstufungGesamt}), Zod: ${gemessen.einstufung.zod.size ? 'ja' : 'nein'}`,
  `Spieler-Chunk: ${werte.spielerChunk} KB · Übungstypen: ${Object.entries(werte.uebungstyp)
    .map(([t, v]) => `${t} ${v} KB`)
    .join(', ')} (je ≤ ${BUDGET.uebungstyp})`,
  `Arabische Bildschirmtastatur: ${werte.arabischeTastatur} KB (≤ ${BUDGET.arabischeTastatur})`,
  verfehlt.length ? `VERFEHLT: ${verfehlt.join(' · ')}` : 'Alle Budgets eingehalten.',
];
console.log(zeilen.join('\n'));
if (aus)
  writeFileSync(
    aus,
    JSON.stringify(
      {
        basis,
        werte,
        budget: BUDGET,
        typen,
        uebungstypen,
        verfehlt,
        grundstock: [...grundstock],
        // je Route die geladenen Dateien mit gz-Bytes (Fehlersuche: was liegt in „zusätzlich zur Hülle“?)
        routen: Object.fromEntries(Object.entries(gemessen).map(([n, m]) => [n, Object.fromEntries(m)])),
      },
      null,
      2,
    ),
  );
process.exit(verfehlt.length ? 1 : 0);
