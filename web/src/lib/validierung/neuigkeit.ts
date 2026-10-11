import { TZDate } from '@date-fns/tz';
import { z } from 'zod';
import { klartext as klartextAusDokument, lesezeit as lesezeitAusText } from '@/lib/inhalt/tiptap';
import { ORGANISATION_KUERZEL } from '@/lib/rechte/matrix';
import { lokalesDatum, ZEITZONE } from '@/lib/termine';
import { richtextFeld } from '@/lib/validierung/richtext';

/**
 * Formular „Neuigkeit“ der Verwaltung (V03, ADR 0002, ADR 0005, ADR 0006): ein Zod-Schema für Formular und Server
 * Action. Fehlermeldungen sind Schlüssel unter `verwaltung.neuigkeiten.fehler`; Feldnamen = Schlüssel des Schemas.
 * Bild (`bildId`) und Bildknoten im Text verweisen auf die Mediathek (C11b); ob die Medien nutzbare Bilder sind, prüft
 * die Action (Datenbank), das Schema nur das Format.
 */
export const NACHRICHT_KATEGORIEN = [
  'ankuendigung',
  'gemeinde',
  'veranstaltung',
  'bildung',
  'religioes',
  'soziales',
  'neuigkeiten',
] as const;

const DATUM_TEIL = /^\d{4}-\d{2}-\d{2}$/;
const UHRZEIT_TEIL = /^([01]\d|2[0-3]):[0-5]\d$/;

const pflichtText = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const text = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const schalter = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());
/** Rich-Text als Tiptap-JSON-Text aus dem Editor (ADR 0006); fehlend heißt leer. */
const richtext = z.preprocess((v) => v ?? '', richtextFeld);
const lesezeitFeld = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number('zahl').int('zahl').min(1, 'zahl').max(600, 'zahl').optional(),
);
const organisationFeld = z.union([z.literal(''), z.enum(ORGANISATION_KUERZEL, 'ungueltig')]).default('');

export const neuigkeitSchema = z
  .object({
    id: z
      .uuid()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    titelDe: pflichtText(160),
    titelTr: text(160),
    titelEn: text(160),
    kurztextDe: text(400),
    kurztextTr: text(400),
    kurztextEn: text(400),
    inhaltDe: richtext,
    inhaltTr: richtext,
    inhaltEn: richtext,
    kategorie: z.enum(NACHRICHT_KATEGORIEN, 'pflicht'),
    organisation: organisationFeld,
    status: z.enum(['entwurf', 'veroeffentlicht'], 'ungueltig').default('entwurf'),
    /** Wanduhrzeit Europe/Berlin im Format JJJJ-MM-TTTHH:MM; leer heißt „mit dem Speichern“ (siehe zuDatensatz). */
    veroeffentlichtAm: text(16),
    empfohlen: schalter,
    wichtig: schalter,
    lesezeit: lesezeitFeld,
    slug: z
      .string()
      .trim()
      .max(120, 'zuLang')
      .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, 'slug')
      .default(''),
    schlagwoerterDe: text(400),
    schlagwoerterTr: text(400),
    schlagwoerterEn: text(400),
    /** Titelbild aus der Mediathek (C11b); leer = kein Bild */
    bildId: z.union([z.literal(''), z.uuid('ungueltig')]).default(''),
  })
  .superRefine((e, ctx) => {
    const fehler = (pfad: string, message: string) => ctx.addIssue({ code: 'custom', path: [pfad], message });
    // Übersetzungen brauchen die deutsche Fassung, sonst gibt es keine Rückfallsprache (ADR 0002)
    if ((e.kurztextTr || e.kurztextEn) && !e.kurztextDe) fehler('kurztextDe', 'pflicht');
    if ((e.inhaltTr || e.inhaltEn) && !e.inhaltDe) fehler('inhaltDe', 'pflicht');
    if (e.veroeffentlichtAm && !veroeffentlichungGueltig(e.veroeffentlichtAm)) fehler('veroeffentlichtAm', 'datum');
    // Schlagwörter: je Sprache eine Kommaliste; Übersetzungen mit genauso vielen Einträgen wie das Deutsche
    const deAnzahl = kommaliste(e.schlagwoerterDe).length;
    for (const [feld, wert] of [
      ['schlagwoerterTr', e.schlagwoerterTr],
      ['schlagwoerterEn', e.schlagwoerterEn],
    ] as const) {
      const anzahl = kommaliste(wert).length;
      if (anzahl > 0 && anzahl !== deAnzahl) fehler(feld, 'uebersetzungZeilen');
    }
  });

export type NeuigkeitEingabe = z.infer<typeof neuigkeitSchema>;

/** FormData → Rohobjekt für das Schema; Next.js-Felder ($ACTION…) fallen weg. */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string' && !k.startsWith('$ACTION')) roh[k] = v;
  return roh;
}

