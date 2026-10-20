import { gemischteIndizes } from '../engine/zufall';
import type { AntwortVon, Auswertung, KartenUrteil, PaareAufgabe } from './schema';

/**
 * Übungstyp `paare` (PLAN §4): zwei Listen, ein Eintrag links und einer rechts bilden ein Paar. Paar `i` ist im Inhalt
 * `paare[i]`; die rechte Liste wird gemischt angezeigt. Kein Ziehen (WCAG 2.5.7): auswählen per Tippen oder Enter, beide
 * Seiten als Schalter mit `aria-pressed`. Jeder Versuch wird sofort geprüft; die Aufgabe endet, wenn alle Paare gefunden
 * sind. Urteil: ohne Fehlversuch richtig, sonst falsch (die Aufgabe kommt am Ende der Lektion noch einmal). Jede Karte
 * eines Paares, das an einem Fehlversuch beteiligt war, gilt als falsch.
 */

/** Anzeigereihenfolge der rechten Liste. */
export const rechteReihenfolge = (a: Pick<PaareAufgabe, 'paare' | 'schluessel'>): number[] =>
  gemischteIndizes(a.paare.length, a.schluessel);

export const passt = (links: number, rechts: number): boolean => links === rechts;

export function bewertePaare(a: PaareAufgabe, antwort: AntwortVon<'paare'>): Auswertung {
  const gefunden = new Set(antwort.versuche.filter(([l, r]) => passt(l, r)).map(([l]) => l));
  const beteiligt = new Set(antwort.versuche.filter(([l, r]) => !passt(l, r)).flatMap(([l, r]) => [l, r]));
  const vollstaendig = a.paare.every((_, i) => gefunden.has(i));
  const urteil = vollstaendig && beteiligt.size === 0 ? 'richtig' : 'falsch';
  const karten: KartenUrteil[] = a.paare.flatMap((p, i) =>
    p.karte ? [{ karte: p.karte, urteil: vollstaendig && !beteiligt.has(i) ? 'richtig' : 'falsch' } as const] : [],
  );
  for (const k of a.karten ?? []) karten.push({ karte: k, urteil });
  return { urteil, hinweise: [], loesung: null, karten };
}

/** Zustand der Interaktion (rein; die Komponente hält ihn im State). */
export type PaareZustand = {
  /** angewählter Eintrag, der auf seinen Partner wartet */
  gewaehlt: { seite: 'links' | 'rechts'; index: number } | null;
  /** gefundene Paare (Index im Inhalt) */
  gefunden: number[];
  /** alle Versuche [links, rechts] in der Reihenfolge ihres Entstehens */
  versuche: Array<readonly [number, number]>;
  /** letzter Fehlversuch (für die Rückmeldung „passt nicht“) */
  fehler: readonly [number, number] | null;
};

export const PAARE_START: PaareZustand = { gewaehlt: null, gefunden: [], versuche: [], fehler: null };

/** Einen Eintrag wählen: gleiche Seite wechselt die Auswahl, andere Seite prüft das Paar. Gefundene sind gesperrt. */
export function waehlePaar(z: PaareZustand, seite: 'links' | 'rechts', index: number): PaareZustand {
  if (z.gefunden.includes(index)) return z;
  if (!z.gewaehlt || z.gewaehlt.seite === seite) {
    const gleich = z.gewaehlt?.seite === seite && z.gewaehlt.index === index;
    return { ...z, gewaehlt: gleich ? null : { seite, index }, fehler: null };
  }
  const versuch = seite === 'rechts' ? ([z.gewaehlt.index, index] as const) : ([index, z.gewaehlt.index] as const);
  const ok = passt(versuch[0], versuch[1]);
  return {
    gewaehlt: null,
    gefunden: ok ? [...z.gefunden, versuch[0]] : z.gefunden,
    versuche: [...z.versuche, versuch],
    fehler: ok ? null : versuch,
  };
}

export const allesGefunden = (z: PaareZustand, anzahl: number): boolean => z.gefunden.length >= anzahl;
