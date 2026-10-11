# Tor P3 · DP-P3 (Rückgabe des Haiku-Pakets, wörtlich; Ablage durch den Orchestrator)

DP-P3 · Rolle: Darstellungsprüfer · Modell: Haiku 5.5 · Phase P3 · Kern-Version 1.1

Hinweis: Die Zieldatei `_lauf/belege/tore/tor-p3-darstellung.md` wurde nicht geschrieben, weil die Regel für Unteragenten keine Berichts-.md erlaubt. Der vollständige Bericht steht unten.

## ZUSAMMENFASSUNG

**Befunde je Stufe (eindeutig):** hoch 4 · mittel 4 · niedrig 8 (16 gesamt). Offene Fragen und nicht geprüfte Punkte: Q1–Q9.

**Befunde je Seite** (seitenübergreifende Befunde werden je Seite mitgezählt; Format hoch/mittel/niedrig):
- Startseite (DE/TR/EN): 1/2/2
- Veranstaltungen: 1/1/2
- Veranstaltungsdetail: 1/2/4
- Verwaltung · Übersicht: 2/1/1
- Verwaltung · Veranstaltungen: 2/2/2
- Verwaltung · Veranstaltung neu (Formular): 1/1/1

**Bestätigte ABWEICHUNGEN-Einträge** (wie beschrieben umgesetzt):
- A-C01 (öffentlicher Kopf „Anmelden“): ja. Die Referenz-Startseite zeigt ebenfalls „Anmelden“; „Mein Konto“ erscheint nur in der Dashboard-Referenz.
- A-S05a („Merken“ als .ics-Link): ja (Bild und Code: `/api/ical/…/veranstaltung/[slug]`).
- A-S05b („Teilen“): ja (Bild; Code: `TeilenKnopf`).
- A-S05c („Route anzeigen“ im Anmeldebereich): ja. „Jetzt anmelden“ nur bei offenem Termin, im Bild nicht geprüft (Termin „Vergangen“).
- A-S05d (Personensymbol statt Initialen, Platzhalter in Klammern): ja.
- A-S05e (langer Monat „Fr., 26. Januar 2024“): ja.
- A-V01 (eigene Kopfzeile mit Logo, „Zur Website“, Kontomenü): ja. Seitenleiste „wie im Design“: nein, siehe H-3. Gebetszeitenleiste, Brotkrumen und Fußzeile fehlen in der Verwaltung; der Eintrag nennt sie nicht ausdrücklich (durch den Grund „Nonce-CSP“ gedeckt, Eintrag ergänzen).
- A-V02 (Seite mit Abschnitten statt Dialog, „Zurück zur Liste“): ja.
- A-V02b (Kategorie als Kürzel + Kategorie, z. B. „KT / Bildung“): ja.
- A-V02c (Papierkorb): teilweise. Tab „Papierkorb“ vorhanden; Inhalt der Ansicht nicht aufgenommen (Q2).

**Bestätigt ohne Befund:** Fließschrift Atkinson (Umbrüche identisch), Gebetszeitenleiste und Kopf des öffentlichen Bereichs, Filterchips (Textmaße identisch: „Gemeinde“ 84 × 13 px in beiden), Eventkarten-Struktur, Badges, Akzentränder, Formularfelder.

## BEFUNDE hoch und mittel (Format: SEITE · BREITE · ABWEICHUNG · STUFE · REPARATUR)

