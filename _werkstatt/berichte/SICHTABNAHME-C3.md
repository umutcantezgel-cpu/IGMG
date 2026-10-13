# SICHTABNAHME C3: Zusammenführung

Grundlage: fünf unabhängige Sichtprüfer (start, arbeit-a, arbeit-b, erzaehl, verwaltung) mit je einer adversarialen Gegenprüfung. Eingeordnet nach REFERENZ.md und KERN K-007. Repo-Stand: `claude/blissful-edison-x3j16w` @ 4b9d9cf.

Bildpfade:
- öffentliche Ansichten relativ zu `c3/bildsatz/…` (`$S/bilder/c3`), reduziert unter `c3/bildsatz-reduziert/…`
- Momente unter `c3/momente/…`, Seitenwechsel unter `c3/seitenwechsel/…`
- Verwaltung unter `_werkstatt/bilder/C3-verwaltung/*.jpg`

Alle Schreibrechte sind mit Glob gegen das Dateisystem geprüft. Neu entsteht nur `web/src/components/verwaltung/startklar/kennung.tsx` (H-F10).

## 1. Werte je Ansicht (aus den Urteilen, unverändert)

| Ansicht | Typo | Komp. | Farbe/Bild | Beweg. | Grafik | Details | **Wert C3** | C2 | Δ |
|---|---|---|---|---|---|---|---|---|---|
| Startseite (Referenz) | 8 | 7 | 8 | 8 | 8 | 7 | **7,7** | 7,7 | ±0 |
| Gebetszeiten | 8 | 7 | 8 | 8 | 8 | 7 | **7,7** | 7,8 | −0,1 |
| Veranstaltungen | 8 | 7 | 8 | 8 | 8 | 8 | **7,8** | 8,0 | −0,2 |
| Veranstaltungsdetail | 8 | 7 | 8 | 7 | 8 | 7 | **7,5** | 8,0 | −0,5 |
| Nachrichten | 7 | 7 | 8 | 8 | 7 | 7 | **7,3** | 7,8 | −0,5 |
| Nachrichtendetail | 8 | 7 | 8 | 7 | 8 | 7 | **7,5** | 7,8 | −0,3 |
| Korankurse | 8 | 7 | 7 | 8 | 8 | 7 | **7,5** | 7,3 | +0,2 |
| Schüler-Voranmeldung | 8 | 8 | 8 | 8 | 8 | 8 | **8,0** | 7,7 | +0,3 |
| Kontakt | 8 | 7 | 7 | 8 | 7 | 7 | **7,3** | 7,1 | +0,2 |
| 404 (gibt-es-nicht) | 8 | 7 | 8 | 8 | 8 | 8 | **7,8** | 7,5 | +0,3 |
| Über uns | 8 | 7 | 7 | 8 | 8 | 7 | **7,5** | 7,7 | −0,2 |
| Projekte | 7 | 8 | 7 | 8 | 8 | 7 | **7,5** | 7,2 | +0,3 |
| Organisationsseite | 8 | 7 | 8 | 8 | 8 | 7 | **7,7** | 7,2 | +0,5 |
| Verwaltung (Übersicht) | 8 | 7 | 8 | 8 | 8 | 7,5 | **7,8** | 7,0 | +0,8 |
| Postfach | 8 | 8 | 8 | 8 | 8 | 7,5 | **7,9** | 7,8 | +0,1 |
| Verwaltung Veranstaltungen | 7,5 | 8 | 8 | 8 | 8 | 7,5 | **7,8** | 7,0 | +0,8 |
| Startklar-Cockpit | 7,5 | 7,5 | 8 | 8 | 8 | 7,5 | **7,8** | 7,3 | +0,5 |

**Gesamtmittel aller 17 Ansichten: 7,65** (C2: 7,52, also +0,13).
- Die 12 Hauptansichten nach K-009 liegen bei **7,63** (C2: 7,57).
- Mittel je Kategorie: Bewegung 7,88 · Grafik 7,88 · Typografie 7,82 · Farbe/Bild 7,76 · Details 7,29 · Komposition 7,26.
  - C2 zum Vergleich: Bewegung 7,97 · Grafik 7,50 · Typografie 7,59 · Farbe/Bild 7,65 · Details 7,09 · Komposition 7,32.
  - Komposition und Details halten die Werte weiter unter 8.
