import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

/**
 * Schnappschuss der Bau-Datenbank für die Vorführung mit Testzugang (ADR 0052): das Datenverzeichnis von PGlite, jede
 * Datei einzeln gzip-gepackt unter `daten/<pfad>.gz`, dazu `inhalt.json` mit allen Ordnern (auch leeren – PostgreSQL
 * erwartet sie) und Dateien. Einzeln gepackt, damit beim Entpacken nie mehr als eine Datei im Arbeitsspeicher liegt.
 * Reine Dateiarbeit ohne Datenbank (`tests/unit/vorfuehrung.test.ts`).
 */
export type SchnappschussInhalt = { verzeichnisse: string[]; dateien: string[] };

export const INHALT_DATEI = 'inhalt.json';
export const DATEN_ORDNER = 'daten';

/** Nur Pfade innerhalb des Ziels: relativ, ohne `..`. */
function geprueft(rel: string): string {
  if (!rel || rel.startsWith('/') || rel.split('/').some((teil) => teil === '..' || teil === '')) {
    throw new Error('Schnappschuss: ungültiger Pfad.');
  }
  return rel;
}

/** Packt ein Datenverzeichnis in den Ordner `ziel` (vorher geleert). */
export function packeSchnappschuss(quelle: string, ziel: string): SchnappschussInhalt {
  const inhalt: SchnappschussInhalt = { verzeichnisse: [], dateien: [] };
  rmSync(ziel, { recursive: true, force: true });
  const geh = (rel: string) => {
    for (const name of readdirSync(join(quelle, rel)).sort()) {
      const kind = rel ? `${rel}/${name}` : name;
      if (statSync(join(quelle, kind)).isDirectory()) {
        inhalt.verzeichnisse.push(kind);
        geh(kind);
      } else {
        const datei = join(ziel, DATEN_ORDNER, `${kind}.gz`);
        mkdirSync(dirname(datei), { recursive: true });
        writeFileSync(datei, gzipSync(readFileSync(join(quelle, kind))));
        inhalt.dateien.push(kind);
      }
    }
  };
  geh('');
  mkdirSync(ziel, { recursive: true });
  writeFileSync(join(ziel, INHALT_DATEI), JSON.stringify(inhalt));
  return inhalt;
}

/** Entpackt einen Schnappschuss nach `ziel` und gibt die Zahl der Dateien zurück. */
export function entpackeSchnappschuss(quelle: string, ziel: string): number {
  const inhalt = JSON.parse(readFileSync(join(quelle, INHALT_DATEI), 'utf8')) as SchnappschussInhalt;
  mkdirSync(ziel, { recursive: true });
  for (const v of inhalt.verzeichnisse) mkdirSync(join(ziel, geprueft(v)), { recursive: true });
  for (const d of inhalt.dateien) {
    const datei = join(ziel, geprueft(d));
    mkdirSync(dirname(datei), { recursive: true });
    writeFileSync(datei, gunzipSync(readFileSync(join(quelle, DATEN_ORDNER, `${d}.gz`))));
  }
  return inhalt.dateien.length;
}
