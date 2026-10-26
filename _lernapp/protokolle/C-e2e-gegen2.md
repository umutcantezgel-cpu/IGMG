# Stufe C – Gegenprüfung der Gruppe „e2e“: Offline, Zugänglichkeit, Datenfluss (L8-05, Linse „Code und live“)

| | |
|---|---|
| Datum | 26.10.2026, Live-Abrufe 12:29–12:35 UTC |
| Stand | `fb10e4dd` (Branch `claude/trusting-lovelace-6nfolz`, Haupt-Checkout `/home/user/IGMG`). Live trägt `data-bau="fb10e4ddd411"`. Zwischen dem E2E-Stand `e06a648b` und `fb10e4dd` ändern sich unter `web/` nur `tests/e2e/barrierefreiheit.spec.ts` und `tests/e2e/quran.spec.ts` (`git diff --stat`, selbst nachgeprüft) |
| Geprüft | `_lernapp/protokolle/C-e2e.md` (Prüfer Stufe C, Gruppe e2e) |
| Kriterien | Z-L04 Offline, Z-L06 Zugänglichkeit, Z-L08 Datenfluss (Schwellen aus `_lernapp/ABNAHME.md`) |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16, 25.10.2026); B2/C1 offener Ausbau, nicht Gegenstand. Freigabe nach L3-E15 |
| Nicht im Stand | N8 (`lernapp-n8`), inzwischen **6** Commits auf `e06a648b`: `1c9727b4`, `6a9997c8`, `2b285cb1`, `db36bcb0`, `23af6310` und neu `f9aedd1e` („Lernpfad als Übergang und Stationen in Häppchen, je Takt vier“). Nicht gemergt |
| Schrift | Keine arabische Schrift, keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

## Ergebnis

| Z | Prüfer | Gegenprüfung | Urteil |
|---|---|---|---|
| Z-L04 | teilweise | **teilweise** | bestätigt, mit einer zusätzlichen, schwereren Lücke: Jede neue Bereitstellung löscht die vorgehaltenen Kursseiten einer „offline gespeicherten“ Einheit, und die Oberfläche bietet danach kein erneutes Speichern an |
| Z-L06 | teilweise | **teilweise** | bestätigt; zusätzlich: Nachspuren ist auf desktop im E2E mit dem Zeiger gespielt (kein reiner Tastaturweg), die Aufnahme-Höchstlänge von 15 s ist eine nicht angekündigte Zeitgrenze |
| Z-L08 | erfüllt | **erfüllt** | bestätigt; Widerlegungsversuche an Code und live ohne Befund |

## 0. Vorgehen, Befehle, Grenzen

- Nur gelesen und geprüft; geschrieben habe ich nur diese Datei (Rohdaten im Scratchpad). Kein git add, commit, stash,
  checkout oder merge. Arbeitsbäume unter `.claude/worktrees/` nicht angefasst; `lernapp-n8` nur mit `git log`/`git diff`
  aus dem Haupt-Checkout gelesen. Kein MCP, kein Bau, kein E2E, kein Server.
