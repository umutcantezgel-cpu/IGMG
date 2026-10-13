import { customType, pgEnum, timestamp, uuid, boolean, text } from 'drizzle-orm/pg-core';
import type { JSONContent } from '@tiptap/core';

/** Mehrsprachiger Text (ADR 0002): Deutsch Pflicht, Türkisch/Englisch optional. */
export type Mehrsprachig = { de: string; tr?: string; en?: string };
/** Mehrsprachiger Rich-Text als Tiptap-JSON (ADR 0006). */
export type MehrsprachigRich = { de: JSONContent; tr?: JSONContent; en?: JSONContent };

/** PostgreSQL-Volltextvektor (ADR 0013). */
export const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

/** Binärdaten (verschlüsselte Eingänge, ADR 0005). */
export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

export const organisationEnum = pgEnum('organisation', ['at', 'kt', 'gt', 'kgt']);
export const inhaltStatusEnum = pgEnum('inhalt_status', ['entwurf', 'veroeffentlicht']);
export const rolleEnum = pgEnum('rolle', [
  'administration',
  'redaktion',
  'organisationsredaktion',
  'bildung',
  'mitgliederverwaltung',
  // Lauf Gemeinde-Plattform (ADR 0026): Leitung liest das Cockpit, religiöse Prüfung gibt religiöse Inhalte frei,
  // Kinderschutz bearbeitet Chat-Meldungen und das Moderationsprotokoll.
  'leitung',
  'religioese_pruefung',
  'kinderschutz',
]);

/** Kontoarten in „Mein Bereich“ (ADR 0026), getrennt von den Verwaltungsrollen. */
export const gemeindeRolleEnum = pgEnum('gemeinde_rolle_art', ['gemeinde', 'eltern', 'lehrkraft', 'schueler']);

/** Freigabestand religiöser und redaktioneller Inhalte (ADR 0030): öffentlich ist nur „geprueft“. */
export const freigabeStatusEnum = pgEnum('freigabe_status', ['entwurf', 'zur_pruefung', 'geprueft']);

/** Freigabespalten für Inhalte mit Pflichtprüfung (religiös: Rolle `religioese_pruefung`). */
export const freigabeSpalten = () => ({
  freigabe: freigabeStatusEnum().notNull().default('entwurf'),
  verfasstVon: text(),
  geprueftVon: text(),
  geprueftAm: timestamp({ withTimezone: true }),
});

/** Gemeinsame Spalten aller Inhalte: Status, Papierkorb (30 Tage, K-05), Beispielkennzeichnung (ADR 0015). */
export const inhaltSpalten = () => ({
  id: uuid().primaryKey().defaultRandom(),
  status: inhaltStatusEnum().notNull().default('entwurf'),
  imPapierkorbSeit: timestamp({ withTimezone: true }),
  istBeispiel: boolean().notNull().default(false),
  quelle: text(),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  aktualisiertAm: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  erstelltVon: text(),
  aktualisiertVon: text(),
});
