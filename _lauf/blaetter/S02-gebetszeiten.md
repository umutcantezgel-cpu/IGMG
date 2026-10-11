S02 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Gebetszeiten“ · Schwierigkeit 1

Kürzel: DC = PrayerTimes.dc.html · TSX = PrayerTimes.tsx · LC = LanguageContext.tsx · LB = 00 Laufbuch.dc.html · RM = readme.md. Zahlen sind Zeilen.

## SEITE

Gebetszeiten, Laufbuch-Plan 03.2 (LB:154). Sprache de (DC:15). Ohne PrayerTimesBar (LB:281, D-16).

## ROUTE

/gebetszeiten (K-03). Vollbild: /gebetszeiten/anzeige (K-03). Pfade für /tr und /en stehen in keiner Quelle.

## QUELLEN

Design vollständig (DC:1–227). Bestand: TSX (1–762), LC (Namensräume prayerTimes und prayerTimesBar, de/tr/en), ui/calendar.tsx (1–75). Hilfen: RM, LB.

## ZWECK

Gebetszeiten eines Ortes: nächstes Gebet mit Restzeit, Tageszeiten, Monat, Qibla, Einstellungen. Zeiten sind „Beispielzeiten“ (DC:23; LB:193). Texte nach messages/{de,tr,en}.json (K-02).

## ABSCHNITTE

Reihenfolge: Kopf mit Standort-Auswahl (DC:19–53), Nächstes Gebet (DC:55–65), Tab-Leiste (DC:68–72), Panel Heute (DC:74–86), Monatlich (DC:88–115), Qibla (DC:117–141), Einstellungen (DC:143–168). Header, Breadcrumbs und Footer sind eigene Blätter (DC:16, 17, 172). Nur ein Panel ist sichtbar.

Texte (A2): Gruppen durch „·“ getrennt, Sprachspalten gelten je Text. Fehlt eine Sprache: „– (nur DE in Quelle)“. Zahlen: „(Zahlen)“.

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| titel | Gebetszeiten | Namaz Vakitleri | Prayer Times | DC:22; LC:142, 400, 658 |
| kopf_text | Beispielzeiten · Vollbild · Di., 23. Jan. 2024 | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:23, 26; LB:299 (neu); TSX:255 |
| standort | Standort · Standort ändern · Standort auswählen · Wählen Sie Ihr Land und Ihre Stadt · Aktuellen Standort verwenden · Standort wird ermittelt... · GPS-basierte Standortbestimmung · Oder wählen Sie ein Land: · Ausgewählt | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:28, 33–35, 45, 153–154, 219; TSX:270, 288–289, 307–309, 318, 409, 709 |
| ort_wert | Wetzlar, Deutschland | Wetzlar, Almanya | Wetzlar, Germany | DC:192; LC:82, 340, 598; TSX:38 |
| laender_orte | Deutschland · Türkei · Niederlande · Belgien (DE · TR · NL · BE) · Auswählen · Zurück zur Länderauswahl · Städte in {Land} · {n} Städte verfügbar (n = 8, 5, 4, 3; abgeleitet) · Wetzlar · Frankfurt · Gießen · Marburg · Dillenburg · Limburg · Kassel · Darmstadt · Istanbul · Ankara · Izmir · Bursa · Antalya · Amsterdam · Rotterdam · Den Haag · Utrecht · Brüssel · Antwerpen · Gent | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:37, 43, 185–188 (Koordinaten dort); TSX:47–73, 338, 344, 373, 375 |
| naechstes | Nächstes Gebet: {Name} · {Zeit} Uhr · verbleibt: {Restzeit} · Qibla: 136° · 50.5558° N, 8.5089° E | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:57–63, 82; TSX:430–446 |
| tabs | Heute · Monatlich · Qibla · Einstellungen | Bugün · Aylık · Kıble · Ayarlar | Today · Monthly · Qibla · Settings | DC:70, 204; LC:143–146, 401–404, 659–662 |
| gebetsnamen | Imsak · Sonnenaufgang · Dhuhr · Asr · Maghrib · Isha | İmsak · Güneş Doğuşu · Öğle · İkindi · Akşam · Yatsı | Imsak · Sunrise · Dhuhr · Asr · Maghrib · Isha | DC:176; TSX:209–214; LC:85–90, 343–348, 601–606 (sunrise de: „Aufgang“, LC:86) |
| beschr | Morgendämmerung · Sonnenaufgang · Mittagsgebet · Nachmittagsgebet · Abendgebet · Nachtgebet · Info · Gebet | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:78, 82, 176; TSX:221–226, 485 |
| zeiten_heute | 06:12 · 08:04 · 12:29 · 14:42 · 17:14 · 18:44 | (Zahlen) | (Zahlen) | DC:176 (Beispielwerte); TSX:95–100 |
| monat_kal | Kalender · Wählen Sie ein Datum aus · Januar 2024 · Mo · Di · Mi · Do · Fr · Sa · So · 1 bis 31 · Januar 2024 - Gebetszeiten · Vollständige Übersicht des Monats | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:91–96, 101, 214; TSX:510–511, 526–527 |
| tabelle | Datum · Imsak · Aufgang · Dhuhr · Asr · Maghrib · Isha · Vollständigen Monat laden | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:104, 112; TSX:534–540, 565 |
| aria | Ansicht · Nächstes Gebet · Vorheriger Monat · Nächster Monat · {n}. Januar 2024 · Kompass: Qibla 136° von Norden (nicht sichtbar) | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:55, 68, 92, 96, 121 |
| qibla | Qibla Richtung · Richtung zur Kaaba in Mekka · 136° · 136° von Norden · N · Die Qibla-Richtung von {Standort} zur Kaaba in Mekka | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:120–128; TSX:580–620 |
| qibla_info | Qibla Information · Details zur Gebetsrichtung · Genauer Winkel · 136.2° Ost von Nord · Entfernung zur Kaaba · 3.847 km · Kaaba Koordinaten · 21.4225° N, 39.8262° E · Berechnungsmethode · Großkreis (orthodrome) Navigation · Tipps zur Qibla-Bestimmung: · Verwenden Sie einen Kompass für genaue Richtung · Berücksichtigen Sie magnetische Deklination · Bei Unsicherheit fragen Sie den Imam · Smartphone-Apps können hilfreich sein | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:131–138; TSX:630–660 |
| einst_methoden | Gebetszeiten Einstellungen · Passen Sie die Berechnung an Ihre Bedürfnisse an · Berechnungsmethode · Manuelle Anpassungen · Imsak Anpassung (Min.) · Isha Anpassung (Min.) · Einstellungen speichern · Zurücksetzen · Methoden: Türkei (Diyanet) · Muslim World League · Islamic Society of North America · Egyptian General Authority · Umm Al-Qura University; Parameter: Fajr: 18°, Isha: 17° · Fajr: 18°, Isha: 17° · Fajr: 15°, Isha: 15° · Fajr: 19.5°, Isha: 17.5° · Fajr: 18.5°, Isha: 90 min | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:145–165, 190; TSX:119–123 (Eigennamen), 674–744 |

