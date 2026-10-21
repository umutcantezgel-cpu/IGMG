#!/usr/bin/env node
/**
 * Schritt 4 (L6-06, ADR 0045 Nr. 13, LM-31): Prüfliste für die benannte Lehrkraft aus `formen.tsv`, `vorschlaege-camel.tsv`
 * und `wiktionary-wurzeln.tsv` im Ausgabeordner. Je Wortform: Vorschlag, Status (`einig`, `nur_camel`, `nur_wiktionary`,
 * `abweichend`, `ohne`), beide Quellen, leere Spalten `wurzel_geprueft` und `anmerkung`. Formen des Lern-App-Pfads
 * (`web/inhalte/lernapp/koran/pfad.json`) zuerst, dann nach Vorkommen. Ergebnis `<aus>/pruefliste.tsv` und
 * `<aus>/zusammenfassung.txt` (ohne arabische Schrift) – nur lokal; ins Repository erst die geprüfte, mit zwei Freigaben
 * versehene Tabelle unter `web/daten/[Ordnername festlegen]/` mit `QUELLE.md` (CC BY-SA 4.0, Tanzil-Hinweis).
 *
 * Aufruf: node _lernapp/werkzeuge/wurzeln/zusammenfuehren.mjs --aus <ordner>
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { argumente, leseTsv, schreibeTsv, verse, WURZEL, woerter, wurzelNorm } from "./gemeinsam.mjs";

const { aus } = argumente();
const formen = leseTsv(join(aus, "formen.tsv"));
const camel = new Map(leseTsv(join(aus, "vorschlaege-camel.tsv")).map((z) => [z.nr, z]));
const wikiDatei = join(aus, "wiktionary-wurzeln.tsv");
const wiki = new Map(existsSync(wikiDatei) ? leseTsv(wikiDatei).map((z) => [z.skelett, z.wurzeln.split(" ").filter(Boolean)]) : []);

// Formen des Lern-App-Pfads (Stellen → Form)
const formAn = new Map();
for (const [sure, vers, text] of verse()) for (const w of woerter(text)) formAn.set(`${sure}:${vers}:${w.pos}`, w.text);
const pfad = JSON.parse(readFileSync(join(WURZEL, "web/inhalte/lernapp/koran/pfad.json"), "utf8"));
const imPfad = new Set(pfad.einheiten.flatMap((e) => e.lektionen.flatMap((l) => l.wortformen.map((s) => formAn.get(s)))));

// CAMeL schreibt Wurzeln mit Punkten, unbekannte Radikale als „#“ (hier wie Hamza gezählt)
const camelWurzeln = (z) => (z?.wurzeln ?? "").split(" ").filter(Boolean).map((w) => wurzelNorm(w.replaceAll("#", "\u0621")));

// Wiktionary führt Grundformen: Skelett, sonst ohne Konjunktion (wa-/fa-), Artikel und Präpositionen (bi-/li-/ka-)
function wikiWurzeln(s) {
  const kandidaten = [s];
  let r = s;
  if (/^[\u0648\u0641]/u.test(r) && r.length > 3) kandidaten.push((r = r.slice(1)));
  if (/^[\u0628\u0644\u0643]/u.test(r) && r.length > 3) kandidaten.push(r.slice(1));
  if (/^\u0627\u0644/u.test(r) && r.length > 3) kandidaten.push(r.slice(2));
  if (/^[\u0628\u0644\u0643]\u0627\u0644/u.test(r) && r.length > 4) kandidaten.push(r.slice(3));
  for (const k of kandidaten) if (wiki.has(k)) return wiki.get(k);
  return [];
}

const zeilen = formen.map((f) => {
  const c = [...new Set(camelWurzeln(camel.get(f.nr)))];
  const w = [...new Set(wikiWurzeln(f.skelett))];
  const gemeinsam = c.filter((x) => w.includes(x));
  const status = gemeinsam.length ? "einig" : c.length && w.length ? "abweichend" : c.length ? "nur_camel" : w.length ? "nur_wiktionary" : "ohne";
  return {
    nr: f.nr,
    stelle: f.stelle,
    vorkommen: Number(f.vorkommen),
    im_pfad: imPfad.has(f.form) ? "ja" : "",
    form: f.form,
    vorschlag: gemeinsam[0] ?? c[0] ?? w[0] ?? "",
    status,
    camel: c.join(" "),
    wiktionary: w.join(" "),
    wurzel_geprueft: "",
    anmerkung: "",
  };
});
zeilen.sort((a, b) => (b.im_pfad ? 1 : 0) - (a.im_pfad ? 1 : 0) || b.vorkommen - a.vorkommen || a.nr - b.nr);
const spalten = ["nr", "stelle", "vorkommen", "im_pfad", "form", "vorschlag", "status", "camel", "wiktionary", "wurzel_geprueft", "anmerkung"];
schreibeTsv(join(aus, "pruefliste.tsv"), spalten, zeilen);

const zaehle = (liste) => Object.fromEntries(["einig", "abweichend", "nur_camel", "nur_wiktionary", "ohne"].map((s) => [s, liste.filter((z) => z.status === s).length]));
const vorkommenGesamt = zeilen.reduce((n, z) => n + z.vorkommen, 0);
const anteilEinig = zeilen.filter((z) => z.status === "einig").reduce((n, z) => n + z.vorkommen, 0) / vorkommenGesamt;
const bericht = [
  `Wurzel-Prüfliste (L6-06), erzeugt ${new Date().toISOString()}`,
  `Formen: ${zeilen.length}; im Lern-App-Pfad: ${imPfad.size}; Wiktionary-Skelette: ${wiki.size}`,
  `Status alle: ${JSON.stringify(zaehle(zeilen))}`,
  `Status Pfad: ${JSON.stringify(zaehle(zeilen.filter((z) => z.im_pfad)))}`,
  `Anteil der Wörter im Text mit einigem Vorschlag: ${(100 * anteilEinig).toFixed(1)} %`,
  "Nur Vorschläge: Jede Wurzel prüft die benannte Lehrkraft (Spalte wurzel_geprueft); sichtbar erst nach zwei Freigaben (LM-31).",
].join("\n");
writeFileSync(join(aus, "zusammenfassung.txt"), `${bericht}\n`);
console.log(bericht);
