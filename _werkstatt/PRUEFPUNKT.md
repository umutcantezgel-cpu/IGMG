# PRÜFPUNKT

- **Nächster exakter Schritt (02:10 UTC):**
  1. **Sichtabnahme E4** läuft (Workflow wf_9df3d301-a41, Werkzeug `werkzeuge/sichtabnahme.workflow.js`, args {lauf:'E4', bilder:'$SCRATCHPAD/bilder/e4', vorher:'$SCRATCHPAD/bilder/head', vorherName:'E3', …, praefix:'H-C'}). Ergebnis → `berichte/SICHTABNAHME-E4.md`; Ansichten < 8 als H-C-Pakete mit `werkzeuge/hb-welle.workflow.js` (Briefs in `$SCRATCHPAD/hb/`).
  2. **H-L01** läuft (`$SCRATCHPAD/hl01/lauf.sh`, Protokoll `protokolle/H-L01-lauf.log`, Ergebnisse `$SCRATCHPAD/hl01/route-NN-{3100,3500}.json`): 11 Routen × 3 Läufe je Server, fertig ≈ 02:50. Während der Messung keine Builds. Danach Mediane in `berichte/H-L01.md` (Z-08).
  3. **FF main** auf cd91898 (Kür-Welle B) nach der Messung: `$SCRATCHPAD/ff/vorab.sh <rev>` → `git push origin <rev>:main` → Produktion per Vercel-MCP lesen.
  4. **Stufe C** gegen frischen 3500-Build des letzten Stands (`$SCRATCHPAD/head/e4-bau.sh <rev>`), Ablauf nach `_werkstatt/werkzeuge/stufe-c.sh` (in Vorbereitung, Vorlage `lauf-e3tor.sh`).
  5. H-D04 MENSCHEN-Abschluss · BERICHT.md (Galerie, Zusammenführen/Zurückrollen) · Morgenbericht 05:00 UTC · Endprüfung (frischer Opus) · CLAUDE.md-Block entfernen · ABSCHLUSS.
- **H-B Stand:** 14/14 abgenommen (f44119b). Kür 20/20 (Welle B: ff45fef).
- **Entwicklungsserver 3200:** startet mit Test-Geheimnissen aus `$SCRATCHPAD/dev-geheimnisse.env` (dev-neustart.sh); Datenbank `$SCRATCHPAD/pglite-h03`, Anmeldestand `$SCRATCHPAD/verwaltung-state.json` (Testkonto pruefer-dev3@example.test).
- **Letzter grüner Commit:** ff45fef (Branch, Kür-Welle B, check grün) · f44119b (main, Produktion READY, keine App-Laufzeitfehler) · 6596a6e / 25e8040 / 8da8efe (frühere main-Stände, READY).
- **Server:** 3100 Ausgangsstand 9ebb4bc · 3200 Entwicklung · 3400 E3-Tor-Prüfling 93a0b3d · 3500 HEAD f44119b (PID-Datei `$SCRATCHPAD/head/server.pid`). Postgres 16 lokal (5432).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
