# PRÜFPUNKT

- **Nächster exakter Schritt (04:55 UTC):**
  1. **Stufe C läuft** (Haiku-Prüfer): `werkzeuge/stufe-c.sh 5d19108` in drei Abschnitten (1–3, 5–11, zuletzt 4 = Lighthouse-Paar bei ruhiger Last). Protokoll `protokolle/C-lauf.log`, Bericht → `berichte/STUFE-C.md`.
  2. Danach **E2E-Suite** gegen den Endstand (eigener Port 3700, nie 3100; lokales Postgres 16 auf 5432; Mailpit-Binärdatei; UA-02).
  3. **Sichtabnahme** der Stufe-C-Bilder (`$SCRATCHPAD/bilder/stufe-c/`, Vergleich E4), bei Ansichten < 8 Nachpakete.
  4. **Abschlussbilder** nach `bilder/abschluss/` (Hauptansichten aus dem Stufe-C-Bildsatz, Momente, Seitenwechsel, Verwaltung) und `werkzeuge/galerie.mjs` → `bilder/galerie.html`.
  5. **FF main** auf den geprüften Stand (Stufe C Schritt 10 = vercel build preview + production; check aus release:check), danach Produktion per Vercel-MCP lesen.
  6. **Endprüfung:** `werkzeuge/blind-vorbereiten.py` (Schlüssel getrennt) + `werkzeuge/endpruefung.workflow.js` (args: blind, schluessel, abnahme, bewegung, stand). Urteil wörtlich in die letzte Antwort, ABNAHME.md Häkchen nach Beleg, BERICHT ergänzen.
  7. CLAUDE.md-Block entfernen, Commit, Push, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Endstand 5d19108 (Anmeldestand `$SCRATCHPAD/head/verwaltung-werkzeug/`).
  - **3200 Entwicklung ist aus:** OOM um 04:40, der Dev-Server war auf 7,5 GB angewachsen und riss den Build mit. Nur bei Bedarf mit `$SCRATCHPAD/dev-neustart.sh` starten (Sperre, Datenbank pglite-h10, Testkonto pruefer-dev4).
  - Postgres 16 lokal (5432).
- **Letzter grüner Commit:**
  - Branch: 5d19108, alle 13 H-C-Pakete, Unit 794, tsc grün.
  - main: 71e263f (Merge von PR #3 durch den Menschen, 05:18 UTC; Code = 5d19108), Produktion READY (dpl_5Tvd5XVW2BYimH1u2Bos6MeHBMa3), 0 Laufzeitfehler. Arbeitsbranch = 71e263f (Fast-Forward). Weitere Stände wieder per FF auf main.
- **Stufe-C-Protokolle während des Laufs ausgeblendet:** `.git/info/exclude` (Muster `_werkstatt/protokolle/C-*`) und `git update-index --assume-unchanged` für schon verfolgte C-Protokolle. Nach dem Lauf: Zeilen aus `.git/info/exclude` entfernen, `git update-index --no-assume-unchanged` je Datei, dann alle C-Protokolle committen.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
