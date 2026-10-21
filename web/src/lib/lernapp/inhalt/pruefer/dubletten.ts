import type { Sprache } from '../../kurse';
import type { Inhalte } from './dateien';
import { vergleichsform, woerterVon } from './sprache';
import { Befunde } from './typen';

/**
 * Prüfer „Dubletten exakt und nahe“ (PLAN §6.4): je Kurs
 * - **exakt** (blockierend): gleiche Vergleichsform bei Sätzen; bei Lemmata gleiche Form und Wortart (Homographen mit
 *   verschiedener Wortart sind erlaubt);
 * - **nahe** (Jaccard der Wortmengen ≥ 0,9, z. B. dieselben Wörter umgestellt): Warnung je Paar; blockierend, sobald mehr als
 *   1 % der Sätze eines Kurses betroffen sind.
 * Kandidaten über Präfix-Filter (seltenste Wörter zuerst), damit auch 26.000 Sätze je Kurs schnell gehen.
 */

export const NAHE_SCHWELLE = 0.9;
export const NAHE_HOECHSTENS = 0.01;

type Satz = { datei: string; schluessel: string; menge: string[] };

/** Paare mit Jaccard ≥ Schwelle (ohne exakt gleiche Mengen). */
export function nahePaare(saetze: readonly Satz[], schwelle = NAHE_SCHWELLE): [number, number, number][] {
  const haeufigkeit = new Map<string, number>();
  for (const s of saetze) for (const w of s.menge) haeufigkeit.set(w, (haeufigkeit.get(w) ?? 0) + 1);
  const sortiert = saetze.map((s) =>
    [...s.menge].sort((a, b) => haeufigkeit.get(a)! - haeufigkeit.get(b)! || (a < b ? -1 : a > b ? 1 : 0)),
  );
  const index = new Map<string, number[]>();
  const paare: [number, number, number][] = [];
  sortiert.forEach((a, i) => {
    if (a.length < 2) return;
    const praefix = a.length - Math.ceil(schwelle * a.length) + 1;
    const gesehen = new Set<number>();
    const menge = new Set(a);
    for (const w of a.slice(0, praefix))
      for (const j of index.get(w) ?? []) {
        if (gesehen.has(j)) continue;
        gesehen.add(j);
        const bm = sortiert[j]!;
        if (bm.length < schwelle * a.length || a.length < schwelle * bm.length) continue;
        let schnitt = 0;
        for (const x of bm) if (menge.has(x)) schnitt++;
        const jaccard = schnitt / (a.length + bm.length - schnitt);
        // auch Jaccard 1: dieselben Wörter in anderer Reihenfolge (exakt gleiche Sätze meldet schon die exakte Prüfung)
        if (jaccard >= schwelle) paare.push([j, i, jaccard]);
      }
    for (const w of a.slice(0, praefix)) index.set(w, [...(index.get(w) ?? []), i]);
  });
  return paare;
}

export function pruefeDubletten(inhalte: Inhalte): Befunde {
  const b = new Befunde('dubletten');
  const jeKurs = new Map<Sprache, Satz[]>();
  const exakt = new Map<string, string>();
  for (const { pfad, daten: d } of inhalte.sprache) {
    for (const l of d.lemmata) {
      const k = `${d.kurs}|lemma|${vergleichsform(l.lemma, d.kurs)}|${l.wortart ?? ''}`;
      const vorher = exakt.get(k);
      if (vorher) b.blockierend(pfad, `Lemma doppelt (gleiche Form und Wortart wie ${vorher})`, l.schluessel);
      else exakt.set(k, l.schluessel);
    }
    for (const s of d.saetze) {
      const woerter = woerterVon(s.text).map((w) => vergleichsform(w, d.kurs));
      const k = `${d.kurs}|satz|${woerter.join(' ')}`;
      const vorher = exakt.get(k);
      if (vorher) {
        b.blockierend(pfad, `Satz doppelt (gleich ${vorher})`, s.schluessel);
        continue;
      }
      exakt.set(k, s.schluessel);
      jeKurs.set(d.kurs, [...(jeKurs.get(d.kurs) ?? []), { datei: pfad, schluessel: s.schluessel, menge: [...new Set(woerter)] }]);
    }
  }
  for (const [kurs, saetze] of jeKurs) {
    const paare = nahePaare(saetze);
    const betroffen = new Set<number>();
    for (const [i, j, jaccard] of paare) {
      betroffen.add(i);
      betroffen.add(j);
      b.warnung(saetze[j]!.datei, `fast gleich wie ${saetze[i]!.schluessel} (Jaccard ${jaccard.toFixed(2)})`, saetze[j]!.schluessel);
    }
    if (saetze.length && betroffen.size / saetze.length > NAHE_HOECHSTENS)
      b.blockierend(
        `sprache/${kurs}`,
        `${betroffen.size} von ${saetze.length} Sätzen fast gleich (${((100 * betroffen.size) / saetze.length).toFixed(1)} %, erlaubt ≤ 1 %)`,
      );
  }
  return b;
}
