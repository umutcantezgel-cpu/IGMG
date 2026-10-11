# V00 · Anmeldung (Verwaltung)

V00 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Schwierigkeit 1

## SEITE

Anmeldung des Verwaltungsmoduls mit Zwei-Faktor-Schritt, Passwort-vergessen-Ablauf und Einladung annehmen. Die Anmeldung hat Design (LoginDialog.dc.html); die drei übrigen Abläufe sind ABGELEITET. Kein eigenes Artboard im Laufbuch; der Dialog steht unter „02.x Weitere Bausteine“ (00 Laufbuch.dc.html:276).

## ROUTE

- Ziel: /verwaltung/anmelden (Auftrag, ABGELEITET).
- In den Quellen nur als Header-Dropdown: Desktop (HD:57–62; HT:464–603), mobil im Login-Akkordeon (HT:809–969).
- Nach Erfolg kein Ziel: LD:68 ruft nur onLogin, HT:76 setzt nur den Zustand.

## QUELLEN

Abkürzungen: LD = LoginDialog.dc.html, HD = Header.dc.html, HT = Header.tsx, LC = LanguageContext.tsx.

- Design, vollständig: LD (Template 9–48, Skript 49–85), HD (Template 9–143, Skript 144–228). Icon.dc.html nicht gelesen.
- Bestand: LoginDialog.tsx (nur Stub, Zeilen 1–2), HT (vollständig), LC (Header-Schlüssel de 14–79, tr 272–337, en 530–595).
- Hilfen: readme.md; 00 Laufbuch.dc.html (Zeilen 148, 185, 231, 251, 276, 278, 299, 309).
- Gegengeprüft: Zweite Bestandskopie identisch (cmp). Suche nach Zwei-Faktor, TOTP, Passkey und Einladung ohne Ablauf-Treffer; einzige Spur ui/input-otp.tsx, im gesamten Bestand ohne Verwendung. Nicht ausgewertet: 08 Dialoge und Zustaende.dc.html (Zeile 42).

## ZWECK

Ehrenamtliche mit Rolle (Administration, Redaktion, Organisationsredaktion, Bildung, Mitgliederverwaltung) melden sich an (K-06). Zwei-Faktor per TOTP oder Passkey ist Pflicht; Konten entstehen nur per Einladung, daher kein Registrierungslink (K-06). Formulardaten sind besonders schutzwürdig (G-07). Personennamen und religiöse Texte kommen nicht vor (A5, A6).

## ABSCHNITTE

Aufbau: 1 bis 3 designt, 4 bis 6 ABGELEITET.

1. Kopf mit Titel und Untertitel (LD:17–18); die Seite braucht eine Hauptüberschrift statt h2 (ABGELEITET).
2. Formular (LD:20–43): E-Mail (22–30), Passwort mit Sichtbarkeits-Schalter (32–40), Absenden (42).
3. Trennlinie mit „Passwort vergessen?“ (44–46), ohne Ziel.
4. ABGELEITET, Schritt 2 Zwei-Faktor: Code oder Passkey. Basis ui/input-otp.tsx (Paket input-otp@1.4.2, Zeile 4), im Bestand ungenutzt.
5. ABGELEITET, Passwort vergessen: E-Mail, Absenden, neutrale Bestätigung, Rückweg.
6. ABGELEITET, Einladung annehmen: Passwort festlegen, Zwei-Faktor einrichten, Fehlerseite bei ungültigem Link.

Komponenten: LoginDialog (dc-import, idPrefix, onLogin); Icon mail, circle-alert, lock, eye, eye-off, log-in, key-round (LD:24–45); Bestand ui/button, ui/input, ui/label (HT:2, 5, 6).

Gestalt: Text 18 px, Zeilenhöhe 1,5 (LD:15; readme.md:19 nennt 1,6). Felder 48 px hoch, Radius 8 px, Rand #8C857C, Fehlerrand 2 px #AF2B25 (LD:25, 77–78). Fehlertext 16 px, role=alert (LD:28, 39). Absenden #047857 (LD:42). Panel 380 px (HD:59), Bestand 320 px (HT:486).

