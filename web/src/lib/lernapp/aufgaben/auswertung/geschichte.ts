import { gemischteIndizes } from '../../engine/zufall';
import type { GeschichteAntwort, GeschichteAufgabe } from '../geschichte';
import { type Auswertung, type KartenUrteil, kartenMit } from '../hilfen';

/** `geschichte` (Nutzlast in `../geschichte.ts`): ein Schritt des Ablaufs – Zeile aufdecken oder Frage stellen. */
export type GeschichteSchritt = { art: 'zeile'; index: number } | { art: 'frage'; index: number };

/** Ablauf der Geschichte: jede Zeile, danach die Fragen, die nach ihr stehen. */
export function ablauf(a: Pick<GeschichteAufgabe, 'zeilen' | 'fragen'>): GeschichteSchritt[] {
  const schritte: GeschichteSchritt[] = [];
  a.zeilen.forEach((_, i) => {
    schritte.push({ art: 'zeile', index: i });
    a.fragen.forEach((f, j) => {
      if (f.nach === i) schritte.push({ art: 'frage', index: j });
    });
  });
  return schritte;
}

/** Anzeigereihenfolge der Optionen einer Frage (deterministisch je Aufgabe und Frage). */
export const frageReihenfolge = (a: Pick<GeschichteAufgabe, 'fragen' | 'schluessel'>, frage: number): number[] =>
  gemischteIndizes(a.fragen[frage]?.optionen.length ?? 0, `${a.schluessel}#${frage}`);

/** Alle Fragen im ersten Versuch richtig → richtig; Karten einer Frage mit eigenem Urteil, die der Aufgabe mit dem Gesamturteil. */
export function bewerteGeschichte(a: GeschichteAufgabe, antwort: GeschichteAntwort): Auswertung {
  const richtigJe = a.fragen.map((f, i) => antwort.wahlen[i] === f.richtig);
  const vollstaendig = antwort.wahlen.length === a.fragen.length;
  const urteil = vollstaendig && richtigJe.every(Boolean) ? 'richtig' : 'falsch';
  const karten: KartenUrteil[] = a.fragen.flatMap((f, i) =>
    f.karte ? [{ karte: f.karte, urteil: richtigJe[i] ? 'richtig' : 'falsch' } as const] : [],
  );
  karten.push(...kartenMit(a.karten, urteil));
  return { urteil, hinweise: [], loesung: null, karten };
}
