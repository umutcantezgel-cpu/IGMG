# Beleg S3 – Stimmen der Sprachausgabe (de, tr, ar): Echtzeitfaktor, Größe, Rückerkennung, Vokalisierung, Lizenzkette

- **Etappe:** L0, Paket L0-07 (Spike S3; Messaufbau nur im Scratchpad, kein Code im Repository)
- **Stand:** Synthese und Zeitmessung am 16.10.2026 (Coqui-Thorsten, Piper-Sprecherprobe) und 17.10.2026 (übrige Stimmen,
  ONNX, Chatterbox) im ersten Lauf. Dieser brach am Sitzungslimit vor dem Beleg ab. Die Fortsetzung am 20.10.2026 hat
  **nichts neu erzeugt und keine Zeitmessung wiederholt**. Sie hat ausgewertet, die Rückerkennung mit Whisper ergänzt, die
  Minimalpaare neu gerechnet (nur numpy) und die Lizenzkette an den Primärquellen nachgeprüft.
- **Bezug:** ADR 0045 Nr. 11 und „Folgen“; ADR 0039 Nr. 5–7 und Fortschreibung S4/S5 Nr. 1; ADR 0042 Fortschreibung S2;
  L3-E10; KERN 4.0 §4; PLAN §5.4, §6.8, §12, §14 (L0-07); MENSCHEN LM-06, LM-15, LM-23…LM-26; Lizenzbericht
  `berichte/lizenzen-l0-stimmen.md`; Beleg S2 (Whisper-Messaufbau), Beleg S4 (Opus-Parameter)
- **Werkzeuge (erster Lauf, Venv inzwischen gelöscht):** Python 3.12 mit `-I`, coqui-tts 0.27.5, chatterbox-tts 0.1.7, piper-tts
  1.8.0 (enthält espeak-ng 1.52.0.1), torch/torchaudio 2.6.0+cpu, transformers 5.2.0, numpy 1.26.4, onnxruntime (CPU), ffmpeg
  6.1.1 mit libopus. **Fortsetzung:** Python 3.13 (System, nur numpy) mit `-I`, ffmpeg 6.1.1, Node 24.21.0, headless
  Chromium 141 über Playwright-Core 1.64.0 aus `web/node_modules`, `@huggingface/transformers` 4.3.0 mit `onnxruntime-web`
  1.31.0-dev.20260914-8d85527a0 (Tarballs, SHA-1 = `dist.shasum` der Registry), Whisper-Gewichte wie S2.
- **Rechner:** 4 vCPU Intel Xeon @ 2,10 GHz, 15 GB RAM, keine GPU. Parallel liefen Bauten und Tests der Etappe L1. Die Last steht
  je Messung dabei (§3.1). `loadavg` enthält die eigenen Threads der Messung; über 4 heißt Wettbewerb um die Kerne.
- **KI-Regel 2 (ADR 0040):** Alle Testsätze sind neutrale Alltagssätze, eigens für S3 verfasst, ohne Religionsbezug. Arabisch
  lag im Scratchpad nur als Buckwalter-Umschrift vor (`skripte/saetze.json`). Die arabische Schrift entstand erst im Skript aus
  Codepunkten. Dieser Beleg nennt Testsätze nur per ID (de/tr/ar `s01`–`s20`, Wörter `w01`–`w10`, Minimalpaare
  `p01a`–`p14b`) und arabische Begriffe nur in Umschrift. Abschriften der Rückerkennung liegen nur im Scratchpad. Hörproben
  und Audio sind **nicht** im Repository.
- **Ehrlichkeitsvermerk:** **Kein Mensch hat die Hörproben gehört.** Alle Aussagen zur Klangqualität stammen aus
  Spektrogrammen, Längen, Pegeln, Tempo und der Rückerkennung (§3.7). Die Hörabnahme bleibt LM-06/LM-23…LM-25.

## 1. Ziel

1. Stimmen nach L3-E10 messen:
   - de: Coqui-VITS Thorsten gegen Piper `de_DE-mls-medium`
   - tr: Coqui glow-tts gegen Chatterbox Multilingual V3
   - ar: Chatterbox mit Vokalisierungstest
2. Messgrößen: Echtzeitfaktor (RTF), Last, Ladezeit, Größe als Opus 24 kbit/s, Verständlichkeit per Rückerkennung (Whisper),
   Fehlerbilder.
3. Lizenzkette je Stimme an der Primärquelle bestätigen. Dazu gehört LM-23: Hat die Coqui-Release-Datei v0.7.0 dieselbe
   Konfiguration?
4. Empfehlung je Sprache für L3-E10 und ADR 0045 Nr. 11; Erzeugungszeit für ≈ 32.500 Clips je Sprache (PLAN §5.4); Schwelle für
   die Rückerkennungs-Stichprobe (PLAN §6.8 Nr. 6); Plan für eigene Stimmen.

## 2. Vorgehen (Befehle)

Arbeitsordner `…/scratchpad/l0/S3/` mit diesen Unterordnern:
- `dl/`, `modelle/`, `onnx/`, `hf/`: Fremddaten
- `skripte/`: Skripte des ersten Laufs
- `auswertung/`: Skripte und Ergebnisse der Fortsetzung
- `audio/`: WAV
- `hoerproben/`: WebM/Opus
- `messung/`: Protokolle
- `whisper/`: Whisper-Modelle und PCM

Python lief stets mit `-I` und mit Pfaden als Argumenten.

