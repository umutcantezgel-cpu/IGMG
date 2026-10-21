# L3-05 – Probelauf der Sprachausgabe-Kette (de, Coqui-VITS Thorsten über ONNX)

| | |
|---|---|
| Datum | 21.10.2026 |
| Paket | L3-05 (PLAN §6.8, §14 L3; ADR 0039 mit Fortschreibung L3-05; ADR 0045 Nr. 11) |
| Werkzeug | `_lernapp/werkzeuge/tts/` (LIESMICH), `pnpm lernapp:audio-liste`, `lernapp:audio-pruefen`, `lernapp:audio-manifest` |
| Stimme | `tts:coqui-vits-thorsten-onnx@d09293d41bc9427e` (Herkunftskette: LIESMICH §2) |
| Rechner | 4 vCPU, 16 GB RAM, keine GPU. Parallel liefen Bauten und E2E anderer Pakete; die Last steht je Messung dabei (über 4 heißt Wettbewerb um die Kerne). |
| Inhalte | (1) Testkurs (`drizzle/seeds/lernapp-test.ts`), alle vertonbaren de-Einträge. (2) Entwurfsstand A1 de, Einheiten `de.a1.e00-ar`, `e00-tr`, `e01`–`e05`, als Kopie aus dem Arbeitsbaum des Inhaltspakets (L3-07, 21.10.2026 vormittags), nur im Scratchpad. |
| Ablage | Clips, Bündel, Manifeste und Prüfberichte nur im Scratchpad, nie im Repository. Hochgeladen wurde nichts: `BLOB_READ_WRITE_TOKEN` ist lokal leer (LM-15). |

**KI-Regel 2 (ADR 0040):** Vertont wurden nur Sprachkurs-Einträge ohne Religionsbezug (drei Riegel in `audio/liste.ts`: Pfad,
`religionsbezug`/Status, Wächter). Im A1-Entwurf schloss keiner der Riegel etwas aus (0 Religionsbezug, 0 gesperrt,
0 Wächter). Dieser Bericht nennt Einträge nur über ihre Schlüssel. Abschriften der Rückerkennung stehen in keiner Datei; für die
Fehlersuche lagen sie kurz im Scratchpad und sind gelöscht.

**Ehrlichkeitsvermerk:** **Kein Mensch hat die Clips gehört.** Alle Aussagen stützen sich auf Messwerte und Rückerkennung. Die
Hörabnahme der Stimme und der Aussprache-Überschreibungen bleibt LM-06.

## 1. Ergebnis

- Die Kette läuft von der Liste bis zum Bündel ohne Netz und ohne Torch. Das gilt für 16 Testkurs-Einträge und für 1.319
  Einträge des A1-Entwurfs (1.066 Sätze, 253 Lemmata). Die App spielt das lokal gebaute Bündel im echten Spieler ab (E2E, §5).
- **Erzeugung:** 1.900,9 s Audio in 770,4 s Wandzeit, **effektiver Echtzeitfaktor 0,41** (4 Prozesse × 1 Thread, bei Last
  5–9). Das ist langsamer als S3 ohne Fremdlast (0,29–0,33).
- **Größe:** 0,43 kB je Clip plus **3,29 kB je Sekunde** (28,7 kbit/s mit Container). Die Bündel tragen zusätzlich ≈ 150 Byte
  Kopf je Clip (2,8 %).
- **Physisch** fielen 5 von 1.319 Clips auf: 4 wegen der Silbenrate (Buchstabieren und Zahlenreihen mit Pausen), 1 als zu kurz
  (Interjektion). Die Lautheit lag bei −23,8 bis −22,3 LUFS, ohne Clipping.
- **Rückerkennung:** 826 Sätze ab 4 Wörtern, Trefferanteil im Mittel 0,86. Nach dem Ablauf aus PLAN §6.8 (einmal neu erzeugen)
  sind **92,7 % in Ordnung und 7,3 % zum Hören**. Eine weitere Fassung senkt den Anteil zum Hören auf 4,9 % (§3.5).
