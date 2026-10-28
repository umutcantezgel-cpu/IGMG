import type { MetadataRoute } from 'next';
import { pfadFuer, type Ziel } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

/**
 * Sitemap als reine Funktion (D-O2, K-16, ADR 0049); `app/sitemap.ts` lädt nur die Daten. Jede Sprachfassung steht als
 * eigener Eintrag mit allen hreflang-Alternativen (de, tr, en, x-default = Deutsch), wie Google es für mehrsprachige
 * Sitemaps beschreibt. `lastModified` nur für Inhalte mit echtem Änderungsdatum (Nachrichten, Veranstaltungen, Wissen)
 * und nie im Beispielmodus: Dort stempelt jeder Bau die Seeds neu, und Suchmaschinen lernten, das Datum zu ignorieren.
 * Keine `changeFrequency`/`priority` – Google wertet beide nicht aus.
 */

/** Feste öffentliche Seiten. Nicht hinein: Verwaltung, Suche, Offline und Anzeige (Vollbild, noindex). */
export const FESTE_ZIELE = [
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
  '/kalender',
  '/ramadan',
  '/spenden',
  // Marktstart P4
  '/hadsch-umra',
] as const satisfies readonly Ziel[];

/** Ein Ziel mit optionalem Änderungszeitpunkt (ISO, aus `aktualisiertAm`). */
export type SitemapZiel = { ziel: Ziel; geaendert?: string };

/** Absolute Adressen einer Seite je Sprache. */
type Adressen = Record<Locale, string>;

/**
 * Baut die Sitemap. `basis` = `basisUrl()`; `ziele` = feste und dynamische Routen; `seiten` = freie CMS-Seiten mit
 * ihren Pfaden je Sprache (`ladeSeitenAdressen`); `mitDatum` = lastModified ausgeben (false im Beispielmodus).
 * Doppelte Adressen erscheinen einmal (die erste gewinnt).
 */
export function baueSitemap({
  basis,
  ziele,
  seiten = [],
  mitDatum,
}: {
  basis: string;
  ziele: readonly (Ziel | SitemapZiel)[];
  seiten?: readonly Adressen[];
  mitDatum: boolean;
}): MetadataRoute.Sitemap {
  const wurzel = basis.replace(/\/+$/, '');
  const absolut = (pfade: Adressen): Adressen => Object.fromEntries(routing.locales.map((l) => [l, `${wurzel}${pfade[l]}`])) as Adressen;
  const gruppen: { adressen: Adressen; geaendert?: string }[] = [
    ...ziele.map((z) => {
      const { ziel, geaendert } = typeof z === 'object' && 'ziel' in z ? z : { ziel: z, geaendert: undefined };
      const pfade = Object.fromEntries(routing.locales.map((l) => [l, pfadFuer(ziel, l)])) as Adressen;
      return { adressen: absolut(pfade), geaendert };
    }),
    ...seiten.map((pfade) => ({ adressen: absolut(pfade) })),
  ];
  const gesehen = new Set<string>();
  return gruppen.flatMap(({ adressen, geaendert }) => {
    const languages = { ...adressen, 'x-default': adressen.de };
    return routing.locales.flatMap((sprache) => {
      const url = adressen[sprache];
      if (gesehen.has(url)) return [];
      gesehen.add(url);
      return [{ url, ...(mitDatum && geaendert ? { lastModified: geaendert } : {}), alternates: { languages } }];
    });
  });
}
