# Komponentenblatt OrgCard

C08 · Kundschafter · Haiku 5.5 · Phase P0 · Kern-Version 1.0

Kürzel: DC = OrgCard.dc.html · TSX = IGMGInfo.tsx · LB = 00 Laufbuch.dc.html · RM = readme.md · BE = Bestand (uploads/igmg-wetzlar-website/src/app/components): LC = LanguageContext.tsx, BC = Breadcrumbs.tsx, ES = EventsSection.tsx, ED = EventDetails.tsx, HT = Header.tsx · EC = EventCard.dc.html · HD = Header.dc.html. Zahlen sind Zeilen.

## SEITE

Komponente „OrgCard“, Karte je Organisation, gemeinsamer Baustein (LB 184). Plan: Gruppe 02.5–02.11 mit Code ui/card (LB 152) und Eintrag 02.x (LB 276).

## ROUTE

– (entfaellt, keine eigene Route). Eingebunden auf dem IGMG Dachverband (IGMGInfo.dc.html 88–91; LB 164, 316) und als Schwesterkarten auf den Organisationsseiten (OrganizationPage.dc.html 85). Linkziele je Karte: AnatolianOrganization, WomensOrganization, YouthOrganization, WomensYouthOrganization (.dc.html; DC 28–31, Eigenschaft href). Bestand-Routenschlüssel: anatolian-organization, womens-organization, youth-organization, womens-youth-organization (BC 32–35). Die Route der IGMG-Seite steht nicht in den Quellen.

## QUELLEN

DC (41 Zeilen) und TSX vollständig gelesen; TSX enthält keine Organisationskarte. Hilfen: RM 19–24 und 37, LB vollständig, tokens/colors.css, spacing.css, fonts.css, Icon.dc.html 21 (arrow-right), vier Logos in assets/. Übersetzungen geprüft in BE, EC und HD.

## ZWECK

Karte mit Akzentband, Logo, Name, Kurzbezeichnung, Beschreibung und Pfeil. Die ganze Karte führt zur Organisationsseite (DC 15–22).

## ABSCHNITTE

Von außen nach innen (DC 15–22):

1. Wurzel „article“, data-component „OrgCard“: weiß, Rand 1 px #DFDAD2, Radius 12, Schatten --shadow-1, Atkinson Hyperlegible Next 18 px, Zeilenhöhe 1,5, Farbe #1D1A17 (DC 15).
2. Akzentband: 6 px hoch, Akzentfarbe, aria-hidden (DC 16).
3. Inhaltsfläche: Innenabstand 24 px, Abstand 12 px, Tönungsfläche (DC 17).
4. Logo-Feld: weiß, Innenabstand 6 px, Rand 2 px Akzent, Radius 12; Bild 40 × 40 px, alt leer (DC 18).
5. Titel h3: Source Serif 4, Gewicht 600, 24 px, Zeilenhöhe 1,25; darin der Link mit Unterstrich in Akzent (DC 19).
6. Kurzbezeichnung: 16 px, fett, Tinte der Organisation (DC 20).
7. Beschreibung: 16 px, Farbe #514C46 (DC 21).
8. Pfeil: aria-hidden, dc-import „Icon“ mit n="arrow-right", size="20", hint-size="20px,20px" (DC 22).

