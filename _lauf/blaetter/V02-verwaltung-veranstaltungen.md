# V02 · Verwaltung: Veranstaltungen

Kennung V02 · Rolle Kundschafter · Phase P0 · Kern-Version 1.0 · Quellen: Dashboard.dc.html (Design), Dashboard.tsx (Bestand)

## SEITE

Verwaltungsmodul „Verwaltung: Veranstaltungen“ im Admin-Dashboard (Plan 07.3, LB:175). Design-Zustand: section=events, dialog=veranstaltung (DC:110).

## ROUTE

- Ziel laut Auftrag: /verwaltung/veranstaltungen.
- Design: kein Pfad; der Abschnitt entsteht nur über section=events (DC:110).
- Bestand: Zustandsrouter mit Route „dashboard“ (RC:3, APP:55–56); der Abschnitt wird über activeSection gewählt (TSX:154, 1208–1210). Keine Route mit „verwaltung“ in APP und RC gefunden.

## QUELLEN

- Kürzel: DC = Dashboard.dc.html (nur gelesen). TSX = src/app/components/Dashboard.tsx. EFF = src/app/components/EnhancedEventForm.tsx (in TSX nur importiert, TSX:55, nicht gerendert). LC = src/app/components/LanguageContext.tsx (de ab 12, tr ab 270, en ab 528). UI = src/app/components/ui/dialog.tsx. APP = src/app/App.tsx. RC = src/app/components/RouteContext.tsx. Bestandspfade ab uploads/igmg-wetzlar-website/. LB = 00 Laufbuch.dc.html. RM = readme.md.
- Vorgaben aus dem Auftrag: K-05, K-06, K-07, K-09, G-05, G-07. Keine religiösen Texte auf diesem Blatt (A6 entfällt).

## ZWECK

Verwaltung legt Veranstaltungen an, ändert sie und entfernt sie über Tabelle und Dialog. Die Tabelle zeigt Titel, Datum, Kategorie, Status und Teilnehmer. Wiederholung, Zielgruppe und Anmeldung mit Platzzahl verlangt K-09, das Design zeigt sie nicht (ABGELEITET).

## ABSCHNITTE

Aufbau (Reihenfolge; Komponenten aus 02 Komponenten, LB:152):
1. Header, dc-import, current="dashboard", angemeldet (DC:16). Blatt 02.1.
2. PrayerTimesBar (DC:17). Blatt 02.2.
3. Breadcrumbs, label="Dashboard" (DC:18). Blatt 02.3.
4. Seitenleiste, 280 px, schmal 100 % (DC:20, 150): Kopf (DC:21), Navigation mit sechs Punkten (DC:23–24).
5. Kopfzeile des Inhalts: Überschrift und Button mit Plus-Icon (DC:45).
6. Tabelle in Karte, sechs Spalten, zwei Beispielzeilen, Stift und Papierkorb je 44 px (DC:46–52).
7. Footer (DC:86). Blatt 02.4.
8. Dialog-Overlay, Klick schließt (DC:88–90).
9. Dialogkopf mit Schließen-Button 48 px (DC:91–93).
10. Felder im Raster, Titel und Beschreibung über ganze Breite (DC:94–103).
11. Fußzeile mit Abbrechen und Erstellen (DC:104).

Texte (A2):