- **Gefunden und behoben:** (a) whisper-base schreibt Zahlen als Ziffern. Die Prüfkette gleicht deshalb Zahlwörter an.
  (b) gruut liest einige Wörter falsch, etwa „Tee“ als „tiː“ sowie Fremdwörter und Eigennamen. Dafür gibt es 15 neue
  Überschreibungen und `audio-liste --erneuern`. (c) Ohne Hochladen hätte `audio-manifest` das Manifest ins Repository
  geschrieben. Es schreibt jetzt neben die Bündel. (d) „…“ fiel still weg und ist jetzt eine Pause.
- **Hochrechnung A1 de** (2.400 Sätze + 600 Lemmata), §4: ≈ 1,2 h Audio, ≈ 15–16 MB Bündel, ≈ 0,5 h Erzeugung und ≈ 1,2 h
  Rückerkennung auf 4 Kernen. Zum Hören bleiben ≈ 150–220 Clips (LM-06).

## 2. Testkurs (alle vertonbaren de-Einträge)

| Größe | Wert |
|---|---|
| Einträge | 16 (9 Sätze, 7 Lemmata), davon 3 Sätze ab 4 Wörtern |
| Audio nach Kürzen / roh | 14,51 s / 18,26 s |
| Wandzeit Erzeugung | 9,56 s (mit Laden des Modells in 4 Prozessen), effektiver Echtzeitfaktor 0,66, Last 1,5 |
| Größe | 53.977 Byte Clips (3,72 kB/s); Bündel `de.a1.e01-bb1b1734033e97b6.lpa` 56.401 Byte |
| Physisch | alle bestanden: −23,47 bis −23,08 LUFS, Rand ≤ 0,074 s, Netto ≥ 0,418 s, 2,75–5,52 Silben/s, Spitze ≤ 0,661, kein Clipping |
| Rückerkennung | 3 von 3 mit Trefferanteil 1,0; 17 s mit 3 Prozessen (mit Laden); 0 Fremdanfragen |
| Urteile | 16 in Ordnung, 0 neu, 0 hören |

## 3. A1-Entwurf (1.319 Einträge)

### 3.1 Erzeugung

| Größe | Sätze (1.066) | Lemmata (253) |
|---|---|---|
| Dauer je Clip Mittel / Median / p90 / max | 1,64 / 1,56 / 2,33 / 5,49 s | 0,62 / 0,61 / 0,79 / 1,17 s |
| Wörter Median | 5 | 1 |
| Synthese je Prozess, Echtzeitfaktor Median / p90 | 1,20 / 2,23 | 2,64 / 4,17 |
| Größe je Clip Median | 5,58 kB | 2,37 kB |

- Gesamt: 1.900,9 s Audio, roh 2.256,0 s. Gekürzte Rand-Stille 355 s (15,7 %). Wandzeit 770,4 s, **effektiver Echtzeitfaktor
  0,405** (Wandzeit ÷ Audio nach Kürzen, mit Nachbearbeitung und Kodierung). CPU der Prozesse 1.918 s. Last am Ende 9,2 / 7,7 / 4,9.
- Kurze Clips sind je Sekunde teurer, weil Aufruf und Kodierung fest kosten (Lemmata ≈ 2,6 statt 1,2).
- Lautheit vor der Normierung im Median −24,4 LUFS, Verstärkung im Median +1,4 dB.
- Größe (kleinste Quadrate über alle Clips): **0,428 kB je Clip + 3,285 kB je Sekunde**, gesamt 6.808.963 Byte (3,58 kB/s).
  Das passt zu S3 (0,42 kB + 3,29 kB/s).
- Zeichen außerhalb des Vokabulars der Stimme: Die Bindebögen und Halbvokal-Zeichen der gruut-Lautschrift (`͡`, `̯`) fallen
  weg wie beim Training mit Coqui. „…“ fiel ebenso weg und ist jetzt eine Pause. Typografische Anführungszeichen bleiben stumm.

### 3.2 Physische Prüfung (alle 1.319 Clips)

- Lautheit −23,80 bis −22,26 LUFS (Median −23,23), Spitze ≤ 0,833, **kein Clipping**.
- Rand-Stille vorn ≤ 0,093 s, hinten ≤ 0,176 s. Netto-Dauer ≥ 0,234 s. Silbenrate im Median 4,2 Silben/s (0,93–6,36).
- **Ausreißer (5):**
  - Silbenrate: `de.a1.e01.s0066` (Buchstabieren; die Vokalgruppen-Zählung unterschätzt die Silben),
    `de.a1.e02.s0058`, `de.a1.e02.s0068`, `de.a1.e02.s0181` (Zahlenreihen mit Pausen, 1,75–1,99 Silben/s)
  - Netto-Dauer: `de.a1.e05.oh` (0,234 s, Interjektion)
  - Alle 5 kommen nach dem Ablauf zum Hören.

