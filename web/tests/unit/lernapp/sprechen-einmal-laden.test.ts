import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  DOWNLOAD_PFADE,
  MODELL,
  MODELL_DATEIEN,
  MODELLE_BASIS,
  modellAdresse,
  ORT,
  ORT_HINWEISE,
  ortAdresse,
  TRANSFORMERS_UMGEBUNG,
} from '@/lib/lernapp/sprechen/modell';
import { type Abruf, fuelleVorrat, VORRAT_DATEIEN, type Vorrat } from '@/lib/lernapp/sprechen/vorrat';

/**
 * L8-02 – Sprechübung: jede Datei genau einmal laden, und die Pipeline entsteht MIT Tokenizer und Prozessor.
 *
 * Geschichte: Der Worker übergab transformers.js eine Fortschrittsmeldung; dafür fragte es vorab jede Datei per vollständigem
 * GET ab, und der Service Worker lud Encoder und Decoder zweimal. Die erste Behebung (`a0795f7b`, absoluter Modellordner)
 * war falsch (Gegenprüfung L8-02): Bei absolutem `localModelPath` überspringt `get_file_metadata` den eigenen Ursprung und
 * meldet ohne Vorrat jede Datei als fehlend – die Pipeline entstand ohne Tokenizer und Prozessor, der Probelauf scheiterte.
 * Jetzt: Modellordner relativ, der Worker füllt den Vorrat selbst (`fuelleVorrat`, ein Abruf je Datei) und baut die
 * Pipeline ohne Fortschrittsmeldung aus dem Vorrat.
 *
 * Geprüft am Browser-Bau von transformers.js, den der Bauschritt in den Worker bündelt (`dist/transformers.min.js`), mit
 * denselben Einstellungen (`TRANSFORMERS_UMGEBUNG`); der Vorrat ist eine Attrappe der Cache-API (relative Schlüssel gegen den
 * Ursprung aufgelöst wie im Browser), `env.fetch` zählt jeden Abruf. Testinhalt: ein neutrales Alltagswort.
 */
const TRANSFORMERS = pathToFileURL(join(process.cwd(), 'node_modules/@huggingface/transformers/dist/transformers.min.js')).href;
const URSPRUNG = 'https://lernapp.beispiel.invalid';
const ORDNER = join(process.cwd(), 'public');

/** Vorrat wie die Cache-API: Schlüssel relativ zum Ursprung, Körper beim Ablegen vollständig gelesen. */
class VorratAttrappe implements Vorrat {
  eintraege = new Map<string, { koerper: Uint8Array; kopf: Headers }>();
  async match(anfrage: RequestInfo | URL): Promise<Response | undefined> {
    const e = this.eintraege.get(new URL(String(anfrage instanceof Request ? anfrage.url : anfrage), URSPRUNG).href);
    return e ? new Response(e.koerper.slice(), { status: 200, headers: e.kopf }) : undefined;
  }
  async put(anfrage: RequestInfo | URL, antwort: Response): Promise<void> {
    const koerper = new Uint8Array(await antwort.arrayBuffer());
    this.eintraege.set(new URL(String(anfrage instanceof Request ? anfrage.url : anfrage), URSPRUNG).href, {
      koerper,
      kopf: antwort.headers,
    });
  }
}

/** Eigener Ursprung: echte Konfigurationsdateien aus public/; Gewichte und ORT als kleine Platzhalter (nur die Bytes zählen). */
function ursprung() {
  const abrufe: string[] = [];
  const abruf: Abruf = async (adresse) => {
    const url = new URL(adresse, URSPRUNG);
    abrufe.push(url.pathname + url.search);
    if (url.origin !== URSPRUNG || !DOWNLOAD_PFADE.includes(url.pathname)) return new Response('', { status: 404 });
    const koerper = url.pathname.endsWith('.json') ? readFileSync(join(ORDNER, url.pathname)) : new Uint8Array(3_000_000).fill(7);
    // wie der Server bei gepackten Antworten: ohne Content-Length
    return new Response(koerper, { status: 200, headers: { 'content-type': 'application/octet-stream' } });
  };
  return { abrufe, abruf };
}

