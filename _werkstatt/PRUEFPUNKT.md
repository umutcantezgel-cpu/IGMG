# PRÜFPUNKT

- **Nächster exakter Schritt (11:05 UTC):**
  1. **Produktionsfehler (Aufgabe 19): erledigt.** Commit siehe git log, Gegenprobe ohne Datenbank in `protokolle/C-produktionsfehler.md`.
  2. **Endstand:** `bash _werkstatt/werkzeuge/endstand.sh <REV>`. Das umfasst den Build auf 3500, Stufe C 1–3 und 5–11, bei ruhiger Last 12 und die INP-Paare, dazu E2E auf 3700. Danach STUFE-C3 mit Einordnung schreiben, Z-08 gegebenenfalls als AUSNAHME mit Denkprotokoll. Anschließend `abschluss-kopieren.sh` und `galerie.mjs`.
  3. **FF main** nach L-E01 (`git push origin claude/blissful-edison-x3j16w:main`, nie erzwungen). Danach die Produktion per MCP lesen, auch die Bot-UA-Prüfung.
  4. **Endprüfung:** `blind-vorbereiten.py` und `endpruefung.workflow.js`. Urteil wörtlich übernehmen, ABNAHME setzen, BERICHT schreiben. Dann den CLAUDE.md-Block entfernen, Commit, Push, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand f2a5f8d (Anmeldestand `head/verwaltung-werkzeug`). Dev 3200 gestoppt.
  - 3200 Entwicklung (pglite-h10, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 8e93ef8 (Unit 804, tsc grün). main = 1ca46e0 (extern um 07:22 UTC gesetzt), Produktion READY mit zwei Laufzeitfehlern (siehe Schritt 1).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
