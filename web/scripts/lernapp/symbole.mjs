// Bildkarten der Lern-App (KERN 4.0 §5/§7, Inhaltsleitfaden §5): Motive aus Lucide (ISC) in das Register
// `inhalte/lernapp/symbole/symbole.json` übernehmen – nur die Geometrie im 24er Raster (Grundformen, ohne Schlüssel),
// mit Quelle, Lizenz und Freigabe je Motiv. Neue Motive stehen auf `freigegeben: false`, bis die Redaktion die Motivliste
// freigibt (LM-34); vorhandene Freigaben bleiben erhalten. Nur Gegenstände und Symbole – keine Menschen, Tiere, Gesichter
// oder religiösen Zeichen (Liste unten prüft die Redaktion).
// Aufruf: node scripts/lernapp/symbole.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ZIEL = join(import.meta.dirname, '..', '..', 'inhalte', 'lernapp', 'symbole', 'symbole.json');
const LUCIDE = join(import.meta.dirname, '..', '..', 'node_modules', 'lucide-react');
const VERSION = JSON.parse(readFileSync(join(LUCIDE, 'package.json'), 'utf8')).version;

/** Motiv (Schlüssel) → [Lucide-Name, Motiv, Gruppe] nach der Motivliste des Inhaltsleitfadens §5. */
const MOTIVE = {
  haus: ['house', 'Haus', 'wohnen'],
  tuer: ['door-closed', 'Tür', 'wohnen'],
  schluessel: ['key', 'Schlüssel', 'wohnen'],
  bett: ['bed', 'Bett', 'wohnen'],
  lampe: ['lamp', 'Lampe', 'wohnen'],
  sofa: ['sofa', 'Sofa', 'wohnen'],
  kuehlschrank: ['refrigerator', 'Kühlschrank', 'wohnen'],
  waschmaschine: ['washing-machine', 'Waschmaschine', 'wohnen'],
  buch: ['book', 'Buch', 'schule'],
  bleistift: ['pencil', 'Bleistift', 'schule'],
  schere: ['scissors', 'Schere', 'schule'],
  lineal: ['ruler', 'Lineal', 'schule'],
  taschenrechner: ['calculator', 'Taschenrechner', 'schule'],
  apfel: ['apple', 'Apfel', 'essen'],
  karotte: ['carrot', 'Karotte', 'essen'],
  kirsche: ['cherry', 'Kirsche', 'essen'],
  ei: ['egg', 'Ei', 'essen'],
  milch: ['milk', 'Milch', 'essen'],
  wasserglas: ['glass-water', 'Wasserglas', 'essen'],
  topf: ['cooking-pot', 'Topf', 'essen'],
  hemd: ['shirt', 'Hemd', 'kleidung'],
  regenschirm: ['umbrella', 'Regenschirm', 'kleidung'],
  bus: ['bus', 'Bus', 'verkehr'],
  zug: ['train-front', 'Zug', 'verkehr'],
  strassenbahn: ['tram-front', 'Straßenbahn', 'verkehr'],
  fahrrad: ['bike', 'Fahrrad', 'verkehr'],
  auto: ['car', 'Auto', 'verkehr'],
  flugzeug: ['plane', 'Flugzeug', 'verkehr'],
  schiff: ['ship', 'Schiff', 'verkehr'],
  fahrkarte: ['ticket', 'Fahrkarte', 'verkehr'],
  sonne: ['sun', 'Sonne', 'natur'],
  wolke: ['cloud', 'Wolke', 'natur'],
  regen: ['cloud-rain', 'Regen', 'natur'],
  schneeflocke: ['snowflake', 'Schneeflocke', 'natur'],
  blitz: ['zap', 'Blitz', 'natur'],
  wind: ['wind', 'Wind', 'natur'],
  baum: ['tree-deciduous', 'Baum', 'natur'],
  blume: ['flower', 'Blume', 'natur'],
  blatt: ['leaf', 'Blatt', 'natur'],
  berg: ['mountain', 'Berg', 'natur'],
  welle: ['waves-horizontal', 'Welle', 'natur'],
  uhr: ['clock', 'Uhr', 'zeit'],
  wecker: ['alarm-clock', 'Wecker', 'zeit'],
  kalender: ['calendar', 'Kalender', 'zeit'],
  sanduhr: ['hourglass', 'Sanduhr', 'zeit'],
  thermometer: ['thermometer', 'Thermometer', 'gesundheit'],
  hammer: ['hammer', 'Hammer', 'arbeit'],
  laptop: ['laptop', 'Laptop', 'arbeit'],
  telefon: ['phone', 'Telefon', 'arbeit'],
  briefumschlag: ['mail', 'Briefumschlag', 'arbeit'],
  paket: ['package', 'Paket', 'arbeit'],
  ordner: ['folder', 'Ordner', 'arbeit'],
  einkaufswagen: ['shopping-cart', 'Einkaufswagen', 'einkaufen'],
  tuete: ['shopping-bag', 'Tüte', 'einkaufen'],
  geldboerse: ['wallet', 'Geldbörse', 'einkaufen'],
  muenzen: ['coins', 'Münzen', 'einkaufen'],
  bankkarte: ['credit-card', 'Bankkarte', 'einkaufen'],
  rucksack: ['backpack', 'Rucksack', 'freizeit'],
  zelt: ['tent', 'Zelt', 'freizeit'],
  kamera: ['camera', 'Kamera', 'freizeit'],
  puzzleteil: ['puzzle', 'Puzzleteil', 'freizeit'],
  pinsel: ['paintbrush', 'Pinsel', 'freizeit'],
  briefkasten: ['mailbox', 'Briefkasten', 'stadt'],
};

