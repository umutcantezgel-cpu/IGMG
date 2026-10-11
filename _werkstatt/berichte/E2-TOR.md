# E2-TOR · Stufe B Startseite und Über uns (Rückgabe, vom Orchestrator abgelegt)

E2-TOR-PRUEFER · Stufe B · Referenzansicht / und /ueber-uns

GEÄNDERTE DATEIEN
Keine Projektdatei geändert, kein Commit, kein Push. Neu nur in /home/user/IGMG/_werkstatt/protokolle/: E2-TOR-*.json/.md/.log (46 Dateien), Übersicht E2-TOR-ergebnis.txt (mit Tabelle gegen E0). Außerhalb des Repos: scratchpad/tor-e2/ und scratchpad/bilder/e2-tor*/. Die Worktrees v02 und quelle sind entfernt, git worktree list zeigt nur das Hauptrepo.

WAS UND WARUM
Gemessen wurde der Produktionsbau des Commits e6d900f (H-FIX3), Standalone auf 127.0.0.1:3300, PID 7699, /api/health ok. Der Branch wanderte während des Laufs von 280a76a über deab7cc, 25ad522 bis 1fdc6a3. Deshalb habe ich Prüfungen und Scans gegen einen eingefrorenen Worktree des Stands e6d900f gefahren. Der Arbeitsbaum war nicht eingefroren (19 unkommittierte Dateien anderer Akteure). 3100 (PID 11372) und 3200 laufen unverändert.
Abweichungen: lokal.env für 3300 mit PORT 3300, APP_URL und BETTER_AUTH_URL auf 3300, eigene PGlite- und Medienkopie, damit 3100 nicht berührt wird. Bewegung im Zeitfenster und Konsolenprüfung über eigene Skripte (scratchpad/tor-e2/), weil die Werkzeuge keinen Ankerscroll und keine Hydrierungserkennung haben. Regel-IDs der unklaren Befunde über eigenes Skript, weil a11y.mjs sie nicht ausgibt und auch nicht ins JSON schreibt. V-02 auf e6d900f statt HEAD.

GEMEINSAME DATEIEN
Keine.

PRÜFUNG UND ERGEBNIS
1. Build: db:bau-vorbereiten und next build nach dem Weg von vercel-build, rc 0, keine Warnung im Protokoll (E2-TOR-build.log).
2. Suiten (Worktree e6d900f): pnpm check rc 0, 35/35 Dateien, 599 bestanden, 3 erwartet rot. sprachen:pruefen rc 0 (1168 Schlüssel de/tr/en vollständig, 1868 Verwaltungsschlüssel nur de). geheimnisse:pruefen rc 0, ohne Befund. pnpm test:integration rc 1: 13 von 1340 Tests rot in 5 Dateien (formular-kontakt 3, formular-meldung 3, formular-mitgliedsantrag 1, formular-moschee-anfrage 3, formular-veranstaltungsanmeldung 3). Davon 11 Zeitlimits (30 s bzw. 120 s) und 2 AssertionError beim Honigtopf-Test („expected 2 to be 1“). Wiederholung der 5 Dateien: 6 von 48 rot, meldung und kontakt bleiben rot, die anderen drei sind grün (E2-TOR-integration-wiederholung.log). Ursache nicht geprüft.
3. Ansichten auf 3300: Bildsatz 390/768/1440 für / und /ueber-uns HTTP 200, kein waagerechtes Scrollen, 0 Befunde, Ausschnitte 9/6/5 wie E0. Reduzierte Bewegung ebenso. a11y 390 und 1440: Verstöße 0. Unklar: /ueber-uns 1 (Regel color-contrast, ernst, 6 Stellen, bei beiden Breiten gleich), / 0 (E0 hatte 1). Lighthouse mobil, Median aus 3 Läufen: / Leistung 90 (E0 89), LCP 1994 ms, CLS 0,004, TBT 364 ms, JS 172,9 kB. /ueber-uns Leistung 91 (E0 87), LCP 1861 ms, CLS 0,002, TBT 331 ms, JS 169,8 kB. Barrierefreiheit, Best Practices und SEO je 100. Last 4,5 bis 4,7 während des Blocks.
Bewegung Werkzeug (Seitenaufruf): 0 laufende Animationen, 0 px, Bildrate CPU 4× 0 % verworfen auf / (wie E0). Zeitfenster-Skript: in allen 10 Bildern keine laufende Animation. Bildrate CPU 4× (Median aus 3 Läufen): / 0 % verworfen (122 Bilder), /ueber-uns 8,2 % (90 Bilder). Last stieg auf 8,3.
4. Seitenwechsel B-05 (1440 und 390): document.startViewTransition ist vorhanden. Die URL wechselt in beide Richtungen, der Zähler bleibt 0. Die Methode ist unsicher, siehe offene Fragen.
5. Konsole (390) für /, /ueber-uns, /veranstaltungen: 0 Konsolenfehler, 0 Warnungen, 0 Seitenfehler, 0 fehlgeschlagene Anfragen, 0 HTTP-Fehler ab 400.
6. freie-werte auf die 30 geänderten Dateien unter web/src (Basis 9ebb4bc): 91 Funde in 9 Dateien. globals.css 20, styleguide/tokens.ts 50, CourseCard 5, EventCard 3, Header 1, KonzeptHinweis 2, NewsCard 4, OrgCard 2, ueber-uns/Zeitleiste 4. svg-pruefung über den ganzen Baum: Fehler 0, Befund 11, OK 2. In geänderten Dateien 5 Befunde (Icons.tsx 11 und 35, Zustandsgrafik.tsx 48, 85, 99) und 1 OK (TagesbogenLive.tsx 80).
7. Vorschau (nur lesend): neuestes Deployment des Branches dpl_J9zLL9uYXSWMNUe3UAbKVMCjzGLK, READY, Commit deab7cc. Build-Protokoll ohne Fehlerzeile, eine Warnung zu engines.node >=24. Laufzeitlogs Stufe error und fatal, letzte 2 h: leer. Seitenabruf: Ich habe web_fetch_vercel_url zweimal benutzt, bevor die Korrektur ankam. Das Werkzeug legt laut Beschreibung einen Umgehungslink an oder nutzt einen vorhandenen. Ergebnis, nicht für die Freigabe verwenden: / HTTP 200, „Der Tag in Wetzlar“ 3-mal; /ueber-uns HTTP 200, 0-mal. Danach habe ich es nicht mehr benutzt und get_access_to_vercel_url nicht aufgerufen. Ob dabei ein Link neu entstand, zeigt das Werkzeug nicht. Bitte am Projekt prüfen. Ersatz laut Vorgabe: Vorschau-Abruf nicht möglich ohne Umgehungslink (Mensch legt das Bypass-Geheimnis an, V-09). Maßgeblich ist der Abruf auf 3300.
8. V-02 (Worktree e6d900f): pnpm install --frozen-lockfile rc 0 (1,5 s). vercel-build mit VERCEL_ENV=preview rc 0, 166 s. Mit production rc 0, 84 s. vercel build (CLI 63.1.2) ohne Zugangsdaten: rc 1 nach 28 s, „fetch failed“. Umgebungsausnahme, Ersatz: die beiden vercel-build-Läufe. Protokolle E2-TOR-v02-*.log.

