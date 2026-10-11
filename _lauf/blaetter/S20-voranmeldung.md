# Blatt S20 · Schüler-Voranmeldung

Kopf: S20 · Phase P0 · Kern-Version 1.0

## SEITE
Bereich Bildung, Plan-Zeile 05.4 (L168); Screen-Label D15.

## ROUTE
/bildung/voranmeldung (Auftrag, K-03); tr- und en-Pfade offen (OFFENE FRAGEN 1). Eingehend: QuranCourses (L317), Header Bildung (L309).

## QUELLEN
Kürzel (Zahlen = Zeilen):
- D = StudentRegistration.dc.html (63 Zeilen; Template D9–27, Script D28–61)
- F = FormWizard.dc.html (157 Zeilen; Logik F94–155)
- B = uploads/igmg-wetzlar-website/src/app/components/StudentRegistration.tsx (611 Zeilen)
- L = 00 Laufbuch.dc.html (Entscheidungen, Listen)
- X = _lauf/eingang/bestand-languagecontext.md (Auszug LanguageContext.tsx)
Gelesen vollständig: D, F, B, readme.md, L.

## ZWECK
Anmeldung eines Kindes für Kindergarten, Vorbereitungs-Klasse oder Grundkurs Islamunterricht mit Warteliste (D20). Vier Schritte (D34, D44, D48, D51). Kinderdaten sind besonders schutzwürdig (G-07).

## ABSCHNITTE
Aufbau laut D15–25: Header (dc-import, active="bildung", current="student-registration", D16); PrayerTimesBar (D17); Breadcrumbs label="Schüler-Voranmeldung" (D18); PageHeader eyebrow, title, subtitle (D20); Container max-width 1024 px, gap 24 px (D21); FormWizard config, state, step (D22); Footer (D25). Hauptbereich container-type inline-size (D19). Komponenten haben eigene Blätter. Platzhalter-Beispiele mit Straße und PLZ sind nach A5 gekürzt.

Texte, Schlüssel-Vorschlag, Sprachen, Fundstelle:

