# ADR 0042 – Lern-App: Sprechen und Schreiben im Browser (Whisper selbst gehostet, keine Laufzeit-KI)

- Status: **angenommen im Tor L0 (20.10.2026)** mit den Abschnitten „Fortschreibung …“ (Orchestrator nach L3-E12; Gegenprüfung L0 ohne Mangel hoch/mittel) · vorher: angenommen im Kern (Nutzerentscheidung „Sprechen/Schreiben (C1)“ vom 16.10.2026: Open Source im Browser, Whisper lokal, nichts verlässt das Gerät; Schreiben mit Musterlösung, Prüfliste, Selbstbewertung, optional Lehrkraft; L3-E06) (Lauf Lern-App); Modellwahl und Auslieferung vorgeschlagen bis Spikes S2 und S5 · Bezug: Plan „Lern-App“ Kontext („Verfeinerung“ Audio/CSP, „Lizenzbefund“ Spracherkennung), §2.6; `_lernapp/PLAN.md` §3.2 (Header), §3.6, §4.2–4.3, §11; Lizenzbericht `_lernapp/berichte/lizenzen-l0.md` §1.3, §2, L0-E08…E10 · ergänzt ADR 0012 (CSP) für `/lern-app`

## Kontext

- Sprechen und Schreiben gehören zu C1. Der Nutzer will dafür Open Source im Browser; die Aufnahme verlässt das Gerät nicht.
- Die öffentliche CSP (ADR 0012) erlaubt kein WebAssembly-Kompilieren (`'wasm-unsafe-eval'` fehlt), `worker-src` und `media-src` sind `'self'`. Das Mikrofon ist nur unter `/verwaltung/rezitationen` erlaubt.
- transformers.js lädt in der Grundeinstellung Modelle von `huggingface.co` und WebAssembly-Dateien von `cdn.jsdelivr.net`. Das wären Drittanfragen mit Übermittlung der IP-Adresse (KERN „Datenfluss“).
- Größen (Lizenzbericht): whisper-base q8 ≈ 77 MB (Encoder 23,2 MB + Decoder 53,7 MB), whisper-small q8 ≈ 249 MB, ONNX-Runtime-WebAssembly 14–28 MB je Datei. Telefone haben wenig Speicher; die Erkennung von Türkisch und Arabisch ist schwächer als die von Englisch.
- Lizenzen: Whisper-Gewichte MIT (OpenAI, GitHub) und Apache-2.0 (Karte bei Hugging Face); Xenova-Fassungen Apache-2.0; transformers.js Apache-2.0; onnxruntime-web MIT mit Drittlizenzen (u. a. Eigen, MPL-2.0). transformers.js zieht serverseitig `sharp` mit libvips (LGPL-3.0) und `onnxruntime-node` nach.

## Entscheidung

1. **Keine Laufzeit-KI:** keine Anfrage an fremde oder eigene KI-Dienste, keine KI-Bewertung von Texten, keine Erzeugung von Inhalten zur Laufzeit.
2. **Spracherkennung im Worker:** `@huggingface/transformers` nur in `*.worker.ts` (`web/src/components/lernapp/sprechen/whisper.worker.ts`), Ausführung über WebGPU, sonst WebAssembly.
   - `env.allowRemoteModels = false`, `env.localModelPath` auf `/lern-app/modelle/`, `env.backends.onnx.wasm.wasmPaths` auf `/lern-app/modelle/ort/`. Keine Anfrage an `huggingface.co` oder `cdn.jsdelivr.net`.
   - Sprache fest (`german`, `turkish`, `arabic`), `task: 'transcribe'`, **kein** Prompt mit der Lösung.
3. **Modell:** `Xenova/whisper-base`, q8 (`*_quantized.onnx`), fester Commit `64da572`; SHA-256 und Lizenztexte in `web/daten/lernapp-modelle/QUELLE.md`, Lizenztext auch neben den Gewichten.
   - `Xenova/whisper-small` (Commit `2d67713`) nur, wenn Spike S2 für Arabisch oder Türkisch einen Gewinn zeigt, und nur auf geeigneten Geräten (WebGPU, `deviceMemory` ≥ 4 GB).
   - Spike S2 misst Latenz, Speicher und Wortfehlerquote an 30 Sätzen je Sprache (synthetisch und 10 menschliche Proben) sowie den Nutzen von COOP/COEP.
