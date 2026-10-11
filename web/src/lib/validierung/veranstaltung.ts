import { TZDate } from '@date-fns/tz';
import type { JSONContent } from '@tiptap/core';
import { z } from 'zod';
import { dokumentAusAbsaetzen } from '@/lib/inhalt/tiptap';
import { ZEITZONE } from '@/lib/termine';
import { baueRegel, ENDE_ARTEN, regelGueltig, WIEDERHOLUNG_ARTEN, WOCHENTAGE } from '@/lib/termine/regel';

/**
 * Formular „Veranstaltung“ der Verwaltung (V02, K-09, ADR 0005): ein Zod-Schema für Formular und Server Action.
 * Fehlermeldungen sind Schlüssel unter `verwaltung.veranstaltungen.fehler`. Feldnamen = Schlüssel des Schemas.
 */
export const KATEGORIEN = ['gebet', 'bildung', 'gemeinde', 'kultur', 'jugend', 'frauen'] as const;
export const ORGANISATIONEN = ['at', 'kt', 'gt', 'kgt'] as const;
export const SPRACHFELDER = ['De', 'Tr', 'En'] as const;

const ZEIT = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

const pflichtText = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const text = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const schalter = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());
const zahlOptional = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().int('zahl').min(min, 'zahl').max(max, 'zahl').optional(),
  );

export const veranstaltungSchema = z
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
    beschreibungDe: text(10_000),
    beschreibungTr: text(10_000),
    beschreibungEn: text(10_000),
    slug: z
      .string()
      .trim()
      .max(120, 'zuLang')
      .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, 'slug')
      .default(''),
    kategorie: z.enum(KATEGORIEN, 'pflicht'),
    organisation: z.enum(['at', 'kt', 'gt', 'kgt', ''], 'ungueltig').default(''),
    zielgruppeDe: text(160),
    zielgruppeTr: text(160),
    zielgruppeEn: text(160),
    ortDe: text(160),
    ortTr: text(160),
    ortEn: text(160),
    datum: z.string('datum').regex(DATUM, 'datum'),
    ganztaegig: schalter,
    beginnZeit: z.string().trim().default(''),
    endeZeit: z.string().trim().default(''),
    whArt: z.enum(WIEDERHOLUNG_ARTEN, 'ungueltig').default('einmalig'),
    whIntervall: z.preprocess((v) => (v === '' || v == null ? 1 : Number(v)), z.number().int('zahl').min(1, 'zahl').max(12, 'zahl')),
    whTage: z.array(z.enum(WOCHENTAGE, 'ungueltig')).default([]),
    whPosition: z.preprocess(
      (v) => (v === '' || v == null ? 1 : Number(v)),
      z.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3), z.literal(4)], 'ungueltig'),
    ),
    whEnde: z.enum(ENDE_ARTEN, 'ungueltig').default('nie'),
    whEndeDatum: z.string().trim().default(''),
    whAnzahl: zahlOptional(1, 500),
    whRoh: text(300),
    ausnahmen: z.array(z.string().regex(DATUM, 'datum')).max(200, 'zuLang').default([]),
    anmeldungAktiv: schalter,
    plaetze: zahlOptional(1, 100_000),
    kosten: z.enum(['kostenlos', 'kostenpflichtig'], 'ungueltig').default('kostenlos'),
    empfohlen: schalter,
    programmDe: text(4000),
    programmTr: text(4000),
    programmEn: text(4000),
    hinweiseDe: text(2000),
    hinweiseTr: text(2000),
    hinweiseEn: text(2000),
    schlagwoerterDe: text(400),
    schlagwoerterTr: text(400),
    schlagwoerterEn: text(400),
    veranstalterName: text(120),
    veranstalterFunktionDe: text(120),
    veranstalterFunktionTr: text(120),
    veranstalterFunktionEn: text(120),
    kontaktName: text(120),
    kontaktTelefon: text(60),
    kontaktEmail: z.union([z.literal(''), z.email('email').max(254, 'zuLang')]).default(''),
    status: z.enum(['entwurf', 'veroeffentlicht'], 'ungueltig').default('entwurf'),
  })
  .superRefine((e, ctx) => {
    const fehler = (pfad: string, message: string) => ctx.addIssue({ code: 'custom', path: [pfad], message });
    if (!e.ganztaegig && !ZEIT.test(e.beginnZeit)) fehler('beginnZeit', 'zeit');
    if (e.endeZeit && !ZEIT.test(e.endeZeit)) fehler('endeZeit', 'zeit');
    if (!e.ganztaegig && ZEIT.test(e.beginnZeit) && ZEIT.test(e.endeZeit) && e.endeZeit <= e.beginnZeit)
      fehler('endeZeit', 'endeVorBeginn');
    if (e.whArt !== 'einmalig' && e.whArt !== 'eigene') {
      if (e.whEnde === 'datum' && (!DATUM.test(e.whEndeDatum) || e.whEndeDatum < e.datum)) fehler('whEndeDatum', 'endeDatum');
      if (e.whEnde === 'anzahl' && !e.whAnzahl) fehler('whAnzahl', 'zahl');
    }
    if (e.whArt === 'eigene' && !e.whRoh) fehler('whRoh', 'regel');
    for (const s of SPRACHFELDER) {
      const zeilen = e[`programm${s}`].split('\n').filter((z) => z.trim());
      if (zeilen.some((z) => !/^([01]\d|2[0-3]):[0-5]\d\s+\S/.test(z.trim()))) fehler(`programm${s}`, 'programm');
    }
    for (const feld of ['programm', 'hinweise', 'schlagwoerter'] as const) {
      const anzahl = (s: (typeof SPRACHFELDER)[number]) => liste(e[`${feld}${s}`], feld === 'schlagwoerter' ? ',' : '\n').length;
      for (const s of ['Tr', 'En'] as const) if (anzahl(s) > 0 && anzahl(s) !== anzahl('De')) fehler(`${feld}${s}`, 'uebersetzungZeilen');
    }
    if (e.veranstalterFunktionDe && !e.veranstalterName) fehler('veranstalterName', 'pflicht');
    if (e.ausnahmen.some((d) => d < e.datum)) fehler('ausnahmen', 'ausnahmeVorBeginn');
  });

