// Bauschritt der Sprechübung (ADR 0042 Fortschreibung S5 Nr. 5 und Nr. 11, PLAN §4.2): prüft und legt die 10 Dateien der
// Sprechübung und die 2 Lizenztexte neben den Gewichten unter public/lern-app/modelle/ bereit – ohne Netz.
// 1. Whisper-base (q8, Commit 64da572) liegt im Repository: SHA-256 jeder Datei gegen web/daten/lernapp-modelle/QUELLE.md.
//    Die Lizenztexte (LIZENZ-*.txt) liegen ebenfalls dort und müssen den Fassungen in web/daten/lernapp-modelle/ gleichen.
// 2. ORT-Dateien (nur CPU, „plain“) aus dem exakt gepinnten onnxruntime-web in node_modules: SHA-256 prüfen, dann kopieren.
// 3. Worker bündeln (Vite) aus src/components/lernapp/sprechen/whisper.worker.ts mit transformers.js 4.3.0
//    (dist/transformers.min.js) nach public/lern-app/modelle/sprechen/whisper.worker.mjs – mit E2E_ATTRAPPEN=1 stattdessen
//    die Attrappe (whisper-attrappe.worker.ts, nur Testbau; in der Produktion verweigert). Der echte Worker trägt einen
//    Lizenzkopf (transformers.js und tokenizers.js Apache-2.0, @huggingface/jinja und onnxruntime-web MIT) mit Verweis auf
//    den Lizenztext neben den Gewichten.
// 4. Genau 12 Dateien unter public/lern-app/modelle/ (10 der Sprechübung, 2 Lizenztexte; nur die 10 kommen in den Vorrat).
// Aufruf: pnpm lernapp:modelle (auch in `pnpm build` und scripts/vercel-bau.mjs; pnpm führt `prebuild` nicht aus).
// Exit 1 bei jeder Abweichung.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';

const web = join(import.meta.dirname, '..');
const modelle = join(web, 'public', 'lern-app', 'modelle');
const fehler = (text) => {
  console.error(`[lernapp:modelle] ${text}`);
  process.exit(1);
};
const sha256 = (pfad) => createHash('sha256').update(readFileSync(pfad)).digest('hex');

// Tabellen der Quelle: | `datei` | `ziel` | bytes | `sha256` | (Dateien der Sprechübung, dann Lizenztexte `LIZENZ-*.txt`)
const daten = join(web, 'daten', 'lernapp-modelle');
const quelle = readFileSync(join(daten, 'QUELLE.md'), 'utf8');
const zeilen = [...quelle.matchAll(/^\| `([^`]+)` +\| `([^`]+)` +\| (\d+) +\| `([0-9a-f]{64})` +\|$/gm)].map((m) => ({
  datei: m[1],
  ziel: m[2],
  bytes: Number(m[3]),
  sha: m[4],
}));
const istLizenz = (d) => /^LIZENZ-[\w.-]+\.txt$/.test(d.datei);
const dateien = zeilen.filter((d) => !istLizenz(d));
const lizenzen = zeilen.filter(istLizenz);
if (dateien.length !== 9) fehler(`QUELLE.md nennt ${dateien.length} statt 9 Dateien (7 Modell, 2 ORT)`);
if (lizenzen.length !== 2) fehler(`QUELLE.md nennt ${lizenzen.length} statt 2 Lizenztexte neben den Gewichten`);

// 1. + 2.
const transformers = realpathSync(join(web, 'node_modules', '@huggingface', 'transformers'));
const ausTransformers = createRequire(join(transformers, 'package.json'));
for (const d of dateien) {
  const ziel = join(web, d.ziel);
  if (d.datei.startsWith('onnxruntime-web/')) {
    const herkunft = ausTransformers.resolve(`onnxruntime-web/${d.datei.split('/').at(-1)}`);
    if (sha256(herkunft) !== d.sha) fehler(`${relative(web, herkunft)}: SHA-256 weicht von QUELLE.md ab`);
    mkdirSync(dirname(ziel), { recursive: true });
    copyFileSync(herkunft, ziel);
  }
  if (!existsSync(ziel)) fehler(`${d.ziel} fehlt`);
  if (statSync(ziel).size !== d.bytes || sha256(ziel) !== d.sha) fehler(`${d.ziel}: Größe oder SHA-256 weicht von QUELLE.md ab`);
}
const gewichte = dirname(join(web, dateien[0].ziel));
for (const l of lizenzen) {
  const ziel = join(web, l.ziel);
  if (dirname(ziel) !== gewichte) fehler(`${l.ziel}: Lizenztext liegt nicht neben den Gewichten`);
  if (sha256(join(daten, l.datei)) !== l.sha) fehler(`daten/lernapp-modelle/${l.datei}: SHA-256 weicht von QUELLE.md ab`);
  if (!existsSync(ziel)) fehler(`${l.ziel} fehlt (Lizenztext neben den Gewichten, ADR 0042 Nr. 3)`);
  if (statSync(ziel).size !== l.bytes || sha256(ziel) !== l.sha) fehler(`${l.ziel}: Größe oder SHA-256 weicht von QUELLE.md ab`);
}

