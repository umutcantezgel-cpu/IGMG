# Stufe C · Schlüssel o1 · Z-07 (öffentlicher Teil) und Z-09

Stand: 15.10.2026, 03:20–03:42 UTC. Alle Pfade unten ohne Präfix liegen unter
`/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/o1/`.

## Prüfgegenstand

- Arbeitsbaum `/home/user/IGMG`, Branch `claude/trusting-lovelace-6nfolz`, HEAD 39f03da. `origin/main` = 75cad0a.
  `git diff --stat 75cad0a HEAD -- web` ist leer. Der Web-Code entspricht also genau `main` = 75cad0a. Seit 75cad0a
  wurden nur `_gemeinde/` (Galerie, PRÜFPUNKT) geändert. `git status --short` ist vor und nach der Prüfung leer.
- Server http://localhost:3100: `next start -p 3100` (PID 23172, cwd `/home/user/IGMG/web`), BUILD_ID
  `xOQ7HpptScjBgnAftlR71`, gebaut am 15.10. um 03:14–03:18. Umgebung wie bei einem Vercel-Import: `VERCEL=1`,
  `VERCEL_ENV=production`, `VERCEL_PROJECT_PRODUCTION_URL` gesetzt, **keine** `DATABASE_URL`. `/api/health` antwortet
  `{"status":"fehler"}`, weil keine Datenbank angebunden ist (Beispielmodus).
- Browser: Chromium 141 (`/opt/pw-browsers/chromium-1194`), headless, Node 22.22.0, Playwright 1.64 und
  @axe-core/playwright 4.13 aus `_gemeinde/werkzeuge/node_modules`.
- Den Server habe ich weder gestartet noch gestoppt, und am Repository habe ich nichts geändert.

## Z-07 · Zugänglichkeit (öffentlicher Teil)

### Umfang

`routen-z07.json` umfasst 44 Routen:

- **Deutsch, 29 Routen.** Alle Pflichtrouten aus dem Auftrag: `/`, `/quran`, `/quran/1`, `/quran/2`,
  `/quran/cuz/30`, `/quran/tajwid`, `/hadith`, `/hadith/bukhari`, `/hadith/bukhari/2`, `/hadith/auswahl`, `/lernen`,
  `/elifbe`, `/elifbe/buchstaben/be`, `/elifbe/ueben`, `/gebetszeiten`, `/gebetszeiten/anzeige`, `/kalender`,
  `/ramadan`, `/spenden`, `/quellen`, `/barrierefreiheit`, `/projekte`, `/ueber-uns`. Dazu kommen sechs weitere neue
  Routen: `/hadith/bukhari/10/teil/2`, `/elifbe/buchstaben`, `/elifbe/lektion/1`, `/anmelden`, `/registrieren` und
  `/passwort-vergessen`.
- **Türkisch, 10 Routen:** `/tr`, `/tr/kuran/1`, `/tr/hadis/buhari/2`, `/tr/elifba/harfler/be`,
  `/tr/namaz-vakitleri`, `/tr/ogren`, `/tr/takvim`, `/tr/ramazan`, `/tr/bagis`, `/tr/projeler`.
- **Englisch, 5 Routen:** `/en`, `/en/quran/1`, `/en/learn`, `/en/hadith/bukhari/2`, `/en/prayer-times`.
- `/hatim` und `/newsletter` liefern im Produktionsbau 404, weil ihr Schalter aus ist. Deshalb fehlen sie im Umfang.

### axe (Werkzeug `_gemeinde/werkzeuge/a11y.mjs`, Tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa)

Befehl, je für 390, 768 und 1440:

```
SCRATCHPAD=… node _gemeinde/werkzeuge/a11y.mjs --routen o1/routen-z07.json --breite <B> --basis http://localhost:3100 --protokoll o1/a11y-<B>
```

