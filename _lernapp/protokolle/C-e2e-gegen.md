# Stufe C – Gegenprüfung der Gruppe „e2e“: Offline, Zugänglichkeit, Datenfluss (L8-05)

| | |
|---|---|
| Datum | 26.10.2026, 12:20–12:40 UTC |
| Stand | `fb10e4dd` (Branch `claude/trusting-lovelace-6nfolz`). E2E-Belege vom Stand `e06a648b`. Mit `git diff --stat e06a648b fb10e4dd -- web` selbst nachgesehen: Es ändern sich nur `tests/e2e/barrierefreiheit.spec.ts` und `tests/e2e/quran.spec.ts`. Der Anwendungscode ist also gleich |
| Geprüft | `_lernapp/protokolle/C-e2e.md` (Prüfer Stufe C, Gruppe e2e) |
| Kriterien | Z-L04 Offline, Z-L06 Zugänglichkeit, Z-L08 Datenfluss (Schwellen aus `_lernapp/ABNAHME.md`) |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16, 25.10.2026); B2/C1 offener Ausbau, nicht Gegenstand. Freigabe nach L3-E15 |
| Nicht im Stand | N8 (`lernapp-n8`, 5 Commits auf `e06a648b`, nicht in `fb10e4dd`: `git merge-base --is-ancestor` negativ) |
| Live | `https://igmg-wetzlarer.vercel.app`, nur GET mit curl. Alle 10 abgerufenen Seiten tragen `data-bau="fb10e4ddd411"` |
| Linse | „Logs und Specs“: Ergebnisse in den Protokollen selbst gezählt, Specs Zeile für Zeile gegen die Behauptungen gelesen |
| Schrift | Keine arabische Schrift, keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

## Ergebnis

| Z | Prüfer | Gegenprüfung | Urteil |
|---|---|---|---|
| Z-L04 | teilweise | **teilweise** | bestätigt. Drei Lücken kommen hinzu. (1) Nach jedem neuen Bau löscht der Worker die vorgehaltenen Kursseiten, und nichts hält sie neu vor; die Station zeigt trotzdem weiter „gespeichert“. Das folgt aus dem Code, kein Test deckt es. (2) `navigator.onLine` bleibt beim Abklemmen `true`. (3) Ohne Netz wurde nur Lektion 1 der Testeinheit gespielt, ohne Hörübung |
| Z-L06 | teilweise | **teilweise** | bestätigt, aber der Beleg ist zu berichtigen. (1) axe läuft in `typen-a` nur bei 4 von 9 Typen, bei `paare` und `wortbank` gar nicht. (2) Der Tastaturweg setzt den Fokus überall per `locator.focus()` statt mit Tab. (3) Nachspuren läuft im „Tastatur“-Test mit der Maus. (4) Wiederholen ist weder mit axe noch mit der Tastatur geprüft |
| Z-L08 | erfüllt | **teilweise** | herabgestuft. Kein Lauf auf diesem Code-Stand zeigt die echte App mit echtem Modell und echter Aufnahme. Der vorgesehene Beleg „E2E-Netzprotokoll mit geladenem Modell“ fehlt. Die Ersatzbelege sind ein Rauchtest auf einer Probeseite, der nur die Hosts prüft, und ein Lauf vom 24.10. vor N4, der bei „bereit“ endet. Einen Verstoß habe ich nicht gefunden |

## 0. Vorgehen und eigene Proben

- Ich habe nur gelesen und geprüft. Geschrieben habe ich nur diese Datei.
- Kein git add, commit, stash, checkout oder merge. Kein Bau, kein E2E, kein Server, kein MCP.
- Die Arbeitsbäume unter `.claude/worktrees/` habe ich nicht angefasst. Alle Befehle liefen im Haupt-Checkout;
  `lernapp-n8` habe ich nur mit `git show` und `git diff` gelesen.
- Rohdaten liegen unter `scratchpad/c-e2e-gegen/`:
  - `zaehle.py` und `zaehlung.txt`;
  - `live/`: Kopfzeilen, Seiten, beide Service Worker und der Live-Worker der Sprechübung.

