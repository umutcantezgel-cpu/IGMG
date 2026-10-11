import { ORGANISATION_KUERZEL, type OrganisationKuerzel } from '@/lib/rechte/matrix';
import type { SeitenBereich } from '@/lib/validierung/seiteninhalte';

/**
 * Zuordnung der Organisationsseiten zu den Bereichen der Tabelle `seiteninhalt` (Schlüssel wie in
 * src/lib/validierung/seiteninhalte.ts). Adressteile der öffentlichen Seiten stehen in src/i18n/routing.ts.
 */
export const BEREICH_ORGANISATION = {
  at: 'organisation-ana-teskilati',
  kt: 'organisation-kadin-teskilati',
  gt: 'organisation-genclik-teskilati',
  kgt: 'organisation-kadin-genclik-teskilati',
} as const satisfies Record<OrganisationKuerzel, SeitenBereich>;

export type OrganisationBereich = (typeof BEREICH_ORGANISATION)[OrganisationKuerzel];

/** Feste Kennung je Organisation (Badge), wie auf der öffentlichen Organisationsseite. */
export const KENNUNG: Record<OrganisationKuerzel, string> = { at: 'AT', kt: 'KT', gt: 'GT', kgt: 'KGT' };

/** Ist der Wert eine der vier Organisationen? */
export function istOrganisation(wert: string): wert is OrganisationKuerzel {
  return (ORGANISATION_KUERZEL as readonly string[]).includes(wert);
}

/** Fehlerschlüssel je Feld; die Texte stehen unter verwaltung.seiteninhalteOrganisationen.fehler. */
export type Fehlerschluessel = 'pflicht' | 'zahl' | 'url' | 'zuLang' | 'zuViele' | 'ungueltig';
