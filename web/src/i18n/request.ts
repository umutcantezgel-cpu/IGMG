import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { routing } from './routing';

/**
 * Sprache aus dem Root-Parameter `[locale]` (next/root-params, Lichtung a) – statisch renderbar,
 * ohne setRequestLocale und ohne Request-Header.
 * Die Verwaltung ist nur deutsch (ADR 0016): Ihr Namensraum `verwaltung` kommt immer aus de.json.
 */
export default getRequestConfig(async ({ locale }) => {
  const kandidat = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, kandidat)) notFound();
  const nachrichten = (await import(`../../messages/${kandidat}.json`)).default;
  const verwaltung = kandidat === 'de' ? nachrichten.verwaltung : (await import('../../messages/de.json')).default.verwaltung;
  return {
    locale: kandidat,
    timeZone: 'Europe/Berlin',
    messages: { ...nachrichten, verwaltung },
  };
});
