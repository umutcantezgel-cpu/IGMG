# MENSCHEN – nur von Menschen zu klären

Jeder Punkt hat eine **Standardannahme**, die bis zur Antwort gilt. Antworten bitte in die Spalte „Antwort“ schreiben; der Orchestrator übernimmt sie beim nächsten Paket.
Dringlichkeit: **A** vor Livegang zwingend · **B** vor Livegang wünschenswert · **C** später.
Herkunft: L = Laufbuch des Designs (`00 Laufbuch.dc.html`), O = Orchestrator.

## 1 Lauf und Infrastruktur

| Nr. | Dr. | Frage | Standardannahme | Herkunft | Antwort |
|---|---|---|---|---|---|
| M-001 | A | Hosting: Welcher Server in der EU betreibt die App (Anbieter, Größe, wer pflegt)? | Nur vorbereitet (Docker, standalone); kein Deployment (G-02). | O | |
| M-002 | A | Das GitHub-Repo umutcantezgel-cpu/IGMG ist **öffentlich**. Alles Gepushte (Bestand, Design, diese Liste) ist weltweit lesbar. Soll es privat werden? | Bleibt, wie es ist; Orchestrator pusht nach E-004, mit Schutz nach E-005. | O | |
| M-003 | B | Sollen Bestand (`uploads/`, inkl. `.make` mit vollständigem Figma-Make-Chat) und Design (`*.dc.html`) ins öffentliche Repo? Beide enthalten Personennamen aus Figma Make. | Nein, beide bleiben lokal; versioniert werden nur `web/` und `_lauf/` (E-009). | O | |
| M-004 | A | Domain (z. B. igmg-wetzlar.de) – vorhanden, wer verwaltet DNS? | Platzhalter `[Domain]`; Konfiguration über `.env`. | O | |
| M-005 | A | E-Mail-Versand: Welcher SMTP-Dienst in der EU, welche Absenderadresse? | Entwicklung: Datei/Mail-Fänger; Betrieb über `.env` (SMTP_*). | O | |
| M-006 | B | Docker Desktop: Falls beim Start ein Lizenz- oder Anmeldedialog erscheint, bitte bestätigen. | Bis dahin PGlite. | O | |

## 2 Inhalte und Fakten (aus dem Design-Laufbuch, „Liste für Menschen“)

