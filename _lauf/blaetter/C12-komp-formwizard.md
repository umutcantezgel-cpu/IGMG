# C12 · Komponentenblatt FormWizard (mehrstufige Formulare)

## SEITE
Design-Komponente `data-component="FormWizard"` (FormWizard.dc.html:15), keine eigene Seite. Einsatz laut D-14 (Laufbuch:279) in Schüler-Voranmeldung (Laufbuch:168), Mitglied werden (Laufbuch:173) und Webseite für Ihre Moschee (Laufbuch:174).

## ROUTE
Voranmeldung, Mitglied werden, Webseite für Ihre Moschee. Die Quellen nennen nur Artboard-Namen, keine lokalisierten Pfade (K-02, siehe OFFENE FRAGEN).

## QUELLEN
Design: FormWizard.dc.html (Template Z.9–93, Script Z.94–155, vollständig gelesen). Bestand, nur gelesen: StudentRegistration.tsx (Z.1–612), JoinUs.tsx (Z.1–567). Hilfen: readme.md (Z.7, Z.19, Z.21) und Laufbuch = 00 Laufbuch.dc.html (Z.34–35, Z.168–174, Z.276–317). Nicht in den Quellen: LanguageContext.tsx, Icon.dc.html, MosqueRequest.dc.html.

## ZWECK
Mehrstufige Eingabe mit „Schritt x von n“, Kennzeichnung „(Pflichtfeld)“, Fehlern am Feld plus Zusammenfassung und Erfolgsansicht (Laufbuch:279). Prototyp: Absenden setzt nur den Erfolgszustand (FormWizard.dc.html:140).

## ABSCHNITTE
Aufbau in Template-Reihenfolge:
1. Erfolg (isSuccess, FormWizard.dc.html:16–24): role=status, Rahmen 2 px #047857, Icon circle-check 36 px (:18), Überschrift, Text, optional nextTitle/nextSteps (:21), Link-Buttons 48 px hoch (:22).
2. Formular (isForm, FormWizard.dc.html:25–91): Fortschritt (:27–34) mit Zeile „Schritt …“ und Stufenliste, Marke ✓ oder Nummer, aria-current="step" (:31, :147); Fehlerzusammenfassung role=alert mit Links auf #fw-Feldname (:35–37, :134); form noValidate mit einem fieldset je Gruppe (:38–41); Formularmeldung role=alert nur im letzten Schritt (:83); Fußzeile mit Zurück ab Schritt 2 (:85) und Weiter oder Absenden mit Icon (:87).

Icons: circle-check, circle-alert (:36, :77, :83), arrow-left (:85), arrow-right oder send (:151).

Texte (A2):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| fw.stepNav | Fortschritt | – (nur DE in Quelle) | – (nur DE in Quelle) | FormWizard.dc.html:27 |
| fw.stepLine | Schritt {stepNo} von {stepCount}: {stepLabel} | – (nur DE in Quelle) | – (nur DE in Quelle) | FormWizard.dc.html:28 |
| fw.required | (Pflichtfeld) | – (nur DE in Quelle) | – (nur DE in Quelle) | FormWizard.dc.html:48, :57, :66, :70 |
| fw.back | Zurück | – (nur DE in Quelle) | – (nur DE in Quelle) | FormWizard.dc.html:85; JoinUs.tsx:457 |
| fw.nextLabel | Weiter | – (nur DE in Quelle) | – (nur DE in Quelle) | FormWizard.dc.html:151; JoinUs.tsx:466 |
| fw.errorSummary | Bitte füllen Sie die markierten Pflichtfelder aus. | – (nur DE in Quelle) | – (nur DE in Quelle) | FormWizard.dc.html:148; Laufbuch:299 |
| fw.requiredMsg | Dieses Feld ist erforderlich | Bu alan zorunludur | This field is required | FormWizard.dc.html:102; StudentRegistration.tsx:85, :125, :165 |
| fw.emailMsg | Bitte geben Sie eine gültige E-Mail-Adresse ein | Lütfen geçerli bir e-posta adresi girin | Please enter a valid email address | FormWizard.dc.html:103; StudentRegistration.tsx:86, :126, :166 |
| fw.consentMsg | Beide Einverständniserklärungen sind erforderlich | Her iki onay beyanı da gereklidir | Both consent declarations are required | StudentRegistration.tsx:90, :130, :170 |
| fw.submitLabel | Voranmeldung absenden | Ön Kayıt Gönder | Submit Pre-Registration | StudentRegistration.tsx:83, :123, :163 |
| fw.successTitle | Voranmeldung erfolgreich gesendet! | Ön kayıt başarıyla gönderildi! | Pre-registration sent successfully! | StudentRegistration.tsx:87, :127, :167 |
| fw.successText | Vielen Dank für Ihre Voranmeldung. Sie werden auf die Warteliste gesetzt und wir melden uns bei Ihnen. | Ön kaydınız için teşekkürler. Bekleme listesine alındınız ve sizinle iletişime geçeceğiz. | Thank you for your pre-registration. You have been added to the waiting list and we will contact you. | StudentRegistration.tsx:88, :128, :168 |
| fw.consent.contact | Einverständnis zur Kontaktaufnahme | İletişim kurulması için onay | Consent to contact | StudentRegistration.tsx:81, :121, :161 |
| fw.consent.privacy | Zustimmung zur Datenschutzerklärung. Bei Nichtinteresse werden die Daten wieder gelöscht. | Kişisel verilerin işlenmesi için onay. İlgi duymamanız halinde veriler silinecektir. | Consent to data protection policy. Data will be deleted if no interest. | StudentRegistration.tsx:82, :122, :162 |

