import { z } from 'zod';
import { FREIGABE_STATUS, RELIGIOESE_ARTEN } from '@/lib/religioes/freigabe';
import { richtextFeld } from './richtext';

/**
 * Formulare der Verwaltung „Koran & Hadith“ (ADR 0030): ein Zod-Schema je Formular für Client und Server Action.
 * Fehler sind Schlüssel unter `verwaltung.koran.fehler`. Die Texte selbst verfassen Menschen (Imam, Hoca) – der Code
 * prüft nur Länge und Form, nie den Inhalt. Arabische Felder (Wurzel) schreibt ebenfalls nur die Lehrkraft.
 */
export const BEDEUTUNG_SPRACHEN = ['de', 'tr'] as const;
export const HADITH_SPRACHEN = ['de', 'tr', 'en'] as const;
export const HADITH_LISTEN = ['auswahl', 'des-tages'] as const;
export type HadithListe = (typeof HADITH_LISTEN)[number];

const pflicht = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const frei = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const mehrzeilig = (max: number, pflichtfeld = false) => {
  const basis = z
    .string('pflicht')
    .max(max, 'zuLang')
    .transform((s) => s.replace(/\r\n?/g, '\n').trim());
  return pflichtfeld ? basis.pipe(z.string().min(1, 'pflicht')) : basis.default('');
};
const ganz = (min: number, max: number) => z.coerce.number('ungueltig').int('ungueltig').min(min, 'ungueltig').max(max, 'ungueltig');
/** Rich-Text aus dem Editor (Tiptap-JSON als Text); fehlt das Feld, gilt es als leer. */
const richtext = z.preprocess((v) => v ?? '', richtextFeld);
const schalter = z.preprocess((v) => v === '1' || v === 'on' || v === 'true', z.boolean());

/** Hadith-Nummer der Quelle („1“, „402.2“). */
export const hadithNummer = z
  .string('pflicht')
  .trim()
  .min(1, 'pflicht')
  .max(12, 'ungueltig')
  .regex(/^\d{1,5}(\.\d{1,2})?$/, 'nummer');

/** Wortbedeutung je Wortform und Sprache (gilt für alle Vorkommen der Form). */
export const bedeutungSchema = z.object({
  formId: ganz(1, 10_000_000),
  sprache: z.enum(BEDEUTUNG_SPRACHEN, 'ungueltig'),
  bedeutung: pflicht(300),
  wurzel: frei(60),
  anmerkung: mehrzeilig(600),
  einreichen: schalter,
});

/** Abweichende Bedeutung an einer Stelle (Sure:Vers, Wort). */
export const ortSchema = z.object({
  sure: ganz(1, 114),
  vers: ganz(1, 286),
  pos: ganz(1, 200),
  sprache: z.enum(BEDEUTUNG_SPRACHEN, 'ungueltig'),
  bedeutung: pflicht(300),
  einreichen: schalter,
});

export const ortSchluesselSchema = ortSchema.pick({ sure: true, vers: true, pos: true, sprache: true });

/** Tajwid-Regeltext: Name, Kurztext und Erklärung de/tr. Der deutsche Name ist Pflicht. */
export const tajwidSchema = z.object({
  schluessel: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{2,40}$/, 'ungueltig'),
  nameDe: pflicht(80),
  nameTr: frei(80),
  kurzDe: mehrzeilig(300),
  kurzTr: mehrzeilig(300),
  erklaerungDe: richtext,
  erklaerungTr: richtext,
  einreichen: schalter,
});

/** Hadith-Übersetzung je Nummer und Sprache mit Herkunft (Übersetzer, Quelle, Lizenz). */
export const hadithUebersetzungSchema = z.object({
  nummer: hadithNummer,
  sprache: z.enum(HADITH_SPRACHEN, 'ungueltig'),
  text: mehrzeilig(20_000, true),
  uebersetzer: pflicht(200),
  quelle: pflicht(300),
  lizenz: pflicht(300),
  einreichen: schalter,
});

/** Statuswechsel ohne inhaltliche Änderung (einreichen, freigeben, zurückweisen) mit optionalem Grund. */
export const statusSchema = z
  .object({
    art: z.enum(RELIGIOESE_ARTEN, 'ungueltig'),
    kennung: z.string().trim().min(1, 'ungueltig').max(200, 'ungueltig'),
    ziel: z.enum(FREIGABE_STATUS, 'ungueltig'),
    grund: frei(300),
  })
  .superRefine((e, ctx) => {
    if (e.ziel === 'entwurf' && e.grund.length < 3) ctx.addIssue({ code: 'custom', path: ['grund'], message: 'grundFehlt' });
  });

export const listenSchema = z.object({
  liste: z.enum(HADITH_LISTEN, 'ungueltig'),
  nummer: hadithNummer,
});

export const verschiebenSchema = listenSchema.extend({ richtung: z.enum(['hoch', 'runter'], 'ungueltig') });

export const ausgabeSchema = z.object({ id: z.string().trim().min(1, 'ungueltig').max(120, 'ungueltig') });

/** FormData → Rohobjekt (nur Textfelder, ohne interne Felder von React). */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string' && !k.startsWith('$ACTION')) roh[k] = v;
  return roh;
}

/** Feldfehler eines fehlgeschlagenen Parse als { feld: schlüssel }. */
export function feldFehler(fehler: z.ZodError): Record<string, string> {
  const ergebnis: Record<string, string> = {};
  for (const f of fehler.issues) {
    const feld = String(f.path[0] ?? '');
    if (feld && !ergebnis[feld]) ergebnis[feld] = f.message;
  }
  return ergebnis;
}
