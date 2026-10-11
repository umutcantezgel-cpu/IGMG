import { describe, expect, it } from 'vitest';
import { datumKurz, datumLang, uhrzeit, zeitspanne } from '@/lib/i18n/format';
import { bereinige, text, waehle } from '@/lib/i18n/inhalt';

describe('Mehrsprachige Inhalte (ADR 0002)', () => {
  it('wählt die Sprache und fällt sichtbar auf Deutsch zurück', () => {
    const f = { de: 'Gebetszeiten', tr: 'Namaz Vakitleri' };
    expect(waehle(f, 'tr')).toEqual({ text: 'Namaz Vakitleri', sprache: 'tr', rueckfall: false });
    expect(waehle(f, 'en')).toEqual({ text: 'Gebetszeiten', sprache: 'de', rueckfall: true });
    expect(waehle(f, 'de')).toEqual({ text: 'Gebetszeiten', sprache: 'de', rueckfall: false });
    expect(waehle({ de: 'x', en: '   ' }, 'en').rueckfall).toBe(true);
    expect(text(null, 'tr')).toBe('');
  });
  it('bereinigt leere Fassungen', () => {
    expect(bereinige({ de: ' a ', tr: '', en: ' b' })).toEqual({ de: 'a', en: 'b' });
  });
});

describe('Datumsformate (Laufbuch D-10)', () => {
  const d = new Date('2025-08-02T16:30:00Z'); // Sa., 2. Aug. 2025, 18:30 MESZ
  it('Deutsch wie im Design', () => {
    expect(datumKurz(d, 'de')).toBe('Sa., 2. Aug.');
    expect(datumLang(new Date('2025-07-28T10:00:00Z'), 'de')).toBe('Mo., 28. Juli 2025');
    expect(uhrzeit(d, 'de')).toBe('18:30 Uhr');
    expect(zeitspanne(new Date('2025-08-02T12:00:00Z'), new Date('2025-08-02T14:00:00Z'), 'de')).toBe('14:00–16:00 Uhr');
  });
  it('Türkisch und Englisch im 24-Stunden-Format ohne „Uhr“', () => {
    expect(uhrzeit(d, 'tr')).toBe('18:30');
    expect(uhrzeit(d, 'en')).toBe('18:30');
    expect(zeitspanne(new Date('2025-08-02T12:00:00Z'), null, 'en')).toBe('14:00');
  });
  it('Winterzeit', () => {
    expect(uhrzeit(new Date('2025-12-01T17:00:00Z'), 'de')).toBe('18:00 Uhr');
  });
});
