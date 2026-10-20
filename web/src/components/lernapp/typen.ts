import type { HinweisSchluessel } from '@/lib/lernapp/abgleich/normalisiere';
import type { AntwortVon, AufgabeVon, Auswertung, ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import type { Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';

/**
 * Gemeinsame Typen der Spieler-Bausteine (Client). Texte kommen als Prop aus `messages/lernapp/<ui>.json`
 * (Namensräume `spieler` und `aufgaben`) und werden mit `format.ts` gefüllt – kein next-intl im Client (ADR 0037).
 */

/** Oberflächen- bzw. Inhaltssprache; Typ und Schreibrichtung aus `kurse.ts` (eine Quelle für alle Pakete). */
export type UiSprache = Oberflaeche;
export { richtung } from '@/lib/lernapp/kurse';

export type SpielerTexte = {
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
};
