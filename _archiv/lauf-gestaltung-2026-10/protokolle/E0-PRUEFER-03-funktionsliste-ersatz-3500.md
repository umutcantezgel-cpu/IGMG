# E0-PRUEFER-03 · Funktionsliste F-01 … F-24 · Stand http://127.0.0.1:3500

> Ersatz für 3100: Der Prüfserver auf 3100 (PID 11372) ist nicht mehr erreichbar; gemessen wird eine zweite Instanz mit denselben eingefrorenen Dateien (basis-standalone, unverändert seit 17:24) und einer Kopie der Datenbank auf Port 3500. Nicht maßgeblich für 3100, bis 3100 wieder läuft und nachgemessen ist.

Zeitpunkt: 2026-10-11T19:42:40.286Z · Browser: Chromium 141.0.7390.37 · Breiten: 390 und 1440, sofern nicht anders vorgesehen · Konzept-Hinweis: vorgemerkt (außer F-24) · Belegbilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste` · Verwaltungszustand: nein.

Ergebnis je Zeile: erfüllt, nicht erfüllt oder nicht prüfbar (mit Grund). Einzelprüfungen stehen unter „Einzelbefunde“. Messwerte zählen nicht zum Ergebnis. Formular-POSTs sind aus dem Netzwerk gezählt.

| ID | Funktion | Ablauf | 390 | 1440 |
|---|---|---|---|---|
| F-01 | Startseite: Leiste, H1, Knöpfe, Veranstaltungen, Neuigkeiten | `/` öffnen | erfüllt | erfüllt |
| F-02 | Leiste auf jeder Seite außer Gebetszeiten | Leiste auf 19 Seiten; Telefon: aufklappen | erfüllt | erfüllt |
| F-03 | /gebetszeiten: Tabs, Tastatur, Monatstabelle, Qibla | Tabs per Tastatur; Monat; Kompass | nicht prüfbar | nicht prüfbar |
| F-04 | Gebetszeiten-Anzeige: Vollbild, Schließen, Sprachwechsel | /gebetszeiten/anzeige; X und Esc; 11 s warten | erfüllt | erfüllt |
| F-05 | Veranstaltungen: Kategoriefilter | Kategorie wählen; „Alle“ | erfüllt | erfüllt |
| F-06 | Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal | Detail mit anmeldungAktiv; leer absenden; .ics | nicht prüfbar | nicht prüfbar |
| F-07 | Nachrichten: Filter, Ankündigungen, Detail mit ähnlichen Artikeln | Filter; Detail | nicht prüfbar | nicht prüfbar |
| F-08 | Über uns, Projekte, Vorstand, IGMG (Tabs) | vier Seiten; Tabs | erfüllt | erfüllt |
| F-09 | Organisationen (vier): Name, Akzentfarbe, Termine | vier Seiten | erfüllt | erfüllt |
| F-10 | Korankurse: Kurskarten und Aktionen | Karten; register / join / closed | erfüllt | erfüllt |
| F-11 | Voranmeldung: vier Schritte, Weiter/Zurück, ohne JS sendbar | Schritte; leer Weiter; Testwerte; Zurück | erfüllt | erfüllt |
| F-12 | Kontakt: Pflichtprüfung, Karte nach Klick | leer absenden; Karte | nicht prüfbar | nicht prüfbar |
| F-13 | Mitglied werden, Moschee-Anfrage, Meldung: Pflichtprüfung | leer Weiter bzw. Senden | erfüllt | erfüllt |
| F-14 | Suche: Ergebnisse, noindex | /suche?q=Gebet | nicht erfüllt | nicht erfüllt |
| F-15 | Sprachwahl de → tr → en, lokalisierter Pfad | Sprachwahl bzw. Menü | erfüllt | erfüllt |
| F-16 | Unbekannte Adresse: 404 mit Weg zurück | /nicht-vorhanden-xyz | erfüllt | erfüllt |
| F-17 | Offline-Seite und Service Worker | /offline; sw.js; offline laden | erfüllt | erfüllt |
| F-18 | Mobilmenü (390): öffnen, Fokus, Esc | Menü öffnen; Tab; Esc | nicht erfüllt | – |
| F-19 | Sprunglink „Zum Inhalt“ | erster Tab-Halt; Enter | erfüllt | erfüllt |
| F-20 | Verwaltung: Einladung, Passwort, TOTP, Anmeldung, Dashboard | Anmeldezustand (anmeldung.mjs) | – | nicht prüfbar |
| F-21 | Verwaltung: Veranstaltung anlegen/bearbeiten, Medien hochladen | nur lesend (Speichern verboten) | – | nicht prüfbar |
| F-22 | /api/health | GET /api/health | erfüllt | erfüllt |
| F-23 | iCal-Abo je Organisation: gültiger Kalender, Zeiten | /api/ical/… | nicht erfüllt | nicht erfüllt |
| F-24 | Konzept-Hinweis: erster Besuch, schließen, nicht wieder | frischer Kontext; schließen; neu laden | erfüllt | erfüllt |

## Einzelbefunde

### F-01 · Startseite: Leiste, H1, Knöpfe, Veranstaltungen, Neuigkeiten
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - Messwert · Browseruhr fest auf 12:00 Berlin (Laufzeit-Uhrzeit Berlin: 21:42:40) · "2026-10-11T10:00:00.000Z"
  - erfüllt · HTTP 200 · 200
  - erfüllt · Leiste: sechs Gebetszeiten sichtbar · 6
  - erfüllt · Leiste: „Nächstes Gebet“ und Restzeit nach Hydrierung · "Wetzlar, Deutschland · So., 11. Okt. berechnet Nächstes Gebet Dhuhr · 13:18 Uhr verbleibt: 1 Std. 18 Min. Zeiten ausblenden Imsak 05:53 Aufgang 07:35 Dhuhr 13:18 Asr 16:10 Maghrib "
  - erfüllt · H1 „IGMG Wetzlar“ · "IGMG Wetzlar"
  - erfüllt · „Gemeinde beitreten“ → /mitglied-werden · "/mitglied-werden"
  - erfüllt · „Mehr erfahren“ (Hero) → /ueber-uns · "/ueber-uns"
  - erfüllt · bis zu 6 kommende Veranstaltungen · 5
  - erfüllt · Aufmacher + 3 Neuigkeiten (4 Artikel) · {"artikel":4}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-01-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-01-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - Messwert · Browseruhr fest auf 12:00 Berlin (Laufzeit-Uhrzeit Berlin: 21:42:42) · "2026-10-11T10:00:00.000Z"
  - erfüllt · HTTP 200 · 200
  - erfüllt · Leiste: sechs Gebetszeiten sichtbar · 6
  - erfüllt · Leiste: „Nächstes Gebet“ und Restzeit nach Hydrierung · "Wetzlar, Deutschland So., 11. Okt. · 12:00 Uhr berechnet Imsak 05:53 Aufgang 07:35 Nächstes Gebet Dhuhr 13:18 verbleibt: 1 Std. 18 Min. Asr 16:10 Maghrib 18:50 Isha 20:25 Alle Gebe"
  - erfüllt · H1 „IGMG Wetzlar“ · "IGMG Wetzlar"
  - erfüllt · „Gemeinde beitreten“ → /mitglied-werden · "/mitglied-werden"
  - erfüllt · „Mehr erfahren“ (Hero) → /ueber-uns · "/ueber-uns"
  - erfüllt · bis zu 6 kommende Veranstaltungen · 5
  - erfüllt · Aufmacher + 3 Neuigkeiten (4 Artikel) · {"artikel":4}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-01-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-01-1440-ende.jpg`

