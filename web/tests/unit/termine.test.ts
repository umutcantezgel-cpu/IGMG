import { describe, expect, it } from 'vitest';
import { istGueltigeRegel, lokaleTeile, lokalesDatum, naechstesVorkommen, regelEnde, vorkommen, wiederholungsart } from '@/lib/termine';
import { erzeugeKalender, type IcalTermin } from '@/lib/termine/ical';

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

/**
 * Erzeugt den Kalender unter einer anderen Prozesszeitzone (Node übernimmt `process.env.TZ` zur Laufzeit) und
 * stellt die ursprüngliche danach wieder her. Die lokale Stunde zeigt, dass die Zeitzone wirklich gewechselt hat.
 */
function kalenderUnterZeitzone(zone: string, termine: readonly IcalTermin[]): { ics: string; lokaleStunde: number } {
  const urspruenglich = process.env.TZ;
  process.env.TZ = zone;
  try {
    return {
      ics: erzeugeKalender('Zeitzone', termine, 'example.test'),
      lokaleStunde: new Date('2026-07-04T17:00:00Z').getHours(),
    };
  } finally {
    if (urspruenglich === undefined) delete process.env.TZ;
    else process.env.TZ = urspruenglich;
  }
}

describe('iCal: Ausgabe unabhängig von der Zeitzone des Prozesses (Vercel und docker-compose laufen in UTC)', () => {
  const termine: IcalTermin[] = [
    {
      uid: 'sommer',
      titel: 'Sommertermin',
      beginn: berlin('2026-07-04T19:00'),
      ende: berlin('2026-07-04T21:00'),
      wiederholung: 'FREQ=WEEKLY;BYDAY=SA',
      ausnahmen: ['2026-07-11'],
      aktualisiertAm: new Date('2026-07-01T08:30:15Z'),
    },
    { uid: 'winter', titel: 'Wintertermin', beginn: berlin('2026-11-07T19:00'), ende: berlin('2026-11-07T21:00') },
    { uid: 'fruehling', titel: 'Umstellung im Frühjahr', beginn: berlin('2026-03-29T03:30') },
    {
      uid: 'serie',
      titel: 'Sonntags über beide Umstellungen',
      beginn: berlin('2026-03-22T10:00'),
      wiederholung: 'FREQ=WEEKLY;BYDAY=SU;UNTIL=20261101T235959',
    },
    {
      uid: 'stempel-frueh',
      titel: 'Stempel in der doppelten Stunde (erste)',
      beginn: berlin('2026-10-25T10:00'),
      aktualisiertAm: new Date('2026-10-25T00:30:00Z'),
    },
    {
      uid: 'stempel-spaet',
      titel: 'Stempel in der doppelten Stunde (zweite)',
      beginn: berlin('2026-10-25T10:00'),
      aktualisiertAm: new Date('2026-10-25T01:30:00Z'),
    },
  ];

  it('ergibt in jeder Zeitzone dieselbe Datei mit den festen Berliner Uhrzeiten und UTC-Stempeln', () => {
    const zonen = ['UTC', 'Europe/Berlin', 'America/New_York', 'Asia/Tokyo'];
    const ergebnisse = zonen.map((zone) => kalenderUnterZeitzone(zone, termine));
    expect(new Set(ergebnisse.map((e) => e.lokaleStunde)).size).toBe(zonen.length);

    const [erste, ...weitere] = ergebnisse;
    for (const e of weitere) expect(e.ics).toBe(erste.ics);

    const ics = erste.ics;
    // Sommer: 19:00 MESZ, Ausnahme am 11.07. mit gleicher Uhrzeit, Stempel aus der Aktualisierung
    expect(ics).toMatch(/^DTSTART;TZID=Europe\/Berlin:20260704T190000\r?$/m);
    expect(ics).toMatch(/^DTEND;TZID=Europe\/Berlin:20260704T210000\r?$/m);
    expect(ics).toMatch(/^EXDATE;TZID=Europe\/Berlin:20260711T190000\r?$/m);
    expect(ics).toMatch(/^DTSTAMP:20260701T083015Z\r?$/m);
    expect(ics).toMatch(/^LAST-MODIFIED:20260701T083015Z\r?$/m);
    // Winter: 19:00 MEZ = 18:00 UTC, ohne Aktualisierung gilt der Beginn als Stempel
    expect(ics).toMatch(/^DTSTART;TZID=Europe\/Berlin:20261107T190000\r?$/m);
    expect(ics).toMatch(/^DTSTAMP:20261107T180000Z\r?$/m);
    // Umstellungstag 29.03.2026 (Sommerzeit ab 02:00 MEZ): 03:30 MESZ = 01:30 UTC
    expect(ics).toMatch(/^DTSTART;TZID=Europe\/Berlin:20260329T033000\r?$/m);
    expect(ics).toMatch(/^DTSTAMP:20260329T013000Z\r?$/m);
    // Serie über beide Umstellungen behält 10:00, UNTIL 01.11. 23:59:59 MEZ = 22:59:59 UTC
    expect(ics).toMatch(/^DTSTART;TZID=Europe\/Berlin:20260322T100000\r?$/m);
    expect(ics).toMatch(/^RRULE:FREQ=WEEKLY;BYDAY=SU;UNTIL=20261101T225959Z\r?$/m);
    // 25.10.: Ortszeit 02:30 kommt zweimal vor (00:30 UTC = MESZ, 01:30 UTC = MEZ). Stempel dürfen nicht
    // über die Ortszeit umgerechnet werden, sonst springt der erste um eine Stunde.
    expect(ics).toMatch(/^DTSTAMP:20261025T003000Z\r?$/m);
    expect(ics).toMatch(/^LAST-MODIFIED:20261025T003000Z\r?$/m);
    expect(ics).toMatch(/^DTSTAMP:20261025T013000Z\r?$/m);
    expect(ics).toMatch(/^LAST-MODIFIED:20261025T013000Z\r?$/m);
    // VTIMEZONE steht genau einmal vor dem ersten Ereignis
    expect(ics.match(/^BEGIN:VTIMEZONE\r?$/gm)).toHaveLength(1);
    expect(ics.indexOf('BEGIN:VTIMEZONE')).toBeLessThan(ics.indexOf('BEGIN:VEVENT'));
  });

  it('ein Feed ohne Termine bleibt gültig und trägt die Zeitzone vor END:VCALENDAR', () => {
    const ics = erzeugeKalender('Leer', [], 'example.test');
    expect(ics).toMatch(/^TIMEZONE-ID:Europe\/Berlin\r?$/m);
    expect(ics.indexOf('BEGIN:VTIMEZONE')).toBeLessThan(ics.indexOf('END:VCALENDAR'));
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
  });

  it('stellt die Prozesszeitzone nach dem Test wieder her', () => {
    const vorher = process.env.TZ;
    kalenderUnterZeitzone('Asia/Tokyo', termine);
    expect(process.env.TZ).toBe(vorher);
  });
});

