# KERN 3.0 – Gemeinde-Plattform

Gilt zusätzlich zu `_archiv/lauf-gestaltung-2026-10/KERN.md` (K-001…K-0xx des Vorlaufs, bis 14.10.2026 `_werkstatt/KERN.md`) und `web/docs/MUSTER.md`. Bei Widerspruch gilt dieser Kern.

## Leitidee (K-001 v3)
„Die Website lebt im Takt des Tages und im Weg des Lernens: Die sechs Gebetszeiten geben den Tag vor, der Achtstern die Ordnung,
und jeder Schritt vom ersten Buchstaben bis zum Hatim ist ein sichtbarer Weg – warm wie Papier, ruhig wie ein Lehrraum.“

## Unantastbar
- Logos, Wortlaut der bestehenden Rechtstexte (Prüfung `wortlaut.mjs`), religiöse Quellenregeln, Logik der Moschee-Gebetszeiten
  (Änderung nur per ADR + Imam), Prüfungen des Cockpits.

## Religion (ADR 0030)
- Kein Agent schreibt Verse, Hadithe, Bittgebete, Übersetzungen, Wortbedeutungen, Tajwid- oder Fiqh-Erklärungen.
- Arabisch nur aus importierten Dateien (`web/daten/**`, gepinnt mit SHA-256 und `QUELLE.md`) oder aus Codepunkten (Alphabet).
- Freigabe: Entwurf → zur Prüfung → geprüft (Rolle `religioese_pruefung`). Jede Änderung setzt zurück. Öffentlich nur „geprüft“.
- Unverändert importierte Ausgaben werden einmal je Ausgabe freigegeben (Spalten `aktiv`, `freigegebenVon/Am`).
- Prüfwerkzeug `_gemeinde/werkzeuge/religion-pruefung.mjs`: arabische Schrift außerhalb von `web/daten/**`, der Alphabetdatei
  `web/src/lib/elifbe/alphabet.ts` und der Tests ist Rot.

## Daten und Rechte
- Zwei Ebenen: Verwaltung (`rolle_zuweisung`, `darf()`), Gemeinde (`gemeinde_rolle`: gemeinde, eltern, lehrkraft, schueler) + Gruppenbezug.
- Chat-Inhalte nie über „Administration darf alles“ (`NIE_PER_ADMINISTRATION`).
- Sitzung absolut: Verwaltung 8 h, Lehrkraft/Kind 12 h, sonst 30 Tage. Lehrkraft und Verwaltung: TOTP Pflicht.
- Kinder < 16: Konto nur mit Elterneinwilligung, Benutzername statt E-Mail (`k-…@konto.invalid`, Mail-Ausgang weist `.invalid` ab).
- Funktionsschalter (ADR 0035): alles mit Personendaten ist in Produktion aus, bis Menschen freigeben.

## Gestaltung
- Neue Tokens nur als Skalen: `--font-quran`, `--text-arabisch-1/2/3`, `--color-tajwid-*` (≥ 4,5:1, mit Unterstreichungsmuster),
  `--container-lesen`, `--ebene-player`.
- Formensprache: Achtstern, 24-px-Raster, 2-px-Strich; keine Mondsichel, keine Kuppel, keine generierten Moscheebilder, kein 3D.
- Strukturwerte ohne eigenes Token (Rasterschablonen, Auslauf-Masken, Mindesthöhe in Zeilen, Container-Schwelle) stehen als
  `@utility` bzw. `@custom-variant` in `globals.css`, Maße aus der Abstandsskala (Stufe C, N2: `raster-aktion`,
  `raster-symbol-aktion`, `raster-drei-zwei`, `raster-seitenleiste`, `raster-formularspalte`, `raster-kleinkacheln`,
  `min-h-zeilen-*`, `auslauf-*`, `buchstabe-form`, `kennzahl-fliessend`, `transition-strich`, `leiste-breit:`). Keine
  Klammerwerte in Klassen; `freie-werte.mjs` über die seit b702c7c geänderten Dateien: 0 offen.
- Bewegung: nur CSS, jede mit reduzierter Variante; Register B-01…B-27 (AUFTRAG §4). Keine hochzählenden Zahlen, keine Ranglisten.

