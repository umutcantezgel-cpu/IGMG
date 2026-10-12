# PRÜFPUNKT

- **Nächster exakter Schritt (23:05 UTC):**
  1. **Endprüfung Lauf 3** (Resume wf_dbbbeb44-b34): 9/12, offen Z-11. Befunde: ERROR-Vorschau 39c76b1 (PGlite-Abbruch beim Bau ohne Datenbank) und Turbopack-Warnung durch speicher-probe.ts.
     - Behoben in f9f7016/90bb76d, Vorab 90bb76d grün, FF main → 90bb76d.
     - Vorschau und Produktion 90bb76d READY ohne Warnung, keine Laufzeitfehler.
     - Dokumentiert in 293303c (`C3b-vercel-mcp.md` Nachtrag 23:00, `C3b-vorschau-90bb76d-bau.md`, ABNAHME Z-02/Z-11/V-13).
  2. **Jetzt Endprüfer Lauf 4:** Resume von wf_dbbbeb44-b34 mit neuem `stand` (Blindvergleich aus dem Cache, Endprüfer frisch).
     - Bei Bestätigung: Urteil wörtlich in BERICHT, CLAUDE.md löschen (Datei bestand nur aus dem Block).
     - Dann Commit, Push, Vorab, FF main, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand e6d3341 (Anmeldestand `head/verwaltung-werkzeug`, neu 22:04). Dev 3200 gestoppt.
  - 3200 Entwicklung (gestoppt; pglite-hf12, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 90bb76d (Vorab: vercel build --prod, check 818, geheimnisse, Bauwarnung 0, Aborted 0; Integration betroffener Dateien 60/60). main = 90bb76d.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