```bash
# 2.1 Testmaterial (skripte/saetze.json): je Sprache 20 Alltagssätze s01–s20 und 10 Einzelwörter w01–w10 (Gegenstände,
#     Wochentag); ar zusätzlich 14 Minimalpaar-Gruppen p01–p14 mit 31 Formen (Vokal Aktiv/Passiv, Schadda, Tanwin-Varianten,
#     Kasusvokal, Personalendung, Partizip aktiv/passiv, Hamza gegen langes a). Die ar-Sätze enthalten Schadda,
#     Sonnenbuchstaben, Tanwin, Hamzat al-wasl und Dolch-Alif (Zuordnung je ID in §3.6). Korrektur 17.10.: s08,
#     Adjektiv-Tanwin angeglichen.

# 2.2 Synthese und Zeitmessung (erster Lauf; je Clip synth_s Wandzeit, cpu_s Prozesszeit, dauer_s, loadavg vorher/nachher)
python -I skripte/synth.py coqui-de de skripte/saetze.json audio/de-coqui-thorsten '{"basis":"…/S3"}'
python -I skripte/synth.py coqui-tr tr skripte/saetze.json audio/tr-coqui-glow '{"basis":"…/S3","threads":4}'
python -I skripte/synth.py piper de skripte/saetze.json audio/de-piper-mls-<id> '{"modell":"dl/piper-mls/de_DE-mls-medium.onnx","sprecher":<id>}'
bash skripte/cb_laeufe.sh   # Chatterbox tr, ar (Sätze, Wörter, Paare), ar-Paare mit zweitem Seed (5000+i)
python -I skripte/piper_probe.py …   # alle 236 Sprecher × 2 Probesätze (Sprecherwahl), dazu SQUIM-Schätzwerte
python -I skripte/onnx_vits.py …; python -I skripte/onnx_synth.py <basis> onnx/thorsten_vits.onnx <aus|-> <threads>
#   Lastlauf: 1 Prozess × 4 Threads (onnx-4t) sowie 4 Prozesse × 1 Thread gleichzeitig (onnx-par-1…4)

# 2.3 Kodierung wie geplant (ADR 0039 + Fortschreibung S4/S5 Nr. 1): EBU R128 −23 LUFS, Spitze ≤ −1 dBFS, Rand-Stille
#     kürzen (top_db 40, 60 ms Rand), WebM/Opus 24 kbit/s VBR mono 48 kHz, -application voip, bitexact; 20-ms- und 60-ms-Rahmen
python -I skripte/kodieren.py audio/<stimme> hoerproben/<stimme>

# 2.4 Fortsetzung 20.10.: Auswertung der vorhandenen Messwerte (keine neue Synthese)
python3 -I auswertung/messwerte.py …/S3       # RTF Median/p90/max/Summe, Kerne, Last, Silben/s, Opus kB/s → messwerte.json
python3 -I auswertung/cb_log.py messung/{tr-cb,ar-cb,ar-cb-seed2}.log   # „forcing EOS“ und Sampling-Schritte je Clip
python3 -I auswertung/hochrechnung.py …/S3    # RTF netto (bezogen auf Audio nach Kürzen), 25 h / 32.500 Clips
python3 -I auswertung/pegel.py …/S3           # Pegel, Rand-Stille, Clipping
ffmpeg -i audio/<stimme>/<id>.wav -lavfi "showspectrumpic=s=600x200:legend=1:scale=log:stop=8000" auswertung/spektro/<…>.png

# 2.5 Rückerkennung (Muster S2: eigener Ursprung, Modul-Worker, Falle als Proxy für alle Fremdanfragen, COOP/COEP)
#     npm-Tarballs: @huggingface/transformers 4.3.0 (SHA-1 bd838fcd2f64…), onnxruntime-web 1.31.0-dev.20260914-8d85527a0
#     (SHA-1 b8b660a1ee7d…); ausgepackt nur transformers.min.js bzw. ort-wasm-simd-threaded.asyncify.{mjs,wasm}
#     Xenova/whisper-base @ 64da572 (q8; SHA-256 Encoder 3e345e97…85f9, Decoder a6beb6ba…f861 = S2/S5)
#     Xenova/whisper-small @ 2d67713 (q8; Encoder 969f5ac1…ba06, Decoder fcfc6100…6d24 = S2) als Zusatzprobe für tr/ar
python3 -I auswertung/pcm_vorbereiten.py …/S3   # WebM/Opus (wie ausgeliefert) → 16 kHz float32; Seed-2-Paare aus WAV
node auswertung/asr_server.mjs 8731 … karte.json & node s2/skripte/falle.mjs 8739 … &
node auswertung/asr_lauf.mjs '{"port":8731,"falle":8739,"threads":4,"kappe":3,"testsatz":"…/testsatz.json","aus":"…/asr-base.json"}'
node auswertung/asr_lauf.mjs '{…,"modell":"Xenova/whisper-small","testsatz":"…/testsatz-small.json","aus":"…/asr-small.json"}'
#   Gierig, Sprache fest, task "transcribe", ohne Zeitstempel, ohne Prompt mit der Lösung; max_new_tokens = 3 × Zieltokens + 8
#   nur gegen Endlosschleifen
python3 -I auswertung/asr_auswertung.py …/S3 auswertung/asr-<modell>.json; python3 -I auswertung/asr_zusatz.py …
#   Normalisierung wie S2 (NFC, Kleinschreibung, tr I/İ, Satzzeichen weg; ar ohne Harakat und Tatweel, Alif-Formen
#   vereinheitlicht). „mild“ zusätzlich: ß/ss, tr-Sonderbuchstaben, ar Tāʾ marbūṭa/Alif maqṣūra/Hamza-Träger; Ziffern gelten
#   als Zahlwort (Whisper schreibt Zahlen als Ziffern). Arabisch nur auf Wortebene.

# 2.6 Minimalpaare ar ohne librosa neu gerechnet (paare.py des ersten Laufs brauchte das gelöschte Venv)
python3 -I auswertung/paare_np.py …/S3 auswertung/paare.json      # MFCC 13 + Delta, 16 kHz, DTW
python3 -I auswertung/paare_kontrolle.py …/S3                      # Eichung mit sicher verschiedenen Wörtern

# 2.7 Lizenz-Nachprüfung 20.10. (curl, Ablage lizenz/2026-10-20/, SHA-256 gegen den Stand vom 17.10.)
#     idiap/coqui-ai-TTS dev TTS/.models.json; HF-API Thorsten-Voice/VITS, datasets/Thorsten-Voice/TV-44kHz-Full (+README),
#     rhasspy/piper-voices (+ MODEL_CARD mls), openslr.org/94, ResembleAI/chatterbox (+ README), GitHub-LICENSE Chatterbox,
#     datasets/MBZUAI/ClArTTS, PyPI coqui-tts und chatterbox-tts; dazu die eingebetteten Konfigurationen der tr-Modelle
```

**Stimmen und Einstellungen**

| Kennung | Engine | Modell (Herkunft, Hash) | Einstellungen |
|---|---|---|---|
| `de-coqui-thorsten` | coqui-tts 0.27.5 (Torch, CPU) | `tts_models/de/thorsten/vits`, Release `v0.7.0_models`; `model_file.pth` SHA-256 `ebb3792e…de66` = HF `Thorsten-Voice/VITS` `54f782a` | gruut-Phonemisierung, `split_sentences=False`, 4 Threads |
| `de-coqui-thorsten-onnx` | eigener ONNX-Export (`export_onnx`, 109 MB) + onnxruntime; Tokenizer aus Coqui (gruut) | wie oben | Skalen 0,667/1,0/1,0; 4 Threads bzw. 4 Prozesse × 1 Thread |
| `de-piper-mls-33/125/56/157` | piper-tts 1.8.0 (espeak-ng 1.52.0.1) | `de_DE-mls-medium`, `rhasspy/piper-voices` `c10ece1`, ONNX SHA-256 `69cd1d2a…53f65bf` | Sprecher 33 (MLS 5244, w), 125 (MLS 7320, w), 56 (MLS 143, m), 157 (MLS 1613, m); Standardwerte der Stimme |
| `tr-coqui-glow` | coqui-tts 0.27.5 | `tts_models/tr/common-voice/glow-tts` + `vocoder_models/tr/common-voice/hifigan`, Release `v0.6.1_models`, SHA-256 `bce8dd15…` / `fe5652c5…` | Eingabe türkisch klein, ohne Zirkumflex (Vokabular) |
| `tr-chatterbox-v3` | chatterbox-tts 0.1.7, T3-Gewichte V3 | HF `ResembleAI/chatterbox` `5bb1f6ee`, `t3_mtl23ls_v3.safetensors` `5abca832…3f05953` (unter dem V2-Dateinamen), Standardstimme `conds.pt` `6552d705…d87f4e` | `repetition_penalty` 1,2, letzte 40 ms verworfen (wie GitHub `master`), Seed 1000 + i, Eingabe türkisch klein (Abhilfe I/İ, §3.4) |
| `ar-chatterbox-v3` (+ `-seed2`) | wie oben | wie oben | Eingabe voll vokalisiert; Paare zusätzlich mit Seed 5000 + i |

Die Piper-Sprecher wurden aus allen 236 Sprechern ausgewählt. Grundlage waren je 2 Probesätze, SQUIM-Schätzwerte ohne
Referenz (PESQ, STOI) und die Grundfrequenz (F0). 125 und 33 sind die Ränge 1 und 2 der hohen Stimmen (PESQ ≈ 4,0). Bei den
tiefen Stimmen ist 56 auf Rang 5, 157 auf Rang 25 (gewählt für eine zweite Klangfarbe). Der Median aller Sprecher liegt bei PESQ 3,5.

## 3. Messwerte und Ergebnisse

### 3.1 Echtzeitfaktor, Kerne, Last, Ladezeit

RTF = Synthesezeit ÷ Audiodauer je Clip. Die Audiodauer ist hier die Rohdauer einschließlich der Rand-Stille, die die Engine
erzeugt. „Kerne“ = Prozesszeit ÷ Wandzeit. Die Last ist `loadavg` (1 min) vor dem Clip, einschließlich der eigenen Threads.

| Stimme | Sätze RTF Median / p90 / max | Wörter RTF Median / p90 | Kerne | Last vorher Median (min–max) | Laden |
|---|---|---|---|---|---|
| Coqui-VITS Thorsten (Torch) | 0,89 / 1,18 / 1,45 | 0,65 / 0,73 | 2,3 | 1,8 (0,8–2,4) | 29 s |
| Coqui-VITS Thorsten (ONNX, 4 Threads) | 0,34 / 0,36 / 0,43 | 0,25 / 0,38 | – | nicht protokolliert | – |
| Piper mls #33 | 0,067 / 0,080 / 0,51¹ | 0,070 / 0,090 | 3,8 | 1,1 | 5,4 s |
| Piper mls #125 | 0,068 / 0,076 / 0,077 | 0,066 / 0,094 | 3,9 | 1,4 | 2,0 s |
| Piper mls #56 | 0,067 / 0,072 / 0,082 | 0,063 / 0,074 | 3,9 | 1,5 | 2,2 s |
| Piper mls #157 | 0,067 / 0,075 / 0,077 | 0,071 / 0,091 | 3,8 | 1,7 | 1,8 s |
| Coqui glow-tts tr (Torch) | 0,90 / 1,23 / 1,85 | 0,71 / 0,83 | 2,2 | 1,7 (1,4–2,1) | 100 s |
| Chatterbox V3 tr | **12,3 / 32,3 / 97,3**² | 26,2 / 50,0 | 3,7 | **5,1 (4,0–6,7)** | 44 s |
| Chatterbox V3 ar | **16,2 / 30,8 / 43,5** | 24,1 / 79,6 | 3,5 | **4,2 (3,4–7,2)** | 23 s |
| Chatterbox V3 ar, Paare (Seed 1 / Seed 2) | 18,4 / 22,3 bzw. 18,7 / 22,2 | – | 3,8 | 4,1 bzw. 4,0 | 23–24 s |

