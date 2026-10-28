import { describe, expect, it } from 'vitest';
import type { Locale } from '@/i18n/routing';
import { formatKennzahl, formatStand, kennzahlAusText, zahlText } from '@/lib/dachverband/kennzahl';
import { kennzahl, schema, type ZahlArt } from '@/lib/validierung/seiteninhalte/igmg';
import igmg from '../../messages/bereiche/igmg.json';

/**
 * Kennzahlen der IGMG-Seite (Plan Marktstart P1): Ausgabe je Sprache mit den Vorlagen aus messages/bereiche/igmg.json
 * (`igmg.zahlArt`), Stand als Monat oder Tag, Übernahme alter Texte in der Verwaltung und die Union im Schema (alte Texte
 * bleiben gültig, ADR 0019).
 */
const vorlage =
  (sprache: Locale) =>
  (art: ZahlArt, zahl: string): string =>
    igmg[sprache].igmg.zahlArt[art].replace('{zahl}', zahl);

describe('formatKennzahl', () => {
  it.each<[Locale, ZahlArt, number, string]>([
    ['de', 'ueber', 700, 'über 700'],
    ['de', 'rund', 2500, 'rund 2.500'],
    ['de', 'rund', 200000, 'rund 200.000'],
    ['de', 'genau', 44, '44'],
    ['tr', 'ueber', 700, '700+'],
    ['tr', 'rund', 200000, 'yaklaşık 200.000'],
    ['tr', 'genau', 112, '112'],
    ['en', 'ueber', 700, 'over 700'],
    ['en', 'rund', 20000, 'around 20,000'],
    ['en', 'genau', 2500, '2,500'],
  ])('%s %s %d → „%s“', (sprache, art, wert, erwartet) => {
    expect(formatKennzahl({ wert, art }, sprache, vorlage(sprache))).toBe(erwartet);
  });

  it('Türkisch ohne Kasusendung (keine Vokalharmonie in der Vorlage)', () => {
    expect(igmg.tr.igmg.zahlArt.ueber).toBe('{zahl}+');
    expect(formatKennzahl({ wert: 700, art: 'ueber' }, 'tr', vorlage('tr'))).not.toMatch(/’|'/);
  });

  it('alte Texte unverändert, leerer Text und null ergeben keine Kachel', () => {
    expect(formatKennzahl('518', 'de', vorlage('de'))).toBe('518');
    expect(formatKennzahl('[Zahl fehlt: Moscheen]', 'en', vorlage('en'))).toBe('[Zahl fehlt: Moscheen]');
    expect(formatKennzahl('', 'de', vorlage('de'))).toBeNull();
    expect(formatKennzahl('   ', 'de', vorlage('de'))).toBeNull();
    expect(formatKennzahl(null, 'de', vorlage('de'))).toBeNull();
    expect(formatKennzahl(undefined, 'tr', vorlage('tr'))).toBeNull();
  });

  it('Tausendertrennung je Sprache', () => {
    expect(zahlText(1234567, 'de')).toBe('1.234.567');
    expect(zahlText(1234567, 'tr')).toBe('1.234.567');
    expect(zahlText(1234567, 'en')).toBe('1,234,567');
    expect(zahlText(0, 'de')).toBe('0');
  });
});

describe('formatStand', () => {
  it('Monat JJJJ-MM und Tag JJJJ-MM-TT in der Sprache der Seite', () => {
    expect(formatStand('2026-06', 'de')).toBe('Juni 2026');
    expect(formatStand('2026-06', 'tr')).toBe('Haziran 2026');
    expect(formatStand('2026-06', 'en')).toBe('June 2026');
    expect(formatStand('2026-10-27', 'de')).toBe('27. Oktober 2026');
    expect(formatStand('2026-01-01', 'en')).toBe('1 January 2026');
  });

  it('leer oder unlesbar: keine Standzeile', () => {
    expect(formatStand('', 'de')).toBeNull();
    expect(formatStand('Juni 2026', 'de')).toBeNull();
    expect(formatStand('2026-6', 'de')).toBeNull();
  });
});

describe('kennzahlAusText (Übernahme alter Texte in der Verwaltung)', () => {
  it.each<[string, ReturnType<typeof kennzahlAusText>]>([
    ['518', { wert: 518, art: 'genau' }],
    ['2.500', { wert: 2500, art: 'genau' }],
    ['2,500', { wert: 2500, art: 'genau' }],
    ['350.000', { wert: 350000, art: 'genau' }],
    ['über 700', { wert: 700, art: 'ueber' }],
    ['Über 700', { wert: 700, art: 'ueber' }],
    ['700+', { wert: 700, art: 'ueber' }],
    ['over 700', { wert: 700, art: 'ueber' }],
    ['rund 200.000', { wert: 200000, art: 'rund' }],
    ['ca. 20.000', { wert: 20000, art: 'rund' }],
    ['knapp 2500', { wert: 2500, art: 'rund' }],
    ['yaklaşık 200.000', { wert: 200000, art: 'rund' }],
    ['  44  ', { wert: 44, art: 'genau' }],
  ])('„%s“', (text, erwartet) => {
    expect(kennzahlAusText(text)).toEqual(erwartet);
  });

  it('Platzhalter, freie Texte und Dezimalzahlen bleiben Text', () => {
    expect(kennzahlAusText('[Zahl fehlt: Moscheen]')).toBe('[Zahl fehlt: Moscheen]');
    expect(kennzahlAusText('Hunderttausende')).toBe('Hunderttausende');
    expect(kennzahlAusText('1,5 Mio.')).toBe('1,5 Mio.');
    expect(kennzahlAusText('12.34')).toBe('12.34');
    expect(kennzahlAusText('')).toBe('');
  });

  it('jede Übernahme ist eine gültige Kennzahl', () => {
    for (const text of ['518', 'über 700', 'rund 200.000', '[Zahl fehlt: Moscheen]', 'frei']) {
      expect(kennzahl.safeParse(kennzahlAusText(text)).success).toBe(true);
    }
  });
});

describe('Schema: Kennzahl als Union (alter Text | Wert mit Art)', () => {
  it('alter Text, neuer Wert mit Art und Zusatz', () => {
    expect(kennzahl.parse('518')).toBe('518');
    expect(kennzahl.parse({ wert: 700, art: 'ueber' })).toEqual({ wert: 700, art: 'ueber' });
    expect(kennzahl.parse({ wert: 44 })).toEqual({ wert: 44, art: 'genau' });
    expect(kennzahl.parse({ wert: 44, zusatz: { de: 'davon 3 im Aufbau' } })).toMatchObject({ zusatz: { de: 'davon 3 im Aufbau' } });
  });

  it('negativ, gebrochen, unbekannte Art oder zu langer Text: ungültig', () => {
    expect(kennzahl.safeParse({ wert: -1 }).success).toBe(false);
    expect(kennzahl.safeParse({ wert: 2.5 }).success).toBe(false);
    expect(kennzahl.safeParse({ wert: 1, art: 'etwa' }).success).toBe(false);
    expect(kennzahl.safeParse('x'.repeat(41)).success).toBe(false);
  });

  it('Standardwerte: bestehende Kennzahlen als Platzhalter, neue Felder leer (ausgeblendet)', () => {
    const z = schema.parse({}).zahlen;
    expect(z.moscheen).toBe('[Zahl fehlt: Moscheen]');
    expect(z.zweigstellen).toBe('[Zahl fehlt: Zweigstellen]');
    expect(z.menschenErreicht).toBe('[Zahl fehlt: Menschen erreicht]');
    expect([z.regionen, z.mitglieder, z.mitwirkende, z.region, z.quelle]).toEqual([null, null, null, null, null]);
    expect(z.stand).toBe('');
  });

  it('Stand der Zahlen nur als Monat JJJJ-MM oder leer', () => {
    const mit = (stand: string) => schema.safeParse({ zahlen: { stand } }).success;
    expect(mit('2026-06')).toBe(true);
    expect(mit('')).toBe(true);
    expect(mit('2026-13')).toBe(false);
    expect(mit('Juni 2026')).toBe(false);
  });
});
