# E0-KUNDSCHAFTER-02 · Designsystem (Rückgabe, vom Orchestrator abgelegt)

E0-KUNDSCHAFTER-02 · Designsystem der Web-App (nur gelesen, Stand 2026-10-11)

GEÄNDERTE DATEIEN
Keine Projektdateien. Die Berichtsdatei `_werkstatt/berichte/E0-KUNDSCHAFTER-02.md` habe ich nicht geschrieben, weil meine Betriebsvorgaben Berichts-.md-Dateien ausschließen. Dieser Text ist die vollständige Rückgabe und kann unverändert dort abgelegt werden. Ein Hilfsskript habe ich einmal in /home/user/IGMG/web/ angelegt und sofort gelöscht (geprüft). Auswertungen liefen im Scratchpad.

WAS UND WARUM
Kopf-Abgleich: 43 Farb-Tokens, 7 Textgrößen plus 3 anzeige, Radien, Schatten, Container, Breakpoints und 18 ui-Dateien stimmen. Abweichung: Eckige Klammerwerte gezählt 319 Fundstellen in 112 Dateien (ohne 142 Varianten-Selektoren), nicht 273/111.

1. Tokens (/home/user/IGMG/web/src/app/globals.css, @theme Z. 8–102; Kontrast nach WCAG 2.x berechnet)
- Marke (Z. 10–14): gruen-950 #0e3929, gruen-800 #065f46, gruen-700 #047857, gruen-100 #d3f0e2, gruen-50 #ebf9f2.
- Neutral (16–23): tinte #1d1a17, tinte-2 #514c46, tinte-3 #68625b, rand #8c857c, linie #dfdad2, sand #f3f0e9, papier #fcfaf6, weiss #ffffff.
- Status (25–30): fehler #af2b25 / Tönung #ffedea, warnung #81520a / #fef2d9, info #225899 / #e9f3ff.
- Org (32–43, Akzent/Text/Tönung): at #047857/#065f46/#e7f8f0, kt #592e81/#592e81/#f7f0ff, kgt #9b255a/#9b255a/#ffeef3, gt #008c98/#006177/#e6f7fd.
- Tags (45–56, Text/Hintergrund): bildung #225899/#e9f3ff, veranstaltung #81520a/#fef2d9, jugend #006177/#e6f7fd, wichtig #af2b25/#ffedea, neuigkeiten #065f46/#ebf9f2, gemeinde #514c46/#f3f0e9.
- Schrift (59–82): font-text = var(--schrift-text), 'Source Sans 3', system-ui; font-display = var(--schrift-titel), Georgia; font-arabic. text-16 1rem/1.5, text-18 1.125rem/1.6, text-20 1.25rem/1.55, text-24 1.5rem/1.25, text-30 1.875rem/1.25, text-36 2.25rem/1.2, text-48 3rem/1.15 (62–75); leading-ueberschrift 1.6 (77); text-anzeige-64/-96/-144 = 4/6/9rem (79–81); tracking-titel -0.01em (82).
- Maß (84–101): spacing 0.25rem (85); radius-sm 4px, -md 8px, -lg 12px, -pill 999px (87–90); shadow-s1/-s2/-s3 (91–93); container-inhalt 84rem, container-text 68ch (95–96); breakpoint-md 48rem, -menu 77.5rem (97–98); default-transition-duration 150ms, -timing-function ease (100–101).
- :root (105–125): background→papier, foreground→tinte, card/popover→weiss, primary→gruen-700, secondary/muted→sand, muted-foreground→tinte-2, accent→gruen-50, accent-foreground→gruen-800, destructive→fehler, border→linie, input→rand, ring→gruen-950, radius→radius-md. @theme inline (127–146): 18 Klassenaliase auf diese Variablen.
- Kontrast: Text auf papier/weiss/sand erfüllt 4,5:1 bei tinte (15,2–17,3), tinte-2 (7,5–8,5), tinte-3 (5,3–6,0), gruen-700 (4,8–5,5), gruen-800/950, Status (5,8–7,2), Tags (5,8–8,5), Org-Text (6,2–9,9). Unter 4,5:1: gruen-100 (1,06–1,21), rand (3,20–3,65), org-gt (3,55–4,03). Die Verwendung ist unkritisch: gruen-100 nur auf gruen-950 (10,59:1, /home/user/IGMG/web/src/components/website/Footer.tsx:44, /home/user/IGMG/web/src/components/website/igmg/Ueberblick.tsx:35), rand und org-gt nur als Rand bzw. Fläche (/home/user/IGMG/web/src/components/website/OrgCard.tsx:71, dekorativ). Org-Akzenttext auf Tönung: at 6,98, kt 8,85, kgt 6,69, gt 6,41. Primär weiss auf gruen-700 5,48; Hover weiss auf gruen-800 7,68. Fokus-Outline gruen-950: 12,31 (papier), 12,84 (weiss).
- Befund: Fokusring ring-ring/50 der ui-Dateien hat 2,92:1 auf weiss (unter 3:1). Betrifft nur ungenutzte Komponenten (Abschnitt 4).

