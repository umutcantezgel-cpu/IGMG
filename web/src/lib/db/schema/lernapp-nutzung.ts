import {
  bigint,
  bigserial,
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
import { gruppe } from './lernen';
import { lernappSpracheEnum } from './lernapp';
import { bytea } from './typen';

/**
 * Lern-App – Nutzung mit Konto (ADR 0038 Nr. 10, KERN 4.0 §5/§6; PLAN §3.8/§3.9). Migration 0019.
 *
 * - Daten entstehen nur mit Konto, Einwilligung `lernapp` und Schalter `lernapp_sync` (bzw. `lernapp_gruppen` für
 *   Schreibabgaben); das prüft jede Route serverseitig, nicht das Schema.
 * - **Konto löschen** kaskadiert alles: `lernapp_profil` hängt am Konto, Ereignisse, Karten und Tage hängen am Profil.
 * - **Löschfristen** (`web/src/lib/loeschen/gemeinde.ts`): Profil 12 Monate nach der letzten Aktivität
 *   (`zuletztAktivAm`, mit allem, was daran hängt), Schreibabgaben 12 Monate nach der Abgabe (`loeschenAb`). Ereignisse
 *   älter als 12 Monate verdichtet der Abgleich in den Kartenstand (`basis`, L1-05).
 * - Sprachaufnahmen kommen nie hierher (KERN 4.0 §6).
 */

/** Lernprofil eines Kontos auf dem Server (ein Profil je Konto, ADR 0038 Nr. 7). */
export const lernappProfil = pgTable(
  'lernapp_profil',
  {
    benutzerId: text()
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    oberflaeche: lernappSpracheEnum().notNull().default('de'),
    ausgangssprache: lernappSpracheEnum().notNull().default('de'),
    /** Version der reinen Ableitung (`ableiten.ts`); steigt sie, wird der Kartenstand neu berechnet. */
    ableitungsVersion: smallint().notNull().default(1),
    angelegtAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    /** Letzte Aktivität (Abgleich): Grundlage der Löschung nach 12 Monaten. */
    zuletztAktivAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('lernapp_profil_aktiv_idx').on(t.zuletztAktivAm)],
);

/** Arten der Ereignisse (ADR 0038 Nr. 2); `daten` je Art mit eigenem Zod-Schema (`web/src/lib/lernapp/ereignisse/typen.ts`). */
export const lernappEreignisArtEnum = pgEnum('lernapp_ereignis_art', [
  'bewertung',
  'lektion',
  'xp',
  'pause',
  'einstellung',
  'einstufung',
  'tagesziel',
]);

/**
 * Ereignisprotokoll (Wahrheit, nur anhängen): eindeutig über (Konto, Gerät, Folgenummer) – Schreiben mit
 * `ON CONFLICT DO NOTHING` ist idempotent. `id` (fortlaufend) ist der Zeiger des Abgleichs. `am` ist die Gerätezeit,
 * vom Server auf höchstens Empfang + 5 min geklemmt (ADR 0038 Nr. 6); `tag` der Lerntag in Ortszeit des Geräts.
 */
export const lernappEreignis = pgTable(
  'lernapp_ereignis',
  {
    id: bigserial({ mode: 'number' }).primaryKey(),
    benutzerId: text()
      .notNull()
      .references(() => lernappProfil.benutzerId, { onDelete: 'cascade' }),
    geraet: uuid().notNull(),
    seq: integer().notNull(),
    am: timestamp({ withTimezone: true }).notNull(),
    tag: date({ mode: 'string' }).notNull(),
    art: lernappEreignisArtEnum().notNull(),
    daten: jsonb().$type<Record<string, unknown>>().notNull(),
    empfangenAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('lernapp_ereignis_eindeutig').on(t.benutzerId, t.geraet, t.seq),
    index('lernapp_ereignis_zeiger_idx').on(t.benutzerId, t.id),
    index('lernapp_ereignis_am_idx').on(t.am),
  ],
);

/**
 * Kartenstand (FSRS) je Konto und Karte, abgeleitet aus den Ereignissen mit derselben reinen Funktion wie auf dem Gerät.
 * `basis`/`basisBis`: verdichteter Stand der Ereignisse älter als 12 Monate (L1-05); nachgespielt wird ab dort.
 */
export const lernappKarte = pgTable(
  'lernapp_karte',
  {
    benutzerId: text()
      .notNull()
      .references(() => lernappProfil.benutzerId, { onDelete: 'cascade' }),
    /** Kartenschlüssel, z. B. Lemma- oder Satzschlüssel mit Richtung (`tr-aus-de:tr.l.00042`). */
    karte: text().notNull(),
    zustand: jsonb().$type<Record<string, unknown>>().notNull(),
    faellig: timestamp({ withTimezone: true }),
    basis: jsonb().$type<Record<string, unknown>>(),
    basisBis: timestamp({ withTimezone: true }),
    /** Höchste eingeflossene Ereignis-ID (Zeiger). */
    bisEreignis: bigint({ mode: 'number' }),
    aktualisiertAm: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.benutzerId, t.karte] }), index('lernapp_karte_faellig_idx').on(t.benutzerId, t.faellig)],
);

