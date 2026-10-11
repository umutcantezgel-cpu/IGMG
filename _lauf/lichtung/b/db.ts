import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema.ts';

export const client = new PGlite(process.env.PGLITE_DIR ?? './.pglite');
export const db = drizzle(client, { schema });