type Transformers = {
  env: Record<string, unknown>;
  ModelRegistry: {
    get_file_metadata: (modell: string, datei: string) => Promise<{ exists: boolean }>;
    get_pipeline_files: (aufgabe: string, modell: string, o: object) => Promise<string[]>;
  };
  AutoTokenizer: { from_pretrained: (modell: string) => Promise<{ encode: (text: string) => number[] }> };
  AutoProcessor: { from_pretrained: (modell: string) => Promise<unknown> };
  WhisperTokenizer: new (...a: never[]) => unknown;
  WhisperProcessor: new (...a: never[]) => unknown;
};

/** transformers.js mit den Einstellungen des Workers; Vorrat und Abruf als Attrappen. */
async function mitTransformers<T>(vorrat: Vorrat, abruf: Abruf, pruefung: (t: Transformers) => Promise<T>): Promise<T> {
  const t = (await import(TRANSFORMERS)) as Transformers;
  const vorher = { ...t.env };
  Object.assign(t.env, TRANSFORMERS_UMGEBUNG, {
    useFS: false,
    useFSCache: false,
    // Node hat keine Cache Storage: derselbe Vorrat als eigener Cache (gleiche Schnittstelle match/put)
    useCustomCache: true,
    customCache: vorrat,
    fetch: (adresse: string | URL, init?: RequestInit) => abruf(String(adresse), init),
  });
  try {
    return await pruefung(t);
  } finally {
    Object.assign(t.env, vorher);
  }
}