| # | Probe | Ergebnis |
|---|---|---|
| P1 | `python3 -I zaehle.py`: Regex über `e2e.log`, `e2e-rest.log`, `e2e-wdh1..3.log`, je Spec:Zeile mit Projekt, ✓/✘/− und Dauer | Jede Zahl des Prüfers stimmt (Abschnitt 1) |
| P2 | `grep` nach `disableRules`, `.exclude(`, `.include(`, `withRules` in `tests/e2e/lernapp/**`, `barrierefreiheit`, `zugaenglichkeit-gemeinde` | 0 Treffer. axe läuft überall mit `withTags(wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa)`, ohne stille Ausschlüsse |
| P3 | `grep` nach `.focus()`, `'Tab'`, `mouse.`, `.click(` in den Tastatur-Specs | `.focus()`: 7 in `hilfen.ts`, 3 in `typen-b`, 3 in `typen-wissen`, 8 in `typen-a`. Tab nur 2× (`typen-a:229/233`, Typ `formen`). Maus: `typen-b:243–246` (Nachspuren) |
| P4 | Quelltext von Playwright 1.64.0 (`playwright-core/lib/coreBundle.js`: `CRServiceWorker`, `doUpdateOffline`) | Die Anfragen des Service Workers werden protokolliert und abgefangen, solange `serviceWorkers` nicht `'block'` ist. `context.setOffline` gilt in 1.64 auch für Service Worker: `doUpdateOffline` geht über `this.serviceWorkers()` |
| P5 | `grep` nach `method: 'POST'/'DELETE'`, `fetch(`, `navigator.onLine`, `setTimeout` in `src/components/lernapp`, `src/lib/lernapp`, `src/app/lern-app` | Abschnitte 2–4 |
| P6 | curl GET auf 10 Lern-App-Seiten (Start, Lernpfad tr, Üben ar, Wiederholen, Islam, Koran, Einstufung, Fortschritt ar, Wortschatz tr, Einstellungen) | Alle 200, kein `Set-Cookie`. `microphone=(self)` nur auf Üben und Wiederholen. HTML ohne fremde Ursprünge und ohne `_vercel` |
| P7 | curl auf `/sw.js` und `/lern-app/sw.js?v=fb10e4ddd411`, `cmp` gegen `web/public/…` | beide byte-gleich |
| P8 | curl auf den Live-Worker `/lern-app/modelle/sprechen/whisper.worker.mjs` (692.724 B), Suche nach `https?://` | CSP `connect-src 'self'`, COEP. Im Text stehen `huggingface.co` (3×) und `cdn.jsdelivr.net` (1×), die Vorgaben von transformers.js. CSP und `allowRemoteModels: false` sperren sie (Abschnitt 4) |

## 1. Logs: Nachzählung

| Kriterium | Spec:Zeile | telefon | desktop |
|---|---|---|---|
| Z-L04 | `offline.spec:11` | ✓ 11,7 s | ✓ 9,3 s |
| Z-L04 | `quellen.spec:71` | ✓ 2,4 s | ✓ 2,2 s |
| Z-L04 | `regression.spec:30` | ✓ 4,6 s | ✓ 4,1 s |
| Z-L04 | `rahmen.spec:180`, `:204` | übersprungen | ✓ 1,1 s / 1,8 s |
| Z-L06 | `rahmen.spec:84` (de/tr/ar) | 3 × ✓ | 3 × ✓ |
| Z-L06 | `lektion.spec:91` (de/tr/ar) | 3 × ✓ | 3 × ✓ |
| Z-L06 | `lektion.spec:27` Tastatur / `:79` Tippen | − / ✓ | ✓ / − |
| Z-L06 | `spielelemente.spec:25`, `:102` | ✓ ✓ | ✓ ✓ |
| Z-L06 | `koran.spec:36` / `:126` | ✓ / − | ✓ / ✓ |
| Z-L06 | `typen-a:357/369` Tastatur, `:363/375` Tippen | − − ✓ ✓ | ✓ ✓ − − |
| Z-L06, Z-L08 | `typen-b:329`, `:380` | ✓ ✓ (Lauf 1) | ✓ ✓ (Rest) |
| Z-L06 | `typen-wissen:250/256/262/328` | − ✓ ✓ ✓ | ✓ − ✓ ✓ |
| Z-L06 | `wiederholen-einstufung:56`, `:164` | ✓ ✓ | ✓ ✓ (Rest) |
| Z-L06, Z-L08 | `melden.spec:26` | − | ✓ 20,3 s |
| Z-L06 | `gruppe.spec:155` | − | ✘ 33,4 s (Lauf 1), ✓ 50,5 s (Wdh 2) |
| Z-L08 | `netzprotokoll.spec:10` | − | ✓ 8,2 s |
| Z-L08 | `typen-b:471`, `regression.spec:16` | − / ✓ | ✓ / ✓ |

