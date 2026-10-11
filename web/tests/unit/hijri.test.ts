import { describe, expect, it } from 'vitest';
import { hijriDatum, hijriText, istRamadan } from '@/lib/gebetszeiten/hijri';

/** Hidschri-Kalender (Umm al-Qura, berechnet) – Ramadan 1447 beginnt laut Umm al-Qura am 18.02.2026. */
describe('Hidschri-Datum', () => {
  it('Ramadan 1447: 18.02.2026 ist der 1. Ramadan, 17.02.2026 noch nicht', () => {
    expect(hijriDatum('2026-02-18')).toEqual({ tag: 1, monat: 9, jahr: 1447 });
    expect(istRamadan('2026-02-17')).toBe(false);
    expect(istRamadan('2026-02-18')).toBe(true);
  });
  it('liefert einen Text je Sprache', () => {
    expect(hijriText('2026-02-18', 'tr')).toMatch(/1447/);
    expect(hijriText('2026-02-18', 'de')).toMatch(/1447/);
  });
});
