# Stufe C · Nachprüfung · Prüfer o3 · Z-08 Leistung

Stand: `origin/main` = 033ea6f. Arbeitsbaum `claude/trusting-lovelace-6nfolz`, HEAD 38440af. `git diff --stat 033ea6f HEAD -- web` ist leer, `git status --short` ist vor und nach der Prüfung leer. Das lokale `main` zeigt auf 71e263f, eine fremde Historie; maßgeblich ist `origin/main`.

**Server:** http://localhost:3100, `next start -p 3100` (seit 17:16 UTC) aus `web/.next`, BUILD_ID `dTw7sfZlgh7KNLbuC0WeA`.
- Gebaut wurde 17:13–17:14 UTC wie bei einem frischen Vercel-Import (Log `scratchpad/bau-import-c2.log`, 1866 Seiten).
- Die Routentabelle ist zeilengleich mit `scratchpad/bau-import-n.log` (diff: nur die Schlusszeile „bau exit 0“).
- Es gibt keine Datenbank: `/api/health` antwortet 503, `/mein-bereich` liefert HTTP 200 mit dem Titel „Seite nicht gefunden“.

**Messzeit:** 15.10.2026, 17:52–18:37 UTC. Ich war allein auf der Maschine (4 Kerne). Last vor Beginn 0,25, danach 0,24; `top` zeigte nur die Messprozesse. Werkzeuge: Chromium 141 (HeadlessChrome/141.0.0.0), Lighthouse 13.5.0, Node 22.22.0.

**Labor-Ersatz:** lokaler `next start` mit gzip, ohne CDN, HTTP/1.1. Lighthouse „devtools“ drosselt mit RTT 150 ms, 1,6 Mbit/s und CPU 4×. Felddaten gibt es nicht (UMGEBUNGSAUSNAHME echte Geräte).

**Ablage:** alles unter `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/o3/`, im Folgenden `o3/`. Die Skripte liegen in `o3/skripte/`; im Repo ist nichts geändert.

## 1. Lighthouse mobil, Erstbesuch (Werkzeug, 3 Läufe, Median)

```
SCRATCHPAD=o3 node _gemeinde/werkzeuge/lighthouse.mjs --routen o3/routen-z08.json --laeufe 3 --basis http://localhost:3100 --protokoll o3/lh-erst
```
Belege: `o3/lh-erst.md`, `.json` und `.log` (rc=0), Vollberichte in `o3/lighthouse/2026-10-15-17-52/`. Ein NO_NAVSTART (simulate, `/gebetszeiten`) hat das Werkzeug wiederholt.

| Route | Perf. | LCP ms (Läufe) | CLS | TBT ms (Läufe) | JS kB (LH) | LCP-Element |
|---|---|---|---|---|---|---|
| / | 91 | **1857** (1927 · 1857 · 1845) | 0,001 | 329 (336 · 264 · 329) | 174,8 | Hero-Absatz `p.max-w-text` |
| /quran/1 | 88 | **2267** (2238 · 2389 · 2267) | 0 | 355 (361 · 355 · 294) | 173,6 | `.leser p.rounded-lg` (Hinweis) |
| /quran/2 | 90 | **2205** (2205 · 2200 · 2259) | 0 | 307 (242 · 307 · 382) | 173,6 | `.leser p.rounded-lg` |
| /hadith/bukhari/1 | 93 | **1848** (1831 · 1862 · 1848) | 0 | 279 (279 · 286 · 276) | 170,1 | `dialog#konzepthinweis p#hinweis-text` |
| /elifbe/buchstaben/be | 89 | **1876** (1884 · 1867 · 1876) | 0 | 386 (294 · 386 · 406) | 168,6 | `dialog#konzepthinweis p#hinweis-text` |
| /lernen | 92 | **1842** (1835 · 1842 · 1889) | 0 | 302 (243 · 302 · 312) | 166,3 | `p.text-20` |
| /gebetszeiten | 91 | **1835** (1832 · 1918 · 1835) | 0 | 336 (409 · 336 · 273) | 179,3 | `dialog#konzepthinweis p#hinweis-text` |

- A11y 100 und SEO 100 auf allen 42 Berichten (Erst- und Wiederbesuch).
- Best Practices 96; einziger Abzug in allen 42 Berichten ist `image-size-responsive`, wie in C-o3.
- Auf Hadith und Elifbe ist der Konzept-Hinweis weiter das LCP-Element. Er erscheint jetzt aber nach 1,83–1,88 s statt 4,4–4,5 s und wird nach der Hydrierung nicht mehr erneut gezeigt.

