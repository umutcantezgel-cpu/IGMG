# C01 Header (mit Sprachumschalter, Untermenüs, Telefonmenü, Kontomenü)

## SEITE
Header (Kopfzeile), Plan 02.1 (L:148), Kern-Version 1.0.

## ROUTE
Alle Seiten. Sprachpräfix nach K-02: de ohne, /tr und /en mit Präfix; Pfadnamen offen.

## QUELLEN
Nur gelesen. D = Header.dc.html (Script ab Zeile 144). B = Header.tsx, S = SimpleLanguageSwitcher.tsx, LC = LanguageContext.tsx (Namensraum header; tr = de + 258, en = de + 516), alle in uploads/igmg-wetzlar-website/src/app/components/. R = readme.md, L = 00 Laufbuch.dc.html.

## ZWECK
Kopfzeile aller Seiten: Startseite, vier Menügruppen, Sprachumschalter, Konto mit Meldung, Telefonmenü. Gestalt und deutscher Text nach D; fehlende Sprachfassungen nach B und LC.

## ABSCHNITTE
- Desktop ab 1240 px Komponentenbreite (D:184, abgeleitet): Logo D:18–21, Hauptnavigation D:22–42, Sprache D:44–55, Konto D:56–71; Höhe 80 px (D:17).
- Kompaktleiste darunter: Logo D:78–81, Menü-Schalter D:82; Höhe 72 px (D:77).
- Telefonmenü (Dialog, D:86–137): Kopf D:90–92, Sprache D:95–102, Navigation D:103–120, Anmeldung oder Konto D:121–133.
- Meldung: TicketDialog D:139–141. Konto-Menü bündelt Admin-Funktionen (L:278, D-13). Kürzel statt Flaggen (L:190, D-09).
- Eingebunden (eigene Blätter): LoginDialog D:60, D:123 (id-prefix hdr und hdr-m, demo-errors, on-login); TicketDialog D:140 (on-close); Icon D:29 (n, size).

Texte:

| Schlüssel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| brand | IGMG Wetzlar | wie de | wie de | D:20; B:123 |
| logo.aria; nav.aria | IGMG Wetzlar – Startseite; Hauptnavigation | – (nur DE in Quelle) | – (nur DE in Quelle) | D:18, 22; B:109 (abweichend), 128 |
| nav.home | Startseite | Ana Sayfa | Home | D:25; LC:15, 273, 531 |
| nav.groups | Moschee; Islam; Organisationen; Bildung | Cami; İslam; Organizasyonlar; Eğitim | Mosque; Islam; Organizations; Education | D:29; LC:22, 32, 38; B:372 |
| mo.items | Über uns; Vorstand; Projekt; Veranstaltungen; Neuigkeiten; Kontakt; IGMG | Hakkımızda; Yönetim; Proje; Etkinlikler; Haberler; İletişim; IGMG | About Us; Board; Project; Events; News; Contact; IGMG | D:34; LC:23–29 |
| is.items | Gebetszeiten; Quran; Wissen | Namaz Vakitleri; Kuran; Bilgi | Prayer Times; Quran; Knowledge | D:34, 106; LC:16, 33–35 |
| org.items | AT (Erwachsene); KT (Frauen); GT (Jugend); KGT (Frauenjugend) | AT (Yetişkinler); KT (Kadınlar); GT (Gençlik); KGT (Kadın Gençlik) | AT (Adults); KT (Women); GT (Youth); KGT (Women's Youth) | D:195–196; LC:40–55 |
| bi.items | Schüler-Voranmeldung; Korankurse; Islamunterricht | Öğrenci Ön Kayıt; Kuran Kursları; İslam Dersi | Student Pre-Registration; Quran Courses; Islamic Studies | D:198; B:384–408 |
| desc.moschee | Kommende Veranstaltungen und Events; Aktuelle Nachrichten und Ankündigungen; Kontaktinformationen und Anfahrt; Über den Dachverband IGMG | Yaklaşan etkinlikler ve organizasyonlar; Güncel haberler ve duyurular; İletişim bilgileri ve ulaşım; Üst kuruluş IGMG hakkında | Upcoming events and activities; Latest news and announcements; Contact information and directions; About the umbrella organization IGMG | D:149–155; B:192–231 |
| desc.islam | Tägliche Gebetszeiten und Kalender; Koran lesen und studieren; Islamisches Wissen und Lehre | Günlük namaz vakitleri ve takvim; Kuran okuma ve çalışma; İslami bilgi ve öğretim | Daily prayer times and calendar; Read and study the Quran; Islamic knowledge and teachings | D:149–155; B:257–283 |
| desc.bildung | Voranmeldung für Bildungsprogramme; Koran lernen für alle Altersgruppen; Grundlagen des Islam | Eğitim programları için ön kayıt; Her yaş için Kuran öğrenme; İslam'ın temelleri | Pre-registration for educational programs; Quran learning for all ages; Fundamentals of Islam | D:149–155; B:387–411 |
| desc.dach | Erfahren Sie mehr über unsere Gemeinde; Unser Vorstand und ehemalige Vorsitzende; Aktuelle Projekte und Initiativen; Veranstaltungen und Aktivitäten | – (nur DE in Quelle) | – (nur DE in Quelle) | D:146; B:164–313 |
| acc.login | Anmelden; Mein Konto (angemeldet); Angemeldet; (Angemeldet) | Giriş Yap; Hesabım; – (nur DE in Quelle) | Login; My Account; – (nur DE in Quelle) | D:57, 65, 128; LC:17, 74; B:921 |
| acc.items | Dashboard; Styleguide; Meldung; Mein Konto; Einstellungen; Abmelden | Panel; Styleguide; Bildirim; Hesabım; Ayarlar; Çıkış Yap | Dashboard; Styleguide; Report; My Account; Settings; Sign Out | D:209–211; LC:18–19, 74–76 |
| mob.labels | Menü; Menü öffnen; Navigation; Entdecken Sie unsere Gemeinde; Menü schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | D:82–92; B:610–617; L:266 |
| lang.head | Sprache auswählen; Weitere Sprachen in Kürze verfügbar | – (nur DE in Quelle) | Choose language; – (nur DE in Quelle) | D:48, 52; S:251–308 |
| lang.aria | Sprache ändern - Change Language | – (nur DE in Quelle) | in de enthalten | D:45; S:222 |
| lang.names | DE; TR; EN; Deutsch; Türkçe; English | wie de | wie de | D:158; S:22–36 |
| lang.group | Sprache / Dil / Language | wie de (fest) | wie de (fest) | D:96; B:624 |

## DATEN
Abgeleitet (Vorschlag): kein Datenbankinhalt im Kopf. Anmeldestatus aus der Sitzung (boolesch, nicht mehrsprachig). Optional Tabelle nav_items: key (Text, eindeutig), group (moschee/islam/organisationen/bildung), sort (Zahl), href (Routen-Schlüssel), published (boolesch); nicht mehrsprachig. Texte bleiben in messages/{de,tr,en}.json (K-02).

## FORMULARFELDER
– (entfaellt: Der Kopf hat keine eigenen Felder; Anmeldefelder stehen im LoginDialog, Bestand B:494–546.)

## INTERAKTIONEN
- Logo führt zu Home.dc.html (D:18); Telefon: Startseite (D:105) und Gebetszeiten (D:106) direkt.
- Menü-Schalter (D:29, D:109) öffnen oder schließen ihren Schlüssel; im Telefon klappt jede Gruppe einzeln auf (D:187).
- Sprache (D:45) setzt die Sprache (onLang oder intern) und schließt das Panel; das Telefonmenü bleibt offen (D:202–204).
- Konto (D:57) öffnet account bei angemeldet, sonst login (D:220); Anmelden setzt angemeldet (D:222).
- Konto-Einträge: Dashboard, Mein Konto und Einstellungen führen nach Dashboard.dc.html, Styleguide nach Styleguide.dc.html; Meldung öffnet ticket (D:206); Abmelden setzt none (D:205).
- Telefon-Schalter (D:82) öffnet mobile; Schließen (D:92) und Hintergrund (D:88) schließen es.
- Escape (D:170) schließt alles; Klick außerhalb (D:169) schließt Panels, nicht mobile und ticket.
- Hover: Hintergrund #EBF9F2; Schrift #065F46 nur bei der Hauptnavigation (D:25; D:34 nur Hintergrund).

## ZUSTAENDE
Data-props (D:144; Standard fett): lang **de**/tr/en; active **home**/leer/moschee/islam/organisationen/bildung; current Text, **home**; loggedIn **false**/true; open **none**/moschee/islam/organisationen/bildung/lang/login/account/mobile/ticket; demoErrors **false**/true (an LoginDialog); onLang Funktion (code), ohne Standard (D:177).
Intern (D:160, D:175–225): Breite w (Start 1440 px, D:161–167), open, loggedIn, lang, mg (Telefongruppen, Start: aktiver Bereich offen, D:187).
Konto: abgemeldet = Anmelde-Panel (D:58–62, Telefon D:121–125); angemeldet = Konto-Panel (D:63–70, D:126–133), grüner Punkt (D:57).
Sprache aktiv: Hintergrund #EBF9F2 und Haken (D:50, D:203); Telefon zusätzlich Rand 2 px #047857 (D:99, D:203). Schaltflächen mit lang (D:50, D:99).
Fehler: demoErrors (D:224). Erfolg: angemeldet (D:222). Leer und Schritt: – (entfaellt, keine Liste oder Schritte).
Bestand: Meldung (B:23, B:980–984); Anmeldefehler, Laden, Erfolg (B:32–80, B:553–557); Admin-Schalter nur angemeldet (B:433); Telefon offen oder zu (B:606).

## BILDER
- assets/logo-igmg-wetzlar.png: 40×40 px, alt leer (D:19, D:79); auch AT (D:145, D:195). Bestand h-12 = 48 px (B:120).
- assets/logo-kadin.png (KT), logo-genclik.png (GT), logo-kadin-genclik.png (KGT): 32×32 px, Rand #DFDAD2, Radius 4 (D:34, D:145, D:195–196). Bestand ohne Logos.
- Icons: chevron-down/up (16 px Kopf, 20 px Telefon), globe, check, user, layout-dashboard, settings, message-square, log-out (20 px), menu und x (24 px) (D:29–211).

## AUFFAELLIGKEITEN
1. Menü-Schwelle: Design 1240 px (D:184; L:185), readme.md:25 nennt 1200 px, Bestand bricht bei lg = 1024 px (B:128).
2. L:148 nennt „admin“, D:144 nicht; „ticket“ fehlt in L:148.
3. Organisationen: Bestand mit Überschrift und Link „Veranstaltungen“ (LC:41; B:312), ohne Logo; Design mit einem Link, Name und Logo (D:195–196).
4. Telefonmenü: Bestand ohne Islam-Gruppe und ohne Ziele für Veranstaltungen, Neuigkeiten, Kontakt, IGMG (B:662–720), Anmeldung als Akkordeon (B:809); Design angeglichen (L:67; D:103–125).
5. Sprachfassungen: Bestand schreibt Beschreibungen fest deutsch (B:164, 173, 182, 313); der ungenutzte Schlüssel mobileMenuDescription (LC:20, 278, 536) hat einen anderen Satz.
6. Bedienungshilfen: Logo-aria englisch im Bestand (B:109), deutsch im Design (D:18); Bestand header und h1 (B:100, 123), Design div und span (D:15, 20).

## OFFENE FRAGEN
1. Gilt die Schwelle 1240 px (D:184) oder 1200 px (R:25)?
2. Ist „admin“ (L:148) ein Zustand oder zu streichen?
3. Welcher Untertitel gilt im Telefonmenü: „Entdecken Sie unsere Gemeinde“ (D:91) oder „Navigation für IGMG Wetzlar“ (LC:20)?
4. Wer liefert die TR/EN-Fassungen der mit „– (nur DE in Quelle)“ markierten Texte?
5. Welche lokalisierten Pfadnamen (K-02) ersetzen die Dateinamen der Linkziele?
6. Gelten Pfeiltasten, Fokusfalle im Telefonmenü und Fokusrückgabe? Der Design-Code setzt nichts davon.
7. Bleibt der Kopf beim Scrollen fixiert (B:100, sticky) oder relativ (D:15)?
8. Zeilenhöhe 1,5 (D:15) oder 1,6 (R:19)?
9. Woher kommt der Anmeldestatus, und wer sieht Meldung und Styleguide?
10. Sind „Mein Konto“ und „Einstellungen“ eigene Seiten (L:251), und ist die doppelte Nennung „Mein Konto“ (D:65, D:210) gewollt?

=== ENDE C01 · BEREIT ZUR RÜCKGABE ===
