// Schlüsselabgleich der Sprachdateien (Z-03): jeder Schlüssel in de existiert in tr und en (außer Namensraum
// `verwaltung`, ADR 0016), Platzhalter {…} stimmen überein, keine leeren Werte. Exit 1 bei Befund.
// Lern-App (ADR 0037 Nr. 5, KERN 4.0 §7): messages/lernapp/{de,tr,ar}.json – de ⊆ tr und de ⊆ ar, keine überzähligen
// Schlüssel, gleiche Platzhalter; Pluralkategorien nur die der Sprache (ar: zero/one/two/few/many/other, mehr als de
// erlaubt), jede Kategorie aus de bleibt, „other“ Pflicht; die Liste der KI-Entwürfe (messages/lernapp/entwurf.json) nennt
// nur vorhandene Schlüssel.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// SPRACHEN_ORDNER: nur für den Unit-Test (Kopie mit absichtlichen Fehlern)
const ordner = process.env.SPRACHEN_ORDNER ?? join(import.meta.dirname, '..', 'messages');
const lies = (datei) => JSON.parse(readFileSync(datei, 'utf8'));
// Bereichsdateien (E-027): messages/bereiche/<bereich>.json mit { de, tr, en } – Namensräume dürfen sich nicht überschneiden
const bereiche = readdirSync(join(ordner, 'bereiche'))
  .filter((d) => d.endsWith('.json'))
  .map((d) => ({ name: d, inhalt: lies(join(ordner, 'bereiche', d)) }));