| Nr. | Dr. | Frage | Standardannahme | Herkunft | Antwort |
|---|---|---|---|---|---|
| M-010 | A | Adresse: Footer und mehrere Seiten nennen „Musterstraße 123, 35578 Wetzlar“, „Über uns“ nennt die Philipsstraße als heutigen Standort. | Überall `[Adresse]`. | L | |
| M-011 | A | Telefonnummer: Beispielnummer „+49 6441 123456“ im Code. | `[Telefonnummer]`. | L | |
| M-012 | A | E-Mail „info@igmg-wetzlar.de“ stammt aus dem Code – bitte bestätigen. | Wird als Beispielwert markiert angezeigt. | L | |
| M-013 | B | Bezeichnung der jungen Frauen: Browser-Titel und Breadcrumbs sagen „Kız Gençlik Teşkilatı“, alle Inhalte „Kadın Gençlik Teşkilatı“. | „Kadın Gençlik Teşkilatı“. | L | |
| M-014 | B | Breadcrumbs nennen „Anadolu Teşkilatı“, Seite und Auftrag „Ana Teşkilatı“. | „Ana Teşkilatı“. | L | |
| M-015 | B | Logo-Zuordnung: EventsSection.tsx ordnet 8ce65541 der Jugend, 301e0b5b den Frauen und efe65084 den jungen Frauen zu; das Design folgt den Dateinamen (301e0b5b Gençlik, efe65084 Kadın, 8ce65541 Kadın Gençlik). | Zuordnung nach Dateinamen (Design). | L | |
| M-016 | A | Logos liegen nur als 40 × 40 px mit weißem Grund vor – größere, freigestellte Fassungen (SVG oder PNG ≥ 512 px) werden benötigt. | Logos nur in Originalgröße; PWA-Symbole als neutrales Monogramm (K-15). | L | |
| M-017 | A | Gebetszeiten: Der Code enthält drei verschiedene Beispielsätze (Leiste, Seite, Vollbild). Quelle und Berechnungsmethode festlegen; Gebetszeiten gelten erst nach Bestätigung als offiziell (G-06). | Berechnung mit adhan, Methode „Turkey“, sichtbar „berechnet“; Tabellen-Import vorbereitet (K-08). | L/O | |
| M-018 | B | Alle Fotos sind Platzhalterflächen – echte Fotos mit Bildrechten liefern (Gebetsraum, Gebäude, Veranstaltungen, Nachrichten). | Beschriftete Platzhalterflächen. | L | |
| M-019 | B | Öffnungszeiten widersprechen sich: Footer „Mo–Fr 09:00–22:00, Sa–So 08:00–22:00“, Kontakt „täglich zu den Gebetszeiten, Bürozeiten Mo–Fr 9:00–17:00“. | Beide als Beispielwerte markiert; in der Verwaltung pflegbar. | L | |
| M-020 | C | Social-Media-Adressen (Facebook, Instagram, YouTube) fehlen. | `[Facebook-Link]` usw., ohne Einbettung. | L | |
| M-021 | A | Rechtstexte: Datenschutzerklärung, Impressum, Einwilligungstexte – Inhalte liefern und rechtlich prüfen (G-08). AGB gibt es im Code nur als Link. | Seiten als markierte Entwürfe; AGB-Link entfällt bis zur Klärung. | L/O | |
| M-022 | B | Menüpunkt „Islamunterricht“ hat kein Ziel – eigene Seite anlegen oder streichen. | Vorläufig → Islamisches Wissen (D-07). | L | |
| M-023 | B | Veranstaltungen, Nachrichten und Personennamen sind Beispielinhalte aus Figma Make (Fundstellen: bestand EventsSection.tsx, Events.tsx, News.tsx). | Seeds als „Beispielinhalt“ markiert; Namen als `[Name – Funktion]` (E-005c). | L | |
| M-024 | C | Vollbild-Ansicht zeigt ein Beispielwetter (22 °C, teilweise bewölkt). | Wetteranzeige entfällt (keine Drittanfragen, K-14). | L/O | |
| M-025 | B | Gründungsjahr: „Über uns“ nennt 1976, der Vorstand „Führung seit 1975“ und den ersten Vorsitz 1975–1979. | `[Gründungsjahr]` mit beiden Werten in dieser Liste. | L | |
| M-026 | A | Vorstand: Namen und E-Mail-Adressen (vorsitzender@…, finanzen@… usw.) stammen aus dem Code – bestätigen; Telefonnummern fehlen. | `[Name – Funktion]`, Funktionsadressen als Beispielwerte. | L | |
| M-027 | A | Projekte: Satz „von der örtlichen Verwaltung kontinuierlich blockiert“ vor Veröffentlichung prüfen; Meilensteine (bis Januar 2026) und Spendenstand (450.000 € von 800.000 €) aktualisieren; Bankverbindung fehlt. | Satz als Entwurf markiert; Zahlen als Beispielwerte; `[Bankverbindung – von der Gemeinde]`. | L | |
| M-028 | C | Projekte: Der 3D-Viewer im Code zeigt eine Kuppel-/Minarett-Grafik – echtes Architekturmodell oder Rendering liefern. | Platzhalterfläche „3D-Modell: … [Modell von der Gemeinde]“. | L | |
| M-029 | B | Veranstaltungsdetails: Personennamen (bestand EventDetails.tsx) sind Beispielinhalte; „Jetzt anmelden“ hatte im Code keinen Ablauf. | Namen als Platzhalter; Anmeldung wird echtes Formular (K-09). | L | |
| M-030 | B | Nachrichtendetails: Zitat eines namentlich genannten Gemeindeleiters und weitere Namen (bestand NewsDetails.tsx) sind Beispielinhalte. „Profil ansehen“ und „Newsletter abonnieren“ haben kein Ziel. | Platzhalter; Newsletter entfällt (keine Funktion beauftragt). | L | |
| M-031 | B | Kontakt: Haltestelle, Buslinien und Notfallnummer fehlen; „Kostenlose Parkplätze“ und „5 Minuten vom Hauptbahnhof“ prüfen; Kartenlink nach Adressbestätigung. | `[Haltestelle]`, `[Linien]`, `[Telefonnummer Notfall]`; Karte erst nach Klick (K-14). | L | |
| M-032 | B | IGMG-Seite: Zahlen widersprechen sich (knapp 2.500 vs. 2.330 Zweigstellen, 170.000 vs. 127.000 Mitglieder, 40 vs. 35 Regionalverbände); Kontaktdaten der Zentrale bestätigen. | Werte als Beispielwerte markiert. | L | |
| M-033 | C | Header: „Mein Konto“ und „Einstellungen“ hatten keine eigene Seite; „Passwort vergessen?“ hatte keinen Ablauf. | Verwaltung mit Konto-Seite und Passwort-Zurücksetzen per E-Mail. | L/O | |
| M-034 | A | Konzept-Hinweis (DisclaimerDialog) und alle Einwilligungstexte der Formulare sind wörtlich aus dem Code übernommen – fachliche und rechtliche Prüfung (G-08). | Als Entwurf markiert, Textversion gespeichert. | L | |
| M-035 | A | Islamisches Wissen: Die „Experten“ (bestand IslamicKnowledge.tsx) sind erfundene Beispielpersonen mit realen Institutionen – ersetzen oder streichen. Artikeltexte außer „Allah – Wer ist Gott im Islam?“ fehlen. | Expertenangaben entfallen; fehlende Texte als Platzhalter. | L | |
| M-036 | A | Quran: Nur Al-Fatiha liegt im Code vor (Arabisch + Übersetzung); Quelle der Übersetzung, weitere Suren und Audio festlegen (G-06). | Siehe ADR 0009; ohne geklärte Lizenz Platzhalter `[Koranvers – Text von der Gemeinde]`. | L | |
| M-037 | B | Mitglied werden: Aussage „Über 500 Familien sind bereits Teil unserer lebendigen Gemeinde.“ prüfen. | Als Beispielwert markiert. | L | |
| M-038 | B | Organisationsseiten: Beispieltermine (z. B. „Frauen-Iftar Abend“ im Dezember 2024) und Meldungen sind Beispielinhalte; Kontaktadressen at@/kt@/gt@/kgt@igmg-wetzlar.de bestätigen. | Als Beispielinhalt markiert. | L | |
| M-039 | C | Admin-Dashboard: Namen und Nachrichten (bestand Dashboard.tsx) sind Beispieldaten. | Testdaten erkennbar fiktiv („Testperson Eins“, G-04). | L | |
| M-040 | B | Webseite für Ihre Moschee: Budgetstufen und Bearbeitungszeit „2-3 Werktage“ bestätigen. | Als Beispielwert markiert. | L | |
| M-041 | C | Öffnungszeiten-Angaben im Footer stammen aus dem Code – bestätigen (siehe M-019). | – | L | |

