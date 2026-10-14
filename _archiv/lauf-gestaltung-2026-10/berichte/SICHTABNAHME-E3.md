# Sichtabnahme E3: Zusammenführung

Grundlage sind die Urteile von fünf Sichtprüfern (start, arbeit-a, arbeit-b, erzaehl, verwaltung) und deren Gegenprüfungen. Eingeordnet nach REFERENZ.md und KERN K-007.
Die Bildpfade sind relativ zum Bildsatz der Sichtabnahme (Scratchpad `head/…`, Startseite ohne Präfix). Die Bilder der Verwaltung liegen in `_werkstatt/bilder/HEAD-verwaltung/`.

## 1. Werte je Ansicht (aus den Urteilen, unverändert)

| Ansicht | Typo | Komp. | Farbe/Bild | Beweg. | Grafik | Details | **Wert** |
|---|---|---|---|---|---|---|---|
| Startseite (Referenz) | 7 | 7 | 7 | 6 | 7 | 6,5 | **6,8** |
| Gebetszeiten | 6 | 5 | 6 | 7 | 5 | 6 | **5,8** |
| Veranstaltungen | 7 | 5 | 6 | 7 | 6 | 6 | **6,2** |
| Veranstaltungsdetail | 6 | 5 | 6 | 7 | 5 | 5 | **5,7** |
| Nachrichten | 7 | 5 | 6 | 7 | 6 | 6 | **6,2** |
| Nachrichtendetail | 6 | 6 | 6 | 7 | 5 | 5 | **5,8** |
| Korankurse | 6 | 6 | 6 | 8 | 6 | 6 | **6,3** |
| Schüler-Voranmeldung | 7 | 6 | 8 | 8 | 6 | 7 | **7,0** |
| Kontakt | 6 | 5 | 6 | 8 | 6 | 6 | **6,2** |
| 404 (gibt-es-nicht) | 6 | 5 | 7 | 7 | 6 | 5 | **6,0** |
| Über uns | 7 | 6,5 | 7 | 7 | 6,5 | 6 | **6,7** |
| Projekte | 7 | 6 | 6,5 | 6,5 | 6,5 | 6 | **6,4** |
| Organisationsseite | 7 | 6 | 6,5 | 6 | 7 | 6,5 | **6,5** |
| Verwaltung (Übersicht) | 6 | 6 | 7 | 7 | 6 | 6 | **6,3** |
| Postfach | 6 | 5 | 6 | 7 | 5 | 5 | **5,7** |
| Verwaltung Veranstaltungen | 7 | 6 | 6 | 7 | 6 | 6 | **6,3** |
| Startklar-Cockpit | 7 | 7 | 7 | 7 | 7 | 7 | **7,0** |

**Gesamtmittel aller 17 Ansichten: 6,29.** Die 12 Hauptansichten nach K-009 liegen im Mittel bei 6,40. Keine Ansicht erreicht das Ziel 8. Am schwächsten sind Veranstaltungsdetail und Postfach (je 5,7), am stärksten Voranmeldung und Cockpit (je 7,0).

Was überall wiederkehrt:
- Das Formsystem fehlt in den großen Momenten und Köpfen.
- Gleichförmige Kartenraster und Kastenstapel.
- Grün steht auch dort, wo nichts zu tun ist.
- Mobil wird der Desktop nur gestapelt (die Momente B-06, B-08 und B-09 sind auf dem Telefon zu klein oder liegen unter dem Falz).
- Rückwege und Bedienelemente sind nicht ehrlich (Attrappen, falsche Ziele).

## 2. Schon erledigt in Welle 0 (ec02e62), daher kein Paket
- **B-05 Titel-Morph ohne Geisterbild** (start und arbeit-a): eigene Klasse `text`, Schnappschüsse in natürlicher Größe, der alte Titel geht, dann kommt der neue (Nachweis `bilder/W0-morph/nachricht`).
  - Für den Orchestrator bleibt: in `::view-transition-new(.seite)` die Zeile mit `auftritt` entfernen (B-05 nennt nur die Überblendung) und die Zeitlupen *Liste → Veranstaltung* und *Startseite → Veranstaltung* nachreichen.
  - Die Signatur heißt `morphStil(name, 'text')`. Die Pakete übernehmen sie.
