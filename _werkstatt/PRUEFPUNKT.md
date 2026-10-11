# PRÜFPUNKT

- **Nächster exakter Schritt (23:15 UTC):** H-B-Welle 1 läuft in zwei Workflows: wf_cb1914bc-6df (H-B01 Listenkarten, H-B02 Tagesbogen/Leiste, H-B08 Startseite, H-B12 Über uns) und wf_9523f1c5-3b2 (H-B05 Verwaltungs-Hülle, H-B10 Kontakt, H-B11 Projekte). Skript: `/root/.claude/projects/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/workflows/scripts/hb-welle-wf_cb1914bc-6df.js`, Aufträge `$SCRATCHPAD/hb/H-Bxx.md`. Nach Abschluss: Ergebnisse lesen, bedarf_opus umsetzen (neu-uebersetzt.json, MENSCHEN, TEXTVORSCHLAEGE, KERN B-09), Berichte ablegen, pnpm check, Commit; dann Welle 2 (H-B03, H-B04, H-B06, H-B07, H-B09, H-B13, H-B14) mit demselben Skript; danach `$SCRATCHPAD/ff/vorab.sh <rev>` → Fast-Forward. Parallel: H-V08 (Haiku-Agent, Server 3500). Danach H-L01, Kür-Welle B (K-16/K-17, K-18, K-19), Stufe C.
- **Sichtabnahme E3:** `_werkstatt/berichte/SICHTABNAHME-E3.md` (Ø 6,29; Ziel ≥ 8). Welle 0 erledigt (ec02e62, e3198cc).
- **Entwicklungsserver 3200:** startet mit Test-Geheimnissen aus `$SCRATCHPAD/dev-geheimnisse.env` (dev-neustart.sh); Anmeldestand `$SCRATCHPAD/verwaltung-state.json` (Testkonto pruefer-dev2@example.test).
- **B-05:** eigener `SeitenUebergang` (L-E10) mit Morph (O-13); im Entwicklungsserver nachgewiesen (`werkzeuge/vt-status.mjs`: ready, Namen alt/neu). Nachweis am Produktions-Build im E3-TOR.
- **Laufende Pakete:** wf_cb1914bc-6df, wf_9523f1c5-3b2 (H-B-Welle 1), H-V08 (Agent).
- **Offene Pakete:** H-V08-Nachweis, H-L01, H-D04, H-B (nach Sichtabnahme), Kür K-02…K-20 (PLAN 1.1), Bilder der Verwaltung (Anmeldestand neu erzeugen).
- **Letzter grüner Commit:** e3198cc (Branch) · 25e8040 (main, Produktion READY, 0 Laufzeitfehler) · 8d79ddc (Unit grün, geheimnisse grün) · 93a0b3d (E3-Tor-Prüfling, Lauf grün außer 8c) · fe97c33 (main, unverändert).
- **Server:** 3100 Ausgangsstand (PID 18692, Routen-Cache bereinigt 21:17) · 3200 Entwicklung · 3400 E3-Tor-Prüfling 93a0b3d · 3500 HEAD bc4b5b7 (PID-Datei `$SCRATCHPAD/head/server.pid`). Postgres 16 lokal (5432).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
