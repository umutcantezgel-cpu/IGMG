import { bigserial, index, integer, jsonb, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { bytea } from './typen';

/** Audit-Log (G-07): wer hat wann was getan. Nie Personendaten in `details`. */
export const auditEintrag = pgTable(
  'audit_eintrag',
  {
    id: bigserial({ mode: 'number' }).primaryKey(),
    zeitpunkt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    benutzerId: text(),
    aktion: text().notNull(),
    zielTyp: text(),
    zielId: text(),
    details: jsonb().$type<Record<string, string | number | boolean | null>>(),
  },
  (t) => [
    index('audit_zeitpunkt_idx').on(t.zeitpunkt),
    index('audit_ziel_idx').on(t.zielTyp, t.zielId),
    index('audit_benutzer_idx').on(t.benutzerId),
  ],
);

/** Einstellungen als typisierte Schlüssel-Wert-Paare (Gebetszeiten, Löschfristen, Kontaktdaten …). */
export const einstellung = pgTable('einstellung', {
  schluessel: text().primaryKey(),
  wert: jsonb().notNull(),
  geaendertAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  geaendertVon: text(),
});

/** Ratenbegrenzung öffentlicher Formulare (ADR 0005). Schlüssel = HMAC(IP + Formular), nie die IP. */
export const ratenbegrenzung = pgTable('ratenbegrenzung', {
  schluessel: text().primaryKey(),
  fensterStart: timestamp({ withTimezone: true }).notNull(),
  zaehler: integer().notNull().default(0),
});

/** Verbrauchte ALTCHA-Lösungen gegen Wiederverwendung (ADR 0005). */
export const verbrauchteChallenge = pgTable(
  'verbrauchte_challenge',
  {
    signaturHash: text().primaryKey(),
    laeuftAb: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [index('verbrauchte_challenge_ablauf_idx').on(t.laeuftAb)],
);

/** Mail-Ausgang mit Wiederholung (ADR 0005, 0011). Empfänger und Daten verschlüsselt. */
export const mailAusgang = pgTable(
  'mail_ausgang',
  {
    id: uuid().primaryKey().defaultRandom(),
    vorlage: text().notNull(),
    sprache: text().notNull().default('de'),
    datenVerschluesselt: bytea().notNull(),
    schluesselId: smallint().notNull(),
    versuche: integer().notNull().default(0),
    naechsterVersuch: timestamp({ withTimezone: true }).notNull().defaultNow(),
    gesendetAm: timestamp({ withTimezone: true }),
    fehler: text(),
    bezugEingangId: uuid(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('mail_ausgang_offen_idx').on(t.gesendetAm, t.naechsterVersuch)],
);
