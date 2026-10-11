import { integer, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

/** Quran-Daten (ADR 0009): nur über das Import-Skript aus einer freigegebenen Quelle. */
export const quranQuelle = pgTable('quran_quelle', {
  id: text().primaryKey(),
  bezeichnung: text().notNull(),
  url: text().notNull(),
  version: text().notNull(),
  sha256: text().notNull(),
  lizenz: text().notNull(),
  importiertAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const quranSure = pgTable('quran_sure', {
  nr: integer().primaryKey(),
  nameAr: text().notNull(),
  name: jsonb().$type<{ de?: string; tr?: string; en?: string }>(),
  verseAnzahl: integer().notNull(),
  quelleId: text()
    .notNull()
    .references(() => quranQuelle.id),
});

export type UebersetzungsVermerk = { text: string; quelle: string; lizenz: string };

export const quranVers = pgTable(
  'quran_vers',
  {
    sure: integer()
      .notNull()
      .references(() => quranSure.nr),
    vers: integer().notNull(),
    textAr: text().notNull(),
    uebersetzung: jsonb().$type<{ de?: UebersetzungsVermerk; tr?: UebersetzungsVermerk; en?: UebersetzungsVermerk }>(),
  },
  (t) => [primaryKey({ columns: [t.sure, t.vers] })],
);