4. **Laden nur auf Wunsch:** Knopf „Sprachprüfung laden“ mit Größenangabe und vorherigem Gerätecheck; nie beim ersten Laden; außerhalb der JS-Budgets der Routen. Vorrat im Cache `igmg-lernapp-modelle`.
5. **Auslieferung vom eigenen Ursprung:** statische Dateien bei Vercel oder Blob-Speicher hinter eigener Route unter `/lern-app/modelle/…`. Welcher Weg trägt, zeigt der Bautest (Spike S5, L0-E08; Grenzen laut Lizenzbericht 100 MB im Hobby- und 1 GB im Pro-Tarif `[im Bautest prüfen]`).
6. **Auswertung:** Die Abschrift wird wie Antworten normalisiert (Arabisch ohne Harakat), Wort für Wort am Zielsatz ausgerichtet und je Wort grün oder gelb markiert; Schwellen je Stufe und Sprache.
   - Benannt als „Verständlichkeit“ bzw. „Ausspracheprobe“, nicht als Lautbewertung; keine Note, keine Folgen. Die Modellkarte von Whisper rät von Entscheidungen auf dieser Grundlage ab.
   - Für FSRS bewerten sich Lernende beim Sprechen selbst (ADR 0038 Nr. 3).
7. **Datenschutz:** Die Aufnahme bleibt auf dem Gerät. Kein Upload, auch nicht an Lehrkräfte.
8. **Rückfall und Zugänglichkeit:** ohne Mikrofon, Modell oder geeignetes Gerät: eigene Aufnahme anhören, mit der Vorlage vergleichen und selbst bewerten. Dazu „Ich kann gerade nicht sprechen“ und die Einstellung „Sprechübungen aus“. Keine Sackgasse; Sprechaufgaben auf C1 sind auch mit Selbstbewertung erfüllbar.
9. **Header nur unter `/lern-app/:pfad*`** (`cspLernApp()` in `web/src/lib/sicherheit/header.ts`, Regel nach der öffentlichen CSP; gemeinsame Dateien, nur der Orchestrator):
   - öffentliche CSP plus `script-src 'wasm-unsafe-eval'`, `worker-src 'self' blob:`, `media-src 'self' blob:`; kein `'unsafe-eval'`
   - `Permissions-Policy: microphone=(self)` nur für `/lern-app/:ui/:kurs/ueben` und `/lern-app/:ui/:kurs/wiederholen`, außerdem für das Audio-Studio `/verwaltung/lernapp/audio/:pfad*`
   - `Cross-Origin-Embedder-Policy: require-corp` nur, wenn Spike S2 einen messbaren Gewinn durch WebAssembly-Threads zeigt
   - Die Website behält ihre Header unverändert.
10. **Abhängigkeiten:**
    - transformers.js nur im Browser bzw. Worker; `sharp` und `onnxruntime-node` gelangen nie in Client-Bündel oder Funktionen (Regeltest `tests/unit/lernapp/bundle-regeln.test.ts`).
      Fortschreibung (Stufe C, Z-L19, 26.10.2026): Gemeint sind die Funktionen der Lern-App, das heißt jedes Modul unter `src`, dessen Pfad einen Abschnitt `lernapp*` oder `lern-app*` hat – u. a. `app/lern-app`, die API `app/api/lernapp/**` (sync, sitzung, schreiben, gruppe, meldung), Verwaltung › Lern-App, Mein Bereich › Unterricht › Lern-App, `components/lernapp`, `components/verwaltung/lernapp`, `lib/lernapp`, `server/queries/lernapp`, `server/actions/lernapp*`; ausgenommen nur `*.worker.ts` (Browser). Der Regeltest „Kein sharp/libvips (LGPL-3.0) und kein onnxruntime-node in Funktionen der Lern-App“ folgt ihrem ganzen Modulgraphen (statische Importe, `import()`, `require()`) samt `dependencies` und `optionalDependencies` der Pakete. Die PDF-Prüfung des Audio-Studios nutzt `lib/medien/typ.ts` ohne sharp. Die Bildpipeline der Website (`lib/medien/verarbeiten.ts`, Medien und Rezitation) bleibt durch M-060 und ADR 0001 („Lizenz-Ausnahmen“) gedeckt. Der Modulgraph belegt nicht die Bau-Ausgabe: Ob Vercel eine Lern-App-Route mit einer Website-Route (sharp) in einer Funktion bündelt, zeigt nur die Dateiliste je Funktion (`.vercel/output/functions/**` eines `vercel build` bzw. des Deployments), nicht die `.nft.json` allein.
    - Versionen nach Mindestreife (L0-E10): transformers.js 4.3.0, ab 20.10.2026 4.3.1, exakt gepinnt. Der Entwicklungs-Build von onnxruntime-web, den transformers.js mitbringt, wird im Lockfile festgehalten.
    - Lizenzverzeichnis: MIT (OpenAI) **und** Apache-2.0 für Whisper, Apache-2.0 für transformers.js, MIT und `ThirdPartyNotices.txt` für onnxruntime-web (aus dem Repository, das npm-Paket enthält sie nicht), Quellenangabe für Eigen (MPL-2.0).
