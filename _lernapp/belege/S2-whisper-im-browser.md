# Beleg S2 – Whisper im Browser (de, tr, ar): Laden, Speicher, Latenz, Wortfehlerquote

- **Etappe:** L0, Paket L0-06 (Spike S2; Messaufbau nur im Scratchpad, kein Code im Repository)
- **Stand:** 16.10.2026. Gemessen wurde in zwei Abschnitten (15:14–16:40 und 18:50–19:41 UTC). Dazwischen wurde die
  Arbeitsumgebung neu gestartet. Der zweite Abschnitt setzt den ersten mit denselben Skripten, Modellen und Testdaten fort;
  Skripte und Daten des ersten Abschnitts wurden vorher durchgesehen. Neu hinzu kamen synthetische Kurzsätze, ein
  Thread-Vergleich in einem Zug, WebGPU, die Wahl der ORT-Datei, eine strengere CSP und ein Kontrolllauf für das Netz.
- **Bezug:** ADR 0042 Nr. 2–6, 8–10, 12; ADR 0038 (Vorrat im Service Worker); ADR 0039 Folgen (Modelle); ADR 0040 (KI-Regel 2);
  KERN 4.0 §1 (ohne Drittanfragen), §6 (Sprachaufnahmen, CSP), §9 (Sprechmodul außerhalb der Routenbudgets); PLAN §3.2, §3.5,
  §4.1, §4.2, §5.4, §12; MENSCHEN LM-07, LM-27; ABNAHME Z-L07, Z-L08, Z-L22; Beleg S5 (Weg M1, Vorrat `igmg-lernapp-modelle`)
- **Werkzeuge:** headless Chromium 141 (`/opt/pw-browsers/chromium-1194`), Playwright-Core 1.64.0 aus `web/node_modules`,
  Node 24.21.0, `@huggingface/transformers` **4.3.0** (npm-Tarball, SHA-1 gleich `dist.shasum` der Registry, `bd838fcd2f64…`)
  mit dem von ihm gepinnten `onnxruntime-web` **1.31.0-dev.20260914-8d85527a0** (SHA-1 `b8b660a1ee7d…`), ffmpeg (lokal),
  Python 3 mit `-I`.
- **Rechner:** 4 vCPU Intel Xeon @ 2,10 GHz (ein Thread je Kern), 15 GB RAM, keine GPU, Linux. Zeitweise liefen andere Agenten
  parallel; die CPU-Fremdlast ist je Lauf mitgemessen. Im zweiten Abschnitt war derselbe Lauf etwa 1,27-mal langsamer als im
  ersten (L16 gegen L5). Verglichen wird deshalb nur innerhalb eines Abschnitts. Telefone und Geräte mit GPU standen nicht zur
  Verfügung.
- **KI-Regel 2:** Arabische Referenzsätze und Abschriften liegen nur im Scratchpad. Dieser Beleg gibt arabische Beispiele nur
  als Umschrift des Konsonantengerüsts wieder. Alle Testsätze wurden ohne Religionsbezug ausgewählt (Filter in §2).

## 1. Ziel

1. `Xenova/whisper-base` q8 (Commit `64da572`) und `Xenova/whisper-small` q8 (Commit `2d67713`) für de, tr und ar headless in
   Chromium betreiben. transformers.js läuft in einem Modul-Worker; Modelle und ORT-WASM kommen nur vom eigenen Ursprung.
2. Messen: Ladezeit, Speicher, Latenz je Satz (WASM, WebGPU soweit verfügbar), Wortfehlerquote (WER) nach Normalisierung
   (ar ohne Harakat), Fehlerbilder.
3. Belegen, dass zur Laufzeit keine Anfrage an Dritte geht (Netzprotokoll).
4. Die offenen Punkte aus ADR 0042 entscheidungsreif machen:
   - Modell je Sprache (Nr. 3, LM-27)
   - Schwellen (Nr. 6)
   - Gerätecheck (Nr. 4, LM-07)
   - COOP/COEP und CSP (Nr. 9)
   - Vorrat und Offline (Nr. 4, S5)
   - welche ORT-Datei geladen wird (offen aus S5 §3.4)

## 2. Vorgehen (Befehle)

Arbeitsverzeichnis im Scratchpad: `…/scratchpad/l0/s2/`.
- `dl/`: Fremddaten, je Quelle ein eigenes Verzeichnis
- `modelle/`: gepinnte Modelldateien
- `daten/`: 16-kHz-PCM und Referenzen
- `skripte/`: eigene Skripte; Seite und Worker unter `skripte/www/`
- `messung/`: Lauf-JSON, Server- und Fallenprotokolle

Python lief immer mit `-I`. Heruntergeladene Dateien wurden nur als Daten gelesen, nie ausgeführt.

