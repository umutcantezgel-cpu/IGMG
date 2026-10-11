# DP-A2 Darstellung

DP-A2 · Darstellungsprüfung Gruppe a2 · 7 Seiten · Breiten 390 und 1440 px · Quelle http://localhost:3200 (nur lesend)
Bildschirmfotos (Screenshot-Lauf Exit 0): /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-a/a2/ (14 Dateien)
Referenzen: /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/referenz/
Zwischenausschnitte nur für den Vergleich: /private/tmp/claude-501/-Users-umurey-Downloads-IGMG-Wetzlar-Website-Design/3bf26703-ad10-4298-a6e3-884a4b1631b2/scratchpad/a2/

## Globale Befunde (gelten auf allen Seiten, in den Seitenzeilen mitgezählt)

G1 · alle 7 Seiten · 390 + 1440 · Kartenköpfe: Abstand Überschrift zu Inhalt bzw. oberer Innenabstand in der App 5–6 px kleiner (bis 10–11 px bei Trennlinie „Anfahrt“ und „Zahlen und Fakten“); Überschriften brechen teils anders um (z. B. „Über die Ana / Teşkilatı“ statt „Über die Ana Teşkilatı“) · mittel · Karten-Innenabstand und Überschrift-Abstand an die Referenz angleichen · vermutete Dateien: /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/organisation/OrganizationPage.tsx, /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/igmg/Ueberblick.tsx, /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/kontakt/Anfahrt.tsx

G2 · alle 7 Seiten · 390 + 1440 · Fußzeile „Jetzt: Geschlossen“: App zeigt Kreis mit X, Referenz Kreis mit Schrägstrich (am 390-px-Ausschnitt verifiziert) · niedrig · Icon CircleX durch Ban (Kreis mit Schrägstrich) ersetzen · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/fuss/JetztGeoeffnet.tsx (Zeile 25)

G3 · alle Seiten im 1440-px-Bild (verifiziert an /kontakt) · 1440 · Fußzeile, letzte Spalte: Überschrift „Webseite für Ihre Moschee“ bricht anders um (App „Webseite für / Ihre Moschee“, Referenz „Webseite für Ihre / Moschee“), App-Zeilenhöhe ca. 2 px größer · niedrig · Spaltenbreite bzw. Zeilenhöhe der Überschrift angleichen · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/Footer.tsx

## /kontakt (Referenz: Contact)

K1 · 390 + 1440 · Anfahrt-Einträge „Öffentliche Verkehrsmittel“, „Mit dem Auto“, „Zu Fuß“ in Serifenschrift; Referenz Sans-Serif fett · hoch · font-sans am Titel setzen (h3 ohne Schriftfamilie) · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/kontakt/Anfahrt.tsx (Zeile 38)

K2 · 390 + 1440 · Kartenplatzhalter: App zeigt zusätzlich „Die Karte wird eingebunden, sobald die Lage der Moschee bestätigt ist. [Koordinaten fehlen]“; Referenz nur „Karte: Anfahrt [Adresse]“ · niedrig · Hinweis bewusst übernehmen oder Referenz ergänzen (Entscheidung nötig) · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/kontakt/KarteNachKlick.tsx (Platzhalter, Zeilen 15–45), Texte in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/messages/bereiche/kontakt.json

## /igmg (Referenz: IGMGInfo)

I1 · 390 + 1440 · Kennzahlen „518“ und „350.000“ in Monospace; Referenz fette Sans-Serif · hoch · Zahlen-Schrift auf Sans-Serif fett umstellen; Ursache prüfen: Klasse tabular-nums könnte mit einer Mono-Regel in globals.css zusammenwirken · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/igmg/Ueberblick.tsx (Zeile 44)

I2 · 1440 · Abstand Hauptbereich zur Fußzeile ca. 10 px größer (App 96 px, Referenz 86 px); Ursache nicht sicher zuzuordnen · niedrig · Abschnittspolster prüfen · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/igmg/Ueberblick.tsx

## /organisationen/ana-teskilati (Referenz: AnatolianOrganization)

