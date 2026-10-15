# Stufe C · Prüfer o3 · Z-08 Leistung

Stand: `origin/main` = 75cad0a (Arbeitsbaum `claude/trusting-lovelace-6nfolz`, HEAD 39f03da; `git diff 75cad0a HEAD -- web` leer, Arbeitsbaum sauber).
Server: http://localhost:3100, `next start` aus `web/.next` (BUILD_ID `xOQ7HpptScjBgnAftlR71`, gebaut 15.10. 03:14–03:18 UTC wie frischer Vercel-Import, Log `scratchpad/bau-import-c.log`, `scratchpad/server-import.log`). Ohne Datenbank: `/api/health` 503, `/mein-bereich` liefert die 404-Seite.
Messzeit: 15.10.2026 03:45–04:34 UTC, allein auf der Maschine (Last vor Beginn 0,09, nach Ende 0,12; 4 Kerne). Chromium 141 (`/opt/pw-browsers/chromium-1194`), Lighthouse 13.5.0, Playwright 1.64, Node 22.22.

**Labor-Ersatz:** lokaler `next start` mit gzip durch Next, ohne CDN, HTTP/1.1, localhost. Lighthouse „devtools“: RTT 150 ms, 1,6 Mbit/s, CPU 4× (`configSettings.throttling` in jedem Bericht). Keine Felddaten (UMGEBUNGSAUSNAHME echte Geräte). Alle Werte gelten nur für diese Laborbedingungen.

