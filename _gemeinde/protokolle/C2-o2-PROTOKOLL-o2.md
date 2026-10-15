# Stufe C, Nachprüfung: Prüfer o2 zu Z-03, Z-05, Z-06 (Kurzcheck) und Z-09 (Kurzcheck)

**Stand und Umgebung**

- Zeit: 15.10.2026, 17:16–17:50 UTC.
- Geprüfter Stand: `main` = 033ea6f. Im Arbeitsbaum steht HEAD auf 38440af. `git diff --stat 033ea6f HEAD` zeigt nur `_gemeinde/PRUEFPUNKT.md`, `web/` ist also gleich 033ea6f.
- Server: http://localhost:3100 mit `next start -p 3100` (next-server 16.4.0, Prozessstart 17:16, Arbeitsordner `/home/user/IGMG/web`).
  - `web/.next/BUILD_ID` ist vom 15.10. 17:14:29, also nach dem Commit 033ea6f (15:47).
  - Es ist der Produktionsbau wie bei einem frischen Vercel-Import, im Beispielmodus ohne Datenbank.
- Werkzeuge: Node v22.22.0 (`$HOME/.local/bin`), Playwright aus `_gemeinde/werkzeuge/node_modules`, Chromium 141 (`/opt/pw-browsers/chromium-1194`).
- Last: 0,15–1,67 auf 4 Kernen. Andere Prüfer liefen nicht gleichzeitig mit Chromium.
- Am Repository wurde nichts geändert: `git status --short` ist leer, in `_gemeinde/protokolle` gibt es keine neue Datei.

Ordner `O` = `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/o2/`. Skripte liegen unter `O/skripte/`.

---

## Z-03 Designsystem: erfüllt (0 freie Werte in geänderten Dateien)

**Befehl**

```
git diff --name-only b702c7c..033ea6f -- web/src                     > O/z03-dateien-alle.txt   (633)
git diff --name-only --diff-filter=ACMR b702c7c..033ea6f -- web/src  > O/z03-dateien.txt        (628)
node _gemeinde/werkzeuge/freie-werte.mjs $(cat O/z03-dateien.txt) --protokoll O/z03-freie-werte
node O/skripte/z03-einteilen.mjs O/z03-freie-werte.json              > O/z03-einteilung.out
```

- Die 5 gelöschten Dateien (QuranAnsicht, QuranUebersicht, stand.ts, StandHinweis, SurenKacheln) lassen sich nicht einlesen. Mit der ungefilterten Liste bricht das Werkzeug mit ENOENT ab (rc=1). Deshalb wurde mit ACMR gemessen.
- Ergebnis: **623 geprüfte Dateien, 145 Funde.** Davon sind 65 Hex-Werte, 48 Klammerwerte, 29 px-Literale im Stil und 3 Farbfunktionen.
- Die Funde wurden nach REFERENZ §1 eingeteilt (`_archiv/lauf-gestaltung-2026-10/pakete/REFERENZ.md:33-45`, belegte Ausnahmen und Fehlalarm-Klassen):

| Klasse | Anzahl |
|---|---|
| Belegte Ausnahme: `styleguide/tokens.ts` (Test styleguide-tokens) | 56 |
| Belegte Ausnahme: `mail/vorlagen/farben.ts` (Test token-spiegel) | 25 |
| Belegte Ausnahme: `seo/og-bild.tsx` (Satori) | 7 |
| Belegte Ausnahme: `[locale]/layout.tsx:27` themeColor | 1 |
| Fehlalarm, regulärer Ausdruck in .ts: audio/direkt, speicher, cms/slugs, ziele, medien/direkt, quran/tanzil, actions besondere-tage, hatim, newsletter | 28 |
| Fehlalarm, Attributselektor: `globals.css:1007-1017`, `quran.css:138/141` | 13 |
| Fehlalarm, Kommentar: `globals.css:122-146, 267, 316` | 8 |
| Fehlalarm, Zahl 0 im Mailstil: `Rahmen.tsx:39/40/80`, `index.tsx:63/83` | 5 |
| Fehlalarm, rootMargin: `QiblaKompassBeiBedarf.tsx:35` | 1 |
| Fehlalarm, neu (N1), Bildattribute: `Header.tsx:71` | 1 |
| **frei** | **0** |