¹ erster Clip mit Aufwärmen (Sitzung, Phonemisierer). ² erster Clip, Last stieg dabei von 4,6 auf 6,5.

- **ONNX-Lastlauf Thorsten:** 1 Prozess × 4 Threads: Wandzeit 25,8 s für 68,5 s Audio (RTF 0,38 einschließlich
  Tokenizer). 4 Prozesse × 1 Thread gleichzeitig: je Prozess RTF 1,06–1,16, zusammen 275 s Audio in 80,9 s (**RTF effektiv 0,29**).
- **Piper, alle 236 Sprecher × 2 Sätze:** RTF Summe 0,055, Median 0,054, p90 0,065.
- **Ehrliche Einordnung der Last:**
  - Coqui und Piper liefen bei Last ≤ 2,4, also ohne nennenswerten Wettbewerb.
  - Chatterbox lief bei Last 3,4–7,2. Mehr als die eigenen 4 Threads bedeuten, dass parallele L1-Bauten Rechenzeit
    abzogen. Auf einem freien Rechner wären die Chatterbox-Werte schätzungsweise 1,2–1,7-mal besser; sie blieben trotzdem
    mehr als 10-mal langsamer als Echtzeit.
  - Coqui-Torch nutzte nur ≈ 2,3 der 4 Kerne. Der ONNX-Weg ist 2,6-mal schneller und lastet im Parallelbetrieb
    (4 Prozesse × 1 Thread) alle Kerne aus.

### 3.2 Hochrechnung für ≈ 32.500 Clips (≈ 25 h ausgeliefertes Audio) je Sprache auf 4 Kernen

„RTF netto“ ist die Synthesezeit, bezogen auf die Dauer **nach** dem Kürzen der Rand-Stille, also auf das, was ausgeliefert
wird. Grundlage sind Sätze und Wörter. Ø Clip ≈ 2,77 s.

