# Sprachausgabe der Lern-App (Werkzeug, L3-05)

Erzeugt die Hör-Clips der Sprachkurse lokal – nie im Vercel-Bau, nie in einer Funktion, nie im Browser (KERN 4.0 §4,
ADR 0039 Nr. 6, PLAN §6.8). Belege: `_lernapp/belege/S3-stimmen.md` (Stimmenwahl, Messaufbau), `S4-audioformat-safari.md`
(Opus-Parameter); Bericht des Probelaufs: `_lernapp/berichte/l3-05-sprachausgabe.md`.

## 1. Stimmen je Sprache (L3-E10, L3-E10a, ADR 0045 Nr. 11 mit Fortschreibung S3)

| Sprache | Stimme | Kennung im Manifest |
|---|---|---|
| de | Coqui-VITS „Thorsten“, eigener ONNX-Export | `tts:coqui-vits-thorsten-onnx@d09293d41bc9427e` |
| tr | keine („Audio folgt“) – glow-tts zurückgestellt (LM-24), eigene Aufnahmen vorgezogen (LM-26 a) | – |
| ar | keine („Audio folgt“) – eigene Stimme auf ClArTTS oder Aufnahmen (LM-25, LM-26) | – |

Das Register steht in `web/src/lib/lernapp/audio/stimmen.ts`; `pnpm lernapp:audio-liste tr|ar` liefert deshalb nichts. Der
Prüfer „audio“ (`pnpm lernapp:pruefen`) und der Import lassen Sprachausgabe nur mit der freigegebenen Stimme der Sprache zu.

## 2. Herkunftskette der deutschen Stimme

| Glied | Angabe | Lizenz |
|---|---|---|
| Trainingsdaten | Thorsten-Voice, Datensatz `Thorsten-Voice/TV-44kHz-Full` (HF `2b61b98`), Sprecher Thorsten Müller | CC0 1.0 |
| Gewichte | `Thorsten-Voice/VITS` @ `54f782a5e798cb4597fdac2e866ac8318143e0fb`, `model_file.pth` 332.614.997 Bytes, SHA-256 `ebb3792e89e261c92857ad1977f726bbaadfdf00d1b857dce4c44c393043de66` (bitgleich mit dem Coqui-Release `v0.7.0_models`); `config.json` SHA-256 `f24e159768a8fc460764ccb163e37a08cd3c3d424bdb4f5a9e196636e58c0832`; trainiert mit Coqui TTS 0.6.1 von Grund auf (Beleg S3 §4) | Apache-2.0 |
| Export | `export-onnx.py` mit coqui-tts 0.27.5, torch 2.6.0+cpu, onnx 1.23.2 (`requirements-export.txt`) → `thorsten-vits.onnx`, 114.289.821 Bytes, SHA-256 `d09293d41bc9427e30c7c3befd2ca44533ac9b847e860797140dbc3b8cf0a35f` | Code coqui-tts MPL-2.0, nur lokal |
| Tokenizer | `tokenizer.py`: Nachbau von Reiniger, Satzzeichen, gruut-Phonemisierer und Token-Folge aus coqui-tts 0.27.5 ohne Torch; Gleichheit belegt mit `probe/gleichheit.json` (131 Texte, Token-Folgen aus dem Coqui-Tokenizer) | MPL-2.0 (Datei-Kopf) |
| Erzeugung | onnxruntime 1.30.0, gruut 2.4.0 mit gruut-lang-de 2.0.1, numpy (`requirements.txt`, mit Hashes) | MIT, BSD; num2words LGPL (nur lokal) |
| Nachbearbeitung | ffmpeg 6.1.1 mit libopus (System) | LGPL/GPL, nur lokal |
| Prüfkette | whisper-base (OpenAI, MIT) als `Xenova/whisper-base` q8 @ `64da572` (Apache-2.0) aus `web/public/lern-app/modelle`, transformers.js 4.3.0 (Apache-2.0), onnxruntime-web (MIT) | nur lokal |

**Namensnennung** (App, `/lern-app/<ui>/quellen`, Website `/quellen`, Manifest, Paket je Eintrag über die Stimme):
„Stimme: Thorsten Müller (Thorsten-Voice, CC0); Modell: Coqui-TTS-VITS, Apache-2.0“ – als **Sprachausgabe** gekennzeichnet.
Kein Wasserzeichen. Die Bedingungen von Gewichten und Daten gelten konservativ auch für das erzeugte Audio (L0-E03).

## 3. Einrichtung (nur Scratchpad, nie im Repository)

