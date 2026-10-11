V01 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt (Verwaltungsmodul) „Verwaltung: Übersicht“ · Schwierigkeit 1

# Blatt V01 · Verwaltung: Übersicht

## SEITE

Verwaltung: Übersicht (Admin-Dashboard, Abschnitt „Dashboard“). Laufbuch-Plan 07.3 „Admin-Dashboard“ (00 Laufbuch.dc.html:175). Screen-Label „07.3 Admin-Dashboard“ (Dashboard.dc.html:15). Nur für angemeldete Konten: Header mit logged-in="{{ true }}" fest gesetzt (Dashboard.dc.html:16).

## ROUTE

Auftrag: /verwaltung. Bestand: Routen-Schlüssel „dashboard“ (App.tsx:55–56 rendert Dashboard; RouteContext.tsx:3; App.tsx:116; Header.tsx:578, 929). Der Abschnitt ist ein Prop (section, Standard dashboard). Im Design gibt es keinen URL-Parameter (siehe AUFFAELLIGKEITEN 1).

## QUELLEN

- Design (nur lesen): Dashboard.dc.html, Template Zeilen 9–109, data-props Zeile 110, Script Zeilen 111–161 (renderVals 134–158).
- Bestand (nur lesen): src/app/components/Dashboard.tsx, Typen 57–150, Startdaten 154–353, Seitennavigation 355–362, Kennzahlen 399–466, Listen 468–516, Layout 1174–1265.
- Sprachfassungen (nur lesen): LanguageContext.tsx (Blöcke de 12–269, tr 270–527, en 528–787), News.tsx (31, 35, 72, 76, 113, 117), NewsSection.tsx:72, Breadcrumbs.tsx (22, 45, 68).
- Hilfen: readme.md (Zeilen 12, 25); 00 Laufbuch.dc.html (35, 175, 178, 185, 193, 228, 238, 239, 289, 299); Icon.dc.html.
- Fundstellen ohne Pfad beziehen sich auf diese Dateien; App.tsx liegt in src/app.

## ZWECK

Startseite des Verwaltungsbereichs. Sie zeigt vier Kacheln mit Kennzahlen (Neuigkeiten, Veranstaltungen, Ankündigungen, Tickets), zwei Kurzlisten (Aktuelle Neuigkeiten, Kommende Veranstaltungen) und die Seitennavigation mit Zählern zu den Abschnitten (Dashboard.dc.html:24, 34, 37, 38).

## ABSCHNITTE

Aufbau in dieser Reihenfolge (Dashboard.dc.html):

1. Header, Zeile 16: active, current="dashboard", logged-in="{{ true }}", sticky, z 50. Komponentenblatt 02.1.
2. PrayerTimesBar, Zeile 17. Komponentenblatt 02.2.
3. Breadcrumbs, Zeile 18, label="Dashboard". Komponentenblatt 02.3.
4. main, Zeile 19: flex-wrap, max-width 1440 px, Abstand 24 px.
   a. aside, Zeile 20: Kopf (21), Seitennavigation (22–26) mit sechs Einträgen aus NAV (111).
   b. Inhalt, Zeilen 29–39: h2 (32), Kachelraster (33–35), zwei Listen (36–39).
5. Footer, Zeile 86. Komponentenblatt 02.4.

