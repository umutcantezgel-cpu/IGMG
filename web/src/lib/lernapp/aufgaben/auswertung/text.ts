import { gleicheAb, type Sprache } from '../../abgleich';
import { ANTWORT_MAX, type Auswertung, type BewertungsKontext, kartenMit } from '../hilfen';

/**
 * Getippte Antwort gegen Lösungen (PLAN §4.1: Normalisierung, Lockerungen mit Hinweis, Tippfehler-Toleranz,
 * Lexikonschutz), gemeinsam für `frei`, `hoeren_schreiben`, `luecke` und `formen`. Ohne Toleranz für fertig geschriebene
 * Antworten (gewählte Option der Lücke).
 */
export function textAuswertung(
  eingabe: string,
  loesungen: readonly string[],
  sprache: Sprache,
  karten: readonly string[] | undefined,
  kontext: BewertungsKontext,
  { toleranz = true }: { toleranz?: boolean } = {},
): Auswertung {
  const e = gleicheAb(eingabe.slice(0, ANTWORT_MAX), loesungen, sprache, { toleranz, lexikon: kontext.lexikon });
  return { urteil: e.urteil, hinweise: e.hinweise, loesung: e.loesung, karten: kartenMit(karten, e.urteil) };
}
