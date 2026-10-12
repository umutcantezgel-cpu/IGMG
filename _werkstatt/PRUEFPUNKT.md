# PRÜFPUNKT

- **Nächster exakter Schritt (15:15 UTC):**
  1. **Sichtabnahme C3** läuft als Workflow `wf_d40c0674-9bf` (Skript `werkzeuge/sichtabnahme.workflow.js`, Bilder `$S/bilder/c3` und `bilder/C3-verwaltung`). Ergebnis als `berichte/SICHTABNAHME-C3.md` übernehmen. Ansichten unter 8 oder Kategorien unter 7 werden zu H-F-Paketen (hb-welle). Danach Neubau, Bildsatz mit `--warte 3000`, Galerie.
  2. **Produktion** nach FF fc08263 per MCP lesen (Deployment READY, Laufzeitfehler).
  3. **Endprüfung:**
     - ABNAHME Stand/Beleg füllen.
     - `blind-vorbereiten.py --vorher bilder/e0 --nachher bilder/abschluss --aus $S/blind --schluessel $S/blind-schluessel.json`.
     - `endpruefung.workflow.js` mit `{blind, schluessel, abnahme, bewegung: bilder/abschluss/momente, stand}`.
     - Urteil wörtlich in BERICHT, dann den CLAUDE.md-Block entfernen, Commit, Push, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand de91dcd (Anmeldestand `head/verwaltung-werkzeug`). Dev 3200 gestoppt.
  - 3200 Entwicklung (pglite-h10, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** fc08263 (release:check bestanden, vercel build --prod grün). main = fc08263.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