const ueberschneidungen = [];
const lade = (s) => {
  const basis = lies(join(ordner, `${s}.json`));
  for (const b of bereiche) {
    for (const [ns, wert] of Object.entries(b.inhalt[s] ?? {})) {
      if (ns in basis) ueberschneidungen.push(`${s}: Namensraum „${ns}“ aus bereiche/${b.name} existiert bereits`);
      basis[ns] = wert;
    }
  }
  // Verwaltungsmodule (E-031): messages/verwaltung/<modul>.json, nur Deutsch, unter dem Namensraum `verwaltung`
  if (s === 'de') {
    basis.verwaltung ??= {};
    for (const d of readdirSync(join(ordner, 'verwaltung')).filter((n) => n.endsWith('.json'))) {
      for (const [ns, wert] of Object.entries(lies(join(ordner, 'verwaltung', d)))) {
        if (ns in basis.verwaltung) ueberschneidungen.push(`de: verwaltung.${ns} aus verwaltung/${d} existiert bereits`);
        basis.verwaltung[ns] = wert;
      }
    }
  }
  return basis;
};
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
      // ICU „DOUBLE_OPTIONAL“ (wie intl-messageformat): ein Apostroph quotiert nur vor { } # | oder '
      if (c === "'" && /[{}#|']/.test(t[i + 1] ?? '')) {
        i = t[i + 1] === "'" ? i + 2 : t.indexOf("'", i + 1) + 1 || t.length;
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

/**
 * Plural- und Ordinalargumente einer ICU-Nachricht mit ihren Kategorien (`one`, `other`, `=0` …), auch verschachtelt.
 * Ergebnis: Name → { typ, kategorien }.
 */
function pluralArgumente(text) {
  const ergebnis = new Map();
  const lies = (t, i, ende) => {
    while (i < t.length) {
      const c = t[i];
      if (c === "'" && /[{}#|']/.test(t[i + 1] ?? '')) {
        i = t[i + 1] === "'" ? i + 2 : t.indexOf("'", i + 1) + 1 || t.length;
        continue;
      }
      if (c === ende) return i + 1;
      if (c !== '{') {
        i++;
        continue;
      }
      const m = /^\s*(\w+)\s*(?:,\s*(\w+)\s*(,)?)?/.exec(t.slice(i + 1));
      let j = i + 1 + (m?.[0].length ?? 0);
      const typ = m?.[2];
      if (typ === 'plural' || typ === 'selectordinal' || typ === 'select') {
        const kategorien = new Set();
        while (j < t.length) {
          const sel = /^\s*(offset:\s*\d+\s*)?([^\s{}]+)\s*\{/.exec(t.slice(j));
          if (!sel) break;
          kategorien.add(sel[2]);
          j = lies(t, j + sel[0].length, '}');
        }
        if (typ !== 'select') ergebnis.set(m[1], { typ, kategorien });
        j = t.indexOf('}', j) + 1 || t.length;
      } else {
        let tiefe = 1;
        while (j < t.length && tiefe) {
          if (t[j] === '{') tiefe++;
          if (t[j] === '}') tiefe--;
          j++;
        }
      }
      i = j;
    }
    return i;
  };
  lies(String(text), 0, null);
  return ergebnis;
}

/** Erlaubte Kategorien je Sprache und Art (CLDR über Intl.PluralRules) plus ausdrückliche Werte `=N`. */
function erlaubteKategorie(sprache, typ, kategorie) {
  if (/^=\d+$/.test(kategorie)) return true;
  const art = typ === 'selectordinal' ? 'ordinal' : 'cardinal';
  return new Intl.PluralRules(sprache, { type: art }).resolvedOptions().pluralCategories.includes(kategorie);
}

/** Lern-App: Befunde für messages/lernapp/{de,tr,ar}.json und entwurf.json. */
function lernappBefunde() {
  const lernOrdner = join(ordner, 'lernapp');
  const befundeL = [];
  const flachL = (s) => flach(lies(join(lernOrdner, `${s}.json`)));
  const deL = flachL('de');
  for (const [k, v] of Object.entries(deL)) {
    if (String(v).trim() === '') befundeL.push(`lernapp/de: leer ${k}`);
    for (const [name, { typ, kategorien }] of pluralArgumente(v)) {
      if (!kategorien.has('other')) befundeL.push(`lernapp/de: ${typ} ohne other ${k} (${name})`);
      for (const kat of kategorien) if (!erlaubteKategorie('de', typ, kat)) befundeL.push(`lernapp/de: Kategorie ${kat} ungültig ${k}`);
    }
  }
  const sprachen = { tr: flachL('tr'), ar: flachL('ar') };
  for (const [sprache, s] of Object.entries(sprachen)) {
    for (const [k, v] of Object.entries(deL)) {
      if (!(k in s)) {
        befundeL.push(`lernapp/${sprache}: fehlt ${k}`);
        continue;
      }
      if (String(s[k]).trim() === '' && String(v).trim() !== '') befundeL.push(`lernapp/${sprache}: leer ${k}`);
      if (platzhalter(s[k]) !== platzhalter(v)) befundeL.push(`lernapp/${sprache}: Platzhalter abweichend ${k}`);
      const ziel = pluralArgumente(s[k]);
      for (const [name, { typ, kategorien }] of pluralArgumente(v)) {
        const z = ziel.get(name);
        if (!z || z.typ !== typ) {
          befundeL.push(`lernapp/${sprache}: ${typ} fehlt ${k} (${name})`);
          continue;
        }
        if (!z.kategorien.has('other')) befundeL.push(`lernapp/${sprache}: ${typ} ohne other ${k} (${name})`);
        for (const kat of z.kategorien)
          if (!erlaubteKategorie(sprache, typ, kat)) befundeL.push(`lernapp/${sprache}: Kategorie ${kat} ungültig ${k} (${name})`);
        // Jede Sprachkategorie aus de, die es in der Zielsprache gibt, bleibt erhalten (ar darf mehr haben)
        for (const kat of kategorien)
          if (!/^=\d+$/.test(kat) && erlaubteKategorie(sprache, typ, kat) && !z.kategorien.has(kat))
            befundeL.push(`lernapp/${sprache}: Kategorie ${kat} fehlt ${k} (${name})`);
      }
    }
    for (const k of Object.keys(s)) if (!(k in deL)) befundeL.push(`lernapp/${sprache}: überzählig ${k}`);
  }
  // KI-Entwürfe (tr/ar, Muttersprachler prüfen später): nur vorhandene Schlüssel
  const entwurf = lies(join(lernOrdner, 'entwurf.json'));
  for (const sprache of ['tr', 'ar']) {
    const liste = entwurf[sprache];
    if (!Array.isArray(liste)) {
      befundeL.push(`lernapp/entwurf.json: Liste ${sprache} fehlt`);
      continue;
    }
    for (const k of liste)
      if (!(k in sprachen[sprache])) befundeL.push(`lernapp/entwurf.json: ${sprache} nennt unbekannten Schlüssel ${k}`);
    for (const k of new Set(liste.filter((x, i) => liste.indexOf(x) !== i))) befundeL.push(`lernapp/entwurf.json: ${sprache} doppelt ${k}`);
  }
  for (const s of Object.keys(entwurf))
    if (!['_hinweis', 'tr', 'ar'].includes(s)) befundeL.push(`lernapp/entwurf.json: unbekannter Eintrag ${s}`);
  return { befunde: befundeL, anzahl: Object.keys(deL).length, entwuerfe: (entwurf.tr?.length ?? 0) + (entwurf.ar?.length ?? 0) };
}
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
befunde.push(...new Set(ueberschneidungen));
const lernapp = lernappBefunde();
befunde.push(...lernapp.befunde);
const anzahl = Object.keys(de).filter((k) => !k.startsWith('verwaltung.')).length;
const nurDe = Object.keys(de).length - anzahl;
if (befunde.length) {
  console.error(`Sprachdateien: ${befunde.length} Befund(e) bei ${anzahl} Schlüsseln (Lern-App ${lernapp.anzahl})`);
  for (const b of befunde.slice(0, 200)) console.error(`  ${b}`);
  process.exit(1);
}
console.log(
  `Sprachdateien vollständig: ${anzahl} Schlüssel in de, tr, en; dazu ${nurDe} Schlüssel der Verwaltung (nur de, ADR 0016); ` +
    `Lern-App ${lernapp.anzahl} Schlüssel in de, tr, ar (${lernapp.entwuerfe} als KI-Entwurf vermerkt).`,
);
