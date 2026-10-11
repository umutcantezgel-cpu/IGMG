# S11 · Kontakt & Anfahrt

S11 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Schwierigkeit 1

## SEITE

Kontakt & Anfahrt, Plan 04.4 (Laufbuch.dc.html:163), Status fertig. Ohne Formular, ohne Datenabruf im Design.

## ROUTE

- de: /kontakt (K-03). tr und en: [Pfad tr] und [Pfad en] (in den Quellen keine lokalisierten Pfade).
- Eingehend (Laufbuch.dc.html:307–317, 169–172): Header › Moschee (Kontakt), Footer-Schnellzugriff „Kontakt“ (D-07), Über uns, Projekte, Veranstaltungsdetails „Route anzeigen“, Korankurse über „Contact#karte“, Organisationsseiten. Der Anker #karte (Contact.dc.html:49) bleibt erhalten.
- Ausgehend: Gebetszeiten (Contact.dc.html:41), Google Maps (Contact.dc.html:26).

## QUELLEN

- Design: Contact.dc.html, vollständig (Template :9–73, Skript :74–87).
- Bestand, nur lesend: Contact.tsx (Textobjekt :22–191, JSX :213–436); Footer.tsx (Kontaktblock :88–116, Öffnungszeiten :118–154).
- Hilfen: readme.md (:11–14, :21–22, :28, :43); 00 Laufbuch.dc.html (:148–152, :163, :188–193, :217–222, :225–249, :253–264, :307–317).

## ZWECK

Besucher finden Adresse, Telefon, E-Mail, Öffnungszeiten, Notfallkontakt, Anfahrt, Angebote und einen Besuchshinweis. Die Karte ist eine beschriftete Platzhalterfläche (D-11, Laufbuch.dc.html:191). Fehlendes steht in eckigen Klammern (G-05). Keine Personennamen (A5), keine religiösen Texte (A6).

## ABSCHNITTE

Zwölf Abschnitte: sieben section-Elemente und fünf dc-imports.

