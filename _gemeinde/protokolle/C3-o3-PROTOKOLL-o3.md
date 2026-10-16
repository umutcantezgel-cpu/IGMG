# Stufe C, zweite Nachprüfung · Prüfer o3 · Z-08 Leistung · Stand main = 90a8e37

Prüfzeit 16.10.2026, 10:31–11:34 UTC. Ordner `O=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c3/o3`, Skripte in `O/skripte/`. Alle Pfade unten relativ zu `O`.

## 0. Umgebung und Abweichung

- Arbeitsbaum `/home/user/IGMG`, HEAD = origin/main = 90a8e37 (`git-vorher.txt`, `git-nachher.txt`: `git status --short` vorher und nachher 0 Zeilen). Das lokale `main` zeigt weiter auf die fremde Historie 71e263f; maßgeblich ist `origin/main`.
- **Server 3100 lief nicht** (`curl` → `000` um 10:31 UTC), `scratchpad/bau-import-c3.log` gibt es nicht: Der Umbau-Schritt des Laufs hat nicht stattgefunden (o2 hat dasselbe ab 09:15 UTC festgestellt). `web/.next` im Repo ist der Bau MIT Datenbank des Prüfers k1 (BUILD_ID `hQZX3v2_…`, 08:53), dazu liegen `web/.env` und `web/test-results` von k1 dort. Beides habe ich nicht angefasst.
- **Ersatz, genau der Umbau-Befehl, aber außerhalb des Repos** (`skripte/bau.sh`): `git archive 90a8e37 web` nach `O/baum`, `node_modules` kopiert (Next-Patch `IGMG-Patch` vorhanden), keine `.env`, dann `( . scratchpad/env-import.sh; TMPDIR=… node scripts/vercel-bau.mjs )`.
  - Log `bau-import-c3.log`: „DATABASE_URL fehlt – Bau mit Beispielinhalten“, `[suchindex] 248 Titel, 7580 Hadith-Nummern`, `Generating static pages … (1887/1887)`, `bau rc=0`, BUILD_ID `VT_WqE_FRtp1x-HzYKKSx` (`bau-id.txt`), 10:31–10:34 UTC.
  - Routentabelle zeilengleich mit dem Tor-Bau `scratchpad/bau-import-na2.log` (875 Zeilen, `diff` leer; `rt-na2.txt`, `rt-c3.txt`).
