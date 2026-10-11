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
| M-060 | B | Lizenz-Ausnahmen gegenüber G-09 (nur MIT, Apache-2.0, BSD, ISC, MPL-2.0): nodemailer (MIT-0), sharp/libvips-Binärpakete (LGPL-3.0, optional über Next.js für Bildoptimierung), Schriften (SIL OFL 1.1). Einverstanden? | Ja, mit Begründung in ADR 0001 und LIZENZEN.md; Alternative für sharp: Bildoptimierung abschalten. | |
