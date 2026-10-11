# S04 · Veranstaltungen (Liste)

Kennung S04 · Kundschafter · Haiku 5.5 · Phase P0 · Kern-Version 1.0

## SEITE
Veranstaltungen (Liste), Artboard 03.3 (Laufbuch.dc.html:156). Design Events.dc.html, Code-Ziel Events.tsx. lang="de" (Events.dc.html:15). Header active "moschee", current "events" (Events.dc.html:16).

## ROUTE
/veranstaltungen (K-03, Deutsch ohne Präfix); /tr und /en mit Präfix (K-02). Lokalisierte Pfade: – (nicht in Quelle). Karten führen zu /veranstaltungen/[slug] (K-03) bzw. EventDetails (Laufbuch.dc.html:313).

## QUELLEN
- Design: Events.dc.html, 73 Zeilen (Template 9–49, Script 50–71).
- Bestand: Events.tsx (Texte 28–155, Termine 160–245, Darstellung 279–464); EventsSection.tsx (Termine 18–91, Logos 9–12); LanguageContext.tsx (events 101–111, 359–369, 617–627; organizations 118–124, 376–382, 634–640; mosque 21–30, 279–288, 537–546).
- Hilfen: readme.md (8, 12, 22, 24, 28); 00 Laufbuch.dc.html (34, 156, 230, 231, 233, 238, 267, 268, 313).

## ZWECK
Besucher sehen Veranstaltungen als Karten, filtern nach Kategorie und öffnen Details. Ohne Treffer erscheint ein Leerzustand mit Rücksetzknopf (Events.dc.html:37–44).

## ABSCHNITTE
Aufbau von oben nach unten:
1. Header, sticky (Events.dc.html:16); PrayerTimesBar, 124 px (:17); Breadcrumbs „Veranstaltungen“ (:18).
2. main (:19): PageHeader mit Eyebrow, Titel, Untertitel, 240 px (:20); Inhalt max. 1344 px, Abstand 32 px (:21).
3. Filterzeile (:22): sieben Kategorie-Schalter (:23–25); „Kommende Events“ mit Icon funnel 20 px (:28).
4. Terminliste bei Treffern: Raster minmax(min(100%,340px),1fr), Abstand 24 px, sechs EventCard variant „list“ (:30–36).
5. Leerzustand ohne Treffer (:37–44).
6. Footer, 520 px (:47).

Schalter (:25, :67): mind. 48 px, Pille, 18 px fett; aktiv #047857 mit Schrift #FFFFFF und Rand 2 px; inaktiv #FFFFFF mit Schrift #1D1A17 und Rand 1 px #8C857C. Leerzustand (:38–42): gestrichelter Rand #8C857C, Kreis #F3F0E9, Überschrift 30 px Source Serif 4.

