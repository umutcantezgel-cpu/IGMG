import type { HinweisSchluessel } from '@/lib/lernapp/abgleich/normalisiere';
import type { AntwortVon, AufgabeVon, Auswertung, ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import type { Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import type de from '../../../messages/lernapp/de.json';

/**
 * Gemeinsame Typen der Spieler-Bausteine (Client). Texte kommen als Prop aus `messages/lernapp/<ui>.json`
 * (Namensräume `spieler` und `aufgaben`) und werden mit `format.ts` gefüllt – kein next-intl im Client (ADR 0037).
 */

/** Oberflächen- bzw. Inhaltssprache; Typ und Schreibrichtung aus `kurse.ts` (eine Quelle für alle Pakete). */
export type UiSprache = Oberflaeche;
export { richtung } from '@/lib/lernapp/kurse';

/** Texte der Übungstypen aus L2-02 (Namensräume `aufgaben2`, `sprechen`, `schreiben`; Form wie `messages/lernapp/de.json`). */
export type WeitereTexte = { aufgaben2: (typeof de)['aufgaben2']; sprechen: (typeof de)['sprechen']; schreiben: (typeof de)['schreiben'] };

/**
 * Einstellungen, die der Spieler beachtet (KERN 4.0 §8, ADR 0042 Nr. 8/12): „Hörübungen aus“, „Sprechübungen aus“ (beide aus
 * den Einstellungen des Profils) und der Schalter `lernapp_sprechen` (Spracherkennung im Browser; aus → nur Selbstvergleich).
 */
export type SpielerOptionen = { hoeren: boolean; sprechen: boolean; spracherkennung: boolean };
export const STANDARD_OPTIONEN: SpielerOptionen = { hoeren: true, sprechen: true, spracherkennung: false };

export type SpielerTexte = WeitereTexte & {
  spieler: {
    fortschritt: string;
    aufgabeVon: string;
    nochEinmal: string;
    laedt: string;
    ladefehler: string;
    erneut: string;
    pruefen: string;
    weiter: string;
    richtig: string;
    tippfehler: string;
    falsch: string;
    loesung: string;
    spaeter: string;
    hinweis: Record<HinweisSchluessel, string>;
    fertigTitel: string;
    fertigText: string;
    xp: string;
    zurueck: string;
    leer: string;
  };
  aufgaben: {
    auswahl: {
      waehleUebersetzung: string;
      waehleWort: string;
      waehleBedeutung: string;
      waehleAntwort: string;
      optionen: string;
      tasten: string;
    };
    wortbank: {
      uebersetze: string;
      schreibeGehoertes: string;
      antwort: string;
      antwortLeer: string;
      bank: string;
      hinzufuegen: string;
      entfernen: string;
      tasten: string;
    };
    paare: {
      findePaare: string;
      links: string;
      rechts: string;
      gewaehlt: string;
      gefunden: string;
      keinPaar: string;
      fertig: string;
      tasten: string;
    };
  };
};

/** Props jeder Übungskomponente (eigener Chunk je Typ, `aufgaben/lader.ts`). */
export type AufgabenProps<T extends ImplementierterTyp> = {
  aufgabe: AufgabeVon<T>;
  texte: SpielerTexte['aufgaben'];
  /** Oberflächensprache (Ziffern, Richtung der Bedienung) */
  sprache: UiSprache;
  ziffern: Ziffern;
  /** nach dem Prüfen: keine Eingabe mehr */
  gesperrt: boolean;
  /** Ergebnis der Prüfung (für die Anzeige von Lösung und Auswahl) */
  auswertung: Auswertung | null;
  antwort: AntwortVon<T> | null;
  /** aktuelle (noch nicht geprüfte) Antwort; `null` sperrt „Prüfen“ */
  setzeAntwort: (antwort: AntwortVon<T> | null) => void;
  /** sofort prüfen (Paare: wenn alle gefunden sind) */
  gibAb: (antwort: AntwortVon<T>) => void;
  /** Text für die eine Live-Region des Bildschirms (im Rückmeldeblatt) */
  melde: (text: string) => void;
  /** Texte der Übungstypen aus L2-02 */
  weitere: WeitereTexte;
  /** ohne Wertung weiter (gelesener Tipp, „Ich kann gerade nicht sprechen/hören“) */
  ueberspringe: () => void;
  optionen: SpielerOptionen;
};
