// Arbeitsliste der Sprachausgabe (PLAN §6.8 Schritt 1, ADR 0039 Nr. 6.1): je fehlendem Clip einer Zielsprache eine Zeile
// JSONL { textHash, text, stimme, sprache, einheit, schluessel, art, woerter } für `_lernapp/werkzeuge/tts/erzeuge.py`.
// Nie vertont: Religionsbezug, Wissenskurs, Koran-Arabisch-Pfad, Wächter-Treffer (src/lib/lernapp/audio/liste.ts).
// tr und ar haben keine freigegebene Stimme („Audio folgt“, L3-E10a): Die Liste bleibt leer.
// Aufruf: pnpm lernapp:audio-liste <de|tr|ar> [--aus <liste.jsonl>] [--manifest <pfad>] [--testkurs] [--inhalte <wurzel>]
//   --aus        Datei statt Standardausgabe
//   --manifest   bisheriges Manifest (Standard: inhalte/lernapp/audio-manifest/<sprache>.json, falls vorhanden)
//   --testkurs   nur der Testkurs (drizzle/seeds/lernapp-test.ts) – Probelauf, nie Produktion
//   --inhalte    andere Inhaltswurzel (Ordner mit sprache/…), z. B. ein Entwurfsstand im Scratchpad
// Die Zusammenfassung (nur Zahlen) geht auf stderr.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { testkursQuellen } from '../../drizzle/seeds/lernapp-test';
import { alsJsonl, audioListe } from '../../src/lib/lernapp/audio/liste';
import { leseManifest } from '../../src/lib/lernapp/audio/manifest';
import { ImportFehler } from '../../src/lib/lernapp/inhalt/import';
import { ladeWaechter } from '../../src/lib/lernapp/inhalt/religion';
import { istSprache } from '../../src/lib/lernapp/kurse';
import { INHALT_WURZEL, inhaltsdateien } from './inhaltsdateien';

const WEB = join(import.meta.dirname, '..', '..');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    aus: { type: 'string' },
    manifest: { type: 'string' },
    testkurs: { type: 'boolean', default: false },
    inhalte: { type: 'string' },
  },
});

function main(): number {
  const sprache = positionals[0];
  if (!istSprache(sprache)) {
    console.error('Aufruf: pnpm lernapp:audio-liste <de|tr|ar> [--aus <datei>] [--manifest <pfad>] [--testkurs] [--inhalte <wurzel>]');
    return 2;
  }
  const quellen = values.testkurs ? testkursQuellen() : inhaltsdateien(values.inhalte ?? INHALT_WURZEL, ['sprache']);
  const manifestPfad = values.manifest ?? join(INHALT_WURZEL, 'audio-manifest', `${sprache}.json`);
  const manifest = existsSync(manifestPfad) ? leseManifest(readFileSync(manifestPfad, 'utf8')) : null;
  const liste = audioListe(quellen, sprache, { waechter: ladeWaechter(join(WEB, 'daten')), manifest });
  if (!liste) {
    if (values.aus) writeFileSync(values.aus, '');
    console.error(`lernapp:audio-liste ${sprache}: keine freigegebene Stimme – „Audio folgt“ (L3-E10a), Liste leer.`);
    return 0;
  }
  const jsonl = alsJsonl(liste.zeilen);
  if (values.aus) writeFileSync(values.aus, jsonl);
  else process.stdout.write(jsonl);
  const zaehle = (g: string) => liste.ausgeschlossen.filter((a) => a.grund === g).length;
  console.error(
    `lernapp:audio-liste ${sprache}: ${quellen.length} Dateien, ${liste.vertonbar} vertonbare Texte, ${liste.zeilen.length} fehlen ` +
      `(${liste.zeilen.filter((z) => z.art === 'satz').length} Sätze, ${liste.zeilen.filter((z) => z.art === 'lemma').length} Lemmata); ` +
      `ausgeschlossen: ${zaehle('religionsbezug')} Religionsbezug, ${zaehle('gesperrt')} gesperrt, ${zaehle('waechter')} Wächter.`,
  );
  return 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(e instanceof ImportFehler ? e.message : e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
