# BERICHT – Letzter Lauf

Morgenberichte (höchstens 20 Zeilen, du-Anrede, ohne Fachjargon) und am Ende der Schlussbericht mit Vorher-Nachher-Galerie (`_werkstatt/bilder/galerie.html`).

## Morgenbericht · Montag, 12. Oktober 2026, 07:00 Uhr

**Fertig seit gestern Abend**
- Fünf frische Prüfer haben alle Hauptansichten bewertet (Mittel 7,2 von 10, vorher 6,3). Aus ihren Hinweisen sind 13 Verbesserungspakete entstanden. Alle sind gebaut und abgenommen, mit Noten von 8 bis 8,5.
- Auf dem Telefon sind die Listen deutlich ruhiger. Die Veranstaltungsseite ist jetzt ein Drittel kürzer (`bilder/H-C03/abnahme-veranstaltungen-390.jpg`).
- Die Kopfbereiche der Veranstaltungs- und Nachrichtenseiten zeigen jetzt Bild und Organisationslogo (`bilder/H-C02/abnahme-nachricht-1440.jpg`).
- Kontakt, Korankurse und Organisationsseite sind aufgeräumt: weniger Kästen, klarere Überschriften (`bilder/H-C06/abnahme-kontakt-1440.jpg`, `bilder/H-C05/abnahme-ana-1440.jpg`).
- Die Gebetszeiten auf dem Telefon sind kompakter (`bilder/H-C09/abnahme-gebetszeiten-390.jpg`).
- Startseite und Projekte waren auf schwachen Telefonen etwas langsamer als vorher. Die Ursachen sind gefunden und behoben. Gemessen wird gleich in Ruhe.
- Die Website im Netz (`igmg-five.vercel.app`) zeigt den Stand von 05:40 Uhr. Sie läuft ohne Fehler.
- Die Liste „Was nur ein Mensch tun kann“ steht jetzt in der richtigen Reihenfolge bis zum Livegang (`_werkstatt/MENSCHEN.md`, rund 11 Stunden Arbeit, verteilt auf Vorstand und Technik).

**Stand der Kriterien:** 0 von 12 abgehakt. Abgehakt wird erst nach der Schlussprüfung. Gestaltung, Bewegung, Grafik, Vercel und Recht sind gebaut, Leistung wird nachgemessen.

**Als Nächstes:** Schlussprüfung aller zwölf Kriterien (Bilder in drei Größen, Zugänglichkeit, Tastatur, Leistung, Sprachen Deutsch, Türkisch, Englisch, Vercel-Bau), dann der Schlussbericht mit Vorher-Nachher-Galerie.

**Bitte prüfen oder entscheiden**
- Die Logos der Organisationen gibt es nur sehr klein und mit weißem Grund. In kleinen Größen sind sie kaum zu erkennen. Gibt es größere Dateien (MENSCHEN M-015, M-016)?
- Die Entfernung Wetzlar–Kaaba ist ausgeblendet, bis jemand sie mit Quelle liefert (ML-25).

## Schlussbericht · Montag, 12. Oktober 2026

**Ergebnis in drei Sätzen**
1. Die Website der IGMG Wetzlar hat ein geschärftes, eigenes Erscheinungsbild:
   - ruhige Bewegung nach festen Regeln;
   - ein Formsystem aus dem Achtstern;
   - vier große Momente aus echten Inhalten: Tagesbogen der Gebetszeiten, Weg der Gemeinde, Projekt-Meilensteine, Familie der vier Organisationen.
2. Alle zwölf Hauptansichten und zwanzig weitere Ansichten sind überarbeitet. Unabhängige Prüfer haben sie in vier Runden bewertet: Das Mittel stieg von 6,3 auf 7,7 von 10, und im Blindvergleich ziehen sie den neuen Stand überall dem alten vor. Das Spitzenziel 8 je Ansicht ist nicht erreicht (AUSNAHME A-02).
3. Für Vercel ist alles im Code vorbereitet: Datenbank und Dateispeicher in Frankfurt, wiederkehrende Aufgaben, Schutz der Vorschau, Startklar-Prüfung. Bis zum Livegang fehlen nur noch die Schritte in `MENSCHEN.md`.

