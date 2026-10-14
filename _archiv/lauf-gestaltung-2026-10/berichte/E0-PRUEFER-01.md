# E0-PRUEFER-01 · Einrichtung und Prüfwerkzeuge (Rückgabe, vom Orchestrator abgelegt)

# E0-PRUEFER-01 · Einrichtung und Prüfwerkzeuge

**GEÄNDERTE DATEIEN**
- Neu in `_werkstatt/werkzeuge/`: `package.json`, `hilfen.mjs`, `einzelbild.mjs`, `bildsatz.mjs`, `a11y.mjs`, `lighthouse.mjs`, `bewegung.mjs`, `freie-werte.mjs`, `svg-pruefung.mjs`, `anmeldung.mjs`, `server-starten.sh`, `routen-hauptansichten.json`, `routen-tr.json`, `LIESMICH.md`, Symlink `node_modules` (ignoriert).
- Neu in `_werkstatt/protokolle/`: `E0-PRUEFER-01-*` (Build-Log, JSON und MD je Werkzeug, Lauf-, Test-, Server-, Anmelde- und Machbarkeitslog).
- Dieser Bericht.
- Außerhalb des Repos: Abhängigkeiten, Umgebungsdatei (600), Ausgangsstand, Bilder.
- Gitignorierte Build-Ordner `web/.next` und `web/.pglite-bau`. Keine Quelldatei in `web/` geändert.

**WAS UND WARUM**
Werkzeuge für die Schritte 2 bis 7, Ausgangsstand gebaut und eingefroren, damit Vorher-Messungen gegen einen festen Stand laufen. Den Build habe ich vor dem Einfrieren geprüft. Eingefroren ist Commit `9ebb4bc` (`git rev-parse HEAD`).

**GEMEINSAME DATEIEN**
Keine. `_werkstatt/.gitignore` und das Rollenbriefing stehen bereits in `9ebb4bc`.
Der Arbeitsbaum hat sich nach dem Einfrieren (17:16) geändert: `web/messages/*.json`, `web/src/app/[locale]/(website)/page.tsx`, `web/src/app/globals.css`, `web/src/components/website/start/`, `web/src/lib/gebetszeiten/bogen.ts`, `web/tests/unit/gebetszeiten/`. Diese Änderungen sind nicht im eingefrorenen Stand.

**PRÜFUNG UND ERGEBNIS**
- Node v24.21.0. pnpm 12.11.2 in `web/` (außerhalb von `web/` liefert corepack 10.28.0).
- Playwright 1.64.0, @axe-core/playwright 4.13.0, lighthouse 13.5.0, wie in `web/package.json`.
- Build: `db:bau-vorbereiten` und `pnpm build` mit rc=0 (`_werkstatt/protokolle/E0-PRUEFER-01-build.log`).
- Server eingefroren aus `.next/standalone`. Ergänzt: `@electric-sql/pglite` 0.5.8, weil Next es nicht bündelt; PGlite-Datenbank liegt bei.
- Start: `_werkstatt/werkzeuge/server-starten.sh start`. PID 11372, http://127.0.0.1:3100, `/api/health` 200. Die PID wechselte nach dem Neustart für die Testeinladung.
- Alle 22 Routen der beiden Routen-Dateien: HTTP 200.
- Gelaufen: einzelbild `/` in 390 und 1440 (ok). bildsatz für `/` und `/gebetszeiten` in drei Größen: kein Querscrollen, keine Befunde. a11y (390): `/` 0 Verstöße, 1 unklar; `/gebetszeiten` 0 Verstöße.
- lighthouse `/`, 1 Lauf: Performance 84 (simuliert 90), Barrierefreiheit 100, Best Practices 100, SEO 100, LCP 1885 ms, CLS 0,001, TBT 549 ms, JS 168 kB. Verfehlt: Performance (Ziel 90), TBT (Ziel 200 ms).
- bewegung `/`, 2000 ms: keine laufenden Animationen, keine Elemente mit Deckkraft 0, 0 % verworfene Bilder unter CPU 4×.
- freie-werte, web/src (452 Dateien): 617 Funde (531 Tailwind-Klammerwerte, 62 Hex-Farben, 3 Farbfunktionen, 21 px-Literale).
- svg-pruefung: 5 `.svg`-Dateien (alle unter `_lauf/lichtung/a/public`, ohne Rollenangabe), 3 inline: 1 OK, 2 Befund (`Icons.tsx:11` mit `{...props}`, `FehlerAnsicht.tsx:34`). Fehler 0.
- anmeldung: Einladung, Passwort, TOTP, Anmeldung und Dashboard funktionieren.
- Werkzeugtests gegen bekannte Fehler (Testseiten im Scratchpad): bildsatz erkennt Querscrollen, abgeschnittenen Text und überragende Elemente. a11y findet alle vier Testfehler. bewegung findet Transform-Animation (44 px), Deckkraft 0 und 23 bis 26 % verworfene Bilder. Protokoll: `E0-PRUEFER-01-werkzeugtest.log`.
- Beobachtet: Beim ersten Besuch überdeckt ein Demo-Modal (`KonzeptHinweis.tsx`) die Startseite. Die Werkzeuge blenden es aus, `HINWEIS_ZEIGEN=1` zeigt es. Lighthouse kann das nicht, weil es den Speicher je Lauf zurücksetzt.
- E2E-Machbarkeit: `apt-get update` 5 s, `apt-get install -y postgresql` 4 s (PostgreSQL 16.15, Cluster `16 main` gestoppt). Mailpit v1.27.0 lädt (9,9 MB), `mailpit version` läuft, nicht installiert und nicht gestartet. Die Suite habe ich nicht gestartet.

**BILDBELEGE** (Ordner `…/scratchpad/bilder/`)
- `start-390x844.jpg`, `start-1440x900.jpg`: Startseite ohne Demo-Modal.
- `bildsatz-e0/start/…` und `bildsatz-e0/gebetszeiten/…` (`schirm-NN.jpg`), Zusammenfassung `bildsatz-e0/zusammenfassung.md`.
- `bewegung-start/bewegung-1…5.jpg`.
- `verwaltung-1440x900.jpg`, `verwaltung-390x844-nach-anmeldung.jpg`.

**OFFENE FRAGEN**
1. Playwright 1.64 erwartet Chromium 156 (Revision 1248). Installiert ist 141 (Revision 1194). Die Werkzeuge laufen damit. Soll ein passender Browser installiert werden? `playwright install` war nicht erlaubt.
2. Soll Lighthouse den Demo-Hinweis schließen? Das erfordert eine Anpassung der Lighthouse-Konfiguration.
3. Mailpit: Tag `v1.27` gibt es nicht, geladen wurde `v1.27.0`. Eine Prüfsumme wird nicht veröffentlicht (404).
4. Die eingefrorene Datenbank enthält jetzt das Testkonto und eine Einladung, nur für die Verwaltung. `web/.pglite-bau` ist unverändert. Soll die Basis für Stufe B neu aus `web/.pglite-bau` kopiert werden?
5. Gemessen wurde nur ein Lighthouse-Lauf zum Funktionsnachweis. Die Mediane aus drei Läufen stehen aus.
6. Für die E2E-Suite fehlen die Rolle und Datenbank `igmg` (`DATABASE_URL`). Der Cluster ist gestoppt. Nicht geprüft.

=== ENDE E0-PRUEFER-01 · BEREIT ZUR RÜCKGABE ===
