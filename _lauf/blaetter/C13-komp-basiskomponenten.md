# C13 · Basiskomponenten (Buttons, Felder, Tags, Tabs, Seitenzahlen, Dialog-Rahmen)

## SEITE
Komponentenblatt; Design-Nr. 5, 6, 8, 9, 10 (K:50–51).

## ROUTE
überall. Verwendung: Karten und Seitenkopf (L:152), Dialoge (BC:64).

## QUELLEN
BC = BaseComponents.dc.html; K = 02 Komponenten.dc.html; R = readme.md; L = 00 Laufbuch.dc.html; TC, TS, TY = tokens/colors.css, spacing.css, typography.css. Bestand ui/: bt = button.tsx, bv = button-variants.ts, in = input.tsx, bd = badge.tsx, tb = tabs.tsx, pg = pagination.tsx, dg = dialog.tsx. Übersetzungen src/app/components/: LC = LanguageContext.tsx, EV = Events.tsx, NW = News.tsx, QC = QuranCourses.tsx, SR = StudentRegistration.tsx, NS = NewsSection.tsx. LC:143/401/659 = de/tr/en.

## ZWECK
Gestalt aus dem Design, Sprachfassungen aus dem Bestand (K-02).

## ABSCHNITTE
**1 Buttons (BC:17–29).** Primär: min. Höhe 48, 18 px fett, Padding 0 24; bg --gruen-700, Text --weiss, Radius --radius-md, Hover --gruen-800 (BC:19–20). Sekundär: Rand 2 px --gruen-700, Text --gruen-800, Hover bg --gruen-50 (BC:22). Link: Text --gruen-700, Unterstrich, Hover 2 px (BC:23). Löschen: bg --fehler, Text --weiss (BC:24). Deaktiviert: Rand 1 px gestrichelt --rand, bg --sand, Text --tinte-2 (BC:25). Icon-Button 48 × 48, Rand 1 px --rand (BC:26). Auf Tiefgrün: Träger bg --gruen-950, Radius 12 (BC:27). Fokus: 2 px --gruen-950, Abstand 2 px (BC:13; TS:8).

**2 Felder (BC:32–41).** Höhe 48, Padding 0 14, Rand 1 px --rand, Radius 8, Text 18 px; Label 16 px fett (TY:19); „(Pflichtfeld)“ 400, --tinte-2 (BC:34). Fokus: Rand 2 px --gruen-700 und Outline (BC:35). Fehler: Rand 2 px --fehler; Fehlertext 16 px fett (BC:36). Deaktiviert wie Button (BC:37). Auswahl: Höhe 48, bg --weiss (BC:38). Checkbox 22 × 22, Akzent --gruen-700; ausgewählt Rand 2 px --gruen-700 und bg --gruen-50, sonst Rand 1 px --rand (BC:39).

**3 Tags (BC:44–46).** Pille: Radius --radius-pill, Padding 2 × 12, 16 px fett, ohne Rand. Farben TC:28–33; abgeleitet: Frauen --org-kt (TC:24), Empfohlen --gruen-700/--weiss, Beispielzeiten --warnung (TC:20), Geschlossen --fehler (TC:19).

**4 Tabs und Seitenzahlen (BC:50–52).** Leiste bg --sand, Rand 1 px --linie, Radius --radius-lg, Padding 4. Tab min. Höhe 48, Padding 0 18, 18 px fett. Aktiv: bg --weiss, Text --gruen-800, Schatten --shadow-1 (TS:5), Indikator 3 px --gruen-700 (abgeleitet: Radius 2). Inaktiv: Text --tinte. Seitenzahl 48 × 48, Radius 8, Rand 1 px --rand; aktuell Rand 2 px und bg --gruen-700, Text --weiss. Vorherige/Nächste: min. Höhe 48.

