# C02 · Komponentenblatt PrayerTimesBar

Kern-Version 1.0 · Stand 11.10.2026 · Quellen nur gelesen. Zahlen ohne Dateiangabe beziehen sich auf PrayerTimesBar.dc.html.

## SEITE

Komponente ohne eigene Seite: Leiste unter dem Header (App.tsx:166–171).

## ROUTE

Alle Routen außer Gebetszeiten (Routenschlüssel `prayer-times`): App.tsx:111, Laufbuch 281 (D-16). Lokalisierte Pfade offen.

## QUELLEN

- Design: PrayerTimesBar.dc.html, vollständig (Template 9–63, Script 64–113).
- Bestand: components/PrayerTimesBar.tsx (81 Zeilen, „TSX“); LanguageContext.tsx, Namensraum prayerTimesBar (de 81–92, tr 339–350, en 597–608); App.tsx 111, 167–169; PrayerTimes.tsx 105, 430, 436; FullscreenPrayerTimes.tsx 260, 271, 327, 330 (nur für Sprachfassungen).
- Hilfen: readme.md (Zeilen 12, 19–28); 00 Laufbuch.dc.html (Zeilen 149, 153–160, 175, 183, 185, 193, 216, 232, 240, 253–264, 281, 299).
- Nicht gelesen: Icon.dc.html (eigenes Blatt).

## ZWECK

Zeigt die Gebetszeiten des Tages, das nächste Gebet mit live berechneter Restzeit und den Link „Alle Gebetszeiten“ (Laufbuch 149). Auf dem Telefon ist die Liste aufklappbar (46–59).

## ABSCHNITTE

### Aufbau

- Wurzel `aside`: einfarbig #0E3929, Schrift #FFFFFF, 18 px, Zeilenhöhe 1,5 (14).
- Ab 768 px (100): Ortsblock links (17–20), sechs Karten in sechs Spalten (22–30), Link rechts (32). Ab 1200 px in einer Zeile, darunter bricht die Liste auf volle Breite um (107, abgeleitet).
- Unter 768 px (35–61): Kopfzeile mit Ort, Datum und Badge; weißes Kärtchen „Nächstes Gebet“ (41–44); Schaltfläche (46); aufgeklappt drei Spalten (49–55) und Link (57).
- Karten: nächstes Gebet weiß mit dunkler Schrift, `aria-current` = time (24, 51); übrige dunkelgrün mit Rand #065F46 (98).

### Komponenten

Icon (18–20, 26, 32, 38–39, 46, 57; eigenes Blatt). Link zu PrayerTimes.dc.html (32, 57).

### Texte

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| prayerTimesBar.location | Wetzlar, Deutschland | Wetzlar, Almanya | Wetzlar, Germany | 67–69; Bestand LanguageContext.tsx 82, 340, 598: identisch |
| prayerTimesBar.sample | Beispielzeiten | Örnek vakitler | Sample times | 67–69, 20, 39; neu |
| prayerTimesBar.listLabel | Gebetszeiten heute | Bugünkü namaz vakitleri | Today's prayer times | 67–69, 22, 49 (aria-label); Widerspruch, siehe AUFFAELLIGKEITEN 9 |
| prayerTimesBar.asideLabel | Aktuelle Gebetszeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | 14 (fest, nicht über t); App.tsx:168 |
| prayerTimesBar.next | Nächstes Gebet | Sıradaki namaz vakti | Next prayer | 67–69, 25, 42; PrayerTimes.tsx:430 (de); FullscreenPrayerTimes.tsx:330 (tr); en neu |
| prayerTimesBar.remaining | verbleibt: | kalan: | remaining: | 67–69, 28, 44; PrayerTimes.tsx:436 (de); tr, en neu |
| prayerTimesBar.prayers | Imsak, Aufgang, Dhuhr, Asr, Maghrib, Isha | İmsak, Güneş Doğuşu, Öğle, İkindi, Akşam, Yatsı | Imsak, Sunrise, Dhuhr, Asr, Maghrib, Isha | 67–69, 97; LanguageContext 85–90, 343–348, 601–606 identisch |
| prayerTimesBar.all | Alle Gebetszeiten | Tüm namaz vakitleri | All prayer times | 67–69, 32, 57; neu |
| prayerTimesBar.show | Alle Zeiten anzeigen | Tüm vakitleri göster | Show all times | 67–69, 46, 109; neu |
| prayerTimesBar.hide | Zeiten ausblenden | Vakitleri gizle | Hide times | 67–69, 109; neu |
| prayerTimesBar.unit | Std. / Min. / Uhr | sa / dk / (leer) | h / min / (leer) | 67–69 (h, m, uhr; führende Leerzeichen); neu |
| prayerTimesBar.times | 05:15 · 07:30 · 12:45 · 15:20 · 18:15 · 19:45 | gleich | gleich | 65; TSX:18–23 gleich |
| prayerTimesBar.dateTime | So., 11. Okt. · 18:30 Uhr | 11 Eki Paz · 18:30 | Sun 11 Oct · 18:30 | 19, 38, 101–102; Beispiele abgeleitet (Intl, 11.10.2026, 18:30) |
| prayerTimesBar.nextLine | {Name} · {Zeit} | {Name} · {Zeit} | {Name} · {Zeit} | 43, 105; „ Uhr“ nur de |

