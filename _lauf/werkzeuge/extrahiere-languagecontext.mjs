// Extrahiert das translations-Objekt aus bestand/src/app/components/LanguageContext.tsx
// deterministisch (ohne Abschreiben) nach JSON und eine flache Tabelle mit Fundstellen.
// Aufruf: node extrahiere-languagecontext.mjs <LanguageContext.tsx> <ausgabe-ordner>
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const [, , quelle, ziel] = process.argv;
const text = readFileSync(quelle, 'utf8');
const zeilen = text.split('\n');
const start = zeilen.findIndex((z) => z.startsWith('const translations = {'));
let ende = -1;
for (let i = start + 1; i < zeilen.length; i++) if (zeilen[i] === '};') { ende = i; break; }
if (start < 0 || ende < 0) throw new Error('translations-Block nicht gefunden');
const literal = zeilen.slice(start, ende + 1).join('\n').replace(/^const translations = /, '(').replace(/;\s*$/, ')');
const translations = vm.runInNewContext(literal, Object.create(null), { timeout: 1000 });

// Sprachbereiche (Zeilen) für Fundstellen
const bereich = {};
for (const lang of ['de', 'tr', 'en']) {
  const s = zeilen.findIndex((z, i) => i > start && z === `  ${lang}: {`);
  bereich[lang] = s;
}
const grenzen = ['de', 'tr', 'en'].map((l) => bereich[l]).concat([ende]);

function flach(obj, pfad = '', aus = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const p = pfad ? `${pfad}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flach(v, p, aus);
    else aus[p] = v;
  }
  return aus;
}
const f = { de: flach(translations.de), tr: flach(translations.tr), en: flach(translations.en) };
const schluessel = [...new Set([...Object.keys(f.de), ...Object.keys(f.tr), ...Object.keys(f.en)])];

function fundstelle(lang, schl, wert) {
  const idx = ['de', 'tr', 'en'].indexOf(lang);
  const von = grenzen[idx], bis = grenzen[idx + 1];
  const blatt = schl.split('.').pop();
  for (let i = von; i < bis; i++) {
    if (zeilen[i].includes(`${blatt}:`) && (typeof wert !== 'string' || zeilen[i].includes(JSON.stringify(wert).slice(1, -1).slice(0, 20)) || zeilen[i + 1]?.includes(String(wert).slice(0, 20)))) return i + 1;
  }
  return null;
}

const tabelle = ['| Schlüssel | de | tr | en | Zeile de | Zeile tr | Zeile en |', '|---|---|---|---|---|---|---|'];
const esc = (v) => (v === undefined ? '– (fehlt)' : String(v).replace(/\|/g, '\\|').replace(/\n/g, ' '));
const fehlend = [];
const defekt = [];
for (const s of schluessel) {
  for (const l of ['de', 'tr', 'en']) {
    if (f[l][s] === undefined) fehlend.push(`${l}:${s}`);
    if (typeof f[l][s] === 'string' && f[l][s].includes('�')) defekt.push(`${l}:${s}`);
  }
  tabelle.push(`| ${s} | ${esc(f.de[s])} | ${esc(f.tr[s])} | ${esc(f.en[s])} | ${fundstelle('de', s, f.de[s]) ?? '?'} | ${fundstelle('tr', s, f.tr[s]) ?? '?'} | ${fundstelle('en', s, f.en[s]) ?? '?'} |`);
}
writeFileSync(`${ziel}/bestand-languagecontext.json`, JSON.stringify(translations, null, 2) + '\n');
writeFileSync(
  `${ziel}/bestand-languagecontext.md`,
  `# Text-Inventar LanguageContext.tsx (Bestand)\n\nQuelle: bestand/src/app/components/LanguageContext.tsx, Zeilen ${start + 1}–${ende + 1}. Maschinell extrahiert (_lauf/werkzeuge/extrahiere-languagecontext.mjs), nicht abgeschrieben.\n\n- Schlüssel (Blätter): ${schluessel.length}\n- Fehlende Schlüssel: ${fehlend.length ? fehlend.join(', ') : 'keine'}\n- Defekte Zeichen (U+FFFD): ${defekt.length ? defekt.join(', ') : 'keine'}\n\n${tabelle.join('\n')}\n`
);
console.log(JSON.stringify({ schluessel: schluessel.length, fehlend: fehlend.length, defekt }, null, 0));
