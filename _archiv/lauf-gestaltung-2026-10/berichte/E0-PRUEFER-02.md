# E0-PRUEFER-02 · Ausgangswerte Stufe B (Rückgabe, vom Orchestrator abgelegt)

GEÄNDERTE DATEIEN
- Keine Quelldatei im Repo geändert.
- Neu in `_werkstatt/protokolle/`: `E0-PRUEFER-02-*` (je Werkzeug .json, .md, .log) und die Übersicht `E0-PRUEFER-02-ausgangswerte.txt` (eine Zeile je Route, alle Kennzahlen).
- Außerhalb des Repos: `scratchpad/bilder/e0-basis/`, `scratchpad/bilder/e0-basis-reduziert/`, `scratchpad/bilder/bewegung-start/` (überschrieben, siehe OFFENE FRAGEN), Lighthouse-Vollberichte `scratchpad/lighthouse/2026-10-11-17-33/`, `…-17-39/`, `…-17-46/`.

WAS UND WARUM
Ausgangswerte Stufe B für die 11 Hauptansichten, gemessen am eingefrorenen Stand 9ebb4bc auf 127.0.0.1:3100 (Server PID 11372, /api/health vor jedem Block ok). Port 3200 nicht benutzt. Nacheinander, nie zwei schwere Läufe gleichzeitig. Das Startklar-Cockpit ist nicht gemessen, weil es noch nicht existiert.

GEMEINSAME DATEIEN
Keine. Für Schritt 6 und 7 habe ich einen Worktree bei 9ebb4bc unter `scratchpad/basis-quelle` angelegt, dort untracked Kopien von `hilfen.mjs`, `freie-werte.mjs` und `svg-pruefung.mjs` ausgeführt und den Worktree mit `worktree remove --force` entfernt. `worktree list` zeigt nur noch das Hauptrepo. Keine Commits, kein Push.
Beobachtung: Das Hauptrepo stand um 17:29 auf 9ebb4bc und ist inzwischen auf b592670 (Branch claude/blissful-edison-x3j16w). Meine Messungen laufen gegen 9ebb4bc und sind davon nicht betroffen.

PRÜFUNG UND ERGEBNIS
1. Bildsatz 390, 768, 1440 für alle 11 Routen (17:29–17:31, `E0-PRUEFER-02-bildsatz.md`): HTTP 200 überall. Kein waagerechtes Scrollen. Kein abgeschnittener Text. Textelemente, die über den rechten Rand reichen (die Seite scrollt dabei nicht waagerecht): `/nachrichten` bei 390 mit 9 Stellen (Schirm 10) und bei 768 mit 4 Stellen (Schirm 5), bei 1440 keine. Alle anderen Routen ohne Befund.
2. Reduzierte Bewegung für `/` und `/ueber-uns` (`E0-PRUEFER-02-bildsatz-reduziert.md`): je 9, 6, 5 Ausschnitte, keine Befunde.
3. axe, WCAG 2.2 AA, 390 und 1440 (`E0-PRUEFER-02-a11y-390.md`, `…-a11y-1440.md`): 0 Verstöße in allen 11 Routen, in beiden Größen. Kritisch, ernst, mittel und gering je 0. Unklar (axe incomplete): je 1 auf 8 Routen (`/`, `/veranstaltungen`, `/nachrichten`, `/ueber-uns`, `/projekte`, `/bildung/korankurse`, `/bildung/voranmeldung`, `/kontakt`), 0 auf 3 Routen. Die Regel-IDs stehen nicht im Protokoll.
4. Lighthouse mobil, Median aus 3 Läufen, devtools (maßgeblich). Blöcke (UTC): Routen 1–4 17:32:59–17:39:55, Routen 5–8 17:39:57–17:46:46, Routen 9–11 17:46:47–17:51:51. Werte je Route in `E0-PRUEFER-02-ausgangswerte.txt`, Rohdaten in `E0-PRUEFER-02-lighthouse-teil1/2/3.json`.
   - Barrierefreiheit, Best Practices und SEO: 100 auf allen Routen und in allen Läufen.
   - Performance-Median 85 bis 92. Unter dem Ziel 90 liegen 10 von 11 Routen, nur `/projekte` (92) erreicht es. Spanne je Route 81 bis 94.
   - LCP-Median 1816 bis 2263 ms, alle unter 2500 ms. CLS-Median 0 bis 0,001.
   - TBT-Median 285 bis 458 ms. Alle 11 Routen liegen über dem Schwellenwert von 200 ms aus dem Werkzeug.
   - JS gzip beim ersten Aufruf 168 bis 174 kB, alle unter 180 kB.
   - Demo-Hinweis: Lighthouse setzt den Browserspeicher je Lauf zurück, deshalb ist das KonzeptHinweis-Modal in jeder Messung sichtbar. Gemessen wurde, was Besucher sehen. Spätere Messungen laufen genauso.
