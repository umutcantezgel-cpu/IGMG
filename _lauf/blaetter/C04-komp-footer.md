# C04 · Komponentenblatt „Footer“

C04 · Kundschafter · Phase P0 · Kern-Version 1.0

## SEITE
Komponentenblatt „Footer“ (gemeinsamer Teil, Lb:184). Kein Seitenblatt.

## ROUTE
Alle Seiten per dc-import (Z-04, Lb:216). Nicht auf der Vollbild-Ansicht (Lb:155).

## QUELLEN
D = Footer.dc.html (Template Z. 9–67, data-props Z. 68, Texte Z. 69–73, renderVals Z. 75–88). B = Footer.tsx (238 Zeilen, nur gelesen). LC = LanguageContext.tsx im selben Code-Ordner, nur Übersetzungen gleichlautender Texte. rm = readme.md. Lb = 00 Laufbuch.dc.html (Plan Z. 151, Entscheidungen Z. 184–189, Z-04 Z. 216, Liste für Menschen Z. 224–252, Platzhalter Z. 254–256, Textänderung Z. 299).

## ZWECK
Gemeinsame Fußzeile aller Seiten: Gemeindeprofil, Kontakt, Öffnungszeiten mit Status, sechs Schnellzugriffe, Teaser für die Webseiten-Anfrage, Rechtslinks, Copyright. Gestalt und Text nach D, fehlende Sprachfassungen aus B und LC.

## ABSCHNITTE
Aufbau (D): Wurzel footer mit lang (D:15), einfarbig #0E3929, Text #FFFFFF, 18 px. Raster bis 1344 px, Spalten ab 220 px (D:16; im Code Tailwind sm/md/lg, Lb:186). Abschnitte: Gemeinde (D:17–24), Kontakt (D:26–33), Öffnungszeiten (D:34–41), Schnellzugriff (D:42–49, nav), Teaser (D:50–54), Fußleiste (D:56–65).

Komponenten: dc-import Icon, zwölfmal: facebook, instagram, youtube (20 px, D:21–23); stern8 (14 px, D:27, 35, 43, 51); map-pin, phone, mail (20 px, D:29–31); circle-check bzw. circle-x (16 px, D:39); building-2 (20 px, D:53).

Texte (A2):