A1 · 390 + 1440 · Karte „Unsere Mission“: grüner Akzentbalken oben fehlt (Referenz ca. 5 px) · hoch · Akzentband wie im Kontakt-Block (h-1.5 mit Organisationsfarbe) an die Missionskarte setzen · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/organisation/OrganizationPage.tsx (Zeile 89)

A2 · 390 + 1440 · Missionskarte zu niedrig: letzter Textabschnitt wird unten abgeschnitten („ständigung fördern.“ bzw. „kulturelle Verständigung fördern.“), Vision-Karte bekommt ca. 80 px Leerraum · hoch · Missionskarte nicht per flex-1 und overflow-hidden in die Restgröße zwingen; Höhe am Inhalt ausrichten · OrganizationPage.tsx (Zeile 89)

A3 · 390 + 1440 · Titel der Aktivitäten-Karten („Kulturelle Veranstaltungen“, „Bildungsprogramme“, „Gemeinschaftsdienst“, „Jugendarbeit“) in Serifenschrift; Referenz Sans-Serif fett · hoch · font-sans am Titel-Element setzen · OrganizationPage.tsx (Zeile 126)

A4 · 1440 + 390 · „Kommende Veranstaltungen“: große EventCards (Kategorie-Tag, Veranstalter, Detailzeilen, „Mehr erfahren“) mit Serif-Titeln; Referenz kompakte Liste (Sans-Titel, Datumspille mit Uhrzeit, Beschreibung, Trennlinie) · hoch · für Organisationsseiten eine kompakte Listenvariante vorsehen statt EventCard · OrganizationPage.tsx (Zeile 151) und /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/EventCard.tsx (Titel, Zeile 94)

## /organisationen/kadin-teskilati (Referenz: WomensOrganization)

W1 · 390 + 1440 · Missionskarte: Akzentbalken (Lila) oben fehlt · hoch · wie A1
W2 · 390 + 1440 · Missionskarte: Text abgeschnitten („wahren.“ im 1440er-Bild, „ligiösen Prinzipien wahren.“ im 390er-Bild) · hoch · wie A2
W3 · 390 + 1440 · Aktivitäten-Titel in Serifenschrift · hoch · wie A3
W4 · 390 + 1440 · Veranstaltungen als EventCards statt kompakter Liste · hoch · wie A4

## /organisationen/genclik-teskilati (Referenz: YouthOrganization)

Y1 · 390 + 1440 · Missionskarte: Akzentbalken (Türkis) oben fehlt · hoch · wie A1
Y2 · 390 + 1440 · Aktivitäten-Titel in Serifenschrift · hoch · wie A3
Y3 · 1440 · Veranstaltungen als EventCard („Jugendgruppe Treffen“ mit Detailzeilen) statt kompakter Liste (Referenz: „Winter-Fußballturnier“, „Gaming & Tech Night“, „Jugend-Silvesterfeier“); 390 nur im Kopfbereich geprüft, gleiche Komponente · hoch · wie A4
Y4 · 390 + 1440 · Missionskarte gestaucht: unterer Innenabstand ca. 10 px statt ca. 30 px, Vision-Karte gestreckt; aktuell nicht abgeschnitten · mittel · Höhe am Inhalt ausrichten · OrganizationPage.tsx (Zeile 89)

## /organisationen/kadin-genclik-teskilati (Referenz: WomensYouthOrganization)

Z1 · 390 + 1440 · Missionskarte: Akzentbalken (Magenta) oben fehlt · hoch · wie A1
Z2 · 390 + 1440 · Missionskarte: Text abgeschnitten („rungen in der Gesellschaft bewirken.“ im 1440er-Bild, „sellschaft bewirken.“ im 390er-Bild) · hoch · wie A2
Z3 · 390 + 1440 · Aktivitäten-Titel in Serifenschrift · hoch · wie A3
Z4 · 1440 + 390 (Kopfbereich) · Veranstaltungen als EventCards statt kompakter Liste · hoch · wie A4

## /bildung/korankurse (Referenz: QuranCourses)