### F-02 · Leiste auf jeder Seite außer Gebetszeiten
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Leiste auf / · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /veranstaltungen · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /nachrichten · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /ueber-uns · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /projekte · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /vorstand · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /igmg · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /organisationen/ana-teskilati · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /bildung/korankurse · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /bildung/voranmeldung · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /kontakt · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /mitglied-werden · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /webseite-fuer-moscheen · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /meldung · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /suche?q=Gebet · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /nachrichten/neue-gebetszeiten-fuer-den-winter · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /islamisches-wissen · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /quran · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · keine Leiste auf /gebetszeiten · {"status":200}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-02-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-02-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Leiste auf / · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /veranstaltungen · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /nachrichten · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /ueber-uns · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /projekte · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /vorstand · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /igmg · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /organisationen/ana-teskilati · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /bildung/korankurse · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /bildung/voranmeldung · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /kontakt · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /mitglied-werden · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /webseite-fuer-moscheen · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /meldung · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /suche?q=Gebet · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /nachrichten/neue-gebetszeiten-fuer-den-winter · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /islamisches-wissen · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /quran · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · keine Leiste auf /gebetszeiten · {"status":200}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-02-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-02-1440-ende.jpg`

### F-03 · /gebetszeiten: Tabs, Tastatur, Monatstabelle, Qibla
- 390 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · keine Leiste auf /gebetszeiten · "aside-Zahl 0"
  - erfüllt · vier Tabs · ["Heute","Monatlich","Qibla","Einstellungen"]
  - erfüllt · Tabs per Tastatur (Pfeil rechts, Ende, Pos1) · {"nachPfeil":["Monatlich"],"nachEnde":["Einstellungen"],"nachPos1":["Heute"]}
  - Messwert · Monatlich: sichtbare Tabellenüberschriften · ["Oktober 2026 – Gebetszeiten","November 2026 – Gebetszeiten"]
  - erfüllt · Monatstabelle mit Überschrift „Gebetszeiten“ · "Oktober 2026 – Gebetszeiten"
  - nicht prüfbar · Monat wechselt · Im Bestand gibt es kein Bedienelement für einen Monatswechsel; die Tabelle zeigt den laufenden Monat (Messwert oben). OFFENE FRAGE: Was „Monat wechselt“ genau prüfen soll.
  - erfüllt · Qibla-Kompass sichtbar · 1
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-03-monat-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-03-qibla-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-03-390-ende.jpg`
- 1440 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · keine Leiste auf /gebetszeiten · "aside-Zahl 0"
  - erfüllt · vier Tabs · ["Heute","Monatlich","Qibla","Einstellungen"]
  - erfüllt · Tabs per Tastatur (Pfeil rechts, Ende, Pos1) · {"nachPfeil":["Monatlich"],"nachEnde":["Einstellungen"],"nachPos1":["Heute"]}
  - Messwert · Monatlich: sichtbare Tabellenüberschriften · ["Oktober 2026 – Gebetszeiten","November 2026 – Gebetszeiten"]
  - erfüllt · Monatstabelle mit Überschrift „Gebetszeiten“ · "Oktober 2026 – Gebetszeiten"
  - nicht prüfbar · Monat wechselt · Im Bestand gibt es kein Bedienelement für einen Monatswechsel; die Tabelle zeigt den laufenden Monat (Messwert oben). OFFENE FRAGE: Was „Monat wechselt“ genau prüfen soll.
  - erfüllt · Qibla-Kompass sichtbar · 1
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-03-monat-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-03-qibla-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-03-1440-ende.jpg`

### F-04 · Gebetszeiten-Anzeige: Vollbild, Schließen, Sprachwechsel
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · Vollbild mit Überschrift · "Heutige Gebetszeiten"
  - erfüllt · Knopf „Vollbild schließen“ · 1
  - erfüllt · Sprache wechselt nach ~10 s · {"vorher":"Heutige Gebetszeiten","nachher":"Bugünkü Namaz Vakitleri"}
  - erfüllt · X schließt → /gebetszeiten · "/gebetszeiten"
  - erfüllt · Esc schließt → /gebetszeiten · "/gebetszeiten"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-04-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-04-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · Vollbild mit Überschrift · "Heutige Gebetszeiten"
  - erfüllt · Knopf „Vollbild schließen“ · 1
  - erfüllt · Sprache wechselt nach ~10 s · {"vorher":"Heutige Gebetszeiten","nachher":"Bugünkü Namaz Vakitleri"}
  - erfüllt · X schließt → /gebetszeiten · "/gebetszeiten"
  - erfüllt · Esc schließt → /gebetszeiten · "/gebetszeiten"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-04-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-04-1440-ende.jpg`

