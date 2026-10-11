# V06 · Verwaltung: Kurse

V06 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Schwierigkeit 1

## SEITE

Verwaltungsmodul „Verwaltung: Kurse“, ABGELEITET (kein Artboard). Shell und Tabelle nach Dashboard.dc.html (Muster), Felder nach CourseCard.dc.html, Kursdaten nach QuranCourses.dc.html.

## ROUTE

/verwaltung/kurse (Zielroute laut Auftrag, abgeleitet). Das Muster hat keine eigene Route, sondern den Zustand section (DB:135).

## QUELLEN

Design (nur lesen): QC = QuranCourses.dc.html (72 Zeilen) · CC = CourseCard.dc.html (49) · DB = Dashboard.dc.html (163, Muster).
Bestand (nur lesen): QT = uploads/igmg-wetzlar-website/src/app/components/QuranCourses.tsx (580).
Hilfen: RM = readme.md · LB = 00 Laufbuch.dc.html (D-Nummern, Plan, Textänderungen).
Auftrag: K-05, K-06, K-07, G-04, G-05, G-07.

## ZWECK

Die Rolle Bildung (K-06) pflegt Kurse: anlegen, bearbeiten, auf Entwurf oder Veröffentlicht setzen, in den Papierkorb legen (K-05). Die Angaben erscheinen auf der öffentlichen Seite Korankurse (QC:20–48). Kurse enthalten keine Personendaten; Voranmeldungen fehlen hier und sind offen (OFFENE FRAGEN).

## ABSCHNITTE

Aufbau von oben nach unten:
1. Kopf: Header mit angemeldetem Zustand (DB:16), PrayerTimesBar (DB:17), Breadcrumbs „Dashboard“ (DB:18), hier „Kurse“ (abgeleitet).
2. Seitenleiste (DB:20–27): Menü-Button unter 900 px, Navigation mit neuem Punkt „Kurse“ (abgeleitet, Icon graduation-cap aus QC:48).
3. Hauptbereich: Kopfzeile mit Schaltfläche „Neuer Kurs“ (DB:45); Tabelle mit fünf Spalten, je Zeile Bearbeiten und Löschen (DB:48, DB:52).
4. Dialog „Neuer Kurs“ (DB:88–107, nach Muster DB:118).
5. Fußzeile (DB:86).

Nicht auf dieser Seite sichtbar: Beschreibung, Hinweis und Kursinhalte der Karte (Fundstellen unter DATEN).

Texte. Fehlt eine Sprache in allen Quellen, steht „– (nur DE in Quelle)“.

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| adm.kopf | Admin Dashboard · IGMG Wetzlar Verwaltung · Menü öffnen · Dashboard-Bereiche | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:21, DB:23 |
| adm.nav | Dashboard · Neuigkeiten · Veranstaltungen · Ankündigungen · Nachrichten · Tickets · Kurse | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:111; Kurse abgeleitet |
| adm.tabelle | Kurse verwalten · Neuer Kurs · Titel · Zielgruppe · Zeiten · Status · Aktionen | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:143, DB:45; CC:22–23; Kurse verwalten und Neuer Kurs abgeleitet |
| adm.zeile | Bearbeiten: {Titel} · Löschen: {Titel} | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:143 |
| adm.dialog | Neuer Kurs · Erstellen Sie hier einen neuen Kurs. · Erstellen · Abbrechen · Schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:93, DB:104, DB:118; Titel und Satz abgeleitet |
| adm.felder | Titel · Beschreibung · Zielgruppe · Zeiten · Hinweis · Kursinhalte: · Verfügbarkeit · Schaltfläche · Linkziel · Status | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:118–119; CC:22, 23, 26; LB:54; Hinweis, Verfügbarkeit, Schaltfläche abgeleitet |
| adm.platz | Kurstitel eingeben... · Kursbeschreibung... | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:118–119; abgeleitet |
| adm.status | Voranmeldung erforderlich · Keine Anmeldung erforderlich · Geschlossen | Ön kayıt gerekli · Kayıt gereksiz · Kapalı | Pre-registration required · No registration required · Closed | QC:61–63; QT:42/58/74, 132/148/164, 222/238/254 |
| adm.knopf | Zur Voranmeldung · Einfach teilnehmen · Nicht verfügbar | Ön Kayıt'a Git · Direkt katıl · Müsait değil | Go to Pre-Registration · Join Directly · Not Available | QC:62–63; QT:114/118/117, 204/208/207, 294/298/297 |
| k1 | Korankurs für Kinder · Kinder (6-16 Jahre) · Samstag & Sonntag - 13:00–15:00 Uhr | Çocuklar için Kuran Kursu · Çocuklar (6-16 yaş) · Cumartesi & Pazar - 13:00-15:00 | Quran Course for Children · Children (6-16 years) · Saturday & Sunday - 1:00-3:00 PM | QC:61; QT:38/40/41, 128/130/131, 218/220/221 |
| k2 | Korankurs für Erwachsene · Männliche Erwachsene (18+ Jahre) · Montag & Freitag - 20:00–21:30 Uhr | Yetişkinler için Kuran Kursu · Yetişkin Erkekler (18+ yaş) · Pazartesi & Cuma - 20:00-21:30 | Quran Course for Adults · Adult Males (18+ years) · Monday & Friday - 8:00-9:30 PM | QC:62; QT:54/56/57, 144/146/147, 234/236/237 |
| k3 | Hafiz Vorbereitungskurs · Fortgeschrittene Schüler · Montag-Freitag - 16:00–18:00 Uhr | Hafızlık Hazırlık Kursu · İleri seviye öğrenciler · Pazartesi-Cuma - 16:00-18:00 | Hafiz Preparation Course · Advanced Students · Monday-Friday - 4:00-6:00 PM | QC:63; QT:70/72/73, 160/162/163, 250/252/253 |