- Start wie `scratchpad/starte-import.sh` (env-import.sh, ohne APP_URL), nur Port 3163 und eigener Ordner (`skripte/starte.sh`, Log `server-3163.log`: „APP_URL fehlt; es gilt die Vercel-Adresse https://igmg-neu.vercel.app“). Prüfung `server-check.txt`: Sitemap mit `https://igmg-neu.vercel.app/`, alle Messrouten 200, `/api/health` 503, `/mein-bereich` und `/anmelden` **404** (seit P3 echtes 404). Vor den Messungen jede Route 2× per curl angewärmt.
- Nach den Messungen: nur meine 4 Prozesse (pnpm, next-server, cwd `O/baum/web`) beendet, 3163 → `000`; `O/baum` (4 GB) und `scratchpad/o3t` gelöscht. Keine fremden Server berührt (es lief keiner außer PostgreSQL/Mailpit der E2E-Umgebung).
- Maschine: 4 Kerne, allein. Last (1 min) 1,3–1,7 während Lighthouse, sonst 0,5–1,3 (Zeilen `uptime` in den Logs). Werkzeuge: Node v24.21.0 (`scratchpad/node24`), Chromium 141 (`/opt/pw-browsers/chromium`), Lighthouse 13.5.0 aus `_gemeinde/werkzeuge/node_modules`.
- Labor-Ersatz wie bisher: lokaler `next start` mit gzip, ohne CDN; Lighthouse „devtools“ (RTT 150 ms, 1,6 Mbit/s, CPU 4×). Felddaten gibt es nicht (UMGEBUNGSAUSNAHME echte Geräte).
- Keine arabische Schrift in diesem Protokoll, keine Geheimnisse ausgegeben.

## 1. Lighthouse mobil, Erstbesuch (3 Läufe, Median, devtools)

```
SCRATCHPAD=O node _gemeinde/werkzeuge/lighthouse.mjs --routen O/routen-z08.json --laeufe 3 --basis http://localhost:3163 --protokoll O/lh-erst
```
Belege `lh-erst.md`, `.json`, `.log` (rc=0), Vollberichte `lighthouse/2026-10-16-10-35/`.

| Route | Perf. | LCP ms (Läufe) | CLS | TBT ms (Läufe) | JS kB | LCP-Element |
|---|---|---|---|---|---|---|
| / | 95 | **1818** (1848 · 1818 · 1803) | 0,001 | 199 (154 · 209 · 199) | 174,8 | Hero-Absatz `p.max-w-text` |
| /quran/1 | 95 | **2213** (2192 · 2213 · 2240) | 0 | 133 (133 · 224 · 128) | 173,6 | `.leser p.rounded-lg` |
| /quran/2 | 93 | **2189** (2189 · 2179 · 2244) | 0 | 211 (234 · 211 · 205) | 173,6 | `.leser p.rounded-lg` |
| /hadith/bukhari/1 | 91 | **1841** (1812 · 1841 · 1863) | 0 | 318 (322 · 318 · 176) | 170,1 | Konzept-Hinweis `p#hinweis-text` |
| /elifbe/buchstaben/be | 94 | **1836** (1829 · 1836 · 1851) | 0 | 221 (191 · 258 · 221) | 168,6 | Konzept-Hinweis |
| /lernen | 95 | **1825** (1825 · 1802 · 1829) | 0 | 208 (208 · 214 · 207) | 166,3 | `p.text-20` |
| /gebetszeiten | 96 | **1839** (1831 · 1839 · 1887) | 0 | 174 (189 · 174 · 165) | 179,3 | Konzept-Hinweis |
| /suche?q=Gebet (neu) | 97 | **1802** (1809 · 1802 · 1796) | 0 | 155 (155 · 96 · 159) | 166,3 | `p#suche-hinweis` |

A11y 100 auf allen 48 devtools-Berichten (Erst- und Wiederbesuch), Best Practices 96 (wie C2). SEO 100, außer `/suche?q=Gebet` (63 bzw. 69): einziger Abzug `is-crawlable`, Ursache `<meta name="robots" content="noindex, follow">` – Trefferseiten der Suche sind absichtlich nicht indexierbar, kein Leistungsthema.

## 2. Lighthouse mobil, Wiederbesuch (`--wiederbesuch`, 3 Läufe, Median)

Belege `lh-wieder.md`, `.json`, `.log` (rc=0; 1 NO_NAVSTART bei simulate wiederholt), Vollberichte `lighthouse/2026-10-16-10-48/`.

| Route | Perf. | LCP ms (Läufe) | CLS | TBT ms (Läufe) | JS kB | LCP-Element |
|---|---|---|---|---|---|---|
| / | 93 | **1804** (1806 · 1800 · 1804) | 0,001 | 271 (271 · 238 · 317) | 174,8 | Hero-Absatz |
| /quran/1 | 92 | **2256** (2257 · 2256 · 2207) | 0 | 241 (258 · 232 · 241) | 173,6 | `.leser p.rounded-lg` |
| /quran/2 | 92 | **2180** (2180 · 2208 · 2173) | 0 | 229 (222 · 229 · 345) | 173,6 | `.leser p.rounded-lg` |
| /hadith/bukhari/1 | 94 | **1829** (1806 · 1829 · 1832) | 0 | 255 (250 · 401 · 255) | 170,1 | `span.text-tinte-2` |
| /elifbe/buchstaben/be | 93 | **1834** (1816 · 1840 · 1834) | 0 | 276 (285 · 267 · 276) | 168,6 | `p.text-18` |
| /lernen | 93 | **1820** (1820 · 1847 · 1800) | 0 | 269 (215 · 269 · 290) | 166,3 | `p.text-20` |
| /gebetszeiten | 94 | **1872** (1914 · 1872 · 1788) | 0 | 240 (231 · 298 · 240) | 179,3 | `span.breite-nach-muster > span` |
| /suche?q=Gebet | 94 | **1785** (1783 · 1797 · 1785) | 0 | 264 (264 · 371 · 203) | 166,3 | `p#suche-hinweis` |

## 3. Vergleich LCP-Median (ms) mit C2-o3 (033ea6f) und NA2-P3

| Route | C2 Erst | **C3 Erst** | C2 Wieder | **C3 Wieder** | NA2-P3 Schluss (Erst) |
|---|---|---|---|---|---|
| / | 1857 | **1818** | 1816 | **1804** | – |
| /quran/1 | 2267 | **2213** | 2241 | **2256** | – |
| /quran/2 | 2205 | **2189** | 2195 | **2180** | – |
| /hadith/bukhari/1 | 1848 | **1841** | 1830 | **1829** | 1828 |
| /elifbe/buchstaben/be | 1876 | **1836** | 1822 | **1834** | – |
| /lernen | 1842 | **1825** | 1815 | **1820** | – |
| /gebetszeiten | 1835 | **1839** | 1830 | **1872** | 1865 |
| /suche?q=Gebet | – | **1802** | – | **1785** | – |

16/16 Mediane ≤ 2500 ms; höchster Einzellauf 2257 ms (`/quran/1`, Wiederbesuch). CLS in allen 48 devtools-Läufen ≤ 0,001.

## 4. JS je Route

- **Vorlauf-Messweise** (Kennzahl „JS kB“ von `lighthouse.mjs`, transferSize der Skripte): 174,8 / 173,6 / 173,6 / 170,1 / 168,6 / 166,3 / 179,3 kB – auf allen 7 Routen **gleich wie C2**; `/suche?q=Gebet` 166,3 kB. 8/8 ≤ 180. `/gebetszeiten` bleibt mit 0,7 kB Luft der Rand.
- **Im Browser bis `load`** (`skripte/js-groesse.mjs`, `js-routen.md`): gzip6 161,5 / 160,3 / 160,3 / 156,8 / 155,3 / 154,1 / 164,8 / 154,1 KiB – zahlengleich mit C2. Die Spalte „NEIN“ bei `/quran/1–2` (182,2/183,3 Summe) entsteht wie in C2 nur durch Prefetch fremder Routen nach `load` (21,9/22,9 KiB).
- **Bauausgabe** (`skripte/manifest-js.mjs` auf `O/baum/web/.next`, `manifest-js.md`, `.json`; Messweise in C2 gegen den Browser kalibriert): 47 öffentliche Seiten 154,1–171,5 KiB (unverändert, größte `/islamisches-wissen`).
- **HTML Al-Baqara:** `curl -H 'Accept-Encoding: gzip' /quran/2` = 86 253 B, `Content-Encoding: gzip` (`server-check.txt`) – ≤ 150 KB.

## 5. Mein Bereich ≤ 230 KB (Bauausgabe, wie vorgegeben)

`manifest-js.md`, Spalte „voll gzip6“ (rootMainFiles + alle entryJSFiles des Seiten-Manifests):

| Seite | C2 (033ea6f) | **C3 (90a8e37)** |
|---|---|---|
| mein-bereich, kinder, gruppen/[id], unterricht, unterricht/[gruppe], moderation | 173,2 | **174,9** |
| benachrichtigungen | 173,7 | **176,0** |
| anwesenheit/[termin] | 175,3 | **177,5** |
| lesezeichen | 176,1 | **178,4** |
| kinder/[id] | 176,9 | **179,3** |
| fortschritt | 177,4 | **179,7** |
| gruppen/[id]/chat | 180,2 | **182,1** |
| konto (größte) | 201,2 | **202,9** |

13 Seiten 174,9–202,9 KiB ≤ 230 (Zuwachs 1,7–2,4 KiB durch Nacharbeit 2, u. a. Hinweis „Neues“ F-38). Kein `lazy(`, `import(` oder `next/dynamic` in `components/{mein-bereich,chat,kinder,konto,unterricht}` und `app/[locale]/(konto)` (`grep` rc=1) – beim Laden kommt kein weiteres JS hinzu. Konto-Einstieg (`/anmelden` usw.) unverändert 191,7–193,9 KiB. Eine Browsermessung angemeldet habe ich nicht gemacht (der Import-Bau hat keine Datenbank, `/mein-bereich` → 404).

## 6. INP (Labor, CPU 4×, 390×844)

### 6a. `inp.mjs`, 3 Läufe (`inp-z08.md`, `.json`, `.log`)

| Route | C3 Median (Läufe) | C2 |
|---|---|---|
| / | 88 (88 · 72 · 88) | 104 |
| /quran/1 | 80 (80 · 64 · 96) | 112 |
| /quran/2 | **96** (96 · 112 · 96) | 160 |
| /hadith/bukhari/1 | 64 (64 · 56 · 64) | 80 |
| /elifbe/buchstaben/be | 72 (64 · 72 · 80) | 88 |
| /lernen | 80 (72 · 128 · 80) | 80 |
| /gebetszeiten | 64 (72 · 64 · 48) | 72 |
| /suche?q=Gebet | 72 (64 · 72 · **296**) | – |

8/8 ≤ 200 ms (Werkzeug: Median der Läufe).

### 6b. Koran-Leser-Eingaben (`skripte/inp-quran.mjs` aus C2, `inp-quran.md`)
Wort antippen + Escape, Tajwid aus/an, Ansicht + Schrift + Lesemodus: `/quran/1` Median 88 ms (96 · 88 · 88), `/quran/2` **128 ms** (104 · 128 · 136; DOM 12 967 Knoten; C2: 168).

### 6c. Hinweis: „Tab ins Suchfeld“ auf `/suche` (neu gemessen, keine Code-Ursache gefunden)
- Der Ausreißer 296 ms auf `/suche?q=Gebet` ist reproduzierbar: 9 weitere Läufe (`inp-suche9.md`) Median 88 ms, 2 von 9 bei 296–304 ms. Betroffen ist immer der **keyup** des Tabs, der den Fokus ins Suchfeld setzt; der keydown derselben Taste dauert 24 ms (`suche-tab-zeit.log`: `keyup@262=312`, Verarbeitung 0–2 ms, Verzögerung 7–9 ms).
- `skripte/tab-ins-feld.mjs` (`tab-ins-feld.log`): Tab ins Suchfeld `/suche?q=Gebet` 296 · 48 · 304 · 24 · 296 · 24 ms, `/suche` 304 · 312 · 24 · 296 · 296 · 304; zum Vergleich Tab ins erste Textfeld `/bildung/voranmeldung` 24–48, `/kontakt` 32–56, alle übrigen Tabs Median 16, max 32 ms. Ohne Mobil-Emulation gleich (24 · 24 · 296 · 32 · 296 · 296).
- Nicht verursacht von `type="search"`, der `transition`-Klasse oder Autocomplete (Gegenproben im DOM, `tab-ins-feld-variante.log`: unverändert wie vorher). `SucheFormular.tsx` ist seit 033ea6f unverändert.
- **Hauptthread frei:** 0 Long Animation Frames im Tab-Abschnitt (`suche-tab-loaf.log`, LoAF wird von Chromium 141 unterstützt). Spur `suche-spur.trace.json` / `suche-spur.log`: Renderer-Bilder je 5–12 ms, Viz meldet von 15 bis 143 ms „Draw skipped / Swap skipped“ (kein Schaden), das nächste angezeigte Bild kommt erst bei 294 ms nach Bildern des Browserprozesses (`CrBrowserMain … BeginCommit` 240–292 ms).
- **Gegenprobe mit `chromium_headless_shell-1194`** (gleiche Engine, ohne Browser-Oberfläche; `tab-ins-feld-headless-shell.log`): Tab ins Suchfeld 16–24 ms in 8/8 Läufen, `/bildung/voranmeldung` 16–32 ms.
- Einordnung: wahrscheinlich ein Präsentationsartefakt des vollen Headless-Chromium (Bild ohne Änderung wird erst mit dem nächsten Bild des Browserprozesses gemeldet), keine blockierte Seite. Werkzeug-Urteil bleibt „≤ 200 ms“; bestätigen sollte das die Feldprüfung nach dem Livegang (ML-27).

## 7. Erster Tab (CPU 4×, 390 px, Merker gesetzt, 3 Läufe)

`skripte/erster-tab.mjs` = Kopie von `stufe-c2/endpruefer/skripte/erster-tab.mjs`, einzige Änderung: Basis über `BASIS` (`diff` siehe Kopfzeile). Beleg `erster-tab-cpu4.log`; Dauer des ersten keydown in ms:

| Route | C2 (033ea6f, o3 / Endprüfer) | NA2-P3 Schluss | **C3 (90a8e37)** | ≤ 200 |
|---|---|---|---|---|
| /hadith/bukhari/56 | 992 · 1112 · 1112 / 968 · 1048 · 928 | 16 · 24 · 16 | **32 · 24 · 24** | ja |
| /hadith/bukhari/56/teil/2 | 1200 · 1296 | 24 · 24 · 24 | **16 · 32 · 24** | ja |
| /hadith/bukhari/1 | Median 160 (128–208, 8 Läufe) | 40 · 24 · 16 | **24 · 24 · 32** | ja |
| /quran/2 | 32–40 | 80 · 64 · 40 | **40 · 40 · 40** | ja |

In allen 12 Läufen Status 200, kein offener Dialog, Fokus auf dem Sprunglink `a.sr-only`.

Zusätzlich:
- Weitere Seiten mit 100 Karten und andere Sprachen (`erster-tab-zusatz-cpu4.log`, je 2 Läufe): `/hadith/bukhari/65/teil/4` 24 · 16, `/hadith/bukhari/97` 32 · 24, `/tr/hadith/bukhari/64/teil/5` 24 · 24, `/en/hadith/bukhari/23` 24 · 32 ms.
- Varianten auf 56 und 56/teil/2 (`skripte/tab-varianten.mjs`, `tab-varianten-cpu4.log`): Umschalt+Tab als erste Taste 16–40 ms → letzter Fußzeilenlink „Quellen“; Erstbesuch Escape 40–88 ms, dann Tab 24–32 ms → Sprunglink; zweiter Tab 16–24 ms → „IGMG Wetzlar“ (der Browser navigiert danach normal weiter).
- Code: `web/src/components/website/hadith/BuchAnsicht.tsx:3`, `:65` bindet `ERSTER_TAB` (`web/src/components/website/erster-tab.ts:16`) ein; `BuchAnsicht` rendert Buch- und Teilseiten (`app/[locale]/(website)/hadith/bukhari/[buch]/page.tsx:51`, `…/teil/[teil]/page.tsx:51`). In der Bauausgabe enthalten alle 399 Hadith-Buch- und Teilseiten (133 je Sprache de/tr/en) das Skript (`grep checkVisibility`); 32 de-Seiten haben 100 Karten, 70 mindestens 50 (`hadith-karten-je-seite.txt`, Zählung `id="h-…"`).

## 8. TBT gegenüber A-01 des Vorlaufs

A-01 (`_archiv/lauf-gestaltung-2026-10/ENTSCHEIDUNGEN.md:81-125`): TBT-Mediane des Prüflings am Vorlauf-Endstand 380–623 ms (`/` 521, `/gebetszeiten` 513), E0 285–458.

| Route | C3 Erst / Wieder | C2 Erst / Wieder |
|---|---|---|
| / | 199 / 271 | 329 / 428 |
| /quran/1 | 133 / 241 | 355 / 354 |
| /quran/2 | 211 / 229 | 307 / 365 |
| /hadith/bukhari/1 | 318 / 255 | 279 / 337 |
| /elifbe/buchstaben/be | 221 / 276 | 386 / 390 |
| /lernen | 208 / 269 | 302 / 390 |
| /gebetszeiten | 174 / 240 | 336 / 401 |
| /suche?q=Gebet | 155 / 264 | – |

- Alle 16 Mediane (133–318 ms) liegen unter dem niedrigsten Vorlauf-Median (380 ms): kein Rückschritt gegenüber A-01. Die Werkzeug-Schwelle TBT ≤ 200 erreichen 4 von 8 Routen im Erstbesuch und 0 von 8 im Wiederbesuch – gedeckt durch A-01. Performance-Note jetzt 91–97 (Erst) bzw. 92–94 (Wieder); C2: 88–93 / 87–91.
- Vergleich ungepaart (`lh-vergleich-erst.md`, `lh-vergleich-wieder.md`, `skripte/lh-vergleich.py` aus C2): `benchmarkIndex` jetzt 2086–2664, in C2 1800–2120 – die Maschine war heute schneller. Weniger und kürzere lange Aufgaben (Erstbesuch 4–6, längste 176–237 ms; C2 5–9, 240–297 ms) gehen deshalb nicht sicher auf den Code zurück. `/hadith/bukhari/1` Erstbesuch 318 ms (C2 279) liegt in der Streuung (Läufe 322 · 318 · 176).

## 9. Urteil Z-08 (Labor-Ersatz)

| Teil | Schwelle | Ergebnis | Status |
|---|---|---|---|
| JS öffentlich | ≤ 180 KB gz | Vorlauf-Messweise 166,3–179,3 kB auf 8/8 Routen; bis load 154,1–164,8 KiB; Bauausgabe 47 Seiten 154,1–171,5 KiB | erfüllt (Rand `/gebetszeiten` 179,3) |
| LCP | ≤ 2,5 s | Erst 1802–2213, Wieder 1785–2256 ms, 16/16; max. Einzellauf 2257 | erfüllt |
| CLS | ≤ 0,1 | ≤ 0,001 in 48/48 | erfüllt |
| INP | ≤ 200 ms | `inp.mjs` 8/8 mit 64–96 ms; Koran-Leser `/quran/2` 128; erster Tab 16–40 ms auf allen 4 Pflichtrouten und 4 Zusatzseiten | erfüllt (Hinweis 6c) |
| Mein Bereich | ≤ 230 KB | Bauausgabe 174,9–202,9 KiB (13 Seiten), ohne nachgeladenes JS | erfüllt (Messweise Bauausgabe wie vorgegeben) |
| TBT nach A-01 | kein Rückschritt | 133–318 ms, alle unter dem Vorlauf-Bereich 380–623 | erfüllt (ungepaart, schnellere Maschine) |

**Gesamt Z-08: erfüllt** (Labor-Ersatz; TBT-Schwelle 200 ms und Performance-Note weiter über AUSNAHME A-01; Felddaten nach dem Livegang über ML-27).
- Der einzige offene Punkt aus C2, der erste Tab auf Hadith-Seiten mit 100 Karten (928–1296 ms), ist behoben: jetzt 16–32 ms bei CPU 4×.
- Hinweis (niedrig): „Tab ins Suchfeld“ auf `/suche` misst im vollen Headless-Chromium in rund der Hälfte der Läufe ~300 ms, ohne Arbeit des Hauptthreads, mit dem Headless-Shell 16–24 ms (6c).
- Für den Orchestrator: Der Umbau auf Port 3100 hat nicht stattgefunden; `web/.next`, `web/.env` und `web/test-results` von k1 liegen noch im Repo-Ordner (in git ignoriert, `git status` leer).
