import { describe, expect, it } from 'vitest';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { pruefePlausibilitaet, umstellung, type PruefTag } from '@/lib/gebetszeiten/quellen/pruefung';
import { GEBETE, STANDARD_EINSTELLUNGEN, type Gebet } from '@/lib/gebetszeiten/typen';
import { AACHEN, TAGE } from '../../hilfen/igmg-aachen-2026-10';

/**
 * Plausibilität einer Lieferung (ADR 0048): Die echte IGMG-Tabelle Aachen 10/2026 (mit Umstellung am 25.10.) besteht alle
 * harten Prüfungen; Yatsı nach Mitternacht, Sprünge, Umstellungstage 2026-03-29 und 2026-10-25, Daten in UTC (Öğle-Probe)
 * und ein fremder Ort werden erkannt; starke Abweichung zur Näherung macht die Lieferung „auffällig“.
 */
const AACHEN_EINSTELLUNG = { ...STANDARD_EINSTELLUNGEN, ...AACHEN };
const WETZLAR = STANDARD_EINSTELLUNGEN;

const plus = (hhmm: string, min: number) => {
  const m = (((Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3)) + min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const verschiebe = (tage: readonly PruefTag[], min: number, gebete: readonly Gebet[] = GEBETE) =>
  tage.map((t) => ({ ...t, ...Object.fromEntries(gebete.map((g) => [g, plus(t[g], min)])) }));

/** Gerechnete Tage der Näherung in Wetzlar (plausibel nach Konstruktion). */
function wetzlarTage(von: string, anzahl: number): PruefTag[] {
  const [j, m, t] = von.split('-').map(Number);
  return Array.from({ length: anzahl }, (_, i) => {
    const datum = new Date(Date.UTC(j, m - 1, t + i)).toISOString().slice(0, 10);
    return { datum, ...berechneTag(datum, WETZLAR) };
  });
}

describe('Plausibilität', () => {
  it('Umstellungstage 2026: +60 am 29.03., −60 am 25.10.', () => {
    expect(umstellung('2026-03-29')).toBe(60);
    expect(umstellung('2026-10-25')).toBe(-60);
    expect(umstellung('2026-10-24')).toBe(0);
  });

  it('IGMG Aachen 10/2026 (über die Winterzeit-Umstellung) ist plausibel und nicht auffällig', () => {
    expect(pruefePlausibilitaet(TAGE, { einstellung: AACHEN_EINSTELLUNG })).toEqual({ hart: [], auffaellig: [] });
  });

  it('Sommerzeit-Umstellung im März wird nicht als Sprung gewertet', () => {
    expect(pruefePlausibilitaet(wetzlarTage('2026-03-26', 7), { einstellung: WETZLAR }).hart).toEqual([]);
  });

  it('Yatsı nach Mitternacht im Hochsommer ist erlaubt', () => {
    const tage = wetzlarTage('2026-06-20', 3).map((t) => ({ ...t, yatsi: plus(t.yatsi, 50) }));
    expect(tage.some((t) => t.yatsi < '01:00')).toBe(true);
    const bericht = pruefePlausibilitaet(tage, { einstellung: WETZLAR });
    expect(bericht.hart).toEqual([]);
  });

  it('Sprung über 6 Minuten an einem gewöhnlichen Tag ist ein harter Fehler', () => {
    const tage = TAGE.map((t) => (t.datum === '2026-10-10' ? { ...t, aksam: plus(t.aksam, 10) } : t));
    const hart = pruefePlausibilitaet(tage, { einstellung: AACHEN_EINSTELLUNG }).hart;
    expect(hart).toEqual([
      { datum: '2026-10-10', fehler: 'sprung', gebet: 'aksam' },
      { datum: '2026-10-11', fehler: 'sprung', gebet: 'aksam' },
    ]);
  });

  it('Daten in UTC (eine bzw. zwei Stunden zu früh) fallen an der Öğle-Probe auf', () => {
    const hart = pruefePlausibilitaet(verschiebe(TAGE, -60), { einstellung: AACHEN_EINSTELLUNG }).hart;
    expect(hart.filter((f) => f.fehler === 'sommerzeit')).toHaveLength(31);
  });

  it('Reihenfolge, Lücke, Dublette und leere Lieferung sind harte Fehler', () => {
    const vertauscht = TAGE.map((t, i) => (i === 3 ? { ...t, imsak: t.gunes, gunes: t.imsak } : t));
    expect(pruefePlausibilitaet(vertauscht, { einstellung: AACHEN_EINSTELLUNG }).hart).toContainEqual({
      datum: '2026-10-04',
      fehler: 'reihenfolge',
    });
    const luecke = TAGE.filter((t) => t.datum !== '2026-10-15');
    expect(pruefePlausibilitaet(luecke, { einstellung: AACHEN_EINSTELLUNG }).hart).toContainEqual({
      datum: '2026-10-16',
      fehler: 'luecke',
    });
    expect(pruefePlausibilitaet([...TAGE, TAGE[0]], { einstellung: AACHEN_EINSTELLUNG }).hart).toContainEqual({
      datum: '2026-10-01',
      fehler: 'doppelt',
    });
    expect(pruefePlausibilitaet([], { einstellung: WETZLAR }).hart).toEqual([{ datum: null, fehler: 'leer' }]);
  });

  it('fremder Ort (ID oder Name) ist ein harter Fehler; gleicher Ort in anderer Schreibweise nicht', () => {
    const tage = wetzlarTage('2026-11-01', 3);
    expect(pruefePlausibilitaet(tage, { einstellung: WETZLAR, ort: { geliefert: '20001', erwartet: '20238' } }).hart).toEqual([
      { datum: null, fehler: 'stadt' },
    ]);
    expect(pruefePlausibilitaet(tage, { einstellung: WETZLAR, ort: { geliefert: 'Aachen (DE)', erwartet: 'Wetzlar' } }).hart).toHaveLength(
      1,
    );
    expect(pruefePlausibilitaet(tage, { einstellung: WETZLAR, ort: { geliefert: 'WETZLAR (DE)', erwartet: 'Wetzlar' } }).hart).toEqual([]);
  });

  it('über 10 Minuten Abstand zur Näherung → auffällig (ohne harten Fehler)', () => {
    const tage = verschiebe(wetzlarTage('2026-11-01', 5), 12, ['yatsi']);
    const bericht = pruefePlausibilitaet(tage, { einstellung: WETZLAR });
    expect(bericht.hart).toEqual([]);
    expect(bericht.auffaellig).toHaveLength(5);
    expect(bericht.auffaellig[0]).toEqual({ datum: '2026-11-01', gebet: 'yatsi', abweichungMin: 12 });
    // Im Sommer gilt die weite Grenze (45 Minuten), weil die Sommerregel der IGMG nicht belegt ist
    expect(pruefePlausibilitaet(verschiebe(wetzlarTage('2026-06-10', 3), 30, ['yatsi']), { einstellung: WETZLAR }).auffaellig).toEqual([]);
  });
});
