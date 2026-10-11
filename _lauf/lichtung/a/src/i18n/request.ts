import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  const kandidat = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, kandidat)) notFound();
  return { locale: kandidat, messages: (await import(`../../messages/${kandidat}.json`)).default };
});
