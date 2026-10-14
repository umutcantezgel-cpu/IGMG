# SICHTABNAHME C2: Zusammenführung

Grundlage: fünf unabhängige Sichtprüfer (start, arbeit-a, arbeit-b, erzaehl, verwaltung), je eine adversariale Gegenprüfung, eingeordnet nach REFERENZ.md und KERN K-007. Repo-Stand bei der Zusammenführung: `claude/blissful-edison-x3j16w` @ 5ba48e4.

Bildpfade:
- öffentliche Ansichten relativ zu `stufe-c/bildsatz/…` (reduziert: `stufe-c/bildsatz-reduziert/…`)
- Momente unter `stufe-c/momente/…`, Seitenwechsel unter `stufe-c/seitenwechsel/…`
- Verwaltung unter `_werkstatt/bilder/C2-verwaltung/*.jpg`

Alle Schreibrechte sind gegen das Dateisystem geprüft; jede genannte Datei existiert.

## 1. Werte je Ansicht (aus den Urteilen, unverändert)

| Ansicht | Typo | Komp. | Farbe/Bild | Beweg. | Grafik | Details | **Wert C2** | E4 | Δ |
|---|---|---|---|---|---|---|---|---|---|
| Startseite (Referenz) | 7,5 | 7,5 | 8 | 7,5 | 8 | 7,5 | **7,7** | 7,7 | ±0 |
| Gebetszeiten | 8 | 8 | 8 | 8 | 8 | 7 | **7,8** | 7,7 | +0,1 |
| Veranstaltungen | 8 | 8 | 8 | 8 | 8 | 8 | **8,0** | 7,2 | +0,8 |
| Veranstaltungsdetail | 8 | 8 | 8 | 8 | 8 | 8 | **8,0** | 6,8 | +1,2 |
| Nachrichten | 8 | 8 | 8 | 8 | 8 | 7 | **7,8** | 7,0 | +0,8 |
| Nachrichtendetail | 8 | 7 | 8 | 8 | 8 | 8 | **7,8** | 6,8 | +1,0 |
| Korankurse | 7,5 | 7 | 7 | 8 | 7 | 7 | **7,3** | 6,8 | +0,5 |
| Schüler-Voranmeldung | 7,5 | 8 | 7,5 | 8 | 7,5 | 7,5 | **7,7** | 7,2 | +0,5 |
| Kontakt | 7 | 7 | 7 | 8 | 6,5 | 7 | **7,1** | 6,7 | +0,4 |
| 404 (gibt-es-nicht) | 7,5 | 7 | 7,5 | 8 | 7,5 | 7,5 | **7,5** | 7,0 | +0,5 |
| Über uns | 8 | 8 | 7 | 8 | 8 | 7 | **7,7** | 7,8 | −0,1 |
| Projekte | 7 | 7 | 7 | 8 | 7 | 7 | **7,2** | 7,5 | −0,3 |
| Organisationsseite | 7 | 6 | 8 | 8 | 7 | 7 | **7,2** | 7,3 | −0,1 |
| Verwaltung (Übersicht) | 7 | 6 | 8 | 8 | 7 | 6 | **7,0** | 7,0 | ±0 |
| Postfach | 8 | 8 | 8 | 8 | 8 | 7 | **7,8** | 7,5 | +0,3 |
| Verwaltung Veranstaltungen | 7 | 7 | 7 | 8 | 7 | 6 | **7,0** | 6,8 | +0,2 |
| Startklar-Cockpit | 8 | 7 | 8 | 8 | 7 | 6 | **7,3** | 7,0 | +0,3 |

