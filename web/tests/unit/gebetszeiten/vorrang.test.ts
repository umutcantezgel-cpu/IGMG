import { describe, expect, it } from 'vitest';
import { nurZeiten, quelleVon, VORRANG, waehleTag } from '@/lib/gebetszeiten/vorrang';

/** Vorrang je Tag (ADR 0048): Import der Gemeinde vor IGMG (Datenbank) vor IGMG-Jahresdatei vor Rechnung. */
const z = (h: string) => ({
  imsak: `0${h}:00:00`,
  gunes: '07:00:00',
  ogle: '12:00:00',
  ikindi: '15:00:00',
  aksam: '17:00:00',
  yatsi: '19:00:00',
});
const rechne = () => ({ imsak: '05:59', gunes: '07:01', ogle: '12:01', ikindi: '15:01', aksam: '17:01', yatsi: '19:01' });

describe('Vorrang der Quellen', () => {
  it('hat die Reihenfolge Import, IGMG, Datei, Rechnung', () => {
    expect(VORRANG).toEqual(['import', 'igmg', 'datei', 'rechnung']);
  });

  it('wählt je Tag die höchste vorhandene Ebene und kürzt Sekunden', () => {
    expect(waehleTag('2026-11-01', { import: z('1'), igmg: z('2'), datei: z('3') }, rechne)).toMatchObject({
      quelle: 'import',
      ebene: 'import',
      imsak: '01:00',
    });
    expect(waehleTag('2026-11-01', { igmg: z('2'), datei: z('3') }, rechne)).toMatchObject({
      quelle: 'igmg',
      ebene: 'igmg',
      imsak: '02:00',
    });
    expect(waehleTag('2026-11-01', { datei: z('3') }, rechne)).toMatchObject({ quelle: 'igmg', ebene: 'datei', imsak: '03:00' });
    expect(waehleTag('2026-11-01', {}, rechne)).toMatchObject({ quelle: 'berechnet', ebene: 'rechnung', imsak: '05:59' });
  });

  it('rechnet nur, wenn keine Tabelle den Tag kennt', () => {
    let gerechnet = 0;
    waehleTag('2026-11-01', { igmg: z('2') }, () => {
      gerechnet++;
      return rechne();
    });
    expect(gerechnet).toBe(0);
  });

  it('Herkunft eines Zeitraums', () => {
    expect(quelleVon([{ quelle: 'igmg' }, { quelle: 'igmg' }])).toBe('igmg');
    expect(quelleVon([{ quelle: 'import' }, { quelle: 'igmg' }])).toBe('igmg');
    expect(quelleVon([{ quelle: 'import' }])).toBe('import');
    expect(quelleVon([{ quelle: 'igmg' }, { quelle: 'berechnet' }])).toBe('gemischt');
    expect(quelleVon([{ quelle: 'berechnet' }])).toBe('berechnet');
    expect(nurZeiten(z('4'))).toEqual({ imsak: '04:00', gunes: '07:00', ogle: '12:00', ikindi: '15:00', aksam: '17:00', yatsi: '19:00' });
  });
});
