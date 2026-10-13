import { describe, expect, it } from 'vitest';
import glyphen from '@/lib/elifbe/glyphen.json';
import { BUCHSTABEN, buchstabeFuer, FORM_ARTEN, formen, HARAKAT, hex, SLUGS, ZWJ, zeichen } from '@/lib/elifbe/alphabet';

/** Arabische Darstellungsformen (Presentation Forms A/B) – dürfen nirgends vorkommen. */
const DARSTELLUNGSFORM = /[ﭐ-﷿ﹰ-﻿]/u;

describe('Elifbe-Alphabet (Codepunkte, H-E01)', () => {
  it('hat 29 Einträge: 28 Buchstaben in Elifbe-Reihenfolge und die Hamza am Ende', () => {
    expect(BUCHSTABEN).toHaveLength(29);
    expect(BUCHSTABEN.map((b) => b.nr)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
    expect(BUCHSTABEN[0]?.codepunkt).toBe(0x0627);
    expect(BUCHSTABEN[27]?.codepunkt).toBe(0x064a);
    expect(BUCHSTABEN[28]?.codepunkt).toBe(0x0621);
  });

  it('Slugs sind eindeutig, ASCII und finden ihren Buchstaben', () => {
    expect(new Set(SLUGS).size).toBe(29);
    for (const s of SLUGS) {
      expect(s).toMatch(/^[a-z]+$/);
      expect(buchstabeFuer(s)?.slug).toBe(s);
    }
    expect(buchstabeFuer('gibt-es-nicht')).toBeUndefined();
  });

  it('Codepunkte sind eindeutig und liegen im arabischen Grundblock', () => {
    expect(new Set(BUCHSTABEN.map((b) => b.codepunkt)).size).toBe(29);
    for (const b of BUCHSTABEN) {
      expect(b.codepunkt).toBeGreaterThanOrEqual(0x0621);
      expect(b.codepunkt).toBeLessThanOrEqual(0x064a);
      expect(zeichen(b)).toBe(String.fromCodePoint(b.codepunkt));
      expect(hex(b.codepunkt)).toMatch(/^06[0-9A-F]{2}$/);
    }
  });

  it('jede Form enthält den Codepunkt, nur ZWJ als Zusatz, keine Darstellungsformen', () => {
    for (const b of BUCHSTABEN) {
      const f = formen(b);
      for (const art of FORM_ARTEN) {
        expect(f[art]).toContain(zeichen(b));
        expect(f[art].replaceAll(ZWJ, '')).toBe(zeichen(b));
        expect(f[art]).not.toMatch(DARSTELLUNGSFORM);
      }
      expect(f.isoliert).toBe(zeichen(b));
    }
  });

  it('verbindende Buchstaben: Anfang = Zeichen + ZWJ, Mitte = ZWJ + Zeichen + ZWJ, Ende = ZWJ + Zeichen', () => {
    const be = buchstabeFuer('be')!;
    const z = zeichen(be);
    expect(formen(be)).toEqual({ isoliert: z, anfang: z + ZWJ, mitte: ZWJ + z + ZWJ, ende: ZWJ + z });
  });

  it('nicht nach links verbindend: Elif, Dal, Zel, Ra, Ze, Vav (und die Hamza gar nicht)', () => {
    const nichtLinks = BUCHSTABEN.filter((b) => !b.verbindetLinks).map((b) => b.slug);
    expect(nichtLinks).toEqual(['elif', 'dal', 'zel', 'ra', 'ze', 'vav', 'hemze']);
    const dal = buchstabeFuer('dal')!;
    expect(formen(dal).anfang).toBe(formen(dal).isoliert);
    expect(formen(dal).mitte).toBe(formen(dal).ende);
    const hemze = buchstabeFuer('hemze')!;
    expect(hemze.verbindetRechts).toBe(false);
    expect(new Set(Object.values(formen(hemze))).size).toBe(1);
  });

  it('Punkte: Anzahl und Lage passen zueinander', () => {
    for (const b of BUCHSTABEN) {
      expect(b.punkte.anzahl === 0).toBe(b.punkte.lage === 'keine');
    }
    expect(buchstabeFuer('se')?.punkte).toEqual({ anzahl: 3, lage: 'oben' });
    expect(buchstabeFuer('ye')?.punkte).toEqual({ anzahl: 2, lage: 'unten' });
    expect(buchstabeFuer('cim')?.punkte).toEqual({ anzahl: 1, lage: 'innen' });
  });

  it('ähnliche Buchstaben verweisen auf vorhandene, andere Buchstaben', () => {
    for (const b of BUCHSTABEN) {
      expect(b.aehnlich.length).toBeGreaterThan(0);
      for (const a of b.aehnlich) {
        expect(SLUGS).toContain(a);
        expect(a).not.toBe(b.slug);
      }
    }
  });

  it('Namen gibt es in drei Sprachen; tr ist der Elifbâ-Name', () => {
    for (const b of BUCHSTABEN) {
      expect(b.name.de && b.name.tr && b.name.en).toBeTruthy();
      expect(b.name.tr).toBe(b.elifbe);
      expect(['halk', 'lisan', 'sefeteyn', 'cevf']).toContain(b.mahrec);
    }
  });

  it('Harakat sind Codepunkte U+064B–U+0652, eindeutig, mit Namen', () => {
    expect(HARAKAT.map((h) => h.schluessel)).toEqual(['fatha', 'kasra', 'damma', 'sukun', 'shadda', 'fathatan', 'kasratan', 'dammatan']);
    expect(new Set(HARAKAT.map((h) => h.codepunkt)).size).toBe(8);
    for (const h of HARAKAT) {
      expect(h.codepunkt).toBeGreaterThanOrEqual(0x064b);
      expect(h.codepunkt).toBeLessThanOrEqual(0x0652);
      expect(h.name.tr).toBeTruthy();
    }
  });
});

describe('Glyphen (glyphen.json aus Amiri, B-17)', () => {
  const g = glyphen.glyphen as Record<string, { rumpf: string; punkte: string[]; box: number[] }>;

  it('hat für jeden Buchstaben einen Umriss mit Rahmen und nennt Quelle und Lizenz', () => {
    expect(Object.keys(g).sort()).toEqual([...SLUGS].sort());
    expect(glyphen.quelle.lizenz).toBe('SIL Open Font License 1.1');
    for (const s of SLUGS) {
      expect(g[s]?.rumpf).toMatch(/^M-?\d/);
      expect(g[s]?.box).toHaveLength(4);
    }
  });

  it('Buchstaben ohne Punkte haben keine Punktform – außer dem Zeichen im Kef', () => {
    for (const b of BUCHSTABEN) {
      const formenZahl = g[b.slug]?.punkte.length ?? 0;
      if (b.slug === 'kef') expect(formenZahl).toBe(1);
      else if (b.punkte.anzahl === 0) expect(formenZahl).toBe(0);
      else expect(formenZahl).toBeGreaterThan(0);
    }
  });
});
