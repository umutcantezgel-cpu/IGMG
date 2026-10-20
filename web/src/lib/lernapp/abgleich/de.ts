import type { HinweisSchluessel, SprachRegeln } from './normalisiere';

/**
 * Deutsch (PLAN §4.1): `ß`↔`ss` und `ae/oe/ue`↔`ä/ö/ü` werden mit Hinweis angenommen; ein kleingeschriebenes Nomen ergibt
 * den Hinweis „Großschreibung“. Als Nomen gilt ein Wort, das in der Lösung groß beginnt und nicht am Satzanfang steht
 * (der Abgleich rät keine Wortarten). Großschreibung, wo die Lösung klein schreibt, bleibt ohne Hinweis.
 */
const UMLAUTE: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue' };

export const REGELN_DE: SprachRegeln = {
  sprache: 'de',
  klein: (text) => text.toLowerCase(),
  still: (text) => text,
  lockerungen: [
    { hinweis: 'eszett', wende: (w) => w.replace(/ß/g, 'ss') },
    { hinweis: 'umlaut', wende: (w) => w.replace(/[äöü]/g, (u) => UMLAUTE[u] ?? u) },
  ],
  pruefeSchreibung(antwort, loesung) {
    const hinweise: HinweisSchluessel[] = [];
    for (let i = 1; i < loesung.length; i++) {
      const soll = loesung[i]?.[0] ?? '';
      const ist = antwort[i]?.[0] ?? '';
      const sollGross = soll !== soll.toLowerCase();
      const istKlein = ist !== ist.toUpperCase() && ist === ist.toLowerCase();
      if (sollGross && istKlein) {
        hinweise.push('grossschreibung');
        break;
      }
    }
    return hinweise;
  },
};
