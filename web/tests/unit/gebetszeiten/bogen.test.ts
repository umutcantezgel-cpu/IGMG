import { describe, expect, it } from 'vitest';
import { BOGEN, minutenAus, tagesbogen, zeitAnteilEintritt } from '@/lib/gebetszeiten/bogen';

const herbst = { imsak: '05:52', gunes: '07:41', ogle: '13:16', ikindi: '16:08', aksam: '18:42', yatsi: '20:22' };
const winter = { imsak: '06:31', gunes: '08:19', ogle: '12:25', ikindi: '14:12', aksam: '16:29', yatsi: '18:13' };
const sommer = { imsak: '02:41', gunes: '05:14', ogle: '13:38', ikindi: '17:52', aksam: '21:52', yatsi: '00:05' };

describe('Tagesbogen', () => {
  it('rechnet Uhrzeiten in Minuten', () => {
    expect(minutenAus('00:00')).toBe(0);
    expect(minutenAus('13:16')).toBe(796);
  });

  it('legt Güneş und Akşam auf den Horizont, Imsak und Yatsı darunter, Öğle darüber', () => {
    const b = tagesbogen(herbst);
    const y = Object.fromEntries(b.punkte.map((p) => [p.gebet, p.y]));
    expect(y.gunes).toBeCloseTo(BOGEN.horizont, 0);
    expect(y.aksam).toBeCloseTo(BOGEN.horizont, 0);
    expect(y.imsak).toBeGreaterThan(BOGEN.horizont);
    expect(y.yatsi).toBeGreaterThan(BOGEN.horizont);
    expect(y.ogle).toBeLessThan(BOGEN.horizont - BOGEN.hoch * 0.9);
  });

  it('ordnet die Zeiten waagerecht von links nach rechts innerhalb des Rands', () => {
    for (const zeiten of [herbst, winter]) {
      const xs = tagesbogen(zeiten).punkte.map((p) => p.x);
      expect([...xs].sort((a, b) => a - b)).toEqual(xs);
      expect(xs[0]).toBe(BOGEN.rand);
      expect(xs[5]).toBe(BOGEN.breite - BOGEN.rand);
    }
  });

  it('bleibt im Zeichenfeld, auch im Winter', () => {
    for (const p of tagesbogen(winter).punkte) {
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(BOGEN.hoehe);
    }
  });

  it('zeichnet bis jetzt: leer vor Imsak, ganz nach Yatsı', () => {
    const b = tagesbogen(herbst);
    expect(b.pfadBis(minutenAus('04:00'))).toBe('');
    expect(b.anteil(minutenAus('04:00'))).toBe(0);
    expect(b.anteil(minutenAus('23:00'))).toBe(1);
    expect(b.pfadBis(minutenAus('23:00'))).toBe(b.pfad);
    expect(b.anteil(minutenAus('13:16'))).toBeGreaterThan(0.4);
  });

  it('geht bei Güneş und Akşam ohne Ecke durch, Imsak und Yatsı liegen unter dem Horizont innerhalb von tief', () => {
    const d = 10;
    for (const zeiten of [herbst, winter, sommer]) {
      const b = tagesbogen(zeiten);
      for (const gebet of ['gunes', 'aksam'] as const) {
        const t = minutenAus(zeiten[gebet]);
        const knick = b.punktZu(t).y - b.punktZu(t - d).y - (b.punktZu(t + d).y - b.punktZu(t).y);
        expect(Math.abs(knick)).toBeLessThanOrEqual(0.3);
      }
      for (const p of b.punkte.filter((q) => q.gebet === 'imsak' || q.gebet === 'yatsi')) {
        expect(p.y).toBeGreaterThan(BOGEN.horizont);
        expect(p.y).toBeLessThanOrEqual(BOGEN.horizont + BOGEN.tief);
      }
    }
  });

  it('führt Yatsı nach Mitternacht ans rechte Ende des Bogens', () => {
    const b = tagesbogen(sommer);
    expect(b.pfad.startsWith('M')).toBe(true);
    for (const p of b.punkte) expect(Number.isFinite(p.y)).toBe(true);
    expect(b.punkte[5].x).toBe(BOGEN.breite - BOGEN.rand);
    expect(b.punkte[5].y).toBeGreaterThan(BOGEN.horizont);
  });

  it('färbt im Takt der Linie: Zeitanteil der Kurve --ease-eintritt zu einem Weganteil', () => {
    expect(zeitAnteilEintritt(0)).toBe(0);
    expect(zeitAnteilEintritt(1)).toBe(1);
    const werte = Array.from({ length: 21 }, (_, i) => zeitAnteilEintritt(i / 20));
    for (let i = 1; i < werte.length; i++) expect(werte[i]).toBeGreaterThanOrEqual(werte[i - 1] ?? 0);
    expect(zeitAnteilEintritt(0.5)).toBeCloseTo(0.062, 2);
    expect(zeitAnteilEintritt(0.9)).toBeCloseTo(0.359, 2);
  });
});