Texte (Schlüssel-Vorschläge mit Präfix events.list., außer bestehende Schlüssel wie header.mosque.title und events.recommended):

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| header.mosque.title | Moschee | Cami | Mosque | Events.dc.html:20; abgeleitet LanguageContext.tsx:22, 280, 538 |
| title | Veranstaltungen | Etkinlikler | Events | Events.dc.html:20; Events.tsx:30, 72, 114 |
| subtitle | Aktuelle Veranstaltungen und Events der IGMG Wetzlar Moschee | IGMG Wetzlar Camii'nin güncel etkinlikleri ve organizasyonları | Current events and activities at IGMG Wetzlar Mosque | Events.dc.html:20; Events.tsx:31, 73, 115 |
| crumb | Veranstaltungen | Etkinlikler | Events | Events.dc.html:18; abgeleitet LanguageContext.tsx:26, 284, 542 |
| group | Kategorie | Kategori | Category | Events.dc.html:23; Events.tsx:43, 85, 127 |
| cat.all bis cat.women | Alle; Gebete; Bildung; Gemeinde; Kultur; Jugend; Frauen | Tümü; Namaz; Eğitim; Cemaat; Kültür; Gençlik; Kadın | All; Prayers; Education; Community; Cultural; Youth; Women | Events.dc.html:51; Events.tsx:33–39, 75–81, 117–123 |
| upcoming | Kommende Events | Yaklaşan etkinlikler | Upcoming events | Events.dc.html:28; Events.tsx:44, 86, 128 |
| empty.title | Keine Veranstaltungen gefunden | Etkinlik bulunamadı | No events found | Events.dc.html:40; Events.tsx:67, 109, 151 |
| empty.text | Versuchen Sie es mit anderen Suchkriterien oder schauen Sie später wieder vorbei. | Farklı arama kriterlerini deneyin veya daha sonra tekrar bakın. | Try different search criteria or check back later. | Events.dc.html:41; Events.tsx:68, 110, 152 |
| empty.reset | Alle | Tümü | All | Events.dc.html:42; abgeleitet aus cat.all |
| event.1.title | Freitagsgebet mit Khutba | Cuma Namazı ve Hutbe | Friday Prayer with Khutbah | Events.dc.html:54; Events.tsx:163 |
| event.1.desc | Wöchentliches Freitagsgebet mit anschließender Khutba | Haftalık Cuma namazı ve hutbe | Weekly Friday prayer with sermon | Events.dc.html:54; Events.tsx:164 |
| event.2.title | Korankurs für Kinder | Çocuklar için Kuran Kursu | Quran Course for Children | Events.dc.html:55; Events.tsx:177 |
| event.2.desc | Wöchentlicher Korankurs für Kinder im Alter von 6-12 Jahren | 6-12 yaş arası çocuklar için haftalık Kuran kursu | Weekly Quran course for children aged 6-12 | Events.dc.html:55; Events.tsx:178 |
| event.5.title | Jugendtreffen | Gençlik Buluşması | Youth Meeting | Events.dc.html:56; Events.tsx:219 |
| event.5.desc | Wöchentliches Treffen der Jugendgruppe mit Diskussionen und Aktivitäten | Gençlik grubunun tartışma ve etkinliklerle haftalık buluşması | Weekly youth group meeting with discussions and activities | Events.dc.html:56; Events.tsx:220 |
| event.3.title | Gemeindeversammlung | Cemaat Toplantısı | Community Meeting | Events.dc.html:57; Events.tsx:191 |
| event.3.desc | Monatliche Versammlung zur Besprechung aktueller Themen | Güncel konuları görüşmek için aylık toplantı | Monthly meeting to discuss current issues | Events.dc.html:57; Events.tsx:192 |
| event.6.title | Frauen-Kochkurs | Kadınlar Yemek Kursu | Women's Cooking Course | Events.dc.html:58; Events.tsx:233 |
| event.6.desc | Monatlicher Kochkurs für Frauen mit traditionellen Rezepten | Geleneksel tariflerle kadınlar için aylık yemek kursu | Monthly cooking course for women with traditional recipes | Events.dc.html:58; Events.tsx:234 |
| event.4.title | Türkischer Kulturabend | Türk Kültür Gecesi | Turkish Cultural Evening | Events.dc.html:59; Events.tsx:205 |
| event.4.desc | Abend mit türkischer Musik, Tanz und traditionellem Essen | Türk müziği, dans ve geleneksel yemeklerle kültür gecesi | Evening with Turkish music, dance and traditional food | Events.dc.html:59; Events.tsx:206 |
| event.date | Fr., 15. März 2024; Sa., 16. März 2024; So., 17. März 2024; Mi., 20. März 2024; Fr., 22. März 2024; Mo., 25. März 2024 | abgeleitet (Events.tsx:257–264) | abgeleitet (Events.tsx:257–264) | Events.dc.html:54–59; Events.tsx:165–235 |
| event.time | 13:00 Uhr; 16:00 Uhr; 15:00 Uhr; 19:00 Uhr; 14:00 Uhr; 18:00 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | Events.dc.html:54–59; „Uhr“ fest Events.tsx:394 |
| event.location | Hauptgebetsraum; Bildungsraum 1; Jugendraum; Konferenzraum; Küche; Mehrzweckhalle | – (nur DE in Quelle) | – (nur DE in Quelle) | Events.dc.html:54–59; Events.tsx:167, 181, 223, 195, 237, 209 |
| event.audience | 200+ Teilnehmer; 25 Teilnehmer; 30 Teilnehmer; 50 Teilnehmer; 20 Teilnehmer; 150 Teilnehmer | abgeleitet: {Zahl} Katılımcılar | abgeleitet: {Zahl} Participants | Events.dc.html:54–59; Events.tsx:95, 137, 402 |
| event.price | Kostenlos (Termine 1, 2, 3, 5, 6); Kostenpflichtig (Termin 4) | Ücretsiz; Ücretli | Free; Paid | Events.dc.html:54–59; Events.tsx:57–58, 99–100, 141–142 |
| events.recommended | Empfohlen (Termine 1 und 3) | Önerilen | Recommended | Events.dc.html:54, 57; LanguageContext.tsx:105, 363, 621 |
| event.img | Foto: {Titel} | – (nur DE in Quelle) | – (nur DE in Quelle) | Events.dc.html:60; readme.md:22 |

