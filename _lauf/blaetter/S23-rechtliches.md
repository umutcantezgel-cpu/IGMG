# S23 · Seitenblatt Impressum und Datenschutz (aus Rechtliches)

S23 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Impressum und Datenschutz (aus Rechtliches)“ · Schwierigkeit 1

## SEITE

Impressum und Datenschutz (aus Rechtliches). Der AGB-Abschnitt des Designs gehört nicht zu diesem Paket. Status: Platzhalterseite; Inhalt nur als markierter Entwurf (G-08).

## ROUTE

- Ziel: /impressum und /datenschutz (Kern K-03), Deutsch ohne Präfix (K-02). Die tr- und en-Pfade stehen nicht im Kern-Auszug (offen).
- Design: eine Seite mit Ankern #datenschutz, #impressum, #agb (Rechtliches.dc.html:23; Footer.dc.html:60–62).
- Bestand: kein Ziel; alle drei Links sind href="#" (Footer.tsx:216, 222, 228).

## QUELLEN

- Design (nur lesen): Rechtliches.dc.html (42 Zeilen, vollständig); Footer.dc.html (92 Zeilen, vollständig, Rechtslinks 60–62).
- Bestand (nur lesen, uploads/igmg-wetzlar-website/src/app/components/): Footer.tsx; DisclaimerDialog.tsx; StudentRegistration.tsx, JoinUs.tsx, MosqueRequest.tsx, TicketDialog.tsx (nur Datenerhebung).
- Hilfen: readme.md; 00 Laufbuch.dc.html (Zeilen 67, 179, 189, 191, 222, 225, 231, 254–255, 258).
- Nicht verwendet: ~/Downloads/CLAUDE.md (anderes Projekt, laut Auftrag).

## ZWECK

Eigene Seiten für Datenschutz und Impressum, damit der Footer-Link nicht ins Leere führt (D-08, Laufbuch.dc.html:189). Der Aufbau steht, der Inhalt bleibt Platzhalter. Die fachliche Prüfung wird in MENSCHEN.md geführt (G-08).

## ABSCHNITTE

Aufbau (Rechtliches.dc.html): fünf Einbindungen und drei Inhaltsabschnitte.

1. Header: dc-import, active="", current="", sticky, hint-size 100%,80px (Zeile 16).
2. PrayerTimesBar: dc-import, hint-size 100%,124px (Zeile 17).
3. Breadcrumbs: dc-import, label="Rechtliches", hint-size 100%,52px (Zeile 18).
4. PageHeader: dc-import, eyebrow, title, subtitle, hint-size 100%,220px (Zeile 20).
5. Inhalt in main#main-content, max-width 880px, Abstand 24px, sc-for über parts (Zeilen 19–24). Je Abschnitt section mit id, h2 und gestricheltem Platzhalter (Zeile 23). Für dieses Blatt: datenschutz und impressum.
6. Footer: dc-import, hint-size 100%,520px (Zeile 27). Komponentenblatt.

Texte (Schluessel nach K-02, messages/{de,tr,en}.json):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| legal.page.eyebrow | IGMG Wetzlar | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:20 |
| legal.page.title | Datenschutz · Impressum · AGB | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:20 |
| legal.page.subtitle | [Rechtstexte – von der Gemeinde zu liefern und rechtlich zu prüfen] | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:20 |
| legal.breadcrumb | Rechtliches | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:18 |
| legal.privacy.title | Datenschutz | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:34 |
| legal.privacy.placeholder | [Datenschutzerklärung – Text von der Gemeinde] | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:34 |
| legal.imprint.title | Impressum | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:35 |
| legal.imprint.placeholder | [Impressum – Text von der Gemeinde] | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:35 |
| legal.agb.title † | AGB | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:36 |
| legal.agb.placeholder † | [AGB – Text von der Gemeinde] | – (nur DE in Quelle) | – (nur DE in Quelle) | Rechtliches.dc.html:36 |
| footer.legal.privacy | Datenschutz | – (nur DE in Quelle) | – (nur DE in Quelle) | Footer.dc.html:60; Footer.tsx:219 |
| footer.legal.imprint | Impressum | – (nur DE in Quelle) | – (nur DE in Quelle) | Footer.dc.html:61; Footer.tsx:225 |
| footer.legal.agb | AGB | – (nur DE in Quelle) | – (nur DE in Quelle) | Footer.dc.html:62; Footer.tsx:231 |
| footer.copyright | © 2025 IGMG Wetzlar. Alle Rechte vorbehalten. | – (nur DE in Quelle) | – (nur DE in Quelle) | Footer.dc.html:58; Footer.tsx:212 |
| notice.concept.title (Bestand) | Hinweis: Konzept-Website | Uyarı: Konsept Website | – (nur DE/TR in Quelle) | DisclaimerDialog.tsx:14, 27 |