const ZAHLEN = new Set(['cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2']);
const FELDER = {
  path: ['d'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
};

let alt = { symbole: {} };
try {
  alt = JSON.parse(readFileSync(ZIEL, 'utf8'));
} catch {}

const symbole = {};
for (const [schluessel, [lucide, motiv, gruppe]] of Object.entries(MOTIVE)) {
  const modul = await import(pathToFileURL(join(LUCIDE, 'dist', 'esm', 'icons', `${lucide}.mjs`)).href);
  const elemente = modul.__iconData.node.map(([art, attrs]) => {
    const felder = FELDER[art];
    if (!felder) throw new Error(`${lucide}: Element ${art} nicht erlaubt`);
    const e = { art };
    for (const f of felder) if (attrs[f] !== undefined) e[f] = ZAHLEN.has(f) ? Number(attrs[f]) : String(attrs[f]);
    for (const k of Object.keys(attrs)) if (k !== 'key' && !felder.includes(k)) throw new Error(`${lucide}: Attribut ${k} nicht erlaubt`);
    return e;
  });
  symbole[schluessel] = {
    motiv,
    gruppe,
    quelle: `lucide:${lucide}@${VERSION}`,
    lizenz: 'ISC',
    freigegeben: alt.symbole?.[schluessel]?.freigegeben === true,
    elemente,
  };
}

const datei = {
  _hinweis:
    'Bildkarten der Lern-App (KERN 4.0 §5/§7, Inhaltsleitfaden §5): Linien-Symbole im 24er Raster aus Lucide (ISC, Copyright Lucide Contributors; Teile Cole Bemis, Feather, MIT). Nur Gegenstände und Symbole. freigegeben: Freigabe der Motivliste durch die Redaktion (LM-34) – ein Motiv ohne Freigabe blockiert den Import (außer im Testkurs). Erzeugt mit scripts/lernapp/symbole.mjs.',
  format: 'igmg-lernapp-symbole',
  version: 1,
  symbole,
};
writeFileSync(ZIEL, `${JSON.stringify(datei, null, 2)}\n`);
console.log(`${Object.keys(symbole).length} Motive → ${ZIEL}`);