**Gesamtmittel aller 17 Ansichten: 7,52** (E4: 7,16, also +0,36).
- Die 12 Hauptansichten nach K-009 liegen bei **7,57** (E4: 7,23).
- Erstmals bei 8: **Veranstaltungen** und **Veranstaltungsdetail**. Sie bekommen keine Pakete.
- Größte Sprünge: Veranstaltungsdetail (+1,2), Nachrichtendetail (+1,0), Veranstaltungen und Nachrichten (je +0,8). Das sind die Ansichten von H-C01/02/03/11.
- Schwächste Ansichten: Verwaltung (Übersicht) und Verwaltung Veranstaltungen (je 7,0), Kontakt (7,1), Projekte und Organisationsseite (je 7,2).
- Rückgänge bei den Erzählansichten (−0,1 bis −0,3): Das Bild ist nahezu gleich wie in E4. Über uns: RMSE ≈ 0,004 zu E4. Projekte: „fast gleich wie in E4“. Ursache ist der strengere Blick des Prüfers; eine Regression liegt nicht vor.
- Startseite ±0: Bewegung sinkt von 8 auf 7,5, weil B-06 neu belegt eine Markenlücke hat und 2,0 s dauert. Grafik steigt von 7,5 auf 8.
- Mittel je Kategorie über alle 17: Bewegung 7,97 · Farbe/Bild 7,65 · Typografie 7,59 · Grafik 7,50 · Komposition 7,32 · Details 7,09. Details und Komposition halten die Werte unter 8.

Was in C2 wiederkehrt:
- **Grün oder Org-Tönung als Fläche an Nicht-Handlungen**: Ära-Pillen (Über uns), Häkchen-Chips der Einrichtungen (Projekte), Datumspille in OrgTermine, dunkler Besuchsblock (Kontakt) → H-E03, H-E04, H-E05, H-E09.
- **Kastenstapel und hohle Flächen**:
  - Begleitspalte auf Kontakt mit vier Rahmen
  - Organisationsseite: Paar Termine/Nachrichten, Leerzustand in ≈ 300 px Leere
  - Meilensteine als 3 × 2 Kästen
  - Seitenspalte der Neuigkeiten (Inhalt 88 px in 192 px)
  - → H-E03, H-E05, H-E04, H-E08.
- **Muster nicht nachgezogen**:
  - Nachrichtendetail ohne `bildAbLg` (H-C02)
  - „Aktuell“ ohne Stern8 (H-C01)
  - Zeitenliste mit Uhr statt Stern8 (H-C09)
  - Datum über dem Titel nur in der NewsCard-Variante „standard“ (H-B01)
  - Kursstatus „Geschlossen“ rot
  - → H-E06, H-E08, H-E13, H-E11.
- **Präzision im großen Moment**: Im Tagesbogen fehlt die Marke des nächsten Gebets während der Enthüllung. Die Punkte färben sich bis ≈ 0,75 s nach der Linie, und der Moment dauert 2,0 s → H-E01.
- **Verwaltung**: Die Seitenleiste ist abgeschnitten (Rückschritt seit E4), Terminzeilen nutzen „·“, Abzeichen springen → H-E02.

## 2. Endgültige Befundpakete

**Wellenplan:**
- **Welle 1** (8 Pakete): H-E01 … H-E08, also alle Pakete mit Wirkung hoch und die beiden übergreifenden mittleren Pakete mit den meisten Ansichten.
- **Welle 2** (6 Pakete): H-E09 … H-E14.
  - H-E09 (Bildplatzhalter) folgt nach H-E08, damit die Kartenbilder nur einmal abgenommen werden.
  - H-E13 folgt nach H-E01, weil beide die Gebetszeiten-Seite betreffen.
  - Die Zeitlupe von H-E14 wird nach H-E06 und H-E08 aufgenommen.
- Die Schreibrechte sind innerhalb jeder Welle disjunkt, und keine Datei liegt in beiden Wellen. Je Welle können bis zu vier Baumeister parallel arbeiten.
- **Vorbedingungen für Welle 1** (Orchestrator, siehe unten):
  - Registervermerk B-06 (für H-E01 Teil 2)
  - K-006-Auslegung in ENTSCHEIDUNGEN (für H-E03)
  - vier neue Mikrotexte (H-E03, H-E04, H-E05)