2. Globale Stile außerhalb @theme (globals.css)
- Z. 148–194 @layer base: Rahmenfarbe linie für alle Elemente (152); body papier/tinte, 18 px, Zeilenhöhe 1.6, hyphens auto (158–167); h1–h4 Titelschrift 600, Laufweite -0.01em, text-wrap balance (168–176); a gruen-700, Hover gruen-800, underline-offset 0.15em (177–183); :focus-visible 2 px gruen-950, Abstand 2 px (185–188); [lang=ar]/[dir=rtl] Amiri, Zeilenhöhe 2 (189–193).
- Z. 196–210 prefers-reduced-motion: Dauer 0,01 ms, View-Transitions aus. Z. 212–216 @media print: body #fff (214, Hex außerhalb Token).
- Z. 218–273 @layer components: .ohne-silbentrennung (221), .verwaltung-huelle (225–230), .fliesstext (231–259, max-width container-text), Kategoriefilter [data-filter] (260–273) mit 11 fest verdrahteten Kategorien.
- Fehlt: @custom-variant, color-scheme, Z-Index-Skala, Bewegungsskala.

3. Freie Werte (eckige Klammern; 159 verschiedene Werte, Top 30; Ersatz-Vorschlag in Klammern)
1 · 11 · underline-offset-[3px] · /home/user/IGMG/web/src/app/[locale]/(website)/mitglied-werden/page.tsx:94 · /home/user/IGMG/web/src/app/[locale]/(website)/veranstaltungen/[slug]/page.tsx:436 (Link-Token)
2 · 8 · px-[18px] · /home/user/IGMG/web/src/app/[locale]/(website)/veranstaltungen/[slug]/page.tsx:274 · /home/user/IGMG/web/src/components/ui/button.tsx:19 (px-4.5)
3 · 8 · px-[22px] · /home/user/IGMG/web/src/app/[locale]/(website)/page.tsx:27 · /home/user/IGMG/web/src/components/ui/button.tsx:17 (px-5.5; VERMUTUNG: Ausgleich für 2-px-Rand)
4 · 7 · grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] · /home/user/IGMG/web/src/app/[locale]/(website)/bildung/korankurse/page.tsx:43 · /home/user/IGMG/web/src/app/[locale]/(website)/nachrichten/page.tsx:51 (Karten-Raster-Token)
5 · 7 · leading-[1.15] · /home/user/IGMG/web/src/app/[locale]/(website)/gebetszeiten/page.tsx:111 · /home/user/IGMG/web/src/app/[locale]/(website)/nachrichten/[slug]/page.tsx:138 (Display-Token)
6 · 7 · max-w-[62ch] · /home/user/IGMG/web/src/app/[locale]/(website)/nachrichten/[slug]/page.tsx:142 · /home/user/IGMG/web/src/app/[locale]/(website)/vorstand/page.tsx:44 (max-w-text)
7 · 7 · max-w-[70ch] · /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/benutzer/einladen/page.tsx:19 · /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/benutzer/page.tsx:34 (max-w-text)
8 · 6 · focus-visible:ring-[3px] · /home/user/IGMG/web/src/components/ui/badge.tsx:7 · /home/user/IGMG/web/src/components/ui/checkbox.tsx:16 (Fokus-Token)
9 · 6 · h-[3px] · /home/user/IGMG/web/src/components/website/gebetszeiten/GebetszeitenTabs.tsx:78 · /home/user/IGMG/web/src/components/website/igmg/IGMGTabs.tsx:75 (Linien-Token)
10 · 6 · leading-[1.55] · /home/user/IGMG/web/src/app/[locale]/(website)/nachrichten/[slug]/page.tsx:142 · /home/user/IGMG/web/src/app/[locale]/(website)/page.tsx:113 (text-20-Zeile)
11 · 6 · max-w-[880px] · /home/user/IGMG/web/src/app/[locale]/(website)/datenschutz/page.tsx:36 · /home/user/IGMG/web/src/app/[locale]/(website)/impressum/page.tsx:34 (Container-Token)
12 · 6 · min-[900px] · /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/layout.tsx:93 · /home/user/IGMG/web/src/components/verwaltung/postfach/PostfachRahmen.tsx:25 (Breakpoint-Token; dazu max-[899px] einmal)
13 · 6 · transition-[box-shadow,border-color] · /home/user/IGMG/web/src/components/website/CourseCard.tsx:55 · /home/user/IGMG/web/src/components/website/EventCard.tsx:75 (Karten-Token)
14 · 5 · flex-[1_1_320px] · /home/user/IGMG/web/src/app/[locale]/(website)/mitglied-werden/page.tsx:59 · /home/user/IGMG/web/src/app/[locale]/(website)/page.tsx:125 (Layout-Token; 7 Basiswerte)
15 · 4 · bg-[repeating-linear-gradient(…)] · /home/user/IGMG/web/src/components/website/Bildplatzhalter.tsx:10 · /home/user/IGMG/web/src/components/website/kontakt/KarteNachKlick.tsx:30 (CSS-Variable)
16 · 4 · grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] · /home/user/IGMG/web/src/components/website/igmg/Kontakt.tsx:43 · /home/user/IGMG/web/src/components/website/igmg/Struktur.tsx:40 (Karten-Raster-Token)
17 · 4 · leading-[1.35] · /home/user/IGMG/web/src/app/[locale]/(website)/veranstaltungen/[slug]/page.tsx:147 · /home/user/IGMG/web/src/app/[locale]/(website)/veranstaltungen/[slug]/page.tsx:409 (Zeilenstufe fehlt)
18 · 4 · min-w-[48rem] · /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/benutzer/page.tsx:110 · /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/gebetszeiten/page.tsx:86 (Tabellenbreite-Token)
19 · 4 · min-w-[56rem] · /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/ankuendigungen/page.tsx:78 · /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/eingaenge/page.tsx:100 (Tabellenbreite-Token)
20 · 4 · pt-[3px] · /home/user/IGMG/web/src/components/website/CourseCard.tsx:71 · /home/user/IGMG/web/src/components/website/CourseCard.tsx:82 (off-grid)
21 · 4 · px-[clamp(16px,3cqi,48px)] · /home/user/IGMG/web/src/components/website/anzeige/AnzeigeLive.tsx:113 · /home/user/IGMG/web/src/components/website/anzeige/AnzeigeLive.tsx:142 (fluide Abstandsskala fehlt)
22 · 4 · transition-[color,box-shadow] · /home/user/IGMG/web/src/components/ui/badge.tsx:7 · /home/user/IGMG/web/src/components/ui/radio-group.tsx:29 (Bewegungs-Token)
23 · 3 · flex-[1_1_300px] · /home/user/IGMG/web/src/app/[locale]/(website)/nachrichten/[slug]/page.tsx:200 · /home/user/IGMG/web/src/components/verwaltung/postfach/PostfachRahmen.tsx:28 (Layout-Token)
24 · 3 · flex-[1_1_420px] · /home/user/IGMG/web/src/components/website/korankurse/AllgemeineInformationen.tsx:11 · /home/user/IGMG/web/src/components/website/korankurse/AnmeldeKarte.tsx:38 (Layout-Token)
25 · 3 · flex-[2_1_360px] · /home/user/IGMG/web/src/components/verwaltung/postfach/PostfachRahmen.tsx:79 · /home/user/IGMG/web/src/components/website/organisation/OrganizationPage.tsx:87 (Layout-Token)
26 · 3 · flex-[2_1_560px] · /home/user/IGMG/web/src/app/[locale]/(website)/mitglied-werden/page.tsx:50 · /home/user/IGMG/web/src/app/[locale]/(website)/page.tsx:122 (Layout-Token)
27 · 3 · flex-[3_1_520px] · /home/user/IGMG/web/src/app/[locale]/(website)/ueber-uns/page.tsx:39 · /home/user/IGMG/web/src/components/website/organisation/OrganizationPage.tsx:77 (Layout-Token)
28 · 3 · grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] · /home/user/IGMG/web/src/components/website/gebetszeiten/GebetszeitenSeite.tsx:118 · /home/user/IGMG/web/src/components/website/igmg/Struktur.tsx:58 (Karten-Raster-Token)
29 · 3 · grid-cols-[repeat(auto-fit,minmax(220px,1fr))] · /home/user/IGMG/web/src/components/website/gebetszeiten/EinstellungenPanel.tsx:95 · /home/user/IGMG/web/src/components/website/gebetszeiten/EinstellungenPanel.tsx:125 (Karten-Raster-Token)
30 · 3 · max-w-[40ch] · /home/user/IGMG/web/src/components/website/gebetszeiten/QiblaKompass.tsx:137 · /home/user/IGMG/web/src/components/website/gebetszeiten/QiblaKompass.tsx:138 (max-w-text)
- Hex-Literale außerhalb CSS (61 Treffer): 43 im Spiegel /home/user/IGMG/web/src/components/verwaltung/styleguide/tokens.ts; /home/user/IGMG/web/src/lib/mail/vorlagen/farben.ts:6–13 (8); /home/user/IGMG/web/src/lib/seo/og-bild.tsx:61–63 (3); /home/user/IGMG/web/src/app/manifest.ts:16–17 (2); /home/user/IGMG/web/src/components/verwaltung/anmeldung/QrCode.tsx:18–19 (2, QR-Funktion); /home/user/IGMG/web/src/app/[locale]/layout.tsx:25 (themeColor); Kommentare ohne Wirkung. Außerdem /home/user/IGMG/web/scripts/pwa-symbole.mjs:7–8 (2). Vorschlag: TS-Quelle aus globals.css ableiten, Mail, OG und Manifest daraus speisen.

