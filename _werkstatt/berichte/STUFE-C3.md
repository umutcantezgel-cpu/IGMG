# Stufe C3 · Endstand 58a3344 mit Nacharbeit bis de91dcd

Messung und Einordnung: Opus (Orchestrator). Die Werkzeuge stehen in `_werkstatt/werkzeuge/`: `endstand.sh`, `stufe-c.sh`, `nachmessung.sh`, `inp.mjs`, `inp-paare.sh`, `lighthouse.mjs`, `funktionsliste.mjs`. Vergleichsbasis ist der Ausgangsstand 9ebb4bc auf Port 3100. Der Prüfling läuft auf 3500 als Standalone-Build mit PGlite-Beispielinhalten.

## 0. Ablauf, Stände, Last

**Endstand-Messung `endstand.sh 58a3344`** (10:48–13:39 UTC, Protokolle 6deda96):
- Build 3500.
- Stufe C 1–3 und 5–11.
- Lighthouse verschränkt, 5 Runden (12 Läufe).
- INP-Paare, 3 Runden.
- E2E-Vollauf, Port 3700.
- Lighthouse und INP liefen erst nach dem Warten auf ruhige Last (1-min < 1,5).

**Nacharbeit aus den Befunden:**

| Commit | Änderung | Anlass |
|---|---|---|
| 4331b03 | SVG `aria-hidden` ausdrücklich | statischer Fehlalarm |
| 01589e8 | Schwärzungs-Platzhalter im E2E-Protokoll | Fehlalarm von `geheimnisse:pruefen` |
| 76eda7a, 466ddfb | Qibla-Kompass erst bei Sichtbarkeit, Symbole vom Server | JS-Budget /gebetszeiten |
| 6e1b46a | Telefonmenü öffnet nach dem nächsten Bild | INP |
| de91dcd | Reiter-Panel per `useDeferredValue` | INP /gebetszeiten |

**Nachmessung:**
- `nachmessung.sh 6e1b46a`: Lighthouse /gebetszeiten, INP-Paare, F-03, Abschluss-Bildsatz mit 3 s Wartezeit, E2E-Teilsuite.
- Auf de91dcd: INP /gebetszeiten verschränkt (5 Runden), F-03, F-01 gepaart, `pnpm release:check` komplett.

**Last:** Der E2E-Vollauf fiel zeitweise mit Diagnose-Spuren zusammen (Last bis 7,5). Die ALTCHA-Wiederholungen liefen deshalb einzeln bei ruhiger Last.

## 1. Z-02 Bestand

**Build und Prüfsuiten**
- Build 3500: grün auf 58a3344, 6e1b46a und de91dcd. `/api/health` 200, Anmeldestand der Verwaltung grün.
- `pnpm check`: grün (Typen, Lint, Unit 811).
- `pnpm release:check`: auf 58a3344 nur in `geheimnisse:pruefen` rot, wegen eines Platzhalters, behoben in 01589e8. Komplett wiederholt auf HEAD, Ergebnis siehe §9.

**Konsole und Statuscodes** (`C-konsole*.log`, `C-statuscodes.txt`)
- Konsole: 25 Routen und tr/en ohne Meldung. Ausnahme ist die 404-Seite mit den erwarteten 2 Meldungen, wie im Ausgangsstand.
- Statuscodes: unbekannte Adressen 404, Hauptansichten 200, Gesundheit 200.

**Funktionsliste F-01…F-24, gepaart 3100 gegen 3500** (`C-funktionsliste-3100/3500.md`): keine Funktion schlechter.
- F-01 wich zunächst ab. Das Werkzeug erwartete noch den Wortlaut „Mehr erfahren“, die Beschriftung ist bewusst „Über uns“ (H-E08). Der Knopf zielt weiter auf `/ueber-uns`. Das Werkzeug prüft jetzt das Ziel, gepaart beide erfüllt (4eff9b8, `C3-funktionsliste-f01-*`).
- F-03 auf de91dcd erfüllt: Tabs, Tastatur, Monatstabelle, Qibla-Kompass sichtbar.
- „Monat wechselt“ ist auf beiden Seiten nicht prüfbar, im Bestand gibt es kein solches Bedienelement.
- F-06, F-07, F-12 und F-21 sind beidseitig gleich, nicht prüfbar mit Grund (Formular-POST verboten, Speichern verboten).

