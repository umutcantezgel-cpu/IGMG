// Import der Lern-App-Inhalte (PLAN §6.6, ADR 0041 Nr. 6): web/inhalte/lernapp/{sprache,uebersetzung}/**/*.json in die
// Datenbank, idempotent über SHA-256 je Datei und inhaltHash je Eintrag (src/lib/lernapp/inhalt/import.ts).
// Läuft im Bau nach scripts/inhalte-import.ts (vercel-bau.mjs mit Datenbank; bau-datenbank.mjs mit `--testkurs`) und von Hand.
// Aufruf: pnpm lernapp:import [--erzwingen] [--testkurs]
//   --testkurs: zusätzlich den Testkurs (drizzle/seeds/lernapp-test.ts) – nur Beispielmodus, E2E und Entwicklung.
import { parseArgs } from 'node:util';
import { lernappTestkurs } from '../../drizzle/seeds/lernapp-test';
import { holeDb } from '../../src/lib/db';
import { ImportFehler, importiereLernapp } from '../../src/lib/lernapp/inhalt/import';
import { inhaltsdateien } from './inhaltsdateien';

const { values } = parseArgs({
  options: { erzwingen: { type: 'boolean', default: false }, testkurs: { type: 'boolean', default: false } },
});
async function main() {
  const db = holeDb();
  const quellen = inhaltsdateien();
  const b = await importiereLernapp(db, quellen, { erzwingen: values.erzwingen });
  console.log(
    `Lern-App-Import: ${b.dateien} Dateien (${b.uebersprungen} unverändert übersprungen), ${b.neu} neu, ${b.geaendert} geändert, ` +
      `${b.unveraendert} gleich, ${b.gesperrt} gesperrt, ${b.konflikte.length} Konflikte; Kurse mit neuem Stand: ${b.kurse.join(', ') || '–'}.`,
  );
  for (const k of b.konflikte)
    console.log(`  Konflikt (menschlich geprüft, nicht überschrieben): ${k.tabelle} ${k.schluessel} aus ${k.datei}`);
  if (values.testkurs) {
    const t = await lernappTestkurs(db);
    console.log(
      `Lern-App-Testkurs: ${t.bericht.neu} neu, ${t.bericht.geaendert} geändert, ${t.bericht.unveraendert} gleich, ${t.clips} Clips (Testtöne).`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof ImportFehler ? e.message : e instanceof Error ? e.message : e);
    process.exit(1);
  });
