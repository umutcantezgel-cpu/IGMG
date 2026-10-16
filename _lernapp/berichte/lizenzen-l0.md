<!-- Lizenzprüfung L0 (Workflow wf_cf9ab8d3-fce, 16.10.2026). Arabische Schrift entfernt. -->

# Lern-App L0 – Zusammengeführte Lizenztabelle (Gegenprüfung)

Stand: 16.10.2026. Grundlage: die Teilberichte `stimmen.md`, `sprachdaten.md`, `modelle-schriften-werkzeuge.md` und `hanafi-quellen.md` im selben Ordner. Dazu kommt eine unabhängige Gegenprüfung an den Primärquellen.

**Projektvorgabe:** Ausgelieferter Code darf unter MIT, Apache-2.0, BSD, ISC, MPL-2.0 oder OFL stehen. Für ausgelieferte Daten, Audio und Bilder gelten CC0, CC BY und CC BY-SA (mit Kennzeichnung). Werkzeuge, die nur lokal beim Erzeugen laufen, dürfen auch unter GPL oder LGPL stehen. NC, ND und Research-only gelten als nicht freigegeben.

**Legende:**
- **[G]**: Die Angabe wurde am 16.10.2026 selbst an der Primärquelle nachgeprüft: Lizenzdatei, MODEL_CARD, README, HF-API-Metadaten, npm/PyPI-Registry, Zenodo-API oder Exportdatei.
- **[K]**: Die Angabe wurde gegenüber den Teilberichten korrigiert oder ergänzt (siehe Abschnitt 4).
- **Eignung:** ja / mit Auflagen / nein / unklar. „lokal“ heißt: nur als Werkzeug beim Erzeugen, nichts davon wird ausgeliefert.

---

## 1. Lizenztabelle

### 1.1 Sprachausgabe (TTS): Engines, Stimmen, Trainingsdaten