export type VeranstaltungEingabe = z.infer<typeof veranstaltungSchema>;
export type FeldName = keyof z.input<typeof veranstaltungSchema>;

/** FormData → Rohobjekt für das Schema (Mehrfachfelder als Liste). */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== 'string' || k.startsWith('$ACTION')) continue;
    if (k === 'whTage' || k === 'ausnahmen') (roh[k] = (roh[k] as string[] | undefined) ?? []).push(v);
    else roh[k] = v;
  }
  return roh;
}

/** Zerlegt Zeilen- bzw. Kommalisten, leere Einträge fallen weg. */
export function liste(wert: string, trenner: '\n' | ','): string[] {
  return wert
    .split(trenner)
    .map((t) => t.trim())
    .filter(Boolean);
}

type Mehrsprachig = { de: string; tr?: string; en?: string };
function mehr(de: string, tr: string, en: string): Mehrsprachig {
  return { de, ...(tr ? { tr } : {}), ...(en ? { en } : {}) };
}
function mehrOderNull(de: string, tr: string, en: string): Mehrsprachig | null {
  return de || tr || en ? mehr(de, tr, en) : null;
}

/** Wanduhrzeit Europe/Berlin → UTC-Zeitpunkt (K-05). */
export function zeitpunkt(datum: string, zeit: string): Date {
  const [j, m, t] = datum.split('-').map(Number);
  const [h, mi] = (zeit || '00:00').split(':').map(Number);
  return new Date(new TZDate(j, m - 1, t, h, mi, 0, ZEITZONE).getTime());
}

/** Slug aus dem deutschen Titel (ä → ae …), höchstens 80 Zeichen. */
export function slugAus(titel: string): string {
  return (
    titel
      .toLowerCase()
      .replaceAll('ä', 'ae')
      .replaceAll('ö', 'oe')
      .replaceAll('ü', 'ue')
      .replaceAll('ß', 'ss')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ı/g, 'i')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/, '') || 'veranstaltung'
  );
}

