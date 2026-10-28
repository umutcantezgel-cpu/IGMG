import { describe, expect, it } from 'vitest';
import { leseEingefuegt, leseTabelle } from '@/lib/gebetszeiten/import';
import {
  buchstaben,
  lieferungAus,
  normalisiereZeit,
  reihenfolgeOk,
  spalteAus,
  spaltenFolge,
} from '@/lib/gebetszeiten/quellen/normalisieren';
import { EINGEFUEGT, TAGE } from '../../hilfen/igmg-aachen-2026-10';

/**
 * Normalisierung der Gebetszeit-Tabellen (ADR 0048): Köpfe des IGMG-Kalenders (Fehler „İmsak“/„İkindi“ an
 * `toLowerCase()` behoben), Aliase und kombinierte Köpfe, eingefügte Tabelle von igmg.org (Testdaten Aachen 10/2026 mit
 * Zustimmung der IGMG), Formate eines offiziellen Feeds (JSON, CSV, ISO-Zeitpunkte mit Versatz).
 */
describe('Köpfe', () => {
  it('„İmsak“ und „İkindi“ werden erkannt (vorher: „i̇msak“ mit Kombinationspunkt)', () => {
    expect('İmsak'.toLowerCase()).not.toBe('imsak');
    expect(buchstaben('İmsak')).toBe('imsak');
    expect(spalteAus('İmsak')).toBe('imsak');
    expect(spalteAus('İkindi')).toBe('ikindi');
  });

  it.each([
    ['Tarih', 'datum'],
    ['Datum', 'datum'],
    ['Tarih/Datum', 'datum'],
    ['TarihDatum', 'datum'],
    ['Güneş', 'gunes'],
    ['S.aufgang', 'gunes'],
    ['Öğle', 'ogle'],
    ['Mittag', 'ogle'],
    ['N.mittag', 'ikindi'],
    ['Nachmittag', 'ikindi'],
    ['Akşam', 'aksam'],
    ['Abend', 'aksam'],
    ['Yatsı', 'yatsi'],
    ['Nacht', 'yatsi'],
    ['İmsak/Morgen', 'imsak'],
    ['fajr', 'imsak'],
    ['isha', 'yatsi'],
  ])('%s → %s', (kopf, spalte) => {
    expect(spalteAus(kopf)).toBe(spalte);
  });

  it('unbekannte Köpfe und gemischte Spalten in einem Kopf sind keine Spalte', () => {
    expect(spalteAus('Bemerkung')).toBeNull();
    expect(spalteAus('İmsak Güneş')).toBeNull();
  });

  it('Kopfzeile der Seite in jeder kopierten Form ergibt die Spaltenfolge', () => {
    const folge = ['datum', 'imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];
    expect(spaltenFolge('TarihDatum İmsakMorgen GüneşS.aufgang ÖğleMittag İkindiN.mittag AkşamAbend YatsıNacht')).toEqual(folge);
    expect(
      spaltenFolge(
        '**Tarih****Datum****İmsak****Morgen****Güneş****S.aufgang****Öğle****Mittag****İkindi****N.mittag****Akşam****Abend****Yatsı****Nacht**',
      ),
    ).toEqual(folge);
  });
});

describe('Datei-Import mit IGMG-Köpfen', () => {
  it('liest CSV mit den türkisch-deutschen Köpfen des Kalenders', () => {
    const csv = ['Tarih/Datum;İmsak;Güneş;Öğle;İkindi;Akşam;Yatsı', '01.10.2026;05:45;07:28;13:30;16:37;19:22;20:52'].join('\n');
    const r = leseTabelle(csv, 'csv');
    expect(r).toMatchObject({ ok: true, von: '2026-10-01' });
    if (r.ok) expect(r.tage[0]).toMatchObject({ imsak: '05:45', ikindi: '16:37', quelle: 'import' });
  });

  it('Yatsı nach Mitternacht ist eine gültige Reihenfolge, Yatsı zwischen Akşam und İmsak nicht', () => {
    const z = { imsak: '02:58', gunes: '05:06', ogle: '13:33', ikindi: '17:55', aksam: '21:50', yatsi: '00:20' };
    expect(reihenfolgeOk(z)).toBe(true);
    expect(reihenfolgeOk({ ...z, yatsi: '03:10' })).toBe(false);
    expect(reihenfolgeOk({ ...z, yatsi: '21:40' })).toBe(false);
    const json = JSON.stringify([{ datum: '2026-06-21', ...z }]);
    expect(leseTabelle(json, 'json').ok).toBe(true);
  });
});

describe('Eingefügte Tabelle aus dem IGMG-Gebetskalender', () => {
  it('liest die kopierte Tabelle (Ortsname, zweisprachiger Kopf, 31 Zeilen) als IGMG-Tage', () => {
    const r = leseEingefuegt(EINGEFUEGT);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r).toMatchObject({ von: '2026-10-01', bis: '2026-10-31', ort: 'Aachen' });
    expect(r.tage).toHaveLength(31);
    expect(r.tage.every((t) => t.quelle === 'igmg')).toBe(true);
    expect(r.tage.map(({ quelle: _q, ...rest }) => rest)).toEqual(TAGE);
  });

  it('lehnt eine Tabelle eines anderen Ortes ab (Aachen statt Wetzlar)', () => {
    expect(leseEingefuegt(EINGEFUEGT, 'Wetzlar')).toEqual({ ok: false, fehler: [{ zeile: 0, fehler: 'stadt' }] });
    expect(leseEingefuegt(EINGEFUEGT, 'Aachen').ok).toBe(true);
  });

  it('liest auch die Fassung ohne Trenner (Markdown der Seite) und Tabulatoren', () => {
    const md = [
      '### Aachen (DE)',
      '',
      '**Tarih****Datum****İmsak****Morgen**',
      '',
      '01.10.202605:4507:2813:3016:3719:2220:52',
      '',
      '02.10.202605:4707:3013:3016:3619:2020:50',
    ].join('\n');
    const r = leseEingefuegt(md);
    expect(r).toMatchObject({ ok: true, von: '2026-10-01', bis: '2026-10-02' });
    const tab = '01.10.2026\t05:45\t07:28\t13:30\t16:37\t19:22\t20:52';
    expect(leseEingefuegt(tab)).toMatchObject({ ok: true, ort: null });
  });

  it('Zeilen mit fehlenden Zeiten sind Formatfehler mit Zeilennummer; Text ohne Datum ist leer', () => {
    expect(leseEingefuegt('Wetzlar (DE)\n01.10.2026 05:45 07:28 13:30')).toEqual({ ok: false, fehler: [{ zeile: 2, fehler: 'format' }] });
    expect(leseEingefuegt('Wie viele Websites benutzt auch …')).toEqual({ ok: false, fehler: [{ zeile: 0, fehler: 'leer' }] });
  });
});