| Posten | Lizenz | Bedingungen | Eignung | Primärquelle |
|---|---|---|---|---|
| OHF-Voice/piper1-gpl, PyPI `piper-tts` 1.8.0 (04.09.2026) [G] | GPL-3.0-or-later („GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007“); bindet espeak-ng ein | Pflichten nur bei Weitergabe; erzeugtes Audio fällt nicht unter die GPL | ja (lokal: Rendern, Training) | https://github.com/OHF-Voice/piper1-gpl/blob/main/COPYING |
| rhasspy/piper (alte Engine, archiviert) | MIT („Copyright (c) 2022 Michael Hansen“) | Copyright-Hinweis; Phonemisierung über espeak-ng (GPL) | mit Auflagen (lokal; besser piper1-gpl) | https://github.com/rhasspy/piper/blob/master/LICENSE.md |
| espeak-ng 1.52 (ChangeLog führt bereits einen Abschnitt 1.53.0) [G] | „released under the GPL version 3 or later license“ | nur lokal; Arabisch laut docs/languages.md Fn. 7: „Only fully diacritized Arabic.“ | ja (lokal); im Browser nein (GPL würde ausgeliefert) | https://github.com/espeak-ng/espeak-ng |
| Coqui TTS (Fork idiap, PyPI `coqui-tts` 0.27.5) [G][K] | MPL-2.0 | nur lokal | ja (lokal) | https://pypi.org/project/coqui-tts/ |
| gruut 2.4.0 + gruut-lang-de 2.0.1 (Phonemisierung von Coqui-VITS-Thorsten) [G][K] | MIT (PyPI-Klassifikator) | nur lokal | ja (lokal) | https://pypi.org/project/gruut/ |
| HF-Repo `rhasspy/piper-voices` (Commit c10ece1, 17.09.2026), Etikett auf Repo-Ebene [G][K] | Repo-Metadaten „license: mit“ | Das Etikett gilt nicht für die Daten- und Basisketten; maßgeblich ist die MODEL_CARD jeder Stimme | Hinweis, kein Freibrief | https://huggingface.co/rhasspy/piper-voices |
| Piper ar_JO-kareem-low/-medium [G] | MODEL_CARD: Daten „License: See URL“ (AliMokhammad/arabicttstrain ohne LICENSE); „Finetuned from U.S English lessac voice“ | Daten unbestimmbar; lessac-Basis nur für Forschung | nein | https://huggingface.co/rhasspy/piper-voices/tree/main/ar/ar_JO/kareem |
| Piper de_DE-mls-medium [G] | Daten „License: CC-BY 4.0“ (OpenSLR 94: „License: CC BY 4.0“); „Trained from scratch“ | Namensnennung: „Piper-Stimme de_DE-mls-medium, trainiert auf Multilingual LibriSpeech (Pratap u. a. 2020), CC BY 4.0, https://openslr.org/94/ – Aufnahmen: LibriVox-Freiwillige“ | ja | https://huggingface.co/rhasspy/piper-voices/blob/main/de/de_DE/mls/medium/MODEL_CARD |
| Piper de_DE-thorsten-low/-medium/-high, thorsten_emotional-medium (SHA-256-gleich mit Thorsten-Voice/Piper) [G] | Daten CC0; low ← ryan-low (CC BY-NC-SA 4.0); medium/high ← lessac (Research-only); emotional ← thorsten-medium ← lessac | Kette nicht freigebbar; das MIT-Etikett von Thorsten-Voice/Piper ändert daran nichts | nein | https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten |
| Piper de_DE-kerstin-low, -karlsson-low, -pavoque-low [G] | alle „Finetuned from U.S. English Ryan voice (low quality)“; ryan-low ist von Grund auf auf RyanSpeech trainiert (CC BY-NC-SA 4.0); pavoque-Daten zusätzlich CC BY-NC-SA 4.0 | NC-SA in der Kette | nein | https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE |
| Piper de_DE-eva_k-x_low, de_DE-ramona-low (M-AILABS) [G für die Karte] | „License: See URL“, „Trained from scratch“; M-AILABS: eigene BSD-ähnliche Lizenz, Wortlaut nicht gesichert (caito.de nicht erreichbar, UMBC-Spiegel ohne Text) | M-AILABS-Copyright-Hinweis in der Quellenliste | mit Auflagen (16 kHz, x_low/low: für Ausspracheschulung praktisch ungeeignet) | https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE |
| Piper tr_TR-dfki-medium [G] | Daten „https://creativecommons.org/licenses/by-nc-sa/4.0/“; „Finetuned from U.S. English lessac voice“ | NC-SA plus Research-only-Basis | nein | https://huggingface.co/rhasspy/piper-voices/blob/main/tr/tr_TR/dfki/medium/MODEL_CARD |
| Piper tr_TR-fahrettin/-fettah (nur Tag v1.0.0) [G] | Daten CC0, lessac-Basis; entfernt mit Commit b145f2a am 30.12.2025: „Remove fahrettin and fettah voices at request of contributors“ | Kopien bei Dritten nicht verwenden | nein | https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/tr/tr_TR |
| Basisstimmen en_US-lessac / en_US-ryan [G] | lessac: Lizenz „exclusively for Research Purposes only“; „Research Purposes“ schließt u. a. „development … of voice synthesis … products“ aus. ryan: „CC BY-NC-SA 4.0“ | – | nein (auch nicht als Startpunkt für eigenes Training) | https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html |
| Piper en_US-ljspeech-medium (möglicher sauberer Start-Checkpoint) [G][K] | Daten „License: public domain“, „Trained from scratch“ | – | ja (nur als Start-Checkpoint fürs Training) | https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/medium/MODEL_CARD |
| Community-Piper-Stimmen ar/tr (neurlang zayd0, vadimbelsky, dcx514ai, 99eren99) | Etiketten MIT oder CC BY 4.0 oder keine; Datenherkunft nicht dokumentiert | – | nein | https://huggingface.co/neurlang/piper-onnx-zayd0-arabic-diacritized |
| MMS-TTS facebook/mms-tts-ara/-deu/-tur [G] | „The model is licensed as CC-BY-NC 4.0.“ | NC; das ara-Vokabular (39 Zeichen) enthält keine Harakat U+064B–U+0652 (nachgezählt) | nein | https://huggingface.co/facebook/mms-tts-ara |
| Coqui XTTS-v2 (Commit 6c2b0d7) [G] | CPML: „allows only non-commercial use of a machine learning model and its outputs“ | Hinweispflicht auch für Ausgaben; geförderte Projekte gelten nicht als nicht-kommerziell | nein | https://huggingface.co/coqui/XTTS-v2/blob/main/LICENSE.txt |
| Coqui tts_models/de/thorsten/vits (HF Thorsten-Voice/VITS) [G][K] | .models.json: „license“: „apache 2.0“, „author“: „@thorstenMueller“; HF: apache-2.0. Daten Thorsten-neutral-Dec2021: CC0. HF-config.json: `restore_path: None`, `phonemizer: gruut` | Nennung empfohlen: „Stimme: Thorsten Müller (Thorsten-Voice, CC0); Modell: Coqui-TTS-VITS, Apache-2.0“ | ja | https://github.com/idiap/coqui-ai-TTS/blob/dev/TTS/.models.json |
| Coqui tts_models/tr/common-voice/glow-tts + vocoder tr/common-voice/hifigan (v0.6.1) [G] | beide „license“: „MIT“, „author“: „Fatih Akademi“; „unknown speaker from the Common-Voice dataset“ (CC0) | Sprecher nicht identifizieren; Hörprobe Pflicht | mit Auflagen | https://github.com/idiap/coqui-ai-TTS/blob/dev/TTS/.models.json |
| Kokoro-82M (hexgrad) [G] | apache-2.0; Sprachen ohne de/tr/ar | – | nein (fachlich) | https://huggingface.co/hexgrad/Kokoro-82M |
| Thorsten-Voice/Kokoro (26.07.2026) [G] | apache-2.0; Thorsten-Daten CC0 | Restrisiko: Die Kokoro-Basis enthält synthetisches Audio aus geschlossenen Diensten | mit Auflagen | https://huggingface.co/Thorsten-Voice/Kokoro |
| duxx/kikiri-turkish-base [G][K] | Modell: cc-by-sa-3.0. Daten: afkfatih/turkish-tts-combined-raw (cc-by-sa-3.0) ← omersaidd/tts_ahmet_deniz_tur, …_mazlum_kiper_tur, …_nisan_kumru_tur (HF-Etikett mit). README dort: „veri setinin kullanım hakları Ahmet Deniz ve Youtube' a aittir“ | Rechte Dritter; Stimmen realer, bekannter Sprecher (Persönlichkeitsrecht) | nein | https://huggingface.co/datasets/afkfatih/turkish-tts-combined-raw |
| kikiri-tts/kikiri-german-martin/-victoria [G] | apache-2.0; Sprecher „(synthetic)“, Herkunft unbekannt | – | unklar | https://huggingface.co/kikiri-tts/kikiri-german-martin |
| MeloTTS (MyShell) | MIT | – | nein (keine de/tr/ar) | https://github.com/myshell-ai/MeloTTS |
| MBZUAI/speecht5_tts_clartts_ar (ArTST) [G] | cc-by-nc-4.0 | NC; „trained without diacritics“ | nein | https://huggingface.co/MBZUAI/speecht5_tts_clartts_ar |
| Klaam (ARBML) | MIT | kein veröffentlichtes TTS-Gewicht | nein | https://github.com/ARBML/klaam |
| Chatterbox Multilingual V3 (Resemble AI; Gewichte v2 und v3 im selben Repo), chatterbox-tts 0.1.7 [G] | Repo-Etikett mit, README: „Licensed under MIT“; PyPI MIT („Copyright (c) 2025 Resemble AI“) | PerTh-Wasserzeichen in jeder Ausgabe offenlegen; Klonen nur mit eingewilligter Referenzstimme; Tokenizer enthält alle Harakat U+064B–U+0652 (geprüft); Trainingsdaten nur als „0.5M hours of cleaned data“ beschrieben | mit Auflagen (Übergang tr/ar nach Test) | https://huggingface.co/ResembleAI/chatterbox |
| ClArTTS (MBZUAI) [G] | cc-by-4.0; „extracted from a LibriVox audiobook … single male speaker“ | Namensnennung: „ClArTTS – Kulkarni u. a., Interspeech 2023, CC BY 4.0“ für Modell und Audio | ja (Trainingsdaten) | https://huggingface.co/datasets/MBZUAI/ClArTTS |
| Arabic Speech Corpus (Nawar Halabi) [G] | rel="license" CC BY 4.0; HF cc-by-4.0 | „Arabic Speech Corpus – Nawar Halabi, CC BY 4.0“ | ja (Trainingsdaten) | http://en.arabicspeechcorpus.com/ |
| Thorsten-Voice TV-44kHz-Full [G], MLS, Common Voice | Thorsten: cc0-1.0; MLS: CC BY 4.0; Common Voice: CC0 (neuere Releases mit Zusatzbedingungen) | MLS: Namensnennung; Common Voice: kein Re-Hosting, keine Sprecheridentifikation | ja (Trainingsdaten) | https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full |

