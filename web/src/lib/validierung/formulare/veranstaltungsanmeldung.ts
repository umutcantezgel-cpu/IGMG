import { z } from 'zod';

/**
 * Veranstaltungsanmeldung (E-020, K-07, G-07): nur nötige Felder – Name, E-Mail, Telefon (optional),
 * Personenzahl 1–10, Einwilligung. Fehlermeldungen sind Schlüssel unter `formulare.fehler`.
 */
export const TELEFON = /^[+()\d][\d\s()/-]{4,29}$/;

export const anmeldungSchema = z.object({
  veranstaltungId: z.uuid('ungueltig'),
  sprache: z.enum(['de', 'tr', 'en'], 'ungueltig'),
  name: z.string('pflicht').trim().min(2, 'pflicht').max(100, 'zuLang'),
  email: z.string('pflicht').trim().max(254, 'zuLang').pipe(z.email('email')),
  telefon: z
    .string()
    .trim()
    .max(30, 'zuLang')
    .refine((t) => t === '' || TELEFON.test(t), 'telefon')
    .default(''),
  personen: z.coerce.number('ungueltig').int('ungueltig').min(1, 'ungueltig').max(10, 'ungueltig'),
  einwilligung: z.literal('ja', 'einwilligung'),
});
export type Anmeldung = z.infer<typeof anmeldungSchema>;