| Schlüssel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| nav.dashboard | Dashboard | Panel | Dashboard | DC:111 LC:127,385,643 |
| nav.news | Neuigkeiten | Haberler | News | DC:111 LC:114,372,630 |
| nav.events | Veranstaltungen | Etkinlikler | Events | DC:111 LC:131,389,647 |
| nav.weitere | Ankündigungen; Nachrichten; Tickets | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:111 TSX:359–361 (LC:130 „Meldungen“) |
| nav.zaehler | 2; 2; 1; 3; 1 | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:139 (feste Werte) |
| shell | Admin Dashboard; IGMG Wetzlar Verwaltung; Menü öffnen; Dashboard-Bereiche | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:21,23 TSX:1197–1198,1253 |
| events.kopf | Veranstaltungen verwalten; Neue Veranstaltung | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:144 TSX:589,592 |
| table.kopf | Titel; Datum; Kategorie; Status; Teilnehmer; Aktionen | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:144 TSX:601–606 |
| table.status | Kommend | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:144 TSX:624 (LB:299) |
| table.kuerzel | GT; KT | GT (Gençlik); KT (Kadınlar) | GT (Youth); KT (Women) | DC:113 LC:379–380,637–638 |
| table.beispiel | Jugend-Fußballturnier; Frauen-Kochkurs; Sa., 20. Apr. 2024; Mo., 25. März 2024; 14:00–18:00 Uhr; 18:00–21:00 Uhr; 24 / 30; 15 / 20 | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:113 (Beispielinhalte) |
| table.aria | Bearbeiten: {Titel}; Löschen: {Titel} | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:144 (editLabel, delLabel) |
| dlg.kopf | Neue Veranstaltung; Erstellen Sie hier eine neue Veranstaltung. | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:119 TSX:1359,1364 |
| dlg.schliessen | Schließen | – (nur DE in Quelle) | Close | DC:93 UI:68 |
| dlg.feld | Titel; Beschreibung; Datum; Startzeit; Endzeit; Ort; Kategorie | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:119 TSX:1371–1435,1380 |
| dlg.platzhalter | Veranstaltungstitel...; Veranstaltungsbeschreibung...; Veranstaltungsort... | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:119 TSX:1376,1401,1440 |
| dlg.optionen | Allgemein; Ana Teşkilatı; Kadın Teşkilatı; Gençlik Teşkilatı; Kadın Gençlik Teşkilatı | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:115 TSX:1387–1391 |
| dlg.abbrechen | Abbrechen | İptal | Cancel | DC:104 TSX:1446 LC:173,431,689 |
| dlg.erstellen | Erstellen | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:104 TSX:1507 |
| edit.bestand | Veranstaltung bearbeiten; Bearbeiten Sie hier die Veranstaltung.; Aktualisieren | – (nur DE in Quelle) | – (nur DE in Quelle) | TSX:1359,1363,1507 (nicht im Design) |

## DATEN

Heute keine Datenbank: Veranstaltungen liegen im Komponentenzustand (TSX:236) und werden nur dort gespeichert (TSX:1484). Vorschlag für PostgreSQL (K-05), nicht aus den Quellen:
- id: uuid; mehrsprachig nein (TSX:68).
- title, description: Text; mehrsprachig ja (TSX:69–70).
- start_at, end_at: Zeitstempel in UTC, Anzeige Europe/Berlin; mehrsprachig nein (ABGELEITET, K-05); im Bestand getrennt Datum und Uhrzeit (TSX:71–73).
- location: Text; mehrsprachig nein (TSX:74).
- organization_id: Fremdschlüssel; Name mehrsprachig ja (TSX:75; ABGELEITET, K-09).
- category: Enum general, AT, KT, GT, KGT; Bezeichnungen mehrsprachig ja (TSX:79).
- audience: Text oder Enum; mehrsprachig ja (ABGELEITET, K-09).
- recurrence_rule, recurrence_exceptions: RRULE und Ausnahmedaten; mehrsprachig nein (ABGELEITET, K-09).
- publication_state: Entwurf, Veröffentlicht; deleted_at für Papierkorb 30 Tage; Bezeichnungen mehrsprachig ja (ABGELEITET, K-05).
- status: upcoming, ongoing, completed, cancelled; Anzeige mehrsprachig ja; Vorschlag: aus Zeit berechnet (TSX:76).
- is_public, requires_registration: Wahrheitswert; mehrsprachig nein (TSX:80–81).
- max_attendees: Zahl, optional; mehrsprachig nein (TSX:78). attendee_count: aus Anmeldungen berechnet; nein (TSX:77; ABGELEITET).
- price: Dezimal, optional; mehrsprachig nein (TSX:82).
- contact_name, contact_phone, contact_email: Personendaten; mehrsprachig nein; echt löschbar, Zugriff im Audit-Log, Löschfrist (TSX:83–85; K-05, G-07).
- image_url: Text, optional, ohne Formularfeld; mehrsprachig nein (TSX:86).
- tags: Liste; mehrsprachig nein (TSX:87).
- created_by, created_at, updated_at: Benutzerbezug und UTC-Zeitstempel; mehrsprachig nein (ABGELEITET; TSX:88–89; TSX:1475 Platzhalter „Current User“).

