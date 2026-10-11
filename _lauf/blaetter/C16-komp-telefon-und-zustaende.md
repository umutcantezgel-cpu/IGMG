C16 · Kundschafter · Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Komponentenblatt „Telefonansicht und Zustandskatalog (09 Telefon, 08 Dialoge und Zustaende)“ · Schwierigkeit 1

## SEITE
Telefonansicht und Zustandskatalog (09 Telefon, 08 Dialoge und Zustaende).

## ROUTE
Alle Seiten bei 390 px: Rahmen 09.1–09.5 und Zustand 06 (08:23).

## QUELLEN
09 = 09 Telefon.dc.html · 08 = 08 Dialoge und Zustaende.dc.html · LB = 00 Laufbuch.dc.html (D-04, D-05, D-16) · RM = readme.md · H = Header.tsx · UM = use-mobile.ts · LC = LanguageContext.tsx · SLS = SimpleLanguageSwitcher.tsx · LD = LoginDialog.tsx · Bestandspfade app/components/, CSS = styles/globals.css. Nicht gelesen: eingebundene Seiten, TicketDialog, DisclaimerDialog, Dashboard. Header- und Leistentexte: C01 (Zeilen 26–44), C02 (Zeilen 41–54). Canvas-Navigationszeilen (Bereich 09/08) nicht übernommen.

## ZWECK
Prüfvorlage für fünf Telefonrahmen und 18 Zustände; Textschlüssel de/tr/en.

## ABSCHNITTE
Rahmen (Bausteine nach LB 153–168; Ausnahmen D-16, LB 281):

| Nr | Titel | Datei | Bausteine | Fundort |
|---|---|---|---|---|
| 09.1 | Startseite | Home.dc.html | Header, Leiste, Footer, EventCard, NewsCard; ohne Breadcrumbs | 09:19 |
| 09.2 | Gebetszeiten | PrayerTimes.dc.html | Header, Breadcrumbs, PageHeader, Footer; ohne Leiste | 09:20 |
| 09.3 | Veranstaltungen | Events.dc.html | Header, Leiste, Breadcrumbs, PageHeader, EventCard, Footer | 09:21 |
| 09.4 | Veranstaltungsdetails | EventDetails.dc.html | Header, Leiste, Breadcrumbs, Footer | 09:22 |
| 09.5 | Schüler-Voranmeldung | StudentRegistration.dc.html | Formularfelder, Fortschritt | 09:23 |

Rahmen: 390 × 844 px, Rand 8 px #1D1A17, Radius 32 px, Fläche #FCFAF6, scrollt (09:19–23). Titel nur DE in Quelle.

Regeln:
- Breakpoints: 768 px: UM 3, 11, 13; CSS 500–509 (html 14 px). 900 px: keine Fundstelle (08:44 nur Rahmenhöhe). 1024 px (lg, abgeleitet): H 128, 608. 1200 px: RM 25; CSS 511–515 (html 18 px). 1240 px: LB 185, 215 (Komponentenbreite).
- Raster: 4 Spalten, Rand 16 px (RM 25); auto-fit, flex-wrap (LB 186); Tabellen in Scroll-Boxen (LB 215).
- Menü: sichtbarer Button „Menü“ (LB 185); Sheet rechts, ab 640 px 320 px breit (H 613); Gruppen aufklappbar (H 660–970).

Texte (A2):