## Leistung
- Öffentlich ≤ 180 KB gz JS je Route; Interaktion erst nach Nutzeraktion per `import()`. Al-Baqara: HTML ≤ 150 KB gz.
- Öffentliche Seiten statisch, keine Cookies/Header; Konto-Seiten dynamisch, Nonce-CSP, noindex, no-store.

## Datenfluss
- Keine Drittanbieter-Anfragen auf öffentlichen Seiten. Standort nur im Browser (nie Koordinaten ins Netz).
- Push nur nach Opt-in; Nutzlast ohne Inhalte und Namen.

## Bewegungsregister (Fortschreibung, K-007)
Pfade unter `web/src/components/` (Website: `website/…`). Alle Bewegung ist reines CSS; der Block „Reduzierte Bewegung“ in
`globals.css` setzt zusätzlich jede Animation und jeden Übergang auf 0,01 ms. Bestand E5 (Bestandsaufnahme O-B01).

| ID | Bewegung | Umsetzung | Reduziert |
|---|---|---|---|
| B-01 | Fortschreibung Druck-Rückmeldung (Stufe C, Z-05): gedrückt 98 %, weich über `transition`; Hover-Pfeile rücken 4 px nach rechts | Utility `druck` in `globals.css` (Skalierung nur in `@media (prefers-reduced-motion: no-preference)`) statt `active:scale-98` an 146 Stellen; Pfeile `motion-safe:group-hover:translate-x-1`; Regeltest `tests/unit/bewegung-regeln.test.ts` verbietet `active:scale-*` und Größe/Lage auf Hover, Fokus oder Druck ohne `motion-safe:` | nur Farbe, keine Größen- oder Lageänderung |
| B-07 | Fortschreibung Weg der Gemeinde (Über uns, „B-07 mit Eröffnung“, H-B09): Die letzte Station ist das Ziel des Wegs (heute „Eröffnung der neuen Fatih-Moschee“) – tiefgrüne Marke mit hellem Achtstern-Hof (außerhalb des Layouts), Karte grün gerahmt; jede Station tritt hervor, wenn die Linie sie erreicht (Punkt mit `--i` + 0,5 = Ende des Abschnitts davor). Fehlt die Eröffnung in einem Beispielstand (Zeitleiste endet 2019), hängt `pnpm inhalte:2026` sie an | `website/ueber-uns/Zeitleiste.tsx` (`weg-punkt`, `weg-linie`), Auslöser `ErstesSichtbarwerden`; `lib/inhalt/stand-2026.ts` (`ueberUnsNeu`) | Endzustand |
| B-08 | Fortschreibung Meilensteinlinie: Ist alles erledigt, endet die Linie in der gefüllten Marke „Eröffnung“ (Achtstern mit Haken) | `website/projekte/Meilensteine.tsx` (`meilenstein-fortschritt`, `meilenstein-erreicht` mit `--anteil: 1` am Ziel), Auslöser `ErstesSichtbarwerden` | Endzustand |
| B-13 | Mitlesen: Vers getönt per opacity, Wort sofort hervorgehoben; Folgen-Scroll nur mit Schalter „Mitlesen folgen“, 2,5 s Ruhe nach eigenem Scrollen | `website/quran/Player.tsx` (CSS Custom Highlight `quran-wort`, Rückfall `.wort-aktiv`), `quran.css` (`.vers::before`, `dauer-wechsel`) | Tönung ohne Übergang, Scrollen `behavior: auto` |
| B-14 | Wortkarte: opacity + scale .96 → 1 vom Wort aus; Telefon: Blatt von unten (translate 24 px) | `website/quran/Wortkarte.tsx` (`--ursprung`), `quran.css` (`.wortkarte`, `@starting-style`) | nur opacity (`dauer-rueckmeldung`) |
| B-15 | Regel-Seitenleiste: Schublade von rechts, Telefon Blatt von unten (Kurven aus B-03) | `website/quran/TajwidLeiste.tsx`, `quran.css` (`dialog.regel-leiste`, `regel-schublade`/`regel-blatt`) | `einblenden` |
| B-16 | Tajwid-Farben an/aus: sofort, ohne Bewegung | `globals.css` (`.tj-*` mit Unterstreichungsmuster), `quran.css` (`data-tajwid='aus'`) | – (keine Bewegung) |
| B-17 | Schreibweg (großer Moment): Züge per `stroke-dashoffset` nacheinander, dann Punkte, ≤ 1,6 s; Glyphe ohne JS sichtbar; „Nochmal schreiben“ | `website/elifbe/Schreibweg.tsx`, `SchreibwegSteuerung.tsx`, `globals.css` (`.schreibweg-zug`, `schreiben`) | Endzustand + nummerierte Zugpfeile (`.schreibweg-pfeile`) |
| B-18 | Übungs-Rückmeldung: richtig → Achtstern füllt sich von unten; falsch → Farbe + Text, ohne Bewegung | `website/elifbe/Uebungen.tsx` (`.stern-fuellt`) | sofort gefüllt |
| B-19 | Hatim-Ring: Fortschrittsbogen zeichnet sich einmal (nur der erste Ring je Bildschirmhöhe); Zahl in der Mitte statisch | `website/hatim/HatimRing.tsx` (`linie-zeichnet`, `--dauer: dauer-moment`, Schalter `zeichnen`), `HatimKarte.tsx` | Endzustand |
| B-20 | Fastenbogen (Ramadan-Variante von B-06): Linie bis „jetzt“ nach der Ruhe, dann Achtstern. Startseite: im Ramadan statt des Tagesbogens (Vorführpfad Station 1); außerhalb nur mit Schalter `ramadan_vorschau` auf Knopfdruck, als Vorschau mit den Zeiten von heute | `website/ramadan/FastenbogenLive.tsx` (`useNachRuhe`, `linie-zeichnet`, `marke-tritt-hervor`) auf `/ramadan` und der Startseite: `website/start/StartBogen.tsx` (Client, wählt nach dem Browserdatum über `bogenwahl.ts`), Ramadan-Tage des Fensters rechnet der Server (`start/ramadan-fenster.ts`, Hidschri `islamic-umalqura`) – ohne Cookies/Header, ohne islamischen Kalender im Browser | Endzustand |
| B-21 | Ortswechsel „Mein Ort“: Zeiten blenden über, Qibla-Nadel dreht einmal | `MeinOrtRechner.tsx` (`blendet-ein`, `transition-transform duration-(--dauer-moment)`) | ohne Drehung |
| B-22 | Neue Nachricht im Gruppenchat: opacity + translateY 8 px, nicht beim ersten Laden; ebenso der Hinweis „Neues“ in Mein Bereich (F-38), nur wenn seit dem letzten Abruf etwas dazukam | `chat/ChatFenster.tsx` (`tritt-auf` ab `neuAb`), `mein-bereich/NeuesHinweis.tsx` (`tritt-auf` am Hinweis) | nur opacity (`einblenden`) |
| B-23 | Anwesenheit: Druck-Rückmeldung, Häkchen zeichnet sich | `unterricht/AnwesenheitErfassen.tsx` (`druck`, Häkchen `linie-zeichnet` mit `--dauer: dauer-wechsel`) | Häkchen steht sofort, Druck nur Farbe |
| B-24 | Lernweg: Linie zeichnet sich von Station zu Station, Station tritt hervor, wenn die Linie sie erreicht | `website/elifbe/Weg.tsx` (`/elifbe`, `/lernen`: `lernweg-welle`, `lernweg-abschnitt`, `lernweg-station`), `mein-bereich/Lernweg.tsx` (Schüler-Start, Linie bis zur aktuellen Station), `website/korankurse/KursWeg.tsx` (Kurs-Lernweg `/bildung/korankurse`, ab md `lernweg-abschnitt-quer`) | Endzustand |
| B-25 | Anzeige-Folien: Überblendung; im Gebetsfenster keine Folien | `website/anzeige/AnzeigeLive.tsx` (Folie mit `blendet-ein`, Dauer `DAUER_FOLIE`; im Gebetsfenster Ezan bis Iqama + Ruhe und im Freitagsmodus keine Folien, nur ein stiller Hinweis), `FolienAnsicht.tsx`; Ruhezeit `src/lib/anzeige/einstellung.ts` | Folie wechselt sofort |
| B-26 | Seitenwechsel mit Richtung: tiefer → von rechts, höher → von links, seitlich → Überblendung; Kopf steht | `SeitenUebergang.tsx` (`data-richtung`), `globals.css` (`seite-von-rechts/links`) | kein Übergang |
| B-27 | Offline speichern: Ring nach echten Bytes (oder Dateien, wenn die Größe offen ist) | `website/quran/OfflineSpeichern.tsx` (`stroke-dashoffset`, `dauer-rueckmeldung`) | ohne Übergang (`motion-reduce:transition-none`) |