// 3.
const attrappe = process.env.E2E_ATTRAPPEN === '1';
if (attrappe && process.env.VERCEL_ENV === 'production') fehler('E2E_ATTRAPPEN=1 im Produktionsbau ist nicht erlaubt');
const eingang = join(web, 'src', 'components', 'lernapp', 'sprechen', attrappe ? 'whisper-attrappe.worker.ts' : 'whisper.worker.ts');
const ausgabe = join(modelle, 'sprechen');
rmSync(ausgabe, { recursive: true, force: true });
const fassung = (pfad) => JSON.parse(readFileSync(join(pfad, 'package.json'), 'utf8')).version;
const ort = dirname(dirname(ausTransformers.resolve('onnxruntime-web/ort-wasm-simd-threaded.mjs')));
// mitgebündelte Abhängigkeiten von transformers.js (pnpm: neben ihm im eigenen node_modules)
const hf = (name) => realpathSync(join(dirname(transformers), name));
// Lizenzkopf des echten Workers (Apache-2.0 §4: Lizenz an die Empfänger; MIT: Hinweis in jeder Kopie)
const lizenzkopf =
  `/*! Sprechuebung der Lern-App. Enthaelt @huggingface/transformers ${fassung(transformers)} (Apache-2.0, Hugging Face), ` +
  `@huggingface/tokenizers ${fassung(hf('tokenizers'))} (Apache-2.0, Hugging Face), ` +
  `@huggingface/jinja ${fassung(hf('jinja'))} (MIT, Copyright (c) 2023 Hugging Face) ` +
  `und onnxruntime-web ${fassung(ort)} (MIT, Copyright (c) Microsoft Corporation). Lizenztexte: ` +
  `/${relative(join(web, 'public'), join(gewichte, 'LIZENZ-Apache-2.0.txt'))} und die Seite Quellen der Lern-App. */`;
const { build } = await import('vite');
await build({
  configFile: false,
  root: web,
  publicDir: false,
  logLevel: 'warn',
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${join(web, 'src')}/` },
      // die von Spike S2 belegte Browser-Fassung (ORT-JS eingebettet, ORT-Dateien kommen über wasmPaths)
      { find: /^@huggingface\/transformers$/, replacement: join(transformers, 'dist', 'transformers.min.js') },
    ],
  },
  build: {
    outDir: ausgabe,
    emptyOutDir: true,
    target: 'es2022',
    minify: true,
    sourcemap: false,
    copyPublicDir: false,
    reportCompressedSize: false,
    lib: { entry: eingang, formats: ['es'], fileName: () => 'whisper.worker.mjs' },
    rollupOptions: { output: { codeSplitting: false, ...(attrappe ? {} : { postBanner: lizenzkopf }) } },
  },
});

// 4.
const alle = (ordner) =>
  readdirSync(ordner).flatMap((n) => (statSync(join(ordner, n)).isDirectory() ? alle(join(ordner, n)) : [join(ordner, n)]));
const liste = alle(modelle).map((p) => relative(modelle, p));
const erwartet = [
  ...[...dateien, ...lizenzen].map((d) => relative(modelle, join(web, d.ziel))),
  join('sprechen', 'whisper.worker.mjs'),
].sort();
if (JSON.stringify(liste.sort()) !== JSON.stringify(erwartet))
  fehler(`Unter public/lern-app/modelle/ liegen nicht genau die 12 Dateien (10 Sprechübung, 2 Lizenztexte):\n${liste.join('\n')}`);
const arbeiter = readFileSync(join(ausgabe, 'whisper.worker.mjs'), 'utf8');
if (!attrappe && !arbeiter.startsWith(lizenzkopf)) fehler('Der Worker trägt den Lizenzkopf nicht');
const bytes = alle(modelle).reduce((s, p) => s + statSync(p).size, 0);
console.log(
  `[lernapp:modelle] 12 Dateien geprüft und bereit (10 Sprechübung, 2 Lizenztexte; ${(bytes / 1e6).toFixed(1)} MB), Worker ${attrappe ? 'ATTRAPPE (Testbau)' : 'transformers.js mit Lizenzkopf'} ${(statSync(join(ausgabe, 'whisper.worker.mjs')).size / 1e3).toFixed(0)} KB`,
);
