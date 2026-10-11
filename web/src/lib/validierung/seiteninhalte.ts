import { z } from 'zod';

/** Mehrsprachiger Text: Deutsch Pflicht (ADR 0002). */
export const mehrsprachig = (max = 500) =>
  z.object({ de: z.string().trim().min(1).max(max), tr: z.string().trim().max(max).optional(), en: z.string().trim().max(max).optional() });
export const mehrsprachigOptional = (max = 500) =>
  z.object({ de: z.string().trim().max(max), tr: z.string().trim().max(max).optional(), en: z.string().trim().max(max).optional() });

/** Kontaktdaten (Seiteninhalte › Kontaktdaten): Footer, Kontaktseite, JSON-LD. Platzhalter nach G-05. */
export const kontaktInhalt = z.object({
  adresse: z.string().trim().max(300).default('[Adresse]'),
  telefon: z.string().trim().max(60).default('[Telefonnummer]'),
  notfallTelefon: z.string().trim().max(60).default('[Telefonnummer Notfall]'),
  email: z.string().trim().max(200).default('info@igmg-wetzlar.de'),
  /** Öffnungszeiten als Zeilen (z. B. „Mo.–Fr.“ → „09:00–22:00 Uhr“) */
  oeffnungszeiten: z
    .array(
      z.object({
        tage: mehrsprachig(60),
        zeiten: z.string().trim().max(60),
        von: z.array(z.number().int().min(0).max(6)).default([]),
        start: z.string().default(''),
        ende: z.string().default(''),
      }),
    )
    .default([]),
  social: z.object({ facebook: z.url().optional(), instagram: z.url().optional(), youtube: z.url().optional() }).default({}),
  /** Koordinaten der Moschee (für Qibla/Gebetszeiten und Karte nach Klick); leer bis zur Bestätigung (M-010). */
  koordinaten: z.object({ breite: z.number(), laenge: z.number() }).optional(),
});
export type KontaktInhalt = z.infer<typeof kontaktInhalt>;

export const SEITENINHALT = {
  kontakt: kontaktInhalt,
} as const;
export type SeitenBereich = keyof typeof SEITENINHALT;
