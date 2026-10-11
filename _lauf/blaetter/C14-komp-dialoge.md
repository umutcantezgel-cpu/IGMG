# C14 · Komponentenblatt „Dialoge: LoginDialog, TicketDialog (Meldung), DisclaimerDialog“

Kürzel: LD/TD/DD Design (.dc.html); BLD/BTD/BDD Bestand *.tsx; LC LanguageContext.tsx; RM readme.md; LB 00 Laufbuch.dc.html.

## SEITE
– (entfaellt, Komponentenblatt)

## ROUTE
LD: Header-Dropdown (BLD:1; LB:276). TD: Header-Button „Meldung“ (LC:19; LB:148). DD: Startseite laut Paketvorgabe, in den Quellen nicht belegt (LB:153).

## QUELLEN
Design und Bestand nur gelesen; Liste siehe Kürzel.

## ZWECK
LD: Anmeldung (LD:62–69). TD: Meldung (TD:19). DD: Hinweis Konzept-Website (DD:19–32).

## ABSCHNITTE
LD (LD:15–46): Kopf, Formular, Link. TD (TD:15–40): Dialog, Erfolg oder Formular. DD (DD:15–37): Dialog, zwei Blöcke, Button.
Farben: #047857, #AF2B25, #8C857C. Kontrast (abgeleitet): mindestens 5,48:1 Text, 3,65:1 Rand.
Legende: „– (nur DE in Quelle)“ = keine Fassung; eckige Klammern = Beispielwert (A5); DD-Schlüssel neu.

### LoginDialog (LD)
| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| header.loginForm.title | Anmelden | Giriş Yap | Login | LD:51–53 |
| header.loginForm.subtitle | Melden Sie sich in Ihrem Konto an | Hesabınıza giriş yapın | Sign in to your account | LD:51–53 |
| header.loginForm.*Label | E-Mail / Passwort | E-posta / Şifre | Email / Password | LD:51–53 |
| header.loginForm.emailPlaceholder | [ihre.email@beispiel.de] | [email@ornek.com] | [your.email@example.com] | LD:51–53 |
| header.loginForm.passwordPlaceholder | Ihr Passwort | Şifreniz | Your password | LD:51–53 |
| header.loginForm.*Required/Invalid/MinLength | E-Mail ist erforderlich / Ungültige E-Mail-Adresse / Passwort ist erforderlich / Passwort muss mindestens 6 Zeichen haben | E-posta gerekli / Geçersiz e-posta adresi / Şifre gerekli / Şifre en az 6 karakter olmalı | Email is required / Invalid email address / Password is required / Password must be at least 6 characters | LD:51–53 |
| header.loginForm.loginButton | Anmelden | Giriş Yap | Sign In | LD:51–53 |
| header.loginDropdown.forgotPassword | Passwort vergessen? | Şifrenizi mi unuttunuz? | Forgot password? | LD:51–53; LC:77/335/593 |
| login.pwToggle (neu) | Passwort anzeigen / Passwort verbergen | – (nur DE in Quelle) | – (nur DE in Quelle) | LD:80 |

