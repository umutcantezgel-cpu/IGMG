# PRÜFPUNKT

- **Nächster exakter Schritt (18:20 UTC):**
  1. **Befundwelle H-F fertig:** Welle 1 in 1bbee03, Welle 2 in 6464993, alle 13 Pakete angenommen (8–8,5).
     - Vorfall: Dev-DB pglite-h10 beschädigt (Neuanmeldung durch einen Baumeister). `dev-neustart.sh` und `dev-anmeldung.sh` zeigen jetzt auf pglite-hf12.
  2. **Abschlussprüfung läuft:** `OHNE_RUHE=1 endstand.sh 325c38a`, Ablauf in `protokolle/C-endstand.log`: Build 3500, Stufe C 1–3 und 5–11, E2E. Danach:
     - JS-Kurzprüfung mit Lighthouse, 1 Lauf × 11 Routen.
     - Bildsatz der Hauptansichten mit `--warte 3000` nach `bilder/abschluss`, dazu Momente und Seitenwechsel aus `$S/bilder/stufe-c`.
     - `verwaltung-bilder.mjs` mit dem Zustand `head/verwaltung-werkzeug` nach `bilder/C3b-verwaltung`.
     - `galerie.mjs`.
     - ALTCHA-Wiederholung, falls nötig.
     - STUFE-C3 ergänzen.
     - Vorab-Prüfung, dann FF main.
  3. **Endprüfung:** Blindvergleich und Endprüfer. Z-04 bei Bedarf als A-02 nach L7.
- **Während der Abschlussprüfung ausgeblendet:** `_werkstatt/protokolle/C-*` (Liste `$S/ausgeblendet3.txt`, assume-unchanged) und die Zeile `_werkstatt/protokolle/C-*` in `.git/info/exclude`. Nach dem Lauf zurücksetzen und committen.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand de91dcd (Anmeldestand `head/verwaltung-werkzeug`). Dev 3200 gestoppt.
  - 3200 Entwicklung (pglite-h10, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** fc08263 (release:check bestanden, vercel build --prod grün). main = fc08263.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
