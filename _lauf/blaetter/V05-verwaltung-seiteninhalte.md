# V05 · Verwaltung: Seiteninhalte

V05 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0

## SEITE

Verwaltung: Seiteninhalte (Über uns, Vorstand, Projekte, Organisationen, Kontaktdaten, Spendenangaben). Kein Artboard; ABGELEITET aus den Seiten unten und dem Muster Dashboard.dc.html.

## ROUTE

/verwaltung/seiteninhalte, nur für Rollen mit Recht (K-06). Zielseiten: AboutUs, BoardMembers, Projects, OrganizationPage (org = at, kt, gt, kgt), Contact, Footer. Lokalisierte Pfade offen (K-02).

## QUELLEN

Design (nur gelesen): AboutUs, BoardMembers, Projects, OrganizationPage, Contact, Footer, Dashboard (Muster); readme.md; 00 Laufbuch.dc.html. Bestand (nur gelesen): AboutUs.tsx, BoardMembers.tsx, Projects.tsx, AnatolianOrganization.tsx, Contact.tsx, Footer.tsx. Nur für Übersetzungen: LanguageContext.tsx sowie die Kopfzeilen von WomensOrganization.tsx, YouthOrganization.tsx, WomensYouthOrganization.tsx. Fundstellen: Datei:Zeile.

## ZWECK

Verwaltung pflegt Über uns, Vorstand, Projekte mit Spendenangaben, Organisationen (AT, KT, GT, KGT) und Kontaktdaten mit Footer. Deutsch ist Pflicht; Türkisch und Englisch sind optional mit Rückfall auf Deutsch (K-02). Inhalte: Entwurf, Veröffentlicht, Papierkorb (30 Tage); Personendaten echt löschen (K-05).

## ABSCHNITTE

Aufbau in Designreihenfolge:

- Über uns (AboutUs.dc.html:15-84): Seitenkopf, Geschichte mit Foto, Zeitleiste (5), Gebet, Gemeinschaft, Einheit, Werte (4), Aufruf.
- Vorstand (BoardMembers.dc.html:15-45): Seitenkopf, Aktueller Vorstand (6), Unsere Vorsitzenden (12), Dank.
- Projekte (Projects.dc.html:15-89): Seitenkopf, Hauptprojekt mit 3D-Platzhalter, Spenden, Spezifikationen, Unterstützen, Meilensteine (6).
- Organisationen (OrganizationPage.dc.html:15-89): Vorlage für vier Seiten mit org-Schlüssel: Kopf mit Logo, Über, Mission, Vision, Aktivitäten (4), Veranstaltungen, Nachrichten, Kontakt.
- Kontaktdaten (Contact.dc.html:15-70; Footer.dc.html:15-66): Seitenkopf, Adresse, Kontaktdaten, Öffnungszeiten, Notfall, Anfahrt (3), Kartenplatzhalter, Angebote (8), Besucher; Footer mit Beschreibung, Social, Kontakt, Öffnungszeiten, Schnellzugriff (6).

Komponenten (dc-import, nur genannt; AboutUs.dc.html:16-20,84; BoardMembers.dc.html:25,35; OrganizationPage.dc.html:85): Header (active=moschee), PrayerTimesBar, Breadcrumbs (label), PageHeader (eyebrow, title, subtitle), PersonCard (variant=board, leader), OrgCard (org), Footer, Icon.

Tabelle: Auswahl kurzer Texte mit Übersetzung (A2; Lücken: AUFFAELLIGKEITEN).

