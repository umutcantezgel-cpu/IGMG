# S22 · Webseite für Ihre Moschee

S22 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt · Schwierigkeit 1

## SEITE

Webseite für Ihre Moschee, Plan 07.2 (LB:174), Status fertig. Dreistufiges Formular mit Erfolgsmeldung, im Design ohne Datenabruf und Versand.

## ROUTE

- de: /webseite-fuer-moscheen (K-03). tr und en: – (nur DE in Quelle).
- Eingehend: Footer „Jetzt anfragen“ (LB:311). Ausgehend: Startseite Home.dc.html (MR:22, 33; LB:153), abgeleitet: /.

## QUELLEN

- Design, vollständig: MR = MosqueRequest.dc.html (Skript :29–65), FW = FormWizard.dc.html (Skript :94–155).
- Bestand, nur lesend: TSX = MosqueRequest.tsx (Zustand :36–54, Übersetzungen :56–267, Logik :269–289, Ansicht :291–635).
- Hilfen: RM = readme.md; LB = 00 Laufbuch.dc.html (D-01 bis D-05 :182–186, D-08 :189, D-14 :279, :284, :290).

## ZWECK

Öffentliche Anfrage nach einer Webseite für die eigene Moschee: Grunddaten, Standort, Anforderungen und Projektrahmen erfassen, Einwilligung zur Beratung einholen (MR:20–23, 59). Keine Personennamen (A5), keine religiösen Texte (A6).

## ABSCHNITTE

Aufbau (MR:15–26): Header (active leer, current „mosque-request“, MR:16), PrayerTimesBar (MR:17), Breadcrumbs „Webseite anfragen“ (MR:18), PageHeader (MR:20), Zurück-Link (MR:22), FormWizard (MR:23), Footer (MR:26). Importierte Teile sind nur genannt. Im FormWizard: Erfolgsbox (FW:16–24), Fortschritt (FW:27–34), Fehlerzusammenfassung (FW:35–37), fünf Gruppen-Fieldsets (FW:39–82), Formularmeldung (FW:83), Buttonzeile (FW:84–88).

