#!/usr/bin/env node
/**
 * Religion-Prüfung (KERN 3.0, ADR 0030): Arabische Schrift darf im Repository nur in importierten, gepinnten Dateien
 * (`web/daten/**`) und in ausdrücklich erlaubten Dateien stehen (Alphabet aus Codepunkten, Gebetsnamen der Anzeige,
 * Tests). Alles andere ist Rot – so kann kein Agent Verse, Hadithe oder Bittgebete „aus dem Gedächtnis“ einschleusen.
 *
 * Aufruf: node _gemeinde/werkzeuge/religion-pruefung.mjs   (Ausgang 1 bei Befund)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '../..');
const ARABISCH = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻾]/u;

/** Erlaubte Orte mit Begründung. */
const ERLAUBT = [
  [/^web\/daten\//, 'importierte, gepinnte Quelldateien'],
  [/^web\/tests\//, 'Testdaten (nur Codepunkt-Proben und Ausschnitte aus web/daten)'],
  [/^web\/src\/lib\/elifbe\/alphabet\.ts$/, 'Alphabet aus Codepunkten'],
  [/^web\/messages\/bereiche\/anzeige\.json$/, 'Namen der Gebetszeiten (Vorlauf, geprüft)'],
  [/^web\/messages\/verwaltung\/styleguide\.json$/, 'Schriftprobe Alphabet (Abjad-Reihe)'],
  [/\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp3|m4a|ogg|webm)$/i, 'Binärdatei'],
];

const dateien = execFileSync('git', ['ls-files'], { cwd: wurzel, encoding: 'utf8' }).split('\n').filter(Boolean);
const befunde = [];
for (const datei of dateien) {
  if (ERLAUBT.some(([muster]) => muster.test(datei))) continue;
  let inhalt;
  try {
    inhalt = readFileSync(join(wurzel, datei), 'utf8');
  } catch {
    continue;
  }
  const zeilen = inhalt.split('\n');
  zeilen.forEach((zeile, i) => {
    if (ARABISCH.test(zeile)) befunde.push(`${datei}:${i + 1}`);
  });
}

if (befunde.length) {
  console.error(`Religion-Prüfung ROT: arabische Schrift außerhalb erlaubter Orte (${befunde.length}):`);
  for (const b of befunde.slice(0, 50)) console.error(`  ${b}`);
  console.error('Arabisch nur aus web/daten/** oder als \\u-Codepunkt in Code; Ausnahme nur mit Begründung in ERLAUBT.');
  process.exit(1);
}
console.log(`Religion-Prüfung grün: ${dateien.length} Dateien, arabische Schrift nur an erlaubten Orten.`);
