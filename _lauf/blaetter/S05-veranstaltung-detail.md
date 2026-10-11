S05 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Veranstaltungsdetails“ · Schwierigkeit 1

# Seitenblatt S05: Veranstaltungsdetails

Stand 11.10.2026. Nur gelesen: Design und Bestand. Fundstellen als Datei:Zeile, Berechnetes ist mit „abgeleitet“ markiert.

## SEITE

- Name: Veranstaltungsdetails, Artboard 03.4 (D:15; L:157).
- Sprache: nur Deutsch, lang="de" fest (D:15). Eine tr- oder en-Fassung fehlt in allen Quellen.
- Bestand: Mock-Daten (T:33). Die Anmeldung hat keinen Ablauf (T:308).

## ROUTE

- Ziel: /veranstaltungen/[slug] (K-03). Pfade tr und en: – (nur DE in Quelle).
- Elternseite: Veranstaltungen, Events.dc.html (D:18).
- Zurück: Startseite, Home.dc.html (D:21; T:116).
- Der Bestand nutzt routeParams.id mit Fallback 1 (T:35). Umstellung auf slug nötig.

## QUELLEN

- D = EventDetails.dc.html, 113 Zeilen (Template D:9–97, Script D:98–111).
- T = uploads/igmg-wetzlar-website/src/app/components/EventDetails.tsx, 366 Zeilen.
- F = uploads/igmg-wetzlar-website/src/app/components/EnhancedEventForm.tsx, 390 Zeilen. Verwaltungsformular, nicht die Teilnehmer-Anmeldung.
- R = readme.md, 43 Zeilen. L = 00 Laufbuch.dc.html, 324 Zeilen (Script ab L:141).
- Eigene Blätter, hier nur genannt: Header, PrayerTimesBar, Breadcrumbs, Icon, Footer.

## ZWECK

Detailseite je Veranstaltung (abgeleitet aus D:22–90): Termin, Ort, Auslastung, Beschreibung, Programm, Hinweise, Anmeldebereich, Veranstalter und Kontakt. Die Hauptaktion „Jetzt anmelden“ springt zum Anmeldebereich (D:41, D:72). Zugang aus Events und Startseite (L:313).

## ABSCHNITTE

1. Rücklink (D:21).
2. Kopfkarte (D:22–46): Akzentband, Organisationsbadge mit Logo, Statusbadge, Überschrift, Kategorie, vier Infokarten, drei Schaltflächen.
3. Beschreibung mit Schlagwörtern, Hauptspalte flex 2 (D:49–55).
4. Programm (D:56–63).
5. Wichtige Hinweise auf Bernsteinfläche (D:64–69).
6. Anmeldung mit Anker „anmeldung“, Seitenspalte flex 1 (D:72–79).
7. Veranstalter (D:80–82).
8. Kontakt im Veranstalter-Block (D:83–89).

Footer (D:95) ist ein Import. Komponenten nur mit Attributen: Header active="moschee", current="events", sticky (D:16). PrayerTimesBar (D:17). Breadcrumbs parent-label="Veranstaltungen", parent-href="Events.dc.html", label="Veranstaltungsdetails" (D:18). Icon mit n und size (D:21 ff.).

Texte (A2):

