# Beleg S4 – Audioformat der Lern-App auf Safari/iOS (Opus in WebM/Ogg/CAF, Rückfall AAC)

- **Etappe:** L0, Paket L0-06 (Spike S4, Recherche; kein Code im Repository)
- **Stand:** 16.10.2026
- **Bezug:** ADR 0039 Nr. 3, 5, 12; ADR 0038 Nr. 9; KERN §4 „Format“, §8; PLAN §3.10, §5.4, §18 O-6; MENSCHEN LM-07 (Erweiterung von
  MN-19); ABNAHME Z-L15, vorgesehene UMGEBUNGSAUSNAHME „echte Geräte und iOS“
- **Werkzeuge:** ffmpeg 6.1.1 (libopus, lokal), headless Chromium 141 (`/opt/pw-browsers/chromium-1194`, Playwright-Core 1.64.0
  aus `web/node_modules`), Python 3.13 mit `-I`. Ein WebKit-Browser steht in der Arbeitsumgebung nicht zur Verfügung; Safari
  selbst ist deshalb nur über Primärquellen belegt, nicht gemessen.

## 1. Ziel

1. Klären, ob Safari auf macOS und iOS die geplanten Bündel `.lpa` (Einzel-Clips Opus 24 kbit/s mono, geschnitten mit
   `Blob.slice`, abgespielt über eine Objekt-URL) abspielen kann – und ab welcher Version.
2. Opus in WebM, Ogg und CAF sowie AAC/MP4 als Rückfall vergleichen (Unterstützung, Größe, Prüfbarkeit).
3. `playbackRate` 0,75 mit `preservesPitch` („langsam“), MediaSource und Objekt-URLs auf Safari einordnen.
4. Empfehlung für das Bündelformat (ADR 0039) und einen Testplan für den Gerätetest LM-07/MN-19.

## 2. Vorgehen (Befehle)

Alle Downloads und Messdateien liegen im Scratchpad unter `…/scratchpad/l0/s4/` (`dl/` für Fremddaten, `skripte/` für eigene
Skripte, `messung/` für erzeugte Testsignale). Python lief stets mit `-I`.

```bash
# 2.1 caniuse-Rohdaten (Feature-JSON, Nutzungsanteile, Länderdaten DE/TR; Stand der Daten 13.10.2026)
for f in opus webm ogg-vorbis aac mediasource; do
  curl -sS -f -o dl/caniuse-$f.json https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/$f.json; done
curl -sS -f -o dl/caniuse-data.json https://raw.githubusercontent.com/Fyrd/caniuse/main/fulldata-json/data-2.0.json
curl -sS -f -o dl/region-DE.json https://raw.githubusercontent.com/Fyrd/caniuse/main/region-usage-json/DE.json
python3 -I skripte/caniuse.py dl/caniuse-opus.json …        # Versionsstufen Safari/iOS je Merkmal

# 2.2 MDN Browser-Compat-Data (HTMLMediaElement, ManagedMediaSource, MediaSource, Blob, URL, BaseAudioContext, AudioSession, Cache)
curl -sS -f -o dl/bcd-api_HTMLMediaElement.json https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/HTMLMediaElement.json
python3 -I skripte/bcd.py preservesPitch,playbackRate dl/bcd-api_HTMLMediaElement.json

# 2.3 Apple-Versionshinweise Safari 15 … 27 (DocC-JSON, je Version eine Datei), Medienzeilen herausgefiltert
curl -sS -f -o dl/rn-18_4.json https://developer.apple.com/tutorials/data/documentation/safari-release-notes/safari-18_4-release-notes.json
python3 -I skripte/rn.py 'webm|opus|ogg|vorbis|caf|preservesPitch|playbackRate|blob|Media Source' dl/rn-*.json

# 2.4 WebKit-Bugzilla 245428 und 238546, MDN-Seiten (WebFetch); HTML-Standard und Service-Worker-Spezifikation (curl + grep)

# 2.5 Containervergleich mit synthetischem, sprachähnlichem Signal (Rosa Rauschen + 140-Hz-Grundton, Bandpass, 4-Hz-Silbenmodulation,
#     EBU R128 −23 LUFS), Dauern 0,8 s / 2,5 s / 6,0 s; je Variante dieselbe Quelle
skripte/container.sh messung/        # WebM, Ogg, CAF (CBR), MP4/Opus, M4A/AAC-LC 32k und 48k
ffmpeg -i src-2.5.wav -map_metadata -1 -fflags +bitexact -flags:a +bitexact \
       -c:a libopus -b:a 24k -vbr on -application voip -frame_duration 60 -ac 1 webm60bx-2.5.webm
ffprobe -show_entries packet=size …  # Nutzdaten je Datei → Container-Overhead

# 2.6 Sonde im headless Chromium: Bündel aus 7 Clips (Kopf „LPA1“ + JSON-Index + Clips), Blob.slice(start, ende, typ) →
#     URL.createObjectURL → ein wiederverwendetes <audio>, je Clip normal und langsam (0,75, preservesPitch);
#     Rückfall decodeAudioData → WAV → <audio>; canPlayType, MediaCapabilities.decodingInfo; Cache.put mit Status 206
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node skripte/sonde.mjs messung/ > sonde-ergebnis.json
```

