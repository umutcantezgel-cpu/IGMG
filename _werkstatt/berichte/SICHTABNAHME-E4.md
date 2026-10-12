# SICHTABNAHME E4 (Build f44119b, Bildsatz E4)

Workflow wf_9df3d301-a41 (`werkzeuge/sichtabnahme.workflow.js`): fünf frische Opus-Sichtprüfer (start, arbeit-a, arbeit-b, erzaehl, verwaltung), je eine Gegenprüfung, Synthese. Rohdaten: `$SCRATCHPAD/sichtabnahme/ergebnis-e4.json`. Paketaufträge: `pakete/H-C/H-C01.md` … `H-C13.md`.

# Sichtabnahme E4: Zusammenführung

Grundlage sind die Urteile der fünf Sichtprüfer (start, arbeit-a, arbeit-b, erzaehl, verwaltung) und ihre Gegenprüfungen, eingeordnet nach REFERENZ.md und KERN K-007. Stand: `claude/blissful-edison-x3j16w` @ 409a579.
Bildpfade sind relativ zum E4-Bildsatz (`e4/bildsatz/…`, Momente `momente/…`, Seitenwechsel `seitenwechsel/…`). Die Verwaltung nutzt `verwaltung-*.jpg`, die Eigenaufnahmen der Gegenprüfung liegen in `scratchpad/gp-verw/*.png`.

## 1. Werte je Ansicht (aus den Urteilen, unverändert)

| Ansicht | Typo | Komp. | Farbe/Bild | Beweg. | Grafik | Details | **Wert E4** | E3 | Δ |
|---|---|---|---|---|---|---|---|---|---|
| Startseite (Referenz) | 7,5 | 7,5 | 8 | 8 | 7,5 | 7,5 | **7,7** | 6,8 | +0,9 |
| Gebetszeiten | 8 | 7 | 8 | 8 | 8 | 7 | **7,7** | 5,8 | +1,9 |
| Veranstaltungen | 7 | 7 | 7 | 8 | 7 | 7 | **7,2** | 6,2 | +1,0 |
| Veranstaltungsdetail | 7 | 6 | 7 | 7 | 8 | 6 | **6,8** | 5,7 | +1,1 |
| Nachrichten | 7 | 7 | 6 | 8 | 7 | 7 | **7,0** | 6,2 | +0,8 |
| Nachrichtendetail | 8 | 6 | 7 | 7 | 7 | 6 | **6,8** | 5,8 | +1,0 |
| Korankurse | 7 | 6 | 7 | 8 | 7 | 6 | **6,8** | 6,3 | +0,5 |
| Schüler-Voranmeldung | 7 | 7 | 7 | 8 | 7 | 7 | **7,2** | 7,0 | +0,2 |
| Kontakt | 7 | 6 | 7 | 8 | 6 | 6 | **6,7** | 6,2 | +0,5 |
| 404 (gibt-es-nicht) | 7 | 6 | 7 | 8 | 7 | 7 | **7,0** | 6,0 | +1,0 |
| Über uns | 8 | 8 | 8 | 8 | 8 | 7 | **7,8** | 6,7 | +1,1 |
| Projekte | 7 | 7 | 8 | 8 | 8 | 7 | **7,5** | 6,4 | +1,1 |
| Organisationsseite | 7 | 6 | 8 | 8 | 8 | 7 | **7,3** | 6,5 | +0,8 |
| Verwaltung (Übersicht) | 7 | 7 | 7 | 8 | 7 | 6 | **7,0** | 6,3 | +0,7 |
| Postfach | 7 | 7 | 8 | 8 | 8 | 7 | **7,5** | 5,7 | +1,8 |
| Verwaltung Veranstaltungen | 7 | 6 | 6 | 8 | 7 | 7 | **6,8** | 6,3 | +0,5 |
| Startklar-Cockpit | 7 | 6 | 7 | 8 | 7 | 7 | **7,0** | 7,0 | ±0 |

