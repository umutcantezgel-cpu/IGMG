# V07 · Verwaltung: Gebetszeiten (Import, Berechnung, Vorschau)

Kennung V07 · Route /verwaltung/gebetszeiten · ABGELEITET (kein Artboard) · Quellen nur gelesen.

## SEITE

Verwaltung der Gebetszeiten: Quelle wählen (Tabellen-Import oder vorläufige Berechnung), Methode und Minutenanpassungen einstellen, Vorschau prüfen. Gestalt aus PT und DB; Grundlage K-05 bis K-08, G-04, G-05, G-07.

## ROUTE

/verwaltung/gebetszeiten (Vorgabe). Rolle serverseitig prüfen (K-06); zulässige Rolle offen.

## QUELLEN

- PT = PrayerTimes.dc.html: Template Z.9–174, Script Z.175–225.
- DB = Dashboard.dc.html (Muster): Kopf Z.16–18, Navigation Z.20–27 und Z.111, Tabelle Z.44–57, Dialog Z.88–107, Escape Z.132.
- SG = Styleguide.dc.html: Tabellenmuster Z.54.
- TSX = Bestand PrayerTimes.tsx (uploads/igmg-wetzlar-website/src/app/components/): Zustände Z.35–43, Mock-Daten Z.88–124, Ortung Z.164–189.
- RM = readme.md; LB = 00 Laufbuch.dc.html (D-09, D-10, D-12, D-16: Z.190–193, 281; Listen Z.154, 203, 232, 273).
- Nicht gelesen: LanguageContext.tsx (nicht in diesem Paket).

## ZWECK

Die Verwaltung legt die Herkunft der Tageszeiten fest: verbindlicher Tabellen-Import (CSV oder JSON, K-08 a) oder vorläufige Berechnung mit adhan, sichtbar als „berechnet“ (K-08 b). Vorschau vor Veröffentlichung (abgeleitet).

## ABSCHNITTE

Aufbau (abgeleitet, Vorschlag):

1. Kopf: Header angemeldet (DB:16), Breadcrumbs „Gebetszeiten“ (PT:17), H1 und Datum (PT:22–23), Kennzeichen „berechnet“ (K-08) und „importiert“ (abgeleitet).
2. Quellenwahl: Radiogruppe nach PT:146–151.
3. Tabs „Import“, „Berechnung“, „Vorschau“ nach PT:68–72; Vorschau mit „Heute“ (PT:74–86), „Monatlich“ (PT:88–115) und Link „Vollbild“ (PT:26).
4. Import: Dateiwahl, Spaltenvorschlag, Prüftabelle nach SG:54.
5. Berechnung: PT:145–166.
6. Bausteine: Header, Breadcrumbs, Footer (PT:16, 17, 172), Icon. Qibla-Tab entfällt (abgeleitet).

Import-Spalten (Vorschlag, nicht belegt): datum (ISO statt „01.01“, TSX:111), imsak, sunrise, dhuhr, asr, maghrib, isha (HH:MM; Schlüssel nach TSX:95–100).

