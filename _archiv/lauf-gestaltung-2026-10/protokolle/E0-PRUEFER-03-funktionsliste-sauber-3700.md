# E0-PRUEFER-03 · Funktionsliste F-01 … F-24 · Stand http://127.0.0.1:3700

> Ersatzmessung für F-06 und F-23 auf einer bereinigten Kopie des eingefrorenen Ordners (Port 3700): Der gemeinsame Routen-Cache des Ordners basis-standalone war durch Testinstanzen ab 19:46 verändert worden. In der Kopie wurden nur diese Cache-Dateien (nach 19:40) entfernt; Datenbank: Kopie vom 19:31 (zusätzlich eine Testeinladung, Testkonto pruefer-f03). Nicht maßgeblich, bis 3100 bereinigt ist.

Zeitpunkt: 2026-10-11T20:10:51.603Z · Browser: Chromium 141.0.7390.37 · Breiten: 390 und 1440, sofern nicht anders vorgesehen · Konzept-Hinweis: vorgemerkt (außer F-24) · Belegbilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste` · Verwaltungszustand: nein.

Ergebnis je Zeile: erfüllt, nicht erfüllt oder nicht prüfbar (mit Grund). Einzelprüfungen stehen unter „Einzelbefunde“. Messwerte zählen nicht zum Ergebnis. Formular-POSTs sind aus dem Netzwerk gezählt.

| ID | Funktion | Ablauf | 390 | 1440 |
|---|---|---|---|---|
| F-06 | Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal | Detail mit anmeldungAktiv; leer absenden; .ics | nicht prüfbar | nicht prüfbar |
| F-23 | iCal-Abo je Organisation: gültiger Kalender, Zeiten | /api/ical/… | nicht erfüllt | nicht erfüllt |

## Einzelbefunde

### F-06 · Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal
- 390 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Detailseite HTTP 200 · 200
  - nicht prüfbar · Anmeldeformular: Pflichtfehler und Fokus · kein Formular gerendert (Anzeige „Anmeldung geschlossen“: ja); der einzige Termin mit anmeldungAktiv ist vergangen (beginn 2024-01-26)
  - erfüllt · iCal-Download: text/calendar mit TZID Europe/Berlin · {"status":200,"typ":"text/calendar; charset=utf-8"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-390-ende.jpg`
- 1440 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Detailseite HTTP 200 · 200
  - nicht prüfbar · Anmeldeformular: Pflichtfehler und Fokus · kein Formular gerendert (Anzeige „Anmeldung geschlossen“: ja); der einzige Termin mit anmeldungAktiv ist vergangen (beginn 2024-01-26)
  - erfüllt · iCal-Download: text/calendar mit TZID Europe/Berlin · {"status":200,"typ":"text/calendar; charset=utf-8"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-06-1440-ende.jpg`

### F-23 · iCal-Abo je Organisation: gültiger Kalender, Zeiten
- 390 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Kalender /api/ical/de/veranstaltungen: gültig · {"status":200,"ereignisse":13}
  - erfüllt · Kalender /api/ical/de/organisation/ana-teskilati: gültig · {"status":200,"ereignisse":4}
  - erfüllt · Kalender /api/ical/de/organisation/kadin-teskilati: gültig · {"status":200,"ereignisse":1}
  - erfüllt · Kalender /api/ical/de/organisation/genclik-teskilati: gültig · {"status":200,"ereignisse":1}
  - erfüllt · Kalender /api/ical/de/organisation/kadin-genclik-teskilati: gültig · {"status":200,"ereignisse":1}
  - nicht erfüllt · Startzeit im Kalender = Startzeit auf der Seite (Europe/Berlin) · {"seite":"13:30","kalender":"12:30","zeile":"DTSTART;TZID=Europe/Berlin:20240126T1230"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-23-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-23-390-ende.jpg`
- 1440 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Kalender /api/ical/de/veranstaltungen: gültig · {"status":200,"ereignisse":13}
  - erfüllt · Kalender /api/ical/de/organisation/ana-teskilati: gültig · {"status":200,"ereignisse":4}
  - erfüllt · Kalender /api/ical/de/organisation/kadin-teskilati: gültig · {"status":200,"ereignisse":1}
  - erfüllt · Kalender /api/ical/de/organisation/genclik-teskilati: gültig · {"status":200,"ereignisse":1}
  - erfüllt · Kalender /api/ical/de/organisation/kadin-genclik-teskilati: gültig · {"status":200,"ereignisse":1}
  - nicht erfüllt · Startzeit im Kalender = Startzeit auf der Seite (Europe/Berlin) · {"seite":"13:30","kalender":"12:30","zeile":"DTSTART;TZID=Europe/Berlin:20240126T1230"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-23-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-23-1440-ende.jpg`

Technische Fehler des Werkzeugs: 0.
