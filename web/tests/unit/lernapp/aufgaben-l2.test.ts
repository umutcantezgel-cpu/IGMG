import { describe, expect, it } from 'vitest';
import { bewerte } from '@/lib/lernapp/aufgaben/bewerte';
import { BildWortSchema, bildWortReihenfolge } from '@/lib/lernapp/aufgaben/bild_wort';
import { bewerteFormen, pruefeZellen, zellenKopf } from '@/lib/lernapp/aufgaben/formen';
import { beschreibe, bewerteHarakat, zeichenFolge, zeichenSchluessel } from '@/lib/lernapp/aufgaben/harakat';
import { HOER_TYPEN, hatAudio, istHoerTyp } from '@/lib/lernapp/aufgaben/hoeren_waehlen';
import { bewerteLuecke, satzMit } from '@/lib/lernapp/aufgaben/luecke';
import { AufgabeSchema, type AufgabeVon, IMPLEMENTIERT, istImplementiert } from '@/lib/lernapp/aufgaben/schema';
import { bereiteLexikon } from '@/lib/lernapp/abgleich';
import { einfuegen, loesche, SONDERZEICHEN } from '@/components/lernapp/tastatur/einfuegen';
import { ar } from './hilfen/buckwalter';

/**
 * Übungstypen aus L2-01 (PLAN §4): Zod-Nutzlast je Typ, reine Bewertung (Abgleich aus `abgleich/`, `harakat` im strengen
 * Modus) und Hilfen. Neutrale Alltagswörter; Arabisch nur über Codepunkt-Escapes (Buckwalter-Hilfe).
 */

const T = (text: string, sprache: 'de' | 'tr' | 'ar' = 'tr') => ({ text, sprache });
const AUDIO = { buendel: '/lern-app/audio/tr/tr.a1.e01-0123456789abcdef.lpa', versatz: 100, laenge: 50, dauerMs: 400 };

const BILD: AufgabeVon<'bild_wort'> = {
  typ: 'bild_wort',
  schluessel: 'tr.a1.e01.l03.a01',
  karten: ['tr-aus-de:tr.a1.e01.w003'],
  anweisung: 'waehleWort',
  bild: {
    symbol: 'haus',
    elemente: [
      { art: 'path', d: 'M3 10 12 3l9 7v11H3z' },
      { art: 'circle', cx: 12, cy: 14, r: 2 },
    ],
  },
  optionen: [T('ev'), T('kitap'), T('su')],
  richtig: 0,
  beschreibung: T('Haus', 'de'),
};
const FREI: AufgabeVon<'frei'> = {
  typ: 'frei',
  schluessel: 'tr.a1.e01.l03.a02',
  karten: ['tr-aus-de:tr.a1.e01.w002'],
  vorgabe: T('Brot', 'de'),
  sprache: 'tr',
  loesungen: ['ekmek'],
};
const HW: AufgabeVon<'hoeren_waehlen'> = {
  typ: 'hoeren_waehlen',
  schluessel: 'tr.a1.e01.l03.a04',
  anweisung: 'waehleBedeutung',
  hoeren: { ...T('su'), audio: AUDIO },
  optionen: [T('Wasser', 'de'), T('Brot', 'de'), T('Haus', 'de')],
  richtig: 0,
};
const HS: AufgabeVon<'hoeren_schreiben'> = {
  typ: 'hoeren_schreiben',
  schluessel: 'tr.a1.e01.l03.a05',
  hoeren: { ...T('kitap'), audio: AUDIO },
  sprache: 'tr',
  loesungen: ['kitap'],
};
const MP: AufgabeVon<'minimalpaare'> = {
  typ: 'minimalpaare',
  schluessel: 'tr.a1.e01.l03.a06',
  hoeren: { ...T('üç'), audio: AUDIO },
  optionen: [T('üç'), T('uç')],
  richtig: 0,
};
const LW: AufgabeVon<'luecke'> = {
  typ: 'luecke',
  schluessel: 'tr.a1.e01.l03.a07',
  vor: 'Su ',
  nach: '.',
  sprache: 'tr',
  optionen: ['içiyorum', 'içiyorsun', 'içiyor'],
  loesungen: ['içiyorum'],
  hilfe: T('Ich trinke Wasser.', 'de'),
};
const LF: AufgabeVon<'luecke'> = { ...LW, schluessel: 'tr.a1.e01.l03.a08', optionen: undefined };
const SB: AufgabeVon<'satzbau'> = {
  typ: 'satzbau',
  schluessel: 'de.a1.e01.l03.a08',
  vorgabe: T('Ev büyük.'),
  sprache: 'de',
  kacheln: ['Das', 'Haus', 'ist', 'groß'],
  loesungen: ['Das Haus ist groß.', 'Groß ist das Haus.'],
};
const FO: AufgabeVon<'formen'> = {
  typ: 'formen',
  schluessel: 'de.a1.e01.l03.a09',
  sprache: 'de',
  titel: T('trinken', 'de'),
  zeilen: ['ich', 'du', 'er'],
  spalten: ['Präsens'],
  zellen: [
    { zeile: 0, spalte: 0, loesungen: ['trinke'], vorgabe: true },
    { zeile: 1, spalte: 0, loesungen: ['trinkst'] },
    { zeile: 2, spalte: 0, loesungen: ['trinkt'] },
  ],
};
const HA: AufgabeVon<'harakat'> = {
  typ: 'harakat',
  schluessel: 'ar.a1.e01.l03.a10',
  karten: ['ar-aus-de:ar.a1.e01.w004'],
  anweisung: 'waehleVokalisierung',
  vorgabe: T('Buch', 'de'),
  optionen: [T(ar('kitaAb'), 'ar'), T(ar('kataAb'), 'ar'), T(ar('kitiAb'), 'ar')],
  richtig: 0,
};

