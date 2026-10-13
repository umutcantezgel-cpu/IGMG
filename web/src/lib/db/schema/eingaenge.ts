import { index, integer, pgEnum, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { bytea } from './typen';

export const eingangArtEnum = pgEnum('eingang_art', [
  'kontakt',
  'veranstaltungsanmeldung',
  'voranmeldung',
  'mitgliedsantrag',
  'moschee_anfrage',
]);
export const eingangStatusEnum = pgEnum('eingang_status', ['neu', 'in_bearbeitung', 'erledigt', 'abgelehnt']);

/**
 * Eingänge der öffentlichen Formulare (ADR 0005). Formulardaten AES-256-GCM-verschlüsselt;
 * im Klartext nur Art, Status, Sprache, Bezug und Zeitpunkte.
 */
export const eingang = pgTable(
  'eingang',
  {
    id: uuid().primaryKey().defaultRandom(),
    art: eingangArtEnum().notNull(),
    status: eingangStatusEnum().notNull().default('neu'),
    sprache: text().notNull().default('de'),
    /** z. B. Veranstaltung bei Anmeldungen, Kurs bei Voranmeldungen */
    bezugId: uuid(),
    /** Personenzahl bei Veranstaltungsanmeldungen (Platzzählung ohne Entschlüsseln) */
    anzahl: integer().notNull().default(1),
    datenVerschluesselt: bytea().notNull(),
    schluesselId: smallint().notNull(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    erledigtAm: timestamp({ withTimezone: true }),
    loeschenAb: timestamp({ withTimezone: true }),
    bearbeitetVon: text(),
    /** QR-Einlass bei Veranstaltungen (Kür): nur Hash des Einlasscodes, Zeitpunkt des Einlasses. */
    checkinHash: text().unique(),
    eingechecktAm: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('eingang_art_status_idx').on(t.art, t.status),
    index('eingang_bezug_idx').on(t.bezugId),
    index('eingang_loeschen_idx').on(t.loeschenAb),
  ],
);

/** Einwilligungsprotokoll: Zeitpunkt und Textversion (K-07). */
export const einwilligung = pgTable('einwilligung', {
  id: uuid().primaryKey().defaultRandom(),
  eingangId: uuid()
    .notNull()
    .references(() => eingang.id, { onDelete: 'cascade' }),
  textSchluessel: text().notNull(),
  textVersion: text().notNull(),
  sprache: text().notNull(),
  erteiltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Interne Vermerke zu einem Eingang (verschlüsselt, da sie Personenbezug haben können). */
export const eingangNotiz = pgTable('eingang_notiz', {
  id: uuid().primaryKey().defaultRandom(),
  eingangId: uuid()
    .notNull()
    .references(() => eingang.id, { onDelete: 'cascade' }),
  textVerschluesselt: bytea().notNull(),
  schluesselId: smallint().notNull(),
  autorId: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
