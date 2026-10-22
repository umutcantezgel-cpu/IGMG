/**
 * Gemeinsame Hilfen der Wurzel-Werkzeuge (L6-06, ADR 0045 Nr. 13, KERN 4.0 §2.2 Nr. 6). Nur Codepunkt-Bereiche, kein Wortlaut
 * (Werkstatt, `_gemeinde/werkzeuge/religion-pruefung.mjs`). Arabische Wortformen entstehen nur zur Laufzeit aus dem gepinnten
 * Tanzil-Text und landen nur im Ausgabeordner außerhalb des Repositorys (`--aus`, z. B. im Scratchpad).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const TANZIL = join(WURZEL, "web/daten/tanzil/quran-uthmani.xml");

/** Arabische Buchstaben wie `web/src/lib/quran/woerter.ts` (Wort = Teil mit mindestens einem Buchstaben). */
const BUCHSTABE = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FC]/u;

/** Verse des Tanzil-Texts: [sure, vers, text]. */
export function verse(xml = readFileSync(TANZIL, "utf8")) {
  const liste = [];
  let sure = 0;
  for (const m of xml.matchAll(/<sura index="(\d+)"|<aya index="(\d+)" text="([^"]*)"/g)) {
    if (m[1]) sure = Number(m[1]);
    else liste.push([sure, Number(m[2]), m[3]]);
  }
  return liste;
}

/** Wörter eines Verses mit Position 1…n (Zählung wie `quran_wort`). */
export function woerter(text) {
  let pos = 0;
  return text.split(" ").flatMap((t) => (BUCHSTABE.test(t) ? [{ text: t, pos: ++pos }] : []));
}

/**
 * Skelett einer uthmanischen Wortform für den Abgleich mit heutigen Wörterbüchern: ohne Harakat, Koranzeichen, kleine
 * Buchstaben und Tatweel; Alif wasla und Hamza-Alif → Alif; Alif maqsura → Ya; Ta marbuta → Ha (wie der Wächter, ADR 0045
 * Fortschreibung S7 Nr. 6).
 */
export function skelett(form) {
  return form
    .normalize("NFC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08F0-\u08FF]/gu, "")
    .replace(/[\u0622\u0623\u0625\u0671]/gu, "\u0627")
    .replace(/\u0649/gu, "\u064A")
    .replace(/\u0629/gu, "\u0647");
}

/** Wurzel normalisieren: nur Grundbuchstaben, ohne Trenner (Punkte, Bindestriche, Leerzeichen). */
export function wurzelNorm(w) {
  return skelett(String(w)).replace(/[^\u0621-\u064A]/gu, "");
}

/** Argumente `--aus <ordner>` u. a.; der Ausgabeordner darf nicht im Repository liegen. */
export function argumente(argv = process.argv.slice(2)) {
  const a = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") ? true : argv[++i] ?? true;
  if (!a.aus) throw new Error("--aus <ordner außerhalb des Repositorys> fehlt");
  const aus = resolve(String(a.aus));
  if (aus === WURZEL || aus.startsWith(`${WURZEL}/`)) throw new Error("Ausgabe nie ins Repository (ungeprüfte Daten, LM-31)");
  mkdirSync(aus, { recursive: true });
  return { ...a, aus };
}

export function leseTsv(pfad) {
  const [kopf, ...zeilen] = readFileSync(pfad, "utf8").trimEnd().split("\n");
  const spalten = kopf.split("\t");
  return zeilen.map((z) => Object.fromEntries(z.split("\t").map((w, i) => [spalten[i], w])));
}

export function schreibeTsv(pfad, spalten, zeilen) {
  const sauber = (w) => String(w ?? "").replace(/[\t\n\r]/g, " ");
  writeFileSync(pfad, [spalten.join("\t"), ...zeilen.map((z) => spalten.map((s) => sauber(z[s])).join("\t"))].join("\n") + "\n");
}
