import { bewerteAuswahl } from './auswahl';
import { bewertePaare } from './paare';
import { type Antwort, type Aufgabe, type Auswertung, type BewertungsKontext, istImplementiert } from './schema';
import { bewerteWortbank } from './wortbank';

/**
 * Bewertung einer Aufgabe (PLAN §4): Urteil richtig/tippfehler/falsch mit Hinweis-Schlüsseln, die anzuzeigende Lösung
 * und je Wiederholungskarte ein Urteil (für die Noten in srs.ts). In L1 sind `auswahl`, `wortbank` und `paare`
 * implementiert; die übrigen Typen folgen in L2.
 */

export type { Auswertung, BewertungsKontext, KartenUrteil } from './schema';

export function bewerte(aufgabe: Aufgabe, antwort: Antwort, kontext: BewertungsKontext = {}): Auswertung {
  if (!istImplementiert(aufgabe.typ)) throw new Error(`Übungstyp „${aufgabe.typ}“ folgt in L2`);
  if (aufgabe.typ !== antwort.typ) throw new Error(`Antwort „${antwort.typ}“ passt nicht zu „${aufgabe.typ}“`);
  switch (aufgabe.typ) {
    case 'auswahl':
      return bewerteAuswahl(aufgabe, antwort as Extract<Antwort, { typ: 'auswahl' }>);
    case 'wortbank':
      return bewerteWortbank(aufgabe, antwort as Extract<Antwort, { typ: 'wortbank' }>, kontext);
    case 'paare':
      return bewertePaare(aufgabe, antwort as Extract<Antwort, { typ: 'paare' }>);
  }
}
