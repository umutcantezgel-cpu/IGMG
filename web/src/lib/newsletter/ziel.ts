import { pfadFuer } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

/** Meldungen, die /newsletter aus dem Anker zeigt (Insel `NewsletterMeldung`). */
export const NEWSLETTER_MELDUNGEN = ['bestaetigt', 'abgemeldet', 'ungueltig'] as const;
export type NewsletterMeldung = (typeof NEWSLETTER_MELDUNGEN)[number];

/**
 * Weiterleitung (303) nach Bestätigen oder Abmelden auf die Newsletter-Seite der Sprache mit Anker – als relative
 * Adresse (RFC 9110), damit hinter einem Proxy kein interner Rechnername entsteht. Unbekannte Sprachen fallen auf
 * Deutsch zurück. Keine Zwischenspeicherung, kein Verweis auf die Herkunft (Token in der Adresse).
 */
export function newsletterZiel(sprache: string | null, meldung: NewsletterMeldung): Response {
  const s = (routing.locales as readonly string[]).includes(sprache ?? '') ? (sprache as Locale) : routing.defaultLocale;
  return new Response(null, {
    status: 303,
    headers: {
      Location: pfadFuer({ pathname: '/newsletter', hash: meldung }, s),
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