11. **Schreiben (B1–C1):**
    - Aufgabe in der Zielsprache, Wortzahlbereich, Pflichtwörter.
    - Automatisch geprüft werden nur Länge, Pflichtwörter und die Rechtschreibung über das `spellcheck`-Attribut des Browsers.
    - Danach: 1–2 Musterantworten, Prüfliste nach GER (Aufgabe, Zusammenhang, Wortschatz, Grammatik; je 4 Stufen, eigene Formulierungen nach L0-E19) und Selbsteinschätzung.
    - Optional an die Lehrkraft der eigenen Gruppe (Konto, Gruppe, Schalter `lernapp_gruppen`): `lernapp_schreibabgabe` mit verschlüsseltem Text (`web/src/lib/krypto`, wie bei `lernende`), Bewertung nach Prüfliste und Kommentar. Nur diese Lehrkraft sieht die Abgabe; andere Lernende nie. Löschung nach 12 Monaten.
    - Rechtschreibwörterbücher im Client: Deutsch keines (igerman98 und `dictionary-de` stehen unter GPL); Türkisch `dictionary-tr` (MIT) und Arabisch Ayaspell (unter MPL-2.0, ohne Vokalzeichen) erst nach einem Lasttest mit `nspell` (L0-E09).
12. **Schalter** `lernapp_sprechen` (ohne Personendaten): Vorschau an, Produktion aus bis zum Gerätetest auf iPhone, Android-Mittelklasse und Laptop (LM-07).

## Fortschreibung durch die Spikes S2 und S5 (16.10.2026, Belege `_lernapp/belege/S2-whisper-im-browser.md`, `_lernapp/belege/S5-grosse-dateien-vercel.md`)

Gilt vor Nr. 1–12, wo es abweicht. Gemessen auf 4 vCPU (Xeon, 2,1 GHz) im headless Chromium; kein Telefon (LM-07).

1. **Nr. 3, Modell je Sprache (LM-27):**
   - Deutsch: `Xenova/whisper-base` q8 (`64da572`) – Wortfehlerquote 11 % kurz, 24 % lang; whisper-small wird nicht ausgeliefert.
   - Türkisch: whisper-base q8 mit großzügiger Schwelle (WER 30–36 %). whisper-small (WER ≈ 16 %, 9–18 s je kurzem Satz, ≈ 3,4 GB Speicher) erst nach LM-07 als freiwillige „genauere Prüfung“ auf starken Desktop-Geräten.
   - Arabisch: whisper-base gibt **keine automatische Rückmeldung** (WER 51–66 %, Fehlablehnung bis 32 %). Standard ist der Rückfall nach Nr. 8 (eigene Aufnahme anhören, mit der Vorlage vergleichen, selbst bewerten). Automatische Prüfung nur mit whisper-small auf geeigneten Geräten nach LM-07 (Opt-in, ≈ 267 MB).
2. **Nr. 6, Auswertung:**
   - Geprüft werden nur Wörter, nie die Vokalisierung; Harakat-Übungen bleiben ohne Spracherkennung.
   - Schwellen (Trefferanteil S): base de 0,6, tr 0,5, ar keine; small (nach LM-07) de 0,7, tr 0,7, ar 0,6. Ab S „gut verständlich“, darunter „Teilweise verstanden – vergleiche mit deiner Aufnahme“; unsicher erkannte Wörter gelb, nie rot, keine Note. Kurzsatzregel: bei höchstens 4 Wörtern darf ein Wort fehlen. Gleiche Werte für A1–C1; neu kalibriert in L5 mit Aufnahmen echter Lernender (Einwilligung, Aufnahme bleibt auf dem Gerät, nur Zahlen notiert).
   - Die App zeigt **nie** die freie Abschrift, nur die Wörter des Zielsatzes mit Markierung (Whisper erfindet bei Stille Text; eine Abschrift könnte religiöse Formeln enthalten, die nicht aus geprüften Daten stammen – KI-Regel 2).
   - Schutz vor Halluzination: relative Pegelprüfung vor der Erkennung (Rauschboden + 12 dB, mindestens 0,3 s Sprache, `autoGainControl`), `max_new_tokens = ⌈1,5 × Zieltokens⌉ + 8`, Aufnahme höchstens 15 s, Wiederholungsprüfung (ein 4-Gramm ≥ 4-mal oder Abschrift länger als das Doppelte des Ziels → „Nicht verstanden, bitte noch einmal“).
