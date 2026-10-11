import { z } from 'zod';
import { TELEFON } from './veranstaltungsanmeldung';

/**
 * Webseite für Moscheen (B07, Blatt S22, design/MosqueRequest.dc.html, FormWizard.dc.html): drei Schritte, nur die
 * Felder des Designs (G-07), Pflicht wie dort. Fehler sind Schlüssel unter `formulare.fehler`.
 * Das Website-Feld heißt `currentWebsite`, nicht `website`: `website` ist der Honigtopf (FELD_HONIGTOPF in
 * `lib/formulare/ergebnis.ts`), `rohwerte` verwirft dieses Feld, und eine ausgefüllte Adresse ergäbe scheinbaren Erfolg.
 */
const pflicht = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const optional = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const email = z.string('pflicht').trim().min(1, 'pflicht').max(254, 'zuLang').pipe(z.email('email'));

/** Adresse nur mit https://, wenn angegeben (das Design hat type="url"; geprüft wird auf dem Server). */
const httpsAdresse = (t: string): boolean => {
  try {
    return new URL(t).protocol === 'https:';
  } catch {
    return false;
  }
};

/** Auswahlwerte wie im Design (MR:52–57); die Bestandswerte stehen im Blatt als offene Frage. */
export const ANFORDERUNGEN = [
  'prayer-times',
  'events',
  'news',
  'membership',
  'donations',
  'multilingual',
  'mobile',
  'contact',
  'gallery',
  'education',
] as const;
export const BUDGETS = ['b1', 'b2', 'b3', 'b4', 'disc'] as const;
export const ZEITRAEUME = ['t1', 't2', 't3', 't4', 'flex'] as const;

export const moscheeAnfrageSchema = z.object({
  sprache: z.enum(['de', 'tr', 'en'], 'ungueltig'),
  // Schritt 1: Grunddaten und Standort
  mosqueName: pflicht(120),
  contactPerson: pflicht(100),
  email,
  phone: optional(30).refine((t) => t === '' || TELEFON.test(t), 'telefon'),
  address: pflicht(120),
  city: pflicht(80),
  postalCode: z
    .string('pflicht')
    .trim()
    .min(1, 'pflicht')
    .regex(/^\d{5}$/, 'plz'),
  country: pflicht(80),
  // Schritt 2: Webseite, Mitglieder, Anforderungen (Mehrfachauswahl als Liste, `MOSCHEE_MEHRFACH`)
  currentWebsite: optional(500).refine((t) => t === '' || httpsAdresse(t), 'ungueltig'),
  memberCount: optional(7).refine((t) => t === '' || /^\d{1,7}$/.test(t), 'ungueltig'),
  requirements: z
    .array(z.string())
    .default([])
    .refine((liste) => liste.every((a) => ANFORDERUNGEN.some((x) => x === a)), 'ungueltig'),
  // Schritt 3: Projekt und Einwilligung
  budget: z.enum(['', ...BUDGETS] as const, 'ungueltig').default(''),
  timeline: z.enum(['', ...ZEITRAEUME] as const, 'ungueltig').default(''),
  additionalInfo: optional(2000),
  dataProtection: z.literal('ja', 'einwilligung'),
});
export type MoscheeAnfrage = z.infer<typeof moscheeAnfrageSchema>;

/** Felder je Schritt (Reihenfolge wie im Design) – Grundlage für `wizardSchritt`. */
export const MOSCHEE_SCHRITTE = [
  ['mosqueName', 'contactPerson', 'email', 'phone', 'address', 'city', 'postalCode', 'country'],
  ['currentWebsite', 'memberCount', 'requirements'],
  ['budget', 'timeline', 'additionalInfo', 'dataProtection'],
] as const satisfies readonly (readonly (keyof MoscheeAnfrage)[])[];

/** Felder mit Mehrfachauswahl: kommen als Liste (`rohwerte`). */
export const MOSCHEE_MEHRFACH = ['requirements'] as const;