**Zum neuen Fehlalarm `Header.tsx:71`:** Dort steht `bildAttribute({ …, width: 32, height: 32 })`. Das sind die HTML-Attribute `width`/`height` eines `<img>`, also die Eigenmaße für das Seitenverhältnis, und kein Stil. Angezeigt wird das Bild über die Token-Klasse `size-8` (`KopfMenues.tsx:93`, `MobilMenue.tsx:280`). Eine Fehlalarm-Klasse in REFERENZ §1 gibt es dafür nicht. Das ist nur ein Hinweis, kein Fund.

**Gegenprobe zu den 27 freien Werten der ersten Prüfung**

- In `web/src` (.ts/.tsx, ohne Tests) kommen folgende Muster 0-mal vor: `30rem`, `17rem`, `8.25rem`, `@min-[`, `min-h-[calc`, `text-[length`, `text-[calc`, `[mask-image`, `[scrollbar-width`, `webkit-details-marker]` und `transition-[stroke`.
- `grid-cols-[` kommt noch 3-mal vor, aber nur in Dateien, die seit b702c7c unverändert sind: `ui/alert.tsx:6` und `verwaltung/(geschuetzt)/medien/[id]/page.tsx:38,66`.
- Die Werte sind durch Utilities in `globals.css` ersetzt (Commit 0f26433). Die Maße kommen aus der Abstandsskala `--spacing(n)`:
  - `raster-kleinkacheln`: `globals.css:166`
  - `raster-formularspalte`: `globals.css:186`
  - `min-h-zeilen-*`: `globals.css:192`
  - `auslauf-*`: `globals.css:198`
  - `leiste-breit`: `globals.css:210`
  - `buchstabe-form`: `globals.css:223`
  - `kennzahl-fliessend`: `globals.css:229`
  - `transition-strich`: `globals.css:454`
- Verwendet werden sie zum Beispiel in `MeinBereichRahmen.tsx:88` (`lg:raster-seitenleiste`) und `KontoEinstieg.tsx:61` (`lg:raster-formularspalte`).
- Im Systemsinn bleiben zwei Restmaße in `globals.css`, beide sind im Kommentar hergeleitet: `21rem` in `leiste-breit` (332 px Werkzeugleiste) und `+ 2px` (Rand) in `min-h-zeilen-*`.

**Zusammenhang, nicht Teil des Kriteriums**

- Über ganz `web/src` (933 Dateien) findet das Werkzeug 370 Funde, davon 225 nach Einteilung „frei“. Ausgabe: `O/z03-freie-werte-gesamt.*` und `O/z03-einteilung-gesamt.out`.
- Diese 225 liegen alle in 22 Dateien, die seit b702c7c unverändert sind (`comm` mit `O/z03-dateien.txt`: leer). Es ist der Bestand aus der Zeit vor dem Lauf, vor allem shadcn-`ui/*`.

**Tests:** `pnpm exec vitest run --project unit` mit token-spiegel, styleguide-tokens und bewegung-regeln ergibt **3 Dateien, 123 Tests grün** (`O/unit-regeln.log`).

---

## Z-05 Bewegung: erfüllt

**Register gegen Code**

- B-01…B-12 stehen in `_archiv/lauf-gestaltung-2026-10/KERN.md:60-71`, B-01/B-07/B-08 als Fortschreibung und B-13…B-27 in `_gemeinde/KERN.md:53-70`.
- Die beiden Doku-Fehler aus der ersten Prüfung sind behoben:
  - `KERN.md:3` verweist jetzt auf `_archiv/…/KERN.md`.
  - `KERN.md:68` beschreibt B-25 als umgesetzt (`AnzeigeLive.tsx:46,49`).
