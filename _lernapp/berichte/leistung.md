# L8-02 – Leistung und Zugänglichkeit der Lern-App

| | |
|---|---|
| Datum | 24.10.2026 |
| Paket | L8-02 (PLAN §14 L8), Abnahme Z-L07 (Leistung) und Z-L06 (axe-Anteil) |
| Stand | Zweig `lernapp-l8`, Messbau aus `4d00cadf` (Merge `claude/trusting-lovelace-6nfolz` mit SL2-Rest `ac219eb0`) |
| Werkzeuge | `_lernapp/werkzeuge/leistung/` (Kopien und Anpassungen von `_gemeinde/werkzeuge/`, dort unverändert), `web/scripts/lernapp-budget.mjs`, `web/scripts/messen.mjs` |
| Rohdaten | außerhalb des Repos (`<scratchpad>/l8-leistung/lauf1/`): `lauf.log` mit `uptime` je Schritt, JSON je Werkzeug |

**Stand dieses Berichts: ZWISCHENSTAND** – Budgets, `messen.mjs`, INP, Netzprotokoll Sprechübung und Lasttest liegen vor;
Lighthouse aller Routen und axe laufen noch (Abschnitte 4 und 6).

## 1. Methode

- **Ein Produktionsbau** (`pnpm build`, Turbopack, `output: standalone`) mit `FUNKTION_LERNAPP`, `…_SYNC`, `…_SPRECHEN`,
  `…_MELDUNGEN`, `…_GRUPPEN` und `FUNKTION_KONTEN` = `an` (nur in `web/.env`, nie eingecheckt), gebaut gegen die
  Wegwerf-Datenbank `igmg_lernapp_d_e2e` (PostgreSQL 16, Seeds, Inhalte und Testkurs wie die Lern-App-E2E über
  `scripts/e2e-datenbank.mjs`). Server `scripts/start-standalone.mjs` auf Port 3224, PID gemerkt.
- **Ein Aufruf** `bash _lernapp/werkzeuge/leistung/messlauf.sh` unter dem gemeinsamen Schloss `bau.lock`: Datenbank,
  Bau, Server, Anmeldungen (`konten.mjs`: Lehrkraft mit Gruppe, Kind, Eltern – Platzhalter, Wegwerf-Daten), Aufwärmen,
  Messungen, Server per PID beenden, `.next`, `test-results` und `.env` löschen.
- **Berichtigung im Lauf:** Die Umgebung setzt `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` (Chromium-Build 1194); die
  Playwright-Version aus `web/` (1.64.0) erwartet Build 1248. Der erste Durchgang der Browser-Werkzeuge brach deshalb sofort
  ab; der Lasttest (ohne Browser) lief. Die Browser-Teile liefen danach gegen **denselben Bau und Server** als Auftrag der
  Auftragsschleife des Messlaufs mit dem Browserordner der E2E. `messlauf.sh` setzt den Pfad jetzt selbst (`MESS_BROWSER`)
  und löscht nach dem Bau `.next/server` (Kopie liegt in `.next/standalone`, ≈ 1,4 GB): Nach dem Bau waren nur noch
  1,15 GB frei, nach dem Löschen 2,5 GB.
- **Lighthouse** 13.5.0 mobil, Drosselung „devtools“ (150 ms RTT, 1,6 Mbit/s, CPU ×4; „simulate“ ist gegen localhost zu
  pessimistisch, E-026), 3 Läufe je Route, Median. Kategorien Leistung, Zugänglichkeit, Best Practices, SEO (SEO nur auf
  indexierbaren Seiten gewertet).
- **INP** (Labor): Playwright mit CPU-Drosselung ×6 (CDP `Emulation.setCPUThrottlingRate`), Event-Timing-API, 3 Läufe je
  Szenario, Median; Interaktionen im Spieler (Antwort wählen, Prüfen, Weiter, Wortbank, Paare, Tastatur-Eingabe,
  Bildschirmtastatur) und das Öffnen des Lernpfads (Seitenwechsel Start → Lernpfad) samt „offline speichern“.
