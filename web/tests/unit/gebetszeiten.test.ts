import { describe, expect, it } from 'vitest';
import { berechneMonat, berechneTag, qiblaRichtung } from '@/lib/gebetszeiten/berechnung';
import { leseTabelle } from '@/lib/gebetszeiten/import';
import { berlinerDatum, naechstesGebet, restzeit, zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import { GEBETE } from '@/lib/gebetszeiten/typen';

const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

describe('Berechnung (ADR 0008)', () => {
  it('liefert sechs aufsteigende Zeiten im Format HH:MM', () => {
    const t = berechneTag('2026-10-11');
    expect(Object.keys(t)).toEqual([...GEBETE]);
    const folge = GEBETE.map((g) => minuten(t[g]));
    folge.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(folge[i]));
  });

  it('Sommerzeitwechsel: Mittagsgebet springt um etwa eine Stunde (28./29.03.2026)', () => {
    const vor = minuten(berechneTag('2026-03-28').ogle);
    const nach = minuten(berechneTag('2026-03-29').ogle);
    expect(nach - vor).toBeGreaterThanOrEqual(59);
    expect(nach - vor).toBeLessThanOrEqual(61);
  });

  it('Winterzeitwechsel (24./25.10.2026)', () => {
    const vor = minuten(berechneTag('2026-10-24').ogle);
    const nach = minuten(berechneTag('2026-10-25').ogle);
    expect(vor - nach).toBeGreaterThanOrEqual(59);
    expect(vor - nach).toBeLessThanOrEqual(61);
  });

  it('Hochsommer ohne astronomische Dämmerung: Imsak und Yatsı existieren (Siebtel der Nacht)', () => {
    const t = berechneTag('2026-06-21');
    expect(minuten(t.imsak)).toBeLessThan(minuten(t.gunes));
    expect(minuten(t.yatsi)).toBeGreaterThan(minuten(t.aksam));
  });

  it('Monat hat alle Tage', () => {
    expect(berechneMonat('2026-02')).toHaveLength(28);
    expect(berechneMonat('2028-02')).toHaveLength(29);
  });

  it('Qibla für Wetzlar ≈ 128,3°', () => {
    expect(qiblaRichtung()).toBeCloseTo(128.3, 0);
  });
});

describe('Nächstes Gebet (K-08)', () => {
  const heute = {
    datum: '2026-10-11',
    zeiten: { imsak: '06:05', gunes: '07:42', ogle: '13:24', ikindi: '16:22', aksam: '18:58', yatsi: '20:28' },
  };
  const morgen = {
    datum: '2026-10-12',
    zeiten: { imsak: '06:07', gunes: '07:44', ogle: '13:23', ikindi: '16:20', aksam: '18:56', yatsi: '20:26' },
  };

  it('findet das nächste Gebet am selben Tag', () => {
    const n = naechstesGebet(heute, morgen, zeitpunkt('2026-10-11', '14:00'));
    expect(n?.gebet).toBe('ikindi');
    expect(restzeit(n!.restMs)).toEqual({ stunden: 2, minuten: 22 });
  });

  it('nach Yatsı ist Imsak des Folgetags dran (über Mitternacht)', () => {
    const n = naechstesGebet(heute, morgen, zeitpunkt('2026-10-11', '23:30'));
    expect(n).toMatchObject({ gebet: 'imsak', morgen: true });
    expect(restzeit(n!.restMs)).toEqual({ stunden: 6, minuten: 37 });
  });

  it('ohne Folgetag nach Yatsı: null', () => {
    expect(naechstesGebet(heute, null, zeitpunkt('2026-10-11', '23:30'))).toBeNull();
  });

  it('Güneş kann übersprungen werden', () => {
    expect(naechstesGebet(heute, morgen, zeitpunkt('2026-10-11', '07:00'), true)?.gebet).toBe('ogle');
  });

  it('Berliner Datum um Mitternacht UTC', () => {
    expect(berlinerDatum(new Date('2026-10-11T22:30:00Z'))).toBe('2026-10-12');
  });
});