| Schlüssel | de | tr | en | Fundstelle |
| --- | --- | --- | --- | --- |
| ueber.titel | Über uns | Hakkımızda | About Us | AboutUs.dc.html:20;LanguageContext.tsx:210/468/726 |
| ueber.untertitel | Die Geschichte der IGMG Fatih Camii Wetzlar | IGMG Fatih Camii Wetzlar'ın Hikayesi | The Story of IGMG Fatih Camii Wetzlar | AboutUs.dc.html:20;LanguageContext.tsx:211/469/727 |
| ueber.geschichte | Fatih Camii - Von der Vergangenheit bis heute | Fatih Camii - Geçmişten bugüne | Fatih Camii - From Past to Present | AboutUs.dc.html:24;LanguageContext.tsx:213/471/729 |
| ueber.gemeinschaft | Gebet, Gemeinschaft, Einheit | Dua, Topluluk, Birlik | Prayer, Community, Unity | AboutUs.dc.html:54;LanguageContext.tsx:220/478/736 |
| ueber.werte | Unsere Werte | Değerlerimiz | Our Values | AboutUs.dc.html:63;LanguageContext.tsx:233/491/749 |
| vorstand.aktuell | Aktueller Vorstand | Mevcut Yönetim | Current Board | BoardMembers.dc.html:23;LanguageContext.tsx:264/522/780 |
| vorstand.vorsitz | Unsere Vorsitzenden | Başkanlarımız | Our Leaders | BoardMembers.dc.html:31;LanguageContext.tsx:252/510/768 |
| vorstand.dank | Dankbarkeit und Anerkennung | Şükran ve Takdir | Gratitude and Recognition | BoardMembers.dc.html:39;LanguageContext.tsx:255/513/771 |
| projekte.titel | Gemeinsam Glauben, Gemeinsam Wachsen | Birlikte İnanıyoruz, Birlikte Büyüyoruz | Together We Believe, Together We Grow | Projects.dc.html:20;Projects.tsx:30/111/192 |
| projekte.untertitel | Unsere aktuellen Bauprojekte und Initiativen | Güncel inşaat projelerimiz ve girişimlerimiz | Our current construction projects and initiatives | Projects.dc.html:20;Projects.tsx:28/109/190 |
| projekte.status | In Planung | Planlamada | In Planning | Projects.dc.html:27;Projects.tsx:34/115/196 |
| projekte.spenden | Die Bedeutung von Spenden | Bağışların Önemi | The Importance of Donations | Projects.dc.html:42;Projects.tsx:39/120/201 |
| projekte.support | Unterstützen Sie uns | Destek Olun | Support Us | Projects.dc.html:66;Projects.tsx:46/127/208 |
| projekte.btn | Jetzt Spenden | Bağış Yap | Donate Now | Projects.dc.html:51;Projects.tsx:102/183/264 |
| org.titel.at | Ana Teşkilatı | Ana Teşkilatı | Anatolian Organization | OrganizationPage.dc.html:96;AnatolianOrganization.tsx:29/127/225 |
| org.titel.kt | Kadın Teşkilatı | Kadın Teşkilatı | Women's Organization | OrganizationPage.dc.html:104;WomensOrganization.tsx:35/133/231 |
| org.titel.gt | Gençlik Teşkilatı | Gençlik Teşkilatı | Youth Organization | OrganizationPage.dc.html:112;YouthOrganization.tsx:35/133/231 |
| org.titel.kgt | Kadın Gençlik Teşkilatı | Kadın Gençlik Teşkilatı | Women's Youth Organization | OrganizationPage.dc.html:120;WomensYouthOrganization.tsx:36/134/232 |
| org.akt | Unsere Aktivitäten | Faaliyetlerimiz | Our Activities | OrganizationPage.dc.html:30;AnatolianOrganization.tsx:42/140/238 |
| org.termine | Kommende Veranstaltungen | Yaklaşan Etkinlikler | Upcoming Events | OrganizationPage.dc.html:44;AnatolianOrganization.tsx:62/160/258 |
| org.news | Aktuelle Nachrichten | Güncel Haberler | Current News | OrganizationPage.dc.html:57;AnatolianOrganization.tsx:84/182/280 |
| org.kontakt | Kontakt | İletişim | Contact | OrganizationPage.dc.html:72;AnatolianOrganization.tsx:111/209/307 |
| org.weiter | Weiterlesen | Devamını oku | Read More | OrganizationPage.dc.html:64;AnatolianOrganization.tsx:122/220/318 |
| kontakt.titel | Kontakt & Anfahrt | İletişim & Ulaşım | Contact & Directions | Contact.dc.html:20;Contact.tsx:24/80/136 |
| kontakt.adresse | Adresse | Adres | Address | Contact.dc.html:24;Contact.tsx:27/83/139 |
| kontakt.daten | Kontaktdaten | İletişim Bilgileri | Contact Information | Contact.dc.html:29;Contact.tsx:33/89/145 |
| kontakt.zeiten | Öffnungszeiten | Açılış Saatleri | Opening Hours | Contact.dc.html:35;Contact.tsx:39/95/151 |
| kontakt.notfall | Notfallkontakt | Acil durumlar | Emergency Contact | Contact.dc.html:44;Contact.tsx:70/126/182 |
| kontakt.anfahrt | Anfahrt | Ulaşım | Getting Here | Contact.dc.html:51;Contact.tsx:61/117/173 |
| kontakt.angebote | Unsere Angebote | Hizmetlerimiz | Our Services | Contact.dc.html:60;Contact.tsx:48/104/160 |
| kontakt.besucher | Besucher willkommen | Ziyaretçiler hoş geldiniz | Visitors Welcome | Contact.dc.html:64;Contact.tsx:75/131/187 |
| footer.webseite | Webseite für Ihre Moschee | Caminiz için Web Sitesi | Website for Your Mosque | Footer.dc.html:51;Footer.tsx:22/26/30 |
| footer.anfragen | Jetzt anfragen | Şimdi başvur | Request now | Footer.dc.html:53;Footer.tsx:198-200 |