Nicht in den Tabellen: Dialog-Rahmen (88–107, Texte 117–122), die Abschnitte news, events, announcements, messages, tickets (43–83) und die importierten Teile.

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
| --- | --- | --- | --- | --- |
| admin.titel | Admin Dashboard | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21; Dashboard.tsx:1197 |
| admin.verwaltung | IGMG Wetzlar Verwaltung | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21; Dashboard.tsx:1198 |
| admin.menue | Menü öffnen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 (nur schmal); Dashboard.tsx:1253 |
| admin.navname | Dashboard-Bereiche | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:23 (aria-label) |
| nav.dashboard | Dashboard | Panel | Dashboard | Dashboard.dc.html:32, 111; LanguageContext.tsx:385, 643 (Breadcrumbs.tsx:45: Gösterge Paneli) |
| nav.neuigkeiten | Neuigkeiten | Haberler | News | Dashboard.dc.html:111, 152; LanguageContext.tsx:372, 630 |
| nav.veranstaltungen | Veranstaltungen | Etkinlikler | Events | Dashboard.dc.html:111, 152; LanguageContext.tsx:389, 647 |
| nav.ankuendigungen | Ankündigungen | Duyurular | Announcements | Dashboard.dc.html:111, 152; News.tsx:76, 117 |
| nav.nachrichten | Nachrichten | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:111; Dashboard.tsx:360 (News.tsx:31 meint Neuigkeiten, nicht übernommen) |
| nav.tickets | Tickets | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:111, 152; Dashboard.tsx:361 (LanguageContext.tsx:130, 388, 646: Meldungen, Bildirimler, Reports) |
| kachel.notiz | +2 diese Woche | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:152; Dashboard.tsx:414 |
| liste.neuigkeiten | Aktuelle Neuigkeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:37; Dashboard.tsx:472; NewsSection.tsx:72 |
| liste.veranstaltungen | Kommende Veranstaltungen | Yaklaşan Etkinlikler | Upcoming Events | Dashboard.dc.html:38; Dashboard.tsx:494; LanguageContext.tsx:362, 620 |
| status.veroeffentlicht | Veröffentlicht | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:112; Dashboard.tsx:483 |
| status.entwurf | Entwurf | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:112; Dashboard.tsx:483 |
| kategorie.kuerzel | GT, KT | GT, KT (abgeleitet: Kürzel) | GT, KT (abgeleitet: Kürzel) | Dashboard.dc.html:38, 113; Dashboard.tsx:505–508 (Langform) |
| muster.autor | [Name – Autor] · Datum | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:37, 112 |
| muster.termin | Datum · Uhrzeit | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:38, 113 |
| beispiel.inhalt | Ramadan Programm 2024; Neue Koranschule-Anmeldungen; Jugend-Fußballturnier; Frauen-Kochkurs | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:112, 113 (Beispielinhalte, Laufbuch 238) |
| beispiel.datum | Fr., 15. März 2024; So., 10. März 2024; Sa., 20. Apr. 2024; Mo., 25. März 2024; 14:00–18:00 Uhr; 18:00–21:00 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:112, 113 |

## DATEN

Vorschlag, spaeter aus der Datenbank (PostgreSQL mit Drizzle, K-05):

- Kennzahlen (abgeleitet): Anzahl je Abschnitt. Notizen (Dashboard.tsx:414, 430, 446, 462) abgeleitet: Neuigkeiten seit Montag 00:00 Europe/Berlin, Veranstaltungen nach Beginn, Ankündigungen ohne Ablauf, Tickets mit Status offen.
- Aktuelle Neuigkeiten: news mit id (uuid), title (Text, mehrsprachig ja), author (Verweis auf Konto, Personendatum, nicht mehrsprachig), date (Zeitstempel UTC, Anzeige Europe/Berlin), status (Enum entwurf, veroeffentlicht, papierkorb; Papierkorb nach K-05). Sortierung absteigend, Limit 3 (Dashboard.tsx:476).
- Kommende Veranstaltungen: events mit id, title (Text, mehrsprachig ja), start_at und end_at (Zeitstempel UTC), category (Enum AT, KT, GT, KGT, allgemein). Filter Beginn nach jetzt, aufsteigend, Limit 3 (Dashboard.tsx:498).
- Tickets: nur Zähler. Ersteller und Zugewiesen sind Personendaten (Dashboard.tsx:145–146) und erscheinen hier nicht.
- Kontakt- und Telefonfelder der Beispielveranstaltungen (Dashboard.tsx:253–254, 276) gehören nicht in die Übersicht.
- Zugriff: nur berechtigte Rollen (K-06), jeder Zugriff auf Personendaten im Audit-Log (G-07). Seeds mit erkennbar fiktiven Namen wie „Testperson Eins“ (G-04). Beispielnamen aus dem Bestand nicht übernehmen (Laufbuch 289).
- Datum: Bestand formatiert ohne Zeitzone (Dashboard.tsx:395–397); K-05 verlangt Europe/Berlin.

## FORMULARFELDER

