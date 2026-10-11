C10 · Kundschafter · Phase P0 · Kern-Version 1.0 · Komponentenblatt PersonCard

# Komponentenblatt PersonCard

## SEITE
Komponente PersonCard, gemeinsamer Baustein (Laufbuch:184). Eingebunden auf 04.2 Vorstand (Laufbuch:161). Der Bestand kennt keinen Komponentennamen; die Karten stehen inline in BoardMembers.tsx:358–447 (Chronik) und 491–553 (Vorstand).

## ROUTE
Ziel „Vorstand“, Seite BoardMembers (Laufbuch:161, 307). Lokalisierte Pfade für DE, TR und EN stehen nicht in den Quellen.

## QUELLEN
- Design: PersonCard.dc.html (Template Zeilen 1–42, Script 43–58), vollständig gelesen.
- Bestand: uploads/igmg-wetzlar-website/src/app/components/BoardMembers.tsx, vollständig gelesen.
- Hilfen: readme.md (Alias „readme“), 00 Laufbuch.dc.html (Alias „Laufbuch“), vollständig gelesen.
- Icon.dc.html nur per Suche nach fünf Icon-Namen geprüft.

Zeilen ohne Dateinamen beziehen sich auf PersonCard.dc.html.

## ZWECK
Karte für eine Person im Vorstand: Name, Funktion, Amtszeit, Aufgaben oder Errungenschaften, Kontakt. Varianten board und leader (:43, :52). Karte weiß, 1-px-Linie #DFDAD2, Radius 12 (readme:20; Laufbuch:182).

## ABSCHNITTE
1. Karte: Flex-Spalte, Abstand 16 px, Innenabstand 24 px (:15).
2. Kopf: Initialen-Kreis 56 px, aria-hidden (:17); Name als h3, 24 px (:19); Pillen Aktuell, Funktion, Seit (:21–23).
3. Zeitraum mit Kalender-Icon 20 px, fett (:27).
4. Liste: h4 mit Icon 16 px, Aufzählung (:28–33).
5. Kontakt: Trennlinie, h4, Mail-Link mit min-height 44 px, Telefon als Text (:34–40).

Eingebunden: dc-import Icon viermal (:27, 30, 37, 38).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| personCard.badge.current | Aktuell | – (nur DE in Quelle) | – (nur DE in Quelle) | :21; BoardMembers.tsx:410 |
| personCard.badge.since | Seit {{ since }} | – (nur DE in Quelle) | – (nur DE in Quelle) | :23; BoardMembers.tsx:515 |
| personCard.list.board | Aufgabenbereiche: | – (nur DE in Quelle) | – (nur DE in Quelle) | :52; BoardMembers.tsx:524 |
| personCard.list.leader | Errungenschaften | – (nur DE in Quelle) | – (nur DE in Quelle) | :52; BoardMembers.tsx:434 |
| personCard.contact.title | Kontakt: | – (nur DE in Quelle) | – (nur DE in Quelle) | :36; BoardMembers.tsx:537 |
| personCard.placeholder.name | [Name] | – (nur DE in Quelle) | – (nur DE in Quelle) | :46 |
| personCard.placeholder.role | [Funktion] | – (nur DE in Quelle) | – (nur DE in Quelle) | :46 |
| personCard.placeholder.since | [Jahr] | – (nur DE in Quelle) | – (nur DE in Quelle) | :46 |
| personCard.placeholder.item | [Aufgabe] | – (nur DE in Quelle) | – (nur DE in Quelle) | :46 |
| personCard.placeholder.email | [E-Mail-Adresse] | – (nur DE in Quelle) | – (nur DE in Quelle) | :46 |
| personCard.placeholder.phone | [Telefonnummer] | – (nur DE in Quelle) | – (nur DE in Quelle) | :46, 53 |

## DATEN
Vorschlag (A7). Felder laut tsType (:43):

| Feld | Typ | mehrsprachig | Hinweis |
|---|---|---|---|
| name | Text, Pflicht | nein | Personenname |
| role | Text | ja | Funktion; Rückfall auf DE (K-02) |
| since | Text | nein | Jahr |
| period | Text | nein | Zeitraum |
| current | ja/nein | nein | aktuelle Amtszeit |
| list | Text-Liste | ja | Aufgaben oder Errungenschaften |
| email | Text | nein | Kontaktblock nur mit E-Mail |
| phone | Text | nein | – |
| sortierung (abgeleitet) | Zahl | nein | Chronik-Reihenfolge |

Bestand heute hart im Code: 12 Chronik- und 6 Vorstandseinträge (BoardMembers.tsx:27–165, 167–270).

## FORMULARFELDER
– (entfaellt, keine Eingabefelder; Zeilen 9–42)

## INTERAKTIONEN
- E-Mail: mailto-Link aus item.email, öffnet das Mailprogramm (:37, 53). Im Bestand nur Text (BoardMembers.tsx:541).
- Telefon: nur Text, kein Link (:38; BoardMembers.tsx:545).
- Keine Klick-, Hover- oder Ausklappaktion (abgeleitet).
- Tastatur: Mail-Link fokussierbar; Fokus 2 px #0E3929 mit 2 px Abstand (:13; readme:21).

