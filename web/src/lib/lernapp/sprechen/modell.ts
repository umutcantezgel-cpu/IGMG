import type { SprechErgebnis } from './auswertung';

/**
 * Spracherkennung der Lern-App: Modell, Dateien und Worker-Protokoll (ADR 0042 mit Fortschreibung S2 Nr. 4–7, S5 Weg M1).
 * Rein (ohne Browser-Zugriff); gemeinsam für den Worker, die Sprechübung, den Bauschritt (`scripts/lernapp-modelle.mjs`
 * prüft dieselben Pfade) und Unit-Tests.
 *
 * Genau 10 Dateien vom eigenen Ursprung unter `/lern-app/modelle/` (Vorrat `igmg-lernapp-modelle` im Lern-App-SW):
 * - 7 Modell- und Konfigurationsdateien von `Xenova/whisper-base` am Commit `64da572` (q8), statisch in
 *   `web/public/lern-app/modelle/whisper-base-64da572/` (SHA-256 und Lizenz in `web/daten/lernapp-modelle/QUELLE.md`);
 * - ORT `ort-wasm-simd-threaded.{mjs,wasm}` (nur CPU, ohne asyncify/jsep/jspi) aus dem gepinnten `onnxruntime-web`,
 *   beim Bau mit SHA-Prüfung nach `ort-<version>/` kopiert (nicht im Repository);
 * - der Worker `sprechen/whisper.worker.mjs` (Bauschritt aus `components/lernapp/sprechen/whisper.worker.ts`). Er liegt
 *   unter `/lern-app/modelle/`, damit er die CSP der Lern-App (`'wasm-unsafe-eval'`) und COEP trägt; die Bau-Kennung
 *   hängt als `?v=` an (neuer Bau → neuer Worker, der Service Worker räumt alte Fassungen weg).
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

export const ORT = {
  version: '1.31.0-dev.20260914-8d85527a0',
  ordner: 'ort-1.31.0-dev.20260914-8d85527a0',
  mjs: 'ort-wasm-simd-threaded.mjs',
  wasm: 'ort-wasm-simd-threaded.wasm',
  wasmBytes: 14_264_838,
} as const;

/** Adresse einer ORT-Datei. */
export const ortAdresse = (datei: string): string => `${MODELLE_BASIS}${ORT.ordner}/${datei}`;
/** Adresse einer Modelldatei. */
export const modellAdresse = (pfad: string): string => `${MODELLE_BASIS}${MODELL.name}/${pfad}`;
/** Adresse des Workers (mit Bau-Kennung). */
export const arbeiterAdresse = (bau: string): string =>
  `${MODELLE_BASIS}sprechen/whisper.worker.mjs?v=${encodeURIComponent(bau.replace(/[^a-z0-9]/g, '').slice(0, 12) || 'lokal')}`;

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
