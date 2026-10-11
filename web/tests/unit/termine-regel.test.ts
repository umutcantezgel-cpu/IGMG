import { describe, expect, it } from 'vitest';
import { lokaleTeile, vorkommen } from '@/lib/termine';
import { erzeugeKalender } from '@/lib/termine/ical';
import { baueRegel, zerlegeRegel, type WiederholungEingabe } from '@/lib/termine/regel';
import { ausFormular, slugAus, veranstaltungSchema, zeitpunkt, zuDatensatz } from '@/lib/validierung/veranstaltung';

/** D05: Wiederholung als Formularstruktur ⇄ RRULE, UNTIL-Zeitzone, Formular → Datensatz (K-09, ADR 0005). */
const basis: WiederholungEingabe = { art: 'einmalig', intervall: 1, wochentage: [], position: 1, ende: 'nie' };
const samstag19 = zeitpunkt('2026-10-17', '19:00');

describe('baueRegel / zerlegeRegel', () => {
  it.each([
    [{ ...basis, art: 'taeglich' }, 'FREQ=DAILY'],
    [{ ...basis, art: 'woechentlich', wochentage: ['SA', 'MO'] }, 'FREQ=WEEKLY;BYDAY=MO,SA'],
    [{ ...basis, art: 'woechentlich', intervall: 2 }, 'FREQ=WEEKLY;INTERVAL=2;BYDAY=SA'],
    [{ ...basis, art: 'monatlich_tag' }, 'FREQ=MONTHLY;BYMONTHDAY=17'],
    [{ ...basis, art: 'monatlich_wochentag', position: 3 }, 'FREQ=MONTHLY;BYDAY=3SA'],
    [{ ...basis, art: 'jaehrlich', ende: 'anzahl', anzahl: 5 }, 'FREQ=YEARLY;COUNT=5'],
    [{ ...basis, art: 'woechentlich', ende: 'datum', endeDatum: '2026-12-19' }, 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261219T235959'],
  ] as [WiederholungEingabe, string][])('%o → %s und zurück', (eingabe, regel) => {
    expect(baueRegel(eingabe, samstag19)).toBe(regel);
    const zurueck = zerlegeRegel(regel, samstag19);
    expect(zurueck.art).toBe(eingabe.art);
    expect(baueRegel(zurueck, samstag19)).toBe(regel);
  });

  it('einmalig liefert null, unbekannte Regeln werden „eigene“ mit Roh-Regel', () => {
    expect(baueRegel(basis, samstag19)).toBeNull();
    expect(zerlegeRegel('FREQ=MONTHLY;BYDAY=SA;BYSETPOS=-1', samstag19)).toMatchObject({
      art: 'eigene',
      roh: 'FREQ=MONTHLY;BYDAY=SA;BYSETPOS=-1',
    });
  });
});

describe('UNTIL und Zeitzone', () => {
  it('schwebendes UNTIL schließt den Tag ein, UTC-UNTIL wird umgerechnet', () => {
    const von = new Date('2026-10-01T00:00:00Z');
    const bis = new Date('2026-12-31T00:00:00Z');
    const schwebend = vorkommen({ beginn: samstag19, wiederholung: 'FREQ=WEEKLY;UNTIL=20261031T235959' }, von, bis);
    expect(schwebend.map((v) => lokaleTeile(v.beginn).tag)).toEqual([17, 24, 31]);
    // 19:00 MESZ am 17.10. = 17:00 UTC → genau dieser Termin ist der letzte
    const utc = vorkommen({ beginn: samstag19, wiederholung: 'FREQ=WEEKLY;UNTIL=20261017T170000Z' }, von, bis);
    expect(utc).toHaveLength(1);
  });

  it('iCal gibt UNTIL bei TZID-Beginn in UTC aus (RFC 5545 3.3.10)', () => {
    const ics = erzeugeKalender(
      'Test',
      [{ uid: 'u', titel: 'T', beginn: samstag19, wiederholung: 'FREQ=WEEKLY;UNTIL=20261219T235959' }],
      'example.test',
    );
    expect(ics).toContain('RRULE:FREQ=WEEKLY;UNTIL=20261219T225959Z');
  });
});

describe('Formular → Datensatz', () => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({
    titelDe: 'Testtermin Eins',
    kategorie: 'gemeinde',
    datum: '2026-11-07',
    beginnZeit: '19:00',
    endeZeit: '21:00',
    whArt: 'woechentlich',
    whIntervall: '1',
    whPosition: '1',
    whEnde: 'nie',
    programmDe: '19:00 Beginn\n20:00 Vortrag',
    programmTr: '19:00 Başlangıç\n20:00 Konferans',
    hinweiseDe: 'Hinweis eins',
    schlagwoerterDe: 'Eins, Zwei',
    status: 'veroeffentlicht',
  }))
    fd.append(k, v);
  fd.append('whTage', 'SA');
  fd.append('ausnahmen', '2026-11-14');

  it('baut Zeiten in Europe/Berlin, Regel, Ausnahmen und mehrsprachige Listen', () => {
    const e = veranstaltungSchema.parse(ausFormular(fd));
    const d = zuDatensatz(e);
    expect(d.beginn.toISOString()).toBe('2026-11-07T18:00:00.000Z');
    expect(d.ende?.toISOString()).toBe('2026-11-07T20:00:00.000Z');
    expect(d.wiederholung).toBe('FREQ=WEEKLY;BYDAY=SA');
    expect(d.ausnahmen).toEqual(['2026-11-14']);
    expect(d.programm).toEqual([
      { zeit: '19:00', text: { de: 'Beginn', tr: 'Başlangıç' } },
      { zeit: '20:00', text: { de: 'Vortrag', tr: 'Konferans' } },
    ]);
    expect(d.schlagwoerter).toEqual([{ de: 'Eins' }, { de: 'Zwei' }]);
    expect(d.organisation).toBeNull();
  });

  it('lehnt Endzeit vor Startzeit, falsche Programmzeilen und ungleiche Übersetzungslisten ab', () => {
    const fehler = (aenderung: Record<string, string>) => {
      const roh = { ...ausFormular(fd), ...aenderung };
      const r = veranstaltungSchema.safeParse(roh);
      return r.success ? [] : r.error.issues.map((i) => `${String(i.path[0])}:${i.message}`);
    };
    expect(fehler({ endeZeit: '18:00' })).toContain('endeZeit:endeVorBeginn');
    expect(fehler({ programmDe: 'ohne Uhrzeit' })).toContain('programmDe:programm');
    expect(fehler({ hinweiseTr: 'bir\niki' })).toContain('hinweiseTr:uebersetzungZeilen');
    expect(fehler({ titelDe: '' })).toContain('titelDe:pflicht');
  });

  it('bildet lesbare Slugs aus deutschen und türkischen Titeln', () => {
    expect(slugAus('Frauen-Kochkurs: Gemüse & Süßes')).toBe('frauen-kochkurs-gemuese-suesses');
    expect(slugAus('Gençlik Teşkilatı Buluşması')).toBe('genclik-teskilati-bulusmasi');
  });
});