describe('Lieferung eines offiziellen Zugangs', () => {
  it('JSON als Liste mit englischen Köpfen', () => {
    const r = lieferungAus(
      JSON.stringify([
        { date: '2026-11-01', fajr: '6:20', sunrise: '7:58', dhuhr: '13:16', asr: '15:52', maghrib: '18:23', isha: '19:56' },
      ]),
      'json',
    );
    expect(r).toEqual({
      ok: true,
      tage: [{ datum: '2026-11-01', imsak: '06:20', gunes: '07:58', ogle: '13:16', ikindi: '15:52', aksam: '18:23', yatsi: '19:56' }],
      stand: null,
      ort: { id: null, name: null },
    });
  });

  it('JSON-Objekt mit Tagen, Stand und Ort; ISO-Zeitpunkte mit Versatz → Berliner Wanduhr', () => {
    const r = lieferungAus(
      JSON.stringify({
        stadtId: 20238,
        stadt: 'Wetzlar',
        stand: '2026-10-28',
        tage: [
          {
            datum: '2026-11-01',
            imsak: '2026-11-01T05:20:00Z',
            gunes: '2026-11-01T06:58:00Z',
            ogle: '2026-11-01T12:16:00+01:00',
            ikindi: '14:52',
            aksam: '17:23',
            yatsi: '18:56',
          },
        ],
      }),
      'json',
    );
    expect(r).toMatchObject({ ok: true, stand: '2026-10-28', ort: { id: '20238', name: 'Wetzlar' } });
    if (r.ok) expect(r.tage[0]).toMatchObject({ imsak: '06:20', gunes: '07:58', ogle: '12:16' });
    expect(normalisiereZeit('2026-07-01T03:10:00Z')).toBe('05:10');
  });

  it('CSV mit den Köpfen des Kalenders; fehlende Zeiten oder fremdes Format → Formatfehler', () => {
    expect(lieferungAus('Tarih;İmsak;Güneş;Öğle;İkindi;Akşam;Yatsı\n01.11.2026;06:20;07:58;13:16;15:52;18:23;19:56', 'csv')).toMatchObject({
      ok: true,
    });
    expect(lieferungAus('Tarih;İmsak\n01.11.2026;06:20', 'csv')).toEqual({ ok: false, fehler: 'format' });
    expect(lieferungAus('{"nichts":1}', 'json')).toEqual({ ok: false, fehler: 'format' });
    expect(lieferungAus('kein json', 'json')).toEqual({ ok: false, fehler: 'format' });
    expect(lieferungAus('[]', 'json')).toEqual({ ok: false, fehler: 'leer' });
  });
});