- Rote Tests: `✘` kommt 8× in `e2e.log` und 1× in `e2e-rest.log` vor. Das sind die 8 Cüz-Tests und `gruppe:155`. Die
  Zählung des Prüfers (8 + 1) stimmt.
- In keinem Protokoll steht „flaky“ oder „retry“.
- Die Einordnung von `gruppe:155` trägt nur eingeschränkt. Das übernehme ich: Meldung und Trace fehlen, Wdh 2 lief allein.

## 2. Z-L04 Offline – bestätigt: teilweise

**Was die Specs wirklich prüfen**

- `offline.spec:11`:
  - Das Netz wird erst **nach** „Einheit offline speichern“ abgeklemmt (Z. 63–64), und zwar vor dem Aufruf von Üben
    (Z. 74).
  - Es bleibt über die ganze Lektion und den Rückweg zum Lernpfad abgeklemmt; erst Z. 85–86 heben es auf.
  - Es gibt kein `test.skip`; beide Projekte laufen.
  - Das trägt. Laut P4 erfasst `context.route` in Playwright 1.64 auch die Anfragen des Service Workers.
- Der Spec-Kopf (Z. 7–8) und `rahmen.spec` (Z. 19–20) begründen das Abklemmen per Route so: `setOffline` erfasse die
  Anfragen des Workers nicht. Für 1.64 ist das **veraltet** (P4).
  - Der Rauchtest `sprechen-rauchtest.mjs:170–171` nutzt selbst `route` **und** `setOffline`.
  - Folge: `route.abort` ist nicht durchweg „strenger“, denn `navigator.onLine` bleibt `true`.
  - Die Zweige für fehlendes Netz in `Spieler.tsx:227` (Melden: „ohne Netz“) und `MeldenDialog.tsx:75` sind deshalb in
    keinem Offline-Test gelaufen.
- Gespielt wird nur Lektion 1 der **Testeinheit**: Auswahl, Paare, Wortbank, Auswahl, ohne Hörübung.
  - Das Audio-Bündel wird nur im Vorrat nachgewiesen (Z. 37), nicht ohne Netz abgespielt.
  - Echte Einheiten, Tipps und Hörübungen laufen offline nicht.
- `regression.spec:30`: Vorher liegt nur die Hülle im Vorrat, denn der Test öffnet nur `/lern-app/de`. Die Lücke 3 des
  Prüfers stimmt.

**Neue Lücke (Befund aus dem Code, nicht durch einen Lauf belegt):** Nach einem neuen Bau gehen die vorgehaltenen
Kursseiten verloren.

1. Die Hülle ist je Bau eigen: `SCHALE = igmg-lernapp-schale-v<bau>` (`public/lern-app/sw.js:24–25`).
   `activate` löscht jede andere Hülle (Z. 189–198).
2. Die Kursseiten liegen nur in dieser Hülle: Lernpfad, Üben, Wiederholen, Tipps samt nachgeladener Programmteile.
3. Neu vorgehalten werden sie nur über `bereiteOfflineVor`. Das ruft allein der Knopf „Einheit offline speichern“ auf
   (`OfflineEinheit.tsx:92`, unter N8 Z. 97).
   - `ServiceWorkerAnmeldung.tsx:19` bittet nur um die Hülle, also `SCHALEN_SEITEN` ohne Kursseiten.
   - `raeumeAuf` und `speichereOffline(…, { nachladen: true })` laden nur Pakete und Töne, und nur bei neuem Hash
     (`LernpfadInsel.tsx:98–102`, `vorrat.ts:350–378`).