## 2. Lighthouse mobil, Wiederbesuch (`--wiederbesuch`, 3 Läufe, Median)

```
SCRATCHPAD=o3 node _gemeinde/werkzeuge/lighthouse.mjs --routen o3/routen-z08.json --laeufe 3 --basis http://localhost:3100 --wiederbesuch --protokoll o3/lh-wieder
```
Belege: `o3/lh-wieder.md`, `.json` und `.log` (rc=0), Vollberichte in `o3/lighthouse/2026-10-15-18-05/`.

| Route | Perf. | LCP ms (Läufe) | CLS | TBT ms (Läufe) | JS kB | LCP-Element |
|---|---|---|---|---|---|---|
| / | 88 | **1816** (1816 · 1804 · 1880) | 0,001 | 428 (428 · 500 · 419) | 174,8 | Hero-Absatz |
| /quran/1 | 87 | **2241** (2241 · 2321 · 2198) | 0 | 354 | 173,6 | `.leser p.rounded-lg` |
| /quran/2 | 88 | **2195** (2195 · 2169 · 2226) | 0 | 365 | 173,6 | `.leser p.rounded-lg` |
| /hadith/bukhari/1 | 91 | **1830** (1880 · 1830 · 1818) | 0 | 337 | 170,1 | `span.text-tinte-2` |
| /elifbe/buchstaben/be | 89 | **1822** (1822 · 1808 · 1829) | 0 | 390 | 168,6 | `p.text-18` |
| /lernen | 89 | **1815** (1815 · 1800 · 1826) | 0 | 390 | 166,3 | `p.text-20` |
| /gebetszeiten | 89 | **1830** (1830 · 1823 · 1849) | 0 | 401 | 179,3 | `span.breite-nach-muster > span` (Platzhalter) |

Auf `/gebetszeiten` ist das LCP-Element jetzt der Platzhalter mit fester Breite (`GebetszeitenSeite.tsx:115`, `:135`). Er erscheint nach 1,83 s, vorher waren es 3747 ms (C-o3) bzw. 4169 ms (Gegenprüfung N1).

## 3. Vergleich LCP (Median, ms): C-o3 (75cad0a), C-N1 (Port 3221), jetzt

| Route | C-o3 Erst | N1 Erst | **jetzt Erst** | C-o3 Wieder¹ | N1 Wieder | **jetzt Wieder** |
|---|---|---|---|---|---|---|
| / | 1944 | 1879 | **1857** | 1940 | 1919 | **1816** |
| /quran/1 | 2508 | 2251 | **2267** | 2478 | 2305 | **2241** |
| /quran/2 | 2541 | 2240 | **2205** | 2516 | 2226 | **2195** |
| /hadith/bukhari/1 | 4393 | 2018 | **1848** | 2274 | 1828 | **1830** |
| /elifbe/buchstaben/be | 4515 | 1940 | **1876** | 2241 | 1871 | **1822** |
| /lernen | 1916 | 1881 | **1842** | 1931 | 1834 | **1815** |
| /gebetszeiten | 1908 | 1867 | **1835** | 3747 | 1934 | **1830** |

¹ C-o3 hat den Wiederbesuch mit dem eigenen Skript `lh-gesehen.mjs` gemessen, bei gleichen Einstellungen.

Ergebnis: 14 von 14 Medianen ≤ 2500 ms. Der höchste Einzellauf ist `/quran/1` mit 2389 ms (Erstbesuch) bzw. 2321 ms (Wiederbesuch). Die Werte von N1 sind bestätigt.

## 4. JS je Route (gz)

### 4a. Vorlauf-Messweise: Kennzahl „JS kB“ von `lighthouse.mjs`
Die Kennzahl ist die Summe von `transferSize` der Skripte, einschließlich der Header. Am Endstand des Vorlaufs galt: `/` 175,5 kB, `/gebetszeiten` 178,9 kB (`_archiv/lauf-gestaltung-2026-10/protokolle/C-lighthouse-v.md`).

| Route | C-o3 | N1 | **jetzt** | ≤ 180 |
|---|---|---|---|---|
| / | 183,1 | 174,8 | **174,8** | ja |
| /quran/1, /quran/2 | 180,6 | 173,6 | **173,6** | ja |
| /hadith/bukhari/1 | 177,1 | 170,1 | **170,1** | ja |
| /elifbe/buchstaben/be | 176,9 | 168,6 | **168,6** | ja |
| /lernen | 174,6 | 166,3 | **166,3** | ja |
| /gebetszeiten | 187,4 | 179,4 | **179,3** | ja (Rand: 0,7 kB Luft; 0,4 kB über dem Vorlauf-Endstand) |