```bash
# 2.1 Bibliotheken (npm-Tarballs; SHA-1 gegen dist.shasum der Registry geprüft)
curl -sS -f -o dl/npm-tfjs/t.tgz https://registry.npmjs.org/@huggingface/transformers/-/transformers-4.3.0.tgz
curl -sS -f -o dl/npm-ort/o.tgz  https://registry.npmjs.org/onnxruntime-web/-/onnxruntime-web-1.31.0-dev.20260914-8d85527a0.tgz
tar -xzf dl/npm-tfjs/t.tgz -C dl/npm-tfjs && tar -xzf dl/npm-ort/o.tgz -C dl/npm-ort

# 2.2 Modelle an festen Commits (q8-ONNX, Tokenizer, Konfiguration; SHA-256 in §3.1)
for f in config.json generation_config.json preprocessor_config.json tokenizer.json tokenizer_config.json \
         special_tokens_map.json added_tokens.json vocab.json merges.txt normalizer.json \
         onnx/encoder_model_quantized.onnx onnx/decoder_model_merged_quantized.onnx; do
  curl -sS -f -L -o modelle/Xenova/whisper-base/$f \
    https://huggingface.co/Xenova/whisper-base/resolve/64da57285918e20ea79ea5c88eed7197933abaa8/$f; done
#   ebenso Xenova/whisper-small an 2d67713f236afa48a18992566e7647f6ca848e13

# 2.3 Menschliches Testaudio
#  FLEURS (google/fleurs, Revision 70bb2e8, CC BY 4.0): test.tsv je Sprache, en_us.test.tsv als Filtergrundlage.
#  Das Audio-Tar läuft im Strom durch den Filter. Gespeichert werden nur die ausgewählten WAV, danach bricht der
#  Download ab (das de-Tar hat 569 MB und wurde nie gespeichert). Filter über die englische Parallelfassung:
#  keine Religions-, Alkohol- oder Mythologiebegriffe, keine Ziffern, höchstens 25 s.
curl -sS -L https://huggingface.co/datasets/google/fleurs/resolve/main/data/de_de/audio/test.tar.gz \
  | python3 -I skripte/fleurs_auswahl.py de_de dl/fleurs-tsv dl/fleurs-de_de 32         # ebenso tr_tr, ar_eg
#  Tatoeba deu: nur Aufnahmen mit Lizenz CC BY 4.0 (Sprecher MisterTrouser und Yeti), Lizenz und Attribution-URL je Datei;
#  Satzfilter gegen Religions-, Alkohol- und Gewaltbegriffe, keine Ziffern, drei Längenklassen
python3 -I skripte/tatoeba_auswahl.py <sentences_with_audio.csv> <deu_sentences.tsv> dl/tatoeba-deu/auswahl.json
curl -sS -f -L -o dl/tatoeba-deu/<audio-id>.mp3 https://tatoeba.org/audio/download/<audio-id>
python3 -I skripte/testsatz_bauen.py <basis>     # ffmpeg → 16 kHz mono float32 (daten/pcm/*.f32), daten/testsatz.json

# 2.4 Synthetisches Testaudio (nur lokal, danach gelöscht)
#  Kurze Alltagssätze tr/ar aus dem S7-Tatoeba-Auszug (CC BY 2.0 FR), jeweils mit deutscher Übersetzung.
#  Filter: Religions-, Alkohol- und Gewaltbegriffe (de und tr), S7-Liste der Koran-/Hadith-4-Gramm-Treffer,
#  negative Bewertung, Wartungs-Tags, Ziffern, Platzhalter; 3–8 Wörter.
#  de-Kontrolle: dieselben 30 Tatoeba-Sätze, die auch als echte Aufnahme vorliegen.
python3 -I skripte/synth_auswahl.py …/l0/S7 <basis>                       # → daten/synth_texte.json
#  MMS-TTS (CC BY-NC 4.0; laut Auftrag nur als lokales Testmaterial) im Browser mit transformers.js, fp32:
#  Xenova/mms-tts-deu b95ad64, Xenova/mms-tts-ara e9dd80f, payam1394/traxlate-mms-tts-tur 32a9950
#  (ONNX-Umwandlung von facebook/mms-tts-tur, Lizenzfeld cc-by-nc-4.0).
#  Arabische Eingabe ohne Harakat, weil das MMS-Vokabular keine enthält.
node skripte/synth_erzeugen.mjs 8712 8719                                 # → daten/pcm/mms-*.f32, daten/synth.json

# 2.5 Störsignale (daten/stoer.json): je 3 s Stille, weißes Rauschen −50 dBFS, Brummen −41 dBFS

# 2.6 Eigener Ursprung und Falle
node skripte/server.mjs <basis> 8711 0 messung/server-8711.log            # ohne COOP/COEP
node skripte/server.mjs <basis> 8712 1 messung/server-8712.log            # COOP same-origin + COEP require-corp
node skripte/server.mjs <basis> 8713 1 messung/server-8713.log streng     # wie 8712, worker-src/media-src ohne blob:
node skripte/falle.mjs 8719 messung/falle2.log     # Proxy für alles außer 127.0.0.1: protokolliert jede Verbindung, weist ab
#  Pfade wie geplant: /lern-app/modelle/<repo>/… und /lern-app/modelle/ort/….
#  CSP wie ADR 0042 Nr. 9: öffentliche CSP plus 'wasm-unsafe-eval', worker-src 'self' blob:, media-src 'self' blob:,
#  kein 'unsafe-eval'.

# 2.7 Läufe: Playwright startet Chromium mit der Falle als Proxy (Ausnahme nur 127.0.0.1)
node skripte/lauf.mjs '{"port":8712,"falle":8719,"modell":"Xenova/whisper-base","threads":2,"sprachen":["de","tr","ar"],
                        "aus":"messung/L5-base-coi2-wdh.json"}'
#  Die Seite startet einen Modul-Worker; transformers.js läuft nur dort, mit
#    env.allowRemoteModels=false, env.localModelPath="/lern-app/modelle/", env.useWasmCache=false
#    und env.backends.onnx.wasm.wasmPaths auf die eigenen ORT-Dateien.
#  Je Satz geht ein Float32Array (16 kHz) per postMessage an den Worker. language ist fest (german/turkish/arabic),
#  task "transcribe", kein Prompt, keine Zeitstempel.
#  Protokolliert werden: jede Anfrage (Playwright, auch aus dem Worker), Serverprotokoll, Falle, CSP-Verstöße,
#  PSS aller Chromium-Prozesse alle 250 ms (/proc/<pid>/smaps_rollup), CPU-Fremdlast und
#  measureUserAgentSpecificMemory (nur mit COI).
node skripte/lauf2.mjs '{… "sw":true,"offline":true …}'   # Vorrat igmg-lernapp-modelle über Test-SW, danach offline laden
node skripte/variante.mjs 8712 8719 messung/variante.json  # welche ORT-Datei wählt transformers.js ohne Vorgabe?
node skripte/kontrolle.mjs 8719 90 messung/kontrolle.json  # Chromium nur mit about:blank: Verbindungen des Browsers selbst
python3 -I skripte/auswertung.py <basis> messung/L*.json && python3 -I skripte/tabellen.py <basis>
python3 -I skripte/schwellen.py <basis> messung/L5-….json messung/L3-….json messung/L12-….json messung/L13-….json
python3 -I skripte/fehlerbilder.py <basis> messung/L2-base-coi2.json
```

**Normalisierung** (wie PLAN §4.1):
- Grundform: NFC; tr mit türkischer Kleinschreibung (I → ı, İ → i); Apostroph entfernt; alle übrigen Satzzeichen werden
  Leerzeichen.
- ar zusätzlich: Harakat U+064B–U+0652 und U+0670 sowie Tatweel entfernt; Alif-Formen (U+0623, U+0625, U+0622, U+0671) →
  U+0627; persisches Yāʾ und Kāf → arabische Form.
- **„mild“** zusätzlich: de ß → ss; tr Sonderbuchstaben → ASCII; ar Tāʾ marbūṭa = Hāʾ und Alif maqṣūra = Yāʾ am Wortende,
  Hamza-Träger gleich.
- **„tolerant“** (Wortausrichtung für die geplante Markierung grün/gelb): „mild“, und Wörter ab 4 Zeichen mit höchstens
  1 Zeichen Abstand gelten als Treffer.

**Kenngrößen:**
- **Trefferanteil** eines Satzes: gefundene Zielwörter / Zielwörter (tolerant).
- **Fehlablehnung bei Schwelle S:** Anteil der korrekt gesprochenen Sätze (Muttersprachler oder Sprachausgabe), die nicht als
  „gut verständlich“ gelten. **Kurzsatzregel:** Bei höchstens 4 Zielwörtern genügt es, wenn höchstens ein Wort fehlt.

## 3. Messwerte und Ergebnisse

### 3.1 Testmaterial und Dateien

