# V04 · Verwaltung: Ankündigungen

V04 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Ziel-Route /verwaltung/ankuendigungen

## SEITE

Admin-Dashboard, Bereich „Ankündigungen“ mit Dialog „Neue Ankündigung“. Artboard 07.3 (00 Laufbuch.dc.html:175), Dialog-Zustand Nr. 17 (08 Dialoge und Zustaende.dc.html:55).

## ROUTE

/verwaltung/ankuendigungen (Vorgabe dieses Pakets). Design: kein eigener Pfad, der Bereich ist die Eigenschaft section="announcements" (Dashboard.dc.html:110). Bestand: Route „dashboard“ (RouteContext.tsx:3, App.tsx:55); Bereiche sind lokaler Zustand (Dashboard.tsx:1183).

## QUELLEN

- Design, vollständig gelesen: /Users/umurey/Downloads/IGMG Wetzlar Website Design/Dashboard.dc.html (Template 9–108, Script 110–161).
- Bestand, gezielt gelesen: uploads/igmg-wetzlar-website/src/app/components/Dashboard.tsx (Interface 92–101, Daten 283–294, Farben 364–372, Abschnitt 677–752, Dialog 1514–1612); ergänzend LanguageContext.tsx, NewsSection.tsx, News.tsx, RouteContext.tsx, App.tsx.
- Ergänzend, nur gelesen: Home.dc.html, News.dc.html, NewsCard.dc.html, PrayerTimesBar.dc.html, Icon.dc.html, readme.md, 00 Laufbuch.dc.html, 08 Dialoge und Zustaende.dc.html.
- Kurzformen in den Fundstellen: Dashboard.dc.html ist die Design-Datei, Dashboard.tsx die Bestandsdatei.

## ZWECK

Die Verwaltung legt Ankündigungen mit Titel, Inhalt, Priorität und Ablaufdatum an, bearbeitet sie und entfernt sie (Dashboard.dc.html:120, :145; Dashboard.tsx:92–101). Der Zugriff nach K-06 (Administration, Redaktion, Organisationsredaktion) ist offen, siehe OFFENE FRAGEN.

## ABSCHNITTE

Aufbau in Reihenfolge (Dashboard.dc.html):

1. Kopfleiste: Header (:16), PrayerTimesBar (:17), Breadcrumbs mit label „Dashboard“ (:18). Komponentenblätter 02.1 bis 02.3 (00 Laufbuch.dc.html:148–150).
2. Seitenleiste (:20): Überschrift „Admin Dashboard“ mit Untertitel (:21), Menübutton nur im schmalen Zustand (:21, :137), Navigation mit sechs Punkten (:23–25, :111).
3. Inhalt, Bereich announcements (:43–57): Kopfzeile mit Überschrift und Button (:45), Tabelle in Scroll-Box mit 720 px Mindestbreite (:46–47), sechs Spalten (:48), eine Zeile mit Aktionen (:49–53).
4. Dialog (:88–107): Overlay (:90), Titel und Beschreibung (:92), Schließen-Button (:93), Felderraster (:94–102), Fußzeile (:104).
5. Fußleiste: Footer (:86), Komponentenblatt 02.4.

Texte (de wörtlich; tr und en aus LanguageContext.tsx nur, wenn derselbe Text dort steht):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| vw.kopf | Admin Dashboard · IGMG Wetzlar Verwaltung · Menü öffnen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 |
| vw.crumb | Dashboard | Panel | Dashboard | Dashboard.dc.html:18; LanguageContext.tsx:276, :385, :534, :643 |
| vw.nav | Dashboard · Neuigkeiten · Veranstaltungen · Ankündigungen · Nachrichten · Tickets; Zähler 2 · 2 · 1 · 3 · 1; aria „Dashboard-Bereiche“ | Panel · Haberler · Etkinlikler · Ankündigungen, Nachrichten, Tickets: – (nur DE in Quelle) | Dashboard · News · Events · Ankündigungen, Nachrichten, Tickets: – (nur DE in Quelle) | Dashboard.dc.html:23, :111, :139; LanguageContext.tsx:276, :284–285, :534, :542–543 |
| vw.h2 | Ankündigungen verwalten | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:145 |
| vw.neu | Neue Ankündigung | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:45, :145 |
| vw.spalten | Titel · Autor · Läuft ab · Priorität · Status · Aktionen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:48, :145 |
| vw.beispiel | Parkplatz-Sanierung · [Name – Vorsitzender] · Mo., 25. März 2024 · Hoch · Aktiv | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:145, :114 |
| vw.aria | Bearbeiten: {Titel} · Löschen: {Titel} · Schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:52, :93 |
| vw.dlg | Neue Ankündigung · Erstellen Sie hier eine neue Ankündigung. | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:92, :120 |
| vw.felder | Titel · Ankündigungstitel eingeben... · Inhalt · Ankündigungsinhalt eingeben... · Priorität · Niedrig · Mittel · Hoch · Ablaufdatum | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:97–100, :120 |
| vw.knopf | Abbrechen · Erstellen | İptal (Schlüssel ticket.form.cancel) · – (nur DE in Quelle) | Cancel (ticket.form.cancel) · – (nur DE in Quelle) | Dashboard.dc.html:104, :120; LanguageContext.tsx:431, :689 |

