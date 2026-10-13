import { boolean, index, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { lernende } from './lernen';
import { gemeindeRolleEnum } from './typen';

/**
 * Kontoarten in „Mein Bereich“ (ADR Kontoarten): Gemeinde, Eltern, Lehrkraft, Schüler.
 * Getrennt von `rolle_zuweisung` (Verwaltung); ein Konto kann beides haben.
 */
export const gemeindeRolle = pgTable(
  'gemeinde_rolle',
  {
    id: uuid().primaryKey().defaultRandom(),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    rolle: gemeindeRolleEnum().notNull(),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('gemeinde_rolle_eindeutig').on(t.benutzerId, t.rolle), index('gemeinde_rolle_benutzer_idx').on(t.benutzerId)],
);

/**
 * Profil eines Gemeinde-Kontos. Kinderkonten (< 16) haben keine echte E-Mail-Adresse,
 * sondern eine nie zustellbare `…@konto.invalid` (RFC 2606); der Mail-Ausgang weist sie ab.
 */
export const kontoProfil = pgTable('konto_profil', {
  benutzerId: text()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  sprache: text().notNull().default('de'),
  /** Anzeigename im Chat und in Listen: Vorname + Initial (S-14). */
  anzeigename: text().notNull(),
  istKind: boolean().notNull().default(false),
  /** Löschantrag (Art. 17 DSGVO): Konto wird nach Frist gelöscht. */
  loeschenAb: timestamp({ withTimezone: true }),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const einwilligungArtEnum = pgEnum('konto_einwilligung_art', [
  'lernplattform',
  'kinderkonto',
  'gruppenchat',
  'push_kind',
  'push',
  'newsletter',
  'personenfotos',
  'chat_regeln',
]);

/**
 * Einwilligungen mit Textversion (SHA-256 des Wortlauts), Zeitpunkt und erteilender Person.
 * Bei Kindern erteilt sie ein Elternteil (`erteiltVon`) für `lernendeId`; Widerruf wirkt sofort.
 */
export const kontoEinwilligung = pgTable(
  'konto_einwilligung',
  {
    id: uuid().primaryKey().defaultRandom(),
    benutzerId: text().references(() => user.id, { onDelete: 'cascade' }),
    lernendeId: uuid().references(() => lernende.id, { onDelete: 'cascade' }),
    art: einwilligungArtEnum().notNull(),
    textVersion: text().notNull(),
    sprache: text().notNull().default('de'),
    /** „Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.“ */
    einvernehmenBestaetigt: boolean().notNull().default(false),
    erteiltVon: text().references(() => user.id, { onDelete: 'set null' }),
    erteiltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    widerrufenAm: timestamp({ withTimezone: true }),
  },
  (t) => [index('konto_einwilligung_benutzer_idx').on(t.benutzerId), index('konto_einwilligung_lernende_idx').on(t.lernendeId, t.art)],
);
