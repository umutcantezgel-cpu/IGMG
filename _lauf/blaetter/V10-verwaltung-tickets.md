# V10 · Verwaltung: Tickets (Meldungen)

V10 · Rolle: Kundschafter · Phase P0 · Kern-Version 1.0 · Schwierigkeit 1

## SEITE

Admin-Dashboard, Abschnitt „tickets“, Dialog „ticket“ (D:110). Mitdokumentiert: das Meldungsformular TicketDialog (TD), geöffnet über „Meldung“ (HT:454, HT:948; LB:309).

## ROUTE

/verwaltung/tickets (Auftragsvorgabe, in den Quellen nicht belegt). Einbindungen per dc-import, eigene Blätter folgen: Header (current="dashboard", logged-in="true", D:16), PrayerTimesBar (D:17), Breadcrumbs (label="Dashboard", D:18), Footer (D:86).

## QUELLEN

Design-Wurzel: /Users/umurey/Downloads/IGMG Wetzlar Website Design/ (nur gelesen). Fundstelle = Kürzel:Zeile. D = Dashboard.dc.html; TD = TicketDialog.dc.html; LB = 00 Laufbuch.dc.html; RM = readme.md. Bestand unter uploads/igmg-wetzlar-website/src/app/components/: DT = Dashboard.tsx (Typ 138–150, Mock 296–329, Ansicht 966–1172, Modal 1614–1706); TT = TicketDialog.tsx; LC = LanguageContext.tsx (Ticket-Block de 149–202, tr 407–460, en 665–718); HT = Header.tsx.

## ZWECK

Verwaltung sieht Tickets und Meldungen, wählt eines aus, liest den Verlauf, kennzeichnet Nachrichten als intern und legt Tickets an (D:74–79). Das öffentliche Formular erfasst Anliegen von Gemeindemitgliedern (TD:19). Zwei Feldschemata: Admin-Ticket (D:121; DT:1614–1706) und Meldung (TD:44–48; TT:83–121). Status, Priorität und Intern gibt es nur im Admin-Ticket.

## ABSCHNITTE

Admin (D): Seitenleiste mit Zähler „1“ bei Tickets (D:20–26, D:139); Abschnitt tickets mit Kopf (D:74), Liste (D:76), Detail (D:79) oder Leerzustand (D:78); Dialog ticket (D:88–107). Meldung (TD): Kopf, Erfolgsbanner, sieben Felder, Rückmeldung, Aktionen (TD:19–36). Texte Admin (tr und en fehlen in allen Quellen):

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| adm.kopf | Admin Dashboard · IGMG Wetzlar Verwaltung · Menü öffnen | – (nur DE in Quelle) | – (nur DE in Quelle) | D:21 |
| adm.nav | Dashboard · Neuigkeiten · Veranstaltungen · Ankündigungen · Nachrichten · Tickets | – (nur DE in Quelle) | – (nur DE in Quelle) | D:111 |
| adm.titel | Tickets verwalten · Neues Ticket | – (nur DE in Quelle) | – (nur DE in Quelle) | D:74 |
| mock.liste | T-001 · Hoch · In Bearbeitung · Heizung in Gebetsraum defekt · Technik · Erstellt: Mo., 18. März 2024 | – (nur DE in Quelle) | – (nur DE in Quelle) | D:76 (Beispiel) |
| leer | Wählen Sie ein Ticket aus | – (nur DE in Quelle) | – (nur DE in Quelle) | D:78 |
| mock.detail | Heizung in Gebetsraum defekt · Die Heizung im Hauptgebetsraum funktioniert nicht richtig. | – (nur DE in Quelle) | – (nur DE in Quelle) | D:79 (Beispiel) |
| det.label | Ersteller: · Zugewiesen: · Erstellt: · Intern | – (nur DE in Quelle) | – (nur DE in Quelle) | D:79 |
| det.wert | [Name – Ersteller] · [Name – Bearbeitung] · Mo., 18. März 2024, 10:30 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | D:79 (Namen ersetzt, A5) |
| mock.verlauf | Die Heizung im Hauptgebetsraum funktioniert seit gestern nicht mehr. Es ist sehr kalt. · 10:30 Uhr · Danke für die Meldung. Ich habe einen Techniker kontaktiert. · 14:15 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | D:79 (Beispiel) |
| dlg.kopf | Neues Ticket erstellen · Erstellen Sie hier ein neues Ticket für Ihr Anliegen. | – (nur DE in Quelle) | – (nur DE in Quelle) | D:92, D:121 |
| dlg.felder | Titel · Ticket-Titel eingeben... · Beschreibung · Detaillierte Beschreibung des Problems... · Kategorie · z.B. Technik, Gebäude... · Priorität · Niedrig · Mittel · Hoch · Dringend | – (nur DE in Quelle) | – (nur DE in Quelle) | D:121 |
| dlg.aktion | Abbrechen · Ticket erstellen | – (nur DE in Quelle) | – (nur DE in Quelle) | D:104, D:121 |