Texte (Schluessel-Vorschlag; Bestandsübersetzungen gehen vor):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| org.at.name | Ana Teşkilatı (abgeleitet) | Ana Teşkilatı | Ana Teşkilatı (abgeleitet) | DC 28, Eigenname; Konflikt BC 32 |
| org.kt.name | Kadın Teşkilatı (abgeleitet) | Kadın Teşkilatı | Kadın Teşkilatı (abgeleitet) | DC 29, Eigenname |
| org.gt.name | Gençlik Teşkilatı (abgeleitet) | Gençlik Teşkilatı | Gençlik Teşkilatı (abgeleitet) | DC 30, Eigenname; ED 82 gleich |
| org.kgt.name | Kadın Gençlik Teşkilatı (abgeleitet) | Kadın Gençlik Teşkilatı | Kadın Gençlik Teşkilatı (abgeleitet) | DC 31; Konflikt BC 35, ED 84 |
| org.at.short | AT (Erwachsene) | AT (Yetişkinler) | AT (Adults) | DC 28; LC 40 / 298 / 556; EC 55–57 |
| org.kt.short | KT (Frauen) | KT (Kadınlar) | KT (Women) | DC 29; LC 45 / 303 / 561; EC 55–57 |
| org.gt.short | GT (Jugend) | GT (Gençlik) | GT (Youth) | DC 30; LC 50 / 308 / 566; EC 55–57 |
| org.kgt.short | KGT (Frauenjugend) | KGT (Kadın Gençlik) | KGT (Women's Youth) | DC 31; LC 55 / 313 / 571; LB 201 |
| org.desc.default | Veranstaltungen und Aktivitäten | – (nur DE in Quelle) | – (nur DE in Quelle) | DC 26, 36; HT 313; HD 146, 152, 155 |

## DATEN

Vorschlag (A7). Die vier Organisationen sind feste Konfiguration (LB 280). Falls die Verwaltung sie pflegt:

- Schlüssel: Auswahl at | kt | gt | kgt; nicht mehrsprachig; Pflicht.
- Name: Text; nicht mehrsprachig (Eigenname); Pflicht.
- Kurzbezeichnung und Beschreibung: Text; mehrsprachig ja; DE Pflicht, TR und EN mit Rückfall auf DE (K-02).
- Logo: Medienverweis; nicht mehrsprachig; Pflicht.
- Linkziel: Verweis auf die Organisationsseite; nicht mehrsprachig; lokalisierter Pfad (K-02).

Farben bleiben Tokens (LB 187, D-06) und sind kein Datenfeld.

## FORMULARFELDER

– (entfaellt, reine Anzeigekarte ohne Eingabefelder; DC 15–22).

## INTERAKTIONEN

- Klick: Das ::after des Titellinks deckt die ganze Karte ab (DC 19); Ziel ist href (DC 28–31).
- Hover: Schatten --shadow-2 und Rand #047857 an der Karte (DC 15); der Titel wechselt auf die Tinte der Organisation (DC 19).
- Tastatur: einziges Ziel ist der Titellink; Fokus 2 px #0E3929 mit 2 px Abstand (DC 13). Abgeleitet: der Ring liegt am Namen, nicht an der ganzen Karte; Umsetzung prüfen.
- Kein Klick-Handler und kein Zustandswechsel; der Pfeil ist dekorativ (DC 22).

## ZUSTAENDE

Eigenschaften aus data-props (DC 26):

- org (enum): Optionen at | kt | gt | kgt; Default at. Unbekannter Wert fällt still auf at zurück (DC 35).
- desc (text): Default „Veranstaltungen und Aktivitäten“; tsType string. Leerer Wert zeigt den Default (DC 36).
- $preview: 320 × 300 (Vorschau, kein Prop).

Varianten (Akzent · Text · Tönung; DC 28–31, Werte identisch mit TOK --org-*): at #047857 · #065F46 · #E7F8F0; kt #592E81 · #592E81 · #F7F0FF; gt #008C98 · #006177 · #E6F7FD; kgt #9B255A · #9B255A · #FFEEF3.

Gestaltzustände: Standard, Hover (DC 15, 19), Fokus (DC 13). Leer gilt nur für desc. Fehler, Erfolg, Schritt, angemeldet und Sprache fehlen (DC 26). Deaktiviert und ausgewählt stehen nur in LB 152 für die Gruppe.

Bewegung: 150 ms für Schatten und Rand (DC 15; TOK --transition); keine Abschaltung bei „Bewegung reduzieren“ (RM 24).

Kontrast (abgeleitet, WCAG-Formel): Kurzbezeichnung 6,41–8,85:1; Beschreibung 7,60–7,72:1; Name 15,49–15,74:1. Der GT-Akzentband ergibt 4,03:1 gegen Weiß und ist nur als Fläche zulässig (LB 187).

Bestand (BE): TSX kennt nur den Seitenzustand activeTab (TSX 172; Werte overview, meaning, history, structure, contact; TSX 175–181). Im Tab Struktur (TSX 353–420) stehen drei Ebenenkarten (TSX 389–415), keine Organisationskarten.

## BILDER

- Logo je Organisation (DC 18; Pfad DC 28–31): assets/logo-igmg-wetzlar.png (at), assets/logo-kadin.png (kt), assets/logo-genclik.png (gt), assets/logo-kadin-genclik.png (kgt). Alle vier vorhanden.
- Dateiprüfung: je 40 × 40 px, RGB ohne Transparenz, weißer Grund (LB 231).
- Keine Fotos und keine Platzhalterstreifen. Eine größere, freigestellte Fassung (SVG oder PNG ab 512 px) fehlt (LB 231).

## AUFFAELLIGKEITEN

1. Logo-Zuordnung widerspricht dem Bestand: Design (LB 34, DC 28–31) ordnet 301e0b5b dem GT, efe65084 dem KT und 8ce65541 dem KGT zu; BE ES 10–12 und ED 25–27 ordnen 8ce65541 dem GT, 301e0b5b dem KT und efe65084 dem KGT zu (LB 230 bittet um Bestätigung).
2. Namen weichen ab: „Ana Teşkilatı“ (DC 28) gegen „Anadolu Teşkilatı“ (BC 32); „Kadın Gençlik Teşkilatı“ (DC 31) gegen „Kız Gençlik Teşkilatı“ (BC 35, ED 84). LB 228–229 entscheidet für das Design.
3. Schriften: Das Design lädt Google Fonts (DC 11–12; LB 183, D-02), K-04 verlangt selbst gehostete Schriften über next/font.
4. Bewegung: 150-ms-Übergänge ohne Reduced-Motion-Regel (DC 15); K-11 und RM 24 verlangen die Abschaltung.
5. Sprache: Der türkische Name steht ohne lang-Attribut (DC 19); K-11 verlangt ein lang-Attribut je Sprache.
6. Beschreibung in TR und EN: HD 152 und 155 erben „Veranstaltungen und Aktivitäten“ auf Deutsch; die Quellen liefern keine Übersetzung.
7. Hartkodierte Werte: Farben und Maße stehen im Design als Hex- und px-Werte (DC 13–22), obwohl TOK dieselben Werte als Variablen führt (LB 216, Z-04).

## OFFENE FRAGEN

1. Welche Logo-Zuordnung gilt, die des Designs (LB 34) oder die des Bestands (ES 10–12)?
2. Heißen AT und KGT „Ana“ und „Kadın Gençlik“ oder „Anadolu“ und „Kız Gençlik“?
3. Bleibt der Eigenname türkisch, oder soll er auch in DE und EN erscheinen?
4. Welche TR- und EN-Fassung gilt für „Veranstaltungen und Aktivitäten“?
5. Welche Route hat die IGMG-Seite, da App.tsx und RouteContext.tsx nicht in den Quellen liegen?
6. Gilt Google Fonts (DC 11–12) oder next/font (K-04)?
7. Soll ein unbekannter org-Wert einen Fehler zeigen, statt still auf AT zurückzufallen (DC 35)?
8. Entfallen deaktiviert und ausgewählt aus LB 152, oder gelten sie für die Karte?
9. Liefert die Gemeinde größere Logos, wie LB 231 verlangt?
10. Kommen die Organisationsdaten aus der Datenbank oder aus fester Konfiguration (DATEN)?

=== ENDE C08 · BEREIT ZUR RÜCKGABE ===