Ablage aller Belege: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/o3/` (im Folgenden `o3/`).

---

## 1. Lighthouse mobil (maßgeblich, Werkzeug `_gemeinde/werkzeuge/lighthouse.mjs`, 3 Läufe, Median)

Befehl:
```
SCRATCHPAD=o3 node _gemeinde/werkzeuge/lighthouse.mjs --routen o3/routen-z08.json --laeufe 3 --basis http://localhost:3100 --protokoll o3/lh-z08
```
Protokoll `o3/lh-z08.md` / `.json`, Log `o3/lh-z08.log`, Vollberichte `o3/lighthouse/2026-10-15-03-45/` (je Lauf devtools + simulate). Das Werkzeug setzt den Speicher je Lauf zurück, deshalb erscheint der Konzept-Hinweis in jeder Messung (= Erstbesuch).

| Route | Perf. | LCP ms (Läufe) | CLS | TBT ms (Läufe) | JS kB (LH, inkl. Header) | sim. Perf. / LCP | LCP ≤ 2500 |
|---|---|---|---|---|---|---|---|
| / | 94 | **1944** (1944 · 1949 · 1924) | 0,001 | 234 (207 · 234 · 241) | 183,1 | 91 / 3395 | ja |
| /quran/1 | 89 | **2508** (2478 · 2508 · 2526) | 0 | 224 (224 · 199 · 293) | 180,6 | 87 / 3857 | **nein (+8 ms)** |
| /quran/2 | 76 | **2541** (2541 · 2556 · 2528) | 0 | 665 (715 · 659 · 665) | 180,6 | 79 / 4217 | **nein (+41 ms)** |
| /hadith/bukhari/1 | 76 | **4393** (4415 · 4385 · 4393) | 0 | 260 (260 · 259 · 312) | 177,1 | 88 / 3830 | **nein** |
| /elifbe/buchstaben/be | 72 | **4515** (4500 · 4515 · 4578) | 0 | 330 (361 · 330 · 328) | 176,9 | 88 / 3650 | **nein** |
| /lernen | 95 | **1916** (1901 · 1916 · 1923) | 0 | 196 (190 · 196 · 216) | 174,6 | 91 / 3323 | ja |
| /gebetszeiten | 94 | **1908** (1858 · 1909 · 1908) | 0 | 222 (222 · 200 · 270) | 187,4 | 89 / 3627 | ja |

A11y 100, SEO 100 auf allen Routen; Best Practices 96 (einziger Abzug `image-size-responsive`: Logo `/bilder/logos/logo-igmg-wetzlar.png` 40×40 bei DPR 2,6; z. B. `o3/lighthouse/2026-10-15-03-45/start-lauf1-devtools.report.json`).

### 1a. Warum LCP verfehlt wird (LCP-Element aus `lcp-breakdown-insight` je Bericht)

- **/hadith/bukhari/1, /elifbe/buchstaben/be:** LCP-Element ist `dialog#konzepthinweis … p#hinweis-text` („Diese Website dient ausschließlich zu Demonstrationszwecken …“), TTFB 12 ms, Render-Verzug ≈ 4,4 s, FCP 2,2–2,3 s. Die LCP-Sonde (`o3/lcp-sonde.md`, Playwright mit gleicher CPU-Drosselung) zeigt den Ablauf: Der Dialog wird vor der Hydrierung durch das Inline-Skript geöffnet (`KonzeptHinweis.tsx:18`, `:117`) und nach der Hydrierung erneut gesetzt (Ereignis „attribut: offen/modal“ bei ≈ 3,3 s; vermutlich der Zweig `:38–42` für den beim Streaming verschobenen Dialog). Erst diese zweite Darstellung wird als LCP gemeldet (Hadith 1344 → 3388 ms, Elifbe 1308 → 3400 ms). Mit gesetztem Merker (Wiederbesuch) liegt LCP dort bei 1296 bzw. 1256 ms (Sonde) und 2274 bzw. 2241 ms (Lighthouse, Abschnitt 2). Der Code-Kommentar `KonzeptHinweis.tsx:12–16` nennt genau diesen Fall als zu vermeiden; auf diesen beiden Routen tritt er ein.
- Hinweis zur Sonde (`o3/skripte/lcp-probe.mjs`): Sie drosselt mit 150 ms Latenz, Lighthouse „devtools“ mit 562,5 ms Anfrage-Latenz. Ihre absoluten Zeiten liegen deshalb niedriger; aussagekräftig sind nur Reihenfolge und LCP-Element.
- **/quran/1, /quran/2:** FCP = LCP (Hinweis-Absatz „Für diese Sprache ist noch keine Übersetzung freigegeben“ im `.leser`). Die erste Darstellung wartet auf vier blockierende Stylesheets (Ende 2083 ms bzw. 2055 ms), die mit vorgeladenen Schriften um die Bandbreite konkurrieren (u. a. `amiri_quran_arabic` 45,6 kB, `igmg_wetzlar_titel` 50,3 kB); auf `/` endet das CSS bei ≈ 1700 ms (Wasserfall aus `quran_1-lauf2-devtools.report.json`, `quran_2-lauf1-devtools.report.json`, `start-lauf*-devtools.report.json`). HTML `/quran/2` 82,4 kB gz (`o3/html-groessen.txt`).

## 2. Ergänzung: Lighthouse für den Wiederbesuch (Konzept-Hinweis gesehen)

Eigenes Skript `o3/skripte/lh-gesehen.mjs`: gleiche Lighthouse-Einstellungen (devtools, mobil), vor jedem Lauf `Storage.clearDataForOrigin` (alles inkl. Service Worker), `Network.clearBrowserCache`, nur der Merker `igmg-konzepthinweis-gesehen=1`; `disableStorageReset: true`. Protokoll `o3/lh-gesehen.md`, Berichte `o3/lh-gesehen-berichte/`, Log `o3/lh-gesehen.log`. Nicht das Werkzeug des Laufs, nur Ursachenbeleg.

| Route | Perf. | LCP ms (Läufe) | TBT ms | CLS | LCP-Element |
|---|---|---|---|---|---|
| / | 94 | 1940 (1940 · 1963 · 1922) | 227 | 0,001 | Hero-Absatz |
| /quran/1 | 90 | 2478 (2486 · 2478 · 2459) | 237 | 0 | Hinweis „keine Übersetzung“ |
| /quran/2 | 79 | **2516** (2516 · 2503 · 2518) | 568 | 0 | Hinweis „keine Übersetzung“ |
| /hadith/bukhari/1 | 92 | 2274 (2297 · 2274 · 2212) | 215 | 0 | span „Geprüfte Übersetzungen …“ |
| /elifbe/buchstaben/be | 93 | 2241 (2241 · 2246 · 2226) | 199 | 0 | p „Zug für Zug …“ |
| /lernen | 94 | 1931 (1931 · 1893 · 1968) | 216 | 0 | p „Jede Station …“ |
| /gebetszeiten | 84 | **3747** (3763 · 3747 · 3707) | 243 | 0 | `span.text-48` „13:17 Uhr“ |

