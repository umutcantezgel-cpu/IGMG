import type { SprechErgebnis } from './auswertung';

/**
 * Spracherkennung der Lern-App: Modell, Dateien und Worker-Protokoll (ADR 0042 mit Fortschreibung S2 Nr. 4–7, S5 Weg M1).
 * Rein (ohne Browser-Zugriff); gemeinsam für den Worker, die Sprechübung, den Bauschritt (`scripts/lernapp-modelle.mjs`
 * prüft dieselben Pfade) und Unit-Tests.
 *
 * Genau 10 Dateien der Sprechübung vom eigenen Ursprung unter `/lern-app/modelle/` (Vorrat `igmg-lernapp-modelle` im Lern-App-SW):
 * - 7 Modell- und Konfigurationsdateien von `Xenova/whisper-base` am Commit `64da572` (q8), statisch in
 *   `web/public/lern-app/modelle/whisper-base-64da572/` (SHA-256 und Lizenz in `web/daten/lernapp-modelle/QUELLE.md`);
 * - ORT `ort-wasm-simd-threaded.{mjs,wasm}` (nur CPU, ohne asyncify/jsep/jspi) aus dem gepinnten `onnxruntime-web`,
 *   beim Bau mit SHA-Prüfung nach `ort-<version>/` kopiert (nicht im Repository);
 * - der Worker `sprechen/whisper.worker.mjs` (Bauschritt aus `components/lernapp/sprechen/whisper.worker.ts`). Er liegt
 *   unter `/lern-app/modelle/`, damit er die CSP der Lern-App (`'wasm-unsafe-eval'`) und COEP trägt; die Bau-Kennung
 *   hängt als `?v=` an (neuer Bau → neuer Worker, der Service Worker räumt alte Fassungen weg). Er trägt einen Lizenzkopf.
 *
 * Daneben 2 Lizenztexte neben den Gewichten (ADR 0042 Nr. 3, Fortschreibung Nr. 11): `LIZENZ_DATEIEN`, zusammen 12 Dateien
 * unter `/lern-app/modelle/`. Sie gehören nicht zum Download, nicht zum Vorrat und nicht zu `GESAMT_BYTES`.
 */

export const MODELLE_BASIS = '/lern-app/modelle/';
export const VORRAT_MODELLE = 'igmg-lernapp-modelle';

export const MODELL = {
  /** Ordner unter `/lern-app/modelle/` = Modellkennung für transformers.js (`env.localModelPath`) */
  name: 'whisper-base-64da572',
  quelle: 'Xenova/whisper-base',
  commit: '64da57285918e20ea79ea5c88eed7197933abaa8',
  dtype: 'q8',
} as const;

/** Modell- und Konfigurationsdateien (Pfad im Modellordner, Bytes; die SHA-256 stehen in `web/daten/lernapp-modelle/QUELLE.md`). */
export const MODELL_DATEIEN: readonly { pfad: string; bytes: number }[] = [
  { pfad: 'config.json', bytes: 2_248 },
  { pfad: 'generation_config.json', bytes: 3_776 },
  { pfad: 'preprocessor_config.json', bytes: 339 },
  { pfad: 'tokenizer.json', bytes: 2_480_466 },
  { pfad: 'tokenizer_config.json', bytes: 282_683 },
  { pfad: 'onnx/encoder_model_quantized.onnx', bytes: 23_200_850 },
  { pfad: 'onnx/decoder_model_merged_quantized.onnx', bytes: 53_707_539 },
];

/** Lizenztexte neben den Gewichten (MIT von OpenAI für Whisper; Apache-2.0 für die ONNX-Fassung und transformers.js). */
export const LIZENZ_DATEIEN: readonly { pfad: string; bytes: number }[] = [
  { pfad: 'LIZENZ-whisper-MIT.txt', bytes: 1_063 },
  { pfad: 'LIZENZ-Apache-2.0.txt', bytes: 11_358 },
];

export const ORT = {
  version: '1.31.0-dev.20260914-8d85527a0',
  ordner: 'ort-1.31.0-dev.20260914-8d85527a0',
  mjs: 'ort-wasm-simd-threaded.mjs',
  wasm: 'ort-wasm-simd-threaded.wasm',
  wasmBytes: 14_264_838,
} as const;

/**
 * Einstellungen von transformers.js im Worker (`Object.assign(env, …)`; dieselben im Unit-Test am Browser-Bau):
 * - `localModelPath` RELATIV: Nur bei einem Pfad ohne Schema prüft `get_file_metadata` (transformers.js 4.3) den eigenen
 *   Ursprung. Mit absoluter Adresse überspringt es diesen Zweig und meldet bei `allowRemoteModels = false` jede Datei als
 *   fehlend, solange sie nicht im Vorrat liegt – die Pipeline entstand dann ohne Tokenizer und Prozessor, der Probelauf
 *   scheiterte, jedes Gerät mit leerem Vorrat fiel dauerhaft auf die eigene Aufnahme zurück (Gegenprüfung L8-02 zu `a0795f7b`).
 * - Vorrat `igmg-lernapp-modelle` über die Cache Storage (`useBrowserCache`, `cacheKey`): Der Worker füllt ihn vor dem Aufbau
 *   der Pipeline selbst (`fuelleVorrat`, je Datei genau ein Abruf); transformers.js liest danach alles aus dem Vorrat.
 * - `useWasmCache = false`: sonst importiert transformers.js die ORT-`.mjs` über eine `blob:`-Adresse, die die CSP verbietet.
 */
