# S04 · Veranstaltungen (Liste)

Kennung S04 · Rolle Kundschafter · Modell Haiku 5.5 · Phase P0 · Kern-Version 1.0

## SEITE
Veranstaltungen (Liste), Artboard 03.3 (Laufbuch.dc.html:156). Design: Events.dc.html, Code-Ziel: Events.tsx. Sprache lang="de" (Events.dc.html:15). Header mit active "moschee" und current "events" (Events.dc.html:16).

## ROUTE
/veranstaltungen (K-03, Deutsch ohne Präfix); /tr/… und /en/… mit lokalisiertem Pfad. Der lokalisierte Pfad steht in keiner Quelle: – (nicht in Quelle). Karten führen zu /veranstaltungen/[slug] (K-03) bzw. EventDetails (Laufbuch.dc.html:313).

## QUELLEN
- Design: Events.dc.html, 73 Zeilen (Template 9–49, Script 50–71).
- Bestand: Events.tsx (Texte t-Objekt 28–155, Termine 160–245, Darstellung 279–464); EventsSection.tsx (Startseite, Termine 18–91, Logos 9–12); LanguageContext.tsx (events 101–111, 359–369, 617–627; organizations 118–124, 376–382, 634–640; Header mosque 21–30, 279–288, 537–546).
- Hilfen: readme.md (8, 12, 22, 24, 28); 00 Laufbuch.dc.html (34, 156, 193, 208, 230, 231, 233, 238, 267, 268, 313).

## ZWECK
Besucher sehen Veranstaltungen als Karten, filtern nach Kategorie und öffnen Details. Ohne Treffer erscheint ein Leerzustand mit Rücksetzknopf (Events.dc.html:37–44).

## ABSCHNITTE
Aufbau von oben nach unten:
1. Header, sticky, z-index 50 (Events.dc.html:16).
2. PrayerTimesBar, 124 px (Events.dc.html:17).
3. Breadcrumbs mit Bezeichnung „Veranstaltungen“, 52 px (Events.dc.html:18).
4. main, Größen über Container-Einheiten (Events.dc.html:19):
   a. PageHeader mit Eyebrow, Titel, Untertitel, 240 px (Events.dc.html:20).
   b. Inhalt, max. 1344 px, Abstand 32 px (Events.dc.html:21).
   c. Filterzeile mit Umbruch, Abstand 16 px (Events.dc.html:22): sieben Kategorie-Schalter, Abstand 8 px (Events.dc.html:23–25); „Kommende Events“ mit Icon funnel 20 px (Events.dc.html:28).
   d. Terminliste bei Treffern: Raster minmax(min(100%,340px),1fr), Abstand 24 px; sechs EventCard, variant „list“, item = Termin (Events.dc.html:30–36).
   e. Leerzustand bei keinem Treffer (Events.dc.html:37–44).
5. Footer, 520 px (Events.dc.html:47).

Schalter-Stil (Events.dc.html:25, 67): mind. 48 px hoch, Pillenform, 18 px fett. Aktiv: Hintergrund #047857, Schrift #FFFFFF, Rand 2 px #047857, Häkchen 16 px. Inaktiv: Hintergrund #FFFFFF, Schrift #1D1A17, Rand 1 px #8C857C; Hover Rand #047857.

Leerzustand-Stil (Events.dc.html:38–42): Karte #FFFFFF, gestrichelter Rand #8C857C, Radius 12 px, Innenabstand 64/24 px; Kreis 64 px #F3F0E9 mit Icon calendar 32 px; Überschrift 30 px Source Serif 4; Text max. 52ch, Farbe #514C46; Schaltfläche mind. 48 px, Rand 2 px #047857, Hover #EBF9F2.

