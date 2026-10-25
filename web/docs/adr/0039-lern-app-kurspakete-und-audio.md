# ADR 0039 – Lern-App: Kurspakete und Lern-Audio (Hash-Adressen, Bündel, Blob, Route)

- Status: **angenommen im Tor L0 (20.10.2026)** mit den Abschnitten „Fortschreibung …“ (Orchestrator nach L3-E12; Gegenprüfung L0 ohne Mangel hoch/mittel) · vorher: vorgeschlagen (16.10.2026) (Lauf Lern-App); Nr. 7 folgt der Nutzerentscheidung „Sprachinhalte“ (kein Koran- oder Hadith-Text in der Sprachausgabe, Audio später durch Aufnahmen ersetzbar; L3-E03); „nur Sprachkurse“ ist Standard bis zur Antwort (L3-E10) · Bezug: Plan „Lern-App“ Kontext (Widersprüche „Sprachausgabe“, „Verfeinerung“ Audio), §2.3, §3.1; `_lernapp/PLAN.md` §3.10, §5.4, §6.8; Lizenzbericht `_lernapp/berichte/lizenzen-l0.md` §2; Spikes S4, S5 · baut auf ADR 0029 (Audio-Auslieferung über eine Route, L2-E06) auf; ADR 0029 und ADR 0030 bleiben für Rezitationen unberührt

## Kontext

- Einheiten müssen offline spielbar sein (ADR 0038). Die Inhalte sind groß: je Zielsprache 72 Einheiten; je Richtung ≈ 2,5 MB gz Paketdaten; Audio für alle drei Zielsprachen ≈ 100.000 Clips, ≈ 0,8 GB (Opus 24 kbit/s).
- Öffentlich darf nur erscheinen, was die Prüfregeln freigeben (ADR 0040, ADR 0041). Eine Freigabe muss sofort wirken.
- Der Vercel-Bau soll ≤ 15 min bleiben. Audio und Sprachausgabe gehören nicht in den Bau.
- Jede Auslieferung über eine Funktion kostet. Unveränderliche Adressen kann das CDN vorhalten.
- Die Lerninhalte stehen unter CC BY-SA 4.0 (ADR 0045). Namensnennungen müssen auch offline erreichbar sein, technische Schutzmaßnahmen sind unzulässig.
- Die Sprachausgabe-Programme (piper1-gpl, espeak-ng) stehen unter GPL-3.0 und dürfen nicht ausgeliefert werden (ADR 0045).

## Entscheidung

1. **Paketbau** aus der Datenbank (`web/src/lib/lernapp/paket/bauen.ts`): kanonisches JSON je Richtung und Einheit.
   - Inhalt: Lektionen und Aufgaben mit Texten in Ziel- und Ausgangssprache, angenommene Alternativen, Tokens, Lemma-Angaben, Tipps, Symbolpfade, Audio-Verweise (Bündel, Versatz, Länge) sowie **Quelle und Lizenz je Eintrag**.
   - Nur ausgelieferte Einträge: Sprache nach ADR 0041; Wissensbausteine, Sprachkurs-Einträge mit `religionsbezug` und Koran-Bedeutungen nur mit zwei Freigaben (ADR 0040 Nr. 5).
   - Adresse = SHA-256 des kanonischen JSON. Eine Einheit unter einem Hash ändert sich nie.
2. **Routen:**
   - `/lern-app/pakete/[kurs]`: Kursverzeichnis (Version, Einheiten-Hashes, Größen) mit `'use cache'`, `cacheTag(TAG.lernappKurs(id))`, `cacheLife('max')`. Jede Freigabe und Veröffentlichung ruft `updateTag`; die Kursversion steigt.
   - `/lern-app/pakete/[kurs]/[einheit]/[hash]`: Einheitenpaket, `public, max-age=31536000, immutable`. Erzeugt bei Bedarf, danach aus Cache bzw. CDN. Nur im Beispielmodus ohne Laufzeit-Datenbank rendert der Bau alle Einheiten vor (≈ 450 Ausgaben).
3. **Audio-Bündel `.lpa`** (`paket/buendel.ts`) je Zielsprache und Einheit; beide Richtungen derselben Zielsprache teilen es.
   - Aufbau: kleiner Kopf (Kennung, Version, Index aus textHash, Versatz, Länge, Format), danach die Einzeldateien hintereinander.
   - Der Client schneidet mit `Blob.slice` und spielt über eine Objekt-URL. „Langsam“ ist `playbackRate = 0.75` mit `preservesPitch`, ohne zweite Datei.