**E2E** (`C3-e2e-altcha.md`)
- Vollauf 58a3344: 562 grün, 61 übersprungen, 7 rot.
- 6 × ALTCHA-Rechenzeit (L-E07, PBKDF2 mit zufälligem Zähler, 8–39 s gegen 20 s im Test). In den Wiederholungen ist jeder der sechs Tests mindestens einmal grün.
- 1 × PWA-offline, ein Umgebungsbefund wie auf 3100.
- E2E-Teilsuite 6e1b46a mit den Menüpfaden (datenschutz, veranstaltungen, suche) und der Gebetszeiten-Verwaltung: 217 grün.

## 2. Z-03 Designsystem

`C-freie-werte.md`: alle seit 9ebb4bc geänderten Dateien in `web/src` (259 Dateien), 107 Funde. Alle 107 gehören zu den Ausnahmen und Fehlalarm-Klassen aus REFERENZ §1:

| Datei | Funde | Einordnung |
|---|---|---|
| `components/verwaltung/styleguide/tokens.ts` | 50 | Styleguide zeigt Token-Werte, Test `styleguide-tokens` |
| `lib/mail/vorlagen/farben.ts` | 25 | Mail-Spiegel, Test `token-spiegel` |
| `lib/seo/og-bild.tsx` | 7 | Satori-Spiegel, Test `token-spiegel` |
| `app/[locale]/layout.tsx` | 1 | `themeColor`, Test `token-spiegel` |
| `app/globals.css` | 19 | 8 Kommentare, 11 Attributselektoren `[data-kategorie]` |
| `lib/mail/vorlagen/Rahmen.tsx`, `index.tsx` | 5 | `margin: 0` und `padding: 0`, Zahl 0 ohne Maß |

Damit ist in jeder geänderten Datei 0 echter freier Wert.

## 3. Z-05 Bewegung

- **Register** (`C-keyframes.txt`, `C-animate-klassen.txt`): 12 Keyframes, alle in KERN K-007 (B-01…B-12). `animate-in`/`animate-out` sind die shadcn-Klassen ohne Plugin, die über B-03 gesteuert werden. `animate-spin` ist der Ladezustand.
- **Momente B-06…B-09** (`C-bildrate-b0*.log`, CPU 4×, je 3 Läufe):
  - B-06: 0 / 0 / 0,8 % verworfen.
  - B-07: 0 / 0 / 0 %.
  - B-08: 0 / 0 / 16,8 %. Der Ausreißer war ein Einzellauf, der Median ist 0 %.
  - B-09: 0 / 0 / 0 %.
  - Grenze ≤ 5 % im Median auf allen vier erfüllt.
- **Zeitbilder** (`C-momente-b0*.log`): alle Momente laufen an und kommen bis 1500 ms zur Ruhe.
- **Reduzierte Bewegung:** sofort im Endzustand (`C-bildsatz-reduziert`, `C-leiste-reduziert-390`).
- **Seitenwechsel B-05:** `vt-status` auf /nachrichten, /veranstaltungen und /; reduziert ohne Überblendung.
- **Erzählansichten mit Scrollen** (`C-bewegung-*.md`): Start, Über uns, Projekte und Organisation je 0 % verworfen bei CPU 4×.

## 4. Z-06 Grafik

`C-svg.md` auf 58a3344: 13 inline-SVG, 1 Befund. Es ist ein statischer Fehlalarm: Das boolesche `aria-hidden` rendert schon `"true"`. Behoben in 4331b03, Nachprüfung `C3-svg-nach.md` mit 0 Befunden. Keine `.svg`-Dateien, lucide bleibt die eine Icon-Familie (K-008).

## 5. Z-07 Zugänglichkeit

- **axe WCAG 2.2 AA** (`C-a11y-390.md`, `C-a11y-1440.md`): 25 Routen × 2 Breiten, 0 Verstöße und 0 „unklar“. Dazu Türkisch 390 und Englisch 1440 ohne Verstoß.
- **Tastatur** (`C-tastatur-390/1440.md`): alle Routen mit Sprunglink, 0 unsichtbare und 0 schwache Fokusse, keine Falle.
- **Telefonmenü** (`C-menue-fokus.json`): Fokus im Kreis, Escape schließt.

## 6. Z-08 Leistung

**Lighthouse mobil verschränkt, 5 Runden auf 58a3344** (`C-lighthouse-v.md`)

| Kennzahl | Ergebnis |
|---|---|
| Paarregel | 11/11 erfüllt |
| A11y, BP, SEO | je 100 |
| LCP | 1,90–2,34 s |
| CLS | ≤ 0,01 |
| Performance 3500 | 82–89 (Ausgangsstand in denselben Runden 80–88) |
| TBT 3500 | 321–583 ms (3100: 368–705 ms) |

