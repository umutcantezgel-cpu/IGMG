import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { medium } from './medien';
import { freigabeSpalten, type Mehrsprachig, type MehrsprachigRich } from './typen';

/** Quran-Daten (ADR 0009, ADR 0025): nur über Import-Skripte aus gepinnten, lizenzierten Quellen. */
export const quranQuelle = pgTable('quran_quelle', {
  id: text().primaryKey(),
  bezeichnung: text().notNull(),
  url: text().notNull(),
  version: text().notNull(),
  sha256: text().notNull(),
  lizenz: text().notNull(),
  importiertAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const offenbarungsOrtEnum = pgEnum('quran_offenbarungsort', ['mekki', 'medeni']);

export const quranSure = pgTable('quran_sure', {
  nr: integer().primaryKey(),
  nameAr: text().notNull(),
  name: jsonb().$type<{ de?: string; tr?: string; en?: string }>(),
  verseAnzahl: integer().notNull(),
  quelleId: text()
    .notNull()
    .references(() => quranQuelle.id),
  /** Lateinische Umschrift aus den Tanzil-Metadaten (`tname`). */
  nameUmschrift: text(),
  ort: offenbarungsOrtEnum(),
  /** Reihenfolge der Offenbarung (Tanzil-Metadaten `order`). */
  offenbarungsfolge: smallint(),
  rukus: smallint(),
  /** Basmala-Text aus der Quelle (Tanzil-Attribut `bismillah`), sonst null (Sure 1 und 9). */
  basmala: text(),
});

export type UebersetzungsVermerk = { text: string; quelle: string; lizenz: string };
/** Tajwid-Segment: [Start, Ende) in Codepunkten des Verstexts und Regelschlüssel (cpfair/quran-tajweed). */
export type TajwidSegment = [number, number, string];

export const quranVers = pgTable(
  'quran_vers',
  {
    sure: integer()
      .notNull()
      .references(() => quranSure.nr),
    vers: integer().notNull(),
    textAr: text().notNull(),
    /** Altlast (ADR 0009); Übersetzungen liegen in `quran_uebersetzung`. Bleibt als Alias, wird nicht mehr beschrieben. */
    uebersetzung: jsonb().$type<{ de?: UebersetzungsVermerk; tr?: UebersetzungsVermerk; en?: UebersetzungsVermerk }>(),
    tajwid: jsonb().$type<TajwidSegment[]>(),
  },
  (t) => [primaryKey({ columns: [t.sure, t.vers] })],
);

export const einteilungArtEnum = pgEnum('quran_einteilung_art', ['cuz', 'hizb_viertel', 'seite', 'manzil', 'ruku', 'secde']);

/** Einteilungen aus den Tanzil-Metadaten: Anfang (Sure, Vers) je Abschnitt. */
export const quranEinteilung = pgTable(
  'quran_einteilung',
  {
    art: einteilungArtEnum().notNull(),
    nr: smallint().notNull(),
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    /** Nur bei Secde: „recommended“/„obligatory“ laut Quelle. */
    zusatz: text(),
  },
  (t) => [primaryKey({ columns: [t.art, t.nr] })],
);

/** Wortformen (eindeutige Schreibung) für Bedeutungen, die an allen Vorkommen gelten. */
export const quranWortform = pgTable('quran_wortform', {
  id: serial().primaryKey(),
  textAr: text().notNull().unique(),
  vorkommen: integer().notNull().default(0),
});

/** Wörter je Vers (Trennung an Leerzeichen des Tanzil-Texts, Rundreise geprüft). */
export const quranWort = pgTable(
  'quran_wort',
  {
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    pos: smallint().notNull(),
    textAr: text().notNull(),
    formId: integer()
      .notNull()
      .references(() => quranWortform.id),
  },
  (t) => [primaryKey({ columns: [t.sure, t.vers, t.pos] }), index('quran_wort_form_idx').on(t.formId)],
);

/** Wortbedeutungen: nur von Menschen verfasst, öffentlich erst nach religiöser Freigabe (ADR 0030). */
export const quranWortbedeutung = pgTable(
  'quran_wortbedeutung',
  {
    id: uuid().primaryKey().defaultRandom(),
    formId: integer()
      .notNull()
      .references(() => quranWortform.id, { onDelete: 'cascade' }),
    sprache: text().notNull(),
    bedeutung: text().notNull(),
    wurzel: text(),
    anmerkung: text(),
    ...freigabeSpalten(),
    aktualisiertAm: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique('quran_wortbedeutung_eindeutig').on(t.formId, t.sprache)],
);

/** Abweichende Bedeutung an einer bestimmten Stelle (überschreibt die Form). */
export const quranWortbedeutungOrt = pgTable(
  'quran_wortbedeutung_ort',
  {
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    pos: smallint().notNull(),
    sprache: text().notNull(),
    bedeutung: text().notNull(),
    ...freigabeSpalten(),
  },
  (t) => [primaryKey({ columns: [t.sure, t.vers, t.pos, t.sprache] })],
);

/** Übersetzungsausgaben (z. B. QuranEnc german_bubenheim) mit Version und Lizenz; vor dem Aktivieren einmal freigegeben. */
export const quranAusgabe = pgTable('quran_ausgabe', {
  id: text().primaryKey(),
  sprache: text().notNull(),
  titel: text().notNull(),
  uebersetzer: text().notNull(),
  quelle: text().notNull(),
  version: text().notNull(),
  lizenz: text().notNull(),
  url: text().notNull(),
  sha256: text().notNull(),
  abgerufenAm: timestamp({ withTimezone: true }).notNull(),
  aktiv: boolean().notNull().default(false),
  standard: boolean().notNull().default(false),
  freigegebenVon: text(),
  freigegebenAm: timestamp({ withTimezone: true }),
});

export const quranUebersetzung = pgTable(
  'quran_uebersetzung',
  {
    ausgabeId: text()
      .notNull()
      .references(() => quranAusgabe.id, { onDelete: 'cascade' }),
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    text: text().notNull(),
  },
  (t) => [primaryKey({ columns: [t.ausgabeId, t.sure, t.vers] })],
);

/**
 * Kuratierte Verslisten (K-A „Vers des Tages“): nur Verweise auf importierte Verse (Sure, Vers), Reihenfolge fest.
 * Gepflegt nur von Personen mit `quran.bearbeiten` und `religioes.freigeben` (wie `hadith_auswahl`), jeder Schritt im
 * Freigabe-Verlauf. Ohne Fremdschlüssel, damit ein erneuter Import die Liste nicht leert; geprüft wird beim Hinzufügen.
 */
export const quranVersAuswahl = pgTable(
  'quran_vers_auswahl',
  {
    liste: text().notNull(),
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    reihenfolge: integer().notNull().default(0),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.liste, t.sure, t.vers] })],
);

