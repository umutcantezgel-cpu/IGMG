import { describe, expect, it } from 'vitest';
import { leseTanzil, TanzilFehler } from '@/lib/quran/tanzil';

/**
 * D-Q1 (ADR 0009, G-06): Der Leser übernimmt Texte unverändert und lehnt unklare Dateien ab. Die Testdatei ist
 * erkennbar fiktiv – kein Korantext im Repository.
 */
const datei = (inhalt: string) => `<?xml version="1.0" encoding="utf-8" ?>\n<!-- Testdatei, fiktiv -->\n<quran>\n${inhalt}\n</quran>`;
const GUELTIG = datei(`
  <sura index="1" name="[Testsure Eins]">
    <aya index="1" text="[Testvers 1:1] &amp; &quot;Zeichen&quot; &#x41;" />
    <aya index="2" text='  [Testvers 1:2] mit  Leerraum  ' bismillah="[Testzusatz]"/>
  </sura>
  <sura index="2" name="[Testsure Zwei]"><aya index="1" text="[Testvers 2:1]"/></sura>`);

describe('leseTanzil', () => {
  it('liest Suren und Verse unverändert (nur Entitäten aufgelöst, Leerraum bleibt)', () => {
    expect(leseTanzil(GUELTIG)).toEqual([
      {
        nr: 1,
        nameAr: '[Testsure Eins]',
        verse: [
          { nr: 1, textAr: '[Testvers 1:1] & "Zeichen" A' },
          { nr: 2, textAr: '  [Testvers 1:2] mit  Leerraum  ' },
        ],
      },
      { nr: 2, nameAr: '[Testsure Zwei]', verse: [{ nr: 1, textAr: '[Testvers 2:1]' }] },
    ]);
  });

  it.each([
    ['ohne <quran>', '<daten/>', /Kein <quran>/],
    [
      'Lücke bei Versen',
      datei('<sura index="1" name="[S]"><aya index="1" text="[a]"/><aya index="3" text="[c]"/></sura>'),
      /nicht lückenlos/,
    ],
    ['Lücke bei Suren', datei('<sura index="2" name="[S]"><aya index="1" text="[a]"/></sura>'), /Suren nicht lückenlos/],
    ['Vers ohne Text', datei('<sura index="1" name="[S]"><aya index="1"/></sura>'), /Text fehlt/],
    ['Sure ohne Name', datei('<sura index="1"><aya index="1" text="[a]"/></sura>'), /Name fehlt/],
    ['unbekannte Entität', datei('<sura index="1" name="[S]"><aya index="1" text="&unbekannt;"/></sura>'), /Entität/],
    ['keine Suren', datei(''), /Keine Suren/],
  ])('lehnt ab: %s', (_name, xml, meldung) => {
    expect(() => leseTanzil(xml)).toThrow(TanzilFehler);
    expect(() => leseTanzil(xml)).toThrow(meldung);
  });
});
