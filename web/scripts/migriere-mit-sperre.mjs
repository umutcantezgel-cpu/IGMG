// Wendet die Migrationen aus drizzle/migrations unter einer Postgres-Sperre an (ADR 0019): Laufen zwei Bauläufe
// gleichzeitig gegen dieselbe Datenbank, wartet der zweite und findet danach nichts mehr zu tun.
// Aufruf: node scripts/migriere-mit-sperre.mjs (braucht DATABASE_URL, bevorzugt DATABASE_URL_UNPOOLED). Nutzt eine eigene,
// kurzlebige Verbindung.
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

/** Fester Schlüssel der Migrationssperre (beliebig, aber für alle Bauläufe gleich). */
const SPERRE = 4_242_017;

// Die Sperre ist eine Sitzungssperre (pg_advisory_lock): Sie braucht eine direkte Verbindung. Hinter einem Pooler im
// Transaktionsmodus (Neon „-pooler“) kann jede Anweisung auf einer anderen Serververbindung landen. Die Neon-Integration
// setzt dafür zusätzlich DATABASE_URL_UNPOOLED; sie hat Vorrang (H-V07/V10, ADR 0019).
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error('[migration] DATABASE_URL fehlt.');
  process.exit(1);
}
if (!process.env.DATABASE_URL_UNPOOLED && /-pooler\./.test(new URL(url).hostname)) {
  console.warn('[migration] WARNUNG: Nur eine Pooler-Adresse vorhanden. Für die Migrationssperre DATABASE_URL_UNPOOLED setzen.');
}
console.log(`[migration] Verbindung: ${process.env.DATABASE_URL_UNPOOLED ? 'direkt (DATABASE_URL_UNPOOLED)' : 'DATABASE_URL'}`);
const pool = new pg.Pool({ connectionString: url, max: 1 });
const verbindung = await pool.connect();
try {
  await verbindung.query('SELECT pg_advisory_lock($1)', [SPERRE]);
  const ordner = process.env.MIGRATIONEN_VERZEICHNIS ?? join(import.meta.dirname, '..', 'drizzle', 'migrations');
  await migrate(drizzle(verbindung), { migrationsFolder: ordner });
  console.log('[migration] Migrationen angewendet.');
} finally {
  await verbindung.query('SELECT pg_advisory_unlock($1)', [SPERRE]).catch(() => {});
  verbindung.release();
  await pool.end();
}
