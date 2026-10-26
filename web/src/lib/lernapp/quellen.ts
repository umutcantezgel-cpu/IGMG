import type { LizenzName } from './lizenztexte';
import { ORT_HINWEISE } from './sprechen/modell';

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
    version: '16.4.2',
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
    // ALTCHA des Melde-Dialogs, im Browser gelöst (eigener Chunk, erst nach dem Klick auf „Fehler melden“, L3-06b)
    id: 'altcha-lib',
    name: 'ALTCHA (altcha-lib)',
    version: '2.6.0',
    urheber: 'Copyright (c) 2023-2026 Daniel Regeci',
    adresse: 'https://altcha.org',
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
    // von Transformers.js mitgebündelt (Tokenizer der Spracherkennung), im selben Worker (Restmangel L2)
    id: 'tokenizers',
    name: 'Tokenizers.js',
    version: '0.2.0',
    urheber: 'Hugging Face',
    adresse: 'https://github.com/huggingface/tokenizers.js',
    lizenz: 'Apache-2.0',
  },
  {
    // von Transformers.js mitgebündelt (Vorlagen der Modellkonfiguration), im selben Worker (Restmangel L2)
    id: 'jinja',
    name: '@huggingface/jinja',
    version: '0.5.10',
    urheber: 'Copyright (c) 2023 Hugging Face',
    adresse: 'https://github.com/huggingface/huggingface.js',
    lizenz: 'MIT',
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

/**
 * Lizenzen der Daten (KERN 4.0 §1: ausgelieferte Daten nur CC0, CC BY, CC BY-SA; Unlicense = Verzicht wie CC0) mit Name und
 * Adresse des Lizenztexts. Die CC-Lizenzen verlangen keine Kopie des Texts, nur den Verweis (Adresse als Text, offline lesbar).
 */
export const DATEN_LIZENZEN = {
  'CC-BY-2.0-FR': { name: 'CC BY 2.0 FR', adresse: 'https://creativecommons.org/licenses/by/2.0/fr/' },
  'CC-BY-3.0': { name: 'CC BY 3.0', adresse: 'https://creativecommons.org/licenses/by/3.0/' },
  'CC-BY-SA-4.0': { name: 'CC BY-SA 4.0', adresse: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  'CC0-1.0': { name: 'CC0 1.0', adresse: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  Unlicense: { name: 'Unlicense', adresse: 'https://unlicense.org/' },
} as const;
export type DatenLizenz = keyof typeof DATEN_LIZENZEN;

/**
 * Gepinnte Daten der Lern-App (ADR 0045 Nr. 3–7 und 15, Z-L17): je Quelle Urheber, Stand, Lizenz und die Namensnennung wie in
 * `web/daten/<ordner>/QUELLE.md` (deutsch, auf der Seite mit `lang="de"`). Die Namensnennung je Satz bzw. je Eintrag steht
 * zusätzlich im Kurspaket (offline, ADR 0039). `gruppe`: `sprache` = Sprachkurse (Sätze, Wörterbuch, Häufigkeit nur zur Auswahl),
 * `religion` = Korantext und Hadith (nur als Verweis im Wissenskurs und im Koran-Arabisch-Pfad, dazu als Prüfgrundlage des
 * Religionswächters, KERN 4.0 §3; nie in Sprachkursen). Der Unit-Test `lernapp/quellen` gleicht Lizenz und Namensnennung mit
 * den `QUELLE.md` ab.
 */
export const DATEN_IDS = ['tatoeba', 'wiktionary', 'wordfreq', 'camel-msa', 'frequencywords', 'tanzil', 'bukhari'] as const;
export type DatenQuelle = {
  /** Anker `#quelle-<id>` und Schlüssel `lizenzverzeichnis.verwendungen.<id>` */
  id: (typeof DATEN_IDS)[number];
  gruppe: 'sprache' | 'religion';
  name: string;
  /** Stand bzw. Fassung (sprachneutral: Nummer, Datum ISO, Commit) */
  version: string;
  urheber: string;
  adresse: string;
  lizenz: DatenLizenz;
  /** weitere Lizenz eines Teils (Tatoeba: Teilmenge CC0) */
  auchLizenz?: DatenLizenz;
  namensnennung: string;
  /** Ordner unter `web/daten/` mit `QUELLE.md` */
  ordner: string;
};

export const DATEN: readonly DatenQuelle[] = [
  {
    id: 'tatoeba',
    gruppe: 'sprache',
    name: 'Tatoeba',
    version: '2026-10-10',
    urheber: 'Tatoeba contributors',
    adresse: 'https://tatoeba.org',
    lizenz: 'CC-BY-2.0-FR',
    auchLizenz: 'CC0-1.0',
    namensnennung:
      'Satz #{id} von {benutzer}, Tatoeba (https://tatoeba.org/de/sentences/show/{id}), CC BY 2.0 FR (https://creativecommons.org/licenses/by/2.0/fr/); ohne Benutzername „Tatoeba-Mitwirkende“; bei Paaren beide Sätze; Änderungen als „bearbeitet“ gekennzeichnet',
    ordner: 'tatoeba',
  },
  {
    id: 'wiktionary',
    gruppe: 'sprache',
    name: 'Wiktionary (kaikki.org, Wiktextract)',
    version: '2026-09-01',
    urheber: 'Wiktionary contributors; Tatu Ylonen (Wiktextract)',
    adresse: 'https://kaikki.org/dictionary/',
    lizenz: 'CC-BY-SA-4.0',
    namensnennung:
      'Wörterbuchdaten nach Wiktionary, Artikel ‚{w}‘ (https://{q}.wiktionary.org/wiki/{w}), Autorinnen und Autoren siehe Versionsgeschichte; extrahiert mit Wiktextract (Tatu Ylonen) über kaikki.org; gekürzt und umformatiert; Lizenz CC BY-SA 4.0',
    ordner: 'kaikki',
  },
  {
    id: 'wordfreq',
    gruppe: 'sprache',
    name: 'wordfreq',
    version: '3.1.1',
    urheber: 'Robyn Speer',
    adresse: 'https://github.com/rspeer/wordfreq',
    lizenz: 'CC-BY-SA-4.0',
    namensnennung:
      'Häufigkeitsdaten: wordfreq von Robyn Speer (https://github.com/rspeer/wordfreq, DOI 10.5281/zenodo.7199437), CC BY-SA 4.0; enthält Daten aus SUBTLEX (Brysbaert u. a., frei verfügbare Daten), OpenSubtitles (http://www.opensubtitles.org/), Google Books Ngrams (http://books.google.com/ngrams), Wikipedia, Leeds Internet Corpus und ParaCrawl; gefiltert und gekürzt.',
    ordner: 'haeufigkeit',
  },
  {
    id: 'camel-msa',
    gruppe: 'sprache',
    name: 'CAMeL Arabic Frequency Lists (MSA)',
    version: '1.0',
    urheber: 'Salam Khalifa, Go Inoue, Bashar Alhafni, Nurpeiis Baimukan, Houda Bouamor, Nizar Habash',
    adresse: 'https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists',
    lizenz: 'CC-BY-SA-4.0',
    namensnennung:
      'Arabische Häufigkeitsdaten: Camel Arabic Frequency Lists v1.0 (Salam Khalifa, Go Inoue, Bashar Alhafni, Nurpeiis Baimukan, Houda Bouamor, Nizar Habash 2021, https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists), CC BY-SA 4.0; gefiltert und gekürzt.',
    ordner: 'haeufigkeit',
  },
  {
    id: 'frequencywords',
    gruppe: 'sprache',
    name: 'FrequencyWords',
    version: '2018 (525f9b5)',
    urheber: 'Hermit Dave',
    adresse: 'https://github.com/hermitdave/FrequencyWords',
    lizenz: 'CC-BY-SA-4.0',
    namensnennung:
      'Häufigkeitsdaten: FrequencyWords von Hermit Dave (https://github.com/hermitdave/FrequencyWords), CC BY-SA 4.0, auf Grundlage von OpenSubtitles2018 (http://www.opensubtitles.org/, über OPUS); gefiltert.',
    ordner: 'haeufigkeit',
  },
  {
    id: 'tanzil',
    gruppe: 'religion',
    name: 'Tanzil Quran Text (Uthmani)',
    version: '1.1 (2021-02-12)',
    urheber: 'Tanzil Project, Copyright (C) 2007-2026',
    adresse: 'https://tanzil.net',
    lizenz: 'CC-BY-3.0',
    namensnennung:
      'Tanzil Quran Text (Uthmani, Version 1.1), Copyright (C) 2007-2026 Tanzil Project, Creative Commons Attribution 3.0, https://tanzil.net – unverändert',
    ordner: 'tanzil',
  },
  {
    // Schlüssel ohne das Wort aus dem Formel-Lexikon (KERN 4.0 §3 a gilt auch für Schlüssel in `messages/lernapp/ar.json`)
    id: 'bukhari',
    gruppe: 'religion',
    name: 'hadith-api (ara-bukhari)',
    version: 'df57907 (2026-06-03)',
    urheber: 'fawazahmed0',
    adresse: 'https://github.com/fawazahmed0/hadith-api',
    lizenz: 'Unlicense',
    namensnennung:
      'hadith-api von fawazahmed0 (https://github.com/fawazahmed0/hadith-api), Unlicense; Herkunft des Textes laut Repository: sunnah.com',
    ordner: 'hadith',
  },
];

/**
 * Bildkarten (KERN 4.0 §5/§7, ADR 0045 Nr. 9): Linien-Symbole aus Lucide (ISC, Eintrag `lucide-react` unter `BIBLIOTHEKEN`), als
 * Pfade in `web/inhalte/lernapp/symbole/symbole.json`. Einige Lucide-Symbole stammen aus Feather (MIT, Cole Bemis); die
 * Bildkarten aus Feather stehen hier mit Namen. Der Unit-Test prüft beides gegen `symbole.json` und die Lizenzdatei von Lucide.
 */
export const BILDKARTEN = {
  quelle: 'Lucide',
  version: '1.55.0',
  lizenz: 'ISC' as LizenzName,
  feather: {
    urheber: 'Copyright (c) 2013-present Cole Bemis',
    adresse: 'https://github.com/feathericons/feather',
    lizenz: 'MIT' as LizenzName,
    symbole: ['calendar', 'clock', 'key', 'shopping-bag'],
  },
} as const;

/**
 * Drittlizenzen von ONNX Runtime (ADR 0042 Nr. 10, Z-L17): Volltext als statische Datei (Herkunft und SHA-256 in
 * `web/daten/lernapp-lizenzen/QUELLE.md`). Sie kommt mit der Sprachprüfung in den Vorrat (`ORT_HINWEISE`, `fuelleVorrat`) und
 * liegt dann offline neben der ORT-`.wasm`. Ohne Sprachprüfung nennt die Seite die wichtigste Bedingung selbst: Eigen steht
 * unter MPL-2.0, der Quellcode ist frei erhältlich (MPL-2.0 §3.2).
 */
export const ORT_DRITTLIZENZEN = {
  pfad: ORT_HINWEISE.pfad,
  stand: '8d85527a010e294a26b274749f74294b2a32cec5',
  sha256: '143764b952fdb1a7c69ce653bfba74a7744d6a8a573bfb73e235fba356c83de3',
  eigen: { name: 'Eigen', lizenz: 'MPL-2.0', adresse: 'https://gitlab.com/libeigen/eigen' },
} as const;
