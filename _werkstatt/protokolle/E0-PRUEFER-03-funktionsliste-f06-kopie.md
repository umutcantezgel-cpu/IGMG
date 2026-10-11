# E0-PRUEFER-03 · Funktionsliste F-01 … F-24 · Stand http://127.0.0.1:3600

> Prüfkopie für F-06 (nicht maßgeblich für den Bestand): Im Testdatenbestand wurde nur der Termin „freitagsgebet-mit-anschliessendem-vortrag“ (einziger Termin mit anmeldungAktiv) auf 20.11.2026 16:30–18:00 Uhr verschoben, damit das Anmeldeformular erscheint. Eigener Port 3600 mit dieser Kopie; Cache beim Start erneuert (CACHE_ERNEUERN_BEIM_START=1, ADR 0017). Der Bestand wird nicht verändert.

Zeitpunkt: 2026-10-11T19:47:15.206Z · Browser: Chromium 141.0.7390.37 · Breiten: 390 und 1440, sofern nicht anders vorgesehen · Konzept-Hinweis: vorgemerkt (außer F-24) · Belegbilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste` · Verwaltungszustand: nein.

Ergebnis je Zeile: erfüllt, nicht erfüllt oder nicht prüfbar (mit Grund). Einzelprüfungen stehen unter „Einzelbefunde“. Messwerte zählen nicht zum Ergebnis. Formular-POSTs sind aus dem Netzwerk gezählt.

| ID | Funktion | Ablauf | 390 | 1440 |
|---|---|---|---|---|
| F-06 | Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal | Detail mit anmeldungAktiv; leer absenden; .ics | erfüllt | erfüllt |

## Einzelbefunde

### F-06 · Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal
- 390 px: **erfüllt** · Formular-POSTs: 1 · HTTP ≥ 400: keine
  - erfüllt · Detailseite HTTP 200 · 200
  - Messwert · Formularfelder · ["name","email","telefon","personen","einwilligung","website"]
  - erfüllt · Anmeldung: Fehlerzusammenfassung nach leerem Absenden („Verbindlich anmelden“) · {"text":"Bitte prüfen Sie die markierten Felder. Name: Bitte füllen Sie dieses Feld aus. E-Mail-Adresse: Bitte geben Sie eine gültige E-Mail-Adresse ein. Datenschutzerkl","feldLinks":3,"altcha":"geprüft nach 13 s"}
  - erfüllt · Anmeldung: Fokus in der Fehlerzusammenfassung · "Fokus"
  - erfüllt · iCal-Download: text/calendar mit TZID Europe/Berlin · {"status":200,"typ":"text/calendar; charset=utf-8"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 1 · HTTP ≥ 400: keine
  - erfüllt · Detailseite HTTP 200 · 200
  - Messwert · Formularfelder · ["name","email","telefon","personen","einwilligung","website"]
  - erfüllt · Anmeldung: Fehlerzusammenfassung nach leerem Absenden („Verbindlich anmelden“) · {"text":"Bitte prüfen Sie die markierten Felder. Name: Bitte füllen Sie dieses Feld aus. E-Mail-Adresse: Bitte geben Sie eine gültige E-Mail-Adresse ein. Datenschutzerkl","feldLinks":3,"altcha":"geprüft nach 17.8 s"}
  - erfüllt · Anmeldung: Fokus in der Fehlerzusammenfassung · "Fokus"
  - erfüllt · iCal-Download: text/calendar mit TZID Europe/Berlin · {"status":200,"typ":"text/calendar; charset=utf-8"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-1440-ende.jpg`

Technische Fehler des Werkzeugs: 0.