### 1.2 Sprachdaten, Häufigkeit, Bildkarten

| Posten | Lizenz | Bedingungen | Eignung | Primärquelle |
|---|---|---|---|---|
| Tatoeba – Sätze (Wochenexport) [G] | „These files are released under CC BY 2.0 FR.“ und „A part of our sentences are also available under CC0 1.0.“ Gezählt: CC0-Sätze deu 46, tur 0, ara 2; Bestand deu 783.551, tur 749.693, ara 68.575 | Nutzungsbedingungen: „only allowed if the name of the author is cited“. Vorlage: „Satz #{id} von {Benutzername}, Tatoeba (https://tatoeba.org/de/sentences/show/{id}), CC BY 2.0 FR“; kein SA; auch offline | mit Auflagen | https://tatoeba.org/en/downloads |
| Tatoeba – Audio CC BY 4.0 / CC BY-SA 4.0 / CC0 1.0 [G] | „The license covering an audio file is chosen by the contributor“. deu: 5.334 × CC BY 4.0 (MisterTrouser 3.557, Yeti 1.777); tur und ara: 0 frei | Sprecher, Lizenz, Attribution-URL je Datei; Lizenz und Abrufdatum speichern, bei jedem Import abgleichen | mit Auflagen | https://tatoeba.org/en/downloads |
| Tatoeba – Audio NC / NC-ND / leer [G] | „If the license field is empty, you may not reuse the audio outside the Tatoeba project.“ deu: 11.262 NC und 16.344 leer; tur: 323 NC und 829 leer; ara: 483 leer | – | nein | https://tatoeba.org/en/downloads |
| kaikki.org / Wiktextract (enwiktionary-Dump 02.09.2026, Extraktion 03.10.2026; de-extract) [G][K] | kaikki.org/dictionary/: „This data is made available under the same licenses as Wiktionary - both CC-BY-SA and GFDL.“ Wiktextract: „licensed under the MIT license“ | CC BY-SA 4.0 wählen; Link auf den Wiktionary-Artikel und Hinweis auf Bearbeitung; Beispiele mit Feld `ref` (Zitate) nicht übernehmen; Wiktextract nur lokal | mit Auflagen | https://kaikki.org/dictionary/ |
| Wikimedia-Commons-Audio | je Datei (z. B. CC BY-SA 3.0) | Urheber, Lizenz und Link je Datei; nur CC0, CC BY und CC BY-SA übernehmen, über die API auslesen | mit Auflagen | https://commons.wikimedia.org/w/api.php |
| FrequencyWords (hermitdave), Listen 2018 [G] | „MIT License for code. CC-by-sa-4.0 for content.“ Quelle OpenSubtitles2018 | Namensnennung und SA; Schimpfwörter filtern | mit Auflagen | https://github.com/hermitdave/FrequencyWords |
| wordfreq 3.1.1 (eingefroren) [G] | Code Apache; Daten „Creative Commons Attribution-ShareAlike 4.0“; SUBTLEX: „must credit the SUBTLEX authors“ | Namensnennung inklusive Unterquellen; SA | mit Auflagen | https://github.com/rspeer/wordfreq |
| CAMeL Arabic Frequency Lists v1.0 [G][K] | „provided under an Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) License“ | Zitat laut README: Khalifa, Inoue, Alhafni, Baimukan, Bouamor, Habash (2021), „Camel Arabic Frequency Lists“; SA | mit Auflagen | https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists |
| OpenSubtitles (OPUS) | keine Lizenz | – | nein (nur indirekt über Zähllisten) | https://github.com/Helsinki-NLP/OPUS/blob/main/corpus/OpenSubtitles/info.yaml |
| GER/CEFR Companion Volume 2020 (Europarat) | Auszüge bis 500 Wörter, nicht kommerziell, unverändert (Reihenimpressum; PDF selbst nicht abrufbar) | „© Council of Europe, 2020“; keine Übersetzung ohne Genehmigung | mit Auflagen (nur Stufen und Konzept; eigene Kann-Beschreibungen) | https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4 |
| GER-Begleitband, deutsche Ausgabe (Klett 2020) | Verlagswerk | – | nein | https://www.klett-sprachen.de/978-3-12-676999-0 |
| Profile deutsch (Klett) | Verlagswerk | nur als Nachschlagewerk | nein | https://www.klett-sprachen.de/profile-deutsch/t-396/9783126065184 |
| KELLY-Liste Arabisch [G] | „The lists are available under the CC BY-NC-SA 2.0 license.“ | – | nein | https://ssharoff.github.io/kelly/ |
| Leipzig Corpora Collection | laut Sekundärquelle Downloads CC BY (nicht direkt verifiziert) | – | unklar | https://wortschatz.uni-leipzig.de/en/usage |
| TS Corpus Word List | Etikett „MIT“ gegen „© 2025 TDD. All rights reserved.“ | – | unklar | https://data.tscorpus.com/datasets/ts-corpus-word-list |
| Zargan Linguistic Resources | Variante unbekannt, Quelle 404 | – | unklar | http://st2.zargan.com/duyuru/Zargan_Linguistic_Resources_for_Turkish.html |
| SUBTLEX-DE (direkt) | CC BY-NC-ND 3.0 (Sekundärquelle) | – | nein (nur indirekt über wordfreq) | http://crr.ugent.be/archives/534 |
| DeReWo (IDS) | CC BY-NC-ND 3.0 DE | – | nein | http://www.ids-mannheim.de/derewo |
| A Frequency Dictionary of Arabic (Routledge) | Verlagswerk | – | nein | https://resourcecentre.routledge.com/books/9780415444347 |
| wikipedia-word-frequency (IlyaSemenov) | Code MIT; Daten aus Wikipedia (CC BY-SA 4.0) | SA; kein tr | mit Auflagen (Gegenprobe) | https://github.com/IlyaSemenov/wikipedia-word-frequency |
| OpenMoji 17.0.0 (npm, 23.04.2026) [G] | „OpenMoji graphics are licensed under the Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)“; Code LGPL-3.0 (wird nicht ausgeliefert) | „Alle Emojis gestaltet von OpenMoji – dem Open-Source-Emoji- und Icon-Projekt. Lizenz: CC BY-SA 4.0“; Marken-Icons ausschließen; Motivauswahl | mit Auflagen | https://github.com/hfg-gmuend/openmoji |
| Tabler Icons 3.49.0 (05.10.2026; 3.48.0 vom 22.09.2026) [G] | MIT („Copyright (c) 2020-2026 Paweł Kuna“) | MIT-Hinweis; brand-*-Icons meiden | ja | https://github.com/tabler/tabler-icons |

