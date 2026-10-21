// E2E-Datenbank (E-019): `igmg_e2e` im selben PostgreSQL wie die Entwicklung, vor jedem Lauf frisch
// angelegt, migriert, geseedet und mit den Inhaltsdaten (Koran, Hadith) befüllt – Testkonten und Testtermine landen nie in der Entwicklungsdatenbank.
// Aufruf durch playwright.config.ts (webServer); einzeln: node scripts/e2e-datenbank.mjs
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

const wurzel = join(import.meta.dirname, '..');
if (existsSync(join(wurzel, '.env'))) process.loadEnvFile(join(wurzel, '.env'));

/** Adresse der E2E-Datenbank: E2E_DATABASE_URL oder DATABASE_URL mit Datenbankname igmg_e2e. */
function e2eAdresse() {
  if (process.env.E2E_DATABASE_URL) return process.env.E2E_DATABASE_URL;
  const basis = process.env.ENTWICKLUNG_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!basis) throw new Error('DATABASE_URL fehlt (.env) – E2E braucht PostgreSQL aus docker compose.');
  const url = new URL(basis);
  url.pathname = '/igmg_e2e';
  return url.toString();
}

async function main() {
  const ziel = new URL(e2eAdresse());
  const name = ziel.pathname.slice(1);
  if (!/^[a-z_][a-z0-9_]*_e2e$/.test(name)) throw new Error(`Unerwarteter E2E-Datenbankname: ${name}`);
  const verwaltung = new URL(ziel);
  verwaltung.pathname = '/postgres';
  const client = new pg.Client({ connectionString: verwaltung.toString() });
  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  await client.query(`CREATE DATABASE "${name}"`);
  await client.end();
  const env = { ...process.env, DATABASE_URL: ziel.toString() };
  execFileSync('pnpm', ['exec', 'drizzle-kit', 'migrate'], { cwd: wurzel, env, stdio: ['ignore', 'ignore', 'inherit'] });
  execFileSync('pnpm', ['exec', 'tsx', '--conditions=react-server', 'drizzle/seeds/index.ts'], {
    cwd: wurzel,
    env,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  // Koran, Tajwid, Übersetzungen und Bukhari aus web/daten (ADR 0025): ohne sie gibt es keine Koran- und Hadith-Seiten
  execFileSync('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/inhalte-import.ts'], {
    cwd: wurzel,
    env,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  // Lern-App: Inhalte und der Testkurs mit synthetischen Tönen (E2E der Lektion, ADR 0039 Nr. 11)
  // Optional (Probelauf der Audio-Kette, L3-05): lokales Manifest; die Bündel liefert die Route aus LERNAPP_AUDIO_LOKAL
  const lokal = process.env.E2E_AUDIO_MANIFEST ? ['--audio-manifest', process.env.E2E_AUDIO_MANIFEST] : [];
  execFileSync('pnpm', ['exec', 'tsx', '--conditions=react-server', 'scripts/lernapp/import.ts', '--testkurs', ...lokal], {
    cwd: wurzel,
    env,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  console.log(`E2E-Datenbank ${name} frisch angelegt, migriert, geseedet und mit Inhaltsdaten befüllt.`);
}

await main();
