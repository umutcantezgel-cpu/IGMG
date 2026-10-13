import { z } from 'zod';
import {
  CHAT_MINDESTALTER_HOECHSTENS,
  chatFensterGueltig,
  GEMEINDE_ROLLEN,
  istDatum,
  istUhrzeit,
  KURSARTEN,
  MINDESTALTER_UNTERGRENZE,
  tageZwischen,
  TERMINE_HOECHSTENS_TAGE,
} from '@/lib/lernen/verwaltung';

/**
 * Formulare der Verwaltung „Lernen und Aufnahme“ (Muster 6, ADR 0005): ein Schema für Client und Server. Fehler sind
 * Schlüssel unter `verwaltung.gruppen.fehler.*` bzw. `verwaltung.gemeindeKonten.fehler.*`.
 */
const leerOder = <T extends z.ZodType>(s: T) => z.union([z.literal(''), s]);
const datum = z.string().trim().refine(istDatum, 'datum');
const uhrzeit = z.string().trim().refine(istUhrzeit, 'uhrzeit');

export const gruppeSchema = z
  .object({
    id: leerOder(z.uuid('ungueltig')).default(''),
    nameDe: z.string('pflicht').trim().min(2, 'pflicht').max(120, 'zuLang'),
    nameTr: z.string().trim().max(120, 'zuLang').default(''),
    kursId: leerOder(z.uuid('ungueltig')).default(''),
    kursart: leerOder(z.enum(KURSARTEN, 'ungueltig')).default(''),
    schuljahr: z.string().trim().max(20, 'zuLang').default(''),
    beginn: leerOder(datum).default(''),
    ende: leerOder(datum).default(''),
    ort: z.string().trim().max(120, 'zuLang').default(''),
    wochentage: z.array(z.coerce.number().int().min(0, 'ungueltig').max(6, 'ungueltig')).max(7).default([]),
    uhrzeitVon: leerOder(uhrzeit).default(''),
    uhrzeitBis: leerOder(uhrzeit).default(''),
    chatModus: z.enum(['aus', 'nur_lehrkraft', 'offen'], 'ungueltig'),
    chatMindestalter: z.coerce
      .number('mindestalter')
      .int('mindestalter')
      .min(MINDESTALTER_UNTERGRENZE, 'mindestalter')
      .max(CHAT_MINDESTALTER_HOECHSTENS, 'mindestalter'),
    chatVon: uhrzeit,
    chatBis: uhrzeit,
    status: z.enum(['aktiv', 'archiviert'], 'ungueltig'),
  })
  .refine((d) => !d.beginn || !d.ende || d.beginn <= d.ende, { path: ['ende'], message: 'endeVorBeginn' })
  .refine((d) => !d.uhrzeitVon || !d.uhrzeitBis || d.uhrzeitVon < d.uhrzeitBis, { path: ['uhrzeitBis'], message: 'bisVorVon' })
  .refine((d) => chatFensterGueltig(d.chatVon, d.chatBis), { path: ['chatBis'], message: 'chatFenster' });
export type GruppeEingabe = z.infer<typeof gruppeSchema>;

/** Formular → Eingabe (Mehrfachfeld Wochentage). */
export function gruppeAusFormular(fd: FormData): Record<string, unknown> {
  const wert = (k: string) => {
    const v = fd.get(k);
    return typeof v === 'string' ? v : undefined;
  };
  return {
    id: wert('id') ?? '',
    nameDe: wert('nameDe'),
    nameTr: wert('nameTr') ?? '',
    kursId: wert('kursId') ?? '',
    kursart: wert('kursart') ?? '',
    schuljahr: wert('schuljahr') ?? '',
    beginn: wert('beginn') ?? '',
    ende: wert('ende') ?? '',
    ort: wert('ort') ?? '',
    wochentage: fd.getAll('wochentage').map(String),
    uhrzeitVon: wert('uhrzeitVon') ?? '',
    uhrzeitBis: wert('uhrzeitBis') ?? '',
    chatModus: wert('chatModus'),
    chatMindestalter: wert('chatMindestalter'),
    chatVon: wert('chatVon'),
    chatBis: wert('chatBis'),
    status: wert('status') ?? 'aktiv',
  };
}

