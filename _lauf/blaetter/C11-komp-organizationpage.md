# C11 · OrganizationPage (gemeinsames Muster der vier Organisationsseiten)

Rolle: Kundschafter · Phase P0 · Kern-Version 1.0 · Stand 2026-10-11

## SEITE

Komponente, keine Seite. Eigenschaft org (at, kt, gt, kgt). Eingebunden in 06.1–06.4 (Laufbuch Z.169–172; D-15 Z.280).

## ROUTE

/organisationen/[organisation] (Auftrag). Locale-Präfix und lokalisierte Pfade nach K-02. Offen: Pfadsegmente je Sprache, Abbildung auf at, kt, gt, kgt.

## QUELLEN

D = OrganizationPage.dc.html. AT, KT, GT, KGT = AnatolianOrganization.tsx, WomensOrganization.tsx, YouthOrganization.tsx, WomensYouthOrganization.tsx (uploads/igmg-wetzlar-website/src/app/components). Hilfen: readme.md, 00 Laufbuch.dc.html. Alle vollständig gelesen.

## ZWECK

Muster für vier Organisationen mit eigenen Inhalten und Akzentfarbe (D-06, Laufbuch Z.187). Reine Anzeige. Die übrigen drei erscheinen als OrgCard (D Z.85; Blatt C08-komp-orgcard.md).

## ABSCHNITTE

1. Kopf: PageHeader (D Z.16; Blatt C05-komp-pageheader.md). Badge AT, KT, GT, KGT (Z.96/104/112/120) in allen Sprachen gleich.
2. Über, Mission, Vision: Karte mit Icon target (Z.19–22); Mission in Tönung mit Akzentband (Z.24); Vision weiß (Z.25).
3. Aktivitäten: Überschrift ohne Icon (Z.30); vier Karten (Z.31–38).
4. Termine: Überschrift mit Icon calendar (Z.44); drei Einträge (Z.45–53); Link (Z.54).
5. Nachrichten: Überschrift mit Icon newspaper (Z.57); drei Einträge (Z.58–67); Link „Weiterlesen“ mit unsichtbarem Zusatz „: Titel“ (Z.64).
6. Kontakt: Überschrift mit Icon phone (Z.72); Liste Adresse, Telefon, E-Mail, Öffnungszeiten (Z.73–78); Schaltfläche als mailto (Z.79).
7. Organisationen: Überschrift (Z.83); drei OrgCards (Z.84–85).

Nicht Teil der Komponente: Header, PrayerTimesBar, Breadcrumbs, Footer (Z-04, Laufbuch Z.216) und Helmet (D Z.10–14).

Fundstelle in den Tabellen: Zahl = Zeile in D; danach tr/en-Zeile im Bestand (feste Texte: AT; Organisationsschlüssel: eigene Datei).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| about.mission | Unsere Mission | Misyonumuz | Our Mission | 24; 133/231 |
| about.vision | Unsere Vision | Vizyonumuz | Our Vision | 25; 135/233 |
| activities.title | Unsere Aktivitäten | Faaliyetlerimiz | Our Activities | 30; 140/238 |
| events.title | Kommende Veranstaltungen | Yaklaşan Etkinlikler | Upcoming Events | 44; 160/258 |
| events.all | Alle Veranstaltungen anzeigen | – (nur DE in Quelle) | – (nur DE in Quelle) | 54 |
| news.title | Aktuelle Nachrichten | Güncel Haberler | Current News | 57; 182/280 |
| news.readMore | Weiterlesen | Devamını oku | Read More | 64; 220/318 |
| contact.title | Kontakt | İletişim | Contact | 72; 209/307 |
| contact.address | Adresse | Adres | Address | 74; 210/308 |
| contact.phone | Telefon | Telefon | Phone | 75; 211/309 |
| contact.email | E-Mail | E-posta | Email | 76; 212/310 |
| contact.hours | Öffnungszeiten | Açık Saatler | Opening Hours | 77; de 115; 213/311 |
| contact.button | Kontakt | İletişim | Contact | 79; de 120; 218/316 |
| orgs.title | Organisationen | Organizasyonlar | Organizations | 83; Laufbuch Z.196 |

Platzhalter [Adresse] und [Telefonnummer] (Z.74–75) gelten in allen Sprachen; „IGMG Wetzlar“ (Z.74) ist im Bestand gleich.