describe('iCal: ganztägige Termine (DATE-Werte, DTEND exklusiv)', () => {
  const STUNDE = 3_600_000;

  it('einzelner ganztägiger Termin: DTSTART und DTEND als Datum, DTEND am Folgetag', () => {
    const ics = erzeugeKalender(
      'Test',
      [{ uid: 'g1', titel: 'Ganztägig', beginn: berlin('2026-10-11T00:00'), ganztaegig: true }],
      'example.test',
    );
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261011\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261012\r?$/m);
    expect(ics).not.toMatch(/^DTSTART;TZID=/m);
    expect(ics).not.toMatch(/^DTEND;TZID=/m);
  });

  it('Gegenprobe: ohne Kennzeichen bleibt der Termin bei Uhrzeit und TZID', () => {
    const ics = erzeugeKalender('Test', [{ uid: 'g0', titel: 'Mit Uhrzeit', beginn: berlin('2026-10-11T00:00') }], 'example.test');
    expect(ics).toMatch(/^DTSTART;TZID=Europe\/Berlin:20261011T000000\r?$/m);
    expect(ics).not.toMatch(/^DTSTART;VALUE=DATE:/m);
  });

  it('mehrtägiger ganztägiger Termin endet am Tagesbeginn nach dem letzten Tag', () => {
    const ics = erzeugeKalender(
      'Test',
      [{ uid: 'g2', titel: 'Drei Tage', beginn: berlin('2026-10-16T00:00'), ende: berlin('2026-10-19T00:00'), ganztaegig: true }],
      'example.test',
    );
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261016\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261019\r?$/m);
  });

  it('ein Ende bis zwölf Stunden neben Mitternacht zählt als Tagesbeginn (Zeitumstellung am 25.10.)', () => {
    const mitternacht = berlin('2026-10-26T00:00').getTime();
    for (const ende of [new Date(mitternacht + STUNDE), new Date(mitternacht - STUNDE)]) {
      const ics = erzeugeKalender(
        'Test',
        [{ uid: 'g3', titel: 'Über die Umstellung', beginn: berlin('2026-10-23T00:00'), ende, ganztaegig: true }],
        'example.test',
      );
      expect(ics).toMatch(/^DTEND;VALUE=DATE:20261026\r?$/m);
    }
  });

  it('ein Ende nicht nach dem Beginn ergibt genau einen Tag', () => {
    const ics = erzeugeKalender(
      'Test',
      [{ uid: 'g4', titel: 'Ohne Dauer', beginn: berlin('2026-10-11T00:00'), ende: berlin('2026-10-11T00:00'), ganztaegig: true }],
      'example.test',
    );
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261011\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261012\r?$/m);
  });

  it('ganztägige Serie: DTSTART ohne Uhrzeit, UNTIL und EXDATE als Datum', () => {
    const ics = erzeugeKalender(
      'Test',
      [
        {
          uid: 'gs',
          titel: 'Samstags ganztägig',
          beginn: berlin('2026-10-17T00:00'),
          wiederholung: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219T235959',
          ausnahmen: ['2026-10-24'],
          ganztaegig: true,
        },
      ],
      'example.test',
    );
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261017\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261018\r?$/m);
    expect(ics).toMatch(/^RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219\r?$/m);
    expect(ics).toMatch(/^EXDATE;VALUE=DATE:20261024\r?$/m);
    expect(ics).not.toMatch(/EXDATE;TZID=/);
    expect(ics).not.toMatch(/UNTIL=\d{8}T/);
  });

  it('UNTIL mit UTC-Zeitpunkt wird auf das Ortszeit-Datum dieses Zeitpunkts gebracht', () => {
    for (const [until, erwartet] of [
      ['20261017T215959Z', '20261017'], // 23:59:59 MESZ am 17.10.
      ['20261017T220000Z', '20261018'], // 00:00 MESZ am 18.10.
    ]) {
      const ics = erzeugeKalender(
        'Test',
        [
          {
            uid: 'gu',
            titel: 'Serie',
            beginn: berlin('2026-10-17T00:00'),
            wiederholung: `FREQ=WEEKLY;BYDAY=SA;UNTIL=${until}`,
            ganztaegig: true,
          },
        ],
        'example.test',
      );
      expect(ics).toMatch(new RegExp(`^RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=${erwartet}\\r?$`, 'm'));
    }
  });
});

