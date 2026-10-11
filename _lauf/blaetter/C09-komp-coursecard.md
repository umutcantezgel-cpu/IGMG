# C09 · Komponentenblatt „CourseCard“

C09 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Komponentenblatt „CourseCard“ · Schwierigkeit 1

## SEITE
Komponente „CourseCard“, Kursangebots-Karte. Gemeinsamer Baustein laut D-03 (00 Laufbuch.dc.html:184), Plan-Zeile 02.5–02.11 (00 Laufbuch.dc.html:152). Quellen nur gelesen.

## ROUTE
Zielseite Korankurse, Seitenname QuranCourses (Plan 05.3, 00 Laufbuch.dc.html:167). Lokalisierter Pfad in den Quellen nicht festgelegt (offene Frage 1). Ziel der Voranmeldung: navigateTo('student-registration') im Bestand (QuranCourses.tsx:466), im Design StudentRegistration.dc.html (CourseCard.dc.html:38).

## QUELLEN
- Basisordner: /Users/umurey/Downloads/IGMG Wetzlar Website Design
- Design: CourseCard.dc.html, Template 15–33, Script 35–47, Helmet 11–13.
- Bestand: uploads/igmg-wetzlar-website/src/app/components/QuranCourses.tsx, Texte 31–301, Karte 368–485.
- Hilfen: readme.md (Zeilen 12, 19–22, 28); 00 Laufbuch.dc.html (Zeilen 152, 167, 184, 191, 193, 233, 301, 317).

## ZWECK
Eine Karte je Korankurs mit Status, Titel, Beschreibung, Zielgruppe, Zeiten, Hinweis, Kursinhalten und einer Aktion. Gestalt nach Design; Texte und Sprachfassungen nach Bestand (K-02: Bestandsübersetzungen gehen vor).

## ABSCHNITTE
Acht Bauabschnitte von oben nach unten (CourseCard.dc.html:15–31):
1. Bildfläche 150 px mit Streifen-Platzhalter (Zeile 16).
2. Statuspille mit Icon (Zeile 18).
3. Titel als h3 (Zeile 19).
4. Beschreibung als p (Zeile 20).
5. Details als dl: Zielgruppe mit Icon user, Zeiten mit Icon clock (Zeilen 21–23).
6. Hinweisbox mit Icon info (Zeilen 24–25).
7. Überschrift „Kursinhalte:“ und Liste aller Punkte (Zeile 26).
8. Aktion: Link oder deaktivierte Schaltfläche (Zeilen 27–31).

Icons (eigenes Komponentenblatt, hier nur genannt): circle-check oder circle-x 16 px (Zeile 18); user 20 px (22); clock 20 px (23); info 18 px (25); arrow-right 20 px (28); log-in 20 px (29); circle-x 20 px (30).

Texte des Designs, wörtlich:

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| Kursinhalte-Überschrift | Kursinhalte: | – (nur DE in Quelle) | – (nur DE in Quelle) | CourseCard.dc.html:26 |
| Zielgruppe (nur Screenreader) | Zielgruppe | – (nur DE in Quelle) | – (nur DE in Quelle) | CourseCard.dc.html:22 |
| Zeiten (nur Screenreader) | Zeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | CourseCard.dc.html:23 |
| Bildplatzhalter | Foto: {Titel} | – (nur DE in Quelle) | – (nur DE in Quelle) | CourseCard.dc.html:16, 41 |
| Vorschau-Platzhalter | [Kurs], [Beschreibung], [Zielgruppe], [Zeiten], [Hinweis], [Inhalt] | wie de (abgeleitet) | wie de (abgeleitet) | CourseCard.dc.html:38 |
| Standardstatus | Voranmeldung erforderlich | Ön kayıt gerekli | Pre-registration required | CourseCard.dc.html:38; QuranCourses.tsx:42/132/222 |
| Standardaktion | Zur Voranmeldung | Ön Kayıt'a Git | Go to Pre-Registration | CourseCard.dc.html:38; QuranCourses.tsx:114/204/294 |

