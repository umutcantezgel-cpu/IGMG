import { describe, expect, it } from 'vitest';
import { istGueltigeRegel, lokaleTeile, lokalesDatum, naechstesVorkommen, regelEnde, vorkommen, wiederholungsart } from '@/lib/termine';
import { erzeugeKalender } from '@/lib/termine/ical';

// Hilfsfunktion: Zeitpunkt aus Berliner Wanduhrzeit (Test-Orakel über Intl, unabhängig von der Implementierung)
function berlin(iso: string): Date {
  const [d, t] = iso.split('T');
  const [j, m, tag] = d.split('-').map(Number);
  const [h, min] = t.split(':').map(Number);
  for (const off of [1, 2]) {
    const kandidat = new Date(Date.UTC(j, m - 1, tag, h - off, min));
    const s = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' }).format(kandidat);
    if (s === `${d} ${t}`) return kandidat;
  }
  throw new Error(`keine Berliner Zeit: ${iso}`);
}

function wanduhr(z: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' }).format(z);
}

describe('Termine: Wiederholung (K-09)', () => {
  it('einmaliger Termin erscheint nur im Zeitraum', () => {
    const r = { beginn: berlin('2026-11-06T13:30'), ende: berlin('2026-11-06T14:30') };
    expect(vorkommen(r, berlin('2026-11-01T00:00'), berlin('2026-11-30T23:59'))).toHaveLength(1);
    expect(vorkommen(r, berlin('2026-12-01T00:00'), berlin('2026-12-31T23:59'))).toHaveLength(0);
  });

  it('wöchentlich samstags 14:00 behält die Uhrzeit über den Wechsel auf Winterzeit (25.10.2026)', () => {
    const r = { beginn: berlin('2026-10-17T14:00'), ende: berlin('2026-10-17T16:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA' };
    const liste = vorkommen(r, berlin('2026-10-15T00:00'), berlin('2026-11-08T00:00'));
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2026-10-17 14:00', '2026-10-24 14:00', '2026-10-31 14:00', '2026-11-07 14:00']);
    expect(liste.every((v) => v.ende && v.ende.getTime() - v.beginn.getTime() === 2 * 3_600_000)).toBe(true);
  });

  it('behält die Uhrzeit über den Wechsel auf Sommerzeit (29.03.2026)', () => {
    const r = { beginn: berlin('2026-03-20T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=FR' };
    const liste = vorkommen(r, berlin('2026-03-19T00:00'), berlin('2026-04-04T00:00'));
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2026-03-20 19:00', '2026-03-27 19:00', '2026-04-03 19:00']);
  });

  it('Ausnahmen entfallen', () => {
    const r = { beginn: berlin('2026-10-17T14:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA', ausnahmen: ['2026-10-24'] };
    const liste = vorkommen(r, berlin('2026-10-15T00:00'), berlin('2026-11-01T00:00'));
    expect(liste.map((v) => lokalesDatum(v.beginn))).toEqual(['2026-10-17', '2026-10-31']);
  });

  it('monatlich am ersten Freitag, mit COUNT begrenzt', () => {
    const r = { beginn: berlin('2026-11-06T19:30'), wiederholung: 'FREQ=MONTHLY;BYDAY=1FR;COUNT=3' };
    const liste = vorkommen(r, berlin('2026-11-01T00:00'), berlin('2027-06-01T00:00'));
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2026-11-06 19:30', '2026-12-04 19:30', '2027-01-01 19:30']);
    const ende = regelEnde(r);
    expect(ende instanceof Date && wanduhr(ende)).toBe('2027-01-01 19:30');
  });

  it('nächstes Vorkommen berücksichtigt laufende Termine', () => {
    const r = { beginn: berlin('2026-10-17T14:00'), ende: berlin('2026-10-17T16:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA' };
    expect(wanduhr(naechstesVorkommen(r, berlin('2026-10-24T15:00'))!.beginn)).toBe('2026-10-24 14:00');
    expect(wanduhr(naechstesVorkommen(r, berlin('2026-10-24T16:30'))!.beginn)).toBe('2026-10-31 14:00');
    expect(naechstesVorkommen({ beginn: berlin('2025-01-01T10:00') }, berlin('2026-01-01T00:00'))).toBeNull();
  });

  it('Regelprüfung lässt nur erlaubte Teile zu', () => {
    expect(istGueltigeRegel('FREQ=WEEKLY;BYDAY=SA')).toBe(true);
    expect(istGueltigeRegel('RRULE:FREQ=MONTHLY;BYDAY=1FR;COUNT=3')).toBe(true);
    expect(istGueltigeRegel('FREQ=HOURLY')).toBe(false);
    expect(istGueltigeRegel('DTSTART:20260101T000000Z;FREQ=DAILY')).toBe(false);
    expect(istGueltigeRegel('FREQ=WEEKLY;X-EVIL=1')).toBe(false);
    expect(istGueltigeRegel('')).toBe(false);
  });

  it('Wiederholungsart für die Anzeige', () => {
    expect(wiederholungsart({ beginn: berlin('2026-10-17T14:00') })).toEqual({ art: 'einmalig' });
    expect(wiederholungsart({ beginn: berlin('2026-10-17T14:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA' })).toEqual({
      art: 'woechentlich',
      wochentage: [6],
      intervall: 1,
    });
    expect(wiederholungsart({ beginn: berlin('2026-11-06T19:30'), wiederholung: 'FREQ=MONTHLY;BYDAY=1FR' })).toEqual({
      art: 'monatlich_wochentag',
      position: 1,
      wochentag: 5,
      intervall: 1,
    });
    expect(wiederholungsart({ beginn: berlin('2026-11-06T19:30'), wiederholung: 'FREQ=WEEKLY' })).toEqual({
      art: 'woechentlich',
      wochentage: [5],
      intervall: 1,
    });
  });

  it('lokale Teile in Europe/Berlin', () => {
    expect(lokaleTeile(new Date('2026-07-01T10:00:00Z'))).toMatchObject({ stunde: 12, minute: 0 });
    expect(lokaleTeile(new Date('2026-12-01T10:00:00Z'))).toMatchObject({ stunde: 11 });
  });
});

describe('iCal (K-09)', () => {
  it('erzeugt TZID-Zeiten, VTIMEZONE, RRULE und EXDATE', () => {
    const ics = erzeugeKalender(
      'Test',
      [
        {
          uid: 't1',
          titel: 'Testtermin',
          beginn: berlin('2026-10-17T14:00'),
          ende: berlin('2026-10-17T16:00'),
          wiederholung: 'FREQ=WEEKLY;BYDAY=SA',
          ausnahmen: ['2026-10-24'],
        },
      ],
      'example.test',
    );
    expect(ics).toContain('BEGIN:VTIMEZONE');
    expect(ics).toContain('DTSTART;TZID=Europe/Berlin:20261017T140000');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA');
    expect(ics).toContain('EXDATE;TZID=Europe/Berlin:20261024T140000');
    expect(ics).toContain('UID:t1@example.test');
  });

  it('schreibt DTSTAMP und LAST-MODIFIED in UTC (RFC 5545)', () => {
    const ics = erzeugeKalender(
      'Test',
      [{ uid: 't2', titel: 'Stempel', beginn: berlin('2026-07-01T10:00'), aktualisiertAm: new Date('2026-07-01T08:30:15Z') }],
      'example.test',
    );
    expect(ics).toMatch(/\r\nDTSTAMP:20260701T083015Z\r\n/);
    expect(ics).toMatch(/\r\nLAST-MODIFIED:20260701T083015Z\r\n/);
    expect(ics).toContain('DTSTART;TZID=Europe/Berlin:20260701T100000');
  });
});
