# PRÜFPUNKT

- **Nächster exakter Schritt (06:55 UTC):**
  1. **Stufe-C-Nacharbeit committen** (nach grünen Unit-Tests). Inhalt:
     - Z-03: Mail-Maße in `farben.ts` (`MAILMASS`), Dialog-Utilities `breite-dialog`/`hoehe-dialog`/`max-w-dialog`, OrgCard `leading-tight`/`underline-offset-5`, Druck `var(--color-weiss)`, belegte Ausnahmen in REFERENZ §1.
     - Z-06: `aria-hidden="true"` explizit in FormWizard, `tor/svg3.mjs` ohne `_lauf/`, Icon-Familie in K-008.
     - Z-07: Platzhalter-Pillen deckend (axe „unklar“), Tastaturregel erkennt den Fokusring am ALTCHA-Rahmen (`bilder/Z07-altcha/`).
     - Z-05: B-06/B-09 starten nach Ruhe (`useNachRuhe`, `NachRuhe`); B-03 für Radix-Dialog und Kontomenü der Verwaltung; Register-Notiz zu den wirkungslosen shadcn-Klassen.
     - Z-02: F-08-Erwartung (H-B11-Schreibweise).
     - Z-11: `protokolle/C-vercel-mcp.md`.
  2. **3500 neu bauen** vom neuen Commit (`$SCRATCHPAD/head/e4-bau.sh <rev>`, Dev 3200 vorher aus, wegen OOM).
  3. **Nachmessung (Haiku):** betroffene Stufe-C-Schritte gegen 3500. Das sind Bildsatz, axe, Tastatur, freie Werte, SVG, Bildrate b06/b09, Konsole, Statuscodes, Funktionsliste, vercel build und release:check, dazu Lighthouse-Paare verschränkt ×5. Danach STUFE-C.md und H-L01.md fortschreiben.
  4. **E2E-Suite** (`$SCRATCHPAD/e2e-brief.md`, Port 3700; Worktree auf den neuen Stand umstellen).
  5. **Sichtabnahme** des neuen Bildsatzes, Abschlussbilder und Galerie erneuern.
  6. **FF main** nach L-E01, danach Produktion per MCP lesen.
  7. **Endprüfung:** `blind-vorbereiten.py` + `endpruefung.workflow.js`. Urteil wörtlich, ABNAHME-Häkchen, BERICHT. Dann CLAUDE.md-Block entfernen, Commit, Push, ABSCHLUSS.
- **Server:**
  - 3100 Ausgangsstand 9ebb4bc.
  - 3400 E3-Tor-Prüfling.
  - 3500 Endstand 5d19108 (wird neu gebaut).
  - 3200 Entwicklung (pglite-h10; übernimmt Dateiänderungen derzeit nicht zuverlässig, für Proben nur mit Neustart über `$SCRATCHPAD/dev-neustart.sh`).
  - Postgres 16 lokal (5432).
- **Letzter grüner Commit:**
  - Branch: e0c8e9f (Perf III, Unit 797, tsc grün). Die Vorschau dpl_5RDkcAe97uNMjxwesxHAcGm4pZjc ist READY in fra1.
  - main: 71e263f, Produktion READY. Das Protokoll enthält nur die erwarteten Startprüfungs-Meldungen über fehlende Menschen-Werte (`protokolle/C-vercel-mcp.md`).
- **Git während der Nachmessung:** 159 Protokolle `_werkstatt/protokolle/C-*` stehen auf `assume-unchanged` (Liste `$SCRATCHPAD/c-dateien.txt`). In `.git/info/exclude` steht der Block `stufe-c2-laufend`. Nach dem Lauf zurücksetzen: `xargs -a $SCRATCHPAD/c-dateien.txt git update-index --no-assume-unchanged`, den Block aus `.git/info/exclude` entfernen, dann alles committen.
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