† nicht in diesem Paket. Übrige Footer-Texte: Komponentenblatt Footer.

Gliederung Datenschutz (Vorschlag, Inhalt nur als Entwurf):

- Verantwortliche Stelle: [Name und Rechtsform – Vorstand], [Adresse], [Telefonnummer] (Footer.dc.html:29–30; Laufbuch 254–255).
- Erhobene Daten (P = Pflichtfeld; Zeilen je Datei):
  - Schüler-Voranmeldung (StudentRegistration.tsx): Klassenwunsch, Geschlecht des Kindes (230–312); Vorname, Nachname, Geburtsdatum (P, 319–348); Anschrift (P, 367–399); Elternteil 1 (P, 431–464); Elternteil 2 (optional, 488–517); Geschwisternamen (537); ausfüllende Person (P, 547); zwei Einwilligungen (567–587).
  - Mitglied werden (JoinUs.tsx): Name und E-Mail (P, 233–271); Telefon, Adresse, Stadt (optional, 276–304); Altersgruppe, Geschlecht (312–339); Interessen (348–373); Erfahrungen (377–388); Motivation (P, 396–407); Newsletter (420); Datenschutzerklärung (P, 437–441).
  - Webseite für Ihre Moschee (MosqueRequest.tsx): Moschee-Name, Ansprechpartner, E-Mail (P, 363–395); Telefon (401–406); Anschrift, Stadt, PLZ, Land (P, 421–465); Website, Mitgliederzahl (482–499); Anforderungen (516–530); Budget, Zeitrahmen, Zusatzangaben (548–589); Einwilligung (P, 598–607).
  - Rückmeldung (TicketDialog.tsx): Name, Nachname, Telefon (P, 218–270); E-Mail (optional, 273–282); Organisation (P, 287–308); Rückmeldung und Rückmeldeart (312–364); Nachrichtenart (P, 368–389); Text (P, 393–408). Ohne Einwilligung.
- Zweck je Formular aus dem Einwilligungstext, etwa „zu Beratungszwecken“ (MosqueRequest.tsx:123). Rechtsgrundlage: [Text – Rechtsberatung].
- Speicherdauer und Löschung: [Frist je Formular – Vorstand] (abgeleitet aus G-07; Löschzusage StudentRegistration.tsx:82).
- Empfänger und Dienste Dritter: Google Fonts (Rechtliches.dc.html:11–12) und ein externes Bild (JoinUs.tsx:549–551) (abgeleitet aus G-07).
- Browser-Speicher: nur technisch nötige Cookies (abgeleitet aus G-07).
- Rechte der Betroffenen, Zugriff, Audit-Log, Export, Löschung: [Text – Rechtsberatung] (abgeleitet aus G-07).

Gliederung Impressum (Vorschlag): verantwortliche Stelle wie oben; E-Mail als Platzhalter, der Design-Eintrag ist ein Beispielwert (Footer.dc.html:31); weitere Angaben: [Text – Rechtsberatung]. Der Bestand enthält keine Rechtsangaben.

## DATEN

Vorschlag, abgeleitet aus K-02, G-07 und G-08:

| Feld | Typ | mehrsprachig |
|---|---|---|
| rechtstext.slug | Text (datenschutz, impressum) | nein |
| rechtstext.titel | Text | ja; Deutsch Pflicht, Rückfall auf Deutsch |
| rechtstext.abschnitte | Rich Text je Abschnitt | ja; Deutsch Pflicht, Rückfall auf Deutsch |
| rechtstext.status | Auswahl: Entwurf, geprüft, veröffentlicht | nein |
| formulareingang | Datensatz je Formular (Felder siehe ABSCHNITTE) | nein; Zugriff nur für berechtigte Rollen (G-07) |
| einstellung.loeschfrist | Zahl in Tagen je Formulartyp | nein |

Im Bestand ist keine Speicherung umgesetzt; die Absendung ist simuliert (StudentRegistration.tsx:185–186; JoinUs.tsx:107–111; MosqueRequest.tsx:286–288; TicketDialog.tsx:136–137).

## FORMULARFELDER

– (entfaellt, die Seite hat keine Eingabefelder; Formulare siehe ABSCHNITTE)

## INTERAKTIONEN

- Footer-Rechtslinks: Anker im Design (Footer.dc.html:60–62), href="#" im Bestand (Footer.tsx:216–228). Soll: /datenschutz, /impressum; AGB offen.
- Anker-Sprung mit 96 px Abstand (Rechtliches.dc.html:23).
- Einwilligungen ohne Link auf /datenschutz: StudentRegistration.tsx:585–587; JoinUs.tsx:437–441; MosqueRequest.tsx:604–606.
- Footer-Schnellzugriff und „Jetzt anfragen“ (Footer.dc.html:45–47, 53): Komponentenblatt Footer.

