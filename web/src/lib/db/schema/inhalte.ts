import { sql } from 'drizzle-orm';
import { boolean, date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { medium } from './medien';
import { freigabeSpalten, inhaltSpalten, organisationEnum, tsvector, type Mehrsprachig, type MehrsprachigRich } from './typen';

/** Volltextspalten je Sprache aus einer Klartext-Hilfsspalte `klartext` (jsonb {de,tr,en}) – ADR 0013. */
const suchSpalten = () => ({
  klartext: jsonb().$type<Mehrsprachig>().notNull().default({ de: '' }),
  sucheDe: tsvector().generatedAlwaysAs(sql`to_tsvector('german', coalesce(klartext->>'de', ''))`),
  sucheTr: tsvector().generatedAlwaysAs(sql`to_tsvector('turkish', coalesce(klartext->>'tr', klartext->>'de', ''))`),
  sucheEn: tsvector().generatedAlwaysAs(sql`to_tsvector('english', coalesce(klartext->>'en', klartext->>'de', ''))`),
});

export const veranstaltungKategorieEnum = pgEnum('veranstaltung_kategorie', ['gebet', 'bildung', 'gemeinde', 'kultur', 'jugend', 'frauen']);
export const kostenEnum = pgEnum('kosten', ['kostenlos', 'kostenpflichtig']);

/** Veranstaltungen mit Wiederholung (rrule) und Ausnahmen (K-09). Zeiten in UTC (K-05). */
export const veranstaltung = pgTable(
  'veranstaltung',
  {
    ...inhaltSpalten(),
    slug: text().notNull().unique(),
    titel: jsonb().$type<Mehrsprachig>().notNull(),
    kurztext: jsonb().$type<Mehrsprachig>(),
    beschreibung: jsonb().$type<MehrsprachigRich>(),
    kategorie: veranstaltungKategorieEnum().notNull(),
    organisation: organisationEnum(),
    zielgruppe: jsonb().$type<Mehrsprachig>(),
    ort: jsonb().$type<Mehrsprachig>(),
    beginn: timestamp({ withTimezone: true }).notNull(),
    ende: timestamp({ withTimezone: true }),
    ganztaegig: boolean().notNull().default(false),
    /** RFC-5545-RRULE ohne DTSTART (DTSTART = beginn, Zeitzone Europe/Berlin). */
    wiederholung: text(),
    /** Ausfallende Termine (lokales Datum Europe/Berlin). */
    ausnahmen: date({ mode: 'string' })
      .array()
      .notNull()
      .default(sql`'{}'::date[]`),
    anmeldungAktiv: boolean().notNull().default(false),
    plaetze: integer(),
    kosten: kostenEnum().notNull().default('kostenlos'),
    empfohlen: boolean().notNull().default(false),
    teilnehmerHinweis: jsonb().$type<Mehrsprachig>(),
    /** Programmpunkte (EventDetails.dc.html „Programm“): Uhrzeit HH:MM + Text */
    programm: jsonb().$type<{ zeit: string; text: Mehrsprachig }[]>().notNull().default([]),
    /** „Wichtige Hinweise“ */
    hinweise: jsonb().$type<Mehrsprachig[]>().notNull().default([]),
    /** Schlagwörter */
    schlagwoerter: jsonb().$type<Mehrsprachig[]>().notNull().default([]),
    /** Veranstalter (Funktion/Name, z. B. „[Name – Imam]“) und Kontakt – nur öffentliche Funktionsangaben */
    veranstalter: jsonb().$type<{ name: string; funktion?: Mehrsprachig }>(),
    kontakt: jsonb().$type<{ name?: string; telefon?: string; email?: string }>(),
    bildId: uuid().references(() => medium.id, { onDelete: 'set null' }),
    ...suchSpalten(),
  },
  (t) => [
    index('veranstaltung_beginn_idx').on(t.beginn),
    index('veranstaltung_status_idx').on(t.status, t.imPapierkorbSeit),
    index('veranstaltung_suche_de_idx').using('gin', t.sucheDe),
    index('veranstaltung_suche_tr_idx').using('gin', t.sucheTr),
    index('veranstaltung_suche_en_idx').using('gin', t.sucheEn),
  ],
);

/** Kategorien wie im Design (News.dc.html: Ankündigungen, Gemeinde, Veranstaltungen, Bildung, Religiös, Soziales; Startseite: Neuigkeiten). */
export const nachrichtKategorieEnum = pgEnum('nachricht_kategorie', [
  'ankuendigung',
  'gemeinde',
  'veranstaltung',
  'bildung',
  'religioes',
  'soziales',
  'neuigkeiten',
]);

/** Neuigkeiten (Nachrichten) mit Rich-Text und Bild. */
export const nachricht = pgTable(
  'nachricht',
  {
    ...inhaltSpalten(),
    slug: text().notNull().unique(),
    titel: jsonb().$type<Mehrsprachig>().notNull(),
    kurztext: jsonb().$type<Mehrsprachig>(),
    inhalt: jsonb().$type<MehrsprachigRich>(),
    kategorie: nachrichtKategorieEnum().notNull().default('neuigkeiten'),
    organisation: organisationEnum(),
    veroeffentlichtAm: timestamp({ withTimezone: true }),
    empfohlen: boolean().notNull().default(false),
    /** Hervorhebung „Wichtig“ (Startseite, Tag-Farbe Fehlerrot) */
    wichtig: boolean().notNull().default(false),
    /** Lesezeit in Minuten (aus dem Text berechnet oder gepflegt) */
    lesezeit: integer(),
    /** Schlagwörter (NewsDetails.dc.html, Block „Schlagwörter“); leer = Block entfällt. */
    schlagwoerter: jsonb().$type<Mehrsprachig[]>().notNull().default([]),
    bildId: uuid().references(() => medium.id, { onDelete: 'set null' }),
    ...suchSpalten(),
  },
  (t) => [
    index('nachricht_datum_idx').on(t.veroeffentlichtAm),
    index('nachricht_suche_de_idx').using('gin', t.sucheDe),
    index('nachricht_suche_tr_idx').using('gin', t.sucheTr),
    index('nachricht_suche_en_idx').using('gin', t.sucheEn),
  ],
);

export const prioritaetEnum = pgEnum('prioritaet', ['niedrig', 'mittel', 'hoch']);

/** Ankündigungen (zeitlich begrenzte Hinweise). */
export const ankuendigung = pgTable('ankuendigung', {
  ...inhaltSpalten(),
  titel: jsonb().$type<Mehrsprachig>().notNull(),
  inhalt: jsonb().$type<Mehrsprachig>().notNull(),
  prioritaet: prioritaetEnum().notNull().default('mittel'),
  organisation: organisationEnum(),
  sichtbarAb: timestamp({ withTimezone: true }),
  laeuftAb: timestamp({ withTimezone: true }),
  link: text(),
});

/**
 * Seiteninhalte als typisierte Dokumente je Bereich (Über uns, Vorstand, Projekte, Spenden,
 * Kontakt, Organisationen, IGMG, Impressum, Datenschutz …). Das Zod-Schema je Bereich
 * liegt in src/lib/validierung/seiteninhalte.ts.
 */
export const seiteninhalt = pgTable('seiteninhalt', {
  bereich: text().primaryKey(),
  inhalt: jsonb().notNull(),
  istBeispiel: boolean().notNull().default(false),
  quelle: text(),
  aktualisiertAm: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  aktualisiertVon: text(),
});

/** Kurse (Korankurse und weitere Bildungsangebote). */
export const kursVerfuegbarkeitEnum = pgEnum('kurs_verfuegbarkeit', ['voranmeldung', 'ohne_anmeldung', 'geschlossen']);

export const kurs = pgTable('kurs', {
  ...inhaltSpalten(),
  slug: text().notNull().unique(),
  titel: jsonb().$type<Mehrsprachig>().notNull(),
  beschreibung: jsonb().$type<Mehrsprachig>(),
  zielgruppe: jsonb().$type<Mehrsprachig>(),
  alter: jsonb().$type<Mehrsprachig>(),
  zeiten: jsonb().$type<Mehrsprachig>(),
  dauer: jsonb().$type<Mehrsprachig>(),
  ort: jsonb().$type<Mehrsprachig>(),
  leitung: jsonb().$type<Mehrsprachig>(),
  kosten: jsonb().$type<Mehrsprachig>(),
  plaetze: integer(),
  inhalte: jsonb().$type<Mehrsprachig[]>().notNull().default([]),
  empfohlen: boolean().notNull().default(false),
  /** Anmeldeweg wie CourseCard.dc.html (register/join/closed): Voranmeldung, ohne Anmeldung, geschlossen (V06). */
  verfuegbarkeit: kursVerfuegbarkeitEnum().notNull().default('voranmeldung'),
  /** Hinweis in der Karte (blaue Box, CourseCard.dc.html:25), z. B. „Außerhalb der Schulferien …“. */
  hinweis: jsonb().$type<Mehrsprachig>(),
  sortierung: integer().notNull().default(0),
  bildId: uuid().references(() => medium.id, { onDelete: 'set null' }),
});

/**
 * Themen „Islamisches Wissen“. Religiöse Freigabe (ADR 0030, F-40): öffentlich nur `status = veroeffentlicht` UND
 * `freigabe = geprueft`. Der Bestand vor F-40 gilt per Migration 0015 als geprüft (ohne prüfende Person, Vermerk im
 * Freigabe-Verlauf); jede inhaltliche Änderung setzt auf „zur Prüfung“ zurück.
 */
export const wissenThema = pgTable(
  'wissen_thema',
  {
    ...inhaltSpalten(),
    ...freigabeSpalten(),
    slug: text().notNull().unique(),
    kategorie: text().notNull(),
    titel: jsonb().$type<Mehrsprachig>().notNull(),
    kurztext: jsonb().$type<Mehrsprachig>(),
    inhalt: jsonb().$type<MehrsprachigRich>(),
    sortierung: integer().notNull().default(0),
    ...suchSpalten(),
  },
  (t) => [
    index('wissen_suche_de_idx').using('gin', t.sucheDe),
    index('wissen_suche_tr_idx').using('gin', t.sucheTr),
    index('wissen_suche_en_idx').using('gin', t.sucheEn),
  ],
);