| Kennung | Titel | Ansichten | Wirkung | übergr. | Welle | Bildbezug |
|---|---|---|---|---|---|---|
| H-E01 | Tagesbogen: Marke ohne Lücke, Moment in 1,6 s, Färbung im Takt der Linie, nächste Zeit 24 px | Startseite, Gebetszeiten (Tafel ab @xl) | hoch | ja | 1 | start/1440 schirm-01 (Scheitel bei Dhuhr ohne Marke); momente/b06-l1-1…4 (Asr ohne Ring), b06-l1-4 (Dhuhr-Punkt hohl, Linie schon bei x≈213); bildsatz-reduziert/start/1440 und 390 schirm-01 (alle Zeiten 18 px) |
| H-E02 | Verwaltung: Seitenleiste ganz sichtbar, Terminzeile, Abzeichen an festem Platz, eine Pillenform | Übersicht, Postfach, Veranstaltungen, Startklar | hoch | ja | 1 | verwaltung/postfach/veranstaltungen/startklar-1440 (Leiste bei y≈988 abgeschnitten, aktiver Eintrag im Cockpit); verwaltung-390 („2026 ·“); veranstaltungen-390 („· wiederkehrend“); veranstaltungen-1440 (Abzeichen neben/unter dem Titel); startklar-390 (Grafik mittig) |
| H-E03 | Kontakt: Begleitspalte in zwei Rahmen mit Sans-Rubriken, heller Besuchsblock mit einem Weg, Anfahrt ohne Kreise | Kontakt | hoch | nein | 1 | kontakt/1440 schirm-01/02 (vier Rahmen, neun Serif-Titel); schirm-03/04 und 390 schirm-06 (dunkler Block über dunklem Fuß, stumme Chips, Symbolkreise); 768 schirm-03 |
| H-E04 | Projekte: Meilensteinlinie mit Zeitachse, ruhige Einträge, neutrale Einrichtungen, ehrlicher Spendenstand | Projekte | hoch | nein | 1 | projekte/1440 schirm-01 (h2 ohne Kennung), schirm-02 (dünne Linie im Kasten, Häkchen-Chips); reduziert schirm-03 (3 × 2 Kästen, fettes Datum, leerer Balken, Platzhalter doppelt); 390 schirm-02/03 |
| H-E05 | Organisationsseite: Termine und Nachrichten ohne Kästen, Familie benannt und vollständig, ruhige Terminzeile, Köpfe fluchten | Organisationsseite (alle vier) | hoch | nein | 1 | organisationen_ana-teskilati/1440 schirm-01 (Stern ohne Namen), schirm-02 (Mission ≈ 5 px tiefer), schirm-03 (Kastenpaar, Leerzustand in ≈ 300 px, Datumspillen), schirm-04 (drei Karten unter „Familie der vier“); 390 schirm-04–06 |
| H-E06 | Nachrichtendetail: Kopfbild-Platzhalter nur ab lg (H-C02) | Nachrichtendetail | hoch | nein | 1 | nachrichten_neue-gebetszeiten-fuer-den-winter/390 schirm-01/02 (220-px-Streifenfläche, Text erst bei y≈290 auf schirm-02); 768 schirm-01 (704 × 300 px) |
| H-E07 | Leiste ab 768 px: „berechnet“ neben „Nächstes Gebet“, unter 1240 px Ort und Datum in einer Zeile | alle öffentlichen Seiten ab 768 | mittel | ja | 1 | start/1440 schirm-01 (Leiste y 80–280, Kacheln 75 px); 768 schirm-01 (y 72–362); tr/1440 schirm-01 |
| H-E08 | Nachrichtenkarten nach einem Muster, Startseiten-Knöpfe mit Ziel | Startseite, Nachrichten, Nachrichtendetail | mittel | ja | 1 | nachrichten/1440 schirm-01/02, 390 schirm-02/03 (Datum unter dem Titel, „Aktuell“ ohne Stern); start/1440 schirm-03 (Seitenkarten 192 px, Inhalt 88 px); start/1440 schirm-01/02, 390 schirm-02/03 („Mehr erfahren“, ungleich breite Knöpfe) |
| H-E09 | Bildplatzhalter als Etikett aus einem Baustein, Ära als grüne Textzeile | Über uns, Projekte, alle mit Bildplatzhalter | mittel | ja | 2 | ueber-uns/1440 reduziert schirm-02/03, 390 schirm-04 (drei- bis vierzeilige Ovale, „Zukunft“ allein, gefüllte grüne Ära-Pillen); projekte/1440 schirm-02 (3D-Etikett) |
| H-E10 | Schrittweg: volle Marke für „aktuell“, Linien Spitze an Spitze, Statuszeile ab lg nur vorgelesen | Voranmeldung, Mitgliedsantrag, Moschee-Anfrage | mittel | ja | 2 | bildung_voranmeldung/1440 schirm-01 (blasse aktuelle Marke, „Angaben zum Kind“ dreimal); 390 schirm-01 (≈ 9 px Lücke) |
| H-E11 | Kursstatus im Abzeichen-System: Grün nur beim Kurs mit Handlung | Korankurse | mittel | nein | 2 | bildung_korankurse/1440 schirm-02, 390 schirm-02/03 (zwei hellgrüne Häkchen-Pillen, „Geschlossen“ rot) |
| H-E12 | 404: Satz in den Kopf, Kacheln ohne Symbolkreis | 404 | mittel | nein | 2 | gibt-es-nicht/1440 schirm-01 (≈ 150 px leer, Satz unter dem Band, Kreise in den Kacheln); 390 schirm-01/02 |
| H-E13 | Zeitenliste: Achtstern statt Uhr, vergangene Zeiten leiser | Gebetszeiten | mittel | nein | 2 | gebetszeiten/1440 schirm-01, 390 schirm-01/02 (Uhr vor „Nächstes Gebet“, tinte-2 kräftiger als Grün) |
| H-E14 | Seitenwechsel B-05: Titel-Morph mit ease-eintritt | Startseite (Karten), Veranstaltungen, Nachrichten, Organisationsseite | gering | ja | 2 | seitenwechsel/nachricht zeitlupe-03/04 (Titel ≈ 105/27 px unter der Endlage über der Datumszeile); seitenwechsel/veranstaltung zeitlupe-03/04 |

