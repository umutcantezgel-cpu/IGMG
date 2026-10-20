#!/usr/bin/env node
/**
 * Religion-Prüfung (KERN 3.0, ADR 0030; Lern-App: KERN 4.0 §3, ADR 0040 Nr. 6): Arabische Schrift darf im Repository nur
 * in importierten, gepinnten Dateien (`web/daten/**`) und in ausdrücklich erlaubten Dateien stehen (Alphabet aus
 * Codepunkten, Gebetsnamen der Anzeige, Tests). Alles andere ist Rot – so kann kein Agent Verse, Hadithe oder Bittgebete
 * „aus dem Gedächtnis“ einschleusen.
 *
 * Wächter (Lern-App): Die Oberfläche `web/messages/lernapp/ar.json` und das Hocharabisch der Sprachkurse
 * (`web/inhalte/lernapp/{sprache,uebersetzung,aussprache}/**`) dürfen arabische Schrift enthalten – aber nur zusammen mit
 * dem Wächter. Der Kern liegt in `web/src/lib/lernapp/waechter/kern.mjs` (auch für Import und `lernapp:pruefen`, die im
 * Vercel-Bau ohne `_gemeinde/` laufen):
 * - Normalisierung ohne Harakat, Tatweel, Format- und kombinierende Zeichen; Alif-, Ha-, Ya- und Kaf-Formen vereinheitlicht.
 * - Verschleierte Schreibungen werden aufgelöst: Codepunkt-Folgen, HTML-Entitäten, `fromCharCode`/`fromCodePoint`,
 *   Prozent-Kodierung.
 * - Abgleich mit allen Folgen aus 4 Wörtern des Tanzil-Texts (`web/daten/tanzil`) und des Bukhari-Bestands
 *   (`web/daten/hadith`) über die ganze Datei – auch über Zeilen und Felder hinweg (Dialoge, Sätze einer Lektion). Ein Treffer
 *   ist Rot. Ausnahmen gibt es erst mit der Liste erlaubter Alltagsformeln und zwei religiösen Freigaben (KERN 4.0 §2.3,
 *   LM-09; L6) – bis dahin ist jeder Treffer Rot.
 * - Formel-Lexikon (KERN 4.0 §3 a) in der Oberfläche `ar.json`: Dort gibt es kein Kennzeichen `religionsbezug`, also ist jeder
 *   Treffer Rot. In den Inhaltsdateien prüfen Import und `lernapp:pruefen` das Lexikon zusammen mit dem Kennzeichen
 *   (`web/src/lib/lernapp/inhalt/religion.ts`).
 * Nie erlaubt bleiben `web/inhalte/lernapp/{islam,koran}/**`, Komponenten und die Werkstatt; im Wissenskurs, im Koran-Pfad und
 * in der Werkstatt ist auch verschleierte arabische Schrift Rot. Codepunkt-Folgen in Code außerhalb der Daten und Tests
 * dürfen keine 4-Wort-Folge ergeben.
 *
 * Aufruf: node _gemeinde/werkzeuge/religion-pruefung.mjs   (Ausgang 1 bei Befund; Ausgabe ohne arabische Schrift)
 * Als Modul (Unit-Test `web/tests/unit/lernapp/religion-waechter.test.ts`): normalisiere, woerter, baueIndex, ladeIndex,
 * ladeLexikon, vierGrammTreffer, lexikonTreffer, loeseCodepunkte, pruefeDatei.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  ARABISCH,
  baueIndex,
  baueLexikon,
  koranVarianten,
  LEXIKON_LATEIN,
  LEXIKON_VERWEISE,
  lexikonTreffer,
  loeseCodepunkte,
  normalisiere,
  vierGrammStrom,
  vierGrammTreffer,
  woerter,
} from "../../web/src/lib/lernapp/waechter/kern.mjs";

export {
  ARABISCH,
  baueIndex,
  baueLexikon,
  koranVarianten,
  LEXIKON_LATEIN,
  LEXIKON_VERWEISE,
  lexikonTreffer,
  loeseCodepunkte,
  normalisiere,
  vierGrammTreffer,
  woerter,
};

export const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** Erlaubte Orte mit Begründung; `waechter`: nur zusammen mit dem 4-Gramm-Abgleich, `lexikon`: dazu das Formel-Lexikon. */
export const ERLAUBT = [
  [/^web\/daten\//, "importierte, gepinnte Quelldateien"],
  [
    /^web\/tests\//,
    "Testdaten (nur Codepunkt-Proben und Ausschnitte aus web/daten)",
  ],
  [/^web\/src\/lib\/elifbe\/alphabet\.ts$/, "Alphabet aus Codepunkten"],
  [
    /^web\/messages\/bereiche\/anzeige\.json$/,
    "Namen der Gebetszeiten (Vorlauf, geprüft)",
  ],
  [
    /^web\/messages\/verwaltung\/styleguide\.json$/,
    "Schriftprobe Alphabet (Abjad-Reihe)",
  ],
  [
    /^web\/messages\/lernapp\/ar\.json$/,
    "Lern-App: arabische Oberfläche (ADR 0037, ADR 0040 Nr. 6)",
    { waechter: true, lexikon: true },
  ],
  [
    /^web\/inhalte\/lernapp\/(sprache|uebersetzung|aussprache)\//,
    "Lern-App: Hocharabisch der Sprachkurse, Übersetzungen der Richtungen mit Arabisch, Aussprache (ADR 0040 Nr. 6)",
    { waechter: true },
  ],
  [
    /\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp3|m4a|ogg|webm)$/i,
    "Binärdatei",
  ],
];

