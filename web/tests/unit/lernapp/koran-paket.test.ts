import { describe, expect, it } from 'vitest';
import type { FreigabeBaustein, Pruefung } from '@/lib/lernapp/freigabe';
import { FREIGABE_STATUS, gleicherInhalt } from '@/lib/religioes/freigabe';
import type { KoranPfadDatei } from '@/lib/lernapp/inhalt/schema';
import { istKoranPaket } from '@/lib/lernapp/lokal/koran';
import { inhaltHash } from '@/lib/lernapp/paket/hash';
import {
  baueKoranEinheit,
  baueKoranVerzeichnis,
  koranBedeutungHash,
  koranBedeutungStatus,
  type KoranWortEingabe,
  sichtbareBedeutung,
} from '@/lib/lernapp/paket/koran';

/**
 * Paketbau des Koran-Arabisch-Pfads (L6-05, ADR 0040 Nr. 5, KERN 4.0 §2.3/§4): Eine Bedeutung steht nur mit zwei religiösen
 * Freigaben verschiedener Personen zum aktuellen Inhalts-Hash im Paket (sonst „Bedeutung folgt“); Verfasser und die
 * Administration zählen nicht; ein Einwand und ein Website-Entwurf sperren. Eine Lektion gibt es nur, wenn jede gezeigte
 * Bedeutung (auch die der Ablenker) freigegeben ist. Pakete haben nie Audio, nur Wortzeiten, wenn welche übergeben werden, und
 * nennen dann die Rezitation. Hash und Statusregel sind der Vertrag mit der Prüfoberfläche (L6-02/03). Testdaten: Wortformen nur
 * als Codepunkte, Bedeutungen als Platzhalter.
 */

const AM = new Date('2026-10-21T10:00:00Z');
const HOCA = 'person-hoca';
const STELLEN = ['1:1:1', '1:1:2', '1:1:3'] as const;
// neutrale Wörter, nur als Codepunkte (KI-Regel 2): b-a-b, d-a-r, q-a-l-a-m
const FORMEN = ['\u0628\u0627\u0628', '\u062F\u0627\u0631', '\u0642\u0644\u0645'];
const BEDEUTUNGEN = ['[Bedeutung eins]', '[Bedeutung zwei]', '[Bedeutung drei]'];

const einheit: KoranPfadDatei['einheiten'][number] = {
  schluessel: 'koran.grund.e01',
  stufe: 'grund',
  reihenfolge: 1,
  thema: { de: '[Thema]', tr: '[Konu]' },
  lektionen: [
    {
      schluessel: 'koran.grund.e01.l01',
      wortformen: [...STELLEN],
      aufgaben: STELLEN.map((s, i) => ({
        schluessel: `koran.grund.e01.l01.a0${i + 1}`,
        typ: 'koran_wort' as const,
        art: 'bedeutung' as const,
        wortform: s,
        ablenker: STELLEN.filter((x) => x !== s),
      })),
    },
  ],
};

const inhalt = (formId: number, bedeutung: string, extra: { sprache?: string; wurzel?: string; anmerkung?: string } = {}) => ({
  formId,
  sprache: extra.sprache ?? 'de',
  bedeutung,
  wurzel: extra.wurzel ?? null,
  anmerkung: extra.anmerkung ?? null,
});
const hashVon = (i: number, text = BEDEUTUNGEN[i]!) => koranBedeutungHash(inhalt(i + 1, text));

function ok(person: string, hash: string, extra: Partial<Pruefung> = {}): Pruefung {
  return {
    pruefendeId: person,
    pruefendeRollen: ['religioese_pruefung'],
    art: 'religioes',
    urteil: 'ok',
    inhaltHash: hash,
    am: AM,
    ...extra,
  };
}

function freigabe(i: number, pruefungen: (hash: string) => Pruefung[]): FreigabeBaustein {
  const inhaltHash = hashVon(i);
  return {
    status: 'veroeffentlicht',
    baustein: { inhaltHash, verfasser: [HOCA], belege: [], belegPflicht: false },
    pruefungen: pruefungen(inhaltHash),
  };
}