describe('Schemas der Typen aus L2-01', () => {
  it('alle neun sind implementiert und mit Beispielen gültig', () => {
    expect(IMPLEMENTIERT).toEqual(
      expect.arrayContaining([
        'bild_wort',
        'frei',
        'hoeren_waehlen',
        'hoeren_schreiben',
        'minimalpaare',
        'luecke',
        'satzbau',
        'formen',
        'harakat',
      ]),
    );
    for (const a of [BILD, FREI, HW, HS, MP, LW, LF, SB, FO, HA]) {
      expect(istImplementiert(a.typ)).toBe(true);
      const p = AufgabeSchema.safeParse(a);
      expect(p.success, `${a.typ}: ${p.success ? '' : JSON.stringify(p.error.issues)}`).toBe(true);
    }
    // Hörübung ohne Clip ist gültig („Audio folgt“)
    expect(AufgabeSchema.safeParse({ ...HW, hoeren: T('su') }).success).toBe(true);
    expect(hatAudio(HW)).toBe(true);
    expect(hatAudio({ hoeren: T('su') })).toBe(false);
    expect([...HOER_TYPEN]).toEqual(['hoeren_waehlen', 'hoeren_schreiben', 'minimalpaare']);
    expect(istHoerTyp('frei')).toBe(false);
  });

  it.each([
    ['Bild mit Element, das es nicht gibt', { ...BILD, bild: { symbol: 'haus', elemente: [{ art: 'image', href: 'x' }] } }],
    ['Bild mit Text in den Pfaddaten', { ...BILD, bild: { symbol: 'haus', elemente: [{ art: 'path', d: '<script>' }] } }],
    ['Bild mit Zahl außerhalb des Rasters', { ...BILD, bild: { symbol: 'haus', elemente: [{ art: 'circle', cx: 1e9, cy: 1, r: 1 }] } }],
    ['Bild mit großem Motivnamen', { ...BILD, bild: { ...BILD.bild, symbol: 'Haus' } }],
    ['Bild: richtig außerhalb', { ...BILD, richtig: 3 }],
    ['Frei ohne Lösung', { ...FREI, loesungen: [] }],
    ['Hören: Optionen doppelt', { ...HW, optionen: [T('Wasser', 'de'), T('wasser', 'de')] }],
    ['Minimalpaar: Gehörtes ist nicht die richtige Option', { ...MP, hoeren: { ...T('uç'), audio: AUDIO } }],
    ['Minimalpaar: Option in anderer Sprache', { ...MP, optionen: [T('üç'), T('uc', 'de')] }],
    ['Lücke ohne Satz', { ...LW, vor: ' ', nach: '' }],
    ['Lücke: keine Option passt', { ...LW, optionen: ['içiyorsun', 'içiyor'] }],
    ['Lücke: zwei Optionen passen', { ...LW, optionen: ['içiyorum', 'İçiyorum'] }],
    ['Satzbau: Fassung mit anderem Wort', { ...SB, loesungen: ['Das Haus ist klein.'] }],
    ['Satzbau: Ablenker-Kachel', { ...SB, kacheln: [...SB.kacheln, 'klein'] }],
    ['Formen: Zelle außerhalb', { ...FO, zellen: [...FO.zellen, { zeile: 5, spalte: 0, loesungen: ['x'] }] }],
    ['Formen: Zelle doppelt', { ...FO, zellen: [...FO.zellen, { zeile: 1, spalte: 0, loesungen: ['x'] }] }],
    ['Formen: alles vorgegeben', { ...FO, zellen: FO.zellen.map((c) => ({ ...c, vorgabe: true })) }],
    ['Harakat: anderes Gerüst', { ...HA, optionen: [T(ar('kitaAb'), 'ar'), T(ar('kutub'), 'ar')] }],
    ['Harakat: gleiche Vokalisierung', { ...HA, optionen: [T(ar('kitaAb'), 'ar'), T(ar('kitaAb') + ' ', 'ar')] }],
    ['Harakat: Option nicht arabisch', { ...HA, optionen: [T(ar('kitaAb'), 'ar'), T('kitap')] }],
  ])('weist ab: %s', (_n, aufgabe) => {
    expect(AufgabeSchema.safeParse(aufgabe).success).toBe(false);
  });
});