## FORMULARFELDER

Design (DC:119; Pflicht laut TSX:1505):
1. Titel, Text, ganze Breite, Pflicht (DC:119; TSX:1371–1377).
2. Beschreibung, Textfeld mit vier Zeilen, ganze Breite, Pflicht (DC:98, 119; TSX:1396–1403).
3. Datum, Datumsfeld, Pflicht (DC:119; TSX:1407–1413).
4. Startzeit, Uhrzeit, Pflicht (DC:119; TSX:1416–1422).
5. Endzeit, Uhrzeit, optional (DC:119; TSX:1425–1431).
6. Ort, Text, Pflicht (DC:119; TSX:1435–1441).
7. Kategorie, Dropdown ohne Leerwert; Standard Allgemein (DC:99, 115, 119; TSX:176, 1380–1392).

Bestand, nicht im Design (EFF, nicht gerendert):
- Öffentliche Veranstaltung, Kontrollkästchen, Standard an (EFF:197; TSX:177).
- Anmeldung erforderlich, Standard aus (EFF:209; TSX:178).
- Maximale Teilnehmerzahl, Zahl, Minimum 1 (EFF:215, 222).
- Preis (€), Zahl, Schritt 0,01 (EFF:231, 239).
- Tags, durch Komma getrennt (EFF:250, 256).
- Ansprechpartner, Telefon, E-Mail: Personendaten; Platzhalter nur als Beispielwert (EFF:311, 326, 341).

ABGELEITET (K-09; in den Quellen kein Formularfeld): Wiederholung mit RRULE, Ausnahmen, Zielgruppe, Organisation als eigenes Feld.

## INTERAKTIONEN

- Seitenleiste: Klick setzt den Abschnitt, schmal schließt das Menü (DC:138). Bestand: Abschnitt setzen, auf Mobil Sheet schließen (TSX:1208–1211).
- „Neue Veranstaltung“ öffnet den leeren Dialog (DC:45, 119; TSX:590).
- Stift: Design öffnet denselben leeren Dialog (DC:52, Aufruf von tbl.create). Bestand befüllt alle Felder und zeigt „Veranstaltung bearbeiten“ (TSX:635–654, 1359).
- Papierkorb: Design ohne Wirkung (DC:52). Bestand entfernt sofort, ohne Rückfrage (TSX:662).
- Schließen über X, Abbrechen, Overlay oder Escape (DC:90, 93, 104, 132).
- Erstellen: Design schließt nur, ohne Speichern (DC:104). Bestand legt an oder aktualisiert, setzt das Formular zurück und schließt (TSX:1448–1504).
- ABGELEITET: iCal-Datei je Termin, Abo-Feed je Organisation (K-09); Rollenprüfung serverseitig bei jeder Aktion (K-06).

## ZUSTAENDE

