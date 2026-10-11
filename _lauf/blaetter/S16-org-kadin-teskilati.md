# S16 · Seitenblatt „Kadın Teşkilatı“

S16 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Kadın Teşkilatı“ · Schwierigkeit 1

## SEITE

Plan 06.2, Status fertig (L:170). Artboard WomensOrganization.dc.html (D1), Code WomensOrganization.tsx (B), Muster OrganizationPage mit org="kt" (D1:19).

## ROUTE

Ziel: /organisationen/kadin-teskilati (Auftrag). Muster K-03: /organisationen/[organisation]. tr- und en-Pfade: in den Quellen nicht gefunden (OFFENE FRAGEN 1).

## QUELLEN

D1 = WomensOrganization.dc.html (24 Zeilen). D2 = OrganizationPage.dc.html (Template 15 bis 87, Daten kt 104 bis 111, Logik 129 bis 135). B = uploads/igmg-wetzlar-website/src/app/components/WomensOrganization.tsx (Texte 33 bis 327, Markup ab 360). L = 00 Laufbuch.dc.html. R = readme.md. Zahl nach dem Kürzel = Zeile; B:35/133/231 = Zeilen für de/tr/en; „abgeleitet“ markiert Ableitungen.

## ZWECK

Organisationsseite der Frauenarbeit der IGMG Wetzlar: Über, Mission und Vision, Aktivitäten, Termine, Nachrichten, Kontakt, Schwester-Organisationen (Muster D-15, L:280).

## ABSCHNITTE

Aufbau:

1. Rahmen: Header (D1:16), PrayerTimesBar (D1:17), Breadcrumbs (D1:18, label="Kadın Teşkilatı"), Footer (D1:20). Eigene Komponentenblätter.
2. Seitenkopf: PageHeader (D2:16).
3. Über: Karte mit Icon target und Beschreibung (D2:18–27); Kasten Mission (award), Kasten Vision (star) (D2:24–25).
4. Aktivitäten: vier Karten im Raster (D2:29–40).
5. Termine (D2:43–55) und Nachrichten (D2:56–68) in zwei Spalten.
6. Kontakt: Akzentband, vier Einträge, Mail-Button (D2:71–80).
7. Organisationen: OrgCards für at, gt, kgt (abgeleitet aus D2:133; D2:82–87).

Texte:

|Schluessel-Vorschlag|de|tr|en|Fundstelle|
|---|---|---|---|---|
|kopf.kuerzel|KT|KT|KT|D2:104,B:369|
|kopf.titel|Kadın Teşkilatı|Kadın Teşkilatı|Women's Organization|D2:104,B:35/133/231|
|kopf.untertitel|Stärkung der Frauen in Gemeinschaft und Gesellschaft|Toplumda ve cemiyette kadınları güçlendirme|Empowering women in community and society|D2:104,B:36/134/232|
|kopf.logo-alt|Kadın Teşkilatı Logo|– (nur DE in Quelle)|– (nur DE in Quelle)|D2:104 (Alt-Text)|
|brot.label|Kadın Teşkilatı|– (nur DE in Quelle)|– (nur DE in Quelle)|D1:18|
|ueber.titel|Über die Kadın Teşkilatı|Kadın Teşkilatı Hakkında|About the Women's Organization|D2:105,B:39/137/235|
|ueber.text|Die Kadın Teşkilatı (KT) ist das Herzstück der Frauenarbeit in der IGMG Wetzlar. Wir sind eine Gemeinschaft starker Frauen, die sich für Bildung, soziale Unterstützung und spirituelle Entwicklung einsetzen. Unsere Organisation bietet einen sicheren Raum für muslimische Frauen, um ihre Talente zu entfalten und ihre Gemeinschaft zu stärken.|Kadın Teşkilatı (KT), IGMG Wetzlar'daki kadın çalışmalarının kalbidir. Eğitim, sosyal destek ve manevi gelişim için çaba gösteren güçlü kadınların topluluğuyuz. Organizasyonumuz Müslüman kadınların yeteneklerini geliştirmeleri ve topluluklarını güçlendirmeleri için güvenli bir alan sunar.|The Women's Organization (KT) is the heart of women's work at IGMG Wetzlar. We are a community of strong women dedicated to education, social support, and spiritual development. Our organization provides a safe space for Muslim women to develop their talents and strengthen their community.|D2:105,B:40/138/236|
|mission.titel|Unsere Mission|Misyonumuz|Our Mission|D2:24,B:41/139/237|
|mission.text|Muslimische Frauen zu stärken durch Bildung, soziale Unterstützung und spirituelle Führung, während wir gleichzeitig unsere kulturellen Werte und religiösen Prinzipien wahren.|Kültürel değerlerimizi ve dini ilkelerimizi koruyarak, eğitim, sosyal destek ve manevi rehberlik yoluyla Müslüman kadınları güçlendirmek.|To empower Muslim women through education, social support, and spiritual guidance while preserving our cultural values and religious principles.|D2:106,B:42/140/238|
|vision.titel|Unsere Vision|Vizyonumuz|Our Vision|D2:25,B:43/141/239|
|vision.text|Eine Gemeinschaft zu schaffen, in der jede Frau ihre Potentiale verwirklichen kann und als Vorbild für nachkommende Generationen dient.|Her kadının potansiyelini gerçekleştirebileceği ve gelecek nesiller için örnek teşkil edebileceği bir topluluk yaratmak.|To create a community where every woman can realize her potential and serve as a role model for future generations.|D2:107,B:44/142/240|
|akt.titel|Unsere Aktivitäten|Faaliyetlerimiz|Our Activities|D2:30,B:48/146/244|
|akt1.titel|Bildung & Kurse|Eğitim & Kurslar|Education & Courses|D2:108,B:50/148/246|
|akt1.text|Islamunterricht, Koranstudium, deutsche Sprachkurse und Computerkurse für Frauen|İslam dersleri, Kuran çalışması, Almanca dil kursları ve kadınlar için bilgisayar kursları|Islamic classes, Quran study, German language courses, and computer courses for women|D2:108,B:51/149/247|
|akt2.titel|Familie & Erziehung|Aile & Çocuk Yetiştirme|Family & Parenting|D2:108,B:54/152/250|
|akt2.text|Erziehungsberatung, Mutter-Kind-Gruppen und Familienseminare|Eğitim danışmanlığı, anne-çocuk grupları ve aile seminerleri|Parenting counseling, mother-child groups, and family seminars|D2:108,B:55/153/251|
|akt3.titel|Soziale Arbeit|Sosyal Çalışma|Social Work|D2:108,B:58/156/254|
|akt3.text|Unterstützung für bedürftige Familien, Krankenbesuche und Nachbarschaftshilfe|İhtiyaç sahibi ailelere destek, hasta ziyaretleri ve komşuluk yardımı|Support for families in need, hospital visits, and neighborhood assistance|D2:108,B:59/157/255|
|akt4.titel|Handwerk & Kreativität|El Sanatları & Yaratıcılık|Crafts & Creativity|D2:108,B:62/160/258|
|akt4.text|Näh- und Strickkurse, traditionelle Handarbeiten und kreative Workshops|Dikiş ve örgü kursları, geleneksel el işleri ve yaratıcı atölyeler|Sewing and knitting courses, traditional handicrafts, and creative workshops|D2:108,B:63/161/259|
|ter.titel|Kommende Veranstaltungen|Yaklaşan Etkinlikler|Upcoming Events|D2:44,B:68/166/264|
|ter1.titel|Frauen-Iftar Abend|Kadınlar İftar Akşamı|Women's Iftar Evening|D2:109,B:70/168/266|
|ter1.datum|Mi., 18. Dez. 2024|18 Ara 2024|Dec 18, 2024|D2:109,B:71/169/267|
|ter1.zeit|18:30 Uhr|18:30|6:30 PM|D2:109,B:72/170/268|
|ter1.text|Gemeinsames Fastenbrechen nur für Frauen mit spirituellen Gesprächen und Gemeinschaft.|Sadece kadınlar için ortak iftar, manevi sohbetler ve topluluk.|Women-only communal fast-breaking with spiritual conversations and community.|D2:109,B:73/171/269|
|ter2.titel|Mutter-Kind Spielgruppe|Anne-Çocuk Oyun Grubu|Mother-Child Playgroup|D2:109,B:76/174/272|
|ter2.datum|Sa., 21. Dez. 2024|21 Ara 2024|Dec 21, 2024|D2:109,B:77/175/273|
|ter2.zeit|10:00 Uhr|10:00|10:00 AM|D2:109,B:78/176/274|
|ter2.text|Wöchentliche Spielgruppe für Mütter mit kleinen Kindern, pädagogische Betreuung.|Küçük çocuklu anneler için haftalık oyun grubu, pedagojik bakım.|Weekly playgroup for mothers with small children, educational supervision.|D2:109,B:79/177/275|
|ter3.titel|Winterbasar der Frauen|Kadınlar Kış Pazarı|Women's Winter Bazaar|D2:109,B:82/180/278|
|ter3.datum|Sa., 28. Dez. 2024|28 Ara 2024|Dec 28, 2024|D2:109,B:83/181/279|
|ter3.zeit|14:00 Uhr|14:00|2:00 PM|D2:109,B:84/182/280|
|ter3.text|Verkauf selbstgemachter Produkte und Handarbeiten, Erlös für wohltätige Zwecke.|El yapımı ürünler ve el işlerinin satışı, gelir hayır işleri için.|Sale of handmade products and handicrafts, proceeds for charitable purposes.|D2:109,B:85/183/281|
|ter.link|Alle Veranstaltungen anzeigen|– (nur DE in Quelle)|– (nur DE in Quelle)|D2:54|
|nach.titel|Aktuelle Nachrichten|Güncel Haberler|Current News|D2:57,B:90/188/286|
|nach1.datum|Mo., 2. Dez. 2024|2 Ara 2024|Dec 2, 2024|D2:110,B:93/191/289|
|nach1.titel|Neue Nähkurse sehr erfolgreich|Yeni Dikiş Kursları Çok Başarılı|New Sewing Courses Very Successful|D2:110,B:92/190/288|
|nach1.text|Die neuen Nähkurse der KT sind voll ausgebucht. 25 Frauen lernen traditionelle und moderne Nähtechniken.|KT'nin yeni dikiş kursları tamamen dolu. 25 kadın geleneksel ve modern dikiş tekniklerini öğreniyor.|KT's new sewing courses are fully booked. 25 women are learning traditional and modern sewing techniques.|D2:110,B:94/192/290|
|nach2.datum|Sa., 30. Nov. 2024|30 Kas 2024|Nov 30, 2024|D2:110,B:98/196/294|
|nach2.titel|Hilfspaket-Aktion für Syrien|Suriye İçin Yardım Paketi Kampanyası|Aid Package Campaign for Syria|D2:110,B:97/195/293|
|nach2.text|Die Frauen der KT haben 150 Hilfspakete für Familien in Syrien gepackt und verschickt.|KT kadınları Suriye'deki aileler için 150 yardım paketi hazırlayıp gönderdi.|KT women have packed and sent 150 aid packages for families in Syria.|D2:110,B:99/197/295|
|nach3.datum|Mo., 25. Nov. 2024|25 Kas 2024|Nov 25, 2024|D2:110,B:103/201/299|
|nach3.titel|Auszeichnung für Integrationsarbeit|Entegrasyon Çalışmasında Ödül|Award for Integration Work|D2:110,B:102/200/298|
|nach3.text|Die KT erhält Anerkennung vom Landkreis für herausragende Arbeit in der Frauenintegration.|KT, kadın entegrasyonundaki üstün çalışması için ilçeden takdir alıyor.|KT receives recognition from the district for outstanding work in women's integration.|D2:110,B:104/202/300|
|nach.link|Weiterlesen|Devamını oku|Read More|D2:64,B:128/226/324|
|kon.titel|Kontakt|İletişim|Contact|D2:72,B:117/215/313|
|kon.adresse|Adresse|Adres|Address|D2:74,B:118/216/314|
|kon.adresse-wert|IGMG Wetzlar / [Adresse]|– (sprachneutral, wie de)|– (sprachneutral, wie de)|D2:74,B:529 (Beispielwert 530–531)|
|kon.telefon|Telefon|Telefon|Phone|D2:75,B:119/217/315|
|kon.telefon-wert|[Telefonnummer]|– (sprachneutral, wie de)|– (sprachneutral, wie de)|D2:75,B:537 (Beispielwert)|
|kon.email|E-Mail|E-posta|Email|D2:76,B:120/218/316|
|kon.email-wert|Beispielwert (D2:104)|– (sprachneutral, wie de)|– (sprachneutral, wie de)|D2:76,B:542 (Beispielwert)|
|kon.zeiten|Öffnungszeiten|Görüşme Saatleri|Office Hours|D2:77,B:219/317 (de B:121: Sprechzeiten)|
|kon.zeit1|Dienstag & Donnerstag: 14:00–17:00 Uhr|– (nur DE in Quelle)|– (nur DE in Quelle)|D2:111,B:549 (ohne Uhr)|
|kon.zeit2|Samstag: 10:00–13:00 Uhr|– (nur DE in Quelle)|– (nur DE in Quelle)|D2:111,B:550 (ohne Uhr)|
|kon.button|Kontakt|İletişim|Contact|D2:79,B:126/224/322|
|org.titel|Organisationen|– (nur DE in Quelle)|– (nur DE in Quelle)|D2:83|