– (entfaellt, Grund: Die Übersicht hat keine Eingabefelder. Die Dialogfelder (Dashboard.dc.html:117–122) erscheinen nur bei dialog-Prop und sind nicht Teil dieses Blattes.)

## INTERAKTIONEN

- Eintrag der Seitennavigation: Abschnitt wechselt, navOpen wird false (Dashboard.dc.html:24, 138). Bestand: setActiveSection, Sheet schließt (Dashboard.tsx:1210–1211).
- Kachel: Abschnitt wechselt zu news, events, announcements oder tickets (Dashboard.dc.html:34, 152). Nachrichten hat keine Kachel. Bestand: Kacheln ohne Klick (Dashboard.tsx:402–466).
- „Menü öffnen“ (nur schmal): schaltet die Navigation, aria-expanded folgt (Dashboard.dc.html:21).
- Escape schließt einen offenen Dialog (Dashboard.dc.html:132).
- Listeneinträge ohne Aktion (Dashboard.dc.html:37–38; Bestand Dashboard.tsx:476–512).

## ZUSTAENDE

data-props (Dashboard.dc.html:110):

- section: dashboard (Standard), news, events, announcements, messages, tickets. Wirksam für dieses Blatt: dashboard (Zeile 30). Die übrigen Werte zeigen Abschnitte aus den Zeilen 43–83.
- dialog: none (Standard), neuigkeit, veranstaltung, ankuendigung, ticket. Ungleich none zeigt den Dialog-Rahmen (88–107).

Interne Zustände (Dashboard.dc.html:124–150):

- w: Startwert 1440 px, danach gemessene Breite (124–131). narrow = w < 900 (137). navOpen: Startwert false (124). section und dialog fallen auf die Props zurück (135–136).
- Schmal (w < 900): Seitenleiste 100 %, Menü-Button sichtbar, Navigation nur bei navOpen (21, 22, 150). Breit: Seitenleiste 280 px, Navigation sichtbar (150).
- Abgeleitet: Zwischenbereich 900 bis ca. 983 px (280 + 24 + 640 px plus Rand 2 × 2vw): Seitenleiste bleibt 280 px, Inhalt bricht darunter um (19, 20, 29).
- Abgeleitet: Kacheln vier Spalten ab ca. 848 px Inhaltsbreite, Listen zwei Spalten ab 656 px (33, 36). Bei 390 px (Laufbuch 178) je eine Spalte.
- Aktiver Eintrag: aria-current="page", Hintergrund #047857, Schrift #FFFFFF, Zählpille #FFFFFF/#065F46. Inaktiv: transparent, Pille #F3F0E9/#514C46. Hover #EBF9F2 (24, 140).
- Zähler (fest, 139): news 2, events 2, announcements 1, messages 3, tickets 1. Dashboard ohne Zähler. Kennzahlen (fest, 152): 2, 2, 1, 1.
- Fehlende Zustände: leere Liste, Laden, Fehler. Weder Design noch Bestand haben sie. Bestand-Statuswerte: news published/draft (Dashboard.tsx:63), event upcoming/ongoing/completed/cancelled (76), announcement active/expired (100), ticket open/in-progress/resolved/closed (144). Papierkorb fehlt (K-05).
- Bestand-Startzustand: activeSection dashboard (154), sidebarOpen false (158), isMobile bei innerWidth unter 768 (202–212).

## BILDER

– (entfaellt: keine Bilder.) Icons, 20 px: layout-dashboard (Navigation), newspaper, calendar, megaphone, ticket (Kacheln), menu (Menü-Button). Alle sieben sind in Icon.dc.html vorhanden. Kachel-Icons in #514C46 (Dashboard.dc.html:34); Bestand farbig (Dashboard.tsx:410, 426, 442, 458).

## AUFFAELLIGKEITEN