Kartenetikett = Schalter-Text (Events.dc.html:60).

## DATEN
Vorschlag, abgeleitet. Felder (Typ; mehrsprachig ja oder nein):
- id (Zahl oder UUID; nein); slug (Text; nein; K-03).
- titel, beschreibung (Text; ja; de Pflicht, tr und en mit Rückfall auf de; K-02).
- beginn (Datum und Uhrzeit; nein); ende (Uhrzeit, optional; nein; readme.md:12).
- wiederholung (RRULE-Text, optional) und ausnahmen (Datumsliste); beides nein (K-09).
- organisation (Auswahl at, kt, gt, kgt; nein; Namen LanguageContext.tsx:119–123); kategorie (Auswahl aus sechs Werten; nein).
- ort (Text; nein; Bestand nur de); teilnehmer oder zielgruppe (Text oder Zahl; offen).
- eintritt (Auswahl kostenlos oder kostenpflichtig; nein); empfohlen (Wahrheitswert; nein).
- anmeldung (Wahrheitswert mit optionaler Platzzahl; nein; K-09); bild (Verweis; nein; bis zur Lieferung Platzhalter, Laufbuch.dc.html:233).

Nicht auf dieser Seite: iCal je Termin, Abo-Feed je Organisation (K-09). Seeds nur als erkennbare Beispielinhalte (G-04; Laufbuch.dc.html:238).

## FORMULARFELDER
– (entfaellt: keine Eingabefelder im Design; der Bestand rendert kein Suchfeld, nur Textschlüssel, Events.tsx:42, 84, 126).

## INTERAKTIONEN
1. Kategorie-Schalter setzt die Kategorie, filtert, aria-pressed wechselt (Events.dc.html:25, 67); der Bestand setzt zusätzlich Seite 1 (Events.tsx:307–310).
2. „Alle“ im Leerzustand setzt die Kategorie zurück (Events.dc.html:42, 68).
3. Termin-Karte führt zu den Details (Events.tsx:414; Laufbuch.dc.html:313); „Anmelden“ hat im Bestand keine Aktion (Events.tsx:419–424).
4. Blättern nur im Bestand, bei mehr als sechs Terminen (Events.tsx:26, 432–458).
5. Fokus 2 px #0E3929 (Events.dc.html:13); Bewegung 150 ms (readme.md:24).

## ZUSTAENDE
- state (data-props, Events.dc.html:50): liste (Standard) oder leer; leer erzwingt keine Termine (:65).
- cat (lokal, :62): all (Standard), prayer, education, community, cultural, youth, women.
- Abgeleitet (:66–68): Treffer oder keiner. Mit den sechs Terminen tritt Leer nur über state=leer auf, da jede Kategorie genau einen Termin hat (abgeleitet).
- Bestand: Seiten 1 bis n (Events.tsx:25, 445); Vorherige und Nächste deaktiviert (:438, :452); Leer ohne Termine (:330–339).
- Sortierung chronologisch (Laufbuch.dc.html:268). Empfohlen bei featured, hier Termine 1 und 3 (Events.dc.html:54, 57).