/** Wortliste: je Stelle Form, Vorkommen und (optional) Bedeutung mit Prüfungen. */
function woerter(pruefungen: ((hash: string) => Pruefung[]) | null, nur: readonly number[] = [0, 1, 2]): Map<string, KoranWortEingabe> {
  return new Map(
    STELLEN.map((s, i) => [
      s,
      {
        text: FORMEN[i]!,
        vorkommen: 10 - i,
        bedeutung: pruefungen && nur.includes(i) ? { text: BEDEUTUNGEN[i]!, freigabe: freigabe(i, pruefungen) } : null,
      },
    ]),
  );
}

const bau = (w: Map<string, KoranWortEingabe>) => baueKoranEinheit({ einheit, sprache: 'de', woerter: w, quellen: ['[Quelle]'] });
const zwei = (hash: string) => [ok('person-a', hash), ok('person-b', hash)];

describe('Koran-Paket: Bedeutungen nur mit zwei Freigaben zum aktuellen Hash', () => {
  it('ohne Bedeutungen: Wortformen mit Stelle, keine Bedeutung („Bedeutung folgt“), keine Lektion', () => {
    const r = bau(woerter(null));
    expect(r.paket.woerter.map((w) => w.stelle)).toEqual([...STELLEN]);
    expect(r.paket.woerter.every((w) => w.text && w.bedeutung === undefined)).toBe(true);
    expect(r.paket.lektionen).toEqual([]);
    expect(r.json).not.toMatch(/"bedeutung"/);
    expect(baueKoranVerzeichnis('de', [r]).einheiten[0]).toMatchObject({ woerter: 3, bedeutungen: 0, lektionen: [] });
  });

  it('eine Freigabe, Administration, Verfasserin oder alter Hash genügen nicht; zwei verschiedene Personen zum Hash schon', () => {
    const faelle: [string, (h: string) => Pruefung[], boolean][] = [
      ['eine', (h) => [ok('person-a', h)], false],
      ['dieselbe Person zweimal', (h) => [ok('person-a', h), ok('person-a', h)], false],
      ['Administration', (h) => [ok('person-a', h), ok('person-b', h, { pruefendeRollen: ['administration'] })], false],
      ['Verfasserin', (h) => [ok('person-a', h), ok(HOCA, h)], false],
      ['alter Hash', () => [ok('person-a', hashVon(0, '[alt]')), ok('person-b', hashVon(0, '[alt]'))], false],
      ['Einwand', (h) => [...zwei(h), ok('person-c', h, { urteil: 'abgelehnt' })], false],
      ['Sprachprüfung statt religiös', (h) => [ok('person-a', h), ok('person-b', h, { art: 'sprache_ziel' })], false],
      ['Konto gelöscht', (h) => [ok('person-a', h), ok('person-b', h, { pruefendeId: null })], false],
      ['zwei', zwei, true],
    ];
    for (const [name, pruefungen, sichtbar] of faelle) {
      const r = bau(woerter(pruefungen));
      expect(r.paket.woerter.filter((w) => w.bedeutung).length, name).toBe(sichtbar ? 3 : 0);
      expect(r.paket.lektionen.length, name).toBe(sichtbar ? 1 : 0);
    }
  });

  it('der Hash bindet den Text: geänderte Bedeutung oder andere Sprache ergibt einen neuen Hash', () => {
    expect(hashVon(0)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashVon(0, '[Bedeutung eins!]')).not.toBe(hashVon(0));
    expect(koranBedeutungHash(inhalt(1, BEDEUTUNGEN[0]!, { sprache: 'tr' }))).not.toBe(hashVon(0));
    expect(koranBedeutungHash(inhalt(2, BEDEUTUNGEN[0]!))).not.toBe(hashVon(0));
    // Freigaben zum Hash des alten Texts gelten nicht für den neuen
    const w = woerter(zwei);
    const alt = w.get(STELLEN[0])!;
    w.set(STELLEN[0], { ...alt, bedeutung: { ...alt.bedeutung!, text: '[Bedeutung eins, geändert]' } });
    expect(sichtbareBedeutung(w.get(STELLEN[0]))).toBe('[Bedeutung eins, geändert]');
    const neu = {
      ...alt.bedeutung!.freigabe,
      baustein: { ...alt.bedeutung!.freigabe.baustein, inhaltHash: hashVon(0, '[Bedeutung eins, geändert]') },
    };
    w.set(STELLEN[0], { ...alt, bedeutung: { text: '[Bedeutung eins, geändert]', freigabe: neu } });
    expect(bau(w).paket.woerter[0]!.bedeutung).toBeUndefined();
  });

  it('Lektion nur ganz: fehlt eine Bedeutung der Wortformen oder Ablenker, gibt es keine Übungen', () => {
    const teil = bau(woerter(zwei, [0, 1]));
    expect(teil.paket.woerter.map((w) => w.bedeutung ?? null)).toEqual([BEDEUTUNGEN[0], BEDEUTUNGEN[1], null]);
    expect(teil.paket.lektionen).toEqual([]);
    const voll = bau(woerter(zwei)).paket.lektionen[0]!;
    expect(voll).toMatchObject({ schluessel: 'koran.grund.e01.l01', kurs: 'koran', zielsprache: 'ar', ausgangssprache: 'de' });
    const a = voll.aufgaben[0]!;
    expect(a.typ === 'koran_wort' && a).toMatchObject({
      anweisung: 'waehleBedeutung',
      wort: { stelle: '1:1:1', text: FORMEN[0], sprache: 'ar' },
      richtig: 0,
      optionen: [
        { kennung: 'koran:1:1:1', text: BEDEUTUNGEN[0], sprache: 'de' },
        { kennung: 'koran:1:1:2', text: BEDEUTUNGEN[1], sprache: 'de' },
        { kennung: 'koran:1:1:3', text: BEDEUTUNGEN[2], sprache: 'de' },
      ],
    });
  });

  it('gesperrt (zurückgezogen) ist nie sichtbar, auch mit zwei Freigaben', () => {
    const w = woerter(zwei);
    for (const [s, x] of w) w.set(s, { ...x, bedeutung: { ...x.bedeutung!, freigabe: { ...x.bedeutung!.freigabe, status: 'gesperrt' } } });
    expect(bau(w).paket.woerter.some((x) => x.bedeutung)).toBe(false);
  });
});

