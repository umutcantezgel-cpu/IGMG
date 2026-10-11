# Seitenblatt V11 · Verwaltung: Medien

V11 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Kein Artboard: ABGELEITET. Angaben ohne Fundstelle sind als „abgeleitet“ markiert und keine Designvorgabe.

## SEITE
Verwaltung: Medien (Verwaltungsmodul im angemeldeten Bereich). Es gibt kein Artboard. Aufbau und Komponenten folgen dem Muster Dashboard.dc.html.

## ROUTE
/verwaltung/medien (Vorgabe des Auftrags). Breadcrumb-Pfad und Header-Kennung „current“ sind abgeleitet (siehe OFFENE FRAGEN).

## QUELLEN
- Muster: Dashboard.dc.html (Template Zeilen 15–86, Props Zeile 110, Script Zeilen 111–160).
- Design: readme.md (Zeilen 21–22, 25); 01 Grundlagen.dc.html (Zeilen 79, 124, 133, 145, 149–150, 170, 176, 182).
- Hilfen: 00 Laufbuch.dc.html (Zeilen 34, 146–179, 185, 222, 233, 257, 299).
- Bestand, nur gelesen: figma/ImageWithFallback.tsx, EnhancedImageWithFallback.tsx.
- Kernauszug K-05, K-06, K-07, K-10, G-04, G-05, G-07 (Auftragstext).

## ZWECK
Berechtigte Rollen legen Bilder an, pflegen Alt-Text und Verwendung und entfernen sie. Hochgeladen wird nur in der Verwaltung (K-10). Rollen werden serverseitig geprüft (K-06). Organisationsredaktion sieht nur eigene Medien (abgeleitet aus K-06).

## ABSCHNITTE
1. Gemeinsame Teile (Dashboard.dc.html:16–18, 86): Header im angemeldeten Zustand mit current="dashboard" (für Medien offen), PrayerTimesBar, Breadcrumbs label="Dashboard", Footer. Nur benannt, eigene Blätter.
2. Seitenleiste (Dashboard.dc.html:20–27): Titel „Admin Dashboard“, Schalter „Menü öffnen“ unter 900 px, Navigation. Der Medien-Punkt fehlt (Zeile 111); abgeleitet: ergänzen.
3. Kopf des Inhalts (abgeleitet nach Dashboard.dc.html:45): Überschrift und Schaltfläche „Neue Datei hochladen“ mit Plus-Icon.
4. Medientabelle (abgeleitet nach Dashboard.dc.html:46–55): Spalten Vorschau, Alt-Text, Dateiname, Typ, Größe, Verwendung, Status, Aktionen.
5. Dialog Medium (abgeleitet nach Dashboard.dc.html:88–107): Rahmen, Schließen, Felder, Abbrechen, Hauptschaltfläche.

### TEXTE (A2, Fundstelle je Zeile)
| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| nav.titel | Admin Dashboard | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 |
| nav.bereiche | Dashboard-Bereiche | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:23 (aria-label) |
| nav.menue | Menü öffnen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 |
| nav.verband | IGMG Wetzlar Verwaltung | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 |
| crumb.start | Dashboard | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:18 |
| kopf.titel | Medien verwalten | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet nach Dashboard.dc.html:143 |
| kopf.neu | Neue Datei hochladen | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet nach Dashboard.dc.html:143 |
| zeile.bearbeiten | Bearbeiten: {Titel} | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:143 |
| zeile.loeschen | Löschen: {Titel} | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:143 |
| status.entwurf | Entwurf | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:112, 118 |
| status.veroeff | Veröffentlicht | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:112, 118 |
| dlg.schliessen | Schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:93 (aria-label) |
| dlg.abbrechen | Abbrechen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:104 |
| dlg.senden | Hochladen | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet nach Dashboard.dc.html:118–120 („Erstellen“) |
| feld.titel | Titel | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:118 |
| feld.kategorie | Kategorie | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:119 |
| feld.status | Status | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:118 |
| feld.alttext | Alt-Text | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet aus K-10 (Auftrag) |
| pflicht.marke | (Pflichtfeld) | – (nur DE in Quelle) | – (nur DE in Quelle) | 00 Laufbuch.dc.html:299 |
| pflicht.hinweis | Bitte füllen Sie die markierten Pflichtfelder aus. | – (nur DE in Quelle) | – (nur DE in Quelle) | 00 Laufbuch.dc.html:299 |
| platz.foto | Foto: … | – (nur DE in Quelle) | – (nur DE in Quelle) | 01 Grundlagen.dc.html:149 |
| kat.optionen | Allgemein · Ana Teşkilatı · Kadın Teşkilatı · Gençlik Teşkilatı · Kadın Gençlik Teşkilatı | identisch (Eigenname) | identisch (Eigenname) | Dashboard.dc.html:115 |
| bestand.fehler | – (nur EN in Quelle) | – (nur EN in Quelle) | Error loading image | ImageWithFallback.tsx:21 |
| bestand.platz | Moschee & Gemeindezentrum | – (nur DE in Quelle) | – (nur DE in Quelle) | EnhancedImageWithFallback.tsx:71 (nicht übernehmen) |