## 3. Messwerte und Ergebnisse

### 3.1 Unterstützung laut Apple-Versionshinweisen (Primärquelle)

| Safari | veröffentlicht | Eintrag (wörtlich, gekürzt) |
|---|---|---|
| 15 | 20.09.2021 | „Added support for the Opus audio codec in WebM containers.“ (nur macOS wirksam, s. Bug 238546) |
| 15.5 | 16.05.2022 | „Fixed playback of HTML5 embedded audio with unbounded range requests.“ |
| 16.4 | 27.03.2023 | mehrere Korrekturen an Blob-URLs (Lebensdauer, Widerruf über gleiche Ursprünge) |
| 17 | 18.09.2023 | „Added support for stereo-only Opus in MPEG-4 and WebM containers on macOS Sonoma.“ · Managed Media Source (macOS, iPadOS; iOS als Vorschau) |
| 17.2 | 11.12.2023 | „Added unprefixed support for `preservesPitch`.“ · kurze `<audio>`-Quellen melden die Seite nicht mehr als „Jetzt läuft“ |
| **17.4** | 05.03.2024 | „**Added support for VP8/VP9 and WebM on iOS and iPadOS.**“ · „Added support for the Vorbis audio codec on iOS …“ |
| 17.6 | 29.07.2024 | `loadeddata` für `<audio>` beim Laden korrigiert |
| 18 | 16.09.2024 | WebM mit Vorbis-Spur korrigiert |
| **18.4** | 31.03.2025 | „**Added support for Ogg Opus and Ogg Vorbis on macOS Sequoia 15.4, iOS 18.4** …“ · WebM in MediaRecorder |
| 26.0 | 15.09.2025 | „Fixed video elements with WebM object URLs causing MediaError code 2.“ |
| **26.4** | 24.03.2026 | „**Fixed playback of `application/ogg` blob media.**“ |
| 27 | 14.09.2026 | `preservesPitch`/`playbackRate`/`volume` an `createMediaElementSource` korrigiert; MP4 mit Opus in `decodeAudioData`; 416-Behandlung bei Range |

WebKit-Bugzilla ergänzt:
- **Bug 238546** (offen): Auf iOS/iPadOS 15.4 bis iOS 17 spielte `<audio>` WebM/Opus nicht ab, `canPlayType` meldete nichts,
  **`decodeAudioData` funktionierte aber**. Laut Melder ab Safari 17.4 auf iOS und macOS einheitlich.
- **Bug 245428** („Safari 16 cannot play WebM Opus from blob URL“, RESOLVED FIXED): WebM/Opus aus **Blob-URLs** schlug in
  Safari 15.6 bis 17.4 fehl (auch CAF/Opus auf iOS aus Blob-URLs). Korrektur 276136@main vom 14.03.2024; caniuse führt 17.4 mit
  „known regression“ und ab 17.5 ohne Einschränkung. Der Fehler betraf auch macOS. → Für den Bündelweg gilt **Safari ≥ 17.5
  auf iOS und macOS**; ältere Versionen brauchen den Rückfall (§4).

Auf iOS nutzen auch Chrome, Firefox, Edge und eingebettete Web-Ansichten WebKit; die Grenzen gelten damit für alle iOS-Browser
(alternative Engines in der EU seit iOS 17.4 sind nicht geprüft).

