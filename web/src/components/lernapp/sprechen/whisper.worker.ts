import { type AutomaticSpeechRecognitionPipeline, env, pipeline } from '@huggingface/transformers';
import { maxNeueTokens, werteAus } from '@/lib/lernapp/sprechen/auswertung';
import {
  type AnArbeiter,
  MODELL,
  ORT,
  ortAdresse,
  probeClip,
  TRANSFORMERS_UMGEBUNG,
  VORRAT_MODELLE,
  type VomArbeiter,
  WHISPER_SPRACHE,
} from '@/lib/lernapp/sprechen/modell';
import { fuelleVorrat } from '@/lib/lernapp/sprechen/vorrat';

/**
 * Spracherkennung im Worker (ADR 0042 Nr. 2 mit Fortschreibung S2 Nr. 4, KERN 4.0 §6, KI-Regel 2):
 * - nur vom eigenen Ursprung: `allowRemoteModels = false`, Modelle unter `/lern-app/modelle/`, ORT-Dateien aus
 *   `/lern-app/modelle/ort-<version>/` (`wasmPaths`); keine Anfrage an huggingface.co oder jsDelivr;
 * - Einstellungen `TRANSFORMERS_UMGEBUNG` (modell.ts): Modellordner relativ, `useWasmCache = false` (sonst importiert
 *   transformers.js die ORT-`.mjs` über eine `blob:`-Adresse, die die CSP verbietet); Vorrat über den offline belegten Weg:
 *   `cacheKey = 'igmg-lernapp-modelle'` (derselbe Vorrat wie im Lern-App-SW), die ORT-`.wasm` als `wasmBinary` aus diesem Vorrat;
 * - jede Datei genau einmal (L8-02): `fuelleVorrat` legt Modell und ORT-`.wasm` vor dem Aufbau der Pipeline in den Vorrat und
 *   meldet den Fortschritt; die Pipeline bekommt keine Fortschrittsmeldung (sonst fragt transformers.js jede Datei vorab per
 *   vollständigem GET ab) und liest alles aus dem Vorrat;
 * - `dtype: 'q8'`, `device: 'wasm'`, Threads nach ORT-Standard (mit `crossOriginIsolated`); Sprache fest,
 *   `task: 'transcribe'`, kein Prompt, keine Zeitstempel; Längenkappe `max_new_tokens` aus der Länge des Ziels;
 * - die freie Abschrift verlässt den Worker nie: Er meldet nur Status und Markierung der Zielwörter.
 * Gebündelt vom Bauschritt `scripts/lernapp-modelle.mjs` nach `/lern-app/modelle/sprechen/whisper.worker.mjs`.
 */

/** Der Worker-Bereich (ohne die webworker-Bibliothek, die im DOM-Projekt mit `window` kollidiert). */
const bereich = self as unknown as {
  location: Location;
  postMessage: (n: VomArbeiter) => void;
  onmessage: ((e: MessageEvent<AnArbeiter>) => void) | null;
};

Object.assign(env, TRANSFORMERS_UMGEBUNG);
const onnx = env.backends.onnx;
const absolut = (datei: string) => new URL(ortAdresse(datei), bereich.location.origin).href;
if (onnx.wasm) onnx.wasm.wasmPaths = { mjs: absolut(ORT.mjs), wasm: absolut(ORT.wasm) };

let erkenner: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

const sende = (n: VomArbeiter) => bereich.postMessage(n);
/** Grund eines Fehlers als Konsolenwarnung (Diagnose eines Rückfalls, L8-02) – nur Art und Meldung, nie Audio oder Abschrift. */
const warne = (bei: string, e: unknown) => console.warn(`[sprechen] ${bei}:`, e instanceof Error ? `${e.name}: ${e.message}` : String(e));

/** Download in den Vorrat (je Datei ein Abruf, mit Fortschritt), dann die ORT-`.wasm` als `wasmBinary` daraus (Beleg S2 L6b). */
async function vorratUndWasm(): Promise<void> {
  const vorrat = await caches.open(VORRAT_MODELLE);
  await fuelleVorrat(
    vorrat,
    (adresse, init) => fetch(adresse, init),
    bereich.location.origin,
    (datei, geladen, gesamt) => sende({ art: 'fortschritt', datei, geladen, gesamt }),
  );
  const wasm = await vorrat.match(absolut(ORT.wasm));
  if (!wasm) throw new Error('ORT nicht im Vorrat');
  if (onnx.wasm) onnx.wasm.wasmBinary = await wasm.arrayBuffer();
}

function lade(): Promise<AutomaticSpeechRecognitionPipeline> {
  erkenner ??= (async () => {
    await vorratUndWasm();
    // ohne Fortschrittsmeldung: Sie löste in transformers.js 4.3 die Vorabfrage jeder Datei aus (siehe vorrat.ts)
    return (await pipeline('automatic-speech-recognition', MODELL.name, {
      dtype: MODELL.dtype,
      device: 'wasm',
    })) as AutomaticSpeechRecognitionPipeline;
  })();
  return erkenner;
}

async function erkenne(asr: AutomaticSpeechRecognitionPipeline, pcm: Float32Array, sprache: keyof typeof WHISPER_SPRACHE, tokens: number) {
  const aus = await asr(pcm, {
    language: WHISPER_SPRACHE[sprache],
    task: 'transcribe',
    return_timestamps: false,
    max_new_tokens: maxNeueTokens(tokens),
  });
  return (Array.isArray(aus) ? aus[0]?.text : aus.text) ?? '';
}

bereich.onmessage = async (e: MessageEvent<AnArbeiter>) => {
  const n = e.data;
  if (n.art === 'laden') {
    try {
      await lade();
      sende({ art: 'bereit' });
    } catch (grund) {
      warne('laden', grund);
      erkenner = null;
      sende({ art: 'fehler', bei: 'laden' });
    }
  } else if (n.art === 'probe') {
    try {
      const asr = await lade();
      const start = performance.now();
      await erkenne(asr, probeClip(), 'de', 8);
      sende({ art: 'probe', ms: Math.round(performance.now() - start) });
    } catch (grund) {
      warne('probe', grund);
      sende({ art: 'fehler', bei: 'probe' });
    }
  } else if (n.art === 'erkenne') {
    try {
      const asr = await lade();
      const tokens = asr.tokenizer.encode(n.ziel).length;
      const abschrift = await erkenne(asr, n.pcm, n.sprache, tokens);
      sende({ art: 'ergebnis', id: n.id, ergebnis: werteAus(abschrift, n.ziel, n.sprache) });
    } catch (grund) {
      warne('erkennung', grund);
      sende({ art: 'fehler', bei: 'erkennung', id: n.id });
    }
  }
};