/** Tajwid-Regeln (Schlüssel aus cpfair/quran-tajweed); Erklärungen verfasst und gibt die Lehrkraft frei. */
export const tajwidRegel = pgTable('tajwid_regel', {
  schluessel: text().primaryKey(),
  familie: text().notNull(),
  name: jsonb().$type<Mehrsprachig>().notNull(),
  kurz: jsonb().$type<Mehrsprachig>(),
  erklaerung: jsonb().$type<MehrsprachigRich>(),
  hoerbeispielMediumId: uuid().references(() => medium.id, { onDelete: 'set null' }),
  sortierung: smallint().notNull().default(0),
  ...freigabeSpalten(),
});

export const rezitationArtEnum = pgEnum('quran_rezitation_art', ['eigen', 'lizenziert']);

/** Rezitationen: eigene Aufnahmen der Gemeinde oder lizenzierte Sätze. Aktiv nur mit hinterlegter Vereinbarung (ADR 0029). */
export const quranRezitation = pgTable(
  'quran_rezitation',
  {
    id: text().primaryKey(),
    name: jsonb().$type<Mehrsprachig>().notNull(),
    rezitator: text().notNull(),
    art: rezitationArtEnum().notNull(),
    lizenz: text().notNull(),
    vereinbarungMediumId: uuid().references(() => medium.id, { onDelete: 'restrict' }),
    aktiv: boolean().notNull().default(false),
    standard: boolean().notNull().default(false),
    erstelltVon: text(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('quran_rezitation_vereinbarung', sql`not ${t.aktiv} or ${t.vereinbarungMediumId} is not null`)],
);

/** Audiodatei je Sure (vers = 0) oder je Vers (lizenzierte Sätze), unveränderlich unter Inhalts-Hash abgelegt. */
export const quranAudio = pgTable(
  'quran_audio',
  {
    rezitationId: text()
      .notNull()
      .references(() => quranRezitation.id, { onDelete: 'cascade' }),
    sure: smallint().notNull(),
    vers: smallint().notNull().default(0),
    pfad: text().notNull(),
    mime: text().notNull(),
    bytes: integer().notNull(),
    sha256: text().notNull(),
    dauerMs: integer(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.rezitationId, t.sure, t.vers] })],
);

/** Versgrenzen in der Sure-Datei (bei Dateien je Vers: 0 bis Dauer). */
export const quranVerszeit = pgTable(
  'quran_verszeit',
  {
    rezitationId: text()
      .notNull()
      .references(() => quranRezitation.id, { onDelete: 'cascade' }),
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    startMs: integer().notNull(),
    endeMs: integer().notNull(),
  },
  (t) => [primaryKey({ columns: [t.rezitationId, t.sure, t.vers] })],
);

export const wortzeitQuelleEnum = pgEnum('quran_wortzeit_quelle', ['mitklopfen', 'aligner', 'quran_align']);

export const quranWortzeit = pgTable(
  'quran_wortzeit',
  {
    rezitationId: text()
      .notNull()
      .references(() => quranRezitation.id, { onDelete: 'cascade' }),
    sure: smallint().notNull(),
    vers: smallint().notNull(),
    pos: smallint().notNull(),
    startMs: integer().notNull(),
    endeMs: integer().notNull(),
    quelle: wortzeitQuelleEnum().notNull(),
    geprueft: boolean().notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.rezitationId, t.sure, t.vers, t.pos] })],
);