### 3.2 Unterstützung laut caniuse und MDN-BCD

| Merkmal | Safari macOS | Safari iOS | Quelle |
|---|---|---|---|
| Opus in CAF (nur CBR) | ab 11 | ab 11 | caniuse `opus` Note 1 |
| Opus in WebM | ab 17.4 bzw. 17.5 (Releasenote: 15) | 17.4 teilweise (Regression Blob-URL), **ab 17.5** | caniuse `opus` Noten 2/3 |
| Opus in Ogg | ab 18.4 mit macOS 15.4 | ab 18.4 | caniuse `opus`, `ogg-vorbis` |
| AAC (MP4/M4A) | ab 4 | ab 4 | caniuse `aac` |
| `preservesPitch` | 17.2 (vorher `webkitPreservesPitch` ab 4) | 17.2 | BCD |
| `playbackRate`, `defaultPlaybackRate` | 3.1 | 3 | BCD |
| `Blob.slice` / `URL.createObjectURL` | 7 / 6 | 7 / 6 | BCD |
| `MediaSource` | 8 | nur iPad ab 13, **nicht iPhone** | BCD |
| `ManagedMediaSource` | 17 | 17.1 | BCD |
| `decodeAudioData` (Promise) | 14.1 | 14.1 | BCD |
| `navigator.audioSession.type` | 16.4 | 16.4 | BCD |

Hinweis: Die MDN-Seite „Web audio codec guide“ (zuletzt geändert 13.10.2026) nennt für Safari noch „Opus nur in CAF“. Sie ist
in diesem Punkt veraltet; die Apple-Versionshinweise gehen vor.

### 3.3 Verbreitung (caniuse, Daten September 2026, Abruf 05.10.2026)

| Gruppe | Deutschland: Anteil aller Seitenaufrufe | Anteil an iOS-Safari | Folge |
|---|---|---|---|
| iOS-Safari gesamt | 12,86 % | 100 % | – |
| iOS < 15 | 0,08 % | 0,6 % | kein Audio (Hörübungen übersprungen) |
| iOS 15 … 17.3 | 0,58 % | 4,5 % | kein WebM/Opus im `<audio>`; Rückfall über `decodeAudioData` möglich (Bug 238546) |
| iOS 17.4 | 0,02 % | 0,2 % | WebM ja, Blob-URL-Regression → Rückfall nach Fehlerereignis |
| iOS < 18.4 (kein Ogg) | 1,17 % | 9,1 % | Ogg ungeeignet |
| iOS < 26.4 (Ogg aus Blob defekt) | 3,63 % | 28,3 % | Ogg ungeeignet |
| macOS-Safari < 15 | 0,05 % | 1,4 % von macOS-Safari | vernachlässigbar |

Die Türkei-Daten (für tr-Oberfläche) zeigen dieselben Anteile innerhalb von iOS (5,1 % unter 17.4).

### 3.4 Container und Größe (gemessen, synthetisches Signal, Opus 24 kbit/s VBR mono, `-application voip`)

| Variante | 0,8 s | 2,5 s | 6,0 s | Container-Overhead bei 2,5 s | hochgerechnet je Zielsprache (32.500 Clips à Ø 2,77 s) |
|---|---|---|---|---|---|
| WebM, 20-ms-Rahmen, ffmpeg-Standard | 3.024 B | 8.055 B | 18.263 B | 1.296 B | 286 MB |
| WebM, 20 ms, `bitexact`, ohne Metadaten | 2.962 B | 7.993 B | 18.201 B | 1.234 B | 284 MB |
| **WebM, 60 ms, `bitexact`, ohne Metadaten** | 2.866 B | 7.574 B | 17.276 B | 773 B | **271 MB** |
| Ogg, 20 ms | 2.443 B | 7.103 B | 16.516 B | 344 B | 253 MB |
| Ogg, 60 ms | 2.467 B | 7.061 B | 16.463 B | 260 B | 253 MB |
| CAF (nur CBR möglich) | 2.667 B | 7.852 B | 18.527 B | 292 B | 282 MB |
| MP4/Opus | 3.202 B | 8.063 B | 17.893 B | 1.304 B | 285 MB |
| M4A, AAC-LC 32 kbit/s, 24 kHz | 4.407 B | 11.402 B | 25.839 B | 1.047 B | 407 MB |
| M4A, AAC-LC 48 kbit/s, 32 kHz | 5.973 B | 16.467 B | 38.004 B | 1.127 B | 589 MB |