3. **Nr. 9, Header:**
   - `Cross-Origin-Opener-Policy: same-origin` und `Cross-Origin-Embedder-Policy: require-corp` für **ganz** `/lern-app/:pfad*` (gemessen 1,40× schneller mit 2 Threads, 1,77× mit 4; nur Übungsrouten reichen nicht, weil clientseitige Navigation kein isoliertes Dokument erzeugt). Voraussetzung: nur eigener Ursprung (KERN §1); der SW speichert Originalantworten samt Kopfzeilen. Header-Test; E2E prüft `crossOriginIsolated` auf `…/ueben`. Die Website behält ihre Header.
   - CSP verschärft: `worker-src 'self'` **ohne** `blob:`; `media-src 'self' blob:` nur zum Abspielen eigener Aufnahmen und der Lern-Audio-Scheiben (ADR 0039); kein `blob:` in `script-src`, kein `'unsafe-eval'`. Voraussetzung `env.useWasmCache = false`. KERN §6 ist insoweit fortgeschrieben.
4. **Nr. 2/10, Worker-Einstellungen:** `env.allowRemoteModels = false`, `env.allowLocalModels = true`, `env.localModelPath = '/lern-app/modelle/'`, `env.useWasmCache = false`, `env.useBrowserCache = false` (Vorrat über den Lern-App-SW); `wasmPaths` auf die eigenen ORT-Dateien (`ort-wasm-simd-threaded.mjs`/`.wasm`); `dtype: 'q8'`, `device: 'wasm'`; Threads nach ORT-Standard; Sprache fest, `task: 'transcribe'`, `return_timestamps: false`. WebGPU in der ersten Fassung aus; erst nach LM-07 mit eigenen fp16-Dateien als eigener Versuch.
5. **Nr. 5, Auslieferung (Weg M1, S5):** statisch vom eigenen Ursprung unter `web/public/lern-app/modelle/whisper-base-64da572/…` (SHA-256 und Lizenztexte in `web/daten/lernapp-modelle/QUELLE.md`); die ORT-Dateien kopiert ein Bauschritt mit SHA-Prüfung aus dem exakt gepinnten `onnxruntime-web` in `node_modules`. Genau 10 Dateien (7 Modell- und Konfigurationsdateien, ORT `.wasm` und `.mjs`, Worker-Chunk), zusammen ≈ 94,5 MB; asyncify, jsep und jspi nicht ausliefern. Kopfzeilen `/lern-app/modelle/:pfad*`: `public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`. whisper-small nur über Blob und externen Rewrite (Decoder > 100 MB GitHub-Grenze) nach LM-27.
6. **Nr. 4, Laden und Vorrat** (offline belegt ist bisher nur die Variante `env.cacheKey = 'igmg-lernapp-modelle'` mit `wasmBinary` aus dem Cache; `useBrowserCache = false` wird in L5 per E2E ohne Netz belegt, sonst gilt die gemessene Variante): Knopf „Sprachprüfung laden (≈ 95 MB)“ (KERN §9 statt ≈ 77 MB). Cache `igmg-lernapp-modelle` (Vorrat zuerst) im Lern-App-SW für alle 10 Dateien einschließlich `.mjs`; Originalantwort speichern (COEP). Worker nach der Übung beenden (Neustart aus dem Vorrat 1,1–1,4 s).
7. **Gerätecheck vor dem Download** (ohne Netz): Modul-Worker, WebAssembly mit SIMD, `getUserMedia`/`MediaRecorder`, `AudioContext` mit 16 kHz, Cache Storage; freier Platz ≥ 200 MB; `navigator.deviceMemory` < 4 → Rückfall (unbekannt → erlaubt mit Hinweis); Größe nennen. whisper-small (nur nach LM-07, Opt-in für tr/ar) zusätzlich nur bei `deviceMemory` ≥ 8, nicht mobil, `hardwareConcurrency` ≥ 8, `crossOriginIsolated` und Probelauf mit base ≤ 2 s; Ausführung über WebAssembly, nicht WebGPU. **Nach dem Download** ein Probelauf mit einem eingebauten Clip von ≈ 2 s: bis 5 s normal, 5–12 s Hinweis, darüber, bei Fehler oder Absturz Rückfall (lokal gemerkt, kein automatischer neuer Versuch). Testplan LM-07 nach Beleg S2 §5.
8. **Nr. 10, Version:** transformers.js 4.3.0 ist belegt; vor 4.3.1 (ab 20.10.2026) denselben Rauchtest wiederholen (Laden, 3 Sätze je Sprache, Netz- und CSP-Protokoll). ORT `1.31.0-dev.20260914-8d85527a0` im Lockfile festhalten.
9. **Nr. 12, Schalter:** `lernapp_sprechen` bleibt in der Produktion aus bis LM-07; die automatische Rückmeldung für Arabisch bleibt zusätzlich aus, bis whisper-small auf Geräten bestätigt ist.
10. **Folgen, Latenz:** „≤ 3 s auf dem Referenzgerät“ wird als Probelauf nach dem Laden gemessen; hier base 2,8 s (4 Threads) bzw. 3,5 s (2 Threads) für kurze Sätze.

