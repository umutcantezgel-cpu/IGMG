// Bau auf Vercel (ADR 0019). Mit DATABASE_URL: Migration unter Sperre, dann `next build` gegen die Datenbank der
// Umgebung – die vorgerenderten Seiten zeigen sofort die echten Inhalte. Ohne DATABASE_URL: Bau gegen eine
// PGlite-Bau-Datenbank mit Beispielinhalten (ADR 0017), mit Warnung im Bauprotokoll.
// Aufruf: pnpm vercel-build (Vercel ruft das Skript automatisch auf).
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const wurzel = join(import.meta.dirname, '..');
const lauf = (befehl, argumente, env = process.env) => execFileSync(befehl, argumente, { cwd: wurzel, env, stdio: 'inherit' });
// Titel-Index der Suche (nur ohne Laufzeit-Datenbank, unten): kein alter Stand aus einem früheren Bau
rmSync(join(wurzel, '.suchindex.json'), { force: true });
// Sprechübung der Lern-App: Modelldateien prüfen, ORT-Dateien kopieren, Worker bündeln (ADR 0042 Fortschreibung S5 Nr. 5)
lauf('node', ['scripts/lernapp-modelle.mjs']);

if (process.env.DATABASE_URL) {
  console.log(`[bau] Datenbank vorhanden (${process.env.VERCEL_ENV ?? 'lokal'}): Migration unter Sperre, dann Bau.`);
  lauf('node', ['scripts/migriere-mit-sperre.mjs']);
  // Inhaltsdaten (ADR 0025): idempotent über SHA-256 – schreibt nur, wenn sich eine Quelldatei geändert hat
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/inhalte-import.ts']);
  // Lern-App-Inhalte (PLAN §6.6): idempotent über SHA-256 je Datei und inhaltHash je Eintrag; ohne Testkurs
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/lernapp/import.ts']);
  lauf('pnpm', ['exec', 'next', 'build']);
} else {
  console.warn('[bau] WARNUNG: DATABASE_URL fehlt – Bau mit Beispielinhalten aus einer PGlite-Bau-Datenbank (ADR 0017).');
  console.warn('[bau] Ohne Datenbank laufen Formulare, Verwaltung und Anmeldung nicht. Runbook: docs/deploy/VERCEL.md.');
  lauf('pnpm', ['db:bau-vorbereiten']);
  const bauDb = { ...process.env, BAU_PGLITE: '1', PGLITE_VERZEICHNIS: join(wurzel, '.pglite-bau'), DATABASE_URL: '' };
  // Suche ohne Datenbank: Titel und Hadith-Nummern aus der Bau-Datenbank (src/lib/suche/titelindex.ts)
  lauf('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/suchindex.ts'], bauDb);
  try {
    lauf('pnpm', ['exec', 'next', 'build'], bauDb);
  } finally {
    // Kopien der Bau-Datenbank je Worker-Prozess (src/lib/db/index.ts) entfernen
    rmSync(join(tmpdir(), 'igmg-pglite-bau'), { recursive: true, force: true });
  }
}
