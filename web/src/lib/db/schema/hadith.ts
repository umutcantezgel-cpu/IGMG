import { boolean, index, integer, jsonb, pgTable, primaryKey, smallint, text, timestamp } from 'drizzle-orm/pg-core';
import { freigabeSpalten, tsvector, type Mehrsprachig } from './typen';

/**
 * Hadith-Sammlungen (Sahih al-Bukhari). Arabischer Text unverändert aus der gepinnten Quelle;
 * Übersetzungen nur mit geklärter Lizenz oder vom Imam verfasst und religiös freigegeben.
 * Die Gesamtsammlung ist öffentlich erst nach Rechtsfreigabe (`freigegeben`, Schalter `hadith_gesamt`).
 */
export const hadithSammlung = pgTable('hadith_sammlung', {
  id: text().primaryKey(),
  name: jsonb().$type<Mehrsprachig>().notNull(),
  nameAr: text(),
  quelle: text().notNull(),
  url: text().notNull(),
  version: text().notNull(),
  lizenz: text().notNull(),
  sha256: text().notNull(),
  importiertAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  freigegeben: boolean().notNull().default(false),
});

export const hadithBuch = pgTable(
  'hadith_buch',
  {
    sammlungId: text()
      .notNull()
      .references(() => hadithSammlung.id, { onDelete: 'cascade' }),
    nr: smallint().notNull(),
    titelAr: text(),
    /** Titel in de/tr/en: verfasst und freigegeben (religiöse Freigabe), sonst nur Nummer. */
    titel: jsonb().$type<Mehrsprachig>(),
    hadithVon: integer(),
    hadithBis: integer(),
  },
  (t) => [primaryKey({ columns: [t.sammlungId, t.nr] })],
);

export const hadith = pgTable(
  'hadith',
  {
    sammlungId: text()
      .notNull()
      .references(() => hadithSammlung.id, { onDelete: 'cascade' }),
    /** Nummer der Quelle als Text (Bezug „Sahih al-Bukhari n“; Unternummern wie „402.2“). */
    nummer: text().notNull(),
    /** Sortierwert: Nummer × 10 (402.2 → 4022). */
    sortierung: integer().notNull(),
    arabischeNummer: text(),
    buchNr: smallint().notNull(),
    imBuchNr: integer(),
    textAr: text().notNull(),
    /** Ohne Harakat und Tatweel für die Suche (berechnet beim Import). */
    textNormalisiert: text().notNull(),
    bewertung: text(),
    bewertetVon: text(),
    suche: tsvector(),
  },
  (t) => [
    primaryKey({ columns: [t.sammlungId, t.nummer] }),
    index('hadith_buch_idx').on(t.sammlungId, t.buchNr, t.sortierung),
    index('hadith_suche_idx').using('gin', t.suche),
  ],
);

export const hadithUebersetzung = pgTable(
  'hadith_uebersetzung',
  {
    sammlungId: text().notNull(),
    nummer: text().notNull(),
    sprache: text().notNull(),
    text: text().notNull(),
    uebersetzer: text().notNull(),
    quelle: text().notNull(),
    lizenz: text().notNull(),
    ...freigabeSpalten(),
  },
  (t) => [primaryKey({ columns: [t.sammlungId, t.nummer, t.sprache] })],
);

/** Kuratierte Listen (z. B. „auswahl“, „des-tages“): nur Verweise, Reihenfolge fest. */
export const hadithAuswahl = pgTable(
  'hadith_auswahl',
  {
    liste: text().notNull(),
    sammlungId: text().notNull(),
    nummer: text().notNull(),
    reihenfolge: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.liste, t.sammlungId, t.nummer] })],
);
