# FEHLERSTATISTIK

Je Rolle und Pakettyp. Tritt ein Fehler zweimal auf, wird Vorlage, Briefing oder Muster verbessert (L6).

| Datum | Paket | Rolle | Pakettyp | Fehler | Folge / Verbesserung |
|---|---|---|---|---|---|
| 2026-10-11 | F07 | Orchestrator | Route Handler | GET-Routen `/api/altcha` und `/api/health` wurden mit Cache Components beim Bau statisch vorgerendert (Challenge und Health eingefroren); erst der Docker-Bau ohne Geheimnisse zeigte es | Muster: jeder Route Handler, der je Anfrage antworten muss, ruft zuerst `await connection()`; Sicherheitsprüfer-Punkt S9 „dynamische Routen wirklich dynamisch“ ergänzt |
| 2026-10-11 | D05 | Orchestrator | Server Action + Cache | Rennen: Ein öffentlicher Seitenaufbau, der während des Speicherns noch alte Daten gelesen hatte, endete nach `updateTag` und hinterließ einen veralteten Eintrag – dauerhaft, auch über einen Neustart (Plattencache). Nur im parallelen E2E-Lauf sichtbar | `src/lib/cache/aktualisieren.ts`: `inhaltGeaendert()` = `updateTag` sofort + `revalidateTag(…, { expire: 0 })` per `after()` nach 5 s; Beleg-Test (alter Titel nach 221 ms, neuer nach 6,6 s). Muster: Verwaltungs-Actions rufen nie `updateTag` direkt |
| 2026-10-11 | D05 | Orchestrator | Client-Komponente | Formular im Radix-Dropdown („Abmelden“) wurde nicht abgeschickt: Menü schließt beim Auswählen und entfernt seinen Inhalt samt Formular | Formular außerhalb des Menüs, Menüpunkt ruft `requestSubmit()`; Muster für Aktionen in Menüs und Dialogen |
| 2026-10-11 | D07 | Testschreiber (Haiku) → Befund an O | Bibliothek | `istGueltigeRegel` ließ doppelte Schlüssel durch („FREQ=DAILY;FREQ=HOURLY“ = stündlich); `darf()` warf bei Rollennamen wie „constructor“ | Schlüssel eindeutig, genau ein FREQ; `Object.hasOwn` vor Matrix-Zugriff. Lob: Negativtests aus Kriterien fanden echte Fehler |