Erst- und Wiederbesuch sind gleich. Nachprüfung 16 aus `berichte/stufe-c.md:22` ist damit erledigt.

### 4b. Route-eigenes JS (Playwright, `o3/skripte/js-groesse.mjs`)
Belege: `o3/js-routen.md` und `.json`. Gemessen wurde bis `load` mit gzip 6.

| Route | / | /quran/1–2 | /hadith/bukhari/1 | /elifbe/… | /lernen | /gebetszeiten |
|---|---|---|---|---|---|---|
| jetzt | 161,5 | 160,3 | 156,8 | 155,3 | 154,1 | 164,8 |
| C-o3 | 169,8 | 167,3 | 163,8 | 163,6 | 162,4 | 172,9 |

- Nach `load` lädt die Seite nur den Prefetch fremder Routen. Das ergibt die Zuordnung über die Seiten-Manifeste: `40mshvufd4fag.js` und `0qhnjjzinc8pa.js` gehören zu `gebetszeiten/page`, `2az52lq9qf0fd.js` zu `(website)/page`, `171oc_3pmo4en.js` zu `quran/page`.
- Die einzige Ausnahme ist `/quran/2`: Dort lädt zusätzlich der Nachsatz `3o3mb-txpibky.js` (1,1 KiB, enthält `reichereAn`). Das ist ein dynamischer Import aus `3n8k3cpu1hlu-.js`, das in den Manifesten von `quran/[sure]` und `quran/cuz/[nr]` steht. Route-eigen sind das 161,4 KiB.
- Die js-groesse-Spalte „≤ 180 NEIN“ bei `/quran/1–2` kommt allein vom Prefetch der fremden Routen (182,2 bzw. 183,2 KiB Summe).

### 4c. Bauausgabe (`o3/skripte/manifest-js.mjs web/.next`)
Belege: `o3/manifest-js.md` und `.json`. Gezählt sind rootMainFiles (6 Dateien, 130,1 KiB gz) und alle `entryJSFiles` je Seite („voll“).

- **Kalibrierung:** „voll“ stimmt auf allen 6 Seitentypen exakt mit 4b „bis load“ überein (161,5 / 160,3 / 156,8 / 155,3 / 154,1 / 164,8).
- **Öffentlich:** 47 Seiten mit 154,1–171,5 KiB. Die größte ist `/islamisches-wissen` (C-o3: 179,8).
- **Mein Bereich:** 13 Seiten `(konto)/mein-bereich/**` mit **173,2–201,2 KiB** gz; die größte ist `mein-bereich/konto/page` (C-o3: 192,1–207,4). Budget ≤ 230 KB. In `components/{mein-bereich,chat,kinder,konto,unterricht}` und `app/[locale]/(konto)` gibt es kein `lazy(`, `import(` oder `next/dynamic` (grep rc=1). Es kommt also kein weiteres JS beim Laden hinzu.
- **Browsermessung von Mein Bereich:** nicht möglich, weil `/mein-bereich` und `/mein-bereich/konto` HTTP 200 mit „Seite nicht gefunden“ liefern (`o3/html_mein-bereich.html`). Das ist die UMGEBUNGSAUSNAHME „Vorschau ohne Datenbank“; Ersatz ist die kalibrierte Bauausgabe.
- **Nebenbefund (AUFTRAG §2.1, Konto-Einstieg ≤ 200 KB):** jetzt 191,7–193,9 KiB, `/anmelden` 193,9 (vorher 200,4). Erfüllt.

### 4d. HTML Al-Baqara (AUFTRAG.md:279: HTML ≤ 150 KB gz)
`curl -H 'Accept-Encoding: gzip' /quran/2` ergibt 86 242 B (84,2 KiB, `Content-Encoding: gzip`, `o3/html-groessen.txt`). Erfüllt; C-o3 maß 82,4 kB.

## 5. INP (Labor, CPU 4×, 390×844)

### 5a. Werkzeug `inp.mjs`, 3 Läufe
```
SCRATCHPAD=o3 node _gemeinde/werkzeuge/inp.mjs --routen o3/routen-z08.json --basis http://localhost:3100 --laeufe 3 --protokoll o3/inp-z08
```
Beleg: `o3/inp-z08.md`.