- **tailwind-merge kennt `text-display-1/-2`** (arbeit-b), Test `cn.test.ts`.
- **Lesemaß-Token** `--container-text: 52ch` (≈ 70 Zeichen; arbeit-a und arbeit-b). Der Vorschlag 48ch ist damit überholt. Den Teil zu den Formulartexten erledigt H-B07.
  - Für den Orchestrator bleibt: REFERENZ §1 von „max-w-text (68ch)“ auf 52ch ändern.

## 3. Endgültige Befundpakete

Wellenplan: In Welle 1 legen 7 Pakete die Grundlagen, die keine anderen Pakete voraussetzen. Welle 2 umfasst 7 Pakete, darunter die Abnehmer der Grundlagen. Innerhalb einer Welle sind die Schreibrechte disjunkt. `Zustandsgrafik.tsx` liegt bewusst in zwei Wellen: H-B12 ändert in Welle 1 den Trenner, H-B14 in Welle 2 die Strichbreite.

| Kennung | Titel | Ansichten | Wirkung | übergr. | Welle | Bildbezug |
|---|---|---|---|---|---|---|
| H-B01 | Listenkarten: Grün nur für Handlung, Zeit zuerst, Familie der vier | Startseite, Veranstaltungen, Nachrichten | hoch | ja | 1 | start 1440 schirm-02/03 („Empfohlen“/„Aktuell“ vollgrün), veranstaltungen 1440 schirm-02 (fünf grüne Knöpfe), nachrichten 1440 schirm-02, start 390 schirm-05 |
| H-B02 | Gebetszeit-Bausteine: Tagesbogen und Leiste | Startseite, Gebetszeiten, alle mit Leiste | hoch | ja | 1 | momente/b06-l1-2…5, start 1440/768 schirm-01 (23:16 ohne Marke, Labels kleben), gegenpruef-start/start-1240, -1280, tr-1440 |
| H-B03 | Detailseiten im Seitenkopf-Muster, offene Abschnitte, ehrliche Bedienelemente | Veranstaltungsdetail, Nachrichtendetail | hoch | ja | 2 | veranstaltungen_freitagsgebet…/1440 schirm-01/02, 390 schirm-01–03; nachrichten_neue-gebetszeiten…/1440 schirm-01/02 |
| H-B04 | Listenansichten: Aufmacher und Trefferzahl | Veranstaltungen, Nachrichten | hoch | ja | 2 | nachrichten/1440 schirm-01–03, 390 schirm-02/03; veranstaltungen/1440 schirm-01–03 |
| H-B05 | Verwaltungs-Hülle: eine Kopfzeile, Band, geordnete Seitenleiste | Verwaltung, Postfach, Veranstaltungen, Startklar | hoch | ja | 1 | HEAD-verwaltung/*-390 (h1 erst bei ≈395 px), *-1440 (doppelter Kopf, „0“-Pillen) |
| H-B06 | Verwaltungs-Arbeitsansichten: Kopf, Kennzahlen, Postfach, Telefonliste, Cockpit | Verwaltung, Postfach, Veranstaltungen, Startklar | hoch | ja | 2 | verwaltung-1440/390, postfach-1440/390, veranstaltungen-390, startklar-1440 |
| H-B07 | Formulare: Voranmeldung auf der Seitenachse, kompakte Schritte, Brotkrumen | Voranmeldung (FormWizard und Brotkrumen überall) | hoch | ja | 2 | bildung_voranmeldung/1440 schirm-01/02, 390 schirm-01–03; kontakt/1440 schirm-03 (Einwilligung) |
| H-B08 | Startseite: Tagesbogen im ersten Bildschirm, Formsystem, volle Raster | Startseite | hoch | nein | 1 | start/390 schirm-01 (Bogen bei y≈780), 768 schirm-02/03 (leere Zelle), 1440 schirm-01–03 |
| H-B09 | Gebetszeiten: Takt des Tages statt sechs Kästen | Gebetszeiten | hoch | nein | 2 | gebetszeiten/1440 schirm-01/02 (leere Kartenböden), 390 schirm-01–03 |
| H-B10 | Kontakt: Formular zuerst, eine Kopf-Hierarchie, ehrliche Elemente | Kontakt (+ Telefon im Fuß) | hoch | nein | 1 | kontakt/390 schirm-01–05 (Formular erst schirm-05), 1440 schirm-01–03 |
| H-B11 | Projekte: Meilensteine im Formsystem, ein Spendenabschluss | Projekte | hoch | nein | 1 | projekte/1440 schirm-02–04 (Amber „Geplant“, Loch, leeres Drittel), 390 schirm-03–05 |
| H-B12 | Über uns: Weg der Gemeinde als Spalte mit Achtstern-Marken | Über uns | hoch | nein | 1 | momente/b07-l1-1…5, ueber-uns/1440 schirm-02–05 |
| H-B13 | Organisationsseite: Familie der vier als Blickfang | Organisationsseite | hoch | nein | 2 | organisationen_ana-teskilati/390 schirm-01, momente/b09-l1-*, 1440 schirm-01–03 |
| H-B14 | Korankurse und Fehlerseite | Korankurse, 404 | mittel | nein | 2 | bildung_korankurse/1440 schirm-02/03, 390 schirm-02/03; gibt-es-nicht/1440 schirm-01/02 |

Kern je Paket (Einzelheiten in `pakete`):
- **H-B01:**
  - „Details ansehen“ wird ein Textlink, die ganze Karte ist klickbar; „Anmelden“ bleibt primär.
  - „Empfohlen“ und „Aktuell“ werden weiße Pillen mit grünem Rand. „Ankündigung“ wird Info-Blau.
  - Grüne Terminzeile über jedem Veranstaltungstitel, Datum über jedem Nachrichtentitel. Org-Kante in den Listenkarten.
  - Neue Variante `aufmacher` (Abnehmer H-B04).
  - Behebt in NewsCard die freien Werte und `transition-colors`.
- **H-B02:**
  - Achtstern am Imsak-Punkt auch nach Isha.
  - Punkte färben sich erst, wenn die Linie sie erreicht.
  - Zeitenliste in zwei Ebenen (Imsak und Isha tiefer), so bleibt die Zuordnung zu den Punkten.
  - Prop `ruhig` für die Gebetszeiten-Seite.
  - Leiste: Bezeichnung und Wert gestapelt (Wert 20 px), Symbol erst ab xl, damit kein Gebetsname mitten im Wort bricht.
- **H-B03:**
  - Seitenkopf bekommt `oben`, `titelId`, `titelLang`, `titelStil` und `untertitelLang`.
  - Beide Detailköpfe stehen auf Sand mit Org-Kante bzw. Achtstern-Band. Die Faktenzeile ersetzt die Kacheln, die Belegung erscheint einmal.
  - Die Abschnitte stehen offen, das Programm wird eine Zeitleiste mit Achtsternen.
  - Rückweg und Brotkrumen führen zur Liste.
  - „Merken“ heißt „In den Kalender“. Die Attrappen „Speichern“ und „Gefällt mir“ entfallen.
  - Der Autor erscheint einmal, ähnliche Artikel als kompakte Karten.
- **H-B04:**
  - Aufmacher und Liste bei „Alle“; mit Filter bleibt ein einheitliches Raster (`kinderGefiltert`).
  - Die Trefferzahl mit `aria-live` ersetzt die Trichter-Attrappe.
  - Die Brotkrume heißt „Nachrichten“.
- **H-B05:**
  - Mobil einzeilige Kopfzeile mit Konto- und Menüsymbol.
  - Der Titel „Admin Dashboard“ entfällt, „Dashboard“ heißt „Übersicht“.
  - Achtstern-Band unter der Kopfzeile.
  - Drei Gruppen in der Seitenleiste; Zähler nur über 0.
  - Die Seitenleiste ist ein eigener Scrollbereich und nie höher als der Bildschirm.
- **H-B06:**
  - Baustein `VerwaltungsKopf` mit Achtstern-Kennung für alle Köpfe.
  - h3 in der Textschrift.
  - B-11 an der Erfolgsmeldung.
  - Die Kennzahlen sind gewichtet, auf dem Telefon als Liste.
  - Postfach-Leerzustand nach Muster.
  - Veranstaltungsliste auf dem Telefon als Karten, Org-Pille, nur eine Statuspille.
  - Statuskanten im Cockpit.
- **H-B07:**
  - FormWizard `anordnung=seitenleiste`: Schrittleiste auf 1/3, Formular auf 2/3.
  - Unter lg nur eine Balkenreihe, Knöpfe in voller Breite.
  - Schrittmarken als Achtstern, Häkchen von lucide statt „✓“.
  - Optionskarten einspaltig. `max-w-text` an Einwilligung und Hinweisen.
  - Brotkrumen mobil einzeilig, das Zwischenglied in Tinte-2.
- **H-B08:**
  - Hero-DOM in der Reihenfolge Kopf → Bogen → Rest; ab lg bleibt das Bild gleich.
  - Drei Kennungen mit Stern8, Band an der Hero-Kante.
  - Bei ungerader Zahl wird die erste Karte bei 768 zum Aufmacher.
  - Knöpfe mit `transition`, Pfeil statt zweitem Personen-Icon.
- **H-B09:**
  - Ruhiger Tagesbogen neben der Tafel.
  - Tafel ohne Reservezeile, vergangene Zeiten in Tinte-2.
  - Hero in drei Stufen mit B-10.
  - Standort als Textzeile, „Vollbild“ mobil am Seitenende. Qibla und Koordinaten verlassen den Hero.
- **H-B10:**
  - Das Formular steht auf 2/3, die Begleitkarten auf 1/3; auf dem Telefon folgt das Formular direkt nach den Kontaktdaten.
  - Zwei Überschriftenstufen.
  - Die Öffnungszeiten sind nicht mehr grün umrandet.
  - Kartenplatzhalter wie die Fotoplatzhalter.
  - Ehrliche Pillen, Globus statt Extern-Symbol.
  - `telefonHref`: anrufbare Nummern auf Kontakt und im Fuß.
- **H-B11:**
  - Nächster Meilenstein als gefüllter Achtstern, auf Linie und Karte.
  - „Geplant“ und „In Planung“ gestrichelt grau statt in Warnfarbe.
  - Kennung „Baufortschritt“.
  - Fakten im Kopf, ein dunkler Abschluss mit Spendenkarte.
  - Der Fokus im Band ist sichtbar (`outline-weiss`).
- **H-B12:**
  - Wegmarken als gefüllte Achtsterne, Linie 4 px vollgrün.
  - Kopf links (sticky), Weg auf 2/3, Marke auf Höhe der Jahres-Pille.
  - Werte als Liste mit Kopflinie.
  - Kennungen über den Abschnitten.
  - Der Trenner wird ein grüner Achtstern.
- **H-B13:**
  - Stern mit beschnittener viewBox: mobil 96 px sichtbar statt 45 px.
  - Weiße Unterlage unter den Tönungen.
  - Aktivitäten als Liste mit Org-Kopflinie, Kennungen.
  - Fernrohr statt Fünfzack.
  - Über-Text ohne Karte, Termintitel als Links.
- **H-B14:**
  - Korankurse: Display-Überschriften ohne Icon, unterer Block offen, Achtstern-Listenpunkte, ein Häkchen-Stil, Kennung „Bildung“, sauberer E-Mail-Link.
  - 404: grüner Knopf plus fünf Wege zurück, Layout auf der Seitenachse, Grafik 144 px mit 2-px-Strich, kein `tritt-auf` beim Laden.

**Entscheidungen der Zusammenführung** (wo sich Gegenprüfungen widersprachen):
1. Status-Pillen werden **Umriss** (Gegenprüfung start), nicht Textkennung (arbeit-a). Direkt darunter steht künftig die grüne Termin-Kennzeile, und zwei grüne Fettzeilen übereinander lesen sich schlecht. Die Tönung `gruen-50` gleicht der Kategorie „Neuigkeiten“.
2. Kennungen nutzen überall **Stern8**: Startseite nach H-B08 und REFERENZ §2, Seitenköpfe, Verwaltung, Erzählansichten. Die Gegenprüfung erzaehl hatte lucide-Symbole vorgeschlagen, weil die Referenz damals keinen Achtstern trug. Mit H-B08 ändert sich das; die Kennungstexte der Gegenprüfung bleiben.
3. Den Info-Ton bei `AehnlicheArtikel` erledigt H-B03 mit: Das TOENUNG-Duplikat entfällt, weil dort die kompakte NewsCard eingesetzt wird.
4. Telefon-Hilfsfunktion: H-B10 legt sie in Welle 1 an. H-B03 (Veranstaltungsdetail) und H-B14 (AnmeldeKarte) übernehmen sie in Welle 2.

**Für den Orchestrator (gemeinsame Dateien):**
- *Vor Welle 1*, in `globals.css`:
  - `@utility raster-begleitspalte { grid-template-rows: auto 1fr; }` (H-B10).
  - `.bogen-punkt-erreicht { transition-delay: calc(var(--anteil)*var(--anteil)*var(--anteil)*var(--dauer-moment)); }` und im Block für reduzierte Bewegung `transition-delay: 0s` (H-B02).
  - Die Zeile `auftritt` in `.seite` entfernen.
- *Nach Bedarf* eine Druck-Ausnahme für weiße Zeichen auf Achtstern-Marken (H-B11, H-B12; erst nach druck.mjs).
- *Messages*, tr/en als Entwurf in `neu-uebersetzt.json`:
  - H-B03: `nachricht.zurueckListe`, `veranstaltung.merken`.
  - H-B05: Gruppen und „Übersicht“, nur de.
  - H-B11: `meilensteinKennung`, „Jetzt spenden“, h1 in deutscher Schreibung.
  - H-B12: drei Kennungen, Gedankenstrich, „Zum Vorstand“, dazu der Strich im Seed `drizzle/seeds/bereiche/ueber-uns.ts`.
  - H-B13: zwei Kennungen.
  - H-B14: „E-Mail:“ bzw. „E-posta:“.
- *Werkstatt-Dateien:*
  - REFERENZ §1 und §2 (52ch, Kennung + Stern8).
  - KERN K-007 B-09: Registertext („kreisförmige Maske“ → Skalierung aus der Mitte).
  - K-007 B-05: „Organisation“ im Register; OrgCard hat keinen Morph. Entweder umsetzen oder streichen.
  - MENSCHEN.md: TV-01 (Floskeln Startseite, fehlt dort noch) und eine OFFENE FRAGE zu Merkliste und „Gefällt mir“. ML-05 (Meilensteine) steht schon dort.
  - TEXTVORSCHLAEGE:
    - Untertitel der Veranstaltungen ohne „Events“
    - Satz auf der 404
    - „spirituelle Reise“
    - Stationstitel ohne Doppelung
    - optional „Nachrichten“ statt „Neuigkeiten“ im Menü

## 4. Verworfen
- arbeit-a **Filter mobil in einer Zeile:** Die Wischleiste versteckt Kategorien jenseits des Rands, was Ältere schwer entdecken (K-002), und spart nur ≈110 px.
- arbeit-a **Achtstern-Band lesbar machen:** Die Geometrie stimmt. Bei 8 % Deckkraft (Obergrenze nach K-008) bleibt das Band auch mit 20 px ein Fleck. Der Gewinn ist unsicher, die Datei gemeinsam.
- arbeit-b **Korankurse: Hinweis ohne blaue Fläche:** Info-Blau trägt hier die Bedeutung (gleiche Werte wie `info`). Beide Alternativen schwächen den Hinweis.
- arbeit-b **404: Statusfläche auf Papier:** doppelt, geht in H-B14 auf.
- erzaehl (zusätzlich) **„Projektspezifikationen“ läuft ins Polster:** entfällt mit H-B11, weil die Überschrift wegfällt; nur nötig, wenn H-B11 nicht kommt.
- start **Status-Pillen als Tönung mit Stern8** (Urfassung): Die Tönung gleicht einer Kategorie. Ersetzt durch den Umriss in H-B01.
- Teilverwerfungen, die die Gegenprüfungen schon gestrichen haben:
  - Liste mit „morgen“ im Bogen
  - einzeilige Leiste
  - Spanne bei 6 Karten
  - grüne Datumszeile bei Nachrichten
  - Tafel nur unter sm
  - Trenner und mobile Umordnung im Veranstaltungsdetail
  - `anzeige-96`
  - Datumsüberschrift über der Tafel
  - „Gefällt mir“ als Aktionszeile
  - Kontakt-sticky
  - zusätzliche Kennungen auf Kontakt und Korankurse
  - Gruppenlabel `sr-only`
  - neutrale Notfallkarte
  - gestrichelte Zukunft auf Über uns
  - Umzug und Kürzel-Legende der Familie der vier
  - `star` → `Award`
  - globale h3-Regel und CSS-Stapeltabelle in der Verwaltung
  - B-04 beim Wechsel Aktuell/Papierkorb
  - Löschen-Rot nur bei Hover

## 5. Verstöße gegen Kern, Religion und UNANTASTBAR
- **Religion und UNANTASTBAR: kein Verstoß** in allen fünf Gruppen.
  - Logos bleiben unvergrößert (24, 28 und 40 px).
  - Das Achtstern-Band liegt nur an Kanten, mit 8 % Deckkraft, nie hinter Text.
  - Keine Verse und keine Kalligrafie.
  - Gebetszeiten, Quelle und der Hinweis „berechnet“ sind unverändert.
  - Cockpit-Prüfungen, Einwilligungs- und Rechtswortlaut bleiben unberührt; alle Pakete ändern nur die Darstellung.
- **Z-03/K-005, hart, freie Werte:**
  - NewsCard `max-w-[62ch]`, `h-[180px]` → H-B01.
  - Verwaltungstabelle `min-w-[56rem]` → H-B06.
  - Tailwind-Standardwerte statt Tokens: `max-w-5xl` (Voranmeldung) → H-B07, `max-w-3xl` (Cockpit) → H-B06.
- **K-005, Fokus, hart:** unsichtbarer Fokus im Band „Unterstützen Sie uns“ (projekte 1440 schirm-04) → H-B11.
- **K-007:**
  - B-01: `transition-colors` an den Knöpfen der Startseite und am Aufmacher-Knopf; Spenden-Knöpfe ohne Rückmeldung → H-B08, H-B01, H-B11.
  - B-05: `auftritt` am Inhalt; Organisation steht im Register, ist aber ohne Morph → Orchestrator.
  - B-06: kein Abschluss nach Isha, Punkte färben sich vor der Linie → H-B02.
  - B-09: Registertext weicht von der Umsetzung ab → KERN-Pflege.
  - REFERENZ §3: 404 mit `tritt-auf` beim ersten Laden → H-B14.
- **K-006, Display nur h1/h2:**
  - Prüftitel im Cockpit → H-B06; Werte-h3 → H-B12.
  - Auslegungsfrage: Kartentitel (Org-Karten, EventCard, NewsCard) stehen auch auf der Referenz in Display. Der Orchestrator entscheidet, ob K-006 Kartentitel ausnimmt.
- **K-003 Nr. 5 (Lesemaß):** Token erledigt. Offen sind Kontakt-Einwilligung (→ H-B07) und Postfach-Einleitung (→ H-B06).
- **K-003 Nr. 6 (gestapelter Desktop):** Kontakt → H-B10, Gebetszeiten → H-B09, Listen → H-B04, Verwaltungsliste → H-B06.
- **K-003 Nr. 4/K-005 (Farbe ohne Bedeutung):**
  - Warnfarbe für „Geplant“, grüner Rand mit Doppelbedeutung → H-B11.
  - Vollgrüne Status-Pillen → H-B01.
- **K-008 (eine Zeichenfamilie):** Textzeichen „✓“ im FormWizard → H-B07; fünfzackiger Stern bei „Vision“ → H-B13.
- **K-009:**
  - Schein-Bedienelemente:
    - Standort-Box → H-B09
    - Trichter-Labels → H-B04
    - Attrappen „Speichern“ und „Gefällt mir“ → H-B03
    - weiße Pillen auf Kontakt → H-B10
  - Leerzustand ohne Grafik im Postfach → H-B06.
  - 404 ohne Wege zurück → H-B14.
  - Touch-Ziel 44 px auf dem Telefon in der Verwaltung → H-B06.
  - „Merken“ lädt eine .ics-Datei → H-B03.
- **K-010 (Ton):**
  - „Entdecken Sie …“ (2×) und „Bleiben Sie informiert“ auf der Referenz. TV-01 wartet auf Menschen und gehört nach MENSCHEN.md.
  - „spirituelle Reise“ → TEXTVORSCHLAEGE.
  - „Jetzt Spenden“ und die h1 in englischer Großschreibung → H-B11.
  - „Mehr erfahren“ führt zu /vorstand → H-B12.
  - „Admin Dashboard“ und „Dashboard“ → H-B05.