- **axe** (axe-core 4.13.0 über `@axe-core/playwright` 4.13.0), Regeln WCAG 2.0/2.1/2.2 A/AA, auf allen Lern-App-Routen in de/tr/ar
  × 390/1440 px, dazu der Spieler nach der Antwort, die Fehlerseite, `/lernen` in de/tr/en und die Lern-App-Seiten in
  Mein Bereich (mit Anmeldung, de/tr/en).
- **JavaScript je Route:** `scripts/lernapp-budget.mjs` (KERN §9 in der Fassung nach Spike S1: Grundstock und
  Lern-App-eigener Anteil, gz -9 je Datei, Service Worker gesperrt) und `scripts/messen.mjs` (Lighthouse-Weg der Website).
- **Lastregel:** `uptime` vor jeder Messung; verfehlt eine Route eine lastabhängige Schwelle (Leistung, LCP, CLS, INP) bei
  Last > 1,5, misst das Werkzeug sie einmal nach, sobald die Last sinkt (höchstens 5 min, danach 2 min); sonst „unter Last“.

## 2. Gerätprofil und Last

| | |
|---|---|
| Maschine | 4 Kerne, 15 GB Arbeitsspeicher, Linux 6.18 (Firecracker), Platte knapp (4,0 GB frei vor dem Bau) |
| Browser | Chromium 141.0.7390.37 (Headless Shell), Node 24.21.0 |
| Server | Next.js 16.4.2 standalone, `NODE_ENV=production`, PostgreSQL 16 lokal, Pool höchstens 10 Verbindungen |
| Parallel | Inhalts-Agenten mit `lernapp:pruefen`, `tsc`, Vitest (wenig, aber spürbar CPU) |
| Last (1 min) | Bau 4,6–5,3 · `messen.mjs` 2,7–2,8 · Netzprotokoll 2,8–3,6 · Lasttest 4,4–4,7 · INP 3,6–7,2 · Lighthouse ab 7,2 (siehe 4) |

Die Last lag während des ganzen Laufs über 1,5. Alle Zeitwerte sind deshalb **obere Schätzungen**; wo eine Route trotzdem
erfüllt, ist das belastbar.

## 3. JavaScript beim ersten Laden (KERN §9)

`lernapp-budget.mjs`, gz -9 je Datei. Grundstock Next/React (gemeinsam von `/` und der Hülle): **135,3 KB** (8 Dateien).

| Teil | Route | gesamt KB | eigener Anteil KB | Budget | Ergebnis |
|---|---|---|---|---|---|
| Hülle | `/lern-app/de/quellen` | 143,8 | 8,4 | eigen ≤ 20 | erfüllt |
| Start | `/lern-app/de` | 149,3 | 14,0 | ≤ 180, eigen ≤ 30 | erfüllt |
| Lernpfad | `/lern-app/ar/de-aus-ar` | 154,6 | 19,2 | ≤ 180, eigen ≤ 30 | erfüllt |
| Fortschritt | `/lern-app/de/fortschritt` | 153,3 | 17,9 | ≤ 180, eigen ≤ 30 | erfüllt |
| Spieler (l01, erste Aufgabe) | `/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.e01.l01` | 192,2 | +55,4 über der Hülle | ≤ 210, zusätzlich ≤ 60 | erfüllt |
| Spieler (l02, Wortbank zuerst) | `…/ueben?l=de-aus-tr.a1.e01.l02` | 194,5 | – | ≤ 210 | erfüllt |
| Wiederholen ohne Karten | `/lern-app/de/tr-aus-de/wiederholen` | 152,2 (ohne Zod) | – | ≤ 210 | erfüllt |
| Einstufung vor dem Start | `/lern-app/de/tr-aus-de/einstufung` | 152,2 (ohne Zod) | – | ≤ 210 | erfüllt |
| Spieler-Chunk | – | 37,3 | – | (im Spieler-Anteil) | – |
| Übungstypen (26) | – | 1,0 (grammatik_tipp) bis 11,6 (schrift_tr, schrift_latein) | – | je ≤ 15 | erfüllt |
| Arabische Bildschirmtastatur | – | 1,5 | – | ≤ 10 | erfüllt |