/** Datensatz für `gruppe` aus der geprüften Eingabe (nur Spalten des Schemas). */
export function gruppeDatensatz(e: GruppeEingabe) {
  return {
    name: e.nameTr ? { de: e.nameDe, tr: e.nameTr } : { de: e.nameDe },
    kursId: e.kursId || null,
    kursart: e.kursart || null,
    schuljahr: e.schuljahr || null,
    beginn: e.beginn || null,
    ende: e.ende || null,
    ort: e.ort || null,
    wochentage: [...new Set(e.wochentage)].sort((a, b) => a - b),
    uhrzeitVon: e.uhrzeitVon || null,
    uhrzeitBis: e.uhrzeitBis || null,
    chatModus: e.chatModus,
    chatMindestalter: e.chatMindestalter,
    chatVon: e.chatVon,
    chatBis: e.chatBis,
    status: e.status,
  };
}

export const termineSchema = z
  .object({ gruppeId: z.uuid('ungueltig'), von: datum, bis: datum })
  .refine((d) => d.von <= d.bis, { path: ['bis'], message: 'endeVorBeginn' })
  .refine((d) => tageZwischen(d.von, d.bis) <= TERMINE_HOECHSTENS_TAGE, { path: ['bis'], message: 'zeitraumZuLang' });

export const leitungSchema = z.object({
  gruppeId: z.uuid('ungueltig'),
  benutzerId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, 'ungueltig'),
  rolle: z.enum(['lehrkraft', 'aufsicht'], 'ungueltig'),
});

export const mitgliedSchema = z.object({ gruppeId: z.uuid('ungueltig'), lernendeId: z.uuid('ungueltig') });

export const stufeSchema = z.object({
  kursart: z.enum(KURSARTEN, 'ungueltig'),
  titelDe: z.string('pflicht').trim().min(2, 'pflicht').max(120, 'zuLang'),
  titelTr: z.string().trim().max(120, 'zuLang').default(''),
});

/** Einladung in ein Gemeinde-Konto (Lehrkraft, Schüler ab 16, Eltern). Schüler nur mit Bezug auf Lernende (Alter geprüft). */
export const gemeindeEinladungSchema = z
  .object({
    name: z.string('pflicht').trim().min(2, 'pflicht').max(100, 'zuLang'),
    email: z.string('email').trim().toLowerCase().max(254, 'zuLang').pipe(z.email('email')),
    art: z.enum(['eltern', 'lehrkraft', 'schueler'], 'ungueltig'),
    lernendeId: leerOder(z.uuid('ungueltig')).default(''),
    gueltigTage: z.coerce.number('ungueltig').int('ungueltig').min(1, 'ungueltig').max(30, 'ungueltig').default(14),
  })
  .refine((d) => d.art !== 'schueler' || d.lernendeId !== '', { path: ['lernendeId'], message: 'schuelerOhneLernende' })
  .refine((d) => d.art !== 'lehrkraft' || d.lernendeId === '', { path: ['lernendeId'], message: 'lehrkraftMitLernende' });
export type GemeindeEinladungEingabe = z.infer<typeof gemeindeEinladungSchema>;

/** Startwerte des Gruppenformulars (Texte; Wochentage als Liste). Ohne Gruppe: neue Gruppe mit sicheren Standards. */
export function gruppeFormularWerte(g?: {
  id: string;
  name: { de: string; tr?: string };
  kursId: string | null;
  kursart: string | null;
  schuljahr: string | null;
  beginn: string | null;
  ende: string | null;
  ort: string | null;
  wochentage: number[];
  uhrzeitVon: string | null;
  uhrzeitBis: string | null;
  chatModus: string;
  chatMindestalter: number;
  chatVon: string;
  chatBis: string;
  status: string;
}): Record<string, string | string[]> {
  if (!g) return { id: '', chatModus: 'aus', chatMindestalter: '10', chatVon: '08:00', chatBis: '20:00', status: 'aktiv', wochentage: [] };
  return {
    id: g.id,
    nameDe: g.name.de,
    nameTr: g.name.tr ?? '',
    kursId: g.kursId ?? '',
    kursart: g.kursart ?? '',
    schuljahr: g.schuljahr ?? '',
    beginn: g.beginn ?? '',
    ende: g.ende ?? '',
    ort: g.ort ?? '',
    wochentage: g.wochentage.map(String),
    uhrzeitVon: g.uhrzeitVon ?? '',
    uhrzeitBis: g.uhrzeitBis ?? '',
    chatModus: g.chatModus,
    chatMindestalter: String(g.chatMindestalter),
    chatVon: g.chatVon,
    chatBis: g.chatBis,
    status: g.status,
  };
}

export const gemeindeRollenSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, 'ungueltig'),
  rollen: z.array(z.enum(GEMEINDE_ROLLEN, 'ungueltig')).max(4),
});
