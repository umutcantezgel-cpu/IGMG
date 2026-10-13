import { date, index, integer, jsonb, pgEnum, pgTable, primaryKey, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { veranstaltung } from './inhalte';
import { medium } from './medien';
import { bytea, freigabeSpalten, inhaltStatusEnum, type Mehrsprachig, type MehrsprachigRich } from './typen';

/** Bildschirm-Anzeige im Gebetsraum: Folien mit Zeitplan (im Gebetsfenster ruht die Anzeige, B-25). */
export const anzeigeFolieArtEnum = pgEnum('anzeige_folie_art', ['text', 'bild', 'veranstaltung', 'vers', 'hadith', 'spende', 'hinweis']);

export const anzeigeFolie = pgTable(
  'anzeige_folie',
  {
    id: uuid().primaryKey().defaultRandom(),
    art: anzeigeFolieArtEnum().notNull(),
    /** Inhalt je Art; Vers/Hadith nur als Verweis auf freigegebene Daten. */
    inhalt: jsonb().notNull(),
    mediumId: uuid().references(() => medium.id, { onDelete: 'set null' }),
    von: timestamp({ withTimezone: true }),
    bis: timestamp({ withTimezone: true }),
    /** Wochentage (0 = Sonntag); leer = jeden Tag. */
    wochentage: smallint().array().notNull().default([]),
    reihenfolge: integer().notNull().default(0),
    status: inhaltStatusEnum().notNull().default('entwurf'),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('anzeige_folie_status_idx').on(t.status, t.reihenfolge)],
);

export const besondererTagArtEnum = pgEnum('besonderer_tag_art', [
  'kandil',
  'bayram',
  'ramadan_beginn',
  'ramadan_ende',
  'asure',
  'hicri_neujahr',
  'sonstiges',
]);
export const besondererTagQuelleEnum = pgEnum('besonderer_tag_quelle', ['berechnet', 'bestaetigt']);

/** Besondere Tage im islamischen Kalender: „vorläufig (berechnet)“, bis der Imam bestätigt. */
export const besondererTag = pgTable(
  'besonderer_tag',
  {
    id: uuid().primaryKey().defaultRandom(),
    art: besondererTagArtEnum().notNull(),
    datum: date({ mode: 'string' }).notNull(),
    titel: jsonb().$type<Mehrsprachig>().notNull(),
    beschreibung: jsonb().$type<MehrsprachigRich>(),
    quelle: besondererTagQuelleEnum().notNull().default('berechnet'),
    ...freigabeSpalten(),
  },
  (t) => [index('besonderer_tag_datum_idx').on(t.datum)],
);

export const hatimStatusEnum = pgEnum('hatim_status', ['offen', 'abgeschlossen', 'archiviert']);

/** Gemeinsame Hatim: 30 Cüz werden verteilt; öffentlich nur Zahlen und Ring (keine Namen). */
export const hatim = pgTable('hatim', {
  id: uuid().primaryKey().defaultRandom(),
  titel: jsonb().$type<Mehrsprachig>().notNull(),
  anlass: jsonb().$type<Mehrsprachig>(),
  beginn: date({ mode: 'string' }).notNull(),
  ziel: date({ mode: 'string' }),
  oeffentlich: inhaltStatusEnum().notNull().default('entwurf'),
  status: hatimStatusEnum().notNull().default('offen'),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const hatimTeil = pgTable(
  'hatim_teil',
  {
    hatimId: uuid()
      .notNull()
      .references(() => hatim.id, { onDelete: 'cascade' }),
    cuz: smallint().notNull(),
    benutzerId: text().references(() => user.id, { onDelete: 'set null' }),
    vergebenAm: timestamp({ withTimezone: true }),
    gelesenAm: timestamp({ withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.hatimId, t.cuz] }), index('hatim_teil_benutzer_idx').on(t.benutzerId)],
);

/** Newsletter mit Double-Opt-in; Adresse verschlüsselt, Eindeutigkeit über HMAC. */
export const newsletterAbo = pgTable('newsletter_abo', {
  id: uuid().primaryKey().defaultRandom(),
  emailVerschluesselt: bytea().notNull(),
  schluesselId: smallint().notNull(),
  emailHmac: text().notNull().unique(),
  sprache: text().notNull().default('de'),
  themen: text().array().notNull().default([]),
  tokenHash: text().notNull(),
  einwilligungVersion: text().notNull(),
  bestaetigtAm: timestamp({ withTimezone: true }),
  abgemeldetAm: timestamp({ withTimezone: true }),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const newsletterAusgabe = pgTable('newsletter_ausgabe', {
  id: uuid().primaryKey().defaultRandom(),
  betreff: jsonb().$type<Mehrsprachig>().notNull(),
  inhalt: jsonb().$type<MehrsprachigRich>().notNull(),
  themen: text().array().notNull().default([]),
  geplantAm: timestamp({ withTimezone: true }),
  versendetAm: timestamp({ withTimezone: true }),
  empfaenger: integer().notNull().default(0),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Ehrenamt-Dienstplan (Kür K-B). */
export const dienst = pgTable('dienst', {
  id: uuid().primaryKey().defaultRandom(),
  titel: jsonb().$type<Mehrsprachig>().notNull(),
  beschreibung: jsonb().$type<Mehrsprachig>(),
  beginn: timestamp({ withTimezone: true }).notNull(),
  ende: timestamp({ withTimezone: true }).notNull(),
  plaetze: integer().notNull().default(1),
  veranstaltungId: uuid().references(() => veranstaltung.id, { onDelete: 'set null' }),
  status: inhaltStatusEnum().notNull().default('entwurf'),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const dienstEintrag = pgTable(
  'dienst_eintrag',
  {
    dienstId: uuid()
      .notNull()
      .references(() => dienst.id, { onDelete: 'cascade' }),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    eingetragenAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.dienstId, t.benutzerId] })],
);
