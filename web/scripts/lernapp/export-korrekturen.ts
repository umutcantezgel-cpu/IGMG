// Export offener Korrekturen für die Inhalts-Pipeline (L3-06b, ADR 0041 Nr. 4–6, PLAN §6.5/§6.6): je Kurs und Einheit die
// offenen Befunde der Prüfenden zum aktuellen Inhalts-Hash (Urteil, Kategorie, Korrektur, Kommentar, aktueller Text) und die
// menschlichen Korrekturen in der Datenbank (ergänzte Alternativen), die nach web/inhalte/lernapp/** zurückgeschrieben werden.
// Ohne Personendaten: keine Prüfenden, keine Verfasser, keine Meldungsantworten. Format: `igmg-lernapp-korrekturen/1`
// (src/server/queries/lernapp/korrekturen.ts). Liest DATABASE_URL aus web/.env (sonst PGlite der Entwicklung).
// Aufruf: pnpm lernapp:export-korrekturen [--kurs <de|tr|ar|islam|koran>] [--aus <datei>]   (ohne --aus: Standardausgabe)
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { istKurs } from '../../src/lib/lernapp/kurse';
import { baueKorrekturExport, ladeBefunde, ladeKorrigiert } from '../../src/server/queries/lernapp/korrekturen';

const { values } = parseArgs({ options: { kurs: { type: 'string' }, aus: { type: 'string' } } });

async function main() {
  if (values.kurs && !istKurs(values.kurs)) throw new Error(`Unbekannter Kurs: ${values.kurs}`);
  const o = values.kurs ? { kurs: values.kurs } : {};
  const [befunde, korrigiert] = await Promise.all([ladeBefunde(o), ladeKorrigiert(o)]);
  const json = `${JSON.stringify(baueKorrekturExport(befunde, korrigiert, new Date()), null, 2)}\n`;
  if (values.aus) {
    writeFileSync(values.aus, json);
    console.error(`Lern-App-Korrekturen: ${befunde.length} offene Befunde, ${korrigiert.length} menschliche Korrekturen → ${values.aus}`);
  } else process.stdout.write(json);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
