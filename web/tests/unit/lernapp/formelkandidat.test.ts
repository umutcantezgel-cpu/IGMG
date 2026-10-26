import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formelTreffer, lateinFormeln, lateinWoerter, texteIn } from '@/lib/lernapp/formelkandidat';
import { FORMELN, LATEIN_FORMELN } from '@/lib/lernapp/formelliste';
import type { Pruefung } from '@/lib/lernapp/freigabe';
import { ladeWaechter } from '@/lib/lernapp/inhalt/religion';
import { tabuWoerter } from '@/lib/lernapp/inhalt/pruefer/tabu';
import { type BauEingabe, type BauEintrag, type BauUebersetzung, baueEinheit } from '@/lib/lernapp/paket/bauen';
import { textHash } from '@/lib/lernapp/paket/hash';
import { lexikonTreffer } from '@/lib/lernapp/waechter/kern.mjs';

/**
 * Lateinische Formel-Kandidaten der Formelliste (Stufe C N2, Gegenprüfung Z-L10): dieselbe Zerlegung wie im Inhaltsprüfer,
 * und im Paketbau gilt ein Treffer als Religionsbezug, auch ohne Kennzeichen – verborgen bei gesperrter Liste, auch mit
 * Schalter `lernapp_ungeprueft`. Formeln nur aus dem Leitfaden (zur Laufzeit), nie von Hand; sonst neutrale Testwörter.
 */
const formel = (id: string, teil = 0) =>
  FORMELN.liste
    .find((f) => f.id === id)!
    .begriff.split(',')
    [teil]!.trim();

describe('Formel-Kandidaten (formelkandidat.ts)', () => {
  it('alle lateinischen Einträge der echten Liste (F-de, F-tr) haben Wortfolgen; F-ar fällt weg', () => {
    const latein = FORMELN.liste.filter((f) => f.sprache === 'de' || f.sprache === 'tr');
    expect(LATEIN_FORMELN.map((f) => f.id)).toEqual(latein.map((f) => f.id));
    expect(LATEIN_FORMELN.length).toBe(20);
    for (const f of LATEIN_FORMELN) expect(f.folgen.length && f.folgen.every((w) => w.length > 0), f.id).toBeTruthy();
  });

  it('jede Variante jeder Formel trifft sich selbst im Satz (mit Satzzeichen, Großschreibung, Endungen)', () => {
    for (const f of FORMELN.liste) {
      if (f.sprache !== 'de' && f.sprache !== 'tr') continue;
      const eine = lateinFormeln([f]);
      for (const teil of f.begriff.replace(/\([^)]*\)/g, ' ').split(/[,/]/)) {
        const t = teil.trim();
        if (!t) continue;
        expect(formelTreffer(`[Name]: ${t.toLocaleUpperCase(f.sprache)}!`, f.sprache, eine), `${f.id}: ${t}`).toBe(f.id);
      }
    }
  });

  it('nur die Wortfolge zählt, nicht ein einzelnes Wort daraus; Arabisch nie (das erkennt nur der Wächter)', () => {
    const [erstes, zweites] = formel('F-de-04').split(/\s+/) as [string, string];
    expect(formelTreffer(`${erstes} Grüße.`, 'de', LATEIN_FORMELN)).toBeNull();
    expect(formelTreffer(`Im ${zweites} schneit es.`, 'de', LATEIN_FORMELN)).toBeNull();
    expect(
      formelTreffer(
        formel('F-de-04'),
        'tr',
        LATEIN_FORMELN.filter((f) => f.sprache === 'tr'),
      ),
    ).toBeNull();
    expect(formelTreffer(formel('F-tr-03', 1), 'ar', LATEIN_FORMELN)).toBeNull();
    expect(formelTreffer('Das Haus ist groß.', 'de', LATEIN_FORMELN)).toBeNull();
    expect(formelTreffer('Ev büyük.', 'tr', LATEIN_FORMELN)).toBeNull();
  });

  it('gleiche Wörter wie der Inhaltsprüfer (tabuWoerter)', () => {
    for (const [t, s] of [
      ["Ayşe'nin ÇOK güzel kitabı-var.", 'tr'],
      ['Straße, Haus-Tür; GRÜSSE!', 'de'],
    ] as const)
      expect(tabuWoerter(t, s)).toEqual(lateinWoerter(t, s));
  });

  it('fängt Formeln, die das Formel-Lexikon des Wächters nicht kennt (Grund für Paketbau und Verwaltung)', () => {
    const { lexikon } = ladeWaechter(join(import.meta.dirname, '../../../daten'));
    for (const [id, teil, sprache] of [
      ['F-tr-03', 1, 'tr'],
      ['F-tr-10', 0, 'tr'],
      ['F-de-04', 0, 'de'],
    ] as const) {
      const t = formel(id, teil);
      expect(lexikonTreffer(t, lexikon), id).toBeFalsy();
      expect(formelTreffer(t, sprache, LATEIN_FORMELN), id).toBe(id);
    }
  });

  it('texteIn sammelt alle Zeichenketten (Aufgabendaten, Tiptap)', () => {
    expect(texteIn({ a: 'x', b: [1, 'y', { c: 'z' }], d: null })).toEqual(['x', 'y', 'z']);
  });
});

