# V00 · Anmeldung (Verwaltung)

V00 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt · Schwierigkeit 1

## SEITE

Anmeldung des Verwaltungsmoduls mit Zwei-Faktor-Schritt, Passwort-vergessen-Ablauf und Einladung annehmen. Die Anmeldung hat ein Design (LoginDialog.dc.html). Zwei-Faktor, Passwort vergessen und Einladung haben kein Design und sind ABGELEITET. Das Laufbuch führt kein eigenes Artboard; der Dialog steht unter „02.x Weitere Bausteine“ (00 Laufbuch.dc.html:276).

## ROUTE

- Ziel: /verwaltung/anmelden (Auftragsvorgabe, ABGELEITET).
- Design und Bestand kennen nur den Header-Dropdown: Desktop (Header.dc.html:57–62; Header.tsx:464–603), mobil im Login-Akkordeon (Header.tsx:809–969).
- Nach Erfolg gibt es kein Ziel: Das Design ruft nur onLogin (LoginDialog.dc.html:68), der Bestand setzt nur den Zustand (Header.tsx:76).

## QUELLEN

- Design, vollständig gelesen: LoginDialog.dc.html (Template 9–48, Skript 49–85); Header.dc.html (Template 9–143, Skript 144–228). Icon.dc.html ist ein eigenes Komponentenblatt und nicht gelesen.
- Bestand, gelesen: LoginDialog.tsx (108 Byte, nur Kommentar und export {} in Zeilen 1–2); Header.tsx (986 Zeilen, vollständig); LanguageContext.tsx (Header-Schlüssel de 14–79, tr 272–337, en 530–595).
- Hilfen: readme.md (vollständig); 00 Laufbuch.dc.html (Zeilen 148, 185, 231, 251, 276, 278, 299, 309).
- Gegengeprüft: Die zweite Kopie uploads/IGMG_Wetzlar_Website_Code ist für die drei Bestandsdateien identisch (cmp). Die Suche in Design und Bestand nach Zwei-Faktor, 2FA, TOTP, Passkey, Einladung und Passwort vergessen findet keinen Ablauf; einzige technische Spur ist ui/input-otp.tsx. Nicht ausgewertet, da nicht in den Quellen: 08 Dialoge und Zustaende.dc.html (Zeile 42, „Anmeldung (abgemeldet)“).

## ZWECK

Ehrenamtliche mit einer Rolle (Administration, Redaktion, Organisationsredaktion, Bildung, Mitgliederverwaltung) melden sich hier an (K-06). Die Zwei-Faktor-Anmeldung per TOTP oder Passkey ist für alle Konten Pflicht; Konten entstehen nur per Einladung (K-06). Deshalb gibt es keinen Registrierungslink, und das Design hat keinen. Alle Formulardaten gelten als besonders schutzwürdig (G-07). Personennamen und religiöse Texte kommen in diesem Blatt nicht vor (A5, A6).

## ABSCHNITTE

Aufbau: Die Abschnitte 1 bis 3 sind designt, 4 bis 6 ABGELEITET.

1. Kopf mit Titel und Untertitel (LoginDialog.dc.html:17–18). Der Titel ist im Design eine h2; die Seite braucht eine Hauptüberschrift (ABGELEITET).
2. Formular (LoginDialog.dc.html:20–43): E-Mail (22–30), Passwort mit Sichtbarkeits-Schalter (32–40), Absenden (42).
3. Trennlinie mit Schaltfläche „Passwort vergessen?“ (44–46), ohne Ziel.
4. ABGELEITET, Schritt 2 Zwei-Faktor: Code-Feld (TOTP) oder Passkey. Der Bestand hat ui/input-otp.tsx (Paket input-otp@1.4.2, Zeile 4), das nirgends eingebunden ist.
5. ABGELEITET, Passwort vergessen: E-Mail-Feld, Absenden, neutrale Bestätigung, Rückweg zur Anmeldung.
6. ABGELEITET, Einladung annehmen: Passwort festlegen, Zwei-Faktor einrichten, Fehler bei ungültigem oder abgelaufenem Link.

Komponenten: LoginDialog (dc-import mit idPrefix und onLogin); Icon mit mail (24), circle-alert (28, 39), lock (34), eye und eye-off (36), log-in (42), key-round (45). Bestand: ui/button, ui/input, ui/label (Header.tsx:2, 5, 6).