Nur deutsch in Quelle (tr und en: – (nur DE in Quelle)): Unser Vorstand (BoardMembers.tsx:283); Unsere Reise (AboutUs.tsx:145); Werden Sie Teil unserer Geschichte (AboutUs.tsx:265); Projektbeschreibung (Projects.tsx:312); Gesammelt (Projects.tsx:387); 56% des Ziels erreicht (Projects.tsx:394); Projektmeilensteine (Projects.tsx:441); Kontakt, Öffnungszeiten, Schnellzugriff im Footer (Footer.tsx:91,121,159); Alle Veranstaltungen anzeigen (OrganizationPage.dc.html:54).

Fließtexte (nur Fundstelle, Volltext dort):

- Über uns: Geschichte AboutUs.dc.html:26-29 (LanguageContext.tsx:214-217/472-475/730-733); Gemeinschaft AboutUs.dc.html:56-58 (LanguageContext.tsx:221-223/479-481/737-739); Werte AboutUs.dc.html:99-102.
- Vorstand: Dank BoardMembers.dc.html:40 (LanguageContext.tsx:256/514/772); Vorsitz-Errungenschaften nur DE (BoardMembers.dc.html:62-75; BoardMembers.tsx:33-163).
- Projekte: Projects.dc.html:32,43,67-68,99-104 (Projects.tsx:32/113/194; 40/121/202; 47-48/128-129/209-210; 50-87/131-168/212-249).
- AT: OrganizationPage.dc.html:96-103 (Daten); AnatolianOrganization.tsx:34-38/132-136/229-234, 43-58/141-156/239-254, 63-80/161-178/259-276, 85-99/183-197/281-295. KT, GT, KGT: Körpertexte nicht geprüft.
- Kontakt: Contact.dc.html:65,79-81 (Contact.tsx:76/132/188; 63-67/119-123/175-179). Footer: Footer.dc.html:19,82-86 (Footer.tsx:55-58, 163-168, nur DE).

## DATEN

Vorschlag, ABGELEITET (spätere Datenbank; Zeitstempel UTC, Anzeige Europe/Berlin). Legende: P = Pflicht; M = mehrsprachig (de Pflicht; tr und en optional mit Rückfall auf Deutsch).

