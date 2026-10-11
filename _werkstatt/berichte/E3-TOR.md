# E3-TOR · Stufe B aller Hauptansichten

Prüfling **93a0b3d** auf Server 3400. Lauf 19:53–20:57 UTC, Schritte 1–8, mit Nachläufen N1–N4. Der Bericht des Prüfers ging durch das Nutzungslimit verloren (20:50). Ausgewertet hat Workflow `wf_fb525305-e2a` mit vier Prüfern, die je einen Bereich übernahmen. Rohdaten: `_werkstatt/protokolle/E3-TOR-*`.

## Ergebnis je Bereich

| Bereich | Grün | Gelb/Rot | Kern |
|---|---|---|---|
| Bildsatz, Überlauf, Konsole, axe | 6/9 | 2 gelb, 1 nicht prüfbar | 0 Überläufe auf 13 Routen × 3 Breiten (normal und reduziert); axe WCAG 2.2 AA: **0 Verstöße** bei 390 und 1440; „unklar“ color-contrast auf 8 Routen wie in E0 (Fotoflächen-Beschriftung über Streifen) |
| Lighthouse und Leistung | 53/91 | Performance auf 0 von 12 Routen ≥ 90; LCP rot auf 5 Routen; TBT überall > 200 ms | A11y, BP und SEO 100 auf allen Routen; CLS grün; JS (Übertragung) 171,8–179,1 kB ≤ 180 |
| Bewegung B-05…B-10 | 1/8 | B-09 Bildrate rot (13,9 % verworfen); B-07 Staffel 9 > 8; mehrere Lücken in der Messung | B-05 löst aus, gemeinsame Elemente vorhanden; reduzierte Bewegung überall sofort im Endzustand |
| Technik | 7/14 | Geheimnisse rot (behoben); SVG 11 Befunde; freie Werte 87 in 9 Dateien | Unit 744/744 (+3 erwartete Fehlschläge), Integration 1407/1407, Sprachen vollständig |

## Ursachen und Maßnahmen

1. **LCP +1,4 s auf /gebetszeiten, /veranstaltungen, /nachrichten, /kontakt.** In den Rohberichten ist das LCP-Element `#hinweis-text` im Konzept-Hinweis, mit 3,3 s Renderverzögerung (E0: 1,8 s). Seit B-03 tritt jeder geöffnete Dialog bei Deckkraft 0 auf. Chrome wertet das LCP deshalb erst beim ersten Neuzeichnen nach der Hydrierung. **Behoben in cf0d4d9:** Ein beim Laden geöffneter Dialog (Klasse `ohne-auftritt`) erscheint sofort. FCP lag nur 60–280 ms über E0, das passt zur Last.
2. **Performance und TBT.** Während der Messung lag die Last bei 4–6 auf 4 Kernen (`E3-TOR-lighthouse-last.txt`). Dazu kommen drei Fehlläufe (NO_NAVSTART), der Nachlauf hat sie ersetzt. Maßgeblich ist die **Paarmessung H-L01** unter ruhigen Bedingungen: Ausgangsstand und HEAD unmittelbar nacheinander. Der JS-Zuwachs beträgt +3,8 bis +8,7 kB gz (`E3-js-vergleich.md`); Kandidat zum Sparen ist die Zustandsgrafik in der globalen Fehlergrenze.
3. **B-09 Bildrate.** Die Maske mit animiertem Kreis erzwang Neuzeichnen je Bild. **Behoben in ae274ac:** Das eigene Segment liegt als eigene Ebene darüber, `scale` läuft am HTML-Element, also nur im Compositor. Das Bild bleibt gleich. Nachmessung in Stufe C.
4. **B-07 Staffel.** Gestaffelt treten 5 Stationen auf, die Linie ist eine Zeichnung. Die Auslegung steht in KERN K-007.
5. **SVG.** Die Komponenten nutzten die JSX-Kurzform `aria-hidden`, das Werkzeug erkennt nur `="true"`. Ausgeschrieben, dazu die Starter-SVG eines früheren Laufs (`_lauf/`) aus der Prüfung genommen: **0 Befunde, 10/10 OK** (ae274ac).
6. **Geheimnis- und Datenschutzprüfung.** Gemeldet wurden Beispiel-Domains in Doku und Startklar-Test. Umgestellt auf `beispiel.de`/`db.example.test` in 8d79ddc, keine Prüfung gelockert. Jetzt ohne Befund.
7. **Freie Werte.** In den geänderten Dateien sind es 87 (E0 in denselben Dateien: 244). Davon stehen 50 in `styleguide/tokens.ts` (Spiegel der Token-Werte, gewollt) und 20 in `globals.css` (Token-Definitionen und Kommentare „statt …“). Offen bleibt die begründete Ausnahme für beide in ABNAHME Z-03.
8. **Konsole.** Auf 12 Routen gibt es 0 Meldungen, auf der 404-Testroute 2 (erwartet). Die Messung bei 1440 und das Werkzeug unter `_werkstatt/werkzeuge` stehen noch aus (Stufe C).
9. **Messlücken für Stufe C:** B-06 bei Tageslicht (Sonne und Achtstern), B-05 Organisationskarte, B-10 reduziert und aufgeklappt, Bildrate als Median aus 3 Läufen in ruhiger Lage, Cockpit-Route in Lighthouse, INP.

## Bilder von HEAD (bc4b5b7, Server 3500)

`$SCRATCHPAD/bilder/head/`: Bildsatz 195 und reduziert 195 (13 Routen × 3 Breiten), **0 Überläufe** (`HEAD-bildsatz*.md`). Dazu Momente 24, Seitenwechsel 2 × 5, Leiste 2 × 5. Verwaltung mit Anmeldung: 8 Bilder unter `_werkstatt/bilder/HEAD-verwaltung/`. `pnpm check` auf bc4b5b7 hatte 1 roten Test (Styleguide-Spiegel), behoben in 5fba6c6.

## Urteil

Stufe B ist **bedingt bestanden**. Barrierefreiheit, Überlauf, Tests und Sprachen sind grün. Die rote Leistung hat eine gefundene und behobene Hauptursache (LCP). Der Rest ist ohne ruhige Paarmessung (H-L01) nicht belastbar. B-09 und die SVG-Auszeichnung sind behoben. Es folgen die Sichtabnahme der Ansichten und die Befundpakete. Danach misst Stufe C auf dem Endstand neu.
