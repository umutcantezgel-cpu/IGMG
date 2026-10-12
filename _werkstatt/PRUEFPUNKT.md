# PRÜFPUNKT

- **Nächster exakter Schritt (19:05 UTC):**
  1. **Abschlussprüfung 325c38a fertig:** Stufe C 1–11 grün, E2E 563 grün.
     - Befund Kontaktdaten: Wettlauf mit der Hydrierung, Testfix 3ac362e, ML-28, `protokolle/C3-e2e-kontakt.md`.
  2. **Abschlussbilder:** `$S/abschluss-bilder.sh` lief durch (Bildsatz mit 3 s Wartezeit, Momente, Verwaltung `bilder/C3b-verwaltung`, Galerie). JS-Kurzprüfung → `protokolle/C3b-lh-js.md`.
     - Offen: JS-Werte in BERICHT (`JS_PLATZHALTER`) und STUFE-C3 §12 (`JS_NACHTRAG`) eintragen.
     - Dann Commit, Push, `$S/ff/vorab.sh HEAD`, FF main, Produktion per MCP lesen, Z-11 in ABNAHME.
  3. **Endprüfung:** Blindordner `$S/blind` und Schlüssel `$S/blind-schluessel.json` liegen bereit. Workflow `werkzeuge/endpruefung.workflow.js` mit `{blind, schluessel, abnahme, bewegung: bilder/abschluss/momente, stand}`.
     - Z-04 bei Bedarf als A-02 nach L7, mit Denkprotokoll: vier Wellen H-B, H-C, H-E, H-F.
     - Danach das Urteil wörtlich in BERICHT, CLAUDE.md-Block entfernen, Commit, Push, letzter FF und ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand 325c38a (Anmeldestand `head/verwaltung-werkzeug`). Dev 3200 gestoppt.
  - 3200 Entwicklung (gestoppt; pglite-hf12, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 325c38a (Stufe C 1–11, release:check, vercel build preview + production). main = fc08263.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
