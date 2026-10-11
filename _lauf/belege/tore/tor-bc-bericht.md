# Tor B/C · Prüfberichte (Rohfassung der Prüfer)

##### DP-B Darstellung
DP-B · Darstellungsprüfung Gruppe b · Aufnahmen 11.10.2026, ca. 09:55 Uhr · Produktionsserver http://localhost:3200

Gesamt: 16 Befunde, davon hoch 0, mittel 7, niedrig 9.

Prüfumfang und Grenzen
- Aufnahmen: sieben Seiten in 390 und 1440 px (ganze Seite) mit app-bilder.mjs, Ablage /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-bc/b/ (14 Dateien). Die Aufnahme meldete keine Konsolenfehler. Alle Fotos sind exakt 390 bzw. 1440 px breit, auf Dokumentebene gibt es also keinen waagerechten Überlauf.
- Referenzen: /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/referenz/. Header__open-ticket ist ein Dialog und in beiden Breiten 1280×720 px. Das 1440-Bild zeigt nur den unteren Dialogteil (ohne Vorname, Nachname, Telefon, E-Mail), die 390-Variante einen mobilen Dialog auf 1280×720-Fläche. Der Vergleich für /meldung ist deshalb nur teilweise.
- Nicht ausgewertet: Schritt-2/3- und Zustandsreferenzen (Fehler, Erfolg, leer). Das Werkzeug erfasst nur den Ausgangszustand, der Feldstil wurde an Schritt 1 gemessen.
- Ohne Referenz, gegen Designregeln geprüft: Formular „Schreiben Sie uns“ (A-S11b), /tr/uye-ol und /en/report (nur 390 px), Ankündigungsblock auf /nachrichten (keine Daten).
- Nicht einzeln angesehen, da gleiche Komponente bereits geprüft: Nachrichtenkarten ab Karte 3 bei 390 px; Fußzeile bei 390 px auf /mitglied-werden, /webseite-fuer-moscheen, /tr/uye-ol und /en/report nur anschnittweise.
- Nicht gewertet: laut ABWEICHUNGEN.md gewollte Abweichungen (berechnete Gebetszeiten, Badge „berechnet“, Beispielinhalt-Markierung, Telefon und Organisation optional, fehlende Teilen- und Autorzeile, Fußzeile ohne AGB, Karte erst nach Klick), zeitabhängige Werte (nächstes Gebet, Geöffnet/Geschlossen, Jahreszahl) und Beispieldaten.
- Projektdateien unverändert. Scheiben nur im Scratchpad: /private/tmp/claude-501/-Users-umurey-Downloads-IGMG-Wetzlar-Website-Design/3bf26703-ad10-4298-a6e3-884a4b1631b2/scratchpad/dp-b/. Die Datei ~/Downloads/CLAUDE.md wurde nicht ausgeführt.

Befunde (nach Stufe)

Stufe mittel
- DP-B-01 · /kontakt · 1440 px · Kartenfeld „Karte: Anfahrt“ 339 px hoch, die Karte „Anfahrt“ daneben 383 px. Referenz: beide gleich hoch (ca. 392 px). · mittel · Reparatur: Kartenkasten auf volle Zeilenhöhe strecken (h-full bzw. self-stretch). Vermutlich web/src/components/website/kontakt/Anfahrt.tsx bzw. KarteNachKlick.tsx.
- DP-B-02 · /meldung · 1440 px · Textfeld „Nachricht“ 192 px hoch statt 134 px (Dialog-Referenz). Eigene Seite nach A-C01b, die Höhe ist daher möglicherweise gewollt, steht aber nicht in ABWEICHUNGEN.md. · mittel · Reparatur: Mindesthöhe an die Referenz angleichen oder Abweichung eintragen. Vermutlich web/src/app/[locale]/(website)/meldung/page.tsx.
- DP-B-03 · /meldung · 1440 px · Auswahl „Rückmeldung gewünscht?“ (Ja/Nein) auf halbe Zeilenbreite gestreckt (je ca. 327 px). Referenz: kompakte Felder (93 und 110 px) nebeneinander. · mittel · Reparatur: Optionen in Inline-Breite (w-auto) statt Vollbreite. Vermutlich meldung/page.tsx bzw. die Radio-Gruppe des Meldeformulars.
- DP-B-04 · /webseite-fuer-moscheen · 390 px · Überschrift „Webseite für Ihre Moschee“ bricht „Webseite für Ihre / Moschee“, Referenz „Webseite für / Ihre Moschee“ (ausgewogener Umbruch). · mittel · Reparatur: text-wrap: balance für Überschriften in src/app/globals.css oder im Seitenkopf (src/components/website/PageHeader.tsx bzw. Seitenkopf.tsx).
- DP-B-05 · /tr/uye-ol · 390 px · Schrittleiste: „Motivasyon“ wird mitten im Wort getrennt („Motivasyo“ / „n“). · mittel · Reparatur: Beschriftung bei schmaler Breite ohne Wortbruch (Schrittnummer über dem Text oder weniger Innenabstand). Texte in messages/bereiche/mitglied.json. Die Komponente der Schrittleiste ließ sich nicht eindeutig zuordnen.
- DP-B-06 · /mitglied-werden · 1440 px · Abstand zwischen Hauptbereich und Fußzeile 51 px statt 87 px (Referenz). Bei 390 px 32 statt 49 px. · mittel · Reparatur: unteren Abstand des Seitenbereichs angleichen. Vermutlich web/src/app/[locale]/(website)/mitglied-werden/page.tsx.
- DP-B-07 · /kontakt, /mitglied-werden, /meldung · 390 px · Zweizeilige Überschriften (H2) mit zu engem Zeilenabstand: App ca. 37 px, Referenz ca. 48 px („Besucher willkommen“, „Anmeldung zur Gemeinde“, „Neue Meldung erstellen“). Bei „Anmeldung zur Gemeinde“ bricht die App zusätzlich anders um („Anmeldung / zur Gemeinde“ statt „Anmeldung zur / Gemeinde“). · mittel · Reparatur: Zeilenhöhe der H2 auf den Designwert (ca. 1,6) anheben und die Zeilenhöhe-Token in src/app/globals.css prüfen (dort u. a. 1,25 für die Schriftgröße 30).

Stufe niedrig
- DP-B-08 · /kontakt · 1440 px (390 px gleich) · Abstand von der Hero-Unterkante bis zur ersten Kartenreihe 49 px statt 65 px. · niedrig · Reparatur: oberen Abschnittsabstand um 16 px erhöhen. Vermutlich web/src/app/[locale]/(website)/kontakt/page.tsx.
- DP-B-09 · /mitglied-werden · 1440 px (390 px: 15 px) · Abstand zwischen Hero und „Zurück zur Startseite“ etwa 18 px größer als im Design. · niedrig · Reparatur: oberen Abstand über dem Zurück-Link verringern. Vermutlich mitglied-werden/page.tsx.
- DP-B-10 · /kontakt, /mitglied-werden · 1440 und 390 px · Innenabstand oben in Info- und Vorteilskarten 3 bis 5 px kleiner, der Titel steht höher. Seitlicher Innenabstand stimmt. · niedrig · Reparatur: oberen Kartenabstand um 4 px vergrößern. Vermutlich web/src/components/website/kontakt/KontaktKarten.tsx bzw. die gemeinsame Kartenkomponente.
- DP-B-11 · alle Seiten (Fußzeile) · 1440 px · Spaltenüberschrift „Webseite für Ihre Moschee“ bricht „Webseite für / Ihre Moschee“, Referenz „Webseite für Ihre / Moschee“. · niedrig · Reparatur: Spaltenbreite oder Schriftgröße der Überschrift angleichen. Vermutlich web/src/components/website/Footer.tsx.
- DP-B-12 · /mitglied-werden, /webseite-fuer-moscheen · 1440 und 390 px · Abstand Beschriftung zu Eingabefeld 18 statt 20 px (390 px: 19 statt 21 px), Zeilenabstand der Felder 94 statt 96 px. · niedrig · Reparatur: Abstand Label–Feld um 2 px vergrößern (gemeinsame Formularfeld-Komponente, Fundort über die beiden page.tsx).
- DP-B-13 · /meldung · 1440 und 390 px · Platzhalter „Beschreiben Sie Ihr Anliegen…“ fehlt im Feld Nachricht. Die Referenz zeigt ihn, Vorname, Telefon und E-Mail haben Platzhalter. Textschlüssel ist vorhanden (messages/de.json, textPlaceholder). · niedrig · Reparatur: Platzhalter am Textfeld setzen, sofern kein bewusster Verzicht. Vermutlich meldung/page.tsx.
- DP-B-14 · /mitglied-werden · 390 px · Markierung „[Beispielinhalt]“ im Kasten „Haben Sie Fragen?“ bricht auf eigene Zeile, die Kontaktzeilen wirken dadurch ungleichmäßig. Die Markierung selbst ist gewollt. · niedrig · Reparatur: Markierung im Fließtext halten (Zeilenumbruch prüfen). Texte in messages/bereiche/mitglied.json, Komponente des Kastens.
- DP-B-15 · /en/report · 390 px · Fußzeile zeigt die deutsche Zeitangabe „09:00–22:00 Uhr“ in der englischen Fassung (Text, kein Layout). Auch die anderen Sprachen prüfen. · niedrig · Reparatur: Zeitformat je Sprache. Vermutlich web/src/components/website/Footer.tsx.
- DP-B-16 · /en/report · 390 px · Silbentrennung „need-/ed“ im Einwilligungstext. · niedrig · Reparatur: Trennung prüfen (lang-Attribut, hyphens) oder Satz umformulieren.

Befunde je Seite
- /kontakt · Referenz geprüft: ja (Contact, 390 und 1440); Formular „Schreiben Sie uns“ ohne Referenz, Feldstil passt zu Mitglied werden · hoch 0 / mittel 2 (DP-B-01, DP-B-07) / niedrig 3 (DP-B-08, DP-B-10, DP-B-11)
- /mitglied-werden · Referenz geprüft: ja (JoinUs, Schritt 1; Schritt 2/3 nicht ausgewertet) · hoch 0 / mittel 2 (DP-B-06, DP-B-07) / niedrig 5 (DP-B-09, DP-B-10, DP-B-11, DP-B-12, DP-B-14)
- /webseite-fuer-moscheen · Referenz geprüft: ja (MosqueRequest, Schritt 1) · hoch 0 / mittel 1 (DP-B-04) / niedrig 2 (DP-B-11, DP-B-12)
- /meldung · Referenz geprüft: ja, nur Dialog-Ausschnitt (Header__open-ticket) · hoch 0 / mittel 3 (DP-B-02, DP-B-03, DP-B-07) / niedrig 2 (DP-B-11, DP-B-13)
- /nachrichten · Referenz geprüft: ja (News, 1440 vollständig, 390 Kopf und zwei Karten) · hoch 0 / mittel 0 / niedrig 1 (DP-B-11)
- /tr/uye-ol (390 px) · keine Referenz (Sprachfassung von /mitglied-werden) · hoch 0 / mittel 1 (DP-B-05) / niedrig 0
- /en/report (390 px) · keine Referenz (Sprachfassung von /meldung) · hoch 0 / mittel 0 / niedrig 2 (DP-B-15, DP-B-16)

=== ENDE DP-B · BEREIT ZUR RÜCKGABE ===

##### DP-C1 Darstellung
DP-C1 · Darstellungsprüfung Verwaltung (Gruppe c1)

Lauf: 9 Seiten × 390/1440 px = 18 Bildschirmfotos in /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-bc/c1/ (Dateiname <name>__<breite>.png). Alle 9 Referenzen liegen in beiden Breiten vor (/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/referenz/). Server localhost:3200 antwortete mit HTTP 200, der Lauf meldete keine Konsolenfehler. Das Werkzeug legte ein fiktives Testkonto an (testperson.718d3e3f@example.test, Rolle administration, Zwei-Faktor). Projektdateien wurden nicht geändert, kein Build, kein Commit. Abgleich gegen ABWEICHUNGEN.md.

BEFUNDE

[H1] SEITE: alle 9 Seiten (Seitenleiste) · BREITE: 1440 · ABWEICHUNG: Zähler fehlen bei „Neuigkeiten“ (Referenz 2) und „Ankündigungen“ (Referenz 1). Die App zeigt Zähler nur bei Veranstaltungen, Eingänge, Nachrichten und Tickets. Nicht in ABWEICHUNGEN.md. · STUFE: hoch (Element fehlt) · REPARATURVORSCHLAG: Zählerabfragen für neuigkeiten und ankuendigungen in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/verwaltung/(geschuetzt)/layout.tsx (Zeilen 24–39) ergänzen, oder in ABWEICHUNGEN.md dokumentieren.

[H2] SEITE: Übersicht (/verwaltung) · BREITE: 1440 und 390 · ABWEICHUNG: In „Kommende Veranstaltungen“ fehlen je Termin die Kürzel-Abzeichen GT/KT. Die Referenz zeigt sie in beiden Breiten. A-V01b nennt nur den fehlenden Autor. · STUFE: hoch (Element fehlt, undokumentiert) · REPARATURVORSCHLAG: Organisations-Kürzel je Termin in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/verwaltung/uebersicht/Listen.tsx anzeigen (dort kein Bezug zu Kategorie oder Organisation), oder dokumentieren.

[H3] SEITE: Neuigkeiten (/verwaltung/neuigkeiten) · BREITE: 1440 und 390 · ABWEICHUNG: Die Spalten „Autor“ und „Aufrufe“ fehlen. Die Referenz zeigt beide (z. B. „[Name aus dem Design]“, „245“; Name im Beleg entfernt, G-04). Stattdessen gibt es eine zusätzliche Spalte „Kategorie“. Nicht in ABWEICHUNGEN.md. Vermutlich gewollt (G-07 wie A-V04, G-05 wie A-S06), bitte bestätigen oder dokumentieren. · STUFE: hoch (Element fehlt, undokumentiert) · REPARATURVORSCHLAG: Spaltenliste in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/verwaltung/(geschuetzt)/neuigkeiten/page.tsx (Zeile ~74) prüfen, bei bewusster Entscheidung A-V03 ergänzen.

[M1] SEITE: alle 9 Seiten (Seitenleiste) · BREITE: 1440 · ABWEICHUNG: „Veranstaltungen“ bricht als „Veranstaltun-/gen“ um, der Zähler 13 steht daneben. Hinweis des Auftrags auf allen 9 Seiten bestätigt. Die Seitenleiste ist 280 px breit (min-[900px]:w-70). · STUFE: mittel (unschöner Umbruch) · REPARATURVORSCHLAG: /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/verwaltung/shell/Seitenleiste.tsx, Navigationstext (Zeile ~106, span flex-1): Umbruch unterbinden (whitespace-nowrap, hyphens-none) und/oder Seitenleiste auf min-[900px]:w-75 verbreitern.

