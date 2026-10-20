import type { HinweisSchluessel, Lexikon, Urteil } from '../abgleich';
import type { Antwort, Aufgabe, AufgabenTyp } from './schema';

/**
 * Gemeinsame Hilfen der Übungstypen ohne Zod (PLAN §4, KERN 4.0 §9): Typen der Auswertung, Karten-Urteile, Wahl nach
 * Index, Hörtypen. Eigenes Modul, damit Spieler, Engine und die Übungs-Chunks (Bewertung in `auswertung/`) nichts von den
 * Schemas laden müssen; die Schemas stehen in `schema.ts`, `grundlagen.ts` und den Typ-Dateien (`<typ>.ts`).
 */

/**
 * Spielbar (Bewertung und Anzeige vorhanden): L1, L2-01 und L2-03. Hier ohne Zod, damit Engine und Spieler die Liste
 * kennen, ohne die Schemas zu laden (KERN 4.0 §9, TBT); `schema.ts` reicht sie weiter.
 */
export const IMPLEMENTIERT = [
  'auswahl',
  'wortbank',
  'paare',
  'bild_wort',
  'frei',
  'hoeren_waehlen',
  'hoeren_schreiben',
  'minimalpaare',
  'luecke',
  'satzbau',
  'formen',
  'harakat',
  'wahr_falsch',
  'zuordnen',
  'reihenfolge',
  'fallfrage',
  'koran_wort',
] as const satisfies readonly AufgabenTyp[];
export type ImplementierterTyp = (typeof IMPLEMENTIERT)[number];
export const istImplementiert = (typ: AufgabenTyp): typ is ImplementierterTyp => (IMPLEMENTIERT as readonly string[]).includes(typ);

export type KartenUrteil = { karte: string; urteil: Urteil };

export type Auswertung = {
  urteil: Urteil;
  hinweise: HinweisSchluessel[];
  /** richtige Lösung zur Anzeige (bei `tippfehler` und `falsch`; bei `richtig` die getroffene Lösung) */
  loesung: string | null;
  karten: KartenUrteil[];
};

export type BewertungsKontext = { lexikon?: Lexikon };

/**
 * Bewertung einer Aufgabe. Die Engine (`engine/sitzung.ts`) bekommt sie vom Aufrufer: der Spieler nimmt die des geladenen
 * Übungs-Chunks (`components/lernapp/aufgaben/lader.ts`), Tests und Server nehmen `bewerte.ts` (alle Typen).
 */
export type Bewerter = (aufgabe: Aufgabe, antwort: Antwort, kontext?: BewertungsKontext) => Auswertung;

/** Alle Karten einer Aufgabe mit demselben Urteil. */
export const kartenMit = (karten: readonly string[] | undefined, urteil: Urteil): KartenUrteil[] =>
  (karten ?? []).map((karte) => ({ karte, urteil }));

/** Auswertung einer Wahl nach Index (auswahl, bild_wort, hoeren_waehlen, minimalpaare). */
export function nachIndex(
  a: { optionen: readonly { text: string }[]; richtig: number; karten?: readonly string[] },
  wahl: number,
): Auswertung {
  const urteil = wahl === a.richtig ? 'richtig' : 'falsch';
  return { urteil, hinweise: [], loesung: a.optionen[a.richtig]?.text ?? null, karten: kartenMit(a.karten, urteil) };
}

/** Höchstlänge einer getippten Antwort (Eingabefeld und Bewertung). */
export const ANTWORT_MAX = 600;

/** Übungstypen mit Hören: übersprungen ohne Audio, bei „Hörübungen aus“ und nach „Ich kann gerade nicht hören“. */
export const HOER_TYPEN = ['hoeren_waehlen', 'hoeren_schreiben', 'minimalpaare'] as const;
export type HoerTyp = (typeof HOER_TYPEN)[number];
export const istHoerTyp = (typ: string): typ is HoerTyp => (HOER_TYPEN as readonly string[]).includes(typ);

/** Aufgabe mit (möglichem) Text zum Hören. */
export type MitHoeren = { hoeren?: { text: string; audio?: unknown } };

/** Hat der zu hörende Text einen Clip? */
export const hatAudio = (a: MitHoeren): boolean => a.hoeren?.audio !== undefined;