Übungstypen im Einzelnen (KB): auswahl 2 · paare 2,9 · wortbank 4,6 · bild_wort 3 · frei 5,2 · hoeren_waehlen 7,3 ·
hoeren_schreiben 9,8 · minimalpaare 7,3 · luecke 8 · satzbau 4,6 · formen 6,6 · harakat 4,4 · wahr_falsch 3,2 ·
zuordnen 3,9 · reihenfolge 3,2 · fallfrage 3,5 · koran_wort 2,7 · dialog 9,6 · geschichte 9,9 · lesen_fragen 5,5 ·
grammatik_tipp 1 · schrift_ar 5,3 · schrift_tr 11,6 · schrift_latein 11,6 · sprechen 9,7 · schreiben 3,3.

**Zu den Zahlen im Auftrag** („Hülle ≤ 120 KB, Start/Lernpfad ≤ 150 KB, Spieler-Route ≤ 180 KB“, ebenso der Wortlaut von
Z-L07 in `ABNAHME.md`): Das sind die Budgets vor der Fortschreibung von KERN §9 am 16.10.2026 (Spike S1: Next/React allein
≈ 128 KB, heute 135,3 KB). Gemessen wird nach der geltenden Fassung (eigener Anteil plus Gesamtgrenze 180/210/230 KB).
Gegen die alten Gesamtzahlen läge nur die Hülle (143,8 > 120) bzw. jede Route über ihnen – allein wegen des Grundstocks.
Vorschlag: den Wortlaut von Z-L07 an KERN §9 angleichen (Orchestrator; ABNAHME hier nicht geändert).

## 4. Lighthouse je Route (mobil, Median aus 3 Läufen)

*läuft – folgt im Abschluss-Commit.*

Zum Vergleich der Website-Messweg `scripts/messen.mjs` (je 1 Lauf, Last 2,7–2,8):

| Route | Leistung | Zugängl. | BP | SEO | LCP ms | CLS | TBT ms | JS KB | simuliert (P / LCP) |
|---|---|---|---|---|---|---|---|---|---|
| `/lern-app/de` | 92 | 100 | 100 | 100 | 1988 | 0,001 | 277 | 162,1 | 85 / 3695 |
| `/lern-app/ar/de-aus-ar` | 92 | 100 | 100 | 100 | 1957 | 0,067 | 246 | 167,3 | 93 / 2449 |
| `/lern-app/tr/de-aus-tr/ueben?l=…l01` | 91 | 100 | 100 | (66, `noindex`) | 1807 | 0,011 | 319 | 161,7 | 82 / 3857 |

`messen.mjs` wertet TBT ≤ 200 ms als Labor-Ersatz für INP und meldet deshalb „verfehlt: TBT“. Für die Abnahme zählt INP
(Abschnitt 5); TBT steht hier als Hinweis.

## 5. INP (CPU ×6, 3 Läufe, Median)

| Szenario | INP ms | je Schritt (Median, ms) | Öffnen ms | Last (max) | Ergebnis |
|---|---|---|---|---|---|
| Spieler l01 (Auswahl, Paare, Wortbank) | 168 | Paare antippen 160 · Antwort wählen 128 · Prüfen 160 · Weiter 136 · Wortbank antippen 120 | – | 4,56 | erfüllt |
| Spieler l03 (Bildkarte, Freitext mit Tastatur) | 176 | Antwort wählen 176 · Prüfen 128 · Weiter 96 · Tastatur-Eingabe 40 | – | 5,65 | erfüllt |
| Spieler l03 ar-aus-de (Freitext mit Bildschirmtastatur) | 168 | Prüfen 136 · Bildschirmtastatur 112 · Antwort wählen 128 · Weiter 88 · Tastatur öffnen 48 | – | 6,26 | erfüllt |
| Lernpfad öffnen (Start → Lernpfad) und Einheit offline speichern | 104 | offline speichern 104 · Lernpfad öffnen 40 | 1461 | 7,0 | erfüllt |