Gestalt (Design): Text Atkinson Hyperlegible Next, 18 px, Zeilenhöhe 1,5 (LoginDialog.dc.html:15; readme.md:19 nennt 1,6). Titel Source Serif 4, 24 px (17). Felder 48 px hoch, Radius 8 px, Rand 1 px #8C857C; Fehler-Rand 2 px #AF2B25 (25, 77–78). Fehlertext 16 px fett, role=alert (28, 39). Absenden #047857, Hover #065F46 (42). Fokus 2 px #0E3929 (13). Header-Panel 380 px breit (Header.dc.html:59), Bestand 320 px (Header.tsx:486).

Texte (A2): de, tr und en je Zeile. Design und Bestand stimmen bei allen Anmeldetexten überein (verglichen). Keine Großschreibungs-Umwandlung, türkische Zeichen unverändert (readme.md:15). E-Mail-Beispielwerte sind nicht ausgeschrieben (A5).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| anmelden.titel | Anmelden | Giriş Yap | Login | LoginDialog.dc.html:51–53; LanguageContext.tsx:61, 319, 577 |
| anmelden.untertitel | Melden Sie sich in Ihrem Konto an | Hesabınıza giriş yapın | Sign in to your account | LoginDialog.dc.html:51–53; LanguageContext.tsx:62, 320, 578 |
| anmelden.email | E-Mail | E-posta | Email | LoginDialog.dc.html:51–53; LanguageContext.tsx:63, 321, 579 |
| anmelden.email.platzhalter | Beispielwert | Beispielwert | Beispielwert | LoginDialog.dc.html:51–53 (emailPh); LanguageContext.tsx:64, 322, 580 |
| anmelden.email.pflicht | E-Mail ist erforderlich | E-posta gerekli | Email is required | LoginDialog.dc.html:51–53; LanguageContext.tsx:65, 323, 581 |
| anmelden.email.ungueltig | Ungültige E-Mail-Adresse | Geçersiz e-posta adresi | Invalid email address | LoginDialog.dc.html:51–53; LanguageContext.tsx:66, 324, 582 |
| anmelden.passwort | Passwort | Şifre | Password | LoginDialog.dc.html:51–53; LanguageContext.tsx:67, 325, 583 |
| anmelden.passwort.platzhalter | Ihr Passwort | Şifreniz | Your password | LoginDialog.dc.html:51–53; LanguageContext.tsx:68, 326, 584 |
| anmelden.passwort.pflicht | Passwort ist erforderlich | Şifre gerekli | Password is required | LoginDialog.dc.html:51–53; LanguageContext.tsx:69, 327, 585 |
| anmelden.passwort.kurz | Passwort muss mindestens 6 Zeichen haben | Şifre en az 6 karakter olmalı | Password must be at least 6 characters | LoginDialog.dc.html:51–53; LanguageContext.tsx:70, 328, 586 |
| anmelden.absenden | Anmelden | Giriş Yap | Sign In | LoginDialog.dc.html:51–53; LanguageContext.tsx:71, 329, 587 |
| anmelden.passwort_vergessen | Passwort vergessen? | Şifrenizi mi unuttunuz? | Forgot password? | LoginDialog.dc.html:51–53; LanguageContext.tsx:77, 335, 593 |
| anmelden.passwort_anzeigen | Passwort anzeigen | – (nur DE in Quelle) | – (nur DE in Quelle) | LoginDialog.dc.html:80; Header.tsx:534, 872 |
| anmelden.passwort_verbergen | Passwort verbergen | – (nur DE in Quelle) | – (nur DE in Quelle) | LoginDialog.dc.html:80; Header.tsx:534, 872 |
| header.anmelden | Anmelden | Giriş Yap | Login | Header.dc.html:148, 151, 154; LanguageContext.tsx:17, 275, 533 |
| header.angemeldet | Angemeldet | – (nur DE in Quelle) | – (nur DE in Quelle) | Header.dc.html:65, 128; Header.tsx:921 |
| header.angemeldet_sr | (Angemeldet) | – (nur DE in Quelle) | – (nur DE in Quelle) | Header.dc.html:57 (nur Design, sr-only) |
| konto.dashboard | Dashboard | Panel | Dashboard | Header.dc.html:148, 151, 154; LanguageContext.tsx:18, 276, 534 |
| konto.styleguide | Styleguide | Styleguide | Styleguide | Header.dc.html:209; Header.tsx:450, 942 (fest in allen Sprachen) |
| konto.meldung | Meldung | Bildirim | Report | Header.dc.html:148, 151, 154; LanguageContext.tsx:19, 277, 535 |
| konto.mein_konto | Mein Konto | Hesabım | My Account | Header.dc.html:150, 153, 156; LanguageContext.tsx:74, 332, 590 |
| konto.einstellungen | Einstellungen | Ayarlar | Settings | Header.dc.html:150, 153, 156; LanguageContext.tsx:75, 333, 591 |
| konto.abmelden | Abmelden | Çıkış Yap | Sign Out | Header.dc.html:150, 153, 156; LanguageContext.tsx:76, 334, 592 |

