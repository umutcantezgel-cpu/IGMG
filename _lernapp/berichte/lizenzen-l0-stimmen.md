<!-- Lizenzprüfung L0 (Workflow wf_cf9ab8d3-fce, 16.10.2026). Arabische Schrift entfernt. -->

# Lern-App L0 – Lizenzprüfung TTS-Stimmen (Deutsch, Türkisch, Hocharabisch mit Vokalisierung)

Stand der Prüfung: 16.10.2026. Geprüft wurden die Primärquellen: MODEL_CARD-Dateien, LICENSE-Dateien, README-Dateien und Hugging-Face-Metadaten. Abgerufen wurde per HTTP direkt bzw. über WebFetch. Alles wurde nur gelesen, im Repository wurde nichts geändert.

Einsatzrahmen: öffentliche, kostenlose und werbefreie Lern-App eines gemeinnützigen Moscheevereins. Die Auslieferung läuft über Vercel, Audio wird offline auf den Geräten gespeichert.
Zulässig für ausgelieferten Code sind MIT, Apache-2.0, BSD, ISC, MPL-2.0 und OFL. Für Daten sind CC0, CC BY und CC BY-SA zulässig.
GPL/LGPL ist nur für Werkzeuge erlaubt, die lokal beim Erzeugen laufen und nicht ausgeliefert werden.

---

## 1. Kurzfazit und Empfehlung je Sprache

**Architekturentscheidung (Voraussetzung für alle Empfehlungen):**
Die Audiodateien werden beim Erzeugen lokal gerendert, ausgeliefert werden nur Opus- oder MP3-Dateien plus Namensnennung.
Es gibt keine TTS-Engine im Browser. Piper, Kokoro und Coqui phonemisieren mit espeak-ng (GPL-3.0-or-later).
Eine Browser-Engine (WASM) würde GPL-Code ausliefern und widerspräche damit der Lizenzpolitik. Als reines Erzeugungswerkzeug ist GPL zulässig.

| Sprache | Empfehlung (1. Wahl) | Ersatz / Übergang | Nicht verwenden |
|---|---|---|---|
| **Deutsch** | **Coqui-Modell `tts_models/de/thorsten/vits`**. Es ist Apache-2.0-lizenziert und wurde auf CC0-Daten von Thorsten Müller von Grund auf trainiert, laut Coqui-Rezept `recipes/thorsten_DE/vits_tts`. Die Stimme ist dieselbe wie bei Piper-Thorsten, aber die Herkunftskette ist sauber. | **Piper `de_DE-mls-medium`** (CC BY 4.0, von Grund auf trainiert, 236 LibriVox-Sprecher, Namensnennung nötig). Ebenfalls möglich: `Thorsten-Voice/Kokoro` (Apache-2.0, CC0-Daten) mit Auflagen. | Piper `thorsten-*`, `kerstin`, `karlsson`, `pavoque`: Die Basis lessac ist nur für Forschung lizenziert, ryan steht unter CC BY-NC-SA 4.0, pavoque unter NC-SA. |
| **Türkisch** | **Eigene Stimme**: Ein Sprecher oder eine Sprecherin der Gemeinde wird aufgenommen (schriftliche Einwilligung, Freigabe als CC0). Trainiert wird mit piper1-gpl als lokalem Werkzeug. | Coqui `tts_models/tr/common-voice/glow-tts` mit HiFi-GAN: MIT, Common-Voice-Daten unter CC0, vorher Hörprobe. Oder **Chatterbox Multilingual** (MIT) mit Auflagen. | Piper `tr_TR-dfki-medium` (NC-SA plus lessac). `fahrettin`/`fettah` wurden am 30.12.2025 auf Wunsch der Beitragenden entfernt. MMS-TTS (NC), XTTS (CPML), Kokoro-Türkisch (Daten von YouTube abgegriffen). |
| **Hocharabisch (vokalisiert)** | **Eigene Piper-Stimme trainieren** auf **ClArTTS** (CC BY 4.0, ca. 12 h, klassisches Arabisch, ein Sprecher, *voll vokalisiert*) oder auf dem **Arabic Speech Corpus** (CC BY 4.0, voll vokalisiert, MSA). Das passt zu espeak-ng, das laut Doku „Only fully diacritized Arabic“ verarbeitet. Noch besser für die Rechtekette: eigene Aufnahme (CC0). | **Chatterbox Multilingual** (MIT, Arabisch). Das Vokabular enthält die Harakat; *vorher Vokalisierungstest*. | Piper `ar_JO-kareem` (Datenquelle ohne Lizenz, lessac-Basis). MMS-TTS-ara (NC, verwirft Harakat). ArTST (NC, ohne Diakritika trainiert). XTTS-v2 (CPML). Klaam (keine Gewichte veröffentlicht). |

**Hinweis Koran-Arabisch:** Für Koranverse ist TTS ungeeignet (Tadschwid, Würde des Textes). Dafür gehören lizenzierte menschliche Rezitationen in einen eigenen Prüfbereich. TTS nur für Lernwortschatz, Sätze und Übungen verwenden.

---

## 2. Grundsatzfragen