## 3 Platzhalter (Platzhalterliste des Designs)

| Platzhalter | Fundorte | Liefert |
|---|---|---|
| [Adresse] | Footer, Kontakt, weitere Seiten | Vorstand |
| [Telefonnummer] | Footer, Kontakt, weitere Seiten | Vorstand |
| [Facebook-Link] [Instagram-Link] [YouTube-Link] | Footer | Öffentlichkeitsarbeit |
| Foto: … (beschriftete Bildflächen) | Startseite, Nachrichten, Seitenköpfe | Gemeinde |
| [Datenschutzerklärung – Text von der Gemeinde] [Impressum – …] [AGB – …] | Rechtliches | Vorstand / Rechtsberatung |
| [Telefonnummer Notfall] | Kontakt | Vorstand |
| [Haltestelle] [Linien] | Kontakt › Anfahrt | Gemeinde |
| Karte: Anfahrt [Adresse] | Kontakt | Gemeinde (nach Freigabe externer Karten) |
| [Bankverbindung – von der Gemeinde] | Projekte › Spenden | Schatzmeister |
| 3D-Modell: Neue Fatih Moschee Projekt [Modell von der Gemeinde] | Projekte | Bauausschuss / Architekt |
| [Koranvers – Text von der Gemeinde] | Quran (Suren 2–5) | Imam / Bildungsbeauftragter |
| Vorschaubild: … / Video-Player | Islamisches Wissen › Videos | Öffentlichkeitsarbeit |
| [Rechtstexte – von der Gemeinde zu liefern und rechtlich zu prüfen] | Rechtliches | Vorstand |
| [Name] [Funktion] [Jahr] [Kurs] … | Komponenten-Vorschau | – |