Abgeleitete Texte (kein Design, nur Vorschlag; Vorbild für neue Bedientexte: 00 Laufbuch.dc.html:299; tr und en offen):

| Schluessel-Vorschlag | de (Vorschlag) | tr | en | Fundstelle |
|---|---|---|---|---|
| zwei.titel | Zwei-Faktor-Bestätigung | – (offen) | – (offen) | ABGELEITET, K-06 |
| zwei.code | Code aus Ihrer Authentifizierungs-App | – (offen) | – (offen) | ABGELEITET |
| zwei.passkey | Mit Passkey bestätigen | – (offen) | – (offen) | ABGELEITET, K-06 |
| zwei.fehler | [Fehlertext Zwei-Faktor] | – (offen) | – (offen) | ABGELEITET, Platzhalter |
| anmelden.fehler | [Fehlertext Anmeldung] | – (offen) | – (offen) | ABGELEITET, Platzhalter |
| reset.titel | Passwort vergessen | – (offen) | – (offen) | ABGELEITET; Link LoginDialog.dc.html:45 |
| reset.hinweis | Wenn zu dieser E-Mail-Adresse ein Konto besteht, senden wir einen Link zum Zurücksetzen. | – (offen) | – (offen) | ABGELEITET, neutral |
| reset.senden | Link senden | – (offen) | – (offen) | ABGELEITET |
| reset.zurueck | Zurück zur Anmeldung | – (offen) | – (offen) | ABGELEITET |
| einladung.titel | Einladung annehmen | – (offen) | – (offen) | ABGELEITET, K-06 |
| einladung.fehler | [Fehlertext Einladung] | – (offen) | – (offen) | ABGELEITET, Platzhalter |
| einladung.absenden | Konto anlegen | – (offen) | – (offen) | ABGELEITET |

## DATEN

Aus der Datenbank (PostgreSQL mit Drizzle, K-05), Vorschlag (A7). Alle Felder sind nicht mehrsprachig; Bedientexte liegen im Code (de, tr, en).

- konto: id (uuid), e-mail (text, eindeutig), passwort_hash (text), rolle (enum: administration, redaktion, organisationsredaktion, bildung, mitgliederverwaltung), organisation (Bezug, nur bei Organisationsredaktion), status (text), angelegt_am und letzte_anmeldung (timestamptz, UTC; Anzeige Europe/Berlin).
- zwei_faktor: totp_geheimnis (text, verschlüsselt), passkey (credential_id text, public_key bytea, zaehler integer).
- einladung: token_hash (text), e-mail (text), rolle (enum), organisation (Bezug), ablauf (timestamptz), eingeladen_von (Bezug konto), eingeloest_am (timestamptz, optional).
- passwort_reset: token_hash (text), konto (Bezug), ablauf (timestamptz), eingeloest_am (timestamptz, optional).
- audit_log: konto (Bezug), ereignis (enum: anmeldung, zwei_faktor, reset, einladung), zeitpunkt (timestamptz, UTC). Jeder Zugriff auf Personendaten wird protokolliert (G-07); Aufbewahrungsfrist offen.
- Löschen von Konto oder Einladung entfernt die Datensätze endgültig (K-05).

## FORMULARFELDER