describe('iCal: ganztägige Termine unabhängig von der Zeitzone des Prozesses', () => {
  const termine: IcalTermin[] = [
    {
      uid: 'ganz',
      titel: 'Ganztägig',
      beginn: berlin('2026-10-11T00:00'),
      ganztaegig: true,
      aktualisiertAm: new Date('2026-10-01T08:00:00Z'),
    },
    {
      uid: 'mehr',
      titel: 'Drei Tage',
      beginn: berlin('2026-10-23T00:00'),
      ende: berlin('2026-10-26T00:00'),
      ganztaegig: true,
    },
    {
      uid: 'serie',
      titel: 'Samstags ganztägig',
      beginn: berlin('2026-10-17T00:00'),
      wiederholung: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219T235959',
      ausnahmen: ['2026-10-24'],
      ganztaegig: true,
    },
  ];

  it('ergibt in jeder Zeitzone dieselbe Datei mit Datumswerten (auch in UTC und Pacific/Auckland)', () => {
    const zonen = ['UTC', 'Europe/Berlin', 'America/New_York', 'Asia/Tokyo', 'Pacific/Auckland'];
    const ergebnisse = zonen.map((zone) => kalenderUnterZeitzone(zone, termine));
    expect(new Set(ergebnisse.map((e) => e.lokaleStunde)).size).toBe(zonen.length);

    const [erste, ...weitere] = ergebnisse;
    for (const e of weitere) expect(e.ics).toBe(erste.ics);

    const ics = erste.ics;
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261011\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261012\r?$/m);
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261023\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261026\r?$/m);
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261017\r?$/m);
    expect(ics).toMatch(/^RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219\r?$/m);
    expect(ics).toMatch(/^EXDATE;VALUE=DATE:20261024\r?$/m);
    expect(ics).toMatch(/^DTSTAMP:20261001T080000Z\r?$/m);
  });
});