describe('Sprechübung: Download in den Vorrat (fuelleVorrat)', () => {
  it('umfasst die 7 Modelldateien, die ORT-.wasm und ihre Drittlizenzen; mit Worker und ORT-.mjs sind es die 11 Download-Dateien', () => {
    expect(VORRAT_DATEIEN.map((d) => d.pfad)).toEqual([
      ...MODELL_DATEIEN.map((d) => modellAdresse(d.pfad)),
      ortAdresse(ORT.wasm),
      ORT_HINWEISE.pfad,
    ]);
    expect(VORRAT_DATEIEN.filter((d) => d.lizenz).map((d) => d.pfad)).toEqual([ORT_HINWEISE.pfad]);
    expect(DOWNLOAD_PFADE).toHaveLength(11);
    expect(new Set(DOWNLOAD_PFADE).size).toBe(11);
    expect(DOWNLOAD_PFADE).toEqual(expect.arrayContaining([...VORRAT_DATEIEN.map((d) => d.pfad), ortAdresse(ORT.mjs)]));
  });

  it('holt jede fehlende Datei genau einmal, meldet den Fortschritt bis zum Ende und holt aus dem vollen Vorrat nichts mehr', async () => {
    const vorrat = new VorratAttrappe();
    const { abrufe, abruf } = ursprung();
    const stand = new Map<string, number>();
    await fuelleVorrat(vorrat, abruf, URSPRUNG, (datei, geladen) => stand.set(datei, geladen));
    expect([...abrufe].sort()).toEqual(VORRAT_DATEIEN.map((d) => d.pfad).sort());
    for (const d of VORRAT_DATEIEN) {
      const eintrag = vorrat.eintraege.get(new URL(d.pfad, URSPRUNG).href);
      expect(eintrag, d.pfad).toBeDefined();
      expect(stand.get(d.datei), d.datei).toBe(eintrag?.koerper.byteLength);
    }
    // Antwort ohne Länge und Kodierung im Vorrat (der Körper ist entpackt)
    expect(vorrat.eintraege.get(new URL(modellAdresse('config.json'), URSPRUNG).href)?.kopf.get('content-length')).toBeNull();

    abrufe.length = 0;
    await fuelleVorrat(vorrat, abruf, URSPRUNG);
    expect(abrufe).toEqual([]);
  });

  it('bricht bei einer fehlenden Datei ab und legt sie nicht in den Vorrat', async () => {
    const vorrat = new VorratAttrappe();
    const abruf: Abruf = async (adresse) =>
      adresse.endsWith('tokenizer.json') ? new Response('', { status: 404 }) : new Response('{}', { status: 200 });
    await expect(fuelleVorrat(vorrat, abruf, URSPRUNG)).rejects.toThrow('tokenizer.json: Error: Status 404');
    expect(vorrat.eintraege.has(new URL(modellAdresse('tokenizer.json'), URSPRUNG).href)).toBe(false);
  });

  it('Drittlizenzen von ORT (Z-L17): ohne sie kein Abbruch, der nächste Start holt sie nach; danach liegen sie offline im Vorrat', async () => {
    const vorrat = new VorratAttrappe();
    const { abrufe, abruf } = ursprung();
    const ohneLizenz: Abruf = async (adresse, init) =>
      new URL(adresse, URSPRUNG).pathname === ORT_HINWEISE.pfad ? Promise.reject(new TypeError('Failed to fetch')) : abruf(adresse, init);
    await fuelleVorrat(vorrat, ohneLizenz, URSPRUNG);
    const imVorrat = (pfad: string) => vorrat.eintraege.has(new URL(pfad, URSPRUNG).href);
    expect(VORRAT_DATEIEN.filter((d) => !imVorrat(d.pfad)).map((d) => d.pfad)).toEqual([ORT_HINWEISE.pfad]);
    abrufe.length = 0;
    await fuelleVorrat(vorrat, abruf, URSPRUNG);
    expect(abrufe).toEqual([ORT_HINWEISE.pfad]);
    expect(imVorrat(ORT_HINWEISE.pfad)).toBe(true);
  });

  it('bricht bei einem Abbruch mitten in der Datei ab (mit Stand) und legt sie nicht in den Vorrat', async () => {
    const vorrat = new VorratAttrappe();
    const abruf: Abruf = async (adresse) => {
      if (!adresse.endsWith('encoder_model_quantized.onnx')) return new Response('{}', { status: 200 });
      let gelesen = false;
      const koerper = new ReadableStream<Uint8Array>({
        pull(s) {
          if (gelesen) return s.error(new TypeError('Failed to fetch'));
          gelesen = true;
          s.enqueue(new Uint8Array(1_500_000));
        },
      });
      return new Response(koerper, { status: 200 });
    };
    await expect(fuelleVorrat(vorrat, abruf, URSPRUNG)).rejects.toThrow(
      `onnx/encoder_model_quantized.onnx: Error: nach 1500000 von ${MODELL_DATEIEN[5]?.bytes} Bytes abgebrochen (Failed to fetch)`,
    );
    expect(vorrat.eintraege.has(new URL(modellAdresse('onnx/encoder_model_quantized.onnx'), URSPRUNG).href)).toBe(false);
  });

  it('legt eine Datei vollständig ab, auch wenn sie größer ist als erwartet', async () => {
    const vorrat = new VorratAttrappe();
    const gross = new Uint8Array(10_000).map((_, i) => i % 251);
    await fuelleVorrat(vorrat, async () => new Response(gross, { status: 200 }), URSPRUNG);
    expect(vorrat.eintraege.get(new URL(modellAdresse('config.json'), URSPRUNG).href)?.koerper).toEqual(gross);
  });
});