| Schluessel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| canvas | Die Seiten sind eingebunden, nicht nachgebaut. Jeder Rahmen scrollt; Header, Gebetszeiten-Leiste und Inhalte schalten über ihre eigene Breite auf das Telefon-Layout. Jeder Zustand ist eine Eigenschaft der genannten Datei und hier eingebunden (Seiten auf 50 % verkleinert). Fundort steht unter jedem Rahmen. | – (nur DE in Quelle) | – (nur DE in Quelle) | 09:17; 08:17 |
| canvas.h1 | Telefon · 390 px (5); Dialoge und Zustände (18) | – (nur DE in Quelle) | – (nur DE in Quelle) | 09:17; 08:17 |
| login | Anmelden · Melden Sie sich in Ihrem Konto an · E-Mail · Passwort · Ihr Passwort | Giriş Yap · Hesabınıza giriş yapın · E-posta · Şifre · Şifreniz | Login · Sign in to your account · Email · Password · Your password | LC 61–68; 319–326; 577–584 |
| login.err | E-Mail ist erforderlich · Ungültige E-Mail-Adresse · Passwort ist erforderlich · Passwort muss mindestens 6 Zeichen haben | E-posta gerekli · Geçersiz e-posta adresi · Şifre gerekli · Şifre en az 6 karakter olmalı | Email is required · Invalid email address · Password is required · Password must be at least 6 characters | LC 65–70; 323–328; 581–586 |
| login.submit | Anmelden · Passwort vergessen? | Giriş Yap · Şifrenizi mi unuttunuz? | Sign In · Forgot password? | LC 71, 77; 329, 335; 587, 593; H 570 |
| ui.new | Weiter · Zurück · (Pflichtfeld) · Bitte füllen Sie die markierten Pflichtfelder aus. · Schritt x von n · Kontaktdaten · Motivation · Senden · Geschlossen · Beispielinhalt | – (nur DE in Quelle) | – (nur DE in Quelle) | LB 279, 299, 300 (neu) |

## DATEN
Vorschlag (A7): Veranstaltungen: Titel Text ja (DE Pflicht, TR/EN mit Rückfall auf DE); Datum Datum nein; Uhrzeit Text nein; Ort Text ja; Kategorie Auswahl ja. Nachrichten: Titel, Teaser, Text ja; Datum nein. Gebetszeiten: Zeiten Uhrzeit nein. Formulareingaben: personenbezogen, nicht öffentlich, besonders schutzwürdig (Auftrag).

## FORMULARFELDER
Login (H 494–560): E-Mail (Pflicht, Format; LC 65–66), Passwort (mind. 6 Zeichen, LC 70; Sichtbarkeitsschalter H 534). Platzhalter: Beispielwert (LC 64, 322, 580). Schüler-Voranmeldung (4 Schritte), Mitglied werden (3), Webseite für Ihre Moschee (3): Fortschritt, „(Pflichtfeld)“, Fehler am Feld, Zusammenfassung (LB 279).

## INTERAKTIONEN
- Menü öffnet das Sheet (H 606–613).
- Login: Absenden sperrt Felder, Ladezustand (H 71–80, 506, 525, 553); Fehler als role=alert (H 510, 544, 847, 882); K-11 verlangt aria-describedby.
- Konto-Links Mein Konto, Einstellungen, Passwort vergessen? ohne Ziel (H 563–591; LB 251).

## ZUSTAENDE
| Nr (Fundort) | Zustand (nur DE in Quelle) | Datei: Eigenschaften |
|---|---|---|
| 01 (08:42) | Anmeldung (abgemeldet) | Header: open=login, logged-in=false, lang=de |
| 02 (08:43) | Angemeldet mit Kontomenü | Header: open=account, logged-in=true, lang=de |
| 03 (08:44) | Meldung erstellen (TicketDialog) | Header: open=ticket, logged-in=true, lang=de |
| 04 (08:22) | Konzept-Hinweis Deutsch und Türkisch | DisclaimerDialog: ohne Eigenschaft |
| 05 (08:45) | Sprachumschalter offen | Header: open=lang, lang=tr, logged-in=false |
| 06 (08:23) | Telefonmenü offen | Header: open=mobile, 390 px, active=islam, current=prayer-times |
| 07 (08:48) | Leerzustand Veranstaltungen | Events: state=leer |
| 08 (08:49) | Leerzustand Nachrichten | News: state=leer |
| 09 (08:51) | Schüler-Voranmeldung – Fehler | StudentRegistration: state=fehler |
| 10 (08:51) | Schüler-Voranmeldung – Erfolg | StudentRegistration: state=erfolg |
| 11 (08:51) | Mitglied werden – Fehler | JoinUs: state=fehler |
| 12 (08:51) | Mitglied werden – Erfolg | JoinUs: state=erfolg |
| 13 (08:51) | Webseite für Ihre Moschee – Fehler | MosqueRequest: state=fehler |
| 14 (08:51) | Webseite für Ihre Moschee – Erfolg | MosqueRequest: state=erfolg |
| 15 (08:53) | Dashboard-Dialog Neuigkeit | Dashboard: section=news, dialog=neuigkeit |
| 16 (08:54) | Dashboard-Dialog Veranstaltung | Dashboard: section=events, dialog=veranstaltung |
| 17 (08:55) | Dashboard-Dialog Ankündigung | Dashboard: section=announcements, dialog=ankuendigung |
| 18 (08:56) | Dashboard-Dialog Ticket | Dashboard: section=tickets, dialog=ticket |

