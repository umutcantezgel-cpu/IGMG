# PRÜFPUNKT

- **Nächster exakter Schritt (21:05 UTC):**
  1. **Endleistung fertig:** Paarregel 11/11, INP 11/11.
     - Befund Cockpit-INP behoben (66965d0, `protokolle/C3b-cockpit-inp.md`); 3500 steht auf 66965d0.
     - E2E der Menüs läuft (`$S/e2e/verwaltung-menue.sh`). Danach `E2E_NACHTRAG` in `C3b-cockpit-inp.md` füllen.
  2. **Danach:** Commit, `$S/ff/vorab.sh HEAD`, FF main, Produktion per MCP lesen (`C3b-vercel-mcp.md` ergänzen).
  3. **Endprüfung maßgeblich:**
     - `endpruefung.workflow.js` mit `blind` = `$S/blind2`, Schlüssel `$S/blind2-schluessel.json`, `stand` = 66965d0 plus Dokumentation.
     - A-02-Werte aus dem Ergebnis nachtragen.
     - Danach Urteil wörtlich in BERICHT, CLAUDE.md-Block entfernen, Vorab, FF main, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand 66965d0 (Anmeldestand `head/verwaltung-werkzeug`, neu 20:54). Dev 3200 gestoppt.
  - 3200 Entwicklung (gestoppt; pglite-hf12, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 325c38a (Stufe C 1–11, release:check, vercel build preview + production). main = 2b930f7.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
