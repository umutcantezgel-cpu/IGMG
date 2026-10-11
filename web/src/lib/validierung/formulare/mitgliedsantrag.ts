import { z } from 'zod';
import { TELEFON } from './veranstaltungsanmeldung';

/**
 * Mitgliedsantrag (B06, Blatt S21, design/JoinUs.dc.html und FormWizard.dc.html): drei Schritte, nur die Felder des
 * Designs, Pflicht wie dort (G-07). Fehler sind Schlüssel unter `formulare.fehler`.
 */
export const INTERESSEN = ['prayer', 'education', 'youth', 'family', 'community', 'culture', 'language', 'charity'] as const;
export const ALTERSGRUPPEN = ['u20', '20-30', '30-40', '40-50', '50-60', 'o60'] as const;
export const GESCHLECHTER = ['m', 'w', 'a'] as const;

const ALTERSGRUPPE_WAHL = ['', ...ALTERSGRUPPEN] as const;
const GESCHLECHT_WAHL = ['', ...GESCHLECHTER] as const;

const pflicht = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const optional = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const email = z.string('pflicht').trim().min(1, 'pflicht').max(254, 'zuLang').pipe(z.email('email'));
const telefon = optional(30).refine((t) => t === '' || TELEFON.test(t), 'telefon');

export const mitgliedsantragSchema = z.object({
  sprache: z.enum(['de', 'tr', 'en'], 'ungueltig'),
  // Schritt 1: Kontaktdaten (nur Vorname, Nachname und E-Mail sind Pflicht)
  vorname: pflicht(100),
  nachname: pflicht(100),
  email,
  telefon,
  adresse: optional(120),
  stadt: optional(80),
  altersgruppe: z.enum(ALTERSGRUPPE_WAHL, 'ungueltig').default(''),
  geschlecht: z.enum(GESCHLECHT_WAHL, 'ungueltig').default(''),
  // Schritt 2: Interessen (mindestens eine Auswahl) und Erfahrung (freiwillig). Die Werte prüft ein `refine` auf Feldebene,
  // damit ein Fehler als „interessen“ und nicht als „interessen.0“ am Feld landet (Felder kennen nur Feldnamen).
  interessen: z
    .array(z.string('ungueltig'), 'pflicht')
    .min(1, 'pflicht')
    .refine((liste) => liste.every((i) => (INTERESSEN as readonly string[]).includes(i)), 'ungueltig'),
  erfahrung: optional(1000),
  // Schritt 3: Motivation, Newsletter-Wunsch (nur gespeichert, kein Versand) und Datenschutz-Einwilligung
  motivation: pflicht(1000),
  newsletter: z
    .literal('ja', 'ungueltig')
    .optional()
    .transform((v) => v === 'ja'),
  datenschutz: z.literal('ja', 'einwilligung'),
});
export type Mitgliedsantrag = z.infer<typeof mitgliedsantragSchema>;

/** Felder je Schritt (Reihenfolge wie im Design) – Grundlage für `wizardSchritt`. */
export const MITGLIEDSANTRAG_SCHRITTE = [
  ['vorname', 'nachname', 'email', 'telefon', 'adresse', 'stadt', 'altersgruppe', 'geschlecht'],
  ['interessen', 'erfahrung'],
  ['motivation', 'newsletter', 'datenschutz'],
] as const satisfies readonly (readonly (keyof Mitgliedsantrag)[])[];

/** Felder mit Mehrfachauswahl: ohne diese Liste wäre eine einzelne Auswahl kein Listenwert. */
export const MITGLIEDSANTRAG_MEHRFACH = ['interessen'] as const;