Texte, Schlüssel mit Präfix events.list. (Termin-Ids wie im Design):

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| header.mosque.title | Moschee | Cami | Mosque | Events.dc.html:20; abgeleitet LanguageContext.tsx:22, 280, 538 |
| title | Veranstaltungen | Etkinlikler | Events | Events.dc.html:20; Events.tsx:30, 72, 114 |
| subtitle | Aktuelle Veranstaltungen und Events der IGMG Wetzlar Moschee | IGMG Wetzlar Camii'nin güncel etkinlikleri ve organizasyonları | Current events and activities at IGMG Wetzlar Mosque | Events.dc.html:20; Events.tsx:31, 73, 115 |
| crumb | Veranstaltungen | Etkinlikler | Events | Events.dc.html:18; abgeleitet LanguageContext.tsx:26, 284, 542 |
| group | Kategorie | Kategori | Category | Events.dc.html:23; Events.tsx:43, 85, 127 |
| cat.all bis cat.women | Alle · Gebete · Bildung · Gemeinde · Kultur · Jugend · Frauen | Tümü · Namaz · Eğitim · Cemaat · Kültür · Gençlik · Kadın | All · Prayers · Education · Community · Cultural · Youth · Women | Events.dc.html:51; Events.tsx:33–39, 75–81, 117–123 |
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
| event.date | Fr., 15. März 2024 · Sa., 16. März 2024 · So., 17. März 2024 · Mi., 20. März 2024 · Fr., 22. März 2024 · Mo., 25. März 2024 | abgeleitet: Intl (Events.tsx:257–264) | abgeleitet: Intl | Events.dc.html:54–59; ISO-Daten Events.tsx:165–235 |
| event.time | 13:00 Uhr · 16:00 Uhr · 15:00 Uhr · 19:00 Uhr · 14:00 Uhr · 18:00 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | Events.dc.html:54–59; „Uhr“ fest in Events.tsx:394 |
| event.location | Hauptgebetsraum · Bildungsraum 1 · Jugendraum · Konferenzraum · Küche · Mehrzweckhalle | – (nur DE in Quelle) | – (nur DE in Quelle) | Events.dc.html:54–59; Events.tsx:167, 181, 223, 195, 237, 209 |
| event.audience | 200+ Teilnehmer · 25 Teilnehmer · 30 Teilnehmer · 50 Teilnehmer · 20 Teilnehmer · 150 Teilnehmer | abgeleitet: {Zahl} Katılımcılar | abgeleitet: {Zahl} Participants | Events.dc.html:54–59; Events.tsx:95, 137, 402 |
| event.price | Kostenlos (Termine 1, 2, 3, 5, 6) · Kostenpflichtig (Termin 4) | Ücretsiz · Ücretli | Free · Paid | Events.dc.html:54–59; Events.tsx:57–58, 99–100, 141–142 |
| badge.featured | Empfohlen (Termine 1 und 3) | Önerilen | Recommended | Events.dc.html:54, 57; LanguageContext.tsx:105, 363, 621 |
| event.img | Foto: {Titel} | – (nur DE in Quelle) | – (nur DE in Quelle) | Events.dc.html:60; readme.md:22 |

Die Kategorie-Bezeichnung auf der Karte ist dieselbe wie der Schalter-Text (catLabel, Events.dc.html:60).

## DATEN (Vorschlag, abgeleitet)
- id: Zahl oder UUID, eindeutig, nicht mehrsprachig (Events.dc.html:54–59).
- slug: Text, eindeutig, nicht mehrsprachig (K-03).
- titel, beschreibung: Text, mehrsprachig ja; de Pflicht, tr und en optional mit Rückfall auf de (K-02).
- beginn: Datum und Uhrzeit, nicht mehrsprachig (Events.dc.html:54–59).
- ende: Uhrzeit, optional, nicht mehrsprachig (readme.md:12).
- wiederholung: RRULE-Text, optional; ausnahmen: Datumsliste; nicht mehrsprachig (K-09).
- organisation: Auswahl at, kt, gt, kgt; Namen aus den Übersetzungen (LanguageContext.tsx:119–123); nicht mehrsprachig im Feld (K-09).
- kategorie: Auswahl prayer, education, community, cultural, youth, women; Bezeichnungen aus den Übersetzungen (K-02).
- ort: Text, nicht mehrsprachig (Bestand nur de).
- teilnehmer oder zielgruppe: Text oder Zahl, Klärung offen.
- eintritt: Auswahl kostenlos oder kostenpflichtig; Bezeichnungen aus den Übersetzungen.
- empfohlen: Wahrheitswert; anmeldung: Wahrheitswert mit optionaler Platzzahl als ganze Zahl (K-09).
- bild: Verweis, optional; bis zur Lieferung Platzhalter (Laufbuch.dc.html:233).
Nicht auf dieser Seite: iCal je Termin und Abo-Feed je Organisation (K-09). Seed-Daten nur als erkennbare Beispielinhalte (G-04; Laufbuch.dc.html:238).

