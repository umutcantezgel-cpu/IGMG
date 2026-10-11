# T01 · Token-Auszug (Farben, Schrift, Abstaende, Radien, Schatten, Fokus, Raster, Kontrast)

Kennung T01 · Rolle Kundschafter · Kern-Version 1.0. Fundstellen als Datei:Zeile; G = 01 Grundlagen.dc.html.

## SEITE

Designsystem „IGMG Wetzlar“, Bereich 01 Grundlagen (G:16–20).

## ROUTE

Ziel: Tailwind 4 @theme (L:32: „Tokens sind 1:1 als Tailwind-4-@theme übertragbar.“).

VORSCHLAG @theme-Namen:
- Farben: `--color-<token>`, z. B. `--color-gruen-700: #047857`; Semantik (C:35–47) per var().
- Schrift: `--font-text`, `--font-display`, `--font-arabic`, `--text-16` bis `--text-48`, `--leading-body`, `--font-weight-bold`, `--tracking-heading`.
- Abstand: `--spacing: 4px` ergibt p-1 bis p-24 (= space-1 bis space-24, S:3).
- `--radius-sm` bis `--radius-pill`, `--shadow-1` bis `--shadow-3`, `--breakpoint-md: 768px`, `--breakpoint-menu: 1200px` (offen, AUFFAELLIGKEITEN 8).
- shadcn-Namen: primary = gruen-700, destructive = fehler, ring = gruen-950, border = linie.

## QUELLEN

Design, nur gelesen: C = tokens/colors.css, T = tokens/typography.css, S = tokens/spacing.css, F = tokens/fonts.css, styles.css, G = 01 Grundlagen.dc.html (vollständig), R = readme.md, L = 00 Laufbuch.dc.html (nur D-01, D-02, D-05, D-06, D-11, D-12 und Zeile 32). Bestand, nur gelesen: BG = src/styles/globals.css, BT = src/styles/default_theme.css, BM = guidelines/Guidelines.md.

## ZWECK

Token-Auszug für den @theme-Block (K-04) und die Kontrastprüfung (K-11). Design gilt für Werte und Text; Bestand nur als Widerspruch.

## ABSCHNITTE

Aufbau G:16–153: Kopf (G:17–21), Farben (G:23–43), Kontrast (G:45–66), Schrift (G:68–97), Abstände bis Fokus (G:99–126), Raster bis Bilder (G:128–152). Icon per dc-import (G:138, G:144). Sprachen: tr – (nur DE in Quelle); en – (nur DE in Quelle).

### Farben (G:159–200; C:4–47)
- Marke (G:160; C:4–8): gruen-950 #0E3929, gruen-800 #065F46, gruen-700 #047857, gruen-100 #D3F0E2, gruen-50 #EBF9F2.
- Neutral warm (G:166; C:10–17): tinte #1D1A17, tinte-2 #514C46, tinte-3 #68625B, rand #8C857C, linie #DFDAD2, sand #F3F0E9, papier #FCFAF6, weiss #FFFFFF.
- Status (G:175; C:19–21): fehler #AF2B25, fehler-toenung #FFEDEA, warnung #81520A, warnung-toenung #FEF2D9, info #225899, info-toenung #E9F3FF. Erfolg = gruen-800 auf gruen-50 (G:182), kein eigener Token.
- Organisationen (G:183; C:23–26): org-at #047857 (Text #065F46, Tönung #E7F8F0); org-kt #592E81 (Text #592E81, Tönung #F7F0FF); org-kgt #9B255A (Text #9B255A, Tönung #FFEEF3); org-gt #008C98 (Text #006177, Tönung #E6F7FD).
- Kategorie-Tags (G:193; C:28–33): tag-bildung #225899 auf #E9F3FF; tag-veranstaltung #81520A auf #FEF2D9; tag-jugend #006177 auf #E6F7FD; tag-wichtig #AF2B25 auf #FFEDEA; tag-neuigkeiten #065F46 auf #EBF9F2; tag-gemeinde #514C46 auf #F3F0E9.
- Semantik (C:35–47): surface-page papier, surface-card weiss, surface-muted sand, surface-strong gruen-950, text-body tinte, text-muted tinte-2, text-subtle tinte-3, text-on-strong weiss, action gruen-700, action-hover gruen-800, border-control rand, border-decor linie, focus-ring gruen-950.

