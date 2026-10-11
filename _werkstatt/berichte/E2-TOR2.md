# E2-TOR2 · Stufe B am sauberen Build (Rückgabe, vom Orchestrator abgelegt)

E2-TOR2-PRUEFER · Stufe B · Wiederholung Referenzansicht / und /ueber-uns (nach L-E09, L-E10)

GEÄNDERTE DATEIEN
Keine Projektdatei geändert, kein Commit, kein Push. Neu nur in _werkstatt/protokolle/E2-TOR2-* (rund 70 Dateien, Übersicht E2-TOR2-ergebnis.txt). Außerhalb des Repos: Scratchpad-Worktree bau-sauber (detached, 23487df, Build), Bilder und Prüfskripte unter scratchpad/tor-e2b/ und scratchpad/bilder/e2-tor2/. Server 127.0.0.1:3400 läuft (BUILD_ID AcIWeSXrIc5S20Fl1JfCI), 3100 und 3200 unberührt.

WAS UND WARUM
Ein sauberer Build genau des Stands 23487df im Worktree (pnpm install --frozen-lockfile --offline, scripts/vercel-bau.mjs ohne DATABASE_URL). next build 466 von 466 Seiten, TypeScript fehlerfrei (E2-TOR2-build.log). Der alte Server auf 3400 (PID 31308, Build MuILuVNcIAwiw5iKUYvht) ist gestoppt.
Beleg Stylesheet der Startseite (E2-TOR2-beleg-stylesheet.json): bogen-enthuellt 1, @keyframes auftritt 1, view-transition-new(.seite) 1. Der erste Torlauf lieferte diese Regeln nicht aus.
Abweichung 1 (E2-TOR2-aufbau.txt): Nach dem vorgegebenen Aufbau fehlte public/ im Standalone-Ordner. Der Server meldete 404 für /bilder/logos/*.png und /altcha/pbkdf2.js. Ich habe public/ aus demselben Worktree nachgetragen und den Server neu gestartet. Der Build selbst ist unverändert.
Abweichung 2: Der erste Messlauf wurde nach Abweichung 1 abgebrochen und vollständig wiederholt. Die Protokolle des Abbruchs sind durch den Neulauf ersetzt.
Abweichung 3: Das Skript der Momente hatte einen Fehler (ziel nicht definiert, rc 1). Behoben und einzeln neu gelaufen. Für B-06 habe ich zusätzlich eine Fassung gebaut, die ab der Auslösung misst (motion-b06b). Die Bilder momente/b06-start-* sind verworfen, weil sie erst 2,4 s nach der Auslösung entstanden.

PRÜFUNG UND ERGEBNIS
Tabelle gegen E0 (E0-PRUEFER-02-ausgangswerte.txt) und den ersten Torlauf (Vollfassung in E2-TOR2-ergebnis.txt):
- Lighthouse mobil Leistung / (Median aus 3, Spanne): E0 89 (81–90) · E2-TOR 90 · E2-TOR2 82 (77–85). Über uns: E0 87 · E2-TOR 91 · E2-TOR2 86 (82–91). Barrierefreiheit, Best Practices, SEO je 100.
- LCP / TBT / CLS / JS gz (E2-TOR2, Median): / 1996 ms · 656 ms · 0,002 · 173,7 kB; Über uns 1890 ms · 483 ms · 0,002 · 170,7 kB. E0 für / TBT 375 ms, JS 168 kB.
- Bildsatz 390/768/1440, normal und reduziert, beide Routen: 0 Befunde, nicht waagerecht, je 9/6/5 Ausschnitte. Sichtprüfung: E2-TOR2-bildsatz.json, zusammenfassung.md.
- axe WCAG 2.2 AA bei 390 und 1440: Verstöße 0. Unklar je Route und Breite 1: Regel color-contrast (ernst): / 4 Knoten, /ueber-uns 6 Knoten (E2-TOR2-axe-regeln.json).
- Konsole (390) für /, /ueber-uns, /veranstaltungen: 0 Fehler, 0 Warnungen, 0 Seitenfehler, 0 fehlgeschlagene Anfragen (E2-TOR2-konsole.json).
- B-06 Tagesbogen (/, nach Hydrierung): Das Element erscheint erst nach der Hydrierung (im Server-HTML nicht enthalten). Die Animation enthuellen läuft von 0 bis rund 1190 ms ab Auslösung und endet mit state finished (E2-TOR2-momente-b06b.json). Gleichzeitig laufen 31 Farb- und Skalierungsübergänge; danach 1 Animation.
- B-07 Weg der Gemeinde (/ueber-uns): data-sicht steht vor dem Scrollen auf bereit, nach dem Scrollen auf laeuft. wachsen und hervortreten laufen von 0 bis 1508 ms, Zeitstand monoton (E2-TOR2-momente.json).
- Bildrate CPU 4× verworfen (Median aus 3): / 0 % (Werte 0,8 / 0 / 0 %), /ueber-uns mit Scrollen 0 % (0 / 3,3 / 0 %) (E2-TOR2-bewegung-*.json). Reduzierte Bewegung: 0 laufende Animationen, 0 px Lageänderung, 0 unsichtbar nach 2 s.
- B-05 Seitenwechsel: vt = 1 je Klick auf den drei Paaren, Ziel erreicht (E2-TOR2-vt-b05.json). Mit reduzierter Bewegung vt = 0, Ziel 3 von 3 erreicht (E2-TOR2-vt-reduziert.json).
- Freie Werte (103 geänderte .ts/.tsx/.css seit 9ebb4bc, ohne Tests): 103 Funde in 12 Dateien. tokens.ts 50, globals.css 20 (beide gesondert ausgewiesen), übrige 33 in 10 Dateien (u. a. OrganizationPage 9, Seitenleiste 6, NewsCard 4, Zeitleiste 4).
- SVG (ganzer Baum): Fehler 0, Befund 12, OK 2. In geänderten Dateien: Befund 6 (Icons.tsx 11 und 35, Zustandsgrafik.tsx 48, 85, 99, FamilieDerVier.tsx 28), OK 1 (TagesbogenLive.tsx 80).
- pnpm check (Worktree 23487df): rc 0. Typen, eslint ohne Befund, Unit 39 von 39 Dateien, 744 bestanden, 3 erwartet fehlgeschlagen.
- pnpm sprachen:pruefen: rc 0 (1170 Schlüssel in de, tr, en vollständig, 1914 Verwaltungsschlüssel nur de).
- Integration nicht wiederholt (Auftrag).

BILDBELEGE (Basis scratchpad/bilder/e2-tor2/, für die Sichtabnahme zuerst)
1. Startseite 390 erster Bildschirm: bildsatz/start/390x844/schirm-01.jpg
2. Startseite 1440 erster Bildschirm: bildsatz/start/1440x900/schirm-01.jpg
3. B-06 Tagesbogen, Lauf 1, Animationszeit 133, 233, 483, 883, 1200 ms: momente-b06/b06-l1-1.jpg bis b06-l1-5.jpg (Lauf 2: b06-l2-*.jpg). Auf dem Telefon liegt der Bogen unter dem ersten Bildschirm (b06-l1-3 zeigt nur die Karte mit Titel).
4. B-07 Weg der Gemeinde, Lauf 1, 31, 212, 505, 905, 1508 ms nach Auslösung: momente/b07-ueber-uns-l1-1.jpg bis -5.jpg (Lauf 2: -l2-*.jpg). Die Linie ist in den Ausschnitten kaum zu erkennen (OFFENE FRAGE).
5. Seitenwechsel: seitenwechsel2/wechsel-1.jpg (308 ms nach Klick, noch alte Seite) und wechsel-4.jpg (neue Seite). Zeitlupe (Animationen auf 0,1): seitenwechsel-zeitlupe/zeitlupe-01.jpg bis -04.jpg. Auf keinem Bild ist ein Zwischenzustand zu sehen.
6. Reduzierte Bewegung: bildsatz-reduziert/start/390x844/ und bildsatz-reduziert/ueber-uns/390x844/

PROTOKOLLE (_werkstatt/protokolle/): E2-TOR2-ergebnis.txt (Übersicht und Tabelle), E2-TOR2-aufbau.txt, E2-TOR2-build.log, E2-TOR2-beleg-stylesheet.json, E2-TOR2-bildsatz*.json, E2-TOR2-a11y-390/1440.json, E2-TOR2-axe-regeln.json, E2-TOR2-konsole.json, E2-TOR2-lighthouse.json und -last.txt, E2-TOR2-momente-b06b.json, E2-TOR2-momente.json, E2-TOR2-vt-b05.json, E2-TOR2-vt-reduziert.json, E2-TOR2-vt-lebenszyklus.json, E2-TOR2-vt-zeitlupe.json, E2-TOR2-freie-werte.json, E2-TOR2-svg.json, E2-TOR2-check.log, E2-TOR2-sprachen.log.
Ersetzt und nicht verwenden: E2-TOR2-momente-b06.json (nur Screencast, 3 Rahmen), E2-TOR2-vt-bildfolge.json und E2-TOR2-vt-bildfolge2.json (Auslöser und Kopf verschoben bzw. fehlerhaft).

GEMEINSAME DATEIEN
Keine.

OFFENE FRAGEN
1. Seitenwechsel B-05: Die Navigation dauert in dieser Messung rund 4,1 s. Chromium bricht den Übergang mit „Transition was aborted because of timeout in DOM update“ ab (E2-TOR2-vt-lebenszyklus.json: ready-Fehler bei 4131 ms). SeitenUebergang.tsx wartet höchstens 4000 ms, also dieselbe Grenze. Die Überblendung ist damit nicht sichtbar. Warum die Navigation so lange dauert, habe ich nicht geprüft (Server liefert das HTML in 7 ms). Entscheidung nötig: Grenze erhöhen, Übergang ohne DOM-Frist aufbauen oder die Dauer klären.
2. Tagesbogen auf 390 × 844 liegt unter dem ersten Bildschirm. Soll der große Moment dort im ersten Bildschirm stehen? Sichtabnahme.
3. Lighthouse Startseite Leistung 82 (unter Schwelle 90, TBT 656 ms). Gemessen unter Fremdlast (Last 2,4 bis 4,2). Maßgeblich ist die Paarmessung in Stufe C. Die Messung des ersten Laufs (90) bezog sich auf einen veralteten Build.
4. B-07: Die Linie der Gemeinde-Zeitleiste ist in den Bildern kaum erkennbar. Sichtabnahme, ob die Linie wächst oder nur die Stationen erscheinen.
5. axe: Die unklaren Befunde (color-contrast auf der Startseite und auf Über uns) sind neu benannt. E0 hatte bei / ebenfalls 1 unklaren Befund ohne ID. Prüfung der Kontraste der Platzhalter-Karten offen.
6. freie Werte: 103 Funde, davon 50 in tokens.ts und 20 in globals.css (Token-Definitionen, gesondert). Die Dateien in Komponenten (33) sind für Baumeister zu sichten, nicht für mich zu bewerten.
7. Startprüfung des Servers meldet fehlende Produktionswerte (SMTP, Absender, DATABASE_URL). Erwartet im lokalen Prüfaufbau, nicht gegen Vercel geprüft (kein Vercel-Zugriff).

=== ENDE E2-TOR2 · BEREIT ZUR RÜCKGABE ===
