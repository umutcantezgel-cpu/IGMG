import { z } from 'zod';
import type { schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';

/**
 * Formular „Kurs“ der Verwaltung (V06, K-02, ADR 0005): ein Zod-Schema für Formular und Server Action. Fehlermeldungen
 * sind Schlüssel unter `verwaltung.kurse.fehler`, Feldnamen = Schlüssel des Schemas. Deutsch ist Pflicht, Türkisch und
 * Englisch sind optional. Kurse enthalten keine Personendaten.
 */
export const KURS_VERFUEGBARKEIT = ['voranmeldung', 'ohne_anmeldung', 'geschlossen'] as const;
export const KURS_STATUS = ['entwurf', 'veroeffentlicht'] as const;

/** Mehrsprachige Felder außer dem Titel: Deutsch ist Pflicht, sobald eine Übersetzung eingetragen ist. */
const MEHRSPRACHIG = ['beschreibung', 'zielgruppe', 'alter', 'zeiten', 'dauer', 'ort', 'leitung', 'kosten', 'hinweis', 'inhalte'] as const;

/** Eine Zeile je Eintrag; Leerzeilen fallen weg. */
export function zeilenVon(wert: string): string[] {
  return wert
    .split('\n')
    .map((zeile) => zeile.trim())
    .filter(Boolean);
}

const pflichtText = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const text = (max: number) => z.string().trim().max(max, 'zuLang').default('');
/** Mehrzeiliger Text: Zeilenenden vereinheitlicht, weil Browser CRLF senden. */
const mehrzeilig = (max: number) =>
  z
    .string()
    .max(max, 'zuLang')
    .transform((s) => s.replace(/\r\n?/g, '\n').trim())
    .default('');
const schalter = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());
const zahlOptional = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number('zahl').int('zahl').min(min, 'zahl').max(max, 'zahl').optional(),
  );
const zahl = (min: number, max: number, vorgabe: number) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? vorgabe : Number(v)),
    z.number('zahl').int('zahl').min(min, 'zahl').max(max, 'zahl'),
  );

export const kursSchema = z
  .object({
    id: z
      .uuid()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    titelDe: pflichtText(160),
    titelTr: text(160),
    titelEn: text(160),
    beschreibungDe: mehrzeilig(4000),
    beschreibungTr: mehrzeilig(4000),
    beschreibungEn: mehrzeilig(4000),
    zielgruppeDe: text(160),
    zielgruppeTr: text(160),
    zielgruppeEn: text(160),
    alterDe: text(120),
    alterTr: text(120),
    alterEn: text(120),
    zeitenDe: text(200),
    zeitenTr: text(200),
    zeitenEn: text(200),
    dauerDe: text(120),
    dauerTr: text(120),
    dauerEn: text(120),
    ortDe: text(160),
    ortTr: text(160),
    ortEn: text(160),
    leitungDe: text(160),
    leitungTr: text(160),
    leitungEn: text(160),
    kostenDe: text(160),
    kostenTr: text(160),
    kostenEn: text(160),
    hinweisDe: mehrzeilig(400),
    hinweisTr: mehrzeilig(400),
    hinweisEn: mehrzeilig(400),
    inhalteDe: mehrzeilig(4000),
    inhalteTr: mehrzeilig(4000),
    inhalteEn: mehrzeilig(4000),
    plaetze: zahlOptional(1, 100_000),
    verfuegbarkeit: z.enum(KURS_VERFUEGBARKEIT, 'ungueltig').default('voranmeldung'),
    empfohlen: schalter,
    sortierung: zahl(0, 9999, 0),
    slug: z
      .string()
      .trim()
      .max(120, 'zuLang')
      .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, 'slug')
      .default(''),
    status: z.enum(KURS_STATUS, 'ungueltig').default('entwurf'),
    /** Bild aus der Mediathek (C11b); leer = kein Bild */
    bildId: z.union([z.literal(''), z.uuid('ungueltig')]).default(''),
  })
  .superRefine((e, ctx) => {
    const feld = (pfad: string, message: string) => ctx.addIssue({ code: 'custom', path: [pfad], message });
    const roh = e as unknown as Record<string, string>;
    for (const name of MEHRSPRACHIG) {
      if (!roh[`${name}De`] && (roh[`${name}Tr`] || roh[`${name}En`])) feld(`${name}De`, 'deFehlt');
    }
    // Übersetzungen der Inhaltsliste müssen zeilenweise zum deutschen Text passen (gleiche Anzahl, gleiche Reihenfolge)
    const deZeilen = zeilenVon(e.inhalteDe);
    for (const [s, wert] of [
      ['Tr', e.inhalteTr],
      ['En', e.inhalteEn],
    ] as const) {
      const eigene = zeilenVon(wert);
      if (deZeilen.length && eigene.length && eigene.length !== deZeilen.length) feld(`inhalte${s}`, 'uebersetzungZeilen');
    }
  });