### 3.3 Rückerkennung (826 Sätze ab 4 Wörtern, 77,5 % der Sätze)

| Lauf | Clips | ≥ 0,75 | 0,6–0,75 | < 0,6 | Urteile ok / neu / hören |
|---|---|---|---|---|---|
| Erstlauf | 1.319 (826 erkannt) | 689 | 66 | 71 | 1.181 / 67 / 71 |
| Nach Zahlwort-Angleichung (nur die 138 Ausreißer neu bewertet) | 138 | – | – | – | 11 / 68 / 59 |
| Neu erzeugt (2. Versuch) | 68 | – | – | – | 31 / – / 37 |
| **Ende nach PLAN §6.8** | **1.319** | | | | **1.223 / – / 96** (92,7 % / 7,3 %) |

- Zeit: 1.881 s mit 4 Prozessen für 826 Clips, also **9,1 s je Clip und Prozess** bei Last 6–7. whisper-base füllt jeden Clip
  auf 30 s auf, deshalb kostet auch ein kurzer Satz das volle Fenster. 0 Fremdanfragen.
- **Befund Zahlwörter:** 26 der 137 Abschriften von Ausreißern enthielten Ziffern statt Zahlwörtern. Ohne Angleichung wäre jeder
  Satz mit Uhrzeit, Alter oder Rechnung beim Hören gelandet. `treffer()` setzt für de jetzt auf beiden Seiten Zahlwörter ein
  (0–9999, `zahlenAlsWoerter`).
- Neuerzeugung: 68 Clips, 134,5 s Audio in 63,4 s (effektiv 0,47 bei Last 7,8). Danach waren 31 in Ordnung.

### 3.4 Aussprache-Überschreibungen

Die Fehlersuche an den Ausreißern ergab G2P-Fehler von gruut 2.4.0, nicht nur Schwächen der Rückerkennung:

- „Tee“ wird „tiː“ (englisch gelesen), „Allee“/„Armee“ werden „-əə“, „Ayran“ wird „ʔayːʁan“.
- Eigennamen: „Can“ wird „tsan“, „Laylā“ wird „laeːl“, „Yazan“ wird „ʏaːtsan“. Ähnlich bei Murat, Kerem, Ḫālid, Paula, Lea,
  Ben, Emma und Tim.

Die 15 Überschreibungen stehen in `web/inhalte/lernapp/aussprache/de.json`. Lexikon-Lautungen, die nur ungewohnt aussehen, aber
dem Training entsprechen (z. B. „ein“), blieben (LIESMICH §6).

Neu erzeugt wurde mit `pnpm lernapp:audio-liste de --erneuern <wörter>`. Die Liste umfasste 190 Clips: 96 fehlende (zum Hören)
und 94 vorhandene mit den Wörtern. Erzeugung: 347,8 s Audio in 257,5 s (effektiv 0,74 bei Last 8,9).

| Gruppe | Clips | vorher ok / hören | nachher ok / hören | Trefferanteil Mittel vorher → nachher |
|---|---|---|---|---|
| mit überschriebenem Wort | 124 | 94 / 30 | 98 / 26 | 0,741 → 0,753 |
| übrige Hör-Fälle, nochmals erzeugt | 66 | 0 / 66 | 28 / 38 | 0,460 → 0,642 |

- Die Rückerkennung kann Eigennamen kaum beurteilen; whisper-base schreibt sie selten richtig. Bei den 124 Clips wechselten
  11 von „ok“ zu „hören“ und 15 umgekehrt, die Wirkung liegt im Rauschen. Dass die Überschreibungen richtig sind, folgt aus
  der Lautschrift, nicht aus der Rückerkennung. Ihre Hörabnahme gehört zu LM-06.
- **Zufall der Synthese:** Von 66 Hör-Fällen ohne überschriebenes Wort bestanden 28 bei der nächsten Fassung. VITS zieht
  Rauschen; eine weitere Fassung ist billig (≈ 1 s Rechenzeit je Clip). **Vorschlag** (Entscheidung offen, PLAN §6.8 Nr. 6 sieht
  „einmal neu erzeugen“ vor): vor dem Hören bis zu zwei Neuerzeugungen.

