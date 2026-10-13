// Erzeugt orte.json aus dem GeoNames-Export DE.txt (CC BY 4.0, GeoNames).
// Aufruf:  node erzeuge.mjs <DE.txt | DE.zip> [admin1CodesASCII.txt] [ausgabe.json]
// - DE.zip wird mit dem Systemprogramm "unzip" gelesen (nur DE.txt).
// - Mit admin1CodesASCII.txt prüft das Skript, dass die Bundesland-Codes stimmen.
// - Standard-Ausgabe: orte.json neben diesem Skript.
// Auswahl: Orte (Feature-Klasse P) in Hessen (admin1 05) mit mind. 15.000 Einwohnern,
// plus alle deutschen Orte mit mind. 200.000 Einwohnern.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const [, , eingabe, admin1Datei, ausgabe = path.join(hier, 'orte.json')] = process.argv;

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

// GeoNames-Spalten: 1 name, 4 latitude, 5 longitude, 6 feature class, 8 country, 10 admin1, 14 population
const orte = [];
for (const zeile of inhalt.split('\n')) {
  if (!zeile) continue;
  const spalten = zeile.split('\t');
  if (spalten[6] !== 'P') continue;
  const land = spalten[8];
  const code = spalten[10];
  const einwohner = Number(spalten[14] || 0);
  const inHessen = land === 'DE' && code === '05' && einwohner >= 15000;
  const grossStadt = land === 'DE' && einwohner >= 200000;
  if (!inHessen && !grossStadt) continue;
  orte.push({
    name: spalten[1],
    breite: Number(Number(spalten[4]).toFixed(5)),
    laenge: Number(Number(spalten[5]).toFixed(5)),
    einwohner,
    bundesland: BUNDESLAND[code]?.de ?? null,
  });
}

// 3) Sortierung: Einwohner absteigend, dann Name
orte.sort((a, b) => b.einwohner - a.einwohner || a.name.localeCompare('de'));

// 4) Schreiben
fs.writeFileSync(ausgabe, JSON.stringify(orte, null, 2) + '\n', 'utf8');
const hessen = orte.filter((o) => o.bundesland === 'Hessen').length;
const gross = orte.filter((o) => o.einwohner >= 200000).length;
console.error(`geschrieben: ${ausgabe} (${orte.length} Orte; Hessen ${hessen}; ab 200.000 Einwohnern ${gross})`);
