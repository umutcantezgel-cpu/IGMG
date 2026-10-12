# PRÜFPUNKT

- **Nächster exakter Schritt (14:00 UTC):**
  1. **Endstand 58a3344 gemessen**, Protokolle in 6deda96, Einordnung folgt in `berichte/STUFE-C3.md`:
     - Stufe C 1–11 grün.
     - Lighthouse-Paarregel 11/11.
     - E2E: 562 grün, 7 rot. 6 davon sind ALTCHA-Rechenzeit (L-E07), die Wiederholung mit Retries läuft (`$S/e2e/altcha-wdh2.log`). Einer ist PWA-offline (Umgebung).
  2. **Offen aus dem Endstand:**
     - (a) JS /gebetszeiten 181,4 > 180 kB gz. Der Fix ist umgesetzt (76eda7a, 466ddfb; tsc/eslint grün), es fehlen Build und Nachmessung.
     - (b) INP-Regression beim Öffnen des Mobilmenüs, Ursache im Darstellungsverzug. Versuch mit `$S/menue-spur/inp-menue.mjs` (Varianten per CSS, bei ruhiger Last).
  3. **Danach:**
     - 3500 auf HEAD neu bauen (`head/e4-bau.sh`), dann Lighthouse und INP nachmessen, F-03, Bildsatz `--warte 3000` und Galerie, `pnpm release:check` komplett.
     - STUFE-C3 schreiben, FF main.
     - Endprüfung.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand f2a5f8d (Anmeldestand `head/verwaltung-werkzeug`). Dev 3200 gestoppt.
  - 3200 Entwicklung (pglite-h10, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** 8e93ef8 (Unit 804, tsc grün). main = 1ca46e0 (extern um 07:22 UTC gesetzt), Produktion READY mit zwei Laufzeitfehlern (siehe Schritt 1).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