## 4 Datenschutz und Betrieb (O)

| Nr. | Dr. | Frage | Standardannahme | Antwort |
|---|---|---|---|---|
| M-050 | A | Löschfristen je Eingangsart (Kontakt, Voranmeldung, Mitgliedsantrag, Moschee-Anfrage, Veranstaltungsanmeldung). | In der Verwaltung einstellbar; Vorgabe 180 Tage nach Abschluss, Veranstaltungsanmeldungen 30 Tage nach Termin – bitte fachlich prüfen. | |
| M-051 | A | Wer erhält welche Benachrichtigungen (zuständige Rolle je Formular)? | Kontakt → Administration; Voranmeldung → Bildung; Mitgliedsantrag → Mitgliederverwaltung; Moschee-Anfrage → Administration; Veranstaltungsanmeldung → Redaktion der Organisation. | |
| M-052 | A | Erstes Administrationskonto: Wer bekommt die erste Einladung? | Einladung per Kommandozeilen-Skript beim Einrichten (BETRIEB.md). | |

## 5 Lizenzen (O)

| Nr. | Dr. | Frage | Standardannahme | Antwort |
|---|---|---|---|---|
| M-061 | C | Lokalisierte Adressen für Türkisch und Englisch (z. B. /tr/namaz-vakitleri, /en/prayer-times, /tr/egitim/on-kayit) sind neu übersetzt. Bitte prüfen. | Wie in `web/src/i18n/routing.ts`. | |
| M-062 | B | Die Verwaltung ist laut Auftrag nur deutsch (Abschnitt 0). Z-03 („alle UI-Texte in drei Sprachen“) wird daher auf die öffentliche Website bezogen. Einverstanden? | Ja; Verwaltung nur Deutsch, Texte trotzdem in messages/de.json. | |
| M-063 | C | Türkische Anrede: Schaltflächen und Links im kurzen Imperativ wie im Bestand („Paylaş“, „Kaydet“, „Daha fazla öğren“), ganze Sätze in der Siz-Form. Die Übersetzungsprüfung (D06) schlug für 20 Schaltflächen die Siz-Form vor („Paylaşın“). Bitte von einer türkischsprachigen Person bestätigen. | Kurzer Imperativ (übliche Form für Bedienelemente, wie im Bestand). | |
| M-064 | C | Veranstaltungen: Kontaktdaten der Ansprechperson (Name, Telefon, E-Mail) erscheinen öffentlich auf der Detailseite. Nur dienstliche Angaben eintragen – bitte in der Verwaltungseinweisung betonen. | Hinweis direkt im Formular. | |
| M-065 | B | Nach der Bereitstellung: Startseite, Veranstaltungen und eine Detailseite mit PageSpeed Insights (mobil) prüfen. Lokal gemessen (E-026): Performance 99, LCP 1,6 s mit angewandter Drosselung; die Lighthouse-Simulation gegen localhost ist dafür ungeeignet. | Werte aus `_lauf/belege/lighthouse/`. | |
| M-066 | B | Ramadan-Hervorhebung in der Monatsansicht: Die Tage werden nach dem Umm-al-Qura-Kalender berechnet (Intl). Der Kalender der Diyanet/IGMG kann um einen Tag abweichen. Soll der Ramadan-Beginn in der Verwaltung festgelegt werden können? | Berechnet, mit Hinweis „berechnet“. | |
| M-067 | C | Das Design zeigt in der Fußzeile einen Link „AGB“. Braucht die Gemeinde Allgemeine Geschäftsbedingungen (z. B. für Kurse mit Gebühr)? | Kein AGB-Link, bis Text und Bedarf geklärt sind (A-C04). | |
| M-060 | B | Lizenz-Ausnahmen gegenüber G-09 (nur MIT, Apache-2.0, BSD, ISC, MPL-2.0): nodemailer (MIT-0), sharp/libvips-Binärpakete (LGPL-3.0, optional über Next.js für Bildoptimierung), Schriften (SIL OFL 1.1). Einverstanden? | Ja, mit Begründung in ADR 0001 und LIZENZEN.md; Alternative für sharp: Bildoptimierung abschalten. | |

