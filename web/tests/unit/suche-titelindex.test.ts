import { describe, expect, it } from 'vitest';
import { pruefeSuchIndex, sucheHadithNummer, sucheTitel, SUCHINDEX_VERSION, TITEL_MAX, type SuchIndex } from '@/lib/suche/titelindex';

/**
 * Titel-Index der Suche ohne Datenbank (Endprüfung Stufe C: live stand immer „Keine Treffer“): Titel-Abgleich wie die
 * Surensuche, feste Seiten aus dem Menü, Adressen freier Seiten je Sprache, Nummernsuche der Hadithe mit Teil.
 * Testdaten fiktiv; der arabische Surenname nur aus Codepunkten.
 */
const FATIHA_AR = String.fromCodePoint(0x627, 0x644, 0x641, 0x627, 0x62a, 0x62d, 0x629);

function index(teil: Partial<SuchIndex> = {}): SuchIndex {
  return {
    version: SUCHINDEX_VERSION,
    erzeugt: '2026-10-15T00:00:00.000Z',
    eintraege: [
      { art: 'nachricht', slug: 'gebetsraum-renoviert', titel: { de: 'Gebetsraum renoviert', tr: 'Namaz salonu yenilendi' } },
      { art: 'nachricht', slug: 'ramadan-programm', titel: { de: 'Ramadan: Programm' } },
      { art: 'veranstaltung', slug: 'kermes', titel: { de: 'Kermes im Hof', en: 'Fair in the courtyard' } },
      { art: 'wissen', slug: 'gebet', titel: { de: 'Das Gebet' } },
      { art: 'seite', slugs: { de: 'jugendraum', tr: 'genclik-odasi', en: null }, titel: { de: 'Jugendraum', tr: 'Gençlik odası' } },
      { art: 'sure', nr: 1, umschrift: 'Al-Faatiha', nameAr: FATIHA_AR, name: null },
      { art: 'sure', nr: 36, umschrift: 'Yaseen', nameAr: '[Name]', name: { de: '[Yasin de]' } },
      { art: 'hadithBuch', nr: 8, titel: 'Prayers (Salat)' },
    ],
    hadith: {
      buecher: [
        [
          1,
          [
            ['1', 1],
            ['2', 2],
          ],
        ],
        [4, Array.from({ length: 120 }, (_, i) => [String(135 + i), i === 5 ? 0 : i + 1] as [string, number])],
      ],
    },
    ...teil,
  };
}

describe('pruefeSuchIndex', () => {
  it('nimmt gültige Indizes, lehnt andere Versionen und kaputte Dateien ab', () => {
    expect(pruefeSuchIndex(index())).not.toBeNull();
    expect(pruefeSuchIndex({ ...index(), version: 2 })).toBeNull();
    expect(pruefeSuchIndex({ ...index(), eintraege: [{ art: 'unbekannt' }] })).toBeNull();
    expect(pruefeSuchIndex(null)).toBeNull();
    expect(pruefeSuchIndex('{}')).toBeNull();
  });
});