### Kontrast (G:209–262; 54 Paare)
Nachgerechnet nach WCAG 2.x: alle 54 Werte stimmen (Abweichung höchstens 0,005). Format: Vordergrund/Hintergrund Verhältnis (Einsatz in Klammern, wörtlich). Schwelle nach G:47: Text 4,5:1; Text ab 24 px oder 19 px fett 3:1; Ränder, Fokusring, Icons 3:1. Ergebnis: 51 erfüllt, 3 verboten (markiert).
- G:209–217: #1D1A17/#FFFFFF 17,32 (Text auf Karten, Header, Feldern); #1D1A17/#FCFAF6 16,62 (Text auf Seitengrund); #1D1A17/#F3F0E9 15,22 (Text auf Sandflächen); #1D1A17/#EBF9F2 15,97 (Text auf Grün-Tönung); #1D1A17/#D3F0E2 14,30 (Text auf ausgewählten Flächen); #1D1A17/#E7F8F0 15,74 (Text im Kopf Ana Teşkilatı); #1D1A17/#F7F0FF 15,56 (Text im Kopf Kadın Teşkilatı); #1D1A17/#FFEEF3 15,49 (Text im Kopf Kadın Gençlik Teşkilatı); #1D1A17/#E6F7FD 15,74 (Text im Kopf Gençlik Teşkilatı).
- G:218–221: #514C46/#FFFFFF 8,49 (Sekundärtext auf Weiß); #514C46/#FCFAF6 8,15 (Sekundärtext auf Papier); #514C46/#F3F0E9 7,46 (Sekundärtext auf Sand); #514C46/#EBF9F2 7,83 (Sekundärtext auf Grün-Tönung).
- G:222–224: #68625B/#FFFFFF 6,02 (Platzhaltertext, Zeitstempel); #68625B/#FCFAF6 5,78 (Zeitstempel auf Papier); #68625B/#F3F0E9 5,29 (Meta auf Sand).
- G:225–228: #047857/#FFFFFF 5,48 (Link, Icon, Outline-Text); #047857/#FCFAF6 5,26 (Link auf Papier); #047857/#F3F0E9 4,82 (Link auf Sand); #047857/#EBF9F2 5,06 (aktiver Menüpunkt, Hover-Link).
- G:229–232: #065F46/#FFFFFF 7,68 (Wortmarke, Überschrift-Akzent); #065F46/#EBF9F2 7,09 (Erfolgsmeldung, Tag Neuigkeiten); #065F46/#D3F0E2 6,34 (Text auf Ausgewählt); #065F46/#E7F8F0 6,98 (AT-Text auf AT-Tönung).
- G:233–235: #FFFFFF/#047857 5,48 (Primär-Button, Badge Empfohlen); #FFFFFF/#065F46 7,68 (Primär-Button Hover); #FFFFFF/#0E3929 12,84 (PrayerTimesBar, Footer, Vollbild).
- G:236–238: #D3F0E2/#0E3929 10,59 (Sekundärtext auf Tiefgrün); #EBF9F2/#0E3929 11,84 (Gebetsnamen auf Tiefgrün); #0E3929/#FFFFFF 12,84 (Text im hervorgehobenen nächsten Gebet).
- G:239–242: #AF2B25/#FFFFFF 6,57 (Fehlermeldung, Löschen-Text); #AF2B25/#FCFAF6 6,30 (Fehlertext auf Papier); #AF2B25/#FFEDEA 5,81 (Fehlerfläche, Tag Wichtig); #FFFFFF/#AF2B25 6,57 (Button Löschen).
- G:243–245: #81520A/#FEF2D9 6,02 (Hinweis, Tag Veranstaltung, Beispielzeiten); #225899/#E9F3FF 6,41 (Info, Tag Bildung/Ankündigung); #225899/#FFFFFF 7,18 (Info-Link).
- G:246–248: #592E81/#FFFFFF 9,85 (KT-Text, KT-Band); #592E81/#F7F0FF 8,85 (KT-Text auf KT-Tönung); #FFFFFF/#592E81 9,85 (Weiß auf KT-Fläche).
- G:249–251: #9B255A/#FFFFFF 7,48 (KGT-Text, KGT-Band); #9B255A/#FFEEF3 6,69 (KGT-Text auf KGT-Tönung); #FFFFFF/#9B255A 7,48 (Weiß auf KGT-Fläche).
- G:252–253: #006177/#FFFFFF 7,06 (GT-Text, Tag Jugend); #006177/#E6F7FD 6,41 (GT-Text auf GT-Tönung).
- G:254–255: #008C98/#FFFFFF 4,03 (GT-Band, GT-Zeichen (Grafik); Schwelle 3, erfüllt); #008C98/#FFFFFF 4,03 (GT-Akzent als Fließtext – stattdessen GT-Text #006177; VERBOTEN).
- G:256–259: #8C857C/#FFFFFF 3,65 (Rand von Feldern, Outline-Buttons, Checkboxen; Schwelle 3, erfüllt); #8C857C/#FCFAF6 3,50 (Rand auf Papier); #8C857C/#F3F0E9 3,20 (Rand auf Sand); #8C857C/#FFFFFF 3,65 (Rand-Farbe als Text; VERBOTEN).
- G:260: #DFDAD2/#FFFFFF 1,39 (Linie als Feldgrenze oder Text – nur dekorativ; VERBOTEN).
- G:261–262: #0E3929/#FFFFFF 12,84 (Fokusring auf hellen Flächen); #FFFFFF/#0E3929 12,84 (Fokusring auf Tiefgrün).

