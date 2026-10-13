// Erzeugt orte.json aus dem GeoNames-Export DE.txt (CC BY 4.0, GeoNames).
// Aufruf:  node erzeuge.mjs <DE.txt | DE.zip> [admin1CodesASCII.txt] [ausgabe.json] [alternatenames/DE.zip]
// - DE.zip wird mit dem Systemprogramm "unzip" gelesen (nur DE.txt).
// - Mit admin1CodesASCII.txt prüft das Skript, dass die Bundesland-Codes stimmen.
// - Standard-Ausgabe: orte.json neben diesem Skript.
// - Mit alternatenames/DE.zip erhält jeder Ort seinen bevorzugten deutschen Namen (isolanguage "de").
// - Optional 5. Argument: kompakte Liste [Name, Breite, Länge] für den Browser (web/src/lib/gebetszeiten/orte.json).
// Auswahl: Orte (Feature-Klasse P, ohne Ortsteile PPLX/PPLH/PPLQ/PPLW) in Hessen (admin1 05) mit mind. 10.000 Einwohnern,
// Orte im Umkreis von 40 km um Wetzlar mit mind. 3.000 Einwohnern, plus alle deutschen Orte mit mind. 200.000 Einwohnern.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const [, , eingabe, admin1Datei, ausgabe = path.join(hier, 'orte.json'), alternativDatei, kompaktDatei] = process.argv;

if (!eingabe) {
  console.error('Aufruf: node erzeuge.mjs <DE.txt | DE.zip> [admin1CodesASCII.txt] [ausgabe.json]');
  process.exit(1);
}

// Bundesland-Namen (deutsch) je GeoNames-admin1-Code; englische Entsprechung zur Prüfung.
const BUNDESLAND = {
  '01': { de: 'Baden-Württemberg', en: 'Baden-Wurttemberg' },
  '02': { de: 'Bayern', en: 'Bavaria' },
  '03': { de: 'Bremen', en: 'Bremen' },
  '04': { de: 'Hamburg', en: 'Hamburg' },
  '05': { de: 'Hessen', en: 'Hesse' },
  '06': { de: 'Niedersachsen', en: 'Lower Saxony' },
  '07': { de: 'Nordrhein-Westfalen', en: 'North Rhine-Westphalia' },
  '08': { de: 'Rheinland-Pfalz', en: 'Rheinland-Pfalz' },
  '09': { de: 'Saarland', en: 'Saarland' },
  '10': { de: 'Schleswig-Holstein', en: 'Schleswig-Holstein' },
  '11': { de: 'Brandenburg', en: 'Brandenburg' },
  '12': { de: 'Mecklenburg-Vorpommern', en: 'Mecklenburg-Vorpommern' },
  '13': { de: 'Sachsen', en: 'Saxony' },
  '14': { de: 'Sachsen-Anhalt', en: 'Saxony-Anhalt' },
  '15': { de: 'Thüringen', en: 'Thuringia' },
  '16': { de: 'Berlin', en: 'State of Berlin' },
};

// 1) Prüfung der Codes gegen GeoNames admin1CodesASCII.txt
if (admin1Datei) {
  const zeilen = fs.readFileSync(admin1Datei, 'utf8').split('\n');
  const gefunden = new Map();
  for (const z of zeilen) {
    const [schluessel, englisch] = z.split('\t');
    if (schluessel && schluessel.startsWith('DE.')) gefunden.set(schluessel.slice(3), englisch);
  }
  let fehler = 0;
  for (const [code, namen] of Object.entries(BUNDESLAND)) {
    if (gefunden.get(code) !== namen.en) {
      fehler++;
      console.error(`Code DE.${code}: erwartet "${namen.en}", gefunden "${gefunden.get(code)}"`);
    }
  }
  if (fehler) process.exit(2);
  console.error(`admin1-Prüfung bestanden: ${gefunden.size} Bundesländer, DE.05 = ${gefunden.get('05')}`);
}

