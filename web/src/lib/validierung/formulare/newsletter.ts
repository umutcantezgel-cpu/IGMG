import { z } from 'zod';
import type { NewsletterThema } from '@/lib/newsletter/dienst';

/**
 * Newsletter-Anmeldung (/newsletter, AUFTRAG 3.10, K-B): E-Mail, Sprache der Mails, Themen (optional, ohne Auswahl
 * „allgemein“) und Einwilligung. Fehlermeldungen sind Schlüssel unter `formulare.fehler`.
 */
export const THEMEN = ['allgemein', 'veranstaltungen', 'bildung', 'ramadan'] as const satisfies readonly NewsletterThema[];

export const newsletterSchema = z.object({
  email: z.string('pflicht').trim().max(254, 'zuLang').pipe(z.email('email')),
  mailSprache: z.enum(['de', 'tr', 'en'], 'pflicht'),
  themen: z.array(z.enum(THEMEN, 'ungueltig')).max(THEMEN.length).default([]),
  einwilligung: z.literal('ja', 'einwilligung'),
});
export type NewsletterAnmeldung = z.infer<typeof newsletterSchema>;