**Kern je Paket** (Einzelheiten in `pakete`):

**H-E01**
- Der Ring wird immer gerendert, der Achtstern-Chip deckt ihn (`Fragment`).
- Nach Registervermerk: Sonne ab 880 ms, Achtstern ab 960 ms, Ende nach 1600 ms.
- `--anteil` wird als Zeitanteil aus der Umkehrung von ease-eintritt gesetzt (bogen.ts `EINTRITT`, `zeitAnteilEintritt`, Tests). Die CSS-Verzögerung wird linear.
- Die Zeit des nächsten Gebets steht in `text-24`, ab @xl mit `leading-none`. `h-27` und `top-15` bleiben.

**H-E02**
- Seitenleiste ab `verwaltung:` mit `min-h-11`, `gap-0`, `mt-2/pt-2/pb-0`. 16 Einträge brauchen 861 px bei 868 px Platz.
- Der aktive Eintrag wird per `scrollTop` in Sicht gehalten (kein smooth, kein scrollIntoView).
- Terminzeile mit Calendar/Clock/Repeat ohne „·“.
- Abzeichen in `flex-col` unter dem Titel.
- Ampel-Pillen werden `rounded-pill`.
- Neuigkeiten-Status steht in der Datumszeile.
- Cockpit-Grafik `self-start`.

**H-E03**
- `TEIL` in stil.ts: Öffnungszeiten, Notfall und Adresse stehen in einem Rahmen mit Trennlinien auf allen Breiten.
- `UEBERSCHRIFT` wird fette Sans `text-20`.
- AngeboteBesuch auf Sand, der Chip entfällt, dazu ein Link „Besuch vereinbaren →“ zu `#nachricht`.
- Anfahrt-Symbole ohne Kreis. Die AnmeldeKarte (Korankurse) bleibt dunkel.

**H-E04**
- Datumszeile unter dem Markenband ab lg, nur bei ≤ 6 Meilensteinen.
- Nur der nächste Meilenstein ist Karte (`shadow-s1`, kein grüner Rand), die übrigen stehen mit 2-px-Kopflinie.
- Stand in `font-display text-24`, Datum regulär.
- Kennung „Bauprojekt“.
- Sand-Chips ohne Häkchen.
- Spendenbalken nur mit Werten.

**H-E05**
- Termine und Nachrichten mit Kopflinie in Org-Farbe statt Kasten, Leerzustand einzeilig (48 px).
- Kürzel an den Spitzen ab lg, das eigene fett.
- Alle vier Karten, die eigene ohne Link mit Abzeichen „Diese Seite“.
- Kennung „Wer wir sind“, Mission mit `pt-4.5`.
- OrgTermine als Terminzeile ohne Tönungspille.

**H-E06**
- `bildAbLg={!n.bild}` am PageHeader, wie im Veranstaltungsdetail.

**H-E07**
- „Nächstes Gebet“ und `{hinweis}` stehen in einer eigenen Zeile vor dem B-10-Block.
- Ort und Datum unter `menu` in einer Zeile.