## ZUSTAENDE

- Rechtliches.dc.html: keine data-props (Script ab Zeile 30); Sprache fest lang="de" (Zeile 15); einziger Zustand ist der Platzhalter (Zeile 23).
- Footer.dc.html, data-props (Zeile 68): lang = enum de | tr | en, Default de; $preview 1440 × 460 (nur Vorschau). Zustand Geöffnet/Geschlossen nach Uhrzeit (Zeilen 77–81).
- Footer.tsx (Bestand): „Geöffnet“ fest (Zeilen 147–148), kein Geschlossen-Zustand.
- DisclaimerDialog.tsx (Bestand): Eigenschaften open und onClose (Zeilen 6–9); nicht wegklickbar (Zeile 42), ohne X (Zeile 43); Texte fest im JSX (Zeilen 47–50, 104, 107); Objektwerte (Zeilen 14–15, 23–24, 27–28, 36–37) ungenutzt; Englisch fehlt (Zeilen 12–39).
- Formulare, nur Erfolgszustände: StudentRegistration.tsx:190–197; JoinUs.tsx:122–168; MosqueRequest.tsx:291–318; TicketDialog.tsx:137–163.

## BILDER

- Keine Bilder im Seitenkörper.
- Footer-Logo: assets/logo-igmg-wetzlar.png, 40 × 40 px, alt „IGMG Wetzlar Logo“ (Footer.dc.html:18; Footer.tsx:45–49). Größere Fassung nötig (Laufbuch 231).

## AUFFAELLIGKEITEN

1. Routen: D-08 (Laufbuch 189) führt alle Rechtslinks auf Anker einer Seite; Kern K-03 nennt /impressum und /datenschutz getrennt. Dieses Blatt folgt K-03.
2. Personendaten in der Konsole: StudentRegistration.tsx:188 und MosqueRequest.tsx:287 schreiben Formulardaten per console.log (Konflikt zu G-04, G-07).
3. Anfragen an Dritte: Google Fonts (Rechtliches.dc.html:11–12) und ein externes Bild (JoinUs.tsx:549–551) widersprechen G-07; Laufbuch 222 nennt nur Google Fonts als Ausnahme.
4. Einwilligung: TicketDialog.tsx erhebt Name, Telefon und Text ohne Einwilligung (17–27); Telefon ist Pflicht (93–96), auch bei E-Mail-Rückmeldung (352).
5. Gate-Fehler: JoinUs.tsx:433 speichert die Einwilligung als Text; der Text „false“ gilt als wahr, die Absendeschaltfläche (Zeile 471) bleibt nach dem Abwählen aktiv.
6. Sprache: lang nur am Container (Rechtliches.dc.html:15); Rechtslinks nur deutsch (Footer.tsx:219–231); Konzept-Hinweis ohne Englisch (DisclaimerDialog.tsx:12–39).
7. Löschzusage ohne Frist (StudentRegistration.tsx:82); Beispielwerte statt Platzhalter (Footer.tsx:97–106); Laufbuch 225 nennt einen abweichenden Standort.
8. Weitere: Laufbuch 179 nennt die Bausteine unvollständig (ohne PrayerTimesBar, PageHeader); „G-04“ bezeichnet in readme.md:43 externe Skripte, im Kern Personendaten.

## OFFENE FRAGEN

1. Eine Seite mit Ankern (D-08) oder zwei Routen (K-03)? Dieses Blatt folgt K-03.
2. Lokalisierte Pfade für tr und en (K-02, K-03).
3. Zielseite des AGB-Links (Footer.dc.html:62); K-03 nennt keinen AGB-Pfad.
4. Seitentitel und Breadcrumb je Route; das Design gibt nur „Datenschutz · Impressum · AGB“ und „Rechtliches“.
5. Pflichtangaben des Impressums und ihr Lieferant (G-08, MENSCHEN.md).
6. Name, Rechtsform und Anschrift der verantwortlichen Stelle; Design und Bestand weichen ab.
7. Speicherort, Speicherdauer und Zugriff für Formulardaten.
8. Bleibt die Telefonnummer im TicketDialog Pflicht (G-07: nur nötige Felder)?
9. Soll der Konzept-Hinweis auf die Impressum-Seite; wo wird gespeichert, dass er nur einmal erscheint?
10. Gehört der Verwaltungsbereich (LoginDialog, Dashboard) in die Datenschutzerklärung? Beide Dateien fehlen in den Quellen.
11. Wie sind die Angaben zu Kindern rechtlich zu behandeln (MENSCHEN.md)?
12. Die englische Fassung des Konzept-Hinweises fehlt; neue Übersetzung markieren (K-02).

=== ENDE S23 · BEREIT ZUR RÜCKGABE ===
