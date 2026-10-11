# PRÜFPUNKT

- **Nächster exakter Schritt:** E3-TOR-Rückgabe lesen (Server 3400, Build 6nu3tz58l2RtwYRUvlfzp = 93a0b3d) → frischer Opus-Unteragent für die Sichtabnahme der Startseite (Bilder `$SCRATCHPAD/bilder/e3-tor/`), eigene Sichtabnahme der übrigen Ansichten → Befundpakete H-B → bei grünem Tor Fast-Forward auf main und Produktions-Deployment per MCP lesen. Danach Stufe-C-Vorbereitung (H-L01 Paarmessung, H-V08 Nachweis).
- **B-05:** eigener `SeitenUebergang` (L-E10) mit Morph (O-13); im Entwicklungsserver nachgewiesen (`werkzeuge/vt-status.mjs`: ready, Namen alt/neu). Nachweis am Produktions-Build im E3-TOR.
- **Laufende Pakete:** E3-TOR, E0-PRUEFER-03 (Funktionsliste gegen 3100), H-R01 (Wortlaut), H-D05 (Runbook).
- **Offene Pakete:** H-Z02 (Lade-Zustände), H-W01–W03, H-V08-Nachweis, H-L01, H-D04, H-B (nach Sichtabnahme), Kür (PLAN 1.1).
- **Letzter grüner Commit:** 93a0b3d (sauberer Build, E2-TOR2: pnpm check grün) · d26e8bc (Branch, tsc/Lint grün) · fe97c33 (main, unverändert).
- **Server:** 3100 eingefrorener Ausgangsstand (PID 11372, nie beenden) · 3200 Entwicklung (`localhost`, bei veraltetem Stand `$SCRATCHPAD/dev-neustart.sh`) · 3300 veralteter Tor-Build (PID 7699, darf beendet werden). Postgres 16 lokal (5432, Rolle igmg).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
