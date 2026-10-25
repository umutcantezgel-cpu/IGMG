#!/usr/bin/env node
/**
 * Wächter über alle ausgelieferten Sprachkurs-Pakete (Live-Beleg zu Z-L10; nach dem Werkzeug der Gegenprüfung Stufe C,
 * `C-religion-gegen.md` §3): lädt die Verzeichnisse der sechs Richtungen und jedes Einheitenpaket von einer Adresse, sammelt
 * alle Zeichenketten (ohne technische wie Schlüssel und Adressen) und prüft sie mit dem Kern des Religionswächters (`web/src/lib/lernapp/waechter/kern.mjs`): Formel-Lexikon
 * (arabisch aus `web/daten/tanzil`, deutsch/türkisch) und Koran- bzw. Hadith-4-Gramme. Das Paketformat trägt kein Feld
 * `religionsbezug` – tragfähig ist nur dieser Abgleich.
 *
 * Aufruf: node _lernapp/werkzeuge/waechter-live.mjs <basis-url> [--beispiele 40]
 *   z. B. node _lernapp/werkzeuge/waechter-live.mjs https://<domain>
 * Ausgabe ohne arabische Schrift (arabische Treffer nur mit Länge); Exit 1 bei einem Treffer oder Abruffehler.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const WEB = fileURLToPath(new URL("../../web/", import.meta.url));
const K = await import(
  new URL("../../web/src/lib/lernapp/waechter/kern.mjs", import.meta.url).href
);
const RICHTUNGEN = [
  "tr-aus-de",
  "ar-aus-de",
  "de-aus-tr",
  "ar-aus-tr",
  "de-aus-ar",
  "tr-aus-ar",
];
const GLEICHZEITIG = 6;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { beispiele: { type: "string", default: "40" } },
});
const basis = (positionals[0] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(basis)) {
  console.error(
    "Aufruf: node _lernapp/werkzeuge/waechter-live.mjs <basis-url> [--beispiele 40]",
  );
  process.exit(2);
}

const tanzil = readFileSync(`${WEB}daten/tanzil/quran-uthmani.xml`, "utf8");
const index = K.baueIndex({
  tanzilXml: tanzil,
  bukhariJson: readFileSync(`${WEB}daten/hadith/ara-bukhari.json`, "utf8"),
});
const lexikon = K.baueLexikon(tanzil);

const fehler = [];
async function hole(pfad) {
  const r = await fetch(`${basis}${pfad}`, {
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error(`${pfad}: HTTP ${r.status}`);
  return r.json();
}

/**
 * Technische Zeichenketten (Schlüssel wie `tr-aus-de:tr.a2.e11.sure`, Adressen, Hashes, Lizenzkürzel) sind kein Text: Sonst
 * träfe z. B. ein Schlüssel auf „…sure“ das Lexikon (Sure).
 */
const TECHNISCH =
  /^(?:(?:[a-z]{2}(?:-aus-[a-z]{2})?[:.])[\w.:@-]+|\/[\w./%-]+|[0-9a-f]{16,}|[A-Za-z][\w.-]*:[\w./:-]+)$/;

/** Alle Zeichenketten eines JSON-Werts mit Pfad. */
function* zeichenketten(wert, pfad) {
  if (typeof wert === "string") yield [wert, pfad];
  else if (Array.isArray(wert))
    for (let i = 0; i < wert.length; i++)
      yield* zeichenketten(wert[i], `${pfad}[${i}]`);
  else if (wert && typeof wert === "object")
    for (const [k, v] of Object.entries(wert))
      yield* zeichenketten(v, `${pfad}.${k}`);
}

const auftraege = [];
let einheiten = 0;
for (const richtung of RICHTUNGEN) {
  try {
    const v = await hole(`/lern-app/pakete/${richtung}`);
    for (const e of v.einheiten ?? [])
      auftraege.push({
        richtung,
        pfad: `/lern-app/pakete/${richtung}/${e.schluessel}/${e.hash}`,
      });
  } catch (e) {
    fehler.push(String(e.message ?? e));
  }
}

const texte = new Map();
async function arbeite() {
  for (let a = auftraege.shift(); a; a = auftraege.shift()) {
    try {
      const paket = await hole(a.pfad);
      einheiten++;
      for (const [s, ort] of zeichenketten(paket, a.pfad))
        if (!TECHNISCH.test(s) && !texte.has(s)) texte.set(s, ort);
    } catch (e) {
      fehler.push(String(e.message ?? e));
    }
  }
}
await Promise.all(Array.from({ length: GLEICHZEITIG }, arbeite));

const jeName = {};
const beispiele = [];
let lexikonTreffer = 0;
let vierGramme = 0;
const zeige = (s) =>
  K.enthaeltArabisch(s) ? `<arabisch, ${s.length} Zeichen>` : s.slice(0, 80);
for (const [s, ort] of texte) {
  const t = K.lexikonTreffer(s, lexikon);
  if (t) {
    lexikonTreffer++;
    jeName[t.name] = (jeName[t.name] ?? 0) + 1;
    if (beispiele.length < Number(values.beispiele))
      beispiele.push(`Lexikon ${t.name} | ${ort} | ${zeige(s)}`);
  }
  const v = K.vierGrammTreffer(s, index);
  if (v) {
    vierGramme++;
    if (beispiele.length < Number(values.beispiele))
      beispiele.push(`4-Gramm ${v.korpus} ${v.stelle} | ${ort} | ${zeige(s)}`);
  }
}

console.log(
  `Wächter live (${basis}): ${einheiten} Einheitenpakete aus ${RICHTUNGEN.length} Richtungen, ${texte.size} eindeutige Zeichenketten; ` +
    `Lexikon-Treffer ${lexikonTreffer} ${JSON.stringify(jeName)}, 4-Gramm-Treffer ${vierGramme}, Abruffehler ${fehler.length}`,
);
for (const b of beispiele) console.log(`  ${b}`);
for (const f of fehler.slice(0, 20)) console.log(`  Fehler: ${f}`);
process.exit(lexikonTreffer || vierGramme || fehler.length ? 1 : 0);
