# PRÜFPUNKT

- **ABSCHLUSS (12.10.2026, 23:45 UTC):** Endprüfung Lauf 4 (Resume wf_dbbbeb44-b34, frischer Opus-Endprüfer) hat jedes Häkchen, jede AUSNAHME und jede UMGEBUNGSAUSNAHME gegen ihren Beleg bestätigt.
  - Kriterien 10/12 bestätigt. Z-04 und Z-08 sind durch A-02 und A-01 gedeckt (Ausnahmen 2 von 2, L7 eingehalten), UA-01–UA-04 bestätigt.
  - Das Urteil steht wörtlich in BERICHT und in `protokolle/C3b-endpruefung-lauf4.md`.
  - Der Orchestrator-Block (Root-`CLAUDE.md`, nur dieser Block, im Lauf angelegt) ist entfernt.
  - Es ist nichts mehr offen. Die nächsten Schritte sind Menschen-Aufgaben in `MENSCHEN.md` und `web/docs/GO-LIVE.md`.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand e6d3341 (Anmeldestand `head/verwaltung-werkzeug`, neu 22:04). Dev 3200 gestoppt.
  - 3200 Entwicklung (gestoppt; pglite-hf12, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 90bb76d (Vorab: vercel build --prod, check 818, geheimnisse, Bauwarnung 0, Aborted 0; Integration betroffener Dateien 60/60). main = 90bb76d.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