```bash
T=<scratchpad>/l3/tts                     # Arbeitsordner; Downloads je in einem eigenen, leeren Ordner
export UV_PYTHON_INSTALL_DIR=$T/python UV_CACHE_DIR=$T/uv-cache
uv python install 3.12
uv venv --python 3.12 $T/venv
uv pip install --python $T/venv/bin/python --require-hashes -r requirements.txt
rm -rf $T/uv-cache                         # Platte: das Venv behält seine Dateien
```

**Einmaliger Export** (≈ 1,5 GB Platte, danach sofort löschen; vorher ≥ 4 GB frei):

```bash
uv venv --python 3.12 $T/venv-export
uv pip install --python $T/venv-export/bin/python --require-hashes -r requirements-export.txt \
  --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
mkdir -p $T/dl/thorsten-54f782a && cd $T/dl/thorsten-54f782a   # leerer Ordner
curl -fsSLO https://huggingface.co/Thorsten-Voice/VITS/resolve/54f782a5e798cb4597fdac2e866ac8318143e0fb/config.json
curl -fsSLO https://huggingface.co/Thorsten-Voice/VITS/resolve/54f782a5e798cb4597fdac2e866ac8318143e0fb/model_file.pth
$T/venv-export/bin/python -I <repo>/_lernapp/werkzeuge/tts/export-onnx.py $T/dl/thorsten-54f782a $T/modelle probe/texte.json
rm -rf $T/venv-export $T/uv-cache $T/dl/thorsten-54f782a/model_file.pth
```

Der Export prüft die SHA-256 der Quelldateien und schreibt `thorsten-vits.onnx`, `tokenizer.json` (Vokabular, Einstellungen,
Prüfsummen) und `gleichheit.json`. Ein neuer Export mit anderen Bytes ist eine neue Stimme: Kennung in `stimmen.ts`
anpassen, alle Clips werden neu erzeugt (die Liste zählt Clips früherer Stimmen nicht).

Selbsttest (Tokenizer gleich der Probe, K-Filter gleich BS.1770-4, Eichung −3,01 LUFS, Kürzen):

```bash
$T/venv/bin/python -I erzeuge.py selbsttest --modell $T/modelle
```

## 4. Ablauf je Sprache (PLAN §6.8)

```bash
cd web
pnpm lernapp:audio-liste de --aus $T/lauf/liste.jsonl                 # 1. fehlende Einträge (ohne Religionsbezug, Wissen, Koran)
cd ../_lernapp/werkzeuge/tts
$T/venv/bin/python -I erzeuge.py erzeuge --liste $T/lauf/liste.jsonl --modell $T/modelle \
  --aus $T/lauf/clips --aussprache ../../../web/inhalte/lernapp/aussprache/de.json   # 2.–3. 4 Prozesse × 1 Thread
cd ../../../web
pnpm lernapp:audio-pruefen --liste $T/lauf/liste.jsonl --clips $T/lauf/clips --aus $T/lauf/pruefung.json   # 6. Prüfkette
#   neu erzeugen: erzeuge.py … --nur $T/lauf/pruefung.json.neu.txt, dann erneut prüfen (zweiter Versuch → hören)
#   hören bzw. aufnehmen: $T/lauf/pruefung.json.hoeren.txt (an Menschen, LM-06; Audio-Studio)
pnpm lernapp:audio-manifest de --liste $T/lauf/liste.jsonl --clips $T/lauf/clips \
  --pruefung $T/lauf/pruefung.json --aus $T/lpa [--bereinigen] [--hochladen]          # 4.–5. Bündel und Manifest
```

- **Anhören in der App vor dem Hochladen:** `LERNAPP_AUDIO_LOKAL=$T/lpa` (Route) und
  `pnpm lernapp:import --audio-manifest <manifest>` (bzw. `E2E_AUDIO_MANIFEST` für die E2E-Datenbank). Nie zusammen mit
  `LERNAPP_BLOB_BASIS`.
- **Hochladen** in den Blob `lernapp` nur mit `--hochladen` und gesetztem `BLOB_READ_WRITE_TOKEN` (Menschen-Schritt LM-15);
  ohne Token wird es übersprungen und gemeldet. Erst danach gehört `web/inhalte/lernapp/audio-manifest/<sprache>.json`
  ins Repository; `lernapp:import` gleicht `lernapp_audio` im Bau damit ab. Ohne `--manifest` schreibt das Skript dorthin
  nur, wenn alle neuen Bündel im Blob liegen, sonst nach `<aus>/manifest-<sprache>.json` (für den nächsten Lauf mit
  `--manifest` angeben). Alte Bündel nennt das Skript; gelöscht werden sie erst, wenn kein Paket mehr darauf verweist
  (Menschen).
