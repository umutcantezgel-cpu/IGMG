import { index, jsonb, pgEnum, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { freigabeStatusEnum, inhaltSpalten, organisationEnum, type Mehrsprachig } from './typen';

/**
 * CMS (ADR 0032): freie Seiten aus Blöcken, Revisionen für alle Inhaltsarten, Menüs, Weiterleitungen,
 * Freigaben (redaktionell/religiös) und signierte Vorschau-Links.
 */
export type SeitenSlug = { de: string; tr?: string; en?: string };

export const seite = pgTable(
  'seite',
  {
    ...inhaltSpalten(),
    /** Slugs je Sprache; eindeutig über die Spalten unten (Abfrage je Sprache). */
    slugDe: text().notNull().unique(),
    slugTr: text().unique(),
    slugEn: text().unique(),
    titel: jsonb().$type<Mehrsprachig>().notNull(),
    beschreibung: jsonb().$type<Mehrsprachig>(),
    /** Blöcke (Zod in src/lib/validierung/bloecke.ts); Vers-/Hadith-Blöcke nur als Verweis. */
    bloecke: jsonb().$type<unknown[]>().notNull().default([]),
    organisation: organisationEnum(),
    veroeffentlichenAm: timestamp({ withTimezone: true }),
  },
  (t) => [index('seite_status_idx').on(t.status, t.veroeffentlichenAm)],
);

/** Revision bei jedem Speichern (die letzten 30 je Inhalt bleiben). */
export const revision = pgTable(
  'revision',
  {
    id: uuid().primaryKey().defaultRandom(),
    inhaltTyp: text().notNull(),
    inhaltId: text().notNull(),
    inhalt: jsonb().notNull(),
    kommentar: text(),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('revision_inhalt_idx').on(t.inhaltTyp, t.inhaltId, t.erstelltAm)],
);

export type MenueEintrag = { titel: Mehrsprachig; ziel: string; kinder?: MenueEintrag[] };

/** Menüs (Kopf, Fuß, Mobil); ohne Eintrag gilt der Bestand aus navigation.ts. */
export const menue = pgTable('menue', {
  schluessel: text().primaryKey(),
  eintraege: jsonb().$type<MenueEintrag[]>().notNull(),
  aktualisiertAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  aktualisiertVon: text(),
});

/** Dauerhafte Weiterleitungen alter Adressen (ADR 0002). */
export const weiterleitung = pgTable('weiterleitung', {
  id: uuid().primaryKey().defaultRandom(),
  von: text().notNull().unique(),
  nach: text().notNull(),
  code: smallint().notNull().default(308),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const freigabeArtEnum = pgEnum('freigabe_art', ['redaktion', 'religioes']);

/** Freigabe-Verlauf je Inhalt (wer hat wann geprüft, mit Kommentar). */
export const freigabe = pgTable(
  'freigabe',
  {
    id: uuid().primaryKey().defaultRandom(),
    inhaltTyp: text().notNull(),
    inhaltId: text().notNull(),
    art: freigabeArtEnum().notNull(),
    status: freigabeStatusEnum().notNull(),
    von: text(),
    am: timestamp({ withTimezone: true }).notNull().defaultNow(),
    kommentar: text(),
  },
  (t) => [index('freigabe_inhalt_idx').on(t.inhaltTyp, t.inhaltId, t.am), index('freigabe_offen_idx').on(t.status, t.art)],
);

/** Signierter Vorschau-Link (Token nur als Hash). */
export const vorschauToken = pgTable('vorschau_token', {
  tokenHash: text().primaryKey(),
  inhaltTyp: text().notNull(),
  inhaltId: text().notNull(),
  laeuftAb: timestamp({ withTimezone: true }).notNull(),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
