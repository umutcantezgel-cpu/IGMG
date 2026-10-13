import type { MetadataRoute } from 'next';
import { SLUG } from '@/components/website/organisation/stil';
import { routing, type Locale } from '@/i18n/routing';
import { adresse } from '@/lib/seo/metadaten';
import { funktionAn } from '@/lib/funktionen';
import { SLUGS as BUCHSTABEN_SLUGS } from '@/lib/elifbe/alphabet';
import { LEKTIONEN } from '@/lib/elifbe/lektionen';
import { ladeHadithBuchNummern } from '@/server/queries/hadith';
import { ladeNachrichtenSlugs } from '@/server/queries/nachrichten';
import { ladeVeranstaltungsSlugs } from '@/server/queries/veranstaltungen';
import { ladeWissensSlugs } from '@/server/queries/wissen';

/**
 * Sitemap (D-O2, K-16): alle öffentlichen Seiten in drei Sprachen mit hreflang-Alternativen (x-default = Deutsch),
 * dazu veröffentlichte Veranstaltungen, Neuigkeiten und Wissensthemen. Ohne Verwaltung, Suche, Offline und Anzeige
 * (Vollbild für den Moschee-Bildschirm). Die Abfragen sind gecacht und werden über die Inhalts-Tags erneuert.
 */
type Ziel = Parameters<typeof adresse>[0];

const FEST: Ziel[] = [
  '/',
  '/gebetszeiten',
  '/veranstaltungen',
  '/nachrichten',
  '/ueber-uns',
  '/vorstand',
  '/projekte',
  '/kontakt',
  '/igmg',
  '/islamisches-wissen',
  '/bildung/korankurse',
  '/bildung/voranmeldung',
  '/mitglied-werden',
  '/webseite-fuer-moscheen',
  '/meldung',
  '/impressum',
  '/datenschutz',
  // Gemeinde-Plattform
  '/quran',
  '/quran/tajwid',
  '/hadith',
  '/hadith/auswahl',
  '/lernen',
  '/elifbe',
  '/elifbe/buchstaben',
  '/elifbe/ueben',
  '/quellen',
  '/barrierefreiheit',
];

function eintrag(ziel: Ziel): MetadataRoute.Sitemap[number] {
  const sprachen = Object.fromEntries(routing.locales.map((l: Locale) => [l, adresse(ziel, l)]));
  return { url: adresse(ziel, 'de'), alternates: { languages: { ...sprachen, 'x-default': adresse(ziel, 'de') } } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [veranstaltungen, nachrichten, themen, hadithGesamt] = await Promise.all([
    ladeVeranstaltungsSlugs(),
    ladeNachrichtenSlugs(),
    ladeWissensSlugs(),
    funktionAn('hadith_gesamt'),
  ]);
  const hadithBuecher = hadithGesamt ? await ladeHadithBuchNummern() : [];
  const ziele: Ziel[] = [
    ...FEST,
    ...Object.values(SLUG).map((organisation) => ({ pathname: '/organisationen/[organisation]' as const, params: { organisation } })),
    ...veranstaltungen.map((slug) => ({ pathname: '/veranstaltungen/[slug]' as const, params: { slug } })),
    ...nachrichten.map((slug) => ({ pathname: '/nachrichten/[slug]' as const, params: { slug } })),
    ...themen.map((thema) => ({ pathname: '/islamisches-wissen/[thema]' as const, params: { thema } })),
    ...Array.from({ length: 114 }, (_, i) => ({ pathname: '/quran/[sure]' as const, params: { sure: String(i + 1) } })),
    ...Array.from({ length: 30 }, (_, i) => ({ pathname: '/quran/cuz/[nr]' as const, params: { nr: String(i + 1) } })),
    ...BUCHSTABEN_SLUGS.map((buchstabe) => ({ pathname: '/elifbe/buchstaben/[buchstabe]' as const, params: { buchstabe } })),
    ...LEKTIONEN.map((l) => ({ pathname: '/elifbe/lektion/[lektion]' as const, params: { lektion: l.slug } })),
    // Der Bukhari-Volltext nur, wenn er freigeschaltet ist (MN-06)
    ...(hadithGesamt
      ? [
          '/hadith/bukhari' as const,
          ...hadithBuecher.map((buch) => ({ pathname: '/hadith/bukhari/[buch]' as const, params: { buch: String(buch) } })),
        ]
      : []),
  ];
  return ziele.map(eintrag);
}