**H-E08**
- NewsCard „gross“ und „kompakt“: Datum zwischen Abzeichen und Titel.
- „Aktuell“ mit Stern8, der Titel bleibt bei 30 px.
- Prop `auszug` (Kurztext nach dem Titel, erst ab `menu`, `line-clamp-2`) auf Startseite und /nachrichten.
- Hero „Über uns →“, Karten „Details ansehen →“.
- Beide Hero-Knöpfe `max-md:w-full`.

**H-E09**
- Etikett `rounded-lg px-3 py-1 text-balance`, Prop `lang`.
- Bildflaeche wird eine Hülle über Bildplatzhalter.
- Ära in `text-16 font-bold text-gruen-800`.
- Seed und messages bleiben unverändert.

**H-E10**
- „aktuell“ mit voller Fläche `fill-gruen-700` und weißer Ziffer, „erledigt“ hell mit Häkchen.
- Telefonlinie `-mx-1.25`.
- Statuszeile in der Seitenleisten-Anordnung `lg:sr-only`.

**H-E11**
- register: weiße Pille mit Stern8.
- join und closed: sandfarben neutral (CircleCheck/CircleX), `py-px`.

**H-E12**
- `untertitel` im PageHeader, `text` im Statusblock optional.
- Kacheln ohne Kreis, `px-4`.

**H-E13**
- `<Achtstern size={16} />` statt Clock, vergangene Zeiten in `text-tinte-3`.

**H-E14**
- `::view-transition-group(.morph)` mit `ease-eintritt` (Orchestrator), Doc-Kommentar in morph.ts.

**Entscheidungen der Zusammenführung:**
1. **Zusammengelegt wegen gleicher Datei oder gleicher Ursache:**
   - start Tagesbogen-Marke + start 24-px-Zeit + Fund der Gegenprüfung „Färbung zu spät“ → H-E01. Alles liegt in TagesbogenLive.tsx und wird mit einer Bildfolge geprüft.
   - verwaltung, vier angenommene Pakete → H-E02.
   - arbeit-b Seitenende + Besucher + Begleitspalte + Anfahrt-Teil des Zeichensystems → H-E03.
   - erzaehl Meilensteinlinie + Projekte-Typografie + Einrichtungen + Spendenbalken → H-E04.
   - erzaehl Kastenstapel + Familie benannt + Familie vollständig + Köpfe + OrgTermine → H-E05.
   - arbeit-a Datum + „Aktuell“ + start Kurztext + start Hero-Knöpfe + start Knopftexte → H-E08. Grund: NewsCard.tsx und page.tsx.
   - erzaehl Bildplatzhalter + Ära → H-E09.
   - arbeit-b Schrittmarke + Statuszeile → H-E10.
   - arbeit-b 404-Teil des Zeichensystems + Satz im Kopf → H-E12.
2. **Reihenfolge in NewsCard „kompakt“:** Weil das Datum über den Titel wandert, steht der Kurztext von H-E08 nach dem Titel und nicht „direkt nach der Datumszeile“, wie es die Vorlage der Gegenprüfung vorsah. In allen Varianten gilt danach: Abzeichen → Datum/Lesezeit → Titel → Kurztext.
3. **H-E01 und globals.css:** Die lineare CSS-Verzögerung kommt vor oder mit der neuen `--anteil`-Berechnung, nie danach. Sonst färbt anteil³ einer Zeitgröße die Punkte vor der Linie (H-B02).
4. **Startseite als Referenz:** H-E01, H-E07, H-E08, H-E09 und H-E14 wirken auf die Startseite. Der Orchestrator nimmt ausdrücklich ab und zieht REFERENZ §2 nach.
5. **H-E14** bleibt das Paket mit der kleinsten Wirkung. Sein Kern ist eine Zeile in globals.css, die der Orchestrator ändert; der Baumeister zieht nur den Doc-Kommentar in morph.ts nach.
6. **Zu erwarten:** Nach H-E06, H-E08 und H-E13 erreichen Gebetszeiten, Nachrichten und Nachrichtendetail voraussichtlich 8,0 (Einschätzung arbeit-a).

