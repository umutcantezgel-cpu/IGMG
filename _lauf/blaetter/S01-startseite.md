# Seitenblatt S01 · Startseite

Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0

## SEITE

Startseite, Screen-Label „03.1 Startseite“ (Home.dc.html:15); Plan 03.1 (00 Laufbuch.dc.html:153). Code: Fall `home` in App.tsx:99-107. Seitentitel „IGMG Wetzlar - Startseite“ (App.tsx:115, nur DE).

## ROUTE

- de „/“ ohne Präfix, tr „/tr“, en „/en“ (K-02, K-03).
- hreflang de, tr, en, x-default (K-02); x-default auf „/“ (abgeleitet).
- Bestand ohne URL-Routing; Standardzustand `home` (RouteContext.tsx:14).

## QUELLEN

- Design: Home.dc.html (113 Zeilen; Template 9-78, Script 79-111).
- Bestand: HeroSection.tsx, EventsSection.tsx, NewsSection.tsx, LanguageContext.tsx, RouteContext.tsx (src/app/components/); App.tsx (src/app/, im Auftrag als components/ genannt). Die fünf Startseiten-Dateien sind in der Kopie IGMG_Wetzlar_Website_Code identisch.
- Hilfen: readme.md; 00 Laufbuch.dc.html (D-01 bis D-16: Zeilen 182-281; Liste für Menschen: 224-290).

## ZWECK

Einstieg für Besucher: Gemeinde vorstellen, Veranstaltungen und Neuigkeiten zeigen, weiter zu „Gemeinde beitreten“ und „Mehr erfahren“ (abgeleitet aus Home.dc.html:19-60).

## ABSCHNITTE

Sieben Bausteine (Home.dc.html:16-76):
1. Header, dc-import (:16): sticky, active und current „home“. Texte im Header-Blatt.
2. PrayerTimesBar, dc-import (:17): Zeiten nur als „Beispielzeiten“ (00 Laufbuch.dc.html:193).
3. HeroSection (:19-32).
4. EventsSection (:34-50): sechs EventCard aus :86-91.
5. NewsSection (:52-73): NewsCard featured plus drei compact aus :94-97.
6. Footer, dc-import (:75): Texte im Footer-Blatt.
7. DisclaimerDialog (:76): nur bei showDisc. Erstbesuch öffnet ihn (:101), Schließen setzt den Schlüssel (:107). Bestand: App-weit (App.tsx:193-196). Dialogtext nicht hier, Prüfung offen (00 Laufbuch.dc.html:284).

Karten-Texte (EventCard, NewsCard) stehen im Komponentenblatt: Empfohlen, Bildung, Veranstaltung, Jugend, Mehr erfahren (tr und en: LanguageContext.tsx:98, 105, 107-109, 356, 363, 365-367, 614, 621, 623-625); organisiert von, Aktuell, Vollständigen Artikel lesen nur DE (EventsSection.tsx:192, 223; NewsSection.tsx:96, 118).