export const TRANSFORMERS_UMGEBUNG = {
  allowRemoteModels: false,
  allowLocalModels: true,
  localModelPath: MODELLE_BASIS,
  useWasmCache: false,
  useBrowserCache: true,
  cacheKey: VORRAT_MODELLE,
} as const;

/** Adresse einer ORT-Datei. */
export const ortAdresse = (datei: string): string => `${MODELLE_BASIS}${ORT.ordner}/${datei}`;
/** Adresse einer Modelldatei. */
export const modellAdresse = (pfad: string): string => `${MODELLE_BASIS}${MODELL.name}/${pfad}`;
/** Pfad des Workers ohne Bau-Kennung (Netzprotokoll). */
export const ARBEITER_PFAD = `${MODELLE_BASIS}sprechen/whisper.worker.mjs`;

/** Adresse des Workers (mit Bau-Kennung). */
export const arbeiterAdresse = (bau: string): string =>
  `${ARBEITER_PFAD}?v=${encodeURIComponent(bau.replace(/[^a-z0-9]/g, '').slice(0, 12) || 'lokal')}`;

/**
 * Die 10 Download-Dateien der Sprechübung (KERN 4.0 §9, ≈ 95 MB): 7 Modell- und Konfigurationsdateien, ORT `.mjs` und
 * `.wasm`, der Worker. Das Netzprotokoll (`_lernapp/werkzeuge/leistung/whisper-netz.mjs`) erwartet nach dem Klick jede genau
 * einmal über das Netz.
 */
export const DOWNLOAD_PFADE: readonly string[] = [
  ...MODELL_DATEIEN.map((d) => modellAdresse(d.pfad)),
  ortAdresse(ORT.mjs),
  ortAdresse(ORT.wasm),
  ARBEITER_PFAD,
];

/**
 * Dateien, die im Vorrat liegen müssen, damit die Übung den Worker ohne Knopf startet (ADR 0042 Fortschreibung Nr. 13):
 * Encoder, Decoder und ORT-`.wasm` (≈ 91 MB). Fehlt eine – etwa weil der Browser den Vorrat bei Platzmangel geräumt hat,
 * während `localStorage` blieb –, erscheint wieder das Angebot mit Größe; kein stilles Nachladen.
 */
export const VORRAT_PFLICHT: readonly string[] = [
  ...MODELL_DATEIEN.filter((d) => d.pfad.endsWith('.onnx')).map((d) => modellAdresse(d.pfad)),
  ortAdresse(ORT.wasm),
];

/** Ungefähre Größe des Workers (transformers.js gebündelt, ≈ 690 KB) und der ORT-`.mjs` für die Anzeige. */
export const ARBEITER_BYTES = 700_000;

/** Gesamtgröße des Sprechmoduls (≈ 95 MB, KERN 4.0 §9). */
export const GESAMT_BYTES = MODELL_DATEIEN.reduce((s, d) => s + d.bytes, 0) + ORT.wasmBytes + ARBEITER_BYTES;
/** Größe in MB, gerundet (Knopf „Sprachprüfung laden (≈ 95 MB)“). */
export const GESAMT_MB = Math.round(GESAMT_BYTES / 1_000_000);

/** Sprache für Whisper (fest je Übung; `task: 'transcribe'`). */
export const WHISPER_SPRACHE = { de: 'german', tr: 'turkish' } as const;
export type ErkennungsSprache = keyof typeof WHISPER_SPRACHE;

/** Nachrichten an den Worker. */
export type AnArbeiter =
  { art: 'laden' } | { art: 'probe' } | { art: 'erkenne'; id: number; pcm: Float32Array; sprache: ErkennungsSprache; ziel: string };

/** Nachrichten vom Worker – nie mit der freien Abschrift. */
export type VomArbeiter =
  | { art: 'fortschritt'; datei: string; geladen: number; gesamt: number }
  | { art: 'bereit' }
  | { art: 'probe'; ms: number }
  | { art: 'ergebnis'; id: number; ergebnis: SprechErgebnis }
  | { art: 'fehler'; bei: 'laden' | 'probe' | 'erkennung'; id?: number };

/** Abtastrate für Whisper. */
export const ABTASTRATE = 16_000;

/**
 * Eingebauter Probeclip (≈ 2 s, Fortschreibung S2 Nr. 7): synthetischer, vokalähnlicher Klang (Grundton mit Obertönen und
 * Hüllkurve) – keine Sprache, keine Aufnahme. Er misst nur die Rechenzeit; was Whisper daraus macht, wird verworfen.
 */
export function probeClip(rate = ABTASTRATE, sekunden = 2): Float32Array {
  const n = Math.round(rate * sekunden);
  const pcm = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const grund = 140 + 20 * Math.sin(2 * Math.PI * 0.7 * t);
    const huelle = Math.sin((Math.PI * i) / n) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 3 * t));
    let x = 0;
    for (let k = 1; k <= 6; k++) x += Math.sin(2 * Math.PI * grund * k * t) / k;
    pcm[i] = 0.2 * huelle * x;
  }
  return pcm;
}

/** Ergebnis des Probelaufs: bis 5 s normal, 5–12 s mit Hinweis, darüber Rückfall (Fortschreibung S2 Nr. 7). */
export type ProbeErgebnis = 'normal' | 'langsam' | 'rueckfall';
export function bewerteProbe(ms: number | null): ProbeErgebnis {
  if (ms === null || !Number.isFinite(ms) || ms > 12_000) return 'rueckfall';
  return ms > 5_000 ? 'langsam' : 'normal';
}