| Schlüssel-Vorschlag | de | tr | en | Fundstelle |
| --- | --- | --- | --- | --- |
| ev.back | Zurück zur Startseite | – (nur DE in Quelle) | – (nur DE in Quelle) | D:21; T:120 |
| ev.org | Ana Teşkilatı; Alt: Ana Teşkilatı Logo | – (nur DE in Quelle) | – (nur DE in Quelle) | D:26–27, D:82 (Eigenname) |
| ev.status.open | Offen | – (nur DE in Quelle) | – (nur DE in Quelle) | D:28; T:47 |
| ev.title | Freitagsgebet mit anschließendem Vortrag | – (nur DE in Quelle) | – (nur DE in Quelle) | D:31; T:36 |
| ev.category | Religiös | – (nur DE in Quelle) | – (nur DE in Quelle) | D:32; T:46 |
| ev.info.labels | Datum · Uhrzeit · Ort · Teilnehmer | – (nur DE in Quelle) | – (nur DE in Quelle) | D:35–38 |
| ev.info.values | Fr., 26. Jan. 2024 · 13:30–15:00 Uhr · Hauptgebetsraum · [Adresse] · 89 / 150 | – (nur DE in Quelle) | – (nur DE in Quelle) | D:35–38; T:37, T:187 abweichend |
| ev.cta.top | Jetzt anmelden · Teilen · Merken | – (nur DE in Quelle) | – (nur DE in Quelle) | D:41–43; T:147, T:151, T:313 |
| ev.desc.h | Beschreibung | – (nur DE in Quelle) | – (nur DE in Quelle) | D:50; T:224 |
| ev.desc.text | Nehmen Sie teil an unserem wöchentlichen Freitagsgebet, gefolgt von einem inspirierenden Vortrag über die Bedeutung der Gemeinschaft im Islam. Der Vortrag wird sich mit aktuellen gesellschaftlichen Themen befassen und praktische Lösungen aus islamischer Sicht aufzeigen. | – (nur DE in Quelle) | – (nur DE in Quelle) | D:51; T:48 |
| ev.tags | Freitagsgebet · Vortrag · Gemeinschaft · Islam | – (nur DE in Quelle) | – (nur DE in Quelle) | D:103; T:68 |
| ev.agenda | Programm · 13:30 Uhr Ankunft und Vorbereitung · 13:45 Uhr Freitagsgebet (Juma) · 14:15 Uhr Vortrag: 'Gemeinschaft stärken' · 14:45 Uhr Fragen & Diskussion · 15:00 Uhr Gemeinsames Beisammensein | – (nur DE in Quelle) | – (nur DE in Quelle) | D:57, D:60, D:104; T:50–56; T:250 ohne „Uhr“ |
| ev.hints | Wichtige Hinweise · Angemessene Kleidung erforderlich · Pünktliches Erscheinen erwünscht · Handys bitte stumm schalten | – (nur DE in Quelle) | – (nur DE in Quelle) | D:65, D:67, D:105; T:58–60, T:266 |
| ev.reg | Anmeldung · 59% ausgelastet · Angemeldet: 89 · Verfügbar: 61 | – (nur DE in Quelle) | – (nur DE in Quelle) | D:73–76; T:291, T:298, T:302 (abgeleitet) |
| ev.reg.cta | Jetzt anmelden · Route anzeigen | – (nur DE in Quelle) | – (nur DE in Quelle) | D:77–78; T:313, T:318 |
| ev.org.h | Veranstalter · [Name – Imam, Veranstalter] · [Initialen] | – (nur DE in Quelle) | – (nur DE in Quelle) | D:81–82; T:43, T:326 |
| ev.contact | Kontakt · [Name – Kontakt Veranstaltung] · [Telefonnummer] · [E-Mail-Adresse Veranstaltungen] · Nachricht senden | – (nur DE in Quelle) | – (nur DE in Quelle) | D:84–89; T:63–65, T:343, T:358 |
| ev.crumb | Veranstaltungen · Veranstaltungsdetails | – (nur DE in Quelle) | – (nur DE in Quelle) | D:18; T:166 |

Nicht sichtbar: aria-Labels „Schlagwörter“ (D:52) und „Auslastung“ (D:38), Screen-Label „03.4 Veranstaltungsdetails“ (D:15). Nur im Bestand, nur Deutsch: „Ausgebucht“, „Abgesagt“, „Aktive Teilnehmer“ (T:85, T:102–103, T:313).

## DATEN

Vorschlag für die Datenbank (A7). Feld, Typ, mehrsprachig:

- slug: Text, eindeutig; nein (K-03).
- titel, beschreibung, thema, zielgruppe, ort_name, tags, hinweise, Aktivität im Ablauf: Text oder Langtext; ja, DE Pflicht, TR und EN mit sichtbarem Rückfall auf DE (K-02; D:31, D:51, D:103). zielgruppe fehlt in allen Quellen (K-09).
- organisation: Auswahl AT, KT, GT, KGT; nein, Anzeigename ja (T:82–85; F:20).
- beginn (Datum, Uhrzeit), ende (Uhrzeit): nein (D:35–36; T:37–39). Zeitzone nicht festgelegt.
- wiederholung: rrule-Text mit Ausnahmen; nein (K-09).
- ort_adresse: Text; nein. Bis zur Lieferung [Adresse] (D:37; L:253).
- status: Auswahl Offen, Ausgebucht, Abgesagt; Anzeige ja (T:101–103).
- anmeldung_pflicht: Wahrheitswert; nein (F:209). platzzahl: Ganzzahl, leer heißt unbegrenzt; nein (F:215–224).
- angemeldet, verfuegbar: abgeleitet aus Anmeldungen und Platzzahl; nein (T:298, T:302).
- ansprechperson, kontakt: Personendaten (Name, Funktion, Telefon, E-Mail); nein. Nicht in Seeds oder Logs (G-04; D:82–87).
- oeffentlich: Wahrheitswert; nein (F:197). preis: Dezimal, optional; nein, nicht im Design (F:231).
- ical: abgeleitet je Termin; Abo-Feed je Organisation (K-09).

## FORMULARFELDER

- Anmeldebereich (D:72–79): keine Eingabefelder. Angezeigt werden Auslastung, Angemeldet, Verfügbar und zwei Schaltflächen.
- Felder einer Teilnehmer-Anmeldung: in D und T nicht definiert (T:308–314). K-07 gilt, sobald Felder feststehen: Server Action mit Zod, Honigtopf, ALTCHA, Ratenbegrenzung, Einwilligung mit Zeitpunkt und Textversion.
- Verwaltungsformular F, nur registrierungsrelevant: „Anmeldung erforderlich“, Checkbox (F:202–209). „Maximale Teilnehmerzahl“, Zahl, min 1, Platzhalter „Unbegrenzt“ (F:215–224).
- Weitere F-Felder (F:76–341): Titel, Beschreibung, Kategorie, Datum, Startzeit, Endzeit, Ort, Öffentliche Veranstaltung, Preis, Tags, Ansprechpartner, Telefon, E-Mail. Pflicht per required: Titel, Beschreibung, Kategorie, Datum, Startzeit, Ort (F:84–177).
- Emojis in F:349 und F:360 widersprechen R:15.

## INTERAKTIONEN

- „Zurück zur Startseite“ führt zu Home.dc.html (D:21; T:116).
- „Jetzt anmelden“ im Kopf springt zum Anker #anmeldung (D:41, D:72).
- „Teilen“ hat kein Ziel (D:42). Im Bestand ohne Handler (T:145).
- „Merken“ schaltet einen Zustand um: toggleSave (D:43, D:107), Label und Hintergrund in D:106. Im Bestand ohne Handler (T:149).
- „Jetzt anmelden“ im Anmeldebereich ruft einen leeren Handler auf: register (D:77, D:107). Im Bestand ohne Handler (T:308).
- „Route anzeigen“ führt zu Contact.dc.html (D:78; L:314). Im Bestand ohne Ziel (T:316).
- „Nachricht senden“ und die E-Mail-Adresse sind mailto-Links (D:87, D:89). Im Bestand ohne Handler (T:356).
- Breadcrumb „Veranstaltungen“ führt zu Events.dc.html (D:18).
- iCal-Link: fehlt in D, T und F. K-09 verlangt eine iCal-Datei je Termin.

## ZUSTAENDE

- data-props: keine (D:98). Script-Zustand saved, Standard false (D:100). false: Hintergrund #FFFFFF. true: Hintergrund #EBF9F2 (D:106). Label bleibt „Merken“ (D:106).
- Ladeplatzhalter, nur Vorschau, keine Daten: Schlagwörter 4, Programm 5, Hinweise 3 (D:53, D:59, D:67).
- Status (T:101–104): Offen grün. Ausgebucht rot, Anmelde-Schaltfläche deaktiviert, Text „Ausgebucht“ (T:102, T:310–313). Abgesagt grau (T:103). Sonst blau (T:104). D zeigt nur Offen (D:28).
- Organisation (T:82–85): Gençlik Teşkilatı (GT), Kadın Teşkilatı (KT), Kız Gençlik Teşkilatı (KGT). AT hat keinen Eintrag und fällt auf „Aktive Teilnehmer“ (T:85). D zeigt „Ana Teşkilatı“ (D:27, D:82).
- Auslastung: „Ausgebucht“ hängt nur am Status, nicht an der Platzzahl (T:310). Verfügbar hat keine Untergrenze und kann negativ werden (T:302, abgeleitet).
- Nicht vorhanden: Lade-, Leer-, Fehler-, Erfolgs- und Angemeldet-Zustand. T arbeitet mit Mock-Daten (T:33).
- Sprache: nur Deutsch. useLanguage ist importiert, t bleibt ungenutzt (T:22, T:30).
- Verwaltung F (nicht diese Seite): Überschrift „Neue Veranstaltung erstellen“ oder „Veranstaltung bearbeiten“ (F:59). Speichern gesperrt ohne Titel, Beschreibung, Datum, Startzeit oder Ort (F:382).