Texte (Schluessel-Vorschlag, de, tr, en, Fundstelle). Fehlt eine Sprache in allen Quellen, steht „– (nur DE in Quelle)“.

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| hero.welcome | Willkommen in unserer Gemeinde | Cemaatimize hoş geldiniz | Welcome to our community | Home.dc.html:22, 81-83; LanguageContext.tsx:95, 353, 611 |
| hero.title | IGMG Wetzlar | IGMG Wetzlar | IGMG Wetzlar | Home.dc.html:23 (Eigenname); HeroSection.tsx:35 |
| hero.subtitle | Eine lebendige muslimische Gemeinde im Herzen von Wetzlar. Entdecken Sie unsere Aktivitäten, Gebetszeiten und Gemeinschaftsveranstaltungen. | Wetzlar'ın kalbinde canlı bir Müslüman cemaat. Etkinliklerimizi, namaz vakitlerini ve topluluk etkinliklerini keşfedin. | A vibrant Muslim community in the heart of Wetzlar. Discover our activities, prayer times, and community events. | Home.dc.html:24, 81-83; LanguageContext.tsx:96, 354, 612 |
| hero.joinUs | Gemeinde beitreten | Cemaate katıl | Join Community | Home.dc.html:26, 81-83; LanguageContext.tsx:97, 355, 613 |
| hero.learnMore | Mehr erfahren | Daha fazla öğren | Learn More | Home.dc.html:27, 81-83; LanguageContext.tsx:98, 356, 614 |
| hero.imageLabel | Foto: IGMG Wetzlar Moschee | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:30; HeroSection.tsx:70 (nur Alt-Text) |
| events.upcoming | Kommende Veranstaltungen | Yaklaşan Etkinlikler | Upcoming Events | Home.dc.html:38, 81-83; LanguageContext.tsx:104, 362, 620 |
| events.title | Unsere Veranstaltungen | Etkinliklerimiz | Our Events | Home.dc.html:39, 81-83; LanguageContext.tsx:102, 360, 618 |
| events.subtitle | Entdecken Sie die vielfältigen Aktivitäten und Programme unserer Gemeinde für alle Altersgruppen. | Tüm yaş grupları için cemaatimizin çeşitli aktivite ve programlarını keşfedin. | Discover the diverse activities and programs of our community for all age groups. | Home.dc.html:40, 81-83; LanguageContext.tsx:103, 361, 619 |
| events.all | Alle Veranstaltungen anzeigen | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:42; EventsSection.tsx:238 |
| ev.1 | Wöchentlicher Qur'an Kurs · Lernen Sie die richtige Rezitation und Bedeutung des Qur'an in unserem wöchentlichen Kurs. · Jeden Samstag · 14:00–16:00 Uhr · Hauptsaal · Offen für alle | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:86; EventsSection.tsx:19-30 |
| ev.2 | Frauenkreis - Islamische Erziehung · Diskussionsrunde für Mütter über islamische Werte in der Kindererziehung. · Jeden Dienstag · 14:00–16:00 Uhr · Frauenbereich · Frauen | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:87; EventsSection.tsx:31-42 |
| ev.3 | Jugendgruppe Treffen · Diskussionen, Aktivitäten und islamische Bildung für junge Muslime. · Jeden Freitag · 19:00–21:00 Uhr · Jugendraum · 14–25 Jahre | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:88; EventsSection.tsx:43-54 |
| ev.4 | Junge Schwestern Kreis · Gemeinschaft und islamische Bildung für junge Frauen und Mädchen. · Jeden Samstag · 16:00–18:00 Uhr · Jugend-Frauenbereich · 12–25 Jahre (weiblich) | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:89; EventsSection.tsx:55-66 |
| ev.5 | Islamisches Familienfest · Ein besonderer Tag für Familien mit Aktivitäten, Essen und Gemeinschaft. · Mo., 28. Juli 2025 · 11:00–17:00 Uhr · Gemeinschaftsbereich · Familien | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:90; EventsSection.tsx:67-78 |
| ev.6 | Arabisch Sprachkurs · Grundlagen der arabischen Sprache für Anfänger und Fortgeschrittene. · Jeden Donnerstag · 18:30–20:00 Uhr · Klassenzimmer 1 · Alle Altersgruppen | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:91; EventsSection.tsx:79-90 |
| news.eyebrow | Aktuelle Neuigkeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:56; NewsSection.tsx:72 |
| news.title | Bleiben Sie informiert | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:57; NewsSection.tsx:74 (LanguageContext.tsx:114, 372, 630 ist anderer Text) |
| news.subtitle | Die neuesten Entwicklungen, Ankündigungen und wichtigen Informationen aus unserer Gemeinde. | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:58; NewsSection.tsx:76 |
| news.all | Alle Neuigkeiten anzeigen | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:60; NewsSection.tsx:172 |
| news.1 | Neue Gebetszeiten für den Winter · Ab dem 1. November gelten neue Gebetszeiten. Bitte beachten Sie die aktualisierten Zeiten für eine bessere Teilnahme. · Wichtig · So., 20. Juli 2025 · 2 Min. | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:94; NewsSection.tsx:11-20 |
| news.2 | Ramadan Vorbereitung 2025 · Informationen zu den geplanten Aktivitäten und Programmen für den kommenden Ramadan. · Ankündigung · Fr., 18. Juli 2025 · 3 Min. | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:95; NewsSection.tsx:21-30 |
| news.3 | Gemeinschaftsküche erweitert · Unsere Küche wurde renoviert und erweitert, um größere Veranstaltungen zu unterstützen. · Neuigkeiten · Di., 15. Juli 2025 · 1 Min. | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:96; NewsSection.tsx:31-40 |
| news.4 | Neuer Imam stellt sich vor · Wir freuen uns, [Name – Imam] als neues Mitglied unserer Gemeinde willkommen zu heißen. · Gemeinde · Sa., 12. Juli 2025 · 4 Min. | – (nur DE in Quelle) | – (nur DE in Quelle) | Home.dc.html:97 (Name durch Platzhalter, A5); NewsSection.tsx:41-50 |