- Mit `-fflags +bitexact -flags:a +bitexact -map_metadata -1` entstehen **byte-gleiche Dateien** bei gleicher Eingabe (zweimal
  kodiert, SHA-256 identisch `4596fbb8…`). Das passt zur Adressierung über den Inhalts-Hash (ADR 0039 Nr. 1).
- Die Hochrechnung (271–286 MB je Sprache) bestätigt PLAN §5.4 (≈ 270 MB). Echte Sprache mit Pausen fällt bei VBR kleiner aus.
- Ein AAC-Rückfall in vergleichbarer Sprachqualität (AAC-LC braucht für Sprache etwa die doppelte Rate von Opus; HE-AAC kann
  ffmpeg ohne nicht-freien Kodierer nicht erzeugen) kostet je Sprache weitere ≈ 0,4–0,6 GB, für drei Sprachen ≈ 1,2–1,8 GB Blob.

### 3.5 Sonde im headless Chromium 141 (Linux)

| Prüfung | Ergebnis |
|---|---|
| `canPlayType`: WebM/Opus, Ogg/Opus, MP4/Opus | `probably` |
| `canPlayType`: MP4/AAC, CAF/Opus | leer – Chromium-Builds ohne AAC (wie MDN: „AAC is not available in Chromium builds“) |
| Clip aus Bündel per `Blob.slice(…, 'audio/webm; codecs="opus"')` → Objekt-URL, 0,8/2,5/6,0 s | `loadedmetadata` mit Dauer 0,808/2,508/6,008 s; `ended` nach 913/2.568/6.068 ms |
| dieselben Clips, `playbackRate = 0.75`, `preservesPitch = true` | `ended` nach 1.098/3.359/8.030 ms (= Dauer/0,75) |
| Ogg- und MP4/Opus-Clip aus dem Bündel | spielt normal und langsam |
| AAC- und CAF-Clip | `MediaError 4` (Demuxer) |
| Rückfall: `OfflineAudioContext(1, 1, 24000).decodeAudioData(slice)` → WAV (PCM 16 bit) → `<audio>` langsam | Dekodieren 13 ms (2,5 s Clip), WAV 120 KB, `ended` nach 3.360 ms |
| `cache.put(req, new Response(…, {status: 206}))` | abgelehnt: „TypeError … Partial response (status code 206) is unsupported“ (wie Service-Worker-Spezifikation: „If innerResponse’s status is 206, return a promise rejected with a TypeError“) |

Die Sonde zeigt die Mechanik des Bündels (Schnitt, Dauer, langsames Abspielen, Rückfallweg) in einem Blink-Browser. Für Safari
ist sie kein Beweis; dort entscheidet der Gerätetest (§5).

### 3.6 Wichtige Einzelbefunde für die Umsetzung

1. **`load()` setzt `playbackRate` zurück** auf `defaultPlaybackRate` (HTML-Standard, Media-Element-Ladealgorithmus). „Langsam“
   muss deshalb `defaultPlaybackRate` und `playbackRate` setzen, und zwar nach dem Zuweisen der Quelle.
2. **Kein `createMediaElementSource`:** Bis Safari 26 wirkten `preservesPitch`, `playbackRate` und `volume` an einem mit einem
   `AudioContext` verbundenen Element nicht richtig (behoben in Safari 27). Das Abspielelement bleibt ohne Web-Audio-Graph.
3. **Kein MSE nötig:** Clips sind kurz und vollständig; `MediaSource` fehlt auf dem iPhone, `ManagedMediaSource` erst ab 17.1.
4. **Cache Storage nimmt keine 206-Antworten** (gemessen und spezifiziert). Der Service Worker speichert Bündel nur als ganze
   200-Antwort; der Client fragt Bündel ohne `Range` an (passt zu S5: Range-Anfragen umgehen auch den CDN-Cache).
5. **Autoplay:** iOS erlaubt `play()` nur nach einer Nutzerhandlung. Hörübungen starten über die Taste „Abspielen“; ein einziges,
   wiederverwendetes `<audio>`-Element, das beim ersten Tippen freigeschaltet ist.