### 1.3 Modelle, Laufzeit, Schriften, Prüfwerkzeuge

| Posten | Lizenz | Bedingungen | Eignung | Primärquelle |
|---|---|---|---|---|
| Whisper-Gewichte (OpenAI) [G] | GitHub: „Whisper's code and model weights are released under the MIT License.“ HF-Karten openai/whisper-base/-small: apache-2.0 | beide Texte ins Lizenzverzeichnis aufnehmen | mit Auflagen | https://github.com/openai/whisper/blob/main/LICENSE |
| Xenova/whisper-base (64da572) / -small (2d67713) [G][K] | apache-2.0, base_model openai/whisper-* | Apache-Text plus MIT-Hinweis von OpenAI. q8 = `*_quantized.onnx`: Encoder 23,2 MB + Decoder (merged) 53,7 MB. Die Xenova-Dateien `decoder_model_int8/uint8` sind dagegen 159 MB groß, und es fehlt `encoder_model_int8.onnx`; die Dateistruktur ist also nicht identisch mit onnx-community | ja | https://huggingface.co/Xenova/whisper-base |
| onnx-community/whisper-base (1846881) / -small (36050c4) [G] | kein Lizenzfeld; nur base_model | Lizenz nur abgeleitet | mit Auflagen | https://huggingface.co/onnx-community/whisper-base |
| @huggingface/transformers 4.3.1 (06.10.2026) [G][K] | Apache-2.0; das npm-Paket enthält LICENSE, keine NOTICE | `allowRemoteModels=false`, eigene `localModelPath` und `wasmPaths`; nur im Browser oder Worker importieren (sharp/libvips LGPL, onnxruntime-node). Hinweis: Alle Releases seit 3.x pinnen Dev-Builds von onnxruntime-web (4.3.x: 1.31.0-dev.20260914) | mit Auflagen | https://github.com/huggingface/transformers.js/blob/main/LICENSE |
| onnxruntime-web 1.30.0 (14.09.2026) [G] | MIT plus ThirdPartyNotices (u. a. Eigen MPL-2.0) | Das npm-Paket enthält weder LICENSE noch Notices (509 Dateien geprüft); beides aus dem Repo übernehmen; Quelle für Eigen angeben | mit Auflagen | https://github.com/microsoft/onnxruntime/blob/main/LICENSE |
| ts-fsrs 5.4.2 [G] | MIT („Copyright (c) 2026 Open Spaced Repetition“) | MIT-Hinweis | ja | https://github.com/open-spaced-repetition/ts-fsrs/blob/main/LICENSE |
| idb 8.0.4 (06.10.2026) [G] | ISC („Copyright (c) 2016, Jake Archibald“) | ISC-Hinweis | ja | https://github.com/jakearchibald/idb/blob/main/LICENSE |
| fastest-levenshtein 1.0.16 [G] | MIT | MIT-Hinweis | ja | https://github.com/ka-weihe/fastest-levenshtein/blob/master/LICENSE |
| Noto Sans Arabic / @fontsource/noto-sans-arabic 5.3.0 [G] | OFL-1.1 („Copyright 2022 The Noto Project Authors“) | OFL-Text beilegen; nicht allein verkaufen | ja | https://github.com/notofonts/arabic/blob/main/OFL.txt |
| nspell 2.1.5 [G] | MIT | MIT-Hinweis | ja | https://github.com/wooorm/nspell/blob/main/license |
| Hunspell de_DE (igerman98 / frami / npm dictionary-de 3.0.0) [G] | „(GPL-2.0 OR GPL-3.0)“; OASIS-Option greift für Web-Apps nicht | – | nein (Auslieferung); ja (lokal, CLI) | https://www.j3e.de/ispell/igerman98/ |
| hunspell-tr (TDD) 1.1.1 (30.12.2023) [G][K] | MPL-2.0. LICENSE: „Mozilla Public License Version 2.0“; LibreOffice tr_TR/README.txt: „This dictionary is licensed under MPL 2.0 License.“ | .dic/.aff bleiben MPL-2.0; Nennung: TDD (Safaya, Göktoğan, Yuret, Kurtuluş, Sezer) | mit Auflagen | https://github.com/tdd-ai/hunspell-tr |
| npm dictionary-tr 2.0.0 (hrzafer) [G] | MIT („Copyright (c) 2014 Harun Reşit Zafer“) | MIT-Hinweis | ja | https://github.com/wooorm/dictionaries/blob/main/dictionaries/tr/license |
| Hunspell ar – Ayaspell [G] | „GPL 2.0/LGPL 2.1/MPL 1.1 tri-license“, jeweils „or later“ | MPL-2.0 wählen und das im Lizenzverzeichnis festhalten; Dateien bleiben MPL | mit Auflagen | https://github.com/linuxscout/ayaspell/blob/master/COPYING |
| LanguageTool 6.8 | LGPL-2.1 | nur lokal; lokaler Server statt öffentlicher API | mit Auflagen (lokal) | https://github.com/languagetool-org/languagetool/blob/master/COPYING.txt |
| Mishkal 1.10 | GPL-3.0 | nur lokal; jede Vokalisierung fachlich prüfen | mit Auflagen (lokal) | https://github.com/linuxscout/mishkal/blob/master/LICENSE |
| CAMeL Tools 1.6.0 [G] | Code MIT („Copyright 2018-2026 New York University Abu Dhabi“); morphology-db-msa-r13 und disambig-mle-calima-msa-r13 „GPL v2“; msa-s31 LDC | nur lokal; keine Lexikonauszüge ausliefern | mit Auflagen (lokal) | https://camel-tools.readthedocs.io/en/latest/reference/packages.html |
| Zemberek-NLP 0.17.1 | Apache-2.0 | – | ja (lokal) | https://github.com/ahmetaa/zemberek-nlp/blob/master/LICENSE |
| german-pos-dict (LanguageTool) | CC BY-SA 4.0 | Namensnennung, SA | mit Auflagen | https://github.com/languagetool-org/german-pos-dict |