[M2] SEITE: Übersicht (390), Neuigkeiten (1440, 390), Veranstaltungen (1440, 390), Neue Ankündigung (390), Neue Neuigkeit (390), Postfach (390), Tickets (390), Neues Ticket (390) · BREITE: 390 und 1440 · ABWEICHUNG: Silbentrennung mitten im Wort, die die Referenz nicht zeigt. Beispiele 1440: „Ankündi-gung“, „Veranstal-tung“, „Allge-mein“, Kopfzeilen „Katego-rie“ und „Teil-neh-mer“, Titel „Erzie-hung“. Beispiele 390: „Vorberei-tung 2025“, „Pro-gramm“, „erwei-tert“, „Anmel-dungen“, „Islami-sche“, „Gemeindeversamm-lung“, „Betei-ligte“, „Nach-richten“, „Mitarbeiten-de“, „Pro-blems“ (Platzhalter). · STUFE: mittel (unschöne Umbrüche) · REPARATURVORSCHLAG: `body { hyphens: auto; }` in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/globals.css (Zeile 164) gilt global. Für die Verwaltung `hyphens: manual` setzen, z. B. im Layout /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/verwaltung/layout.tsx. Wirkung auf die öffentliche Website getrennt prüfen.

[M3] SEITE: Übersicht (/verwaltung) · BREITE: 1440 · ABWEICHUNG: Der Zähler „Veranstaltungen“ in der Seitenleiste zeigt 13, die Kachel 5 („bevorstehend und veröffentlicht“). Der Zähler zählt alle Einträge außer dem Papierkorb, darunter 8 „Vergangen“. Die Referenz zeigt gleiche Zahlen (2 und 2). · STUFE: mittel (sichtbar andere Zahl) · REPARATURVORSCHLAG: Zählung in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/queries/verwaltung/veranstaltungen.ts (zaehleVeranstaltungen, Zeilen 109–115) auf „kommend und veröffentlicht“ umstellen oder die Kachel auf die Gesamtzahl setzen. Entscheidung nötig.

[M4] SEITE: Neue Ankündigung (/verwaltung/ankuendigungen/neu), Neue Neuigkeit (/verwaltung/neuigkeiten/neu) · BREITE: 1440 · ABWEICHUNG: Zwei Felder nebeneinander stehen nicht auf gleicher Höhe, wenn nur eines einen Hinweistext hat (Maße geschätzt aus dem Bild). Ankündigung: „Priorität“/„Organisation“ rund 30 px, „Sichtbar ab: Datum“/„Uhrzeit“ rund 50 px. Neuigkeit: „Kategorie“/„Organisation“ rund 27 px, „Status“/„Veröffentlichen am“ rund 26 px. · STUFE: mittel (sichtbar andere Abstände) · REPARATURVORSCHLAG: Gemeinsamen Feldbaustein /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/verwaltung/Feld.tsx mit fester Mindesthöhe für die Hinweiszeile versehen, oder Hinweis unter das Feld setzen. Betroffen: /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/verwaltung/ankuendigungen/AnkuendigungsFormular.tsx und das Neuigkeiten-Formular (Datei nicht ermittelt).

[N1] SEITE: Neuigkeiten, Veranstaltungen · BREITE: 390 · ABWEICHUNG: Datumstexte am Kartenrand abgeschnitten („Juli 202“, „Okt. 202“). Aktionen und Status liegen außerhalb und sind nur durch seitliches Wischen erreichbar. Die Referenz zeigt dasselbe Abschneiden, und der Container ist `overflow-x-auto` (kein Seitenüberlauf). Kein sichtbarer Scroll-Hinweis. · STUFE: niedrig (Hinweis) · REPARATURVORSCHLAG: Optional Kantenhinweis am Tabellenrand ergänzen, in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/verwaltung/(geschuetzt)/neuigkeiten/page.tsx (Zeile 68) und veranstaltungen/page.tsx (Zeile 69).

[N2] SEITE: Tickets · BREITE: 1440 und 390 · ABWEICHUNG: Der Leerzustand erscheint doppelt: die Zählzeile „Keine Tickets“ über der Box und darunter „Noch keine Tickets vorhanden.“ · STUFE: niedrig · REPARATURVORSCHLAG: Zählzeile nur bei vorhandenen Tickets zeigen, in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/verwaltung/(geschuetzt)/tickets/page.tsx. Meldung `anzahl` in messages/verwaltung/tickets.json.

[N3] SEITE: Tickets · BREITE: 390 · ABWEICHUNG: „Filter zurücksetzen“ ist gegenüber den Feldern eingerückt, Status- und Priorität-Feld sind ungleich breit. · STUFE: niedrig · REPARATURVORSCHLAG: Filterleiste in tickets/page.tsx (Zeilen ~70–90) auf einheitliche Feldbreite und Kante ausrichten.

[N4] SEITE: Tickets · BREITE: 1440 · ABWEICHUNG: Der Einleitungstext endet in Zeile 2 mit dem Einzelwort „Verwaltung.“ · STUFE: niedrig · REPARATURVORSCHLAG: Textbreite begrenzen oder Umbruch anpassen (tickets/page.tsx, Einleitung).

NICHT GEMELDET (dokumentiert oder Beispielinhalt)
- Kopf, Fußzeile, Brotkrumen und Gebetszeitenleiste der Verwaltung (A-V01). Seitenleiste mit Modulen über das Design hinaus (A-V05 bis A-V14).
- Eigene Seiten statt Dialoge, mit erweitertem Feldumfang (A-V02, A-V03, A-V04, A-V10).
- Übersicht mit 6 Kacheln statt 4, Listen ohne Autor (A-V01b).
- Tabellen mit Kategorie als Kürzel plus Kategorie, Veröffentlichungsstand und Beispielabzeichen (A-V02b, A-V02d). Ankündigungs-Spalten (A-V04). Tickets als Tabelle (A-V10).
- Postfach ohne Suche, Avatare und Online-Punkt (A-V09).
- Texte, Zahlen, Termine und Platzhalter in eckigen Klammern (Beispieldaten).

HINWEISE (kein Darstellungsbefund)
- Neuigkeiten zeigt den Reiter „Papierkorb“. A-V03 nennt den Papierkorb „serverseitig gesperrt“. Bitte klären.
- Das Ticket-Formular hat das Feld „Organisation“, die Referenz nicht. Nicht in ABWEICHUNGEN.md genannt.
- Datumsfelder zeigen mm/dd/yyyy bzw. --:-- --, Browser-Locale der Aufnahme. Die Referenz zeigt dasselbe.
- Die Referenz-Dialoge bei 390 px sind unten abgeschnitten (Schaltflächen nicht sichtbar). Fehler der Referenz, nicht der App.

NICHT GEPRÜFT
- Schriftgrößen, Abstände und Farben nicht pixelgenau gemessen, nur Sichtvergleich.
- Die Seitenleiste bei 390 px liegt hinter „Menü öffnen“ und wurde nicht geöffnet.
- Fehler- und Fokuszustände sowie Dialoge (Papierkorb-Rückfrage) nicht erzeugt. Ticket-Detail und Tabellen mit Daten nicht gezeigt, das Testkonto hat keine Inhalte (Leerzustände ohne Befund).

SEITENZUSAMMENFASSUNG
- Übersicht (/verwaltung) · Referenz geprüft: ja (Dashboard) · Befunde hoch 2 / mittel 3 / niedrig 0
- Neuigkeiten (/verwaltung/neuigkeiten) · Referenz geprüft: ja (Dashboard__section-news) · Befunde hoch 2 / mittel 2 / niedrig 1
- Neue Neuigkeit (/verwaltung/neuigkeiten/neu) · Referenz geprüft: ja (Dashboard__dialog-neuigkeit) · Befunde hoch 1 / mittel 3 / niedrig 0
- Veranstaltungen (/verwaltung/veranstaltungen) · Referenz geprüft: ja (Dashboard__section-events) · Befunde hoch 1 / mittel 2 / niedrig 1
- Ankündigungen (/verwaltung/ankuendigungen) · Referenz geprüft: ja (Dashboard__section-announcements) · Befunde hoch 1 / mittel 1 / niedrig 0
- Neue Ankündigung (/verwaltung/ankuendigungen/neu) · Referenz geprüft: ja (Dashboard__dialog-ankuendigung) · Befunde hoch 1 / mittel 3 / niedrig 0
- Postfach (/verwaltung/postfach) · Referenz geprüft: ja (Dashboard__section-messages) · Befunde hoch 1 / mittel 2 / niedrig 0
- Tickets (/verwaltung/tickets) · Referenz geprüft: ja (Dashboard__section-tickets) · Befunde hoch 1 / mittel 2 / niedrig 3
- Neues Ticket (/verwaltung/tickets/neu) · Referenz geprüft: ja (Dashboard__dialog-ticket) · Befunde hoch 1 / mittel 2 / niedrig 0

=== ENDE DP-C1 · BEREIT ZUR RÜCKGABE ===

##### DP-C2 Darstellung
DP-C2 · Darstellungsprüfung Verwaltung, Gruppe c2 (13 Seiten, je 390 und 1440 px)

Nicht geändert: keine Projektdateien, kein Commit, kein Build, kein Server-Eingriff. Das Werkzeug hat ein Testkonto (@example.test) angelegt und sich damit angemeldet.
Bilder: /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-bc/c2/ (26 PNG). Ausschnitte für lange Seiten liegen im Scratchpad, nicht im Projekt.
Abweichung vom Briefing: Für „styleguide“ gibt es Referenzen (Styleguide__390.png, Styleguide__1440.png), obwohl das Briefing c2 als referenzlos nannte. Ich habe dort verglichen.

BEFUNDE (SEITE · BREITE · ABWEICHUNG · STUFE · REPARATUR)

1. Alle Seiten mit Seitenleiste · 1440 · „Veranstaltungen“ bricht als „Veranstaltun-/gen“ um, Zähler „13“ daneben · mittel · Seitenleiste verbreitern oder Zähler unter den Text setzen; hyphens: none für Navigationslinks · src/components/verwaltung/shell/Seitenleiste.tsx (vermutet)

2. Kurse, Benutzer und Rollen, Audit-Log, Mein Konto · 1440 und 390 · Silbentrennung in Köpfen und Zellen („Akti-on“, „Adminis-tration“, „Testper-son“, „Zielgrup-pe“ über drei Zeilen, „Sonn-tag“, „Veranstal-tung“). E-Mail-Adressen brechen mitten im Wort oder mit eingefügtem Trennstrich („example.-test“ im Audit-Log, „example.t/est“ bei Mein Konto) · mittel · hyphens: auto nur für Fließtext setzen, in Tabellen, Navigation und Adressen hyphens: manual oder none; Adressen mit breiterer Spalte statt Umbruch · src/app/globals.css Zeile 164 (body), Tabellen der Verwaltungslisten (vermutet)

3. Kurse, Benutzer und Rollen, Audit-Log · 390 · Datentabelle läuft über die Kartenbreite. Sichtbar bleiben nur die ersten Spalten: Kurse ohne Status und Aktionen, Benutzer ohne Zwei-Faktor, Zugang und Aktion, Audit ohne Benutzer, Aktion, Ziel und Details. Kein Hinweis zum Wischen. Muster: min-w-[40rem] in overflow-x-auto (wie GebetszeitenFormulare.tsx Zeile 208–209) · hoch · unter 768 px Zeilen als Karten (Titel, Status, Knöpfe) darstellen oder Aktionsspalte fixieren · Listenkomponenten der Module (vermutet)

4. Gebetszeiten · 390 · Seite 462 px breit statt 390, waagerechtes Scrollen der ganzen Seite. Karten „Quelle“ und „Tabellen-Import“ ragen rund 70 px über den Rand, „Berechnung“ bleibt im Rand · hoch · Breiten begrenzen (min-w-0, max-w-full) für Dateifeld und Auswahlkarten, danach bei 390 px neu messen · src/components/verwaltung/gebetszeiten/GebetszeitenFormulare.tsx, Dateifeld Zeile 266 (Verdacht)

5. Gebetszeiten · 1440 und 390 · Berechnungsmethode zeigt Rohnamen „Turkey“, „MuslimWorldLeague“, „Egyptian“, „Karachi“ auf Englisch, die übrigen Auswahlen sind deutsch · mittel · Anzeigetexte aus messages/verwaltung (de), Wert unverändert · src/components/verwaltung/gebetszeiten/GebetszeitenFormulare.tsx, Zeilen 18–22

6. Vorstand · 390 · Je Eintrag stehen „Nach oben“, „Nach unten“, „Entfernen“ untereinander. Seite 44 328 px lang (1440: 30 792 px) · mittel · ab 390 px als Knopfreihe mit Symbolen wie bei 1440, Einträge standardmäßig einklappen prüfen · src/components/verwaltung/seiteninhalte/Felder.tsx, wiederholbare Gruppe ab Zeile 295

7. Vorstand · 390 und 1440 · Kartentitel „Aktueller Vorstand“ wird im Abschnitt direkt wiederholt · niedrig · Gruppentitel im Schema streichen oder umbenennen · src/lib/validierung/seiteninhalte/ (vermutlich vorstand.ts)

8. Kontaktdaten · 390 und 1440 · Übersetzungsblöcke („Übersetzungen zu Tage“, „…zu Öffentliche Verkehrsmittel“, „…zu Mit dem Auto“, „…zu Zu Fuß“, „…zu Einleitung Notfallkontakt“, „…zu Besuchstext“) sind immer offen. Auf der Vorstand-Seite sind die Übersetzungen zugeklappt. A-V05 nennt „Übersetzungen aufklappbar“ · mittel · Standard zugeklappt wie in Felder.tsx; Schlüssel „aufklappenVon“ prüfen · messages/verwaltung/seiteninhalte-organisationen.json Zeile 31, src/components/verwaltung/seiteninhalte/Felder.tsx (vermutet)

9. Styleguide · 1440 und 390, gegen Referenz · Farbkarten: 3 statt 6 je Zeile (1440). Bei 390 rund 250 bis 300 px hoch statt rund 145 px. Seite 11 328 px statt 6 938 px (1440) bzw. 23 772 px statt 14 866 px (390). Hex-Werte stimmen überein (Marke, Neutraltöne, Status, Organisationen). A-V14 nennt die Farbkarten nicht · mittel · Karten an die Referenz angleichen oder A-V14 ergänzen · src/app/[locale]/verwaltung/(geschuetzt)/styleguide/ (vermutet)

10. Mein Konto · 1440 · Karte „Angaben“ ist auf die Höhe von „Passwort ändern“ gestreckt, rund 260 px leer · niedrig · Kartenraster mit items-start · src/app/[locale]/verwaltung/(geschuetzt)/konto/ (vermutet)

NICHT GEZÄHLT (keine Abweichung)
- Native Browser-Felder auf Englisch („Choose File No file chosen“, „mm/dd/yyyy“, „09:00 AM“): Oberfläche des Prüfbrowsers, keine App-Texte.
- Beispielinhalte: E-Mail- und Webadressen auf igmg-wetzlar.de (info@, vorsitzender@ u. a.) sowie „Kostenlose Parkplätze vorhanden“ und „5 Minuten vom Wetzlarer Hauptbahnhof“ ohne Platzhalter wirken wie echte Angaben. Inhaltlich nach G-05 prüfen.
- Bekannte Abweichungen aus ABWEICHUNGEN.md nicht gemeldet: eigene Kopfzeile und Seitenleiste (A-V01), Verwaltung als Seiten (A-V02 ff.), Abzeichen „Beispielinhalt“ (A-V02d), Styleguide ohne Tabellen, Icons, Dropdowns (A-V14). Der Befund 8 ist dagegen zu zählen, weil A-V05 aufklappbare Übersetzungen verlangt.

ABDECKUNG
Alle 13 Seiten sind bei 390 und 1440 px gesichtet. Lange Seiten nur als Stichprobe der oberen Abschnitte: Vorstand 390 rund 16 %, 1440 rund 19 %. Kontaktdaten 390 rund 50 %, 1440 rund 53 %. Audit 390 rund 60 %, 1440 vollständig. Styleguide 390 rund 29 %, 1440 rund 52 %. Referenz Styleguide 390 rund 47 %, 1440 rund 85 %. Wiederholte Gruppen bei Vorstand und Kontakt sind nur stichprobenhaft geprüft.

SEITEN (SEITE · Referenz geprüft · Befunde hoch/mittel/niedrig)
- Eingänge (eingaenge) · keine Referenz · 0/1/0
- Seiteninhalte (seiteninhalte) · keine Referenz · 0/1/0
- Vorstand (si-vorstand) · keine Referenz · 0/2/1
- Kontaktdaten (si-kontakt) · keine Referenz · 0/2/0
- Kurse (kurse) · keine Referenz · 1/2/0
- Gebetszeiten (gebetszeiten) · keine Referenz · 1/2/0
- Medien (medien) · keine Referenz · 0/1/0
- Benutzer und Rollen (benutzer) · keine Referenz · 1/2/0
- Person einladen (einladen) · keine Referenz · 0/1/0
- Audit-Log (audit) · keine Referenz · 1/2/0
- Einstellungen (einstellungen) · keine Referenz · 0/1/0
- Mein Konto (konto) · keine Referenz · 0/2/1
- Styleguide (styleguide) · ja (Referenz vorhanden) · 0/2/0

=== ENDE DP-C2 · BEREIT ZUR RÜCKGABE ===

##### SP-B Sicherheit Formulare
# SP-B · Öffentliche Formulare · Sicherheitsprüfung

Prüfstand: Projekt `IGMG Wetzlar Website Design/web`, Stand 11.10.2026. Nur gelesen und geprüft, keine Projektdateien geändert, kein Commit, kein Build.

## Methode und Grenzen
- Quellcode mit Zeilennummern gelesen. Live nur gegen http://localhost:3200: HEAD/GET, ein POST ohne Formularfelder, Bundle-Grep. Keine Formularsendung, keine Datensätze, keine Mails, keine Schreibvorgänge.
- Mit den projekteigenen Paketen (zod 4.6.5, altcha-lib 2.6.0) nachgerechnet: E-Mail-Prüfer, Link-Prüfung über den WHATWG-URL-Parser, PBKDF2-Messung.
- Nicht vollständig gelesen (nur per Grep auf href, innerHTML, eval, fetch und Muster geprüft): MitgliedsantragFormular, MoscheeAnfrageFormular, VoranmeldungFormular, FormWizard, SendenKnopf.
- Eine temporäre Antwortdatei wurde kurz unter /tmp angelegt und sofort gelöscht. Es war keine Projektdatei.

## Befunde (11), nach Schwere

**B1 · HOCH · S12 (Speicherung und Löschfrist)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/db/schema/verwaltung.ts:55-56, 62`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/actions/formulare/meldung.tsx:74-75`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/eingaenge/loeschlauf.ts:44-61`
- Befund: Betreff (bis 160 Zeichen) und Meldungstext (bis 2 000 Zeichen) aus der öffentlichen Meldung stehen im Klartext in `ticket.titel` und `ticket.beschreibung`. Nur die Melderangaben sind verschlüsselt. Der Löschlauf entfernt nach 180 Tagen nur `melderVerschluesselt`. Betreff und Text bleiben dauerhaft im Klartext und können Personenbezug enthalten. ADR 0005 verlangt verschlüsselte Formulardaten.
- Vorschlag: Betreff und Beschreibung ins verschlüsselte Paket aufnehmen (wie `eingang`), in Verwaltungs-Queries nach Rechteprüfung entschlüsseln und auditieren, Löschlauf auf Betreff und Text ausweiten, ADR 0005 angleichen.

**B2 · MITTEL · S10 (Dritte)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/actions/formulare/meldung.tsx:102-108`, `kontakt.tsx:31`, `voranmeldung.tsx:44`, `mitgliedsantrag.tsx:42`, `moschee-anfrage.tsx:43`, `veranstaltungsanmeldung.tsx:74`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/mail/ausgang.ts:27` (`return [an]`)
- Befund: Die Bestätigung geht ohne Double-Opt-In an die Adresse aus dem Formular. Ein Angreifer kann beliebige Dritte anschreiben, die Ratenbegrenzung wirkt nur je IP. Die Bestätigung nennt die Art, z. B. „Voranmeldung“ (`messages/bereiche/mails.json:7`). Dritte erfahren dadurch vom Angebot für Kinder.
- Vorschlag: Bestätigung erst nach Klick auf einen Link (Double-Opt-In). Limit je Empfängeradresse (HMAC) und Stundenobergrenze. Bei Versand an Dritte keine Art-Angabe.

**B3 · MITTEL · S3 (Ratenbegrenzung)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/sicherheit/ip.ts:9-20`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/docker-compose.yml` (Dienste db, mailpit, app, kein Proxy); `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/docs/BETRIEB.md:58, 63`
- Befund: Die Adresse für das Limit ist der letzte X-Forwarded-For-Eintrag, sonst X-Real-IP. Ohne vorgeschalteten Proxy setzt der Client diesen Wert selbst. Jede Einsendung kann eine neue Adresse melden, und das Limit von 5 je 10 Minuten greift nicht. Die Betriebsdoku benennt das Risiko, das Compose-Setup setzt den Proxy aber nicht um. ALTCHA bleibt eine Hürde (siehe B6).
- Vorschlag: Ohne vertrauenswürdigen Proxy keine Header-Adresse verwenden (globales Limit oder Limit am Proxy). Proxy in den Compose-Betrieb aufnehmen und Betrieb ohne Proxy per Startprüfung erkennbar machen.

**B4 · MITTEL · S12 (Speicherbegrenzung)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/actions/eingaenge.ts:45-56`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/formulare/verarbeiten.ts:110`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/eingaenge/loeschlauf.ts:52, 92`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/actions/tickets.ts:97`
- Befund: (a) Eingänge aus öffentlichen Formularen, auch Voranmeldungen mit Kinderdaten, erhalten nur bei Abschluss eine Löschfrist. Offene Vorgänge bleiben unbegrenzt. (b) Tickets mit Status „geloest“ bekommen kein `geschlossenAm`. Die Melderfrist von 180 Tagen greift daher nie.
- Vorschlag: Höchstfrist für offene Vorgänge (z. B. 12 Monate ab Eingang) beim Anlegen setzen. Melderfrist auch für „geloest“ ab dem Statuswechsel auslösen.

**B5 · NIEDRIG · S3**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/actions/formulare/voranmeldung.tsx:23-31`, `mitgliedsantrag.tsx:23-31`, `moschee-anfrage.tsx:24-32`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/formulare/wizard.ts:16-34`
- Befund: Schrittanfragen der drei Wizards prüfen das Schema und rendern HTML, ohne Zähler und ohne ALTCHA. Es wird nichts gespeichert, Anfragen sind aber unbegrenzt möglich. Dokumentiert in ADR 0005 (Nachtrag).
- Vorschlag: Eigener Zähler für Schrittanfragen mit höherer Grenze (z. B. 60 je 10 Minuten und IP) oder Limit am Proxy (BETRIEB 5b).

**B6 · NIEDRIG · S3 (ALTCHA-Ausgabe und Aufwand)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/api/altcha/route.ts:5-9`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/validierung/altcha.ts:13, 26`; `node_modules/altcha-lib/dist/esm/v2/helpers.js:95-100`
- Befund: Die Challenge-Ausgabe ist nicht begrenzt. Gemessen: 0,38 ms je PBKDF2-Versuch mit 5 000 Iterationen. Der Zähler liegt laut `randomInt(KOSTEN, KOSTEN * 2)` im Bereich 5 001 bis 10 000, weil die Bibliothek `(max, min)` erwartet. Der Browser-Löser startet bei 0 (`counterStart=0`), also im Mittel rund 7 500 Versuche, etwa 2,8 s CPU je Lösung (Schätzung). Kennt ein Angreifer den Bereich, startet er bei 5 001 und braucht etwa ein Drittel. Signatur und Einmalverwendung sind korrekt (Bereich A).
- Vorschlag: Ausgabe je IP begrenzen. Argumentreihenfolge korrigieren. Kosten nach Messung auf Zielgeräten festlegen.

**B7 · NIEDRIG · S11 (Link-Prüfung)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/inhalt/links.ts:7`; angewendet in `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/nachrichten/Ankuendigungen.tsx:27`, `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/validierung/ankuendigung.ts:46`, `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/validierung/richtext.ts:15`, `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/RichText.tsx:8`
- Befund: `istErlaubterLink("/\t/evil.example")` ergibt true. Der WHATWG-URL-Parser entfernt Tabulator und Zeilenumbruch und löst das Ziel auf `https://evil.example/` auf (in Node geprüft). Die Regel soll protokollrelative Ziele sperren (Kommentar Zeile 2 bis 4). Ausnutzbar nur über Verwaltungs-Eingaben, externe https-Links sind ohnehin erlaubt.
- Vorschlag: Steuerzeichen und Leerraum vor der Prüfung ablehnen. Danach mit `new URL(href, "https://basis.invalid")` prüfen, dass der Ursprung erhalten bleibt.

**B8 · NIEDRIG · S9**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/queries/ankuendigungen.ts:45-54`
- Befund: Beginn und Ende der Sichtbarkeit werden mit `new Date()` innerhalb eines `'use cache'`-Blocks mit `cacheLife('hours')` berechnet. Abgelaufene Ankündigungen bleiben bis zu eine Stunde sichtbar, neue erscheinen verzögert. Dokumentiert, aber zeitabhängige Ausgabe gehört nicht in einen Stundencache.
- Vorschlag: Nur die Datenbankliste cachen, das Zeitfenster bei jeder Auslieferung prüfen.

**B9 · NIEDRIG · Zusatz (Integrität)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/actions/formulare/veranstaltungsanmeldung.tsx:52-58, 95`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/queries/veranstaltungen.ts:26-29`
- Befund: Die Platzprüfung liest die belegten Plätze aus einem bis zu eine Stunde alten Cache und schreibt erst danach in einer eigenen Transaktion. Parallele Anmeldungen können die Kapazität überschreiten.
- Vorschlag: Prüfung und Einfügen in einer Transaktion mit Sperre auf der Veranstaltungszeile. Zähler bei Statuswechseln gezielt invalidieren.

**B10 · NIEDRIG · Zusatz (Funktion)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/sicherheit/header.ts:17, 31-38`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/kontakt/KarteNachKlick.tsx:33`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/kontakt/karte.ts:9`
- Befund: Die öffentliche CSP hat kein `frame-src`, es gilt `default-src 'self'`. Die OpenStreetMap-Einbettung würde blockiert, sobald Koordinaten gepflegt sind. Heute sind keine gesetzt. Kein Datenschutzproblem, aber ein Funktionsfehler.
- Vorschlag: `frame-src https://www.openstreetmap.org` ergänzen und in ADR 0012 festhalten.

**B11 · NIEDRIG · Zusatz (Konfiguration)**
- Fundstelle: `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/seo/metadaten.ts:10`; `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/mail/ausgang.ts:100`; Vergleich `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/db/index.ts:23-24`
- Befund: Fehlt APP_URL im Betrieb, zeigen Verwaltungs-Links in Benachrichtigungen auf `http://localhost:3000`. Anders als bei DATABASE_URL bricht der Start nicht ab.
- Vorschlag: In Produktion ohne APP_URL den Start abbrechen.

## Hinweise (kein Befund)
- H1: Öffentliche CSP mit `script-src 'unsafe-inline'` (`header.ts:35`), dokumentiert in ADR 0012. Das einzige `dangerouslySetInnerHTML` (`KonzeptHinweis.tsx:102`) enthält ein festes Skript ohne Nutzereingaben (Konstante Zeile 11).
- H2: Einwilligung der Meldung liegt im verschlüsselten Melder-Paket (`meldung.tsx:61-67`), nicht in der Tabelle `einwilligung` nach ADR 0005.
- H3: ADR 0005 (Zeile 40) nennt die Ticket-Meldung „intern“. `/meldung` ist aber öffentlich (`meldung.tsx:28-32`). Dokumentation angleichen.
- H4: Mehrfachlisten ohne Obergrenze (`mitgliedsantrag.ts:33-36`, `moschee-anfrage.ts:57-60`), begrenzt nur durch die Action-Körpergröße (Next-Standard, nicht im Projekt gesetzt).
- H5: 5 Einsendungen je 10 Minuten und IP (`verarbeiten.ts:45`) treffen ein Gemeinde-WLAN mit gemeinsamer Adresse. Betrieb beachten.
- H6: `.mail/` enthält 88 Entwicklungs-Mails im Klartext, alle an example.test, gitignored. Produktion blockiert den Datei-Transport (`transport.ts:14`).
- H7: Mail-Header-Injection ausgeschlossen. Adressen laufen durch den Zod-E-Mail-Prüfer ohne CR/LF, Betreffe sind fest (`ausgang.ts:151`).

## Formular je Prüfbereich und Punkt
Dateinamen sind mit ihrem Verzeichnis im Abschnitt Befunde und unter `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/` zu lesen.

**Bereich A · Verarbeitungskern und Schutz**
Dateien: `src/lib/formulare/{verarbeiten.ts, rohwerte.ts, wizard.ts, ohne-skript.ts, ergebnis.ts}`, `src/lib/validierung/{altcha.ts, ratenbegrenzung.ts}`, `src/app/api/altcha/route.ts`, `src/lib/sicherheit/ip.ts`, `src/lib/krypto/index.ts`
- S1 · OK · öffentlich, kein Rollenzugriff nötig; Antwort ohne Personendaten (verarbeiten.ts:146, ergebnis.ts:3-5)
- S2 · OK · Zod vor dem Speichern (verarbeiten.ts:53); Schutzfelder entfernt (rohwerte.ts:2); Schrittindex geklemmt (wizard.ts:24); ALTCHA-Nutzlast auf Typ und Länge geprüft (altcha.ts:34-42)
- S3 · BEFUND · B3 (mittel), B6 (niedrig). OK: Rate je IP und Formular 5 je 600 s, atomar per Upsert (ratenbegrenzung.ts:13, 22-32; verarbeiten.ts:45). ALTCHA: Signatur deckt Parameter inkl. Ablauf ab (altcha-lib v2, verifySolution Schritte 1-3); Einmalverwendung per Primärschlüssel (altcha.ts:59-64)
- S4 · OK · Fehler nur als Schlüssel (rohwerte.ts:15-22); IP nur als HMAC (ratenbegrenzung.ts:20); Audit ohne Personendaten (verarbeiten.ts:114-117); kein console-Aufruf
- S5 · OK · `eingang.angelegt` in derselben Transaktion (verarbeiten.ts:114-117)
- S6 · N/A · keine Datei-Felder; rohwerte.ts:8 verwirft Nicht-Text-Werte
- S7 · OK · Bundle-Grep (siehe Live-Ergebnisse)
- S8 · OK · Drizzle mit Parametern (ratenbegrenzung.ts:28-29, `${intervall}` als Parameter; altcha.ts:69)
- S9 · OK · route.ts:6 `connection()`; live `no-store`, kein Cache-Treffer
- S10 · OK · kein Cookie, ALTCHA ohne Cookie; IP nur gehasht
- S11 · OK · Ausgabe über React-Escaping (Felder.tsx:77, 98, 118 mit `defaultValue`)
- S12 · OK · Eingänge AES-256-GCM mit IV und Auth-Tag (krypto/index.ts:28-35; verarbeiten.ts:99); Mail-Paket verschlüsselt (verarbeiten.ts:132-136); Schlüsselrotation vorhanden (krypto/index.ts:19-26)

**Bereich B · Öffentliche Actions, Schemas, Komponenten**
Dateien: `src/server/actions/formulare/{kontakt, voranmeldung, veranstaltungsanmeldung, mitgliedsantrag, moschee-anfrage, meldung}.tsx`, `src/lib/validierung/formulare/*.ts`, `src/components/formular/*`, `src/components/website/formulare/*`
- S1 · OK · Veranstaltungen nur über `sichtbar` (veröffentlicht, nicht im Papierkorb; queries/veranstaltungen.ts:37, 96-103)
- S2 · OK · Schemas vollständig; typ und organisation per Enum (meldung.ts:21-22); Einwilligung als Literal „ja“ (meldung.ts:41, kontakt.ts:20, voranmeldung.ts:56-57); Website nur https (moschee-anfrage.ts:14-21, 55); Veranstaltungs-ID als UUID (veranstaltungsanmeldung.ts:10); Sprache per Enum. Siehe H4.
- S3 · BEFUND · B5 (niedrig) für Schrittanfragen. OK für alle sechs Endabsendungen über pruefeEinsendung/verarbeiteFormular (meldung.tsx:36; kontakt.tsx:23; veranstaltungsanmeldung.tsx:43; voranmeldung.tsx:33; mitgliedsantrag.tsx:33; moschee-anfrage.tsx:34)
- S4 · OK · Bestätigung ohne Formulardaten (vorlagen/index.tsx:13-30); Benachrichtigung nur mit Art und Pfad (kontakt.tsx:36; meldung.tsx:94-100); Antworten nur Schlüssel
- S5 · OK · `eingang.angelegt` (verarbeiten.ts:114-117); `ticket.angelegt` (meldung.tsx:83-92)
- S6 · N/A · keine Uploads
- S7 · OK · Bundle-Grep
- S8 · OK · Drizzle-Builder (meldung.tsx:70-115; veranstaltungsanmeldung.tsx:25-29)
- S9 · OK · Actions sind POST-Endpunkte (dynamisch); Seiten statisch wie in K-01 vorgesehen
- S10 · BEFUND · B2 (mittel): Bestätigungen an Fremdadressen
- S11 · OK · Eingaben nur als Werte (React); feste Links über `pfadFuer`; keine Eingaben in Mail-Headern (H7)
- S12 · BEFUND · B1 (hoch) und B4 (mittel). OK: Melderdaten verschlüsselt (meldung.tsx:68, 79-80); Einwilligungs-Textversion als Hash (meldung.tsx:61-67)

**Bereich C · Mail-Ausgang, Vorlagen, Transport, Speicherung**
Dateien: `src/lib/mail/{ausgang.ts, transport.ts, vorlagen/index.tsx}`, `src/lib/db/schema/{eingaenge.ts, system.ts, verwaltung.ts}`
- S1 · N/A · interner Versand
- S2 · OK · Der Zod-E-Mail-Prüfer lässt keinen Doppelpunkt zu (geprüft: „rolle:kontakt@…“ abgelehnt). Umleitung über die Präfixe `rolle:`/`recht:` ist damit ausgeschlossen (ausgang.ts:27).
- S3 · N/A · kein Endpunkt; fehlende Obergrenze je Empfänger siehe B2
- S4 · OK · Fehlertext nur `e.name` (ausgang.ts:160); Mail-Inhalt ohne Personendaten (vorlagen/index.tsx:13-62)
- S5 · N/A · Systemvorgang
- S6 · N/A
- S7 · N/A
- S8 · OK · Parameter (ausgang.ts:137-141, 161-162)
- S9 · N/A · Versand nach der Antwort über `after()` (verarbeiten.ts:144)
- S10 · BEFUND · B2 (mittel). Vorlagen ohne externe Ressourcen (Grep ohne Treffer).
- S11 · OK · React-Rendering (vorlagen/index.tsx:13-62). Verwaltungs-Link nur über `basisUrl()` und Präfix `/verwaltung/` (ausgang.ts:100; metadaten.ts:9-11). `daten.pfad` kommt nur aus Server-Code (meldung.tsx:99). Ein Angreifer kann Link und Empfänger der Benachrichtigung nicht bestimmen.
- S12 · OK · `mail_ausgang.datenVerschluesselt` enthält Empfänger und Daten (system.ts:55; verarbeiten.ts:132-136; meldung.tsx:109-114). Klartext nur Vorlage, Sprache und Bezug-ID.

**Bereich D · Öffentliche Seiten (live und Code)**
Seiten: /kontakt, /mitglied-werden, /webseite-fuer-moscheen, /meldung, /nachrichten, zusätzlich geprüft /bildung/voranmeldung, /veranstaltungen, /veranstaltungen/arabisch-sprachkurs. Routing: `src/i18n/routing.ts:13-15`; Proxy: `src/proxy.ts:34`.
- S1 · N/A · keine Eingaben auf den Seiten
- S2 · OK · keine Parameter außer dem Sprachsegment; keine Spracherkennung (routing.ts:13-15)
- S3 · N/A · Seiten; Actions siehe A und B
- S4 · OK · keine Personendaten in URLs oder Headern (live)
- S5 · N/A
- S6 · N/A
- S7 · OK · Bundles ohne GEHEIMNIS, SECRET, DATABASE_URL, EINGANG_SCHLUESSEL; `password` nur als Feldtyp der Verwaltung
- S8 · N/A
- S9 · OK · Seiten statisch (`x-nextjs-prerender: 1`, `s-maxage=3600`) wie in K-01 vorgesehen; Action-Antworten dynamisch
- S10 · OK · Live kein Set-Cookie auf allen acht Seiten. Keine Dritt-Hosts im HTML; die einzige externe Zeichenfolge ist der Platzhalter `https://www.ihre-aktuelle-webseite.de` im `placeholder`-Attribut auf /webseite-fuer-moscheen. Karte erst nach Klick (KarteNachKlick.tsx:33-41). Schriften eigen gehostet (font-src 'self'). Code: keine `cookies()`- oder `headers()`-Aufrufe in `(website)`, `components/website` und den Root-Layouts.
- S11 · OK mit Hinweisen · H1 (`unsafe-inline`), B10 (frame-src)
- S12 · N/A
- E-032 · OK · Live: POST nur mit Action-ID, ohne Next-Action-Header → 303 nach `/kontakt#ohne-skript`. Plain-POST ohne Body → 200, kein 500. Code: `zurueckOhneSkript()` steht vor jeder Verarbeitung (ohne-skript.ts:14-24).

**Bereich E · Ankündigungen**
Dateien: `src/server/queries/ankuendigungen.ts`, `src/components/website/nachrichten/Ankuendigungen.tsx`, `src/lib/inhalt/links.ts`, `src/lib/validierung/ankuendigung.ts`
- Sichtbarkeit · OK · veröffentlicht, nicht im Papierkorb, Zeitfenster (ankuendigungen.ts:31-34)
- S1 · N/A
- S2 · BEFUND · B7 (niedrig): Umgehung über Steuerzeichen
- S3 · N/A
- S4 · OK · Abfrage liefert nur id, titel, inhalt, prioritaet, link (ankuendigungen.ts:41-42)
- S5 · N/A
- S6 · N/A
- S7 · OK
- S8 · OK · Drizzle-Builder (ankuendigungen.ts:26-36)
- S9 · BEFUND · B8 (niedrig): Zeitfenster im Cache
- S10 · OK · keine Dritt-Ressourcen
- S11 · BEFUND · B7 (niedrig). Titel und Text werden als Text ausgegeben (Ankuendigungen.tsx:40-44), das ist OK.
- S12 · N/A · keine personenbezogenen Daten

## Live-Ergebnisse (localhost:3200, nur lesend oder ohne Formularfelder)
- HEAD/GET /kontakt, /mitglied-werden, /webseite-fuer-moscheen, /meldung, /nachrichten, /bildung/voranmeldung, /veranstaltungen, /veranstaltungen/arabisch-sprachkurs: 200, kein Set-Cookie, `x-nextjs-prerender: 1`. CSP: `default-src 'self'; … script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`, ohne `frame-src`.
- GET /api/altcha: 200, `cache-control: no-store`, kein Set-Cookie, kein Cache-Treffer. JSON mit `parameters` und `signature`, keine Geheimnisse.
- POST /kontakt ohne Body und Header: 200 text/html, kein 500.
- POST /kontakt nur mit Action-ID von `sendeKontakt` (aus dem Build-Manifest), ohne Next-Action-Header, ohne Felder: 303, `Location: /kontakt#ohne-skript`. Abbruch vor der Verarbeitung, nichts gespeichert.
- Bundle-Grep in `.next/static/chunks` (71 Dateien): GEHEIMNIS, SECRET, DATABASE_URL, EINGANG_SCHLUESSEL je 0 Treffer. `password` in 8 Dateien, nur als `type="password"` in Verwaltungs-Formularen.

## Antworten auf die Leitfragen
- **Speichern ohne ALTCHA oder Rate?** Nein (Code). Nur `verarbeiteFormular` und `pruefeEinsendung` speichern. Die Schrittaktionen liefern nur die Ansicht (voranmeldung.tsx:24-31). `schritt` wird geklemmt (wizard.ts:24), `richtung` steuert nur die Navigation (wizard.ts:26), `sprache` ist per Enum geprüft. Kein Umgehungsweg gefunden.
- **Formulardaten unverschlüsselt?** `eingang`: nein. `mail_ausgang`: nein. `ticket`: ja, Betreff und Beschreibung (B1).
- **Benachrichtigungsmails mit Formulardaten?** Nein. Benachrichtigung nur Art und Pfad, Bestätigung Art, Datum, Veranstaltung und Termin (vorlagen/index.tsx:13-62).
- **Meldung: Organisation und Typ gegen Enums, Einwilligung mit Textversion?** Ja (meldung.ts:21-22, 41; meldung.tsx:61-67).
- **Mail: Link oder Empfänger durch Angreifer?** Link nein. Empfänger ja bei Bestätigungen (B2). Präfix-Injektion nein.

## Nicht geprüft (mit Grund)
- Speichern ohne ALTCHA oder Rate live: würde Datensätze, Mails und Zähler in der Produktionsdatenbank erzeugen. Nur Code.
- X-Forwarded-For-Umgehung live: würde Ratenzähler schreiben. Nur Code und Betriebsdoku.
- Kapazitäts-Race (B9) und Versand an Dritte (B2) live: Produktionsdaten bzw. Versand an Dritte. Nur Code.
- Link-Umgehung (B7) im Browser: nur mit dem WHATWG-URL-Parser in Node geprüft.
- `frame-src` (B10) im Browser: keine Koordinaten im Produktivinhalt. Nur Code.
- Last der Schrittanfragen (B5): kein Lasttest beauftragt.
- Next.js-Standards (Body-Größe, Origin-Prüfung bei Server Actions): nicht im Projekt konfiguriert, nicht gegen die Next-Doku geprüft.

## Zusammenfassung
- Befunde gesamt: 11
- Hoch: 1 (B1)
- Mittel: 3 (B2, B3, B4)
- Niedrig: 7 (B5 bis B11, davon B9 bis B11 Zusatzbefunde)
- Die Leitfragen zur Speicherung ohne ALTCHA und Rate sind im Code verneint. Eingang und Mail-Ausgang sind korrekt verschlüsselt. Schwerpunkte sind Klartext und fehlende Löschfristen bei Tickets und offenen Vorgängen, Bestätigungen an Dritte und die Ratenbegrenzung ohne Proxy.

=== ENDE SP-B · BEREIT ZUR RÜCKGABE ===

##### SP-C1 Sicherheit Konten/Eingänge
SP-C1 · Sicherheitsprüfung Verwaltung (Konten, Anmeldung, Eingänge, Postfach, Tickets, Audit)

Stand: 2026-10-11. Pfade relativ zu `web/`. Live: http://localhost:3200 (Produktionsstand, ohne erkennbaren Proxy). Better Auth 1.7.7.

Methode und Grenzen: Nur Lesen. Keine Projektdatei geändert, kein Commit, kein Build, kein Start oder Stopp des Servers. Live nur GET/HEAD sowie POST mit fiktiven Werten (testperson@example.test, Adressen aus TEST-NET). Keine Konten angelegt, keine Mail ausgelöst. Nebenwirkung: Der Ratentest hat Zählerzeilen für Test-IPs in der Auth-Ratentabelle erzeugt. Eine temporäre Datei unter /tmp wurde angelegt und gelöscht. Aus `.env` wurden nur Schlüsselnamen gelesen. `~/Downloads/CLAUDE.md` (Coday) wurde nicht ausgeführt.

Gesamturteil: Die Kernkontrollen halten. Dazu gehören Rechte-Matrix, Organisationsgrenzen, Sitzung mit zweitem Faktor, Kontensperre mit Sitzungsende, gehashte Einladungstoken, verschlüsselte Eingangsdaten und Notizen, Wartungszugang mit Fail-closed, CSV-Schutz und Reset-Links ohne offenen Redirect. Die größte Lücke ist die IP-basierte Ratenbegrenzung (H1).

---

1. BEFUNDE

H1 · hoch · S3 · Ratenbegrenzung per X-Forwarded-For umgehbar
- `src/lib/sicherheit/ip.ts:9–19` nimmt den letzten X-Forwarded-For-Eintrag, sonst `x-real-ip`. Ohne vorgeschalteten Proxy, den `docs/BETRIEB.md:58, :63` verlangt und den das Compose-Setup nicht enthält, setzt der Client den Wert frei.
- Betroffen sind die IP-Anteile in `src/server/actions/anmeldung.ts:47, :97, :180, :211, :242` und `src/server/actions/benutzer.ts:230, :252`. Better Auth nutzt dieselbe Logik (`src/lib/auth/optionen.ts:44`).
- Live bestätigt für den Better-Auth-Pfad: vier Anfragen mit wechselnden Werten ergaben 200, bei gleichem Wert kam ab der vierten Anfrage 429. Für die App-Grenzen ist der Befund aus dem Code ableitbar, nicht live getestet.
- Die Konto-Grenzen bleiben wirksam (Anmeldung 8 je 15 min, Zwei-Faktor-Sperre 10 Fehlversuche je 15 min). Trotzdem sind Passwort-Spraying über viele Konten und Mailfluten (M1) möglich.
- Vorschlag: X-Forwarded-For nur bei einem konfigurierten vertrauenswürdigen Proxy auswerten, sonst ignorieren. Produktionsstart ohne Proxy-Konfiguration abbrechen oder als Fehler melden.

M1 · mittel · S3, S10 · `POST /api/auth/request-password-reset` nicht gesperrt
- `src/lib/auth/optionen.ts:61–67`: der Hook sperrt nur Registrierung, Anmeldung, Zwei-Faktor und Passkey. Die Grenze liegt nur je IP (`optionen.ts:38`) und umgeht die kontobezogene Grenze der Action (`anmeldung.ts:211`).
- Live: HTTP 200 mit generischer Meldung.
- Folge: beliebig viele Reset-Mails an ein Konto, mit H1 unbegrenzt. Zusätzlich Zeitsignal (N1).
- Vorschlag: Pfad im Hook sperren, damit die Server Action der einzige Weg bleibt.

M2 · mittel · S5 · Kontenliste, Kontodetail und offene Einladungen ohne Audit
- `src/app/[locale]/verwaltung/(geschuetzt)/benutzer/page.tsx:22–23` und `benutzer/[id]/page.tsx:21` lesen E-Mail, Name, Zwei-Faktor-Status und Anmeldezeit. `src/server/queries/verwaltung/benutzer.ts:82–90, :103–116` schreibt nichts ins Audit. Im Katalog `src/lib/audit/index.ts:8–47` fehlt auch eine Lese-Aktion.
- Vorschlag: `benutzer.gelesen` bei Abruf, nur mit Anzahl oder Konto-ID.

M3 · mittel · S1 · Schutz der letzten Administration als Check-then-act (Code-Befund, nicht live)
- `src/server/actions/benutzer.ts:136–139` (Rollen), `:168–169` (Sperren), `:211–212` (Löschen): die Prüfung läuft vor der Transaktion.
- Zwei Administrationen, die sich gleichzeitig herabstufen oder sperren, sehen beide „eine verbleibt“ und können die letzte Administration entfernen.
- Vorschlag: Prüfung und Änderung in einer Transaktion mit Sperre (`SELECT … FOR UPDATE`) oder Serializable.

M4 · mittel · S5 · Ticketinhalt ohne Audit
- `src/server/queries/verwaltung/tickets.ts:209–258` liest Beschreibung, Kommentare und Namen. Protokolliert wird nur der Melderteil (`:192–198`). Seite: `tickets/[id]/page.tsx:27–30`.
- Vorschlag: `ticket.gelesen` mit `feld: inhalt`, oder dokumentierte Klassifikation, dass Freitext keine Personendaten enthält.

M5 · mittel · S12 · Notizen und Freitext im Klartext
- `src/lib/db/schema/verwaltung.ts:56` (`ticket.beschreibung`, geschrieben in `src/server/actions/tickets.ts:52`), `:82` (`ticket_kommentar.text`, geschrieben `tickets.ts:148`; `intern` ist Standard-Notiz), `:36` (`postfach_nachricht.text`, geschrieben `postfach.ts:55, :87`).
- Vergleich: `eingang_notiz` ist verschlüsselt (`schema/eingaenge.ts:60`, Schreibweg `src/server/actions/eingaenge.ts:84–88`), ebenso die Melderdaten (`schema/verwaltung.ts:62`).
- Vorschlag: wie Eingangsnotizen mit `verschluessele` und `entschluessele` speichern.

M6 · mittel · S10 · IP-Adressen im Klartext, im Widerspruch zu „IP wird nie gespeichert“
- Code-Zusage: `src/lib/validierung/ratenbegrenzung.ts:8` und `src/lib/sicherheit/ip.ts:7`.
- Better Auth schreibt `rate_limit.key` als `IP|Pfad` (`src/lib/db/schema/auth.ts:115–120`; `node_modules/better-auth/dist/api/rate-limiter/index.mjs:80–87, :248`; `node_modules/.pnpm/@better-auth+core@1.7.7…/dist/utils/ip.mjs:228–230`) und `session.ip_address` (`schema/auth.ts:30`; `node_modules/better-auth/dist/db/internal-adapter.mjs:263`).
- Vorschlag: `advanced.ipAddress.disableIpTracking` prüfen oder die IP hashen. Aufbewahrung der Session-IP festlegen.

M7 · mittel · S5 · Anmeldung mit zweitem Faktor ohne Audit-Eintrag `anmeldung.erfolg` (Code-Befund, nicht live)
- `src/server/actions/anmeldung.ts:106–112`: nach `verifyTOTP` oder `verifyBackupCode` ruft der Code `ladeAngemeldet()` auf. Die neue Sitzung steht aber erst in der Antwort. Der Kommentar in `:81–82` beschreibt genau dieses Problem für den Passwortpfad, dort ist es über die Antwort-ID gelöst (`:83–84`).
- Folge: Der reguläre Anmeldeweg (K-06) fehlt im Audit-Log. `letzteAnmeldung` in `queries/verwaltung/benutzer.ts:45–51` bleibt falsch.
- Vorschlag: Konto-ID aus dem Ergebnis der 2FA-Prüfung übernehmen (wie `:83–84`), Integrationstest ergänzen.

N1 · niedrig · S4, S5 · Kontenaufzählung über Antwortzeit möglich (Code-Befund, nicht gemessen)
- Für bekannte Konten legt Better Auth einen Verifikationseintrag an und schreibt die Mail (`planePasswortMail`, `src/lib/auth/passwort.ts:11–18`). Die Antwort wartet darauf: `node_modules/better-auth/dist/api/routes/password.mjs:81–82` und `context/create-context.mjs:215–221` (kein `backgroundTasks`-Handler gesetzt). Unbekannte Konten antworten sofort (`password.mjs:69–70`).
- Text identisch: live und in `anmeldung.ts:215–218` bestätigt.
- Vorschlag: `advanced.backgroundTasks` setzen, damit die Antwortzeit unabhängig vom Konto ist.

N2 · niedrig · S2 · Konto-ID nur auf Länge geprüft
- `src/server/actions/benutzer.ts:122`, `src/server/queries/verwaltung/benutzer.ts:87`, `benutzer/[id]/page.tsx:21`.
- Vorschlag: Zod-Schema vor dem Laden.

N3 · niedrig · S1 (Reihenfolge) · Zod vor Rechteprüfung
- `src/server/actions/eingaenge.ts:36–37` (setzeStatus), `:81–82` (notizHinzufuegen), `:99–100` (endgueltigLoeschen). Kein Datenzugriff vor der Prüfung.
- Vorschlag: `verlangeRecht` als erste Anweisung.

N4 · niedrig · S2 · Melder-E-Mail ohne Formatprüfung
- `src/lib/validierung/ticket.ts:64`: `email: z.string().max(254)`.
- Vorschlag: `z.email()` oder leer erlauben.

N5 · niedrig · S5 · Lesezugriffe ohne Audit
- Postfach-Nachrichten (`src/server/queries/verwaltung/postfach.ts:102–140`), Audit-Log-Abfragen mit E-Mail-Adressen (`src/server/queries/verwaltung/audit.ts:215–243, :229–230`).
- Vorschlag: Klassifikation festlegen, ggf. `postfach.gelesen` und `audit.abgefragt`.

N6 · niedrig · S3, S10 · Sperre invalidiert offene Reset-Links nicht
- `src/server/actions/benutzer.ts:170–176` löscht nur Sitzungen. Verifikationen `reset-password:*` bleiben 60 Minuten gültig. Nach Entsperren kann ein älterer Link das Passwort ändern, die Anmeldung bleibt mit 2FA geschützt.
- Vorschlag: beim Sperren die Verifikationen des Kontos löschen.

N7 · niedrig · S12 · Klartext-Token und Einladungsdaten ohne Löschfrist
- Reset-Token im Klartext in `verification.identifier` (`node_modules/better-auth/dist/api/routes/password.mjs:75–77, :125`).
- Einladungslink verschlüsselt im Mail-Ausgang, bis 30 Tage nach Versand (`benutzer.ts:71–75`, `src/lib/auth/passwort.ts:14`, `src/lib/eingaenge/loeschlauf.ts:105–109`).
- Einladungen mit Name und E-Mail (`src/lib/db/schema/rechte.ts:29–44`) haben keine Löschfrist, `loeschlauf.ts` erfasst sie nicht.
- Vorschlag: Link nach Versand aus der Nutzlast entfernen, Löschfrist für abgelaufene und angenommene Einladungen.

N8 · niedrig · Weiterleitung · Geschützte Seiten ohne Sitzung antworten mit 200
- Live: HTTP 200 mit Stream-Anweisung `NEXT_REDIRECT;replace;/verwaltung/anmelden;307`, kein echter 3xx-Status. Kein Personendatum im Body.
- Vorschlag: Sitzungscookie im Proxy prüfen und mit 307 antworten (optional).

Hinweise (kein Befund)
- H-1: CSP mit `style-src 'unsafe-inline'` (`src/lib/sicherheit/header.ts:36, :45`).
- H-2: Secure-Cookie hängt am URL-Schema (`src/lib/auth/optionen.ts:11, :43`). `.env` nutzt `http://`. Die App warnt beim Start (`docs/BETRIEB.md:18`).
- H-3: `src/lib/rechte/matrix.ts:154`: `darf()` ohne Ziel liefert für Organisationsredaktion bei `.lesen` true. Aktuell keine Lücke, aber fehleranfällig.
- H-4: `src/lib/eingaenge/export.ts:23`: führende Leerzeichen vor Formelzeichen werden nicht abgefangen. Die Präfixliste entspricht OWASP.
- H-5: `passwort-neu/page.tsx:10`: Reset-Token in der URL. Standard, 60 Minuten gültig, einmalig.

---

2. LIVE-PRÜFUNGEN (Port 3200)

- POST `/api/auth/sign-in/email` (fiktiv): 403. OK.
- POST `/api/auth/two-factor/verify-totp`: 403. OK.
- POST `/api/auth/sign-up/email`: 403. OK.
- GET `/api/auth/passkey/generate-authenticate-options`: 403. POST `/api/auth/passkey/verify-authentication`: 403. POST `/api/auth/passkey/authenticate`: 404 (keine Route). OK.
- POST `/api/auth/reset-password` mit ungültigem Token: 400, `INVALID_TOKEN`. OK.
- GET `/api/auth/reset-password/<Token>?callbackURL=https://evil.example.test/…`: 403. Kein offener Redirect. Mit internem Ziel: 302 nach `/verwaltung/passwort-neu?error=INVALID_TOKEN`. OK.
- POST `/api/auth/request-password-reset` (fiktive Adresse): 200, generische Meldung. Offen, siehe M1.
- Ratentest `request-password-reset`: wechselnde X-Forwarded-For (198.51.100.21 bis .24): 200, 200, 200, 200. Gleicher Wert (203.0.113.77): 200, 200, 200, 429. Befund H1.
- POST `/api/wartung/loeschfristen` ohne Token: 401. Mit falschem Token: 401. POST `/api/wartung/cache-erneuern` ohne Token: 401. OK.
- GET `/verwaltung/eingaenge/export?format=csv` und `format=json` ohne Sitzung: 403. POST: 405. OK.
- GET `/verwaltung`, `/benutzer`, `/konto`, `/eingaenge`, `/audit`, `/tickets`, `/postfach` ohne Sitzung: 200 mit `NEXT_REDIRECT`-Stream. Body ohne Personendaten (nur Oberflächentexte und die öffentliche Adresse `info@igmg-wetzlar.de`). N8.
- Header `/verwaltung`: Nonce-CSP mit `strict-dynamic`, `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`, `X-Frame-Options: DENY`. OK.
- GET `/api/auth/get-session` ohne Cookie: 200, `no-store`, Body `null`. OK.
- Client-Bundle `.next/static`: keine Treffer für GEHEIMNIS, SECRET, DATABASE_URL, EINGANG_SCHLUESSEL, RATE_GEHEIMNIS, WARTUNG_TOKEN, BETTER_AUTH_SECRET, ALTCHA_GEHEIMNIS. Auch keine Werte aus `.env` im Bundle. S7 OK.

---

3. FORMULAR JE DATEI UND PUNKT

Format: Sx · Status · Fundstelle · Schwere · Hinweis. Nicht zutreffende Punkte sind mit n/a markiert.

3.1 `src/server/actions/benutzer.ts` (261 Z.)
- S1 · OK · L50, 108, 130, 165, 179, 190, 208, 222, 248 erste Anweisung `verlangeRecht`. Selbstschutz L167, 192, 210.
- S1 · BEFUND · L136–139, 168–169, 211–212 · mittel · M3.
- S2 · OK · L65, 133, 223, 249 (Zod). Ausnahme L122 · N2.
- S3 · OK / BEFUND H1 · L230, 252 (IP:Konto). IP-Anteil umgehbar.
- S4 · OK · L66, 137, 238 nur Schlüssel; Audit-Details L97, 151–154 ohne Personendaten.
- S5 · OK · Audit im selben `tx`: L91, 116, 145, 173, 183, 198, 215, 240, 256. Lesezugriff · M2.
- S6 · n/a (kein Upload).
- S7 · OK · `server-only`. Einladungslink nur in der Antwort an die einladende Person (L104).
- S8 · OK · Drizzle-Builder.
- S9 · n/a (Server Action).
- S10 · OK · Einladungsmail an die eingeladene Adresse (L72–75).
- S11 · OK · keine HTML-Ausgabe.
- S12 · OK · Token gehasht (L83), Mail verschlüsselt (L72–75). Hinweis N7.

3.2 `src/server/queries/verwaltung/benutzer.ts` (144 Z.)
- S1 · OK · Aufrufer prüfen (`benutzer/page.tsx:17`, `[id]/page.tsx:19`). Recht nur Administration (`matrix.ts:85–86`), keine Organisationsbindung nötig.
- S2 · BEFUND · L87 nur Längenprüfung · niedrig · N2.
- S4 · OK · keine Logs.
- S5 · BEFUND · L82–90, 103–116 · mittel · M2.
- S8 · OK · L123, 130, 142 parametrisiert.
- S9 · OK · dynamisch.
- S12 · OK · Klartext E-Mail und Name in `user`/`einladung`. Hinweis N7.
- S3, S6, S7, S10, S11 · n/a.

3.3 `src/lib/validierung/benutzer.ts` (43 Z.)
- S2 · OK · L9–10 (Rollen-Enum, mindestens eins), L20 (E-Mail, max. 254, `z.email`), L21 (Name 2–100), L22 (Gültigkeit 1–14 Tage), L38–43 (Passwort 12–128, neu ≠ alt).
- übrige · n/a.

3.4 `src/lib/auth/optionen.ts` (69 Z.)
- S1 · OK · L63–66: HTTP-Registrierung, -Anmeldung, -Zwei-Faktor und -Passkey gesperrt (live 403).
- S2 · OK · L20–21 (Passwortlänge).
- S3 · BEFUND · L44 (`ipAddressHeaders`) · hoch · H1. L61–67 (`request-password-reset` offen) · mittel · M1.
- S7 · OK · Geheimnisse nur aus Umgebung.
- S10 · BEFUND · L32 (`storage: 'database'`) und Session-IP · mittel · M6. Hinweis H-2 zu L11, L43.
- S12 · OK · Zwei-Faktor-Geheimnis und Ersatzcodes verschlüsselt (`node_modules/better-auth/dist/plugins/two-factor/index.mjs:26, :135–149`).
- S4, S5, S6, S8, S9, S11 · n/a.

3.5 `src/lib/auth/server.ts` (47 Z.) und `src/lib/auth/passwort.ts` (23 Z.)
- S1 · OK · `server.ts:34–41`: Session-Hook verweigert Sitzungen für gesperrte Konten. Gegenprüfung `rechte/pruefe.ts:38`.
- S4 · OK · `passwort.ts:22`: Audit ohne Personendaten.
- S5 · OK · `passwort.ts:21–23` (`konto.passwort_zurueckgesetzt`).
- S7 · OK · `server.ts:11–14` Geheimnisprüfung.
- S8 · OK · Drizzle.
- S10 · OK · `passwort.ts:13`: keine Mail an gesperrte Konten. `:14`: verschlüsselt, an die Kontoadresse.
- S12 · BEFUND · Reset-Token im Klartext (`password.mjs:75–77`) · niedrig · N7.
- S3 · n/a (Grenzen in der Action). Zeitsignal N1 in `server.ts:26`.

3.6 `src/lib/rechte/pruefe.ts` (77 Z.)
- S1 · OK · L71–75 `verlangeRecht` als erste Anweisung. L73 Sitzung, zweiter Faktor, Recht. L38 gesperrt. L44 zweiter Faktor aus der Sitzung.
- S4 · OK · L13 `KEIN_RECHT` ohne Interna.
- S8 · OK · L27–30.
- S9 · OK · L35–36 (`headers()`).
- übrige · n/a.

3.7 `src/lib/rechte/matrix.ts` (176 Z.)
- S1 · OK · L85–134: `benutzer.*` und `ticket.bearbeiten` nur bei Administration. L62–72 Organisationsbindung.
- S1 · Hinweis H-3 · L154.

3.8 `src/server/actions/anmeldung.ts` (249 Z.)
- S1 · OK · Sitzungspflicht L117–118, 135–136, 150. Die übrigen Schritte sind öffentlich und begrenzt.
- S2 · OK · L33–36, 89–90, 156–162, 202, 221–223.
- S3 · OK · Konto-Grenzen L50, 64 (8 je 15 min), 97 (Zwei-Faktor; Sperre nach 10 Fehlversuchen laut `node_modules/better-auth/dist/plugins/two-factor/totp/index.mjs:184, :201` und `backup-codes/index.mjs:198, :212`), 122, 139, 180, 211, 242.
- S3 · BEFUND · L47 und alle IP-Anteile · hoch · H1.
- S4 · OK · L65, 75, 103 Audit ohne E-Mail. L76, 104, 197, 246 Fehlerschlüssel.
- S4/S5 · BEFUND · L213–216 (Antwortzeit) · niedrig · N1.
- S5 · OK · L84 (`anmeldung.erfolg`, Passwortpfad), L145, 152, 194 (`einladung.angenommen`, im `tx`).
- S5 · BEFUND · L106–112 · mittel · M7.
- S7 · OK · L127–128: Geheimnis nur an die einrichtende Person.
- S8 · OK.
- S10 · OK · L213: Ziel-URL fest. Live: kein offener Redirect.
- S11 · OK · L63, 76: E-Mail-Echo, React-Escaping.
- S12 · OK · Geheimnis und Ersatzcodes von Better Auth verschlüsselt.
- S6, S9 · n/a.

3.9 `src/server/queries/einladung.ts` (33 Z.)
- S1 · OK · nur aus `anmeldung.ts:181` und `einladung/[token]/page.tsx:10`.
- S2 · OK · L13.
- S8 · OK · L25 SHA-256, parametrisiert.
- S9 · OK · L12 `connection()`.
- S12 · OK · Token nur als Hash (L25, `schema/rechte.ts:36`).

3.10 `src/lib/sicherheit/ip.ts` (21 Z.)
- S3 · BEFUND · L9–19 · hoch · H1.
- S4 · OK · IP wird nicht gespeichert (HMAC in `ratenbegrenzung.ts:20`). Widerspruch bei Better Auth: M6.

3.11 `src/lib/validierung/ratenbegrenzung.ts` (41 Z.) und `src/lib/krypto/index.ts` (71 Z.)
- S3 · OK · `ratenbegrenzung.ts:22–34` atomares UPSERT, Fenster `:28–29`.
- S7 · OK · `krypto/index.ts:12, :55` nur aus der Umgebung.
- S8 · OK · `ratenbegrenzung.ts:21, :24, :28` parametrisiert.
- S12 · OK · `krypto/index.ts:28–46` AES-256-GCM mit zufälligem IV und Tag-Prüfung. `:15` Schlüssel 32 Byte.

3.12 `src/lib/audit/index.ts` (69 Z.)
- S4 · OK · L49 nur Primitive. L5–6 Richtlinie.
- S5 · OK · L60–68 Eintrag im selben `tx`. Fehler brechen die Aktion ab.

3.13 `src/app/api/auth/[...all]/route.ts` (6 Z.)
- S1/S3 · OK · Hook-Sperren live bestätigt (2.).
- S3 · BEFUND · M1.
- S9 · OK · live `no-store`. Hinweis: kein explizites `dynamic`, das Verhalten folgt aus der Request-Nutzung.

3.14 Konten-Seiten
- `benutzer/page.tsx` (150 Z.): S1 · OK · L17 `verlangeSeitenRecht('benutzer.lesen')`. S5 · BEFUND · L22–23 · mittel · M2. S11 · OK · React-Text.
- `benutzer/[id]/page.tsx` (124 Z.): S1 · OK · L19, `notFound` L22. S2 · BEFUND · L21 · niedrig · N2. S5 · BEFUND · L21, 36 · mittel · M2. Searchparams-Allowlist L26–27 OK.
- `benutzer/einladen/page.tsx` (26 Z.): S1 · OK · L9 `benutzer.einladen`.
- `konto/page.tsx` (56 Z.): S1 · OK · L10 `verlangeSitzung`, nur eigene Daten.
- `einladung/[token]/page.tsx` (21 Z.): S1 · OK · öffentlich, Tokenbesitz. L10 Hash-Lookup. L14 Name und E-Mail nur für den Tokeninhaber.
- `passwort-neu/page.tsx` (26 Z.): S10/S12 · Hinweis H-5 · L10.
- `passwort-vergessen/page.tsx` (14 Z.): S7, S11 · OK · statisch.
- `verwaltung/layout.tsx` (28 Z.): S9 · OK · L20 `connection()`. L16 `noindex`.
- `(geschuetzt)/layout.tsx` (98 Z.): S1 · OK · L20 `verlangeSitzung` als erste Anweisung. S4 · OK · L27–32 Zähler nur im Sichtbarkeitsrahmen.

3.15 `src/proxy.ts` (40 Z.)
- S1 · n/a · L9–11: Proxy prüft bewusst keine Rechte. Prüfung in Routen und Actions.
- S9 · OK · L22–32 Nonce-CSP, `no-store` (L30), `noindex` (L29). L39 schließt `/api` aus.
- S10 · OK · `src/i18n/routing.ts:14–15`: keine Sprach-Erkennung und kein Sprach-Cookie.
- S11 · OK · `header.ts:44` nonce und `strict-dynamic`. Hinweis H-1.
- Live: N8.

3.16 `src/server/actions/eingaenge.ts` (114 Z.)
- S1 · OK · L25 `verlangeRecht` in `mitEingang`. L26 Sichtbarkeit in der Query. L28 Recht mit Organisation.
- S1 · BEFUND · L36–37, 81–82, 99–100 · niedrig · N3.
- S2 · OK · L32, 77, 99.
- S4 · OK · L67, 90, 107 ohne Inhalt.
- S5 · OK · L61–70, 89–92, 106–109.
- S8 · OK.
- S11 · OK · Notiz als Text.
- S12 · OK · L84–88 Notizen verschlüsselt (`schema/eingaenge.ts:55–62`).
- S3, S6, S9, S10 · n/a.

3.17 `src/server/queries/verwaltung/eingaenge.ts` (247 Z.)
- S1 · OK · `sichtbarBedingung` L30–46 (Art und Organisation). Angewendet in Liste L69, Zähler L124, Kopf L153, Detail L163, Export L226. `organisationsFilter` L22–28.
- S2 · OK · L48–52 (Enum mit Fallback), L138 UUID.
- S4 · OK · L13 Liste ohne Personendaten. L193 Audit ohne Personendaten.
- S5 · OK · L193 `eingang.gelesen` erst nach Sichtbarkeitsprüfung. Export-Audit in der Route.
- S8 · OK.
- S12 · OK · L196, 202, 245 Entschlüsselung nur für sichtbare Eingänge.

3.18 `src/app/[locale]/verwaltung/(geschuetzt)/eingaenge/page.tsx` und `eingaenge/[id]/page.tsx`
- S1 · OK · Liste L28, Detail L24 `verlangeSeitenRecht('verwaltung.betreten')`. Detail L26–27 `notFound`, L29 Bearbeiten mit Organisation.
- S5 · OK · über die Query-Audit.
- S11 · OK · React-Text (L67, 129). Export-Link nur mit UUID (L162).

3.19 `src/app/[locale]/verwaltung/(geschuetzt)/eingaenge/export/route.ts` (43 Z.)
- S1 · OK · L14 `connection`, L17 `verlangeRecht` (403 bei L19), L22 Sichtbarkeit (403).
- S2 · OK · L24 Filter mit Fallback, L25 UUID, L26 Format-Whitelist.
- S4 · OK · L32 Audit-Details (Anzahl, Art, Status, Format).
- S5 · OK · L28–33 vor der Antwort.
- S9 · OK · L14. L39 `no-store`.
- S11 · OK · L38 `attachment`, L40 `nosniff`. CSV-Schutz in `lib/eingaenge/export.ts:23`.
- Live: 403 ohne Sitzung (csv und json), 405 bei POST.

3.20 `src/lib/eingaenge/export.ts` (39 Z.)
- S11 · OK · L23 Präfix für `= + - @ TAB CR`, L24 Quoting. Hinweis H-4.

3.21 `src/lib/eingaenge/arten.ts` (18 Z.), `fristen.ts` (47 Z.), `loeschlauf.ts` (127 Z.)
- arten.ts · S1 · OK · L13–14 Rechte aus der Matrix.
- fristen.ts · S2 · OK · L20–24 (1–3650 Tage). S8 · OK.
- loeschlauf.ts · S5 · OK · L99–101 (`frist_geloescht` nur mit Art). L54–58 (Melderlöschung auditiert). S12 · OK · L42 Melderfrist 180 Tage. L96–97 Notizen und Einwilligungen per Kaskade (`schema/eingaenge.ts:47, :59`), Mails gelöscht. S9 · n/a (Aufruf über die Wartungsroute).

3.22 `src/app/api/wartung/loeschfristen/route.ts`, `cache-erneuern/route.ts`, `src/lib/wartung/zugang.ts` (12 Z.)
- S1/S3 · OK · Token vor der Verarbeitung. `zugang.ts:10` fail-closed (unter 32 Zeichen). `:11` konstante Zeit (`krypto/index.ts:66–70`). Live: 401 ohne und mit falschem Token, beide Routen.
- S4 · OK · Antwort nur mit Zählern.
- S8 · OK.
- S9 · OK · `connection()` in `loeschfristen`. `no-store`. `cache-erneuern` nur POST.

3.23 `src/server/actions/postfach.ts` (129 Z.)
- S1 · OK · L34, 75, 112 `verlangeRecht` als erste Anweisung im `try`.
- S1 · OK · L79–80 Teilnahme vor Eingabe. L116–127 nur eigene Zeile.
- S2 · OK · L39, 83. L43–44 Empfänger-Allowlist.
- S4/S5 · OK · L56–65, 96–99 Audit ohne Betreff und Text.
- S5 · Hinweis · Lesen ohne Audit, N5.
- S10 · OK · keine Mails.
- S12 · BEFUND · L55, 87 · mittel · M5.

3.24 `src/server/queries/verwaltung/postfach.ts` (194 Z.) und `src/lib/validierung/postfach.ts` (74 Z.)
- S1 · OK · L74 nur eigene Teilnahmen. L112 Teilnahme. L143–150 `istTeilnehmer`. L191 Zähler.
- S2 · OK · Validierung L8–10 (150, 5000, 50), L13–19 Steuerzeichen, L55–63 FormData.
- S5 · Hinweis · L102–140, N5.
- S8 · OK · L23, 60–63, 108, 124 Parameter in SQL-Vorlagen.
- S11 · OK · Klartext, React-Escaping.
- S12 · BEFUND · M5.

3.25 `src/server/actions/tickets.ts` (156 Z.)
- S1 · OK · L36, 74, 135 `verlangeRecht` als erste Anweisung im `try`. L45, 84, 145 Organisations- und Rechteprüfung.
- S2 · OK · L41, 79, 140 (Zod nach Recht).
- S4/S5 · OK · L61, 100–119, 149–152 Audit ohne Freitext.
- S8 · OK · L93 `for('update')`.
- S12 · BEFUND · L52 (Beschreibung) und L148 (Kommentar) · mittel · M5.