4. Komponenten-Zustände
- Button (/home/user/IGMG/web/src/components/ui/button.tsx:11–36, in 49 Dateien genutzt): Hover vorhanden (16–22). Fokus nur global. Aktiv fehlt. Deaktiviert vorhanden (12: gestrichelt, Rand, sand, tinte-2). Laden: nicht im Button, sondern im Sendeknopf (/home/user/IGMG/web/src/components/formular/SendenKnopf.tsx:27–30, disabled plus Text „sendet“).
- Input (/home/user/IGMG/web/src/components/ui/input.tsx:14–18): Fokus 2 px gruen-700, Fehler aria-invalid 2 px fehler, deaktiviert vorhanden. Öffentliche Formulare nutzen stattdessen die Konstante EINGABE (/home/user/IGMG/web/src/components/formular/Felder.tsx:12), mit gleichen Klassen, aber ohne deaktiviert-Zustand.
- Select, Checkbox, Tabs, Textarea, RadioGroup, Badge, Alert, Table, Separator, Sheet, Sonner, Tooltip: ui-Dateien ohne jeden Import. Öffentliche Checkboxen sind native Eingaben mit accent-gruen-700 (/home/user/IGMG/web/src/components/formular/Felder.tsx:165). Eigene Tabs: /home/user/IGMG/web/src/components/website/igmg/IGMGTabs.tsx:70–75 und /home/user/IGMG/web/src/components/website/gebetszeiten/GebetszeitenTabs.tsx:73–78 (Indikator-Radius 2 px gegen sm).
- Links: global (globals.css:177–183, 0,15em); ui/button.tsx:21 underline-offset-4; /home/user/IGMG/web/src/components/website/Footer.tsx:90 und /home/user/IGMG/web/src/components/website/PersonCard.tsx:120 underline-offset-[3px]. Drei Unterstrich-Abstände.
- Karten: Hover mit Rahmen gruen-700 und Schatten s1→s2 in EventCard.tsx:75, /home/user/IGMG/web/src/components/website/NewsCard.tsx:55, OrgCard.tsx:70, CourseCard.tsx:55. PersonCard.tsx:58 ohne Hover. Deaktiviert: CourseCard.tsx:129. Fokus über Streckung des Links (global). Leer: /home/user/IGMG/web/src/components/website/veranstaltungen/Leerzustand.tsx:7. Laden: keine Karte.
- Fokusring: global einheitlich (globals.css:185–188). Abweichung nur in ungenutzten ui-Dateien (outline-none plus ring-[3px]).

