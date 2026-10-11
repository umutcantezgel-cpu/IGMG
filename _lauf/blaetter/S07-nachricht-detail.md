# S07 · Nachrichtendetails

S07 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Nachrichtendetails“ · Schwierigkeit 1

## SEITE

Nachrichtendetails, Artboard 03.6 (NewsDetails.dc.html:15). Plan-Eintrag LB:159. Bestand: NewsDetails.tsx.

## ROUTE

/nachrichten/[slug] (K-03). Deutsch ohne Präfix, tr und en mit Präfix; die Pfadsegmente stehen in den Quellen nicht (offen). hreflang und x-default fehlen im Design. Design-Links zeigen auf Prototyp-Dateien, der Bestand navigiert über Routen-Namen mit ID (NewsDetails.tsx:96, 268).

## QUELLEN

Ohne Dateinamen gilt NewsDetails.dc.html, LB steht für 00 Laufbuch.dc.html.

- Design (nur lesen): Template Zeilen 9–78, Script Zeilen 79–105.
- Bestand (nur lesen): uploads/igmg-wetzlar-website/src/app/components/NewsDetails.tsx (299 Zeilen).
- Hilfen (nur lesen): readme.md, LB.
- Zusatz (nur Suche): LanguageContext.tsx für Neuigkeiten und Veranstaltungs-Kategorien (readme.md:7).
- Keine Adressen, Telefonnummern, E-Mail-Adressen oder religiösen Texte auf dieser Seite (A5, A6).

## ZWECK

Detailseite eines Gemeindeberichts: lesen, teilen, speichern, Autor und Schlagwörter sehen, Ähnliche Artikel öffnen, Newsletter abonnieren. Das Zitat in Absatz 3 ist Fließtext, kein eigener Zitatblock (:88).

## ABSCHNITTE (Aufbau, Komponenten, Texte de/tr/en mit Fundstelle)

### Aufbau

Wurzel lang="de", Hintergrund #FCFAF6, 18 px, Zeilenhöhe 1,6 (:15). Kopf: Header, PrayerTimesBar, Breadcrumbs (:16–18), Rückweg-Link (:21). Zwei Spalten (:22): Artikel mit Kopf, Hero, sieben Absätzen, Schlagwörtern, Reaktionen; Seitenleiste mit Autorkarte, Ähnlichen Artikeln, Newsletter (#0E3929). Footer (:76).

### Komponenten

- Header (active="moschee", current="news", :16), PrayerTimesBar (:17), Footer (:76): eigene Blätter.
- Breadcrumbs (:18), eigenes Blatt: parent-label="Neuigkeiten", parent-href="News.dc.html", label="Nachrichtendetails".
- Icon, eigenes Blatt: arrow-left, calendar, clock, eye, share-2, bookmark, heart, message-square, external-link, user, mail.
- Buttons und Karten: Inline-Stile (LB:152). NewsCard nicht verwendet.

