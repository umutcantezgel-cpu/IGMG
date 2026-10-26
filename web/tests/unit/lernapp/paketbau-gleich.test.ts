import { createHash } from 'node:crypto';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { LateinFormel } from '@/lib/lernapp/formelkandidat';
import { SPRACH_STUFEN } from '@/lib/lernapp/kurse';
import {
  type BauAudio,
  type BauAufgabe,
  type BauEingabe,
  type BauEintrag,
  type BauUebersetzung,
  baueEinheit,
  baueVerzeichnis,
  stabilSortiert,
} from '@/lib/lernapp/paket/bauen';
import { kanonisch, sha256Hex, textHash } from '@/lib/lernapp/paket/hash';

/**
 * Paketbau schneller, Bytes gleich (Stufe C N6): Der Neubau einer Richtung wurde beschleunigt (Hash je Wert einmal statt je
 * Vergleich, Gemerktes je Einheit, Formel-Treffer gemerkt, `kanonisch` ohne Zwischenlisten, Einmal-Hash). Die
 * ausgelieferten Bytes dürfen sich dadurch nicht ändern: Für eine feste, synthetische Eingabe (drei Einheiten, alle
 * Vorlagen der Sprachkurse mit Verweisen, verborgene Einträge, Formel-Kandidat, Audio) ist der Hash des Kursverzeichnisses
 * vor und nach der Änderung derselbe, und jeder Einheiten-Hash ist der SHA-256 des Pakettexts. Die festen Werte stammen aus
 * dem Stand vor N6 (9a8ca1f8); ändert sich der Paketbau absichtlich, werden sie mit Begründung neu gesetzt.
 *
 * Nur erfundene Silbenwörter (keine echten Inhalte, kein Religionsbezug); die Formel ist eine Testformel aus Silben.
 */