6. **Typ der Scheibe:** Blob-URLs haben keine Dateiendung; Bug 272502 („irregular media events for URLs without file extensions“,
   iOS 17.4) wurde als Duplikat von 245428 geschlossen. Jede Scheibe bekommt deshalb ausdrücklich den Typ aus dem Index
   (`audio/webm`), damit Safari nicht raten muss.

## 4. Entscheidungsvorschlag für die offenen Punkte der ADRs

| Punkt | Vorschlag | Begründung |
|---|---|---|
| **ADR 0039 Nr. 5 (Format), O-6** | **WebM/Opus bleibt** – 24 kbit/s VBR, mono, `-application voip`, 48 kHz; jeder Clip eine vollständige WebM-Datei mit Dauer; Kodierung mit `-map_metadata -1 -fflags +bitexact -flags:a +bitexact`. Rahmenlänge 20 ms; 60 ms (−5 % Größe) nur, wenn die Hörprobe in S3/LM-06 keinen Unterschied zeigt. | Einziger Container, der auf Safari ≥ 17.5 (iOS und macOS), Chrome, Firefox und im Playwright-Chromium der E2E-Tests aus Blob-URLs läuft; reproduzierbare Bytes für Hash-Adressen. |
| **ADR 0039 Nr. 5, AAC-Rückfall** | **Kein AAC im Regelbetrieb.** Der Index trägt je Clip ein Feld `format` (`webm-opus`). Eine AAC-Variante (`<einheit>-<hash>.aac.lpa`, gleicher Index) entsteht nur, wenn LM-07 auf iOS ≥ 17.5 einen Wiedergabefehler findet; der Client wählt dann per `canPlayType`. | AAC kostet ≈ 1,2–1,8 GB zusätzlichen Blob, eine zweite Kodierkette und ist im E2E-Chromium nicht abspielbar (nicht prüfbar). |
| **Ogg/Opus, CAF/Opus, MP4/Opus** | nicht verwenden | Ogg erst ab iOS 18.4 und aus Blob-URLs erst ab 26.4 (28 % der iOS-Nutzung in DE darunter); CAF nur CBR, Blob-Fehler auf iOS, im Chromium nicht abspielbar; MP4/Opus ohne Vorteil, `decodeAudioData` erst ab Safari 27. |
| **ADR 0039 Nr. 3 (Abspielen)** | `Blob.slice(versatz, versatz + länge, 'audio/webm')` → `URL.createObjectURL` → ein wiederverwendetes `<audio>`; Objekt-URL nach `ended`/`error` bzw. beim nächsten Clip widerrufen. „Langsam“: nach dem Setzen der Quelle `defaultPlaybackRate = playbackRate = 0.75`, `preservesPitch = true` und zusätzlich `webkitPreservesPitch = true`. Kein `createMediaElementSource`, kein MSE, kein Autoplay ohne Tippen. | §3.5, §3.6 |
| **Rückfallstufen im Client (neu in ADR 0039 Nr. 3)** | 1. `canPlayType('audio/webm; codecs="opus"')` nicht leer → direkt. 2. Leer oder `MediaError` beim ersten Clip → `decodeAudioData` der Scheibe → WAV-Blob → `<audio>` (Code ≈ 1 KB, erst bei Bedarf geladen); Ergebnis im Gerät merken. 3. Schlägt auch das fehl → Hinweis „Hören ist auf diesem Gerät nicht möglich“, Hörübungen werden übersprungen (KERN §4 „Ohne Audio“). | deckt iOS 15–17.4 (≈ 4,7 % der iOS-Nutzung in DE) und macOS-Safari 15–17.4 ohne zweites Audioformat ab; Rückfall muss LM-07 auf einem iOS-16-Gerät bestätigen. |
| **ADR 0039 Nr. 12 / ADR 0038 Nr. 9 (Offline)** | Bündel nur als ganze 200-Antwort laden und speichern, nie mit `Range`; Bündelgröße als Zahl aus dem Kursverzeichnis für den Ring nach Bytes. | `Cache.put` lehnt 206 ab; siehe S5. |
| **ADR 0039 Folgen (Tests)** | Unit `buendel`: Index, Schnitt, Typ; E2E im Chromium: ein Clip normal und langsam bis `ended`, Rückfallweg mit erzwungenem `MediaError`. Echte Safari-Prüfung nur über LM-07 (UMGEBUNGSAUSNAHME mit Ersatzbeleg = diese Sonde + Protokoll LM-07). | Kein WebKit in der Arbeitsumgebung. |
| **LM-07 Standard** | bleibt „WebM/Opus ohne AAC-Rückfall“; zusätzlich Testplan §5 als Inhalt von LM-07. | – |

