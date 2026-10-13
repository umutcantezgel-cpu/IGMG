import { z } from 'zod';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { bereinige } from '@/lib/i18n/inhalt';

/**
 * Formular „Hatim“ der Verwaltung (AUFTRAG 3.10): Titel (Deutsch Pflicht), Anlass (optional), Beginn und geplante
 * Vollendung. Übersetzungen nur, wenn die deutsche Fassung steht. Fehler als Schlüssel unter `verwaltung.hatim.fehler`.
 */
const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const datum = z.string().trim().regex(DATUM, 'datum');

export const hatimSchema = z
  .object({
    titelDe: z.string('pflicht').trim().min(1, 'pflicht').max(120, 'zuLang'),
    titelTr: z.string().trim().max(120, 'zuLang').default(''),
    titelEn: z.string().trim().max(120, 'zuLang').default(''),
    anlassDe: z.string().trim().max(200, 'zuLang').default(''),
    anlassTr: z.string().trim().max(200, 'zuLang').default(''),
    anlassEn: z.string().trim().max(200, 'zuLang').default(''),
    beginn: datum,
    ziel: z.union([z.literal(''), datum]).default(''),
  })
  .superRefine((w, ctx) => {
    if (w.ziel && w.ziel < w.beginn) ctx.addIssue({ code: 'custom', path: ['ziel'], message: 'zielVorBeginn' });
    if (!w.anlassDe && (w.anlassTr || w.anlassEn)) ctx.addIssue({ code: 'custom', path: ['anlassDe'], message: 'pflicht' });
  });
export type HatimEingabe = z.infer<typeof hatimSchema>;

export const HATIM_FELDER = ['titelDe', 'titelTr', 'titelEn', 'anlassDe', 'anlassTr', 'anlassEn', 'beginn', 'ziel'] as const;

/** Geprüfte Eingabe → Spalten der Tabelle `hatim`. */
export function hatimDatensatz(w: HatimEingabe): { titel: Mehrsprachig; anlass: Mehrsprachig | null; beginn: string; ziel: string | null } {
  return {
    titel: bereinige({ de: w.titelDe, tr: w.titelTr, en: w.titelEn }),
    anlass: w.anlassDe ? bereinige({ de: w.anlassDe, tr: w.anlassTr, en: w.anlassEn }) : null,
    beginn: w.beginn,
    ziel: w.ziel || null,
  };
}

/** Startwerte des Formulars aus einer gespeicherten Hatim. */
export function hatimWerte(h: {
  titel: Mehrsprachig;
  anlass: Mehrsprachig | null;
  beginn: string;
  ziel: string | null;
}): Record<string, string> {
  return {
    titelDe: h.titel.de,
    titelTr: h.titel.tr ?? '',
    titelEn: h.titel.en ?? '',
    anlassDe: h.anlass?.de ?? '',
    anlassTr: h.anlass?.tr ?? '',
    anlassEn: h.anlass?.en ?? '',
    beginn: h.beginn,
    ziel: h.ziel ?? '',
  };
}
