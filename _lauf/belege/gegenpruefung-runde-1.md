# Gegenprüfung Runde 1 (Haiku 5.5), 2026-10-11

P1-GP1 · Angriff auf PLAN v1 (Stand 02:12, seither unverändert)

**LÜCKEN**
1. **B03 / Z-05:** Ob ein Kontaktformular kommt, ist offen (S11 OFFENE FRAGE 5). Das Design hat keins, Z-05 zählt es aber als eines von fünf. Vorschlag: Nutzerentscheidung N1 vor B03.
2. **B04 / Z-05:** Felder sowie Ausgebucht und Abgesagt sind offen (S05 OFFENE FRAGEN 1 und 3). Ohne Feldliste ist kein Schema nach G-07 möglich. ALTCHA ist ohne Design (S20 F3). Vorschlag: Feldliste als B04-V (O) vor Welle B.
3. **Welle D / Z-03:** D-Q2, D-Q3, D-S1, D-P1 und D-O1 bis D-O4 haben kein Übersetzungspaket; Ü-Pakete gibt es nur für D06, A19–A21 und B10. Vorschlag: D-Ü nach Welle D.
4. **Schlüssel / Z-03:** Baumeister dürfen messages/*.json nicht schreiben, und ihr Briefing liefert deutsche Schlüssel nur im Formular. Vorschlag: `<Kennung>.de.json` in `_lauf/eingang/`, O-Merge je Tor (A01–A18, B01–B09, C01–C15).
5. **F11 / K-13, Z-06:** Das Next.js-Sicherheitsupdate zum 14.10.2026 steht nur als „Sofortpaket“ (PLAN Zeile 185, ADR 0001). Ein Paket dafür existiert nicht. Vorschlag: F11 (O) heute.
6. **C10 / Z-05:** ABNAHME verlangt für Tickets Spam-Schutz, Einwilligung und zwei Mails. ADR 0005 und C10 führen Tickets als intern. Vorschlag: Nutzerentscheidung N2; Streichung nur mit Zustimmung.
7. **Z-02:** ABWEICHUNGEN.md (K-18, ADR 0004, ADR 0016) hat keinen Schreiber. Vorschlag: O-ABW (O) führt die Baumeister-Abschnitte je Tor zusammen.
8. **Z-09:** Die „sechs Messrouten“ sind nicht benannt (H01 nennt sechs, Tor P3 drei). Vorschlag: H01-V (O) vor Tor P3.
9. **Z-01 bis Z-11:** T1–T7 und T9 sind in keiner Laufdatei definiert, nur T8 steht im PLAN (D-T1). Vorschlag: P2-T (TL) mit Befehlstabelle vor Tor P2.
10. **D-T1 / Z-08, Z-10:** Kein axe-Test für /quran und /suche. Für src/lib/seo, validierung und mail/vorlagen gibt es keine Unit-Zuweisung. Vorschlag: D-T1 erweitern, Unit-Paket TS.
11. **Welle C / Z-04:** C02 bis C14 dürfen keine `src/server/queries/<modul>.ts` schreiben, ADR 0005 verlangt aber Verwaltungs-Queries. Vorschlag: Query-Datei je Modul in die Dateiliste aufnehmen.
12. **C16 / Z-04:** Einstellungen hat kein Blatt (Spalte „Blatt“ = ADR 0005), und Z-04 zählt 14 Module. Vorschlag: Blatt nachziehen, Zählung klären.
13. **Z-01, Z-02:** Der tr/en-Pfad von /bildung/voranmeldung ist im Routing gesetzt, laut S20 OFFENE FRAGE 1 aber offen. Logos (assets/logo-*.png) haben kein Paket, obwohl Header und Footer Logo-Bezüge haben. Vorschlag: F03-N (O) und MENSCHEN-Einträge vor B05 und D01.
14. **D-Q1 / Z-10:** Der Tanzil-Import läuft „zur Buildzeit“, die Datei liegt aber außerhalb des Repos (ADR 0009). Das Verhalten des Builds ohne Datei fehlt. Vorschlag: Platzhalterpfad in D-Q1 festlegen.

**REIHENFOLGE**
- **D01 nach A13:** Die PrayerTimesBar braucht Tageszeiten aus A13 (K-08, ADR 0008). D01 in Phase P3 hat aber nur „Abh. P2“.
- **Welle A bis D ohne Abh.-Spalte** (PLAN Zeilen 60, 86, 103, 127): Ungenannt bleiben A14 bis A16 und A22 nach A13, A09 nach A08, C02 nach C15, B03 bis B07 nach B02 sowie D-O1 und D-O2 nach D-Q2, D-Q3 und D-S1.
- **Tor D (Z-02, Z-07):** DP und SP haben keinen Prüfumfang. Z-02 für D-Q3, D-S1 und D-P1 ist niemandem zugewiesen.

**KONFLIKTE**
- **A01 ↔ A02:** `drizzle/seeds/nachrichten.ts` und `src/server/queries/nachrichten.ts` (Bereichsregel).
- **A11 ↔ A12:** `drizzle/seeds/islamisches-wissen.ts` und die Query (beide S14).
- **A13 ↔ A14 ↔ A15:** `src/server/queries/gebetszeiten.ts`. A15 braucht `(website)/gebetszeiten/page.tsx` von A14, darf es aber nicht ändern.
- **C04 ↔ C05:** `src/server/actions/seiteninhalte.ts` und der Ordner `verwaltung/seiteninhalte/**`.
- **D-O1 ↔ D-O3:** `src/lib/seo/jsonld.ts`. **D-O1 ↔ D-Q2, D-Q3, D-S1:** `generateMetadata` in neuen Seitendateien ohne Grenze.
- **A06 ↔ B03:** `(website)/kontakt/**`, die Formularfläche. B03 darf sie nicht einbinden.
- **D04 ↔ B04:** `(website)/veranstaltungen/**`, der Anmeldebereich-Platzhalter.
- **Z-05 ↔ ADR 0005 und C10:** öffentlich gegen intern.
- **Z-03 ↔ ADR 0016 und Welle C:** Verwaltung nur Deutsch laut Auftrag Abschnitt 0, Z-03 verlangt aber „alle UI-Texte“. Absenkung nur mit Nutzerzustimmung.
- **G-09 ↔ ADR 0001, 0007, 0014 (H02, `LIZENZEN.md`):** LGPL (sharp), MIT-0 (nodemailer) und OFL (Schriften) stehen nicht auf der Liste. Offen ist M-060.
- **H04 ↔ E-010 (`docs/HANDBUCH-VERWALTUNG.md`):** Bildschirmfotos im versionierten Handbuch widersprechen dem Ausschluss von App-Fotos aus dem Repo.

**RISIKEN**
1. **Arbeitsbaum und Commits:** E-008 teilt einen Arbeitsbaum, E-004 verlangt einen Commit je Paket und Push in ein öffentliches Repo (E-005). Der PLAN nennt keinen Ausführenden. Frühwarnzeichen: `index.lock`-Fehler, Commits mit Fremddateien. Gegenmaßnahme: O committet seriell, `git add` nur für Paketdateien, Pre-Push-Prüfung (E-005b) vor jedem Push.
2. **Orchestrator-Engpass:** Die Schichtenzahl 17 (PLAN §4) zählt nur Haiku-Pakete. Rund 33 Opus-Pakete liegen auf dem kritischen Pfad (P2, D01 bis D05). Frühwarnzeichen: Ein O-Paket ist länger als eine Schicht offen, oder eine Welle wartet auf D01 oder D04. Gegenmaßnahme: Zeitplan mit O-Pfad neu rechnen, Stufe-3-Pakete früher an OU geben.
3. **Späte Gates:** T8 (Z-07) läuft erst in D-T1. Das JS-Budget (K-12) wird an drei Routen in Tor P3 gemessen, die sechs Routen erst in H01 (Z-09). Frühwarnzeichen: Drittanfrage im Netzwerkprotokoll einer Welle-A-Seite (A06 Karte, A15 Kompass) oder JS über 180 kB. Gegenmaßnahme: T8 und Budget-Messung in Tor A, B und C.

=== ENDE P1-GP1 · BEREIT ZUR RÜCKGABE ===