Eigenschaften (Default: keine Quelle):
- Header: open = none/moschee/islam/organisationen/bildung/lang/login/account/admin/mobile (LB 148), 08 zusätzlich ticket (08:44); lang = de/tr/en; logged-in = true/false; active, current ohne Liste (08:20, 23).
- Events, News: state = liste/leer (LB 156, 158). StudentRegistration, JoinUs, MosqueRequest: state = formular/fehler/erfolg (LB 168, 173, 174).
- Dashboard: section = news/events/announcements/tickets; dialog = neuigkeit/veranstaltung/ankuendigung/ticket (08:53–56; LB 175).

Bestand: Login leer, Fehler (H 40–62), lädt (H 71–80), angemeldet (H 22, 76, 575–600), Passwort sichtbar (H 32); Telefonmenü zu/offen (H 606–613); Ticket (H 23, 454); Sprachschalter (SLS 56).

## BILDER
- Logo: h-12, alt „IGMG Wetzlar Logo“ (H 117–121); nur 40 × 40 px vorhanden (LB 231).
- Fotos: beschriftete Platzhalterflächen (RM 22; LB 233).

## AUFFAELLIGKEITEN
1. Menü-Umbruch: 1200 px (RM 25), 1240 px Komponentenbreite (LB 185, 215), Viewport lg 1024 px (H 128, 608); 900 px ohne Fundstelle.
2. Design verlangt eigene Breite (09:17; LB 71, 186); Bestand schaltet über Viewport (H 101, 128, 608; UM 11–13): im 390-px-Rahmen erscheint die Hauptnavigation (LB 71).
3. CSS 500–502 setzt auf dem Telefon html auf 14 px: Text unter 16 px, text-sm 12,25 px (abgeleitet); RM 19 und K-11 verlangen 16 px.
4. Telefonmenü: sichtbares „Menü“ fehlt (LB 185, 266; Bestand nur Icon, H 608–611); mobile Moschee-Gruppe ohne Ziele für Events, News, Kontakt und ohne IGMG (H 693–705; Desktop H 229).
5. 08:42 nennt LoginDialog.dc.html; LD ist leer (LD 1–2), Anmeldung steht im Header (H 464–603).
6. Sprachschalter mit Flaggen (SLS 23–37, 78–82) statt Kürzel (LB 190); mobiler Trigger h-10 (SLS 135) etwa 35 px (abgeleitet), unter 48 px (RM 21); Texte im Code gegen K-02 (H 615, 617, 624).

## OFFENE FRAGEN
1. Welcher Menü-Umbruch gilt, und zählt Komponentenbreite oder Viewport?
2. Texte der eingebundenen Seiten, Formulare und Dialoge (03, 04, 07, 08, 15–18) fehlen hier; sie gehören in die Blätter der jeweiligen Komponenten.
3. Defaults der Eigenschaften fehlen; open=ticket (08:44) steht nicht in LB 148.
4. Zustand 02: D-13 (LB 278) legt Admin-Funktionen ins Kontomenü fest; der Bestand hat einen eigenen Button (H 433–461).
5. Admin-Dashboard stürzt im Code ab (LB 239).

=== ENDE C16 · BEREIT ZUR RÜCKGABE ===
