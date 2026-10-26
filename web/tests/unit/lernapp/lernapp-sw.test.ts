import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ORT_DRITTLIZENZEN } from '@/lib/lernapp/quellen';

/**
 * Service Worker der Lern-App (PLAN §3.5, ADR 0037 Nr. 8): Vorräte `igmg-lernapp-schale-v<bau>`, `-kurse-v<bau>` (Stufe C N9a),
 * `-pakete`, `-audio`, `-modelle`; nie `/api/**`, die Anmeldung, RSC-Abrufe oder Bereichsanfragen; Seiten Netz zuerst, ohne
 * Netz aus der Hülle (ohne Suchteil, `ignoreSearch`), dem Kursvorrat oder einem älteren Bau, sonst der Start der Oberfläche;
 * Hülle je Oberflächensprache auf Bitte der Seite; Kursseiten gespeicherter Kurse überleben einen Bauwechsel (Befund G-1).
 * Der Worker läuft hier in einer kleinen Nachbildung der Worker-Umgebung mit Cache Storage im Speicher; zwei Worker können
 * sich den Speicher teilen (Bauwechsel).
 */
const QUELLE = readFileSync(join(import.meta.dirname, '../../../public/lern-app/sw.js'), 'utf8');
const URSPRUNG = 'https://igmg.test';

type Hoerer = (e: Record<string, unknown>) => void;
type Vorrat = Map<string, Response>;