### F-05 · Veranstaltungen: Kategoriefilter
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - Messwert · Karten gesamt · 5
  - erfüllt · Kategoriefilter blendet andere Karten aus · {"chip":"Bildung","anzahl":3,"kategorien":["bildung"]}
  - erfüllt · „Alle“ zeigt wieder alle Karten · {"gesamt":5,"nachAlle":5}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-05-filter-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-05-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - Messwert · Karten gesamt · 5
  - erfüllt · Kategoriefilter blendet andere Karten aus · {"chip":"Bildung","anzahl":3,"kategorien":["bildung"]}
  - erfüllt · „Alle“ zeigt wieder alle Karten · {"gesamt":5,"nachAlle":5}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-05-filter-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-05-1440-ende.jpg`

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

### F-07 · Nachrichten: Filter, Ankündigungen, Detail mit ähnlichen Artikeln
- 390 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - Messwert · Artikel gesamt · 10
  - erfüllt · Kategoriefilter wirkt (Liste ändert sich) · {"chip":"Ankündigungen 2 Nachrichten","anzahl":2,"gedrückt":"true"}
  - erfüllt · „Alle“ stellt die Liste wieder her · 10
  - nicht prüfbar · Ankündigungen · kein Abschnitt „Ankündigungen“: im Bestand ist keine Ankündigung veröffentlicht; der Abschnitt wird dann nicht gerendert
  - erfüllt · Detail HTTP 200 · 200
  - erfüllt · Detail mit ähnlichen Artikeln · 1
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-07-liste-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-07-detail-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-07-390-ende.jpg`
- 1440 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - Messwert · Artikel gesamt · 10
  - erfüllt · Kategoriefilter wirkt (Liste ändert sich) · {"chip":"Ankündigungen 2 Nachrichten","anzahl":2,"gedrückt":"true"}
  - erfüllt · „Alle“ stellt die Liste wieder her · 10
  - nicht prüfbar · Ankündigungen · kein Abschnitt „Ankündigungen“: im Bestand ist keine Ankündigung veröffentlicht; der Abschnitt wird dann nicht gerendert
  - erfüllt · Detail HTTP 200 · 200
  - erfüllt · Detail mit ähnlichen Artikeln · 1
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-07-liste-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-07-detail-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-07-1440-ende.jpg`

### F-08 · Über uns, Projekte, Vorstand, IGMG (Tabs)
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /ueber-uns: 200, H1, Inhalt · {"status":200,"h1":"Über uns","zeichen":3328}
  - erfüllt · /projekte: 200, H1, Inhalt · {"status":200,"h1":"Gemeinsam Glauben, Gemeinsam Wachsen","zeichen":2517}
  - erfüllt · /vorstand: 200, H1, Inhalt · {"status":200,"h1":"Unser Vorstand","zeichen":3745}
  - erfüllt · /igmg: 200, H1, Inhalt · {"status":200,"h1":"IGMG - Islamische Gemeinschaft Millî Görüş","zeichen":829}
  - erfüllt · /igmg: Tabs zeigen Inhalt · {"tabs":5,"zeichen":[699,1045,1716,1175,98]}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-08-igmg-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-08-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /ueber-uns: 200, H1, Inhalt · {"status":200,"h1":"Über uns","zeichen":3328}
  - erfüllt · /projekte: 200, H1, Inhalt · {"status":200,"h1":"Gemeinsam Glauben, Gemeinsam Wachsen","zeichen":2517}
  - erfüllt · /vorstand: 200, H1, Inhalt · {"status":200,"h1":"Unser Vorstand","zeichen":3745}
  - erfüllt · /igmg: 200, H1, Inhalt · {"status":200,"h1":"IGMG - Islamische Gemeinschaft Millî Görüş","zeichen":829}
  - erfüllt · /igmg: Tabs zeigen Inhalt · {"tabs":5,"zeichen":[699,1045,1716,1175,98]}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-08-igmg-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-08-1440-ende.jpg`