- Alle genannten Dateien und Bezeichner sind vorhanden (`O/z05-register-code.txt`, 50 Prüfungen). Beispiele:
  - `globals.css:446` `@utility druck`, mit Skalierung nur in `@media (prefers-reduced-motion: no-preference)` (Z. 447-451)
  - `globals.css:534` `schublade`
  - `SeitenUebergang.tsx:79/85`
  - `Zeitleiste.tsx:44/55`
  - `Meilensteine.tsx:106/124`
  - `quran.css:312/324` `regel-schublade`/`regel-blatt`
  - `Uebungen.tsx:24`
  - `HatimRing.tsx:8`
  - `FastenbogenLive.tsx:9/14/129`
  - `ChatFenster.tsx:300` `tritt-auf`
  - `AnwesenheitErfassen.tsx:94/114`
  - `Weg.tsx:58/76/87`
  - `KursWeg.tsx:18`
  - `OfflineSpeichern.tsx:33/34` (`transition-strich`, `motion-reduce:transition-none`)
  - B-12 `LadeStern` liegt in `Zustandsgrafik.tsx:99`.
- Kleine Ungenauigkeit im Register: Laut B-21 steht die Nadeldrehung in `MeinOrtRechner.tsx`. Die Klasse `transition-transform duration-(--dauer-moment) … motion-reduce:transition-none` steht aber in `QiblaKompassAnsicht.tsx:92`; `MeinOrtRechner.tsx:365` setzt nur `nadelDreht`. Die Wirkung stimmt.
- Block für reduzierte Bewegung: `globals.css:772-809` setzt `animation: none` für Linien und Marken, Auftritte auf `einblenden` und alle Dauern auf 0,01 ms; dazu `quran.css:419`.
- CSS-Regeln mit `:hover`, `:active` oder `:focus` ändern nur Farbe und Umriss (`quran.css:101/138/141/402/406`, `globals.css:383/387/393`). Die einzige Ausnahme ist `druck` (Z. 448, nur bei no-preference).

**Quelltext**

| Muster | Zählung |
|---|---|
| `active:scale-*` | 0 (vorher 146) |
| Token `druck` | 146 in 106 Dateien |
| `group-hover:translate` ohne `motion-safe:` | 0 |
| `motion-safe:group-hover:translate-x-1` | 6 |

**Regeltest:** `pnpm exec vitest run --project unit tests/unit/bewegung-regeln.test.ts --reporter=verbose` ergibt **4/4 grün** (`O/unit-bewegung-regeln.log`).
- Die Prüfung greift: mehr als 300 Quellen, mehr als 100 `druck`.
- Kein `active:scale-*`.
- Keine Größe oder Lage auf Hover, Fokus oder Druck ohne `motion-safe:`.
- `druck` skaliert nur bei no-preference.
- Grenze des Tests: Er liest nur .ts/.tsx und den `druck`-Block. Die übrigen CSS-Zustandsregeln wurden von Hand geprüft (siehe oben).

**Laufzeit: Druck und Hover bei `reducedMotion: 'reduce'`**

Skript `O/skripte/z05-druck.mjs`, Ausgabe `O/z05-druck.out`, Rohdaten `O/z05-druck.json` (arabische Namen dort neutral ersetzt), Auszug `O/z05-druck-auszug.txt`.

- **Routen:** `/`, `/gebetszeiten`, `/quran`, `/hadith`, `/lernen`, je 1440×900 und 390×844.
- **Auswahl:** die sichtbaren `.druck`-Elemente, zuerst die in `main` (höchstens 8 je Route), dazu die Pfeile mit `group-hover:translate`.
- **Messung:** `getComputedStyle` (`scale`, `transform`, `translate`) und `getBoundingClientRect`, jeweils in Ruhe, unter Hover und gedrückt.
  - Gedrückt heißt `mouse.down`; das Skript prüft mit `el.matches(':active')`, dass der Zustand wirklich anliegt.
  - Klicks werden über eine Sperre an `window` (Capture) abgefangen, die per `addInitScript` vor `SeitenUebergang` registriert ist. So gibt es keine Navigation; navigiert wurde 0-mal, Fehler gab es 0.