## DATEN

- Heute keine Datenbankabfrage; die Zeiten sind feste Werte im Script (65).
- Vorschlag (A7), Tabelle `prayer_day` je Datum: `date` (date, Europe/Berlin), `imsak`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha` (time, HH:MM), `source` (text: import, berechnet, beispiel). Alle nicht mehrsprachig.
- Einstellungen `prayer_settings`: `source_mode` (text), `method` (text, Annahme „Turkey“ laut K-08), `timezone` (text, fest Europe/Berlin). Nicht mehrsprachig.
- Namen, Labels und Ort bleiben in messages/{de,tr,en}.json (K-02). Der Browser speichert die Tageszeilen zwischen (K-08).

## FORMULARFELDER

– (entfaellt, keine Eingabefelder)

## INTERAKTIONEN

- Telefon-Schaltfläche schaltet `expanded` und setzt aria-expanded (46, 108).
- Link „Alle Gebetszeiten“: Hover-Hintergrund #065F46 (32); auf dem Telefon nur bei geöffneter Liste sichtbar (47–57).
- Fokus: weiße Kontur 2 px mit 2 px Abstand (12).
- Automatisch: Zeitgeber alle 30 s (81), Breitenmessung per ResizeObserver (73–78), Aufräumen beim Entfernen (83). Keine Live-Ansage (K-11).

## ZUSTAENDE

Eigenschaften (64):
- `lang`: Optionen de, tr, en (tsType 'de'|'tr'|'en'); Default de. Steuert Texte (85–86) und das lang-Attribut (14).
- `$preview`: 1440 × 140 px, nur Vorschau.

Interne Zustände (72):
- `w`: Start 1440; Telefon unter 768 px; Desktop ab 1200 px; Innenabstand 24 px unter 1000 px, sonst 32 px (100, 106–107).
- `now`: Start jetzt, alle 30 s neu (81). `expanded`: Start zu, nur auf dem Telefon (47).
- Nächstes Gebet (abgeleitet, 90–92): erste Zeit nach jetzt, Aufgang ausgenommen; Gleichstand gilt als vorbei; nach Isha ist Imsak des Folgetags nächstes Gebet.
- Restzeit (abgeleitet, 94): „1 Std. 20 Min.“, unter einer Stunde „25 Min.“, volle Stunde „2 Std. 0 Min.“.

Bestand-Zustände: `lang` über LanguageContext (TSX:7), Uhr alle 1 s (TSX:12), Kartenhover (TSX:69). Keine Breitenzustände im Script (nur CSS-Breakpoints, TSX:47, 64), kein Aufklappen, kein nächstes Gebet.
Leer, Fehler, Erfolg, Schritt, angemeldet: – (entfaellt, feste Werte ohne Lade- oder Fehlerzustand).

## BILDER

Keine Fotos. Icons (Lucide-Pfade, 16 px statt 20/24 px nach readme.md:28): map-pin (20 px, Telefon 16; 18, 38), clock (20; 19), info (16; 20, 39), moon, sunrise, sun, sunset je Gebet (16; 26, Zuordnung 65), arrow-right (20; 32, 57), chevron-down/-up (20; 46, 109). Bestand: map-pin, clock und Gebetssymbole gleich, 12–20 px; info, arrow-right und chevron fehlen (TSX:1, 51, 55, 70).

## AUFFAELLIGKEITEN

1. Zeitzone: Design rechnet mit Browserzeit (87–88); K-08 verlangt Europe/Berlin mit Sommerzeit.
2. Doppelte Landmarke: App.tsx:168 umschließt die Leiste mit `aside role="complementary"`, das Design setzt denselben Namen auf den eigenen `aside` (14).
3. Schriftgröße: Bestand text-xs (abgeleitet 12 px) für Datum, Namen und Zeit (TSX:58, 71, 72); Design mindestens 16 px (26, 52); readme.md:19.
4. Gestalt: Bestand mit Verlauf (TSX:45), Unschärfe (TSX:50, 69) und Vergrößerung beim Hover (TSX:69); readme.md:22 verbietet Verläufe, readme.md:20 verlangt „keine Sprünge“; Design einfarbig (14).
5. Telefon: Design zeigt dort keine Uhrzeit (38); Bestand zeigt sie (TSX:57).
6. Datum: Laufbuch 193 (D-10) mit Jahr und ausgeschriebenem Monat; readme.md:12 und Design (101) ohne Jahr; Bestand ausgeschrieben, abgeleitet „Sonntag, 11. Oktober 2026“ (TSX:28–33).
7. Englisch: Design en-GB (69), abgeleitet 24 Stunden; Bestand en-US, abgeleitet 12 Stunden, etwa „06:30 PM“ (TSX:27, 37).
8. Restzeit: Design mit „Std.“ und „Min.“ (67, 94); Bestand-Beispiel „2h 15m“ (PrayerTimes.tsx:105, 436).
9. Listentitel: Design „Gebetszeiten heute“ und „Bugünkü namaz vakitleri“ (67–68); Bestand „Heutige Gebetszeiten“ und „Bugünkü Namaz Vakitleri“ (FullscreenPrayerTimes.tsx:271). Vorgabe: Design; K-02 sagt „Bestandsübersetzungen gehen vor“.
10. Bestandsfehler: FullscreenPrayerTimes.tsx:260 zeigt auf Englisch „Sıradaki“, weil nur Deutsch gesondert geprüft wird.
11. Maße: Design max. 1344 px (16) gegen readme.md:25 mit 1280 px; Zeilenhöhe 1,5 (14) gegen 1,6 (readme.md:19; Laufbuch 183).
12. Schrift: Design lädt Atkinson über Google Fonts (11); K-04 verlangt Eigenhosting per next/font.
13. Zugang: `aria-controls="ptb-all"` zeigt im zugeklappten Zustand auf kein Element (46, 48).
14. Plan: Leiste nur bei 03.1, 03.3–03.6 und 04.1 genannt (Laufbuch 153, 156–160); Z-04 (216) und App.tsx:111 meinen alle Seiten; Dashboard 07.3 (175) ohne Leiste.

## OFFENE FRAGEN

1. Zählt Imsak als „nächstes Gebet“ (90), während Aufgang ausgenommen ist?
2. Wird die Restzeit in Europe/Berlin oder in Browserzeit berechnet?
3. Wie lautet der sichtbare Hinweis „berechnet“ (K-08)? Er fehlt in Design und Bestand.
4. Ist die Methode „Turkey“ bestätigt? Die Liste für Menschen (Laufbuch 232) nennt keine Methode.
5. Neue Texte (Beispielzeiten, Alle Gebetszeiten, Restzeit-Einheiten) stehen nicht in der Liste für Menschen, nur unter Textänderungen (Laufbuch 299); K-02 verlangt dort einen Eintrag.
6. Zeigt das Telefon die aktuelle Uhrzeit?
7. Englisch: en-GB oder en-US? Datum mit oder ohne Jahr?
8. Lokalisierte Pfade der Gebetszeiten-Seite je Sprache fehlen.
9. Gilt die Leiste auf Dashboard (07.3) und Vollbild (03.2b)? App.tsx hat für die Vollbild-Ansicht keinen Routenschlüssel.
10. Gemeinsame Gebetszeitenquelle festlegen: drei Beispielsätze im Code (Laufbuch 240), Platzhalterliste ohne Eintrag (253–264).
11. Braucht die Leiste einen Ramadan-Zustand? K-08 nennt ihn nur für die Monatsansicht.

=== ENDE C02 · BEREIT ZUR RÜCKGABE ===
