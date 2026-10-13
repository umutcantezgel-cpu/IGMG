import { describe, expect, it } from 'vitest';
import { anzeigeEinstellungAusFormular, anzeigeEinstellungWerte, leseAnzeigeEinstellung } from '@/lib/anzeige/einstellung';
import { istReligioes, leseStelle, textIn, versBezug } from '@/lib/anzeige/folien';
import { aktiveFolien, anzeigeZustand, iqamaZeiten, ruheFenster, STANDARD_ANZEIGE } from '@/lib/anzeige/plan';
import { zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import { alsLokal, ausLokal, folienDatensatz, folienSchema, folienWerte } from '@/lib/validierung/anzeige';

/**
 * Anzeige im Gebetsraum (AUFTRAG 3.10, B-25, MN-14): Folien-Zeitplan an Tages- und Wochengrenzen in Wetzlarer Zeit,
 * Ruhephase Ezan → Iqama + 15 Minuten (ohne Iqama 20 Minuten), Freitagsmodus, Einstellung aus dem Formular und das
 * Folienformular (Verweise statt religiöser Texte). Ergänzt `anzeige-plan.test.ts`.
 */
const ZEITEN = { imsak: '05:56', gunes: '07:38', ogle: '13:17', ikindi: '16:06', aksam: '18:45', yatsi: '20:20' };
const DIENSTAG = '2026-10-13';
const FREITAG = '2026-10-16';
const um = (datum: string, zeit: string, plusMin = 0) => new Date(zeitpunkt(datum, zeit).getTime() + plusMin * 60_000);
const folie = (id: string, extra: Partial<{ von: string | null; bis: string | null; wochentage: number[]; reihenfolge: number }> = {}) => ({
  id,
  von: null,
  bis: null,
  wochentage: [],
  reihenfolge: 1,
  ...extra,
});

describe('Folien-Zeitplan', () => {
  it('von gilt ab dem Zeitpunkt, bis nur davor (halboffen)', () => {
    const f = [folie('a', { von: um(DIENSTAG, '10:00').toISOString(), bis: um(DIENSTAG, '12:00').toISOString() })];
    expect(aktiveFolien(f, um(DIENSTAG, '09:59'))).toHaveLength(0);
    expect(aktiveFolien(f, um(DIENSTAG, '10:00'))).toHaveLength(1);
    expect(aktiveFolien(f, um(DIENSTAG, '11:59'))).toHaveLength(1);
    expect(aktiveFolien(f, um(DIENSTAG, '12:00'))).toHaveLength(0);
  });

  it('Wochentage zählen in Wetzlarer Zeit (Freitag 00:30 ist in UTC noch Donnerstag)', () => {
    const nurFreitag = [folie('f', { wochentage: [5] })];
    const kurzNachMitternacht = um(FREITAG, '00:30');
    expect(kurzNachMitternacht.getUTCDay()).toBe(4);
    expect(aktiveFolien(nurFreitag, kurzNachMitternacht).map((x) => x.id)).toEqual(['f']);
    expect(aktiveFolien(nurFreitag, um('2026-10-15', '23:59'))).toHaveLength(0);
  });

  it('Reihenfolge der Verwaltung, bei Gleichstand stabil nach Kennung', () => {
    const f = [folie('b', { reihenfolge: 2 }), folie('z', { reihenfolge: 1 }), folie('a', { reihenfolge: 2 })];
    expect(aktiveFolien(f, um(DIENSTAG, '10:00')).map((x) => x.id)).toEqual(['z', 'a', 'b']);
  });
});

describe('Ruhephase und Iqama (B-25, MN-14)', () => {
  const e = { ...STANDARD_ANZEIGE, iqama: { ogle: 10, aksam: 5 } };

  it('Ruhefenster: Ezan bis Iqama + 15 Minuten; ohne Iqama Ezan + 20 Minuten', () => {
    const f = ruheFenster(DIENSTAG, ZEITEN, e);
    const ogle = f.find((x) => x.gebet === 'ogle')!;
    expect(ogle.von).toBe(um(DIENSTAG, '13:17').getTime());
    expect(ogle.bis).toBe(um(DIENSTAG, '13:17', 25).getTime());
    const ikindi = f.find((x) => x.gebet === 'ikindi')!;
    expect(ikindi.bis - ikindi.von).toBe(20 * 60_000);
    expect(f.map((x) => x.gebet)).not.toContain('gunes');
  });

  it('Iqama-Uhrzeiten nur mit Angabe (sonst ausgeblendet)', () => {
    expect(iqamaZeiten(DIENSTAG, ZEITEN, e)).toEqual({ ogle: '13:27', aksam: '18:50' });
    expect(iqamaZeiten(DIENSTAG, ZEITEN, STANDARD_ANZEIGE)).toEqual({});
  });

  it('im Gebetsfenster keine Folie, auch wenn eine aktiv wäre; danach wieder Folien', () => {
    const folien = [folie('a')];
    expect(anzeigeZustand(DIENSTAG, ZEITEN, folien, e, um(DIENSTAG, '13:17'))).toMatchObject({
      modus: 'ruhe',
      gebet: 'ogle',
      iqama: '13:27',
    });
    expect(anzeigeZustand(DIENSTAG, ZEITEN, folien, e, um(DIENSTAG, '13:17', 24.9)).modus).toBe('ruhe');
    expect(anzeigeZustand(DIENSTAG, ZEITEN, folien, e, um(DIENSTAG, '13:17', 25))).toMatchObject({ modus: 'folien', folieId: 'a' });
    expect(anzeigeZustand(DIENSTAG, ZEITEN, folien, e, um(DIENSTAG, '13:16'))).toMatchObject({ modus: 'folien', folieId: 'a' });
  });

  it('Ruhe nach Iqama ist einstellbar', () => {
    const lang = { ...e, ruheNachIqamaMin: 30 };
    expect(anzeigeZustand(DIENSTAG, ZEITEN, [], lang, um(DIENSTAG, '13:17', 39)).modus).toBe('ruhe');
    expect(anzeigeZustand(DIENSTAG, ZEITEN, [], lang, um(DIENSTAG, '13:17', 40)).modus).toBe('folien');
  });

  it('Freitagsmodus nur freitags und nur eingeschaltet', () => {
    expect(anzeigeZustand(DIENSTAG, ZEITEN, [], STANDARD_ANZEIGE, um(DIENSTAG, '13:17', -30)).modus).toBe('folien');
    const aus = { ...STANDARD_ANZEIGE, freitag: { aktiv: false, vorMin: 45, nachMin: 60 } };
    expect(anzeigeZustand(FREITAG, ZEITEN, [], aus, um(FREITAG, '13:17', -30)).modus).toBe('folien');
    expect(anzeigeZustand(FREITAG, ZEITEN, [], STANDARD_ANZEIGE, um(FREITAG, '13:17', -45)).modus).toBe('freitag');
    expect(anzeigeZustand(FREITAG, ZEITEN, [], STANDARD_ANZEIGE, um(FREITAG, '13:17', -46)).modus).toBe('folien');
  });

  it('Foliendauer mindestens 5 Sekunden, Wechsel für alle Bildschirme gleich', () => {
    const kurz = { ...STANDARD_ANZEIGE, folienDauerSek: 1 };
    const t = um(DIENSTAG, '10:00');
    const z = anzeigeZustand(DIENSTAG, ZEITEN, [folie('a'), folie('b', { reihenfolge: 2 })], kurz, t);
    expect(z.modus === 'folien' && z.naechsterWechselMs - t.getTime()).toBeLessThanOrEqual(5000);
    expect(z.modus === 'folien' && z.naechsterWechselMs % 5000).toBe(0);
  });
});

describe('Einstellung der Anzeige', () => {
  const roh = (extra: Record<string, string> = {}) => ({
    iqama_imsak: '',
    iqama_ogle: '10',
    iqama_ikindi: '',
    iqama_aksam: '0',
    iqama_yatsi: '',
    ruheNachIqamaMin: '15',
    ruheOhneIqamaMin: '20',
    freitagAktiv: 'on',
    freitagVorMin: '45',
    freitagNachMin: '60',
    folienDauerSek: '12',
    ...extra,
  });

  it('leere Iqama-Felder bleiben ausgeblendet, 0 ist eine Angabe', () => {
    const r = anzeigeEinstellungAusFormular(roh());
    expect(r.ok && r.wert.iqama).toEqual({ ogle: 10, aksam: 0 });
    expect(r.ok && r.wert.freitag).toEqual({ aktiv: true, vorMin: 45, nachMin: 60 });
  });

  it('Fehler je Feld: keine Zahl, außerhalb des Bereichs, Pflichtfeld leer', () => {
    const r = anzeigeEinstellungAusFormular(roh({ iqama_ogle: 'zehn', ruheNachIqamaMin: '3', folienDauerSek: '' }));
    expect(r).toEqual({ ok: false, feldFehler: { iqama_ogle: 'zahl', ruheNachIqamaMin: 'bereich', folienDauerSek: 'zahl' } });
  });

  it('Freitagsmodus aus, wenn das Häkchen fehlt; Rundreise über die Startwerte', () => {
    const r = anzeigeEinstellungAusFormular(roh({ freitagAktiv: '' }));
    expect(r.ok && r.wert.freitag.aktiv).toBe(false);
    if (r.ok) expect(anzeigeEinstellungAusFormular(anzeigeEinstellungWerte(r.wert))).toEqual(r);
  });

  it('ungültiger gespeicherter Wert → Standard (die Anzeige stürzt nie ab)', () => {
    expect(leseAnzeigeEinstellung({ iqama: { ogle: 500 } })).toEqual(leseAnzeigeEinstellung({}));
    expect(leseAnzeigeEinstellung(null)).toMatchObject({ ruheNachIqamaMin: 15, ruheOhneIqamaMin: 20, folienDauerSek: 12 });
  });
});

describe('Folienformular', () => {
  const basis = {
    titelDe: '',
    titelTr: '',
    titelEn: '',
    textDe: '',
    textTr: '',
    textEn: '',
    bildId: '',
    stelle: '',
    nummer: '',
    von: '',
    bis: '',
  };
  const fehler = (w: Record<string, unknown>) => {
    const p = folienSchema.safeParse({ ...basis, wochentage: [], ...w });
    return p.success ? {} : Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message]));
  };

  it('Stelle: Sure:Vers oder Bereich bis fünf Verse', () => {
    expect(leseStelle('2:255')).toEqual({ sure: 2, von: 255, bis: 255 });
    expect(leseStelle(' 2 : 255 - 257 ')).toEqual({ sure: 2, von: 255, bis: 257 });
    expect(leseStelle('2:255–259')).toEqual({ sure: 2, von: 255, bis: 259 });
    expect(leseStelle('2:255-260')).toBeNull();
    expect(leseStelle('115:1')).toBeNull();
    expect(leseStelle('2:5-3')).toBeNull();
    expect(leseStelle('Al-Baqara 255')).toBeNull();
    expect(versBezug(2, 255, 257)).toBe('2:255–257');
  });

  it('Pflichtangaben je Art', () => {
    expect(fehler({ art: 'text' })).toEqual({ titelDe: 'pflicht' });
    expect(fehler({ art: 'text', titelDe: '[Titel]', textTr: '[metin]' })).toEqual({ textDe: 'deFehlt' });
    expect(fehler({ art: 'bild' })).toEqual({ bildId: 'bildFehlt' });
    expect(fehler({ art: 'vers', stelle: '2:300-400' })).toEqual({ stelle: 'stelle' });
    expect(fehler({ art: 'hadith', nummer: 'eins' })).toEqual({ nummer: 'nummer' });
    expect(fehler({ art: 'unbekannt' })).toMatchObject({ art: 'art' });
  });

  it('Zeitplan: vollständige Wanduhrzeit, bis nach von', () => {
    expect(fehler({ art: 'hadith', nummer: '1', von: '2026-10-13' })).toEqual({ von: 'zeitpunkt' });
    expect(fehler({ art: 'hadith', nummer: '1', von: '2026-10-13T18:00', bis: '2026-10-13T18:00' })).toEqual({ bis: 'bisVorVon' });
    expect(fehler({ art: 'hadith', nummer: '1', von: '2026-02-30T10:00' })).toEqual({ von: 'zeitpunkt' });
  });

  it('Wanduhrzeit in Wetzlar ↔ Zeitpunkt, auch über die Zeitumstellung', () => {
    expect(ausLokal('2026-10-13T18:00')?.toISOString()).toBe('2026-10-13T16:00:00.000Z');
    expect(ausLokal('2026-12-24T18:00')?.toISOString()).toBe('2026-12-24T17:00:00.000Z');
    expect(alsLokal(new Date('2026-12-24T17:00:00Z'))).toBe('2026-12-24T18:00');
    expect(alsLokal(null)).toBe('');
  });

  it('Datensatz: Vers und Hadith nur als Verweis, Text mehrsprachig; Rundreise über die Startwerte', () => {
    const vers = folienSchema.parse({ ...basis, art: 'vers', stelle: '2:255-256', wochentage: ['5', '5', '1'], titelDe: '[ignoriert]' });
    const d = folienDatensatz(vers);
    expect(d).toMatchObject({ art: 'vers', inhalt: { art: 'vers', sure: 2, von: 255, bis: 256 }, mediumId: null, wochentage: [1, 5] });
    expect(JSON.stringify(d.inhalt)).not.toContain('ignoriert');
    expect(folienWerte({ ...d, inhalt: d.inhalt })).toMatchObject({ art: 'vers', stelle: '2:255-256', wochentage: ['1', '5'] });

    const text = folienDatensatz(
      folienSchema.parse({
        ...basis,
        art: 'text',
        titelDe: ' [Titel] ',
        titelTr: '[Başlık]',
        textDe: 'Zeile 1\r\nZeile 2',
        wochentage: [],
      }),
    );
    expect(text.inhalt).toEqual({ art: 'text', titel: { de: '[Titel]', tr: '[Başlık]' }, text: { de: 'Zeile 1\nZeile 2' } });
    expect(folienDatensatz(folienSchema.parse({ ...basis, art: 'hadith', nummer: '402.2', wochentage: [] })).inhalt).toEqual({
      art: 'hadith',
      sammlungId: 'bukhari',
      nummer: '402.2',
    });
  });

  it('religiöse Arten und Sprachrückfall', () => {
    expect(['text', 'bild', 'vers', 'hadith'].map(istReligioes)).toEqual([false, false, true, true]);
    expect(textIn({ de: 'A', tr: 'B' }, 'tr')).toEqual({ text: 'B', sprache: 'tr' });
    expect(textIn({ de: 'A' }, 'en')).toEqual({ text: 'A', sprache: 'de' });
    expect(textIn(null, 'de')).toBeNull();
  });
});
