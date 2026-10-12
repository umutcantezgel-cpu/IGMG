# PRÜFPUNKT

- **Nächster exakter Schritt (19:55 UTC):**
  1. **Endleistung läuft:** `$S/endleistung.sh`, Log `protokolle/C3b-endleistung.log`. Lighthouse verschränkt 5 Runden (Stufe C 12 → `C-lighthouse-v.md`), dann INP-Paare 3 Runden (→ `C-inp.md`). Alte Läufe unter `$S/stufe-c/lh-v-58a3344`.
     - Danach `lighthouse.mjs` um `--zustand` erweitern (Cookie per extraHeaders). Erst nach dem Lauf ändern: Jeder Aufruf lädt die Datei neu.
     - Dann `$S/abschluss-nach.sh`: Cockpit LH/axe/Bildsatz, Hauptansichten im Endzustand, Galerie, `$S/blind2` mit neuem Schlüssel.
  2. **Danach eintragen:**
     - Z-08 und A-01: Werte des Endstands, Paarregel, Cockpit.
     - Z-07 und Z-09: Cockpit.
     - BERICHT: Zahlen „Leistung“ und Restbefunde.
     - STUFE-C3 §12.
  3. **Endprüfung maßgeblich:** `endpruefung.workflow.js`, `blind` = `$S/blind2`, Schlüssel aus `$S/blind2-schluessel.json`, `stand` neu.
     - Prompt geändert, damit alles frisch läuft. A-02-Werte aus dem Ergebnis nachtragen; wenn sie abweichen, erneut prüfen.
     - Urteil wörtlich in BERICHT, CLAUDE.md-Block entfernen, Vorab, FF main, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand 325c38a (Anmeldestand `head/verwaltung-werkzeug`). Dev 3200 gestoppt.
  - 3200 Entwicklung (gestoppt; pglite-hf12, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 325c38a (Stufe C 1–11, release:check, vercel build preview + production). main = 2b930f7.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