### 3.5 Verbleibende Hör-Fälle (64 von 1.319, 4,9 %, nach der zusätzlichen Fassung)

| Klasse | Anzahl | Schlüssel |
|---|---|---|
| Eigenname, Fremdwort, „Oma“/„Opa“ (whisper-base hört Letztere oft als andere Wörter) | 37 | `de.a1.e01.s0059`, `s0073`, `s0093`, `s0104`, `s0105`, `s0113`, `s0116`, `s0188`; `de.a1.e02.s0039`, `s0041`, `s0048`, `s0067`, `s0092`, `s0117`, `s0118`, `s0123`, `s0171`, `s0188`; `de.a1.e03.s0139`, `s0158`, `s0168`, `s0176`, `s0203`; `de.a1.e04.s0071`, `s0142`, `s0149`, `s0193`; `de.a1.e05.s0019`, `s0023`, `s0043`, `s0049`, `s0081`, `s0119`, `s0153`, `s0157`, `s0163`, `s0186` |
| sonst (Satz ab 5 Wörtern) | 14 | `de.a1.e02.s0109`; `de.a1.e03.s0008`; `de.a1.e04.s0033`, `s0091`, `s0135`, `s0145`, `s0166`, `s0205`; `de.a1.e05.s0041`, `s0084`, `s0129`, `s0136`, `s0168`, `s0172` |
| Buchstabieren | 5 | `de.a1.e01.s0064`, `s0065`, `s0066`, `s0068`, `s0070` |
| kurzer Satz (4 Wörter; ein verfehltes Wort ergibt 0,5) | 5 | `de.a1.e03.s0035`; `de.a1.e04.s0087`, `s0185`; `de.a1.e05.s0116`, `s0180` |
| physisch (Zahlenreihe mit Pausen) | 3 | `de.a1.e02.s0058`, `s0068`, `s0181` |

Die Interjektion `de.a1.e05.oh` bestand bei der dritten Fassung. Die Schlüssel gehören zum Entwurfsstand und können sich bis
zur Freigabe ändern.

### 3.6 Bündel und Manifest

- `pnpm lernapp:audio-manifest de` baute 7 Bündel mit 1.223 Clips, zusammen 6.365.732 Byte. Kopf und Rahmung kosten 2,8 %.
  Das größte Bündel ist `de.a1.e04` mit 1,37 MB.
- Vorkurs-Einheiten nehmen nur ihre eigenen Texte auf: 45 Clips in `e00-ar`, 4 in `e00-tr`.
- Das Manifest schrieb das Skript nach `<aus>/manifest-de.json`, weil nichts hochgeladen wurde: 422.450 Byte, **≈ 345 Byte je
  Clip**.
- Hochladen: „nicht angefordert“. Mit `--hochladen` und ohne Token wäre es übersprungen und gemeldet worden (LM-15).

## 4. Hochrechnung A1 de (≈ 2.400 Sätze + 600 Lemmata)

Grundlage: Mittelwerte aus §3 (Sätze 1,635 s, Lemmata 0,624 s; 77,5 % der Sätze ab 4 Wörtern; Größe 0,428 kB + 3,285 kB/s).

| Größe | Hochrechnung |
|---|---|
| Audio | 2.400 × 1,635 s + 600 × 0,624 s = **4.298 s ≈ 1,2 h** |
| Erzeugung, 4 Prozesse | **≈ 29 min** bei Echtzeitfaktor 0,405 (Last 5–9); ≈ 21–24 min ohne Fremdlast (S3: 0,29–0,33) |
| Clips | 3.000 × 0,428 kB + 4.298 s × 3,285 kB/s ≈ **15,4 MB**, mit Bündelkopf ≈ 15,8 MB |
| Rückerkennung | ≈ 1.860 Sätze × 9,1 s ÷ 4 Prozesse ≈ **1,2 h** (Last 6–7) |
| Neuerzeugung | ≈ 5 % (≈ 155 Clips): + 2 min Erzeugung, + 6 min Prüfung |
| Zum Hören (LM-06) | **≈ 220 Clips** (7,3 %) nach PLAN §6.8; ≈ 150 (4,9 %) mit einer weiteren Fassung |
| Manifest im Repository | ≈ 3.000 × 345 Byte ≈ **1,0 MB** (`audio-manifest/de.json`, eine Zeile je Clip) |
| Rechenzeit gesamt | ≈ 2–2,5 h auf 4 Kernen |

