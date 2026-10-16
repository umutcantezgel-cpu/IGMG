import { describe, expect, it } from 'vitest';
import { chatAbstand, uebersichtAbstand } from '@/lib/echtzeit/takt';
import {
  ABRUF_RUECKBLICK_MS,
  heuteGesendet,
  KEIN_NEUES,
  seitAusAbruf,
  summe,
  themenAus,
  waehleThemen,
  zeilenDerZusammenfassung,
  zeilenText,
  zusammenfassungFaellig,
} from '@/lib/push/rueckfall';

/**
 * Rückfall für Benachrichtigungen (ADR 0034 Nr. 6, F-38): Logik der täglichen Mail-Zusammenfassung und des Hinweises in
 * Mein Bereich – Themenwahl, Tagesgrenze (Berliner Zeit), Zeilen nur mit Bereich und Anzahl, Zählbeginn des Abrufs, Takt.
 */
describe('Themenwahl', () => {
  it('nimmt nur bekannte und erlaubte Themen, ohne Doppelte, in fester Reihenfolge – nie „gebet“', () => {
    expect(waehleThemen(['unterricht', 'chat', 'chat', 'gebet', 'x', 7, null], ['ankuendigung', 'chat', 'unterricht'])).toEqual([
      'chat',
      'unterricht',
    ]);
    expect(waehleThemen(['ankuendigung', 'chat', 'unterricht'], ['ankuendigung'])).toEqual(['ankuendigung']);
    expect(waehleThemen([], ['ankuendigung', 'chat'])).toEqual([]);
  });

  it('liest gespeicherte Themen ohne unbekannte Werte', () => {
    expect(themenAus(['gebet', 'unterricht', 'ankuendigung'])).toEqual(['ankuendigung', 'unterricht']);
  });
});

describe('Tagesgrenze (Europe/Berlin)', () => {
  it('ein Versand am selben Berliner Tag zählt, am Vortag nicht', () => {
    const jetzt = new Date('2026-10-15T02:00:00Z'); // 04:00 MESZ
    expect(heuteGesendet(null, jetzt)).toBe(false);
    expect(heuteGesendet(new Date('2026-10-15T00:30:00Z'), jetzt)).toBe(true); // 02:30 MESZ, derselbe Tag
    expect(heuteGesendet(new Date('2026-10-14T21:59:00Z'), jetzt)).toBe(false); // 23:59 MESZ am Vortag
    expect(heuteGesendet(new Date('2026-10-14T22:00:00Z'), jetzt)).toBe(true); // 00:00 MESZ
  });

  it('Winterzeit: Mitternacht liegt bei 23:00 UTC', () => {
    const jetzt = new Date('2026-12-01T02:00:00Z');
    expect(heuteGesendet(new Date('2026-11-30T22:59:00Z'), jetzt)).toBe(false);
    expect(heuteGesendet(new Date('2026-11-30T23:00:00Z'), jetzt)).toBe(true);
  });
});

describe('Zeilen und Fälligkeit', () => {
  const zahl = { ankuendigung: 1, chat: 2, unterricht: 0 };

  it('Zeilen nur für gewählte Themen mit Neuem, erst Gruppen, dann Moschee', () => {
    expect(zeilenDerZusammenfassung(zahl)).toEqual([
      { thema: 'chat', anzahl: 2 },
      { thema: 'ankuendigung', anzahl: 1 },
    ]);
    expect(zeilenDerZusammenfassung(zahl, ['unterricht', 'ankuendigung'])).toEqual([{ thema: 'ankuendigung', anzahl: 1 }]);
    expect(zeilenDerZusammenfassung({ ankuendigung: -1, chat: 1.5, unterricht: Number.NaN })).toEqual([]);
  });

  it('fällig nur mit Themen, mit Neuem und nicht schon heute gesendet', () => {
    const jetzt = new Date('2026-10-15T02:00:00Z');
    expect(zusammenfassungFaellig({ themen: ['chat'], zahl, letzterVersand: null, jetzt })).toBe(true);
    expect(zusammenfassungFaellig({ themen: ['unterricht'], zahl, letzterVersand: null, jetzt })).toBe(false);
    expect(zusammenfassungFaellig({ themen: [], zahl, letzterVersand: null, jetzt })).toBe(false);
    expect(zusammenfassungFaellig({ themen: ['chat'], zahl: KEIN_NEUES, letzterVersand: null, jetzt })).toBe(false);
    expect(zusammenfassungFaellig({ themen: ['chat'], zahl, letzterVersand: new Date('2026-10-15T01:00:00Z'), jetzt })).toBe(false);
    expect(zusammenfassungFaellig({ themen: ['chat'], zahl, letzterVersand: new Date('2026-10-14T01:00:00Z'), jetzt })).toBe(true);
  });

  it('Text einer Zeile: „eins“ bei genau 1, sonst „mehr“ mit Anzahl – nur Zahl, kein Name', () => {
    const v = { eins: 'In einer Ihrer Gruppen gibt es neue Nachrichten.', mehr: 'In {anzahl} Ihrer Gruppen gibt es neue Nachrichten.' };
    expect(zeilenText(v, 1)).toBe(v.eins);
    expect(zeilenText(v, 2)).toBe('In 2 Ihrer Gruppen gibt es neue Nachrichten.');
    expect(summe(zahl)).toBe(3);
    expect(summe(KEIN_NEUES)).toBe(0);
  });
});

describe('Zählbeginn des Abrufs', () => {
  const jetzt = Date.UTC(2026, 9, 15, 12);

  it('ohne oder mit ungültigem Wert: nur der Stand (null)', () => {
    for (const roh of [null, '', 'abc', '-5', '1e9', '12.5', '9'.repeat(16)]) expect(seitAusAbruf(roh, jetzt)).toBeNull();
  });

  it('nie in der Zukunft, höchstens einen Tag zurück', () => {
    expect(seitAusAbruf(String(jetzt - 60_000), jetzt)).toBe(jetzt - 60_000);
    expect(seitAusAbruf(String(jetzt + 60_000), jetzt)).toBe(jetzt);
    expect(seitAusAbruf('0', jetzt)).toBe(jetzt - ABRUF_RUECKBLICK_MS);
  });
});

describe('Abruf-Takt (ADR 0027)', () => {
  it('Chat: 4 s nach Aktivität, 15 s, nach 5 Minuten 30 s (unverändert)', () => {
    expect(chatAbstand(0)).toBe(4_000);
    expect(chatAbstand(59_999)).toBe(4_000);
    expect(chatAbstand(60_000)).toBe(15_000);
    expect(chatAbstand(299_999)).toBe(15_000);
    expect(chatAbstand(300_000)).toBe(30_000);
  });

  it('Hinweis in Mein Bereich: ruhiger – 30 s, nach 5 Minuten ohne Neues 60 s', () => {
    expect(uebersichtAbstand(0)).toBe(30_000);
    expect(uebersichtAbstand(299_999)).toBe(30_000);
    expect(uebersichtAbstand(300_000)).toBe(60_000);
  });
});