4. **Ablage und Auslieferung:**
   - öffentlicher Vercel-Blob-Speicher `lernapp` in fra1, Pfade mit Inhalts-Hash
   - Auslieferung über `/lern-app/audio/[...pfad]` nach dem Muster `liefereAudio` (`web/src/lib/audio/speicher.ts`): Byte-Bereiche 200/206/416, `public, max-age=31536000, immutable`
   - Rückfall nur bei Bedarf (Kosten, Messung): Blob-Adresse in `media-src`, und zwar nur für `/lern-app` (wie ADR 0029 Nr. 1)
   - Wie das Kursverzeichnis und die Bündel am günstigsten ausgeliefert werden (Route mit Strom, statisch, Blob direkt), misst Spike S5.
5. **Format:** WebM/Opus, 24 kbit/s, mono; Lautheit nach EBU R128 normalisiert, Stille gekürzt. Ein AAC-Rückfall kommt nur, wenn der Gerätetest es verlangt (Spike S4, O-6, LM-07).
6. **Erzeugung** (Werkzeug `_lernapp/werkzeuge/tts/`):
   1. `pnpm lernapp:audio-liste <sprache>` schreibt nur fehlende Einträge (textHash, Text, Stimme).
   2. Die Sprachausgabe läuft lokal oder auf dem lokalen Server: nie im Vercel-Bau, nie in einer Vercel-Funktion, nie im Browser. Stimmen nach ADR 0045; Aussprache-Überschreibungen aus `web/inhalte/lernapp/aussprache/<sprache>.json`.
   3. Normalisieren, kodieren, Bündel bauen, in den Blob-Speicher laden; lokal höchstens ≈ 300 MB je Sprache zwischenlagern, danach löschen.
   4. Commit von `web/inhalte/lernapp/audio-manifest/<sprache>.json` (textHash → Bündel, Versatz, Dauer, Stimme, SHA-256).
   5. Stichprobe per Spracherkennung (Wortfehlerquote mit Schwelle); Ausreißer werden neu erzeugt oder aufgenommen.
   - Stimme in `lernapp_audio.stimme`: `tts:<modell>@<sha>` oder `mensch:<sprecherId>`.
7. **Was vertont wird:** nur Inhalte der Sprachkurse und der Schrift-Vorkurse (Lemmata, Sätze, Dialog- und Geschichtenzeilen, Hörübungen) ohne Kennzeichen `religionsbezug` (L3-E10).
   - **Nie vertont:** Koran, Hadith, Bittgebete, Einträge mit `religionsbezug` (in jeder Sprache), der Wissenskurs `islam` (ohne Audio) und der Koran-Arabisch-Pfad.
   - Koran-Arabisch nutzt nur Wortzeiten (`quran_wortzeit`) freigegebener Rezitationen (ADR 0029), nie Sprachausgabe.
   - Durchgesetzt durch einen Test (kein Audio-Eintrag zu `religionsbezug`, `islam`, `koran`) und den Religionswächter (ADR 0040).
8. **Menschliche Aufnahmen** ersetzen die Sprachausgabe je textHash (Audio-Studio `/verwaltung/lernapp/audio`, Bausteine der Rezitations-Werkstatt).
   - Eine Vereinbarung mit der sprechenden Person ist Pflicht (ADR 0029 Nr. 4). Soll die Aufnahme eine eigene Stimme trainieren, schließt die Vereinbarung die KI-Sprachsynthese ausdrücklich ein (ADR 0045).
   - Bevorzugt für den arabischen Kern A1/A2.
   - Fremde Aufnahmen (Tatoeba, Wikimedia Commons) nur nach ADR 0045.
9. **Namensnennung:** Stimme und Datenquelle je Clip stehen im Paket und auf `/lern-app/[ui]/quellen`. Synthetische Stimmen sind als „Sprachausgabe“ gekennzeichnet; ein Wasserzeichen des Modells wird dort offengelegt.
10. **Keine Schutzmaßnahmen:** Pakete und Bündel sind unverschlüsselt (CC BY-SA 4.0, L0-E02).
11. **Ohne Blob-Speicher** (Beispielmodus, E2E): kleine synthetische Testbündel aus Tönen, nie Rezitationen. Sonst zeigen Hörübungen „Audio folgt“ und werden übersprungen.
12. **Offline:** Caches `igmg-lernapp-pakete` (Verzeichnis „Netz zuerst“, Einheiten „Vorrat zuerst“) und `igmg-lernapp-audio` (Vorrat zuerst). Automatisch gespeichert werden die aktuelle und die nächste Einheit; bewusst „Stufe offline speichern“ mit dem Ring nach Bytes (B-27, Muster `OfflineSpeichern.tsx`).