### Texte de/tr/en

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| nd.kopf | Gemeinde · Sa., 20. Jan. 2024, 14:30 Uhr · 5 Min. Lesezeit · 847 Aufrufe | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:26–29 |
| nd.titel | Erfolgreiche Ramadan-Veranstaltung in der IGMG Wetzlar | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:31 |
| nd.untertitel | Über 300 Teilnehmer feierten gemeinsam das Fastenbrechen | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:32 |
| nd.autor | [Initialen Autor] (abgeleitet) · [Name – Pressereferent] · Pressereferent IGMG Wetzlar | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:34 |
| nd.aktionen | Teilen · Speichern | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:35 |
| nd.bild | Foto: Ramadan-Veranstaltung | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:38 |
| nd.absatz-1 | Die IGMG Gemeinde Wetzlar blickt auf eine äußerst erfolgreiche Ramadan-Veranstaltung zurück, die am vergangenen Wochenende stattgefunden hat. Über 300 Gläubige verschiedener Altersgruppen kamen zusammen, um gemeinsam das Fastenbrechen zu begehen und die besonderen Momente des heiligen Monats zu teilen. | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:86 |
| nd.absatz-2 | Die Veranstaltung begann um 18:30 Uhr mit der Rezitation aus dem Heiligen Quran durch Hafiz [Name – Rezitator], gefolgt von einer inspirierenden Ansprache von Imam [Name – Imam] über die spirituelle Bedeutung des Ramadan und dessen Auswirkungen auf das Gemeinschaftsleben. | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:87 |
| nd.absatz-3 | „Es war bewegend zu sehen, wie Menschen unterschiedlicher Herkunft und verschiedener Generationen zusammenkamen, um diesen besonderen Moment zu teilen“, so Gemeindeleiter [Name – Gemeindeleiter]. „Solche Veranstaltungen stärken nicht nur unseren Glauben, sondern auch den Zusammenhalt in unserer Gemeinde.“ | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:88 |
| nd.absatz-4 | Besonders bemerkenswert war die Beteiligung der Jugendorganisation (GT), die ein spezielles Programm für Kinder und Jugendliche organisiert hatte. Durch interaktive Lernspiele und kreative Aktivitäten lernten die jüngsten Gemeindemitglieder mehr über die Bedeutung und Traditionen des Ramadan. | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:89 |
| nd.absatz-5 | Die Frauen der Gemeinde (KT) hatten ein vielfältiges Buffet mit traditionellen Speisen aus verschiedenen Kulturen vorbereitet, das die kulturelle Vielfalt der Gemeinde widerspiegelte. Von türkischen Köstlichkeiten über arabische Spezialitäten bis hin zu deutschen Gerichten war für jeden Geschmack etwas dabei. | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:90 |
| nd.absatz-6 | Die Veranstaltung endete mit einem gemeinsamen Gebet und dem Austausch von Segenswünschen für den weiteren Verlauf des Ramadan. Viele Teilnehmer äußerten bereits den Wunsch nach ähnlichen Veranstaltungen und lobten die hervorragende Organisation. | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:91 |
| nd.absatz-7 | Die nächste große Gemeindeveranstaltung ist bereits in Planung: Das Eid-Fest am Ende des Ramadan soll noch größer gefeiert werden, mit einem erweiterten Programm für alle Altersgruppen und einer besonderen Zeremonie für die Neukonvertiten der Gemeinde. | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:92 |
| nd.schlagwoerter | Schlagwörter · #Ramadan · #Gemeinschaft · #Veranstaltung · #Familie · #Tradition | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:43, 94 |
| nd.reaktionen | 23 Gefällt mir · 7 Kommentare · Vollständigen Artikel teilen | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:47–49 |
| nd.autorbox | Über den Autor · Profil ansehen | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:54, 57 |
| nd.autorbox-text | Verantwortlich für Öffentlichkeitsarbeit und Kommunikation der IGMG Wetzlar. Seit 2018 aktiv in der Gemeinde tätig. | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:56 |
| nd.aehnlich | Ähnliche Artikel | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:60 |
| nd.kat-jugend | Jugend | Gençlik | Youth | NewsDetails.dc.html:96; LanguageContext.tsx:109, 367, 625 (abgeleitet) |
| nd.kat-dialog | Dialog · Soziales | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:97–98 |
| nd.aehnlich-1 | Do., 18. Jan. 2024 · Jugendprogramm der IGMG startet neue Initiative | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:96 |
| nd.aehnlich-2 | Mo., 15. Jan. 2024 · Interreligiöser Dialog in Wetzlar | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:97 |
| nd.aehnlich-3 | Fr., 12. Jan. 2024 · Spendenaktion für Erdbebenopfer erfolgreich | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:98 |
| nd.newsletter | Newsletter · Bleiben Sie über unsere Neuigkeiten informiert · Newsletter abonnieren | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:68–70 |
| nd.zurueck | Zurück zur Startseite | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:21 |
| nd.brot-eltern | Neuigkeiten | Haberler | News | NewsDetails.dc.html:18; LanguageContext.tsx:285, 372, 543, 630 |
| nd.brot-aktuell | Nachrichtendetails | – (nur DE in Quelle) | – (nur DE in Quelle) | NewsDetails.dc.html:18 |

Hinweise: Absätze 1–7 wortgleich mit NewsDetails.tsx:33–45 (geprüft; nur die Anführungszeichen unterscheiden sich). Namen nach A5 ersetzt: Rezitator und Imam (:87), Gemeindeleiter (:88), Pressereferent (:34, :55). Schlagwort „Veranstaltung“: tr Etkinlik, en Event (abgeleitet, LanguageContext.tsx:366, 624). Teilbegriff „Startseite“: tr Ana Sayfa (LanguageContext.tsx:273), en Home (:531).

## DATEN (was aus der Datenbank kommt)

Vorschlag (A7), Feld, Typ, mehrsprachig:

- slug, Text, nein (Route).
- titel, untertitel, Text, ja (Deutsch Pflicht, sonst Rückfall auf Deutsch).
- kategorie, Auswahl (Gemeinde, Jugend, Dialog, Soziales), ja.
- veroeffentlicht, Datum und Uhrzeit, nein.
- lesezeit, aufrufe, kommentare, likes, Zahlen, nein; Quelle offen.
- autor, Verweis auf Person: Funktion ja, Name nein.
- bild, Verweis mit Alternativtext, ja.
- absaetze, Absatzliste, ja; schlagwoerter, Textliste, ja.
- aehnliche, Verweisliste (drei Einträge), nein.

## FORMULARFELDER

– (entfaellt, keine Eingabefelder; der Newsletter-Button hat kein Feld, :70)

## INTERAKTIONEN

