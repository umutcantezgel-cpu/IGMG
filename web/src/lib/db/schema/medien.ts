import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { Mehrsprachig } from './typen';

/** Medien (ADR 0007): Datei im Speicher-Adapter, Alt-Text Pflicht (K-10). */
export const medium = pgTable('medium', {
  id: uuid().primaryKey().defaultRandom(),
  schluessel: text().notNull().unique(),
  typ: text().notNull(),
  groesse: integer().notNull(),
  breite: integer(),
  hoehe: integer(),
  alt: jsonb().$type<Mehrsprachig>().notNull(),
  bildrechte: text(),
  dateiname: text(),
  imPapierkorbSeit: timestamp({ withTimezone: true }),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