- **Erstmals liegt keine Kategorie unter 7.** In C2 lagen dort noch sechs Werte: Kontakt Grafik 6,5, Organisationsseite Komposition 6, Verwaltung Komposition und Details je 6, Verwaltung Veranstaltungen Details 6, Startklar Details 6.
- Bei 8 steht nur **Schüler-Voranmeldung**. Veranstaltungen und Veranstaltungsdetail sind von 8,0 gefallen.
- **Gewinne** stammen aus Welle H-E:
  - Verwaltung (Übersicht) und Verwaltung Veranstaltungen je +0,8 (H-E02)
  - Organisationsseite +0,5 (H-E05), Startklar +0,5
  - Projekte +0,3 (H-E04), 404 +0,3 (H-E12), Voranmeldung +0,3 (H-E10)
  - Korankurse und Kontakt je +0,2 (H-E11, H-E03)
- **Rückgänge** in der Gruppe arbeit-a (−0,1 bis −0,5) und bei Über uns (−0,2) sind keine Bildregression. Jeder Prüfer nennt im Vergleich mit dem Vorstand nur Verbesserungen. Die Abzüge kommen aus neuen Blickwinkeln:
  - Die Zeitlupe B-05 ist jetzt in Bewegung gewertet (beide Detailseiten 7).
  - Die mobile Reihenfolge des Veranstaltungsdetails wurde im Zustand „vergangen“ geurteilt. Die Gegenprüfung hat das widerlegt (→ H-F02).
  - Nachrichten: Aufmacher-Stufe und Archivraster.
  - Über uns: dunkles Seitenende und leere Stationskarten.
- Das Bild `nachrichten_neue-gebetszeiten-fuer-den-winter/1440x900/schirm-03.jpg` ist ein Rest eines früheren Laufs (07:00 UTC). Bewertet wurden nur schirm-01/02.

Was in C3 wiederkehrt:
- **Dunkler Abschlussblock direkt über dem dunklen Fuß**: Korankurse, Über uns, Projekte. Daraus kommen drei der vier Farbe/Bild-Werte von 7 → H-F01.
- **Ordnung hängt an der Textlänge**:
  - Terminkarten auf dem Telefon
  - Kurszeiten „13:00–“ / „15:00 Uhr“
  - Angebote in Drittelspalten
  - Ära und Ort der Stationen
  - → H-F07
- **Seitenwechsel**: Der Titel-Morph liegt über dem schon einblendenden Zielinhalt (H-E14 nur halb erfüllt) → H-F08.
- **Neuigkeiten-Bausteine**:
  - Der Aufmacher ist nicht als ganze Karte klickbar.
  - Die Lesezeit trägt die Uhr.
  - Die Aufmacher-Stufe auf /nachrichten ist schwach.
  - Die Startseite zeigt Karte an Karte.
  - → H-F03
- **Verwaltung**: grüner Kontoknopf, Kastenstapel, Datumszelle mit Komma, Cockpit-Kopf → H-F05, H-F09 bis H-F11.
- **Lücken in der Komposition, die an Entscheidungen hängen** (verworfen, siehe §3):
  - Leiste und Bogen doppelt auf der Startseite (L-E04)
  - Filterpillen dreizeilig
  - leere Mitte im Gebetszeiten-Kopf
  - rechte Kopfhälfte leer auf Über uns und Projekte

## 2. Endgültige Befundpakete

**Wellenplan:**
- **Welle 1** (7 Pakete): H-F01 … H-F07. Darin alle Pakete mit Wirkung hoch und die übergreifenden mittleren Pakete ohne Abhängigkeit.
- **Welle 2** (6 Pakete): H-F08 … H-F13.
  - H-F08 folgt nach H-F03, weil H-F03 die Morph-Quelle (Nachrichten-Aufmacher) umbaut. Die Zeitlupe wird danach aufgenommen.
  - Die Verwaltungspakete H-F09 bis H-F11 werden mit einem gemeinsamen Bildlauf (`verwaltung-bilder.mjs`) abgenommen.
