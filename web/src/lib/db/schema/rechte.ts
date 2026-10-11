import { sql } from 'drizzle-orm';
import { check, index, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { organisationEnum, rolleEnum } from './typen';

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

/** Einladungen: Konten entstehen nur so (K-06). Token nur als SHA-256-Hash gespeichert. */
export const einladung = pgTable(
  'einladung',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    name: text().notNull(),
    rollen: jsonb().$type<EinladungRolle[]>().notNull(),
    tokenHash: text().notNull().unique(),
    laeuftAb: timestamp({ withTimezone: true }).notNull(),
    angenommenAm: timestamp({ withTimezone: true }),
    widerrufenAm: timestamp({ withTimezone: true }),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('einladung_email_idx').on(t.email)],
);