5. Typografie
- Display: Seitenkopf h1 36/48 px (/home/user/IGMG/web/src/components/website/Seitenkopf.tsx:41), Startseite (/home/user/IGMG/web/src/app/[locale]/(website)/page.tsx:48), Nachricht (/home/user/IGMG/web/src/app/[locale]/(website)/nachrichten/[slug]/page.tsx:138). Abschnitts-h2 30/36 px (page.tsx:78, :110). Fluid: Veranstaltung h1 clamp(2.25rem,1.5rem+1.7vw,3rem) (/home/user/IGMG/web/src/app/[locale]/(website)/veranstaltungen/[slug]/page.tsx:214); Moschee-Anzeige clamp 64–144 px (/home/user/IGMG/web/src/components/website/anzeige/AnzeigeLive.tsx:144). Token text-anzeige-64 nur in GebetszeitenSeite.tsx:79.
- Zeilenlänge: .fliesstext 68ch (globals.css:235). Einzelwerte: 40ch (3×), 52ch, 56ch, 62ch (7×), 70ch (7×), 760 und 880 px.
- Silbentrennung: body hyphens auto (globals.css:166); manuell in .ohne-silbentrennung (221) und .verwaltung-huelle (225); hyphens-none 4×.
- lang: <html lang={sprache}> (/home/user/IGMG/web/src/app/[locale]/layout.tsx:39); Titel mit eigenem lang (nachrichten/[slug]/page.tsx:138).
- Abschnittsrhythmus: Seitenkopf pt-8 pb-8, md pt-16 pb-14 (Seitenkopf.tsx:32). Inhaltsseiten pb-12 (19×) und md:pb-24 (18×), Beispiel /home/user/IGMG/web/src/app/[locale]/(website)/kontakt/page.tsx:42. pt-Werte uneinheitlich (4/6/8). h5/h6 nicht verwendet.

