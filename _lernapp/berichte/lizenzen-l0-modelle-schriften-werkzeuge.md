<!-- Lizenzprüfung L0 (Workflow wf_cf9ab8d3-fce, 16.10.2026). Arabische Schrift entfernt. -->

# Lizenzprüfung Lern-App L0 – Modelle, Bibliotheken, Schriften, Prüfwerkzeuge

Stand: 16.10.2026. Geprüft wurden nur Primärquellen: npm-Registry (`registry.npmjs.org`), Lizenzdateien in den GitHub-Repositorien (raw), Hugging-Face-API und Model Cards, PyPI-JSON, offizielle Projektseiten (j3e.de, SourceForge) und die Debian-Copyright-Datei für Ayaspell. Paket-Tarballs (onnxruntime-web, @huggingface/transformers, @fontsource/noto-sans-arabic) und das CAMeL-Tools-Wheel wurden heruntergeladen und ihr Inhalt geprüft.

Maßstab: Ausgelieferter Code muss unter MIT, Apache-2.0, BSD, ISC, MPL-2.0 oder OFL stehen. Ausgelieferte Daten dürfen unter CC0, CC BY oder CC BY-SA stehen. GPL und LGPL sind nur für Werkzeuge zulässig, die lokal beim Erzeugen laufen. **Keiner der geprüften Posten steht unter einer NC-Lizenz.** Die NC-Frage betrifft diesen Bereich daher nicht. Bei den Daten-Paketen von CAMeL Tools gibt es aber eine LDC-Lizenz und eine eigene AraBERT-Lizenz (siehe dort).

## Kurzfazit

| Posten | Version/Stand | Lizenz | Eignung | Einsatz |
|---|---|---|---|---|
| Whisper-Gewichte (OpenAI) | GitHub `openai/whisper` main; HF `openai/whisper-base/-small` (29.02.2024) | MIT (GitHub), `apache-2.0` (HF-Card) | mit Auflagen | ausliefern |
| onnx-community/whisper-base, -small | Rev. 1846881 / 36050c4 (19.06.2025) | **kein Lizenzfeld**, abgeleitet von openai/whisper-* | mit Auflagen | ausliefern (selbst hosten) |
| Xenova/whisper-base, -small | Rev. 64da572 / 2d67713 (16.12.2025) | `apache-2.0` | ja | ausliefern (selbst hosten) |
| @huggingface/transformers (transformers.js) | 4.3.1 (06.10.2026) | Apache-2.0 | mit Auflagen | ausliefern |
| onnxruntime-web | 1.30.0 (14.09.2026); transformers.js 4.3.x pinnt 1.31.0-dev.20260914 | MIT + ThirdPartyNotices | mit Auflagen | ausliefern |
| ts-fsrs | 5.4.2 (01.09.2026) | MIT | ja | ausliefern |
| idb | 8.0.4 (06.10.2026) | ISC | ja | ausliefern |
| fastest-levenshtein | 1.0.16 (02.08.2022) | MIT | ja | ausliefern |
| Noto Sans Arabic über @fontsource/noto-sans-arabic | Paket 5.3.0 (19.07.2026), Schrift v2.012 | OFL-1.1 | ja | ausliefern |
| nspell | 2.1.5 (17.01.2021) | MIT | ja | ausliefern |
| Hunspell de_DE (igerman98 / frami; npm `dictionary-de`) | igerman98 2016-12-07, frami 2017-01-09; `dictionary-de` 3.0.0 | GPL-2.0 oder GPL-3.0 (OASIS nur für ODF-Programme) | **nein** (ausliefern); ja nur lokal | nur lokal |
| Hunspell tr_TR (LibreOffice = tdd-ai/hunspell-tr) | 1.1.1 (30.12.2023) | MPL-2.0 | mit Auflagen | ausliefern |
| npm `dictionary-tr` (hrzafer/hunspell-tr) | 2.0.0 (03.11.2023) | MIT | ja | ausliefern |
| Hunspell ar (Ayaspell) | LibreOffice 3.5; Upstream 3.7 | GPL-2.0+ / LGPL-2.1+ / MPL-1.1+ (Wahl) | mit Auflagen (unter MPL-2.0 nutzen) | ausliefern |
| LanguageTool | 6.8 (05.05.2026) | LGPL-2.1 (oder später) | mit Auflagen | nur lokal |
| Mishkal | 1.10 „Bouira“ (GitHub); PyPI 0.4.1 | GPL-3.0 | mit Auflagen | nur lokal |
| CAMeL Tools | 1.6.0 (08.06.2026) | Code MIT; Daten GPL v2 / LDC / CC BY 4.0 / AraBERT / Apache-2.0 / MIT | mit Auflagen | nur lokal |
| Zemberek-NLP | 0.17.1 (23.07.2019) | Apache-2.0 | ja | lokal (wäre auch auslieferbar) |
| Zusatz: german-pos-dict (LanguageTool) | master | CC BY-SA 4.0 | mit Auflagen | mögliche Quelle für deutsche Wortlisten |