/** Lerntag je Konto (für die Gruppenwoche und die Lernwoche des Kindes, ADR 0043): abgeleitet, ohne Uhrzeiten. */
export const lernappTag = pgTable(
  'lernapp_tag',
  {
    benutzerId: text()
      .notNull()
      .references(() => lernappProfil.benutzerId, { onDelete: 'cascade' }),
    tag: date({ mode: 'string' }).notNull(),
    xp: integer().notNull().default(0),
    lektionen: smallint().notNull().default(0),
    pause: boolean().notNull().default(false),
    zielErreicht: boolean().notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.benutzerId, t.tag] })],
);

export type LernappRubrik = { pruefliste: Record<string, boolean>; selbst?: number };

/**
 * Schreibabgabe (B1–C1, ADR 0042, KERN 4.0 §5): Text und Kommentar der Lehrkraft nur verschlüsselt (wie `chat_nachricht`).
 * Sichtbar nur für die Lehrkraft der eigenen Gruppe (Schalter `lernapp_gruppen`). Gelöscht 12 Monate nach der Abgabe
 * (`loeschenAb`) und mit dem Konto.
 */
export const lernappSchreibabgabe = pgTable(
  'lernapp_schreibabgabe',
  {
    id: uuid().primaryKey().defaultRandom(),
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gruppeId: uuid().references(() => gruppe.id, { onDelete: 'set null' }),
    aufgabeSchluessel: text().notNull(),
    textVerschluesselt: bytea().notNull(),
    schluesselId: smallint().notNull(),
    rubrik: jsonb().$type<LernappRubrik>().notNull().default({ pruefliste: {} }),
    kommentarVerschluesselt: bytea(),
    kommentarSchluesselId: smallint(),
    korrigiertVon: text().references(() => user.id, { onDelete: 'set null' }),
    korrigiertAm: timestamp({ withTimezone: true }),
    eingereichtAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    loeschenAb: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [
    index('lernapp_schreibabgabe_benutzer_idx').on(t.benutzerId),
    index('lernapp_schreibabgabe_gruppe_idx').on(t.gruppeId),
    index('lernapp_schreibabgabe_loeschen_idx').on(t.loeschenAb),
  ],
);

/**
 * Statistik ohne Personenbezug (KERN 4.0 §6): Tagessummen je Kurs bzw. Bereich (z. B. Einheitenschlüssel) und Kennzahl.
 * Angezeigt nur ab n ≥ 10; anonyme Telemetrie nur mit Opt-in und Schalter `lernapp_statistik`.
 */
export const lernappStatistikTag = pgTable(
  'lernapp_statistik_tag',
  {
    tag: date({ mode: 'string' }).notNull(),
    kursId: text().notNull(),
    bereich: text().notNull().default(''),
    kennzahl: text().notNull(),
    wert: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.tag, t.kursId, t.bereich, t.kennzahl] })],
);