/** Deterministischer Zufall (mulberry32), damit die Eingabe fest bleibt. */
function zufall(saat: number): () => number {
  let a = saat;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SILBEN_TR = ['ka', 'le', 'mi', 'so', 'ru', 'ta', 'ne', 'pi', 'lo', 'du', 'be', 'zü', 'şa', 'gö', 'ıp'];
const SILBEN_DE = ['ha', 'us', 'bo', 'ren', 'ti', 'mel', 'wa', 'gu', 'fen', 'lö', 'ßa', 'ke', 'dor', 'ri'];
const FORMELN: readonly LateinFormel[] = [
  { id: 'F-probe-de', sprache: 'de', folgen: [['zuzuprobe']] },
  { id: 'F-probe-tr', sprache: 'tr', folgen: [['dedeme', 'kaka']] },
];

type Fest = { eingaben: BauEingabe[] };

function festeEingabe(): Fest {
  const r = zufall(2610);
  const wahl = <T>(liste: readonly T[]): T => liste[Math.floor(r() * liste.length)]!;
  const wort = (silben: readonly string[]) => Array.from({ length: 2 + Math.floor(r() * 2) }, () => wahl(silben)).join('');
  const basis = { verfasstVon: null, pruefungen: [], religionsbezug: false };
  const eingaben: BauEingabe[] = [];
  for (let n = 1; n <= 3; n++) {
    const e = `tr.a1.e0${n}`;
    const eintraege: BauEintrag[] = [];
    const uebersetzungen: BauUebersetzung[] = [];
    const lemmaTexte: string[] = [];
    for (let i = 1; i <= 30; i++) {
      const s = `${e}.w${String(i).padStart(3, '0')}`;
      const text = wort(SILBEN_TR);
      lemmaTexte.push(text);
      const status = i === 7 ? 'entwurf' : i === 9 ? 'gesperrt' : 'veroeffentlicht';
      eintraege.push({
        ...basis,
        status,
        inhaltHash: `h-${s}`,
        art: 'lemma',
        schluessel: s,
        text,
        quelle: 'test:n6',
        lizenz: 'CC-BY-SA-4.0',
        namensnennung: null,
      });
      if (i !== 11)
        uebersetzungen.push({
          ...basis,
          status: i === 13 ? 'entwurf' : 'veroeffentlicht',
          inhaltHash: `u-${s}`,
          bezug: s,
          text: `${wort(SILBEN_DE)}${i === 17 && n === 2 ? ' zuzuprobe' : ''}`,
          alternativen: i % 5 === 0 ? [wort(SILBEN_DE)] : [],
          quelle: 'test:n6',
          lizenz: 'CC-BY-SA-4.0',
          namensnennung: null,
        });
    }
    for (let i = 1; i <= 12; i++) {
      const s = `${e}.s${String(i).padStart(4, '0')}`;
      const laenge = 3 + Math.floor(r() * 4);
      const text = `${Array.from({ length: laenge }, () => wahl(lemmaTexte)).join(' ')}${i === 5 && n === 3 ? ' dedeme kaka' : ''}.`;
      eintraege.push({
        ...basis,
        status: 'veroeffentlicht',
        inhaltHash: `h-${s}`,
        art: 'satz',
        schluessel: s,
        text,
        quelle: 'test:n6',
        lizenz: 'CC-BY-SA-4.0',
        namensnennung: null,
      });
      uebersetzungen.push({
        ...basis,
        status: i === 4 ? 'automatisch_geprueft' : 'veroeffentlicht',
        inhaltHash: `u-${s}`,
        bezug: s,
        text: `${Array.from({ length: laenge }, () => wort(SILBEN_DE)).join(' ')}.`,
        alternativen: [],
        quelle: 'test:n6',
        lizenz: 'CC-BY-SA-4.0',
        namensnennung: null,
      });
    }
    const w = (i: number) => `${e}.w${String(((i - 1) % 30) + 1).padStart(3, '0')}`;
    const s = (i: number) => `${e}.s${String(((i - 1) % 12) + 1).padStart(4, '0')}`;
    const lektionen = [1, 2].map((l) => {
      const a = (nr: number, typ: string, daten: object): BauAufgabe => ({
        ...basis,
        status: 'veroeffentlicht',
        inhaltHash: `a-${e}.l0${l}.a${nr}`,
        schluessel: `${e}.l0${l}.a${String(nr).padStart(2, '0')}`,
        typ,
        daten,
      });
      const o = l * 6;
      return {
        ...basis,
        status: 'veroeffentlicht' as const,
        inhaltHash: `l-${e}.l0${l}`,
        schluessel: `${e}.l0${l}`,
        art: 'lektion' as const,
        ziel: { de: `Ziel ${l}` },
        aufgaben: [
          a(1, 'auswahl', { anweisung: 'waehleUebersetzung', ziel: w(o + 1), ablenker: [w(o + 2), w(o + 3), w(o + 7)] }),
          a(2, 'auswahl', { anweisung: 'waehleWort', ziel: w(o + 4), ablenker: [w(o + 5), w(9), w(11)] }),
          a(3, 'wortbank', { anweisung: 'uebersetze', satz: s(o + 1), nach: 'ausgang' }),
          a(4, 'wortbank', { anweisung: 'uebersetze', satz: s(o + 2), nach: 'ziel', ablenker: ['zzz'] }),
          a(5, 'wortbank', { anweisung: 'uebersetze', satz: s(o + 3), nach: 'ausgang' }),
          a(6, 'paare', { lemmata: [w(o + 6), w(o + 8), w(o + 10), w(13), w(17)] }),
          a(7, 'luecke', { ziel: s(o + 4), wort: 1, ablenker: ['xa', 'xb'] }),
          a(8, 'satzbau', { ziel: s(o + 5) }),
          a(9, 'frei', { ziel: w(o + 12), nach: 'ausgang' }),
          a(10, 'hoeren_waehlen', { anweisung: 'waehleGehoertes', ziel: w(o + 14), ablenker: [w(o + 15), w(o + 16)] }),
          a(11, 'minimalpaare', { ziel: w(o + 18), ablenker: [w(o + 19)] }),
          a(12, 'geschichte', {
            zeilen: [
              { sprecher: 'a', satz: s(o + 6) },
              { sprecher: 'b', satz: s(o + 7) },
            ],
            fragen: [{ nach: 1, frage: s(o + 8), antwort: s(o + 9), ablenker: [s(o + 10)] }],
          }),
          a(13, 'dialog', { zeilen: [{ sprecher: 'a', satz: s(o + 11) }], antwort: s(o + 12), ablenker: [s(5)] }),
        ],
      };
    });
    const audio = new Map<string, BauAudio>();
    eintraege.forEach((x, i) => {
      if (i % 3 === 0)
        audio.set(textHash(x.text), {
          adresse: `/lern-app/audio/tr/${e}-0123456789abcdef.lpa`,
          buendelBytes: 50_000,
          versatz: 100 * i,
          laenge: 90,
          dauerMs: 500,
          stimme: 'test:ton',
        });
    });
    eingaben.push({
      richtung: 'tr-aus-de',
      einheit: {
        ...basis,
        status: 'veroeffentlicht',
        inhaltHash: `e-${e}`,
        schluessel: e,
        stufe: 'a1',
        reihenfolge: n,
        thema: { de: `Thema ${n}`, tr: `Konu ${n}` },
        symbol: null,
        nurFuerAusgang: null,
      },
      lektionen,
      eintraege: new Map(eintraege.map((x) => [x.schluessel, x])),
      uebersetzungen: new Map(uebersetzungen.map((x) => [x.bezug, x])),
      tipps: [],
      audio,
    });
  }
  return { eingaben };
}

function verzeichnisFuer(ungeprueftZeigen: boolean) {
  const { eingaben } = festeEingabe();
  const gebaut = eingaben.flatMap((e) => {
    const x = baueEinheit(e, { ungeprueftZeigen, formellisteFrei: false, formeln: FORMELN });
    return x ? [x] : [];
  });
  const verzeichnis = baueVerzeichnis({
    kurs: 'tr-aus-de',
    kursId: 'tr',
    zielsprache: 'tr',
    ausgangssprache: 'de',
    stand: 7,
    einheiten: gebaut,
    stufenFolge: SPRACH_STUFEN,
  });
  return { gebaut, verzeichnis };
}

/** Feste Werte aus dem Stand vor N6 (9a8ca1f8, alter Paketbau mit derselben Eingabe). */
const VORHER = {
  an: {
    verzeichnis: '12188ca72b4d5eb9cfc3be7337947ce10d908acc76521d26b551fd644b7ee095',
    einheiten: [
      '1389bb037eb53891565121fc202267d97ea3c3a5a5adbcc503ff0e3a581e26a7',
      '4b0c4b19d7680d8b3ab73a09f79f337718c378e357342d39cf4ac3e7f496570b',
      '9d76b8f442e854f04ec97fd8f28652963ce73ebe64aa5a1257ef875062f33bac',
    ],
  },
  aus: {
    verzeichnis: '6acc80db3ce96efd102c135ee20b1683f77cebed3fcef2cd440f4ffd52dae67d',
    einheiten: [
      '89888559b645d6472d7530a0720d9d3957009796e443ffc75ea51de3e387e326',
      'dc693b29ecdc86c7dcabe014692f208fe491c1fbde24f2ed866998c007cf04d7',
      '93fdf4b7f31c5adb266d7e7ff3f72e9bcd3cc094bad4f359eaa8db4a7c41678e',
    ],
  },
};

describe('Paketbau N6: gleiche Bytes und Hashes für eine feste Eingabe', () => {
  for (const [name, ungeprueft] of [
    ['an', true],
    ['aus', false],
  ] as const) {
    it(`lernapp_ungeprueft ${name}: Einheiten-Hash = SHA-256 des Pakettexts, Verzeichnis wie vor N6`, () => {
      const { gebaut, verzeichnis } = verzeichnisFuer(ungeprueft);
      expect(gebaut.length).toBe(3);
      for (const g of gebaut) {
        expect(g.hash).toBe(createHash('sha256').update(g.json).digest('hex'));
        expect(g.bytes).toBe(Buffer.byteLength(g.json));
        expect(g.json).toBe(kanonisch(g.paket));
      }
      // die Eingabe deckt die beschleunigten Wege ab: Wortbank-Ablenker, Hinweis, Audio, Formel-Kandidat verborgen
      const aufgaben = gebaut.flatMap((g) => g.paket.lektionen.flatMap((l) => l.aufgaben));
      expect(aufgaben.filter((a) => a.typ === 'wortbank').length).toBeGreaterThan(6);
      expect(gebaut.some((g) => g.paket.audio.length > 0)).toBe(true);
      expect(JSON.stringify(gebaut.map((g) => g.paket))).not.toMatch(/zuzuprobe|dedeme/);
      const ist = { verzeichnis: sha256Hex(JSON.stringify(verzeichnis)), einheiten: gebaut.map((g) => g.hash) };
      expect(ist).toEqual(VORHER[name]);
    });
  }
});

/** Vorherige Fassungen (vor N6) als Bezug für die Eigenschaftstests. */
function kanonischVorher(wert: unknown): string {
  if (wert === null || typeof wert !== 'object') return JSON.stringify(wert) ?? 'null';
  if (Array.isArray(wert)) return `[${wert.map(kanonischVorher).join(',')}]`;
  const eintraege = Object.entries(wert as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${eintraege.map(([k, v]) => `${JSON.stringify(k)}:${kanonischVorher(v)}`).join(',')}}`;
}
const hashVorher = (d: string | Uint8Array) => createHash('sha256').update(d).digest('hex');
function stabilSortiertVorher(werte: readonly string[], saat: string): string[] {
  return [...werte].sort((a, b) => {
    const ha = hashVorher(`${saat}|${a}`);
    const hb = hashVorher(`${saat}|${b}`);
    return ha < hb ? -1 : ha > hb ? 1 : 0;
  });
}

describe('Bausteine des Paketbaus: neue Fassung = alte Fassung (Eigenschaft)', () => {
  const wert = fc.letrec((tie) => ({
    wert: fc.oneof(
      { depthSize: 'small' },
      fc.string(),
      fc.integer(),
      fc.double({ noNaN: true, noDefaultInfinity: true }),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.array(tie('wert'), { maxLength: 5 }),
      fc.dictionary(fc.string({ maxLength: 6, unit: 'binary' }), tie('wert'), { maxKeys: 6 }),
    ),
  })).wert;

  it('kanonisch', () => {
    fc.assert(fc.property(wert, (w) => kanonisch(w) === kanonischVorher(w)));
  });

  it('sha256Hex (Einmal-Hash) wie createHash', () => {
    fc.assert(fc.property(fc.string({ unit: 'binary' }), (t) => sha256Hex(t) === hashVorher(t)));
    fc.assert(fc.property(fc.uint8Array(), (b) => sha256Hex(b) === hashVorher(b)));
  });

  it('stabilSortiert (Hash je Wert einmal) wie der Vergleich mit Hash je Aufruf', () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.string({ unit: 'binary' }), { maxLength: 40 }), fc.string(), (werte, saat) => {
        expect(stabilSortiert(werte, saat)).toEqual(stabilSortiertVorher(werte, saat));
      }),
    );
  });
});