## DATEN

Vorschlag, abgeleitet, Tabelle announcements (Typ, Pflicht, mehrsprachig):

- id: uuid, Pflicht, nein (Bestand vergibt Zeitstempel als Text, Dashboard.tsx:1592).
- title: Text, Pflicht, ja (Vorschlag; Design nur DE, Dashboard.dc.html:120).
- content: Langtext, Pflicht, ja (Vorschlag; Dashboard.dc.html:120).
- priority: Enum low, medium, high, nein; Anzeige Niedrig, Mittel, Hoch (Dashboard.tsx:96, :1556–1558).
- author_id: uuid auf das Konto, Pflicht, nein; Anzeige als [Name – Funktion] (Dashboard.tsx:97; Platzhalter „Current User“ :1596).
- created_at: timestamptz in UTC, Pflicht, nein; Anzeige als Datum in Europe/Berlin (K-05; Dashboard.tsx:98, :1597).
- expires_on: Datum, optional, nein (Dashboard.tsx:99; Standard leer :186).
- status: Enum, offen (siehe OFFENE FRAGEN; Dashboard.tsx:100).
- deleted_at: timestamptz, optional, nein; Papierkorb 30 Tage (K-05, abgeleitet). org_id: uuid, optional, nein; offen.
- Dashboard-Kachel: Anzahl gesamt und aktiv (Dashboard.tsx:440, :446; Dashboard.dc.html:152).

## FORMULARFELDER

- Titel: Text, Pflicht (Erstellen gesperrt ohne Titel, Dashboard.tsx:1606). Design-ID db-a-t (Dashboard.dc.html:120), Bestand announcement-title (Dashboard.tsx:1531).
- Inhalt: Textarea, 4 Zeilen, Pflicht (Dashboard.tsx:1606). Design-ID db-a-c (Dashboard.dc.html:120), Bestand announcement-content (Dashboard.tsx:1540, :1544).
- Priorität: Auswahl Niedrig, Mittel, Hoch (Werte low, medium, high; Dashboard.tsx:1556–1558). Standard im Design keiner (abgeleitet: „Niedrig“ vorausgewählt), im Bestand Mittel (Dashboard.tsx:186). Design-ID db-a-p (Dashboard.dc.html:120).
- Ablaufdatum: Datum, optional; Pflicht: – (fehlt in Quelle). Design-ID db-a-x (Dashboard.dc.html:120), Bestand announcement-expiry (Dashboard.tsx:1564).
- Maximallängen und Fehlertexte am Feld: – (fehlt in Quelle; K-07 verlangt Fehlertext am Feld).
- Zod-Vorschlag (abgeleitet, K-07): title und content nach trim mindestens 1 Zeichen; priority als Enum; expires_on optional.

## INTERAKTIONEN

- „Neue Ankündigung“ öffnet den leeren Dialog (Dashboard.dc.html:145; Dashboard.tsx:681–682).
- Bearbeiten-Button (Stift) öffnet im Design denselben leeren Dialog (Dashboard.dc.html:52, :145). Der Bestand lädt die Werte in den Dialog mit Titel „Ankündigung bearbeiten“ (Dashboard.tsx:723–731, :1518).
- Löschen-Button hat im Design keine Aktion (Dashboard.dc.html:52). Der Bestand entfernt den Eintrag sofort, ohne Rückfrage (Dashboard.tsx:739).
- Erstellen schließt im Design nur (Dashboard.dc.html:120). Der Bestand legt den Eintrag an, setzt das Formular zurück und schließt (Dashboard.tsx:1576–1604).
- Abbrechen schließt (Dashboard.dc.html:104; Dashboard.tsx:1573); der Bestand setzt das Formular dabei nicht zurück.
- X-Button, Klick auf den Hintergrund und Escape schließen den Dialog (Dashboard.dc.html:90, :93, :132).
- Schmal: „Menü öffnen“ zeigt die Navigation; ein Punkt setzt den Bereich und schließt das Menü (Dashboard.dc.html:21, :138).

## ZUSTAENDE

- Eigenschaft section (Dashboard.dc.html:110): Optionen dashboard, news, events, announcements, messages, tickets; Standard dashboard; tsType string. Hier: announcements.
- Eigenschaft dialog (Dashboard.dc.html:110): Optionen none, neuigkeit, veranstaltung, ankuendigung, ticket; Standard none; tsType string. Hier: ankuendigung (Zustand Nr. 17, 08 Dialoge und Zustaende.dc.html:55).
- Intern (Dashboard.dc.html:124, :129–130, :137, :150): navOpen false, Breite 1440. Schmal, wenn die Breite des Wurzelelements unter 900 px liegt; dann Seitenleiste 100 % statt 280 px.
- Tabelle mit einer Beispielzeile (Dashboard.dc.html:145); Leerzustand – (fehlt in Quelle).
- Status „Aktiv“ als Klartext (Dashboard.dc.html:51). „Abgelaufen“ als Badge (Dashboard.tsx:715) wird im Bestand nie gesetzt (Dashboard.tsx:292, :1599).
- Priorität Hoch: Hintergrund #FFEDEA, Schrift #AF2B25 (Dashboard.dc.html:145). Mittel und Niedrig: – (fehlt im Design).
- Bestand-Bearbeitungsmodus: Titel „Ankündigung bearbeiten“, Beschreibung „Bearbeiten Sie hier die Ankündigung.“, Button „Aktualisieren“ (Dashboard.tsx:1518, :1522, :1608).
- Erstellen gesperrt ohne Titel oder Inhalt (Dashboard.tsx:1606); im Design ohne sichtbaren Zustand (Dashboard.dc.html:120).
- Laden, Erfolg, Fehler: – (fehlt in Quelle).

