import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { routing } from './routing';

/**
 * Sprache aus dem Root-Parameter `[locale]` (next/root-params, Lichtung a) – statisch renderbar,
 * ohne setRequestLocale und ohne Request-Header.
 */
export default getRequestConfig(async ({ locale }) => {
  const kandidat = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, kandidat)) notFound();
  return {
    locale: kandidat,
    timeZone: 'Europe/Berlin',
    messages: (await import(`../../messages/${kandidat}.json`)).default,
  };
});
