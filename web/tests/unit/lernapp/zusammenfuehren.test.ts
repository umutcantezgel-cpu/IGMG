import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ABLEITUNGS_VERSION, type Ableitung, heuteStand, leiteAb } from '@/lib/lernapp/ereignisse/ableiten';
import { type Ereignis, EreignisEntwurfSchema, EreignisSchema, TAGESZIEL_STANDARD } from '@/lib/lernapp/ereignisse/typen';
import { ereignisSchluessel, fehlende, kanonisch, vereinige } from '@/lib/lernapp/ereignisse/zusammenfuehren';

/**
 * Zusammenführung (ADR 0038 Nr. 4): Vereinigung über (geraet, seq) ist idempotent, kommutativ und assoziativ; alle
 * abgeleiteten Zustände hängen nur von der Menge der Ereignisse ab, nicht von der Reihenfolge des Abgleichs.
 */
const G1 = '00000000-0000-4000-8000-00000000000a';
const G2 = '00000000-0000-4000-8000-00000000000b';
const G3 = '00000000-0000-4000-8000-00000000000c';

let zaehler = 0;
function e<A extends Ereignis['art']>(
  art: A,
  daten: Extract<Ereignis, { art: A }>['daten'],
  am: string,
  geraet = G1,
  seq?: number,
): Ereignis {
  return EreignisSchema.parse({ geraet, seq: seq ?? zaehler++, am, tag: am.slice(0, 10), art, daten });
}

/** Ableitung als vergleichbarer Wert (Maps und Sets als sortierte Listen). */
const alsWert = (a: Ableitung) =>
  JSON.parse(JSON.stringify(a, (_k, v) => (v instanceof Map ? [...v] : v instanceof Set ? [...v].sort() : v)));

