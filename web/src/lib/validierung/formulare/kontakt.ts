import { z } from 'zod';
import { TELEFON } from './veranstaltungsanmeldung';

/**
 * Kontaktformular der Seite /kontakt (B03, K-07, G-07): nur nötige Felder – Name und E-Mail (Pflicht), Telefon und
 * Betreff (optional), Nachricht (Pflicht, höchstens 2000 Zeichen), Einwilligung (Pflicht). Die Telefonprüfung ist
 * dieselbe wie bei der Veranstaltungsanmeldung. Fehlermeldungen sind Schlüssel unter `formulare.fehler`.
 */
export const kontaktSchema = z.object({
  name: z.string('pflicht').trim().min(2, 'pflicht').max(100, 'zuLang'),
  email: z.string('pflicht').trim().max(254, 'zuLang').pipe(z.email('email')),
  telefon: z
    .string()
    .trim()
    .max(30, 'zuLang')
    .refine((t) => t === '' || TELEFON.test(t), 'telefon')
    .default(''),
  betreff: z.string().trim().max(100, 'zuLang').default(''),
  nachricht: z.string('pflicht').trim().min(1, 'pflicht').max(2000, 'zuLang'),
  einwilligung: z.literal('ja', 'einwilligung'),
});
export type Kontaktanfrage = z.infer<typeof kontaktSchema>;