### 1.4 Hanafitische Quellen und Koran

| Posten | Lizenz | Bedingungen | Eignung | Primärquelle |
|---|---|---|---|---|
| OpenITI 2025.1.9 – Dateien ausliefern [G] | Zenodo-API: license „cc-by-nc-sa-4.0“; KITAB: „OpenITI is published under the CC BY-NC-SA“ | NC-SA | nein | https://zenodo.org/records/17767721 |
| OpenITI 2025.1.9 – lokal als Arbeitstext [G] | Grundtexte gemeinfrei (§ 64 UrhG); KITAB: editorielle Zutaten „removed“ | nur eigene kurze Matn-Fassungen ohne Markup ausliefern; gegen einen Druck mit abgelaufener §-70-Frist prüfen; OpenITI-URI als Fundstelle | mit Auflagen | https://kitab-project.org/docs/openITI |
| Mukhtasar al-Quduri (Sham19Y0124336) [G] | gemeinfrei; Kopf: Hg. „[arabische Schrift entfernt]“, DKI, „[arabische Schrift entfernt] 1418[arabische Schrift entfernt] - 1997[arabische Schrift entfernt]“ | § 70 bis 31.12.2022 – abgelaufen | mit Auflagen | https://raw.githubusercontent.com/OpenITI/0450AH/master/data/0428AbuHusaynQuduri/0428AbuHusaynQuduri.Mukhtasar/0428AbuHusaynQuduri.Mukhtasar.Sham19Y0124336-ara1 |
| Nur al-Idah (JK000284) | gemeinfrei; Vorlage Dār al-Ḥikma 1985 | § 70 abgelaufen 2010 | mit Auflagen | OpenITI 1075AH |
| Maraqi al-Falah (Shamela0000412) | gemeinfrei; Vorlage 2005 | § 70 möglicherweise bis 31.12.2030 → gegen Būlāq 1318/1900 prüfen | mit Auflagen | OpenITI 1075AH |
| al-Hidaya (JK000242) | gemeinfrei; Vorlage ohne Jahr | Ausgabe klären oder alten Druck heranziehen | mit Auflagen | OpenITI 0600AH |
| al-Ikhtiyar (SEC Shamela0001066, Ḥalabī 1937) | gemeinfrei | nur die SEC-Fassung von 1937 als Vergleichstext | mit Auflagen | OpenITI 0700AH |
| Radd al-Muhtar (JK000170) | gemeinfrei; Vorlage Dār al-Fikr 2000 | § 70 abgelaufen am 31.12.2025 | mit Auflagen | OpenITI 1275AH |
| al-Fiqh al-Akbar (JK001085) | gemeinfrei; Vorlage 1999 | § 70 abgelaufen am 31.12.2024 | mit Auflagen | OpenITI 0150AH |
| al-ʿAqida at-Tahawiyya (JK000126) | gemeinfrei; Vorlage al-Albānī 1978 | nur der Matn; Albānī-Anmerkungen geschützt bis 2069 | mit Auflagen | OpenITI 0325AH |
| al-ʿAqaʾid an-Nasafiyya + Sharh at-Taftazani | fehlt im Release | alten Druck beschaffen | nein (derzeit) | https://zenodo.org/records/17767721 |
| al-Maktaba al-Shamela | „[arabische Schrift entfernt] …“ | keine Nachnutzung, kein Scraping | nein | https://shamela.ws/page/terms |
| Quranic Arabic Corpus 0.4 [G] | „License: GNU General Public License“; „CHANGING IT IS NOT ALLOWED“; FAQ: „You do not use the data for commercial purposes. The data should be used purely for research“ | widersprüchlich, faktisch nur Forschung | nein | https://corpus.quran.com/download/ |
| mustafa0x/quran-morphology, q-ran/quran, kwanite/quran-roots-dictionary, R3GENESI5/quran-bil-quran | keine Lizenz, CC BY 4.0, GPL-3.0 oder MIT, jeweils auf QAC-Basis | QAC-Bedingungen gelten fort | nein | jeweilige GitHub-Repos |
| QUL (Tarteel) Morphologie-Exporte; NoorBayan/Quranic | Code MIT; Datenherkunft ungenannt (Verdacht QAC) | – | unklar | https://qul.tarteel.ai/resources/morphology/75 |
| Tanzil Quran Text (Uthmani 1.1) [G] | Datei-Kopf: „License: Creative Commons Attribution 3.0“ und „CHANGING IT IS NOT ALLOWED“ | Quelle „Tanzil Project“ plus Link; Copyright-Block in allen abgeleiteten Dateien; Text unverändert | mit Auflagen (schon genutzt, ADR 0025) | https://tanzil.net/download/ |
| CAMeL Tools (lokal) für eine eigene Koran-Wurzeltabelle | Code MIT, Daten GPL v2 | Ergebnis von einer Lehrkraft prüfen lassen; eigene Tabelle CC BY-SA 4.0 | mit Auflagen (lokal) | https://camel-tools.readthedocs.io/ |
| Corpus Coranicum | laut Suchtreffer CC BY 4.0 (nicht direkt geprüft) | – | unklar | https://corpuscoranicum.org |
| Quran Foundation Content API | eigene Bedingungen, keine Weitergabe | – | nein | https://api-docs.quran.foundation/legal/developer-terms |
| Ḥiṣn al-Muslim, Original (al-Qaḥṭānī † 2018) und deutsche Übersetzungen | geschützt bis 31.12.2088; Übersetzungen ohne Lizenz | – | nein | https://ar.wikisource.org/wiki/[arabische Schrift entfernt]:[arabische Schrift entfernt]_[arabische Schrift entfernt]_[arabische Schrift entfernt]_[arabische Schrift entfernt]_[arabische Schrift entfernt]_[arabische Schrift entfernt] |
| Joseph Hell, „Von Mohammed bis Ghazâlî“ (1915/1923) | gemeinfrei (Hell † 1950) | Hells Einleitung und Anmerkungen nicht übernehmen; Fachprüfung | mit Auflagen | https://archive.org/details/vonmohammedbisgh0000hell |
| GMSG-Nachdruck 2003 (Hell-Text) | nur der Hell-Text ist frei | aus dem Original von 1923 arbeiten | mit Auflagen | https://d-nb.info/967937620 |
| Helmdörfer 1832 (Quduri, Buch der Ehe) | gemeinfrei | kein Digitalisat gefunden | mit Auflagen | DNB |
| Ṭaḥāwiyya dt. (Wentzel, Homolka, Darulkitab); Nasafiyya dt. (Polat); sonstige dt./engl. Übersetzungen | Verlagswerke | – | nein | DNB |

