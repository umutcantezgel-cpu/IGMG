# V03 · Verwaltung: Neuigkeiten

V03 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt (Verwaltungsmodul) · Schwierigkeit 1

Kürzel: DC = Dashboard.dc.html (Design, Zeile). TSX = Dashboard.tsx (Bestand, Zeile). LC = LanguageContext.tsx, BC = Breadcrumbs.tsx, HDR = Header.tsx, RC = RouteContext.tsx, APP = App.tsx (Bestand unter src/app/ bzw. src/app/components/). LB = 00 Laufbuch.dc.html, RM = readme.md.

## SEITE

Verwaltung: Neuigkeiten, Abschnitt „news“ des Admin-Dashboards. Laufbuch-Kennung 07.3 (LB:175). Design-Zustand: section=news, dialog=neuigkeit (DC:110). Gemeinsame Teile per dc-import: Header, PrayerTimesBar, Breadcrumbs, Footer, Icon (eigene Blätter).

## ROUTE

Ziel laut Auftrag: /verwaltung/neuigkeiten. Der Bestand kennt keine URL-Routen, die Seitenwahl läuft über einen Zustand (RC:3; APP:55–56; HDR:578 und HDR:929 `navigateTo('dashboard')`). Jede Route prüft die Rolle serverseitig (K-06).

## QUELLEN

- DC: vollständig gelesen (Template DC:1–108, Script DC:110–160).
- TSX: NewsItem 57–65, Startdaten 215–234, Navigation 355–362, renderNews 520–581, renderContent 1174–1192, Layout 1229–1265, News-Modal 1268–1352.
- Übersetzungen: LC, BC und HDR:610 (nur Deutsch), weil RM:7 LC als Textquelle nennt.
- Hilfen: RM:12, RM:21, LB:35, LB:175, LB:193, LB:238–239, LB:289, LB:299.
- Nicht gelesen: ui/dialog.tsx und Blatt 08 (nicht im Auftrag).

## ZWECK

Angemeldete Ehrenamtliche sehen alle Neuigkeiten in einer Tabelle und legen sie über einen Dialog an, bearbeiten oder löschen sie (DC:43–57, DC:88–107; TSX:520–581, TSX:1268–1352). Die Rollen aus K-06 kommen im Design nicht vor.

## ABSCHNITTE

Aufbau (DC:15–108): 1. Kopf: Header mit active, current="dashboard", logged-in=true (DC:16); PrayerTimesBar (DC:17); Breadcrumbs mit label="Dashboard" (DC:18). 2. Seitenleiste (DC:20–27) mit Titel, Untertitel, Menü-Schalter (nur schmal) und Navigation, aria-label „Dashboard-Bereiche“ (DC:23, nur Design). 3. Abschnitt „Neuigkeiten verwalten“ (DC:43–57): Kopfzeile, Tabelle mit sechs Spalten, zwei Zeilen; Symbole mit aria-label „Bearbeiten: [Titel]“ und „Löschen: [Titel]“ (DC:52, nur Design). 4. Dialog (DC:88–107) mit Schließen-Symbol, aria-label „Schließen“ (DC:93, nur Design). 5. Fuß: Footer (DC:86).

| Schlüssel | de | tr | en | Fundstelle |
| --- | --- | --- | --- | --- |
| shell.titel | Admin Dashboard · IGMG Wetzlar Verwaltung | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:21; TSX:1197–1198 |
| shell.menue | Menü öffnen | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:21 (nur schmal); TSX:1253 |
| nav.dashboard | Dashboard | Panel | Dashboard | DC:111; LC:18, 276, 534 |
| nav.neuigkeiten | Neuigkeiten | Haberler | News | DC:111; BC:42, 65, 88 |
| nav.veranstaltungen | Veranstaltungen | Etkinlikler | Events | DC:111; BC:41, 64, 87 |
| nav.rest | Ankündigungen · Nachrichten · Tickets | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:111; „Tickets“ heißt in LC:130 „Meldungen“ |
| nav.zaehler | 2 · 2 · 1 · 3 · 1 | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:139 (fest) |
| bc.dashboard | Dashboard | Gösterge Paneli | Dashboard | DC:18; BC:22, 45, 68 |
| liste.titel | Neuigkeiten verwalten · Neue Nachricht | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:45, 143; TSX:523, 526 |
| liste.kopf | Titel · Autor · Datum · Status · Aufrufe · Aktionen | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:143; TSX:535–540 |
| liste.zeile1 | Ramadan Programm 2024 · [Name – Vorsitzender] · Fr., 15. März 2024 · Veröffentlicht · 245 | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:112, 114; TSX:218–223 |
| liste.zeile2 | Neue Koranschule-Anmeldungen · [Name – Funktion nicht angegeben] · So., 10. März 2024 · Entwurf · 0 | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:112; TSX:227–232 |
| dialog.titel | Neue Nachricht · Erstellen Sie hier eine neue Nachricht. | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:92, 118; TSX:1272, 1277 |
| feld.titel | Titel · Nachrichtentitel eingeben... | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:97, 100; TSX:1283, 1288 |
| feld.inhalt | Inhalt · Nachrichteninhalt eingeben... | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:97–98; TSX:1292, 1297 |
| feld.status | Status · Entwurf · Veröffentlicht | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:97, 99, 118; TSX:1302, 1309–1310 |
| dialog.abbrechen | Abbrechen | İptal | Cancel | DC:104; LC:173, 431, 689 |
| dialog.erstellen | Erstellen | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:104, 118; TSX:1348 |
| dialog.bearbeiten | Nachricht bearbeiten · Bearbeiten Sie hier die Nachricht. · Aktualisieren | – (nur DE in Quelle) | – (nur DE in Quelle) | nur TSX:1272, 1276, 1348 |

