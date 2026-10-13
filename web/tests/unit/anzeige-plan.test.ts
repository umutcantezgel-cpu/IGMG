import { describe, expect, it } from 'vitest';
import { aktiveFolien, anzeigeZustand, STANDARD_ANZEIGE } from '@/lib/anzeige/plan';
import { zeitpunkt } from '@/lib/gebetszeiten/naechstes';

const ZEITEN = { imsak: '05:56', gunes: '07:38', ogle: '13:17', ikindi: '16:06', aksam: '18:45', yatsi: '20:20' };
const FREITAG = '2026-10-16';
const DIENSTAG = '2026-10-13';
const um = (datum: string, zeit: string, plusMin = 0) => new Date(zeitpunkt(datum, zeit).getTime() + plusMin * 60_000);
const FOLIEN = [
  { id: 'a', von: null, bis: null, wochentage: [], reihenfolge: 1 },
  { id: 'b', von: null, bis: null, wochentage: [], reihenfolge: 2 },
  { id: 'nur-freitag', von: null, bis: null, wochentage: [5], reihenfolge: 3 },
  { id: 'abgelaufen', von: null, bis: '2026-10-01T00:00:00Z', wochentage: [], reihenfolge: 0 },
];

describe('Anzeige im Gebetsraum (B-25)', () => {
  it('Ruhe vom Ezan bis Iqama + 15 Minuten, mit Iqama-Uhrzeit', () => {
    const e = { ...STANDARD_ANZEIGE, iqama: { ogle: 10 } };
    expect(anzeigeZustand(DIENSTAG, ZEITEN, FOLIEN, e, um(DIENSTAG, '13:17', 5))).toMatchObject({
      modus: 'ruhe',
      gebet: 'ogle',
      iqama: '13:27',
    });
    expect(anzeigeZustand(DIENSTAG, ZEITEN, FOLIEN, e, um(DIENSTAG, '13:17', 24)).modus).toBe('ruhe');
    expect(anzeigeZustand(DIENSTAG, ZEITEN, FOLIEN, e, um(DIENSTAG, '13:17', 26)).modus).toBe('folien');
  });

  it('ohne Iqama: 20 Minuten Ruhe, keine Iqama-Zeit', () => {
    expect(anzeigeZustand(DIENSTAG, ZEITEN, FOLIEN, STANDARD_ANZEIGE, um(DIENSTAG, '18:45', 1))).toMatchObject({
      modus: 'ruhe',
      iqama: null,
    });
    expect(anzeigeZustand(DIENSTAG, ZEITEN, FOLIEN, STANDARD_ANZEIGE, um(DIENSTAG, '18:45', 21)).modus).toBe('folien');
  });

  it('Freitagsmodus um das Freitagsgebet (Ruhe hat Vorrang)', () => {
    expect(anzeigeZustand(FREITAG, ZEITEN, FOLIEN, STANDARD_ANZEIGE, um(FREITAG, '13:17', -30)).modus).toBe('freitag');
    expect(anzeigeZustand(FREITAG, ZEITEN, FOLIEN, STANDARD_ANZEIGE, um(FREITAG, '13:17', 5)).modus).toBe('ruhe');
    expect(anzeigeZustand(FREITAG, ZEITEN, FOLIEN, STANDARD_ANZEIGE, um(FREITAG, '13:17', 45)).modus).toBe('freitag');
    expect(anzeigeZustand(FREITAG, ZEITEN, FOLIEN, STANDARD_ANZEIGE, um(FREITAG, '13:17', 61)).modus).toBe('folien');
  });

  it('Folien: Zeitplan, Wochentag, Wechsel synchron an der Uhr', () => {
    expect(aktiveFolien(FOLIEN, um(DIENSTAG, '10:00')).map((f) => f.id)).toEqual(['a', 'b']);
    expect(aktiveFolien(FOLIEN, um(FREITAG, '10:00')).map((f) => f.id)).toEqual(['a', 'b', 'nur-freitag']);
    const z1 = anzeigeZustand(
      DIENSTAG,
      ZEITEN,
      FOLIEN,
      STANDARD_ANZEIGE,
      new Date(Math.floor(um(DIENSTAG, '10:00').getTime() / 12000) * 12000),
    );
    const z2 = anzeigeZustand(
      DIENSTAG,
      ZEITEN,
      FOLIEN,
      STANDARD_ANZEIGE,
      new Date(Math.floor(um(DIENSTAG, '10:00').getTime() / 12000) * 12000 + 12000),
    );
    expect(z1.modus === 'folien' && z2.modus === 'folien' && z1.folieId !== z2.folieId).toBe(true);
  });

  it('ohne Folien: leerer Folienmodus (Uhr und Zeiten bleiben)', () => {
    expect(anzeigeZustand(DIENSTAG, ZEITEN, [], STANDARD_ANZEIGE, um(DIENSTAG, '10:00'))).toMatchObject({ modus: 'folien', folieId: null });
  });
});
