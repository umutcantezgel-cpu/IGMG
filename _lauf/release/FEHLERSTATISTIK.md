# FEHLERSTATISTIK – Release-Lauf

Je Rolle und Pakettyp. Tritt ein Fehler zweimal auf, wird die Vorlage, das Rollenbriefing oder das Muster verbessert (L6).

| Datum | Paket | Rolle/Modell | Fehlerart | Beschreibung | Maßnahme |
|---|---|---|---|---|---|
| 2026-10-11 | Übergang E2E | Orchestrator | Testumgebung | Der volle E2E-Lauf mit 2 Workern treibt die Last allein auf 19–28; 7 Specs brechen ab (ALTCHA nicht in 20 s gelöst; Weiterleitung nicht in 5 s). Mit 1 Worker bei Last < 12 sind alle grün | R-E10: volle Läufe über `scripts/schwer.mjs` mit `--workers 1`; Flake-Befund F-ÜB-01 ins Audit |
