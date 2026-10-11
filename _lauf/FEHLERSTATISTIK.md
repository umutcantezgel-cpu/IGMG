# FEHLERSTATISTIK

Je Rolle und Pakettyp. Tritt ein Fehler zweimal auf, wird Vorlage, Briefing oder Muster verbessert (L6).

| Datum | Paket | Rolle | Pakettyp | Fehler | Folge / Verbesserung |
|---|---|---|---|---|---|
| 2026-10-11 | F07 | Orchestrator | Route Handler | GET-Routen `/api/altcha` und `/api/health` wurden mit Cache Components beim Bau statisch vorgerendert (Challenge und Health eingefroren); erst der Docker-Bau ohne Geheimnisse zeigte es | Muster: jeder Route Handler, der je Anfrage antworten muss, ruft zuerst `await connection()`; Sicherheitsprüfer-Punkt S9 „dynamische Routen wirklich dynamisch“ ergänzt |