| Breite | Routen | HTTP | kritisch | ernst | mittel | gering | unklar (Regel×Route) |
|---|---|---|---|---|---|---|---|
| 390×844 | 44 | 44 × 200 | 0 | 0 | 0 | 0 | 16 |
| 768×1024 | 44 | 44 × 200 | 0 | 0 | 0 | 0 | 13 |
| 1440×900 | 44 | 44 × 200 | 0 | 0 | 0 | 0 | 13 |

Protokolle: `a11y-390.{json,md,log}`, `a11y-768.*`, `a11y-1440.*`. In allen 132 Läufen fand axe **keinen einzigen
Verstoß**, und zwar in keiner Schwere.

**Unklar (incomplete).** Diese Fälle betreffen ausschließlich `color-contrast`. Einzelheiten stehen in
`axe-unklar-390.json` (Werkzeug `axe-zusatz.mjs`). axe nennt drei Gründe: der Inhalt ist zu kurz (Ziffern), der Text
liegt auf einem Verlauf (Tajwid-Muster), oder die Fläche ist verdeckt bzw. überlappt (Reiter, Sprungmarken). Ich habe
diese Stellen mit `kontrast.mjs` nachgemessen (`kontrast-stichprobe.log`):

| Stelle | Kontrast |
|---|---|
| `.tj-stumm` | 5,12 bis 5,34 : 1 |
| `.tj-madd` | 7,03 bis 7,32 : 1 |
| Versnummer im Medaillon | 6,75 : 1 |
| Gebetszeiten-Reiter | 15,22 : 1 |
| Lernweg-Stationen | 5,26 : 1 |
| Surenliste (Nummer) | 17,32 : 1 |
| Hadith-Zeilenkopf | 8,49 : 1 |
| Link „Link kopieren“ | 7,68 : 1 |
| Buchnummer (weiß auf `gruen-700` rgb(4,120,87), `aria-hidden`) | 5,48 : 1 (Bild `kontrast-hadith-nummer.png`) |

Alle nachgemessenen Werte liegen bei mindestens 4,5 : 1.

### Zusatz: Zustände, die axe sonst nicht sieht

- **Konzept-Hinweis sichtbar** (Modal beim ersten Besuch), 390 px, auf `/`, `/quran/1`, `/tr` und `/gebetszeiten`. Der
  Dialog ist geöffnet (`dialog`, `aria-labelledby=hinweis-titel`). Ergebnis: 0 Verstöße, 0 unklar
  (`axe-hinweis-390.json`).
- **Mobilmenü geöffnet** (390 px) auf `/`, `/tr` und `/quran/1`: 0 Verstöße, 0 unklar (`axe-menue-390.log`, Skript
  `axe-menue.mjs`).
- **Koran-Wörter nur mit Tastatur** (`koran-tastatur.mjs`, `tastatur/koran-390.json`):

  | Schritt | Ergebnis |
  |---|---|
  | Tab × 9 | Fokus auf `p.vers-ar` von Vers 1, sichtbarer Fokusrahmen `outline: solid 2px rgb(14,57,41)` |
  | Pfeil links | Wort 1, `role=button` |
  | Pfeil links | Wort 2 |
  | Enter | Wortkarte öffnet als `role=dialog` (Popover). Der Fokus liegt in der Karte. axe im offenen Zustand: **0 Verstöße**. |
  | Escape | Die Karte schließt, der Fokus kehrt auf Wort 2 zurück. |
  | Escape | Fokus auf den Vers |
  | Tab | Vers 2 |

  Bilder: `tastatur/koran-tastatur-390-wort.png` und `tastatur/koran-tastatur-390-karte.png`. Code dazu:
  `web/src/components/website/quran/QuranLeser.tsx` Z. 108 (`tabIndex = 0` je Vers), Z. 135–151 (Tasten);
  `Wortkarte.tsx` Z. 165 (`role="dialog"`).

### Nicht in o1 geprüft (Lücke für Z-07 insgesamt)