- section (DC:110): dashboard (Standard), news, events, announcements, messages, tickets. Hier: events.
- dialog (DC:110): none (Standard), neuigkeit, veranstaltung, ankuendigung, ticket. Hier: veranstaltung.
- Intern: navOpen (DC:124, 138); schmal unter 900 px (DC:137); der Zustand hat Vorrang vor den Eigenschaften (DC:135–136).
- Bestand: Dialog neu oder bearbeiten (TSX:1358–1364, 1507). Erstellen gesperrt, solange Titel, Beschreibung, Datum, Startzeit oder Ort leer sind (TSX:1505). Mobiles Sheet offen oder zu (TSX:158, 1240–1244).
- Termin-Status upcoming, ongoing, completed, cancelled (TSX:76); Badge „default“ nur bei upcoming (TSX:623).
- Nicht gestaltet, weder Design noch Bestand: leere Liste (DC:43–57; TSX:610), Laden, Fehler am Feld, Erfolgsmeldung (TSX:1503 schließt nur).

## BILDER

Entfällt: keine Fotos. Icons: menu, layout-dashboard, newspaper, calendar, megaphone, message-square, ticket, plus, pencil, trash-2, x (DC:21–93); Bestand mit lucide-react (TSX:591, 657, 664). Organisations-Logos fehlen in Tabelle und Dialog; laut D-06 gehören Logo und Name zur Organisation (LB:187; Dateien LB:34).

## AUFFAELLIGKEITEN

- Bearbeiten: Design öffnet einen leeren Dialog „Neue Veranstaltung“ (DC:52, 144), Bestand einen befüllten „Veranstaltung bearbeiten“ (TSX:635–654).
- Löschen: Bestand ohne Rückfrage und ohne Papierkorb (TSX:662); K-05 verlangt Papierkorb 30 Tage. Design zeigt kein Verhalten (DC:52).
- Organisation und Kategorie sind ein Feld mit Organisationsnamen (DC:115; TSX:1387–1391); K-09 trennt beides.
- KGT-Name: „Kadın Gençlik Teşkilatı“ (DC:115) gegen „Kız Gençlik Teşkilatı“ (TSX:1391, 619; EFF:41). Das Design gilt laut LB:228.
- Status: „Kommend“ (DC:144) ist laut LB:299 ein neuer Bedientext; Bestand zeigt den Rohwert upcoming (TSX:624). K-05-Zustände fehlen (TSX:76).
- Datum: Design mischt „Apr.“ und „März“ (DC:113); Bestand zeigt „2024-04-20 • 14:00“ (TSX:241–242, 613). Tabelle nicht chronologisch (DC:113; LB:268).
- Kürzel „GT“, „KT“ ohne Logo (DC:113, 50); Bestand mit farbigen Badges (TSX:386–390; EFF:46–50), abweichend von D-06 (LB:187).
- Schließen-Text: Design „Schließen“ (DC:93), Bestand „Close“ (UI:68).
- Breadcrumbs bleiben „Dashboard“ im Abschnitt Veranstaltungen (DC:18). Dashboard.tsx enthält kein Breadcrumbs-Element.
- EFF ist importiert, aber nicht gerendert (TSX:55). Der Dialog ist inline (TSX:1355–1511).
- Abbrechen setzt das Formular nicht zurück (TSX:1445). EFF enthält Emojis (EFF:349, 360); RM:15 verbietet sie.
- LB:239 meldet einen Absturz des Admin-Dashboards im Code; nicht geprüft.

## OFFENE FRAGEN

- Soll /verwaltung/veranstaltungen eine eigene Route werden, da der Bestand nur Zustandsrouting kennt (RC:3, APP:55–56)?
- Sind Organisation und Kategorie zwei Felder, und welche Kategorien gelten dann?
- Gelten Entwurf, Veröffentlicht und Papierkorb auch für Veranstaltungen (K-05)?
- Braucht das Löschen eine Bestätigung, und was geschieht mit vorhandenen Anmeldungen?
- Welche Rollen sehen den Abschnitt, und darf die Organisationsredaktion nur die eigene Organisation wählen (K-06)?
- Welche Fehlertexte und welcher Fokus gelten nach einem Fehler (K-07)?
- Ist die Logo-Zuordnung bestätigt (LB:230)?
- Welche Bedeutung haben die festen Zähler in der Seitenleiste (DC:139)?

=== ENDE V02 · BEREIT ZUR RÜCKGABE ===
