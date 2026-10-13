import { z } from 'zod';
import { GEBETE } from '@/lib/gebetszeiten/typen';

/** Themen der Benachrichtigungen (ADR 0034); jedes einzeln wählbar. */
export const PUSH_THEMEN = ['gebet', 'ankuendigung', 'chat', 'unterricht'] as const;
export type PushThema = (typeof PUSH_THEMEN)[number];

/** Anmeldung eines Push-Abos aus dem Browser (PushSubscription.toJSON() + Auswahl). */
export const pushAboEingabe = z.object({
  abo: z.object({
    endpoint: z.string().url().max(1024),
    keys: z.object({
      p256dh: z.string().regex(/^[A-Za-z0-9_-]{86,88}={0,2}$/),
      auth: z.string().regex(/^[A-Za-z0-9_-]{22,24}={0,2}$/),
    }),
  }),
  themen: z.array(z.enum(PUSH_THEMEN)).max(PUSH_THEMEN.length),
  gebete: z.array(z.enum(GEBETE)).max(GEBETE.length),
  minutenVorher: z.number().int().min(0).max(60),
  sprache: z.enum(['de', 'tr', 'en']),
  einwilligung: z.literal(true),
});
export type PushAboEingabe = z.infer<typeof pushAboEingabe>;

export const pushAbmeldung = z.object({ endpoint: z.string().url().max(1024) });

/** Reine Prüfung: Ist eine Gebetserinnerung jetzt fällig? Fenster (jetzt − 5 min, jetzt], damit ein verspäteter Takt nachholt. */
export function erinnerungFaellig(gebetZeitpunkt: number, minutenVorher: number, jetzt: number, fensterMin = 5): boolean {
  const ziel = gebetZeitpunkt - minutenVorher * 60_000;
  return ziel <= jetzt && ziel > jetzt - fensterMin * 60_000 && gebetZeitpunkt > jetzt - 60_000;
}
