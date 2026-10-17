import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  addiereTage,
  berechneSerie,
  klemmeEreignis,
  klemmeZeit,
  lerntagVon,
  ruhetageAus,
  tageZwischen,
  wochenbeginn,
  wochentag,
} from '@/lib/lernapp/ereignisse/serie';

/**
 * Serie mit Pausetagen (ADR 0043 Nr. 3) über Tages- und Sommerzeitgrenzen (ADR 0038 Folgen): gerechnet wird mit dem
 * Lerntag in Ortszeit, nie mit Uhrzeiten. Woche Montag–Sonntag; 2026-10-12 ist ein Montag.
 */
const tage = (von: string, anzahl: number) => Array.from({ length: anzahl }, (_, i) => addiereTage(von, i));
const menge = (...listen: string[][]) => new Set(listen.flat());
const leer = new Set<string>();

describe('Kalender', () => {
  it('Tage addieren über Monats-, Jahres- und Schaltjahresgrenzen', () => {
    expect(addiereTage('2026-10-31', 1)).toBe('2026-11-01');
    expect(addiereTage('2026-12-31', 1)).toBe('2027-01-01');
    expect(addiereTage('2028-02-28', 1)).toBe('2028-02-29');
    expect(addiereTage('2027-02-28', 1)).toBe('2027-03-01');
    expect(addiereTage('2026-03-30', -2)).toBe('2026-03-28');
    expect(tageZwischen('2026-03-28', '2026-03-30')).toBe(2);
  });

  it('Wochentag und Wochenbeginn (Montag)', () => {
    expect(wochentag('2026-10-12')).toBe(0);
    expect(wochentag('2026-10-17')).toBe(5);
    expect(wochentag('2026-10-18')).toBe(6);
    expect(wochenbeginn('2026-10-18')).toBe('2026-10-12');
    expect(wochenbeginn('2027-01-01')).toBe('2026-12-28');
  });
});

describe('Lerntag in Ortszeit (Tages- und Sommerzeitgrenzen)', () => {
  it('Europe/Berlin: Umstellung auf Sommerzeit am 29.03.2026', () => {
    expect(lerntagVon(new Date('2026-03-28T22:59:00Z'), 'Europe/Berlin')).toBe('2026-03-28'); // 23:59 MEZ
    expect(lerntagVon(new Date('2026-03-28T23:00:00Z'), 'Europe/Berlin')).toBe('2026-03-29'); // 00:00 MEZ
    expect(lerntagVon(new Date('2026-03-29T21:59:00Z'), 'Europe/Berlin')).toBe('2026-03-29'); // 23:59 MESZ
    expect(lerntagVon(new Date('2026-03-29T22:00:00Z'), 'Europe/Berlin')).toBe('2026-03-30'); // 00:00 MESZ
  });

  it('Europe/Berlin: Umstellung auf Winterzeit am 25.10.2026 (Tag mit 25 Stunden)', () => {
    expect(lerntagVon(new Date('2026-10-24T21:59:00Z'), 'Europe/Berlin')).toBe('2026-10-24');
    expect(lerntagVon(new Date('2026-10-24T22:00:00Z'), 'Europe/Berlin')).toBe('2026-10-25');
    expect(lerntagVon(new Date('2026-10-25T22:59:00Z'), 'Europe/Berlin')).toBe('2026-10-25'); // 23:59 MEZ
    expect(lerntagVon(new Date('2026-10-25T23:00:00Z'), 'Europe/Berlin')).toBe('2026-10-26');
  });

  it('Europe/Istanbul (UTC+3, ohne Sommerzeit), Asia/Riyadh, Pacific/Kiritimati (UTC+14), America/Los_Angeles', () => {
    const z = new Date('2026-10-17T21:30:00Z');
    expect(lerntagVon(z, 'Europe/Istanbul')).toBe('2026-10-18');
    expect(lerntagVon(z, 'Asia/Riyadh')).toBe('2026-10-18');
    expect(lerntagVon(z, 'Pacific/Kiritimati')).toBe('2026-10-18');
    expect(lerntagVon(z, 'America/Los_Angeles')).toBe('2026-10-17');
    expect(lerntagVon(z, 'UTC')).toBe('2026-10-17');
  });
});

