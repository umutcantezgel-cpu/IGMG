import { describe, expect, it } from 'vitest';
import { istGueltigeRegel, lokaleTeile, lokalesDatum, naechstesVorkommen, regelEnde, vorkommen, wiederholungsart } from '@/lib/termine';
import { erzeugeKalender } from '@/lib/termine/ical';

/**
 * Grenzfälle der Termine (K-09): Zeitumstellung, Ausnahmen, Begrenzung, monatlich am 1. Freitag,
 * Prüfung der Regel, laufende Termine und iCal. Die Erwartungen stammen aus den Akzeptanzkriterien;
 * die Berliner Wanduhrzeit prüft ein eigenes Intl-Orakel, unabhängig von der Implementierung.
 */

const STUNDE = 3_600_000;
const TAG = 24 * STUNDE;

/** Zeitpunkt aus Berliner Wanduhrzeit „JJJJ-MM-TTThh:mm“ (Orakel über Intl). */
function berlin(iso: string): Date {
  const [datum, zeit] = iso.split('T');
  const [j, m, tag] = datum.split('-').map(Number);
  const [h, min] = zeit.split(':').map(Number);
  for (const versatz of [1, 2]) {
    const kandidat = new Date(Date.UTC(j, m - 1, tag, h - versatz, min));
    if (wanduhr(kandidat) === `${datum} ${zeit}`) return kandidat;
  }
  throw new Error(`keine Berliner Zeit: ${iso}`);
}

/** Berliner Wanduhrzeit als „JJJJ-MM-TT hh:mm“. */
function wanduhr(zeitpunkt: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' }).format(zeitpunkt);
}

/** Regelteil BYDAY mit `anzahl` Samstagen (zum Erzeugen langer Regeln). */
function samstage(anzahl: number): string {
  return Array.from({ length: anzahl }, () => 'SA').join(',');
}

