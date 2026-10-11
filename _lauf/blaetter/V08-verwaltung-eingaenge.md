# V08 · Verwaltung: Eingänge

V08 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt (Verwaltungsmodul) „Verwaltung: Eingänge (Mitgliedsanträge, Voranmeldungen, Moschee-Anfragen, Kontaktanfragen, Veranstaltungsanmeldungen)“ · Schwierigkeit 1

## SEITE

Verwaltung: Eingänge (Mitgliedsanträge, Voranmeldungen, Moschee-Anfragen, Kontaktanfragen, Veranstaltungsanmeldungen). Verwaltungsmodul ohne Artboard: ABGELEITET aus dem Dashboard-Muster (DB) und den Eingangsformularen.

## ROUTE

/verwaltung/eingaenge (Auftrag, ABGELEITET). Nur angemeldete Konten mit passender Rolle; Prüfung serverseitig (K-06). Die Zwei-Faktor-Anmeldung fehlt in den Quellen (V00).

## QUELLEN

Kürzel: JU = JoinUs.dc.html, SR = StudentRegistration.dc.html, MR = MosqueRequest.dc.html, CO = Contact.dc.html, ED = EventDetails.dc.html, DB = Dashboard.dc.html (Muster); Bestand JU.tsx, SR.tsx, MR.tsx, Contact.tsx, ED.tsx; RM = readme.md; LB = 00 Laufbuch.dc.html; LC = LanguageContext.tsx (gezielt: dashboard, ticket, organizations).

Gelesen: alle genannten Design- und Bestandsdateien vollständig, RM und LB vollständig, LC gezielt. Nicht gelesen (nicht in V08-Quellen): TicketDialog.dc.html, Dashboard.tsx, web/src/lib/db/schema/eingaenge.ts. Gegenprobe: Suche nach Eingang, Anfrage, Kontaktformular und TicketDialog in den Design- und Bestandsordnern ergab keinen Eingangsbereich.

## ZWECK

Liste aller eingehenden Formulare und Anfragen. Je Eingangsart eine zuständige Rolle (K-06), ein Status, Export und echte Löschung nach einstellbarer Frist (G-07).

## ABSCHNITTE

Aufbau (ABGELEITET nach DB): Kopf mit Breadcrumbs „Dashboard › Eingänge“ (DB:16–18); Seitenleiste mit neuem Eintrag „Eingänge“ (DB:20–26); Filter und Tabelle nach DB:43–57, ohne Neu-Schaltfläche; Detail nach DB:72–83 mit Einwilligung (Zeitpunkt, Textversion), Verlauf und „Intern“; Löschdialog nach DB:88–107; Leerzustand nach DB:66.