- Zurück zur Startseite: Link auf Home.dc.html (:21); Bestand navigateTo('home') (NewsDetails.tsx:96).
- Breadcrumb Neuigkeiten: Link auf News.dc.html (:18).
- Speichern, Gefällt mir: Schalter mit aria-pressed, Zustand nur lokal (:35, :47, :81); Bestand ohne Handler (NewsDetails.tsx:167, 211).
- Link ohne Ziel: Teilen (:35), 7 Kommentare (:48), Vollständigen Artikel teilen (:49), Profil ansehen (:57), Newsletter abonnieren (:70).
- Ähnliche Artikel: Link auf NewsDetails.dc.html (:63); Bestand: div mit onClick, nicht per Tastatur erreichbar (NewsDetails.tsx:264–268).
- Fokus: 2 px #0E3929, 2 px Abstand (:13).

## ZUSTAENDE

- Eigenschaften aus data-props: – (entfaellt, kein data-props am Script-Tag, :79).
- saved: false (Standard) oder true (Hintergrund #EBF9F2) (:81, :100).
- liked: false (Standard, Zähler 23) oder true (Zähler 24, Hintergrund #EBF9F2) (:81, :101).
- leer, Fehler, nicht gefunden, Ladezustand: – (nicht definiert). Bestand zeigt unabhängig von der ID immer denselben Mock-Artikel (NewsDetails.tsx:27–29).
- Erfolg, Schritt, angemeldet: – (nicht definiert bzw. entfaellt).
- Sprache: de (:15). tr und en fehlen; Bestand ruft useLanguage() ohne Nutzung auf (NewsDetails.tsx:24).

## BILDER

- Hero: Platzhalter, role="img", aria-label „Foto: Ramadan-Veranstaltung“, Höhe clamp(220px,30cqi,400px), Rahmen #DFDAD2 (:38). Bestand: externes Bild (NewsDetails.tsx:57), laut LB:34 nicht verwendet.
- Autor: Initialenkreis 48 px (:34) und 56 px (:55). Bestand: /avatars/author.png (NewsDetails.tsx:152).
- Echte Fotos mit Bildrechten fehlen (LB:233).

## AUFFAELLIGKEITEN

1. Beispielinhalte: Namen und Zitate (LB:238, LB:248; MENSCHEN.md M-030). „Seit 2018 aktiv“ (:56) ohne Beleg, steht auch im Bestand (NewsDetails.tsx:249) (G-05).
2. Datum: Design „Sa., 20. Jan. 2024, 14:30 Uhr“ (:27); Bestand roh „2024-01-20“ (NewsDetails.tsx:127); D-10 nennt „Mo., 28. Juli 2025“ (LB:193).
3. Feste Werte im Design: Aufrufe, Kommentare, Likes (:29, :48, :101); Bestand aus Daten (NewsDetails.tsx:52–54).
4. Icons: bookmark statt Tag (:43; NewsDetails.tsx:191), heart statt ThumbsUp (:47; NewsDetails.tsx:212).
5. Stil: Hex-Farben (:26, :96–98) statt Tailwind (NewsDetails.tsx:82–85); Source Serif 4 (:31) statt font-bold (NewsDetails.tsx:141). Das Design gilt.
6. Ähnliche Artikel: Design-Ziel NewsDetails.dc.html (:63), Bestand numerische ID (NewsDetails.tsx:268). NewsCard laut LB:159 vorgesehen, nicht verwendet.
7. Hero: Bestand extern (NewsDetails.tsx:57), Design Platzhalter (:38). readme.md:22 verbietet Muster hinter Text; das Streifenmuster liegt hinter der Beschriftung.
8. Bestand ohne Header, PrayerTimesBar, Breadcrumbs, Footer; Layout-Einbindung ungeprüft.

## OFFENE FRAGEN

1. Wie lauten die Slugs für Artikel und Ähnliche Artikel, da der Bestand numerische IDs nutzt?
2. Ist der Artikeltext eine Absatzliste, HTML (NewsDetails.tsx:182) oder Rich Text?
3. Welche Ansicht zeigt ein unbekannter Slug (Leer- oder 404-Zustand)?
4. Speichern und Gefällt mir: nur lokal oder dauerhaft pro Nutzer?
5. Herkunft der Aufrufe und Kommentarzahl; ist eine Kommentarfunktion gewünscht?
6. Was tut Teilen: Link kopieren, Web-Share oder ein Ziel?
7. Newsletter: Eingabefeld, Einwilligungstext und Anbieter fehlen (G-08, LB:284).
8. Ziel für Profil ansehen: K-03 enthält keine Autorenseite.
9. Gültiges Datumsformat: D-10, readme.md:12 oder Design?
10. Bestätigt die Gemeinde Aussagen und Namen (G-05)?
11. Autorenbild: Initialen oder Bild (NewsDetails.tsx:152)?
12. Auswahlregel für Ähnliche Artikel?
13. Welche Texte bekommen tr- und en-Fassungen?
14. Für MENSCHEN.md vorzumerken (Orchestrator): [Name – Pressereferent], [Name – Rezitator], [Name – Imam], [Name – Gemeindeleiter], [Initialen Autor], [Foto: Ramadan-Veranstaltung].

=== ENDE S07 · BEREIT ZUR RÜCKGABE ===