Vorschlag für L2: eine unauffällige Seite „Gerätetest Audio“ unter `/lern-app/[ui]/einstellungen` spielt das synthetische Testbündel
aus Tönen (ADR 0039 Nr. 11) und zeigt `canPlayType`, gewählte Rückfallstufe und Abspielzeiten an. Damit füllen Testende das
Protokoll ohne Entwicklerwerkzeuge.

## 5. Testplan LM-07 / MN-19 (Audio-Teil, ≈ 45 min von den 2 h)

**Geräte** (mindestens): iPhone mit aktuellem iOS (27.x), iPhone oder iPad mit iOS 17.5–18.x, ein Gerät mit iOS 16.7 (z. B.
iPhone 8/X) für den Rückfall, Mac mit Safari (macOS 14 oder neuer), Android-Mittelklasse mit Chrome, Laptop mit Firefox. Jeweils
im Browser-Tab **und** als installierte PWA.

| Nr. | Prüfung | Bestanden, wenn |
|---|---|---|
| A1 | Gerätetest-Seite: `canPlayType`, gewählte Stufe | iOS ≥ 17.5, macOS-Safari ≥ 17.5, Android, Firefox: Stufe 1; iOS 16: Stufe 2 |
| A2 | Hörübung A1 (Wort 0,8 s) und Satz (≈ 3 s) normal | Ton vollständig, kein Abschneiden am Anfang oder Ende |
| A3 | „Langsam“ (0,75) | hörbar langsamer, **Tonhöhe unverändert**; Gegenprobe mit ausgeschaltetem `preservesPitch` auf der Testseite klingt tiefer |
| A4 | 20 Clips schnell nacheinander, Wechsel normal/langsam | keine Aussetzer, kein Hängen; Speicher stabil (keine wachsende Zahl Objekt-URLs) |
| A5 | erste Wiedergabe nach Tippen, weitere über „Weiter“ | jeder Klick spielt; keine Autoplay-Sperre |
| A6 | Stummschalter (iPhone) an/aus, Lautstärke, Bluetooth-Kopfhörer verbinden/trennen während einer Lektion | Wiedergabe folgt dem Ausgabegerät; Verhalten mit Stummschalter im Protokoll festhalten |
| A7 | Sperrbildschirm / App-Wechsel während eines Clips, zurück | Lektion läuft weiter; kein Eintrag „Jetzt läuft“ für kurze Clips |
| A8 | Einheit offline speichern, Flugmodus, Lektion vollständig hören; App schließen und neu öffnen | alle Clips aus dem Vorrat; Bündel liegt nach Neustart im Cache |
| A9 | iOS 16: Rückfall Stufe 2 | Clips hörbar, „langsam“ mit gleicher Tonhöhe (`webkitPreservesPitch`) |
| A10 | Stufe 3 erzwingen (Testschalter) | Hinweis sichtbar, Hörübungen übersprungen, keine Sackgasse |
| A11 | VoiceOver/TalkBack an | Taste „Abspielen“ korrekt benannt; Clip überlagert die Ansage nicht dauerhaft |
| A12 | Lautheit über 10 Clips verschiedener Einheiten | keine hörbaren Sprünge (EBU R128) |
| A13 | C1-Bündel (≈ 6 MB) im gedrosselten Mobilnetz laden | Ring nach Bytes läuft; Abbruch und Wiederaufnahme ohne kaputten Vorrat |

**Protokoll:** je Zeile Gerät, Betriebssystem, Browser mit Version, Tab/PWA, Ergebnis, Bemerkung; Ablage
`_lernapp/protokolle/LM-07-audio.md`. Ein Fehler in A2–A5 auf iOS ≥ 17.5 löst die AAC-Variante (§4) aus.

## 6. Risiken