1. Route: Auftrag /verwaltung, Bestand „dashboard“ (App.tsx:55–56; RouteContext.tsx:3).
2. Schwelle: Design 900 px mit Menü im Inhalt (Dashboard.dc.html:137, 21). Bestand 768 px mit Sheet (Dashboard.tsx:206, 1233, 1240–1244). readme.md:25 nennt 1200 px, Laufbuch D-04 (185) 1240 px.
3. Zähler: nur im Design (Dashboard.dc.html:139), Bestand ohne Zähler (Dashboard.tsx:355–362). Nachrichten (3) ist die Summe ungelesener Nachrichten (Dashboard.dc.html:114), die übrigen sind Gesamtzahlen.
4. Kacheln: im Design klickbar (34), im Bestand nicht (Dashboard.tsx:402–466). Notizen: Design leer bei Veranstaltungen, Ankündigungen, Tickets (152); Bestand „2 bevorstehend“, „1 aktiv“, „0 offen“ (430, 446, 462).
5. Datum und Kategorie: Design „Fr., 15. März 2024“ mit „·“ und Kürzel GT/KT (37, 38, 112, 113). Bestand rohes ISO-Datum mit „•“ und Langform (481, 503, 505–508). KGT heißt im Bestand „Kız Gençlik Teşkilatı“ (508), im Design „Kadın Gençlik Teşkilatı“ (Dashboard.dc.html:115; Laufbuch 228). Datumsformat: readme.md:12 „Sa., 2. Aug.“, Laufbuch D-10 (193) „Mo., 28. Juli 2025“.
6. Übersetzungen: Dashboard.tsx liest useLanguage nicht (Zeile 153). Schlüssel dashboard.tickets meint Meldungen (LanguageContext.tsx:130). „Nachrichten“ im Bestand (News.tsx:31) meint Neuigkeiten. Für „Dashboard“ gibt es Panel (LanguageContext.tsx:385) und Gösterge Paneli (Breadcrumbs.tsx:45).
7. Listen: Bestand zeigt höchstens drei Einträge (Dashboard.tsx:476, 498). Die Beispieltermine liegen 2024 und sind am Stichtag 2026-10-11 nicht mehr kommend (Dashboard.dc.html:113). Ohne Leerzustand wäre die Liste leer.
8. Papierkorb (K-05) fehlt in Design und Bestand (Dashboard.tsx:63).
9. Menü-Button: Label bleibt „Menü öffnen“ (21). Laufbuch 299 nennt „Menü schließen“ als neuen Text.
10. Überschriften: Design h1 „Admin Dashboard“ und h2 „Dashboard“ (21, 32). Bestand h2 „Admin Dashboard“ (1197), h1 „Dashboard“ nur mobil (1256).
11. Der Auftragstitel „Verwaltung: Übersicht“ steht nicht im Design. LanguageContext.tsx:129 hat „Übersicht“.
12. Laufbuch 239: Das Admin-Dashboard stürzt im Bestand beim Öffnen ab. Ursache nicht geprüft.

## OFFENE FRAGEN

1. Route: /verwaltung oder „dashboard“?
2. Schwelle: 900 px oder 768 px? Menü als Aufklapp-Feld oder Drawer? Wie wird der Bereich 900 bis ca. 983 px gestaltet?
3. Zähler: Gesamtzahl oder offen/ungelesen? Gefiltert je Rolle (K-06)?
4. Kacheln klickbar lassen? Notizen „bevorstehend“, „aktiv“, „offen“ anzeigen oder streichen?
5. Listen: Limit 2 oder 3, Sortierung, Entwürfe sichtbar (Pille „Entwurf“ im Design), Link zum Detail?
6. Leer-, Lade- und Fehlerzustände für Kacheln und Listen liefern.
7. Papierkorb (K-05) in Listen und Zählern?
8. Welche Rolle sieht welche Kachel und Liste? Zählt Organisationsredaktion nur eigene Inhalte?
9. Fassungen liefern für: Nachrichten, Tickets, Aktuelle Neuigkeiten, Admin Dashboard, IGMG Wetzlar Verwaltung, Menü öffnen, Veröffentlicht, Entwurf, +2 diese Woche.
10. Schreibweise KGT und Datumsformat bestätigen.
11. Dialoge (dialog-Prop) und die Abschnitte news, events, announcements, messages, tickets: eigene Blätter?
12. Soll der Abschnitt in der URL stehen (Lesezeichen, Zurück-Taste) oder nur im Zustand?
13. Beispielinhalte 2024 ersetzen oder als „Beispielinhalt“ markieren (Laufbuch 238)?

=== ENDE V01 · BEREIT ZUR RÜCKGABE ===
