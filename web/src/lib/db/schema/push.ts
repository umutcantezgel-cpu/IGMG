import { index, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { bytea } from './typen';

/**
 * Web-Push-Abos (ADR Web Push): nur nach Opt-in je Person, Endpoint verschlüsselt (Eindeutigkeit über HMAC),
 * Themen und Gebete einzeln wählbar; inaktive Abos werden nach 12 Monaten gelöscht.
 */
export const pushAbo = pgTable(
  'push_abo',
  {
    id: uuid().primaryKey().defaultRandom(),
    benutzerId: text().references(() => user.id, { onDelete: 'cascade' }),
    endpointVerschluesselt: bytea().notNull(),
    schluesselId: smallint().notNull(),
    endpointHmac: text().notNull().unique(),
    p256dh: text().notNull(),
    auth: text().notNull(),
    sprache: text().notNull().default('de'),
    themen: text().array().notNull().default([]),
    gebete: text().array().notNull().default([]),
    minutenVorher: smallint().notNull().default(10),
    einwilligungVersion: text().notNull(),
    letzterErfolg: timestamp({ withTimezone: true }),
    fehlerZaehler: smallint().notNull().default(0),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('push_abo_benutzer_idx').on(t.benutzerId)],
);

/** Einmal-Schlüssel gegen Doppelversand (Takt idempotent, ADR Web Push). */
export const pushVersand = pgTable('push_versand', {
  schluessel: text().primaryKey(),
  gesendetAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