| Schluessel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| seitenkopf.eyebrow | Bildung | Eğitim | Education | D20 L198 X73 |
| seitenkopf.titel | Schüler-Voranmeldung | Öğrenci Ön Kayıt | Student Pre-Registration | D18 D20 B53,93,133 L199 |
| seitenkopf.untertitel | Melden Sie Ihr Kind für unsere Bildungsprogramme vor und kommen Sie auf die Warteliste. | Çocuğunuzu eğitim programlarımıza ön kayıt yaptırın ve bekleme listesine girin. | Pre-register your child for our educational programs and join the waiting list. | D20 B54,94,134 |
| schritt.1 | Angaben zum Kind | Çocuk Bilgileri | Child Information | D34 B59,99,139 |
| schritt.2 | Adresse | Adres | Address | D44 B66,106,146 |
| schritt.3 | Angaben zu den Eltern | Veli Bilgileri | Parent Information | D48 B70,110,150 |
| schritt.4 | Einverständniserklärungen | Onay Beyanları | Consent Declarations | D51 B80,120,160 |
| gruppe.klasse | Gewünschte Klasse | İstenen Sınıf | Desired Class | D35 B55,95,135 |
| gruppe.eltern1 | Elternteil 1 | Veli 1 | Parent 1 | D49 B71,111,151 |
| gruppe.eltern2 | Elternteil 2 | Veli 2 | Parent 2 | D50 B72,112,152 |
| gruppe.zusatz | Zusätzliche Angaben | Ek Bilgiler | Additional Information | D52 B76,116,156 |
| hinweis.einwilligung | Beide Einverständniserklärungen sind erforderlich | Her iki onay beyanı da gereklidir | Both consent declarations are required | D53 D30 B90,130,170 |
| klasse.kindergarten | Kindergarten (4,5 - 5 Jahre) | Anaokulu (4,5 - 5 Yaş) | Kindergarten (4.5 - 5 years) | D36 B56,96,136 |
| klasse.kindergarten.text | Spielerisches Lernen mit ersten islamischen Grundlagen | İslamın temel değerleriyle oyun tabanlı öğrenme | Playful learning with basic Islamic foundations | D36 B246-248 |
| klasse.vorbereitung | Vorbereitungs-Klasse Islamunterricht (6-9 Jahre) | İslam Dersi Hazırlık Sınıfı (6-9 Yaş) | Islamic Studies Preparation Class (6-9 years) | D37 B57,97,137 |
| klasse.vorbereitung.text | Vorbereitung auf den islamischen Hauptunterricht | Ana İslam dersine hazırlık programı | Preparation for main Islamic studies program | D37 B259-261 |
| klasse.grundkurs | Grundkurs Islamunterricht (ab 10 Jahre) | İslam Dersi Temel Kurs (10 Yaş ve Üzeri) | Basic Islamic Studies Course (10+ years) | D38 B58,98,138 |
| klasse.grundkurs.text | Systematische Vermittlung der islamischen Grundlagen | İslamın temellerinin sistematik öğretimi | Systematic teaching of Islamic fundamentals | D38 B272-274 |
| kind.geschlecht | Geschlecht des Kindes | Çocuğun Cinsiyeti | Child's Gender | D40 B60,100,140 |
| kind.geschlecht.m | Männlich | Erkek | Male | D40 B61,101,141 |
| kind.geschlecht.w | Weiblich | Kız | Female | D40 B62,102,142 |
| kind.vorname | Vorname des Kindes | Çocuğun Adı | Child's First Name | D41 B63,103,143 |
| kind.nachname | Nachname des Kindes | Çocuğun Soyadı | Child's Last Name | D42 B64,104,144 |
| kind.geburt | Geburtsdatum des Kindes | Çocuğun Doğum Tarihi | Child's Birth Date | D43 B65,105,145 |
| adresse.strasse | Straße & Hausnummer | Sokak & Kapı No | Street & House Number | D45 B67,107,147 |
| adresse.strasse.platz | z.B. [Straßen-Beispiel] | örn. [Sokak-Beispiel] | e.g. [Street-Beispiel] | D45 B369-371 |
| adresse.plz | Postleitzahl | Posta Kodu | Postal Code | D46 B68,108,148 |
| adresse.plz.platz | z.B. [PLZ-Beispiel] | örn. [PLZ-Beispiel] | e.g. [PLZ-Beispiel] | D46 B385-387 |
| adresse.ort | Stadt/Ort | Şehir | City | D47 B69,109,149 |
| adresse.ort.platz | z.B. Wetzlar | örn. Wetzlar | e.g. Wetzlar | D47 B401-403 |
| eltern.name | Vorname Nachname | Ad Soyad | Full Name | D49 D50 B73,113,153 |
| eltern.telefon | Telefonnummer | Telefon Numarası | Phone Number | D49 D50 B74,114,154 |
| eltern.email | E-Mail | E-Posta | Email | D49 D50 B75,115,155 |
| zusatz.geschwister | Gibt es Geschwisterkinder, die bereits in der Moschee angemeldet sind? | Camiye kayıtlı kardeşi var mı? | Are there siblings already registered at the mosque? | D52 B77,117,157 |
| zusatz.geschwister.platz | Namen der Geschwisterkinder | Kardeşlerin Adları | Names of Siblings | D52 B78,118,158 |
| zusatz.ausgefuellt | Dieses Formular wurde ausgefüllt von | Bu formu dolduran | This form was filled out by | D52 B79,119,159 |
| einwilligung.kontakt | Einverständnis zur Kontaktaufnahme | İletişim kurulması için onay | Consent to contact | D54 B81,121,161 |
| einwilligung.datenschutz | Zustimmung zur Datenschutzerklärung. Bei Nichtinteresse werden die Daten wieder gelöscht. | Kişisel verilerin işlenmesi için onay. İlgi duymamanız halinde veriler silinecektir. | Consent to data protection policy. Data will be deleted if no interest. | D55 B82,122,162 |
| absenden | Voranmeldung absenden | Ön Kayıt Gönder | Submit Pre-Registration | D30 B83,123,163 |
| zurueck | Zurück | – (nur DE in Quelle) | – (nur DE in Quelle) | F85 L299 |
| weiter | Weiter | – (nur DE in Quelle) | – (nur DE in Quelle) | F151 L299 |
| pflichtfeld | (Pflichtfeld) | – (nur DE in Quelle) | – (nur DE in Quelle) | F48 F57 F66 F70 L299 |
| schritt.zaehler | Schritt {n} von {m}: {Schritt-Label} | – (nur DE in Quelle) | – (nur DE in Quelle) | F28 L279 |
| fehler.summe | Bitte füllen Sie die markierten Pflichtfelder aus. | – (nur DE in Quelle) | – (nur DE in Quelle) | F148 L299 |
| fehler.pflicht | Dieses Feld ist erforderlich | Bu alan zorunludur | This field is required | D30 B85,125,165 |
| fehler.email | Bitte geben Sie eine gültige E-Mail-Adresse ein | Lütfen geçerli bir e-posta adresi girin | Please enter a valid email address | D30 B86,126,166 |
| erfolg.titel | Voranmeldung erfolgreich gesendet! | Ön kayıt başarıyla gönderildi! | Pre-registration sent successfully! | D31 B87,127,167 |
| erfolg.text | Vielen Dank für Ihre Voranmeldung. Sie werden auf die Warteliste gesetzt und wir melden uns bei Ihnen. | Ön kaydınız için teşekkürler. Bekleme listesine alındınız ve sizinle iletişime geçeceğiz. | Thank you for your pre-registration. You have been added to the waiting list and we will contact you. | D31 B88,128,168 |
| erfolg.link1 | Zurück zur Startseite | – (nur DE in Quelle) | – (nur DE in Quelle) | D32 X11 |
| erfolg.link2 | Korankurse | – (nur DE in Quelle) | – (nur DE in Quelle) | D32 |