### F-09 · Organisationen (vier): Name, Akzentfarbe, Termine
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · ana-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Ana Teşkilatı","akzent":{"erwartet":"rgb(4, 120, 87)","gefunden":true,"klasse":"border-org-at","wert":"rgb(4, 120, 87)"},"termine":2}
  - erfüllt · kadin-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Kadın Teşkilatı","akzent":{"erwartet":"rgb(89, 46, 129)","gefunden":true,"klasse":"border-org-kt","wert":"rgb(89, 46, 129)"},"termine":1}
  - erfüllt · genclik-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Gençlik Teşkilatı","akzent":{"erwartet":"rgb(0, 140, 152)","gefunden":true,"klasse":"border-org-gt","wert":"rgb(0, 140, 152)"},"termine":1}
  - erfüllt · kadin-genclik-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Kadın Gençlik Teşkilatı","akzent":{"erwartet":"rgb(155, 37, 90)","gefunden":true,"klasse":"border-org-kgt","wert":"rgb(155, 37, 90)"},"termine":1}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-09-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-09-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · ana-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Ana Teşkilatı","akzent":{"erwartet":"rgb(4, 120, 87)","gefunden":true,"klasse":"border-org-at","wert":"rgb(4, 120, 87)"},"termine":2}
  - erfüllt · kadin-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Kadın Teşkilatı","akzent":{"erwartet":"rgb(89, 46, 129)","gefunden":true,"klasse":"border-org-kt","wert":"rgb(89, 46, 129)"},"termine":1}
  - erfüllt · genclik-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Gençlik Teşkilatı","akzent":{"erwartet":"rgb(0, 140, 152)","gefunden":true,"klasse":"border-org-gt","wert":"rgb(0, 140, 152)"},"termine":1}
  - erfüllt · kadin-genclik-teskilati: 200, Name, Akzentfarbe, Termine · {"status":200,"h1":"Kadın Gençlik Teşkilatı","akzent":{"erwartet":"rgb(155, 37, 90)","gefunden":true,"klasse":"border-org-kgt","wert":"rgb(155, 37, 90)"},"termine":1}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-09-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-09-1440-ende.jpg`

### F-10 · Korankurse: Kurskarten und Aktionen
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · „register“ → Voranmeldung · [{"text":"Zur Voranmeldung","href":"/bildung/voranmeldung"}]
  - erfüllt · „join“ → /kontakt#karte · [{"text":"Einfach teilnehmen","href":"/kontakt#karte"}]
  - erfüllt · „closed“ ohne Aktion · []
  - Messwert · Kurskarten · 3
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-10-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-10-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · „register“ → Voranmeldung · [{"text":"Zur Voranmeldung","href":"/bildung/voranmeldung"}]
  - erfüllt · „join“ → /kontakt#karte · [{"text":"Einfach teilnehmen","href":"/kontakt#karte"}]
  - erfüllt · „closed“ ohne Aktion · []
  - Messwert · Kurskarten · 3
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-10-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-10-1440-ende.jpg`