## Fortschreibung nach der Gegenprüfung L2/L3-02 (21.10.2026)

Gilt vor Nr. 1–12 und den Abschnitten oben, wo es abweicht.

11. **Nr. 3 und 10, Lizenztexte an der Auslieferung:** Neben den Gewichten liegen `LIZENZ-whisper-MIT.txt` (OpenAI) und `LIZENZ-Apache-2.0.txt` (ONNX-Fassung von Xenova, transformers.js), gleich den gepinnten Fassungen in `web/daten/lernapp-modelle/` (SHA-256 in `QUELLE.md`). Unter `/lern-app/modelle/` liegen damit **12 Dateien**: die 10 der Sprechübung (Fortschreibung Nr. 5) und die 2 Lizenztexte; diese gehören nicht zum Download, nicht zum Vorrat `igmg-lernapp-modelle` (der Lern-App-SW lässt sie ans Netz) und nicht zur angezeigten Größe. Der Bauschritt `scripts/lernapp-modelle.mjs` prüft sie und gibt dem Worker einen Lizenzkopf (transformers.js Apache-2.0, onnxruntime-web MIT, Verweis auf den Lizenztext). Die Seite „Quellen“ der Lern-App nennt transformers.js und ONNX Runtime Web bei den Programmbibliotheken sowie Whisper (OpenAI, MIT) und die ONNX-Fassung (Xenova, Apache-2.0) unter „Spracherkennung“, jeweils mit Lizenztext. Die Drittlizenzen von onnxruntime-web (`ThirdPartyNotices.txt`) folgen in L8 (Nr. 10; umgesetzt in Stufe C, Nr. 25).
12. **Fortschreibung Nr. 4 und 6, Vorrat:** Ausgeliefert ist die offline belegte Variante aus Nr. 6: `env.useBrowserCache = true` mit `env.cacheKey = 'igmg-lernapp-modelle'` und `wasmBinary` aus diesem Vorrat. `useBrowserCache = false` aus Nr. 4 gilt erst, wenn L5 es per E2E ohne Netz belegt.
13. **Nr. 4, Laden nur auf Wunsch, auch beim zweiten Mal:** Die Übung startet den Worker ohne Knopf nur, wenn der lokal gemerkte Stand „geladen“ ist **und** Encoder, Decoder und ORT-`.wasm` im Vorrat liegen. Hat der Browser den Vorrat geräumt (Speicherdruck; `localStorage` bleibt erhalten), erscheint wieder das Angebot mit Größe; es gibt kein stilles Nachladen. Der Pegel der Aufnahme (B-35) setzt den Balken direkt am Element, ohne die Übung je Animationsbild neu zu rendern; „Ich kann gerade nicht sprechen“ überspringt auch die übrigen Sprechübungen der Lektion (wie beim Hören).

## Fortschreibung nach der Gegenprüfung L3-06 (21.10.2026)

14. **Nr. 9, CSP der Verwaltung:** `media-src 'self' blob:` gilt zusätzlich unter `/verwaltung/lernapp` (auch mit
    Sprachpräfix): Das Audio-Studio spielt Probeaufnahmen aus dem Browser, die Prüfoberfläche und die Vorschau im echten
    Spieler spielen Lern-Audio-Scheiben. Die übrige Verwaltung behält ihre strikte CSP; `'wasm-unsafe-eval'`, `worker-src blob:`
    sowie COOP/COEP bleiben auf `/lern-app` beschränkt. Abgesichert durch einen Unit-Test der Kopfzeilen (L3-06, b975936).

## Fortschreibung nach der Gegenprüfung L5-03 (22.10.2026)

