import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { oeffentlicheAdresse } from '@/lib/umgebung';

type Ziel = Parameters<typeof getPathname>[0]['href'];

/** Basis-URL der Website (für kanonische Adressen, hreflang, OG); in Vorschauen ohne APP_URL die Branch-Adresse (ADR 0022). */
export function basisUrl(): string {
  return oeffentlicheAdresse(process.env);
}

/** Lokalisierte absolute Adresse einer Seite. */
export function adresse(ziel: Ziel, sprache: Locale): string {
  return `${basisUrl()}${getPathname({ href: ziel, locale: sprache })}`;
}

/**
 * Metadaten je Seite und Sprache (K-16): Titel, Beschreibung, kanonische Adresse, hreflang aller Sprachen
 * plus x-default (Deutsch), Open Graph. `titel: null` = Standardtitel (Startseite).
 */
export async function metadatenFuer({
  pfad,
  titel,
  beschreibung,
}: {
  pfad: Ziel;
  titel: string | null;
  beschreibung?: string;
}): Promise<Metadata> {
  const sprache = (await getLocale()) as Locale;
  const sprachen = Object.fromEntries(routing.locales.map((l) => [l, adresse(pfad, l)]));
  return {
    ...(titel ? { title: titel } : {}),
    ...(beschreibung ? { description: beschreibung } : {}),
    alternates: { canonical: adresse(pfad, sprache), languages: { ...sprachen, 'x-default': adresse(pfad, 'de') } },
    openGraph: {
      type: 'website',
      siteName: 'IGMG Wetzlar',
      locale: { de: 'de_DE', tr: 'tr_TR', en: 'en_GB' }[sprache],
      url: adresse(pfad, sprache),
      ...(titel ? { title: titel } : {}),
      ...(beschreibung ? { description: beschreibung } : {}),
    },
  };
}
