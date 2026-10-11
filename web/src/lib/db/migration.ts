import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

/** Wendet die Migrationen aus drizzle/migrations an (Betrieb). Nutzt eine eigene, kurzlebige Verbindung. */
export async function migriere(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL fehlt (Migration beim Start).');
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: process.env.MIGRATIONEN_VERZEICHNIS ?? join(process.cwd(), 'drizzle', 'migrations') });
    console.warn('Datenbank-Migrationen angewendet.');
  } finally {
    await pool.end();
  }
}
