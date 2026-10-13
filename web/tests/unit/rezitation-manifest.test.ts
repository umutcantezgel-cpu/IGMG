import { describe, expect, it } from 'vitest';
import { leseQuranAlign, pruefeManifest } from '@/lib/audio/manifest';

/** Manifest des Imports lizenzierter Rezitationen (H-Q06): nur Testdaten, Pfade und Hashes erfunden. */
const H = (z: string) => z.repeat(64);
const gut = () => ({
  format: 1,
  rezitation: 'lizenz-test',
  name: { de: '[Lizenzierter Testsatz]', tr: '[Lisanslı deneme]' },
  rezitator: '[Rezitator]',
  lizenz: '[Lizenzangabe]',
  lizenzdatei: { datei: 'LIZENZ.pdf', sha256: H('a') },
  dateien: [
    { sure: 1, vers: 1, datei: 'audio/001001.mp3', sha256: H('b'), dauerMs: 4000 },
    { sure: 1, vers: 2, datei: 'audio/001002.mp3', sha256: H('c') },
    { sure: 112, datei: '112.m4a', sha256: H('d') },
  ],
  verszeiten: [
    [112, 1, 0, 2000],
    [112, 2, 2000, 4000],
  ],
});

describe('Manifest-Prüfung', () => {
  it('nimmt ein gültiges Manifest an; Vers fehlt = Datei je Sure', () => {
    const p = pruefeManifest(gut());
    expect(p.ok).toBe(true);
    if (p.ok) expect(p.manifest.dateien[2].vers).toBe(0);
  });

  it('Lizenzdatei ist Pflicht', () => {
    const m: Record<string, unknown> = gut();
    delete m.lizenzdatei;
    const p = pruefeManifest(m);
    expect(p.ok).toBe(false);
    if (!p.ok) expect(p.fehler.join(' ')).toContain('lizenzdatei');
  });

  it('weist falsche Hashes, Pfadausbrüche, Kennungen und Formate ab', () => {
    const faelle: [string, (m: ReturnType<typeof gut>) => void, string][] = [
      ['sha', (m) => (m.dateien[0].sha256 = 'ABC'), 'SHA-256'],
      ['pfad', (m) => (m.dateien[0].datei = '../geheim.mp3'), 'relativer Pfad'],
      ['absolut', (m) => (m.lizenzdatei.datei = '/etc/passwd'), 'relativer Pfad'],
      ['kennung', (m) => (m.rezitation = 'Mit Leerzeichen'), 'a–z'],
      ['format', (m) => (m.format = 2), 'format'],
      ['sure', (m) => (m.dateien[0].sure = 115), 'dateien.0.sure'],
    ];
    for (const [, aendern, erwartet] of faelle) {
      const m = gut();
      aendern(m);
      const p = pruefeManifest(m);
      expect(p.ok).toBe(false);
      if (!p.ok) expect(p.fehler.join(' ')).toContain(erwartet);
    }
  });

  it('doppelte Stellen, gemischte Ablage und Verszeiten ohne Sure-Datei', () => {
    const m = gut();
    m.dateien.push({ sure: 1, vers: 1, datei: 'x.mp3', sha256: H('e') }, { sure: 1, datei: 'ganz.mp3', sha256: H('f') } as never);
    m.verszeiten.push([2, 1, 100, 50]);
    const p = pruefeManifest(m);
    expect(p.ok).toBe(false);
    if (!p.ok) {
      const text = p.fehler.join('\n');
      expect(text).toContain('Sure 1, Vers 1 doppelt');
      expect(text).toContain('Sure 1 mischt');
      expect(text).toContain('Sure 2 hat keine Datei je Sure');
      expect(text).toContain('endet nicht nach dem Start');
    }
  });
});

describe('quran-align-Zeiten', () => {
  const ANZAHL: Record<string, number> = { '1:1': 4, '1:2': 4 };
  const woerter = (s: number, v: number) => ANZAHL[`${s}:${v}`];

  it('Segmente je Wort (ab 0) ergeben Positionen ab 1; Mehrwort-Segmente werden geteilt', () => {
    const { zeiten, fehler } = leseQuranAlign(
      [
        {
          surah: 1,
          ayah: 1,
          segments: [
            [0, 1, 0, 500],
            [1, 2, 500, 900],
            [2, 4, 900, 1700],
          ],
          stats: { insertions: 0 },
        },
        { surah: 1, ayah: 2, segments: [[0, 4, 0, 800]] },
      ],
      woerter,
    );
    expect(fehler).toEqual([]);
    expect(zeiten.filter((z) => z.vers === 1)).toEqual([
      { sure: 1, vers: 1, pos: 1, startMs: 0, endeMs: 500 },
      { sure: 1, vers: 1, pos: 2, startMs: 500, endeMs: 900 },
      { sure: 1, vers: 1, pos: 3, startMs: 900, endeMs: 1300 },
      { sure: 1, vers: 1, pos: 4, startMs: 1300, endeMs: 1700 },
    ]);
    expect(zeiten.filter((z) => z.vers === 2).map((z) => z.startMs)).toEqual([0, 200, 400, 600]);
  });

  it('unvollständige, unbekannte oder fehlerhafte Verse werden nicht übernommen', () => {
    const { zeiten, fehler } = leseQuranAlign(
      [
        { surah: 1, ayah: 1, segments: [[0, 1, 0, 500]] },
        { surah: 1, ayah: 2, segments: [[0, 5, 0, 800]] },
        { surah: 9, ayah: 9, segments: [[0, 1, 0, 100]] },
      ],
      woerter,
    );
    expect(zeiten).toEqual([]);
    expect(fehler).toEqual([
      'quran-align 1:1: Wort 2 ohne Zeit',
      'quran-align 1:2: Segment außerhalb der 4 Wörter',
      'quran-align 9:9: Vers unbekannt',
    ]);
  });

  it('nicht aufsteigend und unbekanntes Format', () => {
    expect(
      leseQuranAlign(
        [
          {
            surah: 1,
            ayah: 1,
            segments: [
              [1, 4, 0, 300],
              [0, 1, 600, 900],
            ],
          },
        ],
        woerter,
      ).fehler,
    ).toEqual(['quran-align 1:1: Zeiten nicht aufsteigend']);
    expect(leseQuranAlign({ nicht: 'liste' }, woerter).fehler[0]).toContain('unbekanntes Format');
  });
});
