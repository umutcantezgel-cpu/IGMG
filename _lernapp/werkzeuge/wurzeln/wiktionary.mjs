#!/usr/bin/env node
/**
 * Schritt 3 (L6-06, ADR 0045 Nr. 13): Wurzeln aus Wiktionary (kaikki.org, en-Ausgabe, CC BY-SA 4.0) zum Abgleich mit den
 * CAMeL-Vorschlägen. Liest den Strom `kaikki.org-dictionary-Arabic.jsonl` (Datei oder `-` = Standardeingabe), nimmt die Wurzel
 * aus den Vorlagen `ar-root`/`ar-rootbox` der Etymologie und den Kategorien „Arabic terms belonging to the root …“ und ordnet sie dem Skelett des Stichworts und aller seiner Formen zu. Ergebnis
 * `<aus>/wiktionary-wurzeln.tsv`: skelett, wurzeln, stichwoerter. Nichts davon ins Repository (nur Prüfhilfe, LM-31).
 *
 * Aufruf ohne Zwischendatei:
 *   curl -sS https://kaikki.org/dictionary/Arabic/kaikki.org-dictionary-Arabic.jsonl \
 *     | node _lernapp/werkzeuge/wurzeln/wiktionary.mjs --aus <ordner> --datei -
 */
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { argumente, schreibeTsv, skelett, wurzelNorm } from "./gemeinsam.mjs";

const { aus, datei } = argumente();
if (!datei) throw new Error("--datei <pfad|-> fehlt");
const strom = datei === "-" ? process.stdin : createReadStream(String(datei));
const je = new Map();
let zeilen = 0;
let mitWurzel = 0;
for await (const zeile of createInterface({ input: strom, crlfDelay: Infinity })) {
  zeilen++;
  let e;
  try {
    e = JSON.parse(zeile);
  } catch {
    continue;
  }
  if (e.lang_code !== "ar") continue;
  // Wurzel aus den Vorlagen `ar-root`/`ar-rootbox` und aus den Kategorien „Arabic terms belonging to the root …“
  const ausVorlagen = (e.etymology_templates ?? [])
    .filter((t) => t.name === "ar-root" || t.name === "ar-rootbox")
    .map((t) => Object.entries(t.args ?? {}).filter(([k]) => /^\d+$/.test(k)).sort(([a], [b]) => a - b).map(([, v]) => v).join(""));
  const kategorien = [...(e.categories ?? []), ...(e.senses ?? []).flatMap((x) => x.categories ?? [])].map((k) => (typeof k === "string" ? k : k?.name ?? ""));
  const ausKategorien = kategorien.flatMap((k) => /^Arabic terms belonging to the root (.+)$/.exec(k)?.[1] ?? []);
  const wurzeln = new Set([...ausVorlagen, ...ausKategorien].map(wurzelNorm).filter((w) => w.length >= 2));
  if (!wurzeln.size) continue;
  mitWurzel++;
  const formen = new Set([e.word, ...(e.forms ?? []).map((f) => f.form)].filter((f) => typeof f === "string").map(skelett));
  for (const f of formen) {
    if (!f) continue;
    const x = je.get(f) ?? { wurzeln: new Set(), stichwoerter: 0 };
    for (const w of wurzeln) x.wurzeln.add(w);
    x.stichwoerter++;
    je.set(f, x);
  }
}
schreibeTsv(
  join(aus, "wiktionary-wurzeln.tsv"),
  ["skelett", "wurzeln", "stichwoerter"],
  [...je].map(([s, x]) => ({ skelett: s, wurzeln: [...x.wurzeln].join(" "), stichwoerter: x.stichwoerter })),
);
console.log(`[wurzeln/wiktionary] ${zeilen} Zeilen, ${mitWurzel} Stichwörter mit Wurzel, ${je.size} Skelette → ${join(aus, "wiktionary-wurzeln.tsv")}`);
