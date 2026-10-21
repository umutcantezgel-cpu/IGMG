import { describe, expect, it } from 'vitest';
import type { FreigabeBaustein, Pruefung } from '@/lib/lernapp/freigabe';
import type { KoranPfadDatei } from '@/lib/lernapp/inhalt/schema';
import { istKoranPaket } from '@/lib/lernapp/lokal/koran';
import {
  baueKoranEinheit,
  baueKoranVerzeichnis,
  koranBedeutungHash,
  type KoranWortEingabe,
  sichtbareBedeutung,
} from '@/lib/lernapp/paket/koran';

/**
 * Paketbau des Koran-Arabisch-Pfads (L6-05, ADR 0040 Nr. 5, KERN 4.0 §2.3/§4): Eine Bedeutung steht nur mit zwei religiösen
 * Freigaben verschiedener Personen zum aktuellen Inhalts-Hash im Paket (sonst „Bedeutung folgt“); Verfasser und die
 * Administration zählen nicht; ein Einwand sperrt. Eine Lektion gibt es nur, wenn jede gezeigte Bedeutung (auch die der
 * Ablenker) freigegeben ist. Pakete haben nie Audio, nur Wortzeiten, wenn welche übergeben werden. Testdaten: Wortformen nur
 * als Codepunkte, Bedeutungen als Platzhalter.
 */

const AM = new Date('2026-10-21T10:00:00Z');
const HOCA = 'person-hoca';
const STELLEN = ['1:1:1', '1:1:2', '1:1:3'] as const;
// neutrale Wörter, nur als Codepunkte (KI-Regel 2): b-a-b, d-a-r, q-a-l-a-m
const FORMEN = ['باب', 'دار', 'قلم'];
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

const hashVon = (i: number, text = BEDEUTUNGEN[i]!) => koranBedeutungHash({ formId: i + 1, sprache: 'de', bedeutung: text });

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
    expect(koranBedeutungHash({ formId: 1, sprache: 'tr', bedeutung: BEDEUTUNGEN[0]! })).not.toBe(hashVon(0));
    expect(koranBedeutungHash({ formId: 2, sprache: 'de', bedeutung: BEDEUTUNGEN[0]! })).not.toBe(hashVon(0));
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

  it('der Browser verwirft Pakete mit Audio-Feld oder fremder Einheit', () => {
    const p = JSON.parse(bau(woerter(null)).json);
    expect(istKoranPaket({ ...p, woerter: [{ ...p.woerter[0], audio: '/x' }] }, 'de', 'koran.grund.e01')).toBe(false);
    expect(istKoranPaket(p, 'tr', 'koran.grund.e01')).toBe(false);
    expect(istKoranPaket(p, 'de', 'koran.grund.e02')).toBe(false);
  });
});