Alle Szenarien ≤ 200 ms, obwohl die Last bei 3,6–7,2 lag (CPU ×6 auf einer ohnehin belegten Maschine). Der höchste
Einzellauf: 200 ms (Antwort wählen, l03, Last 5,65).

## 6. axe (de/tr/ar × 390/1440)

*läuft – folgt im Abschluss-Commit.*

## 7. Sprechmodul: Whisper nur nach Klick (Netzprotokoll)

`whisper-netz.mjs`, Lektion l04 (de, tr-aus-de) bis zur Sprechaufgabe:

- **Vor dem Klick: 79 Anfragen, davon 0 unter `/lern-app/modelle/`** – kein Modell, kein Worker, kein WASM. Erfüllt.
- Nach dem Klick auf „Sprechen einschalten“: Worker (`sprechen/whisper.worker.mjs`), ORT-WASM
  (`ort-1.31.0-dev…/ort-wasm-simd-threaded.{mjs,wasm}`), `whisper-base-64da572` (`config.json`, `generation_config.json`,
  `encoder_model_quantized.onnx` 22,1 MB, `decoder_model_merged_quantized.onnx` 51,2 MB). Playwright zählt jede Datei
  zweimal (Seite/Worker und Service Worker, der die Anfrage weiterreicht); die Summe „≈ 147 MB laut Content-Length“ des
  Werkzeugs ist deshalb doppelt, über das Netz gehen ≈ 74 MB.
- Nur GET, keine fremden Ursprünge.
- **Offen:** „Bereit“ wurde im Kopflos-Chromium (ohne GPU, ohne Mikrofon, Last 2,8–3,6) innerhalb von 10 min nicht
  erreicht. Ob das an der Umgebung (WASM-Initialisierung unter Last) oder an der App liegt, ist in diesem Lauf nicht
  geklärt (kein Konsolenprotokoll des Workers erfasst). Vorschlag in Abschnitt 10.

## 8. Lasttest Abgleich (`POST /api/lernapp/sync`)

`lasttest-sync.mjs`, Wegwerf-Datenbank `igmg_lernapp_d_e2e`: 200 Konten (Platzhalter, Einwilligung `lernapp` und Sitzung
per SQL, Sitzungs-Cookie wie Better Auth signiert), je Konto 3 Pakete (je ein eigenes Gerät) à 40 Ereignisse, alle
Anfragen einer Welle gleichzeitig (Node `fetch` + `Promise.all`, keine neue Abhängigkeit).

| Welle | Anfragen | Dauer s | je s | p50 ms | p95 ms | p99 ms | max ms | Status | Fehler % | 429 % | angenommen | doppelt | DB-Verbindungen max (aktiv) | Last |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1: 200 × 3 gleichzeitig (neu) | 600 | 12,09 | 49,6 | 9157 | 11924 | 11944 | 11988 | 200: 600 | 0 | 0 | 24000 | 0 | 11 (6) | 4,52 → 4,53 |
| 2: dieselben Pakete noch einmal | 600 | 7,13 | 84,2 | 5017 | 6909 | 7079 | 7096 | 200: 600 | 0 | 0 | 0 | 24000 | 12 (6) | 4,53 → 4,68 |
| 3: 200 × 3 Folgeereignisse | 600 | 10,71 | 56,0 | 8799 | 10621 | 10640 | 10657 | 200: 600 | 0 | 0 | 24000 | 0 | 11 (8) | 4,68 → 4,42 |
| Bremse: 5 Konten × 40 gleichzeitig | 200 | 1,33 | 150,8 | 924 | 1277 | 1305 | 1316 | 200: 105, 429: 95 | 0 | 47,5 | 0 | 0 | 11 (7) | 4,42 |

