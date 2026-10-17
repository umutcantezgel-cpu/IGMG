import { istFaellig, type Kartenstand } from '../srs';

/**
 * Kartenwahl für „Wiederholen“ (PLAN §4, ADR 0038 Nr. 3): zuerst die fälligen Karten (am längsten überfällige zuerst),
 * dann schwache Wörter (zuletzt „nochmal“ oder „schwer“, mit Fehlern oder geringer Stabilität). Dazu die Stufe der Übung
 * nach Stabilität: erkennen → Wortbank → Produktion.
 */

export const WIEDERHOLUNG_ANZAHL = 15;

/** Schwäche einer Karte (0 = stark); höher heißt eher wiederholen. */
export function schwaeche(s: Kartenstand): number {
  const note = s.letzteNote === 'nochmal' ? 3 : s.letzteNote === 'schwer' ? 2 : 0;
  const fehler = Math.min(3, s.fehler);
  const stabil = s.stabilitaet < 1 ? 2 : s.stabilitaet < 3 ? 1 : 0;
  return note + fehler + stabil;
}

const nachSchluessel = (a: Kartenstand, b: Kartenstand) => (a.karte < b.karte ? -1 : a.karte > b.karte ? 1 : 0);

/** Karten für eine Wiederholungssitzung: fällige zuerst, dann schwache; höchstens `anzahl`. Deterministisch. */
export function waehleKarten(
  staende: Iterable<Kartenstand>,
  { jetzt, anzahl = WIEDERHOLUNG_ANZAHL }: { jetzt: Date; anzahl?: number },
): Kartenstand[] {
  const alle = [...staende];
  const faellig = alle
    .filter((s) => istFaellig(s, jetzt))
    .sort((a, b) => Date.parse(a.faellig) - Date.parse(b.faellig) || nachSchluessel(a, b));
  const schwach = alle
    .filter((s) => !istFaellig(s, jetzt) && schwaeche(s) > 0)
    .sort((a, b) => schwaeche(b) - schwaeche(a) || Date.parse(a.faellig) - Date.parse(b.faellig) || nachSchluessel(a, b));
  return [...faellig, ...schwach].slice(0, Math.max(0, anzahl));
}

/** Zahl der fälligen Karten (für „fällige Wiederholung“ auf der Startseite). */
export const faelligeAnzahl = (staende: Iterable<Kartenstand>, jetzt: Date): number =>
  [...staende].filter((s) => istFaellig(s, jetzt)).length;

export type UebungsStufe = 'erkennen' | 'wortbank' | 'produktion';

/** Übungsart nach Stabilität (Tage): neu oder unter 2 → erkennen, unter 10 → Wortbank, sonst Produktion. */
export function uebungsStufe(s: Kartenstand | undefined): UebungsStufe {
  if (!s || s.stabilitaet < 2) return 'erkennen';
  return s.stabilitaet < 10 ? 'wortbank' : 'produktion';
}