## DATEN
Vorschlag:
- Seitentexte (Titel, Klassen, Schritte, Meldungen, Einwilligungstexte mit Textversion): Text, mehrsprachig ja (DE Pflicht, TR und EN mit Rückfall auf DE, K-02).
- Voranmeldung (Kind, Adresse, Eltern, Geschwister): Text, Datum, Telefon, E-Mail; mehrsprachig nein; besonders schutzwürdig, nur berechtigte Rollen, Zugriff im Audit-Log (G-07).
- Einwilligungen (Zeitpunkt, Textversion, Ja/Nein): mehrsprachig nein (K-07).

## FORMULARFELDER
Alle Felder aus D35–55; Prüfung nach F95–103; autocomplete-Werte D41–49.
1. desiredClass: Radio, Pflicht, Optionen kindergarten | preparation | basic-course (D36–38).
2. childGender: Radio, Pflicht, Optionen male | female (D40).
3. childFirstName, childLastName: Text, Pflicht (D41–42).
4. childBirthDate: Datum, Pflicht (D43).
5. street: Text, Pflicht, Vollbreite (D45).
6. postalCode: Text, Pflicht, maxLength 5 (D46).
7. city: Text, Pflicht (D47).
8. parent1Name: Text, Pflicht, Vollbreite (D49).
9. parent1Phone: Telefon, Pflicht (D49).
10. parent1Email: E-Mail, Pflicht, Prüfung `/^\S+@\S+\.\S+$/` (F95).
11. parent2Name, parent2Phone, parent2Email: optional (D50); E-Mail-Prüfung nur bei Eingabe (F103).
12. siblingNames: Textarea, optional, Vollbreite (D52).
13. filledBy: Text, Pflicht, Vollbreite (D52).
14. contactConsent: Checkbox, Pflicht, Vollbreite, Fehler consentMsg (D54, F102).
15. dataProtectionConsent: Checkbox, Pflicht, Vollbreite, Fehler consentMsg (D55, F102).

