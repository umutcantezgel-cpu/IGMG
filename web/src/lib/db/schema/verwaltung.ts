import { boolean, index, pgEnum, pgTable, primaryKey, serial, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { bytea, organisationEnum } from './typen';

/** Internes Postfach (Verwaltung › Nachrichten). */
export const unterhaltung = pgTable('unterhaltung', {
  id: uuid().primaryKey().defaultRandom(),
  betreff: text().notNull(),
  erstelltVon: text().references(() => user.id, { onDelete: 'set null' }),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  letzteNachrichtAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const unterhaltungTeilnehmer = pgTable(
  'unterhaltung_teilnehmer',
  {
    unterhaltungId: uuid()
      .notNull()
      .references(() => unterhaltung.id, { onDelete: 'cascade' }),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gelesenBis: timestamp({ withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.unterhaltungId, t.benutzerId] })],
);

export const postfachNachricht = pgTable(
  'postfach_nachricht',
  {
    id: uuid().primaryKey().defaultRandom(),
    unterhaltungId: uuid()
      .notNull()
      .references(() => unterhaltung.id, { onDelete: 'cascade' }),
    absenderId: text().references(() => user.id, { onDelete: 'set null' }),
    text: text().notNull(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('postfach_unterhaltung_idx').on(t.unterhaltungId, t.erstelltAm)],
);

export const ticketPrioritaetEnum = pgEnum('ticket_prioritaet', ['niedrig', 'mittel', 'hoch', 'dringend']);
export const ticketStatusEnum = pgEnum('ticket_status', ['offen', 'in_bearbeitung', 'geloest', 'geschlossen']);
export const meldungTypEnum = pgEnum('meldung_typ', ['beschwerde', 'wunsch', 'vorschlag', 'information', 'intern']);

/**
 * Tickets (Meldungen, Verwaltung). Angaben zur meldenden Person (Name, Telefon, Rückmeldewunsch)
 * stehen verschlüsselt in `melderVerschluesselt` (G-07).
 */
export const ticket = pgTable(
  'ticket',
  {
    id: uuid().primaryKey().defaultRandom(),
    nummer: serial().notNull().unique(),
    titel: text().notNull(),
    beschreibung: text().notNull(),
    typ: meldungTypEnum().notNull().default('intern'),
    kategorie: text(),
    organisation: organisationEnum(),
    prioritaet: ticketPrioritaetEnum().notNull().default('mittel'),
    status: ticketStatusEnum().notNull().default('offen'),
    melderVerschluesselt: bytea(),
    schluesselId: smallint(),
    erstelltVon: text().references(() => user.id, { onDelete: 'set null' }),
    zugewiesenAn: text().references(() => user.id, { onDelete: 'set null' }),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    aktualisiertAm: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    geschlossenAm: timestamp({ withTimezone: true }),
  },
  (t) => [index('ticket_status_idx').on(t.status, t.prioritaet)],
);

export const ticketKommentar = pgTable('ticket_kommentar', {
  id: uuid().primaryKey().defaultRandom(),
  ticketId: uuid()
    .notNull()
    .references(() => ticket.id, { onDelete: 'cascade' }),
  autorId: text().references(() => user.id, { onDelete: 'set null' }),
  text: text().notNull(),
  intern: boolean().notNull().default(true),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