/** Datensatz für die Tabelle `veranstaltung` aus der geprüften Eingabe (ohne id, slug, Status-Metadaten). */
export function zuDatensatz(e: VeranstaltungEingabe) {
  const beginn = zeitpunkt(e.datum, e.ganztaegig ? '00:00' : e.beginnZeit);
  const ende = !e.ganztaegig && e.endeZeit ? zeitpunkt(e.datum, e.endeZeit) : null;
  const wiederholung = baueRegel(
    {
      art: e.whArt,
      intervall: e.whIntervall,
      wochentage: e.whTage,
      position: e.whPosition,
      ende: e.whEnde,
      endeDatum: e.whEndeDatum || undefined,
      anzahl: e.whAnzahl,
      roh: e.whRoh,
    },
    beginn,
  );
  const absaetze = (t: string) => t.split(/\n\s*\n/).map((a) => a.replace(/\s*\n\s*/g, ' ').trim());
  const rich = (t: string): JSONContent | undefined => (t ? dokumentAusAbsaetzen(absaetze(t)) : undefined);
  const programmZeilen = (t: string) => liste(t, '\n').map((z) => ({ zeit: z.slice(0, 5), text: z.slice(5).trim() }));
  const pDe = programmZeilen(e.programmDe);
  const pTr = programmZeilen(e.programmTr);
  const pEn = programmZeilen(e.programmEn);
  const zeilenweise = (de: string[], tr: string[], en: string[]) => de.map((d, i) => mehr(d, tr[i] ?? '', en[i] ?? ''));
  const beschreibungDe = rich(e.beschreibungDe);
  return {
    titel: mehr(e.titelDe, e.titelTr, e.titelEn),
    kurztext: mehrOderNull(e.kurztextDe, e.kurztextTr, e.kurztextEn),
    beschreibung: beschreibungDe
      ? {
          de: beschreibungDe,
          ...(e.beschreibungTr ? { tr: rich(e.beschreibungTr) } : {}),
          ...(e.beschreibungEn ? { en: rich(e.beschreibungEn) } : {}),
        }
      : null,
    kategorie: e.kategorie,
    organisation: e.organisation || null,
    zielgruppe: mehrOderNull(e.zielgruppeDe, e.zielgruppeTr, e.zielgruppeEn),
    ort: mehrOderNull(e.ortDe, e.ortTr, e.ortEn),
    beginn,
    ende,
    ganztaegig: e.ganztaegig,
    wiederholung,
    ausnahmen: wiederholung ? [...new Set(e.ausnahmen)].sort() : [],
    anmeldungAktiv: e.anmeldungAktiv,
    plaetze: e.anmeldungAktiv ? (e.plaetze ?? null) : null,
    kosten: e.kosten,
    empfohlen: e.empfohlen,
    programm: pDe.map((p, i) => ({ zeit: p.zeit, text: mehr(p.text, pTr[i]?.text ?? '', pEn[i]?.text ?? '') })),
    hinweise: zeilenweise(liste(e.hinweiseDe, '\n'), liste(e.hinweiseTr, '\n'), liste(e.hinweiseEn, '\n')),
    schlagwoerter: zeilenweise(liste(e.schlagwoerterDe, ','), liste(e.schlagwoerterTr, ','), liste(e.schlagwoerterEn, ',')),
    veranstalter: e.veranstalterName
      ? {
          name: e.veranstalterName,
          ...(e.veranstalterFunktionDe
            ? { funktion: mehr(e.veranstalterFunktionDe, e.veranstalterFunktionTr, e.veranstalterFunktionEn) }
            : {}),
        }
      : null,
    kontakt:
      e.kontaktName || e.kontaktTelefon || e.kontaktEmail
        ? {
            ...(e.kontaktName ? { name: e.kontaktName } : {}),
            ...(e.kontaktTelefon ? { telefon: e.kontaktTelefon } : {}),
            ...(e.kontaktEmail ? { email: e.kontaktEmail } : {}),
          }
        : null,
    status: e.status,
    klartext: {
      de: [e.titelDe, e.kurztextDe, e.beschreibungDe, e.ortDe, e.zielgruppeDe, e.schlagwoerterDe].filter(Boolean).join('\n'),
      ...(e.titelTr ? { tr: [e.titelTr, e.kurztextTr, e.beschreibungTr, e.ortTr].filter(Boolean).join('\n') } : {}),
      ...(e.titelEn ? { en: [e.titelEn, e.kurztextEn, e.beschreibungEn, e.ortEn].filter(Boolean).join('\n') } : {}),
    },
  };
}

/** Prüft die Regel nach dem Bau (auch „eigene“). */
export function regelFehler(e: VeranstaltungEingabe): string | null {
  const d = zuDatensatz(e);
  return regelGueltig(d.wiederholung) ? null : 'regel';
}