1. E-Mail: type email, autoComplete email. Pflicht per Skript, ohne required-Attribut. Geprüft nach dem Trimmen (LoginDialog.dc.html:64): leer ergibt emailReq, ungültiges Muster emailInv (65). Bestand ohne Trimmen (Header.tsx:44–50).
2. Passwort: type password oder text über den Schalter, autoComplete current-password. Pflicht per Skript; unter 6 Zeichen ergibt pwMin (66; Header.tsx:52–58).
3. ABGELEITET, Zwei-Faktor-Code: 6 Ziffern (Standard TOTP, nicht in Quelle), alternativ Passkey.
4. ABGELEITET, Passwort vergessen: E-Mail, Pflicht.
5. ABGELEITET, Einladung: neues Passwort, Mindestlänge offen.
6. ABGELEITET, Honigtopf-Feld und ALTCHA (K-07), Position offen.

## INTERAKTIONEN

- Tippen in E-Mail oder Passwort entfernt den Fehler dieses Feldes (LoginDialog.dc.html:72–73; Header.tsx:83–89).
- Absenden verhindert die Standardaktion, prüft beide Felder und zeigt Fehler am Feld (62–67, 28, 39). Bei Erfolg werden die Felder geleert und onLogin gerufen (68).
- Der Bestand simuliert die Anmeldung mit 1000 ms Verzögerung ohne Serverprüfung (Header.tsx:74–80). Nicht übernehmen.
- Schalter „Passwort anzeigen“ wechselt Typ und Symbol (36, 79–81).
- „Passwort vergessen?“ hat im Design und Bestand keinen Ablauf (LoginDialog.dc.html:45; Header.tsx:563–571, 901–910; 00 Laufbuch.dc.html:251). ABGELEITET: öffnet den Ablauf Passwort vergessen.
- Fokus: Weder Design noch Bestand setzen den Fokus. K-07 verlangt Fokus auf die Rückmeldung; ABGELEITET: Fokus auf das erste fehlerhafte Feld.
- Escape und Klick außerhalb schließen das Header-Dropdown (Header.dc.html:169–170).
- Abmelden setzt den Zustand auf abgemeldet (Header.dc.html:205; Header.tsx:91–96).

## ZUSTAENDE

Eigenschaften aus data-props (A3):

- LoginDialog (LoginDialog.dc.html:49): lang = de, tr, en (Standard de; Wurzel-Element lang, Zeile 15). demoErrors = Wahrheitswert (Standard false; zeigt bei fehlendem Fehlerzustand beide Pflichtfehler, nur Vorschau, Zeile 60). idPrefix = Text (Standard login; Zeilen 61, 74). onLogin = Funktion ohne Argument (kein Editor).
- Header (Header.dc.html:144): lang = de, tr, en (Standard de). active = leer, home, moschee, islam, organisationen, bildung (Standard home). current = Text (Standard home). loggedIn = Wahrheitswert (Standard false). open = none, moschee, islam, organisationen, bildung, lang, login, account, mobile, ticket (Standard none; 00 Laufbuch.dc.html:148 nennt „admin“ statt „ticket“). demoErrors = Wahrheitswert (Standard false). onLang = Funktion mit Sprachcode.

Zustände aus Design und Bestand:

- leer, ohne Fehler (LoginDialog.dc.html:56).
- Fehler: E-Mail leer oder ungültig; Passwort leer oder unter 6 Zeichen (51–53, 64–66).
- Passwort sichtbar oder verborgen (79–80; Header.tsx:520, 534).
- Erfolg: Felder leer, Callback, kein Erfolgstext (68).
- Laden, nur Bestand: Felder und Schalter deaktiviert, Spinner im Absenden (Header.tsx:506, 525, 533, 551–557).
- angemeldet oder abgemeldet (Header.dc.html:180, 219–223; Header.tsx:22, 433, 487).
- Sprache de, tr, en (LoginDialog.dc.html:58–59).
- Schritt: weder Design noch Bestand. ABGELEITET: Schritt 1 Anmeldung, Schritt 2 Zwei-Faktor.
- ABGELEITET, ohne Quelle: Fehler bei falschen Zugangsdaten, falschem Code sowie ungültiger oder abgelaufener Einladung, jeweils als Platzhalter.

## BILDER