## Fortschreibung durch die Spikes S4 und S5 (16.10.2026, Belege `_lernapp/belege/S4-audioformat-safari.md`, `_lernapp/belege/S5-grosse-dateien-vercel.md`)

Gilt vor Nr. 1–12, wo es abweicht.

1. **Nr. 5, Format (O-6):** WebM/Opus bleibt – 24 kbit/s VBR, mono, `-application voip`, 48 kHz; jeder Clip ist eine vollständige WebM-Datei mit Dauer; reproduzierbare Bytes über `-map_metadata -1 -fflags +bitexact -flags:a +bitexact`. Rahmenlänge 20 ms; 60 ms nur, wenn die Hörprobe (S3, LM-06) keinen Unterschied zeigt. WebM/Opus läuft auf Safari ≥ 17.5 (iOS und macOS), Chrome, Firefox und im E2E-Chromium aus Blob-URLs.
2. **Kein AAC im Regelbetrieb.** Der Index trägt je Clip ein Feld `format` (`webm-opus`). Eine AAC-Variante entsteht nur, wenn LM-07 auf iOS ≥ 17.5 einen Wiedergabefehler findet; der Client wählt dann per `canPlayType`. Ogg/Opus, CAF/Opus und MP4/Opus werden nicht verwendet.
3. **Nr. 3, Abspielen:** `Blob.slice(versatz, versatz + länge, 'audio/webm')` → `URL.createObjectURL` → ein wiederverwendetes `<audio>`; die Objekt-URL wird nach `ended`/`error` bzw. beim nächsten Clip widerrufen. „Langsam“ setzt nach der Quelle `defaultPlaybackRate = playbackRate = 0.75`, `preservesPitch` und `webkitPreservesPitch`. Kein `createMediaElementSource`, kein MSE, kein Autoplay ohne Tippen.
4. **Rückfallstufen im Client:** (1) `canPlayType('audio/webm; codecs="opus"')` nicht leer → direkt; (2) leer oder `MediaError` beim ersten Clip → `decodeAudioData` der Scheibe → WAV-Blob (Code ≈ 1 KB, erst bei Bedarf), Ergebnis im Gerät merken; (3) sonst Hinweis „Hören ist auf diesem Gerät nicht möglich“, Hörübungen werden übersprungen (KERN §4). LM-07 bestätigt den Rückfall auf einem iOS-16-Gerät.
5. **Nr. 4, Auslieferung (Weg A2):** Route `/lern-app/audio/[...pfad]` nach dem Muster `liefereAudio` mit fünf Änderungen: `Cache-Control: public, max-age=31536000, immutable` plus `Vercel-CDN-Cache-Control: max-age=31536000` und `Vercel-Cache-Tag: lernapp-audio,lernapp-audio-<sprache>`; kein `head()` je Anfrage (Adresse aus fester Basis `LERNAPP_BLOB_BASIS` und dem geprüften Schlüssel `lernapp/audio/<sprache>/<einheit>-<sha16>.lpa`, Blob-404 → 404); Antwortkörper als Strom, nie gepuffert; Bündel ≤ 16 MB als Regeltest; keine Cookies, kein `Vary: Cookie`. Range bleibt unterstützt (200/206/416), der Client lädt Bündel aber **ganz und ohne `Range`** (Range umgeht den CDN-Cache, `Cache.put` nimmt keine 206 an). Hochladen mit `cacheControlMaxAge: 31536000`, `addRandomSuffix: false`, `allowOverwrite: false`. Im Beispielmodus liefert dieselbe Route synthetische Testbündel aus dem Dateisystem.
6. **Rückfall:** bei Kostenproblemen (LM-15) ein externer Rewrite auf den Blob-Host mit `x-vercel-enable-rewrite-caching: 1` (nur Produktion). Der Rückfall „Blob-Adresse in `media-src`“ entfällt (bräche KERN §6 und riskiert im Hobby-Tarif die Blob-Sperre); PLAN §3.10 ist insoweit überholt.
7. **Nr. 2, Pakete:** dieselbe CDN-Regel für `/lern-app/pakete/[kurs]/[einheit]/[hash]` (Tag `lernapp-kurs-<id>` zum Zurückziehen nach KERN §2.3). `lern-app/(pakete|audio|modelle)` steht im Matcher-Ausschluss des Proxys (sonst doppelter Fast Origin Transfer).
8. **Nr. 12, Offline:** Bündel werden nur als ganze 200-Antwort geladen und gespeichert, nie mit `Range`; die Bündelgröße steht als Zahl im Kursverzeichnis (Ring nach Bytes).
9. **Speicher und Tarif:** Blob `lernapp` ≈ 0,8 GB (nur Audio; Modelle nach ADR 0042 statisch). Lern-App-Audio in der Produktion erst nach der Tarifentscheidung (LM-15): Im Hobby-Tarif reicht 1 GB Blob nicht, Überschreitungen sperren den Blob-Zugriff bis zu 30 Tage. Erwartete Kosten der Auslieferung im Pro-Tarif ≈ 1–13 $/Monat.
10. **Tests:** Unit `buendel` (Index, Schnitt, Typ, ≤ 16 MB); E2E im Chromium: ein Clip normal und langsam bis `ended`, Rückfallweg mit erzwungenem `MediaError`. Die echte Safari-Prüfung ist UMGEBUNGSAUSNAHME mit Ersatzbeleg (Sonde S4 und Protokoll LM-07).

