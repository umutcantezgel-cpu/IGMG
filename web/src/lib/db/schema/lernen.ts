import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { eingang } from './eingaenge';
import { kurs } from './inhalte';
import { bytea, type Mehrsprachig } from './typen';

export const lernendeStatusEnum = pgEnum('lernende_status', ['aktiv', 'pausiert', 'beendet']);

/**
 * Lernende der Moscheekurse (Lernplattform). Name, Geburtsdatum und Adresse nur verschlüsselt (G-07);
 * im Klartext nur Anzeigename (Vorname + Initial) und der Tag des 16. Geburtstags für die Einwilligungslogik (Art. 8).
 */
export const lernende = pgTable(
  'lernende',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Eigenes Konto des Kindes oder der/des Jugendlichen (optional). */
    benutzerId: text()
      .unique()
      .references(() => user.id, { onDelete: 'set null' }),
    datenVerschluesselt: bytea().notNull(),
    schluesselId: smallint().notNull(),
    anzeigename: text().notNull(),
    sechzehnAm: date({ mode: 'string' }),
    /** Herkunft: angenommene Voranmeldung. */
    eingangId: uuid().references(() => eingang.id, { onDelete: 'set null' }),
    status: lernendeStatusEnum().notNull().default('aktiv'),
    aufgenommenAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    aufgenommenVon: text(),
    loeschenAb: timestamp({ withTimezone: true }),
  },
  (t) => [index('lernende_status_idx').on(t.status)],
);

/** Eltern ↔ Kind. Eltern sehen nur ihr eigenes Kind (Gruppenrechte). */
export const elternKind = pgTable(
  'eltern_kind',
  {
    elternId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    lernendeId: uuid()
      .notNull()
      .references(() => lernende.id, { onDelete: 'cascade' }),
    sorgeberechtigt: boolean().notNull().default(true),
    bestaetigtAm: timestamp({ withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.elternId, t.lernendeId] }), index('eltern_kind_lernende_idx').on(t.lernendeId)],
);

export const chatModusEnum = pgEnum('gruppe_chat_modus', ['aus', 'nur_lehrkraft', 'offen']);
export const gruppeStatusEnum = pgEnum('gruppe_status', ['aktiv', 'archiviert']);

/** Lerngruppe je Kurs und Schuljahr. Chat nur mit mindestens zwei erwachsenen Leitungspersonen aktiv (S-02). */
export const gruppe = pgTable('gruppe', {
  id: uuid().primaryKey().defaultRandom(),
  kursId: uuid().references(() => kurs.id, { onDelete: 'set null' }),
  name: jsonb().$type<Mehrsprachig>().notNull(),
  schuljahr: text(),
  beginn: date({ mode: 'string' }),
  ende: date({ mode: 'string' }),
  ort: text(),
  /** Wochentage (0 = Sonntag) und Uhrzeit „HH:MM“ der Terminserie. */
  wochentage: smallint().array().notNull().default([]),
  uhrzeitVon: text(),
  uhrzeitBis: text(),
  chatModus: chatModusEnum().notNull().default('aus'),
  /** Mindestalter für den Gruppenchat (S-04). */
  chatMindestalter: smallint().notNull().default(10),
  /** Öffnungszeiten des Chats, außerhalb nur lesen (S-06). */
  chatVon: text().notNull().default('08:00'),
  chatBis: text().notNull().default('20:00'),
  status: gruppeStatusEnum().notNull().default('aktiv'),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  aktualisiertAm: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const leitungRolleEnum = pgEnum('gruppen_leitung_rolle', ['lehrkraft', 'aufsicht']);

export const gruppenLeitung = pgTable(
  'gruppen_leitung',
  {
    gruppeId: uuid()
      .notNull()
      .references(() => gruppe.id, { onDelete: 'cascade' }),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    rolle: leitungRolleEnum().notNull().default('lehrkraft'),
  },
  (t) => [primaryKey({ columns: [t.gruppeId, t.benutzerId] }), index('gruppen_leitung_benutzer_idx').on(t.benutzerId)],
);

export const gruppenMitglied = pgTable(
  'gruppen_mitglied',
  {
    gruppeId: uuid()
      .notNull()
      .references(() => gruppe.id, { onDelete: 'cascade' }),
    lernendeId: uuid()
      .notNull()
      .references(() => lernende.id, { onDelete: 'cascade' }),
    seit: date({ mode: 'string' }).notNull().defaultNow(),
    bis: date({ mode: 'string' }),
  },
  (t) => [primaryKey({ columns: [t.gruppeId, t.lernendeId] }), index('gruppen_mitglied_lernende_idx').on(t.lernendeId)],
);

export const unterrichtstermin = pgTable(
  'unterrichtstermin',
  {
    id: uuid().primaryKey().defaultRandom(),
    gruppeId: uuid()
      .notNull()
      .references(() => gruppe.id, { onDelete: 'cascade' }),
    datum: date({ mode: 'string' }).notNull(),
    beginn: text(),
    ende: text(),
    ausgefallen: boolean().notNull().default(false),
    thema: text(),
  },
  (t) => [
    unique('unterrichtstermin_eindeutig').on(t.gruppeId, t.datum, t.beginn).nullsNotDistinct(),
    index('unterrichtstermin_datum_idx').on(t.datum),
  ],
);

export const anwesenheitStatusEnum = pgEnum('anwesenheit_status', ['anwesend', 'fehlt', 'entschuldigt', 'verspaetet']);

export const anwesenheit = pgTable(
  'anwesenheit',
  {
    terminId: uuid()
      .notNull()
      .references(() => unterrichtstermin.id, { onDelete: 'cascade' }),
    lernendeId: uuid()
      .notNull()
      .references(() => lernende.id, { onDelete: 'cascade' }),
    status: anwesenheitStatusEnum().notNull(),
    notizVerschluesselt: bytea(),
    schluesselId: smallint(),
    erfasstVon: text(),
    erfasstAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.terminId, t.lernendeId] }), index('anwesenheit_lernende_idx').on(t.lernendeId)],
);

