import type { Urteil } from '../abgleich';
import { hatAudio, istHoerTyp, istImplementiert, type MitHoeren } from '../aufgaben/hilfen';
import type { Aufgabe, AufgabenTyp, Lektion } from '../aufgaben/schema';
import type { EreignisEntwurf } from '../ereignisse/typen';
import { SPRACH_STUFEN, type Stufe } from '../kurse';
import { mische } from './zufall';

/**
 * Einstufungstest (ADR 0043 Nr. 6, PLAN §3.1: 20 Aufgaben, adaptiv, lokal) als reiner Zustandsautomat. Die Aufgaben kommen
 * aus den Einheitenpaketen des Kurses (keine eigene Bank nötig; später ergänzt die Einstufungsbank aus L3-07 dieselbe Form).
 *
 * Verfahren (Treppe über die Stufen des Kurses, Beginn bei der ersten Stufe – ohne Druck):
 * - Zwei Antworten in Folge richtig → eine Stufe höher (sofern es sie gibt und sie nicht schon als „nicht gekonnt“ gilt).
 * - Eine Stufe ist **gekonnt** mit mindestens zwei Aufgaben und ≥ 2/3 richtig, **nicht gekonnt** mit zwei falschen.
 * - Nicht gekonnt: auf der ersten Stufe oder über einer gekonnten Stufe ist der Einstieg gefunden (Ende), sonst eine
 *   Stufe tiefer.
 * - Ende spätestens nach `EINSTUFUNG_ANZAHL` Aufgaben, wenn die oberste Stufe mit drei Aufgaben gekonnt ist oder wenn es
 *   auf der aktuellen Stufe keine Aufgabe mehr gibt.
 * - Ergebnis: die erste Stufe (aufsteigend), die nicht gekonnt ist – dort beginnt man mit ihrer ersten Einheit; sind alle
 *   gekonnt, die oberste. „Tippfehler“ zählt wie richtig. Es entsteht ein Ereignis `einstufung` (ADR 0038), keine
 *   Bewertung von Karten und keine XP (der Test ist keine Lektion).
 */

export const EINSTUFUNG_ANZAHL = 20;
/** Aufgaben einer Stufe, bevor über sie geurteilt wird */
export const EINSTUFUNG_MINDESTENS = 2;
/** Anteil richtiger Antworten, ab dem eine Stufe als gekonnt gilt (als Bruch, ganzzahlig gerechnet) */
export const EINSTUFUNG_GEKONNT = { zaehler: 2, nenner: 3 } as const;

/** Typen für den Test: schnell und eindeutig zu bewerten (keine Wissens- oder Koran-Typen, keine Lehrteile). */
export const EINSTUFUNG_TYPEN: readonly AufgabenTyp[] = [
  'auswahl',
  'bild_wort',
  'wortbank',
  'luecke',
  'satzbau',
  'frei',
  'formen',
  'harakat',
  'hoeren_waehlen',
  'hoeren_schreiben',
  'minimalpaare',
];

export type Kandidat = { aufgabe: Aufgabe; stufe: Stufe; einheit: string };

export type EinstufungsStand = {
  kurs: string;
  /** Stufen des Kurses aufsteigend (aus dem Kursverzeichnis) */
  stufen: readonly Stufe[];
  /** Index der aktuellen Stufe */
  ebene: number;
  anzahl: number;
  verlauf: { schluessel: string; stufe: Stufe; einheit: string; richtig: boolean }[];
  /** richtige Antworten in Folge auf der aktuellen Stufe */
  inFolge: number;
  fertig: boolean;
};

export type EinstufungsErgebnis = { stufe: Stufe; einheit?: string; richtig: number; gesamt: number };

/** Neuer Test (ohne Stufen sofort fertig). */
export function starteEinstufung(kurs: string, stufen: readonly Stufe[], { anzahl = EINSTUFUNG_ANZAHL } = {}): EinstufungsStand {
  return { kurs, stufen, ebene: 0, anzahl, verlauf: [], inFolge: 0, fertig: stufen.length === 0 };
}

/** Stufe, für die die nächste Aufgabe gebraucht wird (`null`, wenn der Test fertig ist). */
export const bedarf = (st: EinstufungsStand): Stufe | null => (st.fertig ? null : (st.stufen[st.ebene] ?? null));

function zaehle(st: Pick<EinstufungsStand, 'verlauf'>, stufe: Stufe) {
  const v = st.verlauf.filter((x) => x.stufe === stufe);
  const richtig = v.filter((x) => x.richtig).length;
  return { gesamt: v.length, richtig, falsch: v.length - richtig };
}

/** Stufe gekonnt: mindestens zwei Aufgaben, ≥ 2/3 richtig. */
export function gekonnt(st: Pick<EinstufungsStand, 'verlauf'>, stufe: Stufe): boolean {
  const z = zaehle(st, stufe);
  return z.gesamt >= EINSTUFUNG_MINDESTENS && z.richtig * EINSTUFUNG_GEKONNT.nenner >= z.gesamt * EINSTUFUNG_GEKONNT.zaehler;
}

/** Stufe nicht gekonnt: zwei falsche Antworten. */
export const nichtGekonnt = (st: Pick<EinstufungsStand, 'verlauf'>, stufe: Stufe): boolean =>
  zaehle(st, stufe).falsch >= EINSTUFUNG_MINDESTENS;

