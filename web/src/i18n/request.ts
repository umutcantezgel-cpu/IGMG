import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { routing } from './routing';

type Nachrichten = Record<string, unknown>;

/** Tiefes Zusammenführen: fehlende Schlüssel der Sprache werden aus Deutsch ergänzt (Sicherheitsnetz). */
function mitRueckfall(basis: Nachrichten, sprache: Nachrichten): Nachrichten {
  const aus: Nachrichten = { ...basis };
  for (const [k, v] of Object.entries(sprache)) {
    const b = basis[k];
    aus[k] =
      v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' ? mitRueckfall(b as Nachrichten, v as Nachrichten) : v;
  }
  return aus;
}

/**
 * Sprache aus dem Root-Parameter `[locale]` (next/root-params, Lichtung a) – statisch renderbar.
 * Fehlt ein Schlüssel in tr/en, greift Deutsch (Sicherheitsnetz); Vollständigkeit prüft `pnpm sprachen:pruefen` (Z-03).
 * Die Verwaltung ist nur deutsch (ADR 0016): Namensraum `verwaltung` immer aus de.json.
 */
export default getRequestConfig(async ({ locale }) => {
  const kandidat = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, kandidat)) notFound();
  const de = (await import('../../messages/de.json')).default as Nachrichten;
  if (kandidat === 'de') return { locale: kandidat, timeZone: 'Europe/Berlin', messages: de };
  const eigen = (await import(`../../messages/${kandidat}.json`)).default as Nachrichten;
  return { locale: kandidat, timeZone: 'Europe/Berlin', messages: { ...mitRueckfall(de, eigen), verwaltung: de.verwaltung } };
});
