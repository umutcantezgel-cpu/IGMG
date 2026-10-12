import { describe, expect, it } from 'vitest';
import { berlinTeile, berlinerDatum, uhrzeitBerlin, zeitpunkt } from '@/lib/gebetszeiten/naechstes';

/**
 * Ortszeit Europe/Berlin ohne Intl (H-L01): muss für jeden Zeitpunkt dasselbe liefern wie Intl mit timeZone
 * „Europe/Berlin“ – besonders an den Umstellungen (letzter Sonntag im März/Oktober, 01:00 UTC).
 */
const referenz = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  hourCycle: 'h23',
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});
const TAGE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function erwartet(ms: number) {
  const t = Object.fromEntries(referenz.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
  return { j: +t.year, m: +t.month, t: +t.day, h: +t.hour, min: +t.minute, s: +t.second, wochentag: TAGE.indexOf(t.weekday) };
}

describe('Ortszeit Europe/Berlin ohne Intl', () => {
  it('stimmt an allen Umstellungen 1996–2040 (je ±3 h im 15-min-Takt) mit Intl überein', () => {
    const abweichungen: string[] = [];
    for (let jahr = 1996; jahr <= 2040; jahr++) {
      for (const monat of [2, 9]) {
        const letzterTag = new Date(Date.UTC(jahr, monat + 1, 0));
        const umstellung = Date.UTC(jahr, monat, letzterTag.getUTCDate() - letzterTag.getUTCDay(), 1);
        for (let ms = umstellung - 3 * 3_600_000; ms <= umstellung + 3 * 3_600_000; ms += 900_000) {
          const a = berlinTeile(new Date(ms));
          const e = erwartet(ms);
          if (JSON.stringify(a) !== JSON.stringify(e)) abweichungen.push(new Date(ms).toISOString());
        }
      }
    }
    expect(abweichungen).toEqual([]);
  });

  it('stimmt über 2024–2030 in Stichproben alle 7 h 13 min mit Intl überein (Jahreswechsel eingeschlossen)', () => {
    const abweichungen: string[] = [];
    for (let ms = Date.UTC(2024, 0, 1); ms < Date.UTC(2031, 0, 1); ms += 26_000_000) {
      if (JSON.stringify(berlinTeile(new Date(ms))) !== JSON.stringify(erwartet(ms))) abweichungen.push(new Date(ms).toISOString());
    }
    expect(abweichungen).toEqual([]);
  });

  it('Uhrzeit und Datum an den Umstellungen 2026', () => {
    expect(uhrzeitBerlin(new Date('2026-03-29T00:59:00Z'))).toBe('01:59');
    expect(uhrzeitBerlin(new Date('2026-03-29T01:00:00Z'))).toBe('03:00');
    expect(uhrzeitBerlin(new Date('2026-10-25T00:59:00Z'))).toBe('02:59');
    expect(uhrzeitBerlin(new Date('2026-10-25T01:00:00Z'))).toBe('02:00');
    expect(berlinerDatum(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
    expect(zeitpunkt('2026-07-01', '13:30').toISOString()).toBe('2026-07-01T11:30:00.000Z');
    expect(zeitpunkt('2026-01-15', '13:30').toISOString()).toBe('2026-01-15T12:30:00.000Z');
  });
});