| Schlüssel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| footer.brand | IGMG Wetzlar | – (nur DE in Quelle) | – (nur DE in Quelle) | D:18; B:51 (Eigenname) |
| footer.about | Eine Gemeinde, die auf Glauben, Bildung und Gemeinschaft basiert. Wir stehen allen Muslimen offen und fördern das Verständnis und die Praxis des Islam. | – (nur DE in Quelle) | – (nur DE in Quelle) | D:19; B:55–58 |
| footer.contact.heading | Kontakt | İletişim | Contact | D:27, 85; B:91, 167; LC:28, 286, 544 |
| footer.contact.address | [Adresse] | [Adresse] | [Adresse] | D:29; B:98–100 (Beispielwert, A5) |
| footer.contact.phone | [Telefonnummer] | [Telefonnummer] | [Telefonnummer] | D:30; B:106 (Beispielwert, A5) |
| footer.contact.email | Beispielwert | Beispielwert | Beispielwert | D:31; B:112 (A5, nicht ausgeschrieben) |
| footer.hours.heading | Öffnungszeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | D:35; B:121 |
| footer.hours.weekdays | Mo.–Fr. 09:00–22:00 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | D:37; B:129, 132 (abweichend) |
| footer.hours.weekend | Sa.–So. 08:00–22:00 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | D:38; B:137, 140 (abweichend) |
| footer.hours.now | Jetzt: | – (nur DE in Quelle) | – (nur DE in Quelle) | D:39; B:145 |
| footer.hours.open | Geöffnet | – (nur DE in Quelle) | – (nur DE in Quelle) | D:81; B:148 |
| footer.hours.closed | Geschlossen | – (nur DE in Quelle) | – (nur DE in Quelle) | D:81; Lb:299 (neu) |
| footer.quick.heading | Schnellzugriff | – (nur DE in Quelle) | – (nur DE in Quelle) | D:42, 43; B:159 |
| footer.quick.prayer | Gebetszeiten | Namaz Vakitleri | Prayer Times | D:83; B:163; LC:16, 274, 532 |
| footer.quick.events | Veranstaltungen | Etkinlikler | Events | D:83; B:164; LC:26, 284, 542 |
| footer.quick.education | Bildungsprogramme | – (nur DE in Quelle) | – (nur DE in Quelle) | D:84; B:165 |
| footer.quick.donate | Spenden | – (nur DE in Quelle) | – (nur DE in Quelle) | D:84; B:166 |
| footer.quick.about | Über uns | Hakkımızda | About Us | D:85; B:168; LC:23, 281, 539 |
| footer.request.heading | Webseite für Ihre Moschee | Caminiz için Web Sitesi | Website for Your Mosque | D:51, 70–72; B:22, 26, 30 |
| footer.request.text | Interessiert an einer modernen Webseite? | Modern bir web sitesi mi istiyorsunuz? | Interested in a modern website? | D:52, 70–72; B:23, 27, 31 |
| footer.request.cta | Jetzt anfragen | Şimdi başvur | Request now | D:53, 70–72; B:198–200 |
| footer.legal.copyright | © 2025 IGMG Wetzlar. Alle Rechte vorbehalten. | – (nur DE in Quelle) | – (nur DE in Quelle) | D:58; B:212 |
| footer.legal.links | Datenschutz, Impressum, AGB | – (nur DE in Quelle) | – (nur DE in Quelle) | D:60–62; B:219, 225, 231 |

LC-Fassungen sind Bestandsübersetzungen gleichlautender Texte (abgeleitet). Platzhalter sind sprachneutral (abgeleitet).

## DATEN
Vorschlag (A7):
- Gemeindeprofil: name (Text, nein); beschreibung (Langtext, ja: DE Pflicht, TR/EN mit Rückfall auf DE); adresse, telefon (Text, nein); email (E-Mail, nein).
- Öffnungszeiten (Liste): tagesgruppe (Enum mo-fr, sa-so; Anzeige aus messages, ja); von, bis (Uhrzeit, nein). Der Status wird berechnet, nicht gespeichert.
- Social-Links (Liste): plattform (Enum facebook, instagram, youtube, nein); url (URL, nein).
- Copyright-Jahr (Zahl, nein).
- Labels und Teasertexte: messages/{de,tr,en}.json (K-02). Schnellzugriff-Ziele und Rechtslinks: lokalisierte Routen (K-02), keine Datenbank.

## FORMULARFELDER
– (entfaellt, Footer hat keine Eingabefelder)

## INTERAKTIONEN
- Social-Links: href="#" (D:21–23), Hover Hintergrund #065F46. Zugänglicher Name (aria-label): „Facebook [Facebook-Link]“, „Instagram [Instagram-Link]“, „YouTube [YouTube-Link]“. B: Schaltflächen ohne Ziel (B:61–84).
- E-Mail: mailto-Link (D:31). Telefon: kein Link (D:30; B:105).
- Schnellzugriff: PrayerTimes, Events, QuranCourses, Projects, Contact, AboutUs (D:83–85; D-07). Hover: Strichstärke 2 px (D:46).
- Teaser-Button: MosqueRequest.dc.html (D:53; B:193 navigateTo). Hover Hintergrund #EBF9F2.
- Rechtslinks: Rechtliches.dc.html mit #datenschutz, #impressum, #agb (D:60–62; D-08).
- Keine Eingabe, kein Skript außer dem Status beim Rendern (D:77–78).