- Chat und Anwesenheit per Tastatur sowie axe in „Mein Bereich“. Beides braucht eine Anmeldung und eine Datenbank,
  der Server hier läuft aber ohne Datenbank. Diese Teile liegen außerhalb des Schlüssels o1.

## Z-09 · Darstellung

### Bildsatz (Werkzeug `_gemeinde/werkzeuge/bildsatz.mjs`)

Befehl:

```
node bildsatz.mjs --routen o1/routen-z09-{de,tr}.json --aus o1/bildsatz-{de,tr} --max-schirme 8 --schirm-warte 600 --protokoll o1/bildsatz-{de,tr}
```

Je Sprache 29 Hauptansichten: alle neuen Ansichten des Laufs und die Bestandsseiten Start, Veranstaltungen,
Nachrichten, Korankurse, Voranmeldung, Kontakt und Anmelden. Die türkischen Pfade folgen
`web/src/i18n/routing.ts` (z. B. `/tr/kuran/1`, `/tr/hadis/buhari/2`, `/tr/elifba/harfler/be`).

| Sprache | Größen | HTTP | Ausschnitte | horizontal | abgeschnitten (unbeabsichtigt) | beabsichtigte Kürzung | „außerhalb“ |
|---|---|---|---|---|---|---|---|
| de | 87 | 87 × 200 | 469 | **0** | **0** | 9 | 10 |
| tr | 87 | 87 × 200 | 461 | **0** | **0** | 9 | 10 |

- **Beabsichtigte Kürzungen.** Das sind Teaser-Absätze mit Zeilenkürzung auf `/`, `/nachrichten`, `/tr` und
  `/tr/haberler` bei 1440 sowie Veranstaltungsetiketten bei 768. Das Werkzeug hat sie selbst als Kürzung erkannt.
- **„Außerhalb“** sind nur die Reiter „Monatlich/Qibla/Einstellungen“ bzw. „Aylık/Kıble/Ayarlar“ bei 390. Sie liegen
  in der waagerecht scrollbaren Reiterleiste mit Randverlauf (`overflow-x-auto`,
  `web/src/components/website/gebetszeiten/GebetszeitenTabs.tsx` Z. 107–116). Das ist gewollt und kein
  Seitenüberlauf.
- Bilder liegen unter `bildsatz-de/<route>/<B>x<H>/schirm-NN.jpg` und `bildsatz-tr/…`, Zusammenfassungen in
  `bildsatz-de.md` und `bildsatz-tr.md`. Übersichtstafeln, die ich angesehen habe: `tafeln/de-quran_1-390.jpg`,
  `tafeln/de-hadith_bukhari_2-390.jpg`, `tafeln/de-elifbe_buchstaben_be-390.jpg`, `tafeln/de-1440-a.jpg`,
  `tafeln/de-1440-b.jpg`, `tafeln/de-768.jpg`, `tafeln/tr-tr-390.jpg`, `tafeln/tr-tr_kuran_1-390.jpg`,
  `tafeln/tr-tr_hadis_buhari_2-390.jpg`, `tafeln/tr-tr_elifba_harfler_be-390.jpg`,
  `tafeln/tr-tr_namaz-vakitleri-390.jpg`, `tafeln/tr-768.jpg`. Ich fand weder überlappende noch abgeschnittene
  Bereiche.

### Horizontaler Überlauf, eigene Messung (`ueberlauf.mjs`)

Gemessen habe ich 69 Routen: 29 deutsche, 29 türkische und 11 Zusatzrouten (`routen-zusatz.json` mit en-Stichproben
und weiteren neuen de-Routen). Jede Route lief in 3 Breiten und in 2 Bewegungsmodi (`reduce` und `no-preference`),
also **414 Messungen**. Bei jeder Messung habe ich die Seite in Schritten von je einer Viewporthöhe durchgescrollt
(höchstens 40 Schritte) und an jeder Stellung `documentElement.scrollWidth`, `body.scrollWidth` und `clientWidth`
gemessen.