| Route | jetzt (Läufe) | C-o3 |
|---|---|---|
| / | 104 (104 · 144 · 104) | 112 |
| /quran/1 | 112 | 80 |
| /quran/2 | 160 (160 · 168 · 144; Leiste/Ansicht) | 112 |
| /hadith/bukhari/1 | 80 | 56 |
| /elifbe/buchstaben/be | 88 | 72 |
| /lernen | 80 | 72 |
| /gebetszeiten | 72 | 56 |

7 von 7 ≤ 200 ms.

### 5b. Eingaben im Koran-Leser (`o3/skripte/inp-quran.mjs`, 3 Läufe)
Wort antippen und Escape, Tajwid aus/an, Ansicht mit Schrift größer und Lesemodus (Beleg `o3/inp-quran.md`):
- `/quran/1`: Median 88 ms (88 · 88 · 96)
- `/quran/2`: Median **168 ms** (168 · 144 · 168; DOM 12 967 Knoten; C-o3: 144)

Erfüllt, auf `/quran/2` mit 32 ms Abstand zur Schwelle.

### 5c. Erster Tab auf /quran/2 (`o3/skripte/tab-faelle.mjs`, Event Timing je Interaktion)
Belege: `o3/tab-quran2-cpu4.log` und `.json`, `o3/tab-quran2-cpu1.log`, `o3/tab-quran2-erstklick.log`. Gemessen ab networkidle + 3 s, sofern nicht anders genannt.

| Fall (CPU 4×, 3 Läufe) | erste Fokus-Taste ms | übrige Tasten ms | Fokusziel |
|---|---|---|---|
| Tab als erste Taste (Wiederbesuch) | **32 · 40 · 40** | 16–24 | Sprunglink „Zum Inhalt springen“ |
| ab `load` ohne Warten, 12 Tabs | 32 · 40 · 80 | 16–48 | Sprunglink |
| Umschalt+Tab als erste Taste | 16–72 (Umschalt und Tab je eine Interaktion) | 16–48 | letzter Fußzeilenlink „Quellen“ |
| Erstbesuch: Escape, dann Tab | Escape 80–112, Tab 16–40 | 16–32 | Sprunglink |
| Erstbesuch: Tab im Dialog, Escape, Tab | 24 / Escape 88–136 / 16–24 | 16 | Knopf „Verstanden“, dann Sprunglink |
| Erstbesuch: Klick „Verstanden“, Tab | Klick 160–192, Tab 16–24 | 16–24 | Sprunglink |
| Klick ohne Bedienelement, dann Tab | Klick 32–40, Tab 16–24 | 16–32 | Knopf „Ansicht“ |
| Adresse `#v255`, Tab | 16–40 | 16–40 | Versabsatz (Skript greift bei Anker nicht) |
| **CPU 1×**, Tab | 16 · 16 | 16 | Sprunglink |
| **CPU 1×**, ab `load` | 56 · 56 | 16–32 | Sprunglink |

- Vorher (C-o3) lag der erste Tab bei CPU 4× bei 5888–6392 ms und bei CPU 1× bei 760 ms. Die Behebung (`erster-tab.ts:15`, eingebunden in `LeserRahmen.tsx:61`) wirkt.
- Die Fokusziele entsprechen dem Verhalten des Browsers: `o3/shift-tab-sonde.log` zeigt auf `/` (ohne Skript) dieselbe Reihenfolge. Umschalt+Tab führt auf `/quran/2`, `/quran/1`, `/` und `/lernen` jeweils zu Quellen → Barrierefreiheit → Impressum → Datenschutz.
- Anmerkung zum Umschalt-Fall in `tab-faelle`: Danach landet der Fokus auf `body`, weil die anschließende Tab-Taste vom letzten Element aus der Seite hinausführt. Das ist Browserverhalten, kein Fehler.
- Cüz-Seiten mit demselben Rahmen: `/quran/cuz/1` 32 · 48 ms, `/quran/cuz/30` 40 · 56 ms (`o3/tab-zusatz-cpu4.log`).

### 5d. Erster Tab auf den übrigen Messrouten
Beleg `o3/tab-andere-cpu4.log` (CPU 4×, je 2 Läufe):
- `/`: 32–40 ms
- `/quran/1`: 24–32 ms
- `/elifbe/buchstaben/be`: 24 ms
- `/lernen`: 32–40 ms
- `/gebetszeiten`: 24 ms
- Erstbesuch mit Escape und Tab: Escape 56–96 ms, Tab 16–40 ms
- **`/hadith/bukhari/1`:** 128 · 208 ms; 6 weitere Läufe in `o3/tab-hadith-cpu4.log` ergaben 176 · 168 · 168 · 136 · 128 · 152 ms. Über 8 Läufe ist der Median 160 ms, ein Lauf liegt über 200 ms. Die Verarbeitung im keydown kostet 116–158 ms; C-o3 maß 136 und 160 ms.

