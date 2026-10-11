# PRÜFPUNKT

- **Nächster exakter Schritt:** Ergebnis von Workflow wf_fb525305-e2a lesen (E3-Tor-Auswertung je Bereich + HEAD-Bilder unter `$SCRATCHPAD/bilder/head/`, Verwaltung unter `_werkstatt/bilder/HEAD-verwaltung/`) → E3-TOR-Bericht `_werkstatt/berichte/E3-TOR.md` schreiben → Sichtabnahme-Workflow (frische Opus-Prüfer: Startseite nach `$SCRATCHPAD/sichtabnahme/auftrag-e2.md`, übrige Ansichten nach `auftrag-e3-ansichten.md`, Verwaltung; adversariale Prüfung der Pakete; Synthese) → H-B-Pakete → pnpm check + Build auf HEAD → Fast-Forward auf main, Produktion per MCP lesen. Danach H-V08 (`$SCRATCHPAD/head/auftrag-v08.md`), H-L01, Kür.
- **B-05:** eigener `SeitenUebergang` (L-E10) mit Morph (O-13); im Entwicklungsserver nachgewiesen (`werkzeuge/vt-status.mjs`: ready, Namen alt/neu). Nachweis am Produktions-Build im E3-TOR.
- **Laufende Pakete:** Workflow wf_fb525305-e2a (Bilder HEAD bc4b5b7 am Server 3500 + E3-Auswertung).
- **Offene Pakete:** H-V08-Nachweis, H-L01, H-D04, H-B (nach Sichtabnahme), Kür K-02…K-20 (PLAN 1.1), Bilder der Verwaltung (Anmeldestand neu erzeugen).
- **Letzter grüner Commit:** 8d79ddc (Branch; Unit grün, geheimnisse grün) · 93a0b3d (E3-Tor-Prüfling, Lauf grün außer 8c) · fe97c33 (main, unverändert).
- **Server:** 3100 Ausgangsstand (PID 18692, Routen-Cache bereinigt 21:17) · 3200 Entwicklung · 3400 E3-Tor-Prüfling 93a0b3d · 3500 HEAD bc4b5b7 (PID-Datei `$SCRATCHPAD/head/server.pid`). Postgres 16 lokal (5432).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
