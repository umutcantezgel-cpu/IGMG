import { defineConfig } from 'drizzle-kit';

/** Migrationen (K-05): versioniert unter drizzle/migrations. PostgreSQL über DATABASE_URL, sonst PGlite. */
const url = process.env.DATABASE_URL;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle/migrations',
  casing: 'snake_case',
  strict: true,
  verbose: false,
  ...(url ? { dbCredentials: { url } } : { driver: 'pglite', dbCredentials: { url: process.env.PGLITE_VERZEICHNIS ?? '.pglite' } }),
});