**Morph-Paare (B-05/O-13, `website/morph.ts`):** Veranstaltung, Nachricht (Karte → Detail), Surenkachel → Kopf (`quran/SurenRaster.tsx`),
Buchstabenkarte → Glyphe (`elifbe/Buchstabenraster.tsx`), Hadith-Buch → Kopf (`hadith/BuchKacheln.tsx`, `BuchStern.tsx`),
Hatim-Karte → Ring (`hatim/HatimKarte.tsx`). Offen: Wissen-Karte → Kopf (Wissen-Karten öffnen einen Dialog, keine eigene Seite),
Gruppenkarte → Kopf (Mein Bereich hat keinen `Seitenrahmen`, also keinen Seitenwechsel).

**SVG-Programm je Route (Stand E5):**

| Route | Zeichen | Umsetzung |
|---|---|---|
| Veranstaltungen | Wochenband: sieben Tage ab heute an einer Linie, Achtstern-Punkt je Tag mit Terminen, sonst Punkt; statisch | `website/veranstaltungen/Wochenband.tsx`, `wochenband.ts` (Serien inklusive, `heuteBerlin`) |
| Nachrichten | Kategorie-Marken: je Kategorie eine Fläche aus der Achtstern-Geometrie (Raute, Quadrat, vier Spitzen, Quadrat mit Rautenfenster, Achtstern, verschränkte Rauten, Raute mit Fenster; „Wichtig“ Raute mit Ausrufezeichen) in Karten, Filter, Detailkopf, Ankündigungen | `website/nachrichten/KategorieMarke.tsx` (Form statt Farbe, `currentColor`) |
| Korankurse | Kurs-Lernweg, zeichnet sich einmal (B-24) | `website/korankurse/KursWeg.tsx` |
| Voranmeldung | Achtstern-Schrittanzeige | `formular/FormWizard.tsx` (`Schrittmarke`) |
| Kalender, Ramadan | Achtstern-Marken (gefüllt = bestätigt, Umriss = vorläufig), keine Mondsichel | `website/kalender/Marken.tsx` |
| Startseite | Tagesbogen B-06, im Ramadan Fastenbogen B-20; darunter „Unsere neue Moschee ist eröffnet“ (statisch, Bildplatzhalter, Name/Text aus dem Seiteninhalt „projekte“, nur bei Status „fertiggestellt“) | `website/start/StartBogen.tsx`, `Tagesbogen.tsx`, `UnsereMoschee.tsx` |
| Gebetszeiten, Leiste | Tageszeit-Zeichen: Lucide `Sunrise`/`Sun`/`Sunset`, Imsak und Yatsı `Nachtzeichen` (Stern aus den vier Spitzen des Achtsterns + Raute über dem Horizont) statt Mondsichel (MN-27) | `website/gebetszeiten/zeichen.ts`, `website/Icons.tsx` |
| Vorstand | Verbindungslinie der Amtszeiten vom ersten Amtsbeginn bis „Heute“, statisch | `website/vorstand/Amtszeiten.tsx`, `amtszeiten.ts` |
| Hadith | Buchraster mit Morph Buch → Kopf | `website/hadith/BuchKacheln.tsx`, `BuchStern.tsx`, `BuchAnsicht.tsx` |
| `/quran` | Cüz-Ring (Linie zeichnet sich, Segmente blenden in 6 Gruppen zu 5 Cüz ein: 6 Staffelschritte × `staffel`, K-007 ≤ 8; reduziert ohne Bewegung) + Morph Surenkachel → Kopf | `website/quran/CuzRing.tsx` (`--gruppe`, `staffelGruppe`), `quran.css` |