- Über uns: Titel und Texte (Text; P, M); Absätze Geschichte (4) und Gemeinschaft (3) (lang; P, M); Zeitleiste (5 Einträge: Jahr, Ort, Titel, Bild, Bildalt; Titel P, M); Werte (4 Einträge: Titel und Text M; Icon Auswahl).
- Vorstand: mitglied (Name Text, P; Funktion Text, P, M; Jahr seit; Aufgaben Liste, M; E-Mail und Telefon optional); vorsitz (Name und Zeitraum Text, P; Errungenschaften Liste, M; aktuell Ja/Nein). Personendaten werden echt gelöscht.
- Projekte: projekt (Name und Ort Text, P; Beschreibung P, M; Status Auswahl, P; Beginn und Fertigstellung Jahr); spende (gesammelt und ziel Ganzzahl in Euro; konto Text ohne Wert im Seed; Spendentext P, M); spezifikation (Kapazität, Fläche, Einrichtungen Liste, M); meilenstein (Titel P, M; Beschreibung P, M; Monat-Jahr Datum; erledigt Ja/Nein).
- Organisation (at, kt, gt, kgt): name und untertitel P, M; über, mission, vision P, M; akzentfarbe Auswahl (4 Werte); logo Bild; aktivitäten (4 × Titel und Text, M); öffnungszeiten Liste, M; E-Mail Text. Termine und Nachrichten nur als Verweis.
- Kontakt und Anfahrt: adresse (mehrzeilig, P; Platzhalter); telefon, notfall, E-Mail, website Text; zeiten (Bezeichnung und Text, M); anfahrt (3 × Titel und Text, M); angebote (Liste 8, M); besucher_text M.
- Footer: beschreibung P, M; social (URL, optional); oeffnung_mo_fr und oeffnung_sa_so (Text, M). Kontakt nicht doppelt pflegen.
- Bild: Datei; Alt-Text P, M. Zugriffe auf Personendaten im Audit-Log (G-07).

## FORMULARFELDER

Dialog nach dem Muster Dashboard.dc.html:118-119, Legende wie bei DATEN; ein Zod-Schema für Client und Server; Fehlertext am Feld (K-07).

- Titel (Text; P, M); Inhalt (Textarea; P, M); Status (Entwurf oder Veröffentlicht; P): Dashboard.dc.html:118.
- Datum, Startzeit, Endzeit (Datum und Uhrzeiten, optional); Ort (Text; M): Dashboard.dc.html:119.
- Kategorie (Auswahl Allgemein, Ana Teşkilatı, Kadın Teşkilatı, Gençlik Teşkilatı, Kadın Gençlik Teşkilatı; P; ABGELEITET aus K-06): Dashboard.dc.html:115,119.
- Name (Text; P), Funktion (Text; P, M), E-Mail und Telefon (optional): ABGELEITET aus BoardMembers.dc.html:55-60.
- Bild mit Alt-Text (P, M). "(Pflichtfeld)" und der Hinweis zu den Pflichtfeldern sind neu (00 Laufbuch.dc.html:299).

## INTERAKTIONEN

- Bereich wählen (ABGELEITET): Über uns, Vorstand, Projekte, Organisationen (AT, KT, GT, KGT), Kontaktdaten mit Footer.
- Bearbeiten öffnet einen Dialog (Dashboard.dc.html:117-122); Schließen, Abbrechen, Escape und Hintergrundklick schließen ihn. Schaltflächen "Bearbeiten: {Titel}" und "Löschen: {Titel}" (Dashboard.dc.html:143).
- Sprache wählen; fehlt eine Fassung, Rückfall auf Deutsch (K-02).
- Entwurf speichern oder veröffentlichen (K-05).
- Löschen: Inhalte in den Papierkorb; Personendaten nach Bestätigung endgültig (K-05).
- Reihenfolge ändern und Vorschau: ABGELEITET.
- Export und Löschung für Personendaten (G-07). Organisationsredaktion ändert nur die eigene Organisation (K-06).

## ZUSTAENDE

Eigenschaften aus data-props:

- OrganizationPage.dc.html:91: org = at | kt | gt | kgt; Default at; unbekannter Wert fällt auf at zurück (Zeile 131); $preview 1440×1800.
- Footer.dc.html:68: lang = de | tr | en; Default de; unbekannter Wert: Texte fallen auf de zurück (Zeile 80); $preview 1440×460.
- Dashboard.dc.html:110: section = dashboard | news | events | announcements | messages | tickets; Default dashboard. dialog = none | neuigkeit | veranstaltung | ankuendigung | ticket; Default none.
- AboutUs (Zeile 87), BoardMembers (48), Projects (92), Contact (74): keine Eigenschaften (entfällt).

