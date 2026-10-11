# C05 · Komponentenblatt „PageHeader“

C05 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Komponentenblatt „PageHeader“ · Schwierigkeit 1

Kürzel: DC = PageHeader.dc.html; LB = 00 Laufbuch.dc.html; RM = readme.md; TK = tokens/colors.css (Designordner). BE = uploads/igmg-wetzlar-website/src/app/components/ (nur gelesen; Kopie identisch). LC = BE/LanguageContext.tsx. Zahlen = Zeilen.

## SEITE

Komponente „PageHeader“ (Komponentenblatt): gemeinsamer Seitenkopf der Unterseiten mit Titel (h1), optionalem Eyebrow, Untertitel, Logo und Akzentband (DC:15–31).

## ROUTE

Ziel-Route: Unterseiten (laut Auftrag). Konkrete Pfade je Sprache: – (nicht in den Quellen, siehe OFFENE FRAGEN). Einsatz laut Plan (LB:154–166): Gebetszeiten, Veranstaltungen, Nachrichten, Über uns, Projekte, Kontakt, IGMG-Dachverband, Quran, Islamisches Wissen. Nicht auf der Startseite (LB:153) und nicht im Vollbild (LB:155). Organisationsseiten nutzen den Kopf von OrganizationPage (LB:169–172, D-15 in LB:280).

## QUELLEN

Design: DC, Template :9–32, data-props :33, renderVals :35–43. Bestand: AboutUs.tsx :96–107, Events.tsx :28–31, :157, :281–294, News.tsx :29–32, :155, :278–291, LC (Schlüssel aboutUs, events, news; Navigation :22, :280, :538). Hilfen: RM :13, :19, :22, :24, :25, :29, :36; LB :34, :152–166, :183–187, :216, :220, :230–231, :257, :280–281; TK :5–6, :10–17, :23–26. Im Bestand gibt es keine PageHeader-Datei; die Köpfe sind inline.

## ZWECK

Gemeinsames Bauteil für den Kopf jeder Unterseite, importiert statt kopiert (D-03, LB:184). Position laut Plan: nach den Breadcrumbs, vor dem Inhalt (LB:156).

## ABSCHNITTE

Aufbau (DC:15–31; acht Bauteile, abgeleitet):
1. Hülle: Section, Hintergrund bg, Linie unten 1 px #DFDAD2, Schrift Atkinson, Farbe #1D1A17, container-type inline-size (DC:15).
2. Innenbereich: max. 1344 px, Ränder clamp(16px,4cqi,32px), oben clamp(32px,5cqi,64px), unten clamp(32px,4cqi,56px), Abstand 24 px, umbrechend (DC:16).
3. Logo-Box (nur mit logo): weiß, Rahmen 2 px accent, Radius 12 px, Innenabstand 8 px, Bild 40 × 40 px, außen 60 × 60 px (DC:17–19).
4. Textspalte: Spalte, Abstand 12 px, Basis 480 px, max. 880 px (DC:20).
5. Eyebrow (nur mit eyebrow): 16 px, fett, Farbe eyebrowColor, Abstand 8 px; davor dc-import „Icon“ mit n="stern8", size="14", hint-size="14px,14px" (DC:21–23; eigenes Blatt).
6. Titel h1: Source Serif 4, 600, clamp(36px, calc(24px + 1.7cqi), 48px), Zeilenhöhe 1,15, Laufweite -0,01em, text-wrap balance (DC:24).
7. Untertitel (nur mit subtitle): 20 px, Zeilenhöhe 1,55, #514C46, max. 62ch, text-wrap pretty (DC:26).
8. Akzentband (nur mit accent): 6 px, Farbe accent, aria-hidden, unten (DC:30).

Schriften: Atkinson 400/700, Source Serif 4 600 (DC:11–12), im Code über next/font (K-04). Google-Fonts-Links und Body-Stil (DC:11–13) sind Entwurfshilfen.

Tokens (TK): Titel --tinte, Untertitel --tinte-2, Papier --sand, Eyebrow --gruen-800, Akzent-Fallback --gruen-700; Tönungen --org-at-toenung bis --org-gt-toenung, Akzente --org-at bis --org-gt (TK:5–26).

Bestand-Köpfe (inline): AboutUs.tsx:97–107 zentriert, Verlauf emerald-700/600/700, h1 text-5xl. Events.tsx:282–294 und News.tsx:279–291 zentriert, Verlauf emerald-600/700, h1 text-4xl lg:text-5xl. Ohne Bild.