export const fehlmeldungGrundEnum = pgEnum('fehlmeldung_grund', ['krank', 'familie', 'schule', 'sonstiges']);

/** Fehlmeldung der Eltern; belegt die Anwesenheitserfassung vor („entschuldigt“). */
export const fehlmeldung = pgTable(
  'fehlmeldung',
  {
    id: uuid().primaryKey().defaultRandom(),
    lernendeId: uuid()
      .notNull()
      .references(() => lernende.id, { onDelete: 'cascade' }),
    datum: date({ mode: 'string' }).notNull(),
    grund: fehlmeldungGrundEnum().notNull().default('sonstiges'),
    erstelltVon: text().references(() => user.id, { onDelete: 'set null' }),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('fehlmeldung_lernende_datum_idx').on(t.lernendeId, t.datum)],
);

export const kursartEnum = pgEnum('kursart', ['elifbe', 'kuran', 'tecvid', 'ilmihal', 'hifz']);

/** Stufen eines Lehrplans (z. B. Elifbe Stufe 4). Texte verfasst die Lehrkraft (religiöse Freigabe, wo nötig). */
export const lehrplanStufe = pgTable(
  'lehrplan_stufe',
  {
    id: uuid().primaryKey().defaultRandom(),
    kursart: kursartEnum().notNull(),
    reihenfolge: smallint().notNull(),
    titel: jsonb().$type<Mehrsprachig>().notNull(),
    beschreibung: jsonb().$type<Mehrsprachig>(),
  },
  (t) => [unique('lehrplan_stufe_eindeutig').on(t.kursart, t.reihenfolge)],
);

export const fortschrittStatusEnum = pgEnum('fortschritt_status', ['begonnen', 'sicher', 'abgeschlossen']);

export const lernfortschritt = pgTable(
  'lernfortschritt',
  {
    lernendeId: uuid()
      .notNull()
      .references(() => lernende.id, { onDelete: 'cascade' }),
    stufeId: uuid()
      .notNull()
      .references(() => lehrplanStufe.id, { onDelete: 'cascade' }),
    status: fortschrittStatusEnum().notNull(),
    datum: date({ mode: 'string' }).notNull().defaultNow(),
    lehrkraftId: text().references(() => user.id, { onDelete: 'set null' }),
  },
  (t) => [primaryKey({ columns: [t.lernendeId, t.stufeId] })],
);

/** Hifz (Auswendiglernen): geprüfte Abschnitte mit Bewertung 1–5. */
export const hifzEintrag = pgTable(
  'hifz_eintrag',
  {
    id: uuid().primaryKey().defaultRandom(),
    lernendeId: uuid()
      .notNull()
      .references(() => lernende.id, { onDelete: 'cascade' }),
    sure: smallint().notNull(),
    vonVers: smallint().notNull(),
    bisVers: smallint().notNull(),
    bewertung: smallint(),
    datum: date({ mode: 'string' }).notNull().defaultNow(),
    lehrkraftId: text().references(() => user.id, { onDelete: 'set null' }),
  },
  (t) => [index('hifz_lernende_idx').on(t.lernendeId)],
);

export type AufgabeBezug = { art: 'quran'; sure: number; von: number; bis: number } | { art: 'elifbe'; lektion: string } | { art: 'frei' };

/** Hausaufgaben je Gruppe (Kür K-B), optional mit Bezug zum Koran-Leser oder einer Elifbe-Lektion. */
export const aufgabe = pgTable(
  'aufgabe',
  {
    id: uuid().primaryKey().defaultRandom(),
    gruppeId: uuid()
      .notNull()
      .references(() => gruppe.id, { onDelete: 'cascade' }),
    titel: text().notNull(),
    beschreibung: text(),
    faellig: date({ mode: 'string' }),
    bezug: jsonb().$type<AufgabeBezug>().notNull().default({ art: 'frei' }),
    erstelltVon: text().references(() => user.id, { onDelete: 'set null' }),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('aufgabe_gruppe_idx').on(t.gruppeId)],
);

export const aufgabeErledigt = pgTable(
  'aufgabe_erledigt',
  {
    aufgabeId: uuid()
      .notNull()
      .references(() => aufgabe.id, { onDelete: 'cascade' }),
    lernendeId: uuid()
      .notNull()
      .references(() => lernende.id, { onDelete: 'cascade' }),
    erledigtAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.aufgabeId, t.lernendeId] })],
);

/** Urkunden mit öffentlichem Prüfcode (Kür K-B). */
export const urkunde = pgTable('urkunde', {
  id: uuid().primaryKey().defaultRandom(),
  lernendeId: uuid()
    .notNull()
    .references(() => lernende.id, { onDelete: 'cascade' }),
  art: text().notNull(),
  titel: jsonb().$type<Mehrsprachig>().notNull(),
  pruefcode: text().notNull().unique(),
  ausgestelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  ausgestelltVon: text(),
  anzahl: integer().notNull().default(1),
});