Mitglied werden (nur DE): Erfolg „Vielen Dank für Ihr Interesse!“ (JoinUs.tsx:143), Erfolgslinks „Zur Startseite“ (:153) und „Veranstaltungen ansehen“ (:160), Senden „Anmeldung absenden“ (:479), Schrittzeile „Schritt {currentStep} von 3 - Bitte füllen Sie alle Felder aus“ (:209).

## DATEN
Vorschlag (Grundlage K-07, K-02):
- consent_texts: key text, version int, gueltig_ab timestamptz; de text Pflicht; tr und en text optional mit Rückfall auf de. Mehrsprachig ja.
- form_submissions (nur Schreibziel, kein Anzeigeinhalt): form_key text, submitted_at und consent_at timestamptz, consent_version int, payload jsonb. Mehrsprachig nein; besonders schutzwürdig.
- Nicht aus der Datenbank: Schritte, Feldtexte, Fehler- und Bedientexte in messages/{de,tr,en}.json (K-02).

## FORMULARFELDER
Feldeigenschaften (abgeleitet, FormWizard.dc.html:122–131): name, type (text Standard; email, tel, date; textarea, select, radio, checkbox, checkgroup), label, req (zeigt „(Pflichtfeld)“), hint (nur Text- und Gruppenfelder, :49, :71), desc (Radio-Optionen :60, Checkbox :66), placeholder, maxLength, auto (Standard off), options {value, label, desc}, full (ganze Breite), optMin (Standard 220px, :128).

Schüler-Voranmeldung (StudentRegistration.tsx, 18 Felder, eine Seite): desiredClass radio mit 3 Optionen samt Beschreibung (:240–277); childGender radio mit 2 (:300–307); siblingNames textarea (:536); parent1Email und parent2Email email; childBirthDate date (:348); übrige Felder text oder tel; contactConsent und dataProtectionConsent checkbox (:568–585). Pflicht laut Prüfung (register required): childFirstName, childLastName, childBirthDate, street, postalCode (maxLength 5, :388), city, parent1Name, parent1Phone, parent1Email, filledBy (:319–547), dazu beide Einwilligungen (:177, :600). Labels de/tr/en: translations :52–171. Adress-Placeholder nur als Beispielwert (:369, :385, :401).

Mitglied werden (JoinUs.tsx, 13 Felder, 3 Schritte im Code, nur DE): Schritt 1 firstName, lastName, email (Pflicht laut „*“, :233–262), phone, address, city (:276–304), age (select, 6 Optionen, :312–326), gender (select, 3 Optionen, :328–339). Schritt 2 interests (Mehrfachauswahl, Pflicht laut „*“, :348; 8 Optionen :57–64), experience (textarea, :377–387). Schritt 3 motivation (textarea, Pflicht, :396–407), newsletter (checkbox, :415–421), privacy (checkbox, Pflicht, :431–438).

Webseite für Ihre Moschee: MosqueRequest.dc.html fehlt, Felder nicht erfasst.

## INTERAKTIONEN
- Weiter oder Absenden prüft nur den aktuellen Schritt (FormWizard.dc.html:136–141). Fehler: Feldfehler und Zusammenfassung. Ohne Fehler: nächster Schritt; im letzten Schritt Erfolg (:140).
- Zurück: Schritt minus 1, Fehler leer, Eingaben bleiben (:150).
- Feldänderung speichert den Wert und löscht den Fehler dieses Feldes (:116).
- Radio, Checkbox und Mehrfachauswahl schalten direkt um (:123, :130–131).
- Fehlerlink: Anker #fw-Feldname (:134). Der Fokus springt nicht zur Meldung (K-07).

