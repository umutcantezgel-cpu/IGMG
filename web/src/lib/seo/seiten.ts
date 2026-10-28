import type seo from '../../../messages/bereiche/seo.json';
import type { Pfad } from '@/i18n/routing';

/** Schlüssel einer Seite im Namensraum `seo` (messages/bereiche/seo.json); `llms` sind die Texte für /llms.txt. */
export type SeoSchluessel = Exclude<keyof (typeof seo)['de']['seo'], 'llms'>;

/**
 * Feste Seiten mit eigenem Metatitel und eigener Metabeschreibung (ADR 0049): Die Seiten lesen `seo.<schlüssel>` in
 * `generateMetadata`, `/llms.txt` listet sie in dieser Reihenfolge. Titel höchstens 45 Zeichen (Vorlage „%s · IGMG
 * Wetzlar“ ergibt höchstens 60), die Startseite höchstens 60 ohne Vorlage; Beschreibung 120–155 Zeichen
 * (tests/unit/seo-metadaten.test.ts). Neue Seiten (z. B. /hadsch-umra, Schlüssel `hadschUmra`) hier eintragen.
 */
export const SEO_SEITEN = [
  { pfad: '/', schluessel: 'start' },
  { pfad: '/gebetszeiten', schluessel: 'gebetszeiten' },
  { pfad: '/kontakt', schluessel: 'kontakt' },
  { pfad: '/ueber-uns', schluessel: 'ueberUns' },
  { pfad: '/igmg', schluessel: 'igmg' },
  { pfad: '/veranstaltungen', schluessel: 'veranstaltungen' },
  { pfad: '/nachrichten', schluessel: 'nachrichten' },
  { pfad: '/bildung/korankurse', schluessel: 'korankurse' },
  { pfad: '/bildung/voranmeldung', schluessel: 'voranmeldung' },
  { pfad: '/ramadan', schluessel: 'ramadan' },
  { pfad: '/hadsch-umra', schluessel: 'hadschUmra' },
  { pfad: '/kalender', schluessel: 'kalender' },
  { pfad: '/islamisches-wissen', schluessel: 'wissen' },
  { pfad: '/vorstand', schluessel: 'vorstand' },
  { pfad: '/projekte', schluessel: 'projekte' },
  { pfad: '/mitglied-werden', schluessel: 'mitgliedWerden' },
  { pfad: '/spenden', schluessel: 'spenden' },
] as const satisfies readonly { pfad: Pfad; schluessel: SeoSchluessel }[];
