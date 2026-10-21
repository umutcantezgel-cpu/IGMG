import { type AutomaticSpeechRecognitionPipeline, env, pipeline } from '@huggingface/transformers';
import { maxNeueTokens, werteAus } from '@/lib/lernapp/sprechen/auswertung';
import {
  type AnArbeiter,
  MODELL,
  MODELLE_BASIS,
  ORT,
  ortAdresse,
  probeClip,
  VORRAT_MODELLE,
  type VomArbeiter,
  WHISPER_SPRACHE,
} from '@/lib/lernapp/sprechen/modell';

/**
 * Spracherkennung im Worker (ADR 0042 Nr. 2 mit Fortschreibung S2 Nr. 4, KERN 4.0 §6, KI-Regel 2):
 * - nur vom eigenen Ursprung: `allowRemoteModels = false`, Modelle unter `/lern-app/modelle/`, ORT-Dateien aus
 *   `/lern-app/modelle/ort-<version>/` (`wasmPaths`); keine Anfrage an huggingface.co oder jsDelivr;
 * - `useWasmCache = false` (sonst importiert transformers.js die ORT-`.mjs` über eine `blob:`-Adresse, die die CSP
 *   verbietet); Vorrat über den offline belegten Weg: `cacheKey = 'igmg-lernapp-modelle'` (derselbe Vorrat wie im
 *   Lern-App-SW), die ORT-`.wasm` als `wasmBinary` aus diesem Vorrat;
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

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = MODELLE_BASIS;
env.useWasmCache = false;
env.useBrowserCache = true;
env.cacheKey = VORRAT_MODELLE;
const onnx = env.backends.onnx;
const absolut = (datei: string) => new URL(ortAdresse(datei), bereich.location.origin).href;
if (onnx.wasm) onnx.wasm.wasmPaths = { mjs: absolut(ORT.mjs), wasm: absolut(ORT.wasm) };

let erkenner: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

const sende = (n: VomArbeiter) => bereich.postMessage(n);

/** ORT-`.wasm` aus dem Vorrat (sonst Netz, dann in den Vorrat) als `wasmBinary` – der offline belegte Weg (Beleg S2 L6b). */
async function wasmAusVorrat(): Promise<void> {
  const adresse = absolut(ORT.wasm);
  const vorrat = typeof caches === 'undefined' ? null : await caches.open(VORRAT_MODELLE);
  let antwort = await vorrat?.match(adresse);
  if (!antwort) {
    antwort = await fetch(adresse, { credentials: 'same-origin' });
    if (!antwort.ok) throw new Error(`ORT ${antwort.status}`);
    await vorrat?.put(adresse, antwort.clone());
  }
  if (onnx.wasm) onnx.wasm.wasmBinary = await antwort.arrayBuffer();
}

function lade(): Promise<AutomaticSpeechRecognitionPipeline> {
  erkenner ??= (async () => {
    await wasmAusVorrat();
    return (await pipeline('automatic-speech-recognition', MODELL.name, {
      dtype: MODELL.dtype,
      device: 'wasm',
      progress_callback: (p: { status?: string; file?: string; loaded?: number; total?: number }) => {
        if (p.status === 'progress' && p.file) sende({ art: 'fortschritt', datei: p.file, geladen: p.loaded ?? 0, gesamt: p.total ?? 0 });
      },
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
    } catch {
      erkenner = null;
      sende({ art: 'fehler', bei: 'laden' });
    }
  } else if (n.art === 'probe') {
    try {
      const asr = await lade();
      const start = performance.now();
      await erkenne(asr, probeClip(), 'de', 8);
      sende({ art: 'probe', ms: Math.round(performance.now() - start) });
    } catch {
      sende({ art: 'fehler', bei: 'probe' });
    }
  } else if (n.art === 'erkenne') {
    try {
      const asr = await lade();
      const tokens = asr.tokenizer.encode(n.ziel).length;
      const abschrift = await erkenne(asr, n.pcm, n.sprache, tokens);
      sende({ art: 'ergebnis', id: n.id, ergebnis: werteAus(abschrift, n.ziel, n.sprache) });
    } catch {
      sende({ art: 'fehler', bei: 'erkennung', id: n.id });
    }
  }
};
