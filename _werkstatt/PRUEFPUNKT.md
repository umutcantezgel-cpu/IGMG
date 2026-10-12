# PRÜFPUNKT

- **Nächster exakter Schritt (00:20 UTC):** H-B-Welle 2 Rest läuft: wf_38d1367b-576 (H-B03 Detailseiten, H-B04 Listen) und wf_3e3120f8-f48 (H-B09 Gebetszeiten, H-B13 Organisation, H-B14 Korankurse/404), Skript `_werkstatt/werkzeuge/hb-welle.workflow.js`, Aufträge `$SCRATCHPAD/hb/H-Bxx.md`. Parallel Vorab-Prüfung FF 6596a6e (`$SCRATCHPAD/ff/vorab-6596a6e.log`) → bei Grün `git push origin 6596a6e:main`, Produktion per MCP lesen. Nach Welle 2: bedarf_opus, Berichte, pnpm check, Commit, FF; dann neue Sichtabnahme (frische Opus-Prüfer, Ziel ≥ 8) mit frischem HEAD-Build und Bildsatz; danach H-L01, Kür-Welle B (K-16/K-17, K-18, K-19), Stufe C, Morgenbericht 05:00 UTC.
- **H-B Stand:** 9/14 abgenommen und committet (6596a6e): H-B01 8 · H-B02 8,5 · H-B05 8 · H-B06 8,5 · H-B07 8,5 · H-B08 8,5 · H-B10 8,5 · H-B11 8,5 · H-B12 8,5. H-V08 erledigt (01d9f2b).
- **Sichtabnahme E3:** `_werkstatt/berichte/SICHTABNAHME-E3.md` (Ø 6,29; Ziel ≥ 8). Welle 0 erledigt (ec02e62, e3198cc).
- **Entwicklungsserver 3200:** startet mit Test-Geheimnissen aus `$SCRATCHPAD/dev-geheimnisse.env` (dev-neustart.sh); Anmeldestand `$SCRATCHPAD/verwaltung-state.json` (Testkonto pruefer-dev2@example.test).
- **B-05:** eigener `SeitenUebergang` (L-E10) mit Morph (O-13); im Entwicklungsserver nachgewiesen (`werkzeuge/vt-status.mjs`: ready, Namen alt/neu). Nachweis am Produktions-Build im E3-TOR.
- **Laufende Pakete:** wf_38d1367b-576, wf_3e3120f8-f48 (H-B-Welle 2 Rest), Vorab-Prüfung FF 6596a6e.
- **Offene Pakete:** H-V08-Nachweis, H-L01, H-D04, H-B (nach Sichtabnahme), Kür K-02…K-20 (PLAN 1.1), Bilder der Verwaltung (Anmeldestand neu erzeugen).
- **Letzter grüner Commit:** 6596a6e (Branch, check 762 grün) · 25e8040 (main, Produktion READY, 0 Laufzeitfehler) · 8d79ddc (Unit grün, geheimnisse grün) · 93a0b3d (E3-Tor-Prüfling, Lauf grün außer 8c) · fe97c33 (main, unverändert).
- **Server:** 3100 Ausgangsstand (PID 18692, Routen-Cache bereinigt 21:17) · 3200 Entwicklung · 3400 E3-Tor-Prüfling 93a0b3d · 3500 HEAD bc4b5b7 (PID-Datei `$SCRATCHPAD/head/server.pid`). Postgres 16 lokal (5432).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
