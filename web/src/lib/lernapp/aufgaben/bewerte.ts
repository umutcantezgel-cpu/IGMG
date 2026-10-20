import { bewerteAuswahl } from './auswahl';
import { bewerteBildWort } from './bild_wort';
import { bewerteFormen } from './formen';
import { bewerteFrei } from './frei';
import { bewerteHarakat } from './harakat';
import { bewerteHoerenSchreiben } from './hoeren_schreiben';
import { bewerteHoerenWaehlen } from './hoeren_waehlen';
import { bewerteLuecke } from './luecke';
import { bewerteMinimalpaare } from './minimalpaare';
import { bewertePaare } from './paare';
import { bewerteSatzbau } from './satzbau';
import { type Antwort, type AntwortVon, type Aufgabe, type Auswertung, type BewertungsKontext, istImplementiert } from './schema';
import { bewerteWortbank } from './wortbank';

/**
 * Bewertung einer Aufgabe (PLAN §4): Urteil richtig/tippfehler/falsch mit Hinweis-Schlüsseln, die anzuzeigende Lösung
 * und je Wiederholungskarte ein Urteil (für die Noten in srs.ts). Implementiert: L1 (`auswahl`, `wortbank`, `paare`) und
 * L2-01 (`bild_wort`, `frei`, `hoeren_waehlen`, `hoeren_schreiben`, `minimalpaare`, `luecke`, `satzbau`, `formen`,
 * `harakat`); die übrigen Typen folgen in L2-02/L2-03.
 */

export type { Auswertung, BewertungsKontext, KartenUrteil } from './schema';

export function bewerte(aufgabe: Aufgabe, antwort: Antwort, kontext: BewertungsKontext = {}): Auswertung {
  if (!istImplementiert(aufgabe.typ)) throw new Error(`Übungstyp „${aufgabe.typ}“ folgt in L2`);
  if (aufgabe.typ !== antwort.typ) throw new Error(`Antwort „${antwort.typ}“ passt nicht zu „${aufgabe.typ}“`);
  const x = antwort as never;
  switch (aufgabe.typ) {
    case 'auswahl':
      return bewerteAuswahl(aufgabe, x as AntwortVon<'auswahl'>);
    case 'wortbank':
      return bewerteWortbank(aufgabe, x as AntwortVon<'wortbank'>, kontext);
    case 'paare':
      return bewertePaare(aufgabe, x as AntwortVon<'paare'>);
    case 'bild_wort':
      return bewerteBildWort(aufgabe, x as AntwortVon<'bild_wort'>);
    case 'frei':
      return bewerteFrei(aufgabe, x as AntwortVon<'frei'>, kontext);
    case 'hoeren_waehlen':
      return bewerteHoerenWaehlen(aufgabe, x as AntwortVon<'hoeren_waehlen'>);
    case 'hoeren_schreiben':
      return bewerteHoerenSchreiben(aufgabe, x as AntwortVon<'hoeren_schreiben'>, kontext);
    case 'minimalpaare':
      return bewerteMinimalpaare(aufgabe, x as AntwortVon<'minimalpaare'>);
    case 'luecke':
      return bewerteLuecke(aufgabe, x as AntwortVon<'luecke'>, kontext);
    case 'satzbau':
      return bewerteSatzbau(aufgabe, x as AntwortVon<'satzbau'>);
    case 'formen':
      return bewerteFormen(aufgabe, x as AntwortVon<'formen'>, kontext);
    case 'harakat':
      return bewerteHarakat(aufgabe, x as AntwortVon<'harakat'>);
  }
}
