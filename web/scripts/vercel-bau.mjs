// Bau auf Vercel (ADR 0019). Mit DATABASE_URL: Migration unter Sperre, dann `next build` gegen die Datenbank der
// Umgebung – die vorgerenderten Seiten zeigen sofort die echten Inhalte. Ohne DATABASE_URL: Bau gegen eine
// PGlite-Bau-Datenbank mit Beispielinhalten (ADR 0017), mit Warnung im Bauprotokoll.
// Aufruf: pnpm vercel-build (Vercel ruft das Skript automatisch auf).
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const wurzel = join(import.meta.dirname, '..');
const lauf = (befehl, argumente, env = process.env) => execFileSync(befehl, argumente, { cwd: wurzel, env, stdio: 'inherit' });

if (process.env.DATABASE_URL) {
  console.log(`[bau] Datenbank vorhanden (${process.env.VERCEL_ENV ?? 'lokal'}): Migration unter Sperre, dann Bau.`);
  lauf('node', ['scripts/migriere-mit-sperre.mjs']);
  lauf('pnpm', ['exec', 'next', 'build']);
} else {
  console.warn('[bau] WARNUNG: DATABASE_URL fehlt – Bau mit Beispielinhalten aus einer PGlite-Bau-Datenbank (ADR 0017).');
  console.warn('[bau] Ohne Datenbank laufen Formulare, Verwaltung und Anmeldung nicht. Runbook: docs/deploy/VERCEL.md.');
  lauf('pnpm', ['db:bau-vorbereiten']);
  lauf('pnpm', ['exec', 'next', 'build'], {
    ...process.env,
    BAU_PGLITE: '1',
    PGLITE_VERZEICHNIS: join(wurzel, '.pglite-bau'),
    DATABASE_URL: '',
  });
}