## FORMULARFELDER
– (entfaellt: keine Eingabefelder im Design; der Bestand rendert kein Suchfeld, nur Textschlüssel in Events.tsx:42, 84, 126).

## INTERAKTIONEN
1. Kategorie-Schalter: setzt die Kategorie, filtert die Liste, aria-pressed wechselt (Events.dc.html:25, 67). Der Bestand setzt zusätzlich Seite 1 (Events.tsx:307–310).
2. Schaltfläche „Alle“ im Leerzustand: setzt die Kategorie auf alle (Events.dc.html:42, 68).
3. Termin-Karte: Details (Bestand „Details ansehen“, Events.tsx:414; Laufbuch.dc.html:313). „Anmelden“ hat im Bestand keine Aktion (Events.tsx:419–424); Ziel laut Laufbuch EventDetails#anmeldung (Laufbuch.dc.html:313).
4. Blättern (nur Bestand): Vorherige und Nächste bei mehr als sechs Terminen, am Rand deaktiviert (Events.tsx:26, 432–458).
5. Fokus: 2 px Umriss #0E3929 mit 2 px Abstand (Events.dc.html:13). Bewegung 150 ms, ohne Animation bei „Bewegung reduzieren“ (readme.md:24).

## ZUSTAENDE
- state (data-props, Events.dc.html:50): liste (Standard) oder leer. Bei leer ist die Liste erzwungen leer (Events.dc.html:65).
- cat (lokal, Events.dc.html:62): all (Standard), prayer, education, community, cultural, youth, women (Events.dc.html:51).
- Abgeleitet (Events.dc.html:66–68): hasEvents bei mindestens einem Treffer, isEmpty bei keinem. Mit den sechs Terminen tritt Leer nur über state=leer auf, weil jede Kategorie genau einen Termin hat (abgeleitet).
- Bestand: Seite 1 bis n (Events.tsx:25, 445); Vorherige und Nächste deaktiviert (Events.tsx:438, 452); Leer bei null Terminen auf der Seite (Events.tsx:330–339).
- Sortierung: chronologisch aufsteigend, kein Schalter (Laufbuch.dc.html:268; Events.dc.html:54–59).
- Empfohlen: bei featured true, also Termine 1 und 3 (Events.dc.html:54, 57).

## BILDER
- Pro Termin eine beschriftete Streifenfläche „Foto: {Titel}“, keine Fotos (Events.dc.html:60; readme.md:22; Laufbuch.dc.html:233).
- Sechs Unsplash-Adressen im Bestand (Events.tsx:171, 185, 199, 213, 227, 241) werden nicht übernommen (Laufbuch.dc.html:34).
- Icons, Lucide, Strich 2 px (readme.md:28): check 16 px (Events.dc.html:25), funnel 20 px (Events.dc.html:28), calendar 32 px (Events.dc.html:39).
- Organisationslogos nur bei Terminen mit Organisation: Termin 5 (gt) und Termin 6 (kt). Quelldateien 40 × 40 px (Laufbuch.dc.html:231).

