import { describe, expect, it } from 'vitest';
import { BUCHSTABEN, formen, zeichen } from '@/lib/elifbe/alphabet';
import { silbentafel, zufall } from '@/lib/elifbe/silben';
import {
  aufgabe,
  bewerteSpur,
  buchstabeVon,
  FORTSCHRITT_SCHLUESSEL,
  istRichtig,
  leseFortschritt,
  optionen,
  runde,
  trageEin,
  UEBUNGS_ARTEN,
  type UebungsDaten,
} from '@/lib/elifbe/uebung';

const daten: UebungsDaten = {
  buchstaben: BUCHSTABEN.map((b) => {
    const f = formen(b);
    return {
      slug: b.slug,
      name: b.elifbe,
      zeichen: zeichen(b),
      formen: { anfang: f.anfang, mitte: f.mitte, ende: f.ende },
      verbindet: b.verbindetRechts,
      verbindetLinks: b.verbindetLinks,
      aehnlich: b.aehnlich,
    };
  }),
  silben: silbentafel(BUCHSTABEN, ['fatha', 'kasra', 'damma']).flatMap(({ silben }) =>
    silben.flatMap((s) => (s ? [{ text: s.text, umschrift: s.umschrift.de, buchstabe: s.buchstabe }] : [])),
  ),
  spurBuchstaben: ['be', 'dal'],
};

describe('Übungen (H-E03)', () => {
  it('Antworten: vier verschiedene Texte, das Ziel ist dabei', () => {
    const o = optionen({ wert: 'x', text: 'X' }, [{ wert: 'y', text: 'X' }], [{ wert: 'a', text: 'A' }, { wert: 'b', text: 'B' }, { wert: 'c', text: 'C' }, { wert: 'd', text: 'D' }], zufall(1));
    expect(o).toHaveLength(4);
    expect(new Set(o.map((x) => x.text)).size).toBe(4);
    expect(o.map((x) => x.wert)).toContain('x');
    expect(o.map((x) => x.wert)).not.toContain('y');
  });

  it('jede Art erzeugt lösbare Aufgaben (über viele Ziehungen)', () => {
    const z = zufall(42);
    for (let i = 0; i < 200; i++) {
      for (const art of UEBUNGS_ARTEN) {
        const a = aufgabe(art, daten, z);
        expect(a.art).toBe(art);
        if (a.art === 'nachspuren') {
          expect(daten.spurBuchstaben).toContain(a.ziel);
          continue;
        }
        expect(a.optionen).toHaveLength(4);
        expect(new Set(a.optionen.map((o) => o.text)).size).toBe(4);
        expect(a.optionen.filter((o) => istRichtig(a, o.wert))).toHaveLength(1);
        expect(a.zeige.length).toBeGreaterThan(0);
        if (a.art === 'zuordnen') {
          const b = daten.buchstaben.find((x) => x.slug === a.ziel)!;
          expect(a.zeige).toBe(b.formen[a.form]);
          expect(b.verbindet).toBe(true);
          if (!b.verbindetLinks) expect(a.form).toBe('ende');
        }
        expect(daten.buchstaben.map((b) => b.slug)).toContain(buchstabeVon(a));
      }
    }
  });

  it('eine Runde hat acht Aufgaben, kein Ziel zweimal direkt hintereinander, Arten abwechselnd', () => {
    const r = runde(UEBUNGS_ARTEN, daten, zufall(5));
    expect(r).toHaveLength(8);
    for (let i = 1; i < r.length; i++) expect(r[i]!.ziel).not.toBe(r[i - 1]!.ziel);
    expect(new Set(r.map((a) => a.art)).size).toBe(4);
  });

  it('Nachspuren: genaue Spur gilt, grobe Spur in Richtung gilt, rückwärts und daneben nicht', () => {
    const zug = Array.from({ length: 40 }, (_, i) => [i * 10, 0] as [number, number]);
    expect(bewerteSpur(zug, zug, 60).ok).toBe(true);
    const wackelig = zug.filter((_, i) => i % 3 === 0).map(([x, y], i) => [x + 15, y + (i % 2 ? 30 : -30)] as [number, number]);
    expect(bewerteSpur(wackelig, zug, 60)).toMatchObject({ ok: true, richtung: true });
    expect(bewerteSpur([...zug].reverse(), zug, 60)).toMatchObject({ ok: false, richtung: false });
    expect(bewerteSpur(zug.map(([x]) => [x, 200] as [number, number]), zug, 60).ok).toBe(false);
    expect(bewerteSpur(zug.slice(0, 15), zug, 60).ok).toBe(false);
    expect(bewerteSpur([], zug, 60).ok).toBe(false);
  });

  it('Fortschritt: robust gegen kaputte Daten, zählt je Buchstabe, Schlüssel mit Präfix igmg-', () => {
    expect(FORTSCHRITT_SCHLUESSEL.startsWith('igmg-')).toBe(true);
    expect(leseFortschritt(null)).toEqual({ version: 1, buchstaben: {} });
    expect(leseFortschritt('kaputt')).toEqual({ version: 1, buchstaben: {} });
    expect(leseFortschritt('{"version":2,"buchstaben":{"be":3}}')).toEqual({ version: 1, buchstaben: {} });
    expect(leseFortschritt('{"version":1,"buchstaben":{"be":2,"<x>":1,"te":-1,"ra":"3"}}')).toEqual({ version: 1, buchstaben: { be: 2 } });
    const f = trageEin(trageEin(leseFortschritt(null), 'be'), 'be');
    expect(f.buchstaben.be).toBe(2);
    expect(leseFortschritt(JSON.stringify(f))).toEqual(f);
  });
});
