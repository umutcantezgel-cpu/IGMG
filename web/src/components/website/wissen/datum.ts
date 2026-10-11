import type { Sprache } from '@/lib/i18n/inhalt';

/** BCP-47-Kennungen je Sprache: für Datumsformate (Intl) und für Groß- und Kleinschreibung beim Suchen. */
export const SPRACH_KENNUNG: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

const formate = new Map<Sprache, Intl.DateTimeFormat>();

/**
 * Datum eines Artikels wie im Design („Mo., 15. Jan. 2024“) in der Sprache der Seite, Zeitzone Europe/Berlin (K-05).
 * `iso` ist ein Datum aus den Seiteninhalten, kein aktueller Zeitpunkt. Mittag UTC hält das Datum in jeder Zone stabil.
 */
export function datumAnzeige(iso: string, sprache: Sprache): string {
  let format = formate.get(sprache);
  if (!format) {
    format = new Intl.DateTimeFormat(SPRACH_KENNUNG[sprache], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Berlin',
    });
    formate.set(sprache, format);
  }
  return format.format(new Date(`${iso}T12:00:00Z`));
}