## DATEN

Vorschlag. Inhalte aus der Datenbank (K-05: PostgreSQL mit Drizzle, Zeitstempel in UTC, Anzeige Europe/Berlin). Werte der Kurse: Tabelle k1 bis k3.

- titel: Text, mehrsprachig ja (CC:19)
- beschreibung: Text, ja (CC:20; QT:39/129/219, 55/145/235, 71/161/251)
- zielgruppe: Text, ja (CC:22)
- zeiten: Wochentag als Text, ja; Startzeit und Endzeit als Uhrzeit, nein (CC:23; LB:193)
- verfuegbarkeit: Aufzählung voranmeldung, keine_anmeldung, geschlossen; Anzeigetext ja (CC:18)
- anmeldeweg: Aufzählung register, join, closed; nein (CC:35, CC:38)
- schaltflaeche: Text, ja (CC:28–30)
- linkziel: Route, nein (CC:28–29, CC:38)
- hinweis: Text, ja (CC:25; QT:50/66/82, 140/156/172, 230/246/262)
- kursinhalte: Liste aus Text, ja (CC:26; QT:44–48, 60–64, 76–80, 134–138, 150–154, 166–170, 224–228, 240–244, 256–260)
- veroeffentlichung: Aufzählung Entwurf, Veröffentlicht, Papierkorb; nein; Papierkorb 30 Tage (K-05; DB:112)
- papierkorb_am, aktualisiert_am: Zeitstempel UTC, nein (K-05)
- kursbild: Datei, optional, nein (abgeleitet, siehe BILDER)

Zugriff: Rolle Bildung (K-06), serverseitig geprüft. Kurse sind Inhalte, keine Personendaten.

## FORMULARFELDER

Dialog „Neuer Kurs“ (abgeleitet nach F() in DB:116, Ids db-k-*):
- db-k-t Titel: Text, volle Breite, Platzhalter „Kurstitel eingeben...“ (DB:118, abgeleitet)
- db-k-b Beschreibung: Textfeld, 4 Zeilen, volle Breite, Platzhalter „Kursbeschreibung...“ (DB:98, DB:119)
- db-k-z Zielgruppe: Text (CC:22)
- db-k-zt Zeiten: Text für den Wochentag (CC:23)
- db-k-s Startzeit, db-k-e Endzeit: Uhrzeit (DB:119)
- db-k-v Verfügbarkeit: Auswahl Voranmeldung erforderlich, Keine Anmeldung erforderlich, Geschlossen (QC:61–63)
- db-k-h Hinweis: Text (CC:25, abgeleitet)
- db-k-i Kursinhalte: Textfeld, je Zeile ein Punkt (CC:26, abgeleitet)
- db-k-a Schaltfläche: Auswahl Zur Voranmeldung, Einfach teilnehmen, Nicht verfügbar (CC:38; QC:62–63)
- db-k-l Linkziel: Text (CC:38)
- db-k-st Status: Auswahl Entwurf, Veröffentlicht (DB:118)
- Schaltflächen: Abbrechen (DB:104), Erstellen (DB:118)

## INTERAKTIONEN

- Navigation „Kurse“ wechselt in den Abschnitt kurse, wie die Punkte im Muster (DB:24, DB:138; abgeleitet).
- Menü öffnen klappt die Navigation auf und zu, nur unter 900 px (DB:21, DB:137).
- Neuer Kurs öffnet den Dialog leer (DB:45, DB:141).
- Bearbeiten öffnet im Muster den leeren Anlegen-Dialog (DB:52); für Kurse vorausgefüllt (abgeleitet).
- Löschen hat im Muster keine Aktion (DB:52); Vorschlag: Papierkorb nach Bestätigung (K-05, abgeleitet).
- Abbrechen, Schließen, Klick auf den Hintergrund und Escape schließen den Dialog (DB:104, DB:93, DB:90, DB:132).
- Erstellen schließt im Muster nur den Dialog (DB:104); für Kurse eine Server Action mit Zod und useActionState (K-07).
- Hover: Hintergrund #EBF9F2 bei Navigation und Zeilenschaltflächen (DB:24, DB:52); Fokus 2 px #0E3929 mit 2 px Abstand (DB:13).

## ZUSTAENDE

