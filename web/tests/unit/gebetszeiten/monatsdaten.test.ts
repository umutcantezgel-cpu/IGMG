import { describe, expect, it } from 'vitest';
import { berechneMonat } from '@/lib/gebetszeiten/berechnung';
import { GEBETE, ZEIT_MUSTER } from '@/lib/gebetszeiten/typen';

/**
 * Akzeptanzkriterium K-08 (3) Monatsdaten: jeder Tag des Monats genau einmal, lückenlos und aufsteigend, Februar im
 * Schaltjahr mit 29 Tagen. Die Monatslängen stehen hier als Tabelle und nicht aus der Implementierung; die Schaltjahrregel
 * ist die gregorianische (durch 4 teilbar, außer durch 100, außer durch 400).
 */

const LAENGEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const istSchaltjahr = (j: number) => (j % 4 === 0 && j % 100 !== 0) || j % 400 === 0;
const tageImMonat = (j: number, m: number) => (m === 2 && istSchaltjahr(j) ? 29 : LAENGEN[m - 1]);
const minutenVon = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

/** Prüft einen Kalendermonat: die Kalendertage in genau dieser Folge, Zeiten im Format HH:MM und aufsteigend je Tag. */
function pruefeMonat(j: number, m: number) {
  const monat = `${j}-${String(m).padStart(2, '0')}`;
  const tage = berechneMonat(monat);
  const soll = Array.from({ length: tageImMonat(j, m) }, (_, i) => `${monat}-${String(i + 1).padStart(2, '0')}`);
  expect(
    tage.map((t) => t.datum),
    `${monat}: Tage`,
  ).toEqual(soll);
  for (const t of tage) {
    for (const g of GEBETE) expect(t[g], `${t.datum} ${g}`).toMatch(ZEIT_MUSTER);
    const folge = GEBETE.map((g) => minutenVon(t[g]));
    folge.slice(1).forEach((v, i) => expect(v, `${t.datum}: aufsteigend`).toBeGreaterThan(folge[i]));
  }
}

describe('Monatsdaten im Jahr 2026 (K-08 3)', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])('Monat %i: jeder Kalendertag genau einmal, lückenlos, in Reihenfolge', (m) => {
    pruefeMonat(2026, m);
  });

  it('die Umstellungstage 29.03. und 25.10.2026 stehen je genau einmal im Monat', () => {
    const maerz = berechneMonat('2026-03').map((t) => t.datum);
    const oktober = berechneMonat('2026-10').map((t) => t.datum);
    expect(maerz.filter((d) => d === '2026-03-29')).toHaveLength(1);
    expect(oktober.filter((d) => d === '2026-10-25')).toHaveLength(1);
  });
});

describe('Februar und Schaltjahr (K-08 3)', () => {
  it.each([2000, 2024, 2027, 2028, 2100])('Februar %i folgt der Schaltjahrregel', (j) => {
    pruefeMonat(j, 2);
  });

  it('29. Februar 2028 ist ein Tag der Liste, 29. Februar 2026 kommt nicht vor', () => {
    expect(berechneMonat('2028-02').map((t) => t.datum)).toContain('2028-02-29');
    expect(berechneMonat('2026-02').map((t) => t.datum)).not.toContain('2026-02-29');
  });

  it('2100 ist kein Schaltjahr: der Februar hat 28 Tage', () => {
    expect(berechneMonat('2100-02')).toHaveLength(28);
  });
});
