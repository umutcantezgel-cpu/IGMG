import { describe, expect, it } from 'vitest';
import { hijriDatum, hijriText, istRamadan } from '@/lib/gebetszeiten/hijri';

/**
 * Akzeptanzkriterium K-08 (6): Hidschri- und Ramadan-Erkennung an den Monatsgrenzen. Maßstab ist ausschließlich Intl mit
 * dem Kalender islamic-umalqura, hier über die Kalenderoption statt über die Sprachkennung der Implementierung.
 * Daten werden nicht aus dem Gedächtnis übernommen: Ramadan 1447 und 1448 folgen dem Intl-Kalender (M-066 bleibt offen).
 */

const orakel = new Intl.DateTimeFormat('en-US', {
  calendar: 'islamic-umalqura',
  timeZone: 'UTC',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

/** Hidschri-Datum laut Intl-Orakel für einen Kalendertag „JJJJ-MM-TT“. */
function orakelDatum(datum: string) {
  const [j, m, t] = datum.split('-').map(Number);
  const teile = Object.fromEntries(orakel.formatToParts(new Date(Date.UTC(j, m - 1, t, 12))).map((p) => [p.type, p.value]));
  return { tag: Number(teile.day), monat: Number(teile.month), jahr: Number(String(teile.year).replace(/\D/g, '')) };
}

/** Alle Kalendertage von `von` bis `bis`, beide eingeschlossen, als „JJJJ-MM-TT“. */
function tage(von: string, bis: string): string[] {
  const liste: string[] = [];
  for (let ms = Date.parse(`${von}T00:00:00Z`); ms <= Date.parse(`${bis}T00:00:00Z`); ms += 86_400_000) {
    liste.push(new Date(ms).toISOString().slice(0, 10));
  }
  return liste;
}

describe('Ramadan 1447: Ende und Übergang zum Schawwal (K-08 6)', () => {
  it('der Ramadan 1447 reicht vom 18.02. bis einschließlich 19.03.2026, also 30 Tage', () => {
    const ramadan = tage('2026-02-18', '2026-03-19');
    expect(ramadan).toHaveLength(30);
    for (const d of ramadan) expect(istRamadan(d), d).toBe(true);
    expect(hijriDatum('2026-03-19')).toEqual({ tag: 30, monat: 9, jahr: 1447 });
  });

  it('am 20.03.2026 beginnt der Schawwal 1447: nicht mehr Ramadan', () => {
    expect(hijriDatum('2026-03-20')).toEqual({ tag: 1, monat: 10, jahr: 1447 });
    expect(istRamadan('2026-03-20')).toBe(false);
  });
});

describe('Ramadan 1448: Anfang und Ende laut Intl (K-08 6)', () => {
  it('der Ramadan 1448 beginnt am 08.02.2027 und endet am 08.03.2027 (29 Tage)', () => {
    expect(hijriDatum('2027-02-08')).toEqual({ tag: 1, monat: 9, jahr: 1448 });
    expect(hijriDatum('2027-03-08')).toEqual({ tag: 29, monat: 9, jahr: 1448 });
    const ramadan = tage('2027-02-08', '2027-03-08');
    expect(ramadan).toHaveLength(29);
    for (const d of ramadan) expect(istRamadan(d), d).toBe(true);
  });

  it('am 07.02.2027 (Schaʻban) und am 09.03.2027 (Schawwal) ist kein Ramadan', () => {
    expect(istRamadan('2027-02-07')).toBe(false);
    expect(istRamadan('2027-03-09')).toBe(false);
  });
});

describe('Monatsgrenzen über drei Jahre (K-08 6)', () => {
  it('stimmt an jedem Tag von 2025 bis 2027 mit dem Intl-Orakel überein; Ramadan ist genau der Monat 9', () => {
    for (const d of tage('2025-01-01', '2027-12-31')) {
      const soll = orakelDatum(d);
      expect(hijriDatum(d), d).toEqual(soll);
      expect(istRamadan(d), d).toBe(soll.monat === 9);
    }
  });

  it('der Hidschri-Tag springt nur von 29 oder 30 auf 1, dann laufen Monat und Jahr weiter', () => {
    const folge = tage('2025-01-01', '2027-12-31').map((d) => hijriDatum(d));
    for (let i = 1; i < folge.length; i++) {
      const vor = folge[i - 1];
      const jetzt = folge[i];
      if (jetzt.tag === 1) {
        expect([29, 30], `vor dem ${i}. Tag`).toContain(vor.tag);
        expect(jetzt.monat).toBe(vor.monat === 12 ? 1 : vor.monat + 1);
        expect(jetzt.jahr).toBe(vor.monat === 12 ? vor.jahr + 1 : vor.jahr);
      } else {
        expect(jetzt).toEqual({ tag: vor.tag + 1, monat: vor.monat, jahr: vor.jahr });
      }
    }
  });

  it('Muharram 1448 beginnt am 16.06.2026, der Vortag ist der 29. Dhū l-Hiddscha 1447 (kein Ramadan)', () => {
    expect(hijriDatum('2026-06-15')).toEqual({ tag: 29, monat: 12, jahr: 1447 });
    expect(hijriDatum('2026-06-16')).toEqual({ tag: 1, monat: 1, jahr: 1448 });
    expect(istRamadan('2026-06-16')).toBe(false);
  });
});

describe('Hidschri-Text an der Grenze (K-08 6)', () => {
  it('der erste Ramadan 1447 heißt auf Deutsch „1. Ramadan 1447“ (Intl)', () => {
    expect(hijriText('2026-02-18', 'de')).toMatch(/^1\. Ramadan 1447/);
  });
});
