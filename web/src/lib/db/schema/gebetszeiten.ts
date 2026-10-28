import { sql } from 'drizzle-orm';
import { check, date, index, integer, jsonb, pgEnum, pgTable, text, time, timestamp, uuid } from 'drizzle-orm/pg-core';

/** Herkunft eines Tages (ADR 0008, ADR 0048): Import der Gemeinde, IGMG-Gebetskalender oder berechnet. */
export const gebetszeitQuelleEnum = pgEnum('gebetszeit_quelle', ['import', 'igmg', 'berechnet']);

/** Gebetszeiten je Tag als Ortszeit Europe/Berlin (ADR 0008). */
export const gebetszeitTag = pgTable('gebetszeit_tag', {
  datum: date({ mode: 'string' }).primaryKey(),
  imsak: time().notNull(),
  gunes: time().notNull(),
  ogle: time().notNull(),
  ikindi: time().notNull(),
  aksam: time().notNull(),
  yatsi: time().notNull(),
  quelle: gebetszeitQuelleEnum().notNull(),
  importId: uuid().references(() => gebetszeitImport.id, { onDelete: 'set null' }),
  /** Lauf des IGMG-Abgleichs, der den Tag geschrieben hat (ADR 0048) */
  abgleichId: uuid().references(() => gebetszeitAbgleich.id, { onDelete: 'set null' }),
  /** Zeitpunkt der letzten Änderung – öffentlich als „Stand“ (ADR 0048) */
  aktualisiertAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Protokoll der Tabellen-Importe. */
export const gebetszeitImport = pgTable('gebetszeit_import', {
  id: uuid().primaryKey().defaultRandom(),
  dateiname: text(),
  von: date({ mode: 'string' }).notNull(),
  bis: date({ mode: 'string' }).notNull(),
  zeilen: integer().notNull(),
  erstelltVon: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type AbgleichStatus = 'ok' | 'unveraendert' | 'auffaellig' | 'freigegeben' | 'fehler';

/**
 * Laufprotokoll des IGMG-Abgleichs (ADR 0048), ohne Personendaten: Zähler, Status, Fehlercode und in `details` nur Daten
 * und Abweichungen je Gebet (bei „auffällig“ zusätzlich die gelieferten Tage, damit die Freigabe ohne neuen Abruf geht).
 * Der Abgleich räumt Läufe nach 90 Tagen selbst auf; der letzte erfolgreiche bleibt.
 */
export const gebetszeitAbgleich = pgTable(
  'gebetszeit_abgleich',
  {
    id: uuid().primaryKey().defaultRandom(),
    quelle: text().notNull(),
    status: text().$type<AbgleichStatus>().notNull(),
    gestartet: timestamp({ withTimezone: true }).notNull().defaultNow(),
    beendet: timestamp({ withTimezone: true }),
    von: date({ mode: 'string' }),
    bis: date({ mode: 'string' }),
    tageGeprueft: integer().notNull().default(0),
    tageNeu: integer().notNull().default(0),
    tageGeaendert: integer().notNull().default(0),
    konflikte: integer().notNull().default(0),
    maxAbweichungMin: integer().notNull().default(0),
    fehlerCode: text(),
    inhaltSha256: text(),
    quellStand: text(),
    details: jsonb().$type<Record<string, unknown>>(),
  },
  (t) => [
    index('gebetszeit_abgleich_gestartet_idx').on(t.gestartet),
    check('gebetszeit_abgleich_quelle', sql`${t.quelle} in ('igmg-feed', 'igmg-datei')`),
    check('gebetszeit_abgleich_status', sql`${t.status} in ('ok', 'unveraendert', 'auffaellig', 'freigegeben', 'fehler')`),
  ],
);