describe('Koran-Paket: Vertrag mit der Prüfoberfläche (L6-02/03)', () => {
  it('Hash über Form, Sprache, Bedeutung, Wurzel und Anmerkung als kanonisches JSON (wie inhaltHash der Prüfoberfläche)', () => {
    const b = inhalt(7, '[Bedeutung]', { wurzel: '[W]', anmerkung: '[A]' });
    expect(koranBedeutungHash(b)).toBe(inhaltHash({ art: 'koran_bedeutung', ...b }));
    expect(koranBedeutungHash(inhalt(7, '[Bedeutung]'))).toBe(
      inhaltHash({ art: 'koran_bedeutung', formId: 7, sprache: 'de', bedeutung: '[Bedeutung]', wurzel: null, anmerkung: null }),
    );
    // Unicode-Normalform zählt nicht (NFC), jeder Inhalt schon
    expect(koranBedeutungHash(inhalt(7, 'e\u0301'))).toBe(koranBedeutungHash(inhalt(7, '\u00e9')));
    expect(koranBedeutungHash(inhalt(7, '[Bedeutung]', { wurzel: '[W2]', anmerkung: '[A]' }))).not.toBe(koranBedeutungHash(b));
    expect(koranBedeutungHash(inhalt(7, '[Bedeutung]', { wurzel: '[W]', anmerkung: '[A2]' }))).not.toBe(koranBedeutungHash(b));
  });

  it('jede Änderung, die die Verwaltung als Inhalt erkennt (gleicherInhalt), ergibt einen neuen Hash – und nur sie', () => {
    const basis = { bedeutung: '[B]', wurzel: '[W]', anmerkung: null };
    const faelle = [
      basis,
      { ...basis, bedeutung: '[B2]' },
      { ...basis, wurzel: null },
      { ...basis, wurzel: '[W2]' },
      { ...basis, anmerkung: '[A]' },
      { bedeutung: '[B]', anmerkung: null, wurzel: '[W]' },
    ];
    const hash = (x: (typeof faelle)[number]) => koranBedeutungHash({ formId: 1, sprache: 'de', ...x });
    for (const a of faelle) for (const b of faelle) expect(hash(a) === hash(b), JSON.stringify([a, b])).toBe(gleicherInhalt(a, b));
  });

  it('Statusregel: Website-Entwurf (zurückgewiesen, Freigabe aufgehoben) gesperrt, sonst entscheiden die Freigaben', () => {
    expect(FREIGABE_STATUS.map((f) => [f, koranBedeutungStatus(f)])).toEqual([
      ['entwurf', 'gesperrt'],
      ['zur_pruefung', 'veroeffentlicht'],
      ['geprueft', 'veroeffentlicht'],
    ]);
    const w = woerter(zwei);
    const x = w.get(STELLEN[0])!;
    w.set(STELLEN[0], {
      ...x,
      bedeutung: { ...x.bedeutung!, freigabe: { ...x.bedeutung!.freigabe, status: koranBedeutungStatus('entwurf') } },
    });
    const r = bau(w);
    expect(r.paket.woerter[0]!.bedeutung).toBeUndefined();
    expect(r.paket.lektionen).toEqual([]);
  });
});