| Sprache/Quelle | Art | Sätze | Wörter (Σ / Mittel) | Dauer Median (min–max) s | Lizenz |
|---|---|---|---|---|---|
| de/fleurs | menschlich, gelesen | 30 | 659 / 22,0 | 11,6 (5,2–23,3) | CC BY 4.0 |
| tr/fleurs | menschlich, gelesen | 30 | 504 / 16,8 | 11,2 (4,2–24,4) | CC BY 4.0 |
| ar/fleurs | menschlich, gelesen (`ar_eg`) | 30 | 529 / 17,6 | 10,1 (6,0–18,5) | CC BY 4.0 |
| de/tatoeba | menschlich, Alltagssätze | 30 | 179 / 6,0 | 1,9 (1,1–2,9) | Audio CC BY 4.0, Text CC BY 2.0 FR |
| de/mms | synthetisch, Kontrolle (gleicher Text wie de/tatoeba) | 30 | 179 / 6,0 | 2,5 (1,4–4,7) | nur lokal |
| tr/mms | synthetisch, Alltagssätze | 25 | 119 / 4,8 | 2,7 (1,8–5,0) | nur lokal |
| ar/mms | synthetisch, Alltagssätze | 25 | 113 / 4,5 | 3,7 (2,1–6,0) | nur lokal |
| Störsignale | Stille, Rauschen, Brummen | 3 je Sprache | – | 3,0 | eigen |

Je Sprache liegen damit mindestens 55 Sätze mit Referenztext vor, davon 30 (de: 60) menschlich gesprochen.

**Grenzen des Materials:**
- FLEURS sind gelesene Wikipedia-Sätze: lang, mit Eigennamen.
- Je Sprache kam nur ein Geschlecht vor (de und tr männlich, ar weiblich). Die Sprecherzahl ist unbekannt, weil die TSV keine
  Sprecher-ID nennt; die Sprechervielfalt ist also gering.
- `ar_eg` ist Hocharabisch, gelesen von Sprecherinnen aus Ägypten. Die Referenz ist nur stellenweise vokalisiert.
- Tatoeba stammt von zwei Sprechern (MisterTrouser 23, Yeti 7) und kommt dem Gebrauch in der Lern-App am nächsten.
- Für tr und ar gibt es kein frei lizenziertes Tatoeba-Audio (Lizenzbericht); deshalb die synthetischen Kurzsätze.

| Datei (gepinnt) | Größe | SHA-256 |
|---|---|---|
| whisper-base `onnx/encoder_model_quantized.onnx` | 23.200.850 B | `3e345e97…85f9` (wie S5) |
| whisper-base `onnx/decoder_model_merged_quantized.onnx` | 53.707.539 B | `a6beb6ba…f861` (wie S5) |
| whisper-small `onnx/encoder_model_quantized.onnx` | 92.324.809 B | `969f5ac1…ba06` |
| whisper-small `onnx/decoder_model_merged_quantized.onnx` | 156.780.950 B | `fcfc6100…6d24` |
| ORT `ort-wasm-simd-threaded.wasm` (plain, nur CPU) | 14.264.838 B (gzip 3,67 MB) | `06ba0577…f9e3` |
| ORT `ort-wasm-simd-threaded.asyncify.wasm` | 26.861.777 B (gzip 6,60 MB) | `49871f5a…f082` |
| ORT `ort-wasm-simd-threaded.jsep.wasm` / `.jspi.wasm` | 28.352.885 B / 16.811.691 B | nicht geladen |
| `transformers.min.js` (Worker-Chunk) | 581.935 B (gzip 169 KB) | – |

### 3.2 Laden