Texte Design (DC, Defaults und Fallback):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| pageHeader.title | Unsere Veranstaltungen | Etkinliklerimiz | Our Events | DC:33; tr/en LC:360, :618 |
| pageHeader.subtitle | Entdecken Sie die vielfältigen Aktivitäten und Programme unserer Gemeinde für alle Altersgruppen. | Tüm yaş grupları için cemaatimizin çeşitli aktivite ve programlarını keşfedin. | Discover the diverse activities and programs of our community for all age groups. | DC:33; tr/en LC:361, :619 |
| pageHeader.eyebrow | Moschee | Cami (abgeleitet) | Mosque (abgeleitet) | DC:33; tr/en LC:280, :538 (Navigation LC:22) |
| pageHeader.fallback | Seitentitel | – (nur DE in Quelle) | – (nur DE in Quelle) | DC:38 (renderVals) |

Texte Bestand (je Sprache mit Fundstelle):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| aboutUs.title | Über uns | Hakkımızda | About Us | LC:210, :468, :726; AboutUs.tsx:101 |
| aboutUs.subtitle | Die Geschichte der IGMG Fatih Camii Wetzlar | IGMG Fatih Camii Wetzlar'ın Hikayesi | The Story of IGMG Fatih Camii Wetzlar | LC:211, :469, :727; AboutUs.tsx:103 |
| events.title (inline) | Veranstaltungen | Etkinlikler | Events | Events.tsx:30, :72, :114 |
| events.subtitle (inline) | Aktuelle Veranstaltungen und Events der IGMG Wetzlar Moschee | IGMG Wetzlar Camii'nin güncel etkinlikleri ve organizasyonları | Current events and activities at IGMG Wetzlar Mosque | Events.tsx:31, :73, :115 |
| news.title (LC) | Neuigkeiten | Haberler | News | LC:114, :372, :630 |
| news.subtitle (LC) | Bleiben Sie über die neuesten Entwicklungen in unserer Gemeinde informiert. | Cemaatimizin en son gelişmelerinden haberdar olun. | Stay informed about the latest developments in our community. | LC:115, :373, :631 |
| news.title (inline) | Nachrichten | Haberler | News | News.tsx:31, :72, :113 |
| news.subtitle (inline) | Aktuelle Nachrichten und Ankündigungen der IGMG Wetzlar Moschee | IGMG Wetzlar Camii'nin güncel haberleri ve duyuruları | Latest news and announcements from IGMG Wetzlar Mosque | News.tsx:32, :73, :114 |

## DATEN

Titel, Untertitel und Eyebrow kommen aus messages/{de,tr,en}.json (K-02), nicht aus der Datenbank. Vorschlag, falls die Verwaltung Seitenköpfe pflegen soll (offen): Tabelle page_header mit seite_schluessel (Text, mehrsprachig nein), title (Text, ja: de Pflicht, tr/en mit Rückfall auf de), subtitle (Text, ja, optional), eyebrow (Text, ja, optional), logo (Bildverweis, nein), logo_alt (Text, ja), accent (Auswahl AT, KT, KGT, GT; nein), bg (Auswahl Sand oder Tönung; nein).

## FORMULARFELDER

– (entfaellt, reine Anzeige ohne Eingabefelder)

## INTERAKTIONEN

– (entfaellt, keine Bedienelemente; Logo ohne Link; keine Animation, RM:24)

## ZUSTAENDE

Eigenschaften aus data-props (DC:33) mit Verhalten ohne Wert (DC:38–41). Vorschau: 1440 × 260 (DC:33).

| Eigenschaft | Editor und Optionen | Default | Ohne Wert |
|---|---|---|---|
| title | Text | Unsere Veranstaltungen | „Seitentitel“ (DC:38) |
| subtitle | Text | siehe Tabelle Design | kein Untertitel (DC:39) |
| eyebrow | Text | Moschee | kein Eyebrow (DC:39) |
| bg | Farbe: #F3F0E9, #E7F8F0, #F7F0FF, #FFEEF3, #E6F7FD | #F3F0E9 | #F3F0E9 (DC:41) |
| accent | Farbe: #047857, #592E81, #9B255A, #008C98 | leer | kein Band (DC:39); Logo-Rahmen #047857 (DC:40) |
| eyebrowColor | Farbe: #065F46, #592E81, #9B255A, #006177 | #065F46 | #065F46 (DC:41) |
| logo | Text (Bildadresse) | leer | kein Logo (DC:39) |
| logoAlt | Text | leer | leer (DC:40) |

