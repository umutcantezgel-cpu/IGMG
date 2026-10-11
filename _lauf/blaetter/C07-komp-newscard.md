# C07 · Komponentenblatt NewsCard

## SEITE
Komponente NewsCard mit drei Varianten (default, featured, compact); kein Seitenblatt. Name laut readme.md Zeile 37.

## ROUTE
Laufbuch-Plan: Startseite (Laufbuch Zeile 153), Nachrichten (158), Nachrichtendetails mit „Ähnliche Artikel“ (159, 315). Zielroute „news-details“ mit Beitrags-ID (NewsSection.tsx 115). Design-`href` „NewsDetails.dc.html“ (Script 66) ist nur Prototyp-Pfad; Pfade je Sprache lokalisiert (K-02, abgeleitet).

## QUELLEN
Design: NewsCard.dc.html (Template Zeilen 15–51; Script 53–71). Bestand: NewsSection.tsx (Karten 83–161, Daten 10–51, Farben 53–61); News.tsx (Texte 29–152, Daten 158–243, Karte 340–424, Farben 264–274). Hilfen: readme.md (Zeilen 12, 19–24, 28, 37); 00 Laufbuch.dc.html (Zeilen 153–159, 193, 207–208, 233, 238, 267, 303, 313–315).

## ZWECK
Nachrichtenkarte für Startseite, Nachrichtenliste und Detailseite: großer Beitrag mit Aufruf (featured), Rasterkarte (default), kompakte Zeile (compact). Bausteine shadcn Card, Badge, Button (K-04, abgeleitet).

## ABSCHNITTE (Aufbau, Komponenten, Texte de/tr/en mit Fundstelle)
- featured (Zeilen 15–26; NewsSection.tsx 83–124): Bild 200–300 px (17), Pillen Kategorie und „Aktuell“ (19), Titel Serif 30 px (20), Datum mit Kalender-Icon, Lesezeit mit Uhr-Icon (21), Auszug (22), CTA 48 px (23).
- default (37–51; News.tsx 340–424): Bild 180 px (39), Kategorie, bei featured „Empfohlen“ mit Stern (41), Titel Serif 24 px (42), Auszug (43), Meta-Liste (44), CTA und Teilen-Button 48 px (45–47).
- compact (27–36; NewsSection.tsx 128–161): Fotofeld 88 × 88 px (29), Kategorie (31), Titel 20 px als Link (32), Datum ohne Icon, Lesezeit (33); ohne Auszug und CTA.
- Icons (dc-import Icon, eigenes Blatt): calendar, clock, star (16 px); arrow-right, share-2 (20 px); m.icon (16 px) (Zeilen 21, 23, 33, 41, 44, 47).