Bestandszustände: Meilenstein erledigt oder geplant (Projects.tsx:446-478); Vorsitz aktuell oder ehemalig (BoardMembers.tsx:159; LanguageContext.tsx:259-260/517-518/775-776); Footer fest "Geöffnet" (Footer.tsx:148). Lade-, Leer- und Fehlerzustände fehlen im Bestand.

Neu, ABGELEITET: Entwurf, Veröffentlicht, Papierkorb; leer; Fehler am Feld; gespeichert; keine Berechtigung; Dialog offen.

## BILDER

- Platzhalter (beschriftete Streifen): AboutUs.dc.html:32 und 46 (fünf Zeitleisten-Bilder, Zeilen 92-96); Projects.dc.html:24; Contact.dc.html:56.
- Logos: Footer.dc.html:18; OrganizationPage.dc.html:96, 104, 112, 120. Vorliegend 40 × 40 px; mindestens 512 px nötig (00 Laufbuch.dc.html:231).
- Externe Unsplash-Adressen im Bestand (AboutUs.tsx:28-64; BoardMembers.tsx:31-256) nicht übernehmen (G-04). Bildrechte klären (00 Laufbuch.dc.html:233).

## AUFFAELLIGKEITEN

- Tabelle ist Auswahl; Fließtexte nur per Fundstelle, da A2 und A8 sich widersprechen.
- Gründungsjahr: 1976 (AboutUs.dc.html:26; LanguageContext.tsx:214) gegenüber "Führung seit 1975" (BoardMembers.dc.html:30).
- Spendenstand: Design "450.000 € / 800.000 €" (Projects.dc.html:45) gegenüber Bestand "€450,000 / €800,000" (Projects.tsx:389). Bestand-Feld progress 35 (Projects.tsx:37) bleibt ungenutzt; berechnet werden 56 % (Projects.tsx:276).
- Tippfehler "Ofizielle" im Bestand (Projects.tsx:65); das Design "Offizielle" (Projects.dc.html:101) gilt.
- Ersatzzeichen im Bestand: LanguageContext.tsx:485 "ta��ınma". Vorschlag "taşınma", bestätigen.
- Termine und Meilensteine liegen vor dem heutigen Datum (11.10.2026), Dezember 2024 bis Januar 2026 (OrganizationPage.dc.html:44-66; Projects.dc.html:99-104). Status darf nicht aus dem Datum folgen.
- Öffnungszeiten widersprechen sich: Footer Mo–Fr 09:00–22:00 (Footer.dc.html:37) gegenüber Bürozeiten Mo–Fr 9:00–17:00 (Contact.dc.html:39).
- Vorstand-E-Mail und -Telefon im Bestand sind Beispielwerte (BoardMembers.tsx:178-179); das Design zeigt Platzhalter (BoardMembers.dc.html:49).

## OFFENE FRAGEN

- Fließtexte als Volltext in dieses Blatt oder als eigene Textliste mit de, tr, en (A2 gegen A8)?
- Gilt das Gründungsjahr 1975 oder 1976?
- Wird die Bankverbindung als Formularfeld gepflegt, ohne Wert im Seed?
- Dürfen Vorstand-E-Mail und Telefon öffentlich erscheinen (G-07)?
- Wer pflegt Spendenstand und Meilensteine, und wie oft?
- Welcher Organisationsredaktion ist welche Organisation zugeordnet (K-06)?
- Kommen Öffnungszeiten im Footer und auf der Kontaktseite aus einer Quelle?
- Welche Pfade gelten je Sprache (K-02)?
- Sind Termine und Nachrichten der Organisationen Verweise auf Veranstaltungen und Neuigkeiten?
- KT, GT und KGT: Körpertexte und Übersetzungen aus den drei Bestandsdateien sind nicht geprüft.
- Dashboard-Muster ohne Punkt "Seiteninhalte" (Dashboard.dc.html:111): Einordnung?

=== ENDE V05 · BEREIT ZUR RÜCKGABE ===
