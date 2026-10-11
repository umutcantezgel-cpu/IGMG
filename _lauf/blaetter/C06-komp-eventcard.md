C06 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Komponentenblatt „EventCard“

## SEITE
Komponente „EventCard“ (Design Component). Wurzel `article` mit `data-component="EventCard"` (EventCard.dc.html:15). Darstellungen `home` und `list`. Kein Seitenblatt.

## ROUTE
– (entfaellt, keine eigene Route). Einbindung: Startseite Home.dc.html:46 (home, mit lang); Veranstaltungen Events.dc.html:33 (list, ohne lang); Styleguide.dc.html:41; 02 Komponenten.dc.html:57–58. Organisationsseiten ohne Einbindung, siehe AUFFAELLIGKEITEN 7.

## QUELLEN
- Design (nur lesen): EventCard.dc.html, 80 Zeilen (Template Z. 9–46, data-props Z. 47, Script Z. 48–77).
- Bestand (nur lesen): EventsSection.tsx (Z. 159–228) und Events.tsx (Z. 342–428, Texte Z. 28–155) unter uploads/igmg-wetzlar-website/src/app/components/.
- Hilfen: readme.md; 00 Laufbuch.dc.html (D-10, Längenliste Z. 195–211, Plan Z. 153, 156, 169, Script Z. 230, 313).
- Zusatz (nur Suche): LanguageContext.tsx (events, hero.learnMore, organizations); assets/*.png (md5, Maße).

## ZWECK
Veranstaltung als Karte: Kategorie, Empfehlung, Preis, Titel, Organisation, Beschreibung, Datum, Uhrzeit, Ort, Zielgruppe und eine Handlung (EventCard.dc.html:35–43; 00 Laufbuch.dc.html:313).

## ABSCHNITTE
Aufbau von oben nach unten (EventCard.dc.html):
1. Bildfläche: `img` als 160 px Streifen mit Beschriftung (Z. 16), sonst 4 px Akzentband (Z. 17).
2. Pillen: Kategorie (Z. 20); „Empfohlen“ mit Icon star (16) bei `featured` (Z. 21); Preis bei `price` (Z. 22).
3. Titel, h3, 24 px (Z. 25); Organisationszeile bei `org` mit Logo 24 px (Z. 26).
4. Beschreibung, 18 px (Z. 28).
5. Detailliste Datum, Uhrzeit, Ort, Zielgruppe mit 20-px-Icons (Z. 29–34).
6. Handlung: `list` zwei Links (Z. 35–40); `home` ein Link (Z. 41–43).
Eingebunden: dc-import Icon (nicht Teil dieses Pakets).

Texte (A2). Vorschau ohne `item`, Wortlaut wie EventsSection.tsx:21–26:

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| preview.* | Wöchentlicher Qur'an Kurs / Lernen Sie die richtige Rezitation und Bedeutung des Qur'an in unserem wöchentlichen Kurs. / Jeden Samstag / 14:00–16:00 Uhr / Hauptsaal / Offen für alle | – (nur DE in Quelle) | – (nur DE in Quelle) | EventCard.dc.html:63; EventsSection.tsx:21–26 |

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| card.rec | Empfohlen | Önerilen | Recommended | EventCard.dc.html:55–57; LanguageContext.tsx:105/363/621 |
| card.org.prefix | organisiert von | – (nur DE in Quelle) | – (nur DE in Quelle) | EventCard.dc.html:26; EventsSection.tsx:192 |
| card.dt.date | Datum | Tarih | Date | EventCard.dc.html:30; Events.tsx:50/92/134 |
| card.dt.time | Uhrzeit | Saat | Time | EventCard.dc.html:31; Events.tsx:51 („Zeit“)/93/135 |
| card.dt.location | Ort | Konum | Location | EventCard.dc.html:32; Events.tsx:52/94/136 |
| card.dt.audience | Zielgruppe | – (nur DE in Quelle) | – (nur DE in Quelle) | EventCard.dc.html:33 |
| card.link.details | Details ansehen | Detayları gör | View details | EventCard.dc.html:37; Events.tsx:56/98/140 |
| card.link.register | Anmelden | Kayıt ol | Register | EventCard.dc.html:38; Events.tsx:55/97/139 |
| card.link.more | Mehr erfahren | Daha fazla öğren | Learn More | EventCard.dc.html:42; LanguageContext.tsx:98/356/614 |
| cat.bildung/education | Bildung | Eğitim | Education | EventCard.dc.html:55–57; Events.tsx:35/77/119 |
| cat.veranstaltung | Veranstaltung | Etkinlik | Event | EventCard.dc.html:55–57; LanguageContext.tsx:108/366/624 |
| cat.jugend/youth | Jugend | Gençlik | Youth | EventCard.dc.html:55–57; Events.tsx:38/80/122 |
| cat.prayer/community/cultural/women | Gebete / Gemeinde / Kultur / Frauen | Namaz / Cemaat / Kültür / Kadın | Prayers / Community / Cultural / Women | Events.tsx:34–39/76–81/118–123 |
| org.at | AT (Erwachsene) | AT (Yetişkinler) | AT (Adults) | EventCard.dc.html:55–57; LanguageContext.tsx:120/378/636 |
| org.kt | KT (Frauen) | KT (Kadınlar) | KT (Women) | EventCard.dc.html:55–57; LanguageContext.tsx:121/379/637 |
| org.gt | GT (Jugend) | GT (Gençlik) | GT (Youth) | EventCard.dc.html:55–57; LanguageContext.tsx:122/380/638 |
| org.kgt | KGT (Frauenjugend) | KGT (Kadın Gençlik) | KGT (Women's Youth) | EventCard.dc.html:55–57; LanguageContext.tsx:123/381/639; 00 Laufbuch.dc.html:201 |

Hinweis: Nur bildung, veranstaltung und jugend stehen in NAMES (Z. 55–57); die übrigen Zeilen stammen aus dem Bestand. Die sr-only-Zusätze „: [Titel]“ sind nicht sichtbar.

## DATEN
Vorschlag; Datenbanktechnik nicht festgelegt. Bestandsfelder ⇄ Design: description → desc, participants → audience, category → cat, organization → org (EventsSection.tsx:19–29).
- title, desc: Text, mehrsprachig ja (DE Pflicht, TR/EN optional mit Rückfall) (EventCard.dc.html:47; K-02).
- location, audience, price: Text, mehrsprachig ja, optional (Z. 47; price: Bestand Kostenlos/Kostenpflichtig, Events.tsx:57–58).
- date: Datum, mehrsprachig nein, Wochentag abgeleitet (D-10, 00 Laufbuch.dc.html:193); Wiederkehrendes wie „Jeden Samstag“ als Text, mehrsprachig ja (Z. 47).
- time: Text („14:00–16:00 Uhr“), mehrsprachig nein (Z. 47; D-10).
- cat, org: Schlüssel, mehrsprachig nein; featured: boolesch, nein (Z. 47, 49–52, 60).
- img: Medienverweis, nein; href, regHref: Link, nein (Z. 47, 74).

## FORMULARFELDER
– (entfaellt, keine Eingabefelder.)

## INTERAKTIONEN
- Hover (ganze Karte): Schatten 0 6px 20px rgba(29,26,23,0.10), Rand #047857, 150 ms, ohne Verschiebung (EventCard.dc.html:15; readme.md:20, 24).
- `home`: „Mehr erfahren“ liegt per ::after über der Karte (EventCard.dc.html:42); Ziel `href`, Standard EventDetails.dc.html (Z. 74).
- `list`: „Details ansehen“ zu `href`; „Anmelden“ zu `regHref`, Standard EventDetails.dc.html#anmeldung (Z. 37–38, 74).
- Fokus: 2 px #0E3929 mit 2 px Abstand (EventCard.dc.html:13).
- Bestand: Startseite mit ID (EventsSection.tsx:219); Veranstaltungen ohne ID (Events.tsx:414); „Anmelden“ ohne Aktion (Events.tsx:419–424).

## ZUSTAENDE
Eigenschaften (data-props, EventCard.dc.html:47; Editor: lang und variant als Enum, item null):
- lang: de (Default), tr, en; steuert nur Kategorie-, Empfohlen- und Organisationsnamen (Z. 64).
- variant: home (Default), list; list zeigt zwei Links, home einen (Z. 69).
- item: Pflicht title, desc, date, time, location, audience; ohne item Vorschau (Z. 63).
- item.cat: bildung, veranstaltung, jugend, prayer, education, community, cultural, youth, women; Default keiner (Z. 60, 66).
- item.tone: gruen, blau, ocker, petrol, rot, sand, violett, beere; Default sand; überschreibt cat (Z. 59, 66).
- item.catLabel: Text, Vorrang vor NAMES (Z. 71). item.featured: boolesch, Default false (Z. 21).
- item.org: at, kt, gt, kgt; Default keiner; steuert Zeile, Logo, Akzent (Z. 26, 49–52, 73).
- item.price: Text, Default keiner (Z. 22). item.img: Text, Default keiner; 160 px statt Akzentband (Z. 16–17).
- item.href: Default EventDetails.dc.html; item.regHref: Default EventDetails.dc.html#anmeldung (Z. 74).
- $preview: 400 × 640 px (Z. 47).

Bestand-Zustände:
- Empfohlen an oder aus (EventsSection.tsx:175–177; Events.tsx:352–357); Bestand zusätzlich mit Ring und Verlauf (EventsSection.tsx:164).
- Kostenlos oder Kostenpflichtig (Events.tsx:362); Design hat nur den Preistext.
- Unbekannte Organisation: Hauptlogo und Name (EventsSection.tsx:129–130, 140–141); Design zeigt dann keine Zeile.
- Ohne Bild: Design Akzentband; Bestand immer mit Bild (Events.tsx:346–351).
- Liste leer (Events.tsx:330–339) ist kein Kartenzustand.

## BILDER
- Bildplatzhalter 160 px: Streifen 135° (#F3F0E9/#FCFAF6), Beschriftung Monospace 15 px (Z. 16); Streifen laut readme.md:22 vorgesehen.
- Akzentband 4 px, aria-hidden (Z. 17).
- Logo 24 × 24 px, alt leer, weil der Name im Text steht (Z. 26). Dateien: at assets/logo-igmg-wetzlar.png, kt assets/logo-kadin.png, gt assets/logo-genclik.png, kgt assets/logo-kadin-genclik.png (Z. 49–52); je 40 × 40 px RGB.
- Icons Lucide: star 16 px, übrige 20 px (Z. 21, 30–37, 42).
- Bestand-Unsplash-Fotos (Events.tsx:171, 185, 199, 213, 227, 241) nicht übernommen (G-04); echte Fotos fehlen (00 Laufbuch.dc.html:233).

## AUFFAELLIGKEITEN
1. Sprache: Nur Kategorie, Empfohlen und Organisation folgen `lang`; die übrigen Texte sind fest Deutsch (EventCard.dc.html:26, 30–33, 37, 38, 42). Events.dc.html:15 setzt lang="de", Events.dc.html:33 übergibt kein lang.
2. Logos: Design gt=301e0b5b, kt=efe65084, kgt=8ce65541 (EventCard.dc.html:50–52; 00 Laufbuch.dc.html:34); Bestand gt=8ce65541, kt=301e0b5b, kgt=efe65084 (EventsSection.tsx:10–12, 125–127). Dateien byte-gleich (md5); Zuordnung ungeklärt (00 Laufbuch.dc.html:230).
3. Labels: NAMES nur bildung, veranstaltung, jugend; die übrigen Schlüssel erscheinen als Rohwort (EventCard.dc.html:55–57, 71).
4. Farben: Veranstaltung ocker gegen lila, Jugend petrol gegen orange (EventsSection.tsx:97–100); Events.tsx:267–276 weicht ab.
5. Datum/Zeit: D-10 „Mo., 28. Juli 2025“ und „14:00–16:00 Uhr“ (00 Laufbuch.dc.html:193) gegen readme.md:12 „Sa., 2. Aug.“; Bestand „14:00 - 16:00“ (EventsSection.tsx:24) und „Uhr“ angehängt (Events.tsx:394). K-03 steht nicht im Kern-Auszug.
6. Organisation „main“ im Bestand (EventsSection.tsx:129–130), im Design nicht (EventCard.dc.html:47).
7. Organisationsseiten: Laufbuch nennt EventCard für 06.1 (00 Laufbuch.dc.html:169); keine Einbindung in den Design-Dateien außer Home, Events, Styleguide und 02 Komponenten.
8. Regeln: kein Zweig für reduzierte Bewegung (EventCard.dc.html:15; readme.md:24); Bildbeschriftung 15 px (EventCard.dc.html:16; readme.md:19); Icon star 16 px statt 20/24 px (EventCard.dc.html:21; readme.md:28).
9. Bestand ohne Übernahme: Kürzung auf zwei Zeilen (Events.tsx:377, 382), Ring und Anheben (EventsSection.tsx:163–164); Design gilt (readme.md:20, 22). Der Bestand hat keine Komponente EventCard (K-04).

## OFFENE FRAGEN
- Welche Logo-Zuordnung gilt, Design oder Bestand?
- Sollen alle Kartentexte bei Sprachwechsel umschalten (K-02), und wie lauten „organisiert von“ und „Zielgruppe“ in Türkisch und Englisch?
- Gilt das Datum nach D-10 oder nach readme.md:12, und welche Regel gilt laut K-03?
- Welches Linkformat gilt, Slug oder ID (EventsSection.tsx:219)?
- Bindet die Organisationsseite die Karte ein (00 Laufbuch.dc.html:169)?
- Was zeigt die Karte ohne `cat` und `catLabel`? (Rendering in support.js nicht geprüft.)
- Soll LanguageContext.tsx in die Quellenliste aufgenommen werden, da Zusatzfundstellen daraus stammen?

=== ENDE C06 · BEREIT ZUR RÜCKGABE ===
