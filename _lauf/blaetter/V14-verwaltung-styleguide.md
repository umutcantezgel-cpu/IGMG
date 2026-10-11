# V14 · Verwaltung: Styleguide aus den Design-Tokens

V14 · Kundschafter · Phase P0 · Kern-Version 1.0 · Plan-Nr. 07.4 Styleguide

## SEITE

Verwaltungsmodul „Verwaltung: Styleguide aus den Design-Tokens“, Plan-Nr. 07.4 (00 Laufbuch.dc.html, plan). Im Bestand öffentlich, in V14 nur in der Verwaltung (Paketvorgabe).

## ROUTE

/verwaltung/styleguide (Ziel laut Auftrag). Öffentliche Bestandsroute: – (nicht in den Quellen).

## QUELLEN

Design gelesen: Styleguide.dc.html (Template und renderVals), 01 Grundlagen.dc.html, 02 Komponenten.dc.html, readme.md, 00 Laufbuch.dc.html. Zusätzlich nur gelesen: tokens/colors.css, typography.css, spacing.css, fonts.css. Bestand gelesen: Styleguide.tsx, styleguide/StyleguideData.ts (Kürzel „ts“). Nicht gelesen: 13 Unterkomponenten (.tsx) in styleguide/ (nicht in den Quellen).

## ZWECK

Nachschlagewerk der Designwerte (Farben, Typografie, Abstände, Radien, Komponenten, Icons, Tabellen, Barrierefreiheit). Seitenauftrag: „Die echten Werte des Designsystems“ (Styleguide.dc.html, Z. 19). Zielgruppe der Verwaltung: abgeleitet, nicht belegt.

## ABSCHNITTE

