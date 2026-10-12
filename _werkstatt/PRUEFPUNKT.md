# PRÜFPUNKT

- **Nächster exakter Schritt (22:15 UTC):**
  1. **Endprüfung Lauf 2** (wf_dbbbeb44-b34): 8/12 bestätigt. Z-11/Z-12 fehlten: V-11 Speicherprobe, V-05 große PDF.
     - Beides gebaut (1d9fef5), Review-Befunde behoben (e6d3341), belegt (`protokolle/C3b-v05-v11.md`).
     - Vorab 39c76b1 grün, FF main → 39c76b1. Produktion per MCP lesen, `C3b-vercel-mcp.md` und Z-11 ergänzen.
  2. **Danach Endprüfer erneut:** Resume von wf_dbbbeb44-b34 mit neuem `stand` (Blindvergleich aus dem Cache, Endprüfer frisch).
     - Bei Bestätigung: Urteil wörtlich in BERICHT, CLAUDE.md löschen (Datei bestand nur aus dem Block).
     - Dann Commit, Push, Vorab, FF main, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand e6d3341 (Anmeldestand `head/verwaltung-werkzeug`, neu 22:04). Dev 3200 gestoppt.
  - 3200 Entwicklung (gestoppt; pglite-hf12, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 39c76b1 (Vorab: vercel build --prod, check 818, geheimnisse; Integration 1420 an 1d9fef5; E2E 10/10 an e6d3341). main = 39c76b1.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