**Was neu ist**
- **Gestaltung:**
  - Feste Stufen für Dauer, Bewegungskurven, Ebenen, große Schriftgrade und Abschnittsabstände, alle in `web/src/app/globals.css`. Freie Einzelwerte sind in den geänderten Dateien durch diese Stufen ersetzt.
  - Neue Gestaltungsregeln: neutrale Kategorie-Abzeichen, Terminzeile mit Kalender und Uhr, Detailköpfe mit Bild, ein Schrittweg in Formularen (`_werkstatt/pakete/REFERENZ.md`).
- **Bewegung:**
  - Zwölf festgelegte Bewegungen (KERN K-007), nur mit CSS.
  - Seitenwechsel mit Übergang von der Karte zur Detailseite.
  - Bei „reduzierter Bewegung“ alles sofort im Endzustand.
- **Grafik:**
  - Achtstern als einziges Ornament: Trenner, Band an Abschnittskanten, Lade-Stern, Zustandsgrafiken für leer, Fehler, Erfolg, offline und „nicht gefunden“.
  - Keine Verse und keine Kalligrafie als Schmuck.
- **Ansichten:**
  - Startseite, Gebetszeiten, Veranstaltungen und Detail, Nachrichten und Detail, Über uns, Projekte, Organisationsseiten, Korankurse, Voranmeldung, Kontakt, Startklar-Cockpit.
  - Dazu Vorstand, IGMG, Webseite für Moscheen, Suche, OG-Bilder, Druckansichten, Mobilmenü, Islamisches Wissen, Quran, Formulare, Rechtstexte (Wortlaut unverändert), Anmeldung, Verwaltungslisten, E-Mail-Vorlagen, Bildschirm-Anzeige, Fehlerseiten.
- **Vercel und Betrieb (ADR 0018–0024 in `web/docs/adr/`):**
  - Datenbank-Anbindung für Neon, Bau mit und ohne Datenbank, Migration mit Sperre.
  - Dateispeicher Vercel Blob mit Bildvarianten und Verkleinern im Browser.
  - Tägliche Aufgaben mit `CRON_SECRET`.
  - Umgebungsprüfung mit Betriebsart. Die Vorschau ist für Suchmaschinen gesperrt.
  - Lange Zwischenspeicherung statischer Dateien.
- **Startklar:**
  - Cockpit `/verwaltung/startklar`, `pnpm startklar`, `pnpm release:check`.
  - Anleitungen `web/docs/deploy/VERCEL.md` (30 Minuten), `VERCEL-ENV.md` und `web/docs/GO-LIVE.md`.
  - Verarbeitungsverzeichnis und Entwurf des Hosting-Bausteins für die Datenschutzerklärung (`web/docs/recht/`).
- **Leistung:**
  - Die Fehlerseite lädt erst im Fehlerfall.
  - Die Zeitrechnung läuft nach dem Seitenaufbau.
  - Der islamische Kalender wird auf dem Server gerechnet (`berichte/H-L01.md`).

**In Zahlen (Stand 325c38a, Abschlussprüfung; Belege in `_werkstatt/ABNAHME.md`)**
- **Pakete:** Pflicht 70 von ≈ 70, Kür 20 von 20, dazu 54 Befundpakete aus vier Sichtabnahmen (H-B 14, H-C 13, H-E 14, H-F 13), jedes von Opus abgenommen (Noten 8–8,5).
- **Gestaltung:** Mittel der unabhängigen Sichtprüfer über 17 Ansichten:
  - 6,29 (E3)
  - 7,16 (E4)
  - 7,52 (C2)
  - 7,65 (C3, keine Kategorie unter 7)

  Die 13 Pakete der Welle H-F kamen danach.