## 6 Gebetszeiten und Quran (aus ADR 0008/0009)

| Nr. | Dr. | Frage | Standardannahme | Antwort |
|---|---|---|---|---|
| M-017a | A | Imsak-Definition (Ramadan): Fajr bei 18° ohne Temkin oder mit Temkin-Minuten (Kalender mit Temkin zeigen Imsak ca. 20 min früher)? | Imsak = Fajr 18° ohne Temkin, sichtbar „berechnet“. | |
| M-017b | B | Die adhan-Methode „Turkey“ enthält feste Anpassungen (Sonnenaufgang −7, Dhuhr +5, Asr +4, Maghrib +7 min), Herkunft unbelegt. Beibehalten? | Beibehalten bis zur Klärung. Empfehlung: IGMG (app@igmg.org) nach Methode und Erlaubnis für den Gebetskalender Wetzlar fragen. | |
| M-017c | B | Qibla: Berechnet 128,3° für Wetzlar; der Bestand nannte 136°. Bestätigen. | 128,3° (berechnet). | |
| M-036 | A | Quran-Text: Tanzil Project (tanzil.net) erlaubt unveränderte Wiedergabe mit Quellenangabe; Download nur nach Zustimmung zu den Nutzungsbedingungen. Bitte zustimmen, Datei (Uthmani, Version 1.1) herunterladen, nach `web/daten/quran/` legen und den SHA-256-Wert hier eintragen. | Bis dahin Platzhalter auf allen Surenseiten. | |
| M-036b | A | Übersetzungen (de/tr/en): Tanzil-Übersetzungen sind nur nicht-kommerziell freigegeben. Welche Übersetzung mit welcher Erlaubnis? Gemeinfreie Ausgaben (z. B. Elmalılı Hamdi Yazır, Pickthall) möglich. | Platzhalter `[Koranvers – Text von der Gemeinde]`. | |
| M-036c | C | Rezitations-Audio: Quelle mit Erlaubnis? | Kein Audio, Platzhalter-Zustand des Designs. | |
| M-068 | C | Schüler-Voranmeldung: Das Design verlangt „Geschlecht des Kindes“ (nur männlich/weiblich) als Pflichtfeld. Wird die Angabe gebraucht (z. B. getrennte Gruppen)? Sonst entfällt sie (Datensparsamkeit, G-07). | Pflichtfeld wie im Design. | |
| M-069 | B | Gründungsjahr: Über uns nennt 1976 (Design, Bestand LanguageContext), der Vorstand 1975 (BoardMembers). Welches gilt? | Platzhalter [Gründungsjahr] auf Über uns, Vorstand mit 1975 wie im Design (A03, A04). | |
| M-070 | B | Über uns: Aussagen „Gebet im Keller eines Hauses“, Anwohnerbeschwerden und „eigenes Eigentum“ (ohne Jahr) bestätigen; Fotos mit Bildrechten liefern. | Wörtlich aus dem Bestand übernommen, Fotos als beschriftete Platzhalter (A03). | |
| M-071 | B | Vorstand: Funktionsadressen vorsitzender@, stellvertretung@, finanzen@, bildung@, jugend@, soziales@igmg-wetzlar.de (Bestand) bestätigen; Telefonnummern und Porträts (Bildrechte) liefern; Namen der Chronik bestätigen. | Namen und Telefon als Platzhalter, Adressen aus dem Bestand (A04). | |
| M-072 | A | Projekte (Moscheebau): Spendenstand, Spendenziel, Bankverbindung (IBAN, BIC, Kontoinhaber, Verwendungszweck), Freigabe der Ortsangabe, Kapazität 500, Fläche 1.200 m², Beginn 2024/Fertigstellung 2026, Status der Meilensteine, 3D-Modell. | Alles als Platzhalter „[von der Gemeinde]“, Balken leer; Werte aus Design/Bestand nur, wo bestätigbar markiert (A05). | |
| M-073 | B | Kontakt: Öffnungszeiten widersprechen sich (Fußzeile 09:00–22:00, Design-Bürozeiten Mo.–Fr. 9–17 Uhr); Freitagsgebet 12:00–14:30; Haltestelle und Linien; kostenlose Parkplätze; „5 Minuten zum Hauptbahnhof“; Webadresse www.igmg-wetzlar.de. | Design-Werte mit Markierung, Haltestelle/Linien als Platzhalter, Karte erst nach Koordinaten (M-010) (A06). | |
| M-074 | B | IGMG-Seite: Zahlen widersprechen sich im Bestand – Zweigstellen 2.330 oder knapp 2.500, Regionalverbände 40 oder 35, Mitglieder 170.000 oder 127.000; dazu Moscheen 518, erreichte Menschen 350.000, Zentralkontakte (info@igmg.org, www.igmg.org), Studierendenorganisation. Koranbezüge in „Bedeutung“ (G-06) freigeben. | Widersprüchliche Zahlen als Platzhalter, Kontakte als Platzhalter, Koranbezüge wörtlich aus dem Bestand (A07). | |
| M-075 | B | Organisationen: Adresse, Telefon, E-Mail (Design: at@, kt@, gt@, kgt@igmg-wetzlar.de) und Öffnungs-/Aktivitätszeiten je Organisation; englischer Name von „Ana Teşkilatı“; größere Logo-Fassungen (vorhanden nur 40 × 40 px); Leerzustandstext Nachrichten. | Platzhalter, Öffnungszeiten aus Design, Logos in Originalgröße (A08, A09). | |
| M-076 | B | Korankurse: Kurs-E-Mail kurse@igmg-wetzlar.de bestätigen, Telefon, Lehrkräfte, Status des Hafiz-Kurses (geschlossen?), Gebühren, Leerzustandstexte. | Platzhalter; Kursstatus-Feld folgt mit dem Verwaltungsmodul Kurse (A10). | |
| M-077 | B | Islamisches Wissen: Kurztexte für die 12 Themen, Experten- und Autorenangaben, Videolinks; der Sachtext mit „Allah“ im Artikeldialog braucht die Freigabe (G-06). | Platzhalter in eckigen Klammern, Sachtexte aus dem Bestand (A11, A12). | |
| M-078 | B | Gebetszeiten: Entfernung nach Mekka (Design 3.847 km, Überschlag ≈ 4.230 km), Rechtsschule (Madhab) anzeigen?, die vier neu formulierten Kompass-Hinweise fachlich prüfen; Iftar-Hinweis im Ramadan gewünscht? | Entfernung als Platzhalter, Madhab nicht angezeigt, Hinweise als Entwurf (A14, A15). | |
| M-079 | A | Rechtliches: Impressum-Pflichtangaben (Name, Rechtsform, Anschrift, Vertretung, Register), Datenschutzbeauftragte/r, Hoster und Aufbewahrung der Server-Protokolle, SMTP-Anbieter; Entwurfsseiten bis zur Freigabe auf noindex setzen? Die Einwilligung der Veranstaltungsanmeldung verspricht „Löschung nach der Veranstaltung“ – Frist bestätigen (technisch mit C08). Außerdem: Den Merker „Konzept-Hinweis gesehen“ im Browser-Speicher (`igmg-konzepthinweis-gesehen`) als technisch notwendig einstufen (Tor A SP-A-13)? | Seiten als markierte Entwürfe (G-08), Platzhalter; Löschung folgt mit den Löschfristen (M-050) (A17). | |
| M-080 | C | Fehlerseite nennt eine Telefonnummer für Notfälle ([Telefonnummer]); der Satz „Gebetszeiten des laufenden Monats auch ohne Verbindung“ auf der Offline-Seite gilt erst mit der PWA (Welle D). | Platzhalter; Offline-Zusage wird mit Welle D erfüllt (A18). | |
| M-081 | C | Nachrichten: Autorenangabe je Beitrag („[Name – Pressereferent]“, Funktion und Kurztext aus dem Design), Bild je Beitrag, Name im Beitrag „Neuer Imam stellt sich vor“; sollen die zehn Beispielbeiträge oder nur die sechs des Designs erscheinen? | Platzhalter, alle zehn Beispielbeiträge (markiert als Beispiel) (A01, A02). | |
| M-082 | A | Gebetszeiten, Berechnung (G-06): Die Bibliothek adhan begrenzt Imsak und Yatsı ständig mit der „Siebtel der Nacht“-Regel. In Wetzlar liegt Imsak dadurch von Mitte März bis Ende Mai und von Mitte Juli bis Anfang Oktober bis zu 36 Minuten später, Yatsı bis zu 26 Minuten früher als beim Winkel 18°/17° (Methode Turkey). Ramadan 2026 betroffen am 16.–19.03. (5–8 Min.). Welche Regel gilt? Empfehlung: die offiziellen Zeiten (IGMG-/Diyanet-Kalender für Wetzlar) importieren; die Berechnung bleibt nur Rückfall. | Unverändert berechnet und sichtbar als „berechnet“ markiert; Tests `tests/unit/gebetszeiten/hohe-breite-imsak-yatsi.test.ts` halten die Abweichung fest (A22-1). | |