- **Fehlerquote 0 %**, keine 5xx, keine Zeitüberschreitung; die Verbindungen zur Datenbank bleiben bei höchstens 12
  (Pool 10 plus Messverbindung und Verwaltung).
- **Idempotenz erfüllt:** nach Welle 1 24 000 Ereignisse, nach Welle 2 (gleiche Kennungen Gerät + seq) weiter 24 000,
  0 Dubletten; Ableitungen gleich (Karten 800/800, Tage 200/200, Tage je Kurs 200/200, Prüfsummen gleich). Nach Welle 3
  48 000 Ereignisse, 0 Dubletten.
- **Raten-Grenze ehrlich eingeordnet:** Die Bremse gilt je Konto (30 Anfragen je Minute, `pruefeRate('lernapp-sync',
  benutzerId)`), nicht je IP. 200 Konten mit je 3 Paketen je Welle (9 in gut 30 s) liegen darunter – es war **keine
  Ausnahme** nötig, 429 = 0 in den Wellen 1–3. Die Bremsen-Welle zeigt, dass sie greift: je Konto 30 − 9 bereits
  verbrauchte = 21 angenommen (5 × 21 = 105), der Rest 429 `bremse` mit `Retry-After`.
- **Antwortzeit:** p50 ≈ 9 s, p95 ≈ 12 s, wenn 600 Pakete à 40 Ereignisse im selben Augenblick ankommen (Durchsatz
  ≈ 50 Pakete bzw. ≈ 2000 Ereignisse je Sekunde, begrenzt durch den Pool von 10 Verbindungen und die Last 4,5 der
  Maschine). Im Betrieb kommen Abgleiche verteilt (nach Lektionsende, beim Seitenwechsel); 600 gleichzeitige Pakete sind
  der ungünstigste Fall. Keine Schwelle im Auftrag; Einordnung und Vorschlag in Abschnitt 10.

## 9. Behebungen

| Nr. | Befund | Ursache | Behebung | Test | Vorher → nachher |
|---|---|---|---|---|---|
| – | (frühere Läufe) Sprechübung lud Modelldateien mehrfach | – | `a0795f7b` | Unit | im Netzprotokoll je Datei ein Abruf über das Netz (Seite und Service Worker zählen getrennt) |

*weitere folgen nach Lighthouse und axe.*

## 10. Offene Befunde und Vorschläge

1. **Whisper „bereit“ nicht erreicht** (Abschnitt 7): Einmal ohne Last und mit Konsolenprotokoll des Workers messen
   (`whisper-netz.mjs` um `page.on('console')`/`worker.on('console')` ergänzen); erst dann einordnen.
2. **Abgleich unter Spitzenlast** (Abschnitt 8): 0 Fehler, aber p95 ≈ 12 s bei 600 gleichzeitigen Paketen. Die
   Ereignisse eines Pakets gehen schon in einem einzigen `INSERT … ON CONFLICT DO NOTHING`; je Konto serialisiert eine
   Sperre (`sperre(benutzerId)`) die Pakete, und der Pool hat lokal 10, auf Vercel 5 Verbindungen je Instanz
   (`src/lib/db/index.ts`). Rechnerisch ≈ 200 ms je Transaktion (Grenzen, Einfügen, Karten und Tage ableiten, Seite
   fremder Ereignisse). Vorschlag für den Betrieb: Dauer je Transaktion im Betrieb beobachten und, falls nötig, die
   Ableitung (`erneuereKarten`, `erneuereTage`) gezielt messen; kein Abnahmekriterium, keine Änderung in diesem Paket.
3. **Z-L07-Wortlaut** an KERN §9 angleichen (Abschnitt 3).

## 11. Vorschlag für Z-L07

*folgt mit Lighthouse und axe.*
