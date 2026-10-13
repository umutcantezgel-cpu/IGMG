import { z } from 'zod';
import { normalisierePfad, weiterleitungNachFehler, weiterleitungVonFehler } from '@/lib/cms/slugs';

/**
 * Formular „Weiterleitung“ (ADR 0032): alte Adresse → neue Adresse der Website, dauerhaft (308 empfohlen, 301 für
 * klassische Suchmaschinen-Einträge). Nur interne Ziele. Ob das Ziel existiert und ob eine Schleife entsteht, prüft die
 * Action mit der Datenbank. Fehler als Schlüssel unter `verwaltung.weiterleitungen.fehler`.
 */
export const WEITERLEITUNG_CODES = [308, 301] as const;

export const weiterleitungSchema = z
  .object({
    id: z
      .uuid()
      .optional()
      .or(z.literal('').transform(() => undefined)),
    von: z.string('pflicht').trim().min(1, 'pflicht').max(300, 'zuLang').transform(normalisierePfad),
    nach: z.string('pflicht').trim().min(1, 'pflicht').max(300, 'zuLang').transform(normalisierePfad),
    code: z.preprocess((v) => Number(v ?? 308), z.union([z.literal(308), z.literal(301)], 'ungueltig')),
  })
  .superRefine((e, ctx) => {
    const von = weiterleitungVonFehler(e.von);
    if (von) ctx.addIssue({ code: 'custom', path: ['von'], message: von });
    const nach = weiterleitungNachFehler(e.nach);
    if (nach) ctx.addIssue({ code: 'custom', path: ['nach'], message: nach });
    if (!von && !nach && e.von === e.nach) ctx.addIssue({ code: 'custom', path: ['nach'], message: 'schleife' });
  });

export type WeiterleitungEingabe = z.infer<typeof weiterleitungSchema>;