- Die Schreibrechte sind innerhalb jeder Welle disjunkt, und keine Datei liegt in beiden Wellen. Je Welle arbeiten bis zu vier Baumeister parallel.
- **Vorbedingungen** (Orchestrator):
  - vor Welle 1: Entscheidung „Abschlussblock vor dem Fuß hell“ (H-F01)
  - vor Welle 2: Registervermerk B-05 und die Regel in `globals.css` (H-F08)

| Kennung | Titel | Ansichten | Wirkung | übergr. | Welle | Bildbezug |
|---|---|---|---|---|---|---|
| H-F01 | Seitenende: Abschlussblock vor dem Fuß hell (Tönung + Band) | Über uns, Projekte, Korankurse | hoch | ja | 1 | ueber-uns/1440 schirm-05, 390 schirm-08 (≈ 70/40 px Papier zwischen Aufruf und Fuß); projekte/1440 schirm-03/04, 390 schirm-05 (≈ 25 Zeilen Weiß auf Tiefgrün); bildung_korankurse/1440 schirm-03 (≈ 72 px), 390 schirm-06 |
| H-F02 | Veranstaltungsdetail: Anmeldung „offen“ nachweisen, „Route anzeigen“ zur Anfahrt | Veranstaltungsdetail | hoch | nein | 1 | veranstaltungen_freitagsgebet-…/1440 schirm-01, 390 schirm-02/03 (nur „Vergangen“, „Anmeldung geschlossen“; Link nach /kontakt oben); seitenwechsel/veranstaltung (Sprachkurs ohne Anmeldung) |
| H-F03 | Neuigkeiten-Bausteine: Aufmacher als ganze Karte, Lesezeit mit Buch, Aufmacher-Stufe auf /nachrichten, Startseiten-Liste als eine Fläche | Startseite, Nachrichten, Nachrichtendetail | mittel | ja | 1 | start/1440 schirm-03 (drei schwebende Kompaktkarten), 768 schirm-04, 390 schirm-05; nachrichten/1440 schirm-02 (Titel 30 px, gefüllter Knopf), 390 schirm-03 („⏱ 1 Min.“); nachrichten_neue-…/1440 schirm-01 (Uhr neben „10:00 Uhr“) |
| H-F04 | Tagesbogen ohne Knick am Horizont | Startseite, Gebetszeiten | mittel | ja | 1 | start/1440, 768, 390 schirm-01 (Ecke bei Aufgang 07:37 und Maghrib 18:48); momente/b06-l1-1 und -4 |
| H-F05 | Verwaltung: Kontoknopf als neutraler Werkzeugknopf | Übersicht, Postfach, Veranstaltungen, Startklar | mittel | ja | 1 | C3-verwaltung/*-390 (mintgrün neben weißem Menüknopf), *-1440 (x 1191–1415) |
| H-F06 | Zierde im Telefonkopf: Familie der vier mit 128 px und Kürzeln, 404-Grafik an der Textkante | Organisationsseite (alle vier), 404 | mittel | ja | 1 | organisationen_ana-teskilati/390 schirm-01, momente/b09-l1-5 (≈ 92 px ohne Kürzel); gibt-es-nicht/390 schirm-01 (Grafik allein rechts, ≈ 240 × 120 px leer) |
| H-F07 | Feste Ordnung statt Umbruch nach Textlänge | Startseite, Korankurse, Kontakt, Über uns | mittel | ja | 1 | start/390 schirm-02/03; bildung_korankurse/390 schirm-02/03, 768 schirm-02; kontakt/1440 schirm-03; ueber-uns reduziert 1440 schirm-03, 390 schirm-04/05 |
| H-F08 | Seitenwechsel B-05: Zielinhalt erst nach Titel und Bild | Veranstaltungsdetail, Nachrichtendetail, Organisationsseite | mittel | ja | 2 | seitenwechsel/nachricht/zeitlupe-03 (177 ms: Titel über „Wichtig“, Datum, Lesezeit; Bild über „Teilen“); seitenwechsel/veranstaltung/zeitlupe-03 (187 ms: Titel über „Bildung“) |
| H-F09 | Verwaltung: Kennzahlen in einem Rahmen, Fokus in geschnittenen Listen nach innen | Verwaltung (Übersicht), Postfach | mittel | ja | 2 | C3-verwaltung/verwaltung-1440 (y 267–600: sechs Karten, neun Rahmen); Nachstellung `$S/gp-c3v/clip-erste.png`, `clip-zweite.png` (Fokus abgeschnitten), `clip-inset.png` (Lösung) |
| H-F10 | Startklar-Cockpit: Statuskopf als Siegel, Zähler als Chips, Kennungen als Code | Startklar-Cockpit | mittel | nein | 2 | C3-verwaltung/startklar-390 (Stern allein y 445–513, Zählerkasten y 690–930); startklar-1440 (h1 und Statustitel je ≈ 40 px; y 767–846 DATABASE_URL in Sans) |
| H-F11 | Verwaltung Veranstaltungen: Terminzeile gestapelt in der Tabelle | Verwaltung Veranstaltungen | mittel | nein | 2 | C3-verwaltung/veranstaltungen-1440 (x 660–900 „Di., 13. Okt. 2026,“); veranstaltungen-390 als Vorbild |
| H-F12 | Projekte: Projektname als Abschnittstitel | Projekte | gering | nein | 2 | projekte/1440 schirm-01 („Projektbeschreibung“ als 40-px-Titel), 390 schirm-02 |
| H-F13 | Organisationsseite: Termin-Leerzustand wie Nachrichten-Leerzustand | Organisationsseite | gering | nein | 2 | organisationen_ana-teskilati/1440 schirm-03 (Nachrichten-Leerzustand mit Grafik; der Termin-Zweig hat im Code keine) |

**Kern je Paket** (Einzelheiten in `pakete`):

**H-F01**
- Fläche `bg-gruen-50` mit einem 6-px-Band in `gruen-700`. Das Band ist nie eine Rasterzelle.
- Text in Tinte, genau ein grün gefüllter Primärknopf je Block.
- Fokus global; unter sm sind die Knöpfe gleich breit.
- Spenden.tsx bleibt unverändert.

**H-F02**
- Link auf `{ pathname: '/kontakt', hash: 'karte' }`.
- Nachweis der Zustände „offen“ und „ausgebucht“ in der lokalen Prüf-DB, ohne Seeds oder Stammdaten zu ändern.

**H-F03**
- „gross“ bekommt den Hover der Standardkarte und einen Textlink mit `after:inset-0`.
- Neue Prop `titelStufe="abschnitt"`, nur auf /nachrichten. Auf der Startseite bleibt der Titel bei 30 px.
- `BookOpen` statt `Clock`.
- Die Startseite übernimmt die Bauweise der Liste von /nachrichten (`rahmen={false}`).

**H-F04**
- Unter dem Horizont `tief · tanh(e · hoch / tief)`. x-Lagen und Zeiten bleiben unverändert.
- Neuer Test für die gleiche Steigung.

**H-F05**
- `border-rand bg-weiss text-tinte`, mit `aria-expanded:` grün umrandet.
- Der Menüknopf bekommt `hover:border-gruen-700`.

**H-F06**
- `size-32`, Kürzel unter md und ab lg (768–1023 ohne).
- In Seitenkopf `md:ml-auto`, wenn kein Logo davorsteht.

**H-F07**
- EventCard: nur `!listenArt` unter md wird gestapelt.
- CourseCard: lokale Funktion `ZeitenText` mit `whitespace-nowrap` je Zeitspanne.
- Angebote: `xl:grid-cols-3` fällt weg.
- Zeitleiste: Ära, Titel, Ort, und der Ort steht ab md mit `md:mt-auto` unten.

**H-F08**
- `data-uebergang="morph"` am Wurzelelement nur beim Wechsel Karte → Detail.
- Der Orchestrator setzt die Verzögerung `dauer-wechsel` in `globals.css`.

**H-F09**
- Rahmen am section, Innenlinien je li mit `-mt-px -ml-px`.
- Fokus mit `-outline-offset-4`, auch in der Telefonliste und den Postfach-Links.

**H-F10**
- Unter md `max-md:contents`, h2 `text-30` mit `flex-1`, Zähler als Chips.
- Server-Hilfe `mitKennungen` für Meldung, Ort und Fußnote.

**H-F11**
- Gleiche Glieder wie die Telefonkarte, in der Tabelle als `flex-col`. Das Komma entfällt.

**H-F12**
- `<Text feld={p.name}>` als h2. Das Etikett zeigt nur den Ort. Der Schlüssel bleibt.

**H-F13**
- Termin-Leerzweig mit `Zustandsgrafik` 48 px, gleich gebaut wie der Nachrichten-Leerzweig.

**Entscheidungen der Zusammenführung:**
1. **Seitenende**: arbeit-b „Anmeldekarte hell“ wurde als Einzelpaket verworfen, mit dem Satz „nur als übergreifende Entscheidung“. Die erzaehl-Gegenprüfung hat „Seitenende-Aufruf hell“ geändert. Zusammengeführt ergibt das H-F01 als eine Regel für alle drei Blöcke direkt vor dem Fuß.
   - Die C2-Teilverwerfung begründete die dunkle AnmeldeKarte mit den dunklen Aufrufen auf Über uns und Projekte (H-C07). Werden diese hell, fällt der Grund weg. Als Vorbild dient H-E03 (Kontakt).
   - Die weiteren dunklen Flächen, die die Gegenprüfung nennt, stehen nicht vor dem Fuß und bleiben dunkel:
     - GebetszeitenSeite Z. 111 ist die Karte „Nächstes Gebet“ oben.
     - Mitglied werden „Haben Sie Fragen?“ steht in der Seitenspalte, danach folgt eine Fotokarte (mitglied-werden/390 schirm-04).
     - Die IGMG-Zahlen stehen in einem Tab.
   - erzaehl-Paket 7 (gleich breite Knöpfe) ist in H-F01 enthalten. Der Tausch „Jetzt spenden“ als Primärknopf entfällt.
2. **H-F03**: start „Neuigkeiten-Liste“ und die drei angenommenen NewsCard-Pakete aus arbeit-a sind zusammengelegt. Grund: eine Datei (NewsCard.tsx) und eine gemeinsame Abnahme (start schirm-03 und /nachrichten). Der Kommentar an der Prop `rahmen` wird mitgezogen.
3. **H-F06**: Familie der vier (erzaehl) und 404-Grafik (arbeit-b) hängen beide an der Zierde-Hülle des Seitenkopfs. Getrennt würde die 404-Abnahme „Organisationsseite 390 unverändert“ an der Familie scheitern.
4. **H-F07**: Terminkarten (start), Kurszeiten und Angebote (arbeit-b) sowie Stationskarte (erzaehl) haben dieselbe Ursache: Die Ordnung folgt der Textlänge. Jeder Teil ist klein.
5. **H-F02**: Beide Zusatzfunde der arbeit-a-Gegenprüfung betreffen das Veranstaltungsdetail.
6. **H-F09 und H-F10**:
   - Kennzahlen und der Zusatzfund zum Fokus teilen Kennzahlen.tsx.
   - Cockpit-Kopf und Kennungen teilen startklar/page.tsx.
7. **Ring B-06**: Die Codezeile aus §4 gehört in kein Paket, weil sie nicht gegengeprüft ist. Gibt der Orchestrator sie frei, kommt TagesbogenLive.tsx zu H-F04; die Welle bleibt disjunkt.

**Für den Orchestrator (gemeinsame Dateien und Werkstatt):**

*Vor Welle 1:*
- ENTSCHEIDUNGEN: neue Entscheidung „Abschlussblock vor dem Fuß hell“ mit Denkprotokoll.
  - Sie löst die C2-Teilverwerfung „Seitenende hell“ ab.
  - Regel: Am Seitenende ist der Fuß die einzige tiefgrüne Fläche.
  - Leiste, Karte „Nächstes Gebet“, Fuß und Blöcke, die nicht am Fuß stehen, bleiben dunkel.

*Vor Welle 2:*
- KERN K-007 B-05, Registervermerk: „Mit gemeinsamen Elementen beginnt die Überblendung des Inhalts nach dauer-wechsel; Titel und Bild kommen zuerst an, gesamt 640 ms (C3).“
- `globals.css`, direkt nach `::view-transition-new(.seite)`: `html[data-uebergang='morph']::view-transition-new(.seite) { animation-delay: var(--dauer-wechsel); }` mit Kommentar.
- Ring B-06 entscheiden (§4).

*Nach den Wellen:*
- REFERENZ §2 nachziehen:
  - Seitenende hell
  - Neuigkeiten der Startseite als Liste
  - NewsCard „gross“ als ganze Karte mit Textlink, `titelStufe`, Lesezeit `BookOpen`
  - Seitenwechsel 640 ms, Inhalt nach dem Titel
  - Fokus `-outline-offset-4` in geschnittenen Listen
  - Tagesbogen mit tanh
- messages: `projekte.bezeichnungen.beschreibung` ist dann ungenutzt. Nur listen, nicht löschen.
- TEXTVORSCHLAEGE:
  - `korankurse.anmeldungText` („spirituelle Reise“, K-010) in de, tr und en.
  - Reine Typografie „ - “ → „ – “ in `meldung.untertitel` und `mitglied.hinweisKontakt`.
  - TV-01/ML-18 vor dem Livegang entscheiden, denn die Referenz setzt den Ton.
- Bildsatz-Werkzeug:
  - `nachrichten_neue-…/1440x900/schirm-03.jpg` neu aufnehmen.
  - Browser-Kontext mit `locale: 'de-DE'` starten. „mm/dd/yyyy“ im Datumsfeld der Voranmeldung ist ein en-US-Artefakt.
  - Route mit offener Anmeldung (H-F02) in `routen-*.json` aufnehmen.
  - Zeitlupen B-05 nach H-F08 neu aufnehmen.
  - Die Verwaltung hat weiter keinen reduzierten Bildsatz und nur den ersten Bildschirm.
- Beobachtet, ohne Paket:
  - Der Bild-Morph zeigt in Zeitlupe die Platzhalter-Beschriftung doppelt. Lösungsweg: Klasse `bild` in `morphKlasse` und `::view-transition-old/new(.bild) { block-size: 100%; object-fit: cover }`.
  - „✸ Maghrib“ sitzt optisch links neben seiner Zeit.
  - Der Bogen auf dem Telefon (Gebetszeiten) hat keine Beschriftung, „Vollbild“ steht verwaist am Seitenende.
  - Abschnittsköpfe auf Korankurse und Kontakt ohne Kennung.
  - Die Seitenleiste der Verwaltung ist bei 900 px angeschnitten (hingenommen, K-009).

**Erwartung** (Einschätzung, keine Wertung):
- ≥ 8 erwartet:
  - die vier Verwaltungsansichten (Prüfer)
  - Korankurse, Über uns und Projekte (Farbe/Bild über H-F01, Details über H-F07 und H-F12)
  - wahrscheinlich Organisationsseite und Nachrichtendetail
- Ohne neue Entscheidung bleiben vermutlich unter 8:
  - Startseite: Komposition 7 hängt an L-E04.
  - Gebetszeiten, Veranstaltungen, Nachrichten: Die Hebel für die Komposition sind verworfen.
  - Kontakt: Das Notfallrot ist zweimal entschieden.
- Ob dort 8 verlangt wird, ist eine Entscheidungsfrage. Ein Weg wäre, L-E04 mit den drei Bedingungen der Gegenprüfung fortzuschreiben. Mit einem Befundpaket ist das nicht zu lösen.
- Das Veranstaltungsdetail ist erst nach dem Nachweis aus H-F02 fair bewertbar.

## 3. Verworfen

Ganze Pakete:
- start **Kompakte Leiste auf der Startseite**:
  - widerspricht L-E04 („Doppelung gewollt und klein“)
  - Die Zeile braucht in de ≈ 1360–1460 px bei 1280 px Platz.
  - Die Abnahme bei 768 ist falsch.
  - Die Leistenhöhe spränge bei jedem Seitenwechsel um ≈ 100 px (B-05 „Kopf und Leiste stehen“).
  - Neues Risiko in LeisteLive kurz vor der Endprüfung.
- arbeit-a **Detailseiten mobil: Handlung vor Beiwerk**:
  - am Zustand „vergangen“ geurteilt; bei offener Anmeldung führt „Jetzt anmelden“ im Kopf schon zu `#anmeldung`
  - Die verschobene Autorzeile hebt den ersten Satz nicht über den Falz (≈ 850 > 844 px).
- arbeit-a **Filterpillen als Wischzeile**:
  - spart ≈ 110 px, ohne dass ein Termin in den ersten Schirm kommt
  - versteckt drei bis vier Kategorien hinter dem Rand (K-002)
- arbeit-a **Gebetszeiten-Tabs senkrecht neben der Karte**:
  - Maghrib und Isha bleiben unter dem Falz.
  - Die Tabs steuern das ganze Panel, nicht nur die Karte.
  - Die Ausrichtung je Breakpoint ginge nur per JS.
- arbeit-a **Nachrichtenarchiv nach Monaten**:
  - Der CSS-Filter ließe leere Monatsköpfe stehen.
  - Es zerlegt die Seitenspalte und verletzt die Trennerregel.
  - Das Datum steht schon über dem Titel.
- arbeit-a **Faktenraster 2 × 2**:
  - nur im Zwischenbild belegt; `sm:grid-cols-2` greift nicht
  - Der Kopf würde ≈ 85 px höher, und es gäbe zwei Kopfformen je Datenmenge.
- arbeit-a **Vollbild-Knopf und Info-Abzeichen**:
  - „Vollbild“ ist die Aktion im Seitenkopf, also ein sekundärer Knopf.
  - `info` ist ein Status-Token, auch bei „Nur auf Deutsch“.
- arbeit-b **Anmeldekarte hell als Einzelpaket**: als Einzelpaket verworfen, als Regel in H-F01 aufgegangen (siehe §2).
- arbeit-b **Notfallnummer grün**:
  - zweimal entschieden (H-C06, H-E03)
  - Rot trägt hier Dringlichkeit. Der Eindruck „Fehler“ kommt vom Platzhalter.
- erzaehl **Halbgeviertstrich in Seiteninhalten**:
  - Seeds sind Stammdaten (G-08, TV-04/TV-06).
  - Die genannten messages-Schlüssel sind ungenutzt.

Teilverwerfungen aus den Gegenprüfungen:
- **Terminkarten**: nicht übergreifend, denn die EventCard „start“ gibt es nur auf der Startseite. Nur mit `!listenArt`, Wirkung gering, Höhengrenze ≤ 1.150 px.
- **Tagesbogen**: Die Tests haben keine y-Erwartungen für die Nachtpunkte, deshalb ein neuer Test statt einer Anpassung.
- **B-05**:
  - kein `ease-standard` für alle Wechsel
  - keine View-Transition-Typen (in Chrome 111–124 und Safari 18.0/18.1 würde der Klick verschluckt)
  - stattdessen ein Attribut am Wurzelelement
- **Aufmacher-Stufe**: nur /nachrichten. Startseite (30 px unter dem 40-px-h2) und Veranstaltungs-Aufmacher bleiben.
- **Aufmacher-Handlung**:
  - Die Prämisse „ganz klickbar“ war falsch, heute ist nur der Knopf ein Link.
  - Kein Überzug am skalierenden Knopf, sondern die Klassen der Standardkarte.
- **Angebotsliste**: kein Tausch der Haken gegen den Achtstern (das wäre eine neue Regel ohne Entscheidung), kein `gap-x-8`.
- **Kurszeiten**: Die Hilfsfunktion kommt lokal in CourseCard statt in Text.tsx. Die Abnahme gilt auch bei 768.
- **Familie der vier**:
  - Kürzel bei 768 nicht (die Zierde bräche sonst in eine eigene Zeile)
  - `my-7` statt `my-6`
- **Seitenende hell**:
  - Das Band ist keine Rasterzelle.
  - Die Spendenkarte hat den Rand schon.
  - Unter lg sitzt das Band am Aufruf-Block.
- **Org-Leerzustände**: keine REFERENZ-Karte und kein `mt-auto` (das widerspräche H-E05 (1)). Nur der Termin-Zweig wird angeglichen.
- **Projektname**: Den Schlüssel nicht löschen, sondern als ungenutzt listen.
- **Aufruf-Knöpfe**: „Jetzt spenden“ wird nicht primär. Der Knopf springt nur zum Konto; Kontakt ist Hauptaufgabe 4.
- **Cockpit-Kopf**:
  - `flex-1` am h2, `basis-full` nur unter md
  - Die H-C08-Abnahme wird abgelöst. Wirkung mittel statt hoch.
- **Kennzahlen**:
  - kein `gap-px bg-linie` (graue Restzellen bei 1–6 rollenabhängigen Kacheln)
  - kein Fokus, den overflow-hidden abschneidet
- **Terminzeile Verwaltung**: gestapelt statt flex-wrap, damit die Titelspalte nicht schmaler wird.
- **Kennungen**:
  - Die Hilfe kommt in eine Server-Datei, die Fußnote ist eingeschlossen.
  - Der Wert MAIL_TRANSPORT ist nicht belegt.
  - Wirkung gering.
- **Kontoknopf**: Der Menüknopf bekommt zusätzlich `hover:border-gruen-700`.

## 4. Verstöße gegen Kern, Religion und UNANTASTBAR

**Religion und UNANTASTBAR: kein Verstoß** in allen fünf Gruppen.
- Keine Verse, keine Kalligrafie, kein Gottesname als Schmuck.
- Das Achtstern-Band liegt nur an Kanten, mit höchstens 8 % Deckkraft, nie hinter Text.
- Die Logos stehen mit 20 oder 40 px und sind nie vergrößert.
- „berechnet“ ist sichtbar.
- Rechtstexte, Formularlogik, Datenmodell und Stammdaten sind unberührt.
- H-F04 ändert nur die y-Geometrie der Zeichnung, nicht die Zeiten.
- H-F02 ändert keine Seeds.

**K-007:**
- **B-06, Register gegen Bild:**
  - In b06-l1-1 bis -4 sieht der Ring des nächsten Gebets (Asr) aus wie die übrigen künftigen Ringe. Im Code ist es dieselbe Klasse `border-rand bg-weiss` (TagesbogenLive.tsx).
  - „Durchgehend eine Marke“ ist damit nur dem Wortlaut nach erfüllt.
  - Der Orchestrator entscheidet:
    - (a) bei `ist && !erreicht` den Rand `border-gruen-700` statt `border-rand`. Das ist keine neue Bewegung; die Zeile passt zu H-F04.
    - (b) den Registertext anpassen.
- **B-05**: Der Titel liegt über einblendendem Inhalt → H-F08 mit Registervermerk.
- Sonst ist alles registertreu:
  - Normaler und reduzierter Bildsatz sind gleich.
  - B-07, B-08 und B-09 zeigen den vollen Endzustand.
  - Arbeitsansichten haben keinen Auftritt; der Bogen auf /gebetszeiten läuft `ruhig`.

**K-010:**
- Startseite: „Entdecken Sie …“ (zweimal) und „Bleiben Sie informiert“. Das ist bekannt als TV-01/ML-18 und Sache der Gemeinde. Vor dem Livegang entscheiden.
- Korankurse: „beginnen Sie Ihre spirituelle Reise“ → TEXTVORSCHLAEGE.

**K-001 und K-003:** Die tiefgrüne Abschlussfläche dient als Lesehintergrund (Projekte ≈ 25 Zeilen Weiß auf Tiefgrün) und wirkt wie ein doppelter Fuß → H-F01.

**K-009:** Der Termin-Leerzustand der Organisationsseite hat keine Zustandsgrafik → H-F13.

**Kein Verstoß (zurückgewiesen):** Das Notfallrot auf Kontakt (K-003 Nr. 4) ist bewusst so entschieden (H-C06, H-E03). Die Bedeutung ist doppelt kodiert.

**Nachweislücke:** Hauptaufgabe 2 (offene Anmeldung) kommt in keinem Bild vor, die einzige Beispielveranstaltung mit Anmeldung ist vergangen → H-F02.