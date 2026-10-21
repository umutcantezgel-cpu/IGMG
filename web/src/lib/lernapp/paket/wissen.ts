import type { Aufgabe, AufgabeVon, Lektion } from '../aufgaben/schema';
import {
  type FreigabeBaustein,
  koranWortSichtbar,
  type KoranWortFreigabe,
  lektionSichtbar,
  wissenSichtbar,
  wissensAufgabeSichtbar,
} from '../freigabe';

/**
 * Lektionen des Wissenskurses und des Koran-Arabisch-Pfads für den Paketbau (ADR 0039 Nr. 1, ADR 0040 Nr. 5, KERN 4.0
 * §2.3) – rein. Was ausgeliefert wird, entscheidet nur `freigabe.ts`; hier wird es zusammengesetzt:
 *
 * - Jede Aufgabe ist sichtbar nur mit zwei Freigaben für sich und für jede Aussage, aus der sie entsteht
 *   (`wissensAufgabeSichtbar`); `koran_wort` nur, wenn alle gezeigten Bedeutungen bzw. die Wurzeltabelle geprüft sind
 *   (`koranWortSichtbar`).
 * - Eine Lektion gibt es nur ganz: Ist ein einziger Baustein nicht geprüft (auch die Lektion selbst), fällt die ganze
 *   Lektion weg (`lektionSichtbar`) – es gibt keine Teilauslieferung religiöser Inhalte.
 * - Nur die Typen des jeweiligen Kurses: im Wissenskurs `auswahl`, `wahr_falsch`, `zuordnen`, `reihenfolge`, `luecke`,
 *   `fallfrage` (PLAN §4); im Koran-Pfad `koran_wort`. Andere Typen machen die Lektion ungültig (`null`).
 * - Keine Audio-Verweise: Wissenskurs und Koran-Pfad haben keine Sprachausgabe (KERN 4.0 §4).
 *
 * Den Paketbau des Wissenskurses (Tabellen `lernapp_aussage`, `lernapp_beleg`, `quran_wortbedeutung`) baut L6; diese
 * Funktionen sind seine Schnittstelle und sind schon jetzt getestet.
 */

export const WISSENSKURS_TYPEN = ['auswahl', 'wahr_falsch', 'zuordnen', 'reihenfolge', 'luecke', 'fallfrage'] as const;
export const KORAN_TYPEN = ['koran_wort'] as const;

export type WissensAufgabeEingabe = { aufgabe: Aufgabe; freigabe: FreigabeBaustein; aussagen: readonly FreigabeBaustein[] };
export type KoranAufgabeEingabe = { aufgabe: AufgabeVon<'koran_wort'>; freigabe: KoranWortFreigabe };

export type WissensLektionEingabe = {
  /** Kopf der Lektion (ohne Aufgaben) */
  lektion: Omit<Lektion, 'aufgaben'>;
  /** Freigabe der Lektion selbst (Titel, Ziel, Kennzeichnung „für Kinder geeignet“) */
  freigabe: FreigabeBaustein;
} & ({ kurs: 'islam'; aufgaben: readonly WissensAufgabeEingabe[] } | { kurs: 'koran'; aufgaben: readonly KoranAufgabeEingabe[] });

/** Steht irgendwo in der Aufgabe ein Audio-Verweis? */
function hatAudio(x: unknown): boolean {
  if (Array.isArray(x)) return x.some(hatAudio);
  if (x === null || typeof x !== 'object') return false;
  return Object.entries(x).some(([k, v]) => (k === 'audio' && v !== undefined) || hatAudio(v));
}

/** Lektion mit allen Aufgaben, wenn jeder Baustein geprüft ist; sonst `null`. */
export function sichtbareWissensLektion(e: WissensLektionEingabe): Lektion | null {
  if (!e.aufgaben.length || e.aufgaben.some((x) => hatAudio(x.aufgabe))) return null;
  const typen: readonly string[] = e.kurs === 'islam' ? WISSENSKURS_TYPEN : KORAN_TYPEN;
  if (e.aufgaben.some((x) => !typen.includes(x.aufgabe.typ))) return null;
  const geprueft = [
    wissenSichtbar(e.freigabe.status, e.freigabe.baustein, e.freigabe.pruefungen),
    ...(e.kurs === 'islam'
      ? e.aufgaben.map((x) => wissensAufgabeSichtbar(x.freigabe, x.aussagen))
      : e.aufgaben.map((x) => koranWortSichtbar(x.freigabe))),
  ];
  if (!lektionSichtbar(geprueft)) return null;
  return { ...e.lektion, aufgaben: e.aufgaben.map((x) => x.aufgabe) };
}