Neu sichtbar: Auf `/gebetszeiten` ist ohne Hinweis die Zeit des nächsten Gebets das LCP-Element. Sie wird erst nach der Hydrierung gesetzt (Client-Uhr `useJetzt`, `GebetszeitenSeite.tsx:58`, neu eingesetzt über `key={wechsel ?? 'ohne'}` `:113`, Element `:129`). LCP 3,7 s beim Wiederbesuch. Beim Erstbesuch überdeckt der größere Hinweis-Absatz das (1,9 s).

## 3. JS je Route (gz)

### 3a. Geladene Skripte (Playwright) – `o3/skripte/js-groesse.mjs`, Protokoll `o3/js-routen.md` / `.json`
390×844 mobil, frischer Kontext, Varianten Erstbesuch/gesehen (identisch). Größe = gzip (Stufe 6) des Rumpfs; Server-gzip ist 17 Byte größer je Datei (z. B. `2cf-1ar8micdv.js` übertragen 73641 B, gzip6 73574 B). KiB = 1024 B.

| Route | bis `load` (route-eigen) | nach `load` | davon route-eigen | Summe aller Skripte |
|---|---|---|---|---|
| / | **169,8** | 3,9 (Prefetch anderer Routen) | 0 | 173,7 |
| /quran/1 | **167,3** | 21,7 (Prefetch `/`, `/gebetszeiten`, `/quran`) | 0 | 189,0 |
| /quran/2 | **167,3** | 22,7 | 1,0 (`2a6dnhpcc1yto.js` = Nachsatz `anreichern.ts`) | 189,9 |
| /hadith/bukhari/1 | **163,8** | 17,9 (Prefetch) | 0 | 181,7 |
| /elifbe/buchstaben/be | **163,6** | 7,4 (Prefetch) | 0 | 170,9 |
| /lernen | **162,4** | 7,4 (Prefetch) | 0 | 169,8 |
| /gebetszeiten | **172,9** | 7,4 (Prefetch) | 0 | 180,3 |

Zuordnung der Nach-load-Dateien zu den Seiten-Manifesten: `42ttx7n87effd.js` → `(website)/page`, `35bcuvbmrjy2-.js`/`210hi_tk8k9z8.js` → `gebetszeiten/page`, `311iz4uv629hv.js` → `quran/page`, `2_uyjzawhommi.js`/`0uv-yzw6c00x9.js` → Formular-/Über-uns-Seiten: Link-Prefetch der verlinkten Routen, nicht JS der Route selbst. Lighthouse zählt diese mit 0 kB (`transferSize` 0).

### 3b. Alle Seiten aus der Bauausgabe – `o3/skripte/manifest-js.mjs`, Protokoll `o3/manifest-js.md` / `.json`
`rootMainFiles` (`.next/build-manifest.json`, 6 Dateien, 130,1 KiB gz) + alle `entryJSFiles` des `page_client-reference-manifest.js` der Seite („voll“).
**Kalibrierung:** „voll“ stimmt auf allen 6 gemessenen Seitentypen auf 0,1 KiB genau mit „bis load“ aus 3a überein (169,8 / 167,3 / 163,8 / 163,6 / 162,4 / 172,9), dazu `/islamisches-wissen` 179,8 = 179,8 und `/gebetszeiten/anzeige` 178,4 = 178,4 (`o3/js-zusatz.md`).

