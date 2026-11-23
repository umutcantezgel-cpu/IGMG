// Bau auf Vercel (ADR 0019). Mit DATABASE_URL: Migration unter Sperre, dann `next build` gegen die Datenbank der
// Umgebung – die vorgerenderten Seiten zeigen sofort die echten Inhalte. Ohne DATABASE_URL: Bau gegen eine
// PGlite-Bau-Datenbank mit Beispielinhalten (ADR 0017), mit Warnung im Bauprotokoll.
// Aufruf: pnpm vercel-build (Vercel ruft das Skript automatisch auf).
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { erstbefuellungImBau } from './erstbefuellung-regel.mjs';

const wurzel = join(import.meta.dirname, '..');
const lauf = (befehl, argumente, env = process.env) => execFileSync(befehl, argumente, { cwd: wurzel, env, stdio: 'inherit' });
// Titel-Index der Suche (nur ohne Laufzeit-Datenbank, unten): kein alter Stand aus einem früheren Bau
rmSync(join(wurzel, '.suchindex.json'), { force: true });
// Sprechübung der Lern-App: Modelldateien prüfen, ORT-Dateien kopieren, Worker bündeln (ADR 0042 Fortschreibung S5 Nr. 5)
lauf('node', ['scripts/lernapp-modelle.mjs']);

if (process.env.DATABASE_URL) {
  console.log(`[bau] Datenbank vorhanden (${process.env.VERCEL_ENV ?? 'lokal'}): Migration unter Sperre, dann Bau.`);
  lauf('node', ['scripts/migriere-mit-sperre.mjs']);
  // Erstbefüllung (E-047, Nachtrag ADR 0019 vom 28.10.2026): nur im Production-Bau und nur auf Anforderung – Seeds einmalig
  // (Merker in `einstellung`), erstes Verwaltungskonto als Einladung mit Link im Bauprotokoll. Vor den Inhaltsständen,
  // wie in der Bau-Datenbank (scripts/bau-datenbank.mjs): erst Seeds, dann Inhaltsdaten.
  const erst = erstbefuellungImBau(process.env);
  for (const h of erst.hinweise) console.warn(`[bau] Erstbefüllung: ${h}`);
  if (erst.seed || erst.einladung || erst.fehler.length)
    lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/erstbefuellung.ts']);
  // Inhaltsdaten (ADR 0025): idempotent über SHA-256 – schreibt nur, wenn sich eine Quelldatei geändert hat
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/inhalte-import.ts']);
  // Lern-App-Inhalte (PLAN §6.6): idempotent über SHA-256 je Datei und inhaltHash je Eintrag; ohne Testkurs
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/lernapp/import.ts']);
  // Inhaltsstände (Nachtrag ADR 0019): nur Beispielinhalte (ist_beispiel = true) auf den Seed-Stand, fehlende Bereiche
  // anlegen; Redaktionelles bleibt. Idempotent (zweiter Lauf ändert nichts), Reihenfolge: erst 2026, dann Marktstart.
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/inhalte-2026.ts']);
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/inhalte-marktstart.ts']);
  lauf('pnpm', ['exec', 'next', 'build']);
} else {
  console.warn('[bau] WARNUNG: DATABASE_URL fehlt – Bau mit Beispielinhalten aus einer PGlite-Bau-Datenbank (ADR 0017).');
  console.warn('[bau] Vorführung mit Testzugang (ADR 0052): Verwaltung und „Mein Bereich“ laufen auf einem Schnappschuss der');
  console.warn('[bau] Bau-Datenbank; Änderungen bleiben nicht. Echter Betrieb: docs/deploy/VERCEL.md.');
  lauf('pnpm', ['db:bau-vorbereiten']);
  // VORFUEHRUNG=1 (ADR 0052): Vorführung mit Testzugang – next.config.ts schreibt das Kennzeichen fest in den Bau
  const bauDb = { ...process.env, BAU_PGLITE: '1', PGLITE_VERZEICHNIS: join(wurzel, '.pglite-bau'), DATABASE_URL: '', VORFUEHRUNG: '1' };
  // Testzugang (ADR 0052): Beispielkonten (Eltern, Lehrkraft, Kind samt Gruppe; ihr Passwort braucht niemand, zufällig je
  // Bau), das Verwaltungskonto und der Schnappschuss der Datenbank für die Laufzeit (.vorfuehrung/, vor dem Bau der Seiten)
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/beispielkonten.ts'], {
    ...bauDb,
    BEISPIEL_PASSWORT: randomBytes(24).toString('base64url'),
  });
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/vorfuehrung-vorbereiten.ts'], bauDb);
  // Suche ohne Datenbank: Titel und Hadith-Nummern aus der Bau-Datenbank (src/lib/suche/titelindex.ts)
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/suchindex.ts'], bauDb);
  try {
    lauf('pnpm', ['exec', 'next', 'build'], bauDb);
  } finally {
    // Kopien der Bau-Datenbank je Worker-Prozess (src/lib/db/index.ts) entfernen
    rmSync(join(tmpdir(), 'igmg-pglite-bau'), { recursive: true, force: true });
  }
}