- **Zugänglichkeit:** axe WCAG 2.2 AA 0 Verstöße auf 25 Routen × 2 Breiten (dazu Türkisch und Englisch); Tastatur 0 unsichtbare Fokusse, keine Falle.
- **Darstellung:** kein Querscrollen und kein abgeschnittener Text in 75 Ansichten Deutsch, 33 Türkisch, 9 Englisch und 75 mit reduzierter Bewegung.
- **Bewegung und Grafik:** alle 12 Keyframes im Register. Momente bei vierfach gedrosseltem Prozessor im Median 0 % verworfene Bilder. 0 SVG-Befunde, eine Icon-Familie.
- **Bestand:**
  - release:check bestanden: Typen, Lint, 814 Unit- und 1412 Integrationstests, Sprachen, Geheimnisse.
  - E2E 563 grün; die ALTCHA-Tests sind in den Wiederholungen grün.
  - Funktionsliste F-01–F-24 je Telefon und Desktop: 36 von 36 prüfbaren Ergebnissen erfüllt (Ausgangsstand: 30 erfüllt, 5 nicht erfüllt).
  - Konsole ohne Fehler.
- **Leistung:**
  - INP im Labor 11 von 11 Hauptansichten ≤ 200 ms (80–184 ms); jede ist schneller als der Ausgangsstand (152–232 ms).
  - LCP ≤ 2,40 s, CLS ≤ 0,01, Barrierefreiheit, Best Practices und SEO je 100.
  - JavaScript je Hauptansicht 171–179 kB gz, Grenze 180 kB (Kurzprüfung am Endstand, `protokolle/C3b-lh-js.md`).
  - Startklar-Cockpit (angemeldet): Das Öffnen des Kontomenüs dauerte bei gedrosseltem Prozessor bis 568 ms. Behoben (66965d0): jetzt 96–112 ms (`protokolle/C3b-cockpit-inp.md`).
  - Die Performance-Note liegt mit 81–89 gleichauf mit dem Ausgangsstand (79–86, gleiche Runden, Paarregel 11 von 11) und unter dem Ziel 90 (AUSNAHME A-01; Feldprüfung nach dem Livegang, ML-27).
  - Alle Leistungswerte sind am Endstand gemessen: Lighthouse verschränkt in 5 Runden, INP in 3 Runden (`protokolle/C-lighthouse-v.md`, `C3b-inp.md`).
- **Vercel:**
  - `vercel build` als Vorschau und Produktion grün.
  - Die Produktion `igmg-five.vercel.app` läuft seit dem Fast-Forward ohne Laufzeitfehler, nur mit den gewollten Hinweisen der Startprüfung auf fehlende Menschen-Werte.

**Offen und bewusst so gelassen**
- **AUSNAHME A-02, Gestaltung ≥ 8 je Ansicht:** Vier Prüf- und Verbesserungsrunden (54 Pakete) haben das Mittel auf ein Plateau knapp unter 8 gebracht. Die verbleibenden Hinweise der Prüfer sind Einzelheiten in Komposition und Details. Beispiele: Kopfzone der Veranstaltungsseite etwas leer, doppelter Rücksprung-Link, Umbrüche einzelner Zeilen, Farbe einzelner Hinweise auf den Korankursen. Sie eignen sich für einen eigenen, kleinen Gestaltungsauftrag (Denkprotokoll ENTSCHEIDUNGEN L-E16; Liste in `protokolle/C3b-endpruefung-trockenlauf.md`).
- **AUSNAHME A-01, Performance-Note:** Grund ist der Hydrierungsblock des Frameworks, gleich groß wie vor dem Lauf. Der Ausweg ist ein eigener Auftrag „Hydrierung verkleinern“ (L-E14).
- **ML-28, Eingaben vor dem Laden:** Wer in den Verwaltungsformularen tippt, bevor die Seite fertig geladen ist, verliert die Eingabe. Formularlogik war tabu; der Vorschlag steht in MENSCHEN.
- **Umgebungsausnahmen UA-01–UA-04:** Es gab keine echten Geräte und kein Docker, Verwaltungsflüsse nur lokal, Chromium 141. Ersatzwege stehen in ABNAHME.

