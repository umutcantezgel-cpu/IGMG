#!/usr/bin/env node
// Prüfwerkzeug g: SVG-Grafiken. Findet alle .svg-Dateien im Repo (ohne node_modules, ignorierte Ordner) und alle
// inline <svg> in web/src (.ts/.tsx/.jsx). Prüft je Grafik:
//   - <image> eingebettet ⇒ Fehler
//   - doppelte id= je Datei ⇒ Fehler
//   - aria-hidden="true" (dekorativ) ODER role="img" mit Name (aria-label, aria-labelledby oder <title>) ⇒ sonst Befund
//   - viewBox vorhanden ⇒ sonst Befund
// Inline-SVG mit {...props}-Übergabe: Hinweis, weil Attribute von außen kommen können (manuell prüfen).
// Aufruf: node svg-pruefung.mjs [--protokoll basisname]
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { hilfeAusgeben, schreibeProtokoll, standardProtokoll } from '/home/user/IGMG/_gemeinde/werkzeuge/hilfen.mjs';
// E3-TOR: Wurzel = Worktree des Prüflings (93a0b3d), sonst der Live-Baum
const WURZEL = process.env.WURZEL ?? '/home/user/IGMG'; const WEB = join(WURZEL, 'web');

const HILFE = `Aufruf: node svg-pruefung.mjs [--protokoll basisname]
Prüft alle .svg-Dateien im Repo und alle inline <svg> in web/src.`;
const { values } = parseArgs({ options: { protokoll: { type: 'string' }, hilfe: { type: 'boolean', short: 'h', default: false } } });
if (values.hilfe) hilfeAusgeben(HILFE);