3.26 `src/server/queries/verwaltung/tickets.ts` (258 Z.), `src/lib/validierung/ticket.ts`, `tickets/[id]/page.tsx` (216 Z.)
- S1 · OK · L65–69 Sichtbarkeit, angewendet in Liste L102, Zähler L116, Kopf L142, Detail L231. L50–52 Melderrecht. Seite L27 `verlangeSeitenRecht('ticket.lesen')`, L29–30 `notFound`.
- S2 · OK · L131, 210 UUID. `ticket.ts:27–29, :44` Längen. Seite L22 Listenfilter.
- S2 · BEFUND · `ticket.ts:64` · niedrig · N4.
- S4 · OK · L197 Audit-Detail nur `feld: melder`.
- S5 · OK · L192–198 Melderabruf auditiert, vor der Entschlüsselung.
- S5 · BEFUND · L209–258 · mittel · M4.
- S8 · OK.
- S11 · OK · `tickets/[id]/page.tsx:68, :80–111, :132` React-Text.
- S12 · OK (Melder) · L201 entschlüsselt, nur bei Recht. BEFUND (Beschreibung und Kommentar) · mittel · M5.

3.27 `src/server/queries/verwaltung/audit.ts` (254 Z.) und `audit/page.tsx` (161 Z.)
- S1 · OK · `page.tsx:32` `verlangeSeitenRecht('audit.lesen')`. Recht nur bei Administration (`matrix.ts:85–86`).
- S2 · OK · `audit.ts:139–181`: Aktion L153 gegen Allowlist, Zielart L154, Konto L156, Seite L174 per Regex, Datum L108–117.
- S5 · Hinweis · L215–243 und E-Mails L229–230 ohne Audit, N5.
- S8 · OK · L200–209 Drizzle-Operatoren. L218 feste SQL.
- S11 · OK · `page.tsx:85–88` URLSearchParams. React-Text.

3.28 Datenbankschema (S10, S12)
- `schema/verwaltung.ts:36, 56, 82` · M5.
- `schema/auth.ts:30` (Session-IP) und `:115–120` (Ratentabelle) · M6.
- `schema/rechte.ts:29–44` (Einladung mit Name und E-Mail im Klartext, keine Löschfrist) · N7.
- `system.ts` (`audit_eintrag.benutzer_id` ohne FK): OK, das Audit bleibt bei Kontolöschung erhalten (G-07).
- `schema/eingaenge.ts:55–62`: `eingang_notiz` verschlüsselt. OK.

---

4. NICHT GEPRÜFT (mit Grund)

- Antwortzeit bei Passwort-vergessen und bei der Anmeldung (N1): live NICHT GEPRÜFT. Kein bekanntes Testkonto, Reset-Mails an reale Konten wurden vermieden.
- Anmeldung mit zweitem Faktor und Audit-Eintrag (M7): live NICHT GEPRÜFT. Kein Login im Prüfstand. Code-Befund.
- Gesperrtes Konto end-to-end (Sitzung abgewiesen): live NICHT GEPRÜFT, kein Testkonto. Code: `optionen.ts:63–66`, `server.ts:34–41`, `pruefe.ts:38`.
- Konto-Grenzen der Server Actions (Anmeldung, Passwort vergessen) live: NICHT GEPRÜFT. Die Actions sind nur mit Action-ID aufrufbar und wurden nicht provoziert.
- Parallelität (M3): live NICHT GEPRÜFT, würde Daten ändern. Code-Befund.
- Sitzungs-Cookie-Attribute (Secure, HttpOnly, SameSite): live NICHT GEPRÜFT, keine Anmeldung. Code: `optionen.ts:43` hängt Secure am https-Schema.
- Client-Komponenten: nur per Grep geprüft (`dangerouslySetInnerHTML`, `localStorage`, `sessionStorage`, `document.cookie`, `console.*`). Keine Treffer im Verwaltungscode außer `src/lib/db/migration.ts`. Nicht vollständig gelesen.
- `.next/static`: 43 Vorkommen von `password` nur gefiltert, nicht jede Zeile gelesen. Keine Geheimniswerte gefunden.
- Medien und Uploads (S6): außerhalb der Liste SP-C1, nicht geprüft.
- `src/lib/mail/transport.ts`: nicht gelesen. Logs per Grep ohne Treffer.
- `postfach/[id]/page.tsx`, `tickets/neu/page.tsx`, `einstellungen`: nur Rechteprüfung per Grep belegt.

---

5. ZUSAMMENFASSUNG

Befunde je Schwere: hoch 1 (H1), mittel 7 (M1 bis M7), niedrig 8 (N1 bis N8). Hinweise ohne Befund: 5 (H-1 bis H-5).

Priorität:
1. H1: vertrauenswürdige Proxy-Kette oder Ignorieren von X-Forwarded-For ohne Proxy.
2. M1: `/api/auth/request-password-reset` sperren.
3. M7: Audit-Eintrag `anmeldung.erfolg` für den Zwei-Faktor-Weg, der heute fehlt.
4. M3: Transaktion für die Schutzregel der letzten Administration.
5. M2 und M4: Audit-Einträge für Lesezugriffe auf Personendaten und Ticketinhalte.
6. M5 und M6: Verschlüsselung von Notizen und Freitext, Umgang mit IP-Adressen.

Punkte ohne Befund: Rechte und Organisationsgrenzen (Eingänge, Tickets, Postfach, Audit), Sichtbarkeit in Liste, Detail und Export, Export-Audit, CSV-Formelschutz, Wartungszugang, Sperrung von Sitzungen, Sperre für Mails und Einladungen, Einladungstoken als Hash, Reset ohne gültigen Token, Open-Redirect-Schutz, Client-Geheimnisse, Nonce-CSP und `no-store`.

=== ENDE SP-C1 · BEREIT ZUR RÜCKGABE ===

##### SP-C2 Sicherheit Inhalte/Medien
SP-C2 · Verwaltung: Inhalte und Medien

Basis aller Pfade: /Users/umurey/Downloads/IGMG Wetzlar Website Design/web (in den Zeilen unten als src/… abgekürzt).
Pfadkorrektur: src/components/website/KontaktKarten.tsx existiert nicht. Geprüft wurde src/components/website/kontakt/KontaktKarten.tsx.
~/Downloads/CLAUDE.md (Coday) wurde nicht ausgeführt.
Methode: Code gelesen und mit grep geprüft. Live-Abfragen per curl nur als GET/HEAD gegen http://localhost:3200. In-Memory-Prüfungen mit PGlite und dem Projekt-sharp, ohne Dateien zu schreiben. Keine Projektdateien geändert, kein Build, kein Commit, kein Serverstart oder -stopp.

## 1. Medien
Dateien: src/lib/medien/verarbeiten.ts, src/server/actions/medien.ts, src/server/queries/verwaltung/medien.ts, src/app/medien/[...schluessel]/route.ts, src/lib/storage/index.ts

- S1 · OK · actions/medien.ts:52, 107, 126, 142, 158: verlangeRecht ist die erste Anweisung (medium.hochladen bzw. medium.loeschen). Keine Organisationsbindung nötig, die Mediathek ist organisationsübergreifend (rechte/matrix.ts:62–72). Query ladeMedium prüft die UUID (queries/verwaltung/medien.ts:34). Seite prüft medium.lesen (medien/[id]/page.tsx:19).
- S2 · BEFUND B9 (niedrig) · verarbeiten.ts:10, 63 setzt 10 MB, Textfelder in actions/medien.ts:29–34 sind geprüft. Die Obergrenze greift in der Praxis erst beim Next-Standardlimit von 1 MB.
- S3 · NICHT ANWENDBAR · nur Verwaltungsaktionen mit Rolle, keine öffentliche oder anmeldenahe Action.
- S4 · OK · Audit nur mit IDs, Typ und Größe (actions/medien.ts:88–97, 164–167). Fehler nur als Schlüssel datei_<grund> (:63). Keine Logausgaben in den Prüfdateien.
- S5 · OK · protokolliere in der Transaktion: hochladen :88, aendern :118, inPapierkorb :135, wiederherstellen :150, endgueltigLoeschen :164. Lesezugriffe nicht protokolliert, siehe B10.
- S6 · OK · Typ nur über Magic Bytes (verarbeiten.ts:25–36). SVG, HTML, GIF und HEIC werden mit null abgelehnt (:35). Bilder werden mit sharp neu kodiert (:71–82). Nachbau-Test: EXIF vorher vorhanden, nachher entfernt, GPS-Marker weg. Schlüssel nur aus Hash und [a-z0-9-] (:39–50, :91). Pfadausbruch ausgeschlossen (storage/index.ts:17–22, :31). PDF bleibt unverändert (verarbeiten.ts:69), siehe B8.
- S7 · OK · Module mit import 'server-only' (verarbeiten.ts:1, storage/index.ts:1). Grep auf .next/static/chunks: 0 Treffer für GEHEIMNIS, SECRET, DATABASE_URL, EINGANG_SCHLUESSEL. Zusätzlich Werte aus .env (ab 12 Zeichen, u. a. DATABASE_URL, BETTER_AUTH_SECRET, RATE_GEHEIMNIS, ALTCHA_GEHEIMNIS, WARTUNG_TOKEN): jeweils 0 Treffer. „password“ nur in Login-Oberfläche.
- S8 · OK · verwendungVon übergibt Werte parametriert (queries/verwaltung/medien.ts:51, 53–58). Der fachliche Fehler der LIKE-Prüfung steht in B1.
- S9 · OK · route.ts:10 `await connection()`, die Route ist dynamisch.
- S10 · OK · route.ts liest keine Cookies und Header. Die Cache-Dauer ist Thema von B7.
- S11 · OK · Dateinamen und Alt-Texte nur als React-Text. route.ts:23 Typ aus der DB, :26 nosniff, :29 CSP sandbox für PDF. Live nicht belegbar, siehe NICHT GEPRÜFT.
- S12 · NICHT ZUTREFFEND · Mediathek enthält öffentliche Medien, keine Formular-, Notiz- oder Melderdaten.

## 2. Gebetszeiten
Dateien: src/server/actions/gebetszeiten.ts, src/lib/gebetszeiten/import.ts, src/server/queries/verwaltung/gebetszeiten.ts

- S1 · OK · verlangeRecht als erste Anweisung in allen fünf Actions (actions/gebetszeiten.ts:49, 69, 108, 130, 179). Recht gebetszeiten.bearbeiten. Seite prüft gebetszeiten.lesen (gebetszeiten/page.tsx:16). Keine Organisationsbindung nötig.
- S2 · BEFUND B5 (niedrig) · Einstellungen per Zod (validierung/einstellungen.ts:27–31, mit Grenzen). NaN und Infinity werden abgelehnt (geprüft). Zeiten per ZEIT_MUSTER (gebetszeiten/typen.ts:39). Datum per Regex und Kalenderprüfung (import.ts:44–48). Reihenfolge, Duplikate, Lücken (:83–95), höchstens 800 Zeilen (:24, :74). Befund: JSON mit null-Zeile, siehe B5.
- S3 · NICHT ANWENDBAR.
- S4 · OK · Fehler nur mit Zeilennummer und Schlüssel (import.ts:21; actions/gebetszeiten.ts:115, 134). Audit ohne Dateinamen (actions/gebetszeiten.ts:42, 149–158, 187–193).
- S5 · OK · Änderungen in der Transaktion protokolliert (:42, :149, :187). Lesezugriff auf Namen der Importierenden nicht protokolliert, siehe B10.
- S6 · OK · Größe 200 KB vor dem Lesen (actions/gebetszeiten.ts:34, :110). Nur Endungen .json oder .csv (:111–113). Die Datei wird nicht gespeichert, der Inhalt wird vollständig geparst, Magic Bytes entfallen. Beim Übernehmen erneute Prüfung, der Vorschau wird nicht vertraut (:132–133).
- S7 · OK · papaparse nur serverseitig (kein Client-Modul). Keine Geheimnisse im Bundle (Grep siehe Medien S7).
- S8 · OK · sql.raw nur mit der festen Konstante GEBETE (actions/gebetszeiten.ts:147; gebetszeiten/typen.ts:2). Werte als Parameter (:144–147). Queries nur über den drizzle-Builder (queries/verwaltung/gebetszeiten.ts:12–16, 33–52).
- S9 · NICHT ZUTREFFEND · keine Route.
- S10 · NICHT GEPRÜFT · lib/gebetszeiten/berechnung.ts liegt außerhalb des Prüfbereichs. Im Prüfbereich gibt es keine externen Aufrufe.
- S11 · OK · Ausgabe nur als React-Text, Zeiten vor dem Speichern geprüft. Kein CSV-Export im Prüfbereich, daher CSV-Formelinjektion NICHT ZUTREFFEND.
- S12 · NICHT ZUTREFFEND · keine Formular-, Notiz- oder Melderdaten.

