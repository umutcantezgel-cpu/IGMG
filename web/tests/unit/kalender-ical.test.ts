import { describe, expect, it } from 'vitest';
import { besondereTageIcal } from '@/lib/kalender/ical';

/** iCal der besonderen Tage (AUFTRAG 3.10): ganztägig, Dauer als DTEND (exklusiv), Hinweis „vorläufig“ für berechnete Tage. */
const TEXTE = { vorlaeufigTitel: 'vorläufig', vorlaeufigBeschreibung: 'Vorläufig – berechnet, Bestätigung durch den Imam folgt.' };

function ereignisse(ics: string): string[] {
  return ics.split('BEGIN:VEVENT').slice(1);
}

/** Zeilen entfalten (RFC 5545 3.1: Fortsetzungszeilen beginnen mit einem Leerzeichen). */
const entfaltet = (ics: string) => ics.replace(/\r\n /g, '');

describe('besondereTageIcal', () => {
  const ics = entfaltet(
    besondereTageIcal(
      'Besondere Tage',
      [
        {
          uid: 'v-mevlid-2026-08-24',
          datum: '2026-08-24',
          tage: 1,
          titel: 'Mevlid Kandili',
          vorlaeufig: true,
          url: 'https://example.test/kalender',
        },
        { uid: 't-abc', datum: '2027-03-09', tage: 3, titel: 'Ramazan Bayramı', beschreibung: 'Festgebet [Uhrzeit]', vorlaeufig: false },
      ],
      'example.test',
      TEXTE,
    ),
  );

  it('Kalender mit Namen und zwei ganztägigen Ereignissen (DATE-Werte, keine Uhrzeit)', () => {
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('X-WR-CALNAME:Besondere Tage');
    const [eins, zwei] = ereignisse(ics);
    expect(eins).toContain('DTSTART;VALUE=DATE:20260824');
    expect(eins).toContain('DTEND;VALUE=DATE:20260825');
    expect(zwei).toContain('DTSTART;VALUE=DATE:20270309');
    // Bayram über drei Tage: Ende exklusiv am 12.
    expect(zwei).toContain('DTEND;VALUE=DATE:20270312');
  });

  it('vorläufige Tage tragen den Hinweis in Titel und Beschreibung; bestätigte nicht', () => {
    const [eins, zwei] = ereignisse(ics);
    expect(eins).toContain('SUMMARY:Mevlid Kandili (vorläufig)');
    expect(eins).toContain('DESCRIPTION:Vorläufig – berechnet\\, Bestätigung durch den Imam folgt.');
    expect(eins).toContain('UID:besonderer-tag-v-mevlid-2026-08-24@example.test');
    expect(eins).toContain('URL;VALUE=URI:https://example.test/kalender');
    expect(zwei).toContain('SUMMARY:Ramazan Bayramı');
    expect(zwei).not.toContain('vorläufig');
    expect(zwei).toContain('DESCRIPTION:Festgebet [Uhrzeit]');
  });

  it('leer: gültiger Kalender ohne Ereignis', () => {
    const leer = besondereTageIcal('Leer', [], 'example.test', TEXTE);
    expect(leer).toContain('END:VCALENDAR');
    expect(ereignisse(leer)).toHaveLength(0);
  });
});