Texte erfasst: 24 Zeilen.

## DATEN
Vorschlag, nicht festgelegt.
- id (Text, intern, mehrsprachig nein).
- Dateiname (Text, mehrsprachig nein).
- MIME-Typ und Größe in Byte (Typ und Größe prüfen, K-10; mehrsprachig nein).
- Breite und Höhe in Pixel (Ganzzahl, mehrsprachig nein).
- Speicherschlüssel (Text, Adapter: lokales Verzeichnis oder S3-kompatibel, K-10; mehrsprachig nein).
- Alt-Text (Text, Pflicht, mehrsprachig ja).
- Titel (Text, mehrsprachig ja).
- Kategorie (Auswahl aus den fünf Optionen, Dashboard.dc.html:115; mehrsprachig nein).
- Status (Entwurf, Veröffentlicht, Papierkorb; mehrsprachig nein; K-05).
- Papierkorb-Datum (Zeitstempel UTC, Löschfrist 30 Tage; K-05; mehrsprachig nein).
- Hochgeladen von und am (Verweis auf das Konto, Zeitstempel UTC, Anzeige Europe/Berlin; Audit-Log nach G-07; mehrsprachig nein).
- Verwendung (Verweise auf Neuigkeiten, Veranstaltungen und Seiteninhalte; abgeleitet; mehrsprachig nein).
- Bildrechte-Vermerk (Text; echte Fotos mit Bildrechten nötig, 00 Laufbuch.dc.html:233; mehrsprachig nein).

## FORMULARFELDER
Abgeleitet nach dem Feldmuster Dashboard.dc.html:116.
- Datei: Dateiauswahl, Pflicht, Typ und Größe offen (K-10). Abgeleitet.
- Alt-Text: Textfeld, Pflicht, Fehlertext am Feld und Fokus auf die Rückmeldung (K-07). Abgeleitet.
- Titel: Textfeld (Dashboard.dc.html:118).
- Kategorie: Auswahl mit den fünf Optionen (Dashboard.dc.html:119, 115).
- Status: Auswahl Entwurf oder Veröffentlicht (Dashboard.dc.html:118).
- Höhe 48 px, Rand #8C857C (readme.md:21; 01 Grundlagen.dc.html:170).

## INTERAKTIONEN
- Zeile „Bearbeiten: {Titel}“ öffnet den Dialog mit den Werten der Zeile (Dashboard.dc.html:52, Icon pencil 18 px).
- Zeile „Löschen: {Titel}“ mit Icon trash-2 in Fehlerfarbe (Dashboard.dc.html:52). Verhalten: Papierkorb nach K-05, Bestätigung offen.
- „Neue Datei hochladen“ öffnet den leeren Dialog (abgeleitet nach Dashboard.dc.html:45).
- Schließen über Schließen-Schaltfläche, Abbrechen, Klick auf den Hintergrund und Escape (Dashboard.dc.html:90, 93, 104, 132).
- Unter 900 px klappt „Menü öffnen“ die Navigation auf (Dashboard.dc.html:21, 137).
- Übergänge 150 ms, bei „Bewegung reduzieren“ keine (01 Grundlagen.dc.html:150).