Texte (A2): de aus dem Design, tr und en aus dem Bestand (TSX:35, 56–267); Label und Platzhalter mit „·“ verbunden; E-Mail- und Telefon-Platzhalter als Beispielwert (A5).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| seite.titel | Webseite für Ihre Moschee | Caminiz için Web Sitesi | Website for Your Mosque | MR:20 (Eyebrow gleich); TSX:58,128,198 |
| seite.untertitel | Interesse an einer modernen, professionellen Webseite für Ihre Moschee? Kontaktieren Sie uns für eine kostenlose Beratung. | Caminiz için modern, profesyonel bir web sitesi mi istiyorsunuz? Ücretsiz danışmanlık için bizimle iletişime geçin. | Interested in a modern, professional website for your mosque? Contact us for a free consultation. | MR:20; TSX:59,129,199 |
| seite.brotkrumen | Webseite anfragen | – (nur DE in Quelle) | – (nur DE in Quelle) | MR:18 |
| nav.zurueck | Zurück | Geri | Back | MR:22; FW:85; TSX:125,195,265 |
| nav.startseite | Zurück zur Startseite | Ana Sayfaya Dön | Back to Home | MR:33; TSX:60,130,200 |
| schritt.1 | Grundinformationen | Temel Bilgiler | Basic Information | MR:35–36; TSX:64,134,204 |
| schritt.2 | Moschee-Details | Cami Detayları | Mosque Details | MR:46–47; TSX:84,154,224 |
| schritt.3 | Projektdetails | Proje Detayları | Project Details | MR:54–55; TSX:103,173,243 |
| gruppe.standort | Standort | Konum | Location | MR:41; TSX:74,144,214 |
| gruppe.anforderungen | Anforderungen | Gereksinimler | Requirements | MR:50; TSX:90,160,230 |
| fortschritt | Schritt {n} von {m}: {Name} | – (nur DE in Quelle) | – (nur DE in Quelle) | FW:28; LB:279 |
| feld.name | Moschee-Name · z.B. IGMG Frankfurt Moschee | Cami Adı · örn. IGMG Frankfurt Camii | Mosque Name · e.g. IGMG Frankfurt Mosque | MR:37; TSX:65–66,135–136,205–206 |
| feld.ansprechpartner | Ansprechpartner · Vollständiger Name | İletişim Kişisi · Tam adınız | Contact Person · Full name | MR:38; TSX:67–68,137–138,207–208 |
| feld.email | E-Mail-Adresse · Beispielwert (MR:39) | E-posta Adresi · Beispielwert (TSX:140) | Email Address · Beispielwert (TSX:210) | MR:39; TSX:69–70,139–140,209–210 |
| feld.telefon | Telefonnummer · Beispielwert (MR:40) | Telefon Numarası · Beispielwert (TSX:142) | Phone Number · Beispielwert (TSX:212) | MR:40; TSX:71–72,141–142,211–212 |
| feld.adresse | Adresse · Straße und Hausnummer | Adres · Sokak ve ev numarası | Address · Street and house number | MR:42; TSX:75–76,145–146,215–216 |
| feld.stadt | Stadt · z.B. Frankfurt am Main | Şehir · örn. Frankfurt am Main | City · e.g. Frankfurt am Main | MR:43; TSX:77–78,147–148,217–218 |
| feld.plz | Postleitzahl · 12345 | Posta Kodu · 12345 | Postal Code · 12345 | MR:44; TSX:79–80,149–150,219–220 |
| feld.land | Land · Deutschland | Ülke · Almanya | Country · Germany | MR:45; TSX:81–82,151–152,221–222 |
| feld.webseite | Aktuelle Webseite (falls vorhanden) · https://www.ihre-aktuelle-webseite.de | Mevcut Web Sitesi (varsa) · https://www.mevcut-siteniz.de | Current Website (if any) · https://www.your-current-website.de | MR:48; TSX:85–86,155–156,225–226 |
| feld.mitglieder | Ungefähre Mitgliederanzahl · z.B. 500 | Yaklaşık Üye Sayısı · örn. 500 | Approximate Number of Members · e.g. 500 | MR:49; TSX:87–88,157–158,227–228 |
| feld.anforderungen | Welche Funktionen sind für Sie wichtig? | Hangi özellikler sizin için önemli? | Which features are important to you? | MR:51; TSX:91,161,231 |
| feld.budget | Ungefähres Budget · Wählen Sie eine Kategorie | Yaklaşık Bütçe · Bir kategori seçin | Approximate Budget · Select a category | MR:56; TSX:104–105,174–175,244–245 |
| feld.zeitrahmen | Gewünschter Zeitrahmen · Wählen Sie einen Zeitrahmen | İstenen Zaman Çerçevesi · Bir zaman çerçevesi seçin | Desired Timeline · Select a timeframe | MR:57; TSX:112–113,182–183,252–253 |
| feld.zusatz | Zusätzliche Informationen · Erzählen Sie uns mehr über Ihre Vorstellungen, besondere Anforderungen oder Fragen... | Ek Bilgiler · Özel gereksinimleriniz, sorularınız veya fikirleriniz hakkında bize daha fazla bilgi verin... | Additional Information · Tell us more about your ideas, special requirements, or questions... | MR:58; TSX:120–121,190–191,260–261 |
| feld.einwilligung | Ich stimme der Verarbeitung meiner Daten zu Beratungszwecken zu | Verilerimin danışmanlık amaçlı işlenmesini kabul ediyorum | I agree to the processing of my data for consultation purposes | MR:59; TSX:123,193,263 |
| opt.anforderungen (10) | Gebetszeiten-Anzeige; Veranstaltungskalender; Nachrichten-Bereich; Mitgliederverwaltung; Spenden-System; Mehrsprachigkeit; Mobile-optimiert; Kontaktformulare; Bildergalerie; Bildungsprogramme | Namaz vakitleri gösterimi; Etkinlik takvimi; Haberler bölümü; Üye yönetimi; Bağış sistemi; Çok dilli; Mobil uyumlu; İletişim formları; Resim galerisi; Eğitim programları | Prayer times display; Event calendar; News section; Member management; Donation system; Multilingual; Mobile optimized; Contact forms; Image gallery; Education programs | MR:52–53; TSX:92–101,162–171,232–241 |
| opt.budget (5) | Unter 2.000€; 2.000€ - 5.000€; 5.000€ - 10.000€; Über 10.000€; Zu besprechen | 2.000€'nun altında; 2.000€ - 5.000€; 5.000€ - 10.000€; 10.000€'nun üzerinde; Görüşülecek | Under €2,000; €2,000 - €5,000; €5,000 - €10,000; Over €10,000; To be discussed | MR:56; TSX:106–110,176–180,246–250 |
| opt.zeitrahmen (5) | 1-2 Monate; 3-4 Monate; 5-6 Monate; Mehr als 6 Monate; Flexibel | 1-2 ay; 3-4 ay; 5-6 ay; 6 aydan fazla; Esnek | 1-2 months; 3-4 months; 5-6 months; More than 6 months; Flexible | MR:57; TSX:114–118,184–188,254–258 |
| msg.erfolg | Ihre Anfrage wurde erfolgreich übermittelt! | Talebiniz başarıyla gönderildi! | Your request has been successfully submitted! | MR:32; TSX:61,131,201 |
| msg.erfolg.text | Wir werden uns in den nächsten 2-3 Werktagen bei Ihnen melden. | 2-3 iş günü içinde sizinle iletişime geçeceğiz. | We will contact you within the next 2-3 business days. | MR:32; TSX:62,132,202 |
| msg.pflicht | Dieses Feld ist erforderlich · (Pflichtfeld) | – (nur DE in Quelle) | – (nur DE in Quelle) | MR:31; FW:48 |
| msg.email | Bitte geben Sie eine gültige E-Mail-Adresse ein | – (nur DE in Quelle) | – (nur DE in Quelle) | MR:31 |
| msg.sammelfehler | Bitte füllen Sie die markierten Pflichtfelder aus. | – (nur DE in Quelle) | – (nur DE in Quelle) | FW:148 |
| btn.weiter | Weiter | – (nur DE in Quelle) | – (nur DE in Quelle) | FW:151 |
| btn.absenden | Anfrage senden | Talep Gönder | Send Request | MR:31; TSX:124,194,264 |