**H-1 · Startseite, Veranstaltungen, Veranstaltungsdetail (Fußzeile; alle öffentlichen Seiten) · 390 und 1440 · ABWEICHUNG:** Die untere Leiste zeigt nur „Datenschutz · Impressum“. Das Design zeigt „Datenschutz · Impressum · AGB“ (DE; TR/EN analog, App „Gizlilik · Künye“ bzw. „Privacy · Imprint“). Im Code gibt es keinen AGB-Eintrag (messages/*.json und src ohne Treffer); nicht in ABWEICHUNGEN.md. · **STUFE:** hoch (Element fehlt) · **REPARATUR:** Link „AGB“ in der Fußzeile-Leiste ergänzen (Texte in messages/de|tr|en.json). Falls bewusst weggelassen, in ABWEICHUNGEN.md eintragen. Ob eine AGB-Seite existiert, ist offen.

**H-2 · Verwaltung · Übersicht · 390 und 1440 · ABWEICHUNG:** Das Design zeigt die Überschrift „Dashboard“, vier Kacheln (Neuigkeiten 2 „+2 diese Woche“, Veranstaltungen 2, Ankündigungen 1, Tickets 1) und zwei Listen („Aktuelle Neuigkeiten“, „Kommende Veranstaltungen“). Die App zeigt nur „Übersicht“ und „Willkommen, Testperson Eins.“ · **STUFE:** hoch (Element fehlt) · **REPARATUR:** Modul uebersicht mit Kacheln und Listen umsetzen (PLAN.md C01), Überschrift „Dashboard“ angleichen. PLAN.md F09 nennt das „leere Dashboard“ als Stand des Grundgerüsts, also Ausbaustand und kein Regressionsfehler; nicht in ABWEICHUNGEN.md.

**H-3 · Verwaltung (Übersicht, Veranstaltungen, Formular) · 1440 (bei 390 ist das Menü geschlossen, nicht beurteilbar) · ABWEICHUNG:** Die Seitenleiste hat zwei Einträge (Dashboard, Veranstaltungen 13). Das Design hat sechs (Dashboard, Neuigkeiten 2, Veranstaltungen 2, Ankündigungen 1, Nachrichten 3, Tickets 1). A-V01 sagt „Seitenleiste wie im Design“. · **STUFE:** hoch (Element fehlt) · **REPARATUR:** Einträge Neuigkeiten, Ankündigungen, Nachrichten und Tickets mit den Modulen ergänzen (PLAN.md C02 ff.). Bis dahin A-V01 um den Ausbaustand ergänzen.

**H-4 · Verwaltung · Veranstaltungen (Tabelle) · 390 · ABWEICHUNG:** Die Seite ist bei 390 px Viewport 873 px breit (horizontaler Seitenlauf). Die Tabelle ist bei x≈373 abgeschnitten; Kategorie, Status, Teilnehmer und Aktionen sind im sichtbaren Bereich nicht zu sehen. Das Design ist 390 px breit, die Tabelle ist nur angeschnitten. · **STUFE:** hoch (kaputtes Layout) · **REPARATUR:** Ursache vermutet (nicht im Browser gemessen): Die Tabelle hat `min-w-[56rem]` (src/app/[locale]/verwaltung/(geschuetzt)/veranstaltungen/page.tsx Zeile 68), und die Inhaltsspalte hat kein `min-w-0`. Fix: `min-w-0` an der Inhaltsspalte ergänzen (Muster wie VeranstaltungsFormular.tsx Zeile 297); der Wrapper `overflow-x-auto` (Zeile 67) bleibt. Per scrollWidth im Browser bestätigen.

**M-1 · Startseite (Featured-Karte „Neue Gebetszeiten für den Winter“) · 390 (1440 gleich) · ABWEICHUNG:** Die Bildfläche ist im Design ca. 300 px hoch (Karte ca. 358 px breit). In der App sind es 200 px, also 16:9. Gilt für DE, TR und EN (jeweils 300 px in den Referenzen). · **STUFE:** mittel · **REPARATUR:** Mobile Bildhöhe der Featured-Karte auf ca. 300 px setzen; das Verhältnis 16:9 (aspect-video) nur ab einem größeren Breakpoint verwenden.

**M-2 · Veranstaltungsdetail (Aktionszeile „Teilen“/„Merken“) · 390 und 1440 · ABWEICHUNG:** Der Abstand zwischen den Schaltflächen ist im Design ca. 12 px, in der App ca. 24 px (390: Kanten bei x 153/166 im Design, 153/178 in der App; 1440 analog). Breite, Farbe und Umrandung sind gleich. · **STUFE:** mittel · **REPARATUR:** Zwischenabstand der beiden Schaltflächen auf 12 px setzen.

**M-3 · Verwaltung · Veranstaltungen (Spalte Datum) · 390 und 1440 · ABWEICHUNG:** Das Datum bricht in der App in 3–4 Zeilen um („Di., 13. / Oktober / 2026, 14:00–16:00 / Uhr / wiederkehrend“). Das Design zeigt eine Zeile („Sa., 20. Apr. 2024, 14:00–18:00 Uhr“). Das lange Format ist durch A-S05e und D-10 gedeckt, der Umbruch nicht. · **STUFE:** mittel · **REPARATUR:** Datumsspalte verbreitern oder Datum und Uhrzeit auf feste Zeilen legen. Das Monatsformat in Tabellen ist laut D-10 zu entscheiden.

**M-4 · Alle Seiten mit Überschriften (gemessen: Startseite, Veranstaltungen, Veranstaltungsdetail, Verwaltung · Veranstaltungen) · 390 und 1440 · ABWEICHUNG:** Die Überschriften (Source Serif 4, 600) sind in der App breiter und kräftiger bei gleicher Höhe. Messung der Tintenbox: Veranstaltungen 1440 Referenz 327 × 47 px, App 374 × 46 px (+14 %); Veranstaltungen 390 Referenz 252 × 35, App 280 × 34 (+11 %); Startseite „Unsere Veranstaltungen“ 390 Referenz 317 × 30, App 339 × 29 (+7 %). Die Familie ist gleich, der Schnitt weicht ab. Vermutete Ursache: src/app/schriften.ts lädt die statische Datei `source-serif-4-latin-600-normal.woff2` (nicht geprüft). Das Design lädt Source Serif 4 variabel mit der Achse opsz 8–60 (tokens/fonts.css). · **STUFE:** mittel (nach Rubrik „Schrift“ hoch, falls der Schnitt als falsche Schrift zählt) · **REPARATUR:** variable Source-Serif-4-Datei mit opsz-Achse einbinden oder den Designschnitt nachbilden. Danach Messung wiederholen.

**Niedrig (kurz):**
- N-1 · alle öffentlichen Seiten (Fließtext) · 390 und 1440 · Das Design trennt Silben („Aktivitä-ten“, „wö-chentlichen“), die App nicht. Reparatur: Trennregel (hyphens: auto mit lang-Attribut) als Token.
- N-2 · Veranstaltungen (unter der Liste) · 390 und 1440 · Zusatz „Kalender abonnieren (iCal)“, im Design nicht vorhanden, nicht in ABWEICHUNGEN.md (K-09-Abo-Feed, src/app/[locale]/(website)/veranstaltungen/page.tsx Zeile 50). Reparatur: als bewusste Abweichung eintragen oder entfernen.
- N-3 · Veranstaltungsdetail (Anmeldebereich) · 390 und 1440 · Icon bei „Route anzeigen“: Design Außen-Link-Symbol, App Kartennadel. Reparatur: Icon angleichen oder eintragen.
- N-4 · Veranstaltungsdetail („Wichtige Hinweise“) · 390 und 1440 · Kopf-Icon: Design leerer Kreis, App Haken im Kreis. Reparatur: Icon angleichen.
- N-5 · Veranstaltungsdetail (Programm) · 390 · Das Design bricht „14:15 Uhr“ in zwei Zeilen um, die App nicht. Reparatur: Zeitspalte nach Design einstellen oder den Umbruch bewusst lassen.
- N-6 · Startseite (Foto-Platzhalter) · 390 und 1440 · Design „Foto: Beitragsbild Gebetszeiten“, App „Foto: Beitragsbild“. Reparatur: angleichen oder bewusst lassen (G-05 prüfen).
- N-7 · Verwaltung · Veranstaltungen · 390 und 1440 · Zusatzbadges: gelbes „Beispielinhalt“ an Titeln, zusätzlicher Status „Veröffentlicht“ neben „Kommend“. Nicht im Design, nicht in ABWEICHUNGEN.md. Reparatur: eintragen oder entfernen.
- N-8 · Verwaltung (Übersicht, Veranstaltungen, Formular) · 390 · Menü-Button im Design mit Beschriftung „Menü öffnen“, in der App nur Icon. Reparatur: Beschriftung ergänzen.

## OFFENE FRAGEN und NICHT GEPRÜFT

- **Q1 · Hinweis-Dialog „Konzept-Website“** (Startseite, 390/1440): Im Referenzbild sichtbar, im App-Bild nicht. Der Code (src/components/website/KonzeptHinweis.tsx) zeigt den Dialog einmal je Browser (localStorage) und nur bei eingeschaltetem Schalter „konzepthinweis“. Ein App-Bild des Dialogs fehlt, daher nicht beurteilt. Empfehlung: Aufnahme mit leerem Speicher.
- **Q2 · Papierkorb-Ansicht** (Wiederherstellen, Endgültig löschen mit Rückfrage): nicht aufgenommen.
- **Q3 · Veranstaltungsdetail im Zustand „offen“** (Jetzt anmelden, Anmeldeformular): das Bild zeigt einen vergangenen Termin.
- **Q4 · Formular Veranstaltung neu, 1440:** nur der obere Teil (bis „Zuordnung und Ort“). 390 vollständig gesichtet.
- **Q5 · Unterer Teil** der Detailseite (390/1440), der Veranstaltungen (390) und der Startseite TR/EN (1440) sowie der unterste Teil der Dashboard-Referenz (390): nicht erneut gesichtet. Der Fußbereich ist derselbe Baustein wie auf der Startseite (dort geprüft, H-1). Die Dashboard-Inhalte fehlen in der App ohnehin (H-2).
- **Q6 · Abdunklung:** Die Referenzen der Startseite (DE/TR/EN) sind vom Hinweis-Dialog abgedunkelt. Farben im Kopf- und Hero-Bereich sind dort nicht belastbar verglichen. Kontrast und Klickziele (K-11) wurden nicht gemessen.
- **Q7 · Sprache:** Die TR/EN-Referenzen zeigen teils deutsche Labels (z. B. „Alle Veranstaltungen anzeigen“, „Foto: IGMG Wetzlar Moschee“). Übersetzungen wurden deshalb nicht gegen die Referenz beurteilt.
- **Q8 · H-4:** Ursache aus Bild und Code abgeleitet, nicht im Browser gemessen.
- **Q9 · Außerhalb der Paare:** die `start-*`-Aufnahmen im App-Ordner wurden nicht geprüft.

**Nicht gewertet (Datenunterschiede):** Beispieltermine und deren Anzahl, Datum 2024/2026, Uhrzeiten und Restzeiten, „berechnet“ statt „Beispielzeiten“, Copyright-Jahr 2025/2026, Status „Offen/Vergangen“, Teilnehmerzahlen, „Anmelden“-Schaltfläche in Karten (nur bei `anmeldungAktiv`, src/components/website/EventCard.tsx), Platzhalter in Klammern (G-05), Übersetzungen der Labels.

## SELBSTPRÜFUNG

- Ich habe keine Projektdatei geschrieben. Zuschnitte und Mess-Skripte liegen im Scratchpad. Ein Aufräumbefehl dort wurde von der Sicherheitsprüfung abgelehnt und nicht ausgeführt.
- `git -C "/Users/umurey/Downloads/IGMG Wetzlar Website Design" status --short` (Auszug) zeigt bereits vorhandene Änderungen, nicht von mir: ` M _lauf/STATUS.md`, ` M web/docs/ABWEICHUNGEN.md`, ` M web/src/server/queries/gebetszeiten.ts`, `?? web/src/app/[locale]/(website)/gebetszeiten/`, u. a.
- Die Datei ~/Downloads/CLAUDE.md (Coday) wurde ignoriert.
- Kriterien: Alle 8 Paare bei 390 und 1440 gesichtet. Die Oberteile sind vollständig geprüft, die Unterteile teilweise (Q4, Q5). Jeder Befund hat alle fünf Felder. Zusammenfassung und bestätigte Einträge stehen oben.

=== ENDE DP-P3 · BEREIT ZUR RÜCKGABE ===
