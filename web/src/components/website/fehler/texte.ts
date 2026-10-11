import sprachdatei from '../../../../messages/bereiche/fehlergrenze.json';

/**
 * Texte der Fehlergrenze `global-error.tsx`. Sie kann keine Server-Daten lesen und lädt kein next-intl, deshalb
 * kommen die Texte zur Buildzeit aus einer eigenen, kleinen Sprachdatei (nur die sechs Texte der Grenze – die
 * Grenze liegt in jeder Route, K-12). Bewusst ohne `@/i18n/routing` und `pfadFuer` (Pfadtabelle).
 */
const SPRACHEN = ['de', 'tr', 'en'] as const;
export type FehlerSprache = (typeof SPRACHEN)[number];

export type FehlerTexte = (typeof sprachdatei)['de']['fehlergrenze'];

export function fehlerTexte(sprache: FehlerSprache): FehlerTexte {
  return sprachdatei[sprache].fehlergrenze;
}

/** Sprache aus dem ersten Adressteil (K-02): Deutsch ohne Präfix, /tr und /en mit Präfix. Unbekannt → Deutsch. */
export function spracheAusPfad(pfad: string): FehlerSprache {
  const teil = pfad.split('/')[1] ?? '';
  return (SPRACHEN as readonly string[]).includes(teil) ? (teil as FehlerSprache) : 'de';
}

/** Startseite je Sprache (K-02: Deutsch ohne Präfix). */
export function startseite(sprache: FehlerSprache): string {
  return sprache === 'de' ? '/' : `/${sprache}`;
}