Texte (A2): Je Zeile de, tr, en; Design und Bestand stimmen überein (verglichen). Keine Großschreibungs-Umwandlung (readme.md:15). Der E-Mail-Platzhalter heißt „Beispielwert“ (LD:51–53; LC:64, 322, 580); die Adresse steht nicht im Blatt (A5).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| anmelden.titel | Anmelden | Giriş Yap | Login | LD:51–53; LC:61, 319, 577 |
| anmelden.untertitel | Melden Sie sich in Ihrem Konto an | Hesabınıza giriş yapın | Sign in to your account | LD:51–53; LC:62, 320, 578 |
| anmelden.email | E-Mail | E-posta | Email | LD:51–53; LC:63, 321, 579 |
| anmelden.email.pflicht | E-Mail ist erforderlich | E-posta gerekli | Email is required | LD:51–53; LC:65, 323, 581 |
| anmelden.email.ungueltig | Ungültige E-Mail-Adresse | Geçersiz e-posta adresi | Invalid email address | LD:51–53; LC:66, 324, 582 |
| anmelden.passwort | Passwort | Şifre | Password | LD:51–53; LC:67, 325, 583 |
| anmelden.passwort.platzhalter | Ihr Passwort | Şifreniz | Your password | LD:51–53; LC:68, 326, 584 |
| anmelden.passwort.pflicht | Passwort ist erforderlich | Şifre gerekli | Password is required | LD:51–53; LC:69, 327, 585 |
| anmelden.passwort.kurz | Passwort muss mindestens 6 Zeichen haben | Şifre en az 6 karakter olmalı | Password must be at least 6 characters | LD:51–53; LC:70, 328, 586 |
| anmelden.absenden | Anmelden | Giriş Yap | Sign In | LD:51–53; LC:71, 329, 587 |
| anmelden.passwort_vergessen | Passwort vergessen? | Şifrenizi mi unuttunuz? | Forgot password? | LD:51–53; LC:77, 335, 593 |
| anmelden.passwort_sichtbar | Passwort anzeigen / Passwort verbergen | – (nur DE in Quelle) | – (nur DE in Quelle) | LD:80; HT:534, 872 |
| header.anmelden | Anmelden | Giriş Yap | Login | HD:148, 151, 154; LC:17, 275, 533 |
| header.angemeldet | Angemeldet | – (nur DE in Quelle) | – (nur DE in Quelle) | HD:57 (sr-only), 65, 128; HT:921 |
| konto.dashboard | Dashboard | Panel | Dashboard | HD:148, 151, 154; LC:18, 276, 534 |
| konto.styleguide | Styleguide | Styleguide | Styleguide | HD:209; HT:450, 942 (fest) |
| konto.meldung | Meldung | Bildirim | Report | HD:148, 151, 154; LC:19, 277, 535 |
| konto.mein_konto | Mein Konto | Hesabım | My Account | HD:150, 153, 156; LC:74, 332, 590 |
| konto.einstellungen | Einstellungen | Ayarlar | Settings | HD:150, 153, 156; LC:75, 333, 591 |
| konto.abmelden | Abmelden | Çıkış Yap | Sign Out | HD:150, 153, 156; LC:76, 334, 592 |

Abgeleitete Texte (Vorschläge, kein Design; tr und en offen; Vorbild 00 Laufbuch.dc.html:299):

- zwei.titel „Zwei-Faktor-Bestätigung“, zwei.code „Code aus Ihrer Authentifizierungs-App“, zwei.passkey „Mit Passkey bestätigen“ (K-06).
- zwei.fehler „[Fehlertext Zwei-Faktor]“, anmelden.fehler „[Fehlertext Anmeldung]“ (Platzhalter).
- reset.titel „Passwort vergessen“ (Link LD:45), reset.hinweis „Wenn zu dieser E-Mail-Adresse ein Konto besteht, senden wir einen Link zum Zurücksetzen.“ (neutral), reset.senden „Link senden“, reset.zurueck „Zurück zur Anmeldung“.
- einladung.titel „Einladung annehmen“ (K-06), einladung.absenden „Konto anlegen“, einladung.fehler „[Fehlertext Einladung]“.

## DATEN

ABGELEITET, Vorschlag (A7): Die Daten kommen aus der Datenbank (PostgreSQL mit Drizzle, K-05). Alle Felder sind nicht mehrsprachig; Bedientexte liegen im Code.

- konto: id (uuid), e-mail (text, eindeutig), passwort_hash (text), rolle (enum: administration, redaktion, organisationsredaktion, bildung, mitgliederverwaltung), organisation (Bezug), angelegt_am und letzte_anmeldung (timestamptz, UTC; Anzeige Europe/Berlin).
- zwei_faktor: totp_geheimnis (text, verschlüsselt), passkey (credential_id text, public_key bytea, zaehler integer).
- einladung: token_hash (text), e-mail (text), rolle (enum), organisation (Bezug), ablauf (timestamptz), eingeladen_von (Bezug konto).
- passwort_reset: token_hash (text), konto (Bezug), ablauf (timestamptz).
- audit_log: konto (Bezug), ereignis (enum), zeitpunkt (timestamptz, UTC); jeder Zugriff auf Personendaten wird protokolliert (G-07).
- Löschen entfernt Datensätze endgültig (K-05).

## FORMULARFELDER

1. E-Mail: type email, autoComplete email; Pflicht per Skript, ohne required-Attribut. Nach dem Trimmen (LD:64): leer ergibt emailReq, ungültiges Muster emailInv (LD:65). Bestand ohne Trimmen (HT:44–50).
2. Passwort: type password oder text über den Schalter, autoComplete current-password; unter 6 Zeichen ergibt pwMin (LD:66; HT:52–58).
3. ABGELEITET: Zwei-Faktor-Code (6 Ziffern, Standard TOTP, nicht in Quelle); neues Passwort (Mindestlänge offen); Honigtopf-Feld und ALTCHA (K-07, Position offen).

## INTERAKTIONEN

- Tippen in ein Feld entfernt dessen Fehler (LD:72–73; HT:83–89).
- Absenden verhindert die Standardaktion, prüft beide Felder und zeigt Fehler am Feld (LD:62–67). Erfolg leert die Felder und ruft onLogin (LD:68).
- Der Bestand simuliert die Anmeldung mit 1000 ms Verzögerung ohne Serverprüfung (HT:74–80); nicht übernehmen.
- Schalter „Passwort anzeigen“ wechselt Typ und Symbol (LD:36, 79–81).
- „Passwort vergessen?“ hat keinen Ablauf (LD:45; HT:570, 908; 00 Laufbuch.dc.html:251). ABGELEITET: öffnet den Ablauf Passwort vergessen.
- Weder Design noch Bestand setzen den Fokus; ABGELEITET: Fokus auf das erste fehlerhafte Feld (K-07).
- Escape und Klick außerhalb schließen das Header-Dropdown (HD:169–170).

## ZUSTAENDE

Eigenschaften aus data-props (A3):

- LoginDialog (LD:49): lang = de, tr, en (Standard de); demoErrors = Wahrheitswert (Standard false; nur Vorschau, LD:60); idPrefix = Text (Standard login, LD:61); onLogin = Funktion ohne Argument.
- Header (HD:144): lang = de, tr, en (Standard de); active = leer, home, moschee, islam, organisationen, bildung (Standard home); current = Text (Standard home); loggedIn = Wahrheitswert (Standard false); open = none, moschee, islam, organisationen, bildung, lang, login, account, mobile, ticket (Standard none); demoErrors = Wahrheitswert (Standard false); onLang = Funktion mit Sprachcode.

Zustände aus Design und Bestand:

- leer (LD:56); Fehler: E-Mail leer oder ungültig, Passwort leer oder unter 6 Zeichen (LD:51–53, 64–66).
- Passwort sichtbar oder verborgen (LD:79–80; HT:520, 534).
- Erfolg: Felder leer, Callback, kein Erfolgstext (LD:68).
- Laden, nur Bestand: Felder deaktiviert, Spinner (HT:506, 525, 551–557).
- angemeldet oder abgemeldet (HD:180, 219–223; HT:22, 433).
- Sprache de, tr, en (LD:58–59).
- ABGELEITET: Schritt 1 Anmeldung und Schritt 2 Zwei-Faktor (weder Design noch Bestand); Fehler bei falschen Zugangsdaten, falschem Code und abgelaufener Einladung (Platzhalter).

