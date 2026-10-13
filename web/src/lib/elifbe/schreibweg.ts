/**
 * Schreibweg (B-17): Bildausschnitt und Zeitplan. Reine Funktionen, damit Seite, Übung und Tests dieselben Werte nutzen.
 */
import type { Schreibweg, Zug } from './zuege';

/**
 * Gemeinsamer quadratischer Rahmen aller Buchstaben (Schrifteinheiten): gleiche Größe und gleiche Grundlinie, damit die
 * Verhältnisse stimmen (Elif hoch, Hamza klein auf halber Höhe). Waagerecht mittig auf der Glyphe.
 */
export const RAHMEN = { groesse: 1400, oben: -820 } as const;

export function ausschnitt(box: readonly [number, number, number, number] | readonly number[]): [number, number, number, number] {
  const [x1 = 0, , x2 = 0] = box;
  const mitte = Math.round((x1 + x2) / 2);
  return [mitte - RAHMEN.groesse / 2, RAHMEN.oben, RAHMEN.groesse, RAHMEN.groesse];
}

export type Takt = { dauer: number; verzoegerung: number };

/**
 * Zeitplan: alle Züge nacheinander, danach die Punkte; gesamt höchstens `gesamt` ms ab `start` (Register: ≤ 1,6 s).
 * Hauptzüge teilen sich die Zeit nach ihrer Länge, zwischen zwei Zügen eine kurze Pause; Punkte haben eine feste,
 * kurze Dauer.
 */
export function zeitplan(weg: Schreibweg, gesamt = 1600, start = 0): { zuege: Takt[]; punkte: Takt[] } {
  const PAUSE = 100;
  const PUNKT = 140;
  const PUNKT_PAUSE = 50;
  const punktZeit = weg.punkte.length ? PAUSE + weg.punkte.length * PUNKT + (weg.punkte.length - 1) * PUNKT_PAUSE : 0;
  const pausen = Math.max(0, weg.zuege.length - 1) * PAUSE;
  const verfuegbar = Math.max(400, gesamt - punktZeit - pausen);
  const summe = weg.zuege.reduce((s, z: Zug) => s + z.laenge, 0) || 1;
  let t = start;
  const zuege = weg.zuege.map((z) => {
    const dauer = Math.round((verfuegbar * z.laenge) / summe);
    const takt = { dauer, verzoegerung: t };
    t += dauer + PAUSE;
    return takt;
  });
  t = t - PAUSE + (weg.punkte.length ? PAUSE : 0);
  const punkte = weg.punkte.map(() => {
    const takt = { dauer: PUNKT, verzoegerung: t };
    t += PUNKT + PUNKT_PAUSE;
    return takt;
  });
  return { zuege, punkte };
}

/** Ende des letzten Zuges oder Punktes (ms) – für Tests und das Ende der Animation. */
export function ende(plan: { zuege: Takt[]; punkte: Takt[] }): number {
  return Math.max(0, ...[...plan.zuege, ...plan.punkte].map((t) => t.verzoegerung + t.dauer));
}
