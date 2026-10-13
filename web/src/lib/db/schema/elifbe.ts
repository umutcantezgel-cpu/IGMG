import { index, integer, jsonb, pgEnum, pgTable, primaryKey, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { lernende } from './lernen';
import { medium } from './medien';
import { freigabeSpalten, type Mehrsprachig, type MehrsprachigRich } from './typen';

/**
 * Elifbe (Lesen der arabischen Schrift). Buchstaben und Silben entstehen aus Unicode-Codepunkten;
 * Lektionstexte verfasst und gibt die Lehrkraft frei; Audio nur mit Vereinbarung (Sprecher*in).
 */
export const elifbeLektion = pgTable('elifbe_lektion', {
  id: uuid().primaryKey().defaultRandom(),
  nr: smallint().notNull().unique(),
  slug: text().notNull().unique(),
  titel: jsonb().$type<Mehrsprachig>().notNull(),
  ziel: jsonb().$type<Mehrsprachig>(),
  inhalt: jsonb().$type<MehrsprachigRich>(),
  /** Codepunkte der neuen Buchstaben/Zeichen als Hex („0628“). */
  buchstaben: text().array().notNull().default([]),
  ...freigabeSpalten(),
});

export const uebungArtEnum = pgEnum('elifbe_uebung_art', ['erkennen', 'zuordnen', 'hoeren', 'lesen', 'nachspuren']);

export const elifbeUebung = pgTable(
  'elifbe_uebung',
  {
    id: uuid().primaryKey().defaultRandom(),
    lektionId: uuid()
      .notNull()
      .references(() => elifbeLektion.id, { onDelete: 'cascade' }),
    art: uebungArtEnum().notNull(),
    /** Daten je Art (Zod-Schema in src/lib/elifbe/uebungen.ts); nur Codepunkte oder Verweise auf quran_wort. */
    daten: jsonb().notNull(),
    reihenfolge: smallint().notNull().default(0),
  },
  (t) => [index('elifbe_uebung_lektion_idx').on(t.lektionId, t.reihenfolge)],
);

/** Beispielwörter: nur Verweise auf Stellen im Koran (nie getippter Text). */
export const elifbeBeispielwort = pgTable(
  'elifbe_beispielwort',
  {
    buchstabe: text().notNull(),
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    pos: smallint().notNull(),
  },
  (t) => [primaryKey({ columns: [t.buchstabe, t.sure, t.vers, t.pos] })],
);

/** Aussprache-Audio (z. B. `buchstabe:0628`, `silbe:0628-064E`). */
export const elifbeAudio = pgTable('elifbe_audio', {
  schluessel: text().primaryKey(),
  mediumId: uuid()
    .notNull()
    .references(() => medium.id, { onDelete: 'restrict' }),
  sprecher: text().notNull(),
  vereinbarungMediumId: uuid().references(() => medium.id, { onDelete: 'restrict' }),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Fortschritt angemeldeter Lernender (sonst nur lokal im Browser). */
export const elifbeFortschritt = pgTable(
  'elifbe_fortschritt',
  {
    id: uuid().primaryKey().defaultRandom(),
    lernendeId: uuid().references(() => lernende.id, { onDelete: 'cascade' }),
    benutzerId: text().references(() => user.id, { onDelete: 'cascade' }),
    uebungId: uuid()
      .notNull()
      .references(() => elifbeUebung.id, { onDelete: 'cascade' }),
    ergebnis: integer().notNull(),
    am: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('elifbe_fortschritt_benutzer_idx').on(t.benutzerId), index('elifbe_fortschritt_lernende_idx').on(t.lernendeId)],
);