### 2.1 Sind erzeugte Audiodateien frei nutzbar?
- **Engine-Code (GPL/MIT):** Die Ausgabe eines Programms fällt grundsätzlich nicht unter die Lizenz des Programmcodes (GPL-FAQ #GPLOutput, #WhatCaseIsOutputGPL, https://www.gnu.org/licenses/gpl-faq.html). *gnu.org war beim Abruf am 16.10.2026 nicht erreichbar (503 bzw. Verbindungsabbruch). Die Aussage ist hier sinngemäß wiedergegeben und sollte noch einmal gegengelesen werden.*
- **Gewichte und Trainingsdaten:** Ob synthetisches Audio ein „abgeleitetes Werk“ der Gewichte oder der Trainingsaufnahmen ist, ist rechtlich ungeklärt.
  - **Konservative Linie (empfohlen):** Die Bedingungen der Gewichte *und* der Trainingsdaten werden auf das Audio übertragen. Bei CC BY gibt es Namensnennung im Impressum bzw. auf der Quellenseite der App. Bei SA steht das Audio unter CC BY-SA. Bei NC wird nicht verwendet.
  - Piper sagt selbst (`piper1-gpl/docs/VOICES.md`): *„The `MODEL_CARD` file for each voice contains important licensing information. Piper is intended for personal use and text to speech research only; we do not impose any additional restrictions on voice models. Some voices may have restrictive licenses, however, so please review them carefully!“*
- **Feinabstimmungs-Kette:** Fast alle Piper-Stimmen für de, tr und ar sind von **`en_US-lessac`** oder **`en_US-ryan`** aus weitertrainiert. Damit stecken in den Gewichten auch Parameter aus diesen Basisdaten.
  - **lessac (Blizzard 2013):** Lizenz ist ein *Research Licence Agreement*: *„"Research Purposes" means only those purposes associated with research and exploration … and for the avoidance of doubt excludes … developing, adapting, amending or otherwise using the Materials for any commercial purpose, including the development … of voice synthesis … products or services“* sowie *„non-exclusive and non-transferable licence, without the right to sub-licence, to use the Materials exclusively for Research Purposes only“*. Quelle: https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html
  - **ryan (RyanSpeech):** CC BY-NC-SA 4.0, laut MODEL_CARD `en/en_US/ryan/*`.
  - Folge: Jede Stimme „Finetuned from … lessac/ryan“ hat eine Rechtekette, die nicht zu CC0, CC BY oder CC BY-SA passt. Bewertung: **nein**, sofern eine saubere Alternative existiert.

### 2.2 Gilt „gemeinnützig, kostenlos, werbefrei“ als nicht-kommerziell (NC)?
- **CC BY-NC 4.0, §1(i):** *„NonCommercial means not primarily intended for or directed towards commercial advantage or monetary compensation.“* (https://creativecommons.org/licenses/by-nc/4.0/legalcode.en)
- **Dafür spricht:** ein gemeinnütziger Verein, keine Entgelte, keine Werbung. Das OLG Köln (31.10.2014, 6 U 60/14, Deutschlandradio) hat CC-Lizenzen als AGB behandelt. Unklarheiten gingen nach § 305c Abs. 2 BGB zulasten des Lizenzgebers, die Nutzung wurde als nicht-kommerziell behandelt.
- **Risiken:**
  1. Das LG Köln hatte in erster Instanz (5.3.2014, 28 O 232/13) eng ausgelegt („nur privat“). Die Rechtsprechung ist also uneinheitlich.
  2. Spendenaufrufe, Mitgliederwerbung oder Hinweise auf entgeltliche Kurse in oder neben der App können als mittelbarer wirtschaftlicher Vorteil gewertet werden.
  3. NC-SA (z. B. dfki, pavoque, ryan) zwingt das *Audio* unter NC-SA. Es ließe sich dann nicht mit CC-BY-SA-Inhalten der App zusammenführen und nicht von Dritten weiterverwenden.
  4. Eine spätere Ausweitung (Kooperationen, Förderprogramme, Bezahlkurse) wäre blockiert.
- **CPML (Coqui XTTS)** nennt ausdrücklich: *„Use by any charitable organization for charitable purposes“* gilt als nicht-kommerziell. Ausgenommen sind *„Use for revenue-generating activity, including projects directly funded by government grants“*.
- **Ergebnis:** Für einen gemeinnützigen e. V. ist NC *wahrscheinlich* erfüllt, aber nicht rechtssicher. Gemäß Vorgabe wird NC **nicht** verwendet, da für jede Sprache ein freier Weg existiert (siehe Empfehlung).

### 2.3 Persönlichkeitsrecht und Stimme
Die Stimmen realer Personen sind nur nutzbar, wenn diese ihre Stimme freigegeben haben.
- **Thorsten Müller:** ausdrücklich freigegeben, CC0, mit einem Motivationstext.
- **Common Voice:** Freigabe als CC0. Die Nutzungsbedingungen verbieten es, Sprecher zu identifizieren.
- **Türkische Datensätze auf HF** (`omersaidd/tts_ahmet_deniz_tur` u. a.): Hier steht wörtlich: *„veri setinin kullanım hakları Ahmet Deniz ve Youtube' a aittir“*. Die Nutzungsrechte liegen also bei Dritten. Diese Daten werden ausgeschlossen.
- **Voice-Cloning (XTTS, Chatterbox):** nur mit einer Referenzstimme, für die eine schriftliche Einwilligung vorliegt, die ausdrücklich auch KI-Synthese erfasst.

---

## 3. Posten im Einzelnen

Abkürzungen: **E** = Eignung, **NN** = Namensnennung, **SA** = ShareAlike.

### A. Engines und Werkzeuge

#### A1 rhasspy/piper (alte Piper-Engine)
- **Stand:** GitHub-Repo am 06.10.2025 archiviert. README: *„Development has moved: https://github.com/OHF-Voice/piper1-gpl“*.
- **Primärquelle:** https://github.com/rhasspy/piper/blob/master/LICENSE.md
- **Lizenz:** MIT – *„Copyright (c) 2022 Michael Hansen … Permission is hereby granted, free of charge …“*
- **Bedingungen:** Copyright-Hinweis beibehalten. Die Engine bindet espeak-ng (GPL) über piper-phonemize ein.
- **E: mit Auflagen.** Nur als lokales Werkzeug zum Rendern geeignet. Das Repo wird nicht mehr gepflegt, daher piper1-gpl bevorzugen.
- **Offen:** keine.

#### A2 OHF-Voice/piper1-gpl (aktuelle Piper-Engine, PyPI `piper-tts`)
- **Stand:** `piper-tts` 1.8.0 (PyPI, Upload 04.09.2026).
- **Primärquellen:** https://github.com/OHF-Voice/piper1-gpl/blob/main/COPYING · PyPI-Metadaten `license: GPL-3.0-or-later`
- **Lizenz:** GNU GPL v3 – *„GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007“*. README: *„A fast and local neural text-to-speech engine that embeds espeak-ng for phonemization.“*
- **Bedingungen:** GPL-Pflichten (Quellcode, Lizenztext) entstehen nur bei Weitergabe des Programms. Lokale Nutzung zum Erzeugen ist unproblematisch.
- **E: ja (nur als Werkzeug).** Das Programm wird **nicht** ausgeliefert, weder als WASM noch als Server-Funktion auf Vercel. Nur die erzeugten Audiodateien gehen raus. Es enthält auch die Trainingswerkzeuge für eine eigene Stimme.
- **Offen:** Hinweis zum Wartungszustand. Die README sagt „Looking for Maintainers“.

#### A3 espeak-ng (Phonemisierung)
- **Stand:** Release 1.52 (Dezember 2024, laut GitHub-Releases „Latest“). ChangeLog `master` führt bereits 1.53.0.
- **Primärquellen:** https://github.com/espeak-ng/espeak-ng (README „License Information“, COPYING) · https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md
- **Lizenz:** *„eSpeak NG Text-to-Speech is released under the GPL version 3 or later license.“* Zusätzlich steht `getopt.c` unter BSD-2-Clause.
- **Bedingungen:** GPL bei Weitergabe.
- **Fachlich wichtig:** In `languages.md` ist Arabisch mit Fußnote 7 markiert: *„Only fully diacritized Arabic.“* Die Inhalte müssen also voll vokalisiert sein, was die App ohnehin vorsieht. Für Sonderfälle (Hamzat al-Wasl, Sonnenbuchstaben, Pausalformen) ist eine Phonem-Eingabe mit `[[…]]` möglich.
- **E: ja (nur als Werkzeug).**
  - Nicht im Browser ausliefern: kein espeak-ng-WASM über piper-wasm, sherpa-onnx-wasm oder kokoro-js mit espeak-Fallback.
  - Nicht in einer Vercel-Funktion ausliefern.
- **Offen:** Die Qualität der arabischen Phonemisierung muss an echten Lerninhalten geprüft werden. Dafür eine Prüfliste von ca. 200 Wörtern mit Šadda, Tanwīn, Alif maqṣūra und Tāʾ marbūṭa anlegen.

#### A4 Coqui TTS (Code; Fork `coqui-tts` von idiap)
- **Stand:** `coqui-tts` 0.27.5 (PyPI). Das Original `TTS` 0.22.0 von coqui-ai ist eingestellt.
- **Primärquelle:** PyPI-Metadaten `MPL-2.0` · Modellverzeichnis `TTS/.models.json` (https://github.com/idiap/coqui-ai-TTS)
- **Lizenz:** MPL-2.0.
- **E: ja (nur als Werkzeug).** Ist auch zulässig, falls doch ausgeliefert.

### B. Piper-Stimmen (Repo `rhasspy/piper-voices`, Commit `c10ece1`, Stand 17.09.2026)

Die Repo-Kennzeichnung auf HF lautet `license: mit`. Sie gilt für die Repo-Dateien, **nicht** für die Rechte an den Trainingsdaten. Maßgeblich ist laut Piper die MODEL_CARD jeder Stimme. Die Stimmen unten sind *alle* Stimmen für de_DE, tr_TR und ar_* in `voices.json`. Für Arabisch gibt es nur ar_JO.

| Stimme | MODEL_CARD: Daten-URL | Daten-Lizenz (wörtlich) | Training (wörtlich) | E |
|---|---|---|---|---|
| ar_JO-kareem-low | github.com/AliMokhammad/arabicttstrain/ | „See URL“ | „Finetuned from U.S English lessac voice (low quality).“ | **nein** |
| ar_JO-kareem-medium | dto. | „See URL“ | „Finetuned from U.S English lessac voice (medium quality).“ | **nein** |
| de_DE-eva_k-x_low | caito.de (M-AILABS) | „See URL“ | „Trained from scratch.“ | mit Auflagen |
| de_DE-karlsson-low | caito.de (M-AILABS) | „See URL“ | „Finetuned from U.S. English Ryan voice (low quality).“ | **nein** |
| de_DE-kerstin-low | github.com/rhasspy/dataset-voice-kerstin | „CC0“ | „Finetuned from U.S. English Ryan voice (low quality).“ | **nein** |
| de_DE-mls-medium | openslr.org/94/ | „CC-BY 4.0“ | „Trained from scratch“ | **ja** (NN) |
| de_DE-pavoque-low | github.com/marytts/pavoque-data | „http://creativecommons.org/licenses/by-nc-sa/4.0/“ | „Finetuned from U.S. English Ryan voice (low quality).“ | **nein** |
| de_DE-ramona-low | caito.de (M-AILABS) | „See URL“ | „Trained from scratch.“ | mit Auflagen |
| de_DE-thorsten-low | github.com/thorstenMueller/Thorsten-Voice | „CC0“ | „Finetuned from U.S. English Ryan voice (low quality).“ | **nein** |
| de_DE-thorsten-medium | dto. | „CC0“ | „Finetuned from U.S. English lessac voice (medium quality).“ | **nein** |
| de_DE-thorsten-high | dto. | „CC0“ | „Finetuned from U.S. English lessac voice (high quality).“ | **nein** |
| de_DE-thorsten_emotional-medium | dto. | „CC0“ | „Finetuned from German thorsten voice (medium quality).“ (also mittelbar lessac) | **nein** |
| tr_TR-dfki-medium | github.com/marytts/dfki-ot-data/ | „https://creativecommons.org/licenses/by-nc-sa/4.0/“ | „Finetuned from U.S. English lessac voice (medium quality).“ | **nein** |
| tr_TR-fahrettin-medium (nur v1.0.0) | github.com/NabuCasa/voice-datasets | „CC0“ | „Finetuned from U.S. English lessac voice (medium quality).“ | **nein** (entfernt) |
| tr_TR-fettah-medium (nur v1.0.0) | dto. | „CC0“ | dto. | **nein** (entfernt) |
| *Basis* en_US-lessac-* | cstr.ed.ac.uk Blizzard 2013 | Research Licence (s. 2.1) | „Trained from scratch.“ | (Basis) |
| *Basis* en_US-ryan-* | kaggle roholazandie/ryanspeech | „CC BY-NC-SA 4.0“ | low/high „Trained from scratch.“, medium „Finetuned from … lessac“ | (Basis) |

Begründungen und Bedingungen je Stimme:

- **ar_JO-kareem (low/medium):**
  - Das verlinkte Repo `AliMokhammad/arabicttstrain` (Branch master, Titel „Arabic TTS Model based on Transformer“) hat **keine LICENSE-Datei und keine Lizenzangabe**. Der Ordner `dataset/` enthält `wavs/` und `metadata.csv` ohne Herkunftsangabe.
  - Die Trainingstexte im Checkpoint (`rhasspy/piper-checkpoints`, `ar/ar_JO/kareem/medium/dataset.jsonl.gz`, 2225 Sätze) sind voll vokalisiertes klassisches Arabisch. Das ist **nicht** der Arabic Speech Corpus (1813 Sätze, MSA). Die Herkunft der Aufnahmen ist also unbekannt.
  - Dazu kommt die lessac-Basis (nur Forschung).
  - Fachlich wäre die Stimme gut geeignet, weil sie auf Vokalisierung trainiert ist. Rechtlich ist sie **nicht** freigebbar.
  - Offen: Anfrage bei AliMokhammad und Michael Hansen nach Herkunft und Lizenz der Aufnahmen.
- **de_DE-mls-medium:**
  - Wurde von Grund auf auf MLS trainiert. OpenSLR SLR94 nennt *„License: CC BY 4.0“* und *„derived from read audiobooks from LibriVox“*.
  - Die Rechtekette ist sauber. Es sind 236 Sprecher, Qualität „medium“ mit 22,05 kHz. Geeignete Sprecher-IDs muss man per Hörprobe auswählen.
  - **NN-Vorschlag:** „Deutsche Sprachausgabe: Piper-Stimme de_DE-mls-medium (rhasspy/piper-voices), trainiert auf Multilingual LibriSpeech (MLS), Pratap et al. 2020, Lizenz CC BY 4.0, https://openslr.org/94/ – Aufnahmen: LibriVox-Freiwillige.“
  - Kein SA.
- **de_DE-eva_k-x_low / de_DE-ramona-low:**
  - Von Grund auf auf M-AILABS trainiert. Die Seite caito.de war am 16.10.2026 **nicht erreichbar** (DNS-Fehler).
  - Laut Spiegeln der Datensatzbeschreibung: *„The audio was recorded by the LibriVox project and is also in the public domain – except for Ukrainian.“* Die M-AILABS-Lizenz beginnt mit *„Copyright (c) 2017-2019 by the original creators @ M-AILABS with the following license“*. Laut Sekundärquelle ist sie BSD-3-Clause-ähnlich.
  - Auflage: Copyright-Hinweis von M-AILABS in der Quellenliste.
  - Die Qualität ist gering (x_low/low, 16 kHz) und für eine Aussprache-Lern-App kaum geeignet. Daher nur „mit Auflagen“.
  - Offen: genauen M-AILABS-Lizenztext aus einem Datensatzarchiv (`info.txt`/LICENSE) sichern.
- **thorsten (low/medium/high/emotional):**
  - Die Daten stehen unter CC0 (HF `Thorsten-Voice/TV-44kHz-Full`: `license: CC0`; README: *„Obviously again in CC0 license!“*).
  - Die Piper-Gewichte sind aber von ryan (low) bzw. lessac (medium/high) aus weitertrainiert.
  - Das HF-Repo `Thorsten-Voice/Piper` (Kennzeichnung MIT) enthält **bitgleiche** ONNX-Dateien (gleiche SHA-256 wie in piper-voices). Die Kennzeichnung MIT ändert also nichts an der Kette.
  - → Stattdessen Coqui-Thorsten-VITS verwenden (C3).
- **kerstin, karlsson, pavoque:** Basis ist ryan (NC-SA). pavoque hat zusätzlich NC-SA-Daten (`marytts/pavoque-data` README: *„This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License“*).
- **tr_TR-dfki-medium:** Die Daten stehen unter NC-SA (`marytts/dfki-ot-data` README, gleicher Wortlaut wie bei pavoque), dazu kommt die lessac-Basis.
- **tr_TR-fahrettin / fettah:**
  - Die Daten (NabuCasa) stehen unter CC0, die Basis ist lessac.
  - Sie wurden aus dem Repo entfernt. HF-Commit vom 30.12.2025: *„Remove fahrettin and fettah voices at request of contributors“*. Kopien bei Dritten (z. B. `speaches-ai/piper-tr_TR-fettah-medium`) **nicht** verwenden.
- **Community-Piper-Stimmen ohne Herkunftsangabe → nein:** `neurlang/piper-onnx-zayd0-arabic-diacritized` (MIT-Kennzeichnung, keine Datenangabe), `vadimbelsky/arabic-emirati-female-piper` (MIT, keine Datenangabe, Dialekt), `dcx514ai/piper_tts_turkish_*` (MIT bzw. CC BY 4.0, Sprecher „Cem“ ohne Quelle), `99eren99/piper-turkish-tts` (keine Lizenz).

### C. Alternativen

#### C1 MMS-TTS (Meta) – `facebook/mms-tts-ara`, `-deu`, `-tur`
- **Stand:** HF, letzte Änderung 01.09.2023.
- **Primärquellen:** https://huggingface.co/facebook/mms-tts-ara (README „License“) · https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md
- **Lizenz:** *„The model is licensed as CC-BY-NC 4.0.“* sowie *„The MMS code and model weights are released under the CC-BY-NC 4.0 license.“*
- **Bedingungen:** NN, nur nicht-kommerziell.
- **E: nein.**
  - Erstens NC (siehe 2.2).
  - Zweitens, fachlich entscheidend: Das Vokabular von `mms-tts-ara` (`vocab.json`, 39 Zeichen) enthält **keine Harakat** (U+064B–U+0652 fehlen). Die Vokalisierung wird also verworfen und ist nicht steuerbar.
  - Laut MMS-Paper (arXiv 2305.13516) bestehen die Trainingsdaten überwiegend aus Lesungen des Neuen Testaments. Das ist kein Lizenzpunkt, aber für eine Moscheegemeinde ein inhaltlicher Hinweis.

#### C2 Coqui XTTS-v2
- **Stand:** HF `coqui/XTTS-v2`, letzte Änderung 11.12.2023 (Modell v2.0.3). Coqui hat den Betrieb eingestellt. Die Lizenz-URL https://coqui.ai/cpml liefert **404** (geprüft 16.10.2026).
- **Primärquelle:** https://huggingface.co/coqui/XTTS-v2/blob/main/LICENSE.txt
- **Lizenz:** Coqui Public Model License 1.0.0 – *„This license allows only non-commercial use of a machine learning model and its outputs.“*
  - Nicht-kommerziell umfasst u. a. *„Use by any charitable organization for charitable purposes … Use for revenue-generating activity, including projects directly funded by government grants, is not a non-commercial purpose.“*
  - Die Personalnutzung schließt *„religious observance“* ein. Es gilt nur, *„so far as you do not receive any direct or indirect payment arising from the use of the model or its output“*.
- **Bedingungen:**
  - Hinweispflicht auch für **Ausgaben**: *„You must ensure that anyone who gets a copy of any part of the model, or any modification of the model, or their output, from you also gets a copy of these terms or the URL for them above.“* Da die URL tot ist, müsste der Volltext mit ausgeliefert werden.
  - Unterlizenzierung ist nicht erlaubt.
- **E: nein** (nicht in der Positivliste).
  - Theoretisch wäre es für einen gemeinnützigen e. V. ohne öffentliche Projektförderung und ohne Einnahmen aus der App erlaubt. Aber jede Förderung oder Einnahme würde es kippen.
  - Eine kommerzielle Lizenz ist nicht mehr erhältlich, weil es den Lizenzgeber nicht mehr gibt.
  - Es ist ein Voice-Cloning-Modell, braucht also eine Referenzstimme mit Einwilligung.
  - Das Vokabular enthält Harakat. Die Qualität für Arabisch ist ungeprüft.

#### C3 Coqui-Modellverzeichnis: Deutsch und Türkisch
Primärquelle: `TTS/.models.json` (https://github.com/idiap/coqui-ai-TTS/blob/dev/TTS/.models.json). Die Release-ZIPs sind unter github.com/coqui-ai/TTS/releases weiterhin abrufbar (HTTP 200).
- **`tts_models/de/thorsten/vits`:**
  - Eintrag `"license": "apache 2.0"`, `"author": "@thorstenMueller"`, HF-Spiegel `Thorsten-Voice/VITS` (`license: apache-2.0`).
  - Die Daten (Thorsten-Voice) stehen unter CC0. Das Trainingsrezept `recipes/thorsten_DE/vits_tts/train_vits.py` lädt nur den Thorsten-Datensatz, ohne Restore eines fremden Checkpoints, also von Grund auf.
  - **Bedingungen:** Apache-2.0 verlangt NOTICE und Lizenztext nur bei Weitergabe der Gewichte, und die werden nicht weitergegeben. Für das Audio gibt es keine Pflicht.
  - **NN empfohlen:** „Deutsche Sprachausgabe: Stimme Thorsten Müller (Thorsten-Voice, CC0), Modell Coqui TTS VITS (Apache-2.0).“
  - **E: ja.**
  - **Offen:** ob das veröffentlichte Modell exakt mit diesem Rezept entstand (Bestätigung durch Thorsten Müller). Vergleichshörprobe gegen Piper.
- **`tts_models/tr/common-voice/glow-tts`** mit `vocoder_models/tr/common-voice/hifigan`:
  - Beide Einträge haben `"license": "MIT"` und `"author": "Fatih Akademi"`, Beschreibung *„Turkish GlowTTS model using an unknown speaker from the Common-Voice dataset.“*
  - Common Voice steht unter CC0.
  - **E: mit Auflagen.** Die Lizenz ist sauber, aber das Modell ist alt (Release v0.6.1). Qualität und Verständlichkeit sind unbekannt, daher ist eine Hörprobe Pflicht. Die Sprecheridentität ist unbekannt, aber per CC0 freigegeben.
  - **Offen:** Die Zuordnung des Sprechers zu einer konkreten Common-Voice-Version ist undokumentiert.
- *Weitere:* `de/css10/vits-neon` (bsd-3-clause) wurde nicht vertieft geprüft. `multilingual/your_tts` ist CC BY-NC-ND 4.0 → nein.

#### C4 Kokoro-82M (hexgrad) und Ableger
- **Stand:** HF `hexgrad/Kokoro-82M`, letzte Änderung 10.04.2025. PyPI `kokoro` 0.9.4 und `misaki` 0.9.4 (Apache-2.0).
- **Primärquelle:** https://huggingface.co/hexgrad/Kokoro-82M
- **Lizenz:** `license: apache-2.0`, *„With Apache-licensed weights, Kokoro can be deployed anywhere from production environments to personal projects.“*
- **Daten:** *„Kokoro was trained exclusively on permissive/non-copyrighted audio data … Synthetic audio generated by closed TTS models from large providers“*.
- **Sprachen offiziell:** en, es, fr, hi, it, ja, pt-BR, zh. **Kein de, tr oder ar.**
- **E: nein** für das Basismodell, weil die Sprachen fehlen.
- **`Thorsten-Voice/Kokoro`:**
  - Deutsch, Apache-2.0, Stand 26.07.2026. *„Fine-tuned on the Thorsten-Voice dataset (CC0 / public domain)“*. Braucht die Forks `semidark/misaki` und `semidark/kokoro`, dazu espeak-ng als Werkzeug.
  - **E: mit Auflagen.** Restrisiko: Die Kokoro-Basis enthält synthetisches Audio aus geschlossenen Anbieterdiensten, deren AGB das Training eventuell untersagen. Das ist kein Lizenz-, aber ein Herkunftsrisiko.
- **`kikiri-tts/kikiri-german-martin` und `-victoria`** (Apache-2.0): Die Sprecher sind laut Karte „(synthetic)“, die Herkunft der Synthese ist unbekannt. **E: unklar.**
- **`duxx/kikiri-turkish-base`** (Kennzeichnung CC BY-SA 3.0):
  - Die Quelldaten `afkfatih/turkish-tts-combined-raw` vereinen u. a. `omersaidd/tts_mazlum_kiper_tur`, `tts_nisan_kumru_tur` und `tts_ahmet_deniz_tur`.
  - Letzteres sagt: *„çeşitli kaynaklardan elde ettiğim videoları … veri setinin kullanım hakları Ahmet Deniz ve Youtube' a aittir“*. Das sind von YouTube abgegriffene Stimmen realer Personen.
  - **E: nein.**

#### C5 MeloTTS (MyShell)
- **Primärquelle:** https://github.com/myshell-ai/MeloTTS (LICENSE, README)
- **Lizenz:** MIT – *„This library is under MIT License, which means it is free for both commercial and non-commercial use.“*
- **Sprachen:** EN (mehrere Akzente), ES, FR, ZH, JP, KR. **Kein de, tr oder ar.**
- **E: nein** (Sprachabdeckung). Wäre allenfalls ein Trainingsrahmen, aber Piper ist dafür besser dokumentiert.

#### C6 ArTST (MBZUAI) und `MBZUAI/speecht5_tts_clartts_ar`
- **Primärquellen:** https://huggingface.co/MBZUAI/ArTST · https://huggingface.co/MBZUAI/speecht5_tts_clartts_ar · https://github.com/mbzuai-nlp/ArTST
- **Lizenz:** `license: cc-by-nc-4.0` (alle ArTST-Varianten v1, v1.5, v2, v3 und die TTS-Karte).
- **E: nein.**
  - NC.
  - Die TTS-Karte sagt *„ArTST is trained without diacritics.“* Damit ist die Vokalisierung nicht steuerbar.
  - Die Vortrainingsdaten (MGB2/QASR, Al Jazeera) stehen unter Forschungslizenzen.
- **Nebenbefund:** Der TTS-Datensatz **ClArTTS** selbst steht unter **CC BY 4.0** (siehe D1) und ist frei nutzbar.

#### C7 Klaam (ARBML)
- **Primärquelle:** https://github.com/ARBML/klaam (LICENSE, README)
- **Lizenz:** MIT – *„Copyright (c) 2021 ARBML“*.
- **TTS:** FastSpeech2 (Fork ming024) mit HiFi-GAN. Trainiert wird auf dem Arabic Speech Corpus (`wget http://en.arabicspeechcorpus.com/arabic-speech-corpus.zip`).
- **Gewichte:** Der Link in der Modelltabelle ist **leer** (`[fastspeech2]()`), es gibt also kein veröffentlichtes TTS-Gewicht.
- **E: nein** als fertiges Modell. Es ist allenfalls ein Trainingsrezept (MIT plus CC-BY-4.0-Daten). Piper ist dafür einfacher.

#### C8 Chatterbox Multilingual V3 (Resemble AI) – zusätzlich geprüft
- **Stand:** HF `ResembleAI/chatterbox`, letzte Änderung 10.06.2026. PyPI `chatterbox-tts` 0.1.7.
- **Primärquellen:** https://huggingface.co/ResembleAI/chatterbox · https://github.com/resemble-ai/chatterbox/blob/master/LICENSE
- **Lizenz:** MIT – *„Copyright (c) 2025 Resemble AI“*. Die Karte nennt *„Licensed under MIT“*.
- **Sprachen:** u. a. *„Arabic, … German, … Turkish“*. Das Vokabular `grapheme_mtl_merged_expanded_v1.json` enthält Fatḥa, Ḍamma, Kasra, Šadda, Sukūn, Tanwīn und Dagger-Alif.
- **Bedingungen:**
  - MIT-Hinweis nur bei Weitergabe des Codes oder der Gewichte.
  - Jede Ausgabe trägt ein *„PerTh“*-Wasserzeichen (unhörbar). Das ist unkritisch, sollte aber in der Quellenliste offengelegt werden.
  - Es ist ein Voice-Cloning-Modell, braucht also eine Referenzaufnahme. Das darf nur eine eigene Stimme mit Einwilligung sein.
- **E: mit Auflagen.**
  - Die Lizenz ist sauber und liegt auf der Positivliste.
  - Die Trainingsdaten sind nur als *„0.5M hours of cleaned data“* beschrieben, die Herkunft ist undokumentiert (Restrisiko).
  - Disclaimer: *„Prompts are sourced from freely available data on the internet.“*
  - Die Vokalisierungstreue ist ungeprüft, weil ein LLM-artiges Modell halluzinieren oder Harakat ignorieren kann.
- **Offen:** Test mit 200 vokalisierten Minimalpaaren. Auch prüfen, ob die mitgelieferte Standardstimme (`conds.pt`) von einer realen Person stammt.

### D. Freie Datensätze für eine eigene Stimme (Piper-Training lokal)

#### D1 ClArTTS (MBZUAI) – Arabisch
- **Primärquelle:** https://huggingface.co/datasets/MBZUAI/ClArTTS
- **Lizenz:** `license: cc-by-4.0`.
- **Inhalt:** *„The speech is extracted from a LibriVox audiobook … about 12 hours of speech from a single male speaker“*. Die Stichprobe zeigt voll vokalisierten Text (z. B. „[arabische Schrift entfernt]“). Das Register ist klassisches Arabisch.
- **Bedingungen:**
  - **NN** für Modell und Audio: „Sprachdaten: ClArTTS – A. Kulkarni, A. Kulkarni, S. A. M. Shatnawi, H. Aldarmaki, Interspeech 2023, CC BY 4.0“.
  - Kein SA. Die LibriVox-Aufnahme ist laut LibriVox *„public domain (definitely in the USA …)“*.
- **E: ja.** Das ist die beste Grundlage für eine vokalisierte Hocharabisch-Stimme.
- **Offen:**
  - Welches LibriVox-Buch und welcher Sprecher. Hintergrund: Die LibriVox-Freigabe gilt sicher nur in den USA, außerhalb muss der Status des gelesenen Werks geprüft werden.
  - Der Text ist sehr klassisch, daher die Abdeckung von Alltagswortschatz (A1/A2) testen.

#### D2 Arabic Speech Corpus (Nawar Halabi) – Arabisch
- **Primärquelle:** http://en.arabicspeechcorpus.com/ (`rel="license" href="http://creativecommons.org/licenses/by/4.0/"`) · HF `halabi2016/arabic_speech_corpus` (`license: cc-by-4.0`).
- **Inhalt:** 1813 Sätze, MSA, *„recorded in south Levantine Arabic (Damascian accent)“*. Die Orthografie ist voll vokalisiert (Buckwalter).
- **Bedingungen:** NN „Arabic Speech Corpus – Nawar Halabi, University of Southampton, CC BY 4.0“.
- **E: ja.** Mit ca. 4 h ist er klein, eignet sich aber zur Ergänzung von ClArTTS oder zum Weitertrainieren.

#### D3 Thorsten-Voice (Deutsch)
- **Primärquelle:** https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full
- **Lizenz:** CC0. NN ist freiwillig, wird aber empfohlen.
- **E: ja.**

#### D4 MLS (OpenSLR 94, Deutsch)
- **Primärquelle:** https://openslr.org/94/
- **Lizenz:** CC BY 4.0. NN nötig.
- **E: ja.**

#### D5 Mozilla Common Voice (Türkisch, Deutsch, Arabisch)
- **Lizenz:** CC0 (klassische Releases). Neuere Releases über die Mozilla Data Collective tragen zusätzliche Nutzungsbedingungen, z. B. kein Re-Hosting und kein Identifizieren von Sprechern.
- **E: mit Auflagen.** Es sind Crowd-Aufnahmen mit wechselnder Qualität. Für TTS ist ein guter Einzelsprecher nötig.
- **Offen:** Wortlaut der aktuellen Bedingungen über die Data Collective prüfen.

#### D6 Eigene Aufnahme (empfohlen für Türkisch, optional für Arabisch)
- **Einwilligung:** schriftlich, mit Rechteeinräumung (CC0 oder ausschließliche Nutzungsrechte an den Verein) und ausdrücklicher Zustimmung zur KI-Sprachsynthese. Ein Widerrufsfolgen-Hinweis gehört dazu (DSGVO Art. 7 bei Stimme als personenbezogenem Datum).
- **Umfang:** ca. 2–4 h Studioaufnahme bzw. ruhiger Raum, 1500–3000 Sätze. Training mit piper1-gpl lokal.
- **Feinabstimmung:** nur von einem **sauberen** Checkpoint aus. Infrage kommen `de_DE-mls-medium` (CC BY 4.0, von Grund auf) oder `en_US-ljspeech` (MODEL_CARD: *„License: public domain … Trained from scratch“*). Nicht von lessac oder ryan aus.

---

## 4. Offene Fragen (gesammelt)

1. **kareem:**
   - Herkunft und Lizenz der Aufnahmen in `AliMokhammad/arabicttstrain` (kein LICENSE).
   - Anfrage an den Autor und Michael Hansen.
   - Ohne Antwort ist die Stimme nicht nutzbar.
2. **Ausgabe-Rechte:** Gelten die Lizenzbedingungen der Gewichte oder Trainingsdaten (CC BY, NC, Research-only) für synthetisches Audio? Klärung mit dem Rechtsberater des Vereins. Bis dahin gilt die konservative Linie aus 2.1.
3. **lessac-Kette:**
   - Bindet die Blizzard-Forschungslizenz (ein Vertrag zwischen Lessac/CSTR und dem Trainierenden) Dritte, die die Gewichte nutzen?
   - Ist ein Feinabstimmungs-Ergebnis eine Bearbeitung der Daten?
   - Ungeklärt. Daher keine lessac- oder ryan-basierten Stimmen verwenden.
4. **M-AILABS:** Den genauen Lizenzwortlaut sichern, weil caito.de nicht erreichbar war (DNS). Nur relevant, falls eva_k/ramona doch genutzt werden.
5. **Coqui Thorsten-VITS:** Bestätigen, dass das veröffentlichte Modell ohne fremden Checkpoint von Grund auf trainiert wurde. Das Rezept deutet darauf hin.
6. **Coqui tr glow-tts:** Hörprobe und Verständlichkeitstest. Welcher Common-Voice-Sprecher und welche Version.
7. **Chatterbox:**
   - Herkunft der Trainingsdaten (0,5 Mio. h) und der Standardstimme `conds.pt`.
   - Test der Vokalisierungstreue (Harakat, Šadda, Tanwīn) und der Stabilität (Halluzinationen bei kurzen Lernwörtern).
8. **ClArTTS:** Welches LibriVox-Werk und welcher Sprecher. Prüfung des Schutzstatus in DE/EU, da LibriVox nur für die USA garantiert.
9. **espeak-ng-Arabisch:** Fehlerquote der Phonemisierung bei voll vokalisierten Lerninhalten. Liste der nötigen Phonem-Overrides (`[[…]]`).
10. **NC-Frage:**
    - Würde die App künftig Spendenaufrufe, Mitgliederwerbung oder öffentliche Projektförderung enthalten bzw. erhalten?
    - Falls ja, sind auch „NC wahrscheinlich erfüllt“-Fälle (MMS, CPML) endgültig ausgeschlossen.
11. **GPL-FAQ:** Die Zitate zu „Output“ gegenlesen, weil gnu.org beim Abruf nicht erreichbar war.
12. **Kokoro-Basis:** Verstößt das Training mit synthetischem Audio „closed TTS models from large providers“ gegen deren AGB? Das ist ein Herkunftsrisiko für `Thorsten-Voice/Kokoro`.

---

## 5. Quellen (Primärquellen, abgerufen 16.10.2026)

- Piper-Stimmen: https://huggingface.co/rhasspy/piper-voices (Commit `c10ece1aade47bb51c153c893d14e5bf8e5b7117`, `voices.json`, alle `MODEL_CARD`). Tag `v1.0.0` für fahrettin/fettah. Commit-Historie (Entfernung 30.12.2025).
- Piper-Checkpoints: https://huggingface.co/datasets/rhasspy/piper-checkpoints (kareem `dataset.jsonl.gz`, `train.sh`)
- Piper-Engine: https://github.com/rhasspy/piper (LICENSE.md, archiviert 06.10.2025) · https://github.com/OHF-Voice/piper1-gpl (COPYING, README, docs/VOICES.md) · https://pypi.org/project/piper-tts/
- lessac-Lizenz: https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html
- espeak-ng: https://github.com/espeak-ng/espeak-ng (README, COPYING, docs/languages.md, Releases)
- Daten: https://openslr.org/94/ · https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full · https://github.com/thorstenMueller/Thorsten-Voice · https://github.com/marytts/dfki-ot-data · https://github.com/marytts/pavoque-data · https://github.com/rhasspy/dataset-voice-kerstin · https://github.com/AliMokhammad/arabicttstrain · https://huggingface.co/datasets/MBZUAI/ClArTTS · http://en.arabicspeechcorpus.com/ · https://huggingface.co/datasets/halabi2016/arabic_speech_corpus · https://librivox.org/pages/public-domain/ · M-AILABS (Spiegel): https://huggingface.co/datasets/gigant/m-ailabs_speech_dataset_fr, https://cisaad.umbc.edu/the-m-ailabs-speech-dataset/
- MMS: https://huggingface.co/facebook/mms-tts-ara · https://github.com/facebookresearch/fairseq/blob/main/examples/mms/README.md
- XTTS: https://huggingface.co/coqui/XTTS-v2 (LICENSE.txt)
- Coqui-Modelle: https://github.com/idiap/coqui-ai-TTS (`TTS/.models.json`, `recipes/thorsten_DE/vits_tts/train_vits.py`) · https://huggingface.co/Thorsten-Voice/VITS · https://huggingface.co/Thorsten-Voice/Piper
- Kokoro: https://huggingface.co/hexgrad/Kokoro-82M · https://huggingface.co/Thorsten-Voice/Kokoro · https://huggingface.co/duxx/kikiri-turkish-base · https://huggingface.co/datasets/afkfatih/turkish-tts-combined-raw · https://huggingface.co/datasets/omersaidd/tts_ahmet_deniz_tur
- MeloTTS: https://github.com/myshell-ai/MeloTTS
- ArTST: https://huggingface.co/MBZUAI/ArTST · https://huggingface.co/MBZUAI/speecht5_tts_clartts_ar · https://github.com/mbzuai-nlp/ArTST
- Klaam: https://github.com/ARBML/klaam
- Chatterbox: https://huggingface.co/ResembleAI/chatterbox · https://github.com/resemble-ai/chatterbox
- CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/legalcode.en
- Rechtsprechung NC (Sekundär): https://netzpolitik.org/2014/der-dritte-streich-olg-koeln-zu-deutschlandradios-nutzung-cc-lizenzierter-fotos-mit-nc-modul/ · https://www.ra-plutte.de/creative-commons-was-ist-nicht-kommerzielle-foto-nutzung/