---

## 2. Empfehlung je Zweck

| Zweck | Empfehlung (Standard) | Ersatz / Übergang | Ausgeschlossen |
|---|---|---|---|
| **TTS Deutsch** | Coqui-VITS Thorsten (Apache-2.0, CC0-Daten, gruut statt espeak), lokal rendern, nur Audio ausliefern | Piper de_DE-mls-medium (CC BY 4.0, Sprecher per Hörprobe wählen); Thorsten-Voice/Kokoro (mit Auflagen) | alle Piper-Thorsten-, kerstin-, karlsson- und pavoque-Stimmen; MMS; XTTS |
| **TTS Türkisch** | Ziel: eigene Aufnahme (2–4 h, CC0 mit schriftlicher Einwilligung in KI-Synthese) und Training mit piper1-gpl von einem sauberen Checkpoint aus (ljspeech oder de_DE-mls) | Übergang: Coqui tr glow-tts (MIT, CC0) oder Chatterbox (MIT), je nachdem, wer in Hörprobe und Verständlichkeitstest besser abschneidet | tr_TR-dfki, fahrettin/fettah, kikiri-turkish, MMS |
| **TTS Arabisch (Hocharabisch, vokalisiert)** | Eigene Piper-Stimme auf ClArTTS (CC BY 4.0), optional ergänzt um den Arabic Speech Corpus; espeak-ng ar lokal; Eingabe immer voll vokalisiert | Übergang: Chatterbox nach Test mit Minimalpaaren (Harakat, Šadda, Tanwīn) | kareem, MMS, ArTST, Community-Stimmen |
| **Koran-Rezitation** | keine TTS; lizenzierte menschliche Rezitationen gesondert prüfen | – | jede TTS |
| **Echte Aufnahmen (Wortschatz)** | Tatoeba-Audio deu nur mit CC BY 4.0, CC BY-SA 4.0 oder CC0; Commons-Audio je Datei per API | eigene Aufnahmen | Tatoeba NC, ND und leer |
| **Wortschatz / Sätze** | Tatoeba-Sätze (CC BY 2.0 FR / CC0) mit Nennung je Satz; dewiktionary über kaikki (CC BY-SA 4.0, ohne `ref`-Beispiele); eigene Sätze | – | OpenSubtitles-Sätze, Leipzig-Sätze, Profile deutsch |
| **Häufigkeit** | wordfreq (de, tr, ar) plus CAMeL-Listen (ar), FrequencyWords als Gegenprobe; alle CC BY-SA 4.0 | wikipedia-word-frequency | KELLY, SUBTLEX direkt, DeReWo, Routledge |
| **Lizenz der Lerninhalte** | Wortschatz-Datenbank und eigene Texte unter CC BY-SA 4.0 (wegen SA aus Wiktionary, wordfreq, CAMeL und OpenMoji); Quellenangaben offline mitliefern | – | NC-Material jeder Art |
| **Bildkarten** | OpenMoji 17.0.0 (CC BY-SA 4.0) mit freigegebener Motivliste, ohne Marken-Icons | Tabler Icons (MIT) für Oberfläche und abstrakte Begriffe | – |
| **Spracherkennung** | Xenova/whisper-base, q8 (`*_quantized`, ca. 77 MB), festem Commit, selbst gehostet; transformers.js mit `allowRemoteModels=false`; WASM von onnxruntime-web selbst gehostet | whisper-small (ca. 249 MB) nur nach Praxistest für ar/tr | Laden von huggingface.co oder jsDelivr zur Laufzeit |
| **Schrift** | Noto Sans Arabic über @fontsource 5.3.0 (OFL-1.1) | – | – |
| **Prüfung von Antworten im Client** | de: Abgleich gegen erwartete Antworten (fastest-levenshtein); tr: dictionary-tr (MIT) mit nspell; ar: Ayaspell unter MPL-2.0 (nur ohne Tashkīl) | tr: TDD hunspell-tr (MPL-2.0) | igerman98 / dictionary-de (GPL) |
| **Prüfwerkzeuge (lokal)** | LanguageTool (de), Zemberek (tr), Mishkal und CAMeL Tools (ar), Hunspell-CLI; nichts davon ausliefern | german-pos-dict (CC BY-SA 4.0), falls ein Lexikon im Client nötig wird | öffentliche LanguageTool-API für Lerninhalte |
| **Hanafitische Quellen** | eigene Matn-Fassungen aus gemeinfreien Grundtexten; OpenITI nur lokal; Abgleich gegen Drucke mit abgelaufener §-70-Frist; deutsche Übersetzung selbst erstellen (CC BY-SA 4.0); Joseph Hell 1923 als Vorlage für Fiqh Akbar und Ṭaḥāwiyya | Freigabe-Anfrage bei KITAB oder IGMG e. V. | OpenITI-Dateien, Shamela, Verlagsübersetzungen, Ḥiṣn al-Muslim |
| **Koran-Morphologie / Wurzeln** | eigene Wurzeltabelle: Tanzil-Formen + CAMeL Tools lokal + Wiktionary (CC BY-SA) + Prüfung durch eine Lehrkraft, veröffentlicht unter CC BY-SA 4.0 (Tanzil-Hinweis beibehalten) | schriftliche Erlaubnis für QAC 0.4 | QAC 0.4 und alle Ableger; QUL und NoorBayan bis zur Klärung |