15. **Folgen, E2E Schreibabgabe:** `tests/e2e/lernapp/gruppe.spec.ts` geht den Korrekturweg (Abgabe, Rückgabe,
    Rückmeldung) und prüft, dass die Aufsicht derselben Gruppe weder die Liste noch die Abgabe sieht („nicht gefunden“, ohne
    Text und Kommentar). Fremde Lehrkraft, Eltern, Kind, andere Lernende und Administration sowie Austritt, Widerruf und der
    Löschlauf nach 12 Monaten sind in der Integration belegt (`tests/integration/lernapp-schreiben.test.ts`); ein Löschlauf
    im E2E bräuchte eine verstellte Uhr des Servers und unterbleibt.
16. **Nr. 11, Abgabe ohne Abgleich:** Die Abgabe an die Lehrkraft braucht den Schalter `lernapp_gruppen`, nicht
    `lernapp_sync`. Ohne verbundenes Gerät fragt die Übung den Server erst nach der ausdrücklichen Handlung „Mit meinem Konto
    prüfen“ (es genügt die Anmeldung der Website, wie bei „Meine Gruppe anzeigen“); mit verbundenem Gerät fragt sie sofort.
    Die Grenzen (3 je Aufgabe und Gruppe, 200 je Konto) zählt der Dienst unter einer Zeilensperre des Kontos
    (`FOR NO KEY UPDATE`), damit gleichzeitige Abgaben sie nicht überschreiten. Eine Rückgabe, deren Abgabe inzwischen gelöscht
    ist, endet als „gibt es nicht“ ohne Audit-Eintrag.

## Fortschreibung nach der Sicherheitsprüfung S-L2 (23.10.2026, Auflagen M-1, N-2, H-1)

17. **Nr. 11, Austritt, Widerruf, Lehrkraftwechsel (S-L2 N-2):** Beim Austritt (Mitglied entfernt – in der Verwaltung oder
    durch die Leitung im Chat, S-09 –, Lernende beendet, Gruppe archiviert) werden die Abgaben der Person von der Gruppe gelöst (`gruppe_id` und `korrigiert_von` leer,
    `lib/lernapp/schreiben/folgen.ts`); kein Wiedereintritt und keine neue Lehrkraft macht sie wieder lesbar, die Person
    sieht und löscht sie weiter. Die Lehrkraft liest nur Abgaben, die eine geltende Einwilligung schon zur Zeit der Abgabe
    deckte (`lernappEinwilligungDetail.seit`); ein neues Erteilen deckt nie die Zeit davor. Nach einem Widerruf von
    `lernapp` löscht `folgenDesWiderrufs` die nicht mehr gedeckten Abgaben (die Widerrufswege der Eltern und der
    Jugendlichen rufen es auf; Erteilen und Widerrufen von `lernapp` in „Mein Bereich“ folgt mit S-L3 N-2). Entscheidung
    zum Lehrkraftwechsel bei laufender Mitgliedschaft: Abgaben bleiben **gruppengebunden** (DSFA D-L17) – die neue Lehrkraft
    übernimmt sie wie das Gruppenbuch. „Mein Bereich › Konto“ löscht alle eigenen Abgaben auch ohne `lernapp_gruppen`; der
    Datenexport nennt die Kennung jeder Abgabe.
18. **Nr. 11, Kommentar an Kinder (S-L2 M-1, DSFA D-L16):** Bis Kinderschutz, DSB und Bildung entschieden haben, bekommen
    Abgaben in der Einwilligungslage „eltern“ nur Prüfliste und Einstufung (`schreiben/kinderschutz.ts`): Dienst
    (`KommentarGesperrt`) und Action (`kommentarKind`) lehnen einen Kommentar ab, das Formular der Lehrkraft blendet das Feld
    aus und nennt den Grund; eine Rückgabe ohne Kommentar entfernt dort auch einen früheren. Startklar
    (`gemeinde.lernapp-kommentar-kinder`, `bewerteDL16`) meldet Rot in der Betriebsart Produktion und eine Warnung in
    Vorschau und Entwicklung, solange `lernapp_gruppen` wirksam an ist und `ENTSCHEIDUNG_D_L16` fehlt. Der Eintrag
    `kommentarAnKinder: true` allein öffnet nichts: Erst wenn zusätzlich alle beschlossenen Schutzmaßnahmen umgesetzt sind
    (Eltern sehen den Kommentar oder können ihn melden, Fassungen statt Ersetzen, Bremse, Zeitfenster), wird der Kommentar
    möglich (Nr. 20).