## DATEN

Vorschlag, nicht angelegt (A7). UI-Texte gehören in messages/{de,tr,en}.json, nicht in die Datenbank (K-02). Mehrsprachig: de Pflicht, tr und en optional mit sichtbarem Rückfall auf de (K-02).

- organisation (kt): slug (Text, nein), name (Text, ja), kuerzel (Text, nein), akzent, tinte, tönung (Farbwert, nein), logo (Dateipfad, nein), email (Text, nein; L:288), oeffnungszeiten (Textliste, ja), ueber, mission, vision (Text, ja).
- aktivitaet (vier je Organisation): icon (Schluessel, nein), titel und text (ja).
- termin: titel und text (ja); datum (Datum), uhrzeit (Zeit), organisation (Bezug) (nein).
- nachricht: datum (Datum, nein), titel und zusammenfassung (ja), slug (Text, nein; fehlt in D2:64).
- kontakt: adresse und telefon (Text, nein; bis zur Lieferung Platzhalter, L:254–255).

## FORMULARFELDER

– (entfaellt, keine Formularfelder; nur Mail-Links D2:76 und D2:79)

## INTERAKTIONEN

- Link „Alle Veranstaltungen anzeigen“ (D2:54) führt zu Events.dc.html; abgeleitet Ziel /veranstaltungen (K-03).
- „Weiterlesen“ (D2:64) führt bei allen drei Meldungen zu NewsDetails.dc.html ohne Slug; unsichtbarer Zusatz „: [Titel]“.
- E-Mail-Link (D2:76) und Button „Kontakt“ (D2:79) öffnen mailto:, abgeleitet aus email (D2:104).
- Keine Klicklogik (D2:130–134). Bestand: Buttons ohne Handler (B:504–507, B:554–557); navigateTo ungenutzt (B:331).
- Hover: Button Hintergrund #065F46, Schrift #FFFFFF (D2:79); Links #065F46 (D1:13). Fokus: 2 px #0E3929, 2 px Abstand (D1:13).

