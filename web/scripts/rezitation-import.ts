// Import eines lizenzierten Rezitationssatzes (H-Q06, ADR 0029, MN-03b): Audiodateien je Vers oder je Sure aus einem
// Manifest (JSON, Format in src/lib/audio/manifest.ts beschrieben), Lizenzdatei Pflicht, jede Datei mit SHA-256,
// optional Wortzeiten aus quran-align (cpfair/quran-align, Zeiten je Vers-Datei). Nur in eine Rezitation der Art
// „lizenziert“; setzt nie „aktiv“ – aktiviert wird nur in der Verwaltung mit hinterlegter Vereinbarung. Wiederholbar.
// Speicher wie die App (SPEICHER, MEDIEN_VERZEICHNIS bzw. AUDIO_BLOB_READ_WRITE_TOKEN); Datenbank aus DATABASE_URL.
//
// Aufruf (in web/):
//   pnpm exec tsx --conditions=react-server --env-file-if-exists=.env scripts/rezitation-import.ts \
//     --manifest /pfad/zum/satz/manifest.json [--trocken] [--ueberschreiben-geprueft]
// --trocken prüft nur (Manifest, Lizenzdatei, SHA-256, Suren/Verse, quran-align) und schreibt nichts.
// Danach bei aktiver Rezitation: POST /api/wartung/cache-erneuern (Player-Daten neu).
import { parseArgs } from 'node:util';
import { ImportFehler, importiereRezitation } from '../src/lib/audio/import';

const { values } = parseArgs({
  options: {
    manifest: { type: 'string' },
    trocken: { type: 'boolean', default: false },
    'ueberschreiben-geprueft': { type: 'boolean', default: false },
  },
});

if (!values.manifest) {
  console.error('Bitte --manifest <pfad/manifest.json> angeben.');
  process.exit(1);
}
const manifestPfad: string = values.manifest;

async function main() {
  try {
    const b = await importiereRezitation({
      manifestPfad,
      trocken: values.trocken,
      ueberschreibeGeprueft: values['ueberschreiben-geprueft'],
    });
    console.log(
      `${values.trocken ? '[trocken] ' : ''}Rezitation ${b.rezitation}${b.angelegt ? ' (neu, inaktiv)' : ''}: ` +
        `Dateien neu ${b.dateien.neu}, ersetzt ${b.dateien.ersetzt}, unverändert ${b.dateien.unveraendert}; ` +
        `Verszeiten ${b.verszeiten}; Wortzeiten ${b.wortzeiten} (ungeprüft).`,
    );
    for (const h of b.hinweise) console.log(`Hinweis: ${h}`);
    console.log('Aktivieren nur in der Verwaltung mit hinterlegter Vereinbarung (ADR 0029).');
    process.exit(0);
  } catch (e) {
    if (e instanceof ImportFehler) {
      console.error('Import abgebrochen, nichts geschrieben:');
      for (const f of e.fehler) console.error(`- ${f}`);
      process.exit(1);
    }
    throw e;
  }
}

void main();