## Fortschreibung nach der Sicherheitsprüfung S-L1 (20.10.2026, `_lernapp/berichte/s-l1.md` N-3, N-4)

1. **CDN-Tags:** Einheitenpakete tragen `lernapp`, `lernapp-kurs-<id>` und `einstellungen`; Audio-Bündel zusätzlich zu
   `lernapp-audio(-<sprache>)` auch `lernapp`, `lernapp-kurs-<sprache>` und `einstellungen`. Ein Schalterwechsel in der Datenbank
   (`updateTag(TAG.einstellungen)`) und jedes Zurückziehen (`updateTag(TAG.lernappKurs(id))`) leeren so auch die Jahreskopien
   im CDN; Verzeichnis und Pakete im Daten-Cache von Next tragen `einstellungen` ebenso. Ein Schalter über die Umgebung wirkt
   ohnehin erst mit einer neuen Bereitstellung.
2. **Zurückgezogener Clip:** Das Paket verweist sofort nicht mehr darauf. Aus dem Bündel verschwindet er erst mit dessen
   Neubau (neuer Hash, neue Adresse) in der Audio-Kette (L3-05); das alte Bündel wird dann im Blob gelöscht.
3. **Teilantworten (206)** hält das CDN nie vor (`Vercel-CDN-Cache-Control: no-store`, ohne Tag). 416 hält niemand vor.
4. **Offen:** Nachweis im Vorschau-Bautest (S5, B2/B5): nach Zurückziehen bzw. Abschalten MISS und 404, Bereichsanfrage MISS.

## Fortschreibung durch L3-05 (21.10.2026, Sprachausgabe-Kette; `_lernapp/werkzeuge/tts/LIESMICH.md`, Bericht `_lernapp/berichte/l3-05-sprachausgabe.md`)

Gilt vor Nr. 3, 6, 9 und der Fortschreibung S-L1 Nr. 2, wo es abweicht.

1. **Nr. 6, Kette:** `pnpm lernapp:audio-liste <sprache>` → `_lernapp/werkzeuge/tts/erzeuge.py` (de: eigener ONNX-Export von
   Coqui-VITS Thorsten, Tokenizer ohne Torch mit Gleichheitsprobe gegen coqui-tts, 4 Prozesse × 1 Thread) →
   `pnpm lernapp:audio-pruefen` (Prüfkette nach PLAN §6.8 Nr. 6, whisper-base aus `public/lern-app/modelle` in Node ohne Netz;
   Bericht nur mit Schlüsseln) → `pnpm lernapp:audio-manifest` (Bündel, Manifest, Hochladen nur mit `--hochladen` und Token).
2. **Stimme:** Kennung `tts:<name>@<erste 16 Hex-Zeichen des SHA-256 der Modelldatei>`; Register je Sprache mit genau einer
   freigegebenen Stimme oder keiner (`web/src/lib/lernapp/audio/stimmen.ts`); ein neuer Export ist eine neue Stimme.
3. **Nr. 3, Bündel je Einheit und Stimme:** Ein Bündel nimmt je Text höchstens einen Clip auf; menschliche Aufnahme und
   Sprachausgabe desselben Texts liegen in getrennten Bündeln der Einheit. Ein Text liegt im Bündel der ersten Einheit, in
   der er vorkommt (Stufe, gemeinsame vor Vorkurs-Einheiten, Schlüssel); spätere Einheiten verweisen dorthin.
