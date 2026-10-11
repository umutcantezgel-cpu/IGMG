import { defineRouting } from 'next-intl/routing';

/**
 * Sprachen und lokalisierte Pfade (K-02, K-03, KERN 1.1).
 * Deutsch ohne Präfix, /tr und /en mit Präfix. Keine Spracherkennung und kein Cookie:
 * Die Sprache steht allein in der Adresse (öffentliche Seiten lesen keine Cookies, K-01).
 * hreflang setzen die Seiten selbst über generateMetadata (alternateLinks: false).
 * Die Verwaltung ist nur deutsch (ADR 0016) und steht deshalb nicht in `pathnames`.
 */
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
    '/gebetszeiten/anzeige': { de: '/gebetszeiten/anzeige', tr: '/namaz-vakitleri/ekran', en: '/prayer-times/display' },
    '/veranstaltungen': { de: '/veranstaltungen', tr: '/etkinlikler', en: '/events' },
    '/veranstaltungen/[slug]': { de: '/veranstaltungen/[slug]', tr: '/etkinlikler/[slug]', en: '/events/[slug]' },
    '/nachrichten': { de: '/nachrichten', tr: '/haberler', en: '/news' },
    '/nachrichten/[slug]': { de: '/nachrichten/[slug]', tr: '/haberler/[slug]', en: '/news/[slug]' },
    '/ueber-uns': { de: '/ueber-uns', tr: '/hakkimizda', en: '/about-us' },
    '/vorstand': { de: '/vorstand', tr: '/yonetim', en: '/board' },
    '/projekte': { de: '/projekte', tr: '/projeler', en: '/projects' },
    '/kontakt': { de: '/kontakt', tr: '/iletisim', en: '/contact' },
    '/igmg': '/igmg',
    '/quran': { de: '/quran', tr: '/kuran', en: '/quran' },
    '/quran/[sure]': { de: '/quran/[sure]', tr: '/kuran/[sure]', en: '/quran/[sure]' },
    '/islamisches-wissen': { de: '/islamisches-wissen', tr: '/islami-bilgiler', en: '/islamic-knowledge' },
    '/islamisches-wissen/[thema]': { de: '/islamisches-wissen/[thema]', tr: '/islami-bilgiler/[thema]', en: '/islamic-knowledge/[thema]' },
    '/organisationen/[organisation]': {
      de: '/organisationen/[organisation]',
      tr: '/organizasyonlar/[organisation]',
      en: '/organizations/[organisation]',
    },
    '/bildung/korankurse': { de: '/bildung/korankurse', tr: '/egitim/kuran-kurslari', en: '/education/quran-courses' },
    '/bildung/voranmeldung': { de: '/bildung/voranmeldung', tr: '/egitim/on-kayit', en: '/education/pre-registration' },
    '/mitglied-werden': { de: '/mitglied-werden', tr: '/uye-ol', en: '/become-a-member' },
    '/webseite-fuer-moscheen': { de: '/webseite-fuer-moscheen', tr: '/camiler-icin-web-sitesi', en: '/website-for-mosques' },
    '/impressum': { de: '/impressum', tr: '/kunye', en: '/imprint' },
    '/datenschutz': { de: '/datenschutz', tr: '/gizlilik', en: '/privacy' },
    '/suche': { de: '/suche', tr: '/arama', en: '/search' },
    '/offline': '/offline',
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pfad = keyof typeof routing.pathnames;

/** Slugs der vier Organisationen (gleich in allen Sprachen, Eigennamen). */
export const ORGANISATIONEN = ['ana-teskilati', 'kadin-teskilati', 'genclik-teskilati', 'kadin-genclik-teskilati'] as const;
export type OrganisationSlug = (typeof ORGANISATIONEN)[number];

/** Kürzel der Organisationen im Datenmodell (organisationEnum). */
export const ORGANISATION_KUERZEL = {
  'ana-teskilati': 'at',
  'kadin-teskilati': 'kt',
  'genclik-teskilati': 'gt',
  'kadin-genclik-teskilati': 'kgt',
} as const satisfies Record<OrganisationSlug, 'at' | 'kt' | 'gt' | 'kgt'>;