describe('Sprechübung: transformers.js baut die Pipeline aus dem Vorrat – mit Tokenizer und Prozessor, ohne Abruf', () => {
  it('nach fuelleVorrat: alle Dateien vorhanden, Tokenizer und Prozessor laden, kein weiterer Abruf', async () => {
    const vorrat = new VorratAttrappe();
    const { abrufe, abruf } = ursprung();
    await fuelleVorrat(vorrat, abruf, URSPRUNG);
    abrufe.length = 0;

    await mitTransformers(vorrat, abruf, async ({ ModelRegistry, AutoTokenizer, AutoProcessor, WhisperTokenizer, WhisperProcessor }) => {
      for (const { pfad } of MODELL_DATEIEN) expect((await ModelRegistry.get_file_metadata(MODELL.name, pfad)).exists, pfad).toBe(true);
      // hasTokenizer und hasProcessor der Pipeline (pipelines.js: expected_files.includes(…))
      const dateien = await ModelRegistry.get_pipeline_files('automatic-speech-recognition', MODELL.name, {
        dtype: MODELL.dtype,
        device: 'wasm',
      });
      expect([...dateien].sort()).toEqual(MODELL_DATEIEN.map((d) => d.pfad).sort());
      expect(dateien).toEqual(expect.arrayContaining(['tokenizer.json', 'tokenizer_config.json', 'preprocessor_config.json']));

      const tokenizer = await AutoTokenizer.from_pretrained(MODELL.name);
      expect(tokenizer).toBeInstanceOf(WhisperTokenizer);
      expect(tokenizer.encode('Tisch').length).toBeGreaterThan(0);
      expect(await AutoProcessor.from_pretrained(MODELL.name)).toBeInstanceOf(WhisperProcessor);
    });
    expect(abrufe).toEqual([]);
  });

  it('ohne Vorrat findet der relative Modellordner Tokenizer und Prozessor über den eigenen Ursprung', async () => {
    const { abrufe, abruf } = ursprung();
    // eigener Suchteil je Datei: get_file_metadata merkt sich Ergebnisse je Dateiname (unabhängig vom Modellordner)
    const dateien = ['tokenizer_config.json?ohne-vorrat', 'preprocessor_config.json?ohne-vorrat'];
    await mitTransformers(new VorratAttrappe(), abruf, async ({ ModelRegistry }) => {
      for (const datei of dateien) expect((await ModelRegistry.get_file_metadata(MODELL.name, datei)).exists, datei).toBe(true);
    });
    expect(abrufe).toEqual(dateien.map(modellAdresse));
  });

  it('Gegenprobe (Fehler von a0795f7b): mit absolutem Modellordner und leerem Vorrat gilt der Tokenizer als fehlend', async () => {
    const { abrufe, abruf } = ursprung();
    await mitTransformers(new VorratAttrappe(), abruf, async ({ env, ModelRegistry }) => {
      env.localModelPath = new URL(MODELLE_BASIS, URSPRUNG).href;
      expect((await ModelRegistry.get_file_metadata(MODELL.name, 'tokenizer_config.json?absolut')).exists).toBe(false);
    });
    expect(abrufe).toEqual([]);
  });
});

describe('Sprechübung: der Worker nutzt diesen Weg', () => {
  const quelle = readFileSync(join(process.cwd(), 'src/components/lernapp/sprechen/whisper.worker.ts'), 'utf8');

  it('Einstellungen aus TRANSFORMERS_UMGEBUNG mit relativem Modellordner', () => {
    expect(TRANSFORMERS_UMGEBUNG.localModelPath).toBe(MODELLE_BASIS);
    expect(MODELLE_BASIS.startsWith('/')).toBe(true);
    expect(quelle).toMatch(/Object\.assign\(env, TRANSFORMERS_UMGEBUNG\);/);
    expect(quelle).not.toMatch(/env\.localModelPath\s*=/);
  });

  it('füllt den Vorrat vor der Pipeline und übergibt ihr keine Fortschrittsmeldung', () => {
    const lade = quelle.slice(quelle.indexOf('function lade('), quelle.indexOf('async function erkenne('));
    expect(lade.indexOf('await vorratUndWasm()')).toBeGreaterThan(-1);
    expect(lade.indexOf('await vorratUndWasm()')).toBeLessThan(lade.indexOf('pipeline('));
    expect(quelle).toMatch(/await fuelleVorrat\(/);
    expect(quelle).not.toMatch(/progress_callback/);
  });
});
