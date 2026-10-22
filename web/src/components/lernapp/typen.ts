import type { HinweisSchluessel } from '@/lib/lernapp/abgleich/normalisiere';
import type { AntwortVon, AufgabenTyp, AufgabeVon, Auswertung, ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import type { Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche, RichtungId } from '@/lib/lernapp/kurse';
import type de from '../../../messages/lernapp/de.json';
import type { AbschlussTexte } from './Abschluss';

/**
 * Gemeinsame Typen der Spieler-Bausteine (Client). Texte kommen als Prop aus `messages/lernapp/<ui>.json`
 * (Namensräume `spieler`, `aufgaben`, `tastatur`, `aufgaben2`, `sprechen` und `schreiben`) und werden mit `format.ts` gefüllt – kein next-intl im Client
 * (ADR 0037).
 */

/** Oberflächen- bzw. Inhaltssprache; Typ und Schreibrichtung aus `kurse.ts` (eine Quelle für alle Pakete). */
export type UiSprache = Oberflaeche;
export { richtung } from '@/lib/lernapp/kurse';

/** Texte des Melde-Dialogs (Namensraum `melden`, L3-06b). */
export type MeldenTexte = (typeof de)['melden'];

/** Texte der Schreibabgabe an die Lehrkraft und der eigenen Abgaben (Namensraum `schreibabgabe`, L5-03). */
export type SchreibabgabeTexte = (typeof de)['schreibabgabe'];

/**
 * Schreibabgabe an die Lehrkraft der eigenen Gruppe (L5-03; PLAN §4.3; ADR 0042 Nr. 11): nur in Sprachkursen und nur mit dem
 * Schalter `lernapp_gruppen` (die Seite gibt sie sonst nicht mit). Ob die Person abgeben darf, entscheidet der Server.
 */
export type AbgabeOption = { kurs: RichtungId; texte: SchreibabgabeTexte };

/** Texte der Übungstypen aus L2-02 (Namensräume `aufgaben2`, `sprechen`, `schreiben`; Form wie `messages/lernapp/de.json`). */
export type WeitereTexte = { aufgaben2: (typeof de)['aufgaben2']; sprechen: (typeof de)['sprechen']; schreiben: (typeof de)['schreiben'] };

/**
 * Einstellungen, die der Spieler beachtet (KERN 4.0 §8, ADR 0042 Nr. 8/12): „Hörübungen aus“, „Sprechübungen aus“ (beide aus
 * den Einstellungen des Profils) und der Schalter `lernapp_sprechen` (Spracherkennung im Browser; aus → nur Selbstvergleich).
 */
export type SpielerOptionen = { hoeren: boolean; sprechen: boolean; spracherkennung: boolean };
export const STANDARD_OPTIONEN: SpielerOptionen = { hoeren: true, sprechen: true, spracherkennung: false };

/**
 * Texte des Abschlussbildschirms (Tagesziel, Serie, neue Abzeichen; L7-01). Optional: ohne sie (Einstufung) zeigt der
 * Spieler am Ende nur Ergebnis und XP.
 */
export type SpielerTexte = WeitereTexte & {
  abschluss?: AbschlussTexte;
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
    bild_wort: { waehleWort: string; bild: string; beschreibung: string; optionen: string; tasten: string };
    frei: { uebersetze: string; antworte: string; eingabe: string };
    hoeren: {
      anhoeren: string;
      langsam: string;
      spielt: string;
      nichtHoeren: string;
      uebersprungen: string;
      audioFolgt: string;
      audioFolgtText: string;
      nichtMoeglich: string;
      keinNetz: string;
      ueberspringen: string;
      abschrift: string;
    };
    hoeren_waehlen: { waehleGehoertes: string; waehleBedeutung: string; optionen: string; tasten: string };
    hoeren_schreiben: { schreibeGehoertes: string; eingabe: string };
    minimalpaare: { waehleGehoertes: string; optionen: string; tasten: string };
    luecke: { ergaenze: string; luecke: string; optionen: string; hilfe: string; tasten: string };
    satzbau: { ordne: string };
    formen: { ergaenze: string; tabelle: string; richtigeForm: string };
    harakat: {
      waehleVokalisierung: string;
      optionen: string;
      bedeutung: string;
      tasten: string;
      /** Namen der arabischen Buchstaben und Zeichen nach Codepunkt (`u0628`) */
      zeichen: Record<string, string>;
    };
    /** Wissenskurs (L2-03): gemeinsam für Begründung und Quellenzeile */
    wissen: { begruendung: string; quelle: string; quelleZeigen: string };
    wahr_falsch: {
      stimmtDas: string;
      stimmt: string;
      stimmtNicht: string;
      aussage: string;
      optionen: string;
      tasten: string;
      ergebnisWahr: string;
      ergebnisFalsch: string;
    };
    zuordnen: { ordneZu: string; kategorien: string; tasten: string; passt: string; gehoertZu: string };
    reihenfolge: {
      ordne: string;
      liste: string;
      hoch: string;
      runter: string;
      verschoben: string;
      tasten: string;
      passt: string;
      gehoertAn: string;
    };
    fallfrage: { waehleAntwort: string; fall: string; hinweis: string; optionen: string; tasten: string };
    koran_wort: { waehleBedeutung: string; waehleWurzel: string; wort: string; stelle: string; optionen: string; tasten: string };
  };
  /** Sonderzeichenleiste und arabische Bildschirmtastatur */
  tastatur: TastaturTexte;
};

export type TastaturTexte = {
  sonderzeichen: string;
  einfuegen: string;
  arabisch: string;
  buchstaben: string;
  vokalzeichen: string;
  leerzeichen: string;
  loeschen: string;
  tasten: string;
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
  /** Texte der Sonderzeichenleiste und der arabischen Tastatur */
  tastatur: TastaturTexte;
  /** Texte der Übungstypen aus L2-02 */
  weitere: WeitereTexte;
  /**
   * Aufgabe ohne Bewertung überspringen (gelesener Tipp, Hörübung ohne Audio, Hören auf dem Gerät nicht möglich, „Ich kann
   * gerade nicht sprechen“); mit `typen` auch alle späteren Aufgaben dieser Typen („Ich kann gerade nicht sprechen“), mit
   * `hoeren` alle späteren, die Hören brauchen („Ich kann gerade nicht hören“). Meldung `meldung` in der Live-Region.
   */
  ueberspringe: (o?: { typen?: readonly AufgabenTyp[]; hoeren?: boolean; meldung?: string }) => void;
  /** Die Aufgabe lässt sich nur überspringen (der Spieler blendet „Prüfen“ aus). */
  nurUeberspringen: (ja: boolean) => void;
  /** Einstellungen „Hörübungen aus“, „Sprechübungen aus“ und Schalter Spracherkennung */
  optionen: SpielerOptionen;
  /** Schreibabgabe an die Lehrkraft (nur `schreiben`; ohne: kein Angebot) */
  abgabe?: AbgabeOption;
};
