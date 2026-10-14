# E0-PRUEFER-03 · Funktionsliste Ausgangswert (Rückgabe, vom Orchestrator abgelegt)

=== E0-PRUEFER-03 · Ausgangswert Funktionsliste F-01 … F-24 ===

WICHTIG (zuerst lesen): Die Messung gegen 3100 ist in vier Punkten NICHT sauber. Der gemeinsame Routen-Cache des eingefrorenen Ordners wurde durch meine Testinstanzen verändert. Details unter „Ursache“.

GEÄNDERTE DATEIEN
- Neu: _werkstatt/werkzeuge/funktionsliste.mjs (Prüfwerkzeug F-01 … F-24, Parameter --basis, --protokoll, --bilder, --nur, --zustand, --hinweis).
- Protokolle (alle neu): _werkstatt/protokolle/E0-PRUEFER-03-funktionsliste.{json,md} (3100, Hauptlauf 20:03–20:08), …-ersatz-3500.{json,md} (Ersatz, sauber, 19:42–19:46), …-verwaltung.{json,md} (F-20, F-21 auf Kopie), …-f06-kopie.{json,md} (Prüfkopie mit verschobenem Termin), …-sauber-3700.{json,md} (F-06, F-23 auf bereinigter Kopie), …-vorschau-3200.{json,md}, E0-PRUEFER-03-routen-cache-verfaelscht.txt (Liste der Cache-Dateien).
- Außerhalb des Repos (Scratchpad): Testinstanzen und Datenbankkopien unter scratchpad/e0-f03/, Anmeldezustand scratchpad/e0-f03/anm/verwaltung-state.json.
- Eingefrorener Ordner scratchpad/basis-standalone/.next/server/route-cache: 132 Dateien mit Änderung ab 19:40 (ungewollt, siehe Ursache). Datenbank .pglite-bau und Build-HTML (17:16) sind nicht verändert.
- Keine Datei unter web/ von mir geändert. git status zeigt dort fremde Änderungen (nicht von mir).

WAS UND WARUM
- Werkzeug: Chromium über hilfen.mjs, sichtbarkeitsbewusste Selektoren. Konzept-Hinweis vorgemerkt (außer F-24). Formulare nur bis zur Serverprüfung: leer absenden bzw. Schrittprüfung, keine Speicherung. Jeder Formular-POST wird gezählt. Je Testkontext eine eigene Testnetz-Absenderadresse (Header x-forwarded-for, wie anmeldung.mjs), weil der Server nach wenigen Einsendungen „Zu viele Einsendungen“ meldet. Funktionsprüfungen sind Einzelläufe; Zählwerte stammen aus einem Lauf.
- Ausfall 3100: Der Server war etwa 19:27 bis 19:53 nicht erreichbar (PID 11372 weg, laut Koordinator fremder Aufruf von server-starten.sh). Ich habe ihn nicht angefasst. Während des Ausfalls habe ich eine Ersatzinstanz auf Port 3500 aus dem eingefrorenen Ordner gestartet, mit Datenbankkopie vom 19:31. Die Statuswerte dieses sauberen Laufs (19:42–19:46) stimmen mit 3100 überein, außer bei F-06. Die Verbindungsfehler vom Ausfall (19:28) stammen aus einem Testlauf im Scratchpad und sind nicht in den Protokollen.
- Verwaltung (F-20): Einladung, Passwort, Zwei-Faktor und Anmeldung mit anmeldung.mjs auf der Datenbankkopie. Testkonto pruefer-f03@example.test, weil pruefer@example.test im Bestand bereits existiert (Lauf von E0-PRUEFER-01). 3100 wurde für die Einladung nicht gestoppt, deshalb ist F-20 auf 3100 nicht prüfbar. F-21 nur lesend.
- Erneute Messung gegen 3100 auf Anfrage des Koordinators: alle 24 Funktionen neu gemessen (20:03–20:08, technische Fehler 0). Die Befunde „nicht erfüllt“ (F-14, F-18, F-23) sind bestätigt.

URSACHE DER VERFÄLSCHUNG
- Testinstanzen auf 3500 (ab 19:31) und 3600 (ab 19:47) liefen aus demselben Ordner basis-standalone und haben dort ihren Laufzeit-Cache geschrieben. Am 19:47:16 hat die Prüfkopie mit verschobenem Termin (20.11.2026 16:30–18:00) die Detailseite in den gemeinsamen Routen-Cache geschrieben.
- Folge: Der Server auf 3100 (neu gestartet um 19:53:13) liefert diesen Cache. Auf der Veranstaltungsdetailseite steht 16:30–18:00 mit Formular, Startseite und Veranstaltungsliste zeigen 6 statt 5 Termine.
- Sauber sind die Datenbank (Datenseiten gleich wie die Kopie vom 19:31; Abweichungen nur WAL und Kontrolldateien durch Serverstart) und das vorgerenderte Build-HTML (17:16, zeigt 13:30–15:00).
- Die 19:46-Schreibvorgänge auf Verwaltungsrouten stammen vermutlich vom Verwaltungslauf auf 3500. Ohne Auswirkung auf die öffentlichen Funktionen gemessen.
- Entscheidung beim Koordinator: Die 132 Dateien aus der Liste entfernen (sie wurden alle nach 19:40 geschrieben; die 6 vom 20:07 sind harmlos) und danach 3100 neu starten oder den Cache erneuern. Dann F-01, F-05, F-06, F-23 gegen 3100 nachmessen. Ich habe am eingefrorenen Ordner nichts zurückgesetzt.
- Im Hauptprotokoll gegen 3100 ist dies am Kopf vermerkt.

PRÜFUNG UND ERGEBNIS
Tabelle F-01 … F-24 (Ergebnis 3100 = Hauptlauf 20:03–20:08; Vorschau = 3200, einmal vollständig):

| ID | Funktion | 3100 (Ausgangswert) | Vorschau 3200 | Anmerkung |
|---|---|---|---|---|
| F-01 | Startseite: Leiste, H1, Knöpfe, Veranstaltungen, Neuigkeiten | erfüllt | erfüllt | Zählwert „bis zu 6“ 6 statt 5 (Cache). Leiste mit Browseruhr auf 12:00 Berlin fixiert |
| F-02 | Leiste auf jeder Seite außer Gebetszeiten | erfüllt | erfüllt | 19 Seiten, Telefon aufklappen |
| F-03 | /gebetszeiten: Tabs, Tastatur, Monat, Qibla | nicht prüfbar | nicht prüfbar | Tabs erfüllt; „Monat wechselt“ ohne Bedienelement (offene Frage 2) |
| F-04 | Gebetszeiten-Anzeige: Vollbild, Schließen, Sprache | erfüllt | nicht prüfbar | Vorschau: Navigationszeitlimit (Werkzeug) |
| F-05 | Veranstaltungen: Kategoriefilter | erfüllt | erfüllt | Zählwert 6 statt 5 (Cache) |
| F-06 | Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal | erfüllt (verfälscht) | nicht prüfbar | Sauber: Termin 2024 vergangen, kein Formular; iCal erfüllt. Prüfkopie mit Termin in der Zukunft: Formular, Pflichtfehler und Fokus erfüllt |
| F-07 | Nachrichten: Filter, Ankündigungen, Detail | nicht prüfbar | nicht prüfbar | Filter und Detail erfüllt; keine Ankündigung im Bestand (Abschnitt fehlt) |
| F-08 | Über uns, Projekte, Vorstand, IGMG (Tabs) | erfüllt | erfüllt | |
| F-09 | Organisationen (vier): Name, Akzentfarbe, Termine | erfüllt | erfüllt | |
| F-10 | Korankurse: Kurskarten, Aktionen | erfüllt | erfüllt | register / join / closed |
| F-11 | Voranmeldung: vier Schritte, Weiter/Zurück, ohne JS | erfüllt | nicht erfüllt (unsicher) | Vorschau: kein Alarm innerhalb 0,5 s (Werkzeug-Zeitfenster), nicht gewertet |
| F-12 | Kontakt: Pflichtprüfung, Karte nach Klick | nicht prüfbar | nicht erfüllt (unsicher) | Formular erfüllt (vier Feldverweise, Fokus). Karte: Bestand ohne Koordinaten, keine Schaltfläche |
| F-13 | Mitglied werden, Moschee-Anfrage, Meldung: Pflichtprüfung | erfüllt | nicht erfüllt (unsicher) | Vorschau: Werkzeug-Zeitfenster, nicht gewertet |
| F-14 | Suche: Ergebnisse, noindex | nicht erfüllt | nicht erfüllt | noindex erfüllt. „Gebet“ 0 Treffer; Gegenprobe „Freitagsgebet“ 2, „Ramadan“ 2 |
| F-15 | Sprachwahl de → tr → en | erfüllt | erfüllt | lokaler Pfad |
| F-16 | Unbekannte Adresse: 404 | erfüllt | erfüllt | |
| F-17 | Offline-Seite, Service Worker | erfüllt | nicht prüfbar | Vorschau: kein Dienst im Entwicklungsmodus |
| F-18 | Mobilmenü (390): öffnen, Fokus, Esc | nicht erfüllt | nicht erfüllt | Öffnen und Esc erfüllt. Tab verlässt das Menü nach dem letzten Element (Fokus auf Seitenkörper), kehrt danach zurück (offene Frage 6) |
| F-19 | Sprunglink „Zum Inhalt“ | erfüllt | erfüllt | |
| F-20 | Verwaltung: Einladung, Passwort, TOTP, Anmeldung, Dashboard | nicht prüfbar | nicht geprüft | Auf der Kopie (3500) erfüllt, Protokoll …-verwaltung. 3100 nicht gestoppt |
| F-21 | Verwaltung: Veranstaltung anlegen, Medien hochladen | nicht prüfbar | nicht geprüft | nur lesend; Speichern und Hochladen verboten |
| F-22 | /api/health | erfüllt | erfüllt | |
| F-23 | iCal-Abo je Organisation: gültiger Kalender, Zeiten | nicht erfüllt | erfüllt | Kalender 12:30 mit TZID Europe/Berlin, Seite 13:30. Bestätigt auf sauberer Kopie und Ersatz. Vorschau gleich richtig (offene Frage 7) |
| F-24 | Konzept-Hinweis: erster Besuch, schließen, nicht wieder | erfüllt | erfüllt | |

Zusammenfassung:
- 3100 (verfälscht bei F-06): erfüllt 16, nicht erfüllt 3, nicht prüfbar 5. Bereinigt (F-06 nicht prüfbar): erfüllt 15, nicht erfüllt 3, nicht prüfbar 6.
- Ersatz 3500 (sauber): alle Statuswerte wie 3100 außer F-06.
- Vorschau 3200 (einmal vollständig; ein erster Versuch wurde durch ein Werkzeug-Hängen bei F-17 abgebrochen und nicht gewertet): erfüllt 12, nicht erfüllt 5, nicht prüfbar 5, nicht geprüft 2 (F-20, F-21). Nicht maßgeblich, weil am Entwicklungsserver Zeitfenster und Dienststatus nicht vergleichbar sind.
- Unterschiede Vorschau gegen Ausgangsstand (nicht maßgeblich): F-23 erfüllt statt nicht erfüllt; F-04 und F-17 nicht prüfbar statt erfüllt; F-11, F-12, F-13 als nicht erfüllt gemeldet, Ursache im Werkzeug, Befund unsicher.

BILDBELEGE
- Ausgangsstand 3100: scratchpad/bilder/e0-funktionsliste/ (z. B. F-01-390.jpg, F-02-1440.jpg, F-18-offen-390.jpg, F-24-offen-390.jpg). F-20 und F-21 aus dem Verwaltungslauf auf der Kopie (F-20-1440.jpg).
- Vorschau: scratchpad/bilder/e0-funktionsliste/vorschau-3200/.
- Anmeldung: scratchpad/e0-f03/anm/bilder/verwaltung-390x844-nach-anmeldung.jpg.

OFFENE FRAGEN
1. Cache-Bereinigung (Entscheidung Koordinator): siehe Ursache. Danach F-01, F-05, F-06, F-23 gegen 3100 nachmessen. Die Dateiliste liegt in _werkstatt/protokolle/E0-PRUEFER-03-routen-cache-verfaelscht.txt.
2. F-03 „Monat wechselt“: Im Bestand gibt es kein Bedienelement; die Monatstabelle zeigt den laufenden und den Folgemonat. Was genau zu prüfen ist?
3. F-07 Ankündigungen: Im Bestand ist keine Ankündigung veröffentlicht, der Abschnitt fehlt. Soll ein Testbestand mit Ankündigung geprüft werden?
4. F-12 Karte: Ohne Koordinaten gibt es im Bestand keine Kartenschaltfläche; die Prüfung „Karte nach Klick“ ist deshalb nicht möglich.
5. F-14 „Gebet“: 0 Treffer, obwohl „Freitagsgebet“ und „Ramadan“ je 2 Treffer liefern. Die Ursache habe ich nicht geprüft (VERMUTUNG: Wortstamm in der deutschen Volltextsuche).
6. F-18: Der Fokus verlässt das Menü in Chromium nach dem letzten Element kurz auf den Seitenkörper. Erwartung „bleibt im Menü“ ist damit nicht erfüllt. Gewollt oder zu ändern?
7. F-23: Die Kalenderzeit weicht um eine Stunde ab (Winter). VERMUTUNG: UTC-Uhrzeit mit TZID-Angabe. Die Vorschau zeigt die richtige Zeit; der Quelltext ist dort offenbar anders. Nicht geprüft, nur gemessen.
8. F-01 nachts: Um 21:31 Berlin zeigt die Desktop-Leiste kein „Nächstes Gebet“ und keine Restzeit, weil das nächste Gebet am Folgetag liegt (Testprotokoll scratchpad/e0-f03/test/t2.md). Gewollt? Die Hauptmessung läuft mit fester Uhr 12:00.
9. F-20 auf 3100: Verwaltungsanmeldung braucht eine Einladung in der Datenbank, also einen gestoppten Server. Soll 3100 dafür gestoppt werden dürfen, oder bleibt der Ersatzweg?
10. Vorschau: Werkzeugfehler am Entwicklungsserver bei F-04, F-11, F-12, F-13, F-17. Die Vorschau sollte nur einmal laufen; die Befunde dort sind unsicher.
11. Einsendungsgrenze: Der Server begrenzt Einsendungen je Absenderadresse. Ohne Testnetz-Adressen greifen wiederholte Prüfungen (leer absenden) nach wenigen Versuchen. Für künftige Läufe der Werkzeugsatz so belassen.

=== ENDE E0-PRUEFER-03 · BEREIT ZUR RÜCKGABE ===