describe('Bewertung', () => {
  it('bild_wort, hoeren_waehlen, minimalpaare: Index, Karten mit Urteil', () => {
    expect(bewerte(BILD, { typ: 'bild_wort', wahl: 0 })).toEqual({
      urteil: 'richtig',
      hinweise: [],
      loesung: 'ev',
      karten: [{ karte: 'tr-aus-de:tr.a1.e01.w003', urteil: 'richtig' }],
    });
    expect(bewerte(BILD, { typ: 'bild_wort', wahl: 2 })).toMatchObject({ urteil: 'falsch', loesung: 'ev' });
    expect(bewerte(HW, { typ: 'hoeren_waehlen', wahl: 0 }).urteil).toBe('richtig');
    expect(bewerte(HW, { typ: 'hoeren_waehlen', wahl: 1 })).toMatchObject({ urteil: 'falsch', loesung: 'Wasser' });
    expect(bewerte(MP, { typ: 'minimalpaare', wahl: 1 })).toMatchObject({ urteil: 'falsch', loesung: 'üç' });
    expect(bildWortReihenfolge(BILD)).not.toEqual([0, 1, 2]);
  });

  it('frei: toleranter Abgleich (Sonderzeichen-Hinweis, Tippfehler, Lexikonschutz)', () => {
    expect(bewerte(FREI, { typ: 'frei', text: 'Ekmek' }).urteil).toBe('richtig');
    expect(bewerte(FREI, { typ: 'frei', text: 'ekmekk' })).toMatchObject({ urteil: 'tippfehler', hinweise: ['tippfehler'] });
    const kurs = { ...FREI, loesungen: ['içiyorum'] };
    expect(bewerte(kurs, { typ: 'frei', text: 'iciyorum' })).toMatchObject({ urteil: 'tippfehler', hinweise: ['sonderzeichen'] });
    // ein anderes gültiges Kurswort ist kein Tippfehler
    const lexikon = bereiteLexikon(['ekmek', 'emek'], 'tr');
    expect(bewerte(FREI, { typ: 'frei', text: 'emek' }, { lexikon }).urteil).toBe('falsch');
    expect(bewerte(FREI, { typ: 'frei', text: '   ' })).toMatchObject({ urteil: 'falsch', hinweise: ['leer'] });
    // überlange Eingaben werden gekürzt, nicht ausgewertet
    expect(bewerte(FREI, { typ: 'frei', text: 'ekmek' + 'x'.repeat(5000) }).urteil).toBe('falsch');
  });

  it('frei und hoeren_schreiben auf Arabisch: ohne Harakat, Alif-Formen still, Taa marbuta mit Hinweis', () => {
    const a: AufgabeVon<'frei'> = { ...FREI, sprache: 'ar', loesungen: [ar('xubozN')] };
    expect(bewerte(a, { typ: 'frei', text: ar('xbz') }).urteil).toBe('richtig');
    const h: AufgabeVon<'hoeren_schreiben'> = {
      ...HS,
      sprache: 'ar',
      hoeren: { ...T(ar('>a$orabu'), 'ar'), audio: AUDIO },
      loesungen: [ar('>a$orabu')],
    };
    expect(bewerte(h, { typ: 'hoeren_schreiben', text: ar('A$rb') }).urteil).toBe('richtig');
    const m: AufgabeVon<'frei'> = { ...FREI, sprache: 'ar', loesungen: [ar('madorasap')] };
    expect(bewerte(m, { typ: 'frei', text: ar('mdrsh') })).toMatchObject({ urteil: 'tippfehler', hinweise: ['taMarbuta'] });
  });

  it('luecke: Option ohne Tippfehler-Toleranz, Freitext tolerant; Lösung ist der ganze Satz', () => {
    expect(bewerteLuecke(LW, { typ: 'luecke', wahl: 0 })).toMatchObject({ urteil: 'richtig', loesung: 'Su içiyorum.' });
    expect(bewerteLuecke(LW, { typ: 'luecke', wahl: 2 })).toMatchObject({ urteil: 'falsch', loesung: 'Su içiyorum.' });
    expect(bewerteLuecke(LF, { typ: 'luecke', text: 'içiyorm' })).toMatchObject({ urteil: 'tippfehler', loesung: 'Su içiyorum.' });
    expect(bewerteLuecke(LF, { typ: 'luecke', text: 'içiyor' }).urteil).toBe('falsch');
    expect(satzMit({ vor: 'Ich  ', nach: ' Wasser. ' }, 'trinke')).toBe('Ich trinke Wasser.');
  });

  it('satzbau: Reihenfolge gegen alle Fassungen, ohne Tippfehler-Toleranz', () => {
    expect(bewerte(SB, { typ: 'satzbau', kacheln: [0, 1, 2, 3] })).toMatchObject({ urteil: 'richtig', loesung: 'Das Haus ist groß.' });
    expect(bewerte(SB, { typ: 'satzbau', kacheln: [3, 2, 0, 1] })).toMatchObject({ urteil: 'richtig', loesung: 'Groß ist das Haus.' });
    expect(bewerte(SB, { typ: 'satzbau', kacheln: [1, 0, 2, 3] }).urteil).toBe('falsch');
    expect(bewerte(SB, { typ: 'satzbau', kacheln: [] })).toMatchObject({ urteil: 'falsch', hinweise: ['leer'] });
  });

  it('formen: je Zelle Abgleich, schwächstes Urteil, Hinweise vereinigt, Lösung mit Köpfen', () => {
    const richtig = bewerteFormen(FO, { typ: 'formen', werte: ['', 'trinkst', 'trinkt'] });
    expect(richtig).toMatchObject({ urteil: 'richtig', hinweise: [] });
    expect(richtig.loesung).toBe('du: trinkst · er: trinkt');
    expect(bewerteFormen(FO, { typ: 'formen', werte: ['', 'trinkst', 'trinkd'] })).toMatchObject({
      urteil: 'tippfehler',
      hinweise: ['tippfehler'],
    });
    expect(bewerteFormen(FO, { typ: 'formen', werte: ['', 'trinke', 'trinkt'] }).urteil).toBe('falsch');
    expect(bewerteFormen(FO, { typ: 'formen', werte: ['', 'trinkst', ''] }).hinweise).toEqual([]);
    expect(bewerteFormen(FO, { typ: 'formen', werte: ['', '', ''] }).hinweise).toEqual(['leer']);
    expect(pruefeZellen(FO, ['', 'x', 'trinkt']).map((z) => [z.index, z.urteil, z.loesung])).toEqual([
      [1, 'falsch', 'trinkst'],
      [2, 'richtig', 'trinkt'],
    ]);
    expect(zellenKopf({ zeilen: ['ich'], spalten: ['Präsens', 'Präteritum'] }, { zeile: 0, spalte: 1 })).toBe('ich, Präteritum');
  });

  it('harakat: strenger Modus – nur die genaue Vokalisierung zählt, Hinweis „harakat“', () => {
    expect(bewerteHarakat(HA, { typ: 'harakat', wahl: 0 })).toEqual({
      urteil: 'richtig',
      hinweise: [],
      loesung: ar('kitaAb'),
      karten: [{ karte: 'ar-aus-de:ar.a1.e01.w004', urteil: 'richtig' }],
    });
    expect(bewerteHarakat(HA, { typ: 'harakat', wahl: 1 })).toMatchObject({
      urteil: 'falsch',
      hinweise: ['harakat'],
      loesung: ar('kitaAb'),
    });
    expect(bewerte(HA, { typ: 'harakat', wahl: 2 }).urteil).toBe('falsch');
  });
});