## BILDER

Keine Fotos oder Bildflächen. Icons mit Pfaden in Icon.dc.html: menu und x (Zeile 23), plus (44), pencil (45), trash-2 (46), megaphone (68). Größen 18, 20 und 24 px (Dashboard.dc.html:21, :45, :52, :93).

## AUFFAELLIGKEITEN

1. Status: K-05 verlangt Entwurf, Veröffentlicht und Papierkorb. Das Design zeigt nur „Aktiv“ (Dashboard.dc.html:145), der Bestand kennt active und expired (Dashboard.tsx:100).
2. Öffentlich: Startseite und Nachrichten führen „Ankündigung“ als Kategorie von Neuigkeiten (Home.dc.html:58, :95; News.dc.html:51, :59; NewsSection.tsx:25; News.tsx:222). PrayerTimesBar hat im Design und im Bestand keinen Hinweisbereich (keine Treffer).
3. Farbe: „Ankündigung“ ist im Design blau (NewsCard.dc.html:54), auf der Nachrichtenseite rot (News.dc.html:51; News.tsx:266).
4. Spalten: Das Design hat kein „Datum“ und stellt Priorität nach „Läuft ab“ (Dashboard.dc.html:145). Der Bestand hat „Datum“ und Priorität vor Autor (Dashboard.tsx:692–698).
5. Priorität: Der Bestand zeigt den Rohwert „high“ (Dashboard.tsx:707) und färbt Hoch orange (Dashboard.tsx:367); das Design zeigt „Hoch“ in Rot (Dashboard.dc.html:145).
6. Aktions-Buttons sind 44 × 44 px (Dashboard.dc.html:52); die Regel verlangt 48 px (readme.md:21; 00 Laufbuch.dc.html:217).
7. Kopfleiste und Breadcrumb bleiben auf „Dashboard“ (Dashboard.dc.html:16, :18). Der Bestand zeigt keine Zähler in der Navigation (Dashboard.tsx:1203–1220); die Kachel hat im Design keine Notiz (Dashboard.dc.html:152), im Bestand steht „n aktiv“ (Dashboard.tsx:446).
8. Übersetzungen: Das Laufbuch nennt Dashboard-Texte in LanguageContext (00 Laufbuch.dc.html:35). Die Ankündigungstexte fehlen dort; der Bestand schreibt sie fest auf Deutsch.
9. Mobil: „Menü öffnen“ ist im Design sichtbar (Dashboard.dc.html:21), im Bestand nur als Screenreader-Text (Dashboard.tsx:1253).
10. Das Laufbuch meldet einen Absturz des Admin-Dashboards im Code (00 Laufbuch.dc.html:239). Nicht geprüft.

## OFFENE FRAGEN

1. Öffentliche Ausgabe: Sind Ankündigungen eigene Einträge mit Hinweisbereich oder eine Kategorie der Neuigkeiten (Auffälligkeit 2)?
2. Organisation: Gehört eine Ankündigung zu einer Organisation? Der Veranstaltungsdialog hat eine Kategorie (Dashboard.dc.html:119), der Ankündigungsdialog nicht (:120); K-06 verlangt Rechte je Organisation.
3. Status: Gilt K-05, der Bestand oder beides? Ab wann ist ein Ablaufdatum überschritten (Tagesende in Europe/Berlin)?
4. Rollen: Wer sieht den Bereich (K-06)? Die Navigation hat keinen Rollenfilter (Dashboard.dc.html:24).
5. Löschen: Braucht es eine Rückfrage und einen Papierkorb mit 30 Tagen (K-05)? Das Design hat beides nicht.
6. Standardpriorität sowie Farben für Mittel und Niedrig fehlen im Design.
7. Fehlertexte, Leerzustand sowie Lade- und Erfolgsrückmeldung fehlen; K-07 verlangt Fehlertext am Feld und Fokus auf die Rückmeldung.
8. Sollen Titel und Inhalt auch auf Türkisch und Englisch eingegeben werden? Das Design zeigt nur Deutsch.
9. Soll der Autor aus der Sitzung kommen statt „Current User“ (Dashboard.tsx:1596)?
10. Route: eigener Pfad /verwaltung/ankuendigungen oder Bereich im Dashboard?
11. Soll die Beispielzeile als „Beispielinhalt“ markiert werden (00 Laufbuch.dc.html:285)?

=== ENDE V04 · BEREIT ZUR RÜCKGABE ===