## ZUSTAENDE

- OrganizationPage (D2:91, data-props): org als enum; Optionen at, kt, gt, kgt; Default at; tsType 'at'|'kt'|'gt'|'kgt'. Hier org="kt" (D1:19). Unbekannter Wert fällt auf at zurück (D2:131). $preview 1440 × 1800 ist keine Eigenschaft.
- WomensOrganization.dc.html: keine data-props (D1).
- Rahmen: Header active="organisationen", current="womens-organization" (D1:16); Optionen in L:148.
- Bestand: Sprache de, tr, en über useLanguage (B:330, B:332); keine Lade-, Fehler-, Leer- oder Anmeldezustände; Termine und Nachrichten sind feste Listen mit je drei Einträgen (B:357–358).
- Plan: Zustände „–“ (L:170).

## BILDER

- Logo assets/logo-kadin.png, 40 × 40 px, weißer Grund (D2:104; L:231; geprüft). Verwendung als PageHeader-Logo (D2:16). Herkunft efe65084 (L:34). Größere Fassung fehlt.
- Alt-Text „Kadın Teşkilatı Logo“ (D2:104, nur de).
- Keine Fotos.
- Bestand: Illustration HijabWomanIllustration (B:8, B:423); im Design nicht vorhanden.
- Icons (Lucide, R:28): target 28, award 24, star 24, calendar 28 und 16, clock 16, newspaper 28, arrow-right 20 und 18, phone 28, mail 20; Aktivitäten 24 (D2:108). Größen 16, 18 und 28 weichen von R:28 (20/24) ab.

