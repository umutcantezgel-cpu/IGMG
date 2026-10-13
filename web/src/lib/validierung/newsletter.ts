import { z } from 'zod';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { bereinige } from '@/lib/i18n/inhalt';
import { THEMEN } from './formulare/newsletter';
import { richtextFeld } from './richtext';

/**
 * Newsletter-Ausgabe der Verwaltung (AUFTRAG 3.10, K-B): Betreff und Inhalt (Rich-Text, Tiptap des Bestands) in
 * Deutsch, Übersetzungen optional (fehlt eine Sprache, bekommen ihre Leser die deutsche Fassung). Themen wählen die
 * Empfänger (ohne Auswahl: alle bestätigten Anmeldungen). Fehler als Schlüssel unter `verwaltung.newsletter.fehler`.
 */
export const ausgabeSchema = z
  .object({
    betreffDe: z.string('pflicht').trim().min(1, 'pflicht').max(150, 'zuLang'),
    betreffTr: z.string().trim().max(150, 'zuLang').default(''),
    betreffEn: z.string().trim().max(150, 'zuLang').default(''),
    inhaltDe: richtextFeld,
    inhaltTr: richtextFeld,
    inhaltEn: richtextFeld,
    themen: z.array(z.enum(THEMEN, 'ungueltig')).max(THEMEN.length).default([]),
  })
  .superRefine((w, ctx) => {
    if (!w.inhaltDe) ctx.addIssue({ code: 'custom', path: ['inhaltDe'], message: 'pflicht' });
    // Eine Übersetzung braucht Betreff und Inhalt, sonst ginge eine halbe Mail hinaus
    for (const s of ['Tr', 'En'] as const) {
      const betreff = w[`betreff${s}`];
      const inhalt = w[`inhalt${s}`];
      if (betreff && !inhalt) ctx.addIssue({ code: 'custom', path: [`inhalt${s}`], message: 'pflicht' });
      if (inhalt && !betreff) ctx.addIssue({ code: 'custom', path: [`betreff${s}`], message: 'pflicht' });
    }
  });
export type AusgabeEingabe = z.infer<typeof ausgabeSchema>;

export const AUSGABE_FELDER = ['betreffDe', 'betreffTr', 'betreffEn', 'inhaltDe', 'inhaltTr', 'inhaltEn'] as const;

/** Formulardaten → Rohobjekt (Themen als Liste). */
export function ausgabeAusFormular(fd: FormData): Record<string, string | string[]> {
  const roh: Record<string, string | string[]> = Object.fromEntries(AUSGABE_FELDER.map((f) => [f, String(fd.get(f) ?? '')]));
  roh.themen = fd.getAll('themen').map(String);
  return roh;
}

export function ausgabeDatensatz(w: AusgabeEingabe): { betreff: Mehrsprachig; inhalt: MehrsprachigRich; themen: string[] } {
  return {
    betreff: bereinige({ de: w.betreffDe, tr: w.betreffTr, en: w.betreffEn }),
    inhalt: {
      de: w.inhaltDe!,
      ...(w.inhaltTr ? { tr: w.inhaltTr } : {}),
      ...(w.inhaltEn ? { en: w.inhaltEn } : {}),
    },
    themen: [...new Set(w.themen)],
  };
}
