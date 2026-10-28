import { describe, expect, it } from 'vitest';
import { abweichung, monateVon, vergleiche, type BestandTag } from '@/lib/gebetszeiten/abgleich-diff';

/**
 * Diff des IGMG-Abgleichs (ADR 0048): neu, geändert (mit größter Abweichung), gleich und Konflikt mit dem Import der
 * Gemeinde – der nie überschrieben wird.
 */
const basis = { imsak: '06:20', gunes: '07:58', ogle: '13:16', ikindi: '15:52', aksam: '18:23', yatsi: '19:56' };
const bestand = (datum: string, quelle: BestandTag['quelle'], zeiten = basis): [string, BestandTag] => [
  datum,
  { datum, ...Object.fromEntries(Object.entries(zeiten).map(([k, v]) => [k, `${v}:00`])), quelle } as BestandTag,
];

describe('Diff des Abgleichs', () => {
  it('ordnet neu, geändert, gleich und Konflikt ein', () => {
    const vorher = new Map([
      bestand('2026-11-02', 'igmg'),
      bestand('2026-11-03', 'igmg'),
      bestand('2026-11-04', 'import'),
      bestand('2026-11-05', 'import'),
    ]);
    const diff = vergleiche(vorher, [
      { datum: '2026-11-01', ...basis },
      { datum: '2026-11-02', ...basis },
      { datum: '2026-11-03', ...basis, yatsi: '19:59', imsak: '06:18' },
      { datum: '2026-11-04', ...basis, aksam: '18:25' },
      { datum: '2026-11-05', ...basis },
    ]);
    expect(diff.neu.map((t) => t.datum)).toEqual(['2026-11-01']);
    expect(diff.geaendert.map((t) => t.datum)).toEqual(['2026-11-03']);
    expect(diff.gleich).toBe(2);
    expect(diff.konflikte).toEqual([{ datum: '2026-11-04', abweichungMin: { aksam: 2 } }]);
    expect(diff.maxAbweichungMin).toBe(3);
  });

  it('ohne Änderung: nichts zu schreiben', () => {
    const diff = vergleiche(new Map([bestand('2026-11-02', 'igmg')]), [{ datum: '2026-11-02', ...basis }]);
    expect(diff).toEqual({ neu: [], geaendert: [], gleich: 1, konflikte: [], maxAbweichungMin: 0 });
  });

  it('Abweichung über Mitternacht nimmt den kurzen Weg', () => {
    expect(abweichung({ ...basis, yatsi: '00:05' }, { ...basis, yatsi: '23:58' })).toEqual({ yatsi: 7 });
    expect(abweichung({ ...basis, yatsi: '23:58' }, { ...basis, yatsi: '00:05' })).toEqual({ yatsi: -7 });
  });

  it('betroffene Monate für die Cache-Tags', () => {
    expect(monateVon([{ datum: '2026-12-31' }, { datum: '2026-11-30' }, { datum: '2026-12-01' }])).toEqual(['2026-11', '2026-12']);
  });
});
