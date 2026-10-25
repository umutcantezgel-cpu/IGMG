// Import der Lern-App-Inhalte (PLAN §6.6, ADR 0041 Nr. 6): web/inhalte/lernapp/{sprache,uebersetzung}/**/*.json in die
// Datenbank, idempotent über SHA-256 je Datei und inhaltHash je Eintrag (src/lib/lernapp/inhalt/import.ts).
// Läuft im Bau nach scripts/inhalte-import.ts (vercel-bau.mjs mit Datenbank; bau-datenbank.mjs mit `--testkurs`) und von Hand.
// Danach die Audio-Manifeste web/inhalte/lernapp/audio-manifest/<sprache>.json nach lernapp_audio (abgeglichen: Clips, die
// nicht mehr im Manifest stehen, entfallen; src/lib/lernapp/audio/import.ts).
// Aufruf: pnpm lernapp:import [--erzwingen] [--testkurs] [--audio-manifest <pfad>]…
//   --testkurs: zusätzlich den Testkurs (drizzle/seeds/lernapp-test.ts) und die Testeinheit des Wissenskurses mit Testfreigaben
//     (drizzle/seeds/lernapp-test-wissen.ts) – nur Beispielmodus, E2E und Entwicklung.
//   --audio-manifest: zusätzlich ein lokales Manifest (Probelauf der Audio-Kette, Bündel unter LERNAPP_AUDIO_LOKAL), nur
//     ergänzend – nie in der Produktion.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { lernappTestkurs } from '../../drizzle/seeds/lernapp-test';
import { lernappTestWissen } from '../../drizzle/seeds/lernapp-test-wissen';
import { holeDb } from '../../src/lib/db';
import { AudioImportFehler, importiereAudioManifest, religionsHashes } from '../../src/lib/lernapp/audio/import';
import { leseManifest } from '../../src/lib/lernapp/audio/manifest';
import { ImportFehler, importiereLernapp } from '../../src/lib/lernapp/inhalt/import';
import { INHALT_WURZEL, inhaltsdateien } from './inhaltsdateien';

const { values } = parseArgs({
  options: {
    erzwingen: { type: 'boolean', default: false },
    testkurs: { type: 'boolean', default: false },
    'audio-manifest': { type: 'string', multiple: true },
  },
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
    // Wissenskurs: Testeinheit mit Testfreigaben zweier Prüfkonten (Vorführpfad Station 6); in der Produktion verweigert
    const w = await lernappTestWissen(db);
    console.log(
      w
        ? `Lern-App-Testeinheit Wissen: ${w.lektionen} Lektionen, ${w.freigaben} Testfreigaben (nur Platzhalter).`
        : 'Lern-App-Testeinheit Wissen: in der Produktion nicht angelegt.',
    );
  }
  // Audio: eingecheckte Manifeste (abgeglichen), dann lokale Manifeste (nur ergänzend)
  const ordner = join(INHALT_WURZEL, 'audio-manifest');
  const manifeste = [
    ...(existsSync(ordner) ? readdirSync(ordner).filter((d) => /^(?:de|tr|ar)\.json$/.test(d)) : []).map((d) => ({
      pfad: join(ordner, d),
      abgleichen: true,
    })),
    ...(values['audio-manifest'] ?? []).map((pfad) => ({ pfad, abgleichen: false })),
  ];
  for (const { pfad, abgleichen } of manifeste) {
    const m = leseManifest(readFileSync(pfad, 'utf8'));
    const b = await importiereAudioManifest(db, m, { abgleichen, verboten: religionsHashes(quellen, m.sprache) });
    console.log(
      `Lern-App-Audio ${b.sprache}${abgleichen ? '' : ' (lokal, ergänzend)'}: ${b.neu} neu, ${b.geaendert} geändert, ${b.gleich} gleich, ${b.entfernt} entfernt.`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof ImportFehler || e instanceof AudioImportFehler ? e.message : e instanceof Error ? e.message : e);
    process.exit(1);
  });