Texte (A2):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| foto_beitrag | Foto: Beitragsbild | – (nur DE in Quelle) | – (nur DE in Quelle) | Script 66 |
| foto_kurz | Foto | – (nur DE in Quelle) | – (nur DE in Quelle) | Zeile 29 |
| aktuell | Aktuell | – (nur DE in Quelle) | – (nur DE in Quelle) | Zeile 19; NewsSection.tsx 96 |
| empfohlen | Empfohlen | Önerilen | Recommended | Zeile 41; Laufbuch 208 |
| cta | Vollständigen Artikel lesen | – (nur DE in Quelle) | – (nur DE in Quelle) | Zeilen 23, 46; Script 67; NewsSection.tsx 118 |
| teilen | Teilen: [Titel] | Paylaş | Share | Script 61; News.tsx 57, 98, 139 |
| sr_trenn | : | : | : | Zeilen 23, 46 (nur Screenreader) |
| kat_nur_de | Wichtig · Ankündigung · Neuigkeiten · Jugend | – (nur DE in Quelle) | – (nur DE in Quelle) | Script 54; NewsSection.tsx 15, 25, 35; Plural: News.tsx 76, 117 |
| kat_gemeinde | Gemeinde | Cemaat | Community | Script 54; News.tsx 36, 77, 118 |
| kat_veranstaltung | Veranstaltung | Etkinlik | Event | Script 54; Laufbuch 207 |
| kat_bildung | Bildung | Eğitim | Education | Script 54; News.tsx 38, 79, 120 |
| kat_bestand | Religiös · Soziales | Dini · Sosyal | Religious · Social | News.tsx 39–40, 80–81, 121–122; nicht Script 54 |
| vorschau_titel | Neue Gebetszeiten für den Winter | – (nur DE in Quelle) | – (nur DE in Quelle) | Script 57; NewsSection.tsx 13 |
| vorschau_auszug | Ab dem 1. November gelten neue Gebetszeiten. Bitte beachten Sie die aktualisierten Zeiten für eine bessere Teilnahme. | – (nur DE in Quelle) | – (nur DE in Quelle) | Script 57; NewsSection.tsx 14 |
| vorschau_datum | So., 20. Juli 2025 | – (nur DE in Quelle) | – (nur DE in Quelle) | Script 57 |
| vorschau_zeit | 2 Min. | – (nur DE in Quelle) | – (nur DE in Quelle) | Script 57; NewsSection.tsx 17 |
| lesezeit | min Lesezeit | dk okuma süresi | min read | News.tsx 53, 94, 135 |
| weiterlesen | Weiterlesen | Devamını oku | Read more | News.tsx 56, 97, 138 |
| leer | Keine Nachrichten gefunden | Haber bulunamadı | No news found | News.tsx 67, 108, 149 (Liste) |

## DATEN
Vorschlag, abgeleitet aus Script 57 und News.tsx 158–243 (Datenbank, Typ offen):
- titel: Text, mehrsprachig ja (DE Pflicht, TR/EN mit DE-Rückfall, K-02).
- auszug: Text, mehrsprachig ja.
- kategorie: Schlüssel mit Bezeichnung, Bezeichnung mehrsprachig ja.
- datum: Datum (News.tsx 165), mehrsprachig nein.
- lesezeit: Zahl in Minuten (News.tsx 169), mehrsprachig nein; Einheit ja.
- empfohlen: Ja/Nein (News.tsx 167), mehrsprachig nein.
- bild: Medienverweis; Alternativtext mehrsprachig ja.
- slug: Text, mehrsprachig nein.
- Nicht auf der Karte: autor „[Name – Funktion]“ (News.tsx 164–234; mehrsprachig nur bei Gremien), aufrufe, kommentare: Zahlen (170–171).

## FORMULARFELDER
– (entfaellt, die Karte hat keine Eingabefelder)

## INTERAKTIONEN
- featured: Nur der CTA ist klickbar (Zeile 23); Hover Hintergrund #065F46 in 150 ms.
- default: Ganze Karte per Overlay-Link (Zeile 46); Teilen-Button darüber (z-index 1, Zeile 47), im Design ohne Aktion; Hover Schatten S2 und Randgrün (Zeile 38).
- compact: Titel-Link mit Overlay über die ganze Karte (Zeile 32); Hover Titel #065F46 mit Unterstreichung; Kartenhover Zeile 28.
- Tastatur: Fokus 2 px #0E3929, Abstand 2 px (Zeile 13).

## ZUSTAENDE
- variant: default | featured | compact; Default default (Script 53, 58).
- cta: Text; Default „Vollständigen Artikel lesen“ (Script 53, 67); bei compact ohne Wirkung.
- item (Editor null, Script 53): Pflicht title, excerpt, cat, date, readTime; optional href (Default „NewsDetails.dc.html“) und img (Default „Foto: Beitragsbild“, Script 66); Vorschau-Default Script 57.
- item.cat: CAT-Werte (Script 54); unbekannt fällt auf Gemeinde zurück (Script 60).
- item.tone: gruen, blau, ocker, petrol, rot, sand; übersteuert cat (Script 59–60).
- item.featured, item.share (Default false), item.meta (Default Kalender mit Datum, Uhr mit Lesezeit): nur bei default (Script 61).
- $preview 420 × 560 (Script 53).
- Bestand: Liste leer (News.tsx 66–69; Liste, nicht Karte); Sprache de, tr, en (News.tsx 30, 71, 112). Fehler, Erfolg, Schritt, angemeldet: entfällt.