- Ergebnis: **max(scrollWidth − clientWidth) = 0**, und `scrollWidth > clientWidth` kam in **0 von 414** Messungen
  vor. Alle Antworten hatten HTTP 200.
- `overflow-x` steht an `html` und `body` überall auf `visible/visible`. Ein Überlauf würde also nicht durch Abschneiden
  verdeckt.
- Elemente außerhalb von [0, clientWidth]:
  - Honigtopf-Feld in Voranmeldung und Kontakt (de und tr), absichtlich links außerhalb und `aria-hidden`
    (`web/src/components/formular/Felder.tsx` Z. 316).
  - SVG-Teile der Reiter-Symbole in der scrollbaren Gebetszeiten-Reiterleiste bei 390, nachgeprüft mit `svg-raus.mjs`.
    Ihr Behälter ist `div.snap-x` mit `overflow-x: auto` im Bereich x = 17…373.
  - Seitenüberlauf ergibt sich aus keinem der beiden Fälle.
- Dateien: `ueberlauf-{a,b,c,d}.json` und `.log`. Ein erster Lauf am Stück wurde abgebrochen und in vier parallelen
  Teilen neu gestartet; seine Teilergebnisse stehen in `ueberlauf-abgebrochen.log` und sind ebenfalls ohne Befund.

### Harakat (`harakat.mjs`)

Gemessen habe ich 22 Routen mit arabischem Text (de, tr und en) in 3 Breiten, insgesamt **66 Messungen**. Erfasst
wurden **57.965 Textknoten mit arabischen Zeichen** in **61.212 Zeilenfragmenten**.

**Verfahren:**

- Je Textknoten bestimmt `canvas.measureText` im berechneten Schriftsatz die tatsächliche Ober- und Unterlänge der
  Tinte.
- Pro Zeilenfragment (`Range.getClientRects`) habe ich den Tintenkasten gegen jeden Vorfahren mit
  `overflow ≠ visible` oder `contain: paint` geprüft.
- Die Schriften sind geladen: `schriftQuran` (Amiri Quran) und `schriftArabisch` (Amiri).

**Ergebnis:**

- **0 beschnittene Fragmente** auf allen 66 Messungen. Geprüft wurden unter anderem `/quran/1`, `/hadith/bukhari/2`,
  `/elifbe/buchstaben/be`, `/quran/2`, `/quran/cuz/30`, `/quran/tajwid`, `/hadith/bukhari/10/teil/2`, `/tr/kuran/1`,
  `/tr/hadis/buhari/2`, `/tr/elifba/harfler/be` und `/en/quran/1`.
- Kein Seitenüberlauf auf diesen Routen.
- Zeilenhöhe zu Schriftgröße:

  | Element | Verhältnis |
  |---|---|
  | Verse (`p.vers-ar`) | 2,3 |
  | Basmala und Surennamen | 2,2 |
  | Tajwid-Beispiele | 2,2 |
  | Hadith | 2,0 |

  Das entspricht `--text-arabisch-1/2` in `web/src/app/globals.css` Z. 116–121.
- **Kollisions-Kandidaten.** In mehrzeiligen Blöcken ist die Vereinigung aller Tintenhöhen bis zu 1,18 × höher als die
  Zeilenhöhe: Tajwid-Beispielvers 1,17–1,18, Hadith 1,13–1,15, Sure 2 1,11–1,13, Cüz 30 1,08–1,10. Das ist eine obere
  Schranke, denn höchste und tiefste Zeichen müssten genau übereinander stehen. Die Sichtprüfung der dichtesten Blöcke
  bei 2× zeigt **keine Berührung** zwischen Zeilen und keine abgeschnittenen Zeichen.

**Nahaufnahmen,** PNG mit deviceScaleFactor 2, je Seite die ersten 4 arabischen Blöcke:

