import { z } from 'zod';
import { TELEFON } from './veranstaltungsanmeldung';

/**
 * Schüler-Voranmeldung (B05, Blatt S20, design/StudentRegistration.dc.html): vier Schritte, Kinderdaten besonders
 * schutzwürdig (G-07) – nur die Felder des Designs, Pflicht wie dort. Fehler sind Schlüssel unter `formulare.fehler`.
 */
const pflicht = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const optional = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const email = z.string('pflicht').trim().max(254, 'zuLang').pipe(z.email('email'));
const telefon = z.string('pflicht').trim().min(1, 'pflicht').max(30, 'zuLang').regex(TELEFON, 'telefon');

/** Geburtsdatum als JJJJ-MM-TT: echtes Datum, nicht in der Zukunft, höchstens 18 Jahre zurück (Kinder und Jugendliche). */
const geburtsdatum = z
  .string('pflicht')
  .trim()
  .min(1, 'pflicht')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'datum')
  .refine((s) => {
    const d = new Date(`${s}T12:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return false;
    const heute = new Date();
    const grenze = new Date(Date.UTC(heute.getUTCFullYear() - 18, heute.getUTCMonth(), heute.getUTCDate()));
    return d <= heute && d >= grenze;
  }, 'datum');

export const KLASSEN = ['kindergarten', 'vorbereitung', 'grundkurs'] as const;
export const GESCHLECHTER = ['maennlich', 'weiblich'] as const;

export const voranmeldungSchema = z.object({
  sprache: z.enum(['de', 'tr', 'en'], 'ungueltig'),
  // Schritt 1: Kind
  klasse: z.enum(KLASSEN, 'pflicht'),
  geschlecht: z.enum(GESCHLECHTER, 'pflicht'),
  vorname: pflicht(100),
  nachname: pflicht(100),
  geburtsdatum,
  // Schritt 2: Adresse
  strasse: pflicht(120),
  plz: z
    .string('pflicht')
    .trim()
    .min(1, 'pflicht')
    .regex(/^\d{5}$/, 'plz'),
  ort: pflicht(80),
  // Schritt 3: Eltern (Elternteil 2 freiwillig; E-Mail nur geprüft, wenn angegeben)
  eltern1Name: pflicht(100),
  eltern1Telefon: telefon,
  eltern1Email: email,
  eltern2Name: optional(100),
  eltern2Telefon: optional(30).refine((t) => t === '' || TELEFON.test(t), 'telefon'),
  eltern2Email: optional(254).refine((t) => t === '' || z.email().safeParse(t).success, 'email'),
  // Schritt 4: Zusatz und Einwilligungen
  geschwister: optional(500),
  ausgefuelltVon: pflicht(100),
  einwilligungKontakt: z.literal('ja', 'einwilligung'),
  einwilligungDatenschutz: z.literal('ja', 'einwilligung'),
});
export type Voranmeldung = z.infer<typeof voranmeldungSchema>;

/** Felder je Schritt (Reihenfolge wie im Design) – Grundlage für `wizardSchritt`. */
export const VORANMELDUNG_SCHRITTE = [
  ['klasse', 'geschlecht', 'vorname', 'nachname', 'geburtsdatum'],
  ['strasse', 'plz', 'ort'],
  ['eltern1Name', 'eltern1Telefon', 'eltern1Email', 'eltern2Name', 'eltern2Telefon', 'eltern2Email'],
  ['geschwister', 'ausgefuelltVon', 'einwilligungKontakt', 'einwilligungDatenschutz'],
] as const satisfies readonly (readonly (keyof Voranmeldung)[])[];
