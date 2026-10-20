import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { Befunde } from './typen';

/**
 * Prüfer „Ausschlüsse“ über das Repository (PLAN §6.4, ADR 0045 Nr. 12–13; blockierend): keine OpenITI-Dateien oder
 * OpenITI-Markierungen und keine Daten aus dem Quranic Arabic Corpus unter `web/**`. Geprüft werden die versionierten
 * Dateien (`git ls-files`) ohne Binärdateien und ohne `web/tests/**` (dort stehen die Muster als Proben). Metadaten wie die
 * OpenITI-URI als Fundstelle in `web/daten/hanafi-quellen/QUELLE.md` bleiben erlaubt; Markierungen des Volltexts nicht.
 */

/** Muster aus Teilen, damit diese Datei sich nicht selbst meldet. */
const teile = (...x: string[]) => x.join('');
export const OPENITI_MARKEN = new RegExp(
  [teile('#'.repeat(6), 'OpenITI#'), teile('#META#', 'Header#End'), teile('\\bPage', 'V\\d{2}P\\d{3}\\b'), teile('#META#', '\\d')].join(
    '|',
  ),
);
export const QAC_MARKEN = new RegExp(
  [
    teile('corpus', '\\.quran\\.com'),
    teile('quranic-corpus', '-morphology'),
    teile('LOCATION\\t', 'FORM\\tTAG'),
    teile('^\\(\\d{1,3}:\\d{1,3}:\\d{1,3}:\\d{1,2}\\)', '\\t'),
  ].join('|'),
  'm',
);
/** Dateiname einer OpenITI-Textdatei, z. B. `0428Autor.Titel.Version-ara1` (optional mit Endung). */
export const OPENITI_DATEINAME = /^\d{4}[A-Z][A-Za-z]+\.[A-Z][A-Za-z]+\.[A-Za-z0-9]+-[a-z]{3}\d(?:\.[A-Za-z]+)?$/;

const BINAER = /\.(?:png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp3|m4a|ogg|webm|onnx|wasm|lpa|zip|gz|bz2)$/i;

/** Versionierte Dateien unter `web/` (relativ zu `web/`); ohne Git leer. */
export function versionierteDateien(web: string): string[] {
  try {
    return execFileSync('git', ['ls-files', '-z'], { cwd: web, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      .split('\0')
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function pruefeAusschluesse(web: string, dateien = versionierteDateien(web)): Befunde {
  const b = new Befunde('ausschluss');
  for (const d of dateien) {
    if (d.startsWith('tests/') || d.startsWith('node_modules/')) continue;
    const anzeige = `web/${d}`;
    if (OPENITI_DATEINAME.test(basename(d))) {
      b.blockierend(anzeige, 'OpenITI-Datei im Repository (CC BY-NC-SA, nur lokal, ADR 0045 Nr. 12)');
      continue;
    }
    if (BINAER.test(d)) continue;
    let text: string;
    try {
      const pfad = join(web, d);
      if (statSync(pfad).size > 32 * 1024 * 1024) continue;
      text = readFileSync(pfad, 'utf8');
    } catch {
      continue;
    }
    if (OPENITI_MARKEN.test(text)) b.blockierend(anzeige, 'OpenITI-Markierung (Volltext nie im Repository, ADR 0045 Nr. 12)');
    if (QAC_MARKEN.test(text)) b.blockierend(anzeige, 'Daten des Quranic Arabic Corpus (ADR 0045 Nr. 13)');
  }
  return b;
}