## BILDER
- Design: nur beschriftete Streifenflächen, keine Fotos (Zeilen 17, 29, 39).
- aria-label aus item.img (Script 66); compact zeigt sichtbar „Foto“ (Zeile 29).
- Bestand: Fremdfotos (NewsSection.tsx 18–48; News.tsx 168–238), laut Laufbuch 34 nicht übernommen; echte Fotos mit Bildrechten fehlen (Laufbuch 233).
- Bestand-Alternativtext ist der Titel (NewsSection.tsx 88, 138; News.tsx 346).

## AUFFAELLIGKEITEN
1. Der Bestand hat keine Komponente NewsCard; drei Kartenformen sind inline gebaut (NewsSection.tsx 83–161; News.tsx 340–424).
2. Featured: Bestand mit Verlauf, grünem Ring und Titel auf dem Bild (NewsSection.tsx 84, 98–101); Design weiß, Titel darunter (Zeilen 16, 20). Design gilt für Gestalt; readme Zeile 22 verbietet Verläufe.
3. Design-Featured hat keinen Karten-Hover (Zeile 16), readme Zeile 20 verlangt ihn.
4. Gemeinde ist im Bestand lila (NewsSection.tsx 58, News.tsx 267), im Design sand (Script 54); Ankündigung blau (NewsSection.tsx 56) gegen rot (News.tsx 266).
5. Teilen-Button im Bestand ohne Namen und Aktion (News.tsx 415–420); Design „Teilen: [Titel]“ (Script 61).
6. Bestand navigiert ohne ID (News.tsx 410), mit ID (NewsSection.tsx 115); Design-href ist ein Dateiname (Script 66).
7. Bestand setzt Kategorie und Datum auf 12 px (NewsSection.tsx 144, 151); readme Zeile 19 nennt 16 px als Untergrenze.
8. Titel und Auszug (Script 57) sind laut Laufbuch 238 Beispielinhalte, mit einer Aussage zu Gebetszeiten (G-05): nicht ungeprüft veröffentlichen.
9. Datumsmuster widersprechen sich: readme Zeile 12 „Sa., 2. Aug.“, Laufbuch 193 „Mo., 28. Juli 2025“, Design „So., 20. Juli 2025“ (Script 57).
10. Props tone, featured, share, meta fehlen im tsType von item (Script 53), werden aber genutzt (Script 59–61).
11. Design lädt Google Fonts (Zeilen 11–12); K-04 verlangt Selbsthosting über next/font.
12. Bestand zeigt Autor, Aufrufe und Kommentare (News.tsx 383–397), das Design nicht.

## OFFENE FRAGEN
1. Wer liefert die fehlenden TR/EN-Fassungen der nur deutschen Texte (MENSCHEN.md)?
2. Gilt „Vollständigen Artikel lesen“ oder „Weiterlesen“ (News.tsx 56)?
3. Erhalten Religiös und Soziales eigene Farben oder fallen sie auf Gemeinde zurück?
4. Zeigt die Karte Autor, Aufrufe und Kommentare (Auffälligkeit 12)?
5. Was macht der Teilen-Button: Web Share, Link kopieren oder nichts?
6. Welcher sichtbare Hinweis gilt bei fehlender TR/EN-Fassung (K-02)? Keiner ist vorhanden.
7. Entfallen die 150-ms-Übergänge bei „Bewegung reduzieren“ (readme Zeile 24)?
8. „Önerilen“/„Recommended“ stammen aus Laufbuch 208; LanguageContext.tsx wurde nicht gelesen, gegenprüfen.
9. Welches Datumsmuster gilt (Auffälligkeit 9)?
10. Welches Kategorie-Schema gilt: Bezeichnungen (NewsSection.tsx 15) oder Schlüssel (News.tsx 166)?
11. Liefert die Datenbank einen Alternativtext je Bild?

=== ENDE C07 · BEREIT ZUR RÜCKGABE ===
