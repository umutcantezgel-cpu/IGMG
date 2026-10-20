import { describe, expect, it } from 'vitest';
import { auswahlReihenfolge, bewerteAuswahl } from '@/lib/lernapp/aufgaben/auswahl';
import { bewerte } from '@/lib/lernapp/aufgaben/bewerte';
import { allesGefunden, bewertePaare, PAARE_START, rechteReihenfolge, waehlePaar } from '@/lib/lernapp/aufgaben/paare';
import {
  AUFGABEN_TYPEN,
  AufgabeSchema,
  type AuswahlAufgabe,
  IMPLEMENTIERT,
  istImplementiert,
  LektionSchema,
  type PaareAufgabe,
  type WortbankAufgabe,
} from '@/lib/lernapp/aufgaben/schema';
import { bewerteWortbank, kachelReihenfolge, legeKachel, nimmKachel, verschiebeKachel } from '@/lib/lernapp/aufgaben/wortbank';
import { gemischteIndizes, mische, saatAus } from '@/lib/lernapp/engine/zufall';
import { LEKTION } from './hilfen/lektion';

/**
 * Aufgaben-Schema (PLAN §4, ADR 0039): Zod-Union über alle Übungstypen, L1 implementiert auswahl, wortbank und paare.
 */
const [auswahl, wortbank, paare] = LEKTION.aufgaben as [AuswahlAufgabe, WortbankAufgabe, PaareAufgabe];

describe('Schema', () => {
  it('Beispiellektion ist gültig', () => {
    expect(LektionSchema.parse(LEKTION)).toEqual(LEKTION);
  });

  it('die Union kennt alle Typen aus PLAN §4 (mit Wissenskurs)', () => {
    expect(new Set(AUFGABEN_TYPEN)).toEqual(
      new Set([
        'auswahl',
        'bild_wort',
        'paare',
        'wortbank',
        'frei',
        'hoeren_waehlen',
        'hoeren_schreiben',
        'minimalpaare',
        'luecke',
        'satzbau',
        'formen',
        'harakat',
        'dialog',
        'geschichte',
        'lesen_fragen',
        'grammatik_tipp',
        'schrift_ar',
        'schrift_tr',
        'schrift_latein',
        'sprechen',
        'schreiben',
        'koran_wort',
        'wahr_falsch',
        'zuordnen',
        'reihenfolge',
        'fallfrage',
      ]),
    );
    expect(IMPLEMENTIERT).toEqual(['auswahl', 'wortbank', 'paare']);
    expect(istImplementiert('auswahl')).toBe(true);
    expect(istImplementiert('frei')).toBe(false);
  });

  it.each([
    ['unbekannter Typ', { ...auswahl, typ: 'herz' }],
    ['richtig außerhalb', { ...auswahl, richtig: 3 }],
    ['Optionen doppelt', { ...auswahl, optionen: [auswahl.optionen[0], { text: 'SU', sprache: 'tr' }] }],
    ['nur eine Option', { ...auswahl, optionen: [auswahl.optionen[0]], richtig: 0 }],
    ['Sprache unbekannt', { ...auswahl, vorgabe: { text: 'Wasser', sprache: 'en' } }],
    ['leerer Text', { ...auswahl, vorgabe: { text: '  ', sprache: 'de' } }],
    ['Schlüssel ungültig', { ...auswahl, schluessel: 'a b' }],
    ['zusätzliches Feld', { ...auswahl, punkte: 3 }],
    ['Kacheln für die Hauptlösung fehlen', { ...wortbank, kacheln: ['Su', 'ekmek'] }],
    ['Wortbank ohne Lösung', { ...wortbank, loesungen: [] }],
    ['Paare mit gleichem Text', { ...paare, paare: [paare.paare[0], paare.paare[0]] }],
    ['nur ein Paar', { ...paare, paare: [paare.paare[0]] }],
    [
      'Koran-Wort ohne Verweis',
      { typ: 'koran_wort', schluessel: 'k1', art: 'bedeutung', verweis: 'Text', optionen: ['b1', 'b2'], richtig: 0 },
    ],
  ])('weist ab: %s', (_n, aufgabe) => {
    expect(AufgabeSchema.safeParse(aufgabe).success).toBe(false);
  });

  it('Gerüst-Typen sind mit Pflichtfeldern gültig', () => {
    expect(
      AufgabeSchema.safeParse({
        typ: 'frei',
        schluessel: 'f1',
        vorgabe: { text: 'Brot', sprache: 'de' },
        sprache: 'tr',
        loesungen: ['ekmek'],
      }).success,
    ).toBe(true);
    expect(
      AufgabeSchema.safeParse({
        typ: 'wahr_falsch',
        schluessel: 'w1',
        aussage: { text: '[Aussage]', sprache: 'de' },
        wahr: true,
        begruendung: '[Begründung]',
      }).success,
    ).toBe(true);
    expect(
      AufgabeSchema.safeParse({
        typ: 'koran_wort',
        schluessel: 'k1',
        art: 'bedeutung',
        verweis: '1:2:3',
        optionen: ['b1', 'b2'],
        richtig: 0,
      }).success,
    ).toBe(true);
  });

  it('Lektion: Aufgabenschlüssel eindeutig, mindestens eine Aufgabe', () => {
    expect(LektionSchema.safeParse({ ...LEKTION, aufgaben: [auswahl, auswahl] }).success).toBe(false);
    expect(LektionSchema.safeParse({ ...LEKTION, aufgaben: [] }).success).toBe(false);
    expect(LektionSchema.safeParse({ ...LEKTION, art: 'herz' }).success).toBe(false);
  });
});

