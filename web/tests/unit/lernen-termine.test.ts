import { describe, expect, it } from 'vitest';
import { anwesenheitsQuote, tagPlus, termineDerSerie, vorbelegung, wochentag } from '@/lib/lernen/termine';

describe('Terminserien der Lerngruppen', () => {
  it('Wochentage und Datumsrechnung', () => {
    expect(wochentag('2026-10-13')).toBe(2); // Dienstag
    expect(tagPlus('2026-10-31', 1)).toBe('2026-11-01');
    expect(tagPlus('2026-03-28', 2)).toBe('2026-03-30'); // über die Zeitumstellung
  });

  it('Samstag und Sonntag im Oktober, begrenzt auf Beginn und Ende der Gruppe', () => {
    const t = termineDerSerie(
      { beginn: '2026-10-10', ende: '2026-10-25', wochentage: [6, 0], uhrzeitVon: '10:00', uhrzeitBis: '12:00' },
      '2026-10-01',
      '2026-10-31',
    );
    expect(t.map((x) => x.datum)).toEqual(['2026-10-10', '2026-10-11', '2026-10-17', '2026-10-18', '2026-10-24', '2026-10-25']);
    expect(t[0]).toMatchObject({ beginn: '10:00', ende: '12:00' });
  });

  it('ohne Wochentage oder mit ungültigen Werten keine Termine', () => {
    expect(
      termineDerSerie({ beginn: null, ende: null, wochentage: [], uhrzeitVon: null, uhrzeitBis: null }, '2026-10-01', '2026-10-31'),
    ).toEqual([]);
    expect(
      termineDerSerie({ beginn: null, ende: null, wochentage: [7, -1], uhrzeitVon: null, uhrzeitBis: null }, '2026-10-01', '2026-10-31'),
    ).toEqual([]);
  });

  it('Vorbelegung und Quote', () => {
    expect(vorbelegung(null, false)).toBe('anwesend');
    expect(vorbelegung(null, true)).toBe('entschuldigt');
    expect(vorbelegung('fehlt', true)).toBe('fehlt');
    expect(anwesenheitsQuote([])).toBeNull();
    expect(anwesenheitsQuote(['anwesend', 'verspaetet', 'fehlt', 'entschuldigt'])).toBe(0.5);
  });
});
