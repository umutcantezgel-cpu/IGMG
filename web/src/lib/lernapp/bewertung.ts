import type { Urteil } from './abgleich';

/**
 * Bewertungen und Karten ohne FSRS (ADR 0038 Nr. 3): Noten, Reihenfolge der Bewertungen, Kartenstand als Datenform,
 * Fälligkeit. Eigenes Modul, damit Ereignisse, Spieler, Kartenwahl und Inseln `ts-fsrs` nicht laden (KERN 4.0 §9); das
 * Nachspielen selbst steht in `srs.ts` und kommt erst mit der Ableitung.
 */

export type Note = 'nochmal' | 'schwer' | 'gut';
export const NOTEN: readonly Note[] = ['nochmal', 'schwer', 'gut'];

/** Note aus dem Urteil des Abgleichs (bzw. einer Übung): erster Versuch, ggf. mit genutzter Hilfe. */
export function noteAus(urteil: Urteil, { hilfe = false }: { hilfe?: boolean } = {}): Note {
  if (urteil === 'falsch') return 'nochmal';
  return urteil === 'tippfehler' || hilfe ? 'schwer' : 'gut';
}

/** Übungstypen mit Selbstbewertung (ADR 0042: Sprechen und Schreiben). */
export const SELBSTBEWERTUNG: ReadonlySet<string> = new Set(['sprechen', 'schreiben']);

/** Selbstbewertung gilt nur für Sprechen und Schreiben; sonst `null` (die Note kommt aus der Bewertung der Übung). */
export function noteAusSelbstbewertung(typ: string, note: Note): Note | null {
  return SELBSTBEWERTUNG.has(typ) ? note : null;
}

/** Eine Bewertung einer Karte (Lemma oder Satz), wie sie aus den Ereignissen kommt. */
export type KartenBewertung = { karte: string; note: Note; am: string; geraet: string; seq: number };

export type KartenZustand = 'neu' | 'lernen' | 'wiederholen' | 'neu_lernen';

/** Kartenstand, als JSON speicherbar (IndexedDB `karten`, Server `lernapp_karte`). */
export type Kartenstand = {
  karte: string;
  /** ISO-Zeitpunkt der nächsten Fälligkeit. */
  faellig: string;
  stabilitaet: number;
  schwierigkeit: number;
  tageVergangen: number;
  tageGeplant: number;
  lernschritt: number;
  wiederholungen: number;
  fehler: number;
  zustand: KartenZustand;
  zuletzt: string | null;
  letzteNote: Note | null;
  parameterversion: string;
};

const ms = (iso: string) => Date.parse(iso);

/** Reihenfolge der Bewertungen: Zeit, dann Gerät, dann laufende Nummer (ADR 0038 Nr. 3). */
export function vergleicheBewertungen(
  a: Pick<KartenBewertung, 'am' | 'geraet' | 'seq'>,
  b: Pick<KartenBewertung, 'am' | 'geraet' | 'seq'>,
): number {
  return ms(a.am) - ms(b.am) || (a.geraet < b.geraet ? -1 : a.geraet > b.geraet ? 1 : 0) || a.seq - b.seq;
}

/** Fällig, wenn der Fälligkeitszeitpunkt erreicht ist. */
export function istFaellig(stand: Pick<Kartenstand, 'faellig'>, jetzt: Date): boolean {
  return ms(stand.faellig) <= jetzt.getTime();
}