Organisationsspezifische Überschriften (Titel, Untertitel, Über-Titel):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| AT.title | Ana Teşkilatı | Ana Teşkilatı | Anatolian Organization | 96; 127/225 |
| AT.subtitle | Förderung kultureller Verbindungen und Gemeinschaftsbildung | Kültürel bağları ve toplum oluşumunu destekleme | Promoting cultural connections and community building | 96; 128/226 |
| AT.aboutTitle | Über die Ana Teşkilatı | Ana Teşkilatı Hakkında | About the Anatolian Organization | 97; 131/229 |
| KT.title | Kadın Teşkilatı | Kadın Teşkilatı | Women's Organization | 104; 133/231 |
| KT.subtitle | Stärkung der Frauen in Gemeinschaft und Gesellschaft | Toplumda ve cemiyette kadınları güçlendirme | Empowering women in community and society | 104; 134/232 |
| KT.aboutTitle | Über die Kadın Teşkilatı | Kadın Teşkilatı Hakkında | About the Women's Organization | 105; 137/235 |
| GT.title | Gençlik Teşkilatı | Gençlik Teşkilatı | Youth Organization | 112; 133/231 |
| GT.subtitle | Jugend fördern, Zukunft gestalten | Gençliği desteklemek, geleceği şekillendirmek | Empowering youth, shaping the future | 112; 134/232 |
| GT.aboutTitle | Über die Gençlik Teşkilatı | Gençlik Teşkilatı Hakkında | About the Youth Organization | 113; 137/235 |
| KGT.title | Kadın Gençlik Teşkilatı | Kadın Gençlik Teşkilatı | Women's Youth Organization | 120; 134/232 |
| KGT.subtitle | Junge Frauen stärken, Träume verwirklichen | Genç kadınları güçlendirmek, hayalleri gerçekleştirmek | Empowering young women, realizing dreams | 120; 135/233 |
| KGT.aboutTitle | Über die Kadın Gençlik Teşkilatı | Kadın Gençlik Teşkilatı Hakkında | About the Women's Youth Organization | 121; 138/236 |

Langtexte nur per Fundstelle (Reihenfolge AT/KT/GT/KGT; A8):

- about.description: D 97/105/113/121; tr 132/138/138/139; en 230/236/236/237.
- about.missionText: D 98/106/114/122; tr 134/140/140/141; en 232/238/238/239.
- about.visionText: D 99/107/115/123; tr 136/142/142/143; en 234/240/240/241.
- activities (je 4 Titel und Texte): D 100/108/116/124; Block tr 139/145/145/146; en 237/243/243/244.
- events (je 3 Termine): D 101/109/117/125; Block tr 159/165/165/166; en 257/263/263/264.
- news (je 3 Meldungen): D 102/110/118/126; Block tr 181/187/187/188; en 279/285/285/286.
- hours: D 103/111/119/127; nur Deutsch, fest im JSX: AT 533–535, KT 549–551, GT 539–542, KGT 550–553.

## DATEN

Vorschlag (A7):

- org: Enum at | kt | gt | kgt; nicht mehrsprachig.
- title, subtitle, aboutTitle, description, mission, vision, hours, Aktivitäts-, Termin- und Meldungstexte: Text; mehrsprachig ja (de Pflicht, tr und en mit Rückfall auf de, K-02).
- Termin- und Meldungsdatum sowie Uhrzeit: je Sprache formatiert; nicht mehrsprachig.
- activities.icon, news.id, badge, email: nicht mehrsprachig; Telefon und Adresse bleiben Platzhalter.
- logo: Bildreferenz; logoAlt: Text, mehrsprachig ja.
- Termine und Meldungen sind Beispielinhalte (Laufbuch Z.288).

## FORMULARFELDER

– (entfaellt, reine Anzeige; Kontakt nur als mailto, Z.76 und Z.79)

## INTERAKTIONEN

- „Alle Veranstaltungen anzeigen“ führt zu Events.dc.html (Z.54); „Weiterlesen“ zu NewsDetails.dc.html (Z.64), ohne Beitrags-Kennung.
- E-Mail-Link (Z.76) und Schaltfläche (Z.79) öffnen mailto:{{ o.email }} (Z.132).
- Hover der Schaltfläche: Hintergrund #065F46, Text #FFFFFF (Z.79). Fokus: 2 px #0E3929 mit 2 px Abstand (Z.13).

## ZUSTAENDE