- **Plattenbudget:** Clips ≈ 3,6 kB je Sekunde (≈ 310 MB je Sprache); Clips und Bündel nur im Scratchpad, nach dem Hochladen
  löschen. Generator-Venv ≈ 290 MB, ONNX 114 MB.
- **Zufall:** VITS zieht Rauschen; onnxruntime setzt den Startwert je Sitzung, nicht je Lauf. Eine Neuerzeugung ergibt
  eine andere Fassung; reproduzierbar ist die Kodierung (`-fflags +bitexact -flags:a +bitexact -map_metadata -1`).

## 5. Nachbearbeitung und Prüfkette

- **Erzeugen:** Skalen 0,667/1,0/1,0 (Rauschen, Länge, Dauer-Rauschen); Rand-Stille kürzen (Rahmen-RMS 40 dB unter dem
  lautesten Rahmen, 60 ms Rand); EBU R128 / BS.1770-4 auf −23 LUFS, Abtastspitze ≤ −1 dBFS; WebM/Opus 24 kbit/s VBR, mono,
  48 kHz, `-application voip`, 20-ms-Rahmen (ADR 0039 Fortschreibung S4 Nr. 1).
- **Prüfen** (`web/src/lib/lernapp/audio/pruefung.ts`, am dekodierten Clip): Netto-Dauer ≥ 0,25 s; 2–8 Silben/s ab 3 Silben;
  Rand-Stille ≤ 0,3 s; kein Clipping; −23 ± 1 LUFS. de-Sätze ab 4 Wörtern: whisper-base (in Node, ohne Netz; jede andere
  Adresse wird abgewiesen und gezählt), Trefferanteil mild ≥ 0,75 in Ordnung, 0,6–0,75 einmal neu, < 0,6 hören; Ziffern in
  Abschrift und Text zählen als Zahlwort (whisper-base schreibt „zehn“ als „10“). Lemmata ohne Rückerkennung. Der Bericht
  enthält nur Schlüssel, Messwerte und Urteile – keine Texte, keine Abschriften.
- **Dauer** (Probelauf A1, Bericht §3): Erzeugung effektiv ≈ 0,4 × Audiodauer; Rückerkennung ≈ 9 s je Satz und Prozess
  (whisper-base füllt auf 30 s auf) – für A1 de ≈ 0,5 h Erzeugung und ≈ 1,2 h Prüfung auf 4 Kernen.

## 6. Aussprache-Überschreibungen (`web/inhalte/lernapp/aussprache/de.json`)

- `ersatz`: Text vor der Phonemisierung (ganze Wörter, längste zuerst) – Zeichen und Abkürzungen, die gruut als Laut liest
  (Gedankenstrich, Euro und Prozent als „ç“, „z. B.“ als „ts. p.“).
- `phoneme`: Phonemfolge für ein einzelnes Wort, nur für die genannte Stimme; Schlüssel wie gruut das Wort liefert (klein,
  ß als ss). Buchstabennamen („B wie Brot“) und ß-Wörter: gruut 2.4.0 schreibt ß als ss, findet das Wort dann nicht im
  Lexikon und schätzt einen kurzen Vokal („groß“ → ɡʁɔss).
- Lexikon-Lautungen, die nur ungewohnt aussehen (z. B. „Seite“ → zəiːtə), bleiben: Das Modell wurde mit ihnen trainiert.
- Eigennamen und Fremdwörter, die gruut wie deutsche Wörter liest oder schätzt (z. B. „Can“ → „tsan“, „Tee“ → „tiː“), bekommen
  eine Phonemfolge; Lautschrift prüfen mit `tokenizer.py` (`Tokenizer.phoneme`).
- Zeichen außerhalb des Vokabulars der Stimme lehnt `erzeuge.py` ab. Die Hörabnahme der Überschreibungen ist Teil von LM-06.
- **Nach einer Änderung** die betroffenen Clips neu erzeugen: `pnpm lernapp:audio-liste de --erneuern <wort,…>` nimmt Texte mit
  diesen Wörtern erneut in die Liste (menschliche Aufnahmen bleiben); danach wie in §4 prüfen und `audio-manifest` (ersetzt die
  Clips, baut die Bündel neu, nennt die alten).

## 7. Offen

- Menschliche Aufnahmen (`lernapp_aufnahme`, Audio-Studio) normieren und bündeln (`mensch:<sprecherId>`): Manifest und Import
  können es; das Holen der Rohaufnahmen aus dem privaten Speicher braucht Datenbank und Token (L3-08).
- Hörabnahme der Stimme und der Überschreibungen (LM-06); kein Mensch hat die Clips gehört.
