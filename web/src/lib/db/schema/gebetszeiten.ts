import { date, integer, pgEnum, pgTable, text, time, timestamp, uuid } from 'drizzle-orm/pg-core';

export const gebetszeitQuelleEnum = pgEnum('gebetszeit_quelle', ['import', 'berechnet']);

/** Gebetszeiten je Tag als Ortszeit Europe/Berlin (ADR 0008). */
export const gebetszeitTag = pgTable('gebetszeit_tag', {
  datum: date({ mode: 'string' }).primaryKey(),
  imsak: time().notNull(),
  gunes: time().notNull(),
  ogle: time().notNull(),
  ikindi: time().notNull(),
  aksam: time().notNull(),
  yatsi: time().notNull(),
  quelle: gebetszeitQuelleEnum().notNull(),
  importId: uuid().references(() => gebetszeitImport.id, { onDelete: 'set null' }),
});

/** Protokoll der Tabellen-Importe. */
export const gebetszeitImport = pgTable('gebetszeit_import', {
  id: uuid().primaryKey().defaultRandom(),
  dateiname: text(),
  von: date({ mode: 'string' }).notNull(),
  bis: date({ mode: 'string' }).notNull(),
  zeilen: integer().notNull(),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