## ZUSTAENDE
- Prop section (Dashboard.dc.html:110): dashboard, news, events, announcements, messages, tickets; Default dashboard. Ein Wert für Medien fehlt (offen).
- Prop dialog (Dashboard.dc.html:110): none, neuigkeit, veranstaltung, ankuendigung, ticket; Default none. Ein Wert für Medien fehlt (offen).
- Zustand narrow (unter 900 px) und navOpen (Dashboard.dc.html:137, 150).
- Leer (abgeleitet nach Dashboard.dc.html:66): kein Medium vorhanden; Texte offen.
- Fehler am Feld (abgeleitet; Fehlerfarbe mit Icon und Klartext, 01 Grundlagen.dc.html:176).
- Erfolg (abgeleitet; Häkchen-Icon auf Grün-Tönung, 01 Grundlagen.dc.html:182).
- Bestand: didError (ImageWithFallback.tsx:7, 15); Index und hasError (EnhancedImageWithFallback.tsx:27–28, 41).

## BILDER
- Vorschau je Medium: beschriftete Streifenfläche mit „Foto: …“ (01 Grundlagen.dc.html:149–150; readme.md:22; 00 Laufbuch.dc.html:257). Keine Verläufe, keine Muster hinter Text.
- Alt-Text ist Pflicht (K-10). Zulässige Dateitypen und Größen sind nicht festgelegt (offen).
- Auslieferung über next/image (K-10).
- Seitenverhältnis der Vorschau ist nicht im Design festgelegt (offen).

## AUFFAELLIGKEITEN
1. EnhancedImageWithFallback.tsx:4–7 lädt Fallback-Fotos von images.unsplash.com. 00 Laufbuch.dc.html:34 sagt „Unsplash-Bilder nicht verwendet“, G-07 verbietet Anfragen an Dritte.
2. ImageWithFallback.tsx:25 und EnhancedImageWithFallback.tsx:82 nutzen plain img statt next/image (K-10). alt ist optional (EnhancedImageWithFallback.tsx:13; ImageWithFallback.tsx:6), Alt-Text-Pflicht ist nicht erzwungen.
3. Menü-Schwelle widersprüchlich: readme.md:25 „unter 1200 px“, 01 Grundlagen.dc.html:133 und 00 Laufbuch.dc.html:185 „unter 1240 px“, Dashboard.dc.html:137 „w < 900“.
4. Bedienelemente: Icon-Schaltflächen 44 px (Dashboard.dc.html:52, 62) gegen mindestens 48 px (readme.md:21).
5. Schrift 14 px (Dashboard.dc.html:63, 67, 79) gegen „nie unter 16 px“ (01 Grundlagen.dc.html:79).
6. Medien fehlt in der Navigation (Dashboard.dc.html:111) und im Plan (00 Laufbuch.dc.html:146–179).
7. EnhancedImageWithFallback.tsx:50 nutzt bg-gradient-to-br und Emerald-Klassen (Zeilen 50, 54, 70, 71). Das widerspricht „keine Verläufe“ (01 Grundlagen.dc.html:145) und den Tokens.
8. Das Muster enthält Personennamen als Beispieldaten (Dashboard.dc.html:79, 112, 114). Sie sind hier als [Name – Funktion] zu behandeln und nicht übernommen.

## OFFENE FRAGEN
1. Soll „Medien“ als Navigationspunkt erscheinen, und welches Icon gilt (Icon.dc.html ist nicht geprüft)?
2. Welche Dateitypen und Maximalgrößen gelten (K-10 nennt nur die Prüfung)?
3. Welche Rollen dürfen hochladen, ändern und löschen (K-06)?
4. Gilt ein Foto mit erkennbaren Personen als Personendatum mit Audit-Log (G-07)?
5. Gilt der Papierkorb von 30 Tagen (K-05) auch für Medien, und wie wird Löschen bestätigt?
6. Welches Seitenverhältnis gilt für die Vorschau?
7. Welcher Wert gilt für Header current und den Breadcrumb-Pfad?
8. Wer übersetzt die abgeleiteten Texte (tr und en fehlen)?
9. Werden die externen Fallbacks der Bestandskomponenten gestrichen?

=== ENDE V11 · BEREIT ZUR RÜCKGABE ===