### 5e. NEUER BEFUND: erster Tab auf Hadith-Seiten mit vielen Karten
Gleiche Ursache wie vorher auf `/quran/2`, aber die Leseseiten-Behebung erfasst die Hadith-Liste nicht.

| Seite (100 Karten) | CPU 4× erster Tab ms | davon Verarbeitung | CPU 1× | Erstbesuch Escape→Tab |
|---|---|---|---|---|
| /hadith/bukhari/56 | **992 · 1112 · 1112** | 979–1096 | 120 · 136 | 16–24 |
| /hadith/bukhari/56/teil/2 | **1200 · 1296** | – | – | – |

- Belege: `o3/tab-hadith56-cpu4.log` und `.json`, `o3/tab-hadith56-cpu1.log`, `o3/tab-zusatz-cpu4.log`.
- Spur `o3/spur-hadith56.trace.json` (VERZUG=3000, Auswertung `o3/spur-hadith56.json`): ein `EventDispatch{keydown}` von 773 ms, darin **99 × Layout (550 ms) und 100 × UpdateLayoutTree (147 ms)**, also eine Runde je Karte.
- Ursache im Code:
  - Jede Karte trägt `content-visibility: auto` (`web/src/components/website/hadith/HadithListe.tsx:17`, angewandt in `:60`).
  - Das Skript für den ersten Tab steckt nur im Koran-Rahmen (`LeserRahmen.tsx:8`, `:61`).
- Die Ursache bestand schon an 75cad0a (`git show 75cad0a:…/HadithListe.tsx`, Zeile 17 gleich). Es ist also kein Rückschritt durch N1; C-o3 hatte nur die kurze `/hadith/bukhari/1` gemessen.
- Umfang laut Bauausgabe (`web/.next/server/app/de/hadith/bukhari/**/*.html`, nur de gezählt): 133 Hadith-Seiten, davon 70 mit ≥ 50 und 38 mit 100 Karten.
- `inp.mjs` sieht das nicht: Dort geht zuerst Menü und Escape voraus, und Buch 56 gehört nicht zu den Messrouten.

## 6. CLS
Alle 42 devtools-Läufe liegen bei ≤ 0,001 (`/` 0,001, sonst 0), Erst- und Wiederbesuch, auch `/quran/2`. Erfüllt.

## 7. TBT gegenüber AUSNAHME A-01 des Vorlaufs
A-01 (`_archiv/lauf-gestaltung-2026-10/ENTSCHEIDUNGEN.md:81–125`, `protokolle/C-lighthouse-v.md`) nennt am Endstand des Vorlaufs:
- TBT-Mediane des Prüflings 380–623 ms, darunter `/` 521 und `/gebetszeiten` 513 ms
- E0: 285–458 ms

| Route | jetzt Erst / Wieder | C-o3 Erst / Wieder | N1 Erst / Wieder | Vorlauf-Endstand | Einordnung |
|---|---|---|---|---|---|
| / | 329 / 428 | 234 / 227 | 307 / 361 | 521 | besser als A-01 |
| /gebetszeiten | 336 / 401 | 222 / 243 | 274 / 435 | 513 | besser als A-01 |
| /quran/1 | 355 / 354 | 224 / 237 | 286 / 410 | – (neu) | unter dem Vorlauf-Bereich |
| /quran/2 | **307 / 365** | 665 / 568 | 397 / 436 | – (neu) | jetzt unter dem niedrigsten Vorlauf-Median |
| /hadith/bukhari/1 | 279 / 337 | 260 / 215 | 325 / 375 | – | unter dem Vorlauf-Bereich |
| /elifbe/buchstaben/be | 386 / 390 | 330 / 199 | 359 / 448 | – | im unteren Vorlauf-Bereich |
| /lernen | 302 / 390 | 196 / 216 | 266 / 334 | – | unter bzw. im unteren Vorlauf-Bereich |

**`/quran/2`:** Die lange Aufgabe des Nachsatzes (C-o3: 444–468 ms aus `2a6dnhpcc1yto.js`) gibt es nicht mehr. Nach `long-tasks` stammt in keinem Bericht eine Aufgabe aus dem Nachsatz-Chunk; `anreichern.ts:9`/`:31` gibt alle 8 ms ab.

