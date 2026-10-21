import { mische } from './engine/zufall';
import { type Fehler, istKritisch, stichprobeBestanden } from './freigabe';
import type { Sprache } from './kurse';

/**
 * Muttersprachliche Stichprobe (ADR 0041 Nr. 3–5, PLAN §6.5). Rein und ohne Datenbank: Die Verwaltung (L3-06) lädt die
 * Kandidaten einer Einheit und die bisherigen Entscheidungen und fragt hier nach Größe, Auswahl und Ergebnis.
 *
 * - **Größe:** Text n = max(20, 10 %), Audio 10 % (Arabisch 20 %), höchstens alle Einträge. Im **Einlauf** 30 % (bei Text
 *   mindestens 20): bis die letzten drei entschiedenen Stichproben derselben Sprache und Art in Folge bestanden sind.
 * - **Auswahl:** reproduzierbar aus dem Startwert (`saat`), unabhängig von der Reihenfolge der Kandidaten. Gemeldete
 *   Einträge (ADR 0041 Nr. 9) kommen immer dazu, auch über n hinaus.
 * - **Ergebnis:** Annahmeregel aus `freigabe.ts` (0 kritische und höchstens 2 leichte je 20, anteilig). Ein Urteil
 *   „Korrektur“ oder „abgelehnt“ ohne Kategorie zählt als kritisch (die strengere Lesart).
 */

export const STICHPROBE_ARTEN = ['zieltext', 'uebersetzung', 'audio'] as const;
export type StichprobeArt = (typeof STICHPROBE_ARTEN)[number];

/** Mindestmenge bei Text (ADR 0041 Nr. 3: bei kleinen Einheiten sonst zu wenige Einträge für ein Urteil). */
export const MINDESTMENGE_TEXT = 20;
/** Bestandene Stichproben in Folge, nach denen der Einlauf endet. */
export const EINLAUF_EINHEITEN = 3;
export const QUOTEN = { text: 0.1, audio: 0.1, audioArabisch: 0.2, einlauf: 0.3 } as const;

export type Entscheidung = 'offen' | 'bestanden' | 'nachbessern';

/** Quote je Art und Sprache; im Einlauf mindestens 30 %. */
export function quote(o: { art: StichprobeArt; sprache: Sprache; einlauf: boolean }): number {
  const basis = o.art === 'audio' ? (o.sprache === 'ar' ? QUOTEN.audioArabisch : QUOTEN.audio) : QUOTEN.text;
  return o.einlauf ? Math.max(basis, QUOTEN.einlauf) : basis;
}

/** Stichprobengröße n für `gesamt` Kandidaten (0 ohne Kandidaten). */
export function stichprobenGroesse(o: { art: StichprobeArt; sprache: Sprache; einlauf: boolean; gesamt: number }): number {
  const gesamt = Math.max(0, Math.floor(o.gesamt));
  if (gesamt === 0) return 0;
  // Rundung ohne Gleitkomma-Rest (0,1 · 30 ergibt 3,0000000000000004)
  const anteil = Math.ceil(Math.round(quote(o) * gesamt * 1e6) / 1e6);
  const n = o.art === 'audio' ? Math.max(1, anteil) : Math.max(MINDESTMENGE_TEXT, anteil);
  return Math.min(gesamt, n);
}

/**
 * Einlauf (ADR 0041 Nr. 3): aktiv, solange die letzten drei entschiedenen Stichproben (chronologisch, gleiche Sprache und
 * Art) nicht alle bestanden sind – also für die ersten drei Einheiten und wieder nach einem „nachbessern“.
 */
export function einlaufAktiv(entscheidungen: readonly Entscheidung[]): boolean {
  const entschieden = entscheidungen.filter((e) => e !== 'offen');
  const letzte = entschieden.slice(-EINLAUF_EINHEITEN);
  return !(letzte.length === EINLAUF_EINHEITEN && letzte.every((e) => e === 'bestanden'));
}

/**
 * Startwert einer Stichprobe: Einheit, Art, Richtung (nur Übersetzungen), Stand der Einheit und Runde. Nach „nachbessern“
 * zieht die nächste Runde mit neuem Startwert (ADR 0041 Nr. 5).
 */
export function stichprobenSaat(o: { einheit: string; art: StichprobeArt; richtung?: string | null; einheitHash: string; runde: number }): string {
  return [o.einheit, o.art, o.richtung ?? '-', o.einheitHash, String(o.runde)].join('|');
}

/** Reproduzierbare Auswahl: gemeldete Einträge zuerst (immer), dann die gemischten übrigen bis zur Größe. */
export function ziehe(kandidaten: readonly string[], o: { saat: string; groesse: number; gemeldet?: readonly string[] }): string[] {
  const sortiert = [...new Set(kandidaten)].sort();
  const gemeldet = new Set(o.gemeldet ?? []);
  const pflicht = sortiert.filter((k) => gemeldet.has(k));
  const rest = mische(
    sortiert.filter((k) => !gemeldet.has(k)),
    o.saat,
  );
  return [...pflicht, ...rest].slice(0, Math.max(o.groesse, pflicht.length));
}

export type StichprobenUrteil = { urteil: 'ok' | 'korrektur' | 'abgelehnt'; kategorie: Fehler | null };
export type StichprobenErgebnis = { geprueft: number; kritisch: number; leicht: number };

/** Zählt die Urteile einer Stichprobe (je Eintrag das maßgebliche, d. h. jüngste Urteil). */
export function werteAus(urteile: readonly StichprobenUrteil[]): StichprobenErgebnis {
  let kritisch = 0;
  let leicht = 0;
  for (const u of urteile) {
    if (u.urteil === 'ok') continue;
    if (u.kategorie === null || istKritisch(u.kategorie)) kritisch++;
    else leicht++;
  }
  return { geprueft: urteile.length, kritisch, leicht };
}

/** Entscheidung nach der Annahmeregel; offen, solange nicht alle gezogenen Einträge geprüft sind. */
export function entscheide(ergebnis: StichprobenErgebnis, gezogen: number): Entscheidung {
  if (gezogen <= 0 || ergebnis.geprueft < gezogen) return 'offen';
  return stichprobeBestanden(ergebnis) ? 'bestanden' : 'nachbessern';
}

/** Sprache, die eine Stichprobe beurteilt: Zieltext und Audio die Zielsprache, Übersetzungen die Ausgangssprache. */
export function pruefSprache(art: StichprobeArt, ziel: Sprache, ausgang?: Sprache | null): Sprache {
  return art === 'uebersetzung' && ausgang ? ausgang : ziel;
}