## AUFFAELLIGKEITEN

1. Termine und Meldungen stammen aus 2024 (D2:109–110, B:70–104); heute (11.10.2026) liegen alle Termine zurück. L:288 nennt sie Beispielinhalte.
2. Kontakt: Bestand nennt Beispielwerte fest im Code (B:529–542); Design nutzt Platzhalter [Adresse] und [Telefonnummer] (D2:74–75). Design gilt.
3. Bestand: Label „Sprechzeiten“ (B:121) statt „Öffnungszeiten“ (D2:77); „14:00 - 17:00“ ohne „Uhr“ (B:549); Zusatzzeile „Oder nach Vereinbarung“ (B:551) fehlt im Design.
4. Datum: Design „Mi., 18. Dez. 2024“ (D2:109), Bestand „18. Dez 2024“ (B:71), K-03-Muster laut L:268 „Fr., 15. März 2024“, D-10 (L:193) „Mo., 28. Juli 2025“. Wochentage der Design-Termine geprüft: stimmen.
5. Icons: Baby statt users (B:342), Scissors statt pencil (B:352), Globe statt newspaper (B:491). Design gilt.
6. Gestalt: Bestand mit Verläufen (B:361, B:363, B:516), Hero in Pink und Purpur (B:363); Design KT-Violett #592E81 auf #F7F0FF ohne Verlauf (D2:104; R:22).
7. Logo: Code ordnet 301e0b5b den Frauen zu (L:230); Design nutzt efe65084 (L:34).
8. Vorstand (B:108–114, B:206–212, B:304–310) ist übersetzt, aber nicht gerendert und im Design nicht vorhanden.
9. Ungenutzte Schlüssel buttons.learnMore und buttons.register (B:125, B:127, B:223, B:225, B:321, B:323). Hart kodierte UI-Texte (B:369, B:549–551) widersprechen K-02.

## OFFENE FRAGEN

1. Welche tr- und en-Pfade gelten für die Route (K-03)?
2. Werden die Termine und Meldungen von 2024 ersetzt oder als Beispiel markiert (L:288)?
3. Sind die Kontaktdaten der KT bestätigt (L:288), und liefert die Gemeinde [Adresse] und [Telefonnummer]?
4. Welches Logo gehört zur KT (L:230), und gibt es eine Fassung ab 512 px (L:231)?
5. Welches Datumsformat gilt: Design (D2:109) oder K-03 (L:268)?
6. Sollen „Oder nach Vereinbarung“ (B:551) und die Illustration (B:423) übernommen werden?
7. Welche Slugs haben die Meldungen für „Weiterlesen“ (D2:64)?
8. Sollen die Lücken „– (nur DE in Quelle)“ neu übersetzt, markiert und in MENSCHEN.md geführt werden (K-02)?
9. Der Breadcrumb-Pfad ist nicht gesetzt (D1:18); Festlegung im Blatt Breadcrumbs.

=== ENDE S16 · BEREIT ZUR RÜCKGABE ===