19. **Route, Größe (S-L2 H-1):** `POST /api/lernapp/schreiben` liest den Körper als Strom und bricht nach 64 KB ab, auch
    ohne oder mit falscher Content-Length (wie der Abgleich). Der Schalter `lernapp_gruppen` setzt zusätzlich `konten`
    voraus (S-L2 H-2, `funktionen-regeln.ts`). Die Einwilligung der Eltern zählt nur mit bestätigtem Eltern-Kind-Bezug
    (S-L2 H-3, wie Lernwoche und Familie). Ein Leseeintrag im Audit beim Öffnen einer Abgabe (S-L2 H-4) bleibt offen und
    wird mit D-L16 entschieden.

## Fortschreibung nach der Gegenprüfung der S-L2-Auflagen und S-L3 N-2 (23.10.2026, Paket SL2-Rest)

20. **Nr. 18, Bindung der Entscheidung D-L16:** `kommentarErlaubt` (`schreiben/kinderschutz.ts`) wird in der
    Einwilligungslage „eltern“ erst wahr, wenn `ENTSCHEIDUNG_D_L16` mit `kommentarAnKinder: true` eingetragen ist **und**
    jede Maßnahme aus `SCHUTZMASSNAHMEN` (`elternSehenOderMelden`, `fassungen`, `bremse`, `zeitfenster`) in
    `UMGESETZTE_SCHUTZMASSNAHMEN` steht. Eintragen erst, wenn die Maßnahme gebaut und mit Integrationstest belegt ist.
    Zugelassen, aber nicht umgesetzt: Startklar warnt mit der Liste der fehlenden Maßnahmen, der Kommentar bleibt gesperrt.
21. **Nr. 18, Altkommentare:** Ein Kommentar, der vor der Sperre gespeichert wurde, erreicht ein Kind nicht mehr:
    `eigeneAbgaben` (Liste der eigenen Abgaben in der Lern-App) lässt ihn in der Lage „eltern“ weg, solange
    `kommentarErlaubt` falsch ist. Der Datenexport nach Art. 15/20 (`abgabenFuerExport`) bleibt vollständig – er gibt
    gespeicherte Daten heraus (Auskunft an die Eltern bzw. die Person), er ist kein Kanal der Lehrkraft zum Kind.
22. **Verteidigung in der Tiefe (S-L2 N-1):** `ladeGruppenKontext` gibt Konten mit der Rolle Administration keinen
    Gruppenzugang (keine Leitung, keine eigenen Gruppen, keine Kinder) – auch einem Altbestand, der Administration mit einer
    Gruppenleitung oder einer Kontoart ≠ „gemeinde“ verbindet. Startklar `gemeinde.administration-gruppenzugang` zählt solche
    Konten: Rot in der Betriebsart Produktion, Warnung in Vorschau und Entwicklung.
23. **Lebenszyklus der Einwilligung `lernapp` (S-L3 N-2, schreibt Nr. 17 fort):** Erteilen und Widerrufen in „Mein
    Bereich“ – Personen ab 16 selbst unter „Konto › Lern-App“ (EL1 bzw. EL3 bis zum 18. Geburtstag), Eltern für Kinder
    unter „Meine Kinder“ über `KIND_EINWILLIGUNGEN` (EL2, mit Einvernehmen und bestätigtem Bezug; ab 16 entscheidet das
    Kind, wie bei Chat und Push). Version `lernapp…/2026-10-entwurf+sha256:<Hash des angezeigten Wortlauts>`
    (`lib/lernapp/einwilligung.ts`); der Wortlaut steht als Entwurf gekennzeichnet in den Bereichsdateien. Erteilen nur, wenn
    `lernapp_sync` oder `lernapp_gruppen` wirksam an ist; Widerrufen immer. Der Widerruf (ab 16 einschließlich einer noch
    laufenden Einwilligung der Eltern) ruft `folgenDesWiderrufs`: nicht mehr gedeckte Schreibabgaben und – ohne geltende
    Einwilligung – Lernstand auf dem Server (`lernapp_profil` mit Ereignissen, Kartenstand, Lerntagen je Tag und Kurs),
    Zustimmung zur Bestenliste und Familien-Bestenliste gehen sofort, in einer Transaktion unter der Sperre des Abgleichs;
    Audit `lernapp.lernstand_geloescht` nur mit Anlass. Der nächste Abgleich antwortet 403; der Stand auf dem Gerät bleibt.
    Die Zustimmung zur Bestenliste lässt sich auch in „Mein Bereich › Konto“ zurücknehmen. Der Datenexport nach Art. 15/20
    enthält die Lern-App-Daten (`lib/lernapp/export.ts`). Die Einstellungen der Lern-App verweisen auf „Mein Bereich“.