## DATEN

Vorschlag (A7):
- Veranstaltung: slug (Text, eindeutig, nicht mehrsprachig; /veranstaltungen/[slug], K-03); title, description, location, audience (Text, mehrsprachig ja); date (Datum; Wiederholung als Regeltext, ja); time (Beginn, Ende; nein); category (Enum bildung, veranstaltung, jugend; nein; Home.dc.html:86-91); featured (Boolean); organization (Enum main, at, kt, gt, kgt; nein).
- Nachricht: slug (Text, für /nachrichten/[slug]); title, excerpt (Text, mehrsprachig ja); category (Enum, Anzeige mehrsprachig ja); date (Datum, nein); readTime (Minuten, nein); image (Medium, nein; Alt-Text ja); featured (Boolean).
- Auswahl offen: Design sechs Veranstaltungen, vier Nachrichten (Home.dc.html:45, 67, 105); Bestand alle Veranstaltungen, alle nicht featured Nachrichten (EventsSection.tsx:160; NewsSection.tsx:63-64).
- Hero-Bild: Medium (nein), Alt-Text (ja).
- K-02: de Pflicht, tr und en optional mit Rückfall auf de; Oberflächentexte in messages/{de,tr,en}.json.

## FORMULARFELDER

– (entfaellt, auf der Startseite gibt es keine Eingabefelder; Home.dc.html:15-76)

## INTERAKTIONEN

- Sprachwahl (on-lang, Home.dc.html:16) setzt den Zustand, Seite rendert neu (:106); Bestand ohne Pfadwechsel (LanguageContext.tsx:791-797).
- „Gemeinde beitreten“ → JoinUs (Home.dc.html:26; HeroSection.tsx:46); „Mehr erfahren“ → AboutUs (:27; HeroSection.tsx:54).
- „Alle Veranstaltungen anzeigen“ → Events (Home.dc.html:42; EventsSection.tsx:233); Karte → EventDetails (EventsSection.tsx:219; 00 Laufbuch.dc.html:313).
- „Alle Neuigkeiten anzeigen“ → News (Home.dc.html:60; NewsSection.tsx:167); Karte → NewsDetails (NewsSection.tsx:115, 131).
- Hover: Farbwechsel 150 ms (Home.dc.html:26, 27, 42, 60; readme.md:24); Bestand hebt Karten an (EventsSection.tsx:163; NewsSection.tsx:84, 132), readme.md:20 verlangt „keine Sprünge“.

## ZUSTAENDE

Eigenschaften (data-props, Home.dc.html:79):
- lang: Enum, Optionen de, tr, en; Default de (TS 'de'|'tr'|'en').
- loggedIn: Boolean, Default false (TS boolean). Nur an den Header weitergereicht (:16, :106); die Startseite ändert sich nicht (abgeleitet).

Design intern:
- lang: null, dann Eigenschaft, dann de; unbekannter Wert fällt auf T.de zurück (:103, :105).
- showDisc: false; true, wenn der Schlüssel igmg-design-disclaimer-shown fehlt; bei Lesefehler kein Dialog (:101). Schließen setzt „true“ (:107).

Bestand:
- Route home (RouteContext.tsx:14); Sprache de (LanguageContext.tsx:791).
- Disclaimer: Schlüssel igmg-wetzlar-disclaimer-shown, ohne try/catch (App.tsx:38-51).
- Gebetszeitenleiste außer auf prayer-times (App.tsx:111, 167-171).
- Angemeldet: isLoggedIn, Standard false, Anmeldung und Abmeldung (Header.tsx:22, 76, 92).
- Bildfehler: drei Ersatzquellen (HeroSection.tsx:72-76).

