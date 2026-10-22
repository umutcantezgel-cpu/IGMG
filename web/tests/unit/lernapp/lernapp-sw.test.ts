import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Service Worker der Lern-App (PLAN §3.5, ADR 0037 Nr. 8): Vorräte `igmg-lernapp-schale-v<bau>`, `-pakete`, `-audio`,
 * `-modelle`; nie `/api/**`, die Anmeldung, RSC-Abrufe oder Bereichsanfragen; Seiten Netz zuerst, ohne Netz aus der
 * Hülle (ohne Suchteil, `ignoreSearch`), sonst der Start der Oberfläche; Hülle je Oberflächensprache auf Bitte der Seite.
 * Der Worker läuft hier in einer kleinen Nachbildung der Worker-Umgebung mit Cache Storage im Speicher.
 */
const QUELLE = readFileSync(join(import.meta.dirname, '../../../public/lern-app/sw.js'), 'utf8');
const URSPRUNG = 'https://igmg.test';

type Hoerer = (e: Record<string, unknown>) => void;
type Vorrat = Map<string, Response>;

function ladeWorker({ bau = 'abc123', vorraete = {} as Record<string, string[]>, netz = true, zusatz = '' } = {}) {
  const hoerer = new Map<string, Hoerer>();
  const speicher = new Map<string, Vorrat>(
    Object.entries(vorraete).map(([n, urls]) => [n, new Map(urls.map((u) => [u, new Response(`alt ${u}`)]))]),
  );
  const abgerufen: string[] = [];
  const url = (r: Request | string) => new URL(typeof r === 'string' ? r : r.url, URSPRUNG).href;
  const vorratVon = (name: string) => {
    if (!speicher.has(name)) speicher.set(name, new Map());
    return speicher.get(name)!;
  };
  const cacheObjekt = (name: string) => ({
    put: async (r: Request | string, a: Response) => void vorratVon(name).set(url(r), a),
    match: async (r: Request | string) => vorratVon(name).get(url(r))?.clone(),
    keys: async () => [...vorratVon(name).keys()].map((u) => new Request(u)),
    delete: async (r: Request | string) => vorratVon(name).delete(url(r)),
  });
  const caches = {
    open: async (name: string) => {
      vorratVon(name);
      return cacheObjekt(name);
    },
    keys: async () => [...speicher.keys()],
    delete: async (name: string) => speicher.delete(name),
    match: async (r: Request | string, o?: { cacheName?: string }) => {
      const namen = o?.cacheName ? [o.cacheName] : [...speicher.keys()];
      for (const n of namen) {
        const a = speicher.get(n)?.get(url(r));
        if (a) return a.clone();
      }
      return undefined;
    },
  };
  const holen = async (r: Request | string) => {
    const u = url(r);
    abgerufen.push(u);
    if (!netz) throw new TypeError('offline');
    const pfad = new URL(u).pathname;
    const html = `<html><script src="/_next/static/chunks/a.js"></script><link href="/_next/static/css/b.css"/>${pfad}${zusatz}</html>`;
    // a.js lädt einen Chunk nach (wie Turbopack: Verweis „static/chunks/<name>.js“), dieser einen weiteren
    const js: Record<string, string> = {
      '/_next/static/chunks/a.js': 'e.l("static/chunks/spieler.js")',
      '/_next/static/chunks/spieler.js': 'e.l("static/chunks/auswahl.js");e.l("static/chunks/a.js")',
    };
    const antwort = new Response(pfad.startsWith('/_next/') ? (js[pfad] ?? 'datei') : html, { status: 200 });
    Object.defineProperty(antwort, 'type', { value: 'basic' });
    return antwort;
  };
  const self = {
    location: { origin: URSPRUNG, href: `${URSPRUNG}/lern-app/sw.js?v=${bau}` },
    addEventListener: (art: string, f: Hoerer) => hoerer.set(art, f),
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve() },
  };
  new Function('self', 'caches', 'fetch', 'URL', 'Response', QUELLE)(self, caches, holen, URL, Response);

  /** Ein fetch-Ereignis; Ergebnis: beantwortet? und die Antwort (Promise). */
  const anfrage = (pfad: string, { mode = 'navigate', method = 'GET', headers = {} as Record<string, string> } = {}) => {
    let antwort: Promise<Response> | null = null;
    hoerer.get('fetch')!({
      request: { method, url: new URL(pfad, URSPRUNG).href, mode, headers: new Headers(headers) },
      respondWith: (p: Promise<Response>) => {
        antwort = p;
      },
    });
    return antwort as Promise<Response> | null;
  };
  const warte = (art: string, daten?: unknown, ports: { postMessage: (d: unknown) => void }[] = []) => {
    let p: Promise<unknown> = Promise.resolve();
    hoerer.get(art)!({ data: daten, ports, waitUntil: (x: Promise<unknown>) => (p = x) });
    return p;
  };
  const inhalt = (name: string) => [...(speicher.get(name)?.keys() ?? [])].map((u) => u.slice(URSPRUNG.length)).sort();
  return { anfrage, warte, inhalt, speicher, abgerufen, setNetz: (an: boolean) => (netz = an) };
}