### Schrift (G:68–97; G:265–271; T:3–19; F:2–4)
- Familien (T:3–5; F:2–4): `--font-text` „Atkinson Hyperlegible Next“, „Source Sans 3“, system-ui, sans-serif; `--font-display` „Source Serif 4“, Georgia, serif; `--font-arabic` „Amiri“, serif (nur Inhalt, dir="rtl", G:83–84).
- Größen (T:6): 16, 18, 20, 24, 30, 36, 48 px. Zeilenhöhe (T:7): `--leading-body` 1.6; `--leading-meta` 1.5; `--leading-heading` 1.2; `--leading-arabic` 2. Gewichte (T:8): 400, 700, 600. `--tracking-heading` -0.01em (T:9). `--measure` 68ch (T:10).
- Rollen (T:12–19): `--h1` 600 48px/1.15, `--h1-mobile` 600 36px/1.2; `--h2` 600 36px/1.2, `--h2-mobile` 600 30px/1.2; `--h3` 600 30px/1.25, `--h3-mobile` 600 24px/1.25; `--h4` 600 24px/1.25; `--lead` 400 20px/1.55; `--body` 400 18px/1.6; `--meta` 400 16px/1.5; `--label` 700 16px/1.5.
- Probe (G:78, wörtlich): „Ğğ İi Iı Şş Çç Öö Üü · Il1 O0 · Cemaatimize hoş geldiniz.“
- Regeln: Fließtext 18 px/1,6, nie unter 16 px, höchstens 68 Zeichen (G:79); Überschriften nur ab 24 px (G:74); keine Großbuchstaben-Transformation (R:15). Ausnahme 64/96/144 px nur in FullscreenPrayerTimes (L:192).

### Abstände, Radien, Schatten, Fokus, Raster (S:3–12; G:99–133)
- Abstand (S:3; G:273–279): space-1 4px, space-2 8px, space-3 12px, space-4 16px, space-6 24px, space-8 32px, space-12 48px, space-16 64px, space-24 96px.
- Radien (S:4; G:109–112): radius-sm 4px, radius-md 8px, radius-lg 12px, radius-pill 999px.
- Schatten (S:5–7; G:115–117): shadow-1 `0 1px 2px rgba(29, 26, 23, 0.06)`; shadow-2 `0 6px 20px rgba(29, 26, 23, 0.10)`; shadow-3 `0 24px 64px rgba(29, 26, 23, 0.22)`.
- Fokus (S:8; C:47; G:14, G:124): focus-width 2px, focus-offset 2px, Farbe gruen-950, nur bei :focus-visible. Auf Dunkel Weiß (G:122; kein Token).
- Klickziele (S:9): target-min 44px, target-touch 48px.
- Layout (S:10–11; G:133): content-max 1280px, gutter-desktop 32px, gutter-mobile 16px, breakpoint-mobile 768px, breakpoint-menu 1200px. Raster: 12 Spalten Desktop, 4 Telefon.
- Bewegung (S:12; G:150): transition 150ms ease.

### Icons, Ornament, Bilder und Bewegung (G:136–151)
Lucide-Pfade, Strich 2 px, runde Enden; 20 px Standard, 24 px in Navigation und Kerninfos, nie unter 16 px (G:140). Stern8 nur 12–16 px (G:145).

### Texte
Wörtlich übernommen: Überschriften, Gruppen- und Token-Namen, Rollen, Probe G:78, alle 54 Einsatztexte der Kontrastpaare. Nicht wörtlich (Wortgrenze A8): Verwendungstexte der Farben (G:161–199, Spalte „use“) und Gruppen-Notizen (G:160, G:166, G:175, G:183, G:193); Beispieltexte G:72–73, G:83, G:91–96. Fundstellen stehen.

## DATEN

Keine Datenbankinhalte: Tokens sind statisch. Vorschlag (A7): Feld „Organisation“ (Typ enum at/kt/kgt/gt, mehrsprachig nein) steuert, welche org-Tokens greifen (G:183–192; L:187).

## FORMULARFELDER

– (entfaellt, keine Formulare auf 01 Grundlagen)

## INTERAKTIONEN

Statische Seite. Karte: Hover mit Schatten S2 und grünem Rand, keine Sprünge (R:20). Link-Hover #065F46 (G:14). Fokus nur über Tastatur (G:124). Übergänge 150 ms; bei „Bewegung reduzieren“ keine (G:150; R:24).