Q1 · 390 + 1440 · Kurskarten: blaue Hinweisbox fehlt (Referenz: „Außerhalb der Schulferien – Voranmeldung über Schüler-Voranmeldung“ bzw. „Einfach zur angegebenen Zeit erscheinen – für alle Kenntnisstufen“). Die CourseCard hat kein Hinweis-Element; der Schulferien-Text kommt in Code, Messages und Seeds nicht vor · hoch · Hinweisfeld im Kursmodell ergänzen und als Infobox rendern · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/CourseCard.tsx, Texte in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/messages/bereiche/korankurse.json

Q2 · 390 + 1440 · Icons: Status-Badges („Voranmeldung erforderlich“, „Keine Anmeldung erforderlich“) und Liste „Voraussetzungen“ zeigen Kreis mit Häkchen; Referenz einfacher Kreis · niedrig · Circle statt CircleCheck verwenden · CourseCard.tsx (Zeile 37) und /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/korankurse/AllgemeineInformationen.tsx (Zeile 17)

## Nicht als Befund gewertet

- Gebetszeitenleiste: „berechnet“ statt „Beispielzeiten“, Uhrzeiten und Position der Karte „Nächstes Gebet“ (bekannt bzw. zeitabhängig).
- Brotkrumen mit zusätzlichem Schritt („Organisationen“, „Bildung“); bei 390 px daher zweizeilig (bekannt).
- Fußzeile ohne „AGB“; Copyright 2026 statt 2025 (bekannt bzw. aktuelles Datum).
- Platzhalter in eckigen Klammern (gewollt): „[Zahl fehlt: Zweigstellen]“, „[Text fehlt: organisation.news.leer]“, „[E-Mail]“, „[Telefonnummer]“, „[Adresse]“; „Foto: …“.
- Button „Kontakt“ auf den Organisationsseiten fehlt, wenn keine E-Mail gepflegt ist (OrganizationPage.tsx, Kontakt-Block ab Zeile 188, Button nur bei gesetzter Adresse). Datenbedingt. Soll der Button auch ohne E-Mail erscheinen, wäre das ein Befund (hoch); Entscheidung nötig.
- Dritte Kurskarte „Hafiz Vorbereitungskurs“ fehlt in der App; E-Mail-Adressen und Veranstaltungs- und Nachrichtentexte sind Beispielinhalte.
- Leere Logo-Kacheln in den Organisationskarten im 390-px-Bild (Gençlik und Kadın-Gençlik; Ana-Logo sichtbar). Die Logo-Adressen antworten mit HTTP 200, die Bilder sind `loading="lazy"`, und im 1440er-Bild sind sie vorhanden. Vermutlich Aufnahmeartefakt. Gegenprobe: Seite im 390-px-Viewport scrollen und neu aufnehmen.

## Grenzen der Prüfung

- Vergleich an Ausschnitten im Originalmaßstab; Abstandswerte auf etwa ±2 px genau.
- 390 px: Kopf-, Karten- und Fußbereich wurden bei allen Seiten geprüft. Bei Gençlik, Kadın-Gençlik und Korankurse fehlen Teile des Referenzbildes (mittlere und untere Abschnitte). Die Befunde beruhen auf denselben Komponenten wie die vollständig geprüften Seiten.
- Keine Projektdateien geändert, nur gelesen (Quellsuche, Aufruf des laufenden Servers). Kein Commit, kein Build, keine Berichtsdatei. Die Datei ~/Downloads/CLAUDE.md gehört zu einem anderen Projekt und wurde ignoriert.

/kontakt · ja · hoch 1 / mittel 1 / niedrig 3
/igmg · ja · hoch 1 / mittel 1 / niedrig 3
/organisationen/ana-teskilati · ja · hoch 4 / mittel 1 / niedrig 2
/organisationen/kadin-teskilati · ja · hoch 4 / mittel 1 / niedrig 2
/organisationen/genclik-teskilati · ja · hoch 3 / mittel 2 / niedrig 2
/organisationen/kadin-genclik-teskilati · ja · hoch 4 / mittel 1 / niedrig 2
/bildung/korankurse · ja · hoch 1 / mittel 1 / niedrig 3
=== ENDE DP-A2 · BEREIT ZUR RÜCKGABE ===
