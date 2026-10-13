import { describe, expect, it } from 'vitest';
import { BUCHSTABEN, buchstabeFuer, haraka } from '@/lib/elifbe/alphabet';
import { buchstabenDer, LEKTIONEN, lektionFuer, STATIONEN } from '@/lib/elifbe/lektionen';
import { erlaubt, lesereihen, mischen, silbe, silbentafel, zufall } from '@/lib/elifbe/silben';

const cp = (...n: number[]) => String.fromCodePoint(...n);
const BE = 0x0628;
const ELIF = 0x0627;

describe('Silben aus Codepunkten (H-E02)', () => {
  const be = buchstabeFuer('be')!;

  it('Buchstabe + Haraka; Umschrift a/i/u, Tanwin mit n', () => {
    expect(silbe(be, 'fatha')).toMatchObject({ text: cp(BE, 0x064e), umschrift: { de: 'ba', tr: 'ba', en: 'ba' }, schluessel: 'silbe:0628-064E' });
    expect(silbe(be, 'kasra').umschrift.de).toBe('bi');
    expect(silbe(be, 'damma').umschrift.de).toBe('bu');
    expect(silbe(be, 'fathatan')).toMatchObject({ text: cp(BE, 0x064b), umschrift: { de: 'ban' } });
    expect(silbe(be, 'kasratan').umschrift.en).toBe('bin');
    expect(silbe(be, 'dammatan').umschrift.tr).toBe('bun');
  });

  it('Sukun und Shadda mit Elif und Fatha davor („ab“, „abba“)', () => {
    expect(silbe(be, 'sukun')).toMatchObject({ text: cp(ELIF, 0x064e, BE, 0x0652), umschrift: { de: 'ab' } });
    expect(silbe(be, 'shadda')).toMatchObject({ text: cp(ELIF, 0x064e, BE, 0x0651, 0x064e), umschrift: { de: 'abba' } });
    // Lautgruppen werden nur mit dem ersten Zeichen verdoppelt
    expect(silbe(buchstabeFuer('cim')!, 'shadda').umschrift.de).toBe('addscha');
  });

  it('Dehnung (Med): Fatha + Elif, Kasra + Ye, Damma + Vav', () => {
    expect(silbe(be, 'med-fatha')).toMatchObject({ text: cp(BE, 0x064e, ELIF), umschrift: { de: 'bā' } });
    expect(silbe(be, 'med-kasra')).toMatchObject({ text: cp(BE, 0x0650, 0x064a), umschrift: { de: 'bī' } });
    expect(silbe(be, 'med-damma')).toMatchObject({ text: cp(BE, 0x064f, 0x0648), umschrift: { de: 'bū' } });
  });

  it('Elif trägt den Vokal (Umschrift nur Vokal) und weder Sukun noch Shadda; ebenso die Hamza', () => {
    const elif = buchstabeFuer('elif')!;
    expect(silbe(elif, 'fatha').umschrift.de).toBe('a');
    for (const slug of ['elif', 'hemze']) {
      expect(erlaubt({ slug }, 'sukun')).toBe(false);
      expect(erlaubt({ slug }, 'shadda')).toBe(false);
      expect(erlaubt({ slug }, 'fatha')).toBe(true);
    }
    expect(erlaubt({ slug: 'be' }, 'sukun')).toBe(true);
  });

  it('jede Silbe enthält den Buchstaben und nur Zeichen aus dem arabischen Grundblock', () => {
    for (const b of BUCHSTABEN) {
      for (const h of ['fatha', 'kasra', 'damma', 'sukun', 'shadda', 'fathatan', 'kasratan', 'dammatan', 'med-fatha'] as const) {
        if (!erlaubt(b, h)) continue;
        const s = silbe(b, h);
        expect(s.text).toContain(String.fromCodePoint(b.codepunkt));
        for (const c of s.text) expect(c.codePointAt(0)!).toBeGreaterThanOrEqual(0x0621);
        for (const c of s.text) expect(c.codePointAt(0)!).toBeLessThanOrEqual(0x0652);
      }
    }
    expect(haraka('fatha').codepunkt).toBe(0x064e);
  });

  it('Silbentafel: je Buchstabe eine Zeile, je Art eine Spalte, nicht Erlaubtes leer', () => {
    const tafel = silbentafel(BUCHSTABEN, ['fatha', 'sukun']);
    expect(tafel).toHaveLength(29);
    for (const zeile of tafel) expect(zeile.silben).toHaveLength(2);
    expect(tafel[0]?.silben[1]).toBeNull();
    expect(tafel[1]?.silben[1]?.umschrift.de).toBe('ab');
  });

  it('Lesereihen: fest gemischt (gleiche Saat, gleiche Reihen), jede erlaubte Silbe genau einmal', () => {
    const a = lesereihen(BUCHSTABEN, ['fatha', 'kasra', 'damma'], 4);
    const b = lesereihen(BUCHSTABEN, ['fatha', 'kasra', 'damma'], 4);
    expect(a).toEqual(b);
    const alle = a.flat().map((s) => s.schluessel);
    expect(alle).toHaveLength(87);
    expect(new Set(alle).size).toBe(87);
    expect(a.every((r) => r.length <= 6)).toBe(true);
    expect(lesereihen(BUCHSTABEN, ['fatha'], 1).map((r) => r.map((s) => s.buchstabe))).not.toEqual(
      lesereihen(BUCHSTABEN, ['fatha'], 2).map((r) => r.map((s) => s.buchstabe)),
    );
  });

  it('mischen vertauscht nur (Permutation) und zufall ist wiederholbar', () => {
    const liste = Array.from({ length: 20 }, (_, i) => i);
    const m = mischen(liste, zufall(7));
    expect([...m].sort((x, y) => x - y)).toEqual(liste);
    expect(zufall(3)()).toBe(zufall(3)());
  });
});

describe('Lektionen und Stationen (Platzhalter bis MN-07)', () => {
  it('acht Lektionen mit eindeutigen Slugs und Nummern; Stationen: Buchstaben, Formen, Lektionen, Üben', () => {
    expect(LEKTIONEN.map((l) => l.slug)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    expect(new Set(LEKTIONEN.map((l) => l.schluessel)).size).toBe(8);
    expect(STATIONEN).toHaveLength(11);
    expect(STATIONEN[0]).toEqual({ art: 'buchstaben' });
    expect(STATIONEN.at(-1)).toEqual({ art: 'ueben' });
    expect(lektionFuer('4')?.arten).toEqual(['fatha', 'kasra', 'damma']);
    expect(lektionFuer('9')).toBeUndefined();
    expect(buchstabenDer(LEKTIONEN[0]!)).toHaveLength(29);
  });

  it('jede Lektion ergibt eine nicht leere Silbentafel', () => {
    for (const l of LEKTIONEN) {
      const tafel = silbentafel(buchstabenDer(l), l.arten);
      expect(tafel.flatMap((z) => z.silben).filter(Boolean).length).toBeGreaterThan(20);
    }
  });
});