**Kriterien:** Das Urteil des frischen Endprüfers wird nach der Prüfung unten wörtlich eingefügt (AUFTRAG, Abschlussregel). Stand und Beleg je Kriterium stehen in `_werkstatt/ABNAHME.md`.

**Galerie:** `_werkstatt/bilder/galerie.html` zeigt je Hauptansicht für Telefon, Tablet und Desktop links den Stand vom Laufbeginn und rechts den Abschluss. Dazu kommen die Momente und der Seitenwechsel.

## Anleitung: Zusammenführen und Zurückrollen

**Wichtig vorab:** Auf deine Anweisung (L-E01) kamen geprüfte Stände schon während des Laufs per Fast-Forward auf `main`. Die Produktion `igmg-five.vercel.app` zeigt deshalb bereits den gestalteten Stand, aber noch ohne Datenbank: Sie zeigt Beispielinhalte, und Formulare und Verwaltung funktionieren dort nicht. Dieser Abschnitt beschreibt den Weg vom Beispielbetrieb zum echten Livegang.

1. **Vorher die Production-Variablen setzen.** Erst die Konten und Werte, dann der Code:
   - Datenbank (Neon, Frankfurt) und Dateispeicher (Vercel Blob, Frankfurt) im Vercel-Projekt `igmg` verbinden (`web/docs/deploy/VERCEL.md` Abschnitte 2 und 3).
   - Alle Variablen der Liste `web/docs/deploy/VERCEL-ENV.md` für „Production“ eintragen. Die Geheimnisse erzeugt `pnpm geheimnisse:erzeugen` (Abschnitt 4).
   - Die Schritte in dieser Reihenfolge stehen in `_werkstatt/MENSCHEN.md`, Abschnitt „Reihenfolge zum Livegang“, und in `web/docs/GO-LIVE.md`.
2. **Zusammenführen löst das Produktions-Deployment aus.**
   - Jeder neue Stand auf `main` baut und veröffentlicht die Produktion sofort, ohne weiteren Knopfdruck.
   - Den letzten Stand der Arbeitsbranche `claude/blissful-edison-x3j16w` bringst du per Pull Request nach `main`. Das geht als Fast-Forward, ohne Erzwingen (`VERCEL.md` Abschnitt 10).
   - Danach prüfst du die Hauptseiten (`VERCEL.md` Abschnitt 11) und das Startklar-Cockpit `/verwaltung/startklar`.
3. **Zurückrollen geht per Instant Rollback oder Revert.**
   - **Schnell:** Vercel › Projekt `igmg` › Deployments › letzte gute Produktion › „Instant Rollback“ [prüfen: Menüname]. Gleichwertig auf der Kommandozeile: `vercel rollback <Adresse des guten Deployments>` (https://vercel.com/docs/cli/rollback; auf dem Hobby-Tarif nur zum direkt vorigen Produktions-Deployment).
   - **Über Git:** einen Revert-Commit auf `main` setzen. Vercel baut dann den alten Stand neu (`VERCEL.md` Abschnitt 12).
   - Ein Rollback setzt nur den Code zurück, nie die Datenbank. Deshalb ändern Migrationen die Datenbank nur ergänzend (ADR 0019).
4. **`_werkstatt` entfernen oder bewusst behalten.**
   - Der Ordner enthält die Laufunterlagen: Auftrag, Plan, Berichte, Prüfprotokolle, Bilder und Prüfwerkzeuge.
   - Er wird nicht mit ausgeliefert, denn `.vercelignore` schließt ihn aus.
   - **Empfehlung:** behalten, solange die Abnahme läuft; danach in einem eigenen Commit entfernen (`git rm -r _werkstatt`). Die Gestaltungsregeln stehen dann weiter in `web/docs/` und im Code; KERN.md vorher nach `web/docs/` übernehmen, wenn du sie als Nachschlagewerk willst.
   - Der Block in der Datei `CLAUDE.md` im Hauptordner wird am Laufende entfernt.
