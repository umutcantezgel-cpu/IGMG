#!/usr/bin/env node
/**
 * Religion-Prüfung (KERN 3.0, ADR 0030; Lern-App: KERN 4.0 §3, ADR 0040 Nr. 6): Arabische Schrift darf im Repository nur
 * in importierten, gepinnten Dateien (`web/daten/**`) und in ausdrücklich erlaubten Dateien stehen (Alphabet aus
 * Codepunkten, Gebetsnamen der Anzeige, Tests). Alles andere ist Rot – so kann kein Agent Verse, Hadithe oder Bittgebete
 * „aus dem Gedächtnis“ einschleusen.
 *
 * Wächter (Lern-App): Die Oberfläche `web/messages/lernapp/ar.json` und das Hocharabisch der Sprachkurse
 * (`web/inhalte/lernapp/{sprache,uebersetzung,aussprache}/**`) dürfen arabische Schrift enthalten – aber nur zusammen mit
 * dem Wächter. Jede Zeile dort wird normalisiert (ohne Harakat, Tatweel und Koranzeichen; Alif-Formen, Alif wasla,
 * Ta marbuta/Ha, Ya/Alif maqsura vereinheitlicht) und mit allen Folgen aus 4 Wörtern des Tanzil-Texts
 * (`web/daten/tanzil`) und des Bukhari-Bestands (`web/daten/hadith`) abgeglichen. Ein Treffer ist Rot. Ausnahmen gibt es
 * erst mit der Liste erlaubter Alltagsformeln und zwei religiösen Freigaben (KERN 4.0 §2.3, LM-09; L6) – bis dahin ist
 * jeder Treffer Rot. Nie erlaubt bleiben `web/inhalte/lernapp/{islam,koran}/**`, Komponenten und die Werkstatt.
 * Zusätzlich: Codepunkt-Folgen (`\u06xx`) in Code außerhalb der Daten und Tests dürfen keine solche 4-Wort-Folge ergeben.
 *
 * Aufruf: node _gemeinde/werkzeuge/religion-pruefung.mjs   (Ausgang 1 bei Befund; Ausgabe ohne arabische Schrift)
 * Als Modul (Unit-Test `web/tests/unit/lernapp/religion-waechter.test.ts`): normalisiere, woerter, baueIndex, ladeIndex,
 * vierGrammTreffer, pruefeDatei.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const ARABISCH = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFE]/u;

/** Erlaubte Orte mit Begründung; `waechter`: nur zusammen mit dem 4-Gramm-Abgleich (KERN 4.0 §3). */
export const ERLAUBT = [
  [/^web\/daten\//, 'importierte, gepinnte Quelldateien'],
  [/^web\/tests\//, 'Testdaten (nur Codepunkt-Proben und Ausschnitte aus web/daten)'],
  [/^web\/src\/lib\/elifbe\/alphabet\.ts$/, 'Alphabet aus Codepunkten'],
  [/^web\/messages\/bereiche\/anzeige\.json$/, 'Namen der Gebetszeiten (Vorlauf, geprüft)'],
  [/^web\/messages\/verwaltung\/styleguide\.json$/, 'Schriftprobe Alphabet (Abjad-Reihe)'],
  [/^web\/messages\/lernapp\/ar\.json$/, 'Lern-App: arabische Oberfläche (ADR 0037, ADR 0040 Nr. 6)', { waechter: true }],
  [
    /^web\/inhalte\/lernapp\/(sprache|uebersetzung|aussprache)\//,
    'Lern-App: Hocharabisch der Sprachkurse, Übersetzungen der Richtungen mit Arabisch, Aussprache (ADR 0040 Nr. 6)',
    { waechter: true },
  ],
  [/\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp3|m4a|ogg|webm)$/i, 'Binärdatei'],
];

/** Nie erlaubt, auch wenn ein Muster oben sie träfe (KERN 4.0 §3): Wissen, Koran-Pfad, Komponenten, Werkstatt. */
export const NIE = [
  [/^web\/inhalte\/lernapp\/(islam|koran)\//, 'Wissenskurs und Koran-Arabisch: Arabisch nur über Verweise auf web/daten'],
  [/^web\/src\/components\//, 'Komponenten: Texte nur aus Nachrichtendateien'],
  [/^_lernapp\//, 'Werkstatt der Lern-App: arabische Wörter nur in Umschrift'],
];

// Normalisierung (gleich für Korpus und geprüfte Zeile)
const UNSICHTBAR = /[\u061C\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;
/**
 * Harakat (auch Hamza über/unter und Madda, die die Zerlegung abtrennt), hohes Hamza, Koranzeichen (U+06D6–U+06ED),
 * Tatweel, hochgestelltes Alif, erweiterte Zeichen.
 */
const ZEICHEN = /[\u0610-\u061A\u064B-\u065F\u0670\u0674\u06D6-\u06ED\u0640\u08D3-\u08FF]/g;
const ALIF = /[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g;
const NICHT_BUCHSTABE = /[^\u0621-\u063A\u0641-\u064A\u0671-\u06D3]+/g;

/**
 * Normalisierte Form: Zerlegung (NFKD, auch Präsentationsformen und Ligaturen), ohne Harakat und Tatweel, Alif-Formen und
 * Alif wasla = Alif, Hamza-Träger = Grundbuchstabe, Ta marbuta = Ha, Alif maqsura = Ya.
 */
export function normalisiere(text) {
  return String(text)
    .normalize('NFKD')
    .replace(UNSICHTBAR, '')
    .replace(ZEICHEN, '')
    .replace(ALIF, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0649\u06CC]/g, '\u064A')
    .replace(/\u06A9/g, '\u0643');
}

/** Wörter der normalisierten Form (nur arabische Buchstaben). */
export function woerter(text) {
  return normalisiere(text).replace(NICHT_BUCHSTABE, ' ').trim().split(' ').filter(Boolean);
}

/**
 * Schreibvarianten eines Worts im Uthmani-Text: (a) Zeichen entfernt, (b) hochgestelltes Alif als Alif, Waw mit Alif als
 * Alif, kleines Waw/Ya als Buchstabe – so trifft auch die vereinfachte Schreibung (z. B. mit Alif statt hochgestelltem Alif).
 */
export function koranVarianten(roh) {
  const a = woerter(roh).join('');
  const b = woerter(
    String(roh)
      .normalize('NFKD')
      .replace(/\u0648\u0670/g, '\u0627')
      .replace(/([\u0649\u064A])\u0670/g, '$1')
      .replace(/\u0640?\u0670/g, '\u0627')
      .replace(/\u06E5/g, '\u0648')
      .replace(/[\u06E6\u06E7]/g, '\u064A'),
  ).join('');
  return [...new Set([a, b])].filter(Boolean);
}

/** 53-Bit-Prüfsumme (cyrb53) eines 4-Gramms: schneller und kleiner als die Zeichenfolge selbst. */
function pruefsumme(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** Alle 4-Gramme einer Wortfolge; je Position eine Liste von Varianten (Kombinationen höchstens 2^4). */
function trageEin(ziel, folge, stelle) {
  for (let i = 0; i + 4 <= folge.length; i++) {
    for (const w0 of folge[i])
      for (const w1 of folge[i + 1])
        for (const w2 of folge[i + 2]) for (const w3 of folge[i + 3]) ziel.set(pruefsumme(`${w0} ${w1} ${w2} ${w3}`), stelle[i]);
  }
}

/**
 * Index aus Tanzil-XML (Uthmani) und Bukhari-JSON: 4-Gramme über die Verse einer Sure hinweg bzw. innerhalb eines
 * Hadiths. Wert ist die Fundstelle (Sure:Vers bzw. Hadith-Nummer) für die Meldung – ohne arabischen Text.
 */
export function baueIndex({ tanzilXml, bukhariJson }) {
  const koran = new Map();
  for (const sure of tanzilXml.matchAll(/<sura index="(\d+)"[^>]*>([\s\S]*?)<\/sura>/g)) {
    const folge = [];
    const stelle = [];
    for (const aya of sure[2].matchAll(/<aya index="(\d+)" text="([^"]*)"/g)) {
      for (const roh of aya[2].split(/\s+/)) {
        const varianten = koranVarianten(roh);
        if (!varianten.length) continue;
        folge.push(varianten);
        stelle.push(`Sure ${sure[1]}:${aya[1]}`);
      }
    }
    trageEin(koran, folge, stelle);
  }
  const hadith = new Map();
  const daten = typeof bukhariJson === 'string' ? JSON.parse(bukhariJson) : bukhariJson;
  for (const h of daten.hadiths ?? []) {
    const w = woerter(h.text ?? '');
    trageEin(
      hadith,
      w.map((x) => [x]),
      w.map(() => `Bukhari ${h.hadithnumber}`),
    );
  }
  return { koran, hadith };
}

/** Index aus `web/daten` des Repositorys (einmal je Lauf). */
export function ladeIndex(wurzel = WURZEL) {
  return baueIndex({
    tanzilXml: readFileSync(join(wurzel, 'web/daten/tanzil/quran-uthmani.xml'), 'utf8'),
    bukhariJson: readFileSync(join(wurzel, 'web/daten/hadith/ara-bukhari.json'), 'utf8'),
  });
}

/** Erster Treffer einer Folge aus 4 Wörtern im Koran- bzw. Hadith-Index, sonst null. */
export function vierGrammTreffer(text, index) {
  const w = woerter(text);
  for (let i = 0; i + 4 <= w.length; i++) {
    const s = pruefsumme(`${w[i]} ${w[i + 1]} ${w[i + 2]} ${w[i + 3]}`);
    if (index.koran.has(s)) return { korpus: 'koran', stelle: index.koran.get(s) };
    if (index.hadith.has(s)) return { korpus: 'hadith', stelle: index.hadith.get(s) };
  }
  return null;
}

/** Codepunkt-Folgen (`\u0627`, `\u{627}`) auflösen, damit sie den Wächter nicht umgehen. */
export function loeseCodepunkte(zeile) {
  return zeile
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/**
 * Prüft eine Datei (Pfad relativ zur Wurzel). `holeIndex` liefert den Index erst bei Bedarf. Ergebnis: Befunde als Text
 * ohne arabische Schrift (`pfad:zeile: Grund`).
 */
export function pruefeDatei(pfad, inhalt, holeIndex) {
  const nie = NIE.find(([m]) => m.test(pfad));
  const erlaubt = nie ? undefined : ERLAUBT.find(([m]) => m.test(pfad));
  if (erlaubt && !erlaubt[2]?.waechter) return [];
  const befunde = [];
  inhalt.split('\n').forEach((zeile, i) => {
    const ort = `${pfad}:${i + 1}`;
    const roh = ARABISCH.test(zeile);
    if (roh && !erlaubt) {
      befunde.push(`${ort}: arabische Schrift${nie ? ` (nie erlaubt: ${nie[1]})` : ''}`);
      return;
    }
    const geloest = zeile.includes('\\u') ? loeseCodepunkte(zeile) : zeile;
    if (!roh && geloest === zeile) return;
    if (!ARABISCH.test(geloest)) return;
    const treffer = vierGrammTreffer(geloest, holeIndex());
    if (treffer) befunde.push(`${ort}: ${treffer.korpus === 'koran' ? 'Koran' : 'Hadith'}-4-Gramm (${treffer.stelle})`);
  });
  return befunde;
}

function hauptprogramm() {
  const beginn = Date.now();
  const dateien = execFileSync('git', ['ls-files'], { cwd: WURZEL, encoding: 'utf8' }).split('\n').filter(Boolean);
  let index = null;
  const holeIndex = () => (index ??= ladeIndex());
  const befunde = [];
  let waechterDateien = 0;
  for (const datei of dateien) {
    if (/\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp3|m4a|ogg|webm|onnx|wasm|lpa)$/i.test(datei)) continue;
    if (/^web\/(daten|tests)\//.test(datei)) continue;
    let inhalt;
    try {
      inhalt = readFileSync(join(WURZEL, datei), 'utf8');
    } catch {
      continue;
    }
    if (ERLAUBT.find(([m]) => m.test(datei))?.[2]?.waechter && !NIE.some(([m]) => m.test(datei))) waechterDateien++;
    befunde.push(...pruefeDatei(datei, inhalt, holeIndex));
  }
  const dauer = ((Date.now() - beginn) / 1000).toFixed(1);
  if (befunde.length) {
    console.error(`Religion-Prüfung ROT: arabische Schrift außerhalb erlaubter Orte bzw. Koran-/Hadith-Wortlaut (${befunde.length}):`);
    for (const b of befunde.slice(0, 50)) console.error(`  ${b}`);
    console.error('Arabisch nur aus web/daten/** oder als \\u-Codepunkt in Code; Ausnahme nur mit Begründung in ERLAUBT.');
    console.error('Lern-App: kein Koran- oder Hadith-Wortlaut (4 Wörter) in Oberfläche und Sprachkursen (KERN 4.0 §3).');
    process.exit(1);
  }
  console.log(
    `Religion-Prüfung grün: ${dateien.length} Dateien, arabische Schrift nur an erlaubten Orten; Wächter über ${waechterDateien} Lern-App-Dateien` +
      `${index ? ` (Index Koran ${index.koran.size}, Hadith ${index.hadith.size} 4-Gramme)` : ''}, ${dauer} s.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) hauptprogramm();
