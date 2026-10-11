import { z } from 'zod';
import { STANDARD_EINSTELLUNGEN } from '@/lib/gebetszeiten/typen';

/** Einstellungen als typisierte Schlüssel (Tabelle `einstellung`). Ein Schema für Lesen und Schreiben. */
export const gebetszeitenEinstellung = z.object({
  aktiveQuelle: z.enum(['import', 'berechnung']).default('berechnung'),
  /** Quelle von der Gemeinde bestätigt → Hinweis „berechnet“ entfällt (G-06). */
  bestaetigt: z.boolean().default(false),
  methode: z
    .enum([
      'Turkey',
      'MuslimWorldLeague',
      'Egyptian',
      'Karachi',
      'UmmAlQura',
      'Dubai',
      'MoonsightingCommittee',
      'NorthAmerica',
      'Kuwait',
      'Qatar',
      'Singapore',
      'Tehran',
    ])
    .default('Turkey'),
  madhab: z.enum(['shafi', 'hanafi']).default('shafi'),
  hoheBreite: z.enum(['middleofthenight', 'seventhofthenight', 'twilightangle']).default('seventhofthenight'),
  anpassungen: z
    .partialRecord(z.enum(['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi']), z.number().int().min(-30).max(30))
    .default({}),
  breite: z.number().min(-90).max(90).default(STANDARD_EINSTELLUNGEN.breite),
  laenge: z.number().min(-180).max(180).default(STANDARD_EINSTELLUNGEN.laenge),
});
export type GebetszeitenEinstellung = z.infer<typeof gebetszeitenEinstellung>;

export const allgemeineEinstellung = z.object({
  /** Konzept-Hinweis (DisclaimerDialog) anzeigen, solange Inhalte Beispielinhalte sind. */
  konzepthinweis: z.boolean().default(true),
});
export type AllgemeineEinstellung = z.infer<typeof allgemeineEinstellung>;

export const EINSTELLUNG = {
  gebetszeiten: { schluessel: 'gebetszeiten', schema: gebetszeitenEinstellung },
  allgemein: { schluessel: 'allgemein', schema: allgemeineEinstellung },
} as const;
