import { z } from 'zod';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { bereinige } from '@/lib/i18n/inhalt';
import { richtextFeld } from './richtext';

/**
 * Formular „Besonderer Tag“ (AUFTRAG 3.10, ADR 0030): Art, Datum (der Kalendertag, an dessen Abend eine Nacht
 * beginnt), Titel (Deutsch Pflicht) und Beschreibung (Rich-Text, optional; religiöse Texte schreibt nur der Imam).
 * „bestätigt“ setzt nur, wer `religioes.freigeben` hat – die Action prüft das. Fehler als Schlüssel unter
 * `verwaltung.besondereTage.fehler`.
 */
export const BESONDERE_ARTEN = ['kandil', 'bayram', 'ramadan_beginn', 'ramadan_ende', 'asure', 'hicri_neujahr', 'sonstiges'] as const;

export const besondererTagSchema = z
  .object({
    art: z.enum(BESONDERE_ARTEN, 'pflicht'),
    datum: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'datum'),
    titelDe: z.string('pflicht').trim().min(1, 'pflicht').max(120, 'zuLang'),
    titelTr: z.string().trim().max(120, 'zuLang').default(''),
    titelEn: z.string().trim().max(120, 'zuLang').default(''),
    beschreibungDe: richtextFeld,
    beschreibungTr: richtextFeld,
    beschreibungEn: richtextFeld,
    bestaetigen: z.enum(['ja', '']).default(''),
  })
  .superRefine((w, ctx) => {
    if (!w.beschreibungDe && (w.beschreibungTr || w.beschreibungEn))
      ctx.addIssue({ code: 'custom', path: ['beschreibungDe'], message: 'pflicht' });
  });
export type BesondererTagEingabe = z.infer<typeof besondererTagSchema>;

export const BESONDERER_TAG_FELDER = [
  'art',
  'datum',
  'titelDe',
  'titelTr',
  'titelEn',
  'beschreibungDe',
  'beschreibungTr',
  'beschreibungEn',
  'bestaetigen',
] as const;

export function besondererTagDatensatz(w: BesondererTagEingabe): {
  art: (typeof BESONDERE_ARTEN)[number];
  datum: string;
  titel: Mehrsprachig;
  beschreibung: MehrsprachigRich | null;
} {
  return {
    art: w.art,
    datum: w.datum,
    titel: bereinige({ de: w.titelDe, tr: w.titelTr, en: w.titelEn }),
    beschreibung: w.beschreibungDe
      ? {
          de: w.beschreibungDe,
          ...(w.beschreibungTr ? { tr: w.beschreibungTr } : {}),
          ...(w.beschreibungEn ? { en: w.beschreibungEn } : {}),
        }
      : null,
  };
}