Bezogen auf eine ganze Sprache (S3: ≈ 32.500 Clips, ≈ 25 h) wüchse das Manifest auf ≈ 11 MB. **Offen:** das Manifest je Stufe
teilen, sobald B1 vertont wird. Die Bündel liegen im Rahmen von PLAN §5.4: je Einheit 1,0–1,4 MB (Plan: A1 ≈ 1,5 MB),
A1 de ≈ 16 MB (Plan offline: A1 ≈ 25 MB je Richtung mit Paketen und Bildern).

## 5. Integration

- **Unit** (`tests/unit/lernapp/audio-kette.test.ts`): Liste, Ausschlüsse (Religionsbezug, Wächter, Pfade), Erneuern,
  Bündel/Manifest, Prüfkette mit Zahlwörtern, Stimmen, Aussprache. **Integration** (`tests/integration/lernapp-audio.test.ts`):
  Manifest-Import abgleichend bzw. ergänzend, fail closed.
- **E2E** (`tests/e2e/lernapp/audio-buendel.spec.ts`), ein Bau:
  - regulär mit den Testbündeln: Ergebnis in §5.1
  - mit dem lokal gebauten Bündel des Testkurses (`E2E_AUDIO_MANIFEST`, `LERNAPP_AUDIO_LOKAL`, `E2E_AUDIO_BUENDEL`): Der Spieler
    lädt genau `de.a1.e01-bb1b1734033e97b6.lpa`, schneidet den Clip und spielt ihn normal und langsam bis `ended`.

### 5.1 Ergebnis des Baus

(wird nach dem Lauf eingetragen)

## 6. Offen

- **LM-06:** Hörabnahme der Stimme, der Überschreibungen und der Hör-Fälle (§3.5).
- **LM-15:** Hochladen der Bündel. Erst danach gehört `audio-manifest/de.json` ins Repository.
- **Entscheidung:** bis zu zwei Neuerzeugungen vor dem Hören (§3.4).
- **Hinweis für die Sprechübung** (ADR 0042): Dort fehlt dieselbe Zahlwort-Angleichung. Wer „zehn“ sagt, bekommt „10“ als
  Abschrift. Die Funktion `zahlenAlsWoerter` liegt in `src/lib/lernapp/audio/pruefung.ts` bereit, ist aber noch nicht
  übernommen.
- Der Versuchszähler zählt jede Erzeugung, auch nach einer Aussprache-Änderung. Ein erneuerter Clip geht deshalb bei
  0,6–0,75 gleich zum Hören.
- Manifest je Stufe teilen (§4).

## 7. Befehle (Nachvollzug)

```bash
T=<scratchpad>/l3/tts; P=$T/probelauf/a1
pnpm lernapp:audio-liste de --inhalte $P/inhalte --aus $P/liste.jsonl
(cd ../_lernapp/werkzeuge/tts && $T/venv/bin/python -I erzeuge.py erzeuge --liste $P/liste.jsonl --modell $T/modelle \
  --aus $P/clips --aussprache ../../../web/inhalte/lernapp/aussprache/de.json > $P/erzeugung.json)
pnpm lernapp:audio-pruefen --liste $P/liste.jsonl --clips $P/clips --aus $P/pruefung.json
#   Neuerzeugung: erzeuge.py … --nur $P/pruefung.json.neu.txt, dann audio-pruefen mit der Teilliste
pnpm lernapp:audio-manifest de --liste $P/liste.jsonl --clips $P/clips --pruefung $P/pruefung.json --aus $P/lpa
pnpm lernapp:audio-liste de --inhalte $P/inhalte --manifest $P/lpa/manifest-de.json --erneuern Tee,Ayran,… --aus $P/erneuern.jsonl
```

Die Auswertung (nur Zahlen und Schlüssel) leisteten zwei Skripte im Scratchpad, `auswertung/auswerten2.py` und
`auswertung/aussprache-wirkung.py`.