**Tatsächlich geladene Dateien (whisper-base):**
- `config.json`, `generation_config.json`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`: zusammen
  2,77 MB; `tokenizer.json` allein 2,48 MB, gzip 0,63 MB. `vocab.json` und `merges.txt` werden nicht angefragt.
- die zwei ONNX-Dateien
- ORT-`.wasm` und ORT-`.mjs`; die `.mjs` wird je ORT-Thread einmal angefragt (2 Threads: 2×, 4 Threads: 4×)
- der Worker-Chunk

Summe mit ORT „plain“: **≈ 94,5 MB** (whisper-small: ≈ 266,7 MB). Ungepackte Übertragung:
- whisper-base: 76 s bei 10 Mbit/s, 15 s bei 50 Mbit/s, 7,6 s bei 100 Mbit/s
- whisper-small: 213 s, 43 s, 21 s

Ob das CDN die ONNX-Dateien komprimiert, klärt S5.

| Lauf | Modell | Quelle der Dateien | Laden (Initialisierung) | 1. Erkennung (mit Aufwärmen) |
|---|---|---|---|---|
| L5 | base, 2 Threads | localhost | 2,66 s | 6,03 s (langer Satz) |
| L16 / L17 | base, 2 Threads, ORT asyncify / plain | localhost | 3,25 s / **2,01 s** | 4,39 s / 3,40 s (kurzer Satz) |
| L6b | base, 2 Threads | Vorrat (Cache über Test-SW) | 2,38 s kalt; 1,37 s nach Neuladen; **1,12 s offline** | 3,49 s |
| L3 | small, 2 Threads | localhost | 4,75 s (nach Neuladen 2,35 s) | 11,43 s |
| L12 | base, 2 Threads | localhost, Plattencache nach Neustart kalt | 20,69 s (CPU fast untätig, Warten auf Platte) | 19,81 s |
| L13 | small, 2 Threads | localhost | 8,01 s | 29,55 s |

- **Vorab-Laden** in den Cache `igmg-lernapp-modelle` (wie der geplante Knopf „Sprachprüfung laden“): 9 Dateien, 106,6 MB
  (mit ORT-asyncify) in 1,8 s über localhost. `storage.estimate()` meldet danach 107 MB belegt.
- **Erste Erkennung:** Sie dauert 1,0- bis 1,5-mal so lang wie die Wiederholung desselben Satzes (Median 1,2 über 27 Läufe),
  nach dem kalten Neustart 3,3-mal (L12). Ein Probelauf direkt nach dem Laden wärmt auf (§5).

### 3.3 Speicher (PSS aller Chromium-Prozesse, Abtastung alle 250 ms)

| Modell | Läufe | Chromium ohne Modell | Spitze gesamt | Spitze Renderer (Seite + Worker + ORT-Threads) | Worker laut `measureUserAgentSpecificMemory` (nach dem Lauf) | Renderer nach dem Lauf, Worker noch aktiv |
|---|---|---|---|---|---|---|
| base | L1, L2, L5, L14–L17 | 0,28 GB | 1,67–1,87 GB | **1,37–1,52 GB** | 0,76 GB | 0,87–1,07 GB |
| small | L3, L4, L13 | 0,28 GB | 3,80–3,91 GB | **3,34–3,40 GB** | 1,95 GB | 1,99–2,15 GB |

- Zahl der Threads (1, 2, 4) und `enableCpuMemArena: false` (Vorlauf F) ändern die Spitze nicht (Renderer 1,35–1,42 GB).
- ORT „plain“ senkt die Spitze während des Ladens (Renderer 0,50 statt 0,71 GB), nicht während der Erkennung.
- Über 120 Sätze wächst der Speicher kaum (base: von 1,41 GB nach dem ersten Satz auf 1,48 GB).
- Der Speicher wird erst frei, wenn der Worker beendet wird.

### 3.4 Latenz je Satz (WASM)

**Threads und COOP/COEP** (ein Zug im zweiten Abschnitt, base, 30 kurze Tatoeba-Sätze, Fremdlast 0,15–0,22 Kerne):

| Lauf | Threads | COOP/COEP | ORT-Datei | Median | P90 | schneller als 1 Thread |
|---|---|---|---|---|---|---|
| L14 | 1 | nein | asyncify | 4,90 s | 5,43 s | 1,00 |
| L16 | 2 | ja | asyncify | 3,50 s | 3,82 s | **1,40** |
| L17 | 2 | ja | plain | 3,51 s | 4,08 s | 1,40 |
| L15 | 4 | ja | asyncify | 2,76 s | 3,10 s | **1,77** |

- Ohne COOP/COEP läuft ORT nur mit einem Thread.
- Erster Abschnitt: L1 mit 1 Thread 4,36 s, L5 mit 2 Threads 2,76 s (Faktor 1,58).
- Vier Threads bei paralleler Fremdlast streuten stark (Vorlauf B: 2,8–13,4 s je Satz).

**Je Sprache und Modell** (erster Abschnitt, 2 Threads mit COI; Median / P90 / Max):

| Gruppe | base (L5) | small (L3) |
|---|---|---|
| de kurz (Tatoeba, Ø 6 Wörter) | 2,76 / 3,26 / 3,45 s | 8,90 / 9,76 / 10,06 s |
| de lang (FLEURS, Ø 22 Wörter) | 4,49 / 5,54 / 5,84 s | 11,72 / 14,72 / 15,90 s |
| tr lang (FLEURS) | 4,27 / 5,58 / 8,24 s | 12,17 / 15,37 / 20,17 s |
| ar lang (FLEURS) | 4,90 / 6,21 / **26,30** s (Wiederholungsschleife) | 13,42 / 15,96 / 17,46 s |

- **Kurze synthetische Sätze** (zweiter Abschnitt, etwa 1,27-mal langsamer):
  - base: de 3,83 s, tr 4,99 s, ar 3,90 s
  - small: de 13,0 s, tr 18,2 s, ar 14,4 s, mit Ausreißern bis 37 s ohne Halluzination
- **Näherungsformel (Regression):**
  - base mit 2 Threads: Latenz ≈ 2,3–2,8 s + 0,10–0,12 s je Wort
  - base mit 1 Thread: ≈ 3,7–4,2 s + 0,12–0,16 s je Wort
  - small mit 2 Threads: ≈ 7,7–9,0 s + 0,20–0,26 s je Wort
- Den festen Anteil bestimmt der Encoder: Er rechnet immer über das volle 30-s-Fenster. Bei kurzen Lern-App-Sätzen dominiert
  er; tr und ar brauchen je Wort mehr Tokens.

### 3.5 Wortfehlerquote

Die WER ist bei allen Thread-Zahlen und beiden ORT-Dateien identisch, weil die Decodierung gierig und damit deterministisch ist.

| Gruppe | n | base WER | base tolerant | base CER | small WER | small tolerant | small CER | fehlerfreie Sätze base / small |
|---|---|---|---|---|---|---|---|---|
| de/tatoeba (kurz, menschlich) | 30 | 11,2 % | 8,9 % | 4,5 % | 5,0 % | 3,9 % | 2,4 % | 19 / 24 |
| de/fleurs (lang, menschlich) | 30 | 24,4 % | 21,4 % | 7,4 % | 8,9 % | 7,2 % | 2,8 % | 2 / 9 |
| tr/fleurs | 30 | 36,3 % | 28,4 % | 10,1 % | 16,3 % | 11,3 % | 3,9 % | 1 / 4 |
| ar/fleurs | 30 | **50,9 %** | 34,7 % | 22,9 % | 22,3 % | 11,0 % | 5,8 % | 0 / 1 |
| de/mms (kurz, synthetisch) | 30 | 15,6 % | 12,3 % | 6,0 % | 14,0 % | 12,8 % | 5,8 % | 15 / 17 |
| tr/mms | 25 | 29,7 % | 22,9 % | 7,2 % | 16,1 % | 10,2 % | 2,9 % | 7 / 14 |
| ar/mms | 25 | **65,8 %** | 48,6 % | 23,3 % | 44,1 % | 30,6 % | 14,6 % | 0 / 2 |

- Die Normalisierung „mild“ ändert die WER um höchstens 0,4 Punkte. Sonderbuchstaben und Hamza-Formen sind also nicht die
  Hauptquelle der Fehler.
- Synthetisches Audio ist schwerer zu erkennen als menschliches. Beim gleichen Text (de) liegt die WER bei 15,6 statt 11,2 %
  (base) bzw. 14,0 statt 5,0 % (small); die Fehler von small entstehen dort fast nur an Artefakten der Sprachausgabe.
- Die mms-Werte sind deshalb Untergrenzen. Bei ar kommt hinzu, dass MMS ohne Vokalzeichen spricht.

**Fehlablehnung korrekt gesprochener Sätze** (tolerant, mit Kurzsatzregel; `skripte/schwellen.py`):

| Lauf / Gruppe | n | S = 0,5 | S = 0,6 | S = 0,7 | S = 0,8 | Sätze ohne jeden Treffer |
|---|---|---|---|---|---|---|
| base de/tatoeba | 30 | 7 % | 10 % | 13 % | 13 % | 0 |
| base de/fleurs | 30 | 3 % | 3 % | 10 % | 27 % | 0 |
| base de/mms | 30 | 7 % | 10 % | 20 % | 20 % | 0 |
| base tr/fleurs | 30 | 10 % | 13 % | 27 % | 50 % | 0 |
| base tr/mms | 25 | 4 % | 16 % | 28 % | 28 % | 1 |
| base ar/fleurs | 30 | 10 % | 20 % | 53 % | 77 % | 1 |
| base ar/mms | 25 | **32 %** | 44 % | 48 % | 52 % | **4** |
| small de/tatoeba | 30 | 0 % | 0 % | 3 % | 3 % | 0 |
| small de/fleurs | 30 | 0 % | 3 % | 3 % | 7 % | 0 |
| small tr/fleurs | 30 | 0 % | 0 % | 7 % | 10 % | 0 |
| small tr/mms | 25 | 0 % | 0 % | 8 % | 8 % | 0 |
| small ar/fleurs | 30 | 0 % | 0 % | 7 % | 13 % | 0 |
| small ar/mms | 25 | 16 % | 20 % | 24 % | 32 % | 2 |

### 3.6 Fehlerbilder

**de:**
- Eigennamen und Fremdwörter, z. B. „Kowloon“ → „korvloom“ und bei der Sprachausgabe „Tom“ → „Turm“ oder „vom“
- Komposita werden getrennt oder verkürzt, z. B. „Unabhängigkeitserklärung“ → „klärung“ (10 Fälle in FLEURS mit base)
- Funktionswörter: dass/das, die/der, ihm/im
- Endungen: Gerücht/Gerüchte

**tr:**
- Endungen und Vokalharmonie: ölümüne → ölümünü, yanıma → yanımı
- Konsonanten: uçağı → uçayı, çarptı → çarttı, duvara → dovara
- Wortgrenzen: kız kardeşim → „kıskar deşim“
- Fremde Eigennamen werden völlig verfehlt (Goethe, Fichte, Schlegel).
- Nur 2 von 139 Ersetzungen (base) betreffen ausschließlich Sonderbuchstaben.

**ar** (Umschrift des Konsonantengerüsts):
- **Die Abschrift ist fast ohne Harakat:** 5 (base) bzw. 3 (small) Vokalzeichen in 30 FLEURS-Sätzen, gegenüber 41 in der nur
  teilweise vokalisierten Referenz. Kurze Vokale, Schadda und Tanwīn sind mit Whisper also **nicht prüfbar**.
- Häufigster Fehler ist ein fehlendes oder zusätzliches langes ā (Alif), z. B. „ʿ-ā-sh-r“ → „ʿ-sh-r“, „al-aʿ-ā-ṣ-ī-r“ →
  „al-aʿ-ṣ-ī-r“.
- Weitere Fehler betreffen Endungen (Tāʾ marbūṭa, ‑īn), getrennt oder zusammen geschriebene Klitika („mn khfḍa“ statt
  „mnkhfḍa“) und den Artikel.
- Bei base liegen 96 von 235 Ersetzungen genau ein Zeichen daneben. Deshalb senkt die tolerante Ausrichtung die WER von 50,9 auf
  34,7 %.

**Allgemein:**
- Testsätze ohne Ziffern. Whisper schreibt Zahlen teils als Ziffern, der Abgleich muss Zahlwort und Ziffer gleichsetzen
  (für L5).
- Gesprochene Lernerfehler, die Whisper zum flüssigen Zielwort „glättet“, bleiben unentdeckt. Die Funktion misst
  Verständlichkeit, nicht die Aussprache.

### 3.7 Stille, Rauschen und Längenkappe

| Signal (3 s) | base de | base tr | base ar | small de | small tr | small ar |
|---|---|---|---|---|---|---|
| Stille | „Und dann ist das der erste.“ | „Bu dizinin betimlemesi TRT-8'ne yaptırılmıştır.“ | Schleife, 222 Wörter, **26,5 s** | „Das war's.“ | „Bu videoyu izlediğiniz için teşekkürler.“ | Schleife, 128 Wörter, **65,7 s** |
| Rauschen −50 dBFS | „.“ | „Sıstırın.“ | Schleife, 148 Wörter, 26,0 s | „Das ist der erste Mal.“ | „...“ | 3 Wörter |
| Brummen −41 dBFS | „und dann wieder auf der anderen Seite.“ | „Sıstırtın.“ | 1 Wort | „Das ist der erste.“ | „...“ | 3 Wörter |

**Halluzinationen:**
- Alle drei Sprachen erfinden bei Stille oder Rauschen Text, darunter typische Floskeln aus Videountertiteln.
- Arabisch läuft in Wiederholungsschleifen bis zur Höchstlänge.

**Längenkappe** `max_new_tokens = ⌈1,5 × Tokens(Zielsatz)⌉ + 8` (L9, L10):
- Sie begrenzt den schlimmsten Fall auf 2,3–3,3 s (base) bzw. 8,1–9,4 s (small). Erfundener Text bleibt, nur kürzer.
- Auf 17 normalen Sätzen (de 6, ar 7, tr 4) ist die WER mit und ohne Kappe gleich (de 0,0 %, tr 40,6 %, ar 44,5 %). Die
  ar-Summe sinkt von 57,5 auf 40,7 s.
- Die Kappe nutzt nur die Länge des Zielsatzes, nicht seinen Text. Sie ist also kein Prompt mit der Lösung (ADR 0042 Nr. 2).

**Pegel des Testmaterials** (Rahmen von 30 ms über −40 dBFS):
- Sprache: Median 1,3–6,7 s je Aufnahme
- Störsignale: 0 s
- Eine menschliche FLEURS-Aufnahme liegt aber insgesamt bei −58 dBFS und hat keinen Rahmen über −40 dBFS. Eine feste
  Pegelschwelle würde sie abweisen.

### 3.8 WebGPU

- **Ohne GPU** (headless Chromium 141): `navigator.gpu` ist vorhanden, `requestAdapter()` liefert `null`.
- **Mit `--enable-unsafe-webgpu`:** Adapter „google / swiftshader“, also CPU-Emulation.
- **whisper-base q8 mit `device: 'webgpu'`** (L11):
  - Laden 3,8 s, erste Erkennung 96,9 s
  - danach 89,4 s und 77,9 s für Sätze von 1,8 bzw. 1,6 s, mit korrektem Text
  - rund **25-mal langsamer** als WASM mit 2 Threads (3,5 s); Renderer-Spitze 1,37 GB
- **Folgerungen:**
  - Der Weg funktioniert, sagt über echte GPUs aber nichts.
  - q8-Gewichte (MatMulInteger, dynamische Quantisierung) sind für WebGPU ungünstig. Ein WebGPU-Weg bräuchte eigene
    fp16-/fp32-Dateien, die größer sind.
  - Bewertung erst auf echten Geräten (LM-07).

### 3.9 Netzprotokoll (eigener Ursprung)

- **Seite und Worker:** In 27 Läufen gingen 1.410 Anfragen aus Seite, Worker und ORT-Threads ausschließlich an
  `127.0.0.1:<port>`.
  - Keine Anfrage schlug fehl, es gab keinen CSP-Verstoß.
  - Keine Anfrage ging an `huggingface.co`, `cdn.jsdelivr.net` oder einen anderen Host.
- **Falle:** Sie verzeichnete nur CONNECT-Versuche des Browserprozesses selbst an `accounts.google.com:443` (186) und
  `android.clients.google.com:443` (103); alle wurden abgewiesen.
- **Kontrolllauf:** Chromium nur mit `about:blank`, 90 s, keine Seite, kein Worker. Er zeigt dasselbe Muster (5 + 3 Versuche,
  0 Seitenanfragen). Diese Verbindungen gehören also zu Chromium, nicht zur Lern-App.
- **Synthese der Testsätze** im Browser: 0 Fremdanfragen.
- **Serverprotokoll beim Laden:** nur `/lern-app/modelle/…` und der Worker-Chunk.

### 3.10 CSP, Vorrat und Offline

- **`env.useWasmCache = true`** (Grundeinstellung von transformers.js 4.3.0): Die ORT-`.mjs` wird über eine `blob:`-URL
  importiert. Unter der geplanten CSP (ohne `blob:` in `script-src`) bricht das Laden mit „no available backend found …
  Failed to fetch dynamically imported module: blob:“ ab (Probe 0).
- **`env.useWasmCache = false`:** Das Laden läuft ohne Erweiterung der CSP.
- **Strengere CSP** (L18, Port 8713): `worker-src 'self'` und `media-src 'self'`, beide ohne `blob:`, mit COOP/COEP und
  2 Threads. Laden 2,37 s, Erkennung korrekt, 0 Verstöße. `blob:` in `worker-src` ist für Whisper nicht nötig.
- **`env.localModelPath`** muss ein Pfad sein (`/lern-app/modelle/`). Mit voller URL fand transformers.js 4.3.0 Tokenizer und
  Prozessor nicht (erster Abschnitt).
- **Vorrat und Offline** (L6b):
  - Der Test-SW hält `/lern-app/modelle/**` im Cache `igmg-lernapp-modelle` (Vorrat zuerst). Die Seite lädt die 9 Dateien
    vorab; transformers.js läuft mit `env.cacheKey = 'igmg-lernapp-modelle'`, die ORT-`.wasm` kommt als `wasmBinary` aus
    demselben Cache.
  - Nach `context.setOffline(true)` lädt ein neuer Worker das Modell in 1,12 s und erkennt den Satz korrekt.
  - Während der Offline-Phase erreichte den Server nur die SW-Aktualisierungsprüfung des Browsers, keine Modellanfrage.
- **COEP und SW** (L6a gegen L6b):
  - L6a: Legt der SW neu gebaute Antworten nur mit `Content-Type` ab, hängt das Laden unter COOP/COEP (Zeitüberschreitung
    120 s). Die ORT-Thread-Worker starten aus der zwischengespeicherten `.mjs`, die dann keine COEP-Kopfzeile mehr trägt.
  - L6b: Mit der Originalantwort (`cache.put(url, response.clone())`) funktioniert es.

### 3.11 Welche ORT-Datei lädt transformers.js 4.3.0?

- **Nur ein Verzeichnis als `wasmPaths`** (`variante.json`): Geladen werden `ort-wasm-simd-threaded.asyncify.{mjs,wasm}`
  (26,9 MB), bei `device: 'wasm'` ebenso wie bei `'webgpu'`. Damit ist die Frage aus S5 §3.4 beantwortet.
- **„plain“** `ort-wasm-simd-threaded.{mjs,wasm}` (14,3 MB, nur CPU), ausdrücklich gesetzt, funktioniert:
  - L17, L18 und Vorläufe C/D
  - gleiche Latenz (3,51 gegen 3,50 s), Laden 2,0 statt 3,3 s, 12,6 MB weniger
- jsep und jspi wurden nicht angefragt.

## 4. Entscheidungsvorschlag für die offenen Punkte der ADRs

| Punkt | Vorschlag | Beleg |
|---|---|---|
| **ADR 0042 Nr. 3, LM-27 – Modell Deutsch** | `Xenova/whisper-base` q8 (`64da572`) als Standard; whisper-small nicht ausliefern | base: WER 11 % kurz und 24 % lang, Fehlablehnung bei S = 0,6 höchstens 10 %. small ist genauer, braucht aber etwa 3× Zeit, +1,9 GB Speicher und +172 MB |
| **ADR 0042 Nr. 3, LM-27 – Modell Türkisch** | whisper-base q8 als Standard mit großzügiger Schwelle (unten). small erst nach LM-07 als freiwillige „genauere Prüfung“ auf starken Desktop-Geräten | small halbiert die WER (36 → 16 % lang, 30 → 16 % kurz), kostet aber 9–18 s je kurzem Satz und 3,4 GB Speicher |
| **ADR 0042 Nr. 3, LM-27 – Modell Arabisch** | whisper-base **ohne automatische Rückmeldung**: Standard ist der Rückfall aus Nr. 8 (eigene Aufnahme anhören, mit der Vorlage vergleichen, selbst bewerten). Eine automatische Prüfung kommt nur mit small auf geeigneten Geräten nach LM-07 (Opt-in, ≈ 267 MB) | base: WER 51 % (lang) bzw. 66 % (kurz), Fehlablehnung bei S = 0,5 von 10 bis 32 %, 4 von 25 Kurzsätzen ohne jeden Treffer. small: 22 % (lang), Fehlablehnung bei S = 0,6 von 0 % (FLEURS) |
| **ADR 0042 Nr. 6 – Harakat** | Sprechübungen prüfen nur Wörter, nie die Vokalisierung; Harakat-Übungen bleiben ohne Spracherkennung | Abschrift fast ohne Harakat (§3.6) |
| **ADR 0042 Nr. 6 – Schwellen** | Trefferanteil tolerant (§2); „gut verständlich“ ab S, darunter „Teilweise verstanden – vergleiche mit deiner Aufnahme“; Wörter gelb = „nicht sicher erkannt“; nie rot, keine Note | Fehlablehnung bei diesen S: base de 3–10 %, tr 4–10 %; small bei menschlichen Aufnahmen 0–7 %, bei synthetischen 8 % (tr), 17 % (de) und 20 % (ar) |
| … Werte für base | de S = 0,6, tr S = 0,5, ar keine automatische Rückmeldung | ebenda |
| … Werte für small (nach LM-07) | de 0,7, tr 0,7, ar 0,6 | ebenda |
| … Kurzsätze und Stufen | Kurzsatzregel: bei höchstens 4 Wörtern darf ein Wort fehlen; dieselben Werte für A1–C1. Neu kalibrieren in L5 mit Aufnahmen echter Lernender (Einwilligung, Aufnahme bleibt auf dem Gerät, nur Zahlen notieren) | ebenda |
| **ADR 0042 Nr. 6 + ADR 0040 – keine Abschrift anzeigen** | Die App zeigt **nie** die freie Abschrift, nur die Wörter des geprüften Zielsatzes mit Markierung | Whisper erfindet bei Stille und Rauschen Text (Videofloskeln, arabische Schleifen, §3.7). Eine angezeigte Abschrift könnte auch religiöse Formeln enthalten, die nicht aus gepinnten, geprüften Daten stammen (KI-Regel 2) |
| **ADR 0042 Nr. 6 – Schutz vor Halluzination** | (1) Pegelprüfung vor der Erkennung, **relativ** (Rauschboden + 12 dB, mindestens 0,3 s Sprache; `getUserMedia` mit `autoGainControl`), keine feste −40-dBFS-Schwelle; (2) `max_new_tokens = ⌈1,5 × Zieltokens⌉ + 8`; (3) Aufnahme höchstens 15 s; (4) Wiederholungsprüfung (ein 4-Gramm ≥ 4-mal oder Abschrift länger als das Doppelte des Ziels) → „Nicht verstanden, bitte noch einmal“ | §3.7 |
| **ADR 0042 Nr. 9 – COOP/COEP** | `Cross-Origin-Opener-Policy: same-origin` und `Cross-Origin-Embedder-Policy: require-corp` für **ganz** `/lern-app/:pfad*`; nur auf Übungsrouten reicht nicht, weil clientseitige Navigation kein isoliertes Dokument erzeugt. Bedingungen: nur eigener Ursprung (KERN §1); der SW speichert Originalantworten samt Kopfzeilen; Header-Test; E2E prüft `crossOriginIsolated` auf `…/ueben`. Die Website behält ihre Header | messbarer Gewinn: 2 Threads 1,40×, 4 Threads 1,77× schneller; ohne COI nur 1 Thread |
| **ADR 0042 Nr. 9 – CSP** | Die geplante CSP reicht; Vorschlag zur Verschärfung: `worker-src 'self'` ohne `blob:`. `media-src 'self' blob:` nur zum Abspielen der eigenen Aufnahme per Object-URL (Rückfall). Kein `blob:` in `script-src`, kein `'unsafe-eval'`. Voraussetzung `env.useWasmCache = false` | L18 ohne `blob:` grün; Probe 0 |
| **ADR 0042 Nr. 2/10 – Worker-Einstellungen** | `env.allowRemoteModels = false`; `env.allowLocalModels = true`; `env.localModelPath = '/lern-app/modelle/'` (Pfad, keine volle URL); `env.useWasmCache = false`; `env.useBrowserCache = false` (Vorrat über den Lern-App-SW) oder `env.cacheKey = 'igmg-lernapp-modelle'`; `wasmPaths = { mjs: '<Ursprung>/lern-app/modelle/ort/ort-wasm-simd-threaded.mjs', wasm: '…/ort-wasm-simd-threaded.wasm' }`; `dtype: 'q8'`, `device: 'wasm'`; Threads nach ORT-Standard (bei COI min(4, Kerne/2)); `language` fest, `task: 'transcribe'`, `return_timestamps: false` | §3.10, §3.11 |
| **ADR 0042 Nr. 5, S5, PLAN §5.4 – Dateien** | Genau 10 Dateien ausliefern (7 Modell- und Konfigurationsdateien, ORT plain `.wasm` und `.mjs`, Worker-Chunk), zusammen ≈ 94,5 MB. asyncify, jsep und jspi nicht ausliefern, solange WebGPU aus ist | §3.2, §3.11 |
| **KERN §9 – Größe** | Sprechmodul ≈ 95 MB statt „whisper-base q8 ≈ 77 MB“; Knopf „Sprachprüfung laden (≈ 95 MB)“ | §3.2 |
| **ADR 0042 Nr. 4, ADR 0038 – Vorrat** | Cache `igmg-lernapp-modelle` (Vorrat zuerst) im Lern-App-SW für alle 10 Dateien einschließlich `.mjs`, die je ORT-Thread angefragt wird. Originalantwort speichern (COEP). Worker nach der Übung beenden | L6b offline grün; L6a hängt ohne Kopfzeilen |
| **PLAN §4.2 – WebGPU** | In der ersten Fassung aus (`device: 'wasm'`). WebGPU erst nach LM-07 mit eigenen fp16-Dateien als eigener Versuch | §3.8 |
| **ADR 0042 Nr. 12 – Schalter** | `lernapp_sprechen` bleibt in Produktion aus bis LM-07; die automatische Rückmeldung für Arabisch bleibt zusätzlich aus, bis small auf Geräten bestätigt ist | §3.3–3.5 |
| **PLAN §12, L0-E10 – Version** | transformers.js 4.3.0 ist belegt. Vor dem Wechsel auf 4.3.1 (ab 20.10.2026) denselben Rauchtest wiederholen: Laden, 3 Sätze je Sprache, Netz- und CSP-Protokoll. ORT `1.31.0-dev.20260914-8d85527a0` im Lockfile festhalten | §2.1 |
| **ADR 0042 Folgen – Latenzziel** | „≤ 3 s auf dem Referenzgerät“ wird als Probelauf nach dem Laden gemessen (§5). Hier: base 2,8 s (4 Threads) bzw. 3,5 s (2 Threads) für kurze Sätze auf 4 vCPU mit 2,1 GHz | §3.4 |

## 5. Gerätecheck (Vorschlag zu ADR 0042 Nr. 4) und Testplan LM-07

**Vor dem Download** (ohne Netz):
1. **Fähigkeiten:**
   - Modul-Worker
   - WebAssembly mit SIMD (`WebAssembly.validate` einer SIMD-Probe)
   - `getUserMedia` und `MediaRecorder`
   - `AudioContext` mit Resampling auf 16 kHz
   - Cache Storage
   Fehlt etwas → Rückfall nach ADR 0042 Nr. 8, ohne Download.
2. **Platz:** `navigator.storage.estimate()`, frei mindestens 200 MB (≈ 2 × 95 MB).
3. **Arbeitsspeicher:** `navigator.deviceMemory` (nur Chromium, höchstens 8 gemeldet). Unter 4 → Rückfall mit Hinweis, denn base
   braucht etwa 1,4–1,5 GB im Tab. Unbekannter Wert (Safari, Firefox) → erlaubt, mit Hinweis.
4. **Threads:** Mit `crossOriginIsolated` nutzt ORT mehrere Threads, sonst einen (1,4- bis 1,8-mal langsamer).
5. **Größe nennen:** „≈ 95 MB, einmalig, bleibt auf dem Gerät“.

**Nach dem Download:**

6. **Probelauf:** eine Erkennung eines eingebauten Clips von etwa 2 s (Sprachausgabe der Lern-App, neutraler Satz). Er wärmt
   zugleich auf; die erste Erkennung ist im Median 1,2-mal so langsam wie die folgenden.
   - bis 5 s: normal
   - 5–12 s: Hinweis „dauert hier etwa N s“
   - über 12 s, Fehler oder Absturz des Workers: Rückfall. Das Ergebnis wird lokal in den Einstellungen gemerkt; kein
     automatischer neuer Versuch.
7. **Worker beenden** nach der Übung oder beim Verlassen der Route, damit der Speicher frei wird. Ein Neustart aus dem Vorrat
   dauert 1,1–1,4 s.

**whisper-small** (nur nach LM-07, Opt-in für ar und tr): `deviceMemory` ≥ 8, nicht mobil (`navigator.userAgentData?.mobile ===
false`), `hardwareConcurrency` ≥ 8, `crossOriginIsolated`, Probelauf mit base ≤ 2 s. Kosten: ≈ 267 MB, ≈ 3,4 GB Speicher.

**Testplan LM-07, Teil Sprechen** (iPhone mit Safari, Android-Mittelklasse mit Chrome, Laptop mit Chrome, Firefox und Safari):
1. Werte des Gerätechecks notieren: `deviceMemory`, `hardwareConcurrency`, `crossOriginIsolated`, WebGPU-Adapter.
2. Download über Mobilfunk und WLAN; Vorrat; Neustart offline.
3. Probelauf und je Sprache 10 Sätze (A1 kurz, B2 lang): Latenz und Abstürze. Kritisch ist die Speichergrenze von iOS bei
   +1,4 GB.
4. Je Sprache 10 menschliche Proben aus der Gemeinde (Einwilligung; die Aufnahme bleibt auf dem Gerät; nur Zahlen notieren):
   Fehlablehnung bei den Schwellen aus §4, getrennt nach Muttersprachlern und Lernenden.
5. Stille und Störgeräusch: Die Pegelprüfung greift.
6. Optional ein Laptop mit GPU: Ist ein WebGPU-Adapter vorhanden? Dann ein eigener Versuch mit fp16-Dateien.

## 6. Risiken

- **Kein Telefon gemessen:**
  - Alle Zeiten stammen von 4 vCPU Xeon mit 2,1 GHz, Telefone können langsamer sein.
  - base braucht etwa 1,4–1,5 GB im Renderer; auf iPhones droht ein Abbruch des Tabs.
  - Gegenmaßnahmen: Gerätecheck mit Probelauf, Absturzerkennung mit Rückfall, Worker beenden, Schalter aus bis LM-07.
- **Testsprache ist nicht Lernersprache:**
  - Muttersprachler lesen vor, wenige Sprecher, je Sprache ein Geschlecht; tr und ar kurz nur synthetisch.
  - Akzente von Lernenden werden schlechter erkannt; die Schwellen sind deshalb großzügig gewählt und werden in L5 neu
    kalibriert.
  - Whisper glättet falsche Aussprache zu flüssigem Text (falsches „verstanden“). Benennung als „Verständlichkeit“, keine Note
    (ADR 0042 Nr. 6).
- **Arabisch:**
  - base ist zu schwach für eine automatische Rückmeldung; small ist schwer (Speicher, Zeit).
  - Bis LM-07 bleibt Arabisch deshalb beim Selbstvergleich. Die Vokalisierung ist grundsätzlich nicht prüfbar.
- **Halluzinationen:**
  - Whisper erfindet Text, Arabisch auch in Schleifen.
  - Pegelprüfung, Längenkappe, Wiederholungsprüfung, und die freie Abschrift wird nie angezeigt (auch wegen KI-Regel 2).
- **Abhängigkeit vom Dev-Build:** transformers.js 4.3.x hängt an einem Dev-Build von onnxruntime-web; das Verhalten kann sich
  mit 4.3.1 ändern, z. B. `useWasmCache` oder die Wahl der ORT-Datei. Rauchtest vor jedem Versionswechsel.
- **COOP/COEP:**
  - Jede künftige fremde Ressource unter `/lern-app` würde blockiert (gewollt, aber ein Stolperstein).
  - Ein SW, der Antworten neu baut, legt das Laden still (L6a).
  - Gegenmaßnahmen: Regeltest und E2E.
- **Kalter Speicher:** Nach einem Neustart dauerte das erste Laden 20,7 s statt 2–3 s (L12, Warten auf Platte). Auf langsamen
  Geräten muss die Fortschrittsanzeige auch die Initialisierung abdecken, nicht nur den Download.
- **Streuung der Messung:**
  - Andere Agenten liefen parallel, der zweite Abschnitt war etwa 1,27-mal langsamer.
  - Verglichen wird nur innerhalb eines Abschnitts.
  - small zeigte Ausreißer bis 37 s ohne erkennbare Ursache in der Abschrift.
- **Lizenzen:** Das MMS-Testaudio (CC BY-NC 4.0) und die MMS-Modelle lagen nur lokal und sind gelöscht. FLEURS- und
  Tatoeba-Audio liegen nicht im Repository.

## 7. Aufräumen

- **Server per PID beendet:** 3544 (8711), 3545 (8712), 3546 (Falle 8719), 8743 (8713 streng). Die Server des ersten
  Abschnitts (31020–31022) endeten mit dem Neustart. Danach lief kein Chromium- oder Skriptprozess aus `l0/s2` mehr.
- **Gelöscht** (≈ 0,99 GB):
  - `modelle/`: whisper-base, whisper-small, drei MMS-Modelle; 647 MB
  - `dl/npm-*`, `dl/fleurs-{de_de,tr_tr,ar_eg}`, `dl/tatoeba-deu`: 259 MB
  - `daten/pcm/`: 83 MB, einschließlich des synthetischen MMS-Audios
- **Behalten** (8,9 MB, nur Scratchpad): `skripte/`, `messung/` (Lauf-JSON mit Abschriften, Protokolle), `daten/*.json`
  (Referenzen, Auswahl), `dl/fleurs-tsv/`. Zum Wiederholen werden Modelle und Audio an den genannten Revisionen neu geladen.
- **Im Repository** nur dieser Beleg; nichts committet.

## 8. Quellen (abgerufen bzw. geladen am 16.10.2026)

- **FLEURS:** `google/fleurs`, Revision `70bb2e84b976b7e960aa89f1c648e09c59f894dd`, Lizenz CC BY 4.0,
  https://huggingface.co/datasets/google/fleurs. Conneau u. a., „FLEURS: Few-shot Learning Evaluation of Universal
  Representations of Speech“, 2022.
- **Tatoeba-Audio:** https://tatoeba.org/en/downloads; Aufnahmen von MisterTrouser und Yeti unter CC BY 4.0 (Lizenz je Datei
  laut `sentences_with_audio`); Sätze CC BY 2.0 FR; tr- und ar-Sätze aus dem S7-Auszug.
- **Whisper:**
  - Xenova/whisper-base `64da57285918e20ea79ea5c88eed7197933abaa8` und Xenova/whisper-small
    `2d67713f236afa48a18992566e7647f6ca848e13` (Apache-2.0; Gewichte OpenAI, MIT), https://huggingface.co/Xenova/whisper-base
  - Modellkarte und Hinweise zu Halluzinationen: https://github.com/openai/whisper
- **Bibliotheken:**
  - `@huggingface/transformers` 4.3.0: https://registry.npmjs.org/@huggingface/transformers/4.3.0
  - `onnxruntime-web` 1.31.0-dev.20260914-8d85527a0: https://registry.npmjs.org/onnxruntime-web/1.31.0-dev.20260914-8d85527a0
- **MMS-TTS** (nur lokales Testmaterial, CC BY-NC 4.0):
  - Xenova/mms-tts-deu `b95ad64a0715453237dc47ed873235a0024b4275`
  - Xenova/mms-tts-ara `e9dd80f91dcc6fb96b590806bb15421ec6d381c4`
  - payam1394/traxlate-mms-tts-tur `32a99509b3fd590192551916370d3eb6fb692d71`, Ausgangsmodell facebook/mms-tts-tur
- **Messdaten im Scratchpad:**
  - Läufe L1–L18, Vorläufe B–H, Probe 0 und 1 in `…/scratchpad/l0/s2/messung/`
  - `auswertung.json`, `auswertung-saetze.tsv`, `variante.json`, `kontrolle.json`, `falle.log`, `falle2.log`