### TicketDialog (TD)
| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| ticket.closeLabel (neu) | Schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | TD:18 |
| ticket.title | Neue Meldung erstellen | Yeni Bildirim Oluştur | Create New Report | TD:19; LC:150/408/666 |
| ticket.subtitle | Teilen Sie uns Ihr Anliegen mit - wir kümmern uns darum. | Sorununuzu bizimle paylaşın - ilgileneceğiz. | Share your concern with us - we'll take care of it. | TD:19; LC:151/409/667 |
| ticket.success | Meldung erfolgreich gesendet! | Bildirim başarıyla gönderildi! | Report sent successfully! | TD:20; LC:152/410/668 |
| ticket.form.*Label | Vorname / Nachname / Telefon / E-Mail / Organisation / Meldungstyp / Nachricht | Ad / Soyad / Telefon / E-posta / Organizasyon / Mesaj türü / Mesaj | First Name / Last Name / Phone / Email / Organization / Message type / Message | TD:43–49; LC:154–168/412–426/670–684 |
| ticket.form.required (neu) | (Pflichtfeld) | – (nur DE in Quelle) | – (nur DE in Quelle) | TD:26; LB:299 |
| ticket.form.feedbackWanted | Rückmeldung gewünscht? | Geri bildirim isteniyor mu? | Feedback requested? | TD:34; LC:164/422/680 |
| ticket.form.feedbackType | Art der Rückmeldung | Geri bildirim türü | Feedback type | TD:35; LC:165/423/681 |
| ticket.form.yes/no | Ja / Nein | Evet / Hayır | Yes / No | TD:60; LC:170–171/428–429/686–687 |
| ticket.form.feedbackTypes | Telefon / E-Mail / Persönlich | Telefon / E-posta / Şahsen | Phone / Email / In Person | TD:60; LC:181–183/439–441/697–699 |
| ticket.form.organizations | AT (Erwachsene) / KT (Frauen) / GT (Jugend) / KGT (Frauenjugend) | AT (Yetişkinler) / KT (Kadınlar) / GT (Gençlik) / KGT (Kadın Gençlik) | AT (Adults) / KT (Women) / GT (Youth) / KGT (Women's Youth) | TD:46; LC:175–178/433–436/691–694 |
| ticket.form.messageTypes | Beschwerde / Wunsch / Vorschlag / Information | Şikayet / Dilek / Öneri / Bilgi | Complaint / Wish / Suggestion / Information | TD:47; LC:186–189/444–447/702–705 |
| ticket.form.*Placeholder | Ihr Vorname / Ihr Nachname / [+49 123 456789] / [ihre.email@beispiel.de] / Wählen Sie Ihre Organisation / Wählen Sie den Meldungstyp / Beschreiben Sie Ihr Anliegen... | Adınız / Soyadınız / [+49 123 456789] / [email@ornek.com] / Organizasyonunuzu seçin / Mesaj türünü seçin / Sorununuzu açıklayın... | Your first name / Your last name / [+49 123 456789] / [your.email@example.com] / Select your organization / Select message type / Describe your concern... | TD:44–48; LC:155–169/413–427/671–685 |
| ticket.validation.* | Vorname ist erforderlich / Nachname ist erforderlich / Telefonnummer ist erforderlich / Organisation ist erforderlich / Bitte wählen Sie eine Option / Art der Rückmeldung ist erforderlich / Meldungstyp ist erforderlich / Nachricht ist erforderlich | Ad gerekli / Soyad gerekli / Telefon numarası gerekli / Organizasyon gerekli / Lütfen bir seçenek seçin / Geri bildirim türü gerekli / Mesaj türü gerekli / Mesaj gerekli | First name is required / Last name is required / Phone number is required / Organization is required / Please select an option / Feedback type is required / Message type is required / Message is required | TD:34–35, 44–48; LC:193–200/451–458/709–716 |
| ticket.form.cancel/submit | Abbrechen / Meldung senden | İptal / Bildirimi Gönder | Cancel / Send Report | TD:36; LC:172–173/430–431/688–689 |

### DisclaimerDialog (DD)
| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| dd.title | Hinweis: Konzept-Website | Uyarı: Konsept Website | – (nur DE in Quelle) | DD:20; BDD:14/27 |
| dd.subtitle | Diese Website dient ausschließlich zu Demonstrationszwecken. | Bu website yalnızca demonstrasyon amaçlıdır. | – (nur DE in Quelle) | DD:21; BDD:50/52 |
| dd.blockTitle | Wichtige Informationen: | Önemli bilgiler: | – (nur DE in Quelle) | DD:47–48; BDD:16/29 |
| dd.points | Alle angezeigten Daten sind fiktiv und dienen nur als Beispiele / Gebetszeiten, Termine und Nachrichten sind nicht real / Die Website ist nicht für den produktiven Einsatz bestimmt / Es handelt sich um ein Design- und Entwicklungskonzept | Gösterilen tüm veriler kurgusal ve sadece örnek amaçlıdır / Namaz vakitleri, etkinlikler ve haberler gerçek değildir / Website üretim kullanımı için tasarlanmamıştır / Bu bir tasarım ve geliştirme konseptidir | – (nur DE in Quelle) | DD:47–48; BDD:18–21/31–34 |
| dd.button | Verstanden | Anladım | – (nur DE in Quelle) | DD:32; BDD:23/36 |
| dd.footer | Diese Meldung wird nur einmal angezeigt. | Bu mesaj sadece bir kez gösterilir. | – (nur DE in Quelle) | DD:33; BDD:24/37 |

## DATEN
Vorschlag (A7). LD, DD: keine. TD: vorname, nachname, telefon, email, nachricht (Text, mehrsprachig nein); organisation, meldungstyp, rueckmeldung, rueckmeldungsart (Enum, Anzeige mehrsprachig ja); erstellt_am. Nur berechtigte Rollen, Audit-Log (G-07).

## FORMULARFELDER
LD: E-Mail und Passwort Pflicht (LD:65–66). TD: sechs Pflichtfelder und Rückmeldung Pflicht, Art nur bei Ja, E-Mail optional (TD:43–49, 59). DD: keine.

## INTERAKTIONEN
LD: Eingabe löscht Fehler (LD:72–73); Absenden prüft (LD:62–69); „Passwort vergessen?“ ohne Aktion (LD:45). TD: Eingabe löscht Fehler (TD:53); Absenden prüft (TD:59); Abbrechen, X, Overlay schließen (TD:16, 18, 36); Escape ohne Handler. DD: Button schließt (DD:32, 45).

## ZUSTAENDE
Props: LD lang (de/tr/en, Default de), demoErrors (Default false), idPrefix (Default login), onLogin (LD:49); TD demoErrors (Default false), onClose (TD:42); DD open (Default true), onClose (DD:39). Vorschau LD 380×520, TD 900×900, DD 800×720. LD: leer, Fehler je Feld (LD:75–78), Passwort sichtbar (LD:79–80), Erfolg (LD:68); Bestand ohne Zustände (BLD:1–2). TD: Standard, Feldfehler (TD:54–59), Erfolg (TD:20–21); Bestand: Laden (BTD:66, 134, 426), Erfolg mit alert() (BTD:137–163). DD: offen, geschlossen (DD:41).

## BILDER
Keine Bilder. Icons: LD:24–45, TD:18–36, DD:20, 26. Größen 18 px (TD:30), 28 px (TD:19, DD:20) gegen RM:28 (20/24 px).

## AUFFAELLIGKEITEN
1. TD nur deutsch im Design (TD:18–35); LC liefert tr und en.
2. „(Pflichtfeld)“ (TD:26) gegen „*“ im Bestand (BTD:219).
3. TD-Fehler ohne aria-describedby (TD:27–30; K-11).
4. Erfolg im Dialog (TD:20) gegen Schließen und alert() (BTD:161–163).
5. Google Fonts (LD:11; LB:183) gegen K-04 und G-07.
6. Umschalter 44 px (LD:36) gegen RM:21 (48 px); „nur einmal“ (DD:33) ohne Speicherung (DD:41).

## OFFENE FRAGEN
1. Fehlermeldung bei falschen Zugangsdaten; Ziel von „Passwort vergessen?“ (LD:45; LB:251)?
2. Einwilligung mit Zeitpunkt und Textversion im Meldungsformular (K-07; LB:284)?
3. Welche Bezeichnung gilt für AT, KT, GT, KGT: TD:46 oder RM:3?
4. Meldung für alle (LB:148) oder nur angemeldet (LB:278)?
5. DD auf der Startseite? In den Quellen nicht belegt (LB:153).
6. „Nur einmal“ als technisch nötiger Cookie (G-07)?
7. Telefon als Pflichtfeld nötig (G-07)?
8. Mindestlänge 6 auch bei der Anmeldung (LD:66; LC:70)?

=== ENDE C14 · BEREIT ZUR RÜCKGABE ===