**Für den Orchestrator (gemeinsame Dateien und Werkstatt):**
- *Vor Welle 1:*
  - KERN K-007, B-06: Registertext „Danach treten Sonne und Achtstern hervor (`dauer-auftritt`; Sonne ab `dauer-moment − dauer-wechsel`, Achtstern + `staffel`; gesamt 1,6 s)“. Das ersetzt „+0/+160 ms“ und betrifft H-E01 Teil 2.
  - ENTSCHEIDUNGEN, Auslegung K-006: Rubriken in Begleitkarten (Kontaktdaten, Öffnungszeiten, Notfallkontakt, Adresse, Besucher willkommen) stehen in fetter Sans `text-20`, wie die Mission/Vision-h3 (H-C05). Inhaltstitel bleiben Serif. Später nachziehen: KalenderAbo.tsx Z. 38, mitglied-werden „Fragen?“ Z. 80.
  - Mikrotexte de/tr/en, tr und en jeweils in `neu-uebersetzt.json`:

    | Schlüssel | de | tr | en |
    |---|---|---|---|
    | `kontakt.besuch.vereinbaren` | „Besuch vereinbaren“ | „Ziyaret için randevu alın“ | „Arrange a visit“ |
    | `projekte.bezeichnungen.beschreibungKennung` | „Bauprojekt“ | „İnşaat projesi“ | „Building project“ |
    | `organisation.orgs.aktuell` | „Diese Seite“ | „Bu sayfa“ | „This page“ |
    | `organisation.about.kennung` | „Wer wir sind“ | „Biz kimiz“ | „Who we are“ |
- *globals.css:*
  - Mit H-E01: In `.bogen-punkt-erreicht::after` wird die Verzögerung zu `calc(var(--anteil) * var(--dauer-moment))` statt anteil³. Den Kommentar (H-B02) anpassen; die Regel für reduzierte Bewegung (Z. 549) bleibt.
  - H-E14: In `::view-transition-group(.morph)` wird `--ease-standard` zu `--ease-eintritt`, mit Kommentar. Das braucht keinen Registervermerk.
- *Nach den Wellen:*
  - messages: `start.mehrErfahren` und `karten.mehrErfahren` (nach H-E08) sowie `kontakt.besuch.fuehrungen`/`termine` (nach H-E03) sind dann ungenutzt.
  - REFERENZ §1: bogen.ts (`EINTRITT`, Spiegel von `--ease-eintritt`, geprüft in token-spiegel.test.ts) als belegte Ausnahme aufnehmen.
  - REFERENZ §2 nachziehen:
    - NewsCard-Reihenfolge in allen Varianten
    - Bildplatzhalter-Etikett `rounded-lg`
    - Kursstatus nach der Abzeichen-Regel
    - neutrale Werkzeugknöpfe (Teilen, Kalender, Menü, Sprache; `border-rand`) als dritte Knopfstufe (Hinweis arbeit-a)
  - TEXTVORSCHLAEGE.md (H-E09): Stationstitel ohne die vorangestellte Ära, in den Bildbeschreibungen „ – “ statt „ - “, in de, tr und en.
  - MENSCHEN.md:
    - Die Projektdaten wirken am 12.10.2026 veraltet: „Grundsteinlegung September 2024 – Geplant“, „Eröffnung Januar 2026 – Geplant“, „Fertigstellung 2026“. Die Gemeinde soll sie bestätigen.
    - „Gebet, Gemeinschaft, Einheit“ wiederholt die Gründungsgeschichte (Textvorschlag).
    - TV-01 ist weiter offen.
  - Beobachtet, ohne Paket:
    - getönte Symbolflächen auf Mitglied werden (page.tsx Z. 68) und in WissenKarten Z. 106 (seitenweit entscheiden)
    - Filterchips auf dem Telefon dreizeilig (Veranstaltungen, Nachrichten)
    - technische Kennungen im Cockpit nicht als Code abgesetzt
- *Bildsatz-Werkzeug:*
  - B-06-Momente mit gestellter Uhr 19:30 und 22:30 sowie Bilder bei 900 und 1500 ms.
  - Verwaltung: Zusatzbild 1440 × 760 und ein reduzierter Bildsatz (heute ist die Bewegung nur nach Code bewertet).
  - Gegenproben: Organisationsseite KT, Projekte mit Spenden-Testwerten.
  - Zeitlupen B-05 nach H-E14 neu aufnehmen.

## 3. Verworfen

