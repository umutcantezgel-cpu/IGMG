import 'server-only';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * Datenbankzugang (K-05, ADR 0001): PostgreSQL über `pg` (Betrieb, docker compose).
 * Nur für Entwicklung ohne Docker: PGlite, wenn DATABASE_URL leer ist (eine Verbindung, kein Betrieb).
 * Alle Zugriffe laufen über Drizzle mit Parametern (K-13, S8).
 */
export type Datenbank = NodePgDatabase<typeof schema>;

const globalFuerDb = globalThis as unknown as { __igmgDb?: Datenbank; __igmgPool?: Pool };

function erzeuge(): Datenbank {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = globalFuerDb.__igmgPool ?? new Pool({ connectionString: url, max: 10 });
    globalFuerDb.__igmgPool = pool;
    return drizzlePg(pool, { schema, casing: 'snake_case' });
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL fehlt (Betrieb braucht PostgreSQL).');
  }
  // Entwicklungs-Rückfall: PGlite im Prozess (Typen sind kompatibel genug für die App-Schicht).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require('@electric-sql/pglite') as typeof import('@electric-sql/pglite');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzleLite } = require('drizzle-orm/pglite') as typeof import('drizzle-orm/pglite');
  const client = new PGlite(process.env.PGLITE_VERZEICHNIS ?? '.pglite');
  return drizzleLite(client, { schema, casing: 'snake_case' }) as unknown as Datenbank;
}

export const db: Datenbank = globalFuerDb.__igmgDb ?? (globalFuerDb.__igmgDb = erzeuge());
export { schema };