### F-11 · Voranmeldung: vier Schritte, Weiter/Zurück, ohne JS sendbar
- 390 px: **erfüllt** · Formular-POSTs: 3 · HTTP ≥ 400: keine
  - erfüllt · ohne JavaScript: Formular mit POST und Weiter-Knopf (nicht ausgelöst) · {"formular":true,"aktion":"","methode":"POST","knopf":true}
  - erfüllt · HTTP 200 · 200
  - erfüllt · vier Schritte, Schritt 1 aktiv · {"anzahl":4,"aktiv":0}
  - erfüllt · Weiter ohne Eingaben: Pflichtprüfung, Schritt bleibt · {"anzahl":4,"aktiv":0,"alarm":1}
  - erfüllt · Weiter mit Testwerten: Schritt 2 · {"anzahl":4,"aktiv":1,"pflichtfelder":3}
  - erfüllt · Zurück: Schritt 1 · {"anzahl":4,"aktiv":0}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-11-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-11-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 3 · HTTP ≥ 400: keine
  - erfüllt · ohne JavaScript: Formular mit POST und Weiter-Knopf (nicht ausgelöst) · {"formular":true,"aktion":"","methode":"POST","knopf":true}
  - erfüllt · HTTP 200 · 200
  - erfüllt · vier Schritte, Schritt 1 aktiv · {"anzahl":4,"aktiv":0}
  - erfüllt · Weiter ohne Eingaben: Pflichtprüfung, Schritt bleibt · {"anzahl":4,"aktiv":0,"alarm":1}
  - erfüllt · Weiter mit Testwerten: Schritt 2 · {"anzahl":4,"aktiv":1,"pflichtfelder":3}
  - erfüllt · Zurück: Schritt 1 · {"anzahl":4,"aktiv":0}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-11-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-11-1440-ende.jpg`

### F-12 · Kontakt: Pflichtprüfung, Karte nach Klick
- 390 px: **nicht prüfbar** · Formular-POSTs: 1 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - Messwert · Formularfelder (Pflicht mit *) · ["name*","email*","telefon","betreff","nachricht*","einwilligung*"]
  - erfüllt · Kontakt: Fehlerzusammenfassung nach leerem Absenden („Absenden“) · {"text":"Bitte prüfen Sie die markierten Felder. Name: Bitte füllen Sie dieses Feld aus. E-Mail: Bitte geben Sie eine gültige E-Mail-Adresse ein. Nachricht: Bitte füllen","feldLinks":4,"altcha":"geprüft nach 1.5 s"}
  - erfüllt · Kontakt: Fokus in der Fehlerzusammenfassung · "Fokus"
  - Messwert · Karte vor Klick · {"iframes":0,"osmAnfragen":0,"kartenKnopf":0}
  - nicht prüfbar · Karte lädt erst nach Klick (OpenStreetMap) · Bestand ohne Koordinaten: keine Kartenschaltfläche. Gemessen vor Klick: 0 iframe(s), 0 OSM-Anfragen.
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-12-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-12-390-ende.jpg`
- 1440 px: **nicht prüfbar** · Formular-POSTs: 1 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - Messwert · Formularfelder (Pflicht mit *) · ["name*","email*","telefon","betreff","nachricht*","einwilligung*"]
  - erfüllt · Kontakt: Fehlerzusammenfassung nach leerem Absenden („Absenden“) · {"text":"Bitte prüfen Sie die markierten Felder. Name: Bitte füllen Sie dieses Feld aus. E-Mail: Bitte geben Sie eine gültige E-Mail-Adresse ein. Nachricht: Bitte füllen","feldLinks":4,"altcha":"geprüft nach 10.5 s"}
  - erfüllt · Kontakt: Fokus in der Fehlerzusammenfassung · "Fokus"
  - Messwert · Karte vor Klick · {"iframes":0,"osmAnfragen":0,"kartenKnopf":0}
  - nicht prüfbar · Karte lädt erst nach Klick (OpenStreetMap) · Bestand ohne Koordinaten: keine Kartenschaltfläche. Gemessen vor Klick: 0 iframe(s), 0 OSM-Anfragen.
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-12-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-12-1440-ende.jpg`

### F-13 · Mitglied werden, Moschee-Anfrage, Meldung: Pflichtprüfung
- 390 px: **erfüllt** · Formular-POSTs: 3 · HTTP ≥ 400: keine
  - erfüllt · Mitgliedsantrag: HTTP 200 mit Formular · 200
  - erfüllt · Mitgliedsantrag: Fehlerzusammenfassung nach leerem Absenden („Weiter“) · {"text":"Bitte prüfen Sie die markierten Felder. Vorname: Bitte füllen Sie dieses Feld aus. Nachname: Bitte füllen Sie dieses Feld aus. E-Mail Adresse: Bitte füllen Sie ","feldLinks":3,"altcha":"kein ALTCHA-Widget"}
  - erfüllt · Mitgliedsantrag: Fokus in der Fehlerzusammenfassung · "Fokus"
  - erfüllt · Mitgliedsantrag: Schritt bleibt nach leerem „Weiter“ · {"vorher":{"anzahl":3,"aktiv":0},"nachher":{"anzahl":3,"aktiv":0}}
  - erfüllt · Moschee-Anfrage: HTTP 200 mit Formular · 200
  - erfüllt · Moschee-Anfrage: Fehlerzusammenfassung nach leerem Absenden („Weiter“) · {"text":"Bitte prüfen Sie die markierten Felder. Moschee-Name: Bitte füllen Sie dieses Feld aus. Ansprechpartner: Bitte füllen Sie dieses Feld aus. E-Mail-Adresse: Bitte","feldLinks":7,"altcha":"kein ALTCHA-Widget"}
  - erfüllt · Moschee-Anfrage: Fokus in der Fehlerzusammenfassung · "Fokus"
  - erfüllt · Moschee-Anfrage: Schritt bleibt nach leerem „Weiter“ · {"vorher":{"anzahl":3,"aktiv":0},"nachher":{"anzahl":3,"aktiv":0}}
  - erfüllt · Meldung: HTTP 200 mit Formular · 200
  - erfüllt · Meldung: Fehlerzusammenfassung nach leerem Absenden („Meldung senden“) · {"text":"Bitte prüfen Sie die markierten Felder. Meldungstyp: Meldungstyp ist erforderlich Betreff: Betreff ist erforderlich Nachricht: Nachricht ist erforderlich Vornam","feldLinks":7,"altcha":"geprüft nach 10.5 s"}
  - erfüllt · Meldung: Fokus in der Fehlerzusammenfassung · "Fokus"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-13-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-13-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 3 · HTTP ≥ 400: keine
  - erfüllt · Mitgliedsantrag: HTTP 200 mit Formular · 200
  - erfüllt · Mitgliedsantrag: Fehlerzusammenfassung nach leerem Absenden („Weiter“) · {"text":"Bitte prüfen Sie die markierten Felder. Vorname: Bitte füllen Sie dieses Feld aus. Nachname: Bitte füllen Sie dieses Feld aus. E-Mail Adresse: Bitte füllen Sie ","feldLinks":3,"altcha":"kein ALTCHA-Widget"}
  - erfüllt · Mitgliedsantrag: Fokus in der Fehlerzusammenfassung · "Fokus"
  - erfüllt · Mitgliedsantrag: Schritt bleibt nach leerem „Weiter“ · {"vorher":{"anzahl":3,"aktiv":0},"nachher":{"anzahl":3,"aktiv":0}}
  - erfüllt · Moschee-Anfrage: HTTP 200 mit Formular · 200
  - erfüllt · Moschee-Anfrage: Fehlerzusammenfassung nach leerem Absenden („Weiter“) · {"text":"Bitte prüfen Sie die markierten Felder. Moschee-Name: Bitte füllen Sie dieses Feld aus. Ansprechpartner: Bitte füllen Sie dieses Feld aus. E-Mail-Adresse: Bitte","feldLinks":7,"altcha":"kein ALTCHA-Widget"}
  - erfüllt · Moschee-Anfrage: Fokus in der Fehlerzusammenfassung · "Fokus"
  - erfüllt · Moschee-Anfrage: Schritt bleibt nach leerem „Weiter“ · {"vorher":{"anzahl":3,"aktiv":0},"nachher":{"anzahl":3,"aktiv":0}}
  - erfüllt · Meldung: HTTP 200 mit Formular · 200
  - erfüllt · Meldung: Fehlerzusammenfassung nach leerem Absenden („Meldung senden“) · {"text":"Bitte prüfen Sie die markierten Felder. Meldungstyp: Meldungstyp ist erforderlich Betreff: Betreff ist erforderlich Nachricht: Nachricht ist erforderlich Vornam","feldLinks":7,"altcha":"geprüft nach 12 s"}
  - erfüllt · Meldung: Fokus in der Fehlerzusammenfassung · "Fokus"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-13-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-13-1440-ende.jpg`