- Je Seite und Breite liegen sie unter `harakat/<route>/<B>/ar-NN.png`. Tafeln: `harakat/quran_1-390-tafel.png`,
  `harakat/quran_1-1440-tafel.png`, `harakat/elifbe_buchstaben_be-390-tafel.png`,
  `harakat/elifbe_buchstaben_be-1440-tafel.png`.
- Angesehen habe ich: `harakat/hadith_bukhari_2/390/ar-01.png`, `ar-03.png`, `harakat-test/quran_1/390/ar-01.png`,
  `ar-02.png`, `nah/tajwid-waliddat-390.png` (2:233, 12 Zeilen), `nah/quran2-v282-390-oben.png` (2:282),
  `nah/hadith2-1440.png`, `nah/be-koran-390-umfeld.png` und `tastatur/koran-tastatur-390-karte.png`.

### Hinweise ohne Einfluss auf das Bestehen

1. **Hadith-Zeilenhöhe.** Der arabische Hadith-Text nutzt `text-24 leading-loose md:text-30 md:leading-loose`, also
   2,0 (`web/src/components/website/hadith/HadithListe.tsx` Z. 72). Das Token `--text-arabisch-*` aus AUFTRAG §4
   (2,1–2,3) nutzt er nicht. Es gibt weder Beschneidung noch sichtbare Berührung, das Abstandsmaß ist aber das
   knappste von allen.
2. **Koranwort auf der Elifbe-Seite.** „Im Koran entdecken“ auf `/elifbe/buchstaben/be` zeigt das Koranwort [Koranwort, arabisch] in
   `schriftArabisch` (Amiri) statt Amiri Quran. Das kleine Ya (U+06E6) steht dadurch als eigene Glyphe links neben dem
   Wort. Nichts ist abgeschnitten; es ist eine typografische Beobachtung (Bild `nah/be-koran-390-umfeld.png`).
3. **Deutsche Inhalte auf tr-Seiten.** Die tr-Oberfläche ist vollständig türkisch, einzelne Inhalte bleiben aber
   deutsch (Abgleich der SSR-Texte: `tr-html/`):
   - Beispiel-Veranstaltungen und Beispiel-Nachrichten aus Bestandsdaten, die nur deutsch vorliegen. Ich habe
     `web/drizzle/seeds/daten/veranstaltungen.ts` Z. 54–67 geprüft (Commit 7edb4a7 vom 11.10.); die
     Beispiel-Nachrichten habe ich nur in den tr-Seiten gesehen, ihre Quelldatei nicht nachgeschlagen.
   - Die Bildbeschreibung in Über uns (`drizzle/seeds/bereiche/ueber-uns.ts` Z. 77, 2c06edc vom 11.10.).
   - Der Platzhalter `[Bankverbindung – von der Gemeinde]` (`src/lib/validierung/seiteninhalte/projekte.ts` Z. 59).
   - Der Tajwid-Fachbegriff „Idgham mit Ghunna“, bewusst mit `lang="de"` ausgezeichnet (`src/lib/quran/tajwid.ts`
     Z. 36–41, ADR 0030).

   Die Darstellung betrifft das nicht. Es bleiben Inhaltslücken des Bestands und Platzhalter.

### UMGEBUNGSAUSNAHME

Echte Geräte und iOS/Safari standen nicht zur Verfügung. Ersatzbeleg ist Chromium 141 headless mit den drei
Viewports 390×844, 768×1024 und 1440×900, bei den Harakat-Aufnahmen zusätzlich mit deviceScaleFactor 2.

## Verwendete eigene Skripte (alle in o1/, nichts im Repo)

`harakat.mjs`, `ueberlauf.mjs`, `axe-zusatz.mjs`, `axe-menue.mjs`, `koran-tastatur.mjs`, `kontrast.mjs`,
`nahaufnahme.mjs`, `element.mjs`, `svg-raus.mjs`, `tafel.py`, `raster.py`. Sie importieren
`_gemeinde/werkzeuge/hilfen.mjs` (Browser, Kontext mit „Konzept-Hinweis gesehen“, `oeffne`).