4. Die Station zeigt danach weiter „gespeichert“ und bietet keinen Knopf mehr an: Ist `fertig` gesetzt, steht dort nur
   Text.
5. Folge:
   - Nach jeder Bereitstellung führt eine offline gespeicherte Lektion ohne Netz zum Start der Oberfläche
     (`sw.js:242–248`), bis Lernpfad und Üben wieder online besucht wurden.
   - Ein Knopf zum erneuten Speichern ist nicht zu sehen.
6. Kein Test deckt das ab:
   - `regression.spec:30` prüft nur den Root-Worker.
   - `lernapp-sw.test.ts:99` prüft nur die Regel beim Aktivieren.

**Die Lücken 1–5 des Prüfers bestätige ich**: Stufe fehlt, Wiederholen nur online, Root-SW-Test nur mit der Hülle,
`setOffline`, N8.

- „Stufe offline speichern“ steht weiter unverändert in ADR 0039 Nr. 12 und in PLAN Z. 205.
- In `ENTSCHEIDUNGEN.md` gibt es keinen Treffer.
- Wiederholen läuft in `wiederholen-einstufung` sogar mit `serviceWorkers: 'block'` (Z. 18).

## 3. Z-L06 Zugänglichkeit – bestätigt: teilweise (Beleg berichtigt)

- **axe ohne stille Ausschlüsse:** bestätigt (P2).
  - Gezählt werden nur ernste und kritische Befunde; das entspricht der Schwelle.
  - `hilfen.ts:34–36` wartet vor axe auf das Ende der Animationen. `rahmen.spec` tut das nicht; das schadet nicht.
- **axe je Übungstyp – überzeichnet.**
  - `typen-a` ruft axe nur viermal auf:
    - `tr bild_wort` (Z. 154) und `tr formen` (Z. 241);
    - `ar frei Tastatur` (Z. 288) und `ar harakat` (Z. 344).
  - Ohne axe auf diesem Stand bleiben:
    - aus `typen-a`: `hoeren_waehlen`, `hoeren_schreiben`, `minimalpaare`, `luecke`, `satzbau`;
    - `paare` und `wortbank`: `lektion.spec:91` prüft nur die erste Aufgabe (Auswahl) und das Rückmeldeblatt.
  - Volle axe-Abdeckung je Typ haben `typen-b` (7 bzw. 6 Stellen) und `typen-wissen`.
  - Alle axe-Aufrufe in `typen-*` und in der Einstufung stehen hinter `if (art === 'tastatur')`. Sie laufen also nur bei
    1440 px.
- **Tastaturweg – nur „bedienbar“, nicht „erreichbar“.**
  - Jeder Tastaturschritt setzt den Fokus programmatisch:
    - `hilfen.ts:83/86/97/106/109/120/131`;
    - `typen-b:97/107/311`;
    - `typen-a:76/106/116/226/236/279/283/331`;
    - `typen-wissen:105/130/150`.
  - Danach folgen Enter, Leertaste oder Pfeiltasten. `.focus()` erreicht auch Elemente mit `tabindex=-1`.
  - Die Reihenfolge mit Tab prüft kein Test; Tab kommt nur in `typen-a:229/233` (`formen`) vor.
  - Belegt ist also, dass jeder Typ mit Tasten bedienbar ist, nicht dass er per Tab erreichbar ist.
- **Nachspuren:** Im Test `typen-b:380` auf desktop („Tastatur“) zeichnet `spureNach` mit `page.mouse` (Z. 243–246,
  Aufruf Z. 423).
  - „Auf Papier geschrieben“ wird nur auf telefon getippt (Z. 428).
  - Der Knopf ist ein natives `<button>` (`Nachspuren.tsx:168–174`), also schon von der Bauart her mit der Tastatur
    bedienbar. Im E2E ist das aber nicht belegt.
  - Genau gezählt: 24 Typen ganz mit der Tastatur, `schrift_ar` nur „erkennen“, `schrift_latein` nur als Unit. Der
    Prüfer nennt 25 von 26.
- **Wiederholen:** Die Runde in `wiederholen-einstufung:164` klickt in beiden Projekten mit der Maus (`loese`,
  Z. 136–160). axe läuft dort nicht. Wiederholen ist also weder mit axe noch mit der Tastatur belegt.