AUFFÄLLIGKEIT, HOCH (Ursache nicht geprüft)
Das vom Server auf 3300 ausgelieferte Stylesheet 1xgroub29-46e.css (86675 Byte) enthält nicht die Keyframes einblenden, ausblenden, auftritt, zeichnen, enthuellen, wachsen, hervortreten (nur spin), nicht den Token --ease-eintritt, nicht die Klasse .bogen-enthuellt und keine View-Transition-Regeln für .seite oder .morph. Im Quellstand e6d900f stehen sie in web/src/app/globals.css (Token Zeile 118, Keyframes 267–312, Schicht components 335–418). Auch in HTML und JS-Bundles fehlen sie. Folge: Auf / und /ueber-uns ist in keiner Messung eine Animation nachweisbar. VERMUTUNG: Der Build verwirft die Regeln der Schicht components.

BILDBELEGE
Basis: /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/
- 390×844: e2-tor/start/390x844/schirm-01 bis -09.jpg und e2-tor/ueber-uns/390x844/schirm-01 bis -09.jpg
- 768×1024: e2-tor/start/768x1024/schirm-01 bis -06.jpg und e2-tor/ueber-uns/768x1024/schirm-01 bis -06.jpg
- 1440×900: e2-tor/start/1440x900/schirm-01 bis -05.jpg und e2-tor/ueber-uns/1440x900/schirm-01 bis -05.jpg
- Reduzierte Bewegung: e2-tor-reduziert/start/ und e2-tor-reduziert/ueber-uns/ mit denselben Größen
- Bewegung im Zeitfenster: e2-tor/bewegung/start-1 bis -5.jpg und ueber-uns-1 bis -5.jpg
- Werkzeug-Bewegung: tor-e2/werkzeug/bilder/bewegung-start/ und bewegung-ueber-uns/ (je 1 bis 5.jpg)
Für die Sichtabnahme zuerst: start/390x844/schirm-01 (Tagesbogen) und bewegung/start-1 bis -5.

OFFENE FRAGEN
1. CSS des Produktionsbaus: Warum fehlen Keyframes, Token und Regeln der Schicht components (Tailwind-Ausgabe)? Stellen in globals.css e6d900f siehe oben.
2. Integrationsfehler: Zeitlimits bei ALTCHA- und Formularfälle, und der Honigtopf-Test zählt 2 statt 1 Mail. Ist die Mail-Ablage zwischen parallelen Dateien geteilt? Nicht geprüft.
3. Messungen liefen unter Fremdlast (ESLint und weitere Node-Prozesse auf dem Live-Baum). Soll Bewegung und Lighthouse in ruhiger Phase wiederholt werden?
4. a11y /: unklar 0 statt E0 1. Ursache unbekannt.
5. B-05: Der Zähler erfasst React-ViewTransition vermutlich nicht. Welche Methode soll gelten?
6. Der Umgehungslink aus web_fetch_vercel_url: Bitte am Vercel-Projekt prüfen, ob ein Link entstanden ist.
7. Server 3300 läuft (PID 7699). Stopp: SCRATCHPAD=<scratchpad>/tor-e2 SERVERORDNER=<scratchpad>/tor-e2/standalone LOKAL_ENV=<scratchpad>/tor-e2/lokal.env _werkstatt/werkzeuge/server-starten.sh stop. Ich habe ihn nicht gestoppt.

=== ENDE E2-TOR-PRUEFER · BEREIT ZUR RÜCKGABE ===
