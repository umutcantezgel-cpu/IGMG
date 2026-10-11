import { afterEach, describe, expect, it, vi } from 'vitest';
import { kalenderAntwort } from '@/server/ical/veranstaltungen';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';

// Der Feed braucht aus next-intl nur Übersetzungen und die Sprache; die Laufzeit von Next fehlt im Test.
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (schluessel: string) => schluessel,
  getLocale: async () => 'de',
}));

/** Veranstaltung wie sie die Query liefert (Zeiten als ISO-Text). Vorgabe: 11.10.2026 ganztägig, 00:00 Ortszeit. */
function veranstaltung(teil: Partial<VeranstaltungsDaten> = {}): VeranstaltungsDaten {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    slug: 'ganztag',
    titel: { de: 'Ganztägiges Seminar' },
    kurztext: null,
    beschreibung: null,
    kategorie: 'bildung',
    organisation: null,
    zielgruppe: null,
    teilnehmerHinweis: null,
    ort: null,
    beginn: '2026-10-10T22:00:00.000Z',
    ende: null,
    ganztaegig: true,
    wiederholung: { art: 'einmalig' },
    regel: null,
    ausnahmen: [],
    ersterBeginn: '2026-10-10T22:00:00.000Z',
    anmeldungAktiv: false,
    plaetze: null,
    kosten: 'kostenlos',
    empfohlen: false,
    istBeispiel: false,
    vergangen: false,
    aktualisiertAm: '2026-10-01T08:00:00.000Z',
    bild: null,
    ...teil,
  };
}

async function feed(liste: VeranstaltungsDaten[]): Promise<string> {
  const antwort = await kalenderAntwort('Test', liste, 'de', 'testdatei');
  return antwort.text();
}

describe('iCal-Feed: ganztägige Veranstaltungen (Feld ganztaegig bis zur Ausgabe)', () => {
  const urspruenglich = process.env.TZ;
  afterEach(() => {
    if (urspruenglich === undefined) delete process.env.TZ;
    else process.env.TZ = urspruenglich;
  });

  it('einzelner ganztägiger Termin: DATE-Werte, DTEND am Folgetag, keine Uhrzeit', async () => {
    const ics = await feed([veranstaltung()]);
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261011\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261012\r?$/m);
    expect(ics).not.toMatch(/^DTSTART;TZID=/m);
  });

  it('Termin mit Uhrzeit bleibt bei Uhrzeit (Gegenprobe)', async () => {
    const ics = await feed([
      veranstaltung({
        ganztaegig: false,
        beginn: '2026-10-11T08:00:00.000Z',
        ende: '2026-10-11T10:00:00.000Z',
        ersterBeginn: '2026-10-11T08:00:00.000Z',
      }),
    ]);
    expect(ics).toMatch(/^DTSTART;TZID=Europe\/Berlin:20261011T100000\r?$/m);
    expect(ics).not.toMatch(/^DTSTART;VALUE=DATE:/m);
  });

  it('mehrtägiger ganztägiger Termin endet am Tagesbeginn nach dem letzten Tag', async () => {
    const ics = await feed([veranstaltung({ ende: '2026-10-18T22:00:00.000Z' })]);
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261011\r?$/m);
    expect(ics).toMatch(/^DTEND;VALUE=DATE:20261019\r?$/m);
  });

  it('wiederkehrende ganztägige Serie: EXDATE und UNTIL als Datum', async () => {
    // 17.10.2026 ist ein Samstag (Beginn 00:00 Ortszeit = 22:00 UTC am Vortag)
    const ics = await feed([
      veranstaltung({
        beginn: '2026-10-16T22:00:00.000Z',
        ersterBeginn: '2026-10-16T22:00:00.000Z',
        regel: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219T235959',
        wiederholung: { art: 'woechentlich', wochentage: [6], intervall: 1 },
        ausnahmen: ['2026-10-24'],
      }),
    ]);
    expect(ics).toMatch(/^DTSTART;VALUE=DATE:20261017\r?$/m);
    expect(ics).toMatch(/^RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219\r?$/m);
    expect(ics).toMatch(/^EXDATE;VALUE=DATE:20261024\r?$/m);
  });

  it('die Ausgabe ist in jeder Prozesszeitzone gleich', async () => {
    const liste = [veranstaltung({ ende: '2026-10-18T22:00:00.000Z' })];
    const ausgaben: string[] = [];
    for (const zone of ['UTC', 'Pacific/Auckland', 'America/New_York']) {
      process.env.TZ = zone;
      ausgaben.push(await feed(liste));
    }
    expect(ausgaben[1]).toBe(ausgaben[0]);
    expect(ausgaben[2]).toBe(ausgaben[0]);
    expect(ausgaben[0]).toMatch(/^DTSTART;VALUE=DATE:20261011\r?$/m);
    expect(ausgaben[0]).toMatch(/^DTEND;VALUE=DATE:20261019\r?$/m);
  });
});
