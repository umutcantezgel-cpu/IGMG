// Rückerkennung für die Prüfkette der Sprachausgabe (PLAN §6.8 Nr. 6): Kindprozess von `audio-pruefen.ts`, ein Prozess
// je Kern. whisper-base (q8) aus web/public/lern-app/modelle (dieselben Dateien wie die Sprechübung, ADR 0042) über
// transformers.js 4.3.0 und onnxruntime-web (WASM, 1 Thread) – ohne Netz:
// - `env.allowRemoteModels = false`; Modelldateien liest `env.fetch` nur aus dem Modellordner, jede andere Adresse wird
//   abgewiesen und gezählt (Falle); `globalThis.fetch` ist ebenso gesperrt.
// - transformers.js wählt in Node sonst onnxruntime-node, das hier nicht installiert ist (pnpm-workspace.yaml): Beim Laden
//   der Web-Fassung meldet sich der Prozess deshalb kurz nicht als Node, damit das WASM-Backend gewählt wird.
// - Sprache fest, `task: 'transcribe'`, keine Zeitstempel, kein Prompt; Längenkappe wie die Sprechübung
//   (`maxNeueTokens` in src/lib/lernapp/sprechen/auswertung.ts: ⌈1,5 × Zieltokens⌉ + 8).
// Nachrichten: { art: 'erkenne', id, clip, sprache, ziel } → { art: 'ergebnis', id, text, ms } | { art: 'fehler', id };
// { art: 'ende' } → { art: 'falle', anfragen } und Ende. Die Abschrift geht nur an den Elternprozess (nie in Dateien).
import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';

const WEB = join(import.meta.dirname, '..', '..');
const MODELLE = join(WEB, 'public', 'lern-app', 'modelle');
const BASIS = '/lern-app/modelle/';
const MODELL = 'whisper-base-64da572';
const SPRACHE = { de: 'german', tr: 'turkish' };
let falle = 0;

const tf = realpathSync(join(WEB, 'node_modules', '@huggingface', 'transformers'));
const ortDist = join(tf, '..', '..', 'onnxruntime-web', 'dist');
globalThis.fetch = async () => {
  falle++;
  throw new Error('Netz gesperrt');
};
const echt = process.release;
Object.defineProperty(process, 'release', { value: { ...echt, name: 'werkzeug' }, configurable: true });
const { env, pipeline } = await import(pathToFileURL(join(tf, 'dist', 'transformers.web.js')).href);
Object.defineProperty(process, 'release', { value: echt, configurable: true });

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = BASIS;
env.useBrowserCache = false;
env.useWasmCache = false;
env.fetch = async (adresse) => {
  const s = String(adresse);
  const rel = s.startsWith(BASIS) ? normalize(s.slice(BASIS.length).split('?')[0]) : null;
  if (!rel || rel.startsWith('..')) {
    falle++;
    throw new Error('Netz gesperrt');
  }
  try {
    return new Response(readFileSync(join(MODELLE, rel)));
  } catch {
    return new Response(null, { status: 404 });
  }
};
const wasm = env.backends.onnx.wasm;
wasm.wasmBinary = readFileSync(join(ortDist, 'ort-wasm-simd-threaded.jsep.wasm'));
wasm.wasmPaths = { mjs: pathToFileURL(join(ortDist, 'ort-wasm-simd-threaded.jsep.mjs')).href };
wasm.numThreads = 1;

const asr = await pipeline('automatic-speech-recognition', MODELL, { dtype: 'q8', device: 'wasm' });

/** Clip (WebM/Opus) → 16 kHz mono Float32 über ffmpeg. */
function pcm(clip) {
  const roh = execFileSync('ffmpeg', ['-v', 'error', '-i', clip, '-f', 'f32le', '-ac', '1', '-ar', '16000', 'pipe:1'], {
    maxBuffer: 1 << 28,
  });
  return new Float32Array(roh.buffer.slice(roh.byteOffset, roh.byteOffset + roh.length));
}

process.on('message', async (n) => {
  if (n.art === 'ende') {
    process.send({ art: 'falle', anfragen: falle }, () => process.exit(0));
    return;
  }
  if (n.art !== 'erkenne') return;
  try {
    const t0 = Date.now();
    const tokens = asr.tokenizer.encode(n.ziel).length;
    const aus = await asr(pcm(n.clip), {
      language: SPRACHE[n.sprache],
      task: 'transcribe',
      return_timestamps: false,
      max_new_tokens: Math.ceil(1.5 * Math.max(0, tokens)) + 8,
    });
    process.send({ art: 'ergebnis', id: n.id, text: (Array.isArray(aus) ? aus[0]?.text : aus.text) ?? '', ms: Date.now() - t0 });
  } catch {
    process.send({ art: 'fehler', id: n.id });
  }
});
process.send({ art: 'bereit' });