4. **Manifest und Datenbank:** eine Zeile je Clip (erzeugte Datei, von Prettier ausgenommen). `lernapp:import` gleicht
   `lernapp_audio` mit dem eingecheckten Manifest ab (`tts:`/`mensch:`; Testtöne bleiben) und bricht bei einem Clip zu einem
   Text mit Religionsbezug, bei einer nicht freigegebenen Stimme oder – im eingecheckten Manifest – bei einer Testton-Stimme
   (`test:`) ab; der Prüfer „audio“ prüft dasselbe samt Wissen und Koran-Pfad.
5. **S-L1 Nr. 2, Zurückziehen:** `--bereinigen` baut die betroffenen Bündel ohne die nicht mehr vertonbaren Texte neu (neue
   Adresse); alte Bündel nennt das Skript, gelöscht werden sie erst, wenn kein Paket mehr darauf verweist (Menschen, LM-15).
6. **Anhören vor dem Hochladen:** `LERNAPP_AUDIO_LOKAL` (Ordner `<sprache>/<datei>.lpa`) – die Route sucht dort vor den
   Testbündeln, nur ohne `LERNAPP_BLOB_BASIS`; dazu `pnpm lernapp:import --audio-manifest <pfad>` (nur ergänzend).
7. **Manifest ins Repository erst nach dem Hochladen** (geschärft nach der Gegenprüfung, siehe Nr. 10):
   `lernapp:audio-manifest` schreibt nach `inhalte/lernapp/audio-manifest/<sprache>.json` nur, wenn jedes Bündel, auf das das
   Manifest verweist, in diesem Lauf über `LERNAPP_BLOB_BASIS` mit gleichem SHA-256 abgerufen wurde oder schon im
   eingecheckten Manifest stand; sonst nach `--manifest` bzw. neben die Bündel (`<aus>/manifest-<sprache>.json`). Ein neues
   Manifest ohne Clips entsteht dort nicht. Ein eingechecktes Manifest verweist so nie auf Bündel, die es im Blob nicht gibt.
8. **Rückerkennung de, Zahlwörter:** Ziffern in Abschrift und Text zählen als deutsches Zahlwort (0–9999); whisper-base schreibt
   gesprochene Zahlen als Ziffern (Probelauf: 26 von 137 Ausreißern). Schwellen 0,75/0,6 unverändert.
9. **Aussprache-Änderungen:** `pnpm lernapp:audio-liste <sprache> --erneuern <wort,…>` nimmt Texte mit diesen Wörtern erneut in
   die Liste, obwohl ihr Clip vorliegt (menschliche Aufnahmen bleiben); der neue Clip ersetzt den alten im Manifest, das Bündel
   wird neu gebaut. Der Versuch je Text (PLAN §6.8 Nr. 6) zählt nur Erzeugungen mit derselben Token-Folge (`eingabe` in
   `erzeugung.jsonl`); nach einer Aussprache-Änderung beginnt er wieder bei eins. Messwerte und Hochrechnung: Bericht
   `_lernapp/berichte/l3-05-sprachausgabe.md`.
10. **Hochladen nur in den Speicher `lernapp`** (Gegenprüfung L3-05, Mangel 1): eigener Schlüssel
    `LERNAPP_BLOB_READ_WRITE_TOKEN`, nur lokal (die App liest nur `LERNAPP_BLOB_BASIS`). `--hochladen` verlangt
    `LERNAPP_BLOB_BASIS` desselben Speichers (Speicherkennung im Schlüssel = Host
    `<speicher>.public.blob.vercel-storage.com`) und bricht vor dem Bau ab, wenn der Schlüssel zum Speicher von
    `BLOB_READ_WRITE_TOKEN` (privat, ADR 0020) oder `AUDIO_BLOB_READ_WRITE_TOKEN` (ADR 0029) gehört. Hochgeladen werden alle
    Bündel, auf die das Manifest verweist und die das eingecheckte Manifest noch nicht kennt; der Speicher muss genau die
    Adresse unter `LERNAPP_BLOB_BASIS` melden. Ältere Bündel holt das Skript nur, soweit der Neubau Clips aus ihnen übernimmt,
    je Bündel einmal (`src/lib/lernapp/audio/blob.ts`, `alteBuendelFuerNeubau`).