Designtexte (tr und en nur aus gelesenen Quellen):

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| dash.titel | Admin Dashboard · IGMG Wetzlar Verwaltung | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:21 |
| dash.menue | Menü öffnen · Dashboard-Bereiche | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:21, 23 |
| nav.dash | Dashboard | Panel | Dashboard | DB:111; LC:127, 385, 643 |
| nav.ver | Veranstaltungen | Etkinlikler | Events | DB:111; LC:131, 389, 647 |
| nav.rest | Tickets · Neuigkeiten · Ankündigungen · Nachrichten | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:111; Konflikt LC:130 „Meldungen“ |
| tab.akt | Aktionen · Bearbeiten: [Eingang] · Löschen: [Eingang] | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:143 |
| st.intern | In Bearbeitung · Intern | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:76, 79 |
| dlg.abbr | Abbrechen | İptal | Cancel | DB:104; LC:173, 431, 689 |
| dlg.schl | Schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:93 |
| org.liste | Ana Teşkilatı · Kadın Teşkilatı · Gençlik Teşkilatı · Kadın Gençlik Teşkilatı | AT (Yetişkinler) · KT (Kadınlar) · GT (Gençlik) · KGT (Kadın Gençlik) | AT (Adults) · KT (Women) · GT (Youth) · KGT (Women's Youth) | DB:115; LC:120–123, 378–381, 636–639 (Namen abweichend) |
| org.alle | Allgemein | – (nur DE in Quelle) | – (nur DE in Quelle) | DB:115 |

Abgeleitet, kein Designtext (nur de): Eingänge verwalten · Eingänge · Art · Eingang · Eingegangen · Zuständig · Filter · Keine Eingänge · Eingänge durchsuchen · Exportieren.

Feldlabels der Formulare stehen hier nicht doppelt (Wortgrenze A8); die Schlüssel stehen unter FORMULARFELDER. Sprachfassungen: SR.tsx:52–171 und MR.tsx:57–266 vollständig; JU nur DE (JU.tsx:233–438); ED nur DE.

## DATEN

PostgreSQL mit Drizzle, Zeitstempel in UTC, Anzeige Europe/Berlin (K-05). Vorschlag, je Feld Typ und Mehrsprachigkeit:

- eingang: id (uuid; nein), art (enum mitgliedsantrag, voranmeldung, moschee_anfrage, kontakt, veranstaltungsanmeldung; Anzeige ja), eingegangen_utc (timestamptz; nein), status (enum; Anzeige ja), zustaendige_rolle (enum nach K-06; nein), organisation (enum; Anzeige ja), payload (jsonb, nur nötige Felder nach G-07; nein), einwilligung_utc (timestamptz; nein), einwilligung_textversion (text; nein), bestaetigt_utc (timestamptz; nein), intern_notiz (text; nein), veranstaltung_id (uuid, Verweis; nein), loeschen_bis (timestamptz; nein).
- audit_zugriff: zeitpunkt_utc (timestamptz), rolle (enum), eingang_id (uuid), aktion (enum); nicht mehrsprachig (G-07). einstellung_loeschfrist: Tage je Eingangsart (ganze Zahl; nein).
- veranstaltung (Verweis): titel (text; ja), beschreibung (text; ja), kapazitaet (ganze Zahl; nein).

Beispielpersonen aus DB:79, 112, 114 als [Name – Funktion] nicht übernehmen (G-04).

## FORMULARFELDER

Quellschlüssel in Reihenfolge; * = Pflicht laut Design.

| Eingangsart | Felder | Rolle (K-06) | Status | Ausnahmen |
|---|---|---|---|---|
| Mitgliedsantrag (JU) | firstName*, lastName*, email*, phone, address, city, age, gender, interests*, experience, motivation*, newsletter, privacy* (JU:60–73) | Mitgliederverwaltung (Anträge) | Neu · In Bearbeitung · Erledigt (ABGELEITET) | – |
| Voranmeldung (SR) | desiredClass*, childGender*, childFirstName*, childLastName*, childBirthDate*, street*, postalCode*, city*, parent1Name*, parent1Phone*, parent1Email*, parent2Name, parent2Phone, parent2Email, siblingNames, filledBy*, contactConsent*, dataProtectionConsent* (SR:35–55) | Bildung (Kurse und Voranmeldungen) | Neu · Warteliste (SR:31) · In Bearbeitung · Erledigt | Bei Nichtinteresse Löschung (SR:55) |
| Moschee-Anfrage (MR) | mosqueName*, contactPerson*, email*, phone, address*, city*, postalCode*, country*, website, memberCount, requirements, budget, timeline, additionalInfo, dataProtection* (MR:37–59) | Administration (ABGELEITET, offen) | wie Mitgliedsantrag | Antwortfrist offen (MR:32) |
| Kontaktanfrage | entfällt: kein Formular in CO und Contact.tsx. Kandidat Meldungsformular: name, lastname, phone, email, organization, feedbackWanted, feedbackType, messageType, text (LC:154–168) | offen, Vorschlag Administration | entfällt | – |
| Veranstaltungsanmeldung (ED) | entfällt: „Jetzt anmelden“ ohne Formular (ED:77, 107; ED.tsx:308–314) | Organisationsredaktion der Veranstaltenden (ABGELEITET, K-06) | entfällt; Veranstaltung: Offen, Ausgebucht, Abgesagt (ED.tsx:99–106) | Teilnehmerliste (ABGELEITET) |

Für alle Arten gilt: Export je Vorgang, Format offen (G-07); echte Löschung ohne Papierkorb (K-05, G-07); Löschfrist je Art [Frist – Gemeinde] (G-07).

## INTERAKTIONEN

- Navigation „Eingänge“ öffnet den Bereich (DB:138, 140); der Zähler zeigt offene Eingänge (ABGELEITET).
- Zeile wählen zeigt das Detail (DB:76, 79); der Stift öffnet es (DB:52). Status, Zuständigkeit und Notiz ändern; „Intern“ hält die Notiz vom Absender fern (ABGELEITET).
- Die Papierkorb-Schaltfläche (DB:52) hat im Design keinen Ablauf. ABGELEITET: Bestätigungsdialog nach DB:88–107, dann echte Löschung (K-05, G-07).
- Escape schließt den Dialog (DB:132); Abbrechen und Schließen (DB:93, 104).
- Jede Aktion prüft die Rolle serverseitig (K-06); jeder Zugriff auf Personendaten wird protokolliert (G-07, ABGELEITET).
- Eingang aus dem Formular: Bestätigung an den Absender, Benachrichtigung an die zuständige Rolle (K-07). Die Texte fehlen.

## ZUSTAENDE

- DB-Eigenschaften (DB:110): section = dashboard | news | events | announcements | messages | tickets (Default dashboard), neu eingaenge (ABGELEITET). dialog = none | neuigkeit | veranstaltung | ankuendigung | ticket (Default none), neu loeschen (ABGELEITET). Unter 900 px: Schaltfläche „Menü öffnen“ (DB:21, 137).
- JU (JU:52): state = formular | fehler | erfolg (Default formular); step 1 bis 3 (Default 1).
- SR (SR:28): state = formular | fehler | erfolg (Default formular); step 1 bis 4 (Default 1).
- MR (MR:29): state = formular | fehler | erfolg (Default formular); step 1 bis 3 (Default 1).
- CO und ED: keine Eigenschaften (entfällt).
- Bestand: JU.tsx Erfolg (:122–168), Spinner (:474), kein Fehlerzustand; SR.tsx Senden (:84), Fehler-Toast (:201); MR.tsx Erfolg (:291–317), Senden gesperrt ohne Zustimmung (:623); ED.tsx Offen, Ausgebucht (:310, :313), Abgesagt (:99–106).
- Eingänge (ABGELEITET): Leerzustand „Keine Eingänge“.

## BILDER

Keine Fotos (ABGELEITET). Icons 20 und 24 px (RM:28): menu (DB:21), pencil und trash-2 (DB:52), search (DB:62), x (DB:93), ticket (DB:78). Logos 40 × 40 px (RM:8; ED:26), größere Fassungen fehlen (LB:231). Das Bestandsfoto JU.tsx:549–553 (fremder Server, G-04) ist im Design eine Platzhalterfläche (JU:42).

## AUFFAELLIGKEITEN

1. Kein Eingangsbereich im Design: DB:111 hat sechs Bereiche (ABGELEITET).
2. Kontaktanfrage ohne Formular: CO und Contact.tsx haben keins; LB:163 nennt dennoch „Formularfelder“.
3. Veranstaltungsanmeldung ohne Ablauf: ED:77 und ED:107 (`register: () => {}`); ED.tsx:308–314 ohne Handler; LB:247.
4. Personendaten in Logs: SR.tsx:188 und MR.tsx:287 (console.log; G-04, G-07).
5. Zustimmung als Text: JU.tsx:417 und :433 speichern `checked.toString()`; die Sperre in JU.tsx:471 greift nach dem ersten Umschalten nicht mehr. Zeitpunkt und Textversion fehlen (K-07).
6. Pflicht nicht geprüft: SR:35 und SR:40 (req) gegen SR.tsx:235–238 und :296–299.
7. Bestand einseitig (SR.tsx:227–606, MR.tsx:352–632), Design in Schritten (SR:34–55, MR:35–59; LB:279).
8. Kein Versand: JU.tsx:107–111 und SR.tsx:186–197 simulieren (SR mit Neuladen), MR.tsx:284–288 schreibt nur in die Konsole. Nichts wird gespeichert, keine Bestätigungsmail (K-07).
9. Löschen-Schaltfläche ohne Bestätigung im Muster (DB:52); K-05 verlangt echte Löschung ohne Papierkorb.
10. Namen widersprechen sich: DB:115 gegen LC:120 und ED.tsx:84–85; Logos ED.tsx:73–75 gegen LB:230.

## OFFENE FRAGEN

1. Welches Formular liefert Kontaktanfragen: die Kontaktseite (ohne Formular) oder das Meldungsformular (LC:19, TicketDialog.dc.html, nicht gelesen)?
2. Gibt es einen Anmeldeablauf für Veranstaltungen (Formular, Bestätigung, Warteliste)?
3. Welche Rolle übernehmen Moschee- und Kontaktanfragen?
4. Welche Löschfrist gilt je Art, und gilt bei Nichtinteresse sofort die Löschung (SR:55)?
5. Sind die Statuswerte freigegeben? Belegt sind nur „In Bearbeitung“ (DB:76) und „Warteliste“ (SR:31).
6. Wortlaut und Absender der Bestätigungsmail (K-07), Adresse als [E-Mail – Gemeinde].
7. Exportformat und Ansicht des Audit-Logs fehlen in den Quellen (G-07).
8. Ist die Verwaltung dreisprachig? DB:15 ist nur lang="de", LB:35 nennt Dashboard-Texte in LC.
9. Zwei-Faktor und Einladung fehlen in den Quellen (V00); LoginDialog.tsx ist laut LB:276 leer.
10. Textversion der Einwilligungen: Datenschutzerklärung ohne Ziel (JU:73) und Platzhalter Rechtliches (LB:189); Wortlaut fachlich prüfen (G-08, LB:284).
11. Antwortfrist „2-3 Werktage“ (MR:32) bestätigen; web/src/lib/db/schema/eingaenge.ts mit DATEN abgleichen.

=== ENDE V08 · BEREIT ZUR RÜCKGABE ===