## 3. Seiteninhalte
Dateien: src/server/actions/seiteninhalte.ts, src/server/actions/seiteninhalte-organisationen.ts, src/server/queries/verwaltung/seiteninhalte.ts, src/server/queries/verwaltung/seiteninhalte-organisationen.ts, src/server/queries/seiteninhalte.ts, src/lib/validierung/seiteninhalte.ts und seiteninhalte/*.ts

- S1 · OK mit BEFUND B4 (niedrig) · actions/seiteninhalte.ts:61, 65 (Lesen und Bearbeiten). Die Bereichsliste (:69, components/verwaltung/seiteninhalte/bereiche.ts:9) schließt Kontakt und Organisationen aus. seiteninhalte-organisationen.ts:32 (Kontakt), :50 (Organisation mit ziel; das bind-Argument ist von Next verschlüsselt), :54. Seite: organisationen/[org]/page.tsx:18–19. Query ohne Bindung: queries/verwaltung/seiteninhalte-organisationen.ts:22–27.
- S2 · BEFUND B2 (niedrig) und B6 (niedrig) · Bild- und Modellpfad: validierung/seiteninhalte/ueber-uns.ts:21 und projekte.ts:47. Obergrenzen und Formate fehlen: B6. Positiv: Links nur https (validierung/seiteninhalte.ts:13, :36). E-Mail im Vorstand mit z.email (vorstand.ts:17). Textlängen über mehrsprachig (validierung/mehrsprachig.ts:4–8).
- S3 · NICHT ANWENDBAR.
- S4 · OK · Fehler nur mit Pfaden und Schlüsseln (seiteninhalte-organisationen.ts:69, :104–119). Audit nur mit Bereich (seiteninhalte.ts:93; seiteninhalte-organisationen.ts:87).
- S5 · OK · protokolliere in der Transaktion bei jedem Speichern (seiteninhalte.ts:93; seiteninhalte-organisationen.ts:87).
- S6 · NICHT ZUTREFFEND · kein Upload.
- S7 · OK · keine Geheimnisse, Schemas enthalten nur Konstanten.
- S8 · OK · Queries mit drizzle eq() (queries/verwaltung/seiteninhalte.ts:33; queries/seiteninhalte.ts:16).
- S9 · NICHT ZUTREFFEND · keine Route.
- S10 · OK · Die öffentliche Ladefunktion ist gecacht und liest keine Cookies oder Header (queries/seiteninhalte.ts:12–22).
- S11 · OK · Ausgabe über React. Social-Links per href (Footer.tsx:56) nur https, geprüft beim Lesen (queries/seiteninhalte.ts:18–19, bei Fehler Standardwerte). E-Mail-Schwäche siehe B6.
- S12 · NICHT ZUTREFFEND · veröffentlichte Angaben, keine Formular-, Notiz- oder Melderdaten.

## 4. Neuigkeiten, Ankündigungen, Kurse, Übersicht
Dateien: src/server/actions/{neuigkeiten,ankuendigungen,kurse}.ts, src/lib/validierung/{neuigkeit,ankuendigung,kurs,richtext}.ts, src/server/queries/verwaltung/{neuigkeiten,ankuendigungen,kurse,uebersicht}.ts

- S1 · OK mit BEFUND B3 (niedrig) · verlangeRecht als erste Anweisung in allen Actions (neuigkeiten.ts:55, 136; ankuendigungen.ts:36, 111, 128, 145; kurse.ts:50, 123, 140, 158). Organisation wird am alten und am neuen Ziel geprüft (neuigkeiten.ts:93, 99; ankuendigungen.ts:61, 66, 105). Kurse haben kein Organisationskonzept. Queries binden: ladeNachrichtFuerVerwaltung (neuigkeiten.ts:70–76), ladeVerwaltungsListe (neuigkeiten.ts:27–30, 54; ankuendigungen.ts:72), Übersicht je Kennzahl (uebersicht.ts:61, 84, 98, 119, 132). Ausnahme: ankuendigungen.ts:96–99 (B3).
- S2 · OK · Zod für alle Felder: Längen (neuigkeit.ts:43–59), Enums (:52–54), Slug-Regex (:64), Datum und Uhrzeit (ankuendigung.ts:52–61; neuigkeit.ts:140–144), Lesezeit (:31–34). Rich-Text über richtextFeld (neuigkeit.ts:30, richtext.ts:61–87), Grenzen Tiefe 8, Knoten 4000, Zeichen 60000 (richtext.ts:10). Links über istErlaubterLink (richtext.ts:15; ankuendigung.ts:46). Bildknoten werden abgewiesen (neuigkeit.ts:76, 99–104). Kurse: kurs.ts:45–111.
- S3 · NICHT ANWENDBAR · nur Verwaltung.
- S4 · OK · Audit nur mit IDs und Aktion (neuigkeiten.ts:111–121, 158, 174, 186; ankuendigungen.ts:75–86; kurse.ts:91–103). Fehler als Schlüssel (neuigkeiten.ts:65; kurse.ts:62).
- S5 · OK · Änderungen in der Transaktion protokolliert.
- S6 · NICHT ZUTREFFEND · kein Upload. bildId wird von diesen Actions nicht gesetzt.
- S7 · OK · keine Geheimnisse.
- S8 · OK · LIKE-Muster parametriert (neuigkeiten.ts:45; kurse.ts:40). Slug-Regex (neuigkeit.ts:64; kurs.ts:92) lässt keine Platzhalter zu. sql-Fragmente ohne Eingabe (uebersicht.ts:40, 94; verwaltung/neuigkeiten.ts:29).
- S9 · NICHT ZUTREFFEND · keine Route.
- S10 · OK · keine Dritten, keine Cookies.
- S11 · OK · React-Ausgabe. Links werden beim Rendern erneut geprüft (components/website/RichText.tsx:32; nachrichten/Ankuendigungen.tsx:27).
- S12 · NICHT ZUTREFFEND · keine Formular-, Notiz- oder Melderdaten.
- Öffentliche Queries: Papierkorb und Status serverseitig (queries/nachrichten.ts:46–52; queries/ankuendigungen.ts:31–34; queries/kurse.ts:37).

## 5. Öffentliche Ausgabe
Dateien: src/components/website/RichText.tsx, src/components/website/nachrichten/{AehnlicheArtikel,Ankuendigungen,Autor,MerkKnopf,NachrichtenFilter}.tsx, src/components/website/kontakt/KontaktKarten.tsx, src/components/website/Footer.tsx (dazu Anfahrt, KarteNachKlick, Zeitleiste)

- S1 · NICHT ZUTREFFEND · öffentliche Komponenten.
- S2 · NICHT ZUTREFFEND · Eingabe liegt nicht hier. Ausgabe prüft Links erneut (RichText.tsx:32; Ankuendigungen.tsx:27).
- S3–S6, S8, S9 · NICHT ZUTREFFEND.
- S7 · OK · Client-Komponenten MerkKnopf und NachrichtenFilter erhalten nur Texte als Props. Kein process.env in src/components.
- S10 · OK · MerkKnopf und NachrichtenFilter speichern nichts (kein localStorage, keine Cookies). Kartenfläche lädt OpenStreetMap erst nach Klick (kontakt/KarteNachKlick.tsx:32–33) mit referrerPolicy no-referrer. URL nur aus Zahlen (kontakt/karte.ts:9). Hinweis: KonzeptHinweis nutzt einen localStorage-Schlüssel (nicht im Prüfbereich).
- S11 · OK · Kein HTML aus Inhalten. RichText hat für image kein Mapping und gibt den Knoten als null aus (RichText.tsx:41–42). Das einzige dangerouslySetInnerHTML in src (components/website/KonzeptHinweis.tsx:102) gibt die feste Konstante SOFORT aus (Zeile 18), keinen Inhalt. Die Text-Komponente nutzt kein innerHTML. Die Zeitleisten-Bilder laufen über next/image (Zeitleiste.tsx:55), siehe B2.
- S12 · NICHT ZUTREFFEND.

## Befunde
B1 · mittel (latent) · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/queries/verwaltung/medien.ts:51 (wirkt in actions/medien.ts:129 und :161)
Die Verwendungsprüfung für Bildknoten im Rich-Text findet keine Verwendung. Die Spalte nachricht.inhalt ist jsonb. Der Text-Cast liefert `"mediumId": "<id>"` mit Leerzeichen, das LIKE-Muster `%"mediumId":"<id>"%` trifft nicht (In-Memory-Test mit PGlite: false). Folge: Ein Medium, das nur im Rich-Text genutzt wird, ließe sich endgültig löschen. Latent, weil neuigkeit.ts:76 und 99–104 Bildknoten abweisen und RichText.tsx:41–42 sie nicht ausgibt. Vorschlag: parametriert über jsonb, etwa jsonb_path_exists(inhalt, '$.** ? (@.mediumId == $id)', jsonb_build_object('id', <id>::text)), mit Test auf echtem jsonb. Dasselbe für veranstaltung.beschreibung und wissen_thema.inhalt, sobald dort Rich-Text geschrieben wird.

B2 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/validierung/seiteninhalte/ueber-uns.ts:21 und .../seiteninhalte/projekte.ts:47
Die Regel ^\/(?!\/)\S*$ lässt /\host durch. Die Regel in src/lib/inhalt/links.ts:7 schließt das aus. Belege: Der Regex-Test ist true. Der WHATWG-Parser macht aus /\evil.example/x.jpg die Adresse https://evil.example/x.jpg. Live gilt: /_next/image?url=%2F%5Cevil.example%2Fx.jpg liefert 400, die Kontrolle /medien/x.jpg liefert 404 (Pattern passt). Die Zeitleiste ist damit abgefangen. projekte.modell wird öffentlich nicht gerendert. Vorschlag: Regel durch ^\/(?![\/\\])\S*$ ersetzen, Medien-Adressen /medien/ nicht als Bildpfad erlauben.

B3 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/queries/verwaltung/ankuendigungen.ts:96–99
ladeAnkuendigungFuerVerwaltung(id) lädt ohne Organisationsbindung. Die Seite prüft erst danach (ankuendigungen/[id]/page.tsx:20–21), vor dem Rendern. Vorschlag: Parameter organisationen wie in neuigkeiten.ts:70–76.

B4 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/queries/verwaltung/seiteninhalte-organisationen.ts:22–27
Die Query nimmt jeden Bereich ohne Organisationsprüfung an. Aufrufer prüft (organisationen/[org]/page.tsx:18–19). Der Name ladeSeiteninhaltFuerVerwaltung ist in queries/verwaltung/seiteninhalte.ts:25 doppelt belegt. Vorschlag: Bereich auf BEREICH_ORGANISATION begrenzen, Namen trennen.

B5 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/gebetszeiten/import.ts:29, 79–81 (aufgerufen aus actions/gebetszeiten.ts:114)
Ein JSON-Import mit [null] löst Object.entries(null) aus. Der TypeError ist nicht gefangen, die Action wirft statt eines Importfehlers. Vorschlag: Zeilen, die kein Objekt sind, als format melden.

B6 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/validierung/seiteninhalte.ts:22, 24–34, 38 sowie vorstand.ts:16, 27, 33–34 und ueber-uns.ts:41–44
Fehlende Obergrenzen: oeffnungszeiten, vorstand, vorsitzende, aufgaben, erfolge, zeitleiste, werte, absaetze. start und ende (:31–32) ohne Format. email (:22) ohne Formatprüfung, landet in mailto (KontaktKarten.tsx:51, Footer.tsx:88). koordinaten (:38) ohne Bereich. Die JSON-Größe ist nur durch das Next-Limit begrenzt (actions/seiteninhalte.ts:75). Vorschlag: .max() ergänzen, z.email(), Koordinatenbereich ±90/±180, HH:MM-Regex, eigene Größenprüfung.

B7 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/medien/[...schluessel]/route.ts:25
Cache-Control: public, max-age=31536000, immutable. Nach Papierkorb oder Löschung liefert die Route neu 404 (:19), bereits geladene Kopien bleiben im Browser bis zu einem Jahr. Relevant für Löschfristen (K-05). Vorschlag: für Medien mit Löschwunsch kürzere max-age oder no-cache mit ETag, Verhalten im Löschkonzept dokumentieren.

B8 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/medien/verarbeiten.ts:69 (Kommentar :6–8)
PDF wird unverändert gespeichert, PDF-Metadaten (Autor, Ersteller, XMP) bleiben. Bildmetadaten werden entfernt. Vorschlag: PDF-Info-Dictionary und XMP leeren, oder Hinweis im Upload-Formular.

B9 · niedrig (Funktion, keine Sicherheitslücke) · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/medien/verarbeiten.ts:10 und /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/next.config.ts (ohne serverActions-Konfiguration)
Die App-Grenze 10 MB ist nicht erreichbar. Next begrenzt Server-Action-Bodies standardmäßig auf 1 MB (Next-Dokumentation). Größere Bilder scheitern am Framework ohne Formularmeldung. Vorschlag: experimental.serverActions.bodySizeLimit bewusst auf 10 MB setzen (Kosten von sharp beachten), oder MAX_BYTES auf das Limit senken und eine Meldung ergänzen.

B10 · niedrig · /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/server/queries/verwaltung/gebetszeiten.ts:43 (ladeImporte mit Namen der Importierenden); dazu queries/verwaltung/medien.ts:19–30 (dateiname)
Lesezugriffe auf Personenangaben werden nicht protokolliert (S5). Vorschlag: Zugriff protokollieren oder begründen, Dateinamen auf Personenbezug prüfen.

Hinweise, keine Befunde:
- H1: neuigkeit.ts:11 und :75 sagen, Bilder folgen mit C11. Medien existieren bereits, der Editor bietet Bilder an (components/verwaltung/richtext/RichTextEditorKern.tsx:159), das Speichern weist sie ab. Funktionskonflikt.
- H2: actions/medien.ts:66–71: Der Dublettentreffer ignoriert imPapierkorbSeit, der Upload leitet dann auf ein Papierkorb-Medium.
- H3: actions/medien.ts:106–123: aendern erlaubt Alt-Text im Papierkorb (neuigkeiten.ts:95 verbietet das).
- H4: actions/medien.ts:72: Datei wird vor der DB-Transaktion geschrieben, bei DB-Fehler bleibt eine verwaiste Datei (ohne Zugriff, da 404).
- H5: UPDATE ohne Papierkorb-Guard (neuigkeiten.ts:106–110; ankuendigungen.ts:71–74), nur Randfall.
- H6: queries/nachrichten.ts:50 nutzt new Date() innerhalb von 'use cache' (Lebensdauer Stunden). Geplante Beiträge erscheinen bis zu eine Stunde verspätet. Keine Sicherheitsfolge. Ankündigungen sind dokumentiert (queries/ankuendigungen.ts:46–47).
- H7: Die globale CSP aus den Live-Headern enthält script-src 'unsafe-inline'. Der XSS-Schutz hängt damit an der Ausgabe. Außerhalb des Prüfbereichs.

## Live-Prüfungen
- GET / liefert 200.
- /medien/../../etc/passwd mit --path-as-is: 404. /medien/%2e%2e/%2e%2e/etc/passwd: 404. /medien/0000000000000000/unbekannt.jpg: 404 (fail-closed).
- /_next/image?url=%2F%5Cevil.example%2Fx.jpg: 400 (siehe B2).
- Medienschlüssel auf öffentlichen Seiten (/, /nachrichten, /ueber-uns, /kontakt, /veranstaltungen, /projekte): keiner gefunden. Ein Verzeichnis .medien existiert nicht.

## NICHT GEPRÜFT
- Live-Download einer echten Mediendatei (Content-Type, nosniff, Sandbox): kein Medium im Bestand.
- Vorrang des PDF-CSP-Headers (route.ts:29) vor der globalen CSP: kein PDF vorhanden.
- Live-Test der Rollenprüfung in den Actions: keine Zugangsdaten, und Action-Aufrufe würden Daten ändern. Geprüft nur im Code.
- EXIF-Entfernung nur per Nachbau der Kette (rotate, resize, jpeg) mit dem Projekt-sharp, nicht über verarbeiteDatei selbst.
- Nicht im Prüfbereich: lib/gebetszeiten/berechnung.ts, lib/cache/tags.ts (nur Verwendung geprüft), Client-Formulare der Verwaltung.
- S3 (Ratenbegrenzung) live: nicht anwendbar.

## Zusammenfassung
Befunde je Schwere: hoch 0 · mittel 1 (B1) · niedrig 9 (B2–B10) · gesamt 10.
Rollenprüfung und Organisationsbindung in den Actions sind durchgehend vorhanden. Die Upload-Pipeline (Magic Bytes, Neukodierung, Schlüsselprüfung, sandbox für PDF, nosniff) ist solide. Der Hauptbefund B1 ist derzeit latent.

=== ENDE SP-C2 · BEREIT ZUR RÜCKGABE ===