### F-14 · Suche: Ergebnisse, noindex
- 390 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · noindex · "noindex, follow"
  - nicht erfüllt · Ergebnisse zu „Gebet“ · {"treffer":0,"hinweis":"Keine Treffer für „Gebet“. Versuchen Sie ein anderes oder kürzeres Wort."}
  - Messwert · Gegenprobe „Freitagsgebet“: Trefferlinks · 2
  - Messwert · Gegenprobe „Ramadan“: Trefferlinks · 2
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-14-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-14-390-ende.jpg`
- 1440 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · noindex · "noindex, follow"
  - nicht erfüllt · Ergebnisse zu „Gebet“ · {"treffer":0,"hinweis":"Keine Treffer für „Gebet“. Versuchen Sie ein anderes oder kürzeres Wort."}
  - Messwert · Gegenprobe „Freitagsgebet“: Trefferlinks · 2
  - Messwert · Gegenprobe „Ramadan“: Trefferlinks · 2
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-14-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-14-1440-ende.jpg`

### F-15 · Sprachwahl de → tr → en, lokalisierter Pfad
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Deutsch → Türkisch: gleiche Seite, lokaler Pfad · {"pfad":"/tr/hakkimizda","lang":"tr","h1De":"Über uns","h1Tr":"Hakkımızda"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-15-tr-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-15-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Deutsch → Türkisch: gleiche Seite, lokaler Pfad · {"pfad":"/tr/hakkimizda","lang":"tr","h1De":"Über uns","h1Tr":"Hakkımızda"}
  - erfüllt · Türkisch → Englisch: lokaler Pfad · {"pfad":"/en/about-us","lang":"en"}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-15-tr-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-15-1440-ende.jpg`

### F-16 · Unbekannte Adresse: 404 mit Weg zurück
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: 404 /nicht-vorhanden-xyz
  - erfüllt · HTTP 404 · 404
  - erfüllt · Seite „nicht gefunden“ mit H1 · "Seite nicht gefunden"
  - erfüllt · noindex · "noindex"
  - erfüllt · Weg zurück: „Zur Startseite“ → / · "/"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-16-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-16-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: 404 /nicht-vorhanden-xyz
  - erfüllt · HTTP 404 · 404
  - erfüllt · Seite „nicht gefunden“ mit H1 · "Seite nicht gefunden"
  - erfüllt · noindex · "noindex"
  - erfüllt · Weg zurück: „Zur Startseite“ → / · "/"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-16-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-16-1440-ende.jpg`

### F-17 · Offline-Seite und Service Worker
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /offline HTTP 200 · 200
  - erfüllt · sw.js hält Gebetszeiten und Startseite vor (Quelltext) · {"status":200,"zeichen":2760}
  - Messwert · Dienst bereit / steuert Seite · {"bereit":true,"gesteuert":true}
  - erfüllt · offline: Gebetszeiten aus dem Vorrat · "Gebetszeiten"
  - erfüllt · offline: Startseite aus dem Vorrat · "IGMG Wetzlar"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-17-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-17-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /offline HTTP 200 · 200
  - erfüllt · sw.js hält Gebetszeiten und Startseite vor (Quelltext) · {"status":200,"zeichen":2760}
  - Messwert · Dienst bereit / steuert Seite · {"bereit":true,"gesteuert":true}
  - erfüllt · offline: Gebetszeiten aus dem Vorrat · "Gebetszeiten"
  - erfüllt · offline: Startseite aus dem Vorrat · "IGMG Wetzlar"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-17-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-17-1440-ende.jpg`

### F-18 · Mobilmenü (390): öffnen, Fokus, Esc
- 390 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · Mobilmenü öffnet · 1
  - erfüllt · Fokus im Menü nach Öffnen · "Fokus"
  - nicht erfüllt · Fokus bleibt nach 12 Tab-Drücken im Menü · "Fokus"
  - erfüllt · Esc schließt das Menü · 0
  - erfüllt · Fokus zurück auf den Menüknopf · "Menü öffnen"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-18-offen-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-18-390-ende.jpg`
- 1440 px: nicht vorgesehen (Erwartung: 390 px)

### F-19 · Sprunglink „Zum Inhalt“
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · erster Tab-Halt: „Zum Inhalt springen“ · {"text":"Zum Inhalt springen","href":"#inhalt"}
  - erfüllt · Enter springt zu #inhalt, Fokus im Inhalt · {"hash":"#inhalt","fokusImInhalt":true}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-19-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-19-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · erster Tab-Halt: „Zum Inhalt springen“ · {"text":"Zum Inhalt springen","href":"#inhalt"}
  - erfüllt · Enter springt zu #inhalt, Fokus im Inhalt · {"hash":"#inhalt","fokusImInhalt":true}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-19-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-19-1440-ende.jpg`

### F-20 · Verwaltung: Einladung, Passwort, TOTP, Anmeldung, Dashboard
- 390 px: nicht vorgesehen (Erwartung: 1440 px)
- 1440 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - nicht prüfbar · Einladung, Passwort, TOTP, Anmeldung, Dashboard · Der Prüfserver http://127.0.0.1:3500 darf nicht gestoppt werden; die Einladung braucht aber den gestoppten Server (anmeldung.mjs einladen). Ersatz: Prüfkopie auf eigenem Port, siehe Protokoll „…-kopie“.
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-20-1440-ende.jpg`

### F-21 · Verwaltung: Veranstaltung anlegen/bearbeiten, Medien hochladen
- 390 px: nicht vorgesehen (Erwartung: 1440 px)
- 1440 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - nicht prüfbar · Veranstaltung anlegen/bearbeiten, Medien hochladen · nur lesend erlaubt: ohne Anmeldezustand kein Lesepfad; Speichern und Hochladen nicht ausgeführt
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-21-1440-ende.jpg`

### F-22 · /api/health
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /api/health HTTP 200 und Status ok · {"status":200,"antwort":{"status":"ok"}}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-22-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /api/health HTTP 200 und Status ok · {"status":200,"antwort":{"status":"ok"}}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-22-1440-ende.jpg`

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

### F-24 · Konzept-Hinweis: erster Besuch, schließen, nicht wieder
- 390 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · erster Besuch: Hinweis offen · true
  - erfüllt · Schließen über „Verstanden“ und Merker im Gerät · {"zu":true,"merker":"1"}
  - erfüllt · nach Neuladen nicht wieder offen · false
  - erfüllt · Esc schließt den Hinweis · "open"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-24-offen-390.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-24-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · erster Besuch: Hinweis offen · true
  - erfüllt · Schließen über „Verstanden“ und Merker im Gerät · {"zu":true,"merker":"1"}
  - erfüllt · nach Neuladen nicht wieder offen · false
  - erfüllt · Esc schließt den Hinweis · "open"
  - Bilder: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-24-offen-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bilder/e0-funktionsliste/F-24-1440-ende.jpg`

Technische Fehler des Werkzeugs: 0.