## INTERAKTIONEN
- Weiter oder Absenden (F136–141): prüft den Schritt; Fehler am Feld und in der Zusammenfassung (F36, F77, F134), sonst nächster Schritt; letzter Schritt zeigt den Erfolg ohne Serveraufruf (F140).
- Zurück (F85, F150): Schritt zurück, Fehler löschen.
- Radio, Checkbox und Eingabe ändern den Wert und löschen den Fehler (F116, F130–131).
- Erfolgslinks (D32): Home.dc.html und QuranCourses.dc.html.

## ZUSTAENDE
- state (D28, F94): Optionen formular | fehler | erfolg; Default formular. fehler prüft den Schritt sofort (F115); erfolg zeigt die Erfolgsbox (F17–23).
- step (D28, F94): int; Default 1; min 1; max 4 (D28) oder 5 (F94); Klemme F111.
- config (F94): Objekt aus CONFIG (D29–57).
- Bestand (B): „Wird gesendet...“ | „Gönderiliyor...“ | „Submitting...“ (B84,124,164) während des Sendens (B182); roter Hinweis ohne Einwilligung (B591–593); Button dann deaktiviert (B600); Fehler „Fehler beim Senden der Voranmeldung“ | „Ön kayıt gönderilirken hata oluştu“ | „Error sending pre-registration“ (B89,129,169).

## BILDER
Entfällt: keine Bilder. Icons (Lucide): circle-check (F18), circle-alert (F36, F77, F83), arrow-left (F85), arrow-right (F87), send (F151).

## AUFFAELLIGKEITEN
1. Bestand schreibt Formulardaten per console.log (B188); verletzt G-07.
2. Bestand erzwingt Klasse und Geschlecht nicht (B236, B297); Design: Pflicht (D35, D40).
3. E-Mail-Prüfung weicht ab: Design F95, Bestand B466 und B516.
4. Schrittzahl: D28 max 4, F94 max 5.
5. Adresse: Bestand im Kindbereich (B358–411), Design als Schritt 2 (D44).
6. Bestand nutzt Verläufe (B208, B216, B601); readme.md Zeile 22 verbietet sie.
7. Der Zweig „beide Einwilligungen fehlen“ (B176–180) ist unerreichbar (B600).
8. Datenschutz-Einwilligung ohne Ziel (D55); Laufbuch D-08 (L189) sieht Rechtliches.dc.html vor.
9. Laufbuch L317 nennt drei Erfolgslinks, Design D32 zwei.

## OFFENE FRAGEN
1. Welche tr- und en-Pfade gelten für /bildung/voranmeldung? K-03 nennt nur die deutsche Route.
2. Übersetzungen für „Zurück“, „Weiter“, „(Pflichtfeld)“, „Schritt x von n“, „Bitte füllen Sie …“ und die Erfolgslinks fehlen; in MENSCHEN.md markieren.
3. Wie erscheinen ALTCHA, Honigtopf-Feld und Ratenbegrenzung (K-07)? Design und Bestand zeigen sie nicht.
4. Wohin springt der Fokus nach einem Fehler (K-07)?
5. Soll „Datenschutzerklärung“ auf Rechtliches.dc.html verlinken?
6. Welche Erfolgslinks, Schrittzahl und E-Mail-Prüfung gelten? Siehe AUFFAELLIGKEITEN 3, 4, 9.
7. Einwilligungstexte sind wörtlich übernommen (L284); fachliche und rechtliche Prüfung steht aus (G-08).
8. LanguageContext.tsx wurde nicht im Original gelesen; Wörter stammen aus X11 und X73.

=== ENDE S20 · BEREIT ZUR RÜCKGABE ===