Texte Meldung (de aus TD, tr und en aus LC):

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| mel.kopf | Neue Meldung erstellen · Teilen Sie uns Ihr Anliegen mit - wir kümmern uns darum. · Meldung erfolgreich gesendet! | Yeni Bildirim Oluştur · Sorununuzu bizimle paylaşın - ilgileneceğiz. · Bildirim başarıyla gönderildi! | Create New Report · Share your concern with us - we'll take care of it. · Report sent successfully! | TD:19–20; LC:150–152, 408–410, 666–668 |
| mel.pflicht | (Pflichtfeld) | – (nur DE in Quelle) | – (nur DE in Quelle) | TD:26; neu laut LB:299 |
| mel.vorname | Vorname · Ihr Vorname | Ad · Adınız | First Name · Your first name | TD:44; LC:154–155, 412–413, 670–671 |
| mel.nachname | Nachname · Ihr Nachname | Soyad · Soyadınız | Last Name · Your last name | TD:44; LC:156–157, 414–415, 672–673 |
| mel.telefon | Telefon · Beispielwert (TD:45) | Telefon · Beispielwert (LC:417) | Phone · Beispielwert (LC:675) | TD:45; LC:158–159, 416–417, 674–675 |
| mel.email | E-Mail · Beispielwert (TD:45) | E-posta · Beispielwert (LC:419) | Email · Beispielwert (LC:677) | TD:45; LC:160–161, 418–419, 676–677 |
| mel.org | Organisation · Wählen Sie Ihre Organisation · AT (Erwachsene) · KT (Frauen) · GT (Jugend) · KGT (Frauenjugend) | Organizasyon · Organizasyonunuzu seçin · AT (Yetişkinler) · KT (Kadınlar) · GT (Gençlik) · KGT (Kadın Gençlik) | Organization · Select your organization · AT (Adults) · KT (Women) · GT (Youth) · KGT (Women's Youth) | TD:46; LC:162–163, 175–178, 420–421, 433–436, 678–679, 691–694 |
| mel.typ | Meldungstyp · Wählen Sie den Meldungstyp · Beschwerde · Wunsch · Vorschlag · Information | Mesaj türü · Mesaj türünü seçin · Şikayet · Dilek · Öneri · Bilgi | Message type · Select message type · Complaint · Wish · Suggestion · Information | TD:47; LC:166–167, 186–189, 424–425, 444–447, 682–683, 702–705 |
| mel.text | Nachricht · Beschreiben Sie Ihr Anliegen... | Mesaj · Sorununuzu açıklayın... | Message · Describe your concern... | TD:48; LC:168–169, 426–427, 684–685 |
| mel.rueck | Rückmeldung gewünscht? · Ja · Nein | Geri bildirim isteniyor mu? · Evet · Hayır | Feedback requested? · Yes · No | TD:34, 60; LC:164, 170–171, 422, 428–429, 680, 686–687 |
| mel.art | Art der Rückmeldung · Telefon · E-Mail · Persönlich | Geri bildirim türü · Telefon · E-posta · Şahsen | Feedback type · Phone · Email · In Person | TD:35, 60; LC:165, 181–183, 423, 439–441, 681, 697–699 |
| mel.aktion | Abbrechen · Meldung senden | İptal · Bildirimi Gönder | Cancel · Send Report | TD:36; LC:172–173, 430–431, 688–689 |
| mel.fehler | Vorname ist erforderlich · Nachname ist erforderlich · Telefonnummer ist erforderlich · Organisation ist erforderlich · Meldungstyp ist erforderlich · Nachricht ist erforderlich · Bitte wählen Sie eine Option · Art der Rückmeldung ist erforderlich | Ad gerekli · Soyad gerekli · Telefon numarası gerekli · Organizasyon gerekli · Mesaj türü gerekli · Mesaj gerekli · Lütfen bir seçenek seçin · Geri bildirim türü gerekli | First name is required · Last name is required · Phone number is required · Organization is required · Message type is required · Message is required · Please select an option · Feedback type is required | TD:34–35, 44–48; LC:193–200, 451–458, 709–716 |

## DATEN

Vorschlag (abgeleitet; keine Quelle nennt Datenbankfelder):

- tickets: id (Text, T-001), title, description, category (Text), priority (low, medium, high, urgent), status (open, in-progress, resolved, closed), requester_id, assignee_id (Konto-Verweis), created_at, updated_at (UTC). Mehrsprachig: nein (DT:138–150).
- ticket_messages: ticket_id, author_id, content, is_internal (DT:108), status (sent, delivered, read; DT:110), reply_to (optional), created_at. Mehrsprachig: nein.
- meldungen: first_name, last_name, phone (Pflicht), email (optional), organization (at, kt, gt, kgt), message_type, text, feedback_wanted, feedback_type (optional), submitted_at. Mehrsprachig: Werte nein, Bezeichnungen ja (LC).
- Nicht im Design, aber verlangt: consent_at, consent_text_version (K-07), Zugriffsprotokoll (G-07).

## FORMULARFELDER

Admin-Dialog (D:121): Titel, Beschreibung (Textarea, vier Zeilen, D:98), Kategorie (Text), Priorität (Standard medium, DT:187; Design ohne Vorbelegung). Pflicht nur laut DT:1700.

Meldung (TD:44–60): Vorname, Nachname, Telefon (tel), Organisation, Meldungstyp, Nachricht (Textarea) und Rückmeldung (Ja/Nein) sind Pflicht; E-Mail (email) ist optional; Art der Rückmeldung ist bei Ja Pflicht (TT:108). Prüfung clientseitig (TT:68–125), kein Zod-Schema; HTML-Prüfung aus (TD:22).

## INTERAKTIONEN

- „Tickets“ setzt den Abschnitt (D:24; DT:361); „Neues Ticket“ öffnet den Dialog (D:74; DT:977–978).
- Listeneintrag wählt ein Ticket (D:76; DT:1033).
- Dialog schließt über X, Abbrechen, Überlagerung, Escape (D:93, D:104, D:90, D:132).
- „Ticket erstellen“ schließt im Design nur (D:104); DT legt lokal an (DT:1674–1698).
- „Ja“ blendet die Art der Rückmeldung ein (TD:34–35; TT:336). Senden prüft (TT:127–132), setzt Fehler am Feld (TD:30) oder Erfolg (TD:20; TT:163).

## ZUSTAENDE

Eigenschaften: section (D:110; Optionen dashboard, news, events, announcements, messages, tickets; Standard dashboard); dialog (D:110; Optionen none, neuigkeit, veranstaltung, ankuendigung, ticket; Standard none); demoErrors (TD:42; boolesch; Standard false); onClose (TD:42; ohne Standard); $preview 900 × 900 (TD:42). Bestand: isOpen, onClose (TT:13–14; ohne Standard); HT:982 übergibt open.

Zustände: leer ohne Auswahl (D:78; DT:1162–1167); Ticket gewählt (D:79; DT:1050–1169); Liste leer nicht gestaltet; Suche ohne Treffer ohne Hinweis (DT:1001–1005); Fehler (TD:30, 34, 35; Demo TD:54); Fokus auf Fehler nicht gestaltet (K-07); Erfolg (TD:20); Senden läuft nur im Bestand (TT:134, 425); Schritt entfällt; angemeldet (D:16); Sprache: Admin de, Meldung de, tr, en (LC:150, 408, 666).

## BILDER

– (entfällt, keine Bilder). Icons nach RM:28: ticket 48 px (D:78), plus 20 px (D:74), x 24 px (D:93; TD:18), message-square 28 px (TD:19), circle-check 24 px (TD:20), circle-alert 18 px (TD:30).

## AUFFAELLIGKEITEN

1. HT:982 übergibt open, TT:13 und TT:40 erwarten isOpen: nach Code öffnet der Meldungsdialog nicht (nur gelesen).
2. K-07 verlangt Einwilligung, ALTCHA, Honigtopf und Ratenbegrenzung; TD und TT enthalten davon nichts, obwohl LB:284 Einwilligungstexte der Meldung als übernommen nennt.
3. Design zeigt „Hoch“ und „In Bearbeitung“ (D:76); Bestand zeigt Rohwerte high und in-progress (DT:1017, 1021), Farben weichen ab (DT:367, 377).
4. Datum: Design „Mo., 18. März 2024, 10:30 Uhr“ (D:79); Bestand de-DE-Rohformat (DT:396), gegen D-10 (LB:193).
5. Bestand zeigt „Current User“ und „Unassigned“ (DT:1682–1683) in der Detailansicht.
6. Pflichtkennzeichen: Design „(Pflichtfeld)“ (TD:26), Bestand „*“ (TT:219 u. a.); Erfolg inline (TD:20) gegen alert() (TT:163).
7. Weitere: Breadcrumb „Dashboard“ auf Tickets (D:18); Dialogbreite 640 px (D:91) gegen 425 px (DT:1616); Zähler nur im Design (D:139); Speichern nur lokal (DT:1696); „Tickets“ (D:111) gegen ungenutztes „Meldungen“ (LC:130).

## OFFENE FRAGEN

1. Welche Rolle nach K-06 sieht und bearbeitet Tickets und Meldungen?
2. Wie heißen die Status offen, gelöst und geschlossen? Bis zur Klärung: [Statusbezeichnung – offen] (MENSCHEN.md).
3. Wie sehen leere Liste und Suche ohne Treffer aus?
4. Gilt für Tickets der Papierkorb (K-05) oder echte Löschung, und mit welcher Frist (G-07)?
5. Welche Bestätigungsmail und Benachrichtigung gelten (K-07)?
6. Wie lautet der Einwilligungstext der Meldung (LB:284)?
7. Muss das Telefon Pflicht sein, wenn per E-Mail geantwortet wird (G-07)?
8. Ist „Intern“ ein Antwortmodus oder ein Nachrichtenkennzeichen (DT:108)?
9. Dürfen Anhänge (DT:1153) hochgeladen werden, und wer sieht sie?
10. Ist /verwaltung/tickets vorgesehen?
11. Die Zustände Nr. 01–18 (LB:214) liegen außerhalb dieses Blatts.

=== ENDE V10 · BEREIT ZUR RÜCKGABE ===
