import { describe, expect, it } from 'vitest';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { GEBETE, STANDARD_EINSTELLUNGEN, STANDARD_NAEHERUNG, type Gebet } from '@/lib/gebetszeiten/typen';
import { AACHEN, TAGE } from '../../hilfen/igmg-aachen-2026-10';

/**
 * Näherung „IGMG (angenähert)“ (ADR 0048): gegen die IGMG-Tabelle Aachen, Oktober 2026 (Testdaten mit Zustimmung der IGMG,
 * `tests/hilfen/igmg-aachen-2026-10.ts`) höchstens 1 Minute Abweichung und je Gebet mindestens 29 von 31 Tagen exakt.
 * Koordinaten Aachen nach GeoNames (50,77664 N, 6,08342 E); dieselben Werte halten auch mit 50,776 N, 6,084 E.
 */
const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

function abgleich(breite: number, laenge: number) {
  const je = Object.fromEntries(GEBETE.map((g) => [g, { exakt: 0, max: 0 }])) as Record<Gebet, { exakt: number; max: number }>;
  for (const tag of TAGE) {
    const z = berechneTag(tag.datum, { ...STANDARD_EINSTELLUNGEN, breite, laenge, rueckfall: 'naeherung', naeherung: STANDARD_NAEHERUNG });
    for (const g of GEBETE) {
      const f = Math.abs(minuten(z[g]) - minuten(tag[g]));
      if (f === 0) je[g].exakt++;
      je[g].max = Math.max(je[g].max, f);
    }
  }
  return je;
}

describe('Näherung IGMG (angenähert) gegen den IGMG-Kalender Aachen 10/2026', () => {
  it.each([
    ['GeoNames', AACHEN.breite, AACHEN.laenge],
    ['gerundet', 50.776, 6.084],
  ])('Koordinaten %s: je Gebet ≤ 1 Minute und ≥ 29/31 exakt', (_name, breite, laenge) => {
    const je = abgleich(breite, laenge);
    for (const g of GEBETE) {
      expect(je[g].max, g).toBeLessThanOrEqual(1);
      expect(je[g].exakt, g).toBeGreaterThanOrEqual(29);
    }
  });

  it('ist der Standard-Rückfall; die Methode bleibt wählbar und rechnet wie bisher', () => {
    expect(STANDARD_EINSTELLUNGEN.rueckfall).toBe('naeherung');
    const standard = berechneTag('2026-10-27');
    const naeherung = berechneTag('2026-10-27', { ...STANDARD_EINSTELLUNGEN, rueckfall: 'naeherung' });
    expect(standard).toEqual(naeherung);
    // Turkey mit Siebtel der Nacht (Bestand vor ADR 0048): Yatsı deutlich später als die IGMG-Näherung
    const methode = berechneTag('2026-10-27', { ...STANDARD_EINSTELLUNGEN, rueckfall: 'methode' });
    expect(minuten(methode.yatsi) - minuten(naeherung.yatsi)).toBeGreaterThanOrEqual(3);
  });

  it('rechnet auch im Hochsommer sechs Zeiten (Winkelregel statt fehlender 18°-Dämmerung)', () => {
    const z = berechneTag('2026-06-21');
    expect(minuten(z.imsak)).toBeLessThan(minuten(z.gunes));
    expect(minuten(z.yatsi)).toBeGreaterThan(minuten(z.aksam));
  });
});
