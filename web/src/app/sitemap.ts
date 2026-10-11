import type { MetadataRoute } from 'next';
import { SLUG } from '@/components/website/organisation/stil';
import { routing, type Locale } from '@/i18n/routing';
import { adresse } from '@/lib/seo/metadaten';
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
];

function eintrag(ziel: Ziel): MetadataRoute.Sitemap[number] {
  const sprachen = Object.fromEntries(routing.locales.map((l: Locale) => [l, adresse(ziel, l)]));
  return { url: adresse(ziel, 'de'), alternates: { languages: { ...sprachen, 'x-default': adresse(ziel, 'de') } } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [veranstaltungen, nachrichten, themen] = await Promise.all([ladeVeranstaltungsSlugs(), ladeNachrichtenSlugs(), ladeWissensSlugs()]);
  const ziele: Ziel[] = [
    ...FEST,
    ...Object.values(SLUG).map((organisation) => ({ pathname: '/organisationen/[organisation]' as const, params: { organisation } })),
    ...veranstaltungen.map((slug) => ({ pathname: '/veranstaltungen/[slug]' as const, params: { slug } })),
    ...nachrichten.map((slug) => ({ pathname: '/nachrichten/[slug]' as const, params: { slug } })),
    ...themen.map((thema) => ({ pathname: '/islamisches-wissen/[thema]' as const, params: { thema } })),
  ];
  return ziele.map(eintrag);
}