## DATEN

Lesen: keine Datenbankinhalte. Seitentexte stehen nach K-02 in messages/{de,tr,en}.json, Optionen sind im Design fest (MR:51–57). Schreiben, Vorschlag (abgeleitet), mehrsprachig jeweils nein:

- Text, Pflicht: mosque_name, contact_person, email, address, city, postal_code (max. 5), country.
- Text, optional: phone, website (URL), member_count, additional_info. Textliste: requirements. Schlüssel oder leer: budget, timeline.
- Einwilligung: consent_at (Zeitstempel), consent_text_version (Text) nach K-07. Zugriff, Audit-Log, Export und Löschung nach G-07.

## FORMULARFELDER

Drei Schritte (FW:94, MR:35–59). Pflichtfelder tragen „(Pflichtfeld)“ (FW:48, 66, 70).

- Schritt 1: mosqueName, contactPerson, email (Format geprüft), address, city, postalCode (maxLength 5), country sind Pflicht. phone ist optional (MR:37–45).
- Schritt 2: website (URL), memberCount und requirements (zehn Optionen, Mehrfachauswahl) sind optional (MR:48–53).
- Schritt 3: budget und timeline (Auswahl mit leerer Option) und additionalInfo (Textfeld) sind optional. dataProtection (Checkbox) ist Pflicht (MR:56–59).
- Prüfung (FW:98–104): leeres Pflichtfeld ergibt Fehler. E-Mail nur bei Eingabe, Muster /^\S+@\S+\.\S+$/. Nicht geprüft: Telefon, URL, Postleitzahl (nur Länge), Mitgliederzahl.

## INTERAKTIONEN