function ladeWorker({
  bau = 'abc123',
  vorraete = {} as Record<string, string[]>,
  netz = true,
  zusatz = '',
  speicher = new Map<string, Vorrat>(),
  fehlend = [] as string[],
} = {}) {
  const hoerer = new Map<string, Hoerer>();
  for (const [n, urls] of Object.entries(vorraete)) speicher.set(n, new Map(urls.map((u) => [u, new Response(`alt ${u}`)])));
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
    match: async (r: Request | string, o?: { cacheName?: string; ignoreSearch?: boolean }) => {
      const namen = o?.cacheName ? [o.cacheName] : [...speicher.keys()];
      for (const n of namen) {
        // wie die Cache-API: Abgleich samt Suchteil, mit `ignoreSearch` nur nach dem Pfad
        const ohneSuche = (u: string) => u.split('?')[0];
        const a = o?.ignoreSearch
          ? [...(speicher.get(n)?.entries() ?? [])].find(([k]) => ohneSuche(k) === ohneSuche(url(r)))?.[1]
          : speicher.get(n)?.get(url(r));
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
    if (fehlend.includes(pfad)) return new Response('fehlt', { status: 404 });
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
  /** Nachricht mit Antwortkanal; Ergebnis: die Antworten des Workers */
  const frage = async (daten: unknown) => {
    const antworten: unknown[] = [];
    await warte('message', daten, [{ postMessage: (d) => antworten.push(d) }]);
    return antworten;
  };
  return { anfrage, warte, frage, inhalt, speicher, abgerufen, setNetz: (an: boolean) => (netz = an) };
}

/** Vier Seiten eines Kurses (Lernpfad, Üben, Wiederholen, Tipps) */
const kursSeiten = (ui: string, kurs: string) => ['', '/ueben', '/wiederholen', '/tipps'].map((t) => `/lern-app/${ui}/${kurs}${t}`);

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

  it('Bau-Kennung aus der Anmeldung, bereinigt; ohne Kennung v1; Hülle und Kursvorrat entstehen beim Installieren', async () => {
    for (const [bau, kennung] of [
      ['a1b2c3', 'a1b2c3'],
      ['../X?<>', '1'],
      ['', '1'],
    ]) {
      const w = ladeWorker({ bau });
      await w.warte('install');
      expect([...w.speicher.keys()], bau).toEqual([`igmg-lernapp-schale-v${kennung}`, `igmg-lernapp-kurse-v${kennung}`]);
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

  it('Drittlizenzen von ORT (Z-L17): aus dem Vorrat der Modelle, den die Sprachprüfung füllt, auch ohne Netz; sonst Netz, ohne Vorhalten', async () => {
    const pfad = ORT_DRITTLIZENZEN.pfad;
    expect(pfad).toMatch(/^\/lern-app\/lizenzen\/onnxruntime-ThirdPartyNotices\.txt\?v=[0-9a-f]{12}$/);
    const ohne = ladeWorker({ bau: 'b6' });
    expect((await ohne.anfrage(pfad)!).status).toBe(200);
    await new Promise((r) => setTimeout(r, 0));
    expect(ohne.abgerufen).toEqual([`${URSPRUNG}${pfad}`]);
    expect(ohne.inhalt('igmg-lernapp-modelle')).toEqual([]);

    const mit = ladeWorker({ bau: 'b6', vorraete: { 'igmg-lernapp-modelle': [`${URSPRUNG}${pfad}`] }, netz: false });
    const antwort = await mit.anfrage(pfad)!;
    expect(await antwort.text()).toBe(`alt ${URSPRUNG}${pfad}`);
    expect(mit.abgerufen).toEqual([]);
  });

  it('Drittlizenzen von ORT, Fassungswechsel: eine alte Kopie (andere Fassung oder ohne Fassung) liefert er nie für die neue Adresse', async () => {
    const neu = ORT_DRITTLIZENZEN.pfad;
    const datei = neu.split('?')[0]!;
    const alt = [`${URSPRUNG}${datei}?v=000000000000`, `${URSPRUNG}${datei}`];
    // mit Netz: die neue Fassung kommt aus dem Netz, nicht die alte Kopie
    const online = ladeWorker({ bau: 'b7', vorraete: { 'igmg-lernapp-modelle': alt } });
    expect(await (await online.anfrage(neu)!).text()).not.toMatch(/^alt /);
    expect(online.abgerufen).toEqual([`${URSPRUNG}${neu}`]);
    // ohne Netz: keine veraltete Kopie unter der neuen Fassung (die Seite nennt sonst den neuen Stand über altem Text)
    const offline = ladeWorker({ bau: 'b7', vorraete: { 'igmg-lernapp-modelle': alt }, netz: false });
    await expect(offline.anfrage(neu)!).rejects.toThrow('offline');
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

  it('Seiten eines Kurses nach „offline speichern“: in den Kursvorrat samt nachgeladener Programmteile, Merkzeichen, Antwort', async () => {
    const w = ladeWorker({ bau: 'b5' });
    expect(await w.frage({ art: 'kurs', ui: 'de', kurs: 'tr-aus-de' })).toEqual([{ fertig: true, stand: 'vollstaendig' }]);
    // samt nachgeladenen Programmteilen (Spieler, Übungstypen), damit die Übung ohne Netz startet
    expect(w.inhalt('igmg-lernapp-kurse-vb5')).toEqual([
      '/_next/static/chunks/a.js',
      '/_next/static/chunks/auswahl.js',
      '/_next/static/chunks/spieler.js',
      '/_next/static/css/b.css',
      '/lern-app/de/tr-aus-de',
      '/lern-app/de/tr-aus-de/tipps',
      '/lern-app/de/tr-aus-de/ueben',
      '/lern-app/de/tr-aus-de/wiederholen',
      '/lern-app/de/tr-aus-de?vorrat=vollstaendig',
    ]);
    // nicht in die Hülle (die Grenze von 400 Einträgen verdrängt gespeicherte Kurse nie)
    expect(w.inhalt('igmg-lernapp-schale-vb5')).toEqual([]);
    // Stand ohne Netz; ein zweites Mal wird nichts geholt
    w.setNetz(false);
    expect(await w.frage({ art: 'kursStand', ui: 'de', kurs: 'tr-aus-de' })).toEqual([{ fertig: true, stand: 'vollstaendig' }]);
    expect(await w.frage({ art: 'kursStand', ui: 'tr', kurs: 'tr-aus-de' })).toEqual([{ fertig: true, stand: 'fehlt' }]);
    const vorher = w.abgerufen.length;
    expect(await w.frage({ art: 'kurs', ui: 'de', kurs: 'tr-aus-de' })).toEqual([{ fertig: true, stand: 'vollstaendig' }]);
    expect(w.abgerufen.length).toBe(vorher);
  });

  it('nur Kurse der Lern-App (nie die Anmeldung, nie Fremdes); ohne Netz kein Merkzeichen; ältere Seiten bitten mit „seiten“', async () => {
    const w = ladeWorker({ bau: 'b6' });
    for (const [ui, kurs] of [
      ['de', 'anmelden'],
      ['en', 'tr-aus-de'],
      ['de', '../api'],
      ['de', undefined],
    ])
      expect(await w.frage({ art: 'kurs', ui, kurs }), `${ui} ${kurs}`).toEqual([{ fertig: true, stand: 'fehlt' }]);
    expect(w.abgerufen).toEqual([]);

    const offline = ladeWorker({ bau: 'b7', netz: false });
    expect(await offline.frage({ art: 'kurs', ui: 'de', kurs: 'islam' })).toEqual([{ fertig: true, stand: 'netz' }]);
    expect(offline.inhalt('igmg-lernapp-kurse-vb7').some((p) => p.includes('?vorrat'))).toBe(false);

    // der Server hat eine Seite nicht (404): kein Merkzeichen, Stand „fehlt“
    const ohneTipps = ladeWorker({ bau: 'b8', fehlend: ['/lern-app/de/islam/tipps'] });
    expect(await ohneTipps.frage({ art: 'kurs', ui: 'de', kurs: 'islam' })).toEqual([{ fertig: true, stand: 'fehlt' }]);
    expect(await ohneTipps.frage({ art: 'kursStand', ui: 'de', kurs: 'islam' })).toEqual([{ fertig: true, stand: 'fehlt' }]);

    // Seiten eines Baus vor N9a: `{ art: 'seiten', pfade }` – der Kurs aus dem Lernpfad der Liste, sonst nichts
    const alt = ladeWorker({ bau: 'b9' });
    expect(await alt.frage({ art: 'seiten', pfade: [...kursSeiten('ar', 'de-aus-ar'), '/lern-app/ar/anmelden', 7] })).toEqual([
      { fertig: true, stand: 'vollstaendig' },
    ]);
    expect(alt.inhalt('igmg-lernapp-kurse-vb9')).toContain('/lern-app/ar/de-aus-ar?vorrat=vollstaendig');
    const leer = ladeWorker({ bau: 'b10' });
    expect(await leer.frage({ art: 'seiten' })).toEqual([{ fertig: true, stand: 'fehlt' }]);
    expect(leer.abgerufen).toEqual([]);
  });

  it('Bauwechsel (G-1): der neue Worker behält den alten Kursvorrat, liefert ohne Netz dessen Seiten und Programmteile und holt die Kurse dann neu', async () => {
    const speicher = new Map<string, Vorrat>();
    const a = ladeWorker({ bau: 'bau1', speicher });
    await a.warte('install');
    await a.warte('activate');
    expect(await a.frage({ art: 'kurs', ui: 'de', kurs: 'tr-aus-de' })).toEqual([{ fertig: true, stand: 'vollstaendig' }]);
    await a.anfrage('/lern-app/de')!;
    await new Promise((r) => setTimeout(r, 0));

    // neuer Bau: Hülle des alten weg, Kursvorrat mit Merkzeichen bleibt
    const b = ladeWorker({ bau: 'bau2', speicher });
    await b.warte('install');
    await b.warte('activate');
    expect([...speicher.keys()].sort()).toEqual(['igmg-lernapp-kurse-vbau1', 'igmg-lernapp-kurse-vbau2', 'igmg-lernapp-schale-vbau2']);
    expect(await b.frage({ art: 'kursStand', ui: 'de', kurs: 'tr-aus-de' })).toEqual([{ fertig: true, stand: 'fehlt' }]);

    // ohne Netz: Seiten und Programmteile aus dem Kursvorrat des alten Baus (in sich stimmig)
    b.setNetz(false);
    expect(await (await b.anfrage('/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.e01.l01')!).text()).toContain(
      '/lern-app/de/tr-aus-de/ueben',
    );
    expect(await (await b.anfrage('/lern-app/de/tr-aus-de/wiederholen')!).text()).toContain('/lern-app/de/tr-aus-de/wiederholen');
    expect(await (await b.anfrage('/_next/static/chunks/spieler.js', { mode: 'cors' })!).text()).toContain('auswahl.js');
    // die Wiederherstellung ohne Netz scheitert: der alte Vorrat bleibt
    expect(await b.frage({ art: 'schale', ui: 'de' })).toEqual([{ fertig: true }]);
    expect(speicher.has('igmg-lernapp-kurse-vbau1')).toBe(true);

    // mit Netz: Kurs tief in den neuen Kursvorrat, Merkzeichen, alter Vorrat gelöscht
    b.setNetz(true);
    expect(await b.frage({ art: 'schale', ui: 'de' })).toEqual([{ fertig: true }]);
    expect(speicher.has('igmg-lernapp-kurse-vbau1')).toBe(false);
    expect(b.inhalt('igmg-lernapp-kurse-vbau2')).toEqual(
      expect.arrayContaining([
        ...kursSeiten('de', 'tr-aus-de'),
        '/lern-app/de/tr-aus-de?vorrat=vollstaendig',
        '/_next/static/chunks/auswahl.js',
      ]),
    );
    expect(await b.frage({ art: 'kursStand', ui: 'de', kurs: 'tr-aus-de' })).toEqual([{ fertig: true, stand: 'vollstaendig' }]);
    b.setNetz(false);
    expect(await (await b.anfrage('/lern-app/de/tr-aus-de/tipps')!).text()).toContain('/lern-app/de/tr-aus-de/tipps');
  });

  it('Bauwechsel: ältere Hülle ohne Kurse und Kursvorrat ohne Merkzeichen gehen beim Aktivieren', async () => {
    const speicher = new Map<string, Vorrat>();
    const a = ladeWorker({ bau: 'bau1', speicher, netz: false });
    await a.warte('install');
    await a.frage({ art: 'kurs', ui: 'de', kurs: 'tr-aus-de' });
    const b = ladeWorker({ bau: 'bau2', speicher });
    await b.warte('install');
    await b.warte('activate');
    expect([...speicher.keys()].sort()).toEqual(['igmg-lernapp-kurse-vbau2', 'igmg-lernapp-schale-vbau2']);
  });

  it('Übergang von Workern vor N9a: Kurse mit allen vier Seiten in der alten Hülle gelten als gespeichert und kommen in den Kursvorrat', async () => {
    const alteHuelle = [
      ...kursSeiten('tr', 'de-aus-tr'),
      '/lern-app/tr',
      '/lern-app/tr/ar-aus-tr',
      '/lern-app/tr/ar-aus-tr/ueben',
      '/_next/static/chunks/alt.js',
    ].map((p) => `${URSPRUNG}${p}`);
    const w = ladeWorker({ bau: 'neu', vorraete: { 'igmg-lernapp-schale-valt': alteHuelle } });
    await w.warte('install');
    await w.warte('activate');
    // nur der Kurs mit allen vier Seiten bekommt ein Merkzeichen; die alte Hülle bleibt bis zur Wiederherstellung
    expect(w.inhalt('igmg-lernapp-schale-valt').filter((p) => p.includes('?vorrat'))).toEqual([
      '/lern-app/tr/de-aus-tr?vorrat=vollstaendig',
    ]);
    // ohne Netz: die Seiten des Kurses aus der alten Hülle
    w.setNetz(false);
    expect(await (await w.anfrage('/lern-app/tr/de-aus-tr/ueben')!).text()).toBe(`alt ${URSPRUNG}/lern-app/tr/de-aus-tr/ueben`);
    w.setNetz(true);
    await w.frage({ art: 'schale', ui: 'tr' });
    expect(w.speicher.has('igmg-lernapp-schale-valt')).toBe(false);
    expect(w.inhalt('igmg-lernapp-kurse-vneu')).toContain('/lern-app/tr/de-aus-tr?vorrat=vollstaendig');
    expect(w.inhalt('igmg-lernapp-kurse-vneu').some((p) => p.startsWith('/lern-app/tr/ar-aus-tr'))).toBe(false);
  });

  it('Kursvorrat ohne Obergrenze: Stöbern füllt die Hülle bis 400 Einträge, gespeicherte Kurse bleiben vollständig', async () => {
    const w = ladeWorker({ bau: 'g1' });
    await w.frage({ art: 'kurs', ui: 'de', kurs: 'tr-aus-de' });
    const kurs = w.inhalt('igmg-lernapp-kurse-vg1');
    for (let i = 0; i < 420; i++) await w.anfrage(`/_next/static/chunks/s${i}.js`, { mode: 'cors' })!;
    await new Promise((r) => setTimeout(r, 0));
    expect(w.inhalt('igmg-lernapp-schale-vg1').length).toBeLessThanOrEqual(400);
    expect(w.inhalt('igmg-lernapp-kurse-vg1')).toEqual(kurs);
  });

  it('Programmteil, den der Server nicht mehr hat (offene Seite des vorigen Baus): die Kopie eines älteren Baus', async () => {
    const datei = `${URSPRUNG}/_next/static/chunks/vorher.js`;
    const w = ladeWorker({ bau: 'n1', vorraete: { 'igmg-lernapp-kurse-vn0': [datei] }, fehlend: ['/_next/static/chunks/vorher.js'] });
    expect(await (await w.anfrage('/_next/static/chunks/vorher.js', { mode: 'cors' })!).text()).toBe(`alt ${datei}`);
    // ohne ältere Kopie bleibt es bei der Antwort des Servers
    expect((await w.anfrage('/_next/static/chunks/nie.js', { mode: 'cors' })!).status).toBe(200);
  });
});