/** Kommaliste (Schlagwörter); leere Einträge fallen weg. */
export function kommaliste(wert: string): string[] {
  return wert
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Slug aus dem deutschen Titel (ä → ae …), höchstens 80 Zeichen. Ohne lateinische Buchstaben: „nachricht“. */
export function slugAus(titel: string): string {
  const slug = titel
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replaceAll('ı', 'i')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return slug || 'nachricht';
}

/** Wanduhrzeit in Europe/Berlin → UTC-Zeitpunkt (K-05). */
function wanduhrZuZeitpunkt(datum: string, zeit: string): Date {
  const [j, m, t] = datum.split('-').map(Number);
  const [h, mi] = zeit.split(':').map(Number);
  return new Date(new TZDate(j, m - 1, t, h, mi, 0, ZEITZONE).getTime());
}

/** Ist der Wert des Felds „Veröffentlichen am“ ein wirkliches Datum mit Uhrzeit (kein 30. Februar)? */
export function veroeffentlichungGueltig(wert: string): boolean {
  const [datum = '', zeit = ''] = wert.split('T');
  if (!DATUM_TEIL.test(datum) || !UHRZEIT_TEIL.test(zeit)) return false;
  return lokalesDatum(wanduhrZuZeitpunkt(datum, zeit)) === datum;
}

/** Zeitpunkt aus dem geprüften Feld „Veröffentlichen am“ (Wanduhrzeit Europe/Berlin). */
function veroeffentlichungAus(wert: string): Date {
  const [datum, zeit] = wert.split('T');
  return wanduhrZuZeitpunkt(datum, zeit);
}

type Mehrsprachig = { de: string; tr?: string; en?: string };

function mehr(de: string, tr: string, en: string): Mehrsprachig {
  return { de, ...(tr ? { tr } : {}), ...(en ? { en } : {}) };
}

function mehrOderNull(de: string, tr: string, en: string): Mehrsprachig | null {
  return de || tr || en ? mehr(de, tr, en) : null;
}

/** Zusätzliche Angaben, die nur die Aktion kennt: der bisherige Veröffentlichungszeitpunkt und „jetzt“. */
export type DatensatzZusatz = { veroeffentlichtBisher: Date | null; jetzt: Date };

/**
 * Datensatz für die Tabelle `nachricht` aus der geprüften Eingabe (ohne id, slug und Angaben zur Bearbeitung).
 * Veröffentlichen ohne Datum heißt: jetzt. Ein früher gesetzter Zeitpunkt bleibt erhalten, wenn das Feld leer ist.
 * Die Suchspalte `klartext` entsteht hier (Titel, Kurztext, Text, Schlagwörter), die Lesezeit aus dem deutschen Text.
 */
export function zuDatensatz(e: NeuigkeitEingabe, zusatz: DatensatzZusatz) {
  const klartextDe = klartextAusDokument(e.inhaltDe);
  const klartextTr = klartextAusDokument(e.inhaltTr);
  const klartextEn = klartextAusDokument(e.inhaltEn);
  const veroeffentlichtAm = e.veroeffentlichtAm
    ? veroeffentlichungAus(e.veroeffentlichtAm)
    : e.status === 'veroeffentlicht'
      ? (zusatz.veroeffentlichtBisher ?? zusatz.jetzt)
      : null;
  const schlagwoerterDe = kommaliste(e.schlagwoerterDe);
  const schlagwoerterTr = kommaliste(e.schlagwoerterTr);
  const schlagwoerterEn = kommaliste(e.schlagwoerterEn);
  const trText = [e.titelTr, e.kurztextTr, klartextTr, e.schlagwoerterTr].filter(Boolean).join('\n');
  const enText = [e.titelEn, e.kurztextEn, klartextEn, e.schlagwoerterEn].filter(Boolean).join('\n');
  return {
    titel: mehr(e.titelDe, e.titelTr, e.titelEn),
    kurztext: mehrOderNull(e.kurztextDe, e.kurztextTr, e.kurztextEn),
    inhalt: e.inhaltDe ? { de: e.inhaltDe, ...(e.inhaltTr ? { tr: e.inhaltTr } : {}), ...(e.inhaltEn ? { en: e.inhaltEn } : {}) } : null,
    kategorie: e.kategorie,
    organisation: e.organisation || null,
    status: e.status,
    veroeffentlichtAm,
    empfohlen: e.empfohlen,
    wichtig: e.wichtig,
    lesezeit: e.lesezeit ?? (klartextDe ? lesezeitAusText(klartextDe) : null),
    bildId: e.bildId || null,
    schlagwoerter: schlagwoerterDe.map((s, i) => mehr(s, schlagwoerterTr[i] ?? '', schlagwoerterEn[i] ?? '')),
    klartext: {
      de: [e.titelDe, e.kurztextDe, klartextDe, e.schlagwoerterDe].filter(Boolean).join('\n'),
      ...(trText ? { tr: trText } : {}),
      ...(enText ? { en: enText } : {}),
    },
  };
}