| Modus | Elemente | `:active` | `scale` gedrückt | Größe ändert | Lage ändert | Pfeile: Lage unter Hover |
|---|---|---|---|---|---|---|
| reduce | 60 | 60 | `none` (60/60) | 0 | 0 | 0 von 4 |
| no-preference (Gegenprobe) | 60 | 60 | `0.98` (60/60) | 60 | 60 | 4 von 4 (`translate: 4px`) |

- **Beispiel `/gebetszeiten`, 1440:** `#gz-tab-monat` bleibt bei reduzierter Bewegung gedrückt 147,19 × 48 px mit `scale none`. Bei der ersten Prüfung waren es 144,2 px mit `0.98`. Ohne Vorliebe misst der Knopf 144,24 × 47,04 px bei `0.98`.
- **Pfeile `/hadith`:** Bei reduzierter Bewegung bleibt x = 663 bzw. 1315 und `translate none`. Ohne Vorliebe ergibt sich x + 4 und `translate 4px`.
- **Hover-Sweep über alle Links und Knöpfe in `main`** (`O/skripte/z05-hover.mjs`, `O/z05-hover.out`): 7 Routen bei 1440 (`/`, `/gebetszeiten`, `/quran`, `/hadith`, `/lernen`, `/veranstaltungen`, `/projekte`) mit 74 Elementen. Verglichen wurden Rechteck sowie transform, translate, scale und rotate von Element und allen Nachfahren.
  - reduce: **0 Änderungen**
  - no-preference: 2 Änderungen, genau die beiden Hadith-Pfeile (Gegenprobe)

**Bildrate der Momente in Ruhe**

`O/skripte/z05-bewegung.sh` startet `bewegung.mjs --dauer 2000` mit denselben 11 Routen wie in der ersten Prüfung: `/`, `/ueber-uns` (scrollen), `/projekte` (scrollen), `/organisationen/ana-teskilati`, `/elifbe/buchstaben/elif`, `/quran`, `/lernen`, `/elifbe`, `/bildung/korankurse` (scrollen), `/gebetszeiten` und `/ramadan`. Last je Lauf 0,15–1,67. Ausgabe `O/z05-bewegung.out` und `O/z05-bewegung-*.md/.json`, Bilder `O/bilder/bewegung-*/`.

- **Bildrate:** Auf allen 11 Routen werden **0 % der Bilder verworfen**, ohne Drosselung und bei CPU 4×, mit 121–122 Bildern in 2 s, 0 langen Abständen und einem Median von 16,7 ms.
  - Schwelle ≤ 5 %: erfüllt.
  - Die Ausreißer der ersten Prüfung unter Fremdlast (korankurse 11,6 %, ramadan 6,6 % bzw. 4,9 %) treten in Ruhe nicht auf.
- **Die Momente liefen während der Messung:** Bei 0 ms waren auf `/` 9 Animationen aktiv, auf `/elifbe` 18, auf `/lernen` 8, auf `/gebetszeiten` 25 und auf `/bildung/korankurse` 5.
- **Reduzierte Bewegung, alle 11 Routen:**
  - 0 laufende Animationen
  - 0 Keyframes mit Lage oder Größe
  - größte Lageänderung 0 px
  - 0 Elemente mit Deckkraft 0, auch nach dem Scrollen

---

## Z-06 Grafik (Kurzcheck): erfüllt

