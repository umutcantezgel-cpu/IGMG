import { describe, expect, it } from 'vitest';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import {
  datumIn,
  entfernungKm,
  gerundet,
  leseGemerktenOrt,
  minutenUnterschied,
  naechsterOrt,
  runde,
  unterschiede,
  type OrtEintrag,
} from '@/lib/gebetszeiten/ort';
import ORTE from '@/lib/gebetszeiten/orte.json';
import { STANDARD_EINSTELLUNGEN } from '@/lib/gebetszeiten/typen';

const orte = ORTE as unknown as OrtEintrag[];
const finde = (name: string) => orte.find((o) => o[0] === name)!;

describe('Gebetszeiten „Mein Ort“ (AUFTRAG 3.8)', () => {
  it('rundet den Standort auf zwei Nachkommastellen', () => {
    expect(runde(50.56789)).toBe(50.57);
    expect(gerundet({ breite: 50.123456, laenge: 8.987654 })).toEqual({ breite: 50.12, laenge: 8.99 });
  });

  it('Ortsliste: deutsche Namen, Umgebung Wetzlar, eindeutige Namen', () => {
    const namen = orte.map((o) => o[0]);
    expect(namen).toContain('München');
    expect(namen).toContain('Wetzlar');
    expect(namen).toContain('Gießen');
    expect(namen).toContain('Solms');
    expect(namen).not.toContain('Munich');
    expect(new Set(namen).size).toBe(namen.length);
  });

  it('findet den nächsten Ort und misst Entfernungen plausibel', () => {
    const giessen = finde('Gießen');
    expect(naechsterOrt({ breite: giessen[1] + 0.003, laenge: giessen[2] - 0.004 }, orte)?.name).toBe('Gießen');
    const wetzlar = finde('Wetzlar');
    const frankfurt = finde('Frankfurt am Main');
    const km = entfernungKm({ breite: wetzlar[1], laenge: wetzlar[2] }, { breite: frankfurt[1], laenge: frankfurt[2] });
    expect(km).toBeGreaterThan(45);
    expect(km).toBeLessThan(55);
  });

  it('Wetzlar ≠ Frankfurt: gleiche Methode, andere Zeiten', () => {
    const frankfurt = finde('Frankfurt am Main');
    const tag = '2026-10-13';
    const w = berechneTag(tag, STANDARD_EINSTELLUNGEN);
    const f = berechneTag(tag, { ...STANDARD_EINSTELLUNGEN, breite: frankfurt[1], laenge: frankfurt[2] });
    const d = unterschiede(f, w);
    // Frankfurt liegt etwa 0,2° östlicher (≈ 1 Min.) und 0,4° südlicher: Mittag nie später, andere Gebete verschieben sich
    expect(d.ogle).toBeLessThanOrEqual(0);
    expect(d.ogle).toBeGreaterThanOrEqual(-2);
    expect(Object.values(d).some((m) => m !== 0)).toBe(true);
  });

  it('rechnet in der Zeitzone des Geräts', () => {
    const tag = '2026-10-13';
    const berlin = berechneTag(tag, STANDARD_EINSTELLUNGEN);
    const london = berechneTag(tag, STANDARD_EINSTELLUNGEN, 'Europe/London');
    expect(minutenUnterschied(london.ogle, berlin.ogle)).toBe(60);
  });

  it('Minutenunterschied faltet über Mitternacht', () => {
    expect(minutenUnterschied('23:58', '00:02')).toBe(4);
    expect(minutenUnterschied('00:02', '23:58')).toBe(-4);
    expect(minutenUnterschied('13:10', '13:12')).toBe(2);
  });

  it('Datum in der Zeitzone', () => {
    const spaet = new Date('2026-10-13T22:30:00Z');
    expect(datumIn('Europe/Berlin', spaet)).toBe('2026-10-14');
    expect(datumIn('Europe/London', spaet)).toBe('2026-10-13');
  });

  it('liest nur gültige gemerkte Orte und rundet sie', () => {
    expect(leseGemerktenOrt(null)).toBeNull();
    expect(leseGemerktenOrt('kaputt')).toBeNull();
    expect(leseGemerktenOrt(JSON.stringify({ name: 'X', breite: 200, laenge: 1 }))).toBeNull();
    expect(leseGemerktenOrt(JSON.stringify({ name: 'Solms', breite: 50.5367, laenge: 8.4049 }))).toEqual({
      name: 'Solms',
      breite: 50.54,
      laenge: 8.4,
      zone: 'Europe/Berlin',
    });
  });
});
