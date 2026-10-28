import { getLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { gemeindeGraph } from '@/lib/seo/jsonld';
import { basisUrl } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { JsonLd } from './JsonLd';

/**
 * Die Gemeinde als Entität (ADR 0049): Organisation, Moschee und Website als ein `@graph` auf Startseite, Kontakt,
 * Über uns und IGMG. Kontaktdaten aus dem gecachten Seiteninhalt „kontakt“ (statisch, K-01); ein Element je Seite.
 */
export async function GemeindeJsonLd() {
  const [sprache, kontakt] = await Promise.all([getLocale(), ladeSeiteninhalt('kontakt')]);
  return <JsonLd daten={gemeindeGraph({ basis: basisUrl(), kontakt, sprache: sprache as Locale })} />;
}
