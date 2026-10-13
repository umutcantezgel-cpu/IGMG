import { sql } from 'drizzle-orm';
import { check, index, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { lernende } from './lernen';
import { gemeindeRolleEnum, organisationEnum, rolleEnum } from './typen';

/** Rollen je Konto (ADR 0003). Organisationsredaktion immer mit Organisation, alle anderen ohne. */
export const rolleZuweisung = pgTable(
  'rolle_zuweisung',
  {
    id: uuid().primaryKey().defaultRandom(),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    rolle: rolleEnum().notNull(),
    organisation: organisationEnum(),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('rolle_zuweisung_eindeutig').on(t.benutzerId, t.rolle, t.organisation).nullsNotDistinct(),
    index('rolle_zuweisung_benutzer_idx').on(t.benutzerId),
    check('rolle_zuweisung_organisation_passend', sql`(${t.rolle} = 'organisationsredaktion') = (${t.organisation} is not null)`),
  ],
);

export type EinladungRolle = { rolle: (typeof rolleEnum.enumValues)[number]; organisation?: (typeof organisationEnum.enumValues)[number] };
/** Kontoarten in „Mein Bereich“, die eine Einladung vergibt (Eltern, Lehrkraft, Schüler ≥ 16; ADR 0026). */
export type EinladungGemeindeRolle = (typeof gemeindeRolleEnum.enumValues)[number];

/** Einladungen: Konten entstehen nur so (K-06). Token nur als SHA-256-Hash gespeichert. */
export const einladung = pgTable(
  'einladung',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    name: text().notNull(),
    rollen: jsonb().$type<EinladungRolle[]>().notNull(),
    /** Gemeinde-Rollen (Mein Bereich); eine Einladung kann Verwaltungs- und Gemeinde-Rollen zugleich tragen. */
    gemeindeRollen: jsonb().$type<EinladungGemeindeRolle[]>().notNull().default([]),
    /**
     * Bezug auf Lernende (Aufnahme aus einer Voranmeldung, O-L01): Bei der Annahme entsteht für Eltern der
     * Eltern-Kind-Bezug, für Schüler ab 16 die Verknüpfung des eigenen Kontos mit dem Lerndatensatz.
     */
    lernendeId: uuid().references(() => lernende.id, { onDelete: 'cascade' }),
    tokenHash: text().notNull().unique(),
    laeuftAb: timestamp({ withTimezone: true }).notNull(),
    angenommenAm: timestamp({ withTimezone: true }),
    widerrufenAm: timestamp({ withTimezone: true }),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('einladung_email_idx').on(t.email)],
);
