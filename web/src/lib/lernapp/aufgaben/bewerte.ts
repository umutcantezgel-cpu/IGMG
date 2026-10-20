import { bewerteAuswahl } from './auswahl';
import { bewerteDialog } from './dialog';
import { bewerteGeschichte } from './geschichte';
import { bewerteGrammatikTipp } from './grammatik_tipp';
import { bewerteLesenFragen } from './lesen_fragen';
import { bewertePaare } from './paare';
import { type Antwort, type Aufgabe, type Auswertung, type BewertungsKontext, istImplementiert } from './schema';
import { bewerteSchreiben } from './schreiben';
import { bewerteSchriftAr } from './schrift_ar';
import { bewerteSchriftLatein } from './schrift_latein';
import { bewerteSchriftTr } from './schrift_tr';
import { bewerteSprechen } from './sprechen';
import { bewerteWortbank } from './wortbank';

/**
 * Bewertung einer Aufgabe (PLAN §4): Urteil richtig/tippfehler/falsch mit Hinweis-Schlüsseln, die anzuzeigende Lösung
 * und je Wiederholungskarte ein Urteil (für die Noten in srs.ts); bei `sprechen` und `schreiben` zusätzlich die
 * Selbstbewertung (`selbst`). L1: `auswahl`, `wortbank`, `paare`; L2-02: `dialog`, `geschichte`, `lesen_fragen`,
 * `grammatik_tipp`, `schrift_ar`, `schrift_tr`, `schrift_latein`, `sprechen`, `schreiben`.
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
    case 'dialog':
      return bewerteDialog(aufgabe, antwort as Extract<Antwort, { typ: 'dialog' }>);
    case 'geschichte':
      return bewerteGeschichte(aufgabe, antwort as Extract<Antwort, { typ: 'geschichte' }>);
    case 'lesen_fragen':
      return bewerteLesenFragen(aufgabe, antwort as Extract<Antwort, { typ: 'lesen_fragen' }>);
    case 'grammatik_tipp':
      return bewerteGrammatikTipp();
    case 'schrift_ar':
      return bewerteSchriftAr(aufgabe, antwort as Extract<Antwort, { typ: 'schrift_ar' }>);
    case 'schrift_tr':
      return bewerteSchriftTr(aufgabe, antwort as Extract<Antwort, { typ: 'schrift_tr' }>);
    case 'schrift_latein':
      return bewerteSchriftLatein(aufgabe, antwort as Extract<Antwort, { typ: 'schrift_latein' }>);
    case 'sprechen':
      return bewerteSprechen(aufgabe, antwort as Extract<Antwort, { typ: 'sprechen' }>);
    case 'schreiben':
      return bewerteSchreiben(aufgabe, antwort as Extract<Antwort, { typ: 'schreiben' }>);
  }
}