## ZUSTAENDE
- lang (data-props, D:68): Enum de | tr | en; Default de; tsType 'de'|'tr'|'en'. Wirkt auf lang-Attribut (D:15), Texte (D:70–72) und Rückfall auf de (D:80). B: Sprache über useLanguage, ohne Rückfall (B:18, 35).
- $preview (D:68): 1440 × 460, nur Vorschau, kein Komponentenwert.
- Öffnungsstatus (abgeleitet, D:77–81): Geöffnet oder Geschlossen, Icon circle-check bzw. circle-x. Mo–Fr offen ab 09:00 bis unter 22:00, Sa/So ab 08:00 bis unter 22:00, nach lokaler Besucherzeit. B: fest „Geöffnet“ (B:148).
- Fokus: 2 px #FFFFFF, Abstand 2 px (D:13). B: Hover mit Verschiebung (B:173) entfällt.
- Leer, Fehler, Erfolg, Schritt, angemeldet: entfaellt (kein Formular, keine Liste, kein Login-Bezug).
- Kontrast (abgeleitet, WCAG-Formel): Weiß auf #0E3929 12,8:1; #D3F0E2 auf #0E3929 10,6:1; Teaser #0E3929 auf Weiß 12,8:1, auf #EBF9F2 11,8:1.

## BILDER
- Logo: assets/logo-igmg-wetzlar.png, 40 × 40 px, Radius 4 px, alt „IGMG Wetzlar Logo“ (D:18; B:47). B nutzt 48 px (B:48). Laut Lb:231 nur 40 × 40 px mit weißem Grund.
- Keine Fotos, keine Verläufe, keine Flaggen (D:15; rm:22, 30).

## AUFFAELLIGKEITEN
1. Hintergrund: B nutzt einen Verlauf (B:38), D ist einfarbig (D:15; rm:22). Design gilt.
2. Zeiten: B „Mo - Fr:“ ohne „Uhr“ und Status fest „Geöffnet“ (B:129–148); D „Mo.–Fr.“ mit „Uhr“ und berechnetem Status (D:37–39, 81). Design gilt; die Zeiten selbst sind ungeprüft (Lb:234, 242).
3. D nennt die Zeiten zweimal: Anzeige (D:37–38) und Logik (D:78).
4. Telefon ohne Link (D:30; B:105) gegen K-11 (Telefon 48 px).
5. D lädt Google Fonts (D:11–12); K-04 verlangt selbst gehostete Schriften über next/font.
6. Teaser-Text: B 14 px (B:189), D 16 px (D:52). Design gilt.
7. Überschriften: B h3 (B:50, 90, 120, 158, 185), D h2 (D:27, 35, 43, 51). Ebene im Code festlegen.

## OFFENE FRAGEN
1. Welche Werte gelten für Adresse, Telefon, E-Mail, Social-Links und das Logo (Lb:225–227, 231, 235, 254–256)?
2. Stimmen die Öffnungszeiten? Lb:242 nennt für die Kontaktseite abweichende Bürozeiten.
3. Gilt für „Geöffnet“ die Besucherzeit oder Europe/Berlin, und soll der Status live aktualisiert werden?
4. Wird die Telefonnummer ein tel:-Link mit 48 px?
5. Bleibt das Copyright „© 2025“ fest oder wird es dynamisch?
6. Welche TR/EN-Fassungen gibt es für Geöffnet, Geschlossen, Jetzt:, Öffnungszeiten, Bildungsprogramme, Spenden, Rechtslinks und Copyright? Bis dahin „– (nur DE in Quelle)“ und Markierung in MENSCHEN.md (K-02).
7. Welche lokalisierten Pfade (K-02) erhalten die Ziele der Links?
8. Existieren die Anker #datenschutz, #impressum und #agb in Rechtliches.dc.html (nicht Teil dieses Pakets)?
9. Gilt der Footer auf allen Seiten außer der Vollbild-Ansicht? Z-04 bejaht das, Plan 04.2–07.4 (Lb:161–176) nennt ihn nicht ausdrücklich.

=== ENDE C04 · BEREIT ZUR RÜCKGABE ===