Ganze Pakete:
- arbeit-b **Kurskarte: Aktion vor den Kursinhalten**: Auf der Karte gilt erst informieren, dann handeln. Die Karte ist ohnehin ganz klickbar, und `md:order-last` trennt Lese- und Sichtreihenfolge (WCAG 1.3.2).
- erzaehl **Meilensteine als Achtstern-Schrittweg**: Kreis für erreicht und Achtstern für das Nächste ist die Sprache des Tagesbogens (K-008). Mit `size-10` blieben auf dem Telefon nur ≈ 9-px-Strichstücke.
- verwaltung **Übersicht: offene Arbeit groß, Ruhendes als Liste**: Die Nullen stammen aus den Seed-Daten. Eine datenabhängige Anordnung springt bei jedem Eingang, und die Kacheln kommen aus dem Design V01 (G-08).
- verwaltung **Telefonkarte: Aktionen im Kartenkopf**: Die Knöpfe nehmen dem Titel ≈ 116 px, die Titel brechen drei- bis vierzeilig (K-003 Nr. 6).
- verwaltung **Startklar-Fortschritt als Markenreihe**: Sie kodiert dasselbe wie die Zähler und behauptet eine Reihenfolge. Acht rote Sterne wären Farbrauschen, und die Länge wächst mit den Prüfungen.

Teilverwerfungen aus den Gegenprüfungen:
- **Tagesbogen**: Ring ohne `bogen-punkt-erreicht` (nach Isha falsch). Marken bei 560/720 ms (Sonne vor der Linie) werden 880/960 ms. „Bei 1,2 s vollständig“ ist nicht erreichbar.
- **Tagesbogen-Zeit**: `@xl:h-28` entfällt, stattdessen `@xl:leading-none`.
- **Neuigkeiten**: Startseite als gerahmte Liste entfällt (H-C03 behält die Rahmen). Breakpoint `lg` wird `menu`. Kein `text-pretty` am Absatz.
- **Leiste**: `flex-wrap` wirkt am `flex-none`-Block nicht. „Kacheln in tr einzeilig“ stimmt schon heute nicht.
- **Knopftexte**: nicht übergreifend, die EventCard „start“ gibt es nur auf der Startseite.
- **B-05**: Die Abnahme „≤ 24 px“ ist unerreichbar, es gilt ≤ 50/15 px. Die Wirkung ist gering, nicht mittel.
- **„Aktuell“**: Der Titel bleibt bei 30 px statt `text-display-2`, er würde sonst mit dem h2 der Startseite konkurrieren.
- **NewsCard-Datum**: kein Calendar-Symbol in „kompakt“; der Detail-Seitenkopf bleibt, wie er ist.
- **Seitenende hell**: Die AnmeldeKarte bleibt dunkel, wie die Aufrufe auf Über uns und Projekte (H-C07).
- **Zeichensystem**: kein Trenner zwischen „Schreiben“ und „Besuchen“.
- **Besucher willkommen**: „Termine“ nach /veranstaltungen wäre falsch, gemeint sind Besuchstermine. Statt zwei Wegen gibt es einen Link.
- **Kursstatus**: Stern8 mit 16 px statt Achtstern 14.
- **Statuszeile**: keine Spans mit `lg:hidden`/`hidden lg:inline` und kein neuer Schlüssel (der Bildschirmleser verlöre den Titel, die E2E würde rot), stattdessen `lg:sr-only`.
- **Bildplatzhalter**: kein `leading-snug` (K-003), `rounded-lg` statt `rounded-md`.
- **Weg der Gemeinde**: Titel und Striche in Seed und messages bleiben (G-08), nur ein Textvorschlag; kein Eintrag in neu-uebersetzt.json.
- **Meilensteinlinie**: kein grüner Rand mit `shadow-s2` an einer nicht klickbaren Karte (das ist der Hover-Zustand); kein `h-20`-Linienfeld.
- **Projekte-Typografie**: `p.name` als Kennung entfällt (auf 390 doppelt). „Alle h2 mit Kennung“ entfällt.
- **Familie der vier**: keine Mini-Familie auf der OrgKarte; das eigene Kürzel fett statt in Tinte.
- **Familie vollständig**: kein `border-2` in `s.akzent` (gleich dem Hover-Rand), kein `aria-current`.
- **Org-Köpfe**: keine Kennung über „Kontakt“, kein graues Band auf der Vision, stattdessen `pt-4.5` an der Mission.
- **Seitenleiste**: Es sind 16 Einträge, nicht 14, und 82 px Ersparnis reichen nicht. Deshalb stärker verdichten und den aktiven Eintrag in Sicht halten.
- **Terminzeile Verwaltung**: Icons ohne `text-tinte-3`; der Widerspruch zur öffentlichen Terminzeile (`size-4` gegen `size-5`) ist aufgelöst.
- **Status-Abzeichen**: „Veröffentlicht“ wird keine weiße Pille mit Stern8 (Styleguide V14; Stern8 bleibt den Hervorhebungen vorbehalten).
- **Cockpit-Kante**: Grafik und Überschrift nicht in einer Zeile (bricht schon bei 390 um), nur `self-start`.