6. dark:
- 10 Zeilen in 7 Dateien: ui/textarea.tsx:9, ui/dropdown-menu.tsx:76, ui/tabs.tsx:66–68, ui/checkbox.tsx:16, ui/badge.tsx:7 und :15, ui/radio-group.tsx:29, ui/select.tsx:39 (alle unter /home/user/IGMG/web/src/components/).
- Kein @custom-variant. Tailwind 4.3.3 kompiliert dark: zu @media (prefers-color-scheme: dark), geprüft am echten globals.css. Wirkung: Dunkler Systemmodus ändert diese Komponenten, die Seite bleibt hell. Davon genutzt wird nur dropdown-menu (1 Verwaltungsdatei). color-scheme ist nicht gesetzt.

7. Schriften
- /home/user/IGMG/web/src/fonts/: Atkinson Hyperlegible Next 400/700 (latin und latin-ext), Amiri 400/700 (arabisch), „IGMG Wetzlar Titel“ 600 opsz (latin und latin-ext), abgeleitet aus Source Serif 4 (QUELLE.md).
- /home/user/IGMG/web/src/app/schriften.ts: unicode-range Basis (19–21, 57–59), Erweiterung (37–39, 71–73), Arabisch (89–91). Fallback-Metrik: Arial für Text (25), Times New Roman für Titel (63) und Arabisch (97); Erweiterungen ohne Metrik (43, 78); Erweiterungen und Arabisch ohne Preload (42, 77, 96).
- Lizenzen: drei OFL-Dateien vorhanden; QUELLE.md nennt Version 5.3.0 und pnpm schriften:kopieren (/home/user/IGMG/web/package.json:21); scripts/schrift-titel.py vorhanden.
- Nicht geprüft: Glyphenabdeckung (fontTools fehlt) und Ersatzschrift-Metriken (.next enthält kein CSS). Siehe OFFENE FRAGEN.
- VERMUTUNG: 'Source Sans 3' in globals.css:59 ist Rest eines früheren Entwurfs, nicht gebündelt.

8. Styleguide und Spiegel
- Seite: /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/styleguide/page.tsx (nur nach Anmeldung). Bausteine: 14 .tsx unter /home/user/IGMG/web/src/components/verwaltung/styleguide/, Spiegel tokens.ts (206 Zeilen).
- Spiegel: 62 Einträge (Z. 33–155), 0 Wertabweichungen gegen globals.css. Fehlend (17): Zeilenhöhen (7), leading-ueberschrift, anzeige-64/96/144, container-inhalt/-text, breakpoint-md/-menu, default-transition-duration/-timing-function.
- Test /home/user/IGMG/web/tests/unit/styleguide-tokens.test.ts (278 Zeilen, 10 Prüfungen) sichert Spiegel, Klassen-Token und Kontrastkommentare; läuft unter pnpm test:unit und in pnpm check. Erweiterung betrifft tokens.ts, den Test und messages/verwaltung/styleguide.json.

