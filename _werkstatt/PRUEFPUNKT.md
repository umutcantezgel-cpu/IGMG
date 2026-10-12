# PRÜFPUNKT

- **Nächster exakter Schritt (04:45 UTC):** Build 5d19108 → 3500 (`$SCRATCHPAD/head/e4-bau.sh`), dann Stufe C durch Haiku-Prüfer (`werkzeuge/stufe-c.sh 5d19108`, in Abschnitten), Sichtabnahme der Stufe-C-Bilder, Endprüfung, BERICHT mit Galerie, FF main, ABSCHLUSS. Frühere Liste:
  1. **Workflow A** läuft (wf_6cee6c04-81e: H-C01 Listenkarten, H-C02 Detailköpfe, H-C09 Gebetszeit-Bausteine, H-C04 Verwaltungslisten). Ergebnis auswerten wie bei Welle B (Berichte `berichte/H-C0x.md` aus dem Workflow-Ergebnis, kann/soll-Restbefunde selbst, Stufe A, Commit je Paketgruppe).
  2. **H-L01 Teil II (Opus, nach H-C09):** Tagesbogen ohne islamischen Kalender im Browser – Datumszeilen (Wochentag · Hidschri) je Tag auf dem Server berechnen (`Tagesbogen.tsx`, `GebetszeitenSeite.tsx`), `TagesbogenLive.tsx` ohne `hijri.ts`/Intl-Wochentag; `uhr`-Format lazy. Danach `/gebetszeiten` JS < 180 kB prüfen.
  3. **H-C Welle 2** (H-C03, H-C05, H-C10, H-C11, H-C12, H-C13) mit `werkzeuge/hb-welle.workflow.js`, args {lauf:'E4', pakete aus `$SCRATCHPAD/hb/hc-pakete.json` (welle 2)}.
  4. Orchestrator-Aufgaben aus der Synthese: Achtstern-Band 48×20 (globals.css, PNG-Prüfung), `nachricht.bildPlatz` entfernen (nach H-C02), Qibla-Entfernung (nach H-C09), MENSCHEN (Entfernung Kaaba, Halbgeviertstrich), REFERENZ §2.
  5. Build des Stands → 3500 (`$SCRATCHPAD/head/e4-bau.sh <rev>`), **ruhige** Paarmessung 3100/3500 (Z-08), FF main (`$SCRATCHPAD/ff/vorab.sh <rev>`), Stufe C (`werkzeuge/stufe-c.sh <rev>`, durch Haiku-Prüfer), BERICHT/Galerie (`werkzeuge/galerie.mjs`), Endprüfung (`werkzeuge/blind-vorbereiten.py` + `werkzeuge/endpruefung.workflow.js`), ABSCHLUSS.
  6. **Morgenbericht 05:00 UTC** in BERICHT.md.
- **Entwicklungsserver 3200:** `$SCRATCHPAD/dev-neustart.sh` (mit Sperre, Datenbank `$SCRATCHPAD/pglite-h10`), Testkonto pruefer-dev4 (`$SCRATCHPAD/dev-anmeldung.sh`), Anmeldestand `$SCRATCHPAD/verwaltung-state.json`.
- **Letzter grüner Commit:** 5d19108 (Branch, alle H-C-Pakete, Unit 794, tsc grün) · 560161e (main, Produktion READY, 0 Laufzeitfehler).
- **Server:** 3100 Ausgangsstand 9ebb4bc · 3200 Entwicklung · 3400 E3-Tor-Prüfling · 3500 HEAD f44119b · 3600 f44119b + Leistungspatch I (Vergleich, `$SCRATCHPAD/perf/`).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
