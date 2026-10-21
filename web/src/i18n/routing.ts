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
    '/meldung': { de: '/meldung', tr: '/bildirim', en: '/report' },
    '/impressum': { de: '/impressum', tr: '/kunye', en: '/imprint' },
    '/datenschutz': { de: '/datenschutz', tr: '/gizlilik', en: '/privacy' },
    '/suche': { de: '/suche', tr: '/arama', en: '/search' },
    '/offline': '/offline',
    // Lauf Gemeinde-Plattform: Koran, Hadith, Lernen, Gemeindeleben (öffentlich, statisch)
    '/quran/cuz/[nr]': { de: '/quran/cuz/[nr]', tr: '/kuran/cuz/[nr]', en: '/quran/juz/[nr]' },
    '/quran/tajwid': { de: '/quran/tajwid', tr: '/kuran/tecvid', en: '/quran/tajweed' },
    '/hadith': { de: '/hadith', tr: '/hadis', en: '/hadith' },
    '/hadith/bukhari': { de: '/hadith/bukhari', tr: '/hadis/buhari', en: '/hadith/bukhari' },
    '/hadith/bukhari/[buch]': { de: '/hadith/bukhari/[buch]', tr: '/hadis/buhari/[buch]', en: '/hadith/bukhari/[buch]' },
    '/hadith/bukhari/[buch]/teil/[teil]': {
      de: '/hadith/bukhari/[buch]/teil/[teil]',
      tr: '/hadis/buhari/[buch]/bolum/[teil]',
      en: '/hadith/bukhari/[buch]/part/[teil]',
    },
    '/hadith/auswahl': { de: '/hadith/auswahl', tr: '/hadis/secme', en: '/hadith/selection' },
    '/lernen': { de: '/lernen', tr: '/ogren', en: '/learn' },
    '/elifbe': { de: '/elifbe', tr: '/elifba', en: '/arabic-alphabet' },
    '/elifbe/buchstaben': { de: '/elifbe/buchstaben', tr: '/elifba/harfler', en: '/arabic-alphabet/letters' },
    '/elifbe/buchstaben/[buchstabe]': {
      de: '/elifbe/buchstaben/[buchstabe]',
      tr: '/elifba/harfler/[buchstabe]',
      en: '/arabic-alphabet/letters/[buchstabe]',
    },
    '/elifbe/lektion/[lektion]': { de: '/elifbe/lektion/[lektion]', tr: '/elifba/ders/[lektion]', en: '/arabic-alphabet/lesson/[lektion]' },
    '/elifbe/ueben': { de: '/elifbe/ueben', tr: '/elifba/alistirma', en: '/arabic-alphabet/practice' },
    '/kalender': { de: '/kalender', tr: '/takvim', en: '/calendar' },
    '/ramadan': { de: '/ramadan', tr: '/ramazan', en: '/ramadan' },
    '/hatim': { de: '/hatim', tr: '/hatim', en: '/khatm' },
    '/hatim/[id]': { de: '/hatim/[id]', tr: '/hatim/[id]', en: '/khatm/[id]' },
    '/spenden': { de: '/spenden', tr: '/bagis', en: '/donate' },
    '/newsletter': { de: '/newsletter', tr: '/bulten', en: '/newsletter' },
    '/quellen': { de: '/quellen', tr: '/kaynaklar', en: '/sources' },
    '/barrierefreiheit': { de: '/barrierefreiheit', tr: '/erisilebilirlik', en: '/accessibility' },
    // Konto-Einstieg und Mein Bereich (dynamisch, ADR 0026)
    '/anmelden': { de: '/anmelden', tr: '/giris', en: '/sign-in' },
    '/registrieren': { de: '/registrieren', tr: '/kayit', en: '/register' },
    '/konto/bestaetigen': { de: '/konto/bestaetigen', tr: '/hesap/onayla', en: '/account/confirm' },
    '/einladung/[token]': { de: '/einladung/[token]', tr: '/davet/[token]', en: '/invitation/[token]' },
    '/passwort-vergessen': { de: '/passwort-vergessen', tr: '/sifremi-unuttum', en: '/forgot-password' },
    '/passwort-neu': { de: '/passwort-neu', tr: '/yeni-sifre', en: '/new-password' },
    '/mein-bereich': { de: '/mein-bereich', tr: '/hesabim', en: '/my-account' },
    '/mein-bereich/konto': { de: '/mein-bereich/konto', tr: '/hesabim/hesap', en: '/my-account/account' },
    '/mein-bereich/benachrichtigungen': {
      de: '/mein-bereich/benachrichtigungen',
      tr: '/hesabim/bildirimler',
      en: '/my-account/notifications',
    },
    '/mein-bereich/lesezeichen': { de: '/mein-bereich/lesezeichen', tr: '/hesabim/yer-imleri', en: '/my-account/bookmarks' },
    '/mein-bereich/kinder': { de: '/mein-bereich/kinder', tr: '/hesabim/cocuklarim', en: '/my-account/children' },
    '/mein-bereich/kinder/[id]': { de: '/mein-bereich/kinder/[id]', tr: '/hesabim/cocuklarim/[id]', en: '/my-account/children/[id]' },
    '/mein-bereich/unterricht': { de: '/mein-bereich/unterricht', tr: '/hesabim/derslerim', en: '/my-account/teaching' },
    '/mein-bereich/unterricht/[gruppe]': {
      de: '/mein-bereich/unterricht/[gruppe]',
      tr: '/hesabim/derslerim/[gruppe]',
      en: '/my-account/teaching/[gruppe]',
    },
    '/mein-bereich/unterricht/[gruppe]/anwesenheit/[termin]': {
      de: '/mein-bereich/unterricht/[gruppe]/anwesenheit/[termin]',
      tr: '/hesabim/derslerim/[gruppe]/yoklama/[termin]',
      en: '/my-account/teaching/[gruppe]/attendance/[termin]',
    },
    '/mein-bereich/unterricht/[gruppe]/fortschritt': {
      de: '/mein-bereich/unterricht/[gruppe]/fortschritt',
      tr: '/hesabim/derslerim/[gruppe]/ilerleme',
      en: '/my-account/teaching/[gruppe]/progress',
    },
    '/mein-bereich/unterricht/[gruppe]/moderation': {
      de: '/mein-bereich/unterricht/[gruppe]/moderation',
      tr: '/hesabim/derslerim/[gruppe]/moderasyon',
      en: '/my-account/teaching/[gruppe]/moderation',
    },
    // Lern-App der Gruppe (L7-02, PLAN §3.1): zuweisen, Gruppenziel, Bestenliste, Stand – nur mit `lernapp_gruppen`
    '/mein-bereich/unterricht/[gruppe]/lern-app': {
      de: '/mein-bereich/unterricht/[gruppe]/lern-app',
      tr: '/hesabim/derslerim/[gruppe]/ogrenme-uygulamasi',
      en: '/my-account/teaching/[gruppe]/learning-app',
    },
    '/mein-bereich/gruppen/[id]': { de: '/mein-bereich/gruppen/[id]', tr: '/hesabim/gruplar/[id]', en: '/my-account/groups/[id]' },
    '/mein-bereich/gruppen/[id]/chat': {
      de: '/mein-bereich/gruppen/[id]/chat',
      tr: '/hesabim/gruplar/[id]/sohbet',
      en: '/my-account/groups/[id]/chat',
    },
    '/mein-bereich/hatim': { de: '/mein-bereich/hatim', tr: '/hesabim/hatim', en: '/my-account/khatm' },
    '/mein-bereich/ehrenamt': { de: '/mein-bereich/ehrenamt', tr: '/hesabim/gonullu', en: '/my-account/volunteering' },
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
