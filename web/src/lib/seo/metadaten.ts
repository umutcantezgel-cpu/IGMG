import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { OG_GROESSE, ogTexte } from '@/lib/seo/og-bild';
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
 *
 * Open Graph mit dem Standardbild (`[locale]/opengraph-image`, id „standard“): Ein eigenes `openGraph` der Seite
 * ersetzt das geerbte Objekt samt Bild vollständig (Next.js), ohne diese Angabe hätten Startseite und Übersichten
 * kein og:image (K-05 Nachabnahme). Seiten mit eigener `opengraph-image`-Datei (Veranstaltung, Neuigkeit) setzen
 * `eigenesBild`: Ein angegebenes Bild verdrängte sonst das dateibasierte der Seite (im Entwicklungsserver nachgewiesen).
 */
export async function metadatenFuer({
  pfad,
  titel,
  beschreibung,
  eigenesBild = false,
}: {
  pfad: Ziel;
  titel: string | null;
  beschreibung?: string;
  /** Die Seite hat eine eigene `opengraph-image`-Datei: kein Standardbild setzen. */
  eigenesBild?: boolean;
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
      ...(eigenesBild
        ? {}
        : {
            images: [
              {
                url: `${adresse('/', sprache).replace(/\/$/, '')}/opengraph-image/standard`,
                ...OG_GROESSE,
                alt: ogTexte(sprache).alt.standard,
              },
            ],
          }),
    },
  };
}
