import { z } from 'zod';
import { STANDARD_EINSTELLUNGEN } from '@/lib/gebetszeiten/typen';

/** Einstellungen als typisierte Schlüssel (Tabelle `einstellung`). Ein Schema für Lesen und Schreiben. */
export const gebetszeitenEinstellung = z.object({
  aktiveQuelle: z.enum(['import', 'berechnung']).default('berechnung'),
  /** Quelle von der Gemeinde bestätigt → Hinweis „berechnet“ entfällt (G-06). */
  bestaetigt: z.boolean().default(false),
  methode: z
    .enum([
      'Turkey',
      'MuslimWorldLeague',
      'Egyptian',
      'Karachi',
      'UmmAlQura',
      'Dubai',
      'MoonsightingCommittee',
      'NorthAmerica',
      'Kuwait',
      'Qatar',
      'Singapore',
      'Tehran',
    ])
    .default('Turkey'),
  madhab: z.enum(['shafi', 'hanafi']).default('shafi'),
  hoheBreite: z.enum(['middleofthenight', 'seventhofthenight', 'twilightangle']).default('seventhofthenight'),
  anpassungen: z
    .partialRecord(z.enum(['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi']), z.number().int().min(-30).max(30))
    .default({}),
  breite: z.number().min(-90).max(90).default(STANDARD_EINSTELLUNGEN.breite),
  laenge: z.number().min(-180).max(180).default(STANDARD_EINSTELLUNGEN.laenge),
});
export type GebetszeitenEinstellung = z.infer<typeof gebetszeitenEinstellung>;

export const allgemeineEinstellung = z.object({
  /** Konzept-Hinweis (DisclaimerDialog) anzeigen, solange Inhalte Beispielinhalte sind. */
  konzepthinweis: z.boolean().default(true),
});
export type AllgemeineEinstellung = z.infer<typeof allgemeineEinstellung>;

/** Funktionsschalter (ADR 0035): nur gesetzte Werte; Standard je Betriebsart in src/lib/funktionen.ts. */
export const funktionenEinstellung = z.object({
  konten: z.boolean().optional(),
  lernplattform: z.boolean().optional(),
  chat: z.boolean().optional(),
  echtzeit: z.boolean().optional(),
  push: z.boolean().optional(),
  push_gebet: z.boolean().optional(),
  hatim: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  hadith_gesamt: z.boolean().optional(),
  ramadan_vorschau: z.boolean().optional(),
  // Lauf Lern-App (KERN 4.0 §6)
  lernapp: z.boolean().optional(),
  lernapp_ungeprueft: z.boolean().optional(),
  lernapp_sprechen: z.boolean().optional(),
  lernapp_meldungen: z.boolean().optional(),
  lernapp_sync: z.boolean().optional(),
  lernapp_gruppen: z.boolean().optional(),
  lernapp_rangliste: z.boolean().optional(),
  lernapp_statistik: z.boolean().optional(),
  push_lernapp: z.boolean().optional(),
});
export type FunktionenEinstellung = z.infer<typeof funktionenEinstellung>;

/** Text in drei Sprachen (Deutsch Pflicht) für Einstellungen, die öffentlich erscheinen. */
const einstellungText = (max: number) =>
  z.object({ de: z.string().trim().min(1).max(max), tr: z.string().trim().max(max).optional(), en: z.string().trim().max(max).optional() });

/**
 * Spenden (AUFTRAG 3.10, MN-13): Bankverbindung und Spendenzwecke für /spenden und den GiroCode. Leer bis der
 * Kassenwart die Daten bestätigt; ohne gültige IBAN zeigt die Seite einen Platzhalter und keinen QR-Code.
 * Der Verwendungszweck steht so im GiroCode (höchstens 140 Zeichen, EPC069-12).
 */
export const spendenZweck = z.object({
  titel: einstellungText(80),
  beschreibung: z
    .object({ de: z.string().trim().max(300), tr: z.string().trim().max(300).optional(), en: z.string().trim().max(300).optional() })
    .optional(),
  verwendungszweck: z.string().trim().min(1).max(140),
});
export type SpendenZweck = z.infer<typeof spendenZweck>;

export const spendenEinstellung = z.object({
  empfaenger: z.string().trim().max(70).default(''),
  iban: z.string().trim().max(42).default(''),
  bic: z.string().trim().max(11).default(''),
  zwecke: z.array(spendenZweck).max(6).default([]),
});
export type SpendenEinstellung = z.infer<typeof spendenEinstellung>;

export const EINSTELLUNG = {
  gebetszeiten: { schluessel: 'gebetszeiten', schema: gebetszeitenEinstellung },
  allgemein: { schluessel: 'allgemein', schema: allgemeineEinstellung },
  funktionen: { schluessel: 'funktionen', schema: funktionenEinstellung },
  spenden: { schluessel: 'spenden', schema: spendenEinstellung },
} as const;