- **Einstufung:** axe nur in de bei 1440 px (Z. 81/109).
- **Keine Zeitgrenzen:** bestätigt.
  - Meine Suche über ganz `src/lib/lernapp` findet zusätzlich `lokal/sync.ts:282`, eine Verzögerung des Abgleichs. Das ist
    keine Antwortfrist.
- **Screenreader:** LM-19 ist UMGEBUNGSAUSNAHME mit dem Ersatzbeleg des Prüfers; bestätigt.
- Die Lücken 1–5 des Prüfers bestätige ich.

## 4. Z-L08 Datenfluss – herabgestuft: teilweise

**Was trägt:**

- `netzprotokoll.spec:10`:
  - `context.on('request')` hängt vor dem ersten `goto` (Z. 15).
  - Der Test verlangt Anfragen des Workers (Z. 39). Das belegt, dass der Service Worker im Protokoll ist (P4).
  - Er prüft GET, den Ursprung, kein `/api/` und leere Cookies.
  - Das `test.skip` für telefon höhlt die Prüfung nicht aus.
- `melden.spec:26`:
  - Bis zum Klick gibt es 0 Anfragen an `/api/`; danach `GET /api/altcha`; ein POST nur beim Senden.
  - Genau genommen hat der Körper 4 Schlüssel: `altcha`, `aufgabe`, `kategorie`, `kurs`. Der Prüfer schreibt „nur
    Aufgabe und Kategorie“. Das ist immer noch sparsam.
- Code (P5): Es gibt nur vier Stellen mit POST und eine mit DELETE:
  - `Abgabe.tsx:139`, `GruppeInsel.tsx:117`, `sync.ts:149`, `melden.ts:64` sowie `EigeneAbgaben.tsx:66`.
  - Alle hängen an einer ausdrücklichen Handlung oder am Konto. `Abgabe.frage()` fragt ohne Profil nicht
    (Z. 50–52).
- Live (P6–P8):
  - kein `Set-Cookie`;
  - CSP `connect-src 'self'` auf Seiten und auf dem Worker der Sprechübung;
  - beide Service Worker byte-gleich mit dem Repo.

**Warum nicht „erfüllt“:** Die Schwelle verlangt „0 Drittanfragen, **auch nach dem Laden des Modells**; Sprachaufnahmen
verlassen das Gerät nie“. Vorgesehen ist als Beleg ein „E2E-Netzprotokoll … mit geladenem Modell“. Auf dem geprüften
Code-Stand gibt es keinen Lauf, der die echte App mit dem echten Modell und einer echten Aufnahme protokolliert:

1. **E2E nur mit der Attrappe.**
   - Der Tor-Bau lief mit `E2E_ATTRAPPEN=1` (`tor-final.sh:62`).
   - `sprechen()` prüft die Erkennung nur mit der Attrappe (`typen-b`, Z. 260). Mit dem echten Worker wählt der Test
     „ohne“ (Z. 267–269).
2. **`whisper-netz.mjs` Lauf 3** (24.10., `fd11a59d`):
   - Der Lauf endet bei „bereit“ (Z. 89–101), ohne Aufnahme und ohne Erkennung.
   - Er lag vor N4, und N4 hat die Download-Menge geändert: 10 → 11 Dateien (ThirdPartyNotices).
3. **Rauchtest N4** (`sprechen-rauchtest.mjs`):
   - Er läuft auf der Probeseite `/lern-app/probe/` eines kleinen Servers. Die CSP ist ins Skript kopiert (Z. 6–7,
     113–120) und stammt nicht aus der App.
   - Er nutzt einen synthetischen Ton, „keine Aufnahme“ (Z. 3).
   - `fremd` vergleicht nur Hosts (Z. 175), und Z. 151 merkt sich nur die URL, nicht die Methode.
   - In der Online-Phase zählt er am Server nur die 11 Download-Pfade (Z. 165–168). Eine zusätzliche Anfrage an den
     eigenen Ursprung, etwa ein POST, ließe ihn nicht scheitern.