describe('Tabellen-Import (K-08)', () => {
  const kopf = 'datum;imsak;gunes;ogle;ikindi;aksam;yatsi';
  it('liest CSV mit Semikolon, deutschem Datum und kurzen Zeiten', () => {
    const r = leseTabelle(`${kopf}\n01.11.2026;6:20;7:58;13:16;15:52;18:23;19:56\n02.11.2026;06:21;08:00;13:16;15:51;18:21;19:55`, 'csv');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.von).toBe('2026-11-01');
      expect(r.tage[0].imsak).toBe('06:20');
    }
  });
  it('meldet falsche Reihenfolge, Doppelungen und Lücken mit Zeile', () => {
    expect(leseTabelle(`${kopf}\n2026-11-01;08:00;07:58;13:16;15:52;18:23;19:56`, 'csv')).toEqual({
      ok: false,
      fehler: [{ zeile: 2, fehler: 'reihenfolge' }],
    });
    const doppelt = leseTabelle(
      `${kopf}\n2026-11-01;06:20;07:58;13:16;15:52;18:23;19:56\n2026-11-01;06:20;07:58;13:16;15:52;18:23;19:56`,
      'csv',
    );
    expect(doppelt).toEqual({ ok: false, fehler: [{ zeile: 3, fehler: 'doppelt' }] });
    const luecke = leseTabelle(
      `${kopf}\n2026-11-01;06:20;07:58;13:16;15:52;18:23;19:56\n2026-11-03;06:20;07:58;13:16;15:52;18:23;19:56`,
      'csv',
    );
    expect(luecke).toEqual({ ok: false, fehler: [{ zeile: 0, fehler: 'luecke' }] });
  });
  it('meldet ungültiges Datum und Format', () => {
    expect(leseTabelle(`${kopf}\n2026-02-30;06:20;07:58;13:16;15:52;18:23;19:56`, 'csv')).toEqual({
      ok: false,
      fehler: [{ zeile: 2, fehler: 'datum' }],
    });
    expect(leseTabelle(`${kopf}\n2026-11-01;25:20;07:58;13:16;15:52;18:23;19:56`, 'csv')).toEqual({
      ok: false,
      fehler: [{ zeile: 2, fehler: 'format' }],
    });
    expect(leseTabelle('kein json', 'json')).toEqual({ ok: false, fehler: [{ zeile: 0, fehler: 'format' }] });
    expect(leseTabelle('', 'csv')).toEqual({ ok: false, fehler: [{ zeile: 0, fehler: 'leer' }] });
  });
  it('liest JSON', () => {
    const r = leseTabelle(
      JSON.stringify([
        { datum: '2026-11-01', imsak: '06:20', gunes: '07:58', ogle: '13:16', ikindi: '15:52', aksam: '18:23', yatsi: '19:56' },
      ]),
      'json',
    );
    expect(r.ok).toBe(true);
  });
});

describe('zeitpunkt ohne Zeitzonen-Paket (Intl, K-12)', () => {
  it.each([
    ['2026-07-01', '12:00', '2026-07-01T10:00:00.000Z'],
    ['2026-12-01', '12:00', '2026-12-01T11:00:00.000Z'],
    ['2026-03-29', '01:30', '2026-03-29T00:30:00.000Z'],
    ['2026-03-29', '03:30', '2026-03-29T01:30:00.000Z'],
    ['2026-10-25', '03:30', '2026-10-25T02:30:00.000Z'],
    ['2026-10-24', '23:59', '2026-10-24T21:59:00.000Z'],
  ])('%s %s Ortszeit → %s', (datum, zeit, utc) => {
    expect(zeitpunkt(datum, zeit).toISOString()).toBe(utc);
  });

  it('berlinerDatum am Tageswechsel in Sommer- und Winterzeit', () => {
    expect(berlinerDatum(new Date('2026-07-01T21:59:00Z'))).toBe('2026-07-01');
    expect(berlinerDatum(new Date('2026-07-01T22:00:00Z'))).toBe('2026-07-02');
    expect(berlinerDatum(new Date('2026-12-01T22:59:00Z'))).toBe('2026-12-01');
    expect(berlinerDatum(new Date('2026-12-01T23:00:00Z'))).toBe('2026-12-02');
  });
});