// ——— Paketbau ———

const basis = { status: 'automatisch_geprueft' as const, verfasstVon: null, pruefungen: [] as Pruefung[] };
const eintrag = (schluessel: string, text: string): BauEintrag => ({
  ...basis,
  inhaltHash: `h-${schluessel}`,
  religionsbezug: false,
  art: 'satz',
  schluessel,
  text,
  quelle: 'test:formelkandidat',
  lizenz: 'CC-BY-SA-4.0',
  namensnennung: null,
});
const uebersetzung = (bezug: string, text: string, alternativen: string[] = []): BauUebersetzung => ({
  ...basis,
  inhaltHash: `u-${bezug}`,
  religionsbezug: false,
  bezug,
  text,
  alternativen,
  quelle: 'test:formelkandidat',
  lizenz: 'CC-BY-SA-4.0',
  namensnennung: null,
});
const aufgabe = (nr: number, satz: string, alternativen?: string[]) => ({
  ...basis,
  inhaltHash: `a-${nr}`,
  religionsbezug: false,
  schluessel: `tr.a1.e01.l01.a0${nr}`,
  typ: 'frei',
  daten: { ziel: satz, nach: 'ziel', ...(alternativen ? { alternativen } : {}) },
});

/** s1 neutral; s2 mit F-tr im Zieltext; s3 mit F-de in der Übersetzung; s4 neutral, aber F-tr als Alternative der Aufgabe. */
function eingabe(): BauEingabe {
  const e = [
    eintrag('tr.a1.e01.s0001', 'Ev büyük.'),
    eintrag('tr.a1.e01.s0002', `Ev büyük, ${formel('F-tr-03', 1)}.`),
    eintrag('tr.a1.e01.s0003', 'Kar yağıyor.'),
    eintrag('tr.a1.e01.s0004', 'Masa küçük.'),
  ];
  const u = [
    uebersetzung('tr.a1.e01.s0001', 'Das Haus ist groß.'),
    uebersetzung('tr.a1.e01.s0002', 'Das Haus ist groß.'),
    uebersetzung('tr.a1.e01.s0003', `${formel('F-de-04')}!`),
    uebersetzung('tr.a1.e01.s0004', 'Der Tisch ist klein.'),
  ];
  return {
    richtung: 'tr-aus-de',
    einheit: {
      ...basis,
      inhaltHash: 'einheit',
      religionsbezug: false,
      schluessel: 'tr.a1.e01',
      stufe: 'a1',
      reihenfolge: 1,
      thema: { de: 'Probe' },
      symbol: null,
      nurFuerAusgang: null,
    },
    lektionen: [
      {
        ...basis,
        inhaltHash: 'lektion',
        religionsbezug: false,
        schluessel: 'tr.a1.e01.l01',
        art: 'lektion',
        ziel: {},
        aufgaben: [
          aufgabe(1, 'tr.a1.e01.s0001'),
          aufgabe(2, 'tr.a1.e01.s0002'),
          aufgabe(3, 'tr.a1.e01.s0003'),
          aufgabe(4, 'tr.a1.e01.s0004', [`Masa küçük, ${formel('F-tr-12')}.`]),
        ],
      },
    ],
    eintraege: new Map(e.map((x) => [x.schluessel, x])),
    uebersetzungen: new Map(u.map((x) => [x.bezug, x])),
    tipps: [],
    audio: new Map(
      e.map((x) => [textHash(x.text), { adresse: 'b.lpa', buendelBytes: 10, versatz: 0, laenge: 1, dauerMs: 1, stimme: 'test:ton' }]),
    ),
  };
}