9. Lücken
- Z-Index ohne Skala: z-50 (/home/user/IGMG/web/src/components/website/Header.tsx:34), z-60 (/home/user/IGMG/web/src/components/website/kopf/KopfMenues.tsx:78), z-[100] (/home/user/IGMG/web/src/components/website/Seitenrahmen.tsx:57).
- Bewegung: nur Standard 150 ms ease (globals.css:100–101). duration-150 in OrgCard.tsx:70. 10 transition-[…]. animate-in, fade-out-0, zoom-in in 5 ui-Dateien (tooltip, dropdown-menu, dialog, sheet, select) erzeugen kein CSS (kein tw-animate; Kompilierung: 0 Treffer). Öffnen ohne Animation (Befund).
- Fluid: text-[clamp] in AnzeigeLive.tsx:120, 124, 144, 145, 164, 183 und veranstaltungen/[slug]/page.tsx:214. Abstand clamp in AnzeigeLive.tsx:113, 142. text-anzeige-96 und -144 ungenutzt (0 Treffer).
- Standardskalen von Tailwind bleiben aktiv (Kompilierung bestätigt text-sm 0,875rem, shadow-xs, max-w-md 28rem, leading-relaxed 1,625): text-xs/sm/base/lg (20 Fundstellen, z. B. /home/user/IGMG/web/src/components/ui/dialog.tsx:128), Zeilenhöhen-Standardstufen (über 70), shadow-2xs–2xl (9), rounded-xs bis 4xl und rounded-full (8; ui/badge.tsx:7), max-w-md bis 7xl (18), Breakpoints sm/lg/xl/2xl (72).
- Schriftgrößen off-scale: text-[13px] (/home/user/IGMG/web/src/components/website/NewsCard.tsx:62), text-[15px] (/home/user/IGMG/web/src/components/website/Bildplatzhalter.tsx:10), text-[22px] (/home/user/IGMG/web/src/components/website/Header.tsx:42).
- Off-grid Pixel (kein Vielfaches von 4): underline-offset-[3px] (11), px-[22px] (8), px-[18px] (8), h-[3px] (6), pt-[3px] (4), size-[22px] (2), h-[150px] (2), min-h-[118px] (1).
- Breakpoint min-[900px] (6 Zeilen) und max-[899px] (1) neben den Tokens md und menu.
- Kategorien: 11 fest in globals.css:260–272; TS-Listen in /home/user/IGMG/web/src/app/[locale]/(website)/veranstaltungen/page.tsx:14, /home/user/IGMG/web/src/app/[locale]/(website)/nachrichten/page.tsx:15 und /home/user/IGMG/web/src/lib/validierung/veranstaltung.ts:12. Gleichlauf nicht geprüft.

OFFENE FRAGEN
1. Tailwind-Standardskalen (Text, Zeilenhöhe, Schatten, Radius, Breite, Breakpoints) abschalten (--*: initial) oder bewusst behalten?
2. Dunkler Systemmodus: dark:-Varianten entfernen, @custom-variant setzen oder ein Dunkelthema planen?
3. animate-in-Klassen: Plugin nachrüsten oder Klassen entfernen?
4. Glyphenabdeckung (Türkisch, Arabisch) und Ersatzschrift-Metriken nicht geprüft.
5. Fokusring 2,92:1 in ungenutzten ui-Dateien: behalten oder ersetzen?
6. 3-px-, 18-px- und 22-px-Werte: Designvorgabe oder Ausgleich?
7. 'Source Sans 3' aus dem Stack entfernen?
8. Kategorieliste: eine Quelle für CSS und TS?

GEMEINSAME DATEIEN
Keine nötig. Bei einer Erweiterung betroffen: globals.css, styleguide/tokens.ts, tests/unit/styleguide-tokens.test.ts, messages/verwaltung/styleguide.json. Nichts davon geändert.

PRÜFUNG UND ERGEBNIS
- Tailwind-4.3.3-Kompilierung des echten globals.css für 14 Klassen (dark, animate-in, text-sm, shadow-xs, max-w-md, rounded-full, z-60 u. a.).
- WCAG-Kontraste aus den Token-Werten berechnet (Skript im Scratchpad).
- Spiegel-Abgleich: 62 Einträge, 0 Abweichungen.
- Nutzungszählungen per Suche über src (Richtwerte, Doppelungen möglich).
- Nicht ausgeführt: Build, Tests, Lint, Bildprüfung.

BILDBELEGE: keine.

=== ENDE E0-KUNDSCHAFTER-02 · BEREIT ZUR RÜCKGABE ===