**Gegenüber C-o3 liegt die TBT auf 6 von 7 Routen höher** (Erstbesuch +19 bis +131 ms, Wiederbesuch +117 bis +201 ms). Der Vergleich ist ungepaart (`o3/lh-vergleich-erst.md`, `o3/lh-vergleich-wieder.md`, Skript `o3/skripte/lh-vergleich.py`):
- `benchmarkIndex` liegt jetzt bei 1800–2120, in C-o3 bei 2001–2177. Die Maschine war also etwas langsamer.
- Derselbe Framework-Chunk `2cf-1ar8micdv.js` (gleicher Dateiname) kostet im Erstbesuch auf `/` 892 statt 683 ms Bootup, auf `/lernen` 763 statt 639 ms.
- Beim Wiederbesuch dauert die längste Aufgabe (Hydrierung) aber auf den 6 Routen ohne Nachsatz 14–29 % länger (Median; z. B. `/lernen` 314–364 statt 253–269 ms).
- Dazu kommen kleine lange Aufgaben von 50–75 ms nach der Hydrierung, etwa `17wghgzp33eul.js` mit dem Schriften-Code des Layouts und weitere Dokumentaufgaben.
- Ob das eine Code-Ursache hat, lässt sich ohne Paarmessung nicht entscheiden: Ein zweiter Server ist nicht erlaubt.

Die Bedingung „ohne Rückschritt gegenüber A-01“ ist erfüllt. Die Messwerkzeug-Schwelle TBT ≤ 200 verfehlen weiter alle Routen; das deckt A-01 als AUSNAHME ab. Die Performance-Note liegt bei 88–93 (Erstbesuch) und 87–91 (Wiederbesuch); am Vorlauf-Endstand waren es 81–89.

## 8. Urteil Z-08 (Labor-Ersatz)

| Teil | Schwelle | Ergebnis | Status |
|---|---|---|---|
| JS öffentlich | ≤ 180 KB gz | Vorlauf-Messweise 166,3–179,3 kB auf 7/7 Routen; route-eigen 154,1–164,8 KiB; Bauausgabe 47 Seiten 154,1–171,5 KiB | erfüllt (Rand `/gebetszeiten` 179,3) |
| LCP | ≤ 2,5 s | Erstbesuch 1835–2267 ms, Wiederbesuch 1815–2241 ms, 14/14; max. Einzellauf 2389 ms | erfüllt |
| INP | ≤ 200 ms | `inp.mjs` 7/7 mit 72–160 ms; Koran-Leser ≤ 168; erster Tab `/quran/2` 32–40 ms (CPU 4×); **erster Tab auf Hadith-Seiten mit 100 Karten 992–1296 ms (CPU 4×)**; `/hadith/bukhari/1` Median 160 ms, 1 von 8 Läufen 208 ms | **teilweise** |
| CLS | ≤ 0,1 | ≤ 0,001 überall | erfüllt |
| Mein Bereich | ≤ 230 KB | 173,2–201,2 KiB (Bauausgabe, kalibriert) | AUSNAHME (Umgebung: ohne Datenbank) mit Ersatz, Ersatz erfüllt |
| TBT nach A-01 | kein Rückschritt | `/` 521 → 329/428, `/gebetszeiten` 513 → 336/401; `/quran/2` 665 → 307 | erfüllt (ungepaart; gegenüber C-o3 höher, Ursache offen) |

**Gesamt Z-08: teilweise.**
- **Behoben:** alle Mängel aus Stufe C. Dazu gehören LCP auf 4/7, die Zeitinsel `/gebetszeiten` beim Wiederbesuch, der erste Tab auf `/quran/2`, die TBT auf `/quran/2` und das JS nach der Vorlauf-Messweise.
- **Offen ist ein einziger Punkt, neu gefunden:** Der erste Tab auf den Hadith-Seiten mit vielen Karten blockiert bei CPU 4× rund 1–1,3 s. Ursache ist derselbe Mechanismus wie vorher auf `/quran/2`, weil `HadithListe.tsx:17` `content-visibility: auto` ohne die Erster-Tab-Behebung nutzt.
- **Vorschlag:** `ERSTER_TAB` auch auf den Hadith-Buch- und Teilseiten einbinden.

Repo-Zustand nach der Prüfung: `git status --short` ist leer, HEAD 38440af. In `_gemeinde/protokolle/` habe ich nichts geschrieben.
