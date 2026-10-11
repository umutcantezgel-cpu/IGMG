import NextLink from 'next/link';
import { getLocale } from 'next-intl/server';
import type { ComponentProps } from 'react';
import { pfadFuer, type Ziel } from './navigation';
import type { Locale } from './routing';

/**
 * Lokalisierter Link für Server-Komponenten: Adresse auf dem Server berechnen, `next/link` rendern
 * (kein next-intl-Client-Code im Browser, K-12). In Client-Komponenten `next/link` mit `pfadFuer` verwenden.
 */
export async function Link({ href, ...rest }: Omit<ComponentProps<typeof NextLink>, 'href'> & { href: Ziel }) {
  const locale = (await getLocale()) as Locale;
  return <NextLink href={pfadFuer(href, locale)} {...rest} />;
}