**Gesamtmittel aller 17 Ansichten: 7,16** (E3: 6,29, also +0,87). Die 12 Hauptansichten nach K-009 liegen bei 7,23 (E3: 6,40). Keine Ansicht erreicht 8.
- Stärkste Ansichten: Über uns (7,8), Startseite und Gebetszeiten (je 7,7).
- Schwächste Ansichten: Kontakt (6,7), dann Veranstaltungsdetail, Nachrichtendetail, Korankurse und Verwaltung Veranstaltungen (je 6,8).
- Größte Sprünge: Gebetszeiten (+1,9) und Postfach (+1,8).
- Ohne Fortschritt: Startklar (±0). Die Voranmeldung hat sich kaum bewegt (+0,2).
- Bewegung steht überall bei 7–8. Das Register wird eingehalten (B-05 bis B-10 mit Sinn, reduzierte Endzustände vollständig).

Was in E4 noch wiederkehrt:
- **Telefon = gestapelter Desktop** in langen Listen: Veranstaltungen (7 Ausschnitte), Termine auf der Startseite, Verwaltungsliste (5249 px), Cockpit (17 Einzelkarten).
- **Kastenstapel und Leerflächen** in den unteren Hälften: Kontakt, Korankurse, Organisationsseite. Dazu Detailköpfe mit leerer rechter Hälfte.
- **Farbe als Rauschen**: Regenbogen der Kategorie-Abzeichen, rote Papierkorbspalte, gebogene Statuskanten im Cockpit, rosa Notfallfläche, blaue Hinweisboxen.
- **Präzisionsfehler**: verwaiste „·“, „Uhr“ und Jahreszahlen; doppelte Beschriftungen; Symbole gegen ihre Bedeutung (LogIn, Fünfzack, Häkchen).
- **Sichtbare Platzhaltertexte** „[Text fehlt: …]“ im Nachrichtendetail und im Qibla-Reiter.

## 2. Endgültige Befundpakete

**Wellenplan:**
- Welle 1: sieben Pakete ohne Voraussetzungen. Zuerst H-C01, H-C02, H-C04 und H-C06, danach H-C07, H-C08 und H-C09.
- Welle 2: sechs Pakete, darunter die Abnehmer von Welle 1.
- Innerhalb einer Welle sind die Schreibrechte disjunkt.
- Bewusst in beiden Wellen liegen `EventCard.tsx`/`NewsCard.tsx` (H-C01 → H-C03), `Seitenkopf.tsx` (H-C02 → H-C05) und `veranstaltungen/[slug]/page.tsx` (H-C02 Kopf → H-C11 Rumpf).