5. Bewegung `/` (`E0-PRUEFER-02-bewegung.md`): 5 Einzelbilder, 0 laufende Animationen beim Laden, 0 px Lageänderung im reduzierten Modus. Bildrate ohne Drosselung 0 % verworfen (122 Bilder), unter CPU 4× ebenfalls 0 % verworfen (122 Bilder), Median-Abstand 16,7 ms.
6. Freie Werte, web/src bei 9ebb4bc (`E0-PRUEFER-02-freie-werte.md`): 452 Dateien, 617 Funde (531 Tailwind-Klammerwerte, 62 Hex-Farben, 3 Farbfunktionen, 21 px-Literale). Das deckt sich mit E0-PRUEFER-01.
7. SVG bei 9ebb4bc (`E0-PRUEFER-02-svg.md`): 5 `.svg`-Dateien, alle unter `_lauf/lichtung/a/public`, und 3 inline. Fehler 0, Befund 7 (5 Dateien ohne aria-hidden oder benannte role, `Icons.tsx:11` mit `{...props}`, `FehlerAnsicht.tsx:34`), OK 1 (`QrCode.tsx:8`).

BILDBELEGE
- `scratchpad/bilder/e0-basis/<route>/<breite>x<höhe>/schirm-NN.jpg`, Zusammenfassung `scratchpad/bilder/e0-basis/zusammenfassung.md`.
- `scratchpad/bilder/e0-basis-reduziert/`.
- `scratchpad/bilder/bewegung-start/bewegung-1.jpg` bis `bewegung-5.jpg`.

OFFENE FRAGEN
1. Die Übersicht liegt als `.txt` vor, nicht als `.md`. Ich schreibe keine Befund-.md, und die Vorgabe erlaubt .txt.
2. `bewegung-start/` ist mit dem neuen Lauf überschrieben. Die Dateinamen stimmen mit den Belegen von E0-PRUEFER-01 überein, dort liegen die Bilder von E0-01 also nicht mehr. Soll ich künftige Läufe in eigene Ordner legen?
3. Die axe-„unklar“-Befunde haben keine Regel-IDs im Protokoll. Soll `a11y.mjs` sie künftig mit ausgeben?
4. `/nachrichten`: Ursache der überhängenden Textelemente nicht geprüft. Nicht gedeutet.
5. Ob das Demo-Modal die LCP- und TBT-Werte beeinflusst, ist nicht getrennt gemessen.
6. Browser: Chromium 141, Playwright erwartet 156. Der Einfluss auf die Bildrate ist nicht geprüft.
7. Die Last schwankte während der Läufe (Load 2,2 bis 4,5 auf 4 Kernen). Der Dev-Server auf 3200 lief parallel. Lighthouse wurde nicht wiederholt.

=== ENDE E0-PRUEFER-02 · BEREIT ZUR RÜCKGABE ===