## 4. Verstöße gegen Kern, Religion und UNANTASTBAR

**Religion und UNANTASTBAR: kein Verstoß** in allen fünf Gruppen.
- Keine Verse, keine Kalligrafie, kein Gottesname als Schmuck.
- Das Achtstern-Band liegt nur an Kanten, mit höchstens 8 % Deckkraft, nie hinter Text.
- Die Logos stehen mit 20, 24, 28 oder 40 px und sind nie vergrößert.
- „berechnet“ ist sichtbar; die Gebetszeiten-Logik und ihre Quelle sind unberührt.
- Der Einwilligungssatz auf Kontakt steht im Wortlaut. Formularfelder, Pflichtangaben und Cockpit-Prüfungen sind vollständig.
- Die Platzhalter sind gewollt.
- Alle Pakete ändern nur die Darstellung. H-E09 lässt Bestandstexte (Seed, messages) bewusst unberührt.

**K-007:** kein Registerverstoß. Die Arbeitsansichten haben keinen Auftritt beim Laden; in 23 Ausschnitten sind normaler und reduzierter Bildsatz gleich.
- **Grenzfall B-06:** Während der Enthüllung fehlt die Marke des nächsten Gebets, obwohl der Serverzustand sie zeigt. Der Moment endet nach 2,0 s statt nach dem Richtwert 1,6 s (AUFTRAG §6). → H-E01; Teil 2 nur mit Registervermerk.
- **B-05:** Die Kurve legt das Register nicht fest → H-E14 ohne Vermerk.

**K-010:**
- „Entdecken Sie …“ steht zweimal (start.untertitel, start.veranstaltungenText; start/1440 schirm-01/02, 390 schirm-02).
- Kennung und h2 doppeln „Veranstaltungen“.
- Beides ist als TV-01 bekannt, die Übernahme ist der Gemeinde vorbehalten. Solange TV-01 offen ist, verfehlt die Referenzansicht K-010.
- „Mehr erfahren“ ohne Ziel → H-E08.

**K-001 und REFERENZ §2 (Abzeichen-Regel):**
- Grüne oder Org-Fläche an Nicht-Handlungen: Ära-Pillen (H-E09), Einrichtungs-Chips (H-E04), Datumspille in OrgTermine (H-E05).
- „Geschlossen“ steht in der fehler-Tönung, obwohl nur „Wichtig“ rot ist (H-E11).
- „Aktuell“ ohne Stern8 (H-E08).

**REFERENZ-Muster nicht nachgezogen** (keine Kernverstöße):
- Nachrichtendetail-Platzhalter unter lg (H-C02) → H-E06
- Zeitenliste mit Uhr (H-C09) → H-E13
- NewsCard-Datum nur in „standard“ (H-B01) → H-E08
- Verwaltungs-Terminzeile mit „·“ (H-C01) → H-E02

**K-003 Nr. 4 und Wahrheit:**
- Der leere Spendenbalken liest sich als „0 gesammelt“ → H-E04.
- Häkchen an Einrichtungen eines Projekts „In Planung“ → H-E04.
- Die aktuelle Schrittmarke unterscheidet sich nur im Farbton → H-E10.

**K-006 (Auslegung offen):** Kontakt hat neun Display-Überschriften, darunter die Begleitkarten-Rubriken → H-E03, nach dem Eintrag in ENTSCHEIDUNGEN.

**Bedienbarkeit Verwaltung** (Rückschritt seit E4): Bei 1440 × 900 verdeckt die Seitenleiste zwei Module (Einstellungen, Styleguide) ohne Rollhinweis, und im Cockpit ist der aktive Eintrag angeschnitten → H-E02.