## ZUSTAENDE
Eigenschaften (data-props, FormWizard.dc.html:94):
- state (enum): formular (Standard), fehler (Pflichtfelder des Schritts sofort markiert, :115), erfolg (Erfolgsansicht, :142).
- step (int): Standard 1, min 1, max 5. Startschritt, auf 1 bis Schrittzahl begrenzt (:111).
- config (object): kein Standard, Editor null. Schlüssel (abgeleitet, :96–154): steps, successTitle, successText, nextTitle, nextSteps, successLinks, errorSummary, requiredMsg, consentMsg, emailMsg, finalMsg, submitLabel, nextLabel.
- $preview: 960 × 900 (nur Vorschau).

Zustände aus dem Bestand: Startzustand (Schritt 1, Zurück fehlt); Feldfehler (StudentRegistration.tsx:279–281, :322–325); Senden läuft (StudentRegistration.tsx:84, :600; JoinUs.tsx:471, :474–476), im Baustein nicht vorgesehen; Erfolg als Seite (JoinUs.tsx:122–168) oder Toast mit Neuladen (StudentRegistration.tsx:190–197). Sprache: keine Umschaltung im Baustein (K-02).

## BILDER
– (entfaellt, keine Bilder im Baustein; Icons siehe ABSCHNITTE). Unsplash-Bild JoinUs.tsx:549–552 nicht übernommen (Laufbuch:34).

## AUFFAELLIGKEITEN
1. config ohne Standard (FormWizard.dc.html:94). Eine Pflicht-Checkbox ohne consentMsg und requiredMsg blockiert das Absenden ohne sichtbare Meldung (:102, :136–139).
2. Hart kodierte deutsche Texte (:27–28, :48, :85, :102–103, :148, :151) widersprechen K-02; neue TR/EN-Fassungen in MENSCHEN.md führen.
3. Stufenmarke 14 px (:31) liegt unter der 16-px-Untergrenze (readme.md:19).
4. Radiogruppe (:56) und Mehrfachauswahl (:69) verknüpfen Fehler nicht per aria-describedby; Hinweise bei Radio und Checkbox werden nicht gerendert (:55–67).
5. Select ohne Platzhalter (:51): sichtbar ist die erste Option, der Wert bleibt leer. Bestand nutzt „Wählen Sie aus“ (JoinUs.tsx:315, :331).
6. Design und Bestand weichen ab: Schrittzeile (FormWizard.dc.html:28 gegen JoinUs.tsx:209), Zurück (:85 ausgeblendet gegen JoinUs.tsx:455 deaktiviert), Sendezustand nur im Bestand (StudentRegistration.tsx:84, :600). Design gilt für Gestalt und Text.
7. E-Mail-Prüfung: Design verlangt einen Punkt in der Domain (:95), Bestand nicht (StudentRegistration.tsx:466, :516).
8. desiredClass und childGender haben im Bestand keine Prüfregel (StudentRegistration.tsx:236, :297), daher nie Fehler (:279, :309). Labels sind nicht verknüpft (:231, :295, :535).
9. Laufbuch:299 nennt „Weiter“ und „Zurück“ als nicht im Code, JoinUs.tsx:457 und :466 enthalten beide. „demoErrors“ (Laufbuch:276) fehlt; state=fehler (:94) entspricht ihm.
10. Prototyp ohne Server, Zod, ALTCHA, Honigtopf, Ratenbegrenzung (K-07, FormWizard.dc.html:136–141).

## OFFENE FRAGEN
1. Welcher Aufrufer liefert config je Formular, und liegen die Bedientexte in messages/*.json?
2. Schrittnamen fehlen: Laufbuch:299 nennt nur „Kontaktdaten“ und „Motivation“. Mitglied werden hat 3 Schritte, Voranmeldung 4 (Laufbuch:279); StudentRegistration.tsx hat keine Schritte.
3. MosqueRequest.dc.html fehlt. Plan 07.2 (Laufbuch:174) nennt keinen Fortschritt, D-14 drei Schritte.
4. Sind desiredClass und childGender Pflichtfelder?
5. Lokalisierte Pfade (K-02) fehlen. Erfolgslink „Korankurse“ steht nur im Laufbuch (:317).
6. LanguageContext.tsx fehlt in den Quellen (readme.md:7, Laufbuch:35). JoinUs.tsx liest t (:33), nutzt es aber nicht.
7. Icon-Namen in Icon.dc.html nicht geprüft.
8. Senden-Beschriftung: „Senden“ (Laufbuch:299) oder „absenden“ (Bestand)?
9. Einwilligungstexte: rechtliche Prüfung offen (G-08, Laufbuch:284).

=== ENDE C12 · BEREIT ZUR RÜCKGABE ===