## BILDER
- Pro Termin eine beschriftete Streifenfläche „Foto: {Titel}“, keine Fotos (Events.dc.html:60; readme.md:22; Laufbuch.dc.html:233).
- Sechs Unsplash-Adressen im Bestand (Events.tsx:171–241) werden nicht übernommen (Laufbuch.dc.html:34).
- Icons, Lucide, 2 px Strich (readme.md:28): check 16 px (Events.dc.html:25), funnel 20 px (:28), calendar 32 px (:39).
- Logos nur bei Termin 5 (gt) und 6 (kt); Quelldateien 40 × 40 px (Laufbuch.dc.html:231).

## AUFFAELLIGKEITEN
1. Die Design-Termine liegen im März 2024 (Events.dc.html:54–59), vor dem Stand 2026-10-11; der Bestand nennt sie Mock-Daten (Events.tsx:159). „Kommende Events“ passt nicht dazu.
2. Die Startseite nennt andere Termine, „Jeden Samstag“ und 28. Juli 2025 (EventsSection.tsx:23, 71).
3. Seitentitel tr und en uneinheitlich: Events.tsx:72, 114 gegen LanguageContext.tsx:360, 618.
4. „Kommende“ tr: Events.tsx:86 gegen LanguageContext.tsx:362; de: LanguageContext.tsx:104.
5. Blättern nur im Bestand (Events.tsx:26, 432–458).
6. Der Bestand hartkodiert „Featured“ (Events.tsx:355) und „Uhr“ (Events.tsx:394); Laufbuch.dc.html:267 verlangt „Empfohlen“.
7. Logos widersprechen sich (EventsSection.tsx:10–12, 125–127 gegen Laufbuch.dc.html:34, 230); betroffen sind Termine 5 und 6.
8. Der Leerzustand nennt „Suchkriterien“ (Events.dc.html:41), ein Suchfeld fehlt.
9. Die Bestand-Reihenfolge ist nicht chronologisch (Events.tsx:160–245).
10. Ein Bestandsfeld nennt einen Personennamen (Events.tsx:183), hier nur als [Name – Veranstalter(in)]. Vier Design-Termine haben keine Organisation (Events.dc.html:54, 55, 57, 59), K-09 nennt sie.
11. Datum: readme.md:12 „Sa., 2. Aug.“ gegen Design „Fr., 15. März 2024“ (Events.dc.html:54); das Design gilt.
12. Der Bestand nutzt Verläufe (Events.tsx:280, 282); readme.md:22 verbietet sie.

## OFFENE FRAGEN
1. Welche Termine gelten zum Start, da die Design-Termine Mock-Daten sind?
2. Blendet „Kommende Events“ vergangene Termine aus, und nach welchem Datum?
3. Welcher Seitentitel gilt in tr und en?
4. Gibt es Blättern mit sechs Terminen oder alle Termine ohne Seitenzahl?
5. Welche Organisation verantwortet die Termine 1 bis 4?
6. Bezeichnet „audience“ Teilnehmer, Platzzahl oder Zielgruppe (K-09)?
7. Welche Logo-Zuordnung für GT, KT und KGT gilt?
8. Wie lauten die lokalisierten Pfade für /tr und /en?
9. Wie erscheinen Uhrzeit und Datum in tr und en, und kommt das Zeitende auf die Karte (readme.md:12)?
10. Sollen Suchfeld und Zeitfilter gebaut werden (Events.tsx:42–47)?
11. Braucht es einen Eintrittsbetrag?
12. Wie erscheinen wiederkehrende Termine wie „Jeden Samstag“ auf der Liste?
13. Ist EventDetails#anmeldung als Ziel von „Anmelden“ bestätigt (Laufbuch.dc.html:313)?

=== ENDE S04 · BEREIT ZUR RÜCKGABE ===
