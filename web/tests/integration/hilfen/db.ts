import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { join } from 'node:path';
import * as schema from '@/lib/db/schema';

/** Frische In-Memory-Datenbank mit allen Migrationen (T3: jede Testdatei hat ihre eigene). */
export async function testDatenbank() {
  const client = new PGlite();
  const db = drizzle(client, { schema, casing: 'snake_case' });
  await migrate(db, { migrationsFolder: join(import.meta.dirname, '../../../drizzle/migrations') });
  return { client, db };
}
