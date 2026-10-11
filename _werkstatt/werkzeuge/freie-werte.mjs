#!/usr/bin/env node
// Prüfwerkzeug f: Werte außerhalb des Designsystems (web/src/app/globals.css) in .tsx/.ts/.css.
//   - Tailwind-Klassen mit eckigen Klammern: w-[20px], bg-[#fff], [&>svg]:size-4, [mask-type:luminance]
//   - Hex-Farben: #rgb, #rrggbb, #rrggbbaa; Farbfunktionen rgb(), hsl(), oklch() mit Zahlen
//   - px-Literale in Style-Objekten (.ts/.tsx): width: '20px', fontSize: 16 usw.
// Ausgenommen: Token-Definitionen (Zeilen mit --name: Wert, also das Designsystem selbst) und Hash-Links (href="#…").
// Dateien ohne Angabe: alle .ts/.tsx/.css unter web/src (ohne Tests). Mit --seit <commit>: nur geänderte Dateien.
// Aufruf: node freie-werte.mjs [dateien oder ordner…] | --seit <commit> [--protokoll basisname]
// Beispiele: node freie-werte.mjs web/src/app/gebetszeiten
//            node freie-werte.mjs --seit 9ebb4bc
// Befunde sind Daten: Exit-Code 0. Jeder Fund ist zu prüfen (VERMUTUNG bei Randfällen).
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { WURZEL, hilfeAusgeben, schreibeProtokoll, standardProtokoll } from './hilfen.mjs';

const HILFE = `Aufruf: node freie-werte.mjs [dateien oder ordner…] | --seit <commit> [--protokoll basisname]
Beispiel: node freie-werte.mjs --seit HEAD~1`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    seit: { type: 'string' },
    protokoll: { type: 'string' },
    hilfe: { type: 'boolean', short: 'h', default: false },
  },
});
if (values.hilfe) hilfeAusgeben(HILFE);

const ENDUNGEN = ['.ts', '.tsx', '.css'];
const ist = (datei) => ENDUNGEN.some((e) => datei.endsWith(e)) && !/\.(test|spec)\.|\/tests\/|\.d\.ts$/.test(datei);

function alleDateien(ordner) {
  const liste = [];
  for (const name of readdirSync(ordner)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(ordner, name);
    if (statSync(p).isDirectory()) liste.push(...alleDateien(p));
    else if (ist(p)) liste.push(p);
  }
  return liste;
}

let dateien;
if (values.seit) {
  const git = (args) => execFileSync('git', ['-C', WURZEL, ...args], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const geaendert = git(['diff', '--name-only', '--diff-filter=ACMR', values.seit, '--', 'web/src']);
  const neu = git(['ls-files', '--others', '--exclude-standard', '--', 'web/src']);
  dateien = [...new Set([...geaendert, ...neu])].map((d) => join(WURZEL, d)).filter(ist);
} else if (positionals.length) {
  dateien = positionals.flatMap((p) => {
    const abs = resolve(p);
    return statSync(abs).isDirectory() ? alleDateien(abs) : [abs];
  });
} else {
  dateien = alleDateien(join(WURZEL, 'web', 'src'));
}
dateien = dateien.filter((d) => ist(d) && statSync(d, { throwIfNoEntry: false })?.isFile());

// Muster
const TAILWIND_KLAMMER = /(?:(?<![\w\]])[\w!:/.\-]*-\[[^\]\s"'`{}]+\])|(?:\[[^\]\s"'`{}]+\]:[\w-]+)|(?:(?<![\w\]])\[[a-z-]+:[^\]\s"'`{}]+\])/g;
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g;
const FARBFUNKTION = /\b(?:rgba?|hsla?|oklch)\(\s*[-\d.]/g;
const PX_STRING = /['"`]-?\d+(?:\.\d+)?px['"`]/g;
const PX_STIL = /\b(?:width|height|minWidth|maxWidth|minHeight|maxHeight|top|left|right|bottom|margin\w*|padding\w*|gap|rowGap|columnGap|inset|fontSize|borderRadius|borderWidth|translate\w*)\s*:\s*-?\d+(?:\.\d+)?(?![\w.%])/g;
const HASH_LINK = /(?:href|to|hash|id|controls|labelledby|describedby)\s*[=:]\s*\{?\s*['"`]?$/;
const TOKEN_ZEILE = /^\s*--[\w-]+\s*:/;

const funde = [];
for (const datei of dateien) {
  const zeilen = readFileSync(datei, 'utf8').split('\n');
  const kurz = relative(WURZEL, datei);
  zeilen.forEach((zeile, i) => {
    const nr = i + 1;
    const snippet = zeile.trim().slice(0, 160);
    const melde = (art, fund) => funde.push({ datei: kurz, zeile: nr, art, fund, zeileText: snippet });
    if (TOKEN_ZEILE.test(zeile)) return; // Designsystem-Token selbst
    for (const m of zeile.matchAll(TAILWIND_KLAMMER)) melde('Tailwind-Klammerwert', m[0]);
    for (const m of zeile.matchAll(HEX)) {
      if (HASH_LINK.test(zeile.slice(Math.max(0, m.index - 24), m.index))) continue;
      melde('Hex-Farbe', m[0]);
    }
    for (const m of zeile.matchAll(FARBFUNKTION)) melde('Farbfunktion', m[0].trim());
    if (datei.endsWith('.ts') || datei.endsWith('.tsx')) {
      const px = [...zeile.matchAll(PX_STRING), ...zeile.matchAll(PX_STIL)];
      if (px.length) melde('px-Literal in Style', px.map((m) => m[0]).join(', '));
    }
  });
}

const zaehl = {};
for (const f of funde) zaehl[f.art] = (zaehl[f.art] ?? 0) + 1;
const zeitpunkt = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const kopf = `Geprüft: ${dateien.length} Dateien${values.seit ? ` (geändert seit ${values.seit})` : ''} · Funde: ${funde.length}${Object.keys(zaehl).length ? ` (${Object.entries(zaehl).map(([a, n]) => `${a} ${n}`).join(', ')})` : ''}`;
console.log(kopf);
for (const f of funde) console.log(`${f.datei}:${f.zeile}: [${f.art}] ${f.fund}`);

const md = [
  `# Werte außerhalb des Designsystems · ${zeitpunkt}`,
  '',
  kopf,
  '',
  '| Datei | Zeile | Art | Fund | Zeile (Auszug) |',
  '|---|---|---|---|---|',
  ...funde.map((f) => `| ${f.datei} | ${f.zeile} | ${f.art} | \`${f.fund.replace(/\|/g, '\\|')}\` | \`${f.zeileText.replace(/\|/g, '\\|').replace(/`/g, "'")}\` |`),
  '',
].join('\n');
const protokoll = values.protokoll ?? standardProtokoll('freie-werte');
const dateien2 = schreibeProtokoll(protokoll, { json: { werkzeug: 'freie-werte', zeitpunkt, seit: values.seit ?? null, geprueft: dateien.map((d) => relative(WURZEL, d)), zaehl, funde }, md });
console.log(`Protokoll: ${dateien2.join(', ')}`);