## BILDER

- Hauptlogo: assets/logo-igmg-wetzlar.png, 40 × 40 px, Radius 4 px, Rahmen 1 px (D:26; L:34). T nutzt 32 × 32 px, rund (T:132). Gilt: Design.
- Veranstalter: D zeigt einen Kreis mit 56 px und Initialen (D:82). T lädt /avatars/organizer.png (T:331). Kein Foto in den Quellen: Platzhalter [Foto Veranstalter], Bildrechte offen (L:233).
- Kein Veranstaltungsbild in D und T.
- Icons: Lucide über Icon.dc.html, Strich 2 px, 20 oder 24 px (R:28). Abweichung: circle-check mit 16 px (D:28). Verwendet: arrow-left, circle-check, calendar, clock, map-pin, users, check, share-2, bookmark, circle-alert, user, external-link, phone, mail (D:21–89).
- Logos für GT, KT, KGT (T:71–78) sind im Design nicht enthalten. Zuordnung offen (L:230).

## AUFFAELLIGKEITEN

1. AT-Name: D „Ana Teşkilatı“ (D:27, D:82), T „Aktive Teilnehmer“ (T:85). Für den Text gilt das Design.
2. Kategorie doppelt belegt: F:102 meint den Organisationsbereich (F:20), D:32 und T:46 ein Thema „Religiös“.
3. Termin liegt vor dem Stand (26.01.2024 gegenüber 11.10.2026) und trägt Status „Offen“ (D:28, D:35). Datumsformat uneinheitlich: „Jan.“ (D:35), „Aug.“ (R:12), „Juli“ (L:193). T:37 roh „2024-01-26“.
4. Anmeldung ohne Ablauf: Handler leer (D:107), kein Ziel im Bestand (T:308–314). Teilnehmer-Felder fehlen in D, T und F.
5. Keine Übersetzung: Seite nur Deutsch (T:30). Sie fehlt in der Liste der Seiten mit Sprachtexten (L:35). K-02 verlangt tr und en. Neue Fassungen werden markiert und in MENSCHEN.md geführt.
6. iCal-Link und Zielgruppe fehlen in D, T und F, obwohl K-09 beides verlangt.

## OFFENE FRAGEN

1. Welche Felder hat die Teilnehmer-Anmeldung, etwa Name, Kontakt und Einwilligung? Keine Quelle nennt sie.
2. Sind „Teilnehmer“ (D:38) und „Angemeldet“ (D:76) dasselbe?
3. Gilt „Ausgebucht“ automatisch bei voller Platzzahl, und wer setzt „Abgesagt“? F hat kein Statusfeld.
4. Welches Datumsformat gilt: „Jan.“, „Aug.“ oder „Juli“?
5. Soll „Veranstaltungsdetails“ (T:166) als sichtbare Überschrift erscheinen?
6. Soll der Rücklink zur Startseite (D:21) oder zu Veranstaltungen (D:18) führen?
7. Was zeigt die Seite bei unbekanntem slug? T fällt auf id 1 zurück (T:35).
8. Wie lauten die tr- und en-Pfade (K-03) und Texte?
9. Welche Zielgruppe und welche Wiederholungsregel gelten (K-09)?
10. Das Design hat kein title-Element (D:3–7). Seitentitel und hreflang sind offen (K-02).
11. Die Platzhalterliste (L:253–264) nennt diese Seite nicht, obwohl [Adresse] und [Telefonnummer] hier vorkommen (D:37, D:86).

=== ENDE S05 · BEREIT ZUR RÜCKGABE ===