- org (Z.91): Enum at | kt | gt | kgt; Default at; tsType 'at'|'kt'|'gt'|'kgt'. Unbekannter Wert wird at (Z.131).
- $preview (Z.91): 1440 × 1800, nur Designwerkzeug.
- leer (keine Termine oder Meldungen): nicht gestaltet (Z.45–53, Z.58–67).
- Fehler, Erfolg, Schritt, angemeldet: – (entfaellt, Anzeige ohne Datenabfrage und Login).
- Sprache: de, tr, en über die Route (K-02). D setzt kein lang-Attribut (Z.15).
- Bestand: keine Lade-, Leer- oder Fehlerzustände; Listen sind feste Arrays (AT Z.351–352).

## BILDER

- Logos (Z.96/104/112/120): assets/logo-igmg-wetzlar.png, assets/logo-kadin.png, assets/logo-genclik.png, assets/logo-kadin-genclik.png; vorhanden nur 40 × 40 px (Laufbuch Z.231).
- logoAlt de: „Ana Teşkilatı Logo“, „Kadın Teşkilatı Logo“, „Gençlik Teşkilatı Logo“, „Kadın Gençlik Teşkilatı Logo“; tr und en: – (nur DE in Quelle).
- Icons (Lucide, readme Z.28; 16–28 px); Aktivitäts-Icons in Z.100/108/116/124.
- Keine Fotos in D. KT und KGT zeigen im Bestand HijabWomanIllustration (WomensOrganization.tsx Z.423; WomensYouthOrganization.tsx Z.424); D ohne Bild.

## AUFFAELLIGKEITEN

1. Kontakt-Bereich: Bestand GT und KGT „Mitmachen / Katıl / Join“ statt „Kontakt“ (YouthOrganization.tsx Z.127, 225, 323; WomensYouthOrganization.tsx Z.128, 226, 324). Öffnungszeiten-Label: KT „Sprechzeiten“ (WomensOrganization.tsx Z.121), GT und KGT „Aktivitätszeiten“ (YouthOrganization.tsx Z.121; WomensYouthOrganization.tsx Z.122). „Oder nach Vereinbarung“ fehlt in D (Z.111, Z.127).
2. Farben: D Violett, Türkis, Beere (Z.104, 112, 120; D-06). Bestand KT Pink/Purple (WomensOrganization.tsx Z.363), GT Blau/Indigo (YouthOrganization.tsx Z.363), KGT Purple/Pink (WomensYouthOrganization.tsx Z.364).
3. Termine und Meldungen: D nutzt eigenes Markup (Z.45–53, Z.58–67); Laufbuch Z.169 nennt EventCard.
4. Schriften und Links: D lädt Google-Fonts-Links (Z.11–12), K-04 verlangt next/font. „Weiterlesen“ 44 px (Z.64); readme verlangt 48 px (readme Z.21).
5. Datum: D „So., 15. Dez. 2024“ und „19:00 Uhr“; D-10 (Z.193) nennt „Mo., 28. Juli 2025“. Bestand AT: tr „15 Ara 2024“, en „Dec 15, 2024“ (Z.163, 261).
6. GT-Text: D „Junge Muslime“ (Z.114), Bestand „Junge Muslims“ (YouthOrganization.tsx Z.42); Laufbuch Z.302 bestätigt die Änderung.

## OFFENE FRAGEN

1. Soll ein Anhangsblatt die Langtexte in de, tr und en wörtlich liefern? Ohne Anhang ist A2 für Langtexte nicht erfüllt; A8 bleibt eingehalten.
2. Welche Pfadsegmente gelten je Sprache, und wie wird [organisation] auf at, kt, gt, kgt abgebildet?
3. Was zeigt die Seite bei leeren Termin- oder Nachrichtenlisten?
4. Braucht „Weiterlesen“ eine Beitrags-Kennung, und braucht „Alle Veranstaltungen anzeigen“ einen Organisationsfilter?
5. Gilt für GT und KGT „Kontakt“ (D) oder „Mitmachen“ (Bestand)? Öffnungszeiten-Label und Zusatzzeile für KT und KGT bestätigen.
6. Welche Seitenrahmen gelten für 06.1–06.4? Laufbuch Z.169–172 nennt sie nicht, Z-04 (Z.216) verlangt sie.
7. Logo-Zuordnung bestätigen (Laufbuch Z.230), größere Logos liefern (Z.231); Organisations-Kontaktdaten bestätigen (Z.226, Z.288).
8. Monatsnamen: abgekürzt wie in D oder ausgeschrieben wie in D-10 (Z.193)?

=== ENDE C11 · BEREIT ZUR RÜCKGABE ===
