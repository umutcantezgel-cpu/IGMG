import { describe, expect, it } from 'vitest';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { bewerte, kalibriere } from '@/lib/gebetszeiten/kalibrierung';
import { GEBETE, STANDARD_EINSTELLUNGEN, STANDARD_NAEHERUNG, type Naeherung } from '@/lib/gebetszeiten/typen';
import { AACHEN, TAGE } from '../../hilfen/igmg-aachen-2026-10';

/**
 * Kalibrierung der Näherung (ADR 0048, `pnpm gebetszeiten:kalibrieren`): findet synthetische Parameter wieder, warnt bei
 * nur einem Monat und ohne Sommermonate, macht ab zwei Monaten eine Kreuzprobe und kommt an der IGMG-Tabelle Aachen
 * auf die Werte des Standards (Fixture mit Zustimmung der IGMG).
 */
const WETZLAR = { breite: STANDARD_EINSTELLUNGEN.breite, laenge: STANDARD_EINSTELLUNGEN.laenge };

function synthetisch(n: Naeherung, monate: string[]) {
  return monate.flatMap((monat) => {
    const [j, m] = monat.split('-').map(Number);
    const anzahl = new Date(Date.UTC(j, m, 0)).getUTCDate();
    return Array.from({ length: anzahl }, (_, i) => {
      const datum = `${monat}-${String(i + 1).padStart(2, '0')}`;
      return { datum, ...berechneTag(datum, { ...STANDARD_EINSTELLUNGEN, ...WETZLAR, rueckfall: 'naeherung', naeherung: n }) };
    });
  });
}

describe('Kalibrierung der Näherung', () => {
  it('findet synthetische Parameter wieder (alle Tage exakt, Winkel ±0,2°)', () => {
    const soll: Naeherung = {
      fajrWinkel: 17.4,
      ishaWinkel: 16.6,
      temkinSek: { imsak: -120, gunes: -420, ogle: 300, ikindi: 240, aksam: 420, yatsi: 90 },
      hoheBreite: 'twilightangle',
    };
    const k = kalibriere(synthetisch(soll, ['2026-01', '2026-03']), WETZLAR);
    for (const g of GEBETE) expect(k.guete[g].exakt, g).toBe(k.guete[g].tage);
    expect(Math.abs(k.naeherung.fajrWinkel - soll.fajrWinkel)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(k.naeherung.ishaWinkel - soll.ishaWinkel)).toBeLessThanOrEqual(0.2);
    for (const g of ['gunes', 'ogle', 'ikindi', 'aksam'] as const)
      expect(Math.abs(k.naeherung.temkinSek[g] - soll.temkinSek[g])).toBeLessThan(30);
    // zwei Monate: Kreuzprobe läuft, beide Monate ohne Sommer
    expect(k.monate).toEqual(['2026-01', '2026-03']);
    expect(k.kreuzprobe).not.toBeNull();
    expect(k.warnungen).toEqual(['ohneSommer']);
  });

  it('IGMG Aachen 10/2026: Ergebnis entspricht dem Standard (ein Monat → Warnung, keine Kreuzprobe)', () => {
    const k = kalibriere(TAGE, AACHEN);
    expect(k.warnungen).toEqual(['einMonat', 'ohneSommer']);
    expect(k.kreuzprobe).toBeNull();
    expect(k.naeherung.fajrWinkel).toBe(STANDARD_NAEHERUNG.fajrWinkel);
    for (const g of GEBETE) {
      expect(k.guete[g].maxFehlerMin, g).toBeLessThanOrEqual(1);
      expect(k.guete[g].exakt, g).toBeGreaterThanOrEqual(29);
    }
    // Der gespeicherte Standard ist mindestens so gut wie 29/31 je Gebet
    const g = bewerte(TAGE, AACHEN, STANDARD_NAEHERUNG);
    for (const gebet of GEBETE) expect(g[gebet].exakt, gebet).toBeGreaterThanOrEqual(29);
  });

  it('warnt bei zu wenigen Tagen', () => {
    expect(kalibriere(TAGE.slice(0, 5), AACHEN).warnungen).toContain('zuWenige');
  });
});
