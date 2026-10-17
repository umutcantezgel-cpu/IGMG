import { type Card, createEmptyCard, fsrs, type FSRSParameters, generatorParameters, type Grade, Rating, State } from 'ts-fsrs';
import type { Urteil } from './abgleich';

/**
 * Wiederholung nach Vergessenskurve (ADR 0038 Nr. 3, PLAN §3.8): `ts-fsrs` 5.4.2, deterministisch.
 *
 * - Die Parameter sind hier festgeschrieben (FSRS-6-Standardgewichte von ts-fsrs 5.4.2) und tragen eine Version. Ein
 *   Bibliothekswechsel ändert sie nicht still; neue Parameter heißen neue Version mit Neuberechnung aus den Ereignissen.
 * - Kein Zufallsanteil („Fuzz“ aus): Jedes Gerät berechnet aus denselben Bewertungen denselben Kartenstand.
 * - Bewertungen werden nach (am, geraet, seq) sortiert nachgespielt; die Reihenfolge des Abgleichs spielt keine Rolle.
 * - Abbildung: richtig im ersten Versuch → „gut“ (Good), mit Tippfehler oder genutzter Hilfe → „schwer“ (Hard), falsch →
 *   „nochmal“ (Again). Kein „Easy“. Selbstbewertung nur bei Sprechen und Schreiben (ADR 0042).
 */

export const FSRS_PARAMETERVERSION = 'fsrs6/ts-fsrs-5.4.2/1';

/** FSRS-6-Gewichte (21 Werte), Stand ts-fsrs 5.4.2 `default_w`. */
const GEWICHTE = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729,
  0.5425, 0.0912, 0.0658, 0.1542,
] as const;

export const FSRS_PARAMETER: Readonly<FSRSParameters> = Object.freeze(
  generatorParameters({
    w: [...GEWICHTE],
    request_retention: 0.9,
    maximum_interval: 36500,
    enable_fuzz: false,
    enable_short_term: true,
    learning_steps: ['1m', '10m'],
    relearning_steps: ['10m'],
  }),
);

const planer = fsrs(FSRS_PARAMETER);

export type Note = 'nochmal' | 'schwer' | 'gut';
export const NOTEN: readonly Note[] = ['nochmal', 'schwer', 'gut'];
const RATING: Record<Note, Grade> = { nochmal: Rating.Again, schwer: Rating.Hard, gut: Rating.Good };

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
const ZUSTAND: Record<State, KartenZustand> = {
  [State.New]: 'neu',
  [State.Learning]: 'lernen',
  [State.Review]: 'wiederholen',
  [State.Relearning]: 'neu_lernen',
};
const STATE: Record<KartenZustand, State> = {
  neu: State.New,
  lernen: State.Learning,
  wiederholen: State.Review,
  neu_lernen: State.Relearning,
};

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

function ausKarte(karte: string, c: Card, letzteNote: Note | null): Kartenstand {
  return {
    karte,
    faellig: c.due.toISOString(),
    stabilitaet: c.stability,
    schwierigkeit: c.difficulty,
    tageVergangen: c.elapsed_days,
    tageGeplant: c.scheduled_days,
    lernschritt: c.learning_steps,
    wiederholungen: c.reps,
    fehler: c.lapses,
    zustand: ZUSTAND[c.state],
    zuletzt: c.last_review ? c.last_review.toISOString() : null,
    letzteNote,
    parameterversion: FSRS_PARAMETERVERSION,
  };
}

/** Kartenstand zurück in eine ts-fsrs-Karte (für Vorschau oder Weiterrechnen). */
export function zuKarte(s: Kartenstand): Card {
  return {
    due: new Date(s.faellig),
    stability: s.stabilitaet,
    difficulty: s.schwierigkeit,
    elapsed_days: s.tageVergangen,
    scheduled_days: s.tageGeplant,
    learning_steps: s.lernschritt,
    reps: s.wiederholungen,
    lapses: s.fehler,
    state: STATE[s.zustand],
    ...(s.zuletzt ? { last_review: new Date(s.zuletzt) } : {}),
  };
}

/** Eine Karte aus ihren Bewertungen nachspielen (Reihenfolge nach `vergleicheBewertungen`). */
export function spieleKarteNach(karte: string, bewertungen: readonly KartenBewertung[]): Kartenstand | null {
  const sortiert = bewertungen.filter((b) => b.karte === karte).sort(vergleicheBewertungen);
  const erste = sortiert[0];
  if (!erste) return null;
  let c: Card = createEmptyCard(new Date(erste.am));
  for (const b of sortiert) c = planer.next(c, new Date(b.am), RATING[b.note]).card;
  return ausKarte(karte, c, sortiert.at(-1)?.note ?? null);
}

/** Alle Karten aus allen Bewertungen nachspielen. Ergebnis nach Kartenschlüssel sortiert. */
export function spieleNach(bewertungen: readonly KartenBewertung[]): Map<string, Kartenstand> {
  const jeKarte = new Map<string, KartenBewertung[]>();
  for (const b of bewertungen) {
    const liste = jeKarte.get(b.karte);
    if (liste) liste.push(b);
    else jeKarte.set(b.karte, [b]);
  }
  const ergebnis = new Map<string, Kartenstand>();
  for (const karte of [...jeKarte.keys()].sort()) {
    const stand = spieleKarteNach(karte, jeKarte.get(karte) ?? []);
    if (stand) ergebnis.set(karte, stand);
  }
  return ergebnis;
}

/** Fällig, wenn der Fälligkeitszeitpunkt erreicht ist. */
export function istFaellig(stand: Pick<Kartenstand, 'faellig'>, jetzt: Date): boolean {
  return ms(stand.faellig) <= jetzt.getTime();
}