## DATEN

Vorschlag für die Datenbank, ABGELEITET (A7; Typ, mehrsprachig):
- id: uuid, nein.
- titel: Text, Pflicht, nein (ein Feld im Design, DC:97–100).
- inhalt: Text mit Zeilenumbrüchen, nein (DC:98).
- status: Auswahl entwurf, veroeffentlicht, papierkorb, nein (DC:118; K-05).
- autor_id: Verweis auf das Konto, nein; der Anzeigename ist ein Personendatum (G-07).
- veroeffentlicht_am, geaendert_am: Zeitstempel in UTC, Anzeige Europe/Berlin (K-05), nein.
- geloescht_am: ABGELEITET (Papierkorb 30 Tage, K-05), nein.
- aufrufe: Ganzzahl, nein; Herkunft offen.
- organisation: ABGELEITET, Auswahl wie DC:115 (Allgemein, Ana Teşkilatı, Kadın Teşkilatı, Gençlik Teşkilatı, Kadın Gençlik Teşkilatı), nein; im Dialog fehlt sie.
- bild_id, alt_text: ABGELEITET aus K-10; Alt-Text Pflicht, nein.

Beispieldaten DC:112 sind als fiktiv zu kennzeichnen (G-04) und laut LB:238 zu ersetzen oder zu bestätigen. Der Bestand legt das Datum nur als Tag in UTC an (TSX:1337).

## FORMULARFELDER

- db-n-t „Titel“: Text, Vollbreite; Pflicht laut Bestand (Sperre TSX:1346); Vorgabe leer.
- db-n-c „Inhalt“: Textarea, vier Zeilen (DC:98; TSX:1298), Vollbreite; Pflicht laut Bestand; Vorgabe leer.
- db-n-s „Status“: Auswahl Entwurf oder Veröffentlicht, Breite auto; Vorgabe Entwurf nur im Bestand (TSX:168, 1343).
- Validierung ABGELEITET aus K-07: ein Zod-Schema für Client und Server, Fehlertext am Feld, Fokus auf die Rückmeldung. Die Texte fehlen in beiden Quellen.
- Einwilligung: – (entfällt, kein öffentliches Formular).

## INTERAKTIONEN

1. „Neuigkeiten“ in der Navigation (DC:24, 138): zeigt den Abschnitt und schließt das Menü.
2. „Menü öffnen“ (DC:21, 150): nur schmal unter 900 px (DC:137); Bestand: Sheet unter 768 px (TSX:1249–1255).
3. „Neue Nachricht“ (DC:45, 143): öffnet den Dialog ohne Vorbelegung.
4. Stift-Symbol (DC:52): öffnet denselben Dialog ohne Vorbelegung (DC:143); Bestand lädt den Eintrag (TSX:561–563).
5. Papierkorb-Symbol (DC:52): ohne Aktion im Design; Bestand entfernt den Eintrag sofort (TSX:571).
6. Schließen (DC:93), Abbrechen (DC:104), Hintergrund (DC:90) und Escape (DC:132) schließen den Dialog. Bestand: Abbrechen setzt das Formular nicht zurück (TSX:1315).
7. „Erstellen“ (DC:104): schließt nur, speichert nicht. Bestand: legt an mit Autor „Current User“ (TSX:1336), setzt das Formular zurück und schließt (TSX:1341–1344).
8. „Erstellen“ bei leerem Titel oder Inhalt ist im Bestand gesperrt (TSX:1346), im Design nicht gezeigt.

## ZUSTAENDE

- Eigenschaften (DC:110): section = dashboard (Vorgabe), news (dieser Zustand), events, announcements, messages, tickets. dialog = none (Vorgabe), neuigkeit (dieser Zustand), veranstaltung, ankuendigung, ticket. Beide tsType string.
- Interner Zustand (DC:124): section, dialog, conv, ticket, w (Vorgabe 1440), navOpen (Vorgabe false). Schmal: w unter 900 (DC:137).
- Liste mit zwei Einträgen (gestaltet, DC:112, 143). Liste leer: fehlt in Design und Bestand (TSX:543–579).
- Dialog Neu mit leeren Feldern und gesperrtem Erstellen (nur Bestand, TSX:1346).
- Dialog Bearbeiten mit Titel „Nachricht bearbeiten“ und Schaltfläche „Aktualisieren“ (nur Bestand, TSX:1272–1277, 1348).
- Fehler am Feld und Erfolgsmeldung: fehlen in beiden Quellen; der Bestand schließt nach dem Speichern nur (TSX:1344).
- Status Veröffentlicht: Hintergrund #EBF9F2, Schrift #065F46. Entwurf: #F3F0E9, #514C46 (DC:143). Bestand: Badge default oder secondary (TSX:550–552).
- Papierkorb: ABGELEITET aus K-05, fehlt in beiden Quellen.
- Navigation aktiv: aria-current, Hintergrund #047857 (DC:140); Bestand: bg-primary (TSX:1214–1215).
- Angemeldet: Header logged-in=true (DC:16). Nicht angemeldet und Rolle ohne Recht fehlen.
- Sprache: nur Deutsch (DC:15).

