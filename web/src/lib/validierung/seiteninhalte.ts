import { z } from 'zod';
import { schema as datenschutz } from './seiteninhalte/datenschutz';
import { schema as igmg } from './seiteninhalte/igmg';
import { schema as impressum } from './seiteninhalte/impressum';
import { schema as organisation } from './seiteninhalte/organisation';
import { schema as projekte } from './seiteninhalte/projekte';
import { schema as ueberUns } from './seiteninhalte/ueber-uns';
import { schema as vorstand } from './seiteninhalte/vorstand';

import { mehrsprachig } from './mehrsprachig';

export { mehrsprachig, mehrsprachigOptional } from './mehrsprachig';

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

/**
 * Seiteninhalte je Bereich (Tabelle `seiteninhalt`, Schlüssel `bereich`). Je Bereich eine Schemadatei unter
 * `./seiteninhalte/` (E-027), damit Pakete parallel arbeiten. Die vier Organisationen teilen ein Schema.
 */
export const SEITENINHALT = {
  kontakt: kontaktInhalt,
  'ueber-uns': ueberUns,
  vorstand,
  projekte,
  igmg,
  'organisation-ana-teskilati': organisation,
  'organisation-kadin-teskilati': organisation,
  'organisation-genclik-teskilati': organisation,
  'organisation-kadin-genclik-teskilati': organisation,
  impressum,
  datenschutz,
} as const;
export type SeitenBereich = keyof typeof SEITENINHALT;