24. **Ende des Eltern-Kind-Bezugs:** Bestätigt eine zweite Person das Beenden (`entscheideBezugEnde`) oder wird das
    Elternkonto gelöscht (`loescheGemeindeKonto`), endet in derselben Transaktion die Einwilligung `lernapp`, die dieses
    Elternteil für das Kind gegeben hat (`beendeLernappDerEltern`); danach gehen Schreibabgaben und Lernstand des Kindes, die
    nur sie deckte (Anlass „bezug“). Deckt die Einwilligung des anderen Elternteils sie, bleiben sie.

## Fortschreibung Stufe C (26.10.2026, Z-L17)

Gilt vor Nr. 4, Fortschreibung Nr. 6 und 11, wo es abweicht.

25. **Drittlizenzen von onnxruntime-web offline:** `ThirdPartyNotices.txt` (gepinnt, Herkunft und SHA-256 in
    `web/daten/lernapp-lizenzen/QUELLE.md`) liegt statisch unter `/lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt`,
    nicht unter `/lern-app/modelle/` (dort bleiben es 12 Dateien). Sie gehört zum Download der Sprachprüfung: **11
    Download-Dateien** (`DOWNLOAD_PFADE`), `GESAMT_BYTES` samt 338 088 Byte (weiter ≈ 95 MB). `fuelleVorrat` legt sie neben
    die ORT-`.wasm` in den Vorrat `igmg-lernapp-modelle`; sie ist kein Pflichtteil (`VORRAT_PFLICHT`): Ein Fehler bei ihr
    bricht den Download nicht ab, der nächste Start holt sie nach. Der Lern-App-SW liefert `/lern-app/lizenzen/…` aus diesem
    Vorrat, sonst aus dem Netz, ohne sie selbst vorzuhalten.
    - **Fassung in der Adresse:** Link auf den Seiten „Quellen“ (Lern-App und Website) und Schlüssel im Vorrat ist
      `…/onnxruntime-ThirdPartyNotices.txt?v=<SHA-256, 12 Zeichen>` (`ORT_HINWEISE.adresse`). Der SW gleicht samt Suchteil ab
      (kein `ignoreSearch`) und gibt eine alte Kopie nie für eine neue Adresse aus; `fuelleVorrat` holt beim nächsten Start
      mit Netz die neue Fassung und nimmt ältere derselben Datei (anderer oder kein Suchteil) aus dem Vorrat. So bleibt nach
      einem Wechsel von onnxruntime-web kein veralteter Text unter einem neuen Stand stehen.
    - Belegt durch Units (`sprechen-einmal-laden`, `lernapp-sw`, `quellen`); ein E2E ohne Netz nach geladener Sprachprüfung
      steht aus.

## Alternativen

- Web Speech API des Browsers: verworfen. Je nach Browser geht das Audio an Server des Herstellers; das widerspricht „nichts verlässt das Gerät“ und funktioniert nicht offline.
- Whisper auf dem eigenen Server oder bei einem Dienst: verworfen (Aufnahme verließe das Gerät; Laufzeit-KI).
- Modelle zur Laufzeit von `huggingface.co` oder WebAssembly von jsDelivr: verworfen (Drittanfragen).
- `onnx-community/whisper-*`: nicht gewählt. Die Karten haben kein Lizenzfeld; die Xenova-Fassungen nennen Apache-2.0.
- `whisper-tiny` q8 (≈ 41 MB): nur Rückfall, falls Spike S2 `base` auf Telefonen als zu langsam zeigt.
- KI-Bewertung von Schreibaufgaben: verworfen (Nutzerentscheidung, Datenschutz, keine Laufzeit-KI).
- `'wasm-unsafe-eval'` für die ganze Website: verworfen. Nur die Lern-App braucht es.

## Folgen

- Tests:
  - E2E `sprechen` mit simuliertem Mikrofon (`--use-fake-device-for-media-stream`) und einem Attrappen-Worker, nur im Testbau (`E2E_ATTRAPPEN=1`, im Produktionsbau entfernt).
  - Header-Prüfung je Bereich (Website ohne `'wasm-unsafe-eval'`, Lern-App mit); Netzprotokoll ohne fremde Hosts auch nach dem Laden des Modells.
  - E2E Schreibabgabe: nur die Lehrkraft der Gruppe sieht den Text; Löschlauf.
- Whisper-Messung je Sprache wird in L5 dokumentiert (Latenz ≤ 3 s auf dem Referenzgerät oder Rückfall aktiv).
- Blob-Bedarf für Modelle ≈ 0,1–0,4 GB, je nach Modellwahl (ADR 0039 Folgen).
- MENSCHEN: LM-07 (Gerätetest), LM-19 (Screenreader).