/**
 * Nie erlaubt, auch wenn ein Muster oben sie träfe (KERN 4.0 §3): Wissen, Koran-Pfad, Komponenten, Werkstatt.
 * `codepunkte`: Dort ist auch verschleierte arabische Schrift (Codepunkte, Entitäten, …) Rot – Inhalts- und Textdateien
 * werden beim Lesen zu Schrift. Komponenten und Werkzeuge der Werkstatt dürfen Codepunkte tragen (z. B. die arabische
 * Bildschirmtastatur, L2, oder Zeichenbereiche der Normalisierung), nur ohne 4-Gramm.
 */
export const NIE = [
  [
    /^web\/inhalte\/lernapp\/(islam|koran)\//,
    "Wissenskurs und Koran-Arabisch: Arabisch nur über Verweise auf web/daten",
    { codepunkte: true },
  ],
  [/^web\/src\/components\//, "Komponenten: Texte nur aus Nachrichtendateien"],
  [
    /^_lernapp\/.*\.(md|json|jsonl|txt|tsv|csv|ya?ml)$/i,
    "Werkstatt der Lern-App: arabische Wörter nur in Umschrift",
    { codepunkte: true },
  ],
  [
    /^_lernapp\//,
    "Werkstatt der Lern-App: Werkzeuge nur mit Codepunkt-Bereichen, ohne Wortlaut",
  ],
];

/** Index aus `web/daten` des Repositorys (einmal je Lauf). */
export function ladeIndex(wurzel = WURZEL) {
  return baueIndex({
    tanzilXml: readFileSync(
      join(wurzel, "web/daten/tanzil/quran-uthmani.xml"),
      "utf8",
    ),
    bukhariJson: readFileSync(
      join(wurzel, "web/daten/hadith/ara-bukhari.json"),
      "utf8",
    ),
  });
}

/** Formel-Lexikon mit den arabischen Einträgen aus `web/daten/tanzil` (einmal je Lauf). */
export function ladeLexikon(wurzel = WURZEL) {
  return baueLexikon(
    readFileSync(join(wurzel, "web/daten/tanzil/quran-uthmani.xml"), "utf8"),
  );
}

let lexikonCache = null;
const standardLexikon = () => (lexikonCache ??= ladeLexikon());

/** Zeichen, die eine verschleierte Schreibung einleiten können (schneller Vortest vor `loeseCodepunkte`). */
const VERSCHLEIERT = /\\u|&#|fromC|%[dD][89a-fA-F]/;

/**
 * Prüft eine Datei (Pfad relativ zur Wurzel). `holeIndex` bzw. `holeLexikon` liefern Index und Lexikon erst bei Bedarf.
 * Ergebnis: Befunde als Text ohne arabische Schrift (`pfad:zeile: Grund`).
 */
export function pruefeDatei(
  pfad,
  inhalt,
  holeIndex,
  holeLexikon = standardLexikon,
) {
  const nie = NIE.find(([m]) => m.test(pfad));
  const erlaubt = nie ? undefined : ERLAUBT.find(([m]) => m.test(pfad));
  if (erlaubt && !erlaubt[2]?.waechter) return [];
  const befunde = [];
  /** normalisierte Wörter der ganzen Datei mit Zeilennummer (für 4-Gramme über Zeilen und Felder hinweg) */
  const strom = [];
  inhalt.split("\n").forEach((zeile, i) => {
    const ort = `${pfad}:${i + 1}`;
    const roh = ARABISCH.test(zeile);
    if (roh && !erlaubt) {
      befunde.push(
        `${ort}: arabische Schrift${nie ? ` (nie erlaubt: ${nie[1]})` : ""}`,
      );
      return;
    }
    const geloest = VERSCHLEIERT.test(zeile) ? loeseCodepunkte(zeile) : zeile;
    if (!ARABISCH.test(geloest)) return;
    if (nie?.[2]?.codepunkte) {
      befunde.push(
        `${ort}: arabische Schrift als Codepunkte bzw. Entitäten (nie erlaubt: ${nie[1]})`,
      );
      return;
    }
    for (const w of woerter(geloest)) strom.push([w, i + 1]);
    if (erlaubt?.[2]?.lexikon) {
      const t = lexikonTreffer(geloest, holeLexikon());
      if (t)
        befunde.push(
          `${ort}: Formel-Lexikon (${t.name}) – in der Oberfläche nie erlaubt`,
        );
    }
  });
  if (strom.length >= 4) {
    const gemeldet = new Set();
    for (const t of vierGrammStrom(strom, holeIndex())) {
      if (gemeldet.has(t.ort)) continue;
      gemeldet.add(t.ort);
      befunde.push(
        `${pfad}:${t.ort}: ${t.korpus === "koran" ? "Koran" : "Hadith"}-4-Gramm (${t.stelle})`,
      );
    }
  }
  return befunde;
}

function hauptprogramm() {
  const beginn = Date.now();
  const dateien = execFileSync("git", ["ls-files"], {
    cwd: WURZEL,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
  let index = null;
  const holeIndex = () => (index ??= ladeIndex());
  const befunde = [];
  let waechterDateien = 0;
  for (const datei of dateien) {
    if (
      /\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp3|m4a|ogg|webm|onnx|wasm|lpa)$/i.test(
        datei,
      )
    )
      continue;
    if (/^web\/(daten|tests)\//.test(datei)) continue;
    let inhalt;
    try {
      inhalt = readFileSync(join(WURZEL, datei), "utf8");
    } catch {
      continue;
    }
    if (
      ERLAUBT.find(([m]) => m.test(datei))?.[2]?.waechter &&
      !NIE.some(([m]) => m.test(datei))
    )
      waechterDateien++;
    befunde.push(...pruefeDatei(datei, inhalt, holeIndex));
  }
  const dauer = ((Date.now() - beginn) / 1000).toFixed(1);
  if (befunde.length) {
    console.error(
      `Religion-Prüfung ROT: arabische Schrift außerhalb erlaubter Orte bzw. Koran-/Hadith-Wortlaut (${befunde.length}):`,
    );
    for (const b of befunde.slice(0, 50)) console.error(`  ${b}`);
    console.error(
      "Arabisch nur aus web/daten/** oder als Codepunkt in Code; Ausnahme nur mit Begründung in ERLAUBT.",
    );
    console.error(
      "Lern-App: kein Koran- oder Hadith-Wortlaut (4 Wörter) und keine Formel in Oberfläche und Sprachkursen (KERN 4.0 §3).",
    );
    process.exit(1);
  }
  console.log(
    `Religion-Prüfung grün: ${dateien.length} Dateien, arabische Schrift nur an erlaubten Orten; Wächter über ${waechterDateien} Lern-App-Dateien` +
      `${index ? ` (Index Koran ${index.koran.size}, Hadith ${index.hadith.size} 4-Gramme)` : ""}, ${dauer} s.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  hauptprogramm();