---

## 1. Whisper-Gewichte (OpenAI)

- **Primärquelle:** https://github.com/openai/whisper/blob/main/LICENSE, README, `model-card.md`; https://huggingface.co/openai/whisper-base und https://huggingface.co/openai/whisper-small
- **Lizenz (wörtlich):** README: „Whisper's code and model weights are released under the MIT License.“ LICENSE: „MIT License – Copyright (c) 2022 OpenAI“. Die HF-Model-Cards von `openai/whisper-*` tragen in ihren Metadaten dagegen `license: apache-2.0` (HF-API, Stand der Repos 29.02.2024).
- **Bedingungen:** MIT: Copyright-Hinweis und Lizenztext beilegen. Apache-2.0 (falls die HF-Fassung maßgeblich ist): Lizenztext beilegen, Hinweise erhalten und Änderungen kennzeichnen. Kein ShareAlike.
- **Namensnennung (Vorschlag):** „Spracherkennung: Whisper – Copyright (c) 2022 OpenAI, MIT-Lizenz (https://github.com/openai/whisper). ONNX-Fassung: Hugging Face (Xenova / onnx-community).“
- **Eignung: mit Auflagen.** Beide Lizenzen sind erlaubt. Auflage: In den Lizenzhinweisen den MIT-Text (OpenAI) **und** den Apache-2.0-Text aufführen. So deckt der Hinweis beide Angaben ab.
- **Hinweis aus der Model Card (keine Lizenzbedingung):** OpenAI rät von „high-risk domains like decision-making contexts“ ab und warnt davor, Aufnahmen ohne Einwilligung zu transkribieren. Für Aussprache-Rückmeldungen ohne Notenwirkung ist das unkritisch. Die Rückmeldung sollte aber nicht als Bewertung mit Folgen dienen.

## 2. ONNX-Fassungen: onnx-community/whisper-base, -small; Xenova/whisper-base, -small

- **Primärquellen:** https://huggingface.co/onnx-community/whisper-base, https://huggingface.co/onnx-community/whisper-small, https://huggingface.co/Xenova/whisper-base, https://huggingface.co/Xenova/whisper-small (README und HF-API)
- **Lizenz:**
  - `onnx-community/*`: Die README-Metadaten enthalten nur `base_model: openai/whisper-base` und `library_name: transformers.js`, **kein `license`-Feld**. Text: „https://huggingface.co/openai/whisper-base with ONNX weights to be compatible with Transformers.js.“
  - `Xenova/*`: `license: apache-2.0`, `base_model: openai/whisper-*`.
- **Inhalt:** ONNX-Gewichte in `onnx/` (fp32, fp16, int8/uint8/quantized, q4, bnb4) sowie Tokenizer-Dateien (`vocab.json`, `merges.txt`, `tokenizer.json`), die aus dem OpenAI-Tokenizer stammen. Größen bei whisper-base: Encoder q8 23,2 MB und Decoder merged q8 53,7 MB, zusammen etwa 77 MB. Bei whisper-small: Encoder q8 92,3 MB und Decoder merged q8 156,8 MB, zusammen etwa 249 MB. whisper-tiny q8 kommt auf etwa 41 MB.
- **Bedingungen:** wie bei Whisper. Die Umwandlung nach ONNX ist eine Bearbeitung, die Lizenz des Ausgangsmodells gilt weiter.
- **Eignung:** Xenova: **ja**, die Lizenz ist ausdrücklich angegeben. onnx-community: **mit Auflagen**, denn die Lizenz ist nur abgeleitet. Im Lizenzverzeichnis die Ausgangslizenz (MIT OpenAI, Apache-2.0 laut HF-Card) nennen und die genaue Revision (Commit-SHA) festhalten.
- **Auflagen für den Einsatz:** Gewichte unter einem festen Commit **selbst hosten** (eigenes Origin oder CDN), nicht zur Laufzeit von huggingface.co laden (siehe transformers.js). Eine Kopie des Lizenztexts neben die Gewichte legen.

## 3. @huggingface/transformers (transformers.js)

- **Version:** 4.3.1, veröffentlicht am 06.10.2026. Vorgänger: 4.3.0 vom 16.09.2026.
- **Primärquelle:** https://github.com/huggingface/transformers.js/blob/main/LICENSE; npm `package.json` (`"license": "Apache-2.0"`)
- **Lizenz (wörtlich):** „Apache License Version 2.0, January 2004“. Das npm-Paket enthält `LICENSE`, aber keine `NOTICE`-Datei.
- **Abhängigkeiten (aus npm, Version 4.3.1):** `onnxruntime-web` 1.31.0-dev.20260914-8d85527a0 (MIT), `onnxruntime-node` 1.30.0 (MIT), `@huggingface/jinja` ^0.5.10 (MIT), `@huggingface/tokenizers` ^0.2.0 (Apache-2.0), `sharp` ^0.35.4 (Apache-2.0). `sharp` bringt `@img/sharp-libvips-*` mit, das unter **LGPL-3.0-or-later** steht.
- **Bedingungen:** Apache-2.0 §4: Lizenztext beilegen und Copyright- und Attribution-Hinweise erhalten. Kein ShareAlike.
- **Eignung: mit Auflagen.**
  1. **Laufzeit-Fernzugriffe abschalten.** Im Paket ist `remoteHost: "https://huggingface.co/"` voreingestellt. Die WASM-Dateien werden standardmäßig von `cdn.jsdelivr.net/npm/onnxruntime-web@${version}/dist/` geladen (beides im Tarball von 4.3.1 geprüft). Beides würde IP-Adressen an Dritte (USA) übermitteln. Deshalb `env.allowRemoteModels = false` und `env.localModelPath` setzen und `env.backends.onnx.wasm.wasmPaths` auf selbst gehostete Dateien richten.
  2. transformers.js nur **im Browser oder Web Worker** importieren. So landen `sharp` mit libvips (LGPL-3.0) und `onnxruntime-node` nicht in Vercel-Funktionen. Auf dem Build-Server sind sie unkritisch, weil sie nicht an Nutzer gehen.
  3. Die Version exakt festlegen. Die Zeilen 4.3.x hängen an einem **Dev-Build** von onnxruntime-web. Die Lizenz ändert sich dadurch nicht, die Stabilität ist aber zu prüfen.

## 4. onnxruntime-web

- **Version:** 1.30.0 vom 14.09.2026 (`latest`). Über transformers.js 4.3.x kommt 1.31.0-dev.20260914 hinzu.
- **Primärquelle:** https://github.com/microsoft/onnxruntime/blob/main/LICENSE und https://github.com/microsoft/onnxruntime/blob/main/ThirdPartyNotices.txt
- **Lizenz (wörtlich):** „MIT License – Copyright (c) Microsoft Corporation“.
- **Befund im Tarball:** Das npm-Paket 1.30.0 enthält **weder LICENSE noch ThirdPartyNotices**. Den Lizenztext muss man deshalb aus dem Repository übernehmen. Die WASM-Dateien sind 14 bis 28 MB groß (`ort-wasm-simd-threaded*.wasm`). Sie enthalten statisch gebundene Drittbibliotheken, die in den ThirdPartyNotices aufgeführt sind: protobuf (BSD), Eigen (**MPL-2.0**), abseil, flatbuffers, XNNPACK, re2 (Apache/BSD), Mbed TLS („This distribution uses Mbed TLS under the Apache License 2.0“) und weitere. GPL-Bestandteile werden nicht genutzt. Die Notices erwähnen GPL nur als Wahlmöglichkeit (Mbed TLS) und als „Secondary License“ im MPL-Text.
- **JS-Abhängigkeiten:** `long` 5.3.2 (Apache-2.0), `platform` 1.3.6 (MIT), `protobufjs` (BSD-3-Clause), `flatbuffers` (Apache-2.0), `guid-typescript` 1.0.9 (ISC), `onnxruntime-common` (MIT).
- **Eignung: mit Auflagen.** Ins Lizenzverzeichnis gehören der MIT-Text und `ThirdPartyNotices.txt` (oder ein Auszug der tatsächlich enthaltenen Komponenten). Für Eigen (MPL-2.0 §3.2) ist anzugeben, wo der Quelltext erhältlich ist (Link auf https://gitlab.com/libeigen/eigen und den onnxruntime-Commit).

## 5. ts-fsrs

- **Version:** 5.4.2 vom 01.09.2026. Daneben gibt es die Vorabversion 6.0.0-beta.14.
- **Primärquelle:** https://github.com/open-spaced-repetition/ts-fsrs/blob/main/LICENSE
- **Lizenz (wörtlich):** „MIT License – Copyright (c) 2026 Open Spaced Repetition“. Keine Abhängigkeiten.
- **Eignung: ja.** Copyright und MIT-Text ins Lizenzverzeichnis aufnehmen. Version 5.x festlegen, 6.0 ist noch Beta.

## 6. idb

- **Version:** 8.0.4 vom 06.10.2026. Vorgänger: 8.0.3 vom 07.05.2025.
- **Primärquelle:** https://github.com/jakearchibald/idb/blob/main/LICENSE
- **Lizenz (wörtlich):** „ISC License (ISC) – Copyright (c) 2016, Jake Archibald“. Keine Abhängigkeiten.
- **Eignung: ja.** ISC-Hinweis aufnehmen. 8.0.4 ist erst 10 Tage alt. Wenn eine Mindestreife gilt, vorerst 8.0.3 festlegen.

## 7. fastest-levenshtein

- **Version:** 1.0.16 vom 02.08.2022. Das Paket ist stabil und wird nicht mehr aktiv entwickelt.
- **Primärquelle:** https://github.com/ka-weihe/fastest-levenshtein/blob/master/LICENSE
- **Lizenz (wörtlich):** „MIT License – Copyright (c) 2020 Kasper Unn Weihe“.
- **Eignung: ja.**

## 8. Noto Sans Arabic über @fontsource

- **Version:** `@fontsource/noto-sans-arabic` 5.3.0 vom 19.07.2026. Daneben gibt es `@fontsource-variable/noto-sans-arabic` 5.3.0. Die Schrift trägt im Name-Table die Version 2.012. In `metadata.json` steht `"version": "v33"`, `"lastModified": "2025-09-17"` und als Quelle google/fonts.
- **Primärquelle:** https://github.com/notofonts/arabic/blob/main/OFL.txt; `LICENSE` und `metadata.json` im npm-Paket; https://fontsource.org/fonts/noto-sans-arabic
- **Lizenz (wörtlich):** „Copyright 2022 The Noto Project Authors (https://github.com/notofonts/arabic) – This Font Software is licensed under the SIL Open Font License, Version 1.1.“ Es ist **kein Reserved Font Name** angegeben.
- **Bedingungen:** OFL §2: Jede Kopie muss Copyright-Hinweis und Lizenz enthalten. Das darf auch über Metadaten geschehen, solange Nutzer sie leicht einsehen können. Die WOFF-Dateien enthalten in Name-ID 0 das Copyright und in ID 14 die URL `https://scripts.sil.org/OFL`. Die Schrift darf nicht allein verkauft werden. Bearbeitete Fassungen bleiben unter OFL. Mit Software gebündelt ausliefern und als Webfont einbinden ist erlaubt.
- **Namensnennung:** „Noto Sans Arabic – Copyright 2022 The Noto Project Authors (https://github.com/notofonts/arabic), SIL Open Font License 1.1“. Den OFL-Volltext ins Lizenzverzeichnis aufnehmen.
- **Eignung: ja.** Zusatzprüfung: Die cmap der Teilmenge `arabic` (400) deckt die koranischen Zeichen U+0670, U+06D6–U+06ED, U+08F0–U+08F2 und U+0653–U+0655 ab. Ob die Schrift typografisch für Korantext taugt (Naskh gegenüber Sans), ist eine Gestaltungsfrage und keine Lizenzfrage.

## 9. Hunspell-Wörterbücher und nspell

### 9a. nspell
- **Version:** 2.1.5 vom 17.01.2021. Abhängigkeit: `is-buffer` 2.0.5 (MIT).
- **Primärquelle:** https://github.com/wooorm/nspell/blob/main/license, „(The MIT License) Copyright (c) 2016 Titus Wormer“
- **Eignung: ja**, was die Lizenz angeht. Ob nspell die Wörterbücher schnell genug verarbeitet, ist offen. Das arabische Ayaspell nutzt `FLAG long` und `AF 333`, das deutsche Wörterbuch arbeitet mit Komposita-Regeln. Ein Lasttest im Browser steht noch aus.

### 9b. de_DE – igerman98 / LibreOffice „de_DE_frami“ / npm `dictionary-de`
- **Primärquellen:** https://www.j3e.de/ispell/igerman98/ (neuestes Archiv `igerman98-20161207`); LibreOffice `de/README_de_DE_frami.txt` und `de/README_extension_owner.txt` (https://github.com/LibreOffice/dictionaries/tree/master/de); https://github.com/wooorm/dictionaries/blob/main/dictionaries/de/license
- **Lizenz (wörtlich):**
  - frami-README: „Das Wörterbuch und alle enthaltenen Wortlisten sind lizenziert unter der GNU GPL, Version 2 oder 3.“
  - Extension-README: „License: GNU GPL Version 2 or GPL Version 3 or OASIS 0.1“ (de-DE_frami, Version 2017-01-09, auf Basis von igerman98 2016-12-07)
  - igerman98 (Autor Björn Jacke): „the hunspell part of igerman98 is dual licensed. As before it's under GPL but alternatively you can use a OASIS distribution license agreement, which allows you to distribute an unmodified version of it if the program you distribute uses the OpenDocument format as default format for saving documents“
  - `dictionary-de` 3.0.0: „(GPL-2.0 OR GPL-3.0)“, „Copyright (C) 1999-2016 Björn Jacke“
- **Bedingungen:** GPL: Lizenztext beilegen und Quelltext anbieten (Quelle sind die igerman98-Archive). Bearbeitungen stehen wieder unter GPL. Die OASIS-Alternative greift nur bei Programmen, die OpenDocument als Standard-Speicherformat nutzen. Das trifft auf die Web-App nicht zu.
- **Eignung: nein** für die Auslieferung in der App (GPL steht nicht auf der Liste erlaubter Lizenzen). **Ja als lokales Werkzeug**, etwa um erzeugte deutsche Texte im Build mit dem Hunspell-CLI zu prüfen. Das juristische Risiko einer Auslieferung als reine Datei wäre eher gering, weil die App das Wörterbuch nur als Daten lädt und es kein abgeleitetes Werk wird. Es würde aber eine eigene Entscheidung erfordern.
- **Alternative:** `german-pos-dict` (LanguageTool, siehe 13) steht unter CC BY-SA 4.0. Oder man verzichtet im Client auf eine allgemeine Rechtschreibprüfung und vergleicht nur mit den erwarteten Antworten (fastest-levenshtein).

### 9c. tr_TR – LibreOffice = tdd-ai/hunspell-tr
- **Primärquellen:** LibreOffice `tr_TR/README.txt` und `tr_TR/LICENSE`; https://github.com/tdd-ai/hunspell-tr (LICENSE: „Mozilla Public License Version 2.0“)
- **Lizenz (wörtlich):** „Hunspell dictionary for Turkish language developed by Turkish Data Depository group – Version 1.1.1 (Dec 30, 2023) – This dictionary is licensed under MPL 2.0 License.“
- **Bedingungen:** MPL-2.0 §3.1/§3.2: Die Dateien `.dic` und `.aff` (Quellform) unter MPL-2.0 weitergeben und den Lizenztext beilegen. Änderungen an diesen Dateien stehen wieder unter MPL-2.0 (Copyleft je Datei). Die App selbst bleibt als „Larger Work“ (§3.3) frei lizenzierbar.
- **Namensnennung:** „Türkisches Rechtschreibwörterbuch: hunspell-tr, Turkish Data Depository (tdd.ai): Ali Safaya, Arda Göktoğan, Deniz Yuret, Emirhan Kurtuluş, Taner Sezer – MPL 2.0 – https://github.com/tdd-ai/hunspell-tr“
- **Eignung: mit Auflagen**, denn MPL-2.0 ist erlaubt.

### 9d. npm `dictionary-tr` (hrzafer/hunspell-tr)
- **Version:** 2.0.0 vom 03.11.2023. Quelle laut README: OpenOffice-Erweiterung „turkish-spellcheck-dictionary“.
- **Primärquelle:** https://github.com/wooorm/dictionaries/blob/main/dictionaries/tr/license und https://github.com/hrzafer/hunspell-tr (LICENSE)
- **Lizenz (wörtlich):** „The MIT License (MIT) – Copyright (c) 2014 Harun Reşit Zafer“
- **Eignung: ja.** Die Lizenz ist einfacher als bei der MPL-Fassung. In der TDD-Auswertung hat hrzafer die höhere Fehlererkennung, die TDD-Fassung schneidet bei der Korrekturgenauigkeit besser ab.

### 9e. ar – Ayaspell
- **Primärquellen:** https://github.com/linuxscout/ayaspell/blob/master/COPYING; https://sourceforge.net/projects/ayaspell/; Debian `hunspell-ar` copyright (https://metadata.ftp-master.debian.org/changelogs/main/h/hunspell-ar/stable_copyright); LibreOffice `ar/README_ar.txt` und `ar/description.xml` (Version 3.5)
- **Lizenz (wörtlich, COPYING):** „GPL 2.0/LGPL 2.1/MPL 1.1 tri-license – The contents of this software may be used under the terms of the GNU General Public License Version 2 or later (the "GPL"), or the GNU Lesser General Public License Version 2.1 or later (the "LGPL") the Mozilla Public License Version 1.1 or later (the "MPL").“ Debian: „Copyright: 2006-2008 Mohamed Kebdani – License: GPL-2+ or LGPL-2.1+ or MPL-1.1“
- **Bedingungen:** Wegen „MPL 1.1 or later“ darf die App die Dateien **unter MPL-2.0** nutzen. Es gelten dann dieselben Pflichten wie bei 9c.
- **Namensnennung:** „Arabisches Rechtschreibwörterbuch: Ayaspell (Taha Zerrouki, Mohamed Kebdani), genutzt unter der Mozilla Public License 2.0 (Wahl nach MPL 1.1 or later) – https://github.com/linuxscout/ayaspell“
- **Eignung: mit Auflagen.** Die Wahl von MPL-2.0 im Lizenzverzeichnis ausdrücklich festhalten. Fachlich gilt: Ayaspell prüft Hocharabisch ohne Vokalzeichen, Tashkīl wird nicht geprüft.

## 10. LanguageTool

- **Version:** 6.8 vom 05.05.2026, laut `languagetool-standalone/CHANGES.md`. 6.9 ist noch nicht veröffentlicht. Maven Central meldet als `latestVersion` noch 6.6; der Index ist vermutlich veraltet.
- **Primärquelle:** https://github.com/languagetool-org/languagetool/blob/master/COPYING.txt und README
- **Lizenz (wörtlich):** „Unless otherwise noted, this software – the LanguageTool core – is distributed under the LGPL“; COPYING.txt: „GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999“. Der Python-Wrapper `language_tool_python` 3.4.0 steht unter `GPL-3.0-only`.
- **Sprachen:** Es gibt Module für `de`, `ar` und `de-DE-x-simple-language`, aber **kein Modul für Türkisch**.
- **Eignung: mit Auflagen – nur lokal.** Den Java-Server lokal oder im CI starten, um erzeugte deutsche (und eingeschränkt arabische) Texte zu prüfen. Weder ausliefern noch die öffentliche API mit Lerninhalten nutzen; lokal betreiben bringt Datensparsamkeit und keine Kontingentgrenzen.

## 11. Mishkal

- **Version:** README nennt „Release 1.10 Bouira“; PyPI `mishkal` 0.4.1 vom 05.07.2021.
- **Primärquelle:** https://github.com/linuxscout/mishkal/blob/master/LICENSE und README („This program is licensed under the GPL License“)
- **Lizenz (wörtlich):** „GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007“. Die Abhängigkeiten `pyarabic`, `arramooz-pysqlite`, `qalsadi` und weitere stehen laut PyPI ebenfalls unter „GPL“.
- **Eignung: mit Auflagen – nur lokal.** Als Hilfe zur Vokalisierung oder Gegenprüfung beim Erzeugen. Die Ausgaben (vokalisierte Sätze) fallen im Regelfall nicht unter die GPL. **Nicht** das Lexikon (arramooz) in größerem Umfang in App-Daten übernehmen, das wäre eine Weitergabe von GPL-Daten. Jede Vokalisierung fachlich prüfen lassen, denn die Fehlerquote ist bekannt nicht null.

## 12. CAMeL Tools

- **Version:** 1.6.0 vom 08.06.2026 (PyPI). Datenkatalog: https://raw.githubusercontent.com/CAMeL-Lab/camel-tools-data/main/catalogue-1.6.json
- **Primärquelle:** https://github.com/CAMeL-Lab/camel_tools/blob/master/LICENSE: „MIT License – Copyright 2018-2026 New York University Abu Dhabi“
- **Daten-Lizenzen (aus catalogue-1.6.json):**
  - `morphology-db-msa-r13` 0.4.0, `disambig-mle-calima-msa-r13` 0.2.5, `morphology-db-egy-r13`, `disambig-mle-calima-egy-r13`: **GPL v2**
  - `morphology-db-msa-s31` 0.4.2: **LDC**. Braucht eine LDC-Lizenz (SAMA) und **darf ohne sie nicht genutzt werden**.
  - `morphology-db-glf-01`, `morphology-db-lev-01`: CC BY 4.0
  - `disambig-bert-unfactored-*`, `dialectid-model6/26`: MIT
  - `ner-arabert`, `sentiment-analysis-arabert`: „AraBERT“ (eigene Lizenz, nicht geprüft)
  - `sentiment-analysis-mbert`: Apache 2.0
- **Eignung: mit Auflagen – nur lokal.** Den Code (MIT) könnte man ausliefern. Die für Hocharabisch nötigen Morphologie-Daten sind aber GPL v2 oder LDC. Deshalb nur als Prüfwerkzeug nutzen (Lemma, Wurzel, Wortart prüfen). Nur `morphology-db-msa-r13` verwenden, `msa-s31` nicht. Keine Lexikon-Auszüge ausliefern.

## 13. Zemberek-NLP

- **Version:** 0.17.1 vom 23.07.2019 laut README. Java-Port für Python: `zemberek-python` 0.2.3 vom 02.01.2023, „Apache License 2.0“.
- **Primärquelle:** https://github.com/ahmetaa/zemberek-nlp/blob/master/LICENSE: „Copyright 2018 Ahmet A. Akın, Mehmet D. Akın – Licensed under the Apache License, Version 2.0“. README: „Code is licensed under Apache License, Version 2.0“.
- **Eignung: ja.** Lokal als Prüfwerkzeug für Türkisch (Morphologie, Rechtschreibung), weil LanguageTool kein Türkisch kann. Die Lizenz würde auch eine Auslieferung erlauben, das Werkzeug ist aber Java und wird seit 2019 nicht mehr gepflegt.

## 14. Zusatz: german-pos-dict (LanguageTool)

- **Primärquelle:** https://github.com/languagetool-org/german-pos-dict (LICENSE: „Attribution-ShareAlike 4.0 International“)
- **Inhalt:** Morfologik-Binärdateien mit deutschen Vollformen und POS-Tags. Exportierbar nach https://dev.languagetool.org/developing-a-tagger-dictionary#exporting-the-data.
- **Eignung: mit Auflagen** (CC BY-SA 4.0: Namensnennung, Bearbeitungen wieder unter CC BY-SA). Kommt als lizenzkonforme Quelle für deutsche Wortlisten im Client infrage, anstelle von igerman98. Ob sich die Daten als Rechtschreiblexikon eignen, ist noch offen.

---

## Nur lokal (nicht ausliefern)

- LanguageTool (LGPL-2.1) mit `language_tool_python` (GPL-3.0-only)
- Mishkal (GPL-3.0) samt pyarabic, arramooz und qalsadi (GPL)
- CAMeL Tools mit den Daten `morphology-db-msa-r13` und `disambig-mle-calima-msa-r13` (GPL v2); `msa-s31` (LDC) gar nicht verwenden
- Hunspell de_DE (igerman98 / frami / `dictionary-de`, GPL-2.0/3.0)
- Hunspell-CLI selbst (MPL/GPL/LGPL), falls lokal zur Prüfung genutzt
- `sharp` mit libvips (LGPL-3.0-or-later): nur als Build-Abhängigkeit von transformers.js, nicht in Client oder Funktionen bündeln
- Zemberek: Die Lizenz ist frei (Apache-2.0); es läuft trotzdem sinnvoll nur lokal

## Auslieferbar (Lizenzverzeichnis /lizenzen ergänzen)

Whisper (MIT, OpenAI), ONNX-Fassungen (Apache-2.0/MIT), transformers.js (Apache-2.0) mit jinja (MIT) und tokenizers (Apache-2.0), onnxruntime-web (MIT + ThirdPartyNotices, Eigen MPL-2.0) mit long, platform, protobufjs, flatbuffers und guid-typescript, ts-fsrs (MIT), idb (ISC), fastest-levenshtein (MIT), Noto Sans Arabic (OFL-1.1), nspell (MIT), dictionary-tr (MIT) oder hunspell-tr TDD (MPL-2.0), Ayaspell (MPL-2.0 nach Wahl).

## Offene Fragen

1. Whisper hat zwei Lizenzangaben: MIT auf GitHub, Apache-2.0 auf der HF-Card. Beide sind erlaubt. Der Vorschlag ist, beide Texte im Verzeichnis zu nennen. Soll das so in ENTSCHEIDUNGEN festgehalten werden?
2. Die onnx-community-Repos haben kein Lizenzfeld. Sollen wir auf die Xenova-Repos mit ausdrücklichem `apache-2.0` ausweichen, oder bei onnx-community bleiben und die Lizenz ableiten?
3. Wo werden die Modellgewichte gehostet? whisper-base q8 umfasst etwa 77 MB, whisper-small q8 etwa 249 MB. Laut Vercel-Limits-Seite gilt für Static-File-Uploads 100 MB (Hobby) bzw. 1 GB (Pro); das betrifft nach Seitenangabe den Upload-Weg, für Git-Builds gilt die Build-Grenze von 1 GB. Welcher Weg bei einem Vercel-Git-Build greift und ob Blob/CDN nötig wird, ist noch offen. Das Hosten auf huggingface.co scheidet aus Datenschutzgründen aus.
4. Wie gut erkennen whisper-base und -small Arabisch und Türkisch? Die Erkennung ist deutlich schwächer als bei Englisch. Für Ausspracheübungen ist ein Praxistest nötig.
5. Ist nspell mit den Wörterbüchern Ayaspell (ar) und hunspell-tr im Browser schnell genug (Ladezeit, Speicher)?
6. Deutsche Rechtschreibprüfung im Client: auf igerman98 (GPL) verzichten und german-pos-dict (CC BY-SA 4.0) nehmen, oder nur gegen die erwarteten Antworten prüfen?
7. Türkisches Wörterbuch: `dictionary-tr` (MIT, hrzafer) oder TDD hunspell-tr (MPL-2.0, bessere Korrekturen)?
8. Mindestreife von Versionen: idb 8.0.4 und transformers.js 4.3.1 sind erst 10 Tage alt. transformers.js 4.3.x hängt an einem Dev-Build von onnxruntime-web. Welche Version wird festgelegt?
9. AraBERT-Lizenz bei CAMeL Tools (`ner-arabert`, `sentiment-analysis-arabert`): nicht geprüft und nicht benötigt. Falls doch genutzt, muss sie gesondert geprüft werden.
10. Zemberek-Lexikon: Die README nennt nur „Code“ als Apache-2.0. Die Wörterbuchdateien liegen zwar im selben Repo unter derselben LICENSE, ihre Herkunft ist aber nicht dokumentiert. Das betrifft nur den lokalen Einsatz.