4. **„Sprachaufnahmen verlassen das Gerät nie“ ist nur für die Attrappe belegt.**
   - `sprechen()` hört nur auf `page.on('request')` (Z. 259), nicht auf den Kontext. Anfragen des Service Workers fehlen
     also.
   - Er prüft nur die Methode, nicht den Ursprung.
   - `connect-src 'self'` verhindert kein Hochladen an den eigenen Server. Für den echten Weg trägt also nur der Code:
     `whisper.worker.ts:55` ruft nur Modelldateien ab.
5. Im Live-Worker stehen `huggingface.co` und `cdn.jsdelivr.net`. Sie werden nie angefragt, weil CSP und
   `allowRemoteModels: false` sie sperren. Das ist kein Verstoß. Es zeigt aber: Die Sperre besteht aus CSP und
   Einstellung, und den echten Weg hat auf diesem Stand kein Netzprotokoll erfasst.
6. Das Netzprotokoll deckt einen Weg ab (nur desktop). Ohne Netzprotokoll bleiben:
   - Einstufung, Fortschritt, Wortschatz, Quellen;
   - Wissens- und Koran-Kurs;
   - eine gespielte Wiederholungsrunde (nur die Überschrift wird geprüft, Z. 27–28).

**Einen Verstoß habe ich nicht gefunden.** Die Herabstufung betrifft den fehlenden Beleg, nicht ein falsches Verhalten.

**Nacharbeit zu „erfüllt“:**

- `whisper-netz.mjs` einmal auf dem Merge-Bau mit N8 laufen lassen, mit echtem Worker, ohne `E2E_ATTRAPPEN`.
- Das Werkzeug dafür erweitern:
  - nach „bereit“ mit der Testaufnahme von Chromium aufnehmen und erkennen lassen;
  - danach über die ganze Sitzung (Kontext, auch Service Worker) `nichtGet = []` und `fremd = []` verlangen.
- In `sprechen()` auf `context.on('request')` umstellen und den Ursprung prüfen.

## 5. N8

- Die Liste des Prüfers für die erneuten Läufe nach dem Merge (C-e2e.md §6) trägt.
- N8 lässt den Ablauf bei „offline speichern“ unverändert, nämlich `bereiteOfflineVor` nur im Knopf
  (`lernapp-n8:OfflineEinheit.tsx:97`). Die neue Lücke aus Abschnitt 2 besteht also auch mit N8.
- Unter `web/public` und `web/tests/e2e` ändert N8 nichts; `git diff fb10e4dd lernapp-n8` zeigt dort nur das Fehlen von
  `f56f74bd`.
- Beim Merge muss `test.slow` erhalten bleiben (Hinweis des Prüfers).

## 6. Zusammenfassung

| Z | Status | Urteil | Kern |
|---|---|---|---|
| Z-L04 | teilweise | bestätigt | Lektion 1 der Testeinheit ohne Netz (route.abort, auch SW) in beiden Projekten grün; Root-SW-Update grün. Es fehlen: „Stufe offline speichern“, Wiederholen ohne Netz, Hörübung bzw. echte Einheit ohne Netz und `onLine = false`. Neu (Code): Nach jedem neuen Bau sind die vorgehaltenen Kursseiten weg, die Station zeigt weiter „gespeichert“, und kein Test deckt das ab |
| Z-L06 | teilweise | bestätigt | axe ohne Ausschlüsse; volle Matrix nur am 24.10. (Testkurs). Je Typ fehlen axe für 5 Typen aus `typen-a` sowie `paare` und `wortbank`. Der Tastaturweg ist nur per `.focus()` belegt, nicht per Tab. Nachspuren mit der Maus, Wiederholen ohne axe und ohne Tastatur, `schrift_latein` nur als Unit, `gruppe:155` nur einzeln grün; LM-19 UMGEBUNGSAUSNAHME |
| Z-L08 | teilweise | herabgestuft | Ohne Konto auf dem geprüften Weg nur GET an den eigenen Ursprung, keine Cookies, POST nur beim Melden (E2E und Code); live keine Cookies, CSP `self`. Kein Lauf auf diesem Stand mit echter App, echtem Modell und echter Aufnahme. Der Rauchtest prüft nur Hosts auf einer Probeseite; whisper-netz ist vor N4 gelaufen und endet bei „bereit“ |