Eigenschaften (data-props, alle Optionen und Default):
- Dashboard.dc.html, section (DB:110): dashboard, news, events, announcements, messages, tickets; Default dashboard. Vorschlag: kurse (abgeleitet).
- Dashboard.dc.html, dialog (DB:110): none, neuigkeit, veranstaltung, ankuendigung, ticket; Default none. Vorschlag: kurs (abgeleitet).
- CourseCard.dc.html, item (CC:35, CC:38): title, desc, target, schedule, availability, note (Text); features (Liste); cta (register, join, closed); ctaLabel (Text); href (optional). Default: [Kurs], [Beschreibung], [Zielgruppe], [Zeiten], Voranmeldung erforderlich, [Hinweis], [Inhalt], register, Zur Voranmeldung, StudentRegistration.dc.html.
- QuranCourses.dc.html: keine Eigenschaften (QC:56).

Zustände des Musters:
- schmal unter 900 px: Menü-Button sichtbar, Navigation eingeklappt (DB:137, DB:150).
- Dialog offen oder zu (DB:136, DB:157).

Zustände aus dem Bestand:
- offen mit Voranmeldung: Zur Voranmeldung führt zur Anmeldung (QT:463–470; cta register).
- offen ohne Anmeldung: Einfach teilnehmen ohne Ziel (QT:471–478; cta join).
- geschlossen: deaktivierte Schaltfläche Nicht verfügbar, Karte mit Deckkraft 90 % (QT:455–462, QT:374; cta closed).
- Verfügbare Kurse: im Bestand nur offene Kurse (QT:538); im Design fest (QC:41–42).
- Status-Pille: offen #EBF9F2 mit #065F46 und circle-check; geschlossen #FFEDEA mit #AF2B25 und circle-x (CC:42).

Abgeleitet, nicht im Design: nicht berechtigt (K-06); Feldfehler mit Fokus auf die Rückmeldung und Zustand „Speichern läuft“ (K-07). Leere Liste ist nicht gestaltet.

## BILDER

Kein Bild in der Tabelle. Kursfoto nur auf der Karte: beschriftete Streifenfläche „Foto: [Kurstitel]“, 150 px hoch, mit aria-label (CC:16, CC:41). Der Bestand nutzt externe Fotos (QT:316, 325, 334); nicht übernommen (G-04).

## AUFFAELLIGKEITEN

- Das Muster hat keinen Punkt Kurse (DB:111); Route und Abschnitt sind neu (abgeleitet).
- Bearbeiten öffnet im Muster den leeren Anlegen-Dialog, Löschen hat keine Aktion (DB:52).
- Zwei Statusbegriffe: Veröffentlichung nach K-05 (DB:112) und Verfügbarkeit (CC:18, QC:61–63).
- Zeitspanne: Design mit Gedankenstrich (QC:61–63), Bestand mit Bindestrich (QT:41, 57, 73); englischer Bestand im 12-Stunden-Format (QT:221).
- „Keine Anmeldung nötig“ (QC:42, QT:543) und „Keine Anmeldung erforderlich“ (QC:62, QT:58) widersprechen sich im Design.
- Menü-Schwelle: Muster 900 px (DB:137), Header 1240 px (LB:185, LB:215), readme 1200 px (RM:25).
- Bestand: „Einfach teilnehmen“ ohne Ziel (QT:471–478); Design mit Ziel Contact.dc.html#karte (QC:42, LB:301).
- Bestand zeigt drei von fünf Kursinhalten (QT:439); Design zeigt alle (LB:301).

## OFFENE FRAGEN

1. Ist /verwaltung/kurse eine eigene Route oder ein Abschnitt des Dashboards, und welche Rolle sieht ihn (K-06)?
2. Werden Veröffentlichung (K-05) und Verfügbarkeit (CC:18) in einem Feld oder in zwei Feldern geführt?
3. Welche Bestätigung gilt beim Löschen, und gilt der Papierkorb mit 30 Tagen (K-05)?
4. Sollen Voraussetzungen, „Was Sie mitbringen sollten“ und der Kontaktblock (QC:29–49) auf diesem Blatt bearbeitbar sein?
5. Gehören Voranmeldungen (K-06) auf dieses Blatt? Sie enthalten Personendaten (G-07).
6. Soll das Kursfoto hochladbar sein (CC:16)?
7. Wie wird die Zeitspanne gespeichert, als Freitext oder als Wochentag mit Start- und Endzeit, und welches englische Format gilt?
8. Welches Ziel hat „Einfach teilnehmen“: Contact.dc.html#karte (QC:42) oder keines (QT:471)?
9. TR und EN der Admin-Oberfläche fehlen in den Quellen dieses Pakets; LB:35 nennt Dashboard-Texte in LanguageContext.tsx, das nicht vorlag. Ebenso lagen 08 Dialoge und Zustaende.dc.html (LB:177) und Header.dc.html nicht vor, daher ist der Header-Parameter current offen.
10. Telefon und E-Mail im Bestand sind Beispielwerte (QT:109–110); Platzhalter [Telefonnummer] (QC:46) gehört in MENSCHEN.md (G-05).
11. LB:239 meldet einen Absturz des Bestands-Dashboards; Dashboard.tsx lag nicht vor.

=== ENDE V06 · BEREIT ZUR RÜCKGABE ===