| Risiko | Wahrscheinlichkeit | Gegenmaßnahme |
|---|---|---|
| WebKit-Regression bei WebM aus Blob-URLs in einer künftigen Version (wie 245428, 26.0 „MediaError code 2“ bei WebM-Objekt-URLs im Video) | mittel | Rückfallstufe 2 greift automatisch nach `MediaError`; LM-07 bei jeder iOS-Hauptversion wiederholen |
| Rückfall `decodeAudioData` funktioniert auf iOS 15/16 nicht wie in Bug 238546 berichtet | gering–mittel | Stufe 3 („Audio folgt“), betrifft ≈ 0,6 % der Aufrufe in DE |
| 60-ms-Rahmen klingen schlechter | gering | Standard 20 ms; 60 ms nur nach Hörprobe |
| `preservesPitch` klingt bei 0,75 auf iOS verwaschen | gering | Hörprobe A3; notfalls 0,8 |
| Safari räumt Website-Daten nach 7 Tagen ohne Nutzung (nicht für installierte PWAs) | bekannt (ADR 0038) | Installation empfehlen; Bündel werden bei Bedarf neu geladen |
| Kein WebKit in der Arbeitsumgebung | sicher | UMGEBUNGSAUSNAHME mit Ersatzbeleg (diese Sonde, Primärquellen, Protokoll LM-07) |

## 7. Aufräumen

- Kein eigener Server gestartet; der headless Chromium der Sonde wurde im Skript mit `browser.close()` beendet (keine
  verbleibenden Prozesse).
- Große Zwischenstände gelöscht: `l0/s4/dl/caniuse-data.json` (4,8 MB), `l0/s4/dl/html-media.html`, `l0/s4/dl/sw-spec.html`,
  die WAV-Quellen in `l0/s4/messung/`. Behalten (≈ 2,3 MB): Skripte `l0/s4/skripte/{caniuse.py,bcd.py,rn.py,container.sh,sonde.mjs}`,
  die kodierten Testclips (0,4 MB), die kleinen Rohdaten in `l0/s4/dl/` (Feature-JSON, BCD, Versionshinweise; 1,9 MB) und
  `l0/s4/sonde-ergebnis.json` zur Wiederholung.
- Im Repository nur diese Datei geschrieben; nichts committet.

## 8. Quellen (abgerufen 16.10.2026)

- Apple, Safari Release Notes (DocC-JSON je Version), u. a.
  https://developer.apple.com/documentation/safari-release-notes/safari-15-release-notes ,
  https://developer.apple.com/documentation/safari-release-notes/safari-17_2-release-notes ,
  https://developer.apple.com/documentation/safari-release-notes/safari-17_4-release-notes ,
  https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes ,
  https://developer.apple.com/documentation/safari-release-notes/safari-26-release-notes ,
  https://developer.apple.com/documentation/safari-release-notes/safari-26_4-release-notes ,
  https://developer.apple.com/documentation/safari-release-notes/safari-27-release-notes
  (Rohdaten: https://developer.apple.com/tutorials/data/documentation/safari-release-notes/safari-18_4-release-notes.json usw.)
- WebKit Bugzilla 245428 „Safari 16 cannot play WebM Opus from blob URL“: https://bugs.webkit.org/show_bug.cgi?id=245428
- WebKit Bugzilla 238546 „WebM Opus support still inconsistent in Safari 15.4“: https://bugs.webkit.org/show_bug.cgi?id=238546
- caniuse: https://caniuse.com/opus , https://caniuse.com/webm , https://caniuse.com/ogg-vorbis , https://caniuse.com/aac ,
  https://caniuse.com/mediasource ; Rohdaten https://github.com/Fyrd/caniuse (features-json, fulldata-json/data-2.0.json,
  region-usage-json/DE.json, TR.json; Datenstand 13.10.2026)
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preservesPitch ,
  https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate ,
  https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs ,
  https://developer.mozilla.org/en-US/docs/Web/API/Cache/put ; Browser-Compat-Data
  https://github.com/mdn/browser-compat-data (api/HTMLMediaElement, ManagedMediaSource, MediaSource, Blob, URL,
  BaseAudioContext, AudioSession, Cache; Paketstand 8.1.6)
- HTML Living Standard, Media-Element-Ladealgorithmus: https://html.spec.whatwg.org/multipage/media.html#media-element-load-algorithm
- Service Workers (W3C), `Cache.put`: https://w3c.github.io/ServiceWorker/#cache-put