- Weiter prüft nur den aktuellen Schritt. Fehler stehen am Feld, die Zusammenfassung oben verlinkt auf #fw-Feldname (FW:134–140).
- Zurück (ab Schritt 2) verwirft Fehler ohne Prüfung (FW:85, 150). Anfrage senden prüft Schritt 3 und zeigt dann die Erfolgsbox (FW:140–142). Jede Eingabe löscht den Fehler des Feldes (FW:116).
- Nicht im Design, aber nach K-07 Pflicht: Server Action mit Zod, useActionState, ALTCHA, Honigtopf-Feld, Ratenbegrenzung, Einwilligung mit Zeitpunkt und Textversion, Bestätigungsmail, Rollenbenachrichtigung, Fokus auf die Rückmeldung.

## ZUSTAENDE

- Eigenschaften MR:29: state formular (Default), fehler, erfolg. step 1 bis 3, Default 1. FW:94: step bis 5, $preview 960 × 900. fehler zeigt die Pflichtfehler des Startschritts (FW:115), erfolg die Erfolgsbox (FW:142), step den Startschritt (FW:111).
- Design: Schritt 1 bis 3 erledigt, aktuell oder offen (FW:147), leer, Feldfehler mit rotem Rand (FW:77, 129), Fehlerzusammenfassung (FW:35–37), Erfolg (FW:16–24). Formularmeldung und „nächster Schritt“ sind in CONFIG nicht belegt (FW:21, 83).
- Bestand: formular und erfolgreich (TSX:36, 291–318). Kein Fehlerzustand. Absenden gesperrt bis zur Einwilligung (TSX:623).
- Sprache: de im Design (MR:15), tr und en nur im Bestand. Angemeldet: entfällt, die Seite ist öffentlich.

## BILDER

Keine Bilder (kein img in MR und FW). Icons arrow-left, arrow-right, send, circle-check und circle-alert sind in Icon.dc.html vorhanden (FW:18, 36, 77, 83, 85, 151). Bestand-Icons (TSX:298, 340, 357, 416, 474, 509, 538) entfallen im Design.

## AUFFAELLIGKEITEN

1. Kein Versand im Design (FW:138–142), die K-07-Pflichten fehlen.
2. Der Bestand sperrt den Absendeknopf bis zur Einwilligung (TSX:623), das Design nicht (FW:87). Design gilt.
3. Schrittnamen im 390-px-Rahmen (LB:71): drei Spalten (FW:29) mit overflow-wrap anywhere (FW:31) brechen Wörter vermutlich mitten im Wort (abgeleitet).
4. Zurück: Der Bestand führt zur Startseite (TSX:615), das Design geht einen Schritt zurück (FW:85). Design gilt.
5. Schrittzahl: MR:29 erlaubt bis 3, FW:94 bis 5. D-14 (LB:279) verlangt eine Erfolgsbox mit nächstem Schritt, CONFIG setzt keine nextSteps.

## OFFENE FRAGEN

1. Welche Schlüssel gelten für Budget und Zeitrahmen, die Designwerte (MR:56–57) oder die Bestandswerte (TSX:553–574)?
2. Welche tr- und en-Pfade gelten für die Route, da K-03 eine Lokalisierung verlangt?
3. Wer bestätigt „2-3 Werktage“ und die Budgetstufen (LB:290)?
4. Ist der Einwilligungstext mit Textversion und Datenschutz-Link freigegeben (D-08, LB:189; G-08, LB:284)?
5. Welche Felder sind nötig (G-07), etwa Telefon, Mitgliederzahl und Standort?
6. Welcher Text geht in die Bestätigungsmail und in die Rollenbenachrichtigung (K-07)?
7. Wer übersetzt „Weiter“, „Schritt n von m“, Fehlertexte und „(Pflichtfeld)“ und markiert sie in MENSCHEN.md (K-02)?
8. Gibt es tr- und en-Fassungen von „Webseite anfragen“ außerhalb der gelesenen Quellen?

=== ENDE S22 · BEREIT ZUR RÜCKGABE ===