Kurs-Beispielwerte aus dem Bestand (Titel und Zustandstexte wörtlich):

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| Titel Kinder | Korankurs für Kinder | Çocuklar için Kuran Kursu | Quran Course for Children | QuranCourses.tsx:38/128/218 |
| Titel Erwachsene | Korankurs für Erwachsene | Yetişkinler için Kuran Kursu | Quran Course for Adults | QuranCourses.tsx:54/144/234 |
| Titel Hafiz | Hafiz Vorbereitungskurs | Hafızlık Hazırlık Kursu | Hafiz Preparation Course | QuranCourses.tsx:70/160/250 |
| Status Erwachsene | Keine Anmeldung erforderlich | Kayıt gereksiz | No registration required | QuranCourses.tsx:58/148/238 |
| Status Hafiz | Geschlossen | Kapalı | Closed | QuranCourses.tsx:74/164/254 |
| Aktion Teilnahme | Einfach teilnehmen | Direkt katıl | Join Directly | QuranCourses.tsx:118/208/298 |
| Aktion gesperrt | Nicht verfügbar | Müsait değil | Not Available | QuranCourses.tsx:117/207/297 |

Weitere Kurstexte nur per Zeilennummer in QuranCourses.tsx (Reihenfolge Kinder/Erwachsene/Hafiz; Wortlaut dort übernehmen):

| Schlüssel | de (Zeilen) | tr (Zeilen) | en (Zeilen) |
|---|---|---|---|
| Beschreibung | 39/55/71 | 129/145/161 | 219/235/251 |
| Zielgruppe | 40/56/72 | 130/146/162 | 220/236/252 |
| Zeiten | 41/57/73 | 131/147/163 | 221/237/253 |
| Hinweis | 50/66/82 | 140/156/172 | 230/246/262 |
| Kursinhalte | 43–49/59–65/75–81 | 133–139/149–155/165–171 | 223–229/239–245/255–261 |

## DATEN
Vorschlag für eine Tabelle „kurs“ (abgeleitet aus data-props, Zeile 35):
- Titel, Beschreibung, Zielgruppe, Zeiten, Hinweis, Kursinhalte: Text, mehrsprachig ja (de Pflicht, tr/en optional mit Rückfall auf de, K-02); Hinweis optional; Kursinhalte als geordnete Liste.
- Status: Enum register/join/closed, nicht mehrsprachig.
- Ziel: Routenschlüssel, nicht mehrsprachig. Bild: Medienverweis, nicht mehrsprachig.
- Status-, Aktions- und Platzhaltertexte sind UI-Texte in messages/{de,tr,en}.json, keine Datenbankinhalte (K-02).

## FORMULARFELDER
– (entfällt, keine Eingabefelder auf der Karte)

## INTERAKTIONEN
- Aktion register oder join: Link auf href. Hover laut style-hover: register Fläche #065F46, join Fläche #EBF9F2 (Zeilen 28–29).
- Aktion closed: disabled-Schaltfläche, ohne Ziel und nicht fokussierbar (Zeile 30).
- Fokus global 2 px #0E3929 mit 2 px Abstand (Zeile 13).
- Die Karte selbst hat keine Interaktion. Im Bestand navigiert die Voranmeldung (QuranCourses.tsx:466).

## ZUSTAENDE
- Eigenschaft item (data-props, Zeile 35): title string; desc string; target string; schedule string; availability string; note string; features string[]; cta 'register'|'join'|'closed'; ctaLabel string; href optional. editor null. Vorschau $preview 400 × 760.
- Default ohne item (Zeile 38): title „[Kurs]“, desc „[Beschreibung]“, target „[Zielgruppe]“, schedule „[Zeiten]“, availability „Voranmeldung erforderlich“, note „[Hinweis]“, features „[Inhalt]“, cta register, ctaLabel „Zur Voranmeldung“, href StudentRegistration.dc.html.
- Abgeleitet (Zeilen 39–43, abgeleitet):
  - register: Status Hintergrund #EBF9F2, Schrift #065F46, Icon circle-check; Aktion Link, Fläche #047857, Schrift #FFFFFF.
  - join: Status wie register; Aktion Link, Fläche #FFFFFF, 2 px Rand #047857, Schrift #065F46.
  - closed: Status Hintergrund #FFEDEA, Schrift #AF2B25, Icon circle-x; Aktion disabled, gestrichelter Rand #8C857C, Fläche #F3F0E9.
  - Rand 1 px #DFDAD2 in allen Fällen (Zeile 43, beide Zweige gleich); href = item.href oder „#“ (Zeile 43).
  - Kontrast (abgeleitet): Textpaare 5,48:1 bis 17,32:1; Rand #8C857C 3,20:1; Fokus #0E3929 12,84:1.
- Zustände aus dem Bestand (QuranCourses.tsx:314–334, 386–479):
  - Kinder: verfügbar, Voranmeldung nötig, cta register.
  - Erwachsene: verfügbar, ohne Anmeldung, cta join.
  - Hafiz: nicht verfügbar, cta closed.
  - Hinweis leer: Bestand blendet aus (427); Design zeigt leere Box (25).
  - Mehr als drei Kursinhalte: Bestand zeigt drei plus „+N weitere Inhalte...“ (439–447); Design zeigt alle (26).
  - Sprache: Texte je Sprache aus Objekt t (QuranCourses.tsx:306); article ohne lang-Attribut (Zeile 15).
  - Leer, Fehler, Erfolg, Schritt, angemeldet: – (entfällt, keine Eingabe).