Reihenfolge (Styleguide.dc.html): Kopf, Abschnittsnavigation mit 15 Pillen, danach Farben (#farben), Typografie (#typografie), Abstände (#abstaende), Radius (#radius), Buttons · Forms · Tags & Chips · Navigation (#buttons), Events · Basis UI · Medien (#events), Icons (#icons), Tabellen (#tabellen), Dropdowns · UI-Komponenten (#ui), Accessibility (#a11y), Design System Information (#info; in der Navigation nicht verlinkt, abgeleitet), Fuß.

Komponenten, eigene Blätter, hier nur genannt: Header (active="", current="styleguide", logged-in="{{ true }}", Z. 16), PrayerTimesBar (Z. 17), PageHeader (eyebrow, title, subtitle, Z. 19), BaseComponents (Z. 37), EventCard (Z. 41), NewsCard (variant="default", Z. 42), Icon (n, size; Z. 44, 45, 52, 62), Footer (Z. 69).

Ankerziele der Navigation (renderVals, Z. 78): Forms, Navigation, Tags & Chips auf #buttons; Medien, Events, Basis UI auf #events; Dropdowns, UI-Komponenten auf #ui.

Texte. „Z.“ ist die Zeile in Styleguide.dc.html. Schlüssel sind Vorschläge, Token-Namen laut tokens/colors.css.

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| seite.kopf | IGMG Wetzlar Design System; Styleguide & Design System; Die echten Werte des Designsystems „IGMG Wetzlar“ – Grundlage für alle Seiten und die Umsetzung mit Tailwind und shadcn/ui. | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 19 |
| nav.abschnitte | Abschnitte; Farben; Typografie; Abstände; Buttons; Forms; Medien; Dropdowns; Events; Radius; Basis UI; Icons; Tabellen; Navigation; Tags & Chips; UI-Komponenten | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 21, 78 |
| farben | Farben; Grün-700 · Marke (#047857): Buttons, Links; Grün-800 (#065F46): Hover, Text auf Tönung; Tiefgrün (#0E3929): Leiste, Footer, Fokus; Grün hell (#D3F0E2): Ausgewählt; Grün-Tönung (#EBF9F2): Hover-Fläche; Tinte (#1D1A17): Text; Tinte-2 (#514C46): Sekundärtext; Rand (#8C857C): Feldränder; Linie (#DFDAD2): Trenner; Sand (#F3F0E9): Flächen; Papier (#FCFAF6): Seitengrund; Fehler (#AF2B25): Fehler; Warnung (#81520A): Hinweis; Info (#225899): Information; AT (#047857): Ana Teşkilatı; KT (#592E81): Kadın Teşkilatı; KGT (#9B255A): Kadın Gençlik Teşkilatı; GT (#008C98): Gençlik Teşkilatı (Fläche); Vollständige Kontrasttabelle (01 Grundlagen) | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 23–25, 79 |
| typografie | Typografie; H1 · Source Serif 4 · 48/36: Gebetszeiten; H2 · 36/30: Unsere Veranstaltungen; H3 · 30/24: Unsere Werte; H4 · 24: Jugendgruppe Treffen; Einleitung · Atkinson 20: Eine lebendige muslimische Gemeinde; Fließtext · Atkinson 18: Lernen Sie die richtige Rezitation und Bedeutung des Qur'an.; Meta · Label · 16 fett: Jeden Samstag · 14:00–16:00 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 28, 81–87 |
| abstaende-radius | Abstände; 4px; 8px; 12px; 16px; 24px; 32px; 48px; 64px; 96px; Radius; 4 · Tags; 8 · Felder; 12 · Karten; 999 · Pillen | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 33–34, 89–90 |
| buttons | Buttons · Forms · Tags & Chips · Navigation | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 37 |
| events | Events · Basis UI · Medien; Information; Dies ist eine Informations-Nachricht für den Benutzer.; Fehler; Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.; Fortschritt; Foto: Gebetsraum | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 39, 44–47 |
| icons | Icons; calendar; clock; map-pin; users; user; book-open; graduation-cap; compass; sunrise; sun; sunset; moon; mail; phone; globe; search; heart; share-2; bookmark; play; volume-2; info; circle-alert; circle-check; menu; x; arrow-right; stern8 | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 52, 91 |
| tabellen | Tabellen; Datum; Imsak; Dhuhr; Isha; 01.01 06:15 12:30 18:45; 02.01 06:14 12:30 18:46; Tabellen scrollen auf dem Telefon in ihrer eigenen Box; Kopfzeile Sand, Zeilen im Wechsel Weiß/Papier. | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 54 |
| ui | Dropdowns · UI-Komponenten; Untermenüs, Sprachumschalter, Anmeldung und Kontomenü sind Zustände des Headers; alle Komponenten mit Varianten zeigt 02 Komponenten. | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 56 |
| a11y | Accessibility (WCAG AA Compliance); Farbkontrast-Beispiele; Weißer Text auf Grün-700; Kontrast: 5,48:1 – WCAG AA; Grün-800 Text auf Grün-Tönung; Kontrast: 7,09:1 – WCAG AAA; Focus-Zustände; Alle interaktiven Elemente haben sichtbare Focus-Indikatoren:; Fokussierbar Button; Fokussierbarer Link; Verwenden Sie Tab zum Testen der Fokus-Zustände; WCAG AA Compliance Checklist; Farbkontrast mindestens 4.5:1; Touch-Targets mindestens 44x44px; Basis-Schriftgröße 16px; Sichtbare Focus-Indikatoren; Semantisches HTML; ARIA Labels wo nötig; Keyboard Navigation; Alt-Texte für Bilder; Reduced Motion Support; Error Message Clarity | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 58–62, 92 |
| info | Design System Information; Technologie-Stack; React 18+ & TypeScript; Tailwind CSS v4 (Tokens aus styles.css / tokens/); shadcn/ui-Bausteine; lucide-Icons | – (nur DE in Quelle) | – (nur DE in Quelle) | Z. 66 |

## DATEN

Keine Inhalte aus der Datenbank (Vorschlag). Die Werte stammen aus tokens/*.css und bleiben als Tailwind-@theme im Code (K-04). Aus der Anmeldung, nicht aus dem Seiteninhalt: Feld rolle, Typ Aufzählung (Administration, Redaktion, Organisationsredaktion, Bildung, Mitgliederverwaltung), mehrsprachig nein (K-06). Personendaten fallen auf dieser Seite nicht an (abgeleitet).

## FORMULARFELDER

– (entfaellt, keine Eingabefelder auf dieser Seite; Formularmuster stehen in BaseComponents und FormsSection.tsx). Bestand-Typoprobe: Beispielwert (StyleguideData.ts:453), kein Feld.

## INTERAKTIONEN

- Abschnittsnavigation: 15 Pillen, mindestens 44 px hoch, Hover mit Grün-Tönung und Rand Grün-700 (Z. 21). Anker haben 96 px Abstand oben (Z. 23 ff.).
- Links: „Vollständige Kontrasttabelle (01 Grundlagen)“ auf 01 Grundlagen.dc.html#kontrast (Z. 25); „02 Komponenten“ auf 02 Komponenten.dc.html (Z. 56); „Fokussierbarer Link“ auf #a11y (Z. 61).
- „Fokussierbar Button“ ohne Aktion (Z. 61). Fokus: 2 px Tiefgrün, nur bei Tastaturfokus (Z. 13).
- Bestand: 15 Tabs wechseln den Inhalt (Styleguide.tsx:48–117); „-10%“ und „+10%“ ändern den Fortschritt (Styleguide.tsx:247–260).
- Kontomenü: Styleguide für angemeldete Konten (00 Laufbuch, D-13).

## ZUSTAENDE

- data-props: keine (Styleguide.dc.html ohne data-props). Gesetzte Attribute: Header active="" (Standard laut 02 Komponenten.dc.html:74: home), current="styleguide" (Standard home), logged-in true (Standard false), open nicht gesetzt (Standard none). Optionen laut 00 Laufbuch, plan 02.1: lang de/tr/en; open none/moschee/islam/organisationen/bildung/lang/login/account/admin/mobile.
- Sprache: nur Deutsch (Z. 15). Angemeldet: ja (Z. 16). Abgemeldet: nicht dargestellt.
- Leer: keine Quelle. Fehler: nur Beispiel-Meldung (Z. 45), kein Fehlerzustand. Erfolg: nicht vorgesehen (abgeleitet). Schritt: entfällt (abgeleitet).
- Fortschritt: Design statisch 60 % (Z. 46). Bestand: Start 65, Schritt 10, Grenzen 0 bis 100 (Styleguide.tsx:27, 250, 257). Bestand-Standardtab: colors (Styleguide.tsx:48).

## BILDER

- Design: eine Platzhalterfläche „Foto: Gebetsraum“, beschriftete Streifen, 140 px hoch (Z. 47).
- Bestand: neun Unsplash-Bilder (StyleguideData.ts:667–692, 708, 719, 730). Anfragen an Dritte ohne Einwilligung sind verboten (Kern G-07); das Laufbuch verwendet keine Unsplash-Bilder (00 Laufbuch, P0 Assets). Nicht übernehmen.
- Motiv „Islamische Kalligrafie“ (Alt-Text StyleguideData.ts:678): Ob es als Schmuck wirkt, ist zu prüfen; das Design verbietet Kalligrafie als Schmuck (01 Grundlagen.dc.html:145).
- Echte Fotos mit Bildrechten liefert die Gemeinde (00 Laufbuch, Liste für Menschen).

## AUFFAELLIGKEITEN

Regel: Design gilt für Gestalt und Text; der Bestand gilt nur für fehlende Sprachfassungen (hier keine vorhanden).

1. Farben: Bestand nutzt Tailwind-Skalen (Emerald, Slate, Amber u. a., StyleguideData.ts:51–256) und einen Verlauf (Styleguide.tsx:30). Design-Tokens sind warm und verlaufsfrei (tokens/colors.css; readme.md:22).
2. Organisationen: Bestand „Amber (AT - Anadolu Teşkilatı)“ (StyleguideData.ts:218) und „Kız Gençlik Teşkilatı“ (ts:198, 759). Design: AT #047857 „Ana Teşkilatı“, KGT „Kadın Gençlik Teşkilatı“ (Z. 79; tokens/colors.css:23).
3. Typografie: Bestand H1 36 px/700 (ts:305–306) und Fließtext 16 px (ts:379) gegen Design H1 48/600 (tokens/typography.css:12) und Fließtext 18 px (tokens/typography.css:17). Bestand-Kleinschrift 12–14 px (ts:403, 523, 535, 575) liegt unter dem 16-px-Minimum (readme.md:19).
4. Kontrast: Bestand „4.8:1“ für Weiß auf Emerald-600 (Styleguide.tsx:299–300); Design „5,48:1“ für Weiß auf Grün-700 (Z. 60), wie in der Kontrasttabelle (01 Grundlagen.dc.html:225).
5. Navigation: Bestand Startseite, Über Uns, Organisationen, Bildung (ts:734–771); Design-Header Moschee, Islam, Organisationen, Bildung, Konto (00 Laufbuch, Linkliste). Bestand-Tab „A11y“ (Styleguide.tsx:114–117) fehlt in der Design-Navigation (Z. 78).
6. Gebetszeiten: Design-Tabelle ohne „Beispielzeiten“-Kennzeichnung (Z. 54), obwohl D-10 sie verlangt (00 Laufbuch, D-10). Gebetsnamen: Design Imsak (Z. 54), Bestand Fajr (ts:479).
7. Extern: Google-Fonts-Links (Z. 11–12; tokens/fonts.css:2–4) gegen K-04 (next/font, selbst gehostet).
8. Kennungen: Kern-Auszug nennt K-07 Formulare und G-04 Personendaten; Design nutzt K-07 für die Schriftskala (tokens/typography.css:1) und G-04 für Fremdquellen (tokens/fonts.css:1). Menü-Breakpoint: 1200 px (tokens/spacing.css:11) gegen 1240 px (01 Grundlagen.dc.html:133; 00 Laufbuch, D-04).
9. Abstände und Radien: Bestand 7 Stufen xs bis 3xl ohne 12 und 96 px (ts:597–605), Radien sm bis none (ts:656–663); Design 9 Stufen und 4/8/12/999 px (tokens/spacing.css:3–4).
10. Koranvers als Typoprobe im Bestand (StyleguideData.ts:507): nicht abgeschrieben (A6).

## OFFENE FRAGEN

1. Welche Rollen aus K-06 dürfen /verwaltung/styleguide sehen?
2. Läuft die Seite im öffentlichen Header mit angemeldetem Zustand oder in einer Verwaltungsschale wie im Dashboard (00 Laufbuch, Plan-Nr. 07.3)?
3. Soll die Verwaltungsseite dreisprachig werden, obwohl die Quellen nur Deutsch liefern (tr und en bleiben leer)?
4. Zeigt die Seite die 18 Design-Farben (Z. 79) oder alle Tokens aus tokens/colors.css?
5. Liest die Seite die Werte zur Laufzeit aus tokens/*.css oder baut der Build sie ein?
6. Welche Gebetsnamen gelten (Imsak oder Fajr), und wird die Tabelle als „Beispielzeiten“ gekennzeichnet?
7. Gilt der Bestand-Fortschritt (interaktiv, Start 65) oder die Design-Fassung (statisch 60 %)?
8. Welche Quelle gilt für die 13 nicht gelesenen Unterkomponenten in styleguide/?

=== ENDE V14 · BEREIT ZUR RÜCKGABE ===