**5 Dialog-Rahmen (BC:54–64).** Überlagerung rgba(--tinte, 55 %) (BC:56; abgeleitet). Fläche bg --weiss, Radius --radius-lg, Schatten --shadow-3 (TS:7), Padding 24, Abstand 12, max. 520 im Beispiel (BC:57). Titel --h4 (TY:15), Padding rechts 56 (BC:59). Fußzeile: Rand oben 1 px --linie; Abbrechen wie Sekundär, Padding 0 20; Bestätigen Padding 0 22 (BC:61). Schließen 48 × 48, Rand 1 px --rand, Icon x 24 (BC:58).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| btn.gruppe | Primär; Primär · Hover; Primär · Fokus; Sekundär; Tertiär / Link; Auf Tiefgrün; Löschen; Bestätigen | – (nur DE in Quelle) | – (nur DE in Quelle) | BC:19–27, 61 |
| btn.teilen | Teilen | Paylaş | Share | BC:26; NW:57/98/139 |
| btn.schliessen | Schließen | – (nur DE/EN in Quelle) | Close | BC:58; dg:68 |
| btn.abbrechen | Abbrechen | İptal | Cancel | BC:61; LC:173/431/689 |
| btn.nicht-verfuegbar | Nicht verfügbar | Müsait değil | Not Available | BC:25; QC:117/207/297 |
| feld.gruppe | Standard; (Pflichtfeld); Fokus; Fehler; Deaktiviert; Auswahl; Wählen Sie aus; AT (Erwachsene); Checkbox und Radio; Ausgewählt; Nicht ausgewählt; Wetzlar; nicht änderbar; Beispielwert (Platzhalter) | – (nur DE in Quelle) | – (nur DE in Quelle) | BC:34–39 |
| feld.fehler | Dieses Feld ist erforderlich | Bu alan zorunludur | This field is required | BC:36; SR:85/125/165 |
| tag.bildung | Bildung | Eğitim | Education | BC:72; LC:107/365/623 |
| tag.veranstaltung | Veranstaltung | Etkinlik | Event | BC:72; LC:108/366/624 |
| tag.jugend | Jugend | Gençlik | Youth | BC:72; LC:109/367/625 |
| tag.wichtig | Wichtig | – (nur DE in Quelle) | – (nur DE in Quelle) | BC:72; NS:15 |
| tag.neuigkeiten | Neuigkeiten | Haberler | News | BC:72; LC:27/285/543 |
| tag.gemeinde | Gemeinde | Cemaat | Community | BC:72; EV:36/78/120 |
| tag.frauen | Frauen | Kadın | Women | BC:72; EV:39/81/123 |
| tag.empfohlen | Empfohlen | Önerilen | Recommended | BC:72; LC:105/363/621 |
| tag.beispielzeiten | Beispielzeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | BC:72; L:193 |
| tag.geschlossen | Geschlossen | Kapalı | Closed | BC:72; QC:74/164/254 |
| tab.heute | Heute | Bugün | Today | BC:51; LC:143/401/659 |
| tab.monatlich | Monatlich | Aylık | Monthly | BC:51; LC:144/402/660 |
| tab.qibla | Qibla | Kıble | Qibla | BC:51; LC:145/403/661 |
| seite.vorherige | Vorherige | Önceki | Previous | BC:52; EV:61/103/145 |
| seite.naechste | Nächste | Sonraki | Next | BC:52; EV:62/104/146 |
| seite.von | Seite 1 von 2 | Sayfa 1 den 2 (abgeleitet) | Page 1 of 2 (abgeleitet) | BC:52; EV:63–64/105–106/147–148 |
| seite.nav | Seiten (aria-label) | – (nur DE/EN in Quelle) | pagination | BC:52; pg:15 |
| dialog.platzhalter | [Dialogtitel]; [Beschreibung] – Inhalt, Formularfelder oder Liste. | – (nur DE in Quelle) | – (nur DE in Quelle) | BC:59–60 |
| ueberschrift.gruppe | Buttons und Links; Formularfelder mit Zuständen; Badges und Tags; Tabs und Seitenzahlen; Dialog-Rahmen; Beispiel (aria-label) | – (nur DE in Quelle) | – (nur DE in Quelle) | BC:17, 32, 44, 50, 51, 55 |
| note.gruppe | Höhe 48 px, Text 18 px fett, Radius 8. Ein Primär-Button je Bereich. Deaktiviert nur mit erklärendem Text. Icon-Buttons 48 × 48 mit aria-label. Entspricht shadcn Button default/outline/link/destructive. Sichtbare Beschriftung über dem Feld, Pflicht mit Wort „(Pflichtfeld)“, Fehler direkt am Feld mit Icon und Klartext, Rand 2 px Fehlerrot. Placeholder nie als Beschriftung. Abdeckung Tinte 55 %, Fläche weiß, Radius 12, Schatten S3, max. 720 px, Schließen-Button 48 px oben rechts, Escape schließt, Fokus bleibt im Dialog. Genutzt von LoginDialog (im Header-Menü), TicketDialog, DisclaimerDialog, Dashboard- und Wissens-Dialogen. | – (nur DE in Quelle) | – (nur DE in Quelle) | BC:29, 41, 64 |