**Statische Prüfung:** `node _gemeinde/werkzeuge/svg-pruefung.mjs --protokoll O/z06-svg` endet mit rc=0 (`O/z06-svg.out/.md/.json`).
- Ergebnis: 0 `.svg`-Dateien, 41 Inline-`<svg>`, **Fehler 0** (weder doppelte IDs noch `<image>`), Befund 15, OK 26. Das ist dasselbe Bild wie bei 75cad0a.
- Die 15 Befunde wurden nachgeprüft:
  - **10 × Kurzform `aria-hidden`.** Das Werkzeug erkennt nur `="true"` (`svg-pruefung.mjs:51`, unverändert seit 550ad03). Fundstellen: Kinderzugang:213, Lernweg:115, AnwesenheitErfassen:107, FortschrittErfassen:31, verwaltung/koran/Teile:88, SchreibwegSteuerung:75/94, UebenStart:93, Uebungen:22 und Weg:48.
  - **4 × Elternelement mit `aria-hidden`:** Lernweg.tsx:24, QiblaKompassAnsicht 55-58, BuchStern 36-44 und KursWeg 52-56.
  - **1 × `role="progressbar"` mit `aria-label`:** OfflineSpeichern.tsx.

**Laufzeit** (16 Routen × 3 Breiten, `O/z09-ueberlauf-*.json`, Feld `svg`)
- Jedes SVG auf oberster Ebene ist entweder in `aria-hidden` oder mit Rolle und Name versehen (Tagesbogen, Elifbe, Gebetszeiten). Ungeklärt sind **0**.
- **Doppelte IDs im DOM: 0** in allen 48 Messungen.

**Eine Icon-Familie:** In `web/package.json:60` steht nur `lucide-react` 1.55.0. Es gibt 285 Dateien mit Lucide-Import und 0 Importe aus anderen Icon-Bibliotheken.

---

## Z-09 Darstellung (Kurzcheck): erfüllt (UMGEBUNGSAUSNAHME echte Geräte/iOS)

Skript `O/skripte/z09-ueberlauf.mjs`:
- Jede Seite wird geladen, dann in 600-px-Schritten bis ans Ende gescrollt, dann zurück nach oben.
- Gemessen werden `documentElement.scrollWidth`/`clientWidth` und `body.scrollWidth`/`clientWidth`.
- Dazu kommen sichtbare Elemente, die über den Rand ragen und keinen Vorfahren mit `overflow-x` ungleich visible haben.
- Breiten: 390×844, 768×1024 und 1440×900, einmal mit `no-preference` und einmal mit `reduce`.

**10 Hauptrouten:** `/`, `/gebetszeiten`, `/veranstaltungen`, `/ueber-uns`, `/projekte`, `/bildung/korankurse`, `/kontakt`, `/quran/2`, `/hadith/bukhari/1` und `/elifbe/buchstaben/elif`.
**6 zusätzliche Routen:** `/quran`, `/hadith`, `/lernen`, `/nachrichten`, `/organisationen/ana-teskilati` und `/tr/namaz-vakitleri`.

**Ergebnis**
- Alle Routen liefern HTTP 200.
- Hauptrouten: **30 Messungen, 0 Überlauf, max(scrollWidth − clientWidth) = 0**.
- Alle Routen: 48 Messungen, 0 Überlauf, jeweils in beiden Modi (`O/z09-ueberlauf-no-preference.out`, `O/z09-ueberlauf-reduce.out`).
- Einziges Element außerhalb des Rands: auf `/kontakt` das Honigtopf-Feld `div.absolute.-left-full.h-px` (`components/formular/Felder.tsx:316`, `aria-hidden`, 1 px). Es liegt links vom Ansichtsfenster und erzeugt keinen waagerechten Scrollbereich.

**Bilder des ersten Schirms bei 390:** `O/bilder/z09/<route>-390.jpg`, 10 Stück. Angesehen habe ich `gebetszeiten-390.jpg`, `quran_2-390.jpg` und `kontakt-390.jpg`. Keines zeigt seitlichen Überlauf. Die Reiterleiste auf `/gebetszeiten` ist eine gewollte Wischreihe mit Auslauf.

**Nicht geprüft (UMGEBUNGSAUSNAHME):** echte Geräte und iOS/Safari (MN-19).