describe('Bewertung', () => {
  it('auswahl: Index', () => {
    expect(bewerteAuswahl(auswahl, { typ: 'auswahl', wahl: 0 })).toEqual({
      urteil: 'richtig',
      hinweise: [],
      loesung: 'su',
      karten: [{ karte: 'tr.a1.l0001', urteil: 'richtig' }],
    });
    expect(bewerteAuswahl(auswahl, { typ: 'auswahl', wahl: 2 })).toMatchObject({ urteil: 'falsch', loesung: 'su' });
  });

  it('wortbank: Kacheln gegen alle Lösungen, ohne Tippfehler-Toleranz', () => {
    expect(bewerteWortbank(wortbank, { typ: 'wortbank', kacheln: [0, 1] })).toMatchObject({ urteil: 'richtig', loesung: 'Su içiyorum.' });
    expect(bewerteWortbank(wortbank, { typ: 'wortbank', kacheln: [2, 0, 1] })).toMatchObject({
      urteil: 'richtig',
      loesung: 'Ben su içiyorum.',
    });
    expect(bewerteWortbank(wortbank, { typ: 'wortbank', kacheln: [0, 4] })).toMatchObject({ urteil: 'falsch', loesung: 'Su içiyorum.' });
    expect(bewerteWortbank(wortbank, { typ: 'wortbank', kacheln: [1, 0] })).toMatchObject({ urteil: 'falsch' });
    expect(bewerteWortbank(wortbank, { typ: 'wortbank', kacheln: [] })).toMatchObject({ urteil: 'falsch', hinweise: ['leer'] });
  });

  it('paare: ohne Fehlversuch richtig; Fehlversuch macht die beteiligten Karten falsch', () => {
    expect(
      bewertePaare(paare, {
        typ: 'paare',
        versuche: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      }),
    ).toEqual({
      urteil: 'richtig',
      hinweise: [],
      loesung: null,
      karten: [
        { karte: 'tr.a1.l0001', urteil: 'richtig' },
        { karte: 'tr.a1.l0002', urteil: 'richtig' },
        { karte: 'tr.a1.l0003', urteil: 'richtig' },
      ],
    });
    const mitFehler = bewertePaare(paare, {
      typ: 'paare',
      versuche: [
        [0, 1],
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    });
    expect(mitFehler.urteil).toBe('falsch');
    expect(mitFehler.karten.map((k) => k.urteil)).toEqual(['falsch', 'falsch', 'richtig']);
    expect(bewertePaare(paare, { typ: 'paare', versuche: [[0, 0]] }).urteil).toBe('falsch');
  });

  it('bewerte: verteilt nach Typ, L2-Typen und falsche Antwortart sind Programmfehler', () => {
    expect(bewerte(auswahl, { typ: 'auswahl', wahl: 0 }).urteil).toBe('richtig');
    expect(() => bewerte(LEKTION.aufgaben[3]!, { typ: 'auswahl', wahl: 0 })).toThrow(/L2/);
    expect(() => bewerte(auswahl, { typ: 'wortbank', kacheln: [] })).toThrow();
  });
});

describe('Interaktion (rein)', () => {
  it('Wortbank: legen, nehmen, verschieben', () => {
    let z = legeKachel([], 2);
    z = legeKachel(z, 0);
    z = legeKachel(z, 0);
    expect(z).toEqual([2, 0]);
    expect(verschiebeKachel([2, 0, 1], 0, 1)).toEqual([0, 2, 1]);
    expect(verschiebeKachel([2, 0, 1], 0, -1)).toEqual([2, 0, 1]);
    expect(verschiebeKachel([2, 0, 1], 2, 5)).toEqual([2, 0, 1]);
    expect(nimmKachel([2, 0, 1], 1)).toEqual([2, 1]);
  });

  it('Paare: Auswahl wechseln, Paar finden, Fehlversuch merken, Gefundene gesperrt', () => {
    let z = waehlePaar(PAARE_START, 'links', 0);
    z = waehlePaar(z, 'links', 1);
    expect(z.gewaehlt).toEqual({ seite: 'links', index: 1 });
    z = waehlePaar(z, 'links', 1);
    expect(z.gewaehlt).toBeNull();
    z = waehlePaar(z, 'rechts', 2);
    z = waehlePaar(z, 'links', 0);
    expect(z).toMatchObject({ gewaehlt: null, gefunden: [], fehler: [0, 2], versuche: [[0, 2]] });
    z = waehlePaar(z, 'links', 0);
    z = waehlePaar(z, 'rechts', 0);
    expect(z).toMatchObject({ gefunden: [0], fehler: null });
    expect(waehlePaar(z, 'rechts', 0)).toBe(z);
    z = waehlePaar(waehlePaar(z, 'rechts', 1), 'links', 1);
    z = waehlePaar(waehlePaar(z, 'links', 2), 'rechts', 2);
    expect(allesGefunden(z, 3)).toBe(true);
    expect(bewertePaare(paare, { typ: 'paare', versuche: z.versuche }).urteil).toBe('falsch');
  });
});

describe('Deterministisches Mischen', () => {
  it('gleicher Schlüssel, gleiche Reihenfolge; nie die Ausgangsreihenfolge', () => {
    expect(auswahlReihenfolge(auswahl)).toEqual(auswahlReihenfolge(auswahl));
    expect(kachelReihenfolge(wortbank)).toEqual(kachelReihenfolge(wortbank));
    expect(rechteReihenfolge(paare)).toEqual(rechteReihenfolge(paare));
    for (let n = 2; n < 8; n++)
      for (const s of ['a', 'b', 'c', 'd', 'e', 'f']) {
        const m = gemischteIndizes(n, s);
        expect([...m].sort()).toEqual(Array.from({ length: n }, (_, i) => i));
        expect(m).not.toEqual(Array.from({ length: n }, (_, i) => i));
      }
    expect(gemischteIndizes(1, 'x')).toEqual([0]);
    expect(mische([1, 2, 3, 4], saatAus('x'))).toEqual(mische([1, 2, 3, 4], 'x'));
  });
});
