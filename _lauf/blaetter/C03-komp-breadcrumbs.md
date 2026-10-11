# Komponentenblatt Breadcrumbs

C03 · Kundschafter · Haiku 5.5 · Phase P0 · Kern-Version 1.0

Kürzel: DC = Breadcrumbs.dc.html, TSX = Breadcrumbs.tsx, RM = readme.md, LB = 00 Laufbuch.dc.html. Zahlen sind Zeilen.

## SEITE

Komponente „Breadcrumbs“ (LB 150, Plan 02.3).

## ROUTE

– (entfaellt, keine eigene Route). Einsatz auf Unterseiten, nicht auf „home“ und „styleguide“ (TSX 16–18; LB 281, D-16).

## QUELLEN

DC (32 Zeilen) und TSX (148 Zeilen) vollständig gelesen, beide nur lesend. Aus RM: 19, 21, 25, 28, 37. Aus LB: 67, 150, 154–160, 179, 209, 216–217, 228–229, 281, 312.

## ZWECK

Navigationspfad auf Unterseiten: Startseite, optional Elternseite, aktuelle Seite (DC 14–22; LB 150).

## ABSCHNITTE

Von außen nach innen. Bestandswerte in Klammern.

1. Wurzel nav, aria-label „Breadcrumb“, Hintergrund #F3F0E9, Unterkante 1 px #DFDAD2, Schrift Atkinson Hyperlegible Next (DC 14). (Bestand: bg-slate-50, border-slate-200, TSX 107–108.)
2. Liste ol: max. 1344 px, vertikal 4 px, seitlich clamp(8px, 4cqi − 8px, 24px), umbrechend, 16 px, Zeilenhöhe 1,4 (DC 15). (Bestand: max-w-7xl, py-3, text-sm, TSX 110–111.)
3. Teil Startseite: Link mit Icon n="house" 16 px, Abstand 6 px, min. 44 px hoch, Radius 6 px, Unterstrich, Farbe #514C46 (DC 16). (Bestand: Button mit Home-Icon nur bei erster Ebene, TSX 128–139.)
4. Teil Elternseite, nur bei gesetztem parentLabel: Trenner Icon n="chevron-right" 16 px, aria-hidden, Farbe #68625B; Link wie Teil 3, ohne Icon (DC 17–19). (Bestand: nicht vorhanden.)
5. Teil aktuelle Seite: Trenner, span mit aria-current="page", Schrift 700, Farbe #065F46, min. 44 px (DC 20). (Bestand: font-medium, text-emerald-700, TSX 121–127.)

### Texte

Schluessel-Vorschlag für messages/{de,tr,en}.json (K-02). Türkische Zeichen wie in der Quelle.

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| breadcrumb.navLabel | – (nur EN in Quelle) | – (nur EN in Quelle) | Breadcrumb | DC 14; TSX 107 |
| breadcrumb.home | Startseite | Ana Sayfa | Home | DC 16; TSX 97 |
| breadcrumb.homeAria | Gehe zu Startseite | Git Ana Sayfa | Go to Home | DC 16; TSX 135 (tr/en abgeleitet) |
| breadcrumb.fallback | Seite | – (nur DE in Quelle) | – (nur DE in Quelle) | DC 27 |
| route.dashboard | Dashboard | Gösterge Paneli | Dashboard | TSX 22/45/68 |
| route.prayer-times | Gebetszeiten | Namaz Vakitleri | Prayer Times | TSX 23/46/69 |
| route.event-details | Veranstaltungsdetails | Etkinlik Detayları | Event Details | TSX 24/47/70 |
| route.news-details | Nachrichtendetails | Haber Detayları | News Details | TSX 25/48/71 |
| route.join-us | Mitglied werden | Üye Ol | Join Us | TSX 26/49/72 |
| route.student-registration | Schüler-Voranmeldung | Öğrenci Ön Kayıt | Student Registration | TSX 27/50/73 |
| route.about-us | Über uns | Hakkımızda | About Us | TSX 28/51/74 |
| route.board-members | Vorstand | Yönetim Kurulu | Board Members | TSX 29/52/75 |
| route.projects | Projekte | Projeler | Projects | TSX 30/53/76 |
| route.quran-courses | Korankurse | Kuran Kursları | Quran Courses | TSX 31/54/77 |
| route.anatolian-organization | Anadolu Teşkilatı | Anadolu Teşkilatı | Anatolian Organization | TSX 32/55/78 |
| route.womens-organization | Kadın Teşkilatı | Kadın Teşkilatı | Women's Organization | TSX 33/56/79 |
| route.youth-organization | Gençlik Teşkilatı | Gençlik Teşkilatı | Youth Organization | TSX 34/57/80 |
| route.womens-youth-organization | Kız Gençlik Teşkilatı | Kız Gençlik Teşkilatı | Women's Youth Organization | TSX 35/58/81 |
| route.mosque-request | Webseite anfragen | Web Sitesi Talebi | Request Website | TSX 36/59/82 |
| route.quran | Koran | Kuran | Quran | TSX 37/60/83 |
| route.islamic-knowledge | Islamisches Wissen | İslami Bilgi | Islamic Knowledge | TSX 38/61/84 |
| route.igmg | IGMG | IGMG | IGMG | TSX 39/62/85 |
| route.contact | Kontakt | İletişim | Contact | TSX 40/63/86 |
| route.events | Veranstaltungen | Etkinlikler | Events | TSX 41/64/87 |
| route.news | Neuigkeiten | Haberler | News | TSX 42/65/88 |

Route-Zeilen: Fundstelle TSX in der Reihenfolge de/tr/en. Eine Zeile für Rechtliches fehlt (siehe OFFENE FRAGEN).

## DATEN

