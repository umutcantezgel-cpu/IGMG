import 'server-only';
import { attachDatabasePool } from '@vercel/functions';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { installiereFehlerKuerzung } from './fehler';
import * as schema from './schema';
import { datenbankVerfuegbar } from './verfuegbar';

/**
 * Datenbankzugang (K-05, ADR 0001, ADR 0017, ADR 0018): PostgreSQL über `pg` (Betrieb, docker compose, Vercel).
 * PGlite nur in Entwicklung/Tests ohne DATABASE_URL und beim Image-Bau (BAU_PGLITE=1, ADR 0017).
 * Die Verbindung entsteht erst beim ersten Zugriff (Import allein verbindet nicht – wichtig für `next build`).
 * Alle Zugriffe laufen über Drizzle mit Parametern (K-13, S8).
 */
export type Datenbank = NodePgDatabase<typeof schema>;
/** Offene Transaktion (`db.transaction(async (tx) => …)`) für Hilfsfunktionen, die im selben `tx` arbeiten. */
export type Transaktion = Parameters<Parameters<Datenbank['transaction']>[0]>[0];

const globalFuerDb = globalThis as unknown as { __igmgDb?: Datenbank; __igmgPool?: Pool };

function erzeuge(): Datenbank {
  // Fehlermeldungen ohne Parameter und Zeilenwerte ins Protokoll (V-10, fehler.ts)
  installiereFehlerKuerzung();
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = globalFuerDb.__igmgPool ?? neuerPool(url);
    globalFuerDb.__igmgPool = pool;
    return drizzlePg(pool, { schema, casing: 'snake_case' });
  }
  if (!datenbankVerfuegbar()) {
    throw new Error('DATABASE_URL fehlt (Betrieb braucht PostgreSQL).');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require('@electric-sql/pglite') as typeof import('@electric-sql/pglite');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzleLite } = require('drizzle-orm/pglite') as typeof import('drizzle-orm/pglite');
  const client = new PGlite(pgliteVerzeichnis());
  return drizzleLite(client, { schema, casing: 'snake_case' }) as unknown as Datenbank;
}

/**
 * Beim Bau ohne Datenbank (BAU_PGLITE=1, ADR 0017/0019) sammeln mehrere Worker-Prozesse gleichzeitig Seitendaten. PGlite
 * erlaubt je Datenverzeichnis nur einen Prozess; zwei gleichzeitige Öffner brechen mit „RuntimeError: Aborted()“ ab
 * (Vorschau 39c76b1). Deshalb öffnet jeder Bau-Prozess eine eigene Kopie der Bau-Datenbank – beim Bau wird nur gelesen.
 * Außerhalb des Baus (Entwicklung, Tests, lokaler Server) bleibt es beim gemeinsamen Verzeichnis.
 */
function pgliteVerzeichnis(): string {
  const quelle = process.env.PGLITE_VERZEICHNIS ?? '.pglite';
  if (process.env.BAU_PGLITE !== '1' || process.env.NEXT_PHASE !== 'phase-production-build') return quelle;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cpSync, mkdtempSync, rmSync } = require('node:fs') as typeof import('node:fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { join } = require('node:path') as typeof import('node:path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { tmpdir } = require('node:os') as typeof import('node:os');
  const ordner = mkdtempSync(join(/*turbopackIgnore: true*/ tmpdir(), 'igmg-pglite-bau-'));
  const ziel = join(/*turbopackIgnore: true*/ ordner, 'daten');
  cpSync(/*turbopackIgnore: true*/ quelle, ziel, { recursive: true });
  // Kopie mit dem Bau-Prozess entfernen
  process.once('exit', () => rmSync(/*turbopackIgnore: true*/ ordner, { recursive: true, force: true }));
  return ziel;
}

/**
 * Auf Vercel (Fluid compute, ADR 0018): kleiner Pool mit kurzer Leerlaufzeit, und `attachDatabasePool` schließt ruhende
 * Verbindungen, bevor Vercel die Instanz einfriert. Sonst (Docker, lokal) wie bisher.
 */
function neuerPool(url: string): Pool {
  if (process.env.VERCEL !== '1') return new Pool({ connectionString: url, max: 10 });
  const pool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 5_000 });
  attachDatabasePool(pool);
  return pool;
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