---

## 3. Entscheidungen für Menschen (mit Standard)

| Nr. | Frage | Standard, falls niemand anders entscheidet |
|---|---|---|
| L0-E01 | Darf NC-, ND- oder Research-only-Material verwendet werden (MMS, CPML, KELLY, OpenITI-Dateien, Tatoeba NC)? | **Nein.** Die NC-Auslegung ist in DE uneinheitlich (LG Köln 28 O 232/13 / OLG Köln 6 U 60/14), NC-SA ist mit CC BY-SA unvereinbar, und Förderung oder Spenden würden die Lage kippen. |
| L0-E02 | Unter welcher Lizenz stehen die Lerninhalte? | **CC BY-SA 4.0** für Wortschatz-Datenbank und eigene Texte; keine technischen Schutzmaßnahmen; Quellenangaben offline. |
| L0-E03 | Gelten die Bedingungen von Trainingsdaten und Gewichten für erzeugtes Audio? | **Konservativ übertragen:** nur Stimmen mit freier Kette; Namensnennung der CC-BY-Daten in der Quellenliste. Klärung mit dem Rechtsberater des Vereins. |
| L0-E04 | Deutsche Stimme | **Coqui-VITS Thorsten**; Hörvergleich mit de_DE-mls-medium. |
| L0-E05 | Türkische Stimme | **Übergang Coqui tr glow-tts**, Chatterbox nur bei besserer Hörprobe; parallel eine eigene Aufnahme vorbereiten. |
| L0-E06 | Arabische Stimme | **Eigene Piper-Stimme auf ClArTTS**; bis dahin Chatterbox nur nach bestandenem Vokalisierungstest, sonst arabische Übungen ohne TTS-Audio. |
| L0-E07 | Eigene Stimmaufnahmen (tr, ggf. ar) | **Ja**, mit Einwilligung (CC0 oder Rechteübertragung, KI-Synthese ausdrücklich, Widerrufsfolgen nach DSGVO); GPU-Ressourcen klären. |
| L0-E08 | Quelle und Größe des Whisper-Modells, Hosting | **Xenova/whisper-base q8**, Commit festgelegt, selbst gehostet; ob Vercel-Static oder Blob, entscheidet der Bau-Test (100 MB Hobby / 1 GB Pro). |
| L0-E09 | Rechtschreibprüfung tr / de | **tr: dictionary-tr (MIT); de: kein Hunspell**, nur Abgleich gegen erwartete Antworten. |
| L0-E10 | Mindestreife der Versionen | **Mindestens 14 Tage.** Ab 20.10.2026 transformers.js 4.3.1 und idb 8.0.4, vorher 4.3.0 bzw. 8.0.3. Exakt pinnen; der Dev-Build von onnxruntime-web ist bei transformers.js unvermeidbar und muss im Lockfile fixiert werden. |
| L0-E11 | OpenITI: Anfrage bei KITAB? | **Nicht nötig für den Start**: nur lokal nutzen, eigene Fassungen ausliefern. Die Anfrage ist optional. |
| L0-E12 | Koran-Wurzeln: eigene Tabelle oder QAC-Erlaubnis? | **Eigene Tabelle**; eine Lehrkraft prüft fachlich (Person benennen). |
| L0-E13 | Ḥiṣn al-Muslim | **Eigene Duʿāʾ-Sammlung** aus Koran und Hadith-Primärquellen mit eigener Übersetzung. |
| L0-E14 | Joseph Hell 1923 übernehmen? | **Ja, sprachlich modernisiert**, geprüft gegen das Arabische; Hells Einleitung und Anmerkungen weglassen. |
| L0-E15 | Fehlende Texte (Nasafiyya, Hidāya-Ausgabe, Marāqī) | **Alte Drucke** (19. Jh. / Būlāq 1900) festlegen und beschaffen; bis dahin diese Werke zurückstellen. |
| L0-E16 | Lebewesen auf Bildkarten (OpenMoji) | **Zurückhaltend:** bis zur Entscheidung der Gemeinde keine Menschen- oder Tierdarstellungen; Motivliste von der Redaktion freigeben lassen. |
| L0-E17 | Spendenaufrufe, Mitgliederwerbung oder Förderung in der Lern-App | **Keine in der Lern-App**; das ist bei E01 = Nein ohnehin unkritisch. |
| L0-E18 | Freigabe von IGMG-eigenen Lehrwerken unter CC BY-SA 4.0 anfragen? | **Ja, anfragen**, aber nicht darauf warten. |
| L0-E19 | GER-Deskriptoren | **Eigene „Ich kann …“-Formulierungen** mit dem Hinweis „orientiert am GER (Europarat 2001/2020)“. |