const zwei = (hash: string): Pruefung[] =>
  ['p1', 'p2'].map((pruefendeId) => ({
    pruefendeId,
    pruefendeRollen: ['religioese_pruefung'],
    art: 'religioes' as const,
    urteil: 'ok' as const,
    inhaltHash: hash,
    am: new Date(0),
  }));

const aufgaben = (e: BauEingabe, o: Parameters<typeof baueEinheit>[1]) =>
  baueEinheit(e, o)!.paket.lektionen[0]!.aufgaben.map((a) => a.schluessel.slice(-3));

describe('Paketbau: Formel-Kandidat ohne Kennzeichen gilt als Religionsbezug', () => {
  it('gesperrte Liste: Zieltext, Übersetzung und Alternative mit Formel verborgen – auch mit lernapp_ungeprueft', () => {
    const p = baueEinheit(eingabe(), { ungeprueftZeigen: true })!.paket;
    expect(p.lektionen[0]!.aufgaben.map((a) => a.schluessel.slice(-3))).toEqual(['a01']);
    expect(Object.keys(p.eintraege)).toEqual(['tr.a1.e01.s0001', 'tr.a1.e01.s0001@de']);
    expect(aufgaben(eingabe(), { ungeprueftZeigen: true, formellisteFrei: false })).toEqual(['a01']);
  });

  it('ohne Formeln (Gegenprobe) sind alle vier sichtbar', () => {
    expect(aufgaben(eingabe(), { ungeprueftZeigen: true, formeln: [] })).toEqual(['a01', 'a02', 'a03', 'a04']);
  });

  it('freigegebene Liste allein genügt nicht; mit zwei religiösen Freigaben des Bausteins sichtbar, nie mit Stimme', () => {
    expect(aufgaben(eingabe(), { ungeprueftZeigen: true, formellisteFrei: true })).toEqual(['a01']);
    const e = eingabe();
    const s2 = e.eintraege.get('tr.a1.e01.s0002')!;
    const u3 = e.uebersetzungen.get('tr.a1.e01.s0003')!;
    const a4 = e.lektionen[0]!.aufgaben[3]!;
    const mit: BauEingabe = {
      ...e,
      eintraege: new Map([...e.eintraege, [s2.schluessel, { ...s2, pruefungen: zwei(s2.inhaltHash) }]]),
      uebersetzungen: new Map([...e.uebersetzungen, [u3.bezug, { ...u3, pruefungen: zwei(u3.inhaltHash) }]]),
      lektionen: [
        { ...e.lektionen[0]!, aufgaben: e.lektionen[0]!.aufgaben.map((a) => (a === a4 ? { ...a, pruefungen: zwei(a.inhaltHash) } : a)) },
      ],
    };
    // Liste gesperrt: trotz zwei Freigaben je Baustein verborgen
    expect(aufgaben(mit, { ungeprueftZeigen: true, formellisteFrei: false })).toEqual(['a01']);
    const p = baueEinheit(mit, { ungeprueftZeigen: true, formellisteFrei: true })!.paket;
    expect(p.lektionen[0]!.aufgaben.map((a) => a.schluessel.slice(-3))).toEqual(['a01', 'a02', 'a03', 'a04']);
    expect(p.eintraege['tr.a1.e01.s0001']?.stimme).toBe('test:ton');
    expect(p.eintraege['tr.a1.e01.s0002']?.stimme).toBeUndefined();
  });
});
