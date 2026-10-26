import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { arbeitsspeicher } from '@/lib/lernapp/lokal/db';
import { ladeLektion, nurLektion } from '@/lib/lernapp/lokal/lektion';
import { offlineBedarf, speichereOffline } from '@/lib/lernapp/lokal/vorrat';
import { INHALT_LIZENZ, PAKET_FORMAT, paketAdresse } from '@/lib/lernapp/paket/kennungen';
import type { VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';

/**
 * Stufe C N9a (Z-L04 Offline, Nacharbeit der Gegenprüfung N8):
 * - „Kopf ok, Lektion fehlt“ ist nicht „nicht im Vorrat“: Liegt das Paket mit passendem Hash im Vorrat, lädt der Spieler es für
 *   eine Lektion, die es darin nicht gibt (veraltetes `?l=`), nicht erneut aus dem Netz (Nr. 5f).
 * - Wissenskurs: Eine Lektion ist nur mit ihrem Prüfvermerk spielbar (KI-Regel 2, Absicherung in der Tiefe, Nr. 5e).
 * - „Stufe offline speichern“: Speicherbedarf mit jedem Bündel einmal; abbrechbar, Gespeichertes bleibt.
 * Testdaten: Platzhalter in eckigen Klammern; keine Inhalte des Wissenskurses.
 */

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const auswahl = (schluessel: string) => ({
  typ: 'auswahl',
  schluessel,
  anweisung: 'waehleUebersetzung',
  vorgabe: { text: '[Wort]', sprache: 'de' },
  optionen: [
    { text: '[eins]', sprache: 'tr' },
    { text: '[zwei]', sprache: 'tr' },
  ],
  richtig: 0,
});

const sprachPaket = {
  format: PAKET_FORMAT,
  version: 1,
  kurs: 'tr-aus-de',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  einheit: { schluessel: 'tr.a1.e01', stufe: 'a1', reihenfolge: 1, thema: { de: '[Thema]' } },
  hinweis: false,
  lektionen: [
    {
      schluessel: 'tr-aus-de.a1.e01.l01',
      kurs: 'tr-aus-de',
      art: 'lektion',
      zielsprache: 'tr',
      ausgangssprache: 'de',
      aufgaben: [auswahl('tr.a1.e01.a001')],
    },
  ],
  eintraege: {},
  tipps: [],
  audio: [],
  lizenz: INHALT_LIZENZ,
};

/** Paket des Wissenskurses (Form wie im Bau, Platzhalter statt Inhalten) mit oder ohne Prüfvermerk der Lektion. */
function wissensPaket(vermerk: unknown) {
  const l = 'islam.grund.e01.l01';
  return {
    format: PAKET_FORMAT,
    version: 1,
    kurs: 'islam',
    zielsprache: 'de',
    ausgangssprache: 'de',
    einheit: { schluessel: 'islam.grund.e01', stufe: 'grund', reihenfolge: 1, thema: { de: '[Thema]' } },
    hinweis: false,
    lektionen: [
      {
        schluessel: l,
        kurs: 'islam',
        art: 'lektion',
        zielsprache: 'de',
        ausgangssprache: 'de',
        aufgaben: [
          {
            typ: 'auswahl',
            schluessel: 'islam.grund.e01.a001',
            anweisung: 'waehleAntwort',
            vorgabe: { text: '[Frage]', sprache: 'de' },
            optionen: [
              { text: '[eins]', sprache: 'de' },
              { text: '[zwei]', sprache: 'de' },
            ],
            richtig: 0,
          },
        ],
      },
    ],
    eintraege: {},
    tipps: [],
    audio: [],
    lizenz: INHALT_LIZENZ,
    ...(vermerk === undefined ? {} : { wissen: { [l]: vermerk } }),
  };
}

const GUELTIG = {
  geprueftAm: '2026-10-20',
  kinderGeeignet: true,
  aussagen: [{ schluessel: 'islam.grund.e01.s001', text: '[Aussage]', quelle: '[Werk, Kapitel]' }],
};

/** Cache Storage im Arbeitsspeicher (nur Pakete: `match` und `put` nach Pfad). */
function vorrat(eintraege: Record<string, string> = {}) {
  const c = new Map(Object.entries(eintraege));
  const pfad = (r: RequestInfo | URL) =>
    new URL(typeof r === 'string' ? r : r instanceof URL ? r.href : r.url, 'https://example.test').pathname;
  return {
    async open() {
      return {
        match: async (r: RequestInfo | URL) => (c.has(pfad(r)) ? new Response(c.get(pfad(r))) : undefined),
        put: async (r: RequestInfo | URL, a: Response) => void c.set(pfad(r), await a.text()),
        delete: async (r: RequestInfo | URL) => c.delete(pfad(r)),
        keys: async () => [...c.keys()].map((p) => new Request(new URL(p, 'https://example.test'))),
      };
    },
  } as unknown as CacheStorage;
}

describe('Spieler: „Lektion fehlt“ im Paket aus dem Vorrat lädt das Paket nicht erneut (Nr. 5f)', () => {
  it('Paket mit passendem Hash im Vorrat, Lektion nicht darin: null ohne Netzabruf; vorhandene Lektion aus dem Vorrat', async () => {
    const text = JSON.stringify(sprachPaket);
    const einheit = { schluessel: 'tr.a1.e01', hash: sha(text), bytes: Buffer.byteLength(text) };
    const v = vorrat({ [paketAdresse('tr-aus-de', einheit.schluessel, einheit.hash)]: text });
    const abrufe: string[] = [];
    const abruf = async (a: string) => {
      abrufe.push(a);
      return new Response(text);
    };
    const sp = arbeitsspeicher();
    expect(await ladeLektion(sp, 'tr-aus-de', einheit, 'tr-aus-de.a1.e01.l09', { abruf, vorrat: v })).toBeNull();
    expect(abrufe).toEqual([]);
    expect((await ladeLektion(sp, 'tr-aus-de', einheit, 'tr-aus-de.a1.e01.l01', { abruf, vorrat: v }))?.lektion.schluessel).toBe(
      'tr-aus-de.a1.e01.l01',
    );
    expect(abrufe).toEqual([]);
  });

  it('nicht im Vorrat (oder anderer Hash im Vorrat): aus dem Netz mit Prüfung des Hashs', async () => {
    const text = JSON.stringify(sprachPaket);
    const einheit = { schluessel: 'tr.a1.e01', hash: sha(text), bytes: Buffer.byteLength(text) };
    // unter der Adresse liegt etwas mit anderem Hash: zählt als „nicht im Vorrat“
    const v = vorrat({ [paketAdresse('tr-aus-de', einheit.schluessel, einheit.hash)]: '[anderer Text]' });
    const abrufe: string[] = [];
    const abruf = async (a: string) => {
      abrufe.push(a);
      return new Response(text);
    };
    const r = await ladeLektion(arbeitsspeicher(), 'tr-aus-de', einheit, 'tr-aus-de.a1.e01.l01', { abruf, vorrat: v });
    expect(r?.lektion.schluessel).toBe('tr-aus-de.a1.e01.l01');
    expect(abrufe).toEqual([paketAdresse('tr-aus-de', einheit.schluessel, einheit.hash)]);
  });
});

describe('Wissenskurs: Lektion nur mit Prüfvermerk spielbar (KI-Regel 2, Nr. 5e)', () => {
  const l = 'islam.grund.e01.l01';

  it('mit gültigem Prüfvermerk spielbar', () => {
    expect(nurLektion(l)(wissensPaket(GUELTIG))?.lektion.schluessel).toBe(l);
  });

  it('ohne Vermerk, mit Vermerk einer anderen Lektion oder in ungültiger Form: nicht spielbar', () => {
    expect(nurLektion(l)(wissensPaket(undefined))).toBeNull();
    expect(nurLektion(l)({ ...wissensPaket(undefined), wissen: { 'islam.grund.e01.l02': GUELTIG } })).toBeNull();
    for (const kaputt of [
      null,
      '[Vermerk]',
      { ...GUELTIG, geprueftAm: '20.10.2026' },
      { ...GUELTIG, kinderGeeignet: 'ja' },
      { ...GUELTIG, aussagen: [] },
      { ...GUELTIG, aussagen: [{ schluessel: 'x', text: '[Aussage]' }] },
    ])
      expect(nurLektion(l)(wissensPaket(kaputt)), JSON.stringify(kaputt)).toBeNull();
  });

  it('Sprachkurse brauchen keinen Prüfvermerk', () => {
    expect(nurLektion('tr-aus-de.a1.e01.l01')(sprachPaket)?.lektion.schluessel).toBe('tr-aus-de.a1.e01.l01');
  });
});

describe('Stufe offline speichern: Speicherbedarf und Abbrechen', () => {
  const einheit = (n: number, audio: VerzeichnisEinheit['audio'] = []): VerzeichnisEinheit => {
    const text = JSON.stringify({ ...sprachPaket, einheit: { ...sprachPaket.einheit, schluessel: `tr.a1.e0${n}` } });
    return {
      schluessel: `tr.a1.e0${n}`,
      stufe: 'a1',
      reihenfolge: n,
      thema: { de: '[Thema]' },
      hash: sha(text),
      bytes: Buffer.byteLength(text),
      lektionen: 1,
      hinweis: false,
      audio,
    };
  };

  it('Speicherbedarf: Pakete und jedes Bündel einmal (spätere Einheiten verweisen auf frühere Bündel)', () => {
    const b1 = { adresse: '/lern-app/audio/tr/[eins].lpa', bytes: 1000 };
    const b2 = { adresse: '/lern-app/audio/tr/[zwei].lpa', bytes: 500 };
    const a = einheit(1, [b1]);
    const b = einheit(2, [b1, b2]);
    expect(offlineBedarf([a, b])).toBe(a.bytes + b.bytes + 1500);
    expect(offlineBedarf([])).toBe(0);
  });

  it('abgebrochen nach der ersten Einheit: Rest nicht geladen, Gespeichertes bleibt offline markiert', async () => {
    const einheiten = [1, 2, 3].map((n) => einheit(n, [{ adresse: `/lern-app/audio/tr/[${n}].lpa`, bytes: 10 }]));
    const texte = new Map(
      einheiten.map((e) => [
        paketAdresse('tr-aus-de', e.schluessel, e.hash),
        JSON.stringify({ ...sprachPaket, einheit: { ...sprachPaket.einheit, schluessel: e.schluessel } }),
      ]),
    );
    const steuerung = new AbortController();
    const abrufe: string[] = [];
    const abruf = async (a: string, init?: RequestInit) => {
      abrufe.push(a);
      expect(init?.signal).toBe(steuerung.signal);
      return new Response(texte.get(a) ?? new Uint8Array(10));
    };
    const sp = arbeitsspeicher();
    const r = await speichereOffline(sp, 'tr-aus-de', einheiten, {
      abruf,
      vorrat: null,
      signal: steuerung.signal,
      fortschritt: () => steuerung.abort(),
    });
    expect(r).toMatchObject({ abgebrochen: true, einheiten: 1, bytes: einheiten[0]!.bytes, fehlgeschlagen: [] });
    expect(abrufe).toEqual([paketAdresse('tr-aus-de', einheiten[0]!.schluessel, einheiten[0]!.hash)]);
    expect((await sp.alle('pakete', [['tr-aus-de'], ['tr-aus-de', []]])).map((e) => [e.einheit, e.offline])).toEqual([['tr.a1.e01', true]]);
  });

  it('ohne Abbruch: alle Einheiten und Bündel, nicht abgebrochen', async () => {
    const einheiten = [1, 2].map((n) => einheit(n));
    const abruf = async (a: string) =>
      new Response(
        JSON.stringify({ ...sprachPaket, einheit: { ...sprachPaket.einheit, schluessel: `tr.a1.e0${a.includes('e01') ? 1 : 2}` } }),
      );
    const r = await speichereOffline(arbeitsspeicher(), 'tr-aus-de', einheiten, { abruf, vorrat: null });
    expect(r).toMatchObject({ abgebrochen: false, einheiten: 2, fehlgeschlagen: [] });
  });
});
