import { index, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { bytea } from './typen';

/**
 * Web-Push-Abos (ADR 0034): nur nach Opt-in je Person, Endpoint verschlüsselt (Eindeutigkeit über HMAC),
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

/** Einmal-Schlüssel gegen Doppelversand (Takt idempotent, ADR 0034). */
export const pushVersand = pgTable('push_versand', {
  schluessel: text().primaryKey(),
  gesendetAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * Rückfall für Benachrichtigungen (ADR 0034 Nr. 6): tägliche Zusammenfassung per E-Mail ohne Inhalte und ohne Namen –
 * nur Bereich und Anzahl. Auf Wunsch je Konto und Thema (Ankündigung, Chat und Elternkanal, Unterricht); nie für
 * Kinderkonten. `seit` ist der Zählbeginn (Einschalten bzw. letzter Versand), `letzterVersand` begrenzt auf eine Mail je
 * Tag (Berliner Zeit). Abschalten löscht die Zeile; das Löschen des Kontos ebenso (Kaskade).
 */
export const mailZusammenfassung = pgTable('mail_zusammenfassung', {
  benutzerId: text()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  themen: text().array().notNull().default([]),
  seit: timestamp({ withTimezone: true }).notNull().defaultNow(),
  letzterVersand: timestamp({ withTimezone: true }),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
