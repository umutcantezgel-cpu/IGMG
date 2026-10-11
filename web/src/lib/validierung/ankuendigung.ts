import { TZDate } from '@date-fns/tz';
import { z } from 'zod';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { istErlaubterLink } from '@/lib/inhalt/links';

/**
 * Formular „Ankündigung“ der Verwaltung (V04, E-033, ADR 0005): ein Zod-Schema für Formular und Server Action.
 * Fehlermeldungen sind Schlüssel unter `verwaltung.ankuendigungen.fehler`; Feldnamen = Schlüssel des Schemas.
 * Bewusst ohne schwere Abhängigkeiten (kein `rrule`), weil die Formularkomponente im Browser dieselben Konstanten nutzt.
 */
export const PRIORITAETEN = ['niedrig', 'mittel', 'hoch'] as const;
export type Prioritaet = (typeof PRIORITAETEN)[number];

const ZEITZONE = 'Europe/Berlin';
const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const ZEIT = /^([01]\d|2[0-3]):[0-5]\d$/;
/** Ohne Uhrzeit: sichtbar ab 00:00 Uhr, läuft ab am Tagesende (23:59 Uhr), damit der Ablauftag noch gilt. */
export const BEGINN_OHNE_ZEIT = '00:00';
export const ENDE_OHNE_ZEIT = '23:59';

const pflichtText = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const text = (max: number) => z.string().trim().max(max, 'zuLang').default('');

export const ankuendigungSchema = z
  .object({
    id: z
      .uuid()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    titelDe: pflichtText(120),
    titelTr: text(120),
    titelEn: text(120),
    inhaltDe: pflichtText(500),
    inhaltTr: text(500),
    inhaltEn: text(500),
    prioritaet: z.enum(PRIORITAETEN, 'ungueltig').default('mittel'),
    organisation: z.enum(['at', 'kt', 'gt', 'kgt', ''], 'ungueltig').default(''),
    sichtbarAbDatum: text(10),
    sichtbarAbZeit: text(5),
    laeuftAbDatum: text(10),
    laeuftAbZeit: text(5),
    link: z
      .string()
      .trim()
      .max(500, 'zuLang')
      .refine((w) => w === '' || istErlaubterLink(w), 'link')
      .default(''),
    status: z.enum(['entwurf', 'veroeffentlicht'], 'ungueltig').default('entwurf'),
  })
  .superRefine((e, ctx) => {
    const fehler = (pfad: string, message: string) => ctx.addIssue({ code: 'custom', path: [pfad], message });
    if (e.sichtbarAbDatum && !gueltigesDatum(e.sichtbarAbDatum)) fehler('sichtbarAbDatum', 'datum');
    if (!e.sichtbarAbDatum && e.sichtbarAbZeit) fehler('sichtbarAbDatum', 'datumFehlt');
    if (e.sichtbarAbZeit && !ZEIT.test(e.sichtbarAbZeit)) fehler('sichtbarAbZeit', 'zeit');
    if (e.laeuftAbDatum && !gueltigesDatum(e.laeuftAbDatum)) fehler('laeuftAbDatum', 'datum');
    if (!e.laeuftAbDatum && e.laeuftAbZeit) fehler('laeuftAbDatum', 'datumFehlt');
    if (e.laeuftAbZeit && !ZEIT.test(e.laeuftAbZeit)) fehler('laeuftAbZeit', 'zeit');
    // Nur vergleichen, wenn beide Zeitpunkte gültig sind (ungültige Felder melden sich bereits selbst)
    const beginn = e.sichtbarAbDatum ? zeitpunktFuer(e.sichtbarAbDatum, e.sichtbarAbZeit || BEGINN_OHNE_ZEIT) : null;
    const ende = e.laeuftAbDatum ? zeitpunktFuer(e.laeuftAbDatum, e.laeuftAbZeit || ENDE_OHNE_ZEIT) : null;
    if (beginn && ende && ende.getTime() <= beginn.getTime()) fehler('laeuftAbDatum', 'laufzeit');
  });

export type AnkuendigungEingabe = z.infer<typeof ankuendigungSchema>;

/** FormData → Rohobjekt für das Schema (`$ACTION`-Felder der Formularschnittstelle fallen weg). */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string' && !k.startsWith('$ACTION')) roh[k] = v;
  return roh;
}

/** Wanduhrzeit Europe/Berlin → UTC-Zeitpunkt (K-05). */
export function zeitpunkt(datum: string, zeit: string): Date {
  const [j, m, t] = datum.split('-').map(Number);
  const [h, mi] = zeit.split(':').map(Number);
  return new Date(new TZDate(j, m - 1, t, h, mi, 0, ZEITZONE).getTime());
}

/** Zeitpunkt aus geprüften Teilen; ungültige Eingaben ergeben null. */
function zeitpunktFuer(datum: string, zeit: string): Date | null {
  return gueltigesDatum(datum) && ZEIT.test(zeit) ? zeitpunkt(datum, zeit) : null;
}

/** Kalendergültiges Datum JJJJ-MM-TT (31. Februar wird abgelehnt). */
function gueltigesDatum(datum: string): boolean {
  if (!DATUM.test(datum)) return false;
  const [j, m, t] = datum.split('-').map(Number);
  const probe = new Date(Date.UTC(j, m - 1, t));
  return probe.getUTCFullYear() === j && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === t;
}

/** Spalten der Tabelle `ankuendigung` aus der geprüften Eingabe (ohne id und Verwaltungsangaben). */
export function zuDatensatz(e: AnkuendigungEingabe) {
  const mehr = (de: string, tr: string, en: string): Mehrsprachig => ({ de, ...(tr ? { tr } : {}), ...(en ? { en } : {}) });
  return {
    titel: mehr(e.titelDe, e.titelTr, e.titelEn),
    inhalt: mehr(e.inhaltDe, e.inhaltTr, e.inhaltEn),
    prioritaet: e.prioritaet,
    organisation: e.organisation || null,
    sichtbarAb: e.sichtbarAbDatum ? zeitpunkt(e.sichtbarAbDatum, e.sichtbarAbZeit || BEGINN_OHNE_ZEIT) : null,
    laeuftAb: e.laeuftAbDatum ? zeitpunkt(e.laeuftAbDatum, e.laeuftAbZeit || ENDE_OHNE_ZEIT) : null,
    link: e.link || null,
    status: e.status,
  };
}