- Absolut verfehlt sind Performance ≥ 90 und TBT ≤ 200 ms. Ursache ist der Hydrierungsblock des Frameworks, gleich groß wie im Ausgangsstand (L-E12, Spuren `$SCRATCHPAD/spur/`).
- **JS:** 3500 171,2–181,4 kB gz (3100: 168–174,1). /gebetszeiten lag mit 181,4 über 180. Nach 76eda7a sind es 178,8 kB gz (`C3-lh-gebetszeiten.md`, 5 Läufe). Damit halten alle Hauptansichten das Budget von 180 kB.

**Reaktion auf Eingaben (INP im Labor, L-E12)**

| Stand | Ergebnis | Protokoll |
|---|---|---|
| 58a3344 | 2/11 Routen ≤ 200 ms, „Menü öffnen“ langsamer als 3100 | `C3-inp-58a3344.md` |
| 6e1b46a (Menü öffnet nach dem nächsten Bild) | 10/11 ≤ 200 ms, auf allen Routen besser als 3100, Menü 80–144 ms | `C3-inp.md` |
| de91dcd (Reiter-Panel per `useDeferredValue`) | /gebetszeiten Median 80 ms (3100: 216). Die übrigen zehn Routen sind unberührt (höchstens 144 ms). Alle 11 Hauptansichten ≤ 200 ms | `C3-inp-gebetszeiten.md` |

- Diagnose und Spur: `C3-menue-inp.md`.

**Einordnung:** Die Budgets Reaktion auf Eingaben, LCP, CLS, A11y, BP, SEO und JS sind erfüllt. Performance ≥ 90 ist verfehlt, gekoppelt an die TBT der Hydrierung; der Ausgangsstand verfehlt es unter denselben Bedingungen ebenso. Ruhige Stichprobe (`C3-lh-ruhig-*.md`, je 3 Läufe): 3500 82/83/84, 3100 82/82/84, die Note ist gleichauf. Eingetragen als AUSNAHME A-01 (L-E14) mit Ersatz und Feldprüfung ML-27.

## 7. Z-09 Darstellung

- Bildsätze 390/768/1440: 25 Routen ohne Querscrollen und ohne Befund. Türkisch vollständig (11 Hauptansichten), Englisch 3 Ansichten (`C-bildsatz*.md`).
- Abschluss-Bildsatz der Hauptansichten mit 3 s Wartezeit (`C3-bildsatz-abschluss.md`), damit der Tagesbogen mit Jetzt-Marke im Endzustand steht. Übernommen nach `bilder/abschluss`, Galerie `bilder/galerie.html` (11 Ansichten).

## 8. Z-11 Vercel

- **`vercel build`** in einer Archivkopie von 58a3344, preview und production, ohne DB: beide grün. NFT der OG-Dateien vorhanden, `crons` in der Ausgabe.
- **Produktion:**
  - Zwei Laufzeitfehler (OG-Standardbild, HTML-begrenzte Bots) sind in ce6e6a5 behoben und ohne DB gegengeprüft (`C-produktionsfehler.md`).
  - main → 58a3344 READY in fra1, seitdem 0 Laufzeitfehler (MCP, nur lesend).

## 9. release:check auf HEAD

`pnpm release:check` (C3-release-check, a26c2b8 und Folgecommits ohne Code): **bestanden**.

| Schritt | Ergebnis |
|---|---|
| Typen | grün |
| Lint | grün |
| Unit | 813 |
| Integration | 1412 |
| Sprachen | vollständig: 1203 Schlüssel de/tr/en, 1918 Verwaltung |
| Geheimnisse | ohne Befund |
| `startklar` | übersprungen (ohne DATABASE_URL) |

`startklar` lief in Stufe C 8b gegen die Kopie der Prüflings-Datenbank: Entwicklung grün; in der Produktion stehen nur Menschen-Aufgaben aus, abgeglichen mit MENSCHEN.

## 10. Nicht geprüft und Grenzen

- **UA-01 bis UA-04** gelten weiter: keine echten Geräte, Chromium 141 statt 156, kein Docker. Die Verwaltungsflüsse liefen nur lokal.
- **INP im Labor bei CPU 4×:** strenger als Feld-INP auf Telefonen. Feld-INP gibt es erst nach dem Livegang.
- **F-03-Bilder:** Die Nachmessung auf 6e1b46a schrieb sie in den Standardordner `scratchpad/bilder/e0-funktionsliste` und überschrieb dort die E0-Bilder von F-03. Die E0-Bildsätze in `_werkstatt/bilder/e0` sind davon nicht berührt.
- **Grenzen des Beispielmodus** der Produktion (ADR 0019, Nachtrag 2026-10-12): unbekannte Slugs, Suche mit Begriff, POST ohne `Next-Action`.

## 11. Rohdaten und Belegorte