describe('Service Worker der Lern-App', () => {
  it('Aktivieren löscht nur eigene veraltete Hüllen und Fremdes mit dem Präfix; Pakete, Audio, Modelle und die Website bleiben', async () => {
    const w = ladeWorker({
      bau: 'neu1',
      vorraete: Object.fromEntries(
        [
          'igmg-lernapp-schale-valt9',
          'igmg-lernapp-schale-vneu1',
          'igmg-lernapp-pakete',
          'igmg-lernapp-audio',
          'igmg-lernapp-modelle',
          'igmg-lernapp-probe',
          'igmg-v1-seiten',
          'igmg-koran-v1',
        ].map((n) => [n, []]),
      ),
    });
    await w.warte('activate');
    expect([...w.speicher.keys()].sort()).toEqual([
      'igmg-koran-v1',
      'igmg-lernapp-audio',
      'igmg-lernapp-modelle',
      'igmg-lernapp-pakete',
      'igmg-lernapp-schale-vneu1',
      'igmg-v1-seiten',
    ]);
  });

  it('Bau-Kennung aus der Anmeldung, bereinigt; ohne Kennung v1', async () => {
    for (const [bau, name] of [
      ['a1b2c3', 'igmg-lernapp-schale-va1b2c3'],
      ['../X?<>', 'igmg-lernapp-schale-v1'],
      ['', 'igmg-lernapp-schale-v1'],
    ]) {
      const w = ladeWorker({ bau });
      await w.warte('install');
      expect([...w.speicher.keys()], bau).toEqual([name]);
    }
  });

  it('nie beantwortet: API, Anmeldung, POST, fremder Ursprung, RSC-Abrufe, Bereichsanfragen, Fremdes außerhalb der Seiten', () => {
    const w = ladeWorker();
    expect(w.anfrage('/api/lernapp/sync')).toBeNull();
    expect(w.anfrage('/lern-app/de/anmelden')).toBeNull();
    expect(w.anfrage('/lern-app/ar/anmelden?schritt=zwei-faktor')).toBeNull();
    expect(w.anfrage('/lern-app/de', { method: 'POST' })).toBeNull();
    expect(w.anfrage('https://fremd.example/lern-app/de')).toBeNull();
    expect(w.anfrage('/lern-app/de?_rsc=1', { mode: 'cors' })).toBeNull();
    expect(w.anfrage('/lern-app/de', { mode: 'cors', headers: { RSC: '1' } })).toBeNull();
    expect(w.anfrage('/lern-app/audio/tr/e01.lpa', { mode: 'cors', headers: { Range: 'bytes=0-99' } })).toBeNull();
    expect(w.anfrage('/lern-app/de/manifest.webmanifest', { mode: 'cors' })).toBeNull();
    expect(w.anfrage('/lern-app/de', { mode: 'cors' })).toBeNull();
  });

  it('Seiten: Netz zuerst, gespeichert ohne Suchteil; ohne Netz die gespeicherte Seite, sonst der Start der Oberfläche', async () => {
    const w = ladeWorker({ bau: 'b1' });
    await w.anfrage('/lern-app/de')!;
    await w.anfrage('/lern-app/de/tr-aus-de/ueben?l=tr.a1.e01.l01')!;
    await new Promise((r) => setTimeout(r, 0));
    expect(w.inhalt('igmg-lernapp-schale-vb1')).toEqual(['/lern-app/de', '/lern-app/de/tr-aus-de/ueben']);

    w.setNetz(false);
    expect(await (await w.anfrage('/lern-app/de/tr-aus-de/ueben?l=tr.a1.e02.l03')!).text()).toContain('/lern-app/de/tr-aus-de/ueben');
    // nie besucht: der Start derselben Oberfläche
    expect(await (await w.anfrage('/lern-app/de/einstellungen')!).text()).toContain('/lern-app/de<');
    // ohne vorgehaltenen Start: Netzfehler
    const fehler = await w.anfrage('/lern-app/ar')!;
    expect(fehler.type).toBe('error');
  });

  it('Programmteile, Pakete, Audio und Modelle: Vorrat zuerst in ihrem Vorrat; das Kursverzeichnis Netz zuerst', async () => {
    const w = ladeWorker({ bau: 'b2' });
    for (const p of [
      '/_next/static/chunks/x.js',
      '/lern-app/pakete/tr-aus-de',
      '/lern-app/pakete/tr-aus-de/tr.a1.e01/abcdef',
      '/lern-app/audio/tr/e01.lpa',
      '/lern-app/modelle/whisper/encoder.onnx',
    ])
      await w.anfrage(p, { mode: 'cors' })!;
    await new Promise((r) => setTimeout(r, 0));
    expect(w.inhalt('igmg-lernapp-schale-vb2')).toEqual(['/_next/static/chunks/x.js']);
    expect(w.inhalt('igmg-lernapp-pakete')).toEqual(['/lern-app/pakete/tr-aus-de', '/lern-app/pakete/tr-aus-de/tr.a1.e01/abcdef']);
    expect(w.inhalt('igmg-lernapp-audio')).toEqual(['/lern-app/audio/tr/e01.lpa']);
    expect(w.inhalt('igmg-lernapp-modelle')).toEqual(['/lern-app/modelle/whisper/encoder.onnx']);

    const vorher = w.abgerufen.length;
    await w.anfrage('/lern-app/pakete/tr-aus-de/tr.a1.e01/abcdef', { mode: 'cors' })!;
    await w.anfrage('/lern-app/audio/tr/e01.lpa', { mode: 'cors' })!;
    expect(w.abgerufen.length).toBe(vorher);
    await w.anfrage('/lern-app/pakete/tr-aus-de', { mode: 'cors' })!;
    expect(w.abgerufen.length).toBe(vorher + 1);
    w.setNetz(false);
    expect((await w.anfrage('/lern-app/pakete/tr-aus-de', { mode: 'cors' })!).status).toBe(200);
  });

  it('Koran-Pfad (L6-05): Verzeichnis je Sprache Netz zuerst, Einheitenpaket Vorrat zuerst', async () => {
    const w = ladeWorker({ bau: 'b3' });
    const verzeichnis = '/lern-app/pakete/koran/de';
    const paket = '/lern-app/pakete/koran/de/koran.grund.e01/abcdef';
    for (const p of [verzeichnis, paket]) await w.anfrage(p, { mode: 'cors' })!;
    await new Promise((r) => setTimeout(r, 0));
    expect(w.inhalt('igmg-lernapp-pakete')).toEqual([verzeichnis, paket]);
    const vorher = w.abgerufen.length;
    await w.anfrage(paket, { mode: 'cors' })!;
    expect(w.abgerufen.length).toBe(vorher);
    await w.anfrage(verzeichnis, { mode: 'cors' })!;
    expect(w.abgerufen.length).toBe(vorher + 1);
    w.setNetz(false);
    expect((await w.anfrage(verzeichnis, { mode: 'cors' })!).status).toBe(200);
  });

  it('Worker der Sprechübung: je Bau eine Fassung im Vorrat der Modelle (ältere fallen weg), die Modelldateien bleiben', async () => {
    const w = ladeWorker({ bau: 'b4' });
    for (const p of [
      '/lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx',
      '/lern-app/modelle/sprechen/whisper.worker.mjs?v=alt',
      '/lern-app/modelle/sprechen/whisper.worker.mjs?v=neu',
    ])
      await w.anfrage(p, { mode: 'cors' })!;
    await new Promise((r) => setTimeout(r, 0));
    expect(w.inhalt('igmg-lernapp-modelle')).toEqual([
      '/lern-app/modelle/sprechen/whisper.worker.mjs?v=neu',
      '/lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx',
    ]);
  });

  it('Lizenztexte neben den Gewichten gehen ans Netz und nicht in den Vorrat der Modelle', async () => {
    const w = ladeWorker({ bau: 'b5' });
    for (const datei of ['LIZENZ-whisper-MIT.txt', 'LIZENZ-Apache-2.0.txt'])
      expect(w.anfrage(`/lern-app/modelle/whisper-base-64da572/${datei}`, { mode: 'navigate' }), datei).toBeNull();
    await w.anfrage('/lern-app/modelle/whisper-base-64da572/config.json', { mode: 'cors' })!;
    await new Promise((r) => setTimeout(r, 0));
    expect(w.inhalt('igmg-lernapp-modelle')).toEqual(['/lern-app/modelle/whisper-base-64da572/config.json']);
  });

  it('Hülle einer Oberflächensprache auf Bitte der Seite: Start, Fortschritt, Wortschatz, Einstellungen, Quellen und ihre Programmteile', async () => {
    const w = ladeWorker({ bau: 'b3' });
    await w.warte('message', { art: 'schale', ui: 'ar' });
    expect(w.inhalt('igmg-lernapp-schale-vb3')).toEqual([
      '/_next/static/chunks/a.js',
      '/_next/static/css/b.css',
      '/lern-app/ar',
      '/lern-app/ar/einstellungen',
      '/lern-app/ar/fortschritt',
      '/lern-app/ar/quellen',
      '/lern-app/ar/wortschatz',
    ]);
    // Jede Seite bittet bei jedem Laden darum: Vorhandenes wird nicht erneut geholt
    const vorher = w.abgerufen.length;
    await w.warte('message', { art: 'schale', ui: 'ar' });
    expect(w.abgerufen.length).toBe(vorher);
    // Fehlt eine Seite (z. B. vom Browser geräumt), wird nur sie geholt
    w.speicher.get('igmg-lernapp-schale-vb3')?.delete(`${URSPRUNG}/lern-app/ar/quellen`);
    await w.warte('message', { art: 'schale', ui: 'ar' });
    expect(w.abgerufen.slice(vorher)).toEqual([`${URSPRUNG}/lern-app/ar/quellen`]);
    const unbekannt = ladeWorker({ bau: 'b4' });
    await unbekannt.warte('message', { art: 'schale', ui: 'en' });
    expect(unbekannt.inhalt('igmg-lernapp-schale-vb4')).toEqual([]);
  });

  it('Verweise mit „..“ (auch kodiert) aus dem HTML holt der Worker nie: keine API-Antwort in der Hülle (S-L1 N-5)', async () => {
    const zusatz = [
      '<img src="/_next/static/../../api/lernapp/sitzung">',
      '<img src="/_next/static/%2e%2e/%2e%2e/api/lernapp/sitzung">',
      '<img src="/_next/static/..%2f..%2fapi/lernapp/sync">',
      '<img src="/_next/static/chunks/../../../lern-app/de/anmelden">',
    ].join('');
    const w = ladeWorker({ bau: 'b6', zusatz });
    await w.warte('message', { art: 'schale', ui: 'de' });
    expect(w.abgerufen.filter((u) => u.includes('..') || /%2e|%2f/i.test(u) || u.includes('/api/') || u.includes('anmelden'))).toEqual([]);
    expect(w.inhalt('igmg-lernapp-schale-vb6').filter((p) => !p.startsWith('/_next/static/') && !p.startsWith('/lern-app/de'))).toEqual([]);
    expect(w.inhalt('igmg-lernapp-schale-vb6')).toContain('/_next/static/chunks/a.js');
  });

  it('Seiten eines Kurses nach „Einheit offline speichern“: nur Lern-App-Seiten (nie die Anmeldung), Antwort über den Kanal', async () => {
    const w = ladeWorker({ bau: 'b5' });
    const antworten: unknown[] = [];
    await w.warte(
      'message',
      {
        art: 'seiten',
        pfade: [
          '/lern-app/de/tr-aus-de',
          '/lern-app/de/tr-aus-de/ueben',
          '/lern-app/de/anmelden',
          '/verwaltung',
          'https://fremd.test/x',
          7,
        ],
      },
      [{ postMessage: (d) => antworten.push(d) }],
    );
    // samt nachgeladenen Programmteilen (Spieler, Übungstypen), damit die Übung ohne Netz startet
    expect(w.inhalt('igmg-lernapp-schale-vb5')).toEqual([
      '/_next/static/chunks/a.js',
      '/_next/static/chunks/auswahl.js',
      '/_next/static/chunks/spieler.js',
      '/_next/static/css/b.css',
      '/lern-app/de/tr-aus-de',
      '/lern-app/de/tr-aus-de/ueben',
    ]);
    expect(antworten).toEqual([{ fertig: true }]);
    // ohne Liste: nichts geholt, trotzdem Antwort
    const leer = ladeWorker({ bau: 'b6' });
    const nachher: unknown[] = [];
    await leer.warte('message', { art: 'seiten' }, [{ postMessage: (d) => nachher.push(d) }]);
    expect(leer.inhalt('igmg-lernapp-schale-vb6')).toEqual([]);
    expect(nachher).toEqual([{ fertig: true }]);
  });
});