- **Öffentlich (47 Seiten unter `(website)`):** 162,4–**179,8 KiB** gz; keine Seite > 180 KiB. Knappste: `/islamisches-wissen` 179,8, `/islamisches-wissen/[thema]` 179,3, `/gebetszeiten/anzeige` 178,4.
- **Mein Bereich (13 Seiten `(konto)/mein-bereich/**`):** 192,1–**207,4 KiB** gz (größte `mein-bereich/konto/page`), Budget ≤ 230. In `src/components/mein-bereich/` gibt es keine `lazy(`/`import(`-Aufrufe (grep ohne Treffer), also kein weiteres JS beim Laden. Browsermessung nicht möglich: ohne Datenbank liefert `/mein-bereich` die 404-Seite (`<title>Seite nicht gefunden`; ebenso live, `stufe-c/k2/live_mein-bereich.html`). Das ist die UMGEBUNGSAUSNAHME „Vorschau ohne Datenbank“; Ersatzbeleg ist die kalibrierte Bauausgabe.
- Nebenbefund (nicht Z-08, AUFTRAG §2.1 „Konto-Einstieg ≤ 200 KB“): `/anmelden` 200,4 KiB, alle anderen Einstiegsseiten 198,3–198,5 KiB.

### 3c. Einordnung
- Gemessen als gz-JS der Route (Rumpf, ohne HTTP-Header, ohne Prefetch fremder Routen) gilt auf jeder öffentlichen Seite ≤ 180 KiB.
- Die Werkzeug-Kennzahl „JS kB“ von `lighthouse.mjs` (Summe `transferSize` inkl. ≈ 1 KiB Header je Datei, Vorlauf-Belege) liegt auf 4 von 7 Routen über 180: `/` 183,1, `/quran/1` 180,6, `/quran/2` 180,6, `/gebetszeiten` 187,4. Am Endstand des Vorlaufs zeigte dieselbe Kennzahl `/` 175,5 und `/gebetszeiten` 178,9 (`_archiv/lauf-gestaltung-2026-10/protokolle/C-lighthouse-v.md`).
- In dezimalen kB läge `/islamisches-wissen` bei 184,1 kB. Das Budget nennt die Einheit nicht; die Werkzeuge rechnen mit 1024.

## 4. INP (Labor)

### 4a. Werkzeug des Laufs – `_gemeinde/werkzeuge/inp.mjs` (Verfahren L-E12 des Vorlaufs), 3 Läufe
```
SCRATCHPAD=o3 node _gemeinde/werkzeuge/inp.mjs --routen o3/routen-z08.json --basis http://localhost:3100 --laeufe 3 --protokoll o3/inp-z08
```
`o3/inp-z08.md`: `/` 112, `/quran/1` 80, `/quran/2` 112 (112 · 136 · 112), `/hadith/bukhari/1` 56, `/elifbe/buchstaben/be` 72, `/lernen` 72, `/gebetszeiten` 56 ms. 7 von 7 ≤ 200 ms.

### 4b. Koran-Leser-Eingaben – `o3/skripte/inp-quran.mjs`, 3 Läufe, CPU 4×
Wort antippen (Wortkarte) + Escape, Tajwid aus/an, Ansicht öffnen + Schrift größer + Lesemodus + schließen (`o3/inp-quran.md`): `/quran/1` Median 96 ms (DOM 863 Knoten), `/quran/2` Median **144 ms** (136 · 144 · 176; DOM 12 960 Knoten). Erfüllt.