## DATEN
Keine Datenbankinhalte. Vorschlag (abgeleitet): Kategorie (Text, Auswahl, mehrsprachig ja, de Pflicht, tr/en mit Rückfall auf Deutsch); Status „Geschlossen“ (Auswahl, mehrsprachig ja).

## FORMULARFELDER
Feld (abgeleitet aus BC:34–39): id, Label über dem Feld, Pflicht mit „(Pflichtfeld)“, aria-invalid, aria-describedby, disabled, readOnly, placeholder (nie als Label), value. Radio-Gruppe über name „bc-r“ (BC:39).

## INTERAKTIONEN
- Klick, Hover, Fokus wie ABSCHNITTE 1 (BC:13).
- Tabs per Klick (BC:51; Radix, tb:4).
- Seitenzahl: aria-current (BC:52); Bestand als Link (pg:52).
- Dialog: Escape schließt, Fokus bleibt (BC:64; Radix, dg:4).
- Checkbox und Radio wechseln (BC:39).
- Bewegung 150 ms; ohne Animation bei reduzierter Bewegung (R:24).

## ZUSTAENDE
- data-props (BC:68): nur $preview (1100 × 1500), keine Eigenschaften.
- Design (L:152): Button Standard, Hover, Fokus, Deaktiviert (BC:19–27); Feld Standard, Fokus, Fehler, Deaktiviert, Auswahl (BC:34–38); Checkbox an/aus (BC:39); Tag zehn Farbsätze (BC:72); Tab aktiv/inaktiv (BC:51); Seite aktuell/normal (BC:52); Dialog offen (BC:56).
- Bestand: bt sechs Varianten (bt:12–21); bv acht (bv:8–29); in aria-invalid, disabled (in:12–14); tb aktiv, disabled (tb:45); pg isActive (pg:58); dg open, Schließen (dg:41, 66).
- Leer, Erfolg, angemeldet: – (entfaellt, reiner Baustein).

## BILDER
– (entfaellt, keine Bilder). Icons (Icon.dc.html): arrow-right 20 (BC:19), trash-2 20 (BC:24), share-2 20 (BC:26), circle-alert 18 (BC:36), x 24 (BC:58).

## AUFFAELLIGKEITEN
Gestalt: Design. Sprachfassungen: Bestand.
1. Maße: Design 48 px (R:21) gegen bt:24 44 px, in:12 36 px.
2. Schrift: Design 18/16 px (BC:34) gegen in:12 14 px, tb:45.
3. Tags: Pille 999 px (BC:46) gegen bd:8 rounded-md.
4. Dialog: 720 px (BC:64) gegen 520 px (BC:57) und sm:max-w-lg (dg:60); Titel Serif (BC:59) gegen text-lg (dg:105).
5. Seitenzahlen: gefüllte aktive Seite (BC:52) gegen outline/ghost (pg:58).
6. Löschen #AF2B25 (BC:24) gegen bg-red-600 (bv:20); Fokus 2 px (BC:13) gegen ring 3 px (in:13).
7. Deaktiviert gestrichelt (BC:37) gegen opacity-50 (bt:8).

## OFFENE FRAGEN
1. Dialogbreite: 720 px (BC:64) oder 520 px (BC:57)?
2. Löschen: Hover fehlt (BC:24); gilt bv:20?
3. Varianten secondary, ghost, heroLarge, outline (bt:17, bv:17, 26, 14): behalten?
4. Seitenzahlen als Buttons (BC:52) oder Links (pg:52)?
5. Türkische Reihenfolge „Seite 1 von 2“ fehlt (EV:105–106).
6. Dialog-Fußzeile auf dem Telefon: stapeln (dg:90)?
7. Tag-Farben Frauen, Empfohlen, Beispielzeiten, Geschlossen ohne Token: bestätigen.
8. Dialog-Zustände (18): 08 Dialoge und Zustaende.dc.html (L:177), ungeprüft.
9. Übersetzungen fehlen für Löschen, Bestätigen, Wichtig, Beispielzeiten: MENSCHEN.md.

=== ENDE C13 · BEREIT ZUR RÜCKGABE ===