describe('Koran-Paket: kein Audio', () => {
  it('ohne Wortzeiten kein Hörfeld; nie audio, stimme oder Clips – auch nicht in den Aufgaben', () => {
    const r = bau(woerter(zwei));
    expect(r.json).not.toMatch(/"(audio|stimme|clip|zeit)"\s*:/);
    expect(istKoranPaket(JSON.parse(r.json), 'de', 'koran.grund.e01')).toBe(true);
  });

  it('Wortzeit einer geprüften Rezitation nur, wenn sie übergeben wird und die Wortform aufgelöst ist', () => {
    const w = woerter(zwei);
    const zeit = { adresse: '/audio/test/001-000-0123456789abcdef.webm', startMs: 100, endeMs: 900, rezitation: 'test' };
    w.set(STELLEN[0], { ...w.get(STELLEN[0])!, zeit });
    w.set(STELLEN[1], { ...w.get(STELLEN[1])!, text: null, zeit });
    const r = bau(w);
    expect(r.paket.woerter[0]!.zeit).toEqual(zeit);
    expect(r.paket.woerter[1]).toEqual({ stelle: '1:1:2', vorkommen: 9, bedeutung: BEDEUTUNGEN[1] });
    expect(r.json).not.toMatch(/"(audio|stimme)"\s*:/);
  });

  it('Quellen nennen die Rezitation (Name, Rezitator, Lizenz), wenn ihre Wortzeiten im Paket stehen – sonst nicht', () => {
    const rezitationen = new Map([
      ['test', '[Rezitation test]'],
      ['andere', '[Rezitation andere]'],
    ]);
    const mit = (w: Map<string, KoranWortEingabe>) =>
      baueKoranEinheit({ einheit, sprache: 'de', woerter: w, quellen: ['[Quelle]'], rezitationen }).paket.quellen;
    expect(mit(woerter(zwei))).toEqual(['[Quelle]']);
    const w = woerter(zwei);
    w.set(STELLEN[0], { ...w.get(STELLEN[0])!, zeit: { adresse: '/audio/test/a.webm', startMs: 0, endeMs: 500, rezitation: 'test' } });
    expect(mit(w)).toEqual(['[Quelle]', '[Rezitation test]']);
  });

  it('der Browser verwirft Pakete mit Audio-Feld oder fremder Einheit', () => {
    const p = JSON.parse(bau(woerter(null)).json);
    expect(istKoranPaket({ ...p, woerter: [{ ...p.woerter[0], audio: '/x' }] }, 'de', 'koran.grund.e01')).toBe(false);
    expect(istKoranPaket(p, 'tr', 'koran.grund.e01')).toBe(false);
    expect(istKoranPaket(p, 'de', 'koran.grund.e02')).toBe(false);
  });
});