describe('Serie', () => {
  it('jeden Tag gelernt: Länge = Zahl der Tage', () => {
    expect(berechneSerie(menge(tage('2026-10-08', 10)), leer, '2026-10-17').laenge).toBe(10);
  });

  it('heute noch offen beendet nichts', () => {
    const s = berechneSerie(menge(tage('2026-10-12', 5)), leer, '2026-10-17');
    expect(s).toMatchObject({ laenge: 5, heuteGelernt: false });
  });

  it('bis zu zwei Tage ohne Lernen je Woche tragen die Serie, der dritte nicht', () => {
    const woche = ['2026-10-12', '2026-10-13', '2026-10-16', '2026-10-17']; // Mi und Do frei
    expect(berechneSerie(menge(woche), leer, '2026-10-17').laenge).toBe(4);
    const dreiFrei = ['2026-10-12', '2026-10-16', '2026-10-17']; // Di, Mi, Do frei
    expect(berechneSerie(menge(dreiFrei), leer, '2026-10-17').laenge).toBe(2);
  });

  it('Pausen zählen je Kalenderwoche: Sa+So und Mo+Di hintereinander tragen die Serie', () => {
    const gelernt = ['2026-10-08', '2026-10-09', '2026-10-15', '2026-10-16']; // 10.–11. (Sa, So) und 12.–14. (Mo–Mi) frei
    expect(berechneSerie(menge(gelernt), leer, '2026-10-16').laenge).toBe(2); // Mo–Mi sind drei Tage in einer Woche
    const gelernt2 = ['2026-10-08', '2026-10-09', '2026-10-14', '2026-10-15']; // Sa, So, Mo, Di frei
    expect(berechneSerie(menge(gelernt2), leer, '2026-10-15').laenge).toBe(4);
  });

  it('Pausetage einstellbar 0–3', () => {
    const gelernt = menge(['2026-10-12', '2026-10-14', '2026-10-15']); // Di frei
    expect(berechneSerie(gelernt, leer, '2026-10-15', { pausetage: 0 }).laenge).toBe(2);
    expect(berechneSerie(gelernt, leer, '2026-10-15', { pausetage: 1 }).laenge).toBe(3);
    const dreiFrei = menge(['2026-10-12', '2026-10-16', '2026-10-17']);
    expect(berechneSerie(dreiFrei, leer, '2026-10-17', { pausetage: 3 }).laenge).toBe(3);
    expect(berechneSerie(dreiFrei, leer, '2026-10-17', { pausetage: 9 }).laenge).toBe(3);
  });

  it('Ruhetage tragen die Serie und verbrauchen keine Pausetage', () => {
    const gelernt = menge(['2026-10-05', '2026-10-06'], ['2026-10-14', '2026-10-15']);
    const ruhe = ruhetageAus([{ von: '2026-10-07', bis: '2026-10-13' }]);
    expect(berechneSerie(gelernt, ruhe, '2026-10-15', { pausetage: 0 }).laenge).toBe(4);
    expect(berechneSerie(gelernt, leer, '2026-10-15').laenge).toBe(2);
  });

  it('über die Sommerzeitumstellung (Lerntage 28.–30.03.2026)', () => {
    expect(berechneSerie(menge(tage('2026-03-28', 3)), leer, '2026-03-30').laenge).toBe(3);
    expect(berechneSerie(menge(tage('2026-10-24', 3)), leer, '2026-10-26').laenge).toBe(3);
  });

  it('ohne Lerntage: Länge 0; Lerntage in der Zukunft zählen nicht', () => {
    expect(berechneSerie(leer, leer, '2026-10-17').laenge).toBe(0);
    expect(berechneSerie(menge(['2026-10-20']), leer, '2026-10-17').laenge).toBe(0);
  });

  it('Wochenband Montag bis Sonntag', () => {
    const s = berechneSerie(
      menge(['2026-10-12', '2026-10-13', '2026-10-15']),
      ruhetageAus([{ von: '2026-10-16', bis: '2026-10-16' }]),
      '2026-10-17',
    );
    expect(s.woche.map((t) => t.art)).toEqual(['gelernt', 'gelernt', 'pause', 'gelernt', 'ruhe', 'heute', 'zukunft']);
    expect(s.pausenDieseWoche).toBe(1);
    expect(s.laenge).toBe(3);
  });

  it('Eigenschaft: mehr Lerntage machen die Serie nie kürzer', () => {
    const tag = fc.integer({ min: 0, max: 60 }).map((n) => addiereTage('2026-08-20', n));
    fc.assert(
      fc.property(fc.uniqueArray(tag, { maxLength: 40 }), tag, (liste, extra) => {
        const heute = '2026-10-19';
        const a = berechneSerie(new Set(liste), leer, heute).laenge;
        const b = berechneSerie(new Set([...liste, extra]), leer, heute).laenge;
        return b >= a;
      }),
    );
  });
});