1. Kopf: Header mit active="moschee" und current="contact", sticky (Contact.dc.html:16); PrayerTimesBar ohne Attribute (:17); Breadcrumbs label="Kontakt" (:18).
2. PageHeader mit eyebrow, title, subtitle (:20).
3. Vier Karten im Raster (:22–47): Adresse (:23–27), Kontaktdaten (:28–33), Öffnungszeiten mit 2-px-Rand (:34–42), Notfallkontakt mit Hintergrund #FFEDEA (:43–47).
4. Anfahrt, Anker #karte, Scrollrand 96 px (:49–57): drei Einträge aus renderVals (Skript :78–81), Kartenplatzhalter (:56).
5. Unsere Angebote (:59–62, acht Einträge aus :83) und Besucher willkommen (:63–67, Hintergrund #0E3929, zwei Chips).
6. Footer ohne Attribute (:71), eigenes Blatt. Bestands-Kontaktblock: Footer.tsx:88–116.

Texte (A2): de nach Design, tr und en nach den Bestandsübersetzungen in Contact.tsx (K-02, Vorrang). Adressen, Telefon, E-Mail und Web stehen als Beispielwert mit Fundstelle (A5).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| contact.title | Kontakt & Anfahrt | İletişim & Ulaşım | Contact & Directions | Contact.dc.html:20; Contact.tsx:24,80,136 |
| contact.subtitle | Besuchen Sie uns in der IGMG Wetzlar Moschee | IGMG Wetzlar Camimizi ziyaret edin | Visit us at IGMG Wetzlar Mosque | Contact.dc.html:20; Contact.tsx:25,81,137 |
| contact.eyebrow | Moschee | – (nur DE in Quelle) | – (nur DE in Quelle) | Contact.dc.html:20 (Bestand ohne Eyebrow) |
| contact.breadcrumb | Kontakt | – (nur DE in Quelle) | – (nur DE in Quelle) | Contact.dc.html:18 |
| contact.address.title | Adresse | Adres | Address | Contact.dc.html:24; Contact.tsx:27,83,139 |
| contact.address.org | IGMG Wetzlar | IGMG Wetzlar | IGMG Wetzlar | Contact.dc.html:25; Contact.tsx:25,81,137 |
| contact.address.full | [Adresse] | Beispielwert (Contact.tsx:84-85) | Beispielwert (Contact.tsx:140-141) | Contact.dc.html:25; de-Beispielwert Contact.tsx:28-29 |
| contact.address.country | Deutschland | Almanya | Germany | Contact.dc.html:25; Contact.tsx:30,86,142 |
| contact.map.button | Google Maps | Google Maps | Google Maps | Contact.dc.html:26; Contact.tsx:257 (sprachunabhängig) |
| contact.details.title | Kontaktdaten | İletişim Bilgileri | Contact Information | Contact.dc.html:29; Contact.tsx:33,89,145 |
| contact.details.phone | [Telefonnummer] | Beispielwert (Contact.tsx:90) | Beispielwert (Contact.tsx:146) | Contact.dc.html:30; de-Beispielwert Contact.tsx:34 |
| contact.details.email | Beispielwert (Contact.dc.html:31) | Beispielwert (Contact.tsx:91) | Beispielwert (Contact.tsx:147) | Contact.dc.html:31; Contact.tsx:35 |
| contact.details.web | Beispielwert (Contact.dc.html:32) | Beispielwert (Contact.tsx:92) | Beispielwert (Contact.tsx:148) | Contact.dc.html:32; Contact.tsx:36 |
| contact.hours.title | Öffnungszeiten | Açılış Saatleri | Opening Hours | Contact.dc.html:35; Contact.tsx:39,95,151 |
| contact.hours.daily | Täglich | Her gün | Daily | Contact.dc.html:37; Contact.tsx:40,96,152 |
| contact.hours.prayer | Zu den Gebetszeiten | Namaz vakitlerinde | During prayer times | Contact.dc.html:37; Contact.tsx:41,97,153 |
| contact.hours.friday | Freitag | Cuma | Friday | Contact.dc.html:38; Contact.tsx:42,98,154 |
| contact.hours.fridayTime | 12:00–14:30 Uhr (Freitagsgebet) | 12:00 - 14:30 (Cuma namazı) | 12:00 - 14:30 (Friday prayer) | Contact.dc.html:38; Contact.tsx:43,99,155 |
| contact.hours.office | Bürozeiten | Ofis saatleri | Office hours | Contact.dc.html:39; Contact.tsx:44,100,156 |
| contact.hours.officeTime | Mo.–Fr. 9:00–17:00 Uhr | Pzt-Cum: 9:00 - 17:00 | Mon-Fri: 9:00 AM - 5:00 PM | Contact.dc.html:39; Contact.tsx:45,101,157 |
| contact.hours.link | Gebetszeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | Contact.dc.html:41 |
| contact.emergency.title | Notfallkontakt | Acil durumlar | Emergency Contact | Contact.dc.html:44; Contact.tsx:70,126,182 |
| contact.emergency.text | Bei dringenden Angelegenheiten außerhalb der Bürozeiten: | Ofis saatleri dışında acil durumlar için: | For urgent matters outside office hours: | Contact.dc.html:45; Contact.tsx:71,127,183 |
| contact.emergency.phone | [Telefonnummer Notfall] | Beispielwert (Contact.tsx:128) | Beispielwert (Contact.tsx:184) | Contact.dc.html:46; de-Beispielwert Contact.tsx:72 |
| contact.directions.title | Anfahrt | Ulaşım | Getting Here | Contact.dc.html:51; Contact.tsx:61,117,173 |
| contact.map.label | Karte: Anfahrt [Adresse] | – (nur DE in Quelle) | – (nur DE in Quelle) | Contact.dc.html:56 (aria-label gleich) |
| contact.ways.transit.title | Öffentliche Verkehrsmittel | Toplu taşıma | Public transport | Contact.dc.html:79; Contact.tsx:62,118,174 |
| contact.ways.transit.text | Bushaltestelle [Haltestelle] (Linien [Linien]) | Beispielwert (Contact.tsx:119) | Beispielwert (Contact.tsx:175) | Contact.dc.html:79 |
| contact.ways.car.title | Mit dem Auto | Araba ile | By car | Contact.dc.html:80; Contact.tsx:64,120,176 |
| contact.ways.car.text | Kostenlose Parkplätze vorhanden | Ücretsiz park yeri mevcuttur | Free parking available | Contact.dc.html:80; Contact.tsx:65,121,177 |
| contact.ways.walk.title | Zu Fuß | Yürüyerek | Walking | Contact.dc.html:81; Contact.tsx:66,122,178 |
| contact.ways.walk.text | 5 Minuten vom Wetzlarer Hauptbahnhof | Wetzlar ana istasyonundan 5 dakika | 5 minutes from Wetzlar main station | Contact.dc.html:81; Contact.tsx:67,123,179 |
| contact.services.title | Unsere Angebote | Hizmetlerimiz | Our Services | Contact.dc.html:60; Contact.tsx:48,104,160 |
| contact.services.items | Fünf tägliche Gebete; Freitagsgebet mit Khutba; Korankurse für alle Altersgruppen; Islamunterricht; Hochzeiten und religiöse Zeremonien; Beratung und Seelsorge; Jugend- und Frauenorganisationen; Kulturelle Veranstaltungen | Beş vakit namaz; Hutbeli Cuma namazı; Her yaş için Kuran kursları; Din dersleri; Nikah ve dini törenler; Danışmanlık ve manevi rehberlik; Gençlik ve kadın teşkilatları; Kültürel etkinlikler | Five daily prayers; Friday prayer with Khutbah; Quran courses for all ages; Islamic education; Weddings and religious ceremonies; Counseling and spiritual guidance; Youth and women organizations; Cultural events | Contact.dc.html:83; Contact.tsx:50-57,106-113,162-169 |
| contact.visit.title | Besucher willkommen | Ziyaretçiler hoş geldiniz | Visitors Welcome | Contact.dc.html:64; Contact.tsx:75,131,187 |
| contact.visit.text | Alle Menschen sind herzlich eingeladen, unsere Moschee zu besuchen. Führungen sind nach Vereinbarung möglich. | Tüm insanlar camiamizi ziyaret etmeye davetlidir. Rehberli turlar randevu ile mümkündür. | All people are cordially invited to visit our mosque. Guided tours are available by appointment. | Contact.dc.html:65; Contact.tsx:76,132,188 |
| contact.visit.tours | Führungen | Rehberli turlar | Tours | Contact.dc.html:66; Contact.tsx:422 (Ternary) |
| contact.visit.appointments | Termine | Randevular | Appointments | Contact.dc.html:66; Contact.tsx:426 (Ternary) |

## DATEN

Vorschlag (A7). Deutsch Pflicht, tr und en optional mit sichtbarem Rückfall auf Deutsch (K-02). Seitentexte bleiben in messages/{de,tr,en}.json.

- gemeinde_kontakt (ein Datensatz): strasse, plz_ort, telefon, notfall_telefon, email, website; Text oder URL, mehrsprachig nein. land: Text, mehrsprachig ja (Contact.tsx:30,86,142).
- oeffnungszeiten (Liste): bezeichnung, zeit, freitag_hinweis; Text, mehrsprachig ja.
- anfahrt (Liste, drei Einträge): titel, text; Text, mehrsprachig ja. haltestelle, linien; Text, mehrsprachig nein.
- angebote (Liste, acht Einträge): text; Text, mehrsprachig ja.
- besuchstext und notfalltext: Langtext, mehrsprachig ja.

## FORMULARFELDER

– (entfaellt, kein Formular in Contact.dc.html oder Contact.tsx; Laufbuch.dc.html:163 nennt dennoch „Formularfelder“, siehe OFFENE FRAGEN).

## INTERAKTIONEN

- „Google Maps“ (Contact.dc.html:26): Design-Anker auf #karte. Bestand öffnet die Suche mit der Adresse in neuem Tab (Contact.tsx:207–211, 254). Hover: Hintergrund #EBF9F2, Schrift #065F46.
- E-Mail: mailto-Link (Contact.dc.html:31; Contact.tsx:195–197, 283–288).
- Telefon (:30) und Notfallnummer (:46): im Design ohne Link. Bestand: tel:-Buttons (Contact.tsx:199–205, 274–279, 308–313).
- „Gebetszeiten“ (:41): Link auf PrayerTimes.dc.html. Ziel laut K-03 ist /gebetszeiten.
- Fokus: 2 px Umriss #0E3929 mit 2 px Abstand (:13).
- Ohne Interaktion: Chips (:66), Kartenplatzhalter (:56).

## ZUSTAENDE

- Eigenschaften (data-props): keine am Seitenskript (Contact.dc.html:74). renderVals() liefert ways (drei Einträge) und services (acht Einträge).
- Gesetzte Attribute der Imports: Header active="moschee", current="contact" (:16); Breadcrumbs label="Kontakt" (:18); PageHeader eyebrow, title, subtitle (:20); Icon n und size (16, 20, 24 oder 28). Optionen und Defaults stehen in den Komponentenblättern; Header-Optionen laut Laufbuch.dc.html:148.
- Sprache: de (Standard, lang="de" fest in :15); tr und en über LanguageContext (Contact.tsx:17, 193).
- Bestand: keine Lade-, Leer-, Fehler- oder Erfolgszustände (Contact.tsx nutzt nur useLanguage, :20).
- Einspaltig bei schmaler Breite (abgeleitet aus minmax(min(100%,300px),1fr), :22).
- Fehler, leer, Erfolg: – (entfaellt, keine Daten- oder Formularzustände).

## BILDER

- Keine Fotos. Icons (Lucide, Icon.dc.html): map-pin, phone, external-link, mail, clock, arrow-right, heart, users, check, book-open, calendar; dynamisch navigation, car, map (:53).
- Kartenplatzhalter mit Streifen und Text (:56, role="img", aria-label „Karte: Anfahrt [Adresse]“). Keine Kachel aus dem Netz (readme.md:43). readme.md:22 verbietet Muster hinter Text; Entscheidung offen.

## AUFFAELLIGKEITEN

1. Öffnungszeiten widersprechen sich: Design „Mo.–Fr. 9:00–17:00 Uhr“ (:39) und Bestand (Contact.tsx:45) gegen Footer „Mo - Fr: 09:00 - 22:00“ und „Sa - So: 08:00 - 22:00“ (Footer.tsx:129–140); bestätigt durch Laufbuch.dc.html:242. Footer zeigt „Jetzt: Geöffnet“ als festen Text (Footer.tsx:145–148).
2. Google Fonts laden beim Seitenaufruf (Contact.dc.html:11–12). K-14 verbietet Anfragen an Dritte beim Seitenaufruf; Laufbuch.dc.html:222 erlaubt Google Fonts.
3. Google-Maps-Button: Design intern (#karte, :26), Bestand extern (Contact.tsx:207–211). Laufbuch.dc.html:249 verlangt den Link erst nach Adressbestätigung.
4. Gebetszeiten-Link zeigt auf PrayerTimes.dc.html (:41), nicht auf /gebetszeiten (K-03).
5. Mindesthöhe: mailto-Link (:31) und Gebetszeiten-Link (:41) sind 44 px hoch; gefordert sind 48 px (readme.md:21; Laufbuch.dc.html:217).
6. Telefonnummern: im Design ohne Link (:30, :46), im Bestand tel:-Buttons (Contact.tsx:274–279, 308–313).
7. Buslinien: Design [Haltestelle], [Linien] (:79); Bestand mit konkreten Beispielwerten (Contact.tsx:63, 119, 175). Design gilt.
8. Zeitformat: Design „12:00–14:30 Uhr“ (:38) nach D-10 (Laufbuch.dc.html:193); Bestand mit Leerzeichen (Contact.tsx:43), tr und en ohne „Uhr“ (:99, :155), en mit AM/PM (:157). Design gilt.
9. Eyebrow „Moschee“ (:20) fehlt im Bestand (Contact.tsx:219–225).
10. lang="de" ist fest (:15); Z-08 verlangt tr und en (Laufbuch.dc.html:220).
11. Bestand nutzt Verläufe (Contact.tsx:214, 216); readme.md:22 verbietet sie. Design gilt.
12. Chips „Führungen“ und „Termine“ stehen als Ternaries im JSX (Contact.tsx:422, 426), nicht im Textobjekt.
13. Freitagsgebet-Zeit, Parkplatz- und Fußwegangabe sind unbestätigt (G-06; Laufbuch.dc.html:249).

## OFFENE FRAGEN

1. Welche Adresse gilt? Laufbuch.dc.html:225 nennt für Über uns einen abweichenden Standort.
2. Gelten die Bürozeiten (9:00–17:00) oder die Footer-Zeiten (09:00–22:00)?
3. Hat die Gemeinde Freitagsgebet-Zeit, Parkplatz- und Fußwegangabe bestätigt?
4. Wer liefert Haltestelle, Buslinien und Notfallnummer (Laufbuch.dc.html:249, 259–260)?
5. Soll ein Kontaktformular hinzukommen (Laufbuch.dc.html:163)?
6. Zeigt der Google-Maps-Button extern oder auf #karte (D-11)?
7. Sollen Telefonnummern klickbar sein (tel:)?
8. Wie lauten die tr- und en-Pfade für /kontakt und das Ziel „Gebetszeiten“?
9. Wer liefert die fehlenden TR- und EN-Fassungen (Marker „– (nur DE in Quelle)“)? Neue Übersetzungen sind in MENSCHEN.md zu markieren (K-02).
10. Bleiben die Google Fonts (K-14), oder werden die Schriften lokal abgelegt?
11. Welche bestätigte Quelle speist die PrayerTimesBar (G-06; Laufbuch.dc.html:232)?

=== ENDE S11 · BEREIT ZUR RÜCKGABE ===