## ZUSTAENDE
Eigenschaften aus data-props (:43) und renderVals (:46–54):
- $preview: 380 × 440, nur für die Vorschau (:43).
- variant: board (Default) oder leader; steuert Listentitel und Icon (:52). Unbekannte Werte wirken wie board (abgeleitet).
- item: ohne Angabe Platzhalter [Name], [Funktion], [Jahr], [Aufgabe], [E-Mail-Adresse], [Telefonnummer], ohne Zeitraum und Aktuell (:46).
- item.name: Pflicht, kein Fallback (:50); ohne Wert leere Initialen (:48).
- item.current: Default nein; ja zeigt Pille Aktuell und Rahmen 2 px #047857 statt 1 px #DFDAD2 (:21, 54).
- item.role, since, period, list: Default leer; leer blendet Pille, Zeitraum bzw. Liste aus (:22–28, 50–52).
- item.email: Default leer; leer blendet den Kontaktblock samt Telefon aus (:34, 53).
- item.phone: Default [Telefonnummer]; nur sichtbar bei gesetzter E-Mail (:38, 53).
- Editor-Vorschau (hint-placeholder-val, :21–34) zeigt Aktuell, Seit, Zeitraum und Kontakt nicht, der Default dagegen eine E-Mail (:46). Default-mailto enthält „[E-Mail-Adresse]“ (abgeleitet, :53).
- Bestand: Leader aktuell mit Pille (BoardMembers.tsx:159, 408–412); Leader ehemalig mit Statuslabel positions.former (BoardMembers.tsx:420–426), im Design fehlt dieser Zustand; ohne Errungenschaften kein Block (BoardMembers.tsx:430); Bildfehler mit Fallback (BoardMembers.tsx:376, 499).
- Laufbuch:152 nennt Hover; im Artboard fehlt er. Fehler, deaktiviert und ausgewählt entfallen (keine Eingabe).
- Imports HoverCard und HijabWomanIllustration (BoardMembers.tsx:6–7) sind ungenutzt; kein Zustand belegt.

## BILDER
- Kein Foto. Initialen-Kreis, Hintergrund #EBF9F2, Text #065F46 (:17); Initialen aus dem Namen (:48, abgeleitet).
- Bestand: Fotos 40 px und 128 px aus Unsplash-Adressen (BoardMembers.tsx:376–380, 499–503), nicht übernommen (Laufbuch:34, 233). Farbverläufe im Bestand (BoardMembers.tsx:183, 495, 504) entfallen laut readme:22.
- Icons (Icon.dc.html Zeilen 16, 30, 34, 51, 74 vorhanden): calendar 20 px (:27); award oder building-2 16 px (:30); mail und phone 16 px (:37, 38).
- Kontrast, abgeleitet nach WCAG-Formel: Aktuell 5,48:1; Funktion 6,98:1; Seit 7,46:1; Text 17,32:1.

## AUFFAELLIGKEITEN
1. Zeilenhöhe: Design 1,5 (:15); readme:19 und Laufbuch:183 verlangen 1,6 bei 18 px.
2. Icons: Design 16 px (:30, 37, 38); readme:28 nennt 20/24 px.
3. Linkhöhe: Design 44 px (:37); readme:21 verlangt 48 px für Bedienelemente; K-11 nennt 44 px.
4. Hover: Design ohne Hover (:15); Bestand hebt Karten an und vergrößert den Schatten (BoardMembers.tsx:494); readme:20 verlangt „keine Sprünge“. Design gilt.
5. Schrift: Bestand 12–14 px (BoardMembers.tsx:409, 528, 539–546) liegt unter 16 px (readme:19). Design gilt mit 16 px.
6. Telefon: Laufbuch:244 sagt „Telefonnummern fehlen“; der Bestand hat Telefonfelder, z. B. Beispielwert (BoardMembers.tsx:179), und Laufbuch:226 nennt einen. Widerspruch im Laufbuch.
7. Initialen per toUpperCase (:48): ein kleines i am Namensanfang ergibt I statt İ (readme:15; abgeleitet).
8. Zeitraum: Bestand „1975 - 1979“ und „2025 - Heute“ (BoardMembers.tsx:30, 157); readme:12 nennt für Zeitspannen den en-Dash ohne Leerzeichen. „Heute“ nur DE.

## OFFENE FRAGEN
1. Soll ehemaligen Mitgliedern ein Statuslabel gezeigt werden (BoardMembers.tsx:425)? Der Text kommt aus dem Sprachkontext, dessen Datei nicht im Paket ist.
2. Gilt für Links 44 px (K-11) oder 48 px (readme:21), für Text 1,5 oder 1,6?
3. Ist der Initialen-Kreis als Porträt-Ersatz gewollt? D-01 bis D-16 regeln das nicht; Alternative wäre ein beschrifteter Bildplatzhalter (readme:22).
4. Soll das Telefon auch ohne E-Mail erscheinen (:53)?
5. Dürfen Zeitraum und Seit-Jahr zusammen stehen? Der Bestand nutzt je Karte nur eines (BoardMembers.tsx:414, 515).
6. Ist [Name – Chronik 1979–1981] (BoardMembers.tsx:40) dieselbe Person wie [Name – Chronik 1983–1989] (BoardMembers.tsx:62)?
7. Welche TR- und EN-Fassungen gelten für Aktuell, Seit, Kontakt:, Aufgabenbereiche:, Errungenschaften und „Heute“?
8. Soll der Hover-Zustand ergänzt werden, und welche Pfade gelten für Vorstand in DE, TR und EN?
9. Stimmen die Inline-Hexwerte mit 01 Grundlagen und tokens/colors.css überein (Z-04)? Nicht geprüft.

=== ENDE C10 · BEREIT ZUR RÜCKGABE ===
