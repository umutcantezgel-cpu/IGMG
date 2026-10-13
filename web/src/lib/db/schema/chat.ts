import { bigint, bigserial, index, pgEnum, pgTable, primaryKey, smallint, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { gruppe } from './lernen';
import { bytea } from './typen';

/**
 * Moderierter Gruppen- und Elternkanal (Kinderschutz S-01…S-18, ADR 0026).
 * Keine Direktnachrichten, keine selbst angelegten Gruppen: Kanäle gibt es nur je Gruppe.
 */
export const chatKanalArtEnum = pgEnum('chat_kanal_art', ['gruppe', 'eltern']);
export const chatKanalStatusEnum = pgEnum('chat_kanal_status', ['aktiv', 'pausiert', 'archiviert']);

export const chatKanal = pgTable(
  'chat_kanal',
  {
    id: uuid().primaryKey().defaultRandom(),
    gruppeId: uuid()
      .notNull()
      .references(() => gruppe.id, { onDelete: 'cascade' }),
    art: chatKanalArtEnum().notNull(),
    status: chatKanalStatusEnum().notNull().default('aktiv'),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('chat_kanal_eindeutig').on(t.gruppeId, t.art)],
);

/** Nachricht: Text nur verschlüsselt (S-16), höchstens 500 Zeichen (S-05). Entfernte Nachrichten bleiben als Platzhalter. */
export const chatNachricht = pgTable(
  'chat_nachricht',
  {
    id: bigserial({ mode: 'number' }).primaryKey(),
    kanalId: uuid()
      .notNull()
      .references(() => chatKanal.id, { onDelete: 'cascade' }),
    absenderId: text().references(() => user.id, { onDelete: 'set null' }),
    textVerschluesselt: bytea().notNull(),
    schluesselId: smallint().notNull(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    entferntAm: timestamp({ withTimezone: true }),
    entferntVon: text(),
    entferntGrund: text(),
  },
  (t) => [index('chat_nachricht_kanal_idx').on(t.kanalId, t.id), index('chat_nachricht_zeit_idx').on(t.erstelltAm)],
);

export const chatGelesen = pgTable(
  'chat_gelesen',
  {
    kanalId: uuid()
      .notNull()
      .references(() => chatKanal.id, { onDelete: 'cascade' }),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bisId: bigint({ mode: 'number' }).notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.kanalId, t.benutzerId] })],
);

/** Chat-Regeln in kindgerechter Sprache, vor der ersten Nachricht bestätigt (S-15). */
export const chatRegelnBestaetigt = pgTable(
  'chat_regeln_bestaetigt',
  {
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    version: text().notNull(),
    bestaetigtAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.benutzerId, t.version] })],
);

export const chatStumm = pgTable(
  'chat_stumm',
  {
    kanalId: uuid()
      .notNull()
      .references(() => chatKanal.id, { onDelete: 'cascade' }),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bis: timestamp({ withTimezone: true }).notNull(),
    von: text(),
    grund: text().notNull(),
  },
  (t) => [primaryKey({ columns: [t.kanalId, t.benutzerId] })],
);

export const chatMeldungGrundEnum = pgEnum('chat_meldung_grund', ['beleidigung', 'bedrohung', 'unangemessen', 'spam', 'sonstiges']);
export const chatMeldungStatusEnum = pgEnum('chat_meldung_status', ['offen', 'in_bearbeitung', 'erledigt']);

/**
 * Meldung (S-07/S-08). Kontext (gemeldete Nachricht ±10) wird bei der Meldung verschlüsselt gesichert,
 * damit die Bearbeitung auch nach Ablauf der Nachrichtenfrist möglich ist; Meldungen laufen 1 Jahr nach Abschluss ab (S-12).
 */
export const chatMeldung = pgTable(
  'chat_meldung',
  {
    id: uuid().primaryKey().defaultRandom(),
    kanalId: uuid().references(() => chatKanal.id, { onDelete: 'set null' }),
    nachrichtId: bigint({ mode: 'number' }),
    gemeldetVon: text().references(() => user.id, { onDelete: 'set null' }),
    grund: chatMeldungGrundEnum().notNull(),
    freitextVerschluesselt: bytea(),
    kontextVerschluesselt: bytea().notNull(),
    schluesselId: smallint().notNull(),
    status: chatMeldungStatusEnum().notNull().default('offen'),
    bearbeitetVon: text(),
    bearbeitetAm: timestamp({ withTimezone: true }),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    loeschenAb: timestamp({ withTimezone: true }),
  },
  (t) => [index('chat_meldung_status_idx').on(t.status, t.erstelltAm)],
);

export const moderationAktionEnum = pgEnum('moderation_aktion', [
  'entfernt',
  'stumm',
  'stumm_aufgehoben',
  'pausiert',
  'fortgesetzt',
  'mitglied_entfernt',
  'meldung_bearbeitet',
  'notfallpause',
  'notfallpause_aufgehoben',
  'kontext_eingesehen',
  'loeschlauf',
]);

/**
 * Unveränderliches Moderationsprotokoll (S-10): UPDATE/DELETE per Trigger gesperrt (außer im Löschlauf),
 * jede Zeile verkettet über SHA-256 mit ihrer Vorgängerin (Prüfung im Cockpit).
 */
export const moderationsprotokoll = pgTable(
  'moderationsprotokoll',
  {
    id: bigserial({ mode: 'number' }).primaryKey(),
    zeitpunkt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    kanalId: uuid(),
    nachrichtId: bigint({ mode: 'number' }),
    akteurId: text(),
    aktion: moderationAktionEnum().notNull(),
    grund: text().notNull(),
    vorgaengerHash: text().notNull(),
    hash: text().notNull(),
  },
  (t) => [index('moderationsprotokoll_kanal_idx').on(t.kanalId, t.zeitpunkt)],
);