- Rohdaten: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/c-e2e-gegen2/live/` (Kopfzeilen
  `kopf_*`, Antworten `body_*`, Kursverzeichnisse `verz_*.json`).

| # | Befehl | Ergebnis |
|---|---|---|
| C1 | `public/sw.js` und `public/lern-app/sw.js` ganz gelesen (Cache-Namen, `install`, `activate`, `message`, `fetch`) | Abschnitt 1 |
| C2 | Quelltextsuche `fetch(`, `new URL(`, `importScripts`, `WebSocket`, `sendBeacon`, `EventSource`, `new Worker`, `method:`, `document.cookie`, `cookieStore`, `'use server'`, `<form` in `src/app/lern-app`, `src/components/lernapp`, `src/lib/lernapp`; dazu Analyse-/Telemetrie-Bibliotheken in ganz `src` | Abschnitt 3 |
| C3 | Whisper-Worker (`whisper.worker.ts`, `modell.ts`, `erkennung.ts`, `aufnahme.ts`, `Sprechen.tsx`) | Abschnitt 3 |
| C4 | `setTimeout`/`setInterval`/`requestAnimationFrame`/Countdown, `onAnimationEnd`, Ziehen (`draggable`, `onDrag*`, `onPointer*`, `onTouch*`) in `src/components/lernapp`, `src/lib/lernapp`, `src/app/lern-app` | Abschnitt 2 |
| L1 | `curl -sS -D` (GET) auf 20 Adressen: `/lern-app`, `/lern-app/{de,ar,en,xx}`, `/lern-app/tr/tr-aus-de`, `…/ueben`, `/lern-app/de/tr-aus-de/wiederholen`, `/lern-app/de/{anmelden,gruppe,quellen}`, `/lern-app/pakete/tr-aus-de`, Einheitenpaket `tr.a1.e01/7f428832…bf1c9`, `/lern-app/sw.js`, `/sw.js`, Sprech-Worker `…/sprechen/whisper.worker.mjs?v=fb10e4ddd411`, ORT-`.mjs`, ein Audio-Bündel (404), Drittlizenzen ORT, Manifest de, `/api/lernapp/sitzung` | **0 × `Set-Cookie`** in 20 Antworten; Einzelheiten in den Abschnitten |
| L2 | SHA-256 des Einheitenpakets gegen den Hash im Kursverzeichnis | gleich (114.911 B) |
| L3 | alle 6 Kursverzeichnisse live | 42–43 Einheiten je Richtung, **0 Einheiten mit Audio** in allen 6 Richtungen |
| E1 | `tor-final/e2e.log`, `e2e-rest.log`, `e2e-wdh2.log` nach den zitierten Tests durchsucht | alle zitierten Ergebnisse stimmen (Abschnitte 1–3) |
| G1 | `git log lernapp-n8`, `git diff e06a648b lernapp-n8 --stat -- web` | N8 ändert keinen Service Worker und nicht `offline.ts`/`ServiceWorkerAnmeldung.tsx`; Befund G-1 bleibt nach N8 bestehen |

## 1. Z-L04 Offline – **teilweise** (bestätigt)

**Schwelle:** ohne Konto voll nutzbar; nach dem Speichern Lektion, Wiederholen und „Stufe offline speichern“ ohne Netz
vollständig; Root-SW-Update behält `igmg-lernapp-*`.

**Was trägt (selbst nachgeprüft):**

- E2E-Ergebnisse wie vom Prüfer zitiert: `offline.spec.ts:11` telefon 11,7 s / desktop 9,3 s grün, `quellen.spec.ts:71`
  beide grün, `regression.spec.ts:30` beide grün, `rahmen.spec.ts:180/204` desktop grün (`e2e.log`).
- Root-Worker `public/sw.js:37`: `activate` löscht nur `!n.startsWith('igmg-v1') && n !== 'igmg-koran-v1' &&
  !n.startsWith('igmg-lernapp-')`; `fetch` lässt `/lern-app` und `/lern-app/**` ganz durch (Z. 55). Live 200, byte-gleich
  laut Prüfer; Kopfzeilen live wie beschrieben.
- Lern-App-Worker `public/lern-app/sw.js`: Präfix `igmg-lernapp-`, dauerhaft `pakete`, `audio`, `modelle` (Z. 23–29); `/api/**`
  und `/lern-app/<ui>/anmelden` nie vorgehalten (Z. 213); nur GET, nur eigener Ursprung (Z. 209–211); nur Antworten
  `200`/`basic`/nicht umgeleitet in den Vorrat (Z. 51). Live: `no-cache`, CSP mit `connect-src 'self'`, COEP.
- Ohne Konto live: Start, Lernpfad, Üben, Wiederholen 200 ohne `Set-Cookie`; `/lern-app` und `/lern-app/en` 308 nach
  `/lern-app/de`; Anmelden und Gruppe 404 (Schalter aus).

**Widerlegungsversuch – neuer Befund G-1 (aus dem Code, nicht durch einen Lauf belegt): Jede Bereitstellung macht eine
„offline gespeicherte“ Einheit ohne Netz unerreichbar.**

1. Die Bau-Kennung ist der Commit: `src/lib/lernapp/bau.ts:26` nimmt `VERCEL_GIT_COMMIT_SHA` (live `fb10e4ddd411`). Jeder
   Push auf `main` ist also ein neuer Bau.
2. Jede Lern-App-Seite meldet den Worker mit `?v=<bau>` an (`ServiceWorkerAnmeldung.tsx:17`). Eine neue Kennung ist ein
   neuer Worker; er nimmt sofort die Kontrolle (`skipWaiting`, `clients.claim`, `sw.js:186/196`).
3. Sein `activate` löscht die Hülle des vorigen Baus (`sw.js:194`: alle `igmg-lernapp-*` außer der neuen Hülle und
   `pakete`/`audio`/`modelle`). In dieser Hülle lagen aber die Kursseiten, die „Einheit offline speichern“ vorgehalten hat:
   Lernpfad, `…/ueben`, `…/wiederholen`, `…/tipps` samt nachgeladenen Programmteilen (`offline.ts:30–32`,
   `sw.js:178–183`, `tief = true`).
4. Nachgefüllt wird danach nur die Hülle der Oberflächensprache: `{ art: 'schale' }` mit Start, Fortschritt, Wortschatz,
   Einstellungen, Quellen und ohne nachgeladene Programmteile (`ServiceWorkerAnmeldung.tsx:19`, `sw.js:32`, `168–171`,
   `tief = false`). Kursseiten kommen nur zurück, wenn die Person sie mit Netz erneut aufruft oder erneut „offline
   speichern“ drückt.
5. Erneut drücken geht nicht: Der Lernpfad zeigt die Einheit weiter als gespeichert, weil IndexedDB `pakete` noch
   `offline: true` mit gleichem Hash hat (`LernpfadInsel.tsx:305`), und `OfflineEinheit` zeigt dann statt des Knopfs nur
   „Offline gespeichert“ (`fertig = gespeichert`). `bereiteOfflineVor` ruft nur dieser Knopf auf
   (`OfflineEinheit.tsx:92`); das automatische Nachladen im Lernpfad (`raeumeAuf` → `speichereOffline(…, { nachladen })`,
   `LernpfadInsel.tsx:98–102`) holt nur Pakete und Töne, keine Seiten.
6. Ohne Netz führt dann jede Navigation zu Lernpfad oder `…/ueben` auf die Startseite (`sw.js:242–248`: Netz scheitert,
   Seite fehlt in der neuen Hülle, Rückfall `/lern-app/<ui>`). Die Person sieht „Offline gespeichert“, kann die Lektion
   ohne Netz aber nicht öffnen.

Kein Test deckt das ab: `regression.spec.ts:30` aktualisiert nur den Root-Worker, `offline.spec.ts:11` speichert und
spielt im selben Bau. Für die Schwelle „nach dem Speichern … ohne Netz vollständig“ gilt der Beleg also nur bis zur
nächsten Bereitstellung, und die gibt es im Testbetrieb mehrmals täglich. N8 ändert daran nichts (G1).

**Weitere Befunde und Hinweise:**

- **G-2 (bestätigt die Lücke des Prüfers):** „Stufe offline speichern“ fehlt. In `messages/lernapp/de.json` gibt es nur
  `lernpfad.offline` = „Einheit offline speichern“; PLAN §3.5 Z. 205, ADR 0038 Nr. 9 und ADR 0039 Nr. 12 verlangen die
  Stufe. In `ENTSCHEIDUNGEN.md` steht keine Änderung.
- **G-3 (bestätigt):** Wiederholen ohne Netz läuft in keinem E2E.
- **G-4 (bestätigt):** `regression.spec.ts:30` vergleicht nur den Hüllenvorrat (ohne gespeicherte Einheit).
- **G-5 (Hinweis):** Live hat **keine** Richtung Audio (0 von 42–43 Einheiten je Richtung). Der Weg „Töne offline“ ist
  nur mit dem synthetischen Testbündel `tr.a1.test-<16hex>.lpa` im E2E belegt, nie mit echten Einheiten. Das betrifft
  Z-L15; für Z-L04 heißt es nur, dass Hörübungen live gar nicht vorkommen.
- **G-6 (Hinweis, nicht belegt):** Die Hülle hat eine Obergrenze von 400 Einträgen, und die ältesten fallen heraus
  (`sw.js:34`, `39–47`). Vorgehaltene Programmteile werden bei späteren Bitten nicht neu eingereiht (`dateiHolen` legt nur
  Fehlendes ab, `sw.js:114–123`). Wer mehrere Kurse speichert und viel navigiert, kann die zuerst gespeicherten Kursseiten
  verdrängen. Wie viele Einträge ein Kurs braucht, habe ich nicht gemessen.
- **G-7 (Hinweis):** Seiten laufen „Netz zuerst“ ohne Zeitgrenze (`sw.js:83–90`). Bei schwachem statt fehlendem Netz wartet
  die Seite, bis der Abruf scheitert; das E2E prüft nur das harte Abklemmen.

**Urteil:** teilweise (bestätigt). Erfüllt sind „ohne Konto voll nutzbar“ und „Root-SW-Update behält `igmg-lernapp-*`“
(Code und E2E). Nicht erfüllt bzw. nicht belegt sind „Stufe offline speichern“, „Wiederholen ohne Netz“ und, neu, die
Dauerhaftigkeit nach einer Bereitstellung (G-1).

## 2. Z-L06 Zugänglichkeit – **teilweise** (bestätigt)

**Schwelle:** axe 0 ernste/kritische Befunde auf allen Lern-App-Routen × 3 UI-Sprachen × 2 Breiten; jeder Übungstyp per
Tastatur, Ziehen nie nötig; keine Zeitgrenzen; Protokoll der Screenreader-Prüfung (sonst UMGEBUNGSAUSNAHME LM-19).

**Nachgeprüft:**

- Die zitierten E2E-Ergebnisse stimmen (`rahmen.spec:84` 6/6, `lektion.spec:91` 6/6, `lektion:27` desktop, `typen-a:357/369`,
  `typen-wissen:250` desktop grün; `typen-b:329/380` desktop grün im Rest; `gruppe.spec:155` desktop in Lauf 1 rot nach
  33,4 s, in Wdh 2 grün nach 50,5 s).
- Live: `<html lang dir>` korrekt (de/tr `ltr`, ar `rtl`); Viewport ohne `maximum-scale`, Zoomen bleibt möglich.
- Ziehen: Der einzige Zeiger-Handler steht in `Nachspuren.tsx:109–112`. Daneben steht immer der Knopf „auf Papier
  geschrieben“ als `<button>` (`Nachspuren.tsx:166–174`, nur ausgeblendet, wenn fertig oder gesperrt). Sonst keine
  `draggable`-, `onDrag*`- oder `onTouch*`-Handler; Reihenfolge, Paare, Satzbau und Wortbank laufen über Knöpfe. **Ziehen
  ist nie nötig – trägt.**
- Zeitgeber in der Oberfläche: `offline.ts:21` (Warten auf den Worker), `erkennung.ts:135` (Antwort des Workers),
  `aufnahme.ts:68` (Höchstlänge der Aufnahme), `DatenInsel.tsx:63` (Objekt-URL), `sync.ts:282` (Bündelung des Abgleichs).
  Die `requestAnimationFrame`-Stellen setzen nur den Fokus, messen den Pegel oder prüfen das Ende eines Koran-Ausschnitts.
  Kein automatisches Weiterschalten, kein Countdown, keine Antwortfrist.

**Zusätzliche Lücken:**

1. **Nachspuren auf desktop nicht per Tastatur belegt.** `typen-b.spec.ts:414–428`: desktop spurt mit `page.mouse` nach
   (Hilfe Z. 228–246), nur telefon tippt „auf Papier geschrieben“. Die Zählung „25 von 26 Typen nur mit der Tastatur“
   stimmt für `schrift_ar` daher nur beim Teil „erkennen“. Der Knopf ist ein normales `<button>`, der Tastaturweg ist also
   gebaut, aber nicht per E2E gelaufen. Das deckt sich mit Lücke 3 des Prüfers und verschärft die Zählung.
2. **Die Aufnahme-Höchstlänge von 15 s ist eine Zeitgrenze, die niemand ankündigt.** `aufnahme.ts:68–73` stoppt die
   Aufnahme nach `MAX_AUFNAHME_MS = 15_000` von selbst und wertet aus. Einen Hinweis darauf gibt es in den UI-Texten nicht.
   Wer langsam spricht, etwa mit einer Sprechbehinderung oder bei einem langen B1-Satz, verliert das Ende. Nicht
   blockierend: Die Aufnahme lässt sich beliebig oft wiederholen, und „kann gerade nicht sprechen“ überspringt sie. Am
   Wortlaut „keine Zeitgrenzen“ gemessen ist es dennoch eine Grenze, die eine Entscheidung braucht: ankündigen, verlängern
   oder ausdrücklich ausnehmen.
3. **N8 ist weiter gewachsen.** `f9aedd1e` rendert die Stationen jetzt in Häppchen zu je vier pro Takt. Der Knopf „Einheit
   offline speichern“ der Teststation und die Stationen im Lernpfad erscheinen also verzögert. axe im Lernpfad
   (`lektion:91`, `spielelemente`) und die Tastaturwege gelten bis zum erneuten Lauf nur ohne N8.

Die Lücken des Prüfers bestätige ich unverändert: volle Matrix nicht auf diesem Stand (Wiederholen, Tipps, Wortschatz,
Anmelden; tr-Fortschritt; Einstufung tr/ar/390), `gruppe.spec:155` nur einzeln grün, `schrift_latein` nur als Unit, LM-19
offen (UMGEBUNGSAUSNAHME mit Ersatzbeleg).

**Urteil:** teilweise (bestätigt).

## 3. Z-L08 Datenfluss – **erfüllt** (bestätigt)

**Schwelle:** ohne Konto nur GET an den eigenen Ursprung, keine Cookies; POST nur durch ausdrückliche Handlung (anonyme
Meldung); 0 Drittanfragen, auch nach dem Laden des Modells; Sprachaufnahmen verlassen das Gerät nie; Header-Prüfung je
Bereich.

**Widerlegungsversuche und Ergebnis:**

| # | Versuch | Ergebnis |
|---|---|---|
| W1 | Gibt es Anfragen, die nicht GET sind, ohne Handlung? Alle `method:` im Lern-App-Client | Nur 5 Stellen: `sync.ts:149` (POST, nur mit an ein Konto gebundenem Profil, `oberflaeche/abgleich.ts:55–56`, Verbinden nur auf Klick in `KontoInsel`), `melden.ts:64` (POST nach „melden“ und Senden, `credentials: 'omit'`, Körper nur Kurs, Aufgabe, Kategorie und ALTCHA), `Abgabe.tsx:139` (Schreibabgabe; vorher `frage()` nur mit `profil.benutzerId` oder nach „Mit meinem Konto prüfen“), `GruppeInsel.tsx:117` (Zustimmung, Knopf) und `EigeneAbgaben.tsx:66` (DELETE, Knopf, nur mit Konto). Keine Server Actions außer auf der Anmeldeseite (Formulare, ausdrücklich). Die Formulare in Spieler und Einstufung rufen `preventDefault` auf |
| W2 | Gibt es Anfragen an `/api` ohne Konto beim Laden? | `ladeSitzung` nur nach Klick bzw. mit gebundenem Profil; `GruppeInsel` und `Abgabe` laden nur mit `profil.benutzerId`. `/api/lernapp/sitzung` liefert live 404 (Schalter aus) |
| W3 | Telemetrie, Analyse, Fehlerberichte | Kein `sendBeacon`, kein `@vercel/analytics`, keine Speed Insights, kein `useReportWebVitals`, kein `window.onerror`-Bericht in `src`; `error.tsx` der Lern-App sendet nichts; `instrumentation.ts` läuft nur auf dem Server |
| W4 | Cookies | Keine Stelle mit `document.cookie` oder `cookieStore` in `src`. Live in 20 Antworten 0 × `Set-Cookie`, auch für `/lern-app` (308) mit `Accept-Language: tr`, für 404-Seiten und `/api/lernapp/sitzung` |
| W5 | Fremde Ursprünge in Seiten | Live-HTML von Start, Lernpfad, Üben und Quellen: keine externen `src`/`href` für Ressourcen, kein `preconnect`/`dns-prefetch`/`prefetch`; die Sprachumschalter zeigen auf den eigenen Ursprung. CSP live auf Seiten, Kursverzeichnis, Paket, Lern-App-Worker, Sprech-Worker und ORT: `default-src 'self'; connect-src 'self'; font-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; worker-src 'self'`. Das Audio-Bündel holt der Server selbst aus dem Blob-Speicher und streamt es unter dem eigenen Ursprung (`app/lern-app/audio/[...pfad]/route.ts:107–114`), keine Weiterleitung |
| W6 | Modell: fremde Adressen im Worker | Der live ausgelieferte Sprech-Worker (692.724 B, keine Attrappe) enthält die Voreinstellungen von transformers.js: `remoteHost: "https://huggingface.co/"`, und `wasmPaths` zeigt auf `cdn.jsdelivr.net`, solange es leer ist. Beides wird überschrieben: `allowRemoteModels: false` und `localModelPath` (`modell.ts:90–97`), `wasmPaths` auf den eigenen Ursprung (`whisper.worker.ts:41–42`), `wasmBinary` aus dem eigenen Vorrat (Z. 59–61); `fuelleVorrat` holt nur feste eigene Pfade. Dazu trägt die Worker-Antwort live selbst die CSP mit `connect-src 'self'` und `script-src 'self'`; ein Abruf bei Dritten würde im Browser also blockiert. Rauchtest N4 (`scratchpad/sprechen-rauchtest-n4.json`): A und B `ok`, 11 Dateien je einmal, `fremd: []`, `verstoesse: []`, `offlineAmServer: []`. Seit dem Rauchtest (05:18) hat sich am Sprechcode nur `Sprechen.tsx` geändert (`aufnahme` per `import()` erst beim Klick, eigener Chunk, eigener Ursprung) |
| W7 | Verlässt die Aufnahme das Gerät? | `aufnahme.ts`: `MediaRecorder` → `Blob` → PCM; `Sprechen.tsx:216/226`: Objekt-URL zum Abspielen und `postMessage` des PCM an den Worker (Übertragung); der Worker meldet nur Status und Markierung (`whisper.worker.ts:112`). Kein Abruf mit dem Blob, kein Feld in Meldung, Abgleich oder Abgabe |
| W8 | Anfragen des Service Workers | `sw.js` beantwortet nur GET an den eigenen Ursprung (Z. 209–211); seine eigenen Abrufe gehen nur an Pfade der Lern-App und an `/_next/static/` ohne `..` (Z. 96–104). Im E2E sind seine Anfragen erfasst (`netzprotokoll.spec.ts:15/39`, `r.serviceWorker()`, Test grün) |
| W9 | Header je Bereich | Seiten: `microphone=()`, auf Üben und Wiederholen `microphone=(self)`; COOP und COEP überall in `/lern-app`; Paket `immutable`; Worker der Lern-App `no-cache`; Anmelden, Sitzung und 404 `private, no-store` |

**Bestätigte Grenzen (nicht blockierend):**

- Das E2E-Netzprotokoll läuft mit dem Attrappen-Worker. Den Datenfluss des echten Modells belegen nur der Rauchtest ohne
  Next-Bau (26.10., nach N4) und `whisper-netz.mjs` auf dem Produktionsbau vom 24.10. (vor N4). Vorgesehen war ein
  E2E-Netzprotokoll „mit geladenem Modell“. Der Ersatz trägt: Die bauliche Sperre wirkt im Browser und ist live auf Seite,
  Lern-App-Worker und Sprech-Worker geprüft.
- `netzprotokoll.spec` geht nicht über Einstufung, Fortschritt, Wortschatz, Quellen und die Kurse Wissen und Koran.
  Die Quelltextsuche (W1–W3) findet dort aber keinen Abruf außer Paketen und Seiten des eigenen Ursprungs.
- Hinweis außerhalb der Schwelle: Hat eine Person eine Sitzung auf der Website, schickt ihr Browser das Cookie auch bei
  Lern-App-Abrufen mit, weil der Pfad `/` ist. Das fällt unter „mit Konto“ und ist kein Verstoß.

**Urteil:** erfüllt (bestätigt).

## 4. Nacharbeit (Ergänzung zur Liste des Prüfers)

1. **G-1 beheben (Z-L04):** Nach einem Bauwechsel die Kursseiten gespeicherter Einheiten wieder vorhalten. Das geht auf
   zwei Wegen:
   - Der neue Worker übernimmt beim Aktivieren die Kursseiten aus der alten Hülle, bevor er sie löscht, und holt sie neu
     mit `tief = true`.
   - Oder die Seite bittet nach der Anmeldung für alle Kurse mit `pakete.offline = true` um `{ art: 'seiten' }`, zum
     Beispiel `bereiteOfflineVor` je Kurs im Lernpfad oder in `ServiceWorkerAnmeldung`.

   Dazu ein E2E auf telefon und desktop: Einheit speichern, den Lern-App-Worker mit einer neuen `?v=` anmelden, Netz
   abklemmen, dann die Lektion spielen.
2. Z-L06: einen Tastaturweg „auf Papier geschrieben“ auf desktop ins E2E aufnehmen. Für die Höchstlänge der Aufnahme
   entweder einen Hinweis in der Übung (in allen drei UI-Sprachen) oder eine ausdrückliche Ausnahme in ABNAHME bzw.
   ENTSCHEIDUNGEN festhalten.
3. Nach dem Merge von N8 (jetzt 6 Commits, mit `f9aedd1e`) `offline.spec:11` und `netzprotokoll.spec:10` besonders
   beobachten: Sie drücken den Knopf der Teststation, die N8 jetzt in Häppchen rendert.
4. Optional: in `offline.spec` die Wiederholungsrunde ohne Netz und einen Abruf mit schwachem Netz (verzögerte statt
   abgebrochene Antworten) ergänzen; in `regression.spec:30` vor dem Update eine Einheit speichern.

## 5. Schlusstabelle

| Z | Status | Urteil | Kern |
|---|---|---|---|
| Z-L04 | **teilweise** | bestätigt | Lektion offline und Root-SW-Update belegt; „Stufe offline speichern“ fehlt; Wiederholen ohne Netz unbelegt; **neu G-1:** Jede Bereitstellung löscht die vorgehaltenen Kursseiten, „Offline gespeichert“ bleibt angezeigt, und ein erneutes Speichern wird nicht angeboten |
| Z-L06 | **teilweise** | bestätigt | axe-Matrix nicht vollständig auf diesem Stand; Nachspuren auf desktop im E2E mit dem Zeiger; Aufnahme-Höchstlänge 15 s ohne Hinweis; Ziehen nie nötig (Code); LM-19 UMGEBUNGSAUSNAHME |
| Z-L08 | **erfüllt** | bestätigt | Code: kein Abruf ohne Handlung oder Konto, keine Telemetrie, keine Cookies; Worker-Voreinstellungen zu Dritten überschrieben und durch CSP gesperrt; live 20 Antworten ohne `Set-Cookie`, CSP `connect-src 'self'` auf Seiten, Paketen und Workern |