## 7 Formulare und Verwaltung (Welle B/C)

| Nr. | Dr. | Frage | Standardannahme | Antwort |
|---|---|---|---|---|
| M-083 | A | Einwilligungstexte der Formulare rechtlich prüfen (G-08): Kontakt (neu formuliert: Beantwortung der Anfrage, Kontakt per E-Mail, Löschung nach Erledigung), Mitglied werden („Ich stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu“, Design), Webseite für Moscheen („… zu Beratungszwecken zu“, Design). Die Textversion (SHA-256) wird je Eingang gespeichert; eine Änderung gilt nur für neue Eingänge. | Texte wie in `messages/bereiche/{kontaktformular,mitglied,moschee-anfrage}.json`, als Entwurf. | |
| M-084 | B | Mitglied werden: Der Newsletter-Wunsch wird nur gespeichert, es gibt keinen Versanddienst. Wer bearbeitet ihn? Ein echter Newsletter braucht eine eigene Einwilligung (Double-Opt-in). Außerdem: H1 „Willkommen in der IGMG Wetzlar Familie“ (Design statt Bestand), Altersgruppen- und Geschlechtsschlüssel wie im Design, „Über 500 Familien“, Kontakt-E-Mail und Bürozeiten bestätigen. | Wunsch sichtbar im Eingang; Angaben als Beispielinhalt markiert. | |
| M-085 | B | Webseite für Moscheen: Budget- und Zeitrahmen-Stufen (unter 2.000 € … über 10.000 €; 1–2 bis über 6 Monate), Erfolgstext „2–3 Werktage“ und die Prüfregeln (PLZ fünf Ziffern, Webseite nur https, Mitgliederzahl bis 7 Ziffern) bestätigen. Bietet die Gemeinde diese Leistung überhaupt an, und wer antwortet? | Wie im Design; Benachrichtigung an die Administration (M-051). | |
| M-086 | B | Eingänge: Wer darf welche Eingänge sehen? Laut Rechte-Matrix sieht die Redaktion alle Veranstaltungsanmeldungen, die Organisationsredaktion nur die der eigenen Organisation, Bildung die Voranmeldungen, die Mitgliederverwaltung die Mitgliedsanfragen, die Administration alles. Export (CSV/JSON) mit denselben Rechten, jeder Abruf und Export steht im Audit-Log. | Wie beschrieben. | |
| M-087 | C | Audit-Log: Wie lange werden Einträge aufbewahrt (bisher unbegrenzt)? Soll auch das Ansehen des Audit-Logs protokolliert werden? Styleguide: alle Rollen dürfen ihn sehen – passt das? | Unbegrenzt bis zur Entscheidung; Ansehen nicht protokolliert; Styleguide für alle Rollen. | |
| M-088 | B | Tickets: Wer darf was? Umgesetzt: alle Rollen sehen und kommentieren Tickets (Organisationsredaktion nur eigene Organisation oder ohne Organisation), Status und Priorität ändert nur, wer `ticket.bearbeiten` hat. Wie lange bleiben Tickets gespeichert (bisher unbegrenzt, kein Löschen)? | Wie umgesetzt; Aufbewahrung offen. | |
| M-089 | C | Postfach: Sollen alle Konten alle anderen als Empfänger sehen (bisher ja), und wie lange bleiben Nachrichten gespeichert (bisher unbegrenzt)? | Wie umgesetzt. | |
| M-090 | C | Kurse: Alter, Dauer, Ort, Leitung, Kosten, Plätze und „empfohlen“ werden gepflegt, aber öffentlich noch nicht gezeigt. Sollen die Kurskarten sie zeigen? | Nicht zeigen, bis Inhalte geliefert sind. | |
| M-091 | C | Farbe der Kategorie „Ankündigung“: Die Grundlagen nennen Info-Blau, die Nachrichtenkarten zeigen sie bisher rot („Wichtig“). Angleichen? | Block in Blau, Karten unverändert. | |
| M-092 | B | Konten: Einladungslink standardmäßig 3 Tage gültig (1–14 wählbar); „Passwort vergessen“ schickt einen Link (60 Minuten gültig), danach bleibt die Authenticator-App Pflicht; eine Passkey-Anmeldung gibt es noch nicht. Passt das, und wird ein Passkey gewünscht? | Wie umgesetzt; Passkey später. | |
| M-093 | B | Öffentliche Meldung: Telefon freiwillig (Design: Pflicht) und Pflicht nur bei Rückmeldung per Telefon? Betreff als Pflichtfeld (Ergänzung)? Organisation freiwillig? Einwilligungstext (Entwurf, Löschung der Kontaktangaben 180 Tage nach Abschluss) rechtlich prüfen (G-08). | Wie umgesetzt, Text als Entwurf. | |
| M-094 | C | Türkisch „Dua topluluğu“ für „Gebetsgemeinschaft“ (Mitglied werden): Der Bestand nutzt „Dua“, für das Pflichtgebet wäre „Namaz“ üblich. Welcher Begriff ist gemeint? (Religiöser Begriff – nicht eigenmächtig geändert, G-06) | Unverändert. | |
| M-095 | B | Tickets und Postfach speichern Text unverschlüsselt (Liste, Suche). Regel für die Verwaltung: dort keine Gesundheitsdaten, Kontaktdaten oder Anliegen Dritter eintragen – dafür sind Eingänge und Meldungen da. Einverstanden? (E-042) | Regel im Handbuch, Text unverschlüsselt. | |
| M-096 | B | Fristen (Tor B/C): Offene Eingänge werden spätestens 365 Tage nach Eingang gelöscht; Angaben aus öffentlichen Meldungen 180 Tage nach „Gelöst“/„Geschlossen“; Einladungen 30 Tage nach Annahme/Widerruf/Ablauf. Höchstens 3 Bestätigungsmails je Adresse und Tag. Passen diese Werte (Datenschutzbeauftragte/r, G-08)? | Wie umgesetzt. | |
| M-097 | C | PDF-Dateien in den Medien behalten ihre Metadaten (Autor, Ersteller). Vor dem Hochladen im PDF-Programm entfernen oder soll die App sie entfernen (zusätzliche Bibliothek)? | Hinweis im Upload-Formular (C11b). | |
| M-098 | C | Öffnungszeiten der Organisationen (Seiteninhalte) liegen nur auf Deutsch vor; Türkisch/Englisch zeigen den deutschen Text mit Hinweis. Übersetzungen liefern oder pflegen? | Deutsch mit Hinweis „nur auf Deutsch“. | |
