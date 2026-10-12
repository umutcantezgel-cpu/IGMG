# PRÜFPUNKT

- **Nächster exakter Schritt (16:55 UTC):**
  1. **Befundwelle H-F, Welle 1:** läuft als zwei hb-welle-Workflows: `wf_3a40f904-4c3` (A: H-F01, 03, 05, 07) und `wf_999e16ff-979` (B: H-F02, 04, 06). Dev 3200 läuft (pglite-h10, Zustand `$S/verwaltung-state.json` gültig). Danach:
     - Ergebnisse sichten.
     - REFERENZ §2 nachziehen (Seitenende L-E15, Nachrichtenkarten, Tagesbogen).
     - Stufe A gesamt prüfen: tsc, eslint, Unit, sprachen, freie Werte.
     - Committen.
  2. **Welle 2:** H-F08–13. Die Vorbedingung H-F08 ist gesetzt (CSS-Regel und B-05-Vermerk, Commit nach 25ec8f4). Paketliste: `$S/hf-pakete.json`.
  3. **Danach:**
     - 3500 neu bauen.
     - Bildsatz der Hauptansichten mit `--warte 3000`, `abschluss-kopieren.sh` plus Übernahme, `galerie.mjs`.
     - Kurzprüfung: Konsole, axe, F-Liste, Unit/E2E-Teil.
     - Vorab-Prüfung, dann FF main.
  4. **Endprüfung** (Blindvergleich plus Endprüfer). Z-04 bei Bedarf als A-02 nach L7.
- **Während Welle H-F ausgeblendet:** Die Schreibrechte von Welle 1 (`$S/hf-w1-dateien.txt`) stehen auf assume-unchanged. Dazu stehen `_werkstatt/bilder/H-F*/` und `_werkstatt/protokolle/werkzeug-*` in `.git/info/exclude`. Nach der Welle zurücksetzen: `xargs -a $S/hf-w1-dateien.txt -d "\n" git update-index --no-assume-unchanged`, die zwei Zeilen aus `.git/info/exclude` löschen, dann die geprüften Änderungen committen.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Stand de91dcd (Anmeldestand `head/verwaltung-werkzeug`). Dev 3200 gestoppt.
  - 3200 Entwicklung (pglite-h10, Testkonto `pruefer-dev5`, `$SCRATCHPAD/verwaltung-state.json`). Neustart nur über `$SCRATCHPAD/dev-neustart.sh`, Anmeldung über `dev-anmeldung.sh <name>`.
  - Postgres 16 lokal (5432), E2E-Datenbank `igmg_e2e`.
- **Letzter grüner Commit:** fc08263 (release:check bestanden, vercel build --prod grün). main = fc08263.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
