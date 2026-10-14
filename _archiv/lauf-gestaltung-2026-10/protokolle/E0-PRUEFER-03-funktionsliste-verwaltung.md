# E0-PRUEFER-03 · Funktionsliste F-01 … F-24 · Stand http://127.0.0.1:3500

> Verwaltungsteil (F-20, F-21) gegen die Ersatzinstanz 3500 (siehe Hauptprotokoll). Anmeldung mit anmeldung.mjs auf einer Kopie der Datenbank mit dem Testkonto pruefer-f03@example.test; Speichern und Hochladen nicht ausgeführt.

Zeitpunkt: 2026-10-11T19:46:16.627Z · Browser: Chromium 141.0.7390.37 · Breiten: 390 und 1440, sofern nicht anders vorgesehen · Konzept-Hinweis: vorgemerkt (außer F-24) · Belegbilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste` · Verwaltungszustand: ja.

Ergebnis je Zeile: erfüllt, nicht erfüllt oder nicht prüfbar (mit Grund). Einzelprüfungen stehen unter „Einzelbefunde“. Messwerte zählen nicht zum Ergebnis. Formular-POSTs sind aus dem Netzwerk gezählt.

| ID | Funktion | Ablauf | 390 | 1440 |
|---|---|---|---|---|
| F-20 | Verwaltung: Einladung, Passwort, TOTP, Anmeldung, Dashboard | Anmeldezustand (anmeldung.mjs) | – | erfüllt |
| F-21 | Verwaltung: Veranstaltung anlegen/bearbeiten, Medien hochladen | nur lesend (Speichern verboten) | – | nicht prüfbar |

## Einzelbefunde

### F-20 · Verwaltung: Einladung, Passwort, TOTP, Anmeldung, Dashboard
- 390 px: nicht vorgesehen (Erwartung: 1440 px)
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Dashboard mit Anmeldezustand (nicht Anmeldeseite) · {"status":200,"pfad":"/verwaltung"}
  - erfüllt · Dashboard-Überschrift sichtbar · "Übersicht"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-20-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-20-1440-ende.jpg`

### F-21 · Verwaltung: Veranstaltung anlegen/bearbeiten, Medien hochladen
- 390 px: nicht vorgesehen (Erwartung: 1440 px)
- 1440 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - Messwert · Veranstaltungsliste: HTTP · 200
  - Messwert · Formular „neu“ (lesend): HTTP / Felder · {"status":200,"felder":44}
  - Messwert · Medien (lesend): HTTP / Dateifelder · {"status":200,"dateifelder":1}
  - nicht prüfbar · Veranstaltung speichern, Medien hochladen (< 4 MB) · nur lesend erlaubt: Speichern und Hochladen nicht ausgeführt; gemessen wurden nur die Lesepfade (Messwerte oben)
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-21-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-21-1440-ende.jpg`

Technische Fehler des Werkzeugs: 0.
