// Schlüsselabgleich der Sprachdateien (Z-03): jeder Schlüssel in de existiert in tr und en (außer Namensraum
// `verwaltung`, ADR 0016), Platzhalter {…} stimmen überein, keine leeren Werte. Exit 1 bei Befund.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ordner = join(import.meta.dirname, '..', 'messages');
const lade = (s) => JSON.parse(readFileSync(join(ordner, `${s}.json`), 'utf8'));
const flach = (o, p = '', a = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const s = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flach(v, s, a);
    else a[s] = v;
  }
  return a;
};
// ICU-Argumente sammeln (Namen in {name}, {name, plural, …}, {name, select, …}); Verzweigungstexte werden rekursiv gelesen.
function argumente(text) {
  const namen = new Set();
  const lies = (t, i, ende) => {
    while (i < t.length) {
      const c = t[i];
      if (c === "'") {
        i = t.indexOf("'", i + 1) + 1 || t.length;
        continue;
      }
      if (c === ende) return i + 1;
      if (c === '{') {
        let j = i + 1;
        const m = /^\s*(\w+)\s*(,\s*(\w+)\s*(,)?)?/.exec(t.slice(j));
        namen.add(m[1]);
        j += m[0].length;
        if (m[3] === 'select' || m[3] === 'plural' || m[3] === 'selectordinal') {
          while (j < t.length && t[j] !== '}') {
            const k = t.indexOf('{', j);
            if (k < 0) break;
            j = lies(t, k + 1, '}');
            while (t[j] === ' ') j++;
            if (t[j] === '}') break;
          }
        } else {
          let tiefe = 1;
          while (j < t.length && tiefe) {
            if (t[j] === '{') tiefe++;
            if (t[j] === '}') tiefe--;
            j++;
          }
          i = j;
          continue;
        }
        i = j + 1;
        continue;
      }
      i++;
    }
    return i;
  };
  lies(String(text), 0, null);
  return [...namen].sort().join(',');
}
const platzhalter = argumente;
const de = flach(lade('de'));
const befunde = [];
for (const sprache of ['tr', 'en']) {
  const s = flach(lade(sprache));
  for (const [k, v] of Object.entries(de)) {
    if (k.startsWith('verwaltung.')) continue;
    if (!(k in s)) befunde.push(`${sprache}: fehlt ${k}`);
    else if (String(s[k]).trim() === '' && String(v).trim() !== '') befunde.push(`${sprache}: leer ${k}`);
    else if (platzhalter(s[k]) !== platzhalter(v)) befunde.push(`${sprache}: Platzhalter abweichend ${k}`);
  }
  for (const k of Object.keys(s)) if (!(k in de)) befunde.push(`${sprache}: überzählig ${k}`);
}
for (const [k, v] of Object.entries(de)) if (String(v).trim() === '') befunde.push(`de: leer ${k}`);
const anzahl = Object.keys(de).length;
if (befunde.length) {
  console.error(`Sprachdateien: ${befunde.length} Befund(e) bei ${anzahl} Schlüsseln`);
  for (const b of befunde.slice(0, 200)) console.error(`  ${b}`);
  process.exit(1);
}
console.log(`Sprachdateien vollständig: ${anzahl} Schlüssel in de, tr, en (ohne verwaltung).`);