Monatszeilen (DC:178–182, Zahlen):

- 01.01 06:15 08:07 12:30 14:43 17:15 18:45
- 02.01 06:14 08:06 12:30 14:44 17:16 18:46
- 03.01 06:13 08:05 12:30 14:45 17:17 18:47
- 04.01 06:12 08:04 12:29 14:46 17:18 18:48
- 05.01 06:11 08:03 12:29 14:47 17:19 18:49

## DATEN

Vorschlag, Felder mit Typ:

- zeiten: datum DATE, ort_id, imsak, sonnenaufgang, dhuhr, asr, maghrib, isha je TIME (HH:MM, Europe/Berlin, K-08), quelle ENUM(import | berechnet); nicht mehrsprachig (Mock: TSX:87).
- ort: name TEXT (de Pflicht, tr und en optional mit Rückfall auf de), land_code CHAR(2), breite und laenge NUMERIC; mehrsprachig ja.
- berechnung: methode ENUM(turkey | mwl | isna | egypt | makkah), anpassung_imsak_min und anpassung_isha_min INT; nicht mehrsprachig.
- Monatsübersicht: Abfrage aus zeiten. Nicht aus der Datenbank: Kaaba-Koordinaten (DC:135) und Qibla-Winkel, fest berechnet (K-08).
- Quelle: Tabellenimport verbindlich, adhan vorläufig (K-08); amtlich erst nach Bestätigung (G-06).

## FORMULARFELDER

- Methode: Radiogruppe „method“, Optionen turkey (Vorgabe), mwl, isna, egypt, makkah; keine Pflicht (DC:147–150, 192).
- Imsak Anpassung (Min.): Zahlenfeld, id adj-imsak, Platzhalter „0“, Höhe 48 px, ohne Bindung (DC:159). Isha gleich, id adj-isha (DC:160).
- Speichern (DC:164) und Zurücksetzen (DC:165): ohne Handler, im Bestand ebenso (TSX:741, 744).

## INTERAKTIONEN

1. Tab wechselt das Panel (DC:70, 204–205).
2. Standort-Schalter öffnet oder schließt die Auswahl, Ansicht springt auf Länder (DC:28, 216); Bestand: 150 ms (TSX:152–155).
3. Land zeigt Städte, Zurück zeigt Länder (DC:37, 43, 208, 218).
4. Stadt setzt Standort, Zeiten bleiben gleich (DC:45, 209).
5. Aktueller Standort: gps für 1,5 Sekunden (DC:34, 219–220). Bestand: Geolokalisierung (TSX:159–177).
6. Kalendertag setzt day ohne Wirkung (DC:96, 207). Monatspfeile und „Vollständigen Monat laden“ ohne Handler (DC:92, 112).
7. Methode setzt method ohne Wirkung auf Zeiten (DC:149, 210). Anpassungsfelder und Knöpfe ohne Bindung (DC:159–165).
8. „Standort ändern“ öffnet dieselbe Auswahl (DC:154, 29).
9. Vollbild: Link (DC:26). Bestand: Überlagerung (TSX:248, 754–758).
10. Alle 30 Sekunden: Zeit, nächstes Gebet, Restzeit neu (DC:193, 198–202).