Zustände:
- Z1 nur Titel: Referenzbelege PageHeader__1440.png (1440 × 177) und PageHeader__390.png (390 × 107), in _lauf/belege/referenz, zeigen nur „Seitentitel“.
- Z2 Titel, Eyebrow, Untertitel (Normalfall); Z3 mit Logo; Z4 mit Akzentband; Z5 Sprache de, tr, en (Titel bricht um).
- Bestand: keine Lade-, Fehler- oder Leerzustände im Kopf (AboutUs.tsx:97–107; Events.tsx:282–294; News.tsx:279–291). „liste/leer“ betrifft nur die Ergebnisliste (LB:156, :158).
- Kontrast (abgeleitet, WCAG-Formel): Titel 15,22 bis 15,74:1, Untertitel 7,46 bis 7,72:1, Eyebrow 6,20 bis 8,95:1 auf allen Tönungen; K-11 erfüllt.

## BILDER

Kein festes Bild. Optionales Logo: PNG 40 × 40 px mit weißem Grund (sips geprüft): assets/logo-igmg-wetzlar.png, logo-genclik.png, logo-kadin.png, logo-kadin-genclik.png (LB:34). Zuordnung strittig (LB:230), größere Fassungen gewünscht (LB:231). Bestand-Köpfe ohne Bild. Die Platzhalterliste nennt Seitenköpfe für Fotoflächen (LB:257).

## AUFFAELLIGKEITEN

1. Veranstaltungen: Design „Unsere Veranstaltungen“ (DC:33, LC:102) gegen Bestand „Veranstaltungen“ (Events.tsx:30), Untertitel ebenso (Events.tsx:31). Design gilt für de.
2. Nachrichten: Seitenname „Nachrichten“ (News.tsx:31, LB:158) gegen „Neuigkeiten“ (LC:114).
3. Gestalt: Bestand zentriert mit grünem Verlauf (AboutUs.tsx:97, Events.tsx:282); RM:22 verbietet Verläufe. Design linksbündig und flach (DC:15–16); Design gilt für die Gestalt.
4. Maße: Maximalbreite 1344 px (DC:16) gegen „max. 1280 px“ (RM:25); Untertitel 20 px/1,55 (DC:26) gegen 18 px/1,6 (RM:19, LB:183).
5. Platzhalter: „Seitentitel“ (DC:38) ist sichtbar und ohne eckige Klammern (RM:13). Editor-Default (DC:33) und Referenzbelege weichen ab.
6. Akzentband: leerer Default blendet das Band aus (DC:39); der Logo-Rahmen fällt auf #047857 zurück (DC:40).
7. logoAlt: leerer Default (DC:33) ergibt alt="" (DC:18) bei Logo; Textalternative offen (K-11, WCAG 2.2 AA).
8. Fotoflächen: Die Platzhalterliste nennt Seitenköpfe (LB:257); das Design hat keine Bildfläche.
9. Eyebrow „Moschee“ entspricht der Navigationskategorie (LC:22) und ist in keinem Bestand-Kopf belegt.
10. Abnahme: Z-04 (LB:216) und Z-08 (LB:220) nennen den Kopf nicht.

## OFFENE FRAGEN

1. Welche TR- und EN-Fassung gilt für Veranstaltungen und Nachrichten: LC oder die Inline-Texte in Events.tsx und News.tsx?
2. Welche Pfade gelten je Sprache für die Unterseiten (K-02)?
3. Gibt es je Seite einen Eyebrow, und welcher Text gilt dafür („Moschee“, „Cami“, „Mosque“)?
4. Welches Logo gehört zu welcher Organisation (LB:34 gegen LB:230), und welche Alternativtexte gelten?
5. Sollen Titel und Untertitel über die Verwaltung pflegbar sein (DATEN)?
6. Nutzen die Organisationsseiten den PageHeader mit Logo und Akzent oder den Kopf von OrganizationPage (LB:280)?
7. Sind Fotos im Seitenkopf vorgesehen (LB:257 gegen DC)?
8. Offen bleibt der Abgleich mit 02 Komponenten.dc.html (RM:36, LB:152) und mit web/src/components/website/PageHeader.tsx, das im Arbeitsordner bereits existiert; beides ist nicht als Quelle ausgewertet.

=== ENDE C05 · BEREIT ZUR RÜCKGABE ===