Keine Datenbankinhalte, alle Texte sind UI-Texte (K-02). Vorschlag nur, falls Detailseiten ihren Titel als letzte Ebene zeigen: title, Text, mehrsprachig ja, Rückfall auf Deutsch. Im Design und Bestand nicht belegt.

## FORMULARFELDER

– (entfaellt, reine Navigation ohne Eingabe; DC 14–22).

## INTERAKTIONEN

- Startseite: Design href „Home.dc.html“ (DC 16); Bestand navigateTo('home') (TSX 130). Vorschlag K-02: „/“, „/tr“, „/en“ (abgeleitet).
- Elternseite (nur Design): Ziel parentHref (DC 18).
- Hover: Textfarbe #065F46 und Hintergrund #EBF9F2 (DC 16, 18); Bestand nur Textfarbe (TSX 132).
- Fokus: 2 px #0E3929 mit 2 px Abstand (DC 12; TSX 133).
- Aktuelle Seite: nicht klickbar, nicht fokussierbar (DC 20; TSX 121–127).

## ZUSTAENDE

Eigenschaften aus data-props (DC 24; alle editor „text“, tsType „string“):
- label: Standard „Veranstaltungsdetails“; leer ergibt „Seite“ (DC 27).
- parentLabel: Standard „Veranstaltungen“; leer ergibt keine Elternseite (DC 17, 27).
- parentHref: Standard „Events.dc.html“; leer ergibt „#“ (DC 27).
- $preview: 1440 × 56, nur Designwerkzeug.

Design-Zustände: Standard (drei Teile), ohne parentLabel (zwei Teile), Hover, Fokus (DC 12–20).

Bestand-Zustände:
a) currentRoute „home“ oder „styleguide“: nichts gerendert (TSX 16–18).
b) currentRoute leer: nur Startseite als aktuelle Seite, ohne Icon (abgeleitet, TSX 101–103, 121–127).
c) bekannte Route: zwei Teile (TSX 96–103).
d) Route ohne Übersetzung: roher Routenschlüssel (TSX 92–94).
e) Sprache de, tr, en: Labels je Sprache (TSX 97, 135). Sprachcode außer de, tr, en: Startseite „Home“ (TSX 97) neben rohem Routenschlüssel (TSX 93), abgeleitet und uneinheitlich.

Entfaellt: Fehler, Erfolg, Schritt, angemeldet; gelesen werden nur currentRoute und language (TSX 12–13). Plan-Zustand: „lang · Pfad“ (LB 150). Längste Fassung „Women's Youth Organization“, 26 Zeichen (LB 209).

## BILDER

Keine Bilder. Icons aus Icon.dc.html (RM 28, 37), je 16 px (DC 16–20). Bestand: lucide-react Home und ChevronRight (TSX 1, 119, 137).

## AUFFAELLIGKEITEN

1. Elternseite: im Design (DC 17–19, 24), im Bestand nicht (TSX 96–103); LB 312 nennt „Home · Events/News“.
2. Navigation: Design-Links mit Prototyp-Dateinamen (DC 16, 18, 24), Bestand Buttons mit navigateTo (TSX 129–130).
3. Schrift: Design 16 px (DC 15), Bestand text-sm 14 px (TSX 111); RM 19 verlangt nie unter 16 px.
4. Klickziel: Design 44 px (DC 16, 18); RM 21 und LB 217 verlangen 48 px, K-11 auf dem Telefon 48 px; Bestand ohne Mindesthöhe (TSX 132).
5. Gestalt: Design warm mit Unterstrich (DC 14–16), Bestand slate und emerald (TSX 108, 123, 132). Das Design gilt.
6. Gençlik: Bestand „Kız Gençlik Teşkilatı“ in de und tr (TSX 35, 58); LB 228 nennt „Kadın Gençlik Teşkilatı“ für Inhalte und Design.
7. Anadolu: Bestand „Anadolu Teşkilatı“ in de und tr (TSX 32, 55); LB 229 nennt „Ana Teşkilatı“ für Seite und Design.
8. Fallbacks: Design „Seite“ (DC 27), Bestand roher Schlüssel (TSX 93), Startseite auf Englisch (TSX 97).
9. Schrift: Design lädt Atkinson per Google-Fonts-Link (DC 11); K-04 verlangt next/font.
10. Icons: Design 16 px (DC 16–20), RM 28 nennt 20/24 px. Breite: Design 1344 px (DC 15), RM 25 nennt 1280 px, Bestand max-w-7xl (TSX 110).

## OFFENE FRAGEN

1. Wer setzt parentLabel und parentHref je Detailseite, und gilt die Elternseite dort?
2. Welche lokalisierten Pfade (K-02) gelten je Sprache für Startseite und Elternseiten?
3. Gilt 44 px oder 48 px als Mindesthöhe?
4. Welche Bezeichnung gilt: Kız oder Kadın Gençlik Teşkilatı, Anadolu oder Ana Teşkilatı?
5. Sollen fehlende Übersetzungen (nav „Breadcrumb“ de und tr, „Seite“ tr und en) in MENSCHEN.md stehen?
6. Die Seite Rechtliches hat keinen Routenschlüssel (TSX 21–89; LB 67, 179), ihr Label fehlt.
7. Der Plan nennt Breadcrumbs nur bei 03.2–03.6, 04.1 und Rechtliches (LB 154–160, 179); Z-04 verlangt alle Seiten (LB 216). Zuordnung für 04.2–07.3 ist offen.
8. Setzt das Icon-Blatt aria-hidden? Das Startseiten-Icon im Link hat es nicht (DC 16).
9. Soll der Titel einer Detailseite als letzte Ebene aus der Datenbank kommen?

=== ENDE C03 · BEREIT ZUR RÜCKGABE ===