### 4c. Befund: erster Tab-Druck auf /quran/2
Ein Tastaturnutzer, der als erste Eingabe Tab drückt (ohne vorherigen Klick), blockiert `/quran/2`:
- `o3/inp-erster-tab-spaet.log` (networkidle + 3 s, CPU 4×): `/quran/2` **6392 · 6168 · 5888 ms**; `/quran/1` 24–40 ms, `/` 32–40 ms.
- `o3/tab-varianten.log`: CPU 4× 6352 / 5800 / 6328 / 5976 ms; **CPU 1× (ungedrosselt) 760 / 760 ms**; folgende Tabs 16–24 ms.
- `o3/tab-erster-alle.log`: alle anderen Messrouten beim ersten Tab 16–160 ms.
- Spur `o3/spur-quran2-spaet.trace.json` (Auswertung `o3/spur-quran2-spaet.json`): ein `EventDispatch{keydown}` von **6244 ms** auf dem Hauptthread, darin `UpdateLayoutTree` 3708 ms und `Layout` 2048 ms in **280** Durchgängen. Das entspricht etwa der Zahl der Verse (286). Jeder `.vers` trägt `content-visibility: auto` (`web/src/components/website/quran/quran.css:63`), jeder `.vers-ar` bekommt `tabIndex = 0` (`QuranLeser.tsx:108`). Die Wortspans kommen über den Nachsatz hinzu (`QuranLeser.tsx:114`). Vermutete Ursache: Die Fokus-Navigation erzwingt Stil und Layout je gesperrtem Vers-Teilbaum. Belegt sind die Spurwerte; der Mechanismus ist nicht bewiesen.
- Bei einem Tab schon 1 s nach `load` (`o3/inp-frueh.log`, `o3/spur-quran2.trace.json`): 2008–2296 ms, im keydown 281 Layouts.
- `inp.mjs` sieht das nicht, weil dort zuerst Menü und Escape kommen (Fokus liegt danach auf dem Menüknopf); seine Tab-Werte auf `/quran/2` liegen bei 24–32 ms.

### 4d. Beobachtung ohne Befund
Bei 26 Tabs durch die ganze Seite (`o3/inp-26tabs.log`, `o3/tab-ziele-start.log`, `o3/tab-ziele-start-netz.log`) messen einzelne Tabs auf allen Routen 296–488 ms. Die Verarbeitung dauert dabei 0–5 ms, der Rest ist Darstellungsverzug. Die Spur `o3/spur-start-tabs.trace.json` zeigt nach 5 s keine Aufgabe über 50 ms auf dem Hauptthread und auf keinem Thread über 80 ms. Die Ursache ist ungeklärt, vermutlich der Bildtakt des Headless-Browsers. Nicht als Befund gewertet; im Feld nachprüfen (ML-27 des Vorlaufs).

## 5. CLS
Alle Läufe ≤ 0,001 (Erstbesuch und Wiederbesuch, Tabellen 1 und 2). Erfüllt, auch auf `/quran/2`.

## 6. TBT gegenüber AUSNAHME A-01 des Vorlaufs
A-01 (`_archiv/lauf-gestaltung-2026-10/ABNAHME.md:28–32`, `ENTSCHEIDUNGEN.md:81–125`) bezifferte am Endstand 325c38a (verschränkt 5 Runden, `protokolle/C-lighthouse-v.md`) die TBT-Mediane des Prüflings auf 380–623 ms, davon `/` 521 und `/gebetszeiten` 513 ms (ruhige Stichprobe `C3-lh-ruhig-3500.md`: 596 und 568). E0: 285–458 ms.

| Route | TBT jetzt (Erstbesuch / Wiederbesuch) | Vorlauf-Endstand | Einordnung |
|---|---|---|---|
| / | 234 / 227 | 521 (ruhig 596) | besser |
| /gebetszeiten | 222 / 243 | 513 (ruhig 568) | besser |
| /lernen | 196 / 216 | – (neu) | im Bereich von `/` |
| /quran/1 | 224 / 237 | – (neu) | im Bereich von `/` |
| /hadith/bukhari/1 | 260 / 215 | – (neu) | im Bereich von `/` |
| /elifbe/buchstaben/be | 330 / 199 | – (neu) | im Bereich von `/` |
| /quran/2 | **665** / 568 | – (neu) | über dem höchsten Vorlauf-Median (623) |

- `/quran/2`: Die Spur enthält eine lange Aufgabe von 468 ms aus `2a6dnhpcc1yto.js`, das ist der Nachsatz `reichereAn` (`anreichern.ts`), gestartet über `requestIdleCallback` (`QuranLeser.tsx:114`). Dazu kommen 246 ms aus dem Framework-Chunk (`long-tasks` in `quran_2-lauf1-devtools.report.json`).
- Der Vergleich ist **ungepaart**: Der Vorlauf maß mit zwei Servern verschränkt, jetzt lief ein Server allein. Ein Ausgangsstand-Server ließ sich ohne Serverstart nicht messen.
- Performance-Note jetzt: `/` 94, `/lernen` 95, `/gebetszeiten` 94. Am Vorlauf-Endstand lag sie bei 81–89.

