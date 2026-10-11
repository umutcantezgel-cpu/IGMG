import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'tr', 'en'],
  defaultLocale: 'de',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/gebetszeiten': { de: '/gebetszeiten', tr: '/namaz-vakitleri', en: '/prayer-times' },
  },
});
