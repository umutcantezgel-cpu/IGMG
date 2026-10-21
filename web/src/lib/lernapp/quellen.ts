import type { LizenzName } from './lizenztexte';

/**
 * Quellen und Namensnennung der Lern-App (ADR 0044 Nr. 7, KERN 4.0 §1 „Quellenangaben auch offline“): Bibliotheken, die
 * im Browser laufen, und die Schriften der Oberfläche. Sprachneutrale Angaben (Eigennamen, Urheber wie in der
 * Lizenzdatei, Adresse); Fassungen prüft der Unit-Test `lernapp/quellen` gegen node_modules. Quelle und Lizenz der
 * Lerninhalte stehen je Eintrag im Kurspaket (ADR 0039); Stimmen ergänzt die Sprachausgabe (L3, ADR 0045). Die
 * Spracherkennung (ADR 0042 Nr. 3 und 10) steht mit ihren Bibliotheken unter `BIBLIOTHEKEN` (im Worker) und mit dem Modell
 * unter `SPRACHERKENNUNG`; die Lizenztexte liegen zusätzlich neben den Gewichten (`LIZENZ_DATEIEN` in `sprechen/modell.ts`).
 */
export type LernQuelle = {
  id: string;
  name: string;
  version: string;
  /** Urheberzeile wie in der Lizenzdatei */
  urheber: string;
  adresse: string;
  lizenz: LizenzName;
};

export const BIBLIOTHEKEN: readonly LernQuelle[] = [
  {
    id: 'next',
    name: 'Next.js',
    version: '16.4.0',
    urheber: 'Copyright (c) 2025 Vercel, Inc.',
    adresse: 'https://nextjs.org',
    lizenz: 'MIT',
  },
  {
    id: 'react',
    name: 'React',
    version: '19.3.0',
    urheber: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
    adresse: 'https://react.dev',
    lizenz: 'MIT',
  },
  {
    id: 'lucide-react',
    name: 'Lucide',
    version: '1.55.0',
    urheber: 'Copyright (c) 2026 Lucide Icons and Contributors',
    adresse: 'https://lucide.dev',
    lizenz: 'ISC',
  },
  {
    id: 'idb',
    name: 'idb',
    version: '8.0.3',
    urheber: 'Copyright (c) 2016, Jake Archibald',
    adresse: 'https://github.com/jakearchibald/idb',
    lizenz: 'ISC',
  },
  {
    id: 'ts-fsrs',
    name: 'ts-fsrs',
    version: '5.4.2',
    urheber: 'Copyright (c) 2026 Open Spaced Repetition',
    adresse: 'https://github.com/open-spaced-repetition/ts-fsrs',
    lizenz: 'MIT',
  },
  {
    id: 'fastest-levenshtein',
    name: 'fastest-levenshtein',
    version: '1.0.16',
    urheber: 'Copyright (c) 2020 Kasper Unn Weihe',
    adresse: 'https://github.com/ka-weihe/fastest-levenshtein',
    lizenz: 'MIT',
  },
  {
    // Schemas der Aufgaben, Ereignisse, Pakete und des Exports laufen auch im Browser (`lib/lernapp/z.ts`, Gegenprüfung L1)
    id: 'zod',
    name: 'Zod',
    version: '4.6.5',
    urheber: 'Copyright (c) 2025 Colin McDonnell',
    adresse: 'https://zod.dev',
    lizenz: 'MIT',
  },
  {
    // Spracherkennung der Sprechübung, im Worker `/lern-app/modelle/sprechen/whisper.worker.mjs` gebündelt (ADR 0042 Nr. 10)
    id: 'transformers',
    name: 'Transformers.js',
    version: '4.3.0',
    urheber: 'Hugging Face',
    adresse: 'https://github.com/huggingface/transformers.js',
    lizenz: 'Apache-2.0',
  },
  {
    // Laufzeit der Spracherkennung: JS im Worker, WebAssembly unter `/lern-app/modelle/ort-…/` (ADR 0042 Nr. 10)
    id: 'onnxruntime-web',
    name: 'ONNX Runtime Web',
    version: '1.31.0-dev.20260914-8d85527a0',
    urheber: 'Copyright (c) Microsoft Corporation',
    adresse: 'https://github.com/microsoft/onnxruntime',
    lizenz: 'MIT',
  },
];

/** Modell der Spracherkennung (ADR 0042 Nr. 3): Gewichte von OpenAI (MIT), ONNX-Fassung mit q8 von Xenova (Apache-2.0). */
export const SPRACHERKENNUNG: readonly LernQuelle[] = [
  {
    id: 'whisper',
    name: 'Whisper (base)',
    version: 'base',
    urheber: 'Copyright (c) 2022 OpenAI',
    adresse: 'https://github.com/openai/whisper',
    lizenz: 'MIT',
  },
  {
    id: 'whisper-base-onnx',
    name: 'Xenova/whisper-base (ONNX, q8)',
    version: '64da572',
    urheber: 'Xenova',
    adresse: 'https://huggingface.co/Xenova/whisper-base',
    lizenz: 'Apache-2.0',
  },
];

export const SCHRIFTEN: readonly LernQuelle[] = [
  {
    id: 'atkinson-hyperlegible-next',
    name: 'Atkinson Hyperlegible Next',
    version: '5.3.0',
    urheber: 'Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors',
    adresse: 'https://github.com/googlefonts/atkinson-hyperlegible-next',
    lizenz: 'OFL-1.1',
  },
  {
    id: 'noto-sans-arabic',
    name: 'Noto Sans Arabic',
    version: '5.3.0',
    urheber: 'Copyright 2022 The Noto Project Authors',
    adresse: 'https://github.com/notofonts/arabic',
    lizenz: 'OFL-1.1',
  },
  {
    id: 'amiri',
    name: 'Amiri',
    version: '5.3.0',
    urheber: 'Copyright 2010-2022 The Amiri Project Authors',
    adresse: 'https://github.com/aliftype/amiri',
    lizenz: 'OFL-1.1',
  },
  {
    id: 'igmg-wetzlar-titel',
    name: 'Source Serif 4 (IGMG Wetzlar Titel)',
    version: '5.3.0',
    urheber: 'Adobe',
    adresse: 'https://github.com/adobe-fonts/source-serif',
    lizenz: 'OFL-1.1',
  },
];