describe('Hilfen', () => {
  it('harakat: Zeichenfolge je Buchstabe und Beschreibung mit Namen', () => {
    expect(zeichenSchluessel(ar('k'))).toBe('u0643');
    expect(zeichenFolge(ar('kitaAb'))).toEqual([
      [
        { buchstabe: 'u0643', zeichen: ['u0650'] },
        { buchstabe: 'u062A', zeichen: ['u064E'] },
        { buchstabe: 'u0627', zeichen: [] },
        { buchstabe: 'u0628', zeichen: [] },
      ],
    ]);
    const namen = { u0643: 'Kaf', u0650: 'Kasra', u062A: 'Ta', u064E: 'Fatha', u0627: 'Alif' };
    expect(beschreibe(ar('kitaAb'), namen)).toBe('Kaf Kasra, Ta Fatha, Alif, U+0628');
    expect(beschreibe(`${ar('ba')} ${ar('ta')}`, { u0628: 'Ba', u062A: 'Ta', u064E: 'Fatha' })).toBe('Ba Fatha; Ta Fatha');
  });

  it('Zeichen einfügen und löschen an der Schreibmarke', () => {
    expect(einfuegen({ wert: 'gul', anfang: 1, ende: 2 }, 'ü')).toEqual({ wert: 'gül', anfang: 2, ende: 2 });
    expect(einfuegen({ wert: 'ab', anfang: 99, ende: 99 }, 'c')).toEqual({ wert: 'abc', anfang: 3, ende: 3 });
    expect(einfuegen({ wert: 'abc', anfang: 1, ende: 1 }, 'x', 3)).toEqual({ wert: 'abc', anfang: 1, ende: 1 });
    expect(loesche({ wert: 'abc', anfang: 3, ende: 3 })).toEqual({ wert: 'ab', anfang: 2, ende: 2 });
    expect(loesche({ wert: 'abc', anfang: 0, ende: 2 })).toEqual({ wert: 'c', anfang: 0, ende: 0 });
    expect(loesche({ wert: 'abc', anfang: 0, ende: 0 })).toEqual({ wert: 'abc', anfang: 0, ende: 0 });
    // arabische Vokalzeichen einzeln
    const k = ar('ki');
    expect(loesche({ wert: k, anfang: k.length, ende: k.length }).wert).toBe(ar('k'));
    expect(SONDERZEICHEN).toEqual({ de: ['ä', 'ö', 'ü', 'ß'], tr: ['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü'] });
  });

  it('Bild-Schema: alle Grundformen erlaubt', () => {
    const elemente = [
      { art: 'path', d: 'M1 1h2v2z' },
      { art: 'circle', cx: 12, cy: 12, r: 10 },
      { art: 'ellipse', cx: 12, cy: 12, rx: 4, ry: 2 },
      { art: 'rect', x: 2, y: 2, width: 20, height: 20, rx: 2 },
      { art: 'line', x1: 1, y1: 1, x2: 2, y2: 2 },
      { art: 'polyline', points: '1 1 2 2' },
      { art: 'polygon', points: '1,1 2,2 3,1' },
    ];
    expect(BildWortSchema.safeParse({ ...BILD, bild: { symbol: 'probe', elemente } }).success).toBe(true);
  });
});
