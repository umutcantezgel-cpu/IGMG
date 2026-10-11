import { z } from 'zod';
import { mehrsprachig, mehrsprachigOptional } from '../mehrsprachig';

/** Auswahl der Symbole für Zeitleiste und Werte; die Zuordnung zu Lucide-Zeichen steht in components/website/ueber-uns/symbole.ts. */
export const SYMBOLE = ['haus', 'gebaeude', 'gemeinde', 'standort', 'aufwaerts', 'herz'] as const;
export type Symbolschluessel = (typeof SYMBOLE)[number];

/** Fließtext-Absatz: Deutsch Pflicht, Türkisch und Englisch optional mit sichtbarem Rückfall (K-02). */
const absatz = z.object({ absatz: mehrsprachig(2000) });

/** Eintrag der Zeitleiste „Unsere Reise“ (design/AboutUs.dc.html D:92–96). */
const zeitEintrag = z.object({
  kennzeichnung: mehrsprachig(60),
  titel: mehrsprachig(200),
  ort: mehrsprachigOptional(120).optional(),
  /** Bild als interner Pfad unter /public (K-14: keine fremden Adressen). Ohne Angabe bleibt die Platzhalterfläche. */
  bild: z
    .string()
    .trim()
    .max(300)
    .regex(/^\/(?!\/)\S*$/)
    .optional(),
  bildbeschreibung: mehrsprachig(200),
  reihenfolge: z.number().int().min(0).max(999).default(0),
  symbol: z.enum(SYMBOLE).default('standort'),
});

/** Eintrag „Unsere Werte“ (design/AboutUs.dc.html D:99–102). */
const wert = z.object({
  titel: mehrsprachig(80),
  beschreibung: mehrsprachig(400),
  reihenfolge: z.number().int().min(0).max(999).default(0),
  symbol: z.enum(SYMBOLE).default('herz'),
});

/**
 * Seiteninhalt „ueber-uns“ (Blatt S08, Abschnitt DATEN): redaktionelle Texte, die die Gemeinde pflegt.
 * Feste Überschriften, Untertitel und Aufrufe stehen in messages/bereiche/ueber-uns.json. Alle Listen dürfen leer sein.
 */
export const schema = z.object({
  geschichte: z.object({ absaetze: z.array(absatz).default([]) }).default({ absaetze: [] }),
  zeitleiste: z.array(zeitEintrag).default([]),
  gemeinschaft: z.object({ absaetze: z.array(absatz).default([]) }).default({ absaetze: [] }),
  werte: z.array(wert).default([]),
});

export type UeberUnsInhalt = z.infer<typeof schema>;