## BILDER

Keine Bilder im Formular, nur Icons (LD:24). Das Logo steht nur im Header: assets/logo-igmg-wetzlar.png, 40 × 40 px, weißer Grund (HD:19, 79; 00 Laufbuch.dc.html:231). Für die Seite ist kein Logo festgelegt.

## AUFFAELLIGKEITEN

1. Die Anmeldung im Bestand ist eine Simulation: lokaler Zustand, 1000 ms Verzögerung, keine Serverprüfung (HT:21–22, 74–80). Nicht übernehmen.
2. Bestand-LoginDialog.tsx ist nur ein Stub (Zeilen 1–2); die Anmeldung steckt in HT, das Design führt LoginDialog als eigene Komponente (HD:60, 123).
3. Kontomenü: Bestand trennt den Admin-Button mit Styleguide und Meldung (HT:432–461) vom Dropdown (HT:574–601); das Design vereint alle Einträge (HD:209–211; 00 Laufbuch.dc.html:278, D-13). Mobil fehlen im Bestand Mein Konto und Einstellungen (HT:926–963); auf dem Desktop haben beide dort keinen Handler (HT:584–591). Das Design verlinkt sie vorläufig auf Dashboard.dc.html (HD:210).
4. Umbruch: Design ab 1240 px Komponentenbreite (HD:184; 00 Laufbuch.dc.html:185); Bestand ab 1024 px (HT:128, 608) und Login-Button ab 640 px (HT:469). Zwischen 640 und 1023 px zeigt der Bestand beides.
5. Fokus: K-07 verlangt Fokus auf die Rückmeldung; kein Design- oder Bestandsteil setzt ihn (keine focus-Aufrufe in LD, HD, HT).
6. Passwort vergessen? hat im Design und im Bestand keinen Ablauf (LD:45; HT:570, 908; 00 Laufbuch.dc.html:251).
7. Formular: Design mit noValidate und autoComplete (LD:20, 25, 35); Bestand ohne beides und ohne Trimmen (HT:494, 499–526).
8. Die Laufbuch-Liste nennt open=admin (00 Laufbuch.dc.html:148), das Design hat ticket (HD:144).

## OFFENE FRAGEN

1. Soll der Header-Dropdown auf /verwaltung/anmelden verweisen oder denselben Dialog zeigen?
2. Wohin führt die Anmeldung? Kandidat: Dashboard.dc.html (Admin Dashboard, Zeile 21, nur per Suche gefunden), mit Rollenprüfung nach K-06.
3. Fehlertext bei falschen Zugangsdaten: neutral, ohne Hinweis auf Konten (Vorschlag). Bis dahin [Fehlertext Anmeldung]; Eintrag in MENSCHEN.md.
4. Zwei-Faktor: TOTP mit 6 Ziffern oder Passkey zuerst? Ablauf bei verlorenem Gerät fehlt.
5. Passwort vergessen: Linkgültigkeit, Versuchsgrenzen, Mailtext.
6. Einladung: Route mit Token oder Zustand auf derselben Seite; wer legt Rolle und Organisation fest (K-06)?
7. Gelten ALTCHA, Honigtopf und Ratenbegrenzung (K-07) für die Anmeldung? Die Quellen schweigen.
8. Passwortregeln: Die 6 Zeichen gelten bisher nur im Client; Serverregel offen.
9. Erscheint der öffentliche Header auf der Verwaltungsseite?
10. 08 Dialoge und Zustaende.dc.html (Zeile 42) führt die Anmeldung als Zustand 01; Abgleich offen.
11. Türkische und englische Fassungen der abgeleiteten Texte fehlen.
12. Aufbewahrungsfrist des audit_log und Löschfristen (G-07).

=== ENDE V00 · BEREIT ZUR RÜCKGABE ===
