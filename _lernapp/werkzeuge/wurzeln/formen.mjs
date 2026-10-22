#!/usr/bin/env node
/**
 * Schritt 1 (L6-06): alle verschiedenen Wortformen des gepinnten Tanzil-Texts (≈ 18.994) mit erster Stelle, Vorkommen und
 * Skelett nach `<aus>/formen.tsv`. Aufruf: node _lernapp/werkzeuge/wurzeln/formen.mjs --aus <ordner außerhalb des Repositorys>
 */
import { join } from "node:path";
import { argumente, schreibeTsv, skelett, verse, woerter } from "./gemeinsam.mjs";

const { aus } = argumente();
const formen = new Map();
for (const [sure, vers, text] of verse())
  for (const w of woerter(text)) {
    const f = formen.get(w.text);
    if (f) f.vorkommen++;
    else formen.set(w.text, { stelle: `${sure}:${vers}:${w.pos}`, vorkommen: 1, form: w.text, skelett: skelett(w.text) });
  }
const zeilen = [...formen.values()].map((f, i) => ({ nr: i + 1, ...f }));
schreibeTsv(join(aus, "formen.tsv"), ["nr", "stelle", "vorkommen", "form", "skelett"], zeilen);
console.log(`[wurzeln/formen] ${zeilen.length} Wortformen, ${new Set(zeilen.map((z) => z.skelett)).size} Skelette → ${join(aus, "formen.tsv")}`);