## ZUSTAENDE

- data-props (DC:175): tab = today (Vorgabe) | monthly | qibla | settings, Typ 'today'|'monthly'|'qibla'|'settings'; LB:154 nennt heute/monat/qibla/einstellungen. locOpen = false (Vorgabe) | true, Typ boolean.
- Intern (DC:192): view countries (Vorgabe) | cities; country leer | 4 Länder; location Wetzlar, Deutschland (Vorgabe) | 20 Orte; method turkey (Vorgabe) | mwl | isna | egypt | makkah; day 23 (Vorgabe) bis 31; gps false (Vorgabe) | true 1,5 s; now alle 30 s.
- Abgeleitet (DC:197–203): nächstes Gebet ohne Sonnenaufgang (DC:199), nach Isha der Imsak des Folgetages (DC:201); Restzeit „{h} Std. {m} Min.“ oder „{m} Min.“ (DC:202); Karte mit Tag „Nächstes Gebet“ (DC:203).
- Bestand: isLoadingLocation (TSX:39, 296, 307); Fehler nur als Konsolenmeldung (TSX:179–187); Dhuhr immer hervorgehoben (TSX:469); Restzeit fest „2h 15m“ (TSX:105).
- Nicht gestaltet: leer – (entfaellt, keine leere Liste) · Fehler (im Design nicht dargestellt) · Erfolg – (entfaellt, kein Speicher-Feedback) · angemeldet – (entfaellt, öffentliche Seite) · Schritt – (entfaellt, kein Assistent) · Sprache: de (DC:15), tr/en ungenutzt (TSX:35).

## BILDER

Keine Fotos. Kompass als gezeichnete Fläche (DC:121–126). Icons (Lucide, RM:28) mit den Namen in DC:23–165. Bestand-Flaggen (TSX:81–84) durch Kürzel ersetzt (LB:273).

## AUFFAELLIGKEITEN

1. Qibla 136° (DC:62, 125; TSX:91) gegen Überschlag ca. 128° (abgeleitet, eigene Großkreis-Rechnung Wetzlar–Kaaba, nicht gegengeprüft).
2. Entfernung 3.847 km (DC:134; TSX:641) gegen Überschlag ca. 4.230 km (abgeleitet).
3. Monatstabelle: Titel „Vollständige Übersicht des Monats“, nur fünf Zeilen (DC:101, 178–182).
4. Heute (DC:176) gegen 04.01 (DC:181): Asr 14:42 gegen 14:46, Maghrib 17:14 gegen 17:18, Isha 18:44 gegen 18:48.
5. Namensraum ungenutzt: TSX:35 bindet `t` ein, nutzt es nicht; Texte hart auf Deutsch (TSX:238–744).
6. Vollbild: Link (DC:26) gegen Überlagerung (TSX:248); K-03 verlangt /gebetszeiten/anzeige.
7. Sonnenaufgang (DC:176; TSX:210) gegen Aufgang (DC:104; TSX:536; LC:86).
8. Methode: Radioliste (DC:149) gegen Auswahlliste (TSX:683–697).
9. Monatspfeile und Kalendertage 44 px hoch (DC:92, 96) statt 48 px (RM:21).

## OFFENE FRAGEN

1. Wie lauten die Pfade für /tr und /en zu /gebetszeiten und /gebetszeiten/anzeige?
2. Welche Quelle gilt bis zur Klärung (Tabelle oder adhan), und wer bestätigt die Zeiten (K-08, G-06)?
3. Ist die Methode Turkey nur Annahme (K-08)? Vermerk in MENSCHEN.md, dort nicht gelesen.
4. Welche Übersetzungen fehlen für Beispielzeiten, Vollbild, Standort, Nächstes Gebet, Gebetsbeschreibungen, Monatstexte und Qibla-Titel (K-02)?
5. Soll „Izmir“ oder „İzmir“ stehen? Design und Bestand: ohne İ (DC:186; TSX:60).
6. Wird der GPS-Standort nur im Browser gehalten oder gespeichert? Koordinaten gelten als personenbezogen (G-04; TSX:172).
7. Wie wird der Kompass nach ausdrücklichem Klick aktiviert (K-08)? Das Design hat keinen Schalter.
8. Wie sehen Hinweis „berechnet“, Ramadan-Hervorhebung, Iftar-Begriff und Druckansicht aus (K-08)?
9. Monatsdaten für alle Tage? Das Design zeigt fünf Zeilen.
10. Welche geprüfte Berechnung gilt für Qibla und Entfernung (Auffälligkeiten 1 und 2)?

=== ENDE S02 · BEREIT ZUR RÜCKGABE ===
