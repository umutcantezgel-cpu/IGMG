# PRÜFPUNKT

- **Nächster exakter Schritt:** Sauberen Build d17c02b (`$SCRATCHPAD/bau-sauber`, Log `bau-d17c02b.log`) abwarten → Standalone auf Port 3400 starten → B-05-Probe (`_werkstatt/werkzeuge/vt-probe.mjs`, `vt-probe3.mjs`) → E2-Tor wiederholen (Bildsatz, Bewegung, axe, Lighthouse gegen genau diesen Build; der erste Tor-Lauf maß einen veralteten Build, L-E09) → frischer Opus-Unteragent für die Sichtabnahme der Startseite → Befunde als Pakete.
- **B-05 (offen):** Im veralteten Build löste `<ViewTransition>` nicht aus. Instrumentiert: Der Seitentausch-Commit lief auf einer Transition-Lane, der eingehängte Teilbaum trug aber keinen ViewTransition-Merker. Erst am sauberen Build neu bewerten. Ausweg, falls es bleibt: VT im `[locale]`-Layout mit `update` und Link-`transitionTypes` (Next-Doku view-transitions.md).
- **Laufende Pakete:** H-A05 Korankurse, H-A07 Kontakt, H-G01 Header/Mobilmenü, H-G03 Gebetszeiten-Leiste.
- **Offene Pakete:** E0-PRUEFER-03 (Funktionsliste gegen 3100), O-10–O-13 (Opus), H-G02, H-G04, H-Z01/Z02, H-W01–W03, H-V07/V08/V10, H-R01, H-L01, H-D04, H-B (PLAN 1.1).
- **Letzter grüner Commit:** d17c02b (Branch; tsc grün, Formular-Integration 19/19 grün) · fe97c33 (main, unverändert).
- **Server:** 3100 eingefrorener Ausgangsstand (PID 11372, nie beenden) · 3200 Entwicklung (`localhost`, bei veraltetem Stand `$SCRATCHPAD/dev-neustart.sh`) · 3300 veralteter Tor-Build (PID 7699, darf beendet werden). Postgres 16 lokal (5432, Rolle igmg).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