| Stimme | RTF netto | Wandzeit für 25 h | Bemerkung |
|---|---|---|---|
| Piper mls (#125 / #56) | 0,069 / 0,067 | **≈ 1,7 h** | – |
| Coqui-VITS Thorsten, Torch | 1,19 | ≈ 30 h | Coqui hängt ≈ 0,45 s Stille an, 25 % der Rohdauer |
| Coqui-VITS Thorsten, ONNX 1 × 4 Threads | 0,42 | ≈ 10,6 h | – |
| **Coqui-VITS Thorsten, ONNX 4 × 1 Thread** | **0,33** | **≈ 8,2 h** | empfohlen (§5) |
| Coqui glow-tts tr, Torch | 1,12 | ≈ 28 h | ONNX nicht gemessen |
| Chatterbox V3 tr | 20,3 | ≈ 506 h ≈ 21 Tage | ohne Neuerzeugung von Fehlern (§3.4) |
| Chatterbox V3 ar | 23,6 | ≈ 591 h ≈ 25 Tage | ebenso |

Hinzu kommt die Prüfung (§5, Zeile „Schwelle“): Rückerkennung mit whisper-base ≈ 2,7–5,6 s je Clip bei 4 Threads (Median je
Stimme in diesem Lauf, Last 2,7–8). Für alle 32.500 Clips wären das ≈ 30 h; eine Stichprobe von 5 % braucht ≈ 1,5 h. Die physischen Prüfungen
(Dauer, Silbenrate, Pegel) sind für alle Clips praktisch kostenlos.

### 3.3 Größe als WebM/Opus 24 kbit/s (Kette nach ADR 0039, Fortschreibung S4/S5 Nr. 1)

| Stimme | Clips | Audio nach Kürzen | Rand-Stille gekürzt | kbit/s (20 ms) | kbit/s (60 ms) | kB je s | kB je Satz | LUFS vorher |
|---|---|---|---|---|---|---|---|---|
| Thorsten (Torch) | 30 | 61,4 s | 25,4 % | 28,2 | 26,9 | 3,52 | 9,4 | −24,7 |
| Thorsten (ONNX) | 30 | 61,1 s | 10,8 % | 28,2 | 27,0 | 3,53 | 9,4 | −24,8 |
| Piper mls #33 / #125 / #56 / #157 | je 30 | 92,4 / 69,6 / 74,4 / 76,4 s | 2,5–3,8 % | 27,1–27,6 | 24,5–25,1 | 3,39–3,46 | 9,9–12,3 | −13,9 bis −16,6 |
| glow-tts tr | 30 | 63,1 s | 17,5 % | 28,4 | 27,2 | 3,55 | 9,9 | −16,8 |
| Chatterbox tr | 30 | 51,6 s | 5,8 % | 28,6 | 27,3 | 3,57 | 7,7 | −17,8 |
| Chatterbox ar | 61 | 61,9 s | 6,5 % | 29,7 | 28,6 | 3,72 | 6,0 | −19,4 |

- **Ausgleichsgerade über alle 301 Clips** (Dauer 0,15–5,7 s, Median 2,2 s):
  - 20-ms-Rahmen: Größe ≈ **0,42 kB je Clip** (WebM-Kopf und Rahmung) + **3,29 kB je Sekunde** (26,3 kbit/s; VBR
    liegt bei Sprache über dem Nennwert)
  - 60-ms-Rahmen: 0,56 kB + 2,98 kB/s
- **Hochrechnung je Sprache** (32.500 Clips, 25 h): **≈ 310 MB** (20 ms) bzw. ≈ 287 MB (60 ms).
  - PLAN §5.4 rechnet mit ≈ 270 MB, für drei Sprachen also ≈ 0,8 GB. Gemessen sind es ≈ 0,93 GB (20 ms) bzw. 0,86 GB
    (60 ms). Der Blob-Bedarf (LM-15) steigt um ≈ 0,1 GB, von ≈ 0,8 auf ≈ 0,93 GB (nur Audio, ADR 0039 Fortschreibung
    S4/S5 Nr. 9).
  - 60-ms-Rahmen sparen ≈ 7 %. Nach ADR 0039 Fortschreibung Nr. 1 kommen sie nur, wenn die Hörprobe (LM-06) keinen
    Unterschied zeigt; das ist offen.

### 3.4 Fehlerbilder

**Chatterbox V3 (tr und ar)**
- **Kein Clip endet regulär.** Alle 152 Clips (tr 30, ar 61, ar Seed 2 31) enden mit der Warnung `forcing EOS token,
  long_tail=False, alignment_repetition=False, token_repetition=True`. Der Ausrichtungs-Analysator erzwingt also das Ende,
  weil sich Sprach-Tokens wiederholen; das Modell setzt das Ende-Token nie selbst. Das ist mit `repetition_penalty` 1,2
  und dem Abschneiden der letzten 40 ms nach GitHub `master` gemessen.
- **Abbrüche:** 5 von 152 Clips sind nach Silbenrate und Dauer offensichtlich abgeschnitten (über 9 Silben/s):
  - tr `s04`: 0,36 s für 11 Silben. Die Rückerkennung hört nur das erste Wort.
  - ar `s10` und `s14`: je 0,64 s für 13 bzw. 11 Silben
  - ar `w10` (0,40 s) und ar Seed 2 `p13b` (0,28 s)
  - Bei Sätzen sind das 3 von 40 (7,5 %).
  - Im Spektrogramm zeigen tr `s04` und ar `s10` nur einen einzigen Vokalabschnitt.
- **Überlänge mit erfundenem Anhang:** tr `w04` dauert 2,56 s, 3,2-mal so lang wie glow-tts. Die Rückerkennung findet hinter
  dem Wort zusätzliche Silben.
- **Tempo:**
  - tr: Chatterbox spricht im Median 6,2 Silben/s, glow-tts 4,3. Die Netto-Satzdauer ist im Median um 20 % kürzer.
  - ar-Sätze: 6,6 Silben/s.
  - Für A1-Lernende ist das schnell. Eine Steuerung des Tempos (`cfg_weight`, `exaggeration`) wurde nicht gemessen.
- **Türkisch I/İ:**
  - Die Vorverarbeitung von chatterbox-tts schreibt „I“ als „i“ klein und den Satzanfang groß.
  - Abhilfe im Spike: türkisch klein schreiben und die Großschreibung des ersten Buchstabens unterdrücken.
  - Trotzdem sind die Satzanfänge von `s19` (İ) und `s20` (I) laut Rückerkennung entstellt.
- **Weitere Punkte:**
  - Wasserzeichen PerTh in jeder Ausgabe
  - Standardstimme `conds.pt` von einer unbekannten Person
  - Laufzeitergänzung nötig: `perth` braucht `pkg_resources`; coqui-tts und chatterbox-tts teilen sich `transformers` nur mit einer Ergänzung zur Laufzeit

**Coqui glow-tts (tr)**
- Das Vokabular kennt nur Kleinbuchstaben ohne Zirkumflex. Die Eingabe muss umgeformt werden.
- Ladezeit 100 s (Torch-Pickle, HiFi-GAN 339 MB).
- Rand-Stille hinten im Median 0,54 s.
- `s04` hat einen Rauschvorlauf von 0,8 s mit −34 dBFS und einem tonalen Anteil um 1 kHz (17,8 dB über der Umgebung). Die
  Kürzung bei −40 dB entfernt ihn nicht.
- `s02` löst in whisper-base eine Wiederholungsschleife aus.

**Coqui-VITS Thorsten (de)**
- gruut meldet zwei Zeichen, die im Modellvokabular fehlen und verworfen werden: das Unsilbigkeitszeichen in Diphthongen (`s01`,
  `s14`) und den Bindebogen der Affrikate pf (`s14`).
  - Die ONNX-Probe wurde fehlerfrei erkannt, die Torch-Probe von `s14` nicht.
  - Weil VITS mit Zufallsrauschen erzeugt, ist ein systematischer Fehler damit nicht belegt.
  - In L3 gehört das auf die Prüfliste für Aussprache-Überschreibungen (`web/inhalte/lernapp/aussprache/de.json`).
- Sonst unauffällig: gleichmäßiges Tempo (3,7–4,3 Silben/s), keine Ausreißer in Dauer oder Pegel, kein Clipping.

**Piper `de_DE-mls-medium`**
- Die Rohausgabe ist laut, mit −14 bis −17 LUFS und vereinzeltem Clipping bis 0,03 % der Abtastwerte.
- Einzelne Wörter sind extrem kurz: #125 `w01` 0,19 s.
- Einzelne Sätze haben lange Pausen mit Murmelstrecken: #56 `s18` dauert 5,6 s, Thorsten 2,3 s.
- Die SQUIM-Schätzwerte (PESQ ≈ 4) messen nur Störungen im Signal, nicht ob der Inhalt verständlich ist (§3.5).
- Nicht untersucht ist, ob die Engine nicht zur Stimme passt: piper-tts 1.8.0 mit espeak-ng 1.52 gegen eine Stimme im
  Format `piper_version` 1.0.0.

### 3.5 Rückerkennung mit Whisper (Verständlichkeit)

whisper-base q8 im headless Chromium, 332 Clips. Der Lauf ging von 12:48 bis 13:11 UTC, 4 Threads, `crossOriginIsolated` war wahr.
Seite und Worker stellten **0 Anfragen an Dritte** (Playwright-Protokoll); es gab 0 CSP-Verstöße. Die Falle wies 32
browserinterne Verbindungsversuche des Test-Chromium ab (accounts.google.com, android.clients.google.com); keiner davon kam aus
Seite oder Worker. Ausgewertet ist das ausgelieferte Format (WebM/Opus 24 kbit/s). Nur die Seed-2-Paare kommen aus WAV, weil
sie nicht kodiert waren.

**Sätze (je 20)**

| Stimme | Wörter | WER | WER mild | CER Ø | fehlerfrei | Trefferanteil Ø | Satz-WER mild Median / p90 | ohne jeden Treffer |
|---|---|---|---|---|---|---|---|---|
| Thorsten (Torch) | 153 | 11,8 % | **9,8 %** | 5,0 % | 9/20 | **0,92** | 0 / 26 % | 0 |
| Thorsten (ONNX) | 153 | 9,8 % | **8,5 %** | 4,5 % | 12/20 | **0,93** | 0 / 26 % | 0 |
| Piper mls #33 | 153 | 39,2 % | 37,3 % | 24,3 % | 5/20 | 0,73 | 24 / 103 % | 0 |
| Piper mls #125 | 153 | 40,5 % | 39,2 % | 25,0 % | 2/20 | 0,68 | 29 / 100 % | 0 |
| Piper mls #56 | 153 | 53,6 % | 52,3 %¹ | 28,8 % | 2/20 | 0,62 | 31 / 106 % | 2 |
| Piper mls #157 | 153 | 34,6 % | 33,3 % | 22,8 % | 4/20 | 0,71 | 25 / 87 % | 1 |
| glow-tts tr | 106 | 66,0 % | 62,3 %¹ | 30,9 % | 1/20 | 0,60 | 45 / 103 % | 0 |
| Chatterbox tr | 106 | 47,2 % | 44,3 % | 19,9 % | 3/20 | 0,61 | 50 / 72 % | 0 |
| Chatterbox ar | 83 | 80,7 % | 80,7 % | 49,1 % | 0/20 | **0,22** | 78 / 100 % | **8** |

¹ mit je einer Erkennungsschleife; ohne diesen Satz: Piper #56 40,4 %, glow-tts 47,5 %.

**Vergleichswerte aus S2 (whisper-base, gleiche Normalisierung, andere Sätze)**
- de: menschlich kurz 11,2 %, MMS synthetisch 15,6 %
- tr: menschlich lang 36,3 %, MMS 29,7 %
- ar: menschlich lang 50,9 %, MMS 65,8 %

**Einzelwörter (isoliert, < 1 s):** whisper-base erkennt sie bei keiner Stimme verlässlich, auch nicht bei Thorsten (0–1 von 10).
Typisch sind Ersatzwörter oder ganze erfundene Sätze; bei Piper liegt die WER über 300 %. Chatterbox tr erkennt 6 von 10, ar 0
von 10. **Folge:** Die Rückerkennung mit base taugt nicht als Prüfung von Lemma-Clips (§5, Zeile „Schwelle“).

**Zusatzprobe whisper-small** (q8, 70 Clips: tr-Sätze beider Stimmen, ar-Sätze und -Wörter; 13:11–13:25 UTC, 0 Fremdanfragen).
base ist für tr und ar laut S2 zu schwach, deshalb diese Probe. Das Modell ≈ 249 MB lag nur im Scratchpad und ist gelöscht.

| Stimme | Wörter | WER | WER mild | CER Ø | fehlerfrei | Trefferanteil Ø | Satz-WER mild Median / p90 | Treffer ≥ 0,6 / ≥ 0,75 |
|---|---|---|---|---|---|---|---|---|
| glow-tts tr | 106 | 33,0 % | **31,1 %** | 9,4 % | 4/20 | **0,74** | 18 / 67 % | 14 / 12 von 20 |
| Chatterbox tr | 106 | 33,0 % | **30,2 %** | 13,4 % | 5/20 | **0,73** | 33 / 52 % | 17 / 10 von 20 |
| Chatterbox ar | 83 | 44,6 % | **44,6 %** | 24,8 % | 4/20 | **0,55** | 50 / 82 % | 9 / 7 von 20 |
| Chatterbox ar, Wörter | 10 | 100 % | 100 % | 41,8 % | 2/10 | – | – | – |

Vergleich S2 (small): tr menschlich 16,3 %, MMS 16,1 %; ar menschlich 22,3 %, MMS 44,1 %. Mit small erreichen beide
tr-Stimmen etwa die doppelte WER menschlicher Sprache und liegen gleichauf. Der Abbruch `s04` bleibt bei Chatterbox
unverständlich, ebenso der Satzanfang von `s19`. Chatterbox ar liegt bei 44,6 %, also so schlecht wie das MMS-Arabisch ohne
Vokalzeichen aus S2 und doppelt so hoch wie menschliche Sprache. 2 von 20 Sätzen bleiben ohne Treffer (`s11`, `s13`).
Latenz small: Median ≈ 11–12 s je Clip bei Last 5–8.

**Lesart**
- **de:** Thorsten erreicht Werte wie menschliche Sprache aus S2; Torch und ONNX sind gleichwertig. Piper `de_DE-mls-medium`
  ist mit allen vier Sprechern deutlich schlechter verständlich (WER 33–40 %, Trefferanteil 0,62–0,73).
- **tr:** glow-tts und Chatterbox liegen mit base (Trefferanteil 0,60 gegen 0,61) und mit small (0,74 gegen 0,73) gleichauf.
  Beide sind schlechter verständlich als menschliche Sprache und als MMS in S2. Chatterbox ist damit **nicht besser** im
  Sinne von L3-E10.
- **ar:** Mit base ist die Erkennung schwach (Trefferanteil 0,22, 8 von 20 Sätzen ohne Treffer). Teils liegt das an base (S2:
  ar ohne automatische Rückmeldung). Mit small steigt der Trefferanteil auf 0,55, bleibt aber auf dem Niveau des MMS-Arabisch
  ohne Vokalzeichen.

### 3.6 Vokalisierungstest Arabisch (Chatterbox V3), so weit messbar

ADR 0045 Nr. 11 verlangt ≈ 200 Minimalpaare mit Harakat, Schadda und Tanwin. Gemessen wurden **14 Gruppen mit 31 Formen und
zwei Seeds**. Das reicht für ein negatives Urteil, nicht für ein positives.

**(a) Unterscheidet das Modell die Varianten überhaupt?**

Gemessen wurde der DTW-Abstand der MFCC zwischen den Varianten einer Gruppe und mit dem Abstand derselben Form zwischen zwei
Seeds verglichen. Ein Verhältnis über 1 heißt, dass sich die Varianten stärker unterscheiden als das Zufallsrauschen.

| Gruppe | Art | Verhältnis | Dauer mit ÷ ohne Schadda (Seed 1 / Seed 2) |
|---|---|---|---|
| p01, p02 | Vokal (Aktiv/Passiv) | 1,27 / 1,16 | – |
| p03, p04, p05 | Schadda | 1,06 / 1,26 / 0,85 | 1,05/1,10 · 1,17/0,83 · 0,88/1,16 |
| p06, p12 | Vokal | 1,13 / 1,05 | – |
| p07 | Tanwin-Varianten (3) | 1,08 | – |
| p08 | Kasusvokal (3) | 1,07 | – |
| p09 | Personalendung (3) | 1,16 | – |
| p10 | Partizip aktiv/passiv | 1,03 | – |
| p11 | Hamza gegen langes a | 1,06 | – |
| p13, p14 | Schadda | 0,88 / 1,06 | 1,11/0,42 (Seed 2 abgebrochen) · 1,00/0,95 |
| **Median (14 Gruppen)** | | **1,07**; nur 2 von 14 über 1,2 | Schadda im Mittel ≈ 0,96, keine Längung |
| **Eichung:** 14 sicher verschiedene Wörter | | **1,31** (p10 der Paare 1,20) | – |

Die Varianten liegen also fast so nah beieinander wie zwei Zufallsläufe desselben Worts. Eine Schadda müsste den Konsonanten
hörbar längen; im Mittel ist die Form mit Schadda gleich lang oder kürzer.

**(b) Rückerkennung je Merkmal**

Ausgewertet sind die 20 Sätze, Wortebene, mild normalisiert. Weil die Normalisierung die Harakat entfernt, zeigt das nur, ob das
Wort am Konsonantengerüst erkannt wurde, **nicht**, ob es richtig vokalisiert war. Whisper schrieb fast nie Harakat: base 12 in
92 Abschriften, small 4 in 30.

| Merkmal | Wörter | erkannt (base) | erkannt (small) | Sätze |
|---|---|---|---|---|
| Schadda (im Wort) | 11 | 4 (36 %) | 7 (64 %) | s01, s02, s05, s08, s10, s14, s16, s17, s20 |
| Sonnenbuchstabe nach Artikel | 11 | 2 (18 %) | 6 (55 %) | s02, s05, s06, s07, s08, s12, s15, s16, s17 |
| Tanwin | 23 | 6 (26 %) | 14 (61 %) | s01–s04, s06–s08, s10, s12–s14, s17, s18, s20 |
| Hamzat al-wasl (verbunden) | 22 | 5 (23 %) | 12 (55 %) | s02–s05, s07–s09, s11–s13, s15–s17, s19, s20 |
| Dolch-Alif | 2 | 0 | 1 | s14, s17 |
| ohne diese Merkmale | 26 | 6 (23 %) | 15 (58 %) | – |

Es gibt keinen messbaren Unterschied zwischen den Merkmalen; das Niveau ist durchweg niedrig. Ob ein Sonnenbuchstabe
angeglichen, eine Wasla verschliffen oder ein Tanwin vor Wasla mit Hilfsvokal gesprochen wird (`s07`), kann keine
Rückerkennung prüfen. Das verlangt menschliches Hören (LM-25) oder eine Phonem-Erkennung. Die im ersten Lauf vorbereitete
Phonem-Erkennung (wav2vec2-xlsr-53-espeak-cv-ft, `skripte/phon_eval.py`) wurde nicht ausgeführt: Das Venv ist gelöscht, und
sie ist für die eigene ClArTTS-Stimme vorgesehen (§6).

**Urteil:** Chatterbox V3 hat den Vokalisierungstest **nicht bestanden**:
- Vokalvarianten werden nicht nachweisbar unterschieden (Median 1,07 gegen 1,31).
- Die Schadda wird nicht gelängt.
- Kein Clip endet regulär; 3 von 20 Sätzen sind abgeschnitten.
- Die Wortverständlichkeit ist gering (Trefferanteil 0,22 mit base, 0,55 mit small).

### 3.7 Hörbewertung – vorläufige Notiz ohne menschliches Hören

**Grundlage:** 15 Spektrogramme (0–8 kHz, `auswertung/spektro/`), Längen, Tempo, Pegel und die Rückerkennung. **Niemand hat
die Proben gehört.** Die Notiz ersetzt die Hörabnahme LM-06 nicht. Sie sagt nur, wo die Abnahme genau hinhören sollte.

| Stimme | Eindruck aus den Messungen | vorläufig |
|---|---|---|
| Coqui-VITS Thorsten | klare, kompakte Silbenstruktur; Pausen sauber still; gleichmäßiges Tempo ≈ 4 Silben/s; beste Verständlichkeit | geeignet; Abnahme: Diphthonge, pf (`s01`, `s14`) |
| Piper mls (4 Sprecher) | unregelmäßige Pausen mit Rauschen oder Murmeln, sehr kurze Einzelwörter, laute Rohausgabe; signaltechnisch sauber (PESQ-Schätzung ≈ 4), inhaltlich schlecht verständlich | nicht als Standard und nicht als zweite Stimme |
| Coqui glow-tts tr | ruhiges Tempo; vereinzelt Rauschvorlauf mit Ton (`s04`); mäßige Verständlichkeit | hörbar, aber Lizenzkette offen (§4) |
| Chatterbox tr | natürlichere Satzmelodie in den Spektrogrammen (`s13`), aber zu schnell; ein Abbruch, ein erfundener Anhang, entstellte Satzanfänge mit I/İ | nicht besser als glow-tts |
| Chatterbox ar | schnell (6,6 Silben/s), Abbrüche, Vokalvarianten kaum unterschieden | nicht geeignet |

### 3.8 Pegel und Rand-Stille (Rohausgabe, vor der Normierung)

| Stimme | Sprachpegel (p95 der 20-ms-Rahmen) | Rand-Stille vorn / hinten (Median) | Clipping (max. Anteil) |
|---|---|---|---|
| Thorsten Torch / ONNX | −18,8 / −18,5 dBFS | 0,28 / 0,63 s bzw. 0,28 / 0,18 s | 0 |
| Piper mls | −8,4 bis −10,8 dBFS | 0,04–0,08 / 0,15–0,18 s | bis 0,03 % |
| glow-tts tr | −11,5 dBFS | 0,08 / 0,54 s | 0 |
| Chatterbox tr / ar | −12,9 dBFS | 0,10 / 0,14–0,16 s | bis 0,003 % |

Die geplante Kette (EBU R128, Rand-Stille kürzen, Spitze ≤ −1 dBFS) gleicht das aus. Nach dem Kürzen bleiben ≈ 60 ms Rand.

## 4. Lizenzkette je Stimme (an den Primärquellen bestätigt am 17. und 20.10.2026)

Die Primärquellen vom 20.10. sind byte-gleich mit denen vom 17.10. (SHA-256): `.models.json`, MODEL_CARD mls, Chatterbox-LICENSE und
-README. Die HF-Commits sind unverändert.

| Stimme | Gewichte | Daten | Befund | Ergebnis |
|---|---|---|---|---|
| **Coqui-VITS Thorsten** | `.models.json` (idiap `dev`): `"license": "apache 2.0"`, `"author": "@thorstenMueller"`, Release `v0.7.0_models`. HF `Thorsten-Voice/VITS` `54f782a`, `license: apache-2.0`. Code coqui-tts **MPL-2.0** (nur lokal) | HF `Thorsten-Voice/TV-44kHz-Full` `2b61b98`: `license: cc0-1.0`, README „CC0“ | **LM-23:** Die Release-Datei ist bitgleich mit HF (`ebb3792e…de66`); `config.json` identisch; `restore_path: None`. Im Checkpoint: Schritt 543.000, Epoche 763, ≈ 712 Schritte je Epoche × Batch 32 ≈ 22.800 Clips, passend zu „Thorsten-neutral-Dec2021“ und einem Zähler ab 0. `run_name` „vits-0.6.1-Thorsten-DE“, Phonemisierer gruut | **frei.** Indiz für Training von Grund auf. Das heutige Repo-Rezept weicht im Textreiniger ab; eine Bestätigung durch Thorsten Müller ist optional |
| **Piper `de_DE-mls-medium`** | `rhasspy/piper-voices` `c10ece1` (Stand 17.09.2026), ONNX = LFS-OID | MODEL_CARD: „License: CC-BY 4.0“, „Trained from scratch“. OpenSLR 94: „License: CC BY 4.0“ (LibriVox) | Sprecher #33 = MLS 5244, #125 = MLS 7320, #56 = MLS 143, #157 = MLS 1613 | **frei, Namensnennung Pflicht** (fachlich nicht empfohlen, §3.5) |
| **Coqui glow-tts tr + HiFi-GAN** | `.models.json`: beide `"license": "MIT"`, `"author": "Fatih Akademi"`, „unknown speaker from the Common-Voice dataset“, Release `v0.6.1_models` | laut Register Common Voice (CC0) | **Widerspruch:** Die eingebettete Konfiguration von glow-tts nennt den Datensatz `custom_turkish` unter `…/TTS_Datasets/Talent_TR_Male/Talent_TR_Male_Dateset_v1` („Trainign from Scratch“). Der HiFi-GAN-`data_path` zeigt auf dieselben WAV. Die Checkpoints passen zu ≈ 1.200 bzw. ≈ 10.900 Clips. Einen öffentlichen Datensatz „Talent_TR_Male“ gibt es nicht (Websuche 17.10.); der Name deutet auf eine Sprecheraufnahme mit unbekannten Rechten | **Kette nicht belegt.** Nicht ausliefern, bis Fatih Akademi die Datenrechte schriftlich bestätigt |
| **Chatterbox Multilingual V3** | HF `ResembleAI/chatterbox` `5bb1f6ee` (10.06.2026), `license: mit`; GitHub `LICENSE` „MIT License, Copyright (c) 2025 Resemble AI“; PyPI 0.1.7 (26.03.2026) weiter die neueste Version | „Trained on 0.5M hours of cleaned data“, Herkunft undokumentiert | Wasserzeichen PerTh in jeder Ausgabe; Standardstimme `conds.pt` ohne Herkunftsangabe | **mit Auflagen** (Restrisiko Daten, Stimme unbekannter Person) |
| ClArTTS (für §6) | – | HF `MBZUAI/ClArTTS` `2f6e820`: `license: cc-by-4.0` | Werk: LibriVox-Lesung von al-Māwardī, „Adab ad-Dunyā wa-d-Dīn“ (2011) | frei, Namensnennung; Restrisiko Leistungsschutz (§6.1) |

**Nebenbefunde:**
- coqui-tts **0.28.0** erschien am 19.10.2026. Es erfüllt die Mindestreife von 14 Tagen erst ab 02.11.2026, deshalb bleibt der
  Pin 0.27.5 (PLAN §12).
- piper-tts 1.8.0 enthält espeak-ng 1.52.0.1 (PLAN §12 `[Release prüfen]`).
- coqui-tts und chatterbox-tts brauchen getrennte Venvs: chatterbox pinnt `transformers==5.2.0`, coqui braucht eine
  Laufzeitergänzung.

## 5. Entscheidungsvorschlag für die offenen Punkte der ADRs

| Punkt | Vorschlag | Begründung |
|---|---|---|
| **ADR 0045 Nr. 11 / L3-E10, de (LM-23)** | **Standard Coqui-VITS Thorsten bestätigt.** Erzeugt wird über den eigenen **ONNX-Export** mit onnxruntime, 4 Prozesse × 1 Thread (RTF 0,33, ≈ 8 h je 25 h Audio), statt über Torch (≈ 30 h). Stimme im Manifest `tts:coqui-vits-thorsten-onnx@<sha-onnx>`, dazu der SHA der Quelldatei `ebb3792e…`. Namensnennung: „Stimme: Thorsten Müller (Thorsten-Voice, CC0); Modell: Coqui-TTS-VITS, Apache-2.0“ | Kette frei (§4); Verständlichkeit wie menschliche Sprache (WER 8,5–9,8 %); Torch und ONNX gleichwertig |
| … Ersatz/Vergleich de | Piper `de_DE-mls-medium` **nicht** als Ersatz oder zweite Stimme. Ersatz bei Ausfall: `Thorsten-Voice/Kokoro`, vorher eigener Test mit derselben Kette. Eine zweite Stimme für Dialoge kommt nur aus menschlichen Aufnahmen (LM-26) | mls: WER 33–40 %, Murmelstrecken, Abbrüche einzelner Wörter (§3.4/3.5) |
| **ADR 0045 Nr. 11 / L3-E10, tr (LM-24)** | **Übergang Coqui glow-tts zurückstellen**, bis Fatih Akademi die Rechte am Datensatz „Talent_TR_Male“ schriftlich bestätigt. Danach ist glow-tts die Übergangsstimme, mit Prüfkette (Zeile „Schwelle“) und dem Hinweis auf eine Sprecherin/einen Sprecher unbekannter Herkunft. **Chatterbox nicht als Übergang**: Die Verständlichkeit ist nicht besser (Trefferanteil 0,61 gegen 0,60 mit base, 0,73 gegen 0,74 mit small; WER mild 30,2 gegen 31,1 %). Dazu kommen 100 % Zwangsende, Abbrüche, Überlänge, der I/İ-Fehler, ≈ 21 Tage CPU je 25 h und das Datenrestrisiko. **Standard bis dahin: tr ohne Sprachausgabe („Audio folgt“)** und die eigene Stimme (LM-26 a) vorziehen | KERN §4 „nur Stimmen mit freier Kette“; L3-E10 verlangt für Chatterbox eine *bessere* Hörprobe *und* einen *besseren* Verständlichkeitstest |
| **ADR 0045 Nr. 11 / L3-E10, ar (LM-25)** | **Chatterbox: Vokalisierungstest nicht bestanden** (§3.6). Arabische Hörübungen bleiben „Audio folgt“, bis die eigene Stimme auf ClArTTS die Prüfkette und die Hörabnahme besteht oder menschliche Aufnahmen für den A1/A2-Kern vorliegen (LM-26 b). ADR 0039 „OFFENE FRAGE“ (100 % Audio ar) bleibt offen | Vokalvarianten nicht unterschieden, Schadda nicht gelängt, Abbrüche, Trefferanteil 0,22 (base) bzw. 0,55 (small) |
| **PLAN §5.4 „Echtzeitfaktor `[eintragen]`“** | Thorsten-ONNX 0,33 (≈ 8 h je Sprache); Piper 0,07; glow-tts 1,1 (≈ 28 h); Chatterbox CPU 20–24 (≈ 3 Wochen). Eigene Piper-Stimmen (tr/ar) etwa wie Piper medium, ≈ 0,06–0,07 | §3.1/3.2 |
| **PLAN §5.4 / ADR 0039 Folgen, Größe** | Opus 24 kbit/s VBR in WebM ergibt real ≈ 26–30 kbit/s: **≈ 310 MB je Sprache**, ≈ 0,93 GB für drei. Blob `lernapp` (nur Audio, die Modelle liegen statisch nach ADR 0039 Fortschreibung S4/S5 Nr. 9 und ADR 0042 Fortschreibung Nr. 5) ≈ 0,93 GB statt ≈ 0,8 GB; nur falls whisper-small nach LM-27 über den Blob kommt, zusätzlich ≈ 0,25 GB (LM-15). *Berichtigt in der Gegenprüfung vom 20.10.2026; vorher stand hier „≈ 1,2–1,4 GB statt 1,1–1,3“, also der Stand vor S5.* | §3.3 |
| **ADR 0039 Fortschreibung Nr. 1 (60-ms-Rahmen)** | bleibt 20 ms; 60 ms (−7 %) nur nach der Hörprobe LM-06 | §3.3 |
| **PLAN §6.8 Nr. 6 / ADR 0039 Nr. 6.5 – Schwelle der Rückerkennung** | **Prüfkette je Clip:** (a) **alle Clips** physisch prüfen: Netto-Dauer ≥ 0,25 s; Silbenrate bei Sätzen mit ≥ 3 Silben 2–8 Silben/s; Rand-Stille nach Kürzen ≤ 0,3 s; kein Clipping; Lautheit −23 ± 1 LUFS. Fehler → Neuerzeugung mit anderem Seed, beim zweiten Fehler Hören bzw. Aufnahme. (b) **Sätze mit ≥ 4 Wörtern, de:** whisper-base, Trefferanteil (mild) ≥ 0,75 → in Ordnung; 0,6–0,75 → einmal neu erzeugen, dann hören; < 0,6 → hören bzw. aufnehmen. Gemessen: Thorsten 36/40 ≥ 0,75 und 40/40 ≥ 0,6; Piper 45/80 bzw. 55/80. Erwartet werden ≈ 10 % Zweitlauf. (c) **Lemma-Clips:** keine Rückerkennung (isolierte Wörter mit base unzuverlässig, §3.5); nur (a) und Stichprobe Hören. (d) **tr/ar:** Schwellen erst mit der eigenen Stimme festlegen, mit whisper-small offline (nicht im Browser) | §3.4/3.5; die Prüfung läuft lokal beim Erzeugen, nicht in der App (ADR 0042 bleibt unberührt) |
| **PLAN §12** | coqui-tts 0.27.5 bleibt (0.28.0 erst ab 02.11.2026); espeak-ng 1.52.0.1 eintragen; je Engine ein eigenes Venv | §4 Nebenbefunde |
| **ADR 0045 „Weiter offen“** | Neu: Datenherkunft glow-tts tr („Talent_TR_Male“). Erledigt: Konfiguration der Coqui-Release-Datei v0.7.0 (LM-23); ClArTTS-Werk identifiziert. Weiter offen: Chatterbox-Trainingsdaten und Standardstimme; Schutzstatus der ClArTTS-Lesung in DE/EU | §4 |
| **LM-06** | Hörabnahme konkret: de Thorsten, je 20 Sätze + 10 Wörter (Hörproben im Scratchpad); auf Diphthonge und pf achten. tr: glow-tts erst nach Klärung der Rechte. ar: keine Abnahme nötig, solange keine Stimme den Test besteht | §3.7 |

## 6. Plan für eigene Stimmen (ClArTTS, eigene Aufnahmen) mit Aufwand

### 6.1 ClArTTS – was der Spike geklärt hat
- **Herkunft** (offener Punkt in ADR 0045, „welches LibriVox-Werk“):
  - Laut Paper (Kulkarni u. a., Interspeech 2023, S. 5512) ist es das Hörbuch „Kitāb Adab ad-Dunyā wa-d-Dīn“ von Abū l-Ḥasan
    al-Māwardī (972–1058).
  - LibriVox-Projektseite: Sprecher Youssef Safiljil, Katalogdatum 23.07.2011, 17:06:45 h, 21 Abschnitte; Textvorlage ist eine
    PDF bei Arabisch-Wikisource.
  - Das Werk ist rund 1.000 Jahre alt. LibriVox erklärt die Aufnahme als gemeinfrei „in the USA“.
  - Für Deutschland bleibt ein **geringes Restrisiko** beim Leistungsschutz des Sprechers (§§ 73 ff. UrhG); die
    LibriVox-Widmung wirkt hier als einfache Nutzungserlaubnis.
  - ClArTTS selbst: HF-Karte `license: cc-by-4.0` (Commit `2f6e820`, 01.10.2025, am 20.10. unverändert).
- **Formulierung:** Das Paper schreibt „publicly available … for research purposes“. Maßgeblich ist die Lizenzangabe CC BY 4.0
  der Datensatzkarte. `www.clartts.com` war am 17.10.2026 nicht auflösbar (DNS). Eine Bestätigung bei MBZUAI per Mail ist
  sinnvoll, aber kein Blocker.
- **Inhalt:** Das Werk ist ein ethisch-religiöses Prosawerk. Die Lesung enthält deshalb vermutlich zitierte Koranverse und
  Hadithe. KI-Regel 2 betrifft, was vertont wird, nicht die Trainingsdaten; ein Ausschluss folgt daraus also nicht. Die
  religiöse Prüfung muss es aber wissen (LM-25). *Vorschlag der Gegenprüfung (20.10.2026):* vorsorglich Äußerungen mit Koran-
  oder Hadith-4-Gramm-Treffer (Normalisierung wie der Wächter, KERN §3) vor dem Training aussortieren, bis LM-25 anders
  entscheidet.
- **Umfang:**
  - 9.500 + 205 Äußerungen (Paper: 10.334, 12 h 10 min), 40,1 kHz, ein männlicher Sprecher
  - Transkripte von drei Annotatoren voll vokalisiert, zwei Prüfrunden
  - Download 3,2 GB Parquet (Audio als float64); nach Umwandlung in 22,05 kHz/16 Bit ≈ 1,9 GB
- **Erwartbare Qualität:** Glow-TTS auf ClArTTS erreichte im Paper MOS 3,84 ± 0,1 (Original 4,39; 30 Hörer). Auf dem
  Arabic Speech Corpus waren es 3,19.
- **espeak-ng ist für Arabisch als Phonemisierer ungeeignet.** Stichprobe mit espeak-ng 1.52.0.1 aus piper-tts:
  - Hamzat al-wasl nach „wa“ wird als langes ā gelesen.
  - Sonnenbuchstabe + Schadda ergibt ein dreifaches r.
  - ṭ, ẓ und ṣ verlieren die Emphase.
  - w nach Vokal wird zum Vokal mit Silbengrenzen.
  - Für das Training deshalb **eigene Umschrift** (piper1-gpl `--data.phoneme_type text`, Regeln wie `skripte/bw_phon.py`,
    erweitert um Pausalformen) oder direkt vokalisierte Grapheme wie im Paper.
  - Vorteil: Pausalform (Waqf) oder volle Endung (Iʿrāb) werden steuerbar, und espeak-ng (GPL) fällt aus der Kette.

### 6.2 Ablauf und Aufwand (Arabisch auf ClArTTS)

| Schritt | Inhalt | Aufwand | Wo |
|---|---|---|---|
| 1 | ClArTTS laden und nach WAV 22,05 kHz wandeln; Tags `[B] [H] [*] [O]` und Äußerungen mit unvollständiger Vokalisierung aussortieren (Quote Harakat je Buchstabe); vorsorglich auch Äußerungen mit Koran- oder Hadith-4-Gramm (§6.1, LM-25); Lautheit normieren | ≈ 0,5 Tag Agent, ≈ 6 GB Platte vorübergehend | Rechner nach LM-26 (hier zu wenig Platte) |
| 2 | Umschrift-Regeln (Artikel, Sonnenbuchstaben, Wasla, Schadda, Tanwin, Tāʾ marbūṭa, Pausalformen) mit Prüfliste von ≈ 200 Wörtern bzw. Minimalpaaren (ADR 0045, offen) und Unit-Tests | 2–3 Tage Agent | lokal |
| 3 | Feinabstimmung mit piper1-gpl ab sauberem Startpunkt: `en_US-ljspeech-medium` (`lj-med_1000.ckpt`, 846 MB, Daten gemeinfrei, „Trained from scratch for 1000 epochs“) oder `de_DE-mls-medium` (`epoch=128-step=5149698.ckpt`, 926 MB, CC BY 4.0). Nie lessac oder ryan | ≈ 150.000–300.000 Schritte; Schätzung 1–2 Tage auf einer GPU der 24-GB-Klasse; auf den 4 CPU-Kernen hier praktisch nicht machbar | GPU-Rechner (LM-26) |
| 4 | Export nach ONNX; Auswertung mit derselben Kette wie S3: Prüfkette §5, Rückerkennung mit whisper-small, Minimalpaare ≈ 200 mit Eichung (§3.6), Phonem-Erkennung (`skripte/phon_eval.py`) | 0,5 Tag Agent | lokal |
| 5 | Hörabnahme durch eine arabische Lehrkraft (Vokalisierung, Register, Tempo); Freigabe als Stimme `tts:clartts-piper@<sha>` | 2–3 h Mensch | LM-25 |

- **Summe Arabisch:** ≈ 4–6 Agententage, 1–2 GPU-Tage und 2–3 h Lehrkraft.
- **Erzeugung danach** mit Piper/ONNX (RTF ≈ 0,06–0,07 wie `de_DE-mls-medium`, ≈ 2 h je 25 h Audio).
- **Bestanden ist der Vokalisierungstest, wenn:**
  - das Paar-Verhältnis im Median ≥ 1,2 liegt (Eichung: verschiedene Wörter ≈ 1,3)
  - die Schadda-Form im Mittel ≥ 1,1-mal so lang ist
  - kein Abbruch vorkommt
  - die Lehrkraft in der Hörprobe ≥ 95 % der Formen als richtig vokalisiert bestätigt
- **Risiken:**
  - klassisches Register und Tempo eines Hörbuchs; Abdeckung des Alltagswortschatzes A1/A2 prüfen
  - Dialekt des Sprechers
  - Restrisiko Leistungsschutz
  - Arabic Speech Corpus (CC BY 4.0, 1.813 Sätze MSA, Damaszener Aussprache) nur ergänzend, sonst mischen sich zwei Sprecher

### 6.3 Eigene Aufnahmen (Türkisch als Ziel, Arabisch optional)
- **Sprecherin oder Sprecher aus der Gemeinde** mit Vereinbarung nach der Vorlage
  `web/docs/recht/entwuerfe/vereinbarung-sprecher-lernapp.md` (L0-04): Modul A für die Aufnahmen (Standard CC BY-SA 4.0) und
  gesondert Modul B (B1 Training, B2 Klonen), jeweils mit Regelung des Widerrufs. L0-E07, LM-26 und ADR 0045 Nr. 11 nennen
  noch „CC0 oder Rechteübertragung“; welche Fassung gilt, entscheidet Recht (D-L11, LM-26). *Angeglichen in der Gegenprüfung
  vom 20.10.2026.*
- **Texte:** 1.500–3.000 Sätze aus den eigenen A1–B1-Inhalten, die den Lernwortschatz abdecken, ohne religiöse Formeln. Die
  Phonem-Abdeckung wird geprüft.
- **Aufnahme:** ruhiger Raum, USB-Mikrofon, 48 kHz/24 Bit, im Audio-Studio der Verwaltung oder mit Audacity. 2–4 h fertiges
  Audio brauchen ≈ 10–16 h Sitzungszeit in 4–6 Terminen.
- **Training:** wie §6.2 Schritt 3, 1–2 GPU-Tage. Türkisch kann espeak-ng `tr` nutzen; die Stichprobe zeigte eine saubere
  Umschrift.
- **Abkürzung ohne Training** (Übergang, nur mit Einwilligung):
  - Chatterbox kann mit ≈ 10 s Referenzaufnahme der eingewilligten Person klonen (nur mit Modul B2 der Vereinbarung).
  - Das ersetzt die unbekannte Standardstimme durch eine Gemeindestimme.
  - Es löst aber weder das Datenrestrisiko des Modells noch die Probleme aus §3.4 (Tempo, Abbrüche, Zwangsende) und braucht
    eine GPU (≈ 3 Wochen CPU je 25 h).
- **Aufwand Türkisch:**
  - Mensch: 10–16 h Aufnahme + 2 h Abhören
  - Agent: 2–3 Tage (Skript, Schnitt, Prüfung, Training, Auswertung)
  - GPU: 1–2 Tage
- **Reihenfolge:** tr zuerst. Es gibt dort keine freie Übergangsstimme, und die Aufnahme ist kleiner als der arabische Kern A1/A2
  (LM-26 b, ≈ 10–15 h).

## 7. Risiken

- **Messbedingungen:**
  - Parallele L1-Bauten haben die Chatterbox-Messung (Last bis 7,2) und die Latenz der Rückerkennung (Last bis 8) verzerrt.
    Die WER ist unabhängig davon, weil die Dekodierung gierig und damit deterministisch ist.
  - Kein Telefon, keine GPU.
- **Kleine Stichprobe:** 20 Sätze und 10 Wörter je Stimme, 14 Paar-Gruppen. Das reicht für klare Unterschiede (Thorsten gegen
  mls, Chatterbox ar), nicht für feine Abstufungen (glow-tts gegen Chatterbox tr).
- **Rückerkennung ist kein Hören:**
  - Whisper vervollständigt plausibel und kann schlechte Aussprache gutmütig erkennen.
  - Umgekehrt scheitert base an isolierten Wörtern und an Arabisch.
  - Vokalisierung prüft Whisper nach der Normalisierung gar nicht.
- **Piper mls:** Die schlechten Werte könnten teilweise von einer Unverträglichkeit zwischen Engine 1.8.0 und dem Modell kommen.
  Für die Empfehlung ändert das nichts, denn Thorsten ist frei und deutlich besser.
- **Thorsten:** Ein Modell von 2022 ohne Pflege. Coqui ist eingestellt, gepflegt wird nur der Fork. Der eigene ONNX-Export
  macht die Erzeugung unabhängig vom Torch-Stapel; der Export selbst braucht einmal coqui-tts.
- **Lizenz:** Ob die Bedingungen von Gewichten und Daten für das erzeugte Audio gelten, ist rechtlich ungeklärt (L0-E03,
  konservative Linie). glow-tts tr ist nicht belegt. Chatterbox hat ein Datenrestrisiko. ClArTTS hat ein Restrisiko beim
  Leistungsschutz.
- **Plan:** Für tr und ar hängt Audio an Menschen und GPU (LM-26). Ohne sie bleiben tr und ar bei „Audio folgt“; die Lern-App
  bleibt ohne Sackgasse nutzbar (KERN §4).

## 8. Aufräumen

- **Prozesse per PID beendet:** 11974 (Server 8731) und 11975 (Falle 8739). Die Chromium-Instanzen beider Läufe hat
  Playwright mit `browser.close()` beendet. Danach lief kein Prozess aus `l0/S3` mehr.
- **Gelöscht** (≈ 0,98 GB):
  - `modelle/` (433 MB: tr glow-tts und HiFi-GAN, Rest Thorsten)
  - `onnx/` (110 MB, Thorsten-ONNX)
  - `whisper/` (383 MB: whisper-base und -small, npm-Auszüge, PCM mit arabischen Referenzen)
  - `hf/` (34 MB, Caches)
  - Venv und Chatterbox-Gewichte waren schon vorher gelöscht.
  - Freier Platz danach 8,1 GB.
- **Behalten** (nur Scratchpad, ≈ 113 MB):
  - `audio/` (WAV), `hoerproben/` (WebM/Opus für LM-06), `messung/`, `skripte/`, `lizenz/` (mit `2026-10-20/`)
  - `auswertung/`: Skripte, `messwerte.json`, `asr-*.json` mit Abschriften, `paare.json`, `pegel.json`, `spektro/`,
    `falle.log`, `server.log`
  - `beleg-teil-*.md`
  - `dl/` (75 MB: Wheels von coqui-tts und chatterbox-tts, Piper-ONNX `de_DE-mls-medium`, Thorsten-HF-Konfiguration). Nicht
    Teil des Löschauftrags; kann weg, wenn LM-06 die Proben nicht neu braucht.
- **Im Repository** steht nur dieser Beleg. Hörproben und Audio sind nicht im Repository; nichts committet.

## 9. Quellen (abgerufen 17.10. und 20.10.2026)

- **Coqui:**
  - Modellregister https://github.com/idiap/coqui-ai-TTS/blob/dev/TTS/.models.json
  - Releases `v0.7.0_models` und `v0.6.1_models` unter https://github.com/coqui-ai/TTS/releases
  - https://huggingface.co/Thorsten-Voice/VITS (`54f782a`)
  - https://pypi.org/project/coqui-tts/
- **Thorsten-Voice:** https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full (`2b61b98`, `cc0-1.0`)
- **Piper:**
  - https://huggingface.co/rhasspy/piper-voices (`c10ece1`), `de/de_DE/mls/medium/MODEL_CARD`
  - MLS: https://openslr.org/94/ (Pratap u. a. 2020, CC BY 4.0)
- **Chatterbox:**
  - https://huggingface.co/ResembleAI/chatterbox (`5bb1f6ee`)
  - https://github.com/resemble-ai/chatterbox (LICENSE, `master`)
  - https://pypi.org/project/chatterbox-tts/
- **ClArTTS:**
  - https://huggingface.co/datasets/MBZUAI/ClArTTS (`2f6e820`)
  - Kulkarni u. a., „ClArTTS: An Open-Source Classical Arabic Text-to-Speech Corpus“, Interspeech 2023
  - LibriVox-Projektseite der Lesung (2011)
- **Whisper und Bibliotheken:** wie Beleg S2 §8:
  - Xenova/whisper-base `64da572`, Xenova/whisper-small `2d67713`
  - `@huggingface/transformers` 4.3.0, `onnxruntime-web` 1.31.0-dev.20260914-8d85527a0
- **Messdaten im Scratchpad** `…/scratchpad/l0/S3/`:
  - `messung/*.log`, `messung/piper-probe*.json`, `audio/*/meta.json`, `hoerproben/*/kodierung.json`
  - `auswertung/{messwerte,paare,pegel}.json`
  - `auswertung/asr-{base,small}.json` und `auswertung/asr-*-auswertung.json`
  - `auswertung/spektro/`
  - `beleg-teil-lizenz.md`, `beleg-teil-plan.md` (Grundlage für §4 und §6)