const svgDateien = execFileSync('git', ['-C', WURZEL, 'ls-files', '--cached', '--others', '--exclude-standard', '--', '*.svg'], { encoding: 'utf8' })
  .split('\n')
  // Nur ausgelieferte Grafiken: Ablagen früherer Läufe (_lauf/, _archiv/) gehören nicht zur App (wie svg-pruefung.mjs)
  .filter((d) => d && !d.includes('node_modules/') && !/^(_lauf|_archiv)\//.test(d))
  .map((d) => join(WURZEL, d))
  .filter((d) => statSync(d, { throwIfNoEntry: false })?.isFile());

function alleQuelldateien(ordner) {
  const liste = [];
  for (const name of readdirSync(ordner)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(ordner, name);
    if (statSync(p).isDirectory()) liste.push(...alleQuelldateien(p));
    else if (/\.(tsx|ts|jsx)$/.test(name) && !/\.(test|spec)\./.test(name)) liste.push(p);
  }
  return liste;
}
const quelldateien = alleQuelldateien(join(WEB, 'src'));

const ergebnisse = [];
const zeileVon = (text, index) => text.slice(0, index).split('\n').length;

/** Prüft einen SVG-Ausschnitt (Wurzelelement mit Öffnungstag, Inhalt bis </svg>). */
function pruefe({ datei, zeile, art, oeffnung, inhalt }) {
  const befunde = [];
  const hinweise = [];
  if (/<image\b/.test(inhalt)) befunde.push({ stufe: 'Fehler', text: '<image> eingebettet' });
  const ids = [...inhalt.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*["'`]([^"'`]+)["'`]\s*\})/g)].map((m) => m[1] ?? m[2] ?? m[3]);
  const doppelt = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (doppelt.length) befunde.push({ stufe: 'Fehler', text: `doppelte id: ${[...new Set(doppelt)].join(', ')}` });
  const dekorativ = /aria-hidden\s*=\s*(?:"true"|'true'|\{\s*true\s*\}|\{\s*"true"\s*\})/.test(oeffnung);
  const bildRolle = /role\s*=\s*(?:"img"|'img'|\{\s*["']img["']\s*\})/.test(oeffnung);
  const benannt = /aria-label(?:ledby)?\s*=/.test(oeffnung) || /<title[\s>]/.test(inhalt);
  if (!dekorativ && !(bildRolle && benannt)) {
    befunde.push({ stufe: 'Befund', text: 'weder aria-hidden="true" noch role="img" mit Name' });
  }
  if (!/\bviewBox\s*=/.test(oeffnung)) befunde.push({ stufe: 'Befund', text: 'viewBox fehlt' });
  if (art === 'inline' && /\{\s*\.\.\./.test(oeffnung)) hinweise.push('Attribute per {...props} übergeben: manuell prüfen');
  if (art === 'inline' && !dekorativ && !bildRolle && /aria-(hidden|label)/.test(oeffnung) === false) {
    hinweise.push('Auszeichnung kann vom umgebenden Element kommen (VERMUTUNG)');
  }
  ergebnisse.push({
    datei,
    zeile,
    art,
    status: befunde.some((b) => b.stufe === 'Fehler') ? 'Fehler' : befunde.length ? 'Befund' : 'OK',
    rolle: dekorativ ? 'dekorativ' : bildRolle && benannt ? 'bedeutungstragend, benannt' : 'ungeklärt',
    befunde: befunde.map((b) => `${b.stufe}: ${b.text}`),
    hinweise,
  });
}

// 1. .svg-Dateien
for (const datei of svgDateien) {
  const text = readFileSync(datei, 'utf8');
  const kopf = text.match(/<svg\b[^>]*>/);
  const kurz = relative(WURZEL, datei);
  if (!kopf) {
    ergebnisse.push({ datei: kurz, zeile: 1, art: 'Datei', status: 'Fehler', rolle: '–', befunde: ['Fehler: kein <svg>-Wurzelelement'], hinweise: [] });
    continue;
  }
  const inhalt = text.slice(kopf.index);
  pruefe({ datei: kurz, zeile: zeileVon(text, kopf.index), art: 'Datei', oeffnung: kopf[0], inhalt });
}

// 2. inline <svg> in web/src
for (const datei of quelldateien) {
  const text = readFileSync(datei, 'utf8');
  for (const m of text.matchAll(/<svg\b/g)) {
    const rest = text.slice(m.index);
    const ende = rest.indexOf('>');
    if (ende < 0) continue;
    const oeffnung = rest.slice(0, ende + 1);
    const schluss = rest.indexOf('</svg>');
    const inhalt = schluss > 0 ? rest.slice(0, schluss) : rest.slice(0, 4000);
    pruefe({ datei: relative(WURZEL, datei), zeile: zeileVon(text, m.index), art: 'inline', oeffnung, inhalt });
  }
}

const zaehl = { Fehler: 0, Befund: 0, OK: 0 };
for (const e of ergebnisse) zaehl[e.status] += 1;
const dateiAnzahl = svgDateien.length;
const inlineAnzahl = ergebnisse.filter((e) => e.art === 'inline').length;
const kopf = `SVG-Prüfung: ${dateiAnzahl} .svg-Dateien, ${inlineAnzahl} inline <svg> in web/src · Fehler ${zaehl.Fehler} · Befund ${zaehl.Befund} · OK ${zaehl.OK}`;
console.log(kopf);
for (const e of ergebnisse) {
  const zeile = `${e.datei}:${e.zeile} [${e.art}] ${e.status} · ${e.rolle}${e.befunde.length ? ` · ${e.befunde.join('; ')}` : ''}${e.hinweise.length ? ` · Hinweis: ${e.hinweise.join('; ')}` : ''}`;
  console.log(zeile);
}
if (svgDateien.length === 0) console.log('Keine .svg-Dateien im Repo gefunden.');

const zeitpunkt = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const md = [
  `# SVG-Prüfung · ${zeitpunkt}`,
  '',
  kopf,
  '',
  '| Datei | Zeile | Art | Status | Rolle | Befunde | Hinweise |',
  '|---|---|---|---|---|---|---|',
  ...ergebnisse.map((e) => `| ${e.datei} | ${e.zeile} | ${e.art} | ${e.status} | ${e.rolle} | ${e.befunde.join('; ') || '–'} | ${e.hinweise.join('; ') || '–'} |`),
  '',
].join('\n');
const protokoll = values.protokoll ?? standardProtokoll('svg');
const dateien = schreibeProtokoll(protokoll, { json: { werkzeug: 'svg-pruefung', zeitpunkt, svgDateien: svgDateien.map((d) => relative(WURZEL, d)), zaehl, ergebnisse }, md });
console.log(`Protokoll: ${dateien.join(', ')}`);
