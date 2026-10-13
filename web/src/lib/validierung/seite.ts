import { TZDate } from '@date-fns/tz';
import { z } from 'zod';
import { SLUG_LAENGE, slugAusTitel, slugFehler, type SeitenSlugs } from '@/lib/cms/slugs';
import { ORGANISATION_KUERZEL, type OrganisationKuerzel } from '@/lib/rechte/matrix';
import { lokalesDatum, ZEITZONE } from '@/lib/termine';
import { blockFehler, bloeckeSchema, type Block } from './bloecke';
import { veroeffentlichungGueltig } from './neuigkeit';

/**
 * Formular „Freie Seite“ der Verwaltung (ADR 0032): Felder wie im Editor (`SeitenFormular`), ein Schema für Formular
 * und Server Action. Die Bausteine kommen als JSON im Feld `bloecke` und werden mit `bloeckeSchema` geprüft.
 * Status: „entwurf“, „zur_pruefung“ (bitte prüfen und veröffentlichen) oder „veroeffentlicht“.
 */
export const SEITEN_STATUS = ['entwurf', 'zur_pruefung', 'veroeffentlicht'] as const;
export type SeitenStatus = (typeof SEITEN_STATUS)[number];

const text = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const slugFeld = z
  .string()
  .trim()
  .toLowerCase()
  .max(SLUG_LAENGE, 'zuLang')
  .default('')
  .superRefine((s, ctx) => {
    if (!s) return;
    const f = slugFehler(s);
    if (f) ctx.addIssue({ code: 'custom', message: f });
  });

export const seitenFelder = z
  .object({
    id: z
      .uuid()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    titelDe: z.string('pflicht').trim().min(1, 'pflicht').max(160, 'zuLang'),
    titelTr: text(160),
    titelEn: text(160),
    beschreibungDe: text(300),
    beschreibungTr: text(300),
    beschreibungEn: text(300),
    slugDe: slugFeld,
    slugTr: slugFeld,
    slugEn: slugFeld,
    organisation: z.union([z.literal(''), z.enum(ORGANISATION_KUERZEL)], 'ungueltig').default(''),
    status: z.enum(SEITEN_STATUS, 'ungueltig').default('entwurf'),
    /** Wanduhrzeit Europe/Berlin „JJJJ-MM-TTTHH:MM“; leer = sofort beim Veröffentlichen. */
    veroeffentlichenAm: text(16),
  })
  .superRefine((e, ctx) => {
    const fehler = (pfad: string, message: string) => ctx.addIssue({ code: 'custom', path: [pfad], message });
    if ((e.beschreibungTr || e.beschreibungEn) && !e.beschreibungDe) fehler('beschreibungDe', 'pflicht');
    if (e.veroeffentlichenAm && !veroeffentlichungGueltig(e.veroeffentlichenAm)) fehler('veroeffentlichenAm', 'datum');
  });

export type SeitenEingabe = z.infer<typeof seitenFelder> & { bloecke: Block[] };

/** FormData → Rohobjekt; Next.js-Felder ($ACTION…) fallen weg. */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string' && !k.startsWith('$ACTION')) roh[k] = v;
  return roh;
}

/** JSON aus dem verborgenen Feld `bloecke`; ungültiges JSON ergibt `undefined` (Fehler „ungueltig“). */
export function bloeckeAusText(wert: unknown): unknown {
  if (typeof wert !== 'string' || !wert.trim()) return [];
  if (wert.length > 2_000_000) return undefined;
  try {
    return JSON.parse(wert) as unknown;
  } catch {
    return undefined;
  }
}

export type PruefErgebnis = { ok: true; daten: SeitenEingabe } | { ok: false; feldFehler: Record<string, string> };

/** Prüft Felder und Bausteine zusammen; Fehler als Schlüssel (Felder) bzw. `block:<id>:<pfad>` (Bausteine). */
export function pruefeSeite(roh: Record<string, unknown>): PruefErgebnis {
  const felder = seitenFelder.safeParse(roh);
  const bloeckeRoh = bloeckeAusText(roh.bloecke);
  const bloecke = bloeckeRoh === undefined ? null : bloeckeSchema.safeParse(bloeckeRoh);
  const feldFehler: Record<string, string> = {};
  if (!felder.success)
    for (const f of felder.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
    }
  if (bloecke === null) feldFehler.bloecke = 'ungueltig';
  else if (!bloecke.success) Object.assign(feldFehler, blockFehler(bloeckeRoh, bloecke.error.issues));
  if (!felder.success || !bloecke?.success) return { ok: false, feldFehler };
  return { ok: true, daten: { ...felder.data, bloecke: bloecke.data } };
}

/** Wanduhrzeit in Europe/Berlin → Zeitpunkt. */
export function zeitpunktAus(wert: string): Date {
  const [datum, zeit] = wert.split('T');
  const [j, m, t] = datum.split('-').map(Number);
  const [h, mi] = zeit.split(':').map(Number);
  return new Date(new TZDate(j, m - 1, t, h, mi, 0, ZEITZONE).getTime());
}

const uhr = new Intl.DateTimeFormat('de-DE', { timeZone: ZEITZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Zeitpunkt → Feldwert „JJJJ-MM-TTTHH:MM“ (Europe/Berlin). */
export function feldwertAus(d: Date | null): string {
  return d ? `${lokalesDatum(d)}T${uhr.format(d)}` : '';
}

type Mehrsprachig = { de: string; tr?: string; en?: string };
const mehr = (de: string, tr: string, en: string): Mehrsprachig => ({ de, ...(tr ? { tr } : {}), ...(en ? { en } : {}) });

/** Datensatz-Felder der Tabelle `seite` aus der geprüften Eingabe (ohne Status – den setzt die Action). */
export function zuDatensatz(e: SeitenEingabe): {
  titel: Mehrsprachig;
  beschreibung: Mehrsprachig | null;
  slugs: SeitenSlugs;
  organisation: OrganisationKuerzel | null;
  veroeffentlichenAm: Date | null;
  bloecke: Block[];
} {
  const slugDe = e.slugDe || slugAusTitel(e.titelDe);
  return {
    titel: mehr(e.titelDe, e.titelTr, e.titelEn),
    beschreibung: e.beschreibungDe ? mehr(e.beschreibungDe, e.beschreibungTr, e.beschreibungEn) : null,
    // Ein Slug, der dem deutschen gleicht, wird nicht doppelt gespeichert (die Adresse ist dieselbe)
    slugs: { de: slugDe, tr: e.slugTr && e.slugTr !== slugDe ? e.slugTr : null, en: e.slugEn && e.slugEn !== slugDe ? e.slugEn : null },
    organisation: e.organisation || null,
    veroeffentlichenAm: e.veroeffentlichenAm ? zeitpunktAus(e.veroeffentlichenAm) : null,
    bloecke: e.bloecke,
  };
}