/** Nächste noch nicht gestellte Aufgabe der aktuellen Stufe aus der Bank (Reihenfolge der Bank). */
export function waehle(st: EinstufungsStand, bank: readonly Kandidat[]): Kandidat | null {
  const stufe = bedarf(st);
  if (!stufe) return null;
  const gestellt = new Set(st.verlauf.map((v) => v.schluessel));
  return bank.find((k) => k.stufe === stufe && !gestellt.has(k.aufgabe.schluessel)) ?? null;
}

/** Ende ohne weitere Aufgabe (keine Aufgabe auf der aktuellen Stufe). */
export const beende = (st: EinstufungsStand): EinstufungsStand => ({ ...st, fertig: true });

/** Antwort auf eine Aufgabe einrechnen und die nächste Stufe bestimmen. */
export function beantworte(st: EinstufungsStand, k: Kandidat, urteil: Urteil): EinstufungsStand {
  if (st.fertig) return st;
  const richtig = urteil !== 'falsch';
  const verlauf = [...st.verlauf, { schluessel: k.aufgabe.schluessel, stufe: k.stufe, einheit: k.einheit, richtig }];
  let { ebene } = st;
  let inFolge = richtig ? st.inFolge + 1 : 0;
  let fertig = verlauf.length >= st.anzahl;
  const neu = { ...st, verlauf };
  const stufe = st.stufen[ebene] as Stufe;
  const oben = st.stufen.length - 1;
  if (richtig) {
    const hoeher = st.stufen[ebene + 1];
    if (hoeher && nichtGekonnt(neu, hoeher)) {
      // von oben zurückgekommen: ist diese Stufe nun gekonnt, liegt der Einstieg darüber
      if (gekonnt(neu, stufe)) fertig = true;
    } else if (hoeher && inFolge >= EINSTUFUNG_MINDESTENS) {
      ebene += 1;
      inFolge = 0;
    } else if (ebene === oben && gekonnt(neu, stufe) && zaehle(neu, stufe).gesamt > EINSTUFUNG_MINDESTENS) fertig = true;
  } else if (nichtGekonnt(neu, stufe)) {
    const tiefer = st.stufen[ebene - 1];
    if (!tiefer || gekonnt(neu, tiefer)) fertig = true;
    else {
      ebene -= 1;
      inFolge = 0;
    }
  }
  return { ...neu, ebene, inFolge, fertig };
}

/** Ergebnis: erste nicht gekonnte Stufe (sonst die oberste) und ihre erste Einheit aus dem Kursverzeichnis. */
export function ergebnis(st: EinstufungsStand, einheiten: readonly { schluessel: string; stufe: Stufe }[]): EinstufungsErgebnis | null {
  if (!st.verlauf.length || !st.stufen.length) return null;
  const stufe = st.stufen.find((s) => !gekonnt(st, s)) ?? (st.stufen.at(-1) as Stufe);
  const einheit = einheiten.find((e) => e.stufe === stufe)?.schluessel;
  const richtig = st.verlauf.filter((v) => v.richtig).length;
  return { stufe, ...(einheit ? { einheit } : {}), richtig, gesamt: st.verlauf.length };
}

type SprachStufe = (typeof SPRACH_STUFEN)[number];
const istSprachStufe = (s: Stufe): s is SprachStufe => (SPRACH_STUFEN as readonly Stufe[]).includes(s);

/**
 * Ereignis `einstufung` (ADR 0038) zum Ergebnis; Gerät, Nummer, Zeit und Lerntag ergänzt der Ausgang. Nur für die Stufen der
 * Sprachkurse (A1–C1, wie das Ereignis-Schema) – sonst `null`.
 */
export function einstufungsEreignis(kurs: string, e: EinstufungsErgebnis): EreignisEntwurf | null {
  if (!istSprachStufe(e.stufe)) return null;
  return {
    art: 'einstufung',
    daten: { kurs, stufe: e.stufe, ...(e.einheit ? { einheit: e.einheit } : {}), richtig: e.richtig, gesamt: e.gesamt },
  };
}

/**
 * Kandidaten aus den Lektionen einer Einheit: nur Typen aus `EINSTUFUNG_TYPEN`, Hörübungen nur mit Clip und wenn Hören an
 * ist; gemischt mit festem Startwert (gleiche Bank auf jedem Gerät).
 */
export function kandidatenAus(
  einheit: { schluessel: string; stufe: Stufe },
  lektionen: readonly Pick<Lektion, 'aufgaben'>[],
  { hoeren = true }: { hoeren?: boolean } = {},
): Kandidat[] {
  const passend = lektionen
    .flatMap((l) => l.aufgaben)
    .filter((a) => istImplementiert(a.typ) && EINSTUFUNG_TYPEN.includes(a.typ))
    .filter((a) => !istHoerTyp(a.typ) || (hoeren && hatAudio(a as MitHoeren)));
  return mische(passend, `einstufung:${einheit.schluessel}`).map((aufgabe) => ({
    aufgabe,
    stufe: einheit.stufe,
    einheit: einheit.schluessel,
  }));
}

/** Einheiten, deren Pakete für eine Stufe geladen werden: die erste und die letzte der Stufe (sie umspannen die Stufe). */
export function einheitenFuer<E extends { schluessel: string; stufe: Stufe }>(einheiten: readonly E[], stufe: Stufe): E[] {
  const der = einheiten.filter((e) => e.stufe === stufe);
  const erste = der[0];
  const letzte = der.at(-1);
  return !erste ? [] : letzte && letzte !== erste ? [erste, letzte] : [erste];
}

/** Stufen des Kurses aufsteigend, wie sie im Kursverzeichnis vorkommen. */
export const stufenAus = (einheiten: readonly { stufe: Stufe }[]): Stufe[] => [...new Set(einheiten.map((e) => e.stufe))];