Nicht vorhanden:
- Leer: keine Veranstaltungen oder Nachrichten; kein Text in Design oder Bestand (offen).
- Fehler, Erfolg, Schritt: entfaellt, keine Formulare.
- Laden: hint-placeholder-count 6 und 3 (Home.dc.html:45, 67) nur Vorschau (abgeleitet).

## BILDER

- Hero: Streifen-Platzhalter „Foto: IGMG Wetzlar Moschee“, Radius 12 (Home.dc.html:30). Bestand: Unsplash mit Ersatzquellen (HeroSection.tsx:69-76), laut Laufbuch nicht übernommen (00 Laufbuch.dc.html:34).
- Nachricht 1: „Foto: Beitragsbild Gebetszeiten“ (Home.dc.html:94); Nachrichten 2 bis 4 ohne Bildfeld (:95-97).
- Logos: 246cd04b, 301e0b5b, efe65084, 8ce65541 (EventsSection.tsx:9-12), nur 40 × 40 px (readme.md:8; 00 Laufbuch.dc.html:231). Echte Fotos fehlen (00 Laufbuch.dc.html:233).

## AUFFAELLIGKEITEN

1. Logo-Zuordnung: Bestand GT=8ce65541, KT=301e0b5b, KGT=efe65084 (EventsSection.tsx:10-12, 125-127); Laufbuch GT=301e0b5b, KT=efe65084, KGT=8ce65541 (00 Laufbuch.dc.html:34). Offen (:230).
2. Format: Design „14:00–16:00 Uhr“, „Mo., 28. Juli 2025“, „2 Min.“ (Home.dc.html:86, 90, 94); Bestand „14:00 - 16:00“, „28. Juli 2025“, „2 min“ (EventsSection.tsx:24, 71; NewsSection.tsx:17). Design gilt (D-10).
3. Hintergrund: Bestand mit Verlauf und Muster (HeroSection.tsx:12-21); Design einfarbig (Home.dc.html:19, 34; readme.md:22). Streifen hinter der Beschriftung (Home.dc.html:30) klären.
4. Breite: Design 1344 px (Home.dc.html:20, 35, 53), readme.md:25 nennt 1280 px.
5. Disclaimer: zwei Schlüssel (Home.dc.html:101, 107; App.tsx:42, 49), zwei Umfänge (Home.dc.html:76; App.tsx:193-196).
6. Plan 03.1 nennt nur „lang“ (00 Laufbuch.dc.html:153); das Design hat zusätzlich loggedIn (Home.dc.html:79).
7. Beispielinhalte datiert Juli 2025 (Home.dc.html:90, 94-97), heute ist der 11.10.2026; das Laufbuch nennt sie Beispielinhalte (00 Laufbuch.dc.html:238).
8. Featured: Design nimmt NEWS[0] fest (Home.dc.html:105), Bestand das Featured-Flag (NewsSection.tsx:63-64).
9. LanguageContext.tsx:114-115, 372-373, 630-631 haben tr und en für andere Texte; News.tsx:189-190 und Events.tsx:178 wurden nicht übernommen.

## OFFENE FRAGEN

1. Welche und wie viele Veranstaltungen und Nachrichten zeigt die Startseite?
2. Sprachwechsel nur über Zustand (Home.dc.html:106) oder über /tr und /en (K-02)?
3. Welcher Disclaimer-Schlüssel und Umfang gilt (Auffälligkeit 5)?
4. Welcher Text gilt bei leeren Listen?
5. Freigabe der Übersetzungen für „– (nur DE in Quelle)“-Texte (K-02; neue Übersetzungen in MENSCHEN.md markiert).
6. Veranstaltungskarte: „Mehr erfahren“ oder „Details ansehen“ (00 Laufbuch.dc.html:313)?
7. Logo-Zuordnung bestätigen (00 Laufbuch.dc.html:230).
8. Gebetszeiten-Quelle und Berechnung festlegen (G-06; 00 Laufbuch.dc.html:232).
9. Name in Nachricht 4 bestätigen oder ersetzen (G-04; 00 Laufbuch.dc.html:238).
10. Slugs je Sprache für /veranstaltungen/[slug] und /nachrichten/[slug] festlegen (K-03).

=== ENDE S01 · BEREIT ZUR RÜCKGABE ===
