// Bereitet beim Image-Bau eine PGlite-Datenbank mit allen Migrationen, Seeds und Inhaltsdaten vor (ADR 0017, ADR 0025).
// Aufruf: pnpm db:bau-vorbereiten (setzt PGLITE_VERZEICHNIS=.pglite-bau)
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const wurzel = join(import.meta.dirname, '..');
const verzeichnis = join(wurzel, '.pglite-bau');
rmSync(verzeichnis, { recursive: true, force: true });
const env = { ...process.env, DATABASE_URL: '', PGLITE_VERZEICHNIS: verzeichnis, BAU_PGLITE: '1' };
execFileSync('pnpm', ['exec', 'drizzle-kit', 'migrate'], { cwd: wurzel, env, stdio: 'inherit' });
execFileSync('pnpm', ['exec', 'tsx', '--conditions=react-server', 'drizzle/seeds/index.ts'], { cwd: wurzel, env, stdio: 'inherit' });
// Inhaltsdaten (Koran, Übersetzungen, Hadith) aus web/daten (ADR 0025): Vorschau und Beispielmodus zeigen sie vollständig
execFileSync('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/inhalte-import.ts'], { cwd: wurzel, env, stdio: 'inherit' });
// Lern-App-Inhalte (PLAN §6.6) und im Beispielmodus auf Vercel (bzw. mit LERNAPP_TESTKURS=1) der Testkurs mit synthetischen
// Tönen (ADR 0039 Nr. 11): Der Bau ohne Datenbank liefert ihn aus. Docker-Bauten (ohne VERCEL) bekommen ihn nicht – dort
// liest die Laufzeit die echte Datenbank.
const testkurs = process.env.VERCEL === '1' || process.env.LERNAPP_TESTKURS === '1';
execFileSync('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/lernapp/import.ts', ...(testkurs ? ['--testkurs'] : [])], {
  cwd: wurzel,
  env,
  stdio: 'inherit',
});
console.log('Bau-Datenbank bereit:', verzeichnis);
