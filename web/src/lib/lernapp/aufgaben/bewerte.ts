import { bewerteAuswahl } from './auswahl';
import { bewerteBildWort } from './auswertung/bild_wort';
import { bewerteFallfrage } from './auswertung/fallfrage';
import { bewerteFormen } from './auswertung/formen';
import { bewerteFrei } from './auswertung/frei';
import { bewerteHarakat } from './auswertung/harakat';
import { bewerteHoerenSchreiben } from './auswertung/hoeren_schreiben';
import { bewerteHoerenWaehlen } from './auswertung/hoeren_waehlen';
import { bewerteKoranWort } from './auswertung/koran_wort';
import { bewerteLuecke } from './auswertung/luecke';
import { bewerteMinimalpaare } from './auswertung/minimalpaare';
import { bewerteReihenfolge } from './auswertung/reihenfolge';
import { bewerteSatzbau } from './auswertung/satzbau';
import { bewerteWahrFalsch } from './auswertung/wahr_falsch';
import { bewerteZuordnen } from './auswertung/zuordnen';
import { bewerteDialog } from './dialog';
import { bewerteGeschichte } from './geschichte';
import { bewerteGrammatikTipp } from './grammatik_tipp';
import type { Auswertung, BewertungsKontext } from './hilfen';
import { bewerteLesenFragen } from './lesen_fragen';
import { bewertePaare } from './paare';
import { type Antwort, type AntwortVon, type Aufgabe, istImplementiert } from './schema';
import { bewerteSchreiben } from './schreiben';
import { bewerteSchriftAr } from './schrift_ar';
import { bewerteSchriftLatein } from './schrift_latein';
import { bewerteSchriftTr } from './schrift_tr';
import { bewerteSprechen } from './sprechen';
import { bewerteWortbank } from './wortbank';

/**
 * Bewertung einer Aufgabe (PLAN §4): Urteil richtig/tippfehler/falsch mit Hinweis-Schlüsseln, die anzuzeigende Lösung
 * und je Wiederholungskarte ein Urteil (für die Noten in srs.ts); bei `sprechen` und `schreiben` zusätzlich die
 * Selbstbewertung (`selbst`). Implementiert sind alle Typen aus PLAN §4:
 * - L1: `auswahl`, `wortbank`, `paare`
 * - L2-01: `bild_wort`, `frei`, `hoeren_waehlen`, `hoeren_schreiben`, `minimalpaare`, `luecke`, `satzbau`, `formen`,
 *   `harakat` (Bewertung in `auswertung/<typ>.ts`)
 * - L2-02: `dialog`, `geschichte`, `lesen_fragen`, `grammatik_tipp`, `schrift_ar`, `schrift_tr`, `schrift_latein`,
 *   `sprechen`, `schreiben` (Bewertung in `<typ>.ts`)
 * - L2-03: `wahr_falsch`, `zuordnen`, `reihenfolge`, `fallfrage`, `koran_wort` (Bewertung in `auswertung/<typ>.ts`)
 *
 * Alle Typen in einem Modul – für Tests und Server. Der Spieler lädt es nicht: Er nimmt die Bewertung aus dem Chunk des
 * Übungstyps (`components/lernapp/aufgaben/lader.ts`, KERN 4.0 §9), die Engine bekommt sie als `Bewerter`.
 */

export type { Auswertung, Bewerter, BewertungsKontext, KartenUrteil } from './hilfen';

export function bewerte(aufgabe: Aufgabe, antwort: Antwort, kontext: BewertungsKontext = {}): Auswertung {
  if (!istImplementiert(aufgabe.typ)) throw new Error(`Übungstyp „${aufgabe.typ}“ ist nicht spielbar`);
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
    case 'dialog':
      return bewerteDialog(aufgabe, x as AntwortVon<'dialog'>);
    case 'geschichte':
      return bewerteGeschichte(aufgabe, x as AntwortVon<'geschichte'>);
    case 'lesen_fragen':
      return bewerteLesenFragen(aufgabe, x as AntwortVon<'lesen_fragen'>);
    case 'grammatik_tipp':
      return bewerteGrammatikTipp();
    case 'schrift_ar':
      return bewerteSchriftAr(aufgabe, x as AntwortVon<'schrift_ar'>);
    case 'schrift_tr':
      return bewerteSchriftTr(aufgabe, x as AntwortVon<'schrift_tr'>);
    case 'schrift_latein':
      return bewerteSchriftLatein(aufgabe, x as AntwortVon<'schrift_latein'>);
    case 'sprechen':
      return bewerteSprechen(aufgabe, x as AntwortVon<'sprechen'>);
    case 'schreiben':
      return bewerteSchreiben(aufgabe, x as AntwortVon<'schreiben'>);
    case 'wahr_falsch':
      return bewerteWahrFalsch(aufgabe, x as AntwortVon<'wahr_falsch'>);
    case 'zuordnen':
      return bewerteZuordnen(aufgabe, x as AntwortVon<'zuordnen'>);
    case 'reihenfolge':
      return bewerteReihenfolge(aufgabe, x as AntwortVon<'reihenfolge'>);
    case 'fallfrage':
      return bewerteFallfrage(aufgabe, x as AntwortVon<'fallfrage'>);
    case 'koran_wort':
      return bewerteKoranWort(aufgabe, x as AntwortVon<'koran_wort'>);
  }
}