describe('Ruhetage', () => {
  it('höchstens 30 je Kalenderjahr, die frühesten zählen; neues Jahr neu', () => {
    const r = ruhetageAus([
      { von: '2026-01-01', bis: '2026-01-25' },
      { von: '2026-06-01', bis: '2026-06-10' },
      { von: '2026-12-30', bis: '2027-01-03' },
    ]);
    expect([...r].filter((t) => t.startsWith('2026'))).toHaveLength(30);
    expect(r.has('2026-06-05')).toBe(true);
    expect(r.has('2026-06-06')).toBe(false);
    expect(r.has('2027-01-03')).toBe(true);
  });

  it('überlappende Zeiträume zählen jeden Tag einmal', () => {
    expect(
      ruhetageAus([
        { von: '2026-10-01', bis: '2026-10-05' },
        { von: '2026-10-03', bis: '2026-10-07' },
      ]).size,
    ).toBe(7);
  });
});

describe('Uhrzeit-Klemme (am ≤ Empfang + 5 min)', () => {
  const empfang = new Date('2026-10-17T12:00:00.000Z');

  it('Zeit in der Zukunft wird geklemmt, sonst unverändert', () => {
    expect(klemmeZeit('2026-10-17T12:04:59.000Z', empfang)).toBe('2026-10-17T12:04:59.000Z');
    expect(klemmeZeit('2026-10-17T12:05:00.000Z', empfang)).toBe('2026-10-17T12:05:00.000Z');
    expect(klemmeZeit('2026-10-17T12:05:01.000Z', empfang)).toBe('2026-10-17T12:05:00.000Z');
    expect(klemmeZeit('2030-01-01T00:00:00+02:00', empfang)).toBe('2026-10-17T12:05:00.000Z');
    expect(klemmeZeit('2026-10-01T08:00:00+02:00', empfang)).toBe('2026-10-01T08:00:00+02:00');
  });

  it('Lerntag nie hinter dem spätesten Kalendertag der Erde beim Empfang', () => {
    expect(klemmeEreignis({ am: '2026-10-17T11:00:00.000Z', tag: '2026-10-18' }, empfang)).toEqual({
      am: '2026-10-17T11:00:00.000Z',
      tag: '2026-10-18',
    });
    expect(klemmeEreignis({ am: '2031-01-01T00:00:00.000Z', tag: '2031-01-01' }, empfang)).toEqual({
      am: '2026-10-17T12:05:00.000Z',
      tag: '2026-10-18',
    });
    const e = { am: '2026-10-17T10:00:00.000Z', tag: '2026-10-17', x: 1 };
    expect(klemmeEreignis(e, empfang)).toBe(e);
  });

  it('Eigenschaft: geklemmt liegt nie nach Empfang + 5 min; Klemmen ist idempotent', () => {
    fc.assert(
      fc.property(fc.date({ min: new Date('2020-01-01Z'), max: new Date('2040-01-01Z'), noInvalidDate: true }), (d) => {
        const k = klemmeZeit(d.toISOString(), empfang);
        return Date.parse(k) <= empfang.getTime() + 300_000 && klemmeZeit(k, empfang) === k;
      }),
    );
  });
});