## 7. Urteil Z-08 (Labor-Ersatz)

| Teil | Schwelle | Ergebnis | Status |
|---|---|---|---|
| JS öffentlich | ≤ 180 KB gz je Route | 162,4–179,8 KiB route-eigen auf allen 47 Seiten (Messrouten 162,4–172,9) | erfüllt (Rand: `/islamisches-wissen` 179,8; LH-Kennzahl mit Headern auf 4/7 > 180) |
| LCP | ≤ 2,5 s | `/`, `/lernen`, `/gebetszeiten` ≤ 1,95 s; **`/quran/1` 2508, `/quran/2` 2541, `/hadith/bukhari/1` 4393, `/elifbe/buchstaben/be` 4515 ms**; Wiederbesuch `/quran/2` 2516, `/gebetszeiten` 3747 ms | **verfehlt** (4 von 7) |
| INP | ≤ 200 ms | Werkzeug 7/7 (56–112 ms), Koran-Eingaben ≤ 176 ms; **erster Tab auf `/quran/2` 5,9–6,4 s (CPU 4×), 0,76 s (CPU 1×)** | **teilweise** |
| CLS | ≤ 0,1 | ≤ 0,001 überall | erfüllt |
| Mein Bereich | ≤ 230 KB | 192,1–207,4 KiB (Bauausgabe, kalibriert) | erfüllt; Browsermessung AUSNAHME (Umgebung: ohne Datenbank) |
| TBT nach A-01 | kein Rückschritt | `/` 521 → 234, `/gebetszeiten` 513 → 222; neue Routen 196–330, `/quran/2` 665 | erfüllt für die vergleichbaren Routen; `/quran/2` höher als jeder Vorlauf-Median (neue Route, ungepaart) |

**Gesamt Z-08: teilweise.** Offen sind LCP auf 4 der 7 Messrouten und INP für den Tastaturweg auf `/quran/2`.

Ursachen, so weit belegt:
1. Der Konzept-Hinweis wird nach der Hydrierung erneut gezeigt und wird damit zum LCP (Hadith, Elifbe).
2. Auf den Koranseiten verzögern CSS und Schriften die erste Darstellung (FCP = LCP ≈ 2,5 s).
3. Die Zeitinsel auf `/gebetszeiten` wird erst nach der Hydrierung gesetzt (betrifft den Wiederbesuch).
4. Auf `/quran/2` kostet die erste Fokus-Navigation über 286 Verse mit `content-visibility: auto` Sekunden.

Nebenbefunde:
- Best Practices 96 (Logo-Auflösung).
- Konto-Einstieg `/anmelden` 200,4 KiB gegen „≤ 200 KB“ (AUFTRAG §2.1, nicht Z-08).

## 8. Skripte (nur in `o3/skripte/`, nichts im Repo)
- `js-groesse.mjs`: JS je Route (Playwright)
- `manifest-js.mjs`: JS je Seite aus der Bauausgabe
- `lcp-sonde.mjs` (Datei `lcp-probe.mjs`): LCP-Kandidaten und Dialogzeitpunkte
- `lh-gesehen.mjs`: Lighthouse Wiederbesuch
- `inp-quran.mjs`: INP der Koran-Leser-Eingaben
- `inp-frueh.mjs`: frühe Eingaben; `VERZUG`/`TABS` per Umgebung
- `tab-varianten.mjs`: erste Taste, CPU-Varianten
- `tab-ziele.mjs`: teure Tab-Ziele; `NETZ=1` drosselt das Netz
- `spur-frueh.mjs`: Chrome-Spur mit Auswertung der langen Aufgaben

Repo-Zustand nach der Prüfung: `git status --short` leer; `_gemeinde/protokolle/` unverändert (nur `wortlaut-e2.*`).