## Fortschreibung nach Stufe C (25.10.2026, Befund L15-1 in `_lernapp/protokolle/C-lizenzen.md`, Z-L15/Z-L20/Z-L21)

Gilt vor Nr. 11 und vor der Fortschreibung L3-05 Nr. 2, wo es abweicht. Anlass: Der Vercel-Bau ohne Datenbank importierte den
Testkurs unter `<kurs>.a1.e01` und ersetzte damit die echte Einheit; über den Text-Hash bekamen echte Einträge Testtöne.

1. **Testkurs am eigenen Ort:** Einheiten `<kurs>.a1.test` (`drizzle/seeds/lernapp-test.ts`, `testEinheit`), Testbündel
   `<kurs>.a1.test-<sha16>.lpa`. Der Bau ohne Datenbank (`scripts/bau-datenbank.mjs`) importiert ihn nur mit
   `LERNAPP_TESTKURS=1`; die öffentliche Test-Domain zeigt nur echte Einheiten. E2E und Integration importieren ihn selbst.
2. **Zulässige Clips je Eintrag** (`clipZulaessig` in `src/lib/lernapp/audio/stimmen.ts`, Paketbau und Audio-Studio):
   Testtöne nur an Einträgen mit Quelle `test:…`; für echte Einträge Sprachausgabe nur mit der freigegebenen Stimme und
   `mensch:<id>` nur mit hinterlegter Vereinbarung (Medium nicht im Papierkorb). Ohne zulässigen Clip „Audio folgt“.
3. **Hörabnahme im Register:** `Stimme.hoerabnahme` (`'offen' | 'bestanden'`); freigegeben ist eine Stimme erst mit
   `'bestanden'` (LM-06, nur Mensch). Der Prüfer „audio“ blockiert Sprachausgabe einer Stimme mit offener Hörabnahme im
   eingecheckten Manifest; Arbeitsliste und Manifest-Bau nutzen die registrierte Stimme weiter.

## Alternativen

- Ein JSON je Kurs: verworfen. Zu groß für das Offline-Speichern einzelner Stufen, und jede Freigabe änderte die ganze Datei.
- Eine Datei je Clip: verworfen. ≈ 100.000 Dateien und Anfragen, viele Funktionsaufrufe.
- Audio im Repository: verworfen (Größe, Bauzeit).
- Gemeinsamer Blob-Speicher `audio` mit den Rezitationen (Plan §2.3): nicht gewählt. Rezitationen haben eigene Rechte und Prüfungen (nicht aktive Rezitationen nur für die Werkstatt, L2-E06); Lern-Audio ist öffentlich und unveränderlich. Getrennte Speicher halten Rechte und Kosten auseinander.
- Sprachausgabe im Browser: verworfen. Die Programme phonemisieren mit espeak-ng (GPL-3.0); Auslieferung würde GPL-Code verteilen. Dazu kämen Größe und schwankende Qualität.
- Sprachausgabe zur Laufzeit auf dem Server: verworfen (Kosten, Lizenz, keine Prüfung vor der Auslieferung).
- Pakete nur im Bau vorrendern: verworfen. Bauzeit und Freigaben wirken erst beim nächsten Bau.

## Folgen

- Tests:
  - Unit: `paket-hash`, `buendel` (Kopf, Index, Schnitt).
  - Integration: Pakete enthalten nur Ausgeliefertes; Freigabe löst `updateTag` aus; Byte-Bereiche der Audio-Route.
  - Test „nie vertont“ nach Nr. 7.
- Kosten: Blob-Speicher `lernapp` gesamt ≈ 1,1–1,3 GB einschließlich Modelle (falls im Blob, ADR 0042); Kosten und Datenverkehr beobachten (LM-15).
- Plattenbudget lokal: Audio geht direkt in den Blob-Speicher, keine Vollablage im Arbeitsbaum.
- Abnahme: Z-L15 (Audio für 100 % der Zielinhalte, Lautheit normiert), Z-L03 (Koran-Pfad ohne Sprachausgabe), Z-L16 (Bau ≤ 15 min).
- OFFENE FRAGE (nach S3 auch für Türkisch, ADR 0045 Fortschreibung S3/S8 Nr. 2): Für Arabisch kann die Zielvorgabe „Audio für 100 % der Zielinhalte“ erst mit einer freigegebenen Stimme oder mit Aufnahmen erfüllt werden (ADR 0045, L0-E06). Bis dahin gilt „Audio folgt“.