- `protokolle/C-*`: Endstand 58a3344.
- `protokolle/C3-*`: Nacharbeit und Nachmessung.
- `protokolle/C-endstand.log`, `C-lauf.log`, `C3-nachmessung.log`: Ablauf.
- `$SCRATCHPAD/e2e/endstand-vollauf.log`, `altcha-wdh*.log`, `nachmessung.log`: E2E.
- `$SCRATCHPAD/menue-spur/`: Spuren und Versuch zum Menü-INP.

## 12. Nachtrag: Abschlussprüfung 325c38a (nach Welle H-F)

**Ablauf.** `OHNE_RUHE=1 endstand.sh 325c38a` lief von 17:18 bis 18:35 UTC (`protokolle/C-endstand.log`, `C-lauf.log`): Build 3500, Stufe C 1–3 und 5–11, E2E-Vollauf (Port 3700). Lighthouse und INP wurden nicht neu gemessen. Begründung: Die Welle H-F änderte Klassen, SVG und Texte, aber keine Interaktionslogik. Es gilt der Stand de91dcd (§6). Das JS-Gewicht ist per Kurzprüfung neu erhoben (unten).

| Schritt | Ergebnis 325c38a | Beleg |
|---|---|---|
| 1 Bildsatz de/reduziert/tr/en | 0 Querscrollen, 0 abgeschnittene Texte; Hinweise nur gewollte Kürzungen (Anrisstext mit Zeilenbegrenzung, Brotkrumen am Telefon) | `C-bildsatz*.md` |
| 2 axe, Tastatur, Telefonmenü | 0 Verstöße (25 Routen × 390/1440, tr, en); 0 Fokusbefunde; Fokus im Kreis | `C-a11y-*.md`, `C-tastatur-*.md`, `C-menue-fokus.json` |
| 3 Konsole, Statuscodes | 0 Meldungen außer dem gewollten 404 auf `/gibt-es-nicht` | `C-konsole*.json` |
| 5–6 Seitenwechsel, Momente, Bewegung | B-05 mit Inhalt nach Titel und Bild; Momente im Median 0 % verworfen | `C-vt-*.log`, `C-bildrate-b0*.log`, `C-bewegung-*.md` |
| 7 freie Werte, SVG, Wortlaut | 0 echte freie Werte; 0 SVG-Befunde; Wortlaut 0 offen | `C-freie-werte.md`, `C-svg.md`, `C-wortlaut.md` |
| 8 release:check, startklar | bestanden (unit 814, integration 1412); Produktion nur Menschen-Aufgaben | `C-release-check.log`, `C-startklar-*` |
| 9 Funktionsliste gepaart | 3500: 36 × erfüllt, 0 × nicht erfüllt; 3100: 30 × erfüllt, 5 × nicht erfüllt | `C-funktionsliste-3100.md`, `C-funktionsliste-3500.md` |
| 10 V-02 | `vercel build` preview und production grün | `C-lauf.log` Schritt 10 |
| 11 Register | alle Keyframes im Register K-007 | `C-keyframes.txt` |
| E2E | 563 grün, 6 rot: 4 × ALTCHA (in Wiederholungen grün, L-E07), 1 × PWA-offline (Umgebung), 1 × Kontaktdaten | `$S/e2e/endstand-vollauf.log`, `altcha-wdh3.log` |

**Befund Kontaktdaten.**
- Ursache: Der Test füllte das Feld vor der Hydrierung. React setzt das gesteuerte Textfeld beim Hydrieren auf den Server-Wert zurück. Die Drosselprobe zeigt das in 6 von 6 Fällen.
- Einordnung: Formular und Test sind seit früheren Läufen unverändert, es ist also kein Rückschritt dieses Laufs.
- Behebung: Der Test wartet jetzt, bis das Formular den Wert übernommen hat (3ac362e).
- Das Produktverhalten geht als ML-28 an Menschen (Formularlogik UNANTASTBAR).
- Beleg: `protokolle/C3-e2e-kontakt.md`.

**Abschlussbilder und JS.**
- Hauptansichten mit 3 s Wartezeit nach `bilder/abschluss/`; Momente und Seitenwechsel aus Stufe C; Verwaltung nach `bilder/C3b-verwaltung/`; Galerie neu erzeugt.
- JS-Kurzprüfung (Lighthouse, 1 Lauf × 11 Routen, Last 1,1): 171,3–178,9 kB gz, alle ≤ 180 (`protokolle/C3b-lh-js.md`). Die Einzelläufe der Performance-Note (77–90) sind kein Median. Maßgeblich ist der verschränkte Lauf am Endstand (unten).
- Ablauf: `protokolle/C3b-abschluss-bilder.log`.
