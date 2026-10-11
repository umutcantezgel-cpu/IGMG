import 'server-only';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * Datenbankzugang (K-05, ADR 0001, ADR 0017): PostgreSQL über `pg` (Betrieb, docker compose).
 * PGlite nur in Entwicklung/Tests ohne DATABASE_URL und beim Image-Bau (BAU_PGLITE=1, ADR 0017).
 * Die Verbindung entsteht erst beim ersten Zugriff (Import allein verbindet nicht – wichtig für `next build`).
 * Alle Zugriffe laufen über Drizzle mit Parametern (K-13, S8).
 */
export type Datenbank = NodePgDatabase<typeof schema>;
/** Offene Transaktion (`db.transaction(async (tx) => …)`) für Hilfsfunktionen, die im selben `tx` arbeiten. */
export type Transaktion = Parameters<Parameters<Datenbank['transaction']>[0]>[0];

const globalFuerDb = globalThis as unknown as { __igmgDb?: Datenbank; __igmgPool?: Pool };

function erzeuge(): Datenbank {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = globalFuerDb.__igmgPool ?? new Pool({ connectionString: url, max: 10 });
    globalFuerDb.__igmgPool = pool;
    return drizzlePg(pool, { schema, casing: 'snake_case' });
  }
  if (process.env.NODE_ENV === 'production' && process.env.BAU_PGLITE !== '1') {
    throw new Error('DATABASE_URL fehlt (Betrieb braucht PostgreSQL).');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require('@electric-sql/pglite') as typeof import('@electric-sql/pglite');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzleLite } = require('drizzle-orm/pglite') as typeof import('drizzle-orm/pglite');
  const client = new PGlite(process.env.PGLITE_VERZEICHNIS ?? '.pglite');
  return drizzleLite(client, { schema, casing: 'snake_case' }) as unknown as Datenbank;
}

export function holeDb(): Datenbank {
  return (globalFuerDb.__igmgDb ??= erzeuge());
}

/** Datenbank-Objekt; verbindet beim ersten Zugriff. */
export const db: Datenbank = new Proxy({} as Datenbank, {
  get(_ziel, eigenschaft) {
    const echt = holeDb();
    const wert = Reflect.get(echt, eigenschaft, echt) as unknown;
    return typeof wert === 'function' ? (wert as (...a: unknown[]) => unknown).bind(echt) : wert;
  },
});

export { schema };