## BILDER
- Design: Platzhalter 150 px hoch, Streifen #F3F0E9/#FCFAF6, Schrift 15 px, Beschriftung „Foto: {Titel}“ mit role="img" (Zeilen 16, 41).
- Bestand: Unsplash-Fotos (QuranCourses.tsx:316/325/334), Verlaufs-Overlay (382–384), Kreis-Icon Users/User/Award (312/322/330; 403–409). Im Design nicht übernommen.
- Vorgabe: beschriftete Streifen, keine Verläufe (readme.md:22), keine Bilder aus dem Netz (00 Laufbuch.dc.html:191).
- Produktion: echte Fotos mit Bildrechten (00 Laufbuch.dc.html:233); Alt-Text laut Bestand = Kurstitel (QuranCourses.tsx:379).

## AUFFAELLIGKEITEN
1. Schrift: Bestand 12–14 px (QuranCourses.tsx:415–446), Design ab 16 px (Zeilen 15, 18, 25, 26); Design gilt (K-11). Die Platzhalterschrift mit 15 px (Zeile 16) liegt unter „nie unter 16 px“ (readme.md:19).
2. Kursinhalte: Bestand zeigt drei Punkte und „+2 weitere“ (439–447), Design alle (Zeile 26), so vorgesehen in 00 Laufbuch.dc.html:301.
3. Aktion Teilnahme: Bestand ohne Ziel und mit Icon DoorOpen (472–477); Design Link mit log-in (Zeile 29); Laufbuch nennt Kontakt › Anfahrt (00 Laufbuch.dc.html:301, 317).
4. Hover fehlt: Karte mit Schatten S2, grünem Rand und 150-ms-Übergang (readme.md:20, 24) ist am article nicht definiert (Zeile 15).
5. Geschlossen: Rand-Ternary liefert in beiden Zweigen denselben Wert (Zeile 43); Bestand dämpft mit opacity-90 und grauem Rand (QuranCourses.tsx:373–374); Statusrot #AF2B25 wird im readme nicht genannt.
6. Hinweis: Box ist ohne Bedingung gerendert (Zeile 25); Bestand blendet ohne Hinweis aus (427).
7. Zeitformat: Bestand „13:00-15:00 Uhr“ mit Bindestrich (QuranCourses.tsx:41); readme.md:12 und 00 Laufbuch.dc.html:193 verlangen „14:00–16:00 Uhr“ mit Gedankenstrich.
8. Nur Deutsch: „Kursinhalte:“, „Zielgruppe“, „Zeiten“ und „Foto:“ haben keine tr/en-Fassung (Zeilen 16, 22, 23, 26).

## OFFENE FRAGEN
1. Welcher lokalisierte Pfad gilt für die Seite Korankurse?
2. Zeigt „Einfach teilnehmen“ auf Contact#karte (Kontakt › Anfahrt) oder auf Contact (00 Laufbuch.dc.html:301, 317)?
3. Wird das Kurs-Kreisicon (QuranCourses.tsx:403–409) übernommen oder gestrichen?
4. Gilt für Zeitspannen der Bindestrich des Bestands oder der Gedankenstrich aus readme.md:12?
5. Wird eine leere Hinweisbox ausgeblendet oder bleibt sie leer stehen?
6. Wird die geschlossene Karte gedämpft (QuranCourses.tsx:374), und ist #AF2B25 ein freigegebener Farbwert?
7. Welche Werte gelten für Schatten S2 und den Hover-Rand? Die Token-Dateien wurden nicht gelesen.
8. Sollen die Kurstexte wörtlich in dieses Blatt, oder genügt der Zeilenverweis (Wortgrenze 1.400)?
9. Werden „Kursinhalte:“, „Zielgruppe“, „Zeiten“ und „Foto:“ als markierte neue Übersetzungen in MENSCHEN.md geführt (K-02)?
10. Ist ein Leerzustand für leere Kursinhalte nötig, und was gilt für href ohne Wert (Zeile 43)?
11. Icon.dc.html wurde nicht gelesen: offen sind aria-hidden für Icons und die Größen 16/18 px gegenüber readme.md:28 (20/24 px).

=== ENDE C09 · BEREIT ZUR RÜCKGABE ===
