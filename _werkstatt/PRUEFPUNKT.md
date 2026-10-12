# PRÜFPUNKT

- **Nächster exakter Schritt (09:05 UTC):**
  1. **H-E-Welle 1 läuft** als zwei `hb-welle`-Workflows: A = H-E01, 03, 05, 07; B = H-E02, 04, 06, 08. Paketaufträge liegen unter `pakete/H-E/`, Bericht `berichte/SICHTABNAHME-C2.md`. Nach den Workflows:
     - Ergebnisse sichten und gemeinsame Dateien nachziehen (REFERENZ §1 `bogen.ts EINTRITT`, REFERENZ §2).
     - Stufe A gesamt prüfen: tsc, eslint, Unit, `sprachen:pruefen`, freie Werte.
     - Bilder sichten, dann committen.
  2. **H-E-Welle 2:** H-E09–14 (H-E14: die CSS-Zeile ist gesetzt, der Baumeister zieht nur den Kommentar in `morph.ts` nach).
  3. **Endstand:** 3500 neu bauen (`head/e4-bau.sh <rev>`). Dann Stufe-C-Schritte 1, 2, 5, 6, 7 und 9–11, anschließend bei ruhiger Last 12 (`LH_RUNDEN=5`) und `inp-paare.sh 3`. Danach die ALTCHA-E2E einzeln wiederholen (Mitgliedsantrag, Voranmeldung, Eingänge) und `abschluss-kopieren.sh` + `galerie.mjs` ausführen.
  4. **FF main** nach L-E01, danach die Produktion per MCP lesen.
  5. **Endprüfung:** `blind-vorbereiten.py` + `endpruefung.workflow.js`. Urteil wörtlich übernehmen, ABNAHME-Häkchen setzen, BERICHT schreiben. Dann CLAUDE.md-Block entfernen, Commit, Push, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand f2a5f8d (Anmeldestand `head/verwaltung-werkzeug`).
  - 3200 Entwicklung (pglite-h10, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** c6c96ba (Unit 804, tsc grün). main = 71e263f, Produktion READY.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