## BILDER

Keine Fotos. Nur Icons per dc-import Icon: menu (DC:21), Navigationssymbole (DC:24), plus (DC:45), pencil und trash-2 (DC:52), x (DC:93), Größen 18 bis 24 px. Bild mit Alt-Text (K-10): ABGELEITET, im Design und Bestand nicht vorgesehen.

## AUFFAELLIGKEITEN

1. Bearbeiten: Das Design öffnet „Neue Nachricht“ ohne Daten (DC:52, 143); der Bestand hat eine eigene Bearbeiten-Fassung (TSX:561–563, 1272–1277).
2. Löschen: Design ohne Aktion; Bestand ohne Rückfrage und ohne Papierkorb (TSX:571). K-05 verlangt den Papierkorb.
3. Datum: DC:112 „Fr., 15. März 2024“, Bestand ISO „2024-03-15“ (TSX:221), roh angezeigt (TSX:548).
4. Sperre und Breite: Design ohne Sperre (DC:104), 640 px (DC:91); Bestand gesperrt (TSX:1346), 425 px (TSX:1269).
5. Autor: „Current User“ als Platzhalter im Bestand (TSX:1336).
6. Aufrufe (DC:143; TSX:554) setzen eine Zählung voraus; G-07 verbietet Tracker.
7. „Nachricht“ ist doppelt belegt: Navigation „Nachrichten“ meint Chat (DC:111; TSX:360), „Neue Nachricht“ meint einen Artikel (DC:118; TSX:1272).
8. Übersetzung: LB:35 nennt Dashboard-Texte in LC, TSX ruft aber kein t() auf (TSX:153). Der tr-Begriff widerspricht sich: „Gösterge Paneli“ (BC:45) gegen „Panel“ (LC:276).
9. Zähler fest im Design (DC:139), im Bestand keine (TSX:355–362).
10. Gemeinsame Teile: Design mit Header, PrayerTimesBar, Breadcrumbs, Footer (DC:16–18, 86); Dashboard.tsx ohne sie (TSX:1229–1265).
11. Schwellen: Design schmal unter 900 px (DC:137), Bestand md = 768 px (TSX:206, 1233).
12. Trefferfläche: Stift und Papierkorb 44 px (DC:52); RM:21 und LB:217 verlangen 48 px.
13. LB:239 sagt, das Admin-Dashboard stürze im Code ab. Nicht geprüft.

## OFFENE FRAGEN

1. Soll Bearbeiten wie im Bestand einen Dialog mit Vorbelegung zeigen?
2. Verschiebt Löschen in einen Papierkorb mit 30 Tagen (K-05), und gibt es eine Rückfrage?
3. Welche Texte gelten für Fehler am Feld, leere Liste und Rückmeldung? Vorschlag: [Fehlertext – offen].
4. Dürfen Redaktion und Organisationsredaktion anlegen, und braucht es ein Organisationsfeld (K-06)?
5. Werden Neuigkeiten nur auf Deutsch gepflegt oder auch auf Türkisch und Englisch?
6. Gilt K-07 (ALTCHA, Honigtopf, Ratenbegrenzung) für die angemeldete Verwaltung? Vorschlag: nein.
7. Soll der Dialog ein Bildfeld mit Pflicht-Alt-Text erhalten (K-10)?
8. Woher stammt die Zählung „Aufrufe“, ohne Tracker (G-07)?
9. Was sehen Besucher ohne Anmeldung oder ohne Recht?
10. Erhält die Verwaltung Gebetszeiten-Leiste und Footer (DC:17, 86)?
11. Welcher Seitentitel und Breadcrumb-Pfad gilt für /verwaltung/neuigkeiten, da der Bestand keine URL-Routen hat (RC:3)?
12. Wird Erstellen bei leeren Pflichtfeldern gesperrt (TSX:1346)?
13. Welche Maximallängen gelten für Titel und Inhalt?
14. Wird „(Pflichtfeld)“ gekennzeichnet (LB:299)?
15. Hat der Schließen-Knopf im Bestand einen englischen Screenreader-Text? ui/dialog.tsx wurde nicht gelesen.
16. Welches Datumsformat gilt: „Sa., 2. Aug.“ (RM:12) oder „Mo., 28. Juli 2025“ (LB:193)?

=== ENDE V03 · BEREIT ZUR RÜCKGABE ===