describe('Termine: Zeitumstellung (K-09)', () => {
  it('Samstag 19:00 bleibt nach der Umstellung auf Winterzeit um 19:00 Ortszeit (24.10. Sommerzeit, 31.10. Winterzeit)', () => {
    const liste = vorkommen(
      { beginn: berlin('2026-10-03T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA' },
      berlin('2026-10-24T00:00'),
      berlin('2026-10-31T23:59'),
    );
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2026-10-24 19:00', '2026-10-31 19:00']);
    for (const v of liste) expect(lokaleTeile(v.beginn)).toMatchObject({ stunde: 19, minute: 0 });
    // Sommerzeit (UTC+2): 19:00 Ortszeit = 17:00 UTC. Winterzeit (UTC+1): 19:00 Ortszeit = 18:00 UTC.
    expect(liste.map((v) => v.beginn.toISOString())).toEqual(['2026-10-24T17:00:00.000Z', '2026-10-31T18:00:00.000Z']);
    expect(liste[1].beginn.getTime() - liste[0].beginn.getTime()).toBe(7 * TAG + STUNDE);
  });

  it('Samstag 19:00 bleibt nach der Umstellung auf Sommerzeit um 19:00 Ortszeit (27.03. Winterzeit, 03.04. Sommerzeit)', () => {
    const liste = vorkommen(
      { beginn: berlin('2027-03-06T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA' },
      berlin('2027-03-27T00:00'),
      berlin('2027-04-03T23:59'),
    );
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2027-03-27 19:00', '2027-04-03 19:00']);
    for (const v of liste) expect(lokaleTeile(v.beginn)).toMatchObject({ stunde: 19, minute: 0 });
    expect(liste.map((v) => v.beginn.toISOString())).toEqual(['2027-03-27T18:00:00.000Z', '2027-04-03T17:00:00.000Z']);
    expect(liste[1].beginn.getTime() - liste[0].beginn.getTime()).toBe(7 * TAG - STUNDE);
  });
});

describe('Termine: Ausnahmen (K-09)', () => {
  const samstags = { beginn: berlin('2026-10-03T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA', ausnahmen: ['2026-10-10'] };

  it('ein Ausnahmedatum fehlt in vorkommen(), alle übrigen Vorkommen bleiben', () => {
    const liste = vorkommen(samstags, berlin('2026-10-01T00:00'), berlin('2026-10-31T23:59'));
    expect(liste.map((v) => lokalesDatum(v.beginn))).toEqual(['2026-10-03', '2026-10-17', '2026-10-24', '2026-10-31']);
  });

  it('naechstesVorkommen überspringt ein Ausnahmedatum, auch wenn „ab“ genau auf dessen Uhrzeit liegt', () => {
    expect(naechstesVorkommen(samstags, berlin('2026-10-09T12:00'))?.beginn).toEqual(berlin('2026-10-17T19:00'));
    expect(naechstesVorkommen(samstags, berlin('2026-10-10T19:00'))?.beginn).toEqual(berlin('2026-10-17T19:00'));
  });
});

describe('Termine: Begrenzung der Serie (K-09)', () => {
  it('COUNT=3 liefert genau drei Vorkommen, das Ende ist das dritte', () => {
    const regel = { beginn: berlin('2026-10-03T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA;COUNT=3' };
    const liste = vorkommen(regel, berlin('2026-01-01T00:00'), berlin('2030-12-31T23:59'));
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2026-10-03 19:00', '2026-10-10 19:00', '2026-10-17 19:00']);
    expect(regelEnde(regel)).toEqual(berlin('2026-10-17T19:00'));
  });

  it('UNTIL begrenzt die Serie, der Tag des UNTIL-Werts ist eingeschlossen', () => {
    // UNTIL ohne Zeitzonenangabe gilt als Ortszeit (Kommentar in src/lib/termine/index.ts).
    const regel = { beginn: berlin('2026-10-03T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261017T235959' };
    const liste = vorkommen(regel, berlin('2026-01-01T00:00'), berlin('2030-12-31T23:59'));
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2026-10-03 19:00', '2026-10-10 19:00', '2026-10-17 19:00']);
  });

  it('Regel ohne Ende liefert regelEnde „unbegrenzt“', () => {
    expect(regelEnde({ beginn: berlin('2026-10-03T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA' })).toBe('unbegrenzt');
  });

  it('Zeitraumgrenzen sind inklusiv, max begrenzt die Anzahl der Vorkommen', () => {
    const regel = { beginn: berlin('2026-10-03T19:00'), wiederholung: 'FREQ=WEEKLY;BYDAY=SA' };
    expect(vorkommen(regel, berlin('2026-10-17T19:00'), berlin('2026-10-17T19:00'))).toHaveLength(1);
    expect(vorkommen(regel, berlin('2026-10-01T00:00'), berlin('2026-10-31T23:59'), 2)).toHaveLength(2);
  });
});

describe('Termine: monatlich am 1. Freitag (K-09)', () => {
  const ersterFreitag = { beginn: berlin('2026-11-06T19:30'), wiederholung: 'FREQ=MONTHLY;BYDAY=1FR' };

  it('drei aufeinanderfolgende Vorkommen sind Freitage zwischen dem 1. und dem 7. des Monats', () => {
    const liste = vorkommen(ersterFreitag, berlin('2026-11-01T00:00'), berlin('2027-02-28T23:59')).slice(0, 3);
    expect(liste).toHaveLength(3);
    for (const v of liste) {
      const teile = lokaleTeile(v.beginn);
      expect(teile.wochentag).toBe(5);
      expect(teile.tag).toBeGreaterThanOrEqual(1);
      expect(teile.tag).toBeLessThanOrEqual(7);
    }
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2026-11-06 19:30', '2026-12-04 19:30', '2027-01-01 19:30']);
  });

  it('wiederholungsart erkennt „1. Freitag im Monat“', () => {
    expect(wiederholungsart(ersterFreitag)).toMatchObject({ art: 'monatlich_wochentag', position: 1, wochentag: 5 });
  });

  it('behält 19:30 Ortszeit über den Wechsel auf Sommerzeit (05.03. Winterzeit, 02.04. und 07.05. Sommerzeit)', () => {
    const regel = { beginn: berlin('2027-03-05T19:30'), wiederholung: 'FREQ=MONTHLY;BYDAY=1FR' };
    const liste = vorkommen(regel, berlin('2027-03-01T00:00'), berlin('2027-05-31T23:59'));
    expect(liste.map((v) => wanduhr(v.beginn))).toEqual(['2027-03-05 19:30', '2027-04-02 19:30', '2027-05-07 19:30']);
    expect(liste.map((v) => v.beginn.toISOString())).toEqual([
      '2027-03-05T18:30:00.000Z',
      '2027-04-02T17:30:00.000Z',
      '2027-05-07T17:30:00.000Z',
    ]);
  });
});

describe('Termine: Prüfung der Wiederholungsregel (K-09)', () => {
  it.each([
    ['leere Regel', ''],
    ['nur Leerraum', '   '],
    ['nur Präfix ohne Regelteile', 'RRULE:'],
    ['DTSTART-Teil mit Präfix', 'DTSTART:20260101T000000Z;FREQ=DAILY'],
    ['DTSTART als Schlüssel', 'FREQ=DAILY;DTSTART=20260101T000000Z'],
    ['ohne FREQ-Angabe', 'BYDAY=SA'],
    ['stündlich', 'FREQ=HOURLY'],
    ['minütlich', 'FREQ=MINUTELY'],
    ['sekündlich', 'FREQ=SECONDLY'],
    ['unbekannter Schlüssel BYHOUR', 'FREQ=WEEKLY;BYDAY=SA;BYHOUR=19'],
    ['unbekannter Schlüssel X-FOO', 'FREQ=WEEKLY;X-FOO=1'],
  ])('lehnt ab: %s', (_beschreibung, regel) => {
    expect(istGueltigeRegel(regel)).toBe(false);
  });

  it('akzeptiert „FREQ=WEEKLY;BYDAY=SA“ mit und ohne Präfix „RRULE:“', () => {
    expect(istGueltigeRegel('FREQ=WEEKLY;BYDAY=SA')).toBe(true);
    expect(istGueltigeRegel('RRULE:FREQ=WEEKLY;BYDAY=SA')).toBe(true);
  });

  it.each(['FREQ=DAILY;INTERVAL=2;COUNT=10', 'FREQ=MONTHLY;BYDAY=1FR;COUNT=3', 'FREQ=YEARLY;BYMONTH=10'])(
    'akzeptiert zulässige Frequenz: %s',
    (regel) => {
      expect(istGueltigeRegel(regel)).toBe(true);
    },
  );

  it('lehnt Regeln über 300 Zeichen ab und lässt genau 300 Zeichen zu', () => {
    const zulaessig = `FREQ=WEEKLY;INTERVAL=1;COUNT=5;BYDAY=${samstage(88)}`;
    const zuLang = `FREQ=WEEKLY;INTERVAL=1;COUNT=50;BYDAY=${samstage(88)}`;
    expect(zulaessig).toHaveLength(300);
    expect(zuLang).toHaveLength(301);
    expect(istGueltigeRegel(zulaessig)).toBe(true);
    expect(istGueltigeRegel(zuLang)).toBe(false);
  });

  it('lehnt doppelte FREQ-Teile ab, die eine stündliche oder minütliche Regel ergeben', () => {
    expect(istGueltigeRegel('FREQ=DAILY;FREQ=HOURLY')).toBe(false);
    expect(istGueltigeRegel('FREQ=WEEKLY;FREQ=MINUTELY')).toBe(false);
  });
});

describe('Termine: laufend oder beendet (K-09)', () => {
  const einmalig = { beginn: berlin('2026-10-11T10:00'), ende: berlin('2026-10-11T12:00') };

  it('ein laufender einmaliger Termin (Beginn vor „jetzt“, Ende danach) wird von naechstesVorkommen geliefert', () => {
    expect(naechstesVorkommen(einmalig, berlin('2026-10-11T11:00'))?.beginn).toEqual(berlin('2026-10-11T10:00'));
  });

  it('ein beendeter einmaliger Termin liefert null', () => {
    expect(naechstesVorkommen(einmalig, berlin('2026-10-11T12:30'))).toBeNull();
  });
});

describe('iCal: Ausnahmen und Zeitstempel (K-09)', () => {
  it('EXDATE trägt die lokale Beginn-Uhrzeit, auch wenn die Ausnahme im Winter liegt (Beginn im Sommer)', () => {
    const ics = erzeugeKalender(
      'Test',
      [
        {
          uid: 'e1',
          titel: 'Sommertermin',
          beginn: berlin('2026-07-04T19:00'),
          wiederholung: 'FREQ=WEEKLY;BYDAY=SA',
          ausnahmen: ['2026-12-05'],
        },
      ],
      'example.test',
    );
    expect(ics).toMatch(/^DTSTART;TZID=Europe\/Berlin:20260704T190000\r?$/m);
    expect(ics).toMatch(/^EXDATE;TZID=Europe\/Berlin:20261205T190000\r?$/m);
  });

  it('EXDATE trägt 19:00 auch dann, wenn der Beginn im Winter und die Ausnahme im Sommer liegt', () => {
    const ics = erzeugeKalender(
      'Test',
      [
        {
          uid: 'e2',
          titel: 'Wintertermin',
          beginn: berlin('2026-11-07T19:00'),
          wiederholung: 'FREQ=WEEKLY;BYDAY=SA',
          ausnahmen: ['2027-06-05'],
        },
      ],
      'example.test',
    );
    expect(ics).toMatch(/^EXDATE;TZID=Europe\/Berlin:20270605T190000\r?$/m);
  });

  it('DTSTAMP endet bei jedem Termin auf Z, auch ohne Aktualisierungsdatum', () => {
    const ics = erzeugeKalender(
      'Test',
      [
        { uid: 's1', titel: 'Ohne Aktualisierung', beginn: berlin('2026-07-04T19:00') },
        { uid: 's2', titel: 'Mit Aktualisierung', beginn: berlin('2026-07-04T19:00'), aktualisiertAm: new Date('2026-07-01T08:30:15Z') },
      ],
      'example.test',
    );
    expect(ics.match(/^DTSTAMP:/gm)).toHaveLength(2);
    expect(ics.match(/^DTSTAMP:\d{8}T\d{6}Z\r?$/gm)).toHaveLength(2);
    expect(ics).toMatch(/^LAST-MODIFIED:20260701T083015Z\r?$/m);
  });
});