describe('Schema', () => {
  const kopf = { geraet: G1, seq: 0, am: '2026-10-17T10:00:00.000+02:00', tag: '2026-10-17' };

  it('nimmt gültige Ereignisse jeder Art', () => {
    const daten = {
      bewertung: { karte: 'tr.a1.l0001', note: 'gut', kurs: 'tr-aus-de' },
      lektion: { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l01', art: 'lektion', richtig: 11, gesamt: 12 },
      xp: { menge: 10, grund: 'lektion', bezug: 'tr-aus-de.a1.e01.l01' },
      pause: { von: '2026-10-20', bis: '2026-10-24' },
      einstellung: { schluessel: 'pausetage', wert: 3 },
      einstufung: { kurs: 'tr-aus-de', stufe: 'a2', richtig: 14, gesamt: 20 },
      tagesziel: { ziel: { art: 'xp', wert: 20 } },
    } as const;
    for (const [art, d] of Object.entries(daten)) {
      expect(EreignisSchema.safeParse({ ...kopf, art, daten: d }).success, art).toBe(true);
      expect(EreignisEntwurfSchema.safeParse({ art, daten: d }).success, art).toBe(true);
    }
  });

  it.each([
    ['Gerät keine UUID', { geraet: 'abc' }],
    ['Lerntag ungültig', { tag: '2026-02-30' }],
    ['Zeit ohne Zone', { am: '2026-10-17T10:00:00' }],
    ['Nummer negativ', { seq: -1 }],
    ['unbekannte Art', { art: 'herz', daten: {} }],
    ['richtig > gesamt', { art: 'lektion', daten: { kurs: 'k', lektion: 'l', art: 'lektion', richtig: 3, gesamt: 2 } }],
    ['XP 0', { art: 'xp', daten: { menge: 0, grund: 'lektion' } }],
    ['XP über 20', { art: 'xp', daten: { menge: 21, grund: 'lektion' } }],
    ['Pause über 30 Tage', { art: 'pause', daten: { von: '2026-01-01', bis: '2026-02-15' } }],
    ['Pause rückwärts', { art: 'pause', daten: { von: '2026-01-05', bis: '2026-01-01' } }],
    ['Tagesziel nicht erlaubt', { art: 'tagesziel', daten: { ziel: { art: 'xp', wert: 25 } } }],
    ['Note Easy', { art: 'bewertung', daten: { karte: 'k', note: 'leicht' } }],
    ['zusätzliches Feld', { art: 'bewertung', daten: { karte: 'k', note: 'gut' }, extra: 1 }],
  ])('weist ab: %s', (_name, aenderung) => {
    expect(EreignisSchema.safeParse({ ...kopf, art: 'bewertung', daten: { karte: 'k', note: 'gut' }, ...aenderung }).success).toBe(false);
  });
});

describe('Vereinigung', () => {
  const a = e('bewertung', { karte: 'k1', note: 'gut' }, '2026-10-01T10:00:00.000Z', G1, 0);
  const b = e('bewertung', { karte: 'k1', note: 'nochmal' }, '2026-10-01T11:00:00.000Z', G2, 0);
  const c = e('xp', { menge: 10, grund: 'lektion' }, '2026-10-01T09:00:00.000Z', G1, 1);

  it('ohne Doppelte, sortiert nach Zeit, Gerät, Nummer', () => {
    expect(vereinige([a, b], [b, c], [a]).map(ereignisSchluessel)).toEqual([`${G1}#1`, `${G1}#0`, `${G2}#0`]);
  });

  it('Widerspruch unter gleichem Schlüssel: kanonisch kleinere Fassung gewinnt, unabhängig von der Reihenfolge', () => {
    const anders = EreignisSchema.parse({ ...a, daten: { karte: 'k1', note: 'schwer' } });
    expect(vereinige([a], [anders])).toEqual(vereinige([anders], [a]));
    expect(vereinige([a], [anders])).toHaveLength(1);
  });

  it('fehlende Ereignisse für die Übernahme', () => {
    expect(fehlende([a], [a, b, c])).toEqual([b, c]);
  });

  it('kanonisch: Schlüssel sortiert, undefined fällt weg', () => {
    expect(kanonisch({ b: 1, a: [2, { d: undefined, c: 'x' }] })).toBe('{"a":[2,{"c":"x"}],"b":1}');
  });
});

/** Erzeuger gültiger Ereignisse; wenige Geräte und Nummern, damit Schlüssel kollidieren. */
const zeit = fc
  .integer({ min: Date.parse('2026-09-01T00:00:00Z'), max: Date.parse('2026-10-31T00:00:00Z') })
  .map((ms) => new Date(Math.floor(ms / 60_000) * 60_000).toISOString());
const daten = fc.oneof(
  fc.record({
    art: fc.constant('bewertung'),
    daten: fc.record({ karte: fc.constantFrom('k1', 'k2', 'k3'), note: fc.constantFrom('nochmal', 'schwer', 'gut') }),
  }),
  fc.record({
    art: fc.constant('lektion'),
    daten: fc
      .record({ lektion: fc.constantFrom('l1', 'l2'), richtig: fc.nat({ max: 12 }), gesamt: fc.integer({ min: 12, max: 15 }) })
      .map((d) => ({ kurs: 'tr-aus-de', art: 'lektion' as const, ...d })),
  }),
  fc.record({ art: fc.constant('xp'), daten: fc.record({ menge: fc.integer({ min: 1, max: 20 }), grund: fc.constant('lektion') }) }),
  fc.record({
    art: fc.constant('einstellung'),
    daten: fc.record({ schluessel: fc.constant('pausetage'), wert: fc.integer({ min: 0, max: 3 }) }),
  }),
  fc.record({
    art: fc.constant('tagesziel'),
    daten: fc.record({ ziel: fc.constantFrom({ art: 'xp', wert: 10 }, { art: 'lektionen', wert: 2 }, { art: 'kein' }) }),
  }),
  fc.record({
    art: fc.constant('pause'),
    daten: fc.integer({ min: 0, max: 50 }).map((n) => {
      const von = new Date(Date.parse('2026-09-01T00:00:00Z') + n * 86_400_000).toISOString().slice(0, 10);
      return { von, bis: von };
    }),
  }),
);
const ereignis = fc
  .record({ geraet: fc.constantFrom(G1, G2, G3), seq: fc.nat({ max: 15 }), am: zeit, inhalt: daten })
  .map(({ inhalt, am, ...k }) => EreignisSchema.parse({ ...k, am, tag: am.slice(0, 10), ...inhalt }));
const liste = fc.array(ereignis, { maxLength: 30 });
const HEUTE = '2026-10-31';

describe('Eigenschaften der Vereinigung (fast-check)', () => {
  it('idempotent', () => {
    fc.assert(fc.property(liste, (a) => kanonisch(vereinige(a, a)) === kanonisch(vereinige(a))));
  });

  it('kommutativ', () => {
    fc.assert(fc.property(liste, liste, (a, b) => kanonisch(vereinige(a, b)) === kanonisch(vereinige(b, a))));
  });

  it('assoziativ', () => {
    fc.assert(
      fc.property(liste, liste, liste, (a, b, c) => kanonisch(vereinige(vereinige(a, b), c)) === kanonisch(vereinige(a, vereinige(b, c)))),
    );
  });

  it('Ableitung hängt nur von der Menge ab: Reihenfolge und Abgleichsweg sind gleichgültig', () => {
    fc.assert(
      fc.property(liste, liste, (a, b) => {
        const x = alsWert(leiteAb([...a, ...b], HEUTE));
        expect(alsWert(leiteAb([...b].reverse().concat(a), HEUTE))).toEqual(x);
        expect(alsWert(leiteAb(vereinige(vereinige(b), a), HEUTE))).toEqual(x);
      }),
    );
  });

  it('beste Quote ist das Maximum, Zahl der Abschlüsse die Zahl der Lektions-Ereignisse', () => {
    fc.assert(
      fc.property(liste, (a) => {
        const v = vereinige(a);
        const l = leiteAb(v, HEUTE).lektionen;
        for (const [k, s] of l) {
          const eigene = v.filter((x) => x.art === 'lektion' && x.daten.lektion === k);
          expect(s.anzahl).toBe(eigene.length);
          expect(s.besteQuote).toBe(Math.max(...eigene.map((x) => (x.art === 'lektion' ? x.daten.richtig / x.daten.gesamt : 0))));
        }
      }),
    );
  });
});

describe('Ableitung', () => {
  it('Version der Ableitung', () => {
    expect(ABLEITUNGS_VERSION).toBe(2);
    expect(leiteAb([], HEUTE).version).toBe(2);
  });

  it('Einstellungen: letzter Schreiber nach (am, geraet) gewinnt; ungültige und unbekannte wirken nicht', () => {
    const liste = [
      e('einstellung', { schluessel: 'pausetage', wert: 1 }, '2026-10-01T10:00:00.000Z', G2, 0),
      e('einstellung', { schluessel: 'pausetage', wert: 3 }, '2026-10-01T09:00:00.000Z', G1, 0),
      e('einstellung', { schluessel: 'ziffern', wert: 'westlich' }, '2026-10-01T09:00:00.000Z', G1, 1),
      e('einstellung', { schluessel: 'ziffern', wert: 'oestlich' }, '2026-10-01T09:00:00.000Z', G2, 1),
      e('einstellung', { schluessel: 'hoerenAus', wert: 'ja' }, '2026-10-02T09:00:00.000Z', G1, 2),
      e('einstellung', { schluessel: 'zukunftsSchalter', wert: true }, '2026-10-02T09:00:00.000Z', G1, 3),
    ];
    expect(leiteAb(liste, HEUTE).einstellungen).toEqual({ pausetage: 1, ziffern: 'oestlich', hoerenAus: false, sprechenAus: false });
  });

  it('Karten: zwei Geräte bewerten dieselbe Karte – beide Bewertungen zählen (Nachspielen)', () => {
    const g1 = [e('bewertung', { karte: 'k', note: 'gut' }, '2026-10-01T10:00:00.000Z', G1, 0)];
    const g2 = [e('bewertung', { karte: 'k', note: 'nochmal' }, '2026-10-01T12:00:00.000Z', G2, 0)];
    const k = leiteAb(vereinige(g1, g2), HEUTE).karten.get('k')!;
    expect(k.wiederholungen).toBe(2);
    expect(k.letzteNote).toBe('nochmal');
    expect(leiteAb(vereinige(g2, g1), HEUTE).karten.get('k')).toEqual(k);
  });

  it('XP und Tagesziel je Lerntag; ein späteres Ziel ändert frühere Tage nicht', () => {
    const liste = [
      e('tagesziel', { ziel: { art: 'xp', wert: 20 } }, '2026-10-01T08:00:00.000Z'),
      e('xp', { menge: 10, grund: 'lektion' }, '2026-10-01T09:00:00.000Z'),
      e('xp', { menge: 15, grund: 'geschichte' }, '2026-10-01T19:00:00.000Z'),
      e('xp', { menge: 10, grund: 'lektion' }, '2026-10-02T09:00:00.000Z'),
      e('tagesziel', { ziel: { art: 'kein' } }, '2026-10-03T08:00:00.000Z'),
      e('xp', { menge: 5, grund: 'wiederholung' }, '2026-10-03T09:00:00.000Z'),
    ];
    const a = leiteAb(liste, '2026-10-03');
    expect(a.xpGesamt).toBe(40);
    expect(a.tage.get('2026-10-01')).toMatchObject({ xp: 25, erreicht: true, ziel: { art: 'xp', wert: 20 } });
    expect(a.tage.get('2026-10-02')).toMatchObject({ xp: 10, erreicht: false });
    expect(a.tage.get('2026-10-03')).toMatchObject({ xp: 5, erreicht: null });
    expect(a.tagesziel).toEqual({ art: 'kein' });
    expect(a.serie.laenge).toBe(3);
  });

  it('Tagesziel „Lektionen“ und Standard ohne Ereignis', () => {
    const a = leiteAb(
      [e('lektion', { kurs: 'k', lektion: 'l1', art: 'lektion', richtig: 10, gesamt: 12 }, '2026-10-05T09:00:00.000Z')],
      '2026-10-05',
    );
    expect(a.tage.get('2026-10-05')).toMatchObject({ lektionen: 1, ziel: TAGESZIEL_STANDARD, erreicht: true });
    expect(heuteStand(leiteAb([], '2026-10-06'), '2026-10-06')).toEqual({
      tag: '2026-10-06',
      xp: 0,
      lektionen: 0,
      bewertungen: 0,
      ziel: TAGESZIEL_STANDARD,
      erreicht: false,
    });
  });

  it('Einstufung je Kurs: letzter Schreiber', () => {
    const a = leiteAb(
      [
        e('einstufung', { kurs: 'tr-aus-de', stufe: 'a2', richtig: 12, gesamt: 20 }, '2026-10-01T09:00:00.000Z'),
        e('einstufung', { kurs: 'tr-aus-de', stufe: 'b1', richtig: 16, gesamt: 20, einheit: 'tr.b1.e01' }, '2026-10-04T09:00:00.000Z'),
      ],
      HEUTE,
    );
    expect(a.einstufungen.get('tr-aus-de')).toEqual({
      kurs: 'tr-aus-de',
      stufe: 'b1',
      einheit: 'tr.b1.e01',
      quote: 0.8,
      am: '2026-10-04T09:00:00.000Z',
    });
  });

  it('Pausetage aus den Einstellungen und Ruhetage aus Pausen wirken auf die Serie', () => {
    const lernen = (tag: string, seq: number) => e('xp', { menge: 10, grund: 'lektion' }, `${tag}T09:00:00.000Z`, G1, seq);
    const basis = [lernen('2026-10-12', 0), lernen('2026-10-16', 1)];
    expect(leiteAb(basis, '2026-10-16').serie.laenge).toBe(1);
    const mitDrei = [...basis, e('einstellung', { schluessel: 'pausetage', wert: 3 }, '2026-10-12T08:00:00.000Z', G1, 2)];
    expect(leiteAb(mitDrei, '2026-10-16').serie.laenge).toBe(2);
    const mitRuhe = [...basis, e('pause', { von: '2026-10-13', bis: '2026-10-15' }, '2026-10-12T20:00:00.000Z', G1, 3)];
    expect(leiteAb(mitRuhe, '2026-10-16').serie.laenge).toBe(2);
  });
});