// 2) DE.txt einlesen
const inhalt = eingabe.toLowerCase().endsWith('.zip')
  ? execFileSync('unzip', ['-p', eingabe, 'DE.txt'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  : fs.readFileSync(eingabe, 'utf8');

// Bevorzugte deutsche Namen: alternateNameId, geonameid, isolanguage, name, isPreferredName, isShortName, isColloquial, isHistoric
const deutsch = new Map();
if (alternativDatei) {
  const alt = alternativDatei.toLowerCase().endsWith('.zip')
    ? execFileSync('unzip', ['-p', alternativDatei, 'DE.txt'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    : fs.readFileSync(alternativDatei, 'utf8');
  for (const zeile of alt.split('\n')) {
    const [, id, sprache, name, bevorzugt, , umgangssprachlich, historisch] = zeile.split('\t');
    if (sprache !== 'de' || umgangssprachlich === '1' || historisch === '1') continue;
    if (bevorzugt === '1' || !deutsch.has(id)) deutsch.set(id, name);
  }
}

const WETZLAR = { breite: 50.56109, laenge: 8.50495 };
const km = (a, b) => {
  const r = (g) => (g * Math.PI) / 180;
  const h = Math.sin(r(b.breite - a.breite) / 2) ** 2 + Math.cos(r(a.breite)) * Math.cos(r(b.breite)) * Math.sin(r(b.laenge - a.laenge) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
const ORTSTEILE = new Set(['PPLX', 'PPLH', 'PPLQ', 'PPLW']);

// GeoNames-Spalten: 0 geonameid, 1 name, 4 latitude, 5 longitude, 6 feature class, 7 feature code, 8 country, 10 admin1, 14 population
const orte = [];
for (const zeile of inhalt.split('\n')) {
  if (!zeile) continue;
  const spalten = zeile.split('\t');
  if (spalten[6] !== 'P' || ORTSTEILE.has(spalten[7])) continue;
  const land = spalten[8];
  const code = spalten[10];
  const einwohner = Number(spalten[14] || 0);
  const lage = { breite: Number(spalten[4]), laenge: Number(spalten[5]) };
  const inHessen = land === 'DE' && code === '05' && einwohner >= 10000;
  const nahWetzlar = land === 'DE' && einwohner >= 3000 && km(WETZLAR, lage) <= 40;
  const grossStadt = land === 'DE' && einwohner >= 200000;
  if (!inHessen && !nahWetzlar && !grossStadt) continue;
  orte.push({
    name: deutsch.get(spalten[0]) ?? spalten[1],
    breite: Number(Number(spalten[4]).toFixed(5)),
    laenge: Number(Number(spalten[5]).toFixed(5)),
    einwohner,
    bundesland: BUNDESLAND[code]?.de ?? null,
  });
}

// 3) Sortierung: Einwohner absteigend, dann Name
orte.sort((a, b) => b.einwohner - a.einwohner || a.name.localeCompare(b.name, 'de'));

// 4) Schreiben
fs.writeFileSync(ausgabe, JSON.stringify(orte, null, 2) + '\n', 'utf8');
// 5) Kompakte Liste für den Browser (Gebetszeiten „Mein Ort“): [Name, Breite, Länge]; doppelte Namen mit Bundesland.
if (kompaktDatei) {
  const zahl = new Map();
  for (const o of orte) zahl.set(o.name, (zahl.get(o.name) ?? 0) + 1);
  const kompakt = orte.map((o) => [zahl.get(o.name) > 1 ? `${o.name} (${o.bundesland})` : o.name, o.breite, o.laenge]);
  fs.writeFileSync(kompaktDatei, JSON.stringify(kompakt) + '\n', 'utf8');
  console.error(`geschrieben: ${kompaktDatei} (${kompakt.length} Orte, kompakt)`);
}

const hessen = orte.filter((o) => o.bundesland === 'Hessen').length;
const gross = orte.filter((o) => o.einwohner >= 200000).length;
console.error(`geschrieben: ${ausgabe} (${orte.length} Orte; Hessen ${hessen}; ab 200.000 Einwohnern ${gross})`);
