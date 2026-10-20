import type { LizenzName } from './lizenztexte';

/**
 * Quellen und Namensnennung der Lern-App (ADR 0044 Nr. 7, KERN 4.0 §1 „Quellenangaben auch offline“): Bibliotheken, die
 * im Browser laufen, und die Schriften der Oberfläche. Sprachneutrale Angaben (Eigennamen, Urheber wie in der
 * Lizenzdatei, Adresse); Fassungen prüft der Unit-Test `lernapp/quellen` gegen node_modules. Quelle und Lizenz der
 * Lerninhalte stehen je Eintrag im Kurspaket (ADR 0039); Stimmen ergänzt die Sprachausgabe (L3, ADR 0045).
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