| Kennung | Titel | Ansichten | Wirkung | übergr. | Welle | Bildbezug |
|---|---|---|---|---|---|---|
| H-C01 | Listenkarten: Abzeichen nur mit Bedeutung, Terminzeile mit Uhr, eine Sternform | Startseite, Veranstaltungen, Nachrichten, Nachrichtendetail | hoch | ja | 1 | nachrichten/1440 schirm-02/03 (sechs Abzeichenfarben); veranstaltungen/390 schirm-03, start/390+768 schirm-03 („· 18:30–20:00 Uhr“); veranstaltungen/1440 schirm-01/02 (Fünfzack); nachrichten/390 schirm-03 (Sans-Kompakttitel) |
| H-C02 | Detailköpfe mit Bild, Logo in der Kennung, Bildmorph; Nachrichtendetail ohne Doppel und Platzhalter | Veranstaltungsdetail, Nachrichtendetail | hoch | ja | 1 | veranstaltungen_freitagsgebet…/1440 schirm-01 (rechts leer, Kachel x 80, Einzug x 164), 390 schirm-01 (h1 y≈613); nachrichten_neue-gebetszeiten…/1440 schirm-01/02, 390 schirm-01/02 (Bild unter Falz, Auszug doppelt, „[Text fehlt“); seitenwechsel/veranstaltung zeitlupe-02…04, nachricht zeitlupe-03 |
| H-C03 | Listen auf dem Telefon: Kompaktzeilen, verdichtete Startseite, eine Nachrichtenliste | Veranstaltungen, Startseite, Nachrichten | hoch | ja | 2 | veranstaltungen/390 schirm-02/03; start/390 schirm-02–04 (Karten ≈430 px); nachrichten/1440 schirm-01/02 (gestreckte Seitenkarten), 390 schirm-03 (fünf Kästen) |
| H-C04 | Verwaltungslisten: Gruppen, kompakte Telefonkarte, Tabelle ab 1240 px, ruhiger Papierkorb, Leerzustand | Verw. Veranstaltungen, Postfach, alle Verwaltungslisten | hoch | ja | 1 | verwaltung veranstaltungen-1440 (rote Spalte, Pille x 353), -390 (5249 px, „Teilnehmer –“); postfach-1440/390; gp-verw/v1024.png |
| H-C05 | Erzählansichten: Abschnittsköpfe nach Referenz, Organisationsseite geschlossen, Projekte-Telefon, Über-uns-Achse | Organisationsseite, Projekte, Über uns | hoch | ja | 2 | organisationen_ana-teskilati/1440 schirm-01–03, 768 schirm-01; projekte/1440 schirm-03, 390 schirm-03–06; ueber-uns/1440 schirm-04/05 |
| H-C06 | Kontakt: weniger Kästen, Titel ohne Icon, ruhiger Notfall, Begleitspalte bei 768 | Kontakt | hoch | nein | 1 | kontakt/1440 schirm-01–04 (acht Rahmen, Anfahrt-Leerraum, rosa Notfall, Icons), 768 schirm-02/03 |
| H-C07 | Korankurse: offene untere Hälfte, volles Kursraster, ruhige Kurskarte | Korankurse | hoch | nein | 1 | bildung_korankurse/1440 schirm-02/03 (≈400 px leer, blaue Boxen, LogIn), 768 schirm-02/03 (2+1) |
| H-C08 | Startklar-Cockpit: eine Karte je Bereich, Bilanz ohne Überlauf, Status ohne Kanten | Startklar-Cockpit | hoch | nein | 1 | startklar-1440/-390 (17 Karten, gebogene Kanten, Browser-Dreieck); gp-verw/sk1024.png, sk1280.png |
| H-C09 | Gebetszeit-Bausteine: kompakte Leiste, Achtstern in der Zeitenliste, bündige Tafel, Qibla ohne Platzhalter | alle mit Leiste, Startseite, Gebetszeiten | mittel | ja | 1 | veranstaltungen\|nachrichten/390 schirm-01 (Leiste ≈265 px); start/390\|768\|1440 schirm-01 (Imsak nur grün); gebetszeiten/1440 schirm-01/02, 390 schirm-02 |
| H-C10 | Formulare: verbundener Schrittweg, eine Gruppe in Schritt 1, Absenden mobil voll | Voranmeldung, Mitgliedsantrag, Moschee-Anfrage, Kontakt, Meldung | mittel | ja | 2 | bildung_voranmeldung/1440 schirm-01/02, 390 schirm-01/02; kontakt/390 schirm-03 |
| H-C11 | Veranstaltungsdetail-Rumpf: Faktenreihe ohne Waisen, neutrale Anmeldekarte, Achtstern-Hinweise | Veranstaltungsdetail | mittel | nein | 2 | veranstaltungen_freitagsgebet…/390 schirm-01/02 („2024“, „Uhr“ allein), 1440 schirm-02/03, 390 schirm-03 |
| H-C12 | Verwaltungsübersicht und Seitenleiste | Verwaltung (Übersicht), Seitenleiste aller Verwaltungsseiten | mittel | nein | 2 | verwaltung-1440 (y 374/392, Leiste ohne Unterkante), -390 („Uhr“ allein); gp-verw/u1024.png |
| H-C13 | 404: Zustandsgrafik in den Kopf, Wege in einer Reihe | 404 | mittel | nein | 2 | gibt-es-nicht/1440 schirm-01 |

**Kern je Paket** (Einzelheiten in `pakete`):

**H-C01**
- Alle Kategorie-Abzeichen werden sandfarben wie „Kostenlos“. Nur „Wichtig“ bleibt rot, die Kategorie `frauen` verliert die Org-Farbe KT.
- Die Terminzeile zeigt Kalender und Uhr statt „·“. Nur die Uhrzeit ist nowrap.
- `Stern8` ersetzt den Fünfzack bei „Empfohlen“.
- Die Kompakttitel stehen in Serif, das Datum im Raster ist regulär.
- `morph="bild"` an den Bildern der EventCard.

**H-C02**
- Seitenkopf erhält die Props `bild` und `kennungZeichen`.
- Das Bild steht in der rechten Kopfspalte, auf dem Telefon nur mit echtem Bild.
- Das Org-Logo steht in 20 px in der Kennung, die hängende Kachel entfällt.
- Morph-Ziele `v-/n-<slug>-bild`.
- Der Auszug erscheint nur einmal, und der Rumpf ist nie leer.
- Der Platzhalter nutzt `fotoBeitrag` statt „[Text fehlt“.

**H-C03**
- EventCard-Variante `kompakt` (Org-Kante, Vorschaubild, Termin, Titel, Organisation) unter md für /veranstaltungen.
- Die Variante `start` ist auf dem Telefon ohne Kurztext, höchstens drei Termine.
- Die Nachrichten-Seiten- und Telefonliste werden ein gerahmter `ul` mit Trennlinien (NewsCard `rahmen={false}`).

**H-C04**
- Karten/Tabelle tauschen erst bei `menu` (1240 px).
- Gruppen Kommend/Vergangen (`th scope="rowgroup"`).
- Kompakte Telefonkarte ohne „Teilnehmer –“.
- Papierkorb-Knopf in Ruhe neutral; „Endgültig löschen“ bleibt rot.
- Beispiel-Pille bündig.
- `ListenLeer` mit gewichtigem Satz, auch im Postfach und in der Veranstaltungsliste.

**H-C05**
- h2 in `text-display-2` ohne Strichsymbol, Mission/Vision-h3 in der Textschrift.
- B-01 an den Knöpfen von Aufruf und Org-Kontakt.
- Organisationsseite: Einleitung oben, Mission und Vision als Paar.
- Kopf mit `zierde` ab 768 einzeilig (`md:basis-96`, Figur `md:size-36`).
- Spendenkarte unter lg außerhalb des Dunkelgrüns.
- Meilenstein-Datum als Text.
- Über-uns-Lesefläche auf einer Achse.

**H-C06**
- Anfahrt und Angebote stehen rahmenlos mit Überschrift in `text-display-2`.
- Abschnittsabstand `gap-10 md:gap-16`.
- Kartentitel ohne Icon.
- Notfall als weiße Karte, Rot nur für die Nummer.
- Begleitspalte bei 768 dreispaltig.

**H-C07**
- Info-Zeile über drei Spalten, grünes Feld mit zwei Hälften.
- Kursraster `md:grid-cols-2 xl:grid-cols-3`, eine ungerade letzte Karte läuft über die volle Breite.
- Hinweis als Metazeile mit grünem Info-Symbol.
- MapPin statt LogIn für „join“.

**H-C08**
- Eine Karte je Bereich mit `divide-y`.
- Kein `kante` mehr (status.ts).
- Bilanz unter md als Liste, ab md inhaltsbreite Reihe.
- ChevronDown-Aufklapper nach Muster KalenderAbo, Häkchen bei „nichts offen“, Angaben-Raster auf dem Telefon.

**H-C09**
- Leiste auf dem Telefon: „berechnet“ in der Karte, „Alle Zeiten“ als Fußzeile, ≤ 225 px.
- 16-px-Achtstern vor dem nächsten Gebet in der Zeitenliste (B-10).
- „Alle Gebetszeiten“ 48 px hoch.
- Im ruhigen Modus kein 3×2-Raster unter @xl, Tafel gestreckt.
- Qibla-Kennzahl „Entfernung“ ausgeblendet.

**H-C10**
- Schrittmarken Spitze an Spitze verbunden, unter lg Marken statt Balken, kommende Marken sandfarben.
- Schritt 1 als eine Gruppe.
- „Absenden“ mobil volle Breite (Wrapper `self-stretch sm:self-start`).

**H-C11**
- Faktenreihe 1/2/3-spaltig mit nowrap.
- `KATEGORIE_TOENUNG` sandfarben.
- Grüner Rahmen nur, wenn eine Anmeldung möglich ist; „geschlossen“ mit Icon und Rückweg.
- `Stern8` (14 px) statt `CircleCheck` in den Hinweisen.

**H-C12**
- Kacheln `md:grid-cols-2 menu:grid-cols-3`.
- Zeilenbox der Null `leading-12`.
- Zeitspanne nowrap, Pille unter dem Datum.
- Seitenleistenkarte scrollt in sich und behält ihre Unterkante.

**H-C13**
- Zustandsgrafik als `zierde`, keine Kennung „404“.
- Inhaltsspalte `lg:col-span-3`, Kacheln `xl:grid-cols-5`.

**Entscheidungen der Zusammenführung:**
1. **Terminzeile:** Zwei Gegenprüfungen (start, arbeit-a) kamen unabhängig auf Kalender und Uhr. Die Fassung von start gilt: Das Datum darf umbrechen, sonst laufen Monatstexte wie „Jeden vierten Donnerstag im Monat“ bei 320 px über. Die Organisationsseite ist nicht betroffen, OrgTermine hat dieses Muster schon.
2. **E3-Verwerfungen, die E4 umkehrt** (neue Belege der Gegenprüfungen):
   - Kurskarte ohne blaue Box (H-C07): Die Bedeutung trägt künftig das Info-Symbol, nicht die Fläche.
   - Papierkorb-Knopf in Ruhe neutral (H-C04): Das gilt nur für den umkehrbaren Papierkorb (30 Tage, `papierkorbHinweis`). Endgültiges Löschen bleibt rot.
   - Achtstern-Band: Eine PNG-Nachstellung zeigt den 20-px-Stern im 48-px-Takt bei 1× als Achtstern. Das wird eine Aufgabe des Orchestrators mit PNG-Prüfung als Tor.
3. **Statuskanten im Cockpit** (eingeführt mit H-B06) entfallen. In der Bereichskarte mit Zeilen wären es innen gebogene Streifen, und K-32 bleibt über das Badge erfüllt.
4. **Startseite als Referenz:** H-C01 (Abzeichen, Serif-Kompakttitel, Stern8, Terminzeile), H-C03 (Telefon-Termine) und H-C09 (Leiste, Zeitenliste) wirken auf die Startseite. Der Orchestrator nimmt das ausdrücklich ab und zieht REFERENZ §2 nach.
5. **Zusammenwirken in Welle 2:**
   - H-C13 nutzt `zierde`, und H-C05 ändert in Seitenkopf die Grundbreite bei `zierde`. Die 404 bei 768 deshalb erst nach beiden prüfen.
   - Die Abnahme „h1 ≤ y 495“ im Veranstaltungsdetail gilt nach H-C02 + H-C09 (beide Welle 1).
6. **Bildmorph der Veranstaltung:** Er braucht die Quelle in H-C01 (`morph="bild"` in EventCard) und das Ziel in H-C02 (`morphStil('v-<slug>-bild')`). Beide liegen in Welle 1, die Zeitlupe wird nach der Welle abgenommen.

**Für den Orchestrator (gemeinsame Dateien und Werkstatt):**
- *globals.css* (unabhängig von den Wellen), `achtstern-band` und `achtstern-band-hell`:
  - Kachel 48 × 20 px, Stern auf 20 px Höhe mittig: `M24 0 26.93 2.93H31.07V7.07L34 10 31.07 12.93V17.07H26.93L24 20 21.07 17.07H16.93V12.93L14 10 16.93 7.07V2.93H21.07Z`.
  - fill-opacity .08 und die Farben bleiben, `background-size: 48px 20px`, `h-5` bleibt, Kommentar anpassen.
  - Abnahme als PNG (`einzelbild.mjs --png`): 1440 schirm-02 oben, 1440 schirm-04 Fuß, 390 schirm-02, ein Seitenkopf. Acht Spitzen bei 1× erkennbar, CLS 0. Sonst zurücknehmen.
- *Messages:*
  - Nach H-C02 `nachricht.bildPlatz` in `messages/bereiche/nachrichten.json` (de/tr/en) und in `neu-uebersetzt.json` entfernen.
  - Nach H-C09 über `gebetszeitenQibla.entfernung_wert` entscheiden (stehen lassen oder entfernen). Es gibt keine neuen Mikrotexte.
- *MENSCHEN.md:*
  - „Entfernung Wetzlar–Kaaba belegen (Gemeinde/Quelle), dann Kennzahl wieder einblenden“ (H-C09; nicht rechnen, den Designwert 3.847 km nicht übernehmen).
  - Pflegehinweis Halbgeviertstrich in den Kursdaten („6-16“, „Montag-Freitag“, „4,5 - 5“).
- *REFERENZ.md §2:*
  - Kategorie-Abzeichen neutral (`border-linie bg-sand text-tinte-2`).
  - Terminzeile Kalender + Uhr.
  - Seitenkopf-Props `bild` und `kennungZeichen` (Logo ersetzt Stern8 nur bei Organisationsbezug).
- *Bildsatz-Werkzeug:*
  - Browsersprache de-DE (das Datumsfeld zeigte „mm/dd/yyyy“).
  - 1024 und 1280 in den Verwaltungs-Bildsatz aufnehmen, die Überläufe waren nur in Eigenaufnahmen sichtbar.
  - Im nächsten Lauf prüfen, ob die KalenderAbo-Karte am Ende von /veranstaltungen trägt.
  - Zeitlupen Liste → Veranstaltung mit Bildmorph nachreichen.
- *Offen aus E3:* die Auslegung von K-006 für Kartentitel in Display (OrgKarte = OrgCard, EventCard, NewsCard). Die Pakete lassen sie bewusst unverändert, der Orchestrator entscheidet.

## 3. Verworfen

Ganze Pakete:
- start **Tagesbogen: sechs gleiche Spalten** (Rest in H-C09): Zeiten stünden 55–62 px neben ihrem Punkt, tr „Güneş Doğuşu“ bricht um. Die zweite Ebene folgt der Geometrie. Übernommen wird nur der Achtstern.
- arbeit-a **Beitragsende mit Trenner am Desktop:** Ab lg folgt kein Block, nur der Fuß mit seinem Band. Das wäre Schmuck ohne Trennfunktion.
- arbeit-a **Werkzeugzeile Anzahl + Kalender-Abo:** überholt durch die KalenderAbo-Karte (ff45fef), aufgenommen nach dem Bildsatz.
- arbeit-a **Bogenbeschriftung auf einer Grundlinie:** Imsak und Isha liegen unter dem Horizont (bogen.ts). Waagerechtes Ausweichen löst Beschriftungen von ihren Punkten. Geteilt mit B-06.
- erzaehl **P7 Stationskarten mittig + Halbgeviertstrich:** Das zerstört „Marke auf Höhe der Pille“ (H-B12). Der Strich ist als TV-04 der Gemeinde vorbehalten.
- erzaehl **P8 Familienkarten ohne Dauerunterstreichung:** OrgKarte folgt dem Kartenmuster schon, und OrgCard auf der Referenz trägt denselben Unterstrich.
- verwaltung **Bereichsleiste mit Achtstern-Ampel:** Das wäre die vierte Statusebene, braucht einen neuen Plural-Mikrotext in drei Sprachen und macht Stern8 zum reinen Farbträger.
- verwaltung **Übersicht gliedern (Datum als Kennung, Gruppenlabels):** bricht das Kennungsmuster, `datumLang` ist fest deutsch, und die Gruppen entsprechen ohnehin den Kachelreihen.

Teilverwerfungen, die die Gegenprüfungen schon gestrichen haben:
- Achtstern-Band über die Kante versetzt oder im 24-px-Takt
- Container-Query `@xs` an der EventCard
- eigene cva-Prop „dichte“
- Anmeldeknopf im Kopf (besteht schon)
- „ein farbiges Abzeichen je Karte“
- Kalender-Symbol in der Kompakt-Metazeile
- `self-start` an der Nachrichten-Seitenliste
- Präfix-Abschneiden des Auszugs
- flachere viewBox des Bogens
- Kennung „404“ und `lg:grid-cols-5`
- ClipboardPen im Status-Chip
- Symbole vor Werte- und Aktivitäten-h3 sowie Titel der OrgKarte
- „gestrichelt nur für Platzhalter“
- Zeilenlinks in der Übersicht
- Statussymbol links und Zählzeile im Cockpit
- alle Kennzahlen in `text-48`
- `min-h-11` und `h-svh` in der Seitenleiste
- allgemeines Ausblenden von „–“ in ListenKarte
- Leersatz als Display-h2
- ChevronRight und Token-Antrag im Aufklapper
- Bilanz nur unter sm

## 4. Verstöße gegen Kern, Religion und UNANTASTBAR

**Religion und UNANTASTBAR: kein Verstoß** in allen fünf Gruppen.
- Keine Verse, keine Kalligrafie.
- Das Achtstern-Band liegt nur an Kanten, mit 8 % Deckkraft, nie hinter Text.
- Die Logos sind nur verkleinert (20, 28, 40 px).
- „berechnet“, die Gebetszeiten-Logik und ihre Quelle sind unverändert.
- Die Cockpit-Prüfungen sind vollständig sichtbar.
- Alle Pakete ändern nur die Darstellung: Formularlogik (Voranmeldung, Anmeldung E-028), Prüfungen, Feldnamen und Daten bleiben gleich.

**Hartes Kriterium Platzhalter (K-21):**
- Sichtbar ist „Foto: [Text fehlt: Bild zum Beitrag]“ (nachrichten_neue-gebetszeiten…/1440 und 390 schirm-02) → H-C02.
- Im Qibla-Reiter steht „[Text fehlt: gebetszeitenQibla.entfernung_wert]“ (Code, nicht im Bildsatz) → H-C09.

**K-003:**
- Nr. 4, Farbe als einzige Information: In der Zeitenliste ist das nächste Gebet nur grün markiert → H-C09.
- Nr. 4, Org-Farbe außerhalb ihres Kontexts: Event-Kategorie `frauen` in KT-Tönung, „Jugend“ hellblau neben dem GT-Band → H-C01.
- Nr. 6, gestapelter Desktop: Veranstaltungen und Startseiten-Termine auf dem Telefon → H-C03; Kontakt 768 → H-C06; Verwaltungsliste 390 → H-C04.

**K-003.3 / K-008, eine Sternform:** Fünfzack bei „Empfohlen“ → H-C01.

**K-006 / REFERENZ §2:**
- Mission- und Vision-h3 in Display, Abschnitts-h2 in `text-30` mit Strichsymbol (Organisationsseite, Projekte, Über uns) → H-C05.
- Die Auslegung für Kartentitel bleibt offen (siehe oben).

**K-007 B-01:** Den Knöpfen in Aufruf (Über uns) und im Org-Kontakt fehlen `transition` und `active:scale-98` → H-C05.

**K-009:**
- Leerzustand der Verwaltungs-Veranstaltungsliste ohne Zustandsgrafik → H-C04.
- „Anmeldung geschlossen“ ohne nächsten Schritt → H-C11.
- Touch-Ziel „Alle Gebetszeiten“ auf dem Telefon nur 44 px → H-C09.

**K-005 Breakpoints:** Die Cockpit-Bilanz nutzt `sm` und läuft bei 1024 und 1280 über → H-C08 (md).

**K-010 (bekannt, kein Gestaltungsbefund):**
- „Entdecken Sie …“ auf der Startseite: TV-01 / ML-18, wartet auf die Gemeinde.
- „spirituelle Reise“: TV-05.