### Texte (de, tr, en)

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| kopf.titel | Gebetszeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:17, 22 |
| kopf.datum | Di., 23. Jan. 2024 · Beispielzeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:23 |
| kopf.vollbild | Vollbild | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:26 |
| ort.standort | Standort · Wetzlar, Deutschland · Standort auswählen · Wählen Sie Ihr Land und Ihre Stadt | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:28, 33, 192 |
| ort.gps | Aktuellen Standort verwenden · Standort wird ermittelt... · GPS-basierte Standortbestimmung · Oder wählen Sie ein Land: · Auswählen · {n} Städte verfügbar | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:34, 35, 37, 219 |
| ort.orte | Deutschland (DE) · Türkei (TR) · Niederlande (NL) · Belgien (BE) · Wetzlar, Frankfurt, Gießen, Marburg, Dillenburg, Limburg, Kassel, Darmstadt, Istanbul, Ankara, Izmir, Bursa, Antalya, Amsterdam, Rotterdam, Den Haag, Utrecht, Brüssel, Antwerpen, Gent · Koordinaten je Ort (Format „50.5558° N, 8.5089° E“) | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:185–188 |
| ort.stadt | Städte in {Land} · {n} Städte verfügbar · Zurück zur Länderauswahl · Ausgewählt | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:43, 45 |
| next.titel | Nächstes Gebet: {Name} · {Zeit} Uhr · verbleibt: {Restzeit} · Qibla: 136° · 50.5558° N, 8.5089° E | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:57–63 |
| tab.namen | Ansicht · Heute · Monatlich · Qibla · Einstellungen | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:68, 204 |
| heute.namen | Imsak · Sonnenaufgang · Dhuhr · Asr · Maghrib · Isha | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:176 |
| heute.info | Morgendämmerung · Sonnenaufgang · Mittagsgebet · Nachmittagsgebet · Abendgebet · Nachtgebet · Gebet · Info · Nächstes Gebet | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:78, 82, 176, 203 |
| heute.zeiten | 06:12 · 08:04 · 12:29 · 14:42 · 17:14 · 18:44 (Beispielwerte) | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:176 |
| mon.kalender | Kalender · Wählen Sie ein Datum aus · Vorheriger Monat · Nächster Monat · Januar 2024 · Mo · Di · Mi · Do · Fr · Sa · So · {n}. Januar 2024 | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:91–94, 207 |
| mon.tabelle | Januar 2024 - Gebetszeiten · Vollständige Übersicht des Monats · Datum · Imsak · Aufgang · Dhuhr · Asr · Maghrib · Isha · Vollständigen Monat laden | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:101–112 |
| mon.aufgang | Aufgang | Güneş Doğuşu | Sunrise | LB:203 |
| qibla.titel | Qibla Richtung · Richtung zur Kaaba in Mekka · Kompass: Qibla 136° von Norden · N · 136° · 136° von Norden · Die Qibla-Richtung von {Standort} zur Kaaba in Mekka | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:120–128 |
| qibla.info | Qibla Information · Details zur Gebetsrichtung · Genauer Winkel · 136.2° Ost von Nord · Entfernung zur Kaaba · 3.847 km · Kaaba Koordinaten · 21.4225° N, 39.8262° E · Berechnungsmethode · Großkreis (orthodrome) Navigation | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:131–136 |
| qibla.tipps | Tipps zur Qibla-Bestimmung: · Verwenden Sie einen Kompass für genaue Richtung · Berücksichtigen Sie magnetische Deklination · Bei Unsicherheit fragen Sie den Imam · Smartphone-Apps können hilfreich sein | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:138 |
| set.titel | Gebetszeiten Einstellungen · Passen Sie die Berechnung an Ihre Bedürfnisse an · Berechnungsmethode · Standort ändern · Manuelle Anpassungen · Imsak Anpassung (Min.) · Isha Anpassung (Min.) · Platzhalter „0“ | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:145–160 |
| set.methoden | Türkei (Diyanet) · Fajr: 18°, Isha: 17° · Muslim World League · Fajr: 18°, Isha: 17° · Islamic Society of North America · Fajr: 15°, Isha: 15° · Egyptian General Authority · Fajr: 19.5°, Isha: 17.5° · Umm Al-Qura University · Fajr: 18.5°, Isha: 90 min | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:190 |
| set.knopf | Einstellungen speichern · Zurücksetzen | – (nur DE in Quelle) | – (nur DE in Quelle) | PT:164–165 |
| dialog.muster | Schließen (aria) · Abbrechen | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:93, 104 |

## DATEN

Vorschlag, nicht belegt:

- gebetszeit_tag: datum (Datum, Europe/Berlin), imsak, sonnenaufgang, dhuhr, asr, maghrib, isha (Uhrzeit HH:MM), quelle (Enum: importiert | berechnet), stand (Zeitstempel UTC, K-05). Mehrsprachig: nein.
- einstellung: methode (Enum aus fünf Werten, PT:190; Annahme turkey, K-08), anpass_imsak, anpass_isha (Ganzzahl, Minuten), standort (Text, Standard „Wetzlar, Deutschland“), breite, laenge (Zahl), zeitzone (Text, „Europe/Berlin“). Mehrsprachig: nein.
- ort: name (Text), land_code (Text: DE | TR | NL | BE), breite, laenge (Zahl; PT:185–188). Mehrsprachig: nein.

Keine Personendaten; Zugriffsprotokoll offen.

## FORMULARFELDER

- Quelle: Radio „Tabellen-Import“ oder „Berechnung“ (abgeleitet, Vorschlag).
- Importdatei: CSV oder JSON; Größe offen (K-08 a).
- Berechnungsmethode: Radio, fünf Werte, Standard turkey (PT:146–151, 190).
- Standort: Land, dann Stadt (PT:28–50); Standard Wetzlar (PT:192).
- Imsak Anpassung (Min.), Isha Anpassung (Min.): Zahl, Platzhalter „0“, 48 px hoch (PT:159–160; RM:21).
- Zod-Schema für Client und Server, Fehler am Feld (K-07, abgeleitet).

## INTERAKTIONEN

- Quelle umschalten ändert Kennzeichen und Vorschau (abgeleitet, K-08).
- Tabs wechseln (PT:68–72; renderVals Z.204–205).
- Standort: Land, dann Stadt; Auswahl setzt Standort und schließt (PT:28–50; renderVals Z.209, 216).
- GPS-Knopf: Design zeigt 1,5 s Text ohne Ortung (renderVals Z.220); Bestand ortet echt (TSX:164–177).
- Kalendertag: nur Markierung (PT:96; renderVals Z.207).
- Ohne Funktion im Design: Monatspfeile (PT:92), „Vollständigen Monat laden“ (PT:112), „Einstellungen speichern“, „Zurücksetzen“ (PT:164–165).
- „Vollbild“: Link auf eigene Seite (PT:26); Bestand öffnet FullscreenPrayerTimes per Zustand (TSX:248, 753–758).
- Dialog-Muster: Schließen mit X oder Escape, Abbrechen, Bestätigen (DB:93, 104, 132).

## ZUSTAENDE

- data-props PT (Z.175): tab = today (Standard) | monthly | qibla | settings; locOpen = false (Standard) | true.
- data-props DB (Z.110, Muster): section = dashboard (Standard) | news | events | announcements | messages | tickets; dialog = none (Standard) | neuigkeit | veranstaltung | ankuendigung | ticket.
- TSX: dropdownView countries | cities (Z.40); isDropdownOpen (Z.42); isLoadingLocation true | false (Z.39, 296–303); isFullscreenOpen (Z.43); calculationMethod turkey (Z.37); Ortungsfehler nur in der Konsole (Z.179–183).
- PT renderVals: gps false | true (Z.192, 219–220); Uhr alle 30 s (Z.193); day 23 (Z.192).
- Abgeleitet, Texte offen: leer, Import-Fehler (Feld oder Zeile), gespeichert.

## BILDER

Keine Fotos. Icons (Icon.dc.html): 20 Lucide-Namen, Liste in PT:23–165. Bestand-Flaggen (TSX:80–85, 329–332) nicht übernehmen (LB:273, D-09).

## AUFFAELLIGKEITEN

1. Qibla: Design nennt 136°, 136.2° und 3.847 km (PT:62, 120–136). Eigene Großkreisrechnung aus den Design-Koordinaten (nicht im Design) ergibt etwa 128.3° und 4.233 km. Vor Übernahme prüfen (K-08).
2. Monatstabelle zeigt nur 01.01. bis 05.01. (PT:178–182; TSX:110–116), trotz „Vollständige Übersicht“ (PT:101). Heute-Werte (PT:176) gleichen bei Imsak, Sonnenaufgang und Dhuhr dem 04.01., nicht dem 23.01.
3. „Beispielzeiten“ nur im Design (PT:23); der Bestand kennzeichnet nichts. Design gilt (LB:193).
4. Bestand: Dhuhr 12:29 und „2h 15m“ fest (TSX:102–106); Design berechnet live (PT:196–202; K-08).
5. Bestand lädt Flaggen von flagcdn.com (TSX:80–85); Design zeigt Kürzel (PT:37). G-07 untersagt Anfragen an Dritte.
6. K-08 verlangt Druckansicht, Ramadan-Hervorhebung von Imsak und Iftar sowie Kompass nur nach Klick. Das Design hat davon nichts; Iftar fehlt; der Kompass zeigt sich ohne Klick (PT:120–126).
7. K-08 nennt „Turkey“ als Annahme in MENSCHEN.md; LB:232 enthält dazu keinen Eintrag.
8. „Sonnenaufgang“ (PT:176) und „Aufgang“ (PT:104) benennen dieselbe Zeit. Bestand ruft useLanguage() auf, nutzt t() aber nicht (TSX:35).
9. Dashboard-Navigation (DB:111) hat keinen Eintrag „Gebetszeiten“. LB:154 nennt PageHeader, den PT nicht importiert.

## OFFENE FRAGEN

1. Welche Rolle darf importieren und berechnen? K-06 nennt keine Gebetszeiten-Rolle.
2. Gilt ein Import sofort oder erst nach Freigabe (Entwurf, Veröffentlicht; K-05)?
3. Welche Spalten, Trennzeichen, Dateigröße und Jahresabdeckung gelten?
4. Meint „Vorschau“ die Seite, das Vollbild (PT:26; LB:192) oder beides?
5. Ist Iftar gleich Maghrib?
6. Welcher Bereich gilt für die Minutenanpassungen?
7. Wird jede Änderung protokolliert? G-07 nennt nur Personendaten.
8. Gibt es TR- und EN-Schlüssel dafür in LanguageContext.tsx? Nicht geprüft.
9. Ist die Annahme „turkey“ bestätigt?

=== ENDE V07 · BEREIT ZUR RÜCKGABE ===