describe('sucheTitel', () => {
  it('findet Teilwörter in Titeln, Titel mit Anfang zuerst, ohne Groß/klein und Akzente', () => {
    const t = sucheTitel(index(), 'gebet', 'de');
    expect(t.map((x) => [x.art, x.titel])).toEqual([
      ['nachricht', 'Gebetsraum renoviert'],
      ['wissen', 'Das Gebet'],
    ]);
    expect(sucheTitel(index(), 'KERMES', 'de').map((x) => x.slug)).toEqual(['kermes']);
  });

  it('Suren wie die Surensuche: Umschrift vereinfacht, arabischer Name, Name in der Sprache', () => {
    expect(sucheTitel(index(), 'Fatiha', 'de')).toEqual([{ art: 'sure', titel: 'Al-Faatiha', nebentitel: FATIHA_AR, nr: 1 }]);
    expect(sucheTitel(index(), FATIHA_AR, 'tr').map((x) => x.nr)).toEqual([1]);
    expect(sucheTitel(index(), 'yasin', 'de').map((x) => x.nr)).toEqual([36]);
  });

  it('Titel in der Sprache der Seite, sonst Deutsch; Hadith-Bücher mit englischem Titel der Quelle', () => {
    expect(sucheTitel(index(), 'namaz', 'tr').map((x) => x.titel)).toEqual(['Namaz salonu yenilendi']);
    expect(sucheTitel(index(), 'namaz', 'de')).toEqual([]);
    expect(sucheTitel(index(), 'courtyard', 'en').map((x) => x.slug)).toEqual(['kermes']);
    expect(sucheTitel(index(), 'ramadan', 'en').map((x) => x.titel)).toEqual(['Ramadan: Programm']);
    expect(sucheTitel(index(), 'prayers', 'de')).toEqual([{ art: 'hadithBuch', titel: 'Prayers (Salat)', titelSprache: 'en', nr: 8 }]);
  });

  it('freie Seiten mit Adresse je Sprache (eigener Slug, sonst der deutsche)', () => {
    expect(sucheTitel(index(), 'jugend', 'de')).toEqual([{ art: 'seite', titel: 'Jugendraum', href: '/jugendraum' }]);
    expect(sucheTitel(index(), 'genclik', 'tr')).toEqual([{ art: 'seite', titel: 'Gençlik odası', href: '/tr/genclik-odasi' }]);
    expect(sucheTitel(index(), 'jugend', 'en')).toEqual([{ art: 'seite', titel: 'Jugendraum', href: '/en/jugendraum' }]);
  });

  it('feste Seiten aus dem Menü, doppelte Adressen nur einmal', () => {
    const feste = [
      { titel: 'Gebetszeiten', href: '/gebetszeiten' },
      { titel: 'Islamisches Wissen', href: '/islamisches-wissen' },
      { titel: 'Islamunterricht', href: '/islamisches-wissen' },
    ];
    expect(sucheTitel(index(), 'gebetszeit', 'de', feste)).toEqual([{ art: 'seite', titel: 'Gebetszeiten', href: '/gebetszeiten' }]);
    expect(sucheTitel(index(), 'islam', 'de', feste).map((x) => x.href)).toEqual(['/islamisches-wissen']);
  });

  it('kürzer als zwei Zeichen, nur Zeichen oder Ausschluss: keine Treffer; Anführungszeichen zählen nicht', () => {
    expect(sucheTitel(index(), 'a', 'de')).toEqual([]);
    expect(sucheTitel(index(), '%%%', 'de')).toEqual([]);
    expect(sucheTitel(index(), '-Gebet', 'de')).toEqual([]);
    expect(sucheTitel(index(), '"Das Gebet"', 'de').map((x) => x.slug)).toEqual(['gebet']);
  });

  it(`höchstens ${TITEL_MAX} Treffer`, () => {
    const viele = index({
      eintraege: Array.from({ length: 50 }, (_, i) => ({ art: 'nachricht' as const, slug: `n${i}`, titel: { de: `Treffer ${i}` } })),
    });
    expect(sucheTitel(viele, 'treffer', 'de')).toHaveLength(TITEL_MAX);
  });
});

describe('sucheHadithNummer', () => {
  it('„Bukhari n“ und die reine Nummer führen zu Buch, Stelle und Teil', () => {
    expect(sucheHadithNummer(index(), 'Bukhari 2')).toEqual([
      { nummer: '2', buchNr: 1, imBuchNr: 2, teil: 1, ausschnitt: { teile: [], vorn: false, hinten: false }, rang: 1 },
    ]);
    // Position 100 im Buch (101. Hadith) steht auf Teil 2
    expect(sucheHadithNummer(index(), String(135 + 100)).map((t) => [t.buchNr, t.teil])).toEqual([[4, 2]]);
    expect(sucheHadithNummer(index(), '134')).toEqual([]);
    // Ohne Stelle im Buch (0 im Index) → null wie in der Datenbank
    expect(sucheHadithNummer(index(), '140')[0]?.imBuchNr).toBeNull();
  });

  it('„Hadith n“, „Hadis n“ und „Hadith Nr. n“ wie die reine Nummer; Wörter ohne Nummer nicht', () => {
    for (const eingabe of ['Hadith 2', 'hadis 2', 'Hadith Nr. 2', 'HADITH no 2']) {
      expect(sucheHadithNummer(index(), eingabe).map((t) => [t.nummer, t.buchNr])).toEqual([['2', 1]]);
    }
    expect(sucheHadithNummer(index(), 'Hadith')).toEqual([]);
    expect(sucheHadithNummer(index(), 'Hadith über das Gebet')).toEqual([]);
  });

  it('ohne Nummer oder ohne Hadith-Daten im Index: nichts', () => {
    expect(sucheHadithNummer(index(), 'Gebet')).toEqual([]);
    expect(sucheHadithNummer(index({ hadith: null }), 'Bukhari 1')).toEqual([]);
  });
});
