import type { Sprache } from './inhalt';

/**
 * Datums- und Zeitformate (Laufbuch D-10, readme): „Sa., 2. Aug.“, „Mo., 28. Juli 2025“, „18:30 Uhr“, „14:00–16:00 Uhr“.
 * Immer in Europe/Berlin (K-05). Türkisch und Englisch ebenfalls im 24-Stunden-Format (E-018).
 */
const ZONE = 'Europe/Berlin';
const LOCALE: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

const cache = new Map<string, Intl.DateTimeFormat>();
function fmt(sprache: Sprache, optionen: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const schluessel = `${sprache}|${JSON.stringify(optionen)}`;
  let f = cache.get(schluessel);
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALE[sprache], { timeZone: ZONE, ...optionen });
    cache.set(schluessel, f);
  }
  return f;
}

/** „Sa., 2. Aug.“ */
export function datumKurz(d: Date, sprache: Sprache): string {
  return fmt(sprache, { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
}

/** „Mo., 28. Juli 2025“ */
export function datumLang(d: Date, sprache: Sprache): string {
  return fmt(sprache, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** „28. Juli 2025“ ohne Wochentag */
export function datumOhneWochentag(d: Date, sprache: Sprache): string {
  return fmt(sprache, { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** „18:30“ */
export function uhrzeitNackt(d: Date, sprache: Sprache): string {
  return fmt(sprache, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
}

/** „18:30 Uhr“ (de) bzw. „18:30“ (tr, en) */
export function uhrzeit(d: Date, sprache: Sprache): string {
  const z = uhrzeitNackt(d, sprache);
  return sprache === 'de' ? `${z} Uhr` : z;
}

/** „14:00–16:00 Uhr“ (Halbgeviertstrich ohne Leerzeichen) */
export function zeitspanne(von: Date, bis: Date | null | undefined, sprache: Sprache): string {
  if (!bis) return uhrzeit(von, sprache);
  const t = `${uhrzeitNackt(von, sprache)}–${uhrzeitNackt(bis, sprache)}`;
  return sprache === 'de' ? `${t} Uhr` : t;
}

/** ISO-Datum für <time dateTime> */
export function isoZeit(d: Date): string {
  return d.toISOString();
}