---

## 4. Gegenprüfung: Was geprüft und was korrigiert wurde

**An der Primärquelle nachgeprüft (Auswahl, 31 Posten):**
- Piper-MODEL_CARDs: kareem low/medium, mls, thorsten low/medium/high/emotional, kerstin, karlsson, pavoque, eva_k, ramona, dfki, fahrettin@v1.0.0, ryan low/medium, lessac, ljspeech. Dazu der Entfernungs-Commit b145f2a, der Verzeichnisinhalt tr/ar/de und der SHA-256-Vergleich der Thorsten-ONNX-Dateien.
- lessac-Lizenztext, OpenSLR 94, piper1-gpl (COPYING, PyPI 1.8.0), espeak-ng (README, languages.md).
- MMS (Karte, vocab.json), XTTS-CPML, Chatterbox (Karte, PyPI, Tokenizer), Coqui .models.json und HF-config.json, ClArTTS, Arabic Speech Corpus.
- Tatoeba: Downloads-Seite, Nutzungsbedingungen, `sentences_with_audio` und Sprach-Exporte (Zählungen nachgerechnet).
- kaikki.org und Wiktextract, FrequencyWords, wordfreq, CAMeL-Listen, KELLY, OpenMoji, Tabler.
- Whisper (GitHub sowie HF-API für openai, Xenova und onnx-community), npm-Registry (transformers.js, onnxruntime-web, ts-fsrs, idb, fastest-levenshtein, nspell, @fontsource, dictionary-de, dictionary-tr), hunspell-tr (LICENSE, LibreOffice README), Ayaspell COPYING, CAMeL Tools.
- OpenITI: Zenodo-API, KITAB-FAQ und Kopf der Quduri-Datei; QAC (Download und FAQ); Tanzil (Datei-Kopf).

**Korrekturen und Ergänzungen:**
1. **kaikki.org:** Die Seite nennt doch eine Lizenz. kaikki.org/dictionary/: „This data is made available under the same licenses as Wiktionary - both CC-BY-SA and GFDL.“ Die Bewertung bleibt gleich.
2. **kikiri-turkish:** Das Etikett cc-by-sa-3.0 steht am Modell und am Zwischendatensatz afkfatih/turkish-tts-combined-raw. Der verlinkte Quelldatensatz omersaidd/tts_ahmet_deniz_tur ist auf HF dagegen mit „mit“ etikettiert, und sein README weist die Rechte Ahmet Deniz und YouTube zu. Mit Mazlum Kiper und Nisan Kumru kommen zwei weitere Sprecher desselben Uploaders hinzu. Die Bewertung „nein“ bleibt und wird dadurch gestützt.
3. **CAMeL-Häufigkeitslisten:** Laut README wird Khalifa u. a. (2021) zitiert, nicht „Inoue u. a. 2021“.
4. **hunspell-tr:** Der zitierte Satz „This dictionary is licensed under MPL 2.0 License.“ steht im LibreOffice-README tr_TR/README.txt (Version 1.1.1, 30.12.2023), nicht im GitHub-README von tdd-ai. Dort steht nur die LICENSE-Datei (MPL-2.0). Die Lizenz selbst ist richtig angegeben.
5. **Xenova vs. onnx-community:** Die Dateistruktur ist nicht identisch. Bei Xenova fehlt `encoder_model_int8.onnx`, und `decoder_model_int8/uint8` haben 159 MB statt 53 MB. Identisch sind nur die q8-Dateien `*_quantized` (23,2 + 53,7 MB).
6. **transformers.js und Dev-Build:** Nicht nur 4.3.x hängt an einem Dev-Build von onnxruntime-web. Alle Releases seit 3.x pinnen Dev-Builds (3.8.x: 1.22.0-dev, 4.0–4.2: 1.25/1.26-dev). Ein Wechsel auf eine ältere Version umgeht das also nicht.
7. **piper-voices:** Ergänzt wurde, dass das Repo auf HF pauschal mit „license: mit“ etikettiert ist. Das darf nicht als Freigabe gelesen werden; maßgeblich ist die MODEL_CARD jeder Stimme.
8. **Kette der Piper-Low-Stimmen:** ryan-low ist laut Karte „Trained from scratch“ auf RyanSpeech (CC BY-NC-SA 4.0). Die NC-SA-Kette von kerstin, karlsson, pavoque und thorsten-low geht also direkt auf die RyanSpeech-Daten zurück, nicht auf lessac. thorsten_emotional erbt die lessac-Kette über thorsten-medium.
9. **Coqui-VITS Thorsten:** Die HF-config.json zeigt `restore_path: None`, `phonemizer: gruut` und den Datensatz Thorsten-neutral-Dec2021. Das stützt „von Grund auf trainiert“ und bedeutet, dass für diese Stimme kein espeak-ng nötig ist. gruut und gruut-lang-de stehen unter MIT. Die offene Frage ist damit weitgehend beantwortet; bestätigt werden muss noch, dass die Coqui-Release-Datei v0.7.0 dieselbe Konfiguration hat.
10. **Tatoeba:** deu-Audio ohne Lizenz zählt am 16.10.2026 16.344 statt 16.345 Dateien, eine Abweichung durch den Wochenstand. Alle übrigen Zahlen stimmen.
11. **espeak-ng:** Das ChangeLog führt schon einen Abschnitt 1.53.0. Vor dem Festlegen den Release-Stand prüfen; die Lizenz ändert sich dadurch nicht.

**Weiter offen (nicht abschließend prüfbar):**
- Wortlaut der M-AILABS-Lizenz (caito.de nicht erreichbar).
- Impressum des GER-CV-PDF (Cloudflare-Sperre).
- Lizenz der Leipzig-Downloads (Anubis-Sperre).
- Brexit-Folgen für das EU-Datenbankrecht an QAC 0.4. Die Frage ist ab 31.12.2026 ohnehin gegenstandslos; die vertraglichen Download-Bedingungen gelten fort.
- Herkunft der Chatterbox-Trainingsdaten.