## AUFFAELLIGKEITEN
1. Die sechs Design-Termine liegen im März 2024 (Events.dc.html:54–59) und damit vor dem Stand 2026-10-11. Der Bestand nennt sie Mock-Daten (Events.tsx:159), das Laufbuch Beispielinhalte (Laufbuch.dc.html:238). Das Label „Kommende Events“ (Events.dc.html:28) passt so nicht zu den Daten.
2. Zwei Terminquellen widersprechen sich: Startseite mit wiederkehrenden Terminen wie „Jeden Samstag“ und einem Termin am 28. Juli 2025 (EventsSection.tsx:23, 71) gegen die Liste mit dem Mock aus März 2024 (Events.tsx:160–245). Das Design folgt Events.tsx.
3. Seitentitel tr und en sind uneinheitlich: Events.tsx:72, 114 („Etkinlikler“, „Events“) gegen LanguageContext.tsx:360, 618 („Etkinliklerimiz“, „Our Events“). Das Label „Kommende Events“ steht im Bestand als Events.tsx:44, 86, 128 und abweichend als LanguageContext.tsx:104 („Kommende Veranstaltungen“) bzw. :362 („Yaklaşan Etkinlikler“).
4. Blättern mit sechs Terminen pro Seite (Events.tsx:26, 432–458) fehlt im Design (Events.dc.html:30–36).
5. Der Bestand hartkodiert „Featured“ (Events.tsx:355) und „Uhr“ (Events.tsx:394) in allen Sprachen. Das Laufbuch verlangt „Empfohlen“ (Laufbuch.dc.html:267; LanguageContext.tsx:105, 363, 621).
6. Logo-Zuordnung widerspricht sich: Der Bestand ordnet gt 8ce65541, kt 301e0b5b und kgt efe65084 zu (EventsSection.tsx:10–12, 125–127). Das Laufbuch ordnet 301e0b5b gt, efe65084 kt und 8ce65541 kgt zu (Laufbuch.dc.html:34, 230). Betroffen sind Termin 5 (gt) und Termin 6 (kt).
7. Die Leerzustandszeile spricht von „Suchkriterien“ (Events.dc.html:41; Events.tsx:68), ein Suchfeld gibt es aber weder im Design noch im Bestand-Rendering.
8. Die Bestand-Reihenfolge ist nicht chronologisch (Events.tsx:160–245: 15., 16., 20., 25., 17., 22. März). Die Design-Reihenfolge ist es (Events.dc.html:54–59).
9. Ein Veranstalterfeld im Bestand enthält einen Personennamen (Events.tsx:183); im Blatt steht nur [Name – Veranstalter(in)] (Events.tsx:183). Das Design hat kein Veranstalterfeld, und vier Design-Termine ohne Organisation (Events.dc.html:54, 55, 57, 59) stehen dem Pflichtfeld Organisation in K-09 gegenüber.
10. Datumsformat: readme.md:12 nennt „Sa., 2. Aug.“, das Design zeigt „Fr., 15. März 2024“ (Events.dc.html:54), der Bestand bildet Intl mit langem Wochentag (Events.tsx:257–264). Das Design gilt für den Text.
11. Die Bestand-Startseite nutzt Verläufe (Events.tsx:280, 282); readme.md:22 verbietet Verläufe.

## OFFENE FRAGEN
1. Welche Termine gelten zum Start, da die Design-Termine Mock-Daten aus März 2024 sind?
2. Soll der Filter „Kommende Events“ vergangene Termine ausblenden, und wenn ja nach welchem Datum?
3. Welcher Seitentitel gilt in tr und en: Events.tsx oder LanguageContext.tsx?
4. Gibt es Blättern mit sechs Terminen pro Seite oder alle Termine ohne Seitenzahl?
5. Welche Organisation verantwortet die Termine 1 bis 4, für die das Design kein Feld zeigt?
6. Bezeichnet „audience“ eine Teilnehmerzahl, eine Platzzahl oder eine Zielgruppe im Sinn von K-09?
7. Welche Logo-Zuordnung für GT, KT und KGT ist richtig?
8. Wie lauten die lokalisierten Pfade für /tr und /en zu /veranstaltungen?
9. Wie werden Uhrzeit und Datum in tr und en dargestellt, und soll das Zeitende laut readme.md:12 auf die Karte?
10. Sollen Suchfeld und Zeitfilter „Heute“, „Diese Woche“, „Dieser Monat“ gebaut werden, da ihre Texte nur im Bestand stehen (Events.tsx:45–47)?
11. Braucht es einen Eintrittsbetrag, da das Design nur „Kostenlos“ oder „Kostenpflichtig“ zeigt?
12. Wie sollen wiederkehrende Termine wie „Jeden Samstag“ auf der Liste erscheinen, als Text oder als Einzeltermin?
13. Ist das Ziel EventDetails#anmeldung für „Anmelden“ bestätigt (Laufbuch.dc.html:313)?

=== ENDE S04 · BEREIT ZUR RÜCKGABE ===
