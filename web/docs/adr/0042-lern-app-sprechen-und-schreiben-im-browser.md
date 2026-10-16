# ADR 0042 – Lern-App: Sprechen und Schreiben im Browser (Whisper selbst gehostet, keine Laufzeit-KI)

- Status: angenommen im Kern (Nutzerentscheidung „Sprechen/Schreiben (C1)“ vom 16.10.2026: Open Source im Browser, Whisper lokal, nichts verlässt das Gerät; Schreiben mit Musterlösung, Prüfliste, Selbstbewertung, optional Lehrkraft; L3-E06) (Lauf Lern-App); Modellwahl und Auslieferung vorgeschlagen bis Spikes S2 und S5 · Bezug: Plan „Lern-App“ Kontext („Verfeinerung“ Audio/CSP, „Lizenzbefund“ Spracherkennung), §2.6; `_lernapp/PLAN.md` §3.2 (Header), §3.6, §4.2–4.3, §11; Lizenzbericht `_lernapp/berichte/lizenzen-l0.md` §1.3, §2, L0-E08…E10 · ergänzt ADR 0012 (CSP) für `/lern-app`

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
    - Versionen nach Mindestreife (L0-E10): transformers.js 4.3.0, ab 20.10.2026 4.3.1, exakt gepinnt. Der Entwicklungs-Build von onnxruntime-web, den transformers.js mitbringt, wird im Lockfile festgehalten.
    - Lizenzverzeichnis: MIT (OpenAI) **und** Apache-2.0 für Whisper, Apache-2.0 für transformers.js, MIT und `ThirdPartyNotices.txt` für onnxruntime-web (aus dem Repository, das npm-Paket enthält sie nicht), Quellenangabe für Eigen (MPL-2.0).
11. **Schreiben (B1–C1):**
    - Aufgabe in der Zielsprache, Wortzahlbereich, Pflichtwörter.
    - Automatisch geprüft werden nur Länge, Pflichtwörter und die Rechtschreibung über das `spellcheck`-Attribut des Browsers.
    - Danach: 1–2 Musterantworten, Prüfliste nach GER (Aufgabe, Zusammenhang, Wortschatz, Grammatik; je 4 Stufen, eigene Formulierungen nach L0-E19) und Selbsteinschätzung.
    - Optional an die Lehrkraft der eigenen Gruppe (Konto, Gruppe, Schalter `lernapp_gruppen`): `lernapp_schreibabgabe` mit verschlüsseltem Text (`web/src/lib/krypto`, wie bei `lernende`), Bewertung nach Prüfliste und Kommentar. Nur diese Lehrkraft sieht die Abgabe; andere Lernende nie. Löschung nach 12 Monaten.
    - Rechtschreibwörterbücher im Client: Deutsch keines (igerman98 und `dictionary-de` stehen unter GPL); Türkisch `dictionary-tr` (MIT) und Arabisch Ayaspell (unter MPL-2.0, ohne Vokalzeichen) erst nach einem Lasttest mit `nspell` (L0-E09).
12. **Schalter** `lernapp_sprechen` (ohne Personendaten): Vorschau an, Produktion aus bis zum Gerätetest auf iPhone, Android-Mittelklasse und Laptop (LM-07).

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
