import { describe, expect, it } from 'vitest';
import glyphen from '@/lib/elifbe/glyphen.json';
import { BUCHSTABEN } from '@/lib/elifbe/alphabet';
import { ausschnitt, ende, RAHMEN, zeitplan } from '@/lib/elifbe/schreibweg';
import { anfang, schreibweg } from '@/lib/elifbe/zuege';

const G = glyphen.glyphen as Record<string, { box: number[]; punkte: string[] }>;
/** Erwartete Punkte und Zeichen je Buchstabe (Zahl der Punktzüge): Punkte laut Alphabet, dazu das Zeichen im Kef. */
const erwartetePunkte = (slug: string, anzahl: number) => (slug === 'kef' ? 1 : anzahl);

describe('Schreibweg (B-17)', () => {
  it('jeder Buchstabe hat mindestens einen Hauptzug und so viele Punktzüge wie Punkte', () => {
    for (const b of BUCHSTABEN) {
      const w = schreibweg(b);
      expect(w.zuege.length, b.slug).toBeGreaterThan(0);
      expect(w.punkte.length, b.slug).toBe(erwartetePunkte(b.slug, b.punkte.anzahl));
    }
  });

  it('Züge sind SVG-Pfade mit Breite und Länge; der Anfang liegt im Rahmen der Glyphe', () => {
    for (const b of BUCHSTABEN) {
      const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = G[b.slug]!.box;
      for (const z of [...schreibweg(b).zuege, ...schreibweg(b).punkte]) {
        expect(z.d).toMatch(/^M-?\d+ -?\d+[CL]/);
        expect(z.breite).toBeGreaterThan(40);
        expect(z.laenge).toBeGreaterThan(0);
        const [x, y] = anfang(z.d);
        expect(x, b.slug).toBeGreaterThanOrEqual(x1 - 20);
        expect(x, b.slug).toBeLessThanOrEqual(x2 + 20);
        expect(y, b.slug).toBeGreaterThanOrEqual(y1 - 20);
        expect(y, b.slug).toBeLessThanOrEqual(y2 + 20);
      }
    }
  });

  it('Schreibrichtung rechts nach links: kein erster Zug beginnt am linken Ende (Elif ist senkrecht)', () => {
    for (const b of BUCHSTABEN) {
      if (b.slug === 'elif') continue;
      const [x1 = 0, , x2 = 0] = G[b.slug]!.box;
      const [x] = anfang(schreibweg(b).zuege[0]!.d);
      // Mim und die Kopf-Buchstaben beginnen am Kopf, nie am linken Ende der Glyphe
      expect(x, b.slug).toBeGreaterThan(x1 + (x2 - x1) * 0.2);
    }
  });

  it('Zeitplan: Züge nacheinander, Punkte danach, alles in höchstens 1,6 s (Vorlauf eingeschlossen)', () => {
    for (const b of BUCHSTABEN) {
      const w = schreibweg(b);
      const plan = zeitplan(w, 1600 - 160, 160);
      expect(ende(plan), b.slug).toBeLessThanOrEqual(1600);
      const folge = [...plan.zuege, ...plan.punkte];
      for (let i = 1; i < folge.length; i++) {
        expect(folge[i]!.verzoegerung).toBeGreaterThanOrEqual(folge[i - 1]!.verzoegerung + folge[i - 1]!.dauer);
      }
      expect(plan.zuege[0]?.verzoegerung).toBe(160);
      for (const t of folge) expect(t.dauer).toBeGreaterThan(0);
    }
  });

  it('Ausschnitt: gemeinsamer quadratischer Rahmen mit gleicher Grundlinie, mittig auf der Glyphe', () => {
    const [x, y, w, h] = ausschnitt([100, -500, 500, 100]);
    expect([y, w, h]).toEqual([RAHMEN.oben, RAHMEN.groesse, RAHMEN.groesse]);
    expect(x + w / 2).toBe(300);
    for (const b of BUCHSTABEN) {
      const [, gy1 = 0, , gy2 = 0] = G[b.slug]!.box;
      expect(gy1, b.slug).toBeGreaterThanOrEqual(RAHMEN.oben);
      expect(gy2, b.slug).toBeLessThanOrEqual(RAHMEN.oben + RAHMEN.groesse);
    }
  });
});
