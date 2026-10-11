import { routing, type Locale, type Pfad } from './routing';

/**
 * Lokalisierte Adressen (K-03) ohne `createNavigation` von next-intl: Schon der Import zieht dessen Client-`Link`
 * samt `use-intl` (≈ 12 kB gzip) in die Chunks jeder öffentlichen Route (Turbopack bündelt alle Client-Referenzen
 * des Server-Graphen, K-12). Gleichwertigkeit mit next-intl prüft `tests/unit/navigation.test.ts`.
 */
type Parameter = Record<string, string | number | readonly (string | number)[]>;

/** Lokalisiertes Linkziel: Pfad aus routing.pathnames, optional mit Parametern, Abfrage und Anker. */
export type Ziel = Pfad | { pathname: Pfad; params?: Parameter; query?: Record<string, string>; hash?: string };

/** Fertige Adresse eines Ziels in einer Sprache (Deutsch ohne Präfix, „as-needed“), inklusive Abfrage und Anker. */
export function pfadFuer(ziel: Ziel, locale: Locale): string {
  const z = typeof ziel === 'string' ? { pathname: ziel } : ziel;
  const muster = routing.pathnames[z.pathname] as string | Record<Locale, string>;
  let pfad = typeof muster === 'string' ? muster : muster[locale];
  for (const [name, wert] of Object.entries('params' in z && z.params ? z.params : {})) {
    const teile = (Array.isArray(wert) ? wert : [wert]).map((w) => encodeURIComponent(String(w)));
    pfad = pfad.replace(`[...${name}]`, teile.join('/')).replace(`[${name}]`, teile.join('/'));
  }
  const praefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const basis = praefix && pfad === '/' ? praefix : `${praefix}${pfad}`;
  const abfrage = 'query' in z && z.query && Object.keys(z.query).length ? `?${new URLSearchParams(z.query)}` : '';
  const anker = 'hash' in z && z.hash ? `#${z.hash}` : '';
  return basis + abfrage + anker;
}

/** Kompatible Kurzform wie `getPathname` von next-intl (ohne Anker). */
export function getPathname({ href, locale }: { href: Ziel; locale: Locale }): string {
  return pfadFuer(typeof href === 'string' ? href : { ...href, hash: undefined }, locale);
}
