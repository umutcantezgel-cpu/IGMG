import { describe, expect, it } from 'vitest';
import bereich from '../../../messages/bereiche/gebetszeiten.json';
import { datumMitJahr, fuelle, restzeitText, tagKurz } from '@/components/website/gebetszeiten/zeiten';

/**
 * Akzeptanzkriterium K-08 (5) Formatierung: Restzeit als Stunden und Minuten (auch mit 0 Minuten), Wochentagskürzel je Sprache.
 * Die Vorlagen stammen aus messages/bereiche/gebetszeiten.json (Schlüssel restStunden, restMinuten). Die erwarteten Texte
 * stehen in diesem Test; das Deutsche folgt dem Format des Designs („Di., 23. Jan. 2024“, Blatt S02 DC:23).
 */

const MINUTE = 60_000;
const STUNDE = 3_600_000;

const vorlagen = {
  de: bereich.de.gebetszeiten,
  tr: bereich.tr.gebetszeiten,
  en: bereich.en.gebetszeiten,
};
const restText = (ms: number, sprache: 'de' | 'tr' | 'en') =>
  restzeitText(ms, { stunden: vorlagen[sprache].restStunden, minuten: vorlagen[sprache].restMinuten });

describe('Restzeit-Text in drei Sprachen (K-08 5)', () => {
  it.each([
    ['2 Std. 15 Min.', 2 * STUNDE + 15 * MINUTE, { de: '2 Std. 15 Min.', tr: '2 sa. 15 dk.', en: '2 h 15 min' }],
    ['2 Std. 0 Min. (volle Stunden)', 2 * STUNDE, { de: '2 Std. 0 Min.', tr: '2 sa. 0 dk.', en: '2 h 0 min' }],
    ['15 Min. (ohne Stunden)', 15 * MINUTE, { de: '15 Min.', tr: '15 dk.', en: '15 min' }],
    ['0 Min. (Gebet erreicht)', 0, { de: '0 Min.', tr: '0 dk.', en: '0 min' }],
  ])('Restzeit %s in drei Sprachen', (_bezeichnung, ms, erwartet) => {
    expect(restText(ms, 'de')).toBe(erwartet.de);
    expect(restText(ms, 'tr')).toBe(erwartet.tr);
    expect(restText(ms, 'en')).toBe(erwartet.en);
  });

  it('ohne volle Stunde steht nur die Minutenvorlage, mit Stunden immer auch die Minuten (0 Min. bleibt sichtbar)', () => {
    expect(restText(15 * MINUTE, 'de')).not.toContain('Std.');
    expect(restText(2 * STUNDE, 'de')).toMatch(/ 0 Min\.$/);
  });

  it('Restzeit wird auf volle Minuten aufgerundet: 59 Min. 30 Sek. ergeben 1 Std. 0 Min., 1 ms ergibt 1 Min.', () => {
    expect(restText(59 * MINUTE + 30_000, 'de')).toBe('1 Std. 0 Min.');
    expect(restText(1, 'de')).toBe('1 Min.');
  });

  it('eine Restzeit unter null wird als 0 Min. angezeigt', () => {
    expect(restText(-5_000, 'de')).toBe('0 Min.');
  });
});

describe('Wochentagskürzel je Sprache im Datum (K-08 5)', () => {
  const woche = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'];
  const kuerzel = (datum: string, sprache: 'de' | 'tr' | 'en') => datumMitJahr(datum, sprache).split(/[ ,]+/).filter(Boolean);

  it('Deutsch: Mo. bis So., Format wie im Design', () => {
    expect(datumMitJahr('2026-10-11', 'de')).toBe('So., 11. Okt. 2026');
    expect(woche.map((d) => kuerzel(d, 'de')[0])).toEqual(['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.']);
  });

  it('Türkisch: Pzt bis Paz, am Ende des Datums', () => {
    expect(woche.map((d) => kuerzel(d, 'tr').slice(-1)[0])).toEqual(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']);
  });

  it('Englisch: Mon bis Sun', () => {
    expect(woche.map((d) => kuerzel(d, 'en')[0])).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('die Sprachen vermischen sich nicht: kein englischer Wochentag im deutschen Datum und umgekehrt', () => {
    expect(datumMitJahr('2026-10-11', 'de')).not.toMatch(/Sun|Mon|Sat/);
    expect(datumMitJahr('2026-10-11', 'en')).not.toMatch(/So\.|Sa\./);
  });
});

describe('Kalendertag als TT.MM (tagKurz, Blatt S02 DC:104)', () => {
  it.each([
    ['2026-10-11', '11.10'],
    ['2026-03-01', '01.03'],
    ['2026-12-31', '31.12'],
    ['2028-02-29', '29.02'],
  ])('%s wird %s', (datum, erwartet) => {
    expect(tagKurz(datum)).toBe(erwartet);
  });

  it('enthält kein Jahr', () => {
    expect(tagKurz('2026-10-11')).not.toMatch(/2026/);
  });
});

describe('Platzhalter füllen (fuelle, K-08 5)', () => {
  it('ersetzt jedes Vorkommen eines Platzhalters', () => {
    expect(fuelle('{a} und {a}', { a: 'x' })).toBe('x und x');
  });

  it('lässt einen Platzhalter ohne Wert stehen, statt ihn stillschweigend zu leeren', () => {
    expect(fuelle('{a} {b}', { a: 'x' })).toBe('x {b}');
  });

  it('setzt den Gebetsnamen in den Titel „Nächstes Gebet“ ein', () => {
    expect(fuelle(vorlagen.de.naechstesTitel, { name: 'Ikindi' })).toBe('Nächstes Gebet: Ikindi');
    expect(fuelle(vorlagen.en.naechstesTitel, { name: 'Asr' })).toBe('Next prayer: Asr');
  });
});
