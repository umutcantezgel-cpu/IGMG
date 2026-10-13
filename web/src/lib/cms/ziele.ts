import type { Ziel } from '@/i18n/navigation';
import { routing, type Locale, type Pfad } from '@/i18n/routing';

/**
 * Interne Linkziele des CMS (ADR 0032): Menüeinträge und der Knopf im Baustein „Aufruf“ zeigen entweder auf eine freie
 * Seite (`seite:<uuid>`, die Adresse je Sprache kommt aus ihren Slugs) oder auf einen Pfad der Website in der deutschen
 * Schreibweise aus `src/i18n/routing.ts` (z. B. `/gebetszeiten`, `/organisationen/ana-teskilati`). Externe Adressen
 * sind bewusst nicht erlaubt (keine Drittanbieter, kein Linkfischen über das Menü).
 */
export const SEITEN_ZIEL = /^seite:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

/** Ziele, die die Auswahl in der Verwaltung anbietet (öffentliche Seiten ohne Anmeldung, deutsche Schreibweise). */
export const ZIEL_VORSCHLAEGE = [
  '/',
  '/gebetszeiten',
  '/veranstaltungen',
  '/nachrichten',
  '/ueber-uns',
  '/vorstand',
  '/projekte',
  '/kontakt',
  '/igmg',
  '/quran',
  '/islamisches-wissen',
  '/bildung/korankurse',
  '/bildung/voranmeldung',
  '/mitglied-werden',
  '/webseite-fuer-moscheen',
  '/meldung',
  '/suche',
  '/impressum',
  '/datenschutz',
  '/organisationen/ana-teskilati',
  '/organisationen/kadin-teskilati',
  '/organisationen/genclik-teskilati',
  '/organisationen/kadin-genclik-teskilati',
] as const;

/** Deutsches Muster eines Routing-Pfads („/organisationen/[organisation]“). */
function deutschesMuster(pfad: Pfad): string {
  const wert = routing.pathnames[pfad] as string | Record<Locale, string>;
  return typeof wert === 'string' ? wert : wert.de;
}

/** Muster eines Routing-Pfads in einer Sprache. */
export function musterIn(pfad: Pfad, sprache: Locale): string {
  const wert = routing.pathnames[pfad] as string | Record<Locale, string>;
  return typeof wert === 'string' ? wert : wert[sprache];
}

const PARAMETER = /\[(?:\.\.\.)?([a-zA-Z]+)\]/g;

/** Muster → regulärer Ausdruck mit benannten Gruppen je Parameter. */
function alsAusdruck(muster: string): RegExp {
  const teile = muster.split(PARAMETER);
  let quelle = '';
  for (let i = 0; i < teile.length; i++) {
    if (i % 2 === 0) quelle += teile[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    else quelle += `(?<${teile[i]}>[a-z0-9][a-z0-9-]{0,119})`;
  }
  return new RegExp(`^${quelle}$`);
}

/**
 * Pfad in einer Sprache (ohne Sprachpräfix) → typisiertes Linkziel aus `routing.pathnames`, sonst null.
 * Parameter sind Slugs aus Kleinbuchstaben, Ziffern und Bindestrichen.
 */
export function routingZielFuer(pfad: string, sprache: Locale = 'de'): Ziel | null {
  if (!pfad.startsWith('/') || pfad.length > 300) return null;
  for (const name of Object.keys(routing.pathnames) as Pfad[]) {
    const muster = sprache === 'de' ? deutschesMuster(name) : musterIn(name, sprache);
    if (!muster.includes('[')) {
      if (muster === pfad) return name;
      continue;
    }
    const treffer = alsAusdruck(muster).exec(pfad);
    if (treffer?.groups) return { pathname: name, params: { ...treffer.groups } };
  }
  return null;
}

/** ID der freien Seite aus einem Ziel `seite:<uuid>`, sonst null. */
export function seitenIdAusZiel(ziel: string): string | null {
  return SEITEN_ZIEL.exec(ziel)?.[1] ?? null;
}

/** Gültiges internes Ziel (freie Seite oder Pfad der Website in deutscher Schreibweise)? */
export function istGueltigesZiel(ziel: string): boolean {
  return seitenIdAusZiel(ziel) !== null || routingZielFuer(ziel, 'de') !== null;
}

/** Schlüssel eines Vorschlags für die Beschriftung in der Verwaltung („/bildung/korankurse“ → „bildung-korankurse“). */
export function zielSchluessel(pfad: string): string {
  return pfad === '/' ? 'startseite' : pfad.slice(1).replaceAll('/', '-');
}