Keine Bilder im Anmeldeformular, nur Icons (LoginDialog.dc.html:24). Das Logo steht nur im Header: assets/logo-igmg-wetzlar.png, 40 × 40 px, weißer Grund (Header.dc.html:19, 79; 00 Laufbuch.dc.html:231). Für die Seite ist kein Logo festgelegt.

## AUFFAELLIGKEITEN

1. Die Bestandsdatei LoginDialog.tsx ist nur ein Stub („no longer needed“, Zeilen 1–2). Die Anmeldung steckt in Header.tsx, während das Design LoginDialog als eigene Komponente führt (Header.dc.html:60, 123).
2. Kontomenü: Der Bestand trennt den Admin-Button mit Styleguide und Meldung (Header.tsx:432–461) vom Dropdown mit Dashboard, Mein Konto, Einstellungen und Abmelden (Header.tsx:574–601). Das Design vereint alle Einträge (Header.dc.html:209–211; 00 Laufbuch.dc.html:278, D-13). Mobil fehlen im Bestand Mein Konto und Einstellungen (Header.tsx:926–963).
3. Mein Konto und Einstellungen haben im Bestand keinen Handler (Header.tsx:584–591). Das Design verlinkt beide auf Dashboard.dc.html (Header.dc.html:210), vorläufig (00 Laufbuch.dc.html:251, 309).
4. Umbruch: Das Design schaltet bei 1240 px Komponentenbreite um (Header.dc.html:184; 00 Laufbuch.dc.html:185, D-04). Der Bestand nutzt lg (1024 px, Header.tsx:128, 608) und sm (640 px, Header.tsx:469). Zwischen 640 und 1023 px zeigt der Bestand Login-Schaltfläche und Menü-Schaltfläche gleichzeitig.
5. Formular: Das Design setzt noValidate (LoginDialog.dc.html:20) und autoComplete (25, 35). Der Bestand setzt beides nicht (Header.tsx:494, 830, 499–526) und trimmt die E-Mail nicht.
6. Fokus: K-07 verlangt Fokus auf die Rückmeldung, aber kein Design- oder Bestandsteil setzt ihn.
7. Nur DE in beiden Quellen: „Passwort anzeigen“ und „Passwort verbergen“ (LoginDialog.dc.html:80; Header.tsx:534, 872), „Angemeldet“ (Header.dc.html:65; Header.tsx:921) und „Styleguide“ (Header.tsx:450, 942). Das Laufbuch nennt open=admin (148), das Design hat ticket (Header.dc.html:144).

## OFFENE FRAGEN

1. Soll der Header-Dropdown auf /verwaltung/anmelden verweisen oder denselben Dialog zeigen?
2. Wohin führt die erfolgreiche Anmeldung? Kandidat: Dashboard.dc.html (Admin Dashboard, Zeile 21, nur per Suche gefunden), mit Rollenprüfung nach K-06.
3. Welcher Fehlertext gilt bei falschen Zugangsdaten? Vorschlag: neutral, ohne Hinweis auf vorhandene Konten. Bis dahin [Fehlertext Anmeldung]; der Platzhalter gehört in MENSCHEN.md.
4. Zwei-Faktor: TOTP mit 6 Ziffern (Standard, nicht in Quelle) oder Passkey zuerst? Der Ablauf bei verlorenem Gerät fehlt.
5. Passwort vergessen: Gültigkeit des Links, Versuchsgrenzen und Mailtext fehlen.
6. Einladung: Route mit Token oder Zustand auf derselben Seite? Wer legt Rolle und Organisation fest (K-06)?
7. Gelten ALTCHA, Honigtopf und Ratenbegrenzung (K-07) auch für die Anmeldung? Die Quellen schweigen.
8. Mindestlänge und Regeln für neue Passwörter; die 6 Zeichen gelten bisher nur im Client.
9. Erscheint der öffentliche Header auf der Verwaltungsseite?
10. Die Datei 08 Dialoge und Zustaende.dc.html (Zeile 42) führt die Anmeldung als Zustand 01; der Abgleich steht aus.
11. Türkische und englische Fassungen der abgeleiteten Texte fehlen.
12. Aufbewahrungsfrist des audit_log und Löschfristen (G-07).
13. Logo auf der Seite: verfügbar nur als 40 × 40 px (00 Laufbuch.dc.html:231).

=== ENDE V00 · BEREIT ZUR RÜCKGABE ===