export type KursEingabe = z.infer<typeof kursSchema>;
/** Werte eines Kursformulars (Feldnamen wie `kursSchema`, Zahlen als Text). */
export type FormularWerte = Record<string, string | boolean>;
/** Eine Zeile der Tabelle `kurs`. */
export type KursZeile = typeof schema.kurs.$inferSelect;

/** FormData → Rohobjekt für das Schema. */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string' && !k.startsWith('$ACTION')) roh[k] = v;
  return roh;
}

function mehr(de: string, tr: string, en: string): Mehrsprachig {
  return { de, ...(tr ? { tr } : {}), ...(en ? { en } : {}) };
}

function mehrOderNull(de: string, tr: string, en: string): Mehrsprachig | null {
  return de || tr || en ? mehr(de, tr, en) : null;
}

/** Datensatz für die Tabelle `kurs` aus der geprüften Eingabe. Slug und Herkunft setzt die Action. */
export function zuDatensatz(e: KursEingabe) {
  const trZeilen = zeilenVon(e.inhalteTr);
  const enZeilen = zeilenVon(e.inhalteEn);
  return {
    titel: mehr(e.titelDe, e.titelTr, e.titelEn),
    beschreibung: mehrOderNull(e.beschreibungDe, e.beschreibungTr, e.beschreibungEn),
    zielgruppe: mehrOderNull(e.zielgruppeDe, e.zielgruppeTr, e.zielgruppeEn),
    alter: mehrOderNull(e.alterDe, e.alterTr, e.alterEn),
    zeiten: mehrOderNull(e.zeitenDe, e.zeitenTr, e.zeitenEn),
    dauer: mehrOderNull(e.dauerDe, e.dauerTr, e.dauerEn),
    ort: mehrOderNull(e.ortDe, e.ortTr, e.ortEn),
    leitung: mehrOderNull(e.leitungDe, e.leitungTr, e.leitungEn),
    kosten: mehrOderNull(e.kostenDe, e.kostenTr, e.kostenEn),
    hinweis: mehrOderNull(e.hinweisDe, e.hinweisTr, e.hinweisEn),
    inhalte: zeilenVon(e.inhalteDe).map((de, i) => mehr(de, trZeilen[i] ?? '', enZeilen[i] ?? '')),
    plaetze: e.plaetze ?? null,
    verfuegbarkeit: e.verfuegbarkeit,
    empfohlen: e.empfohlen,
    sortierung: e.sortierung,
    status: e.status,
    bildId: e.bildId || null,
  };
}

/** Startwerte des Formulars aus einem Datensatz: Listen als Zeilen, Zahlen als Text. */
export function kursFormularWerte(k: KursZeile): FormularWerte {
  const sprachen = (feld: Mehrsprachig | null, name: string) => ({
    [`${name}De`]: feld?.de ?? '',
    [`${name}Tr`]: feld?.tr ?? '',
    [`${name}En`]: feld?.en ?? '',
  });
  return {
    id: k.id,
    bildId: k.bildId ?? '',
    ...sprachen(k.titel, 'titel'),
    ...sprachen(k.beschreibung, 'beschreibung'),
    ...sprachen(k.zielgruppe, 'zielgruppe'),
    ...sprachen(k.alter, 'alter'),
    ...sprachen(k.zeiten, 'zeiten'),
    ...sprachen(k.dauer, 'dauer'),
    ...sprachen(k.ort, 'ort'),
    ...sprachen(k.leitung, 'leitung'),
    ...sprachen(k.kosten, 'kosten'),
    ...sprachen(k.hinweis, 'hinweis'),
    inhalteDe: k.inhalte.map((i) => i.de).join('\n'),
    inhalteTr: k.inhalte.some((i) => i.tr) ? k.inhalte.map((i) => i.tr ?? '').join('\n') : '',
    inhalteEn: k.inhalte.some((i) => i.en) ? k.inhalte.map((i) => i.en ?? '').join('\n') : '',
    plaetze: k.plaetze === null ? '' : String(k.plaetze),
    verfuegbarkeit: k.verfuegbarkeit,
    empfohlen: k.empfohlen,
    sortierung: String(k.sortierung),
    slug: k.slug,
    status: k.status,
  };
}

/** Startwerte für „Neuer Kurs“. */
export const NEUER_KURS: FormularWerte = { verfuegbarkeit: 'voranmeldung', status: 'entwurf', sortierung: '0', empfohlen: false };

/** Slug aus dem deutschen Titel (ä → ae …), höchstens 80 Zeichen; ohne brauchbare Zeichen: „kurs“. */
export function kursSlugAus(titel: string): string {
  const slug = titel
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replaceAll('ı', 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return slug || 'kurs';
}