## ZUSTAENDE

- Eigenschaften (data-props): keine. Das Script (G:155) hat kein data-props, daher keine Optionen oder Defaults.
- Design: Fokus (:focus-visible; G:14, G:124); Hover Karte (R:20); Status fehler, warnung, info, erfolg nur mit Icon und Klartext (G:175); Bewegung reduziert (G:150).
- Bestand: .error, .error-message (BG:362–371); .success (BG:374–377); :disabled (BG:186); Sprunglink (BG:195–210); prefers-contrast high (BG:470–474); prefers-reduced-motion (BG:477–484); .dark (BG:82–117).

## BILDER

Keine Fotos. Beschriftete Streifenflächen „Foto: Gebetsraum“ (G:149): repeating-linear-gradient 135deg, #F3F0E9 und #FCFAF6, 10 px. Menschen nur neutral als Initialen (G:150). Keine Verläufe, keine Muster hinter Text (R:22). Keine Bilder aus dem Netz (L:191, G-04).

## AUFFAELLIGKEITEN

Design gilt für Werte und Text. Widersprüche des Bestands:
1. Schrift: Inter (BG:1, BG:8, BM:194) statt Atkinson Hyperlegible Next und Source Serif 4 (F:2–4; L:183).
2. Fokusring: --ring #047857 (BG:31, BG:175) statt #0E3929 (G:124; C:47).
3. Schriftgrößen: 12 und 14 px (BG:48–49); Root 14 px unter 768 px (BG:502; BM:173) gegen „nie unter 16 px“ (G:79). Root 18 px ab 1200 px (BG:513) verschiebt rem-Werte.
4. Gewichte: Button 16 px/500 (BG:293–294; BM:71) gegen 18 px und Einsatz „Buttons (700)“ (G:270); Label 500 (BG:286) gegen 700 (T:19); H1 700, line-height 1.2, letter-spacing -0.025em (BG:219–222) gegen 600, 1.15, -0.01em (T:9, T:12).
5. Hover: translateY −1 px und −2 px (BG:186–188, BG:452–455), 200 ms (BG:73) gegen „keine Sprünge“ und 150 ms (R:20; S:12).
6. Ränder: --border rgba(0, 0, 0, 0.08) (BG:25; abgeleitet ca. 1,19:1 auf Weiß) gegen Rand #8C857C ≥ 3:1 (C:45); --muted #f1f5f9 (BG:19) gegen Sand (C:15).
7. Radien und Abstände: --radius-sm und -md abgeleitet 8 px und 10 px (BG:146–147) gegen 4 und 8 px (S:4); Abstandsskala ohne 12 und 96 px (BG:59–65) gegen S:3.
8. Breakpoints: Menü 1240 px (G:133) gegen 1200 px (S:11; R:25). Telefon-Ziel 52 px (BG:507) gegen 48 px (S:9).
9. Schriftladung: Design per Google-Fonts-Einbindung (F:2–4; G:11–13); K-04 verlangt Selbsthosting über next/font.
10. Bestand-Richtwerte: Fehler #dc2626 (BM:191) gegen #AF2B25 (C:19); Erfolg #059669 (BM:192) gegen G:182; Zeilenhöhe Überschriften 1.2–1.4 (BM:39) und Laufweite -0.015 bis -0.025em (BM:40).
11. BT (default_theme.css:12, 20, 34) ist eine Standardvorlage (#030213, #d4183d, 0,625rem), keine Token-Quelle.
12. Design intern: Tags als „Pille“ (G:193) gegen „4 · Tags“ (G:109); Source Sans 3 als Ersatz (T:3; G:79) ist nicht geladen (F:2–4).
13. Links: Bestand unterstreicht (BG:312–316; BM:109); das Design regelt es nicht (G:14).

## OFFENE FRAGEN

1. K-07 und K-08 sind im Laufbuch nur referenziert (L:192, L:187); Schwellen hier aus G:47.
2. Dunkelmodus: Design ohne dunkle Palette, Bestand mit abweichenden Werten (BG:82–117). Übernehmen?
3. Links unterstrichen oder nicht (AUFFAELLIGKEITEN 13)?
4. Schatten S3 (G:117) gegen D-01 „Linien statt schwerer Schatten“ (L:182): bestätigen?
5. Source Sans 3 laden oder streichen (T:3; G:79)?
6. Button 18 px/700 oder 16 px/500; Tags Pille oder Radius 4; Menü 1200 oder 1240 px?
7. Verwendungs- und Gruppentexte der Farben fehlen wörtlich, weil die Wortgrenze A8 (1.800) sonst überschritten würde. Vorschlag: Blatt T01b für die Texte oder A8 anheben.

=== ENDE T01 · BEREIT ZUR RÜCKGABE ===
