S03 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Gebetszeiten-Anzeige (Moschee-Bildschirm)“ · Schwierigkeit 1

# Seitenblatt S03: Gebetszeiten-Anzeige (Moschee-Bildschirm)

Kürzel: dc = FullscreenPrayerTimes.dc.html (Template bis Zeile 47, Script ab 48), tsx = FullscreenPrayerTimes.tsx (Bestand), lb = 00 Laufbuch.dc.html, rm = readme.md, pt = PrayerTimes.dc.html. Zahl = Zeile. Schlüssel sind Vorschläge.

## SEITE

Gebetszeiten Vollbild, Laufbuch-Nr. 03.2b (lb:155). Anzeige für den Bildschirm in der Moschee mit eigener Kopfzeile, ohne Website-Navigation (dc:16–20). Kein Formular.

## ROUTE

/gebetszeiten/anzeige (K-03). Rückweg: /gebetszeiten (dc:19, dc:60; lb:310). Sprachpräfix nach K-02: Deutsch ohne Präfix, /tr, /en. Lokalisierte tr- und en-Pfadnamen: – (nur DE in Quelle).

## QUELLEN

- dc: vollständig gelesen, 88 Zeilen.
- tsx: vollständig gelesen, 348 Zeilen, Pfad uploads/igmg-wetzlar-website/src/app/components/.
- Hilfen: rm:12–28 (Datum, Schrift, Bedienelemente, Hintergrund, Icons), lb:155, lb:183 (D-02), lb:192 (D-12), lb:193 (D-10), lb:203, lb:231, lb:241, lb:281 (D-16), lb:299, lb:310.
- Einstieg: pt:26 verlinkt auf FullscreenPrayerTimes.dc.html.

## ZWECK

Anzeige für die Moschee nach K-08: aus der Ferne lesbar, mit Uhrzeit, Datum, Beispielwetter, aktuellem und nächstem Gebet sowie sechs Tageszeiten. K-08 verlangt zusätzlich Aktualisierung um Mitternacht und Offline-Betrieb; der Stand steht unter AUFFAELLIGKEITEN. Rückweg per X oder Esc.

## ABSCHNITTE

Vier Blöcke. Das Layout nutzt Container-Einheiten (dc:16 container-type inline-size, Größen clamp(…cqi…)).

1. Kopfzeile (dc:17–20; tsx:207–221): Logo, Titel, Trenner „•“ (aria-hidden), Ort. Rechts Badge und Schließen-Link, 56 × 56 px (dc:19).
2. Uhr, Datum, Infoleiste (dc:21–31; tsx:224–266): Uhr HH:MM:SS, 24 Stunden, Locale de-DE oder tr-TR (abgeleitet aus dc:78; tsx:144–149). Datum mit ausgeschriebenem Wochentag und Monat (dc:79; tsx:153–158). Wetterkarte (dc:27), Karte Aktuell nur bei laufendem Gebet (dc:28), Karte Nächstes (dc:29).
3. Hauptbereich (dc:32–44; tsx:268–335): Überschrift (dc:33), Raster aus sechs Gebetskarten (dc:34–41) mit Name, Badge, Zeit und arabischem Namen, danach Statuszeile (dc:43, role=status).
4. Fußzeile (dc:45; tsx:338–346): Bedienhinweis.

Kartenlabels (Badge) = Schlüssel current und next (dc:72). Textliste nach A2. „– (nur DE in Quelle)“ steht für eine Sprachfassung, die in allen Quellen fehlt. „gleich“ heißt unverändert.

| Schlüssel | de | tr | en | Fundstelle |
|---|---|---|---|---|
| brand | IGMG Wetzlar | IGMG Wetzlar | IGMG Wetzlar | dc:18; tsx:209 (Eigenname) |
| location | Wetzlar, Deutschland | – (nur DE in Quelle) | – (nur DE in Quelle) | dc:18 (fest); tsx:211 (Prop, Wert fehlt) |
| sampleBadge | Beispielzeiten | – (nur DE in Quelle) | – (nur DE in Quelle) | dc:19; lb:299 |
| closeLabel | Vollbild schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | dc:19 (aria-label) |
| temp | 22°C | gleich | gleich | dc:27; tsx:241 (Zahl) |
| weather | Teilweise bewölkt | Parçalı bulutlu | – (nur DE in Quelle) | dc:52–53; tsx:139 |
| sample | Beispielwert | Örnek değer | – (nur DE in Quelle) | dc:27; dc:52–53 |
| current | Aktuell | Şu an | – (nur DE in Quelle) | dc:28; dc:52–53; tsx:252 |
| next | Nächstes | Sıradaki | – (nur DE in Quelle) | dc:29; dc:52–53; tsx:260 |
| title | Heutige Gebetszeiten | Bugünkü Namaz Vakitleri | – (nur DE in Quelle) | dc:33; dc:52–53; tsx:271 |
| curMsg | Aktuelle Gebetszeit: {Gebetsname} | Şu anki namaz vakti: {Gebetsname} | – (nur DE in Quelle) | dc:52–53, dc:82; tsx:326–327 |
| nextMsg | Nächste Gebetszeit: {Gebetsname} | Sıradaki namaz vakti: {Gebetsname} | – (nur DE in Quelle) | dc:52–53, dc:82; tsx:329–330 |
| hint | ESC drücken oder X klicken zum Schließen | Kapatmak için ESC veya X'e tıklayın | – (nur DE in Quelle) | dc:45; dc:52–53; tsx:342–343 |
| prayer.imsak | Imsak | İmsak | – (nur DE in Quelle) | dc:50; tsx:80–81 |
| prayer.sunrise | Aufgang | Güneş | Sunrise (nur lb:203) | dc:50; tsx:84–85; lb:203 |
| prayer.dhuhr | Dhuhr | Öğle | – (nur DE in Quelle) | dc:50; tsx:88–89 |
| prayer.asr | Asr | İkindi | – (nur DE in Quelle) | dc:50; tsx:92–93 |
| prayer.maghrib | Maghrib | Akşam | – (nur DE in Quelle) | dc:50; tsx:96–97 |
| prayer.isha | Isha | Yatsı | – (nur DE in Quelle) | dc:50; tsx:100–101 |
| prayer.arabic | arabisch, nicht abgeschrieben | gleich | gleich | dc:49; tsx:68–73 |

Arabische Gebetsnamen werden nicht abgeschrieben (A6) und stehen nur per Fundstelle hier.

## DATEN

Die Seite nimmt keine Eingaben an. Die Tageszeiten 04:32 bis 21:05 sind Beispielwerte (dc:49; tsx:68–73), Wetter und Ort sind feste Beispiele. Alles ist als Beispiel markiert (dc:19, dc:27; G-04, G-06). Vorschlag (A7):

- Tageszeiten je Kalendertag, Zeitzone Europe/Berlin (K-08): datum (Datum, nein), imsak, sonnenaufgang, dhuhr, asr, maghrib, isha (Uhrzeit HH:MM, nein), quelle (importiert oder berechnet, nein), methode und parameter (Text, nein).
- Ort (Text): Deutsch Pflicht, Türkisch und Englisch optional mit Rückfall auf Deutsch (K-02, mehrsprachig ja).
- Wetter: Temperatur (Zahl, nein), Zustand als Schlüssel (mehrsprachig ja, über Sprachdateien). Quelle offen (lb:241).
- Gebetsnamen, Labels und Hinweise sind keine Datenbankinhalte, sondern messages/{de,tr,en}.json (K-02). Arabische Namen bleiben Inhalt (rm:14).

## FORMULARFELDER

– (entfaellt, keine Eingabefelder. Einziger Bedienpunkt ist der Schließen-Link, dc:19.)

## INTERAKTIONEN

- Schließen-Link (dc:19, aria-label „Vollbild schließen“) führt zu PrayerTimes.dc.html. Bestand: Button-Klick ruft onClose (tsx:213–220).
- Esc führt zur gleichen Stelle (dc:60). Bestand: onClose (tsx:57–58).
- Uhr, Datum, Karten und Status aktualisieren sich jede Sekunde (dc:58; tsx:32–36).
- Sprachwechsel alle 10 Sekunden, nur wenn lang leer ist (dc:59, Bedingung `if (!this.props.lang)`; tsx:45–47 ohne Prop).
- Hover am Schließen-Link: Hintergrund #065F46 (dc:19). Bestand: hover:bg-white/20 (tsx:217).
- Fokus: 2 px Weiß mit 2 px Abstand (dc:14).

## ZUSTAENDE

Eigenschaft aus data-props (dc:48): lang, Editor enum, Optionen „“ (leer), de, tr, Standard „“, TS-Typ ''|'de'|'tr'.

- lang leer: automatischer Wechsel DE/TR alle 10 Sekunden, Start Deutsch (abgeleitet aus dc:56, dc:59).
- lang de: fest Deutsch. lang tr: fest Türkisch. Englisch fehlt als Option (dc:48).

Zustände aus Design und Bestand:

- Vor dem ersten Gebet (vor 04:32): Karte Aktuell entfällt (dc:28; tsx:249). Status „Nächste Gebetszeit: Imsak“ (dc:82; tsx:328–330).
- Zwischen zwei Gebeten: Karte Aktuell mit weißer Fläche und Badge (dc:73–74). Karte Nächstes markiert (dc:71; tsx:277).
- Gebetszeit erreicht: gilt als aktuell (dc:68; tsx:172).
- Nach Isha (ab 21:05): Design zeigt „Imsak“ mit 04:32 als Nächstes (dc:69). Bestand zeigt „Imsak (Tomorrow)“ (tsx:196).
- Bestand mit isOpen falsch: nichts gerendert, Timer aus (tsx:30, 43, 54, 202). Das Design kennt keinen geschlossenen Zustand.
- Leer, Fehler, Laden, Erfolg, Schritt und angemeldet: in beiden Quellen nicht definiert.

## BILDER

- Logo: assets/logo-igmg-wetzlar.png, 40 × 40 px, weißer Grund, in weißem Kasten mit 4 px Innenabstand, alt leer (dc:18; lb:34). Datei ist im Ordner vorhanden. Eine freigestellte Fassung ab 512 px fehlt (lb:231). Bestand: kein Logo in dieser Komponente (tsx:207–221).
- Icons: „x“ 28 px (dc:19) und „sun“ 32 px (dc:27) aus Icon.dc.html, Namen dort vorhanden. Bestand: lucide X und Sun (tsx:3). Bei teilweise bewölkt zusätzlich eine Wolke (tsx:123–126). Readme-Skala 20/24 px (rm:28).
- Keine Fotos auf dieser Seite (rm:22).

## AUFFAELLIGKEITEN

1. Nach Isha: Bestand zeigt englisches „(Tomorrow)“ und markiert keine Karte (tsx:196, 277). Design zeigt „Imsak“ und markiert die Imsak-Karte (dc:69, 71).
2. Kartenlabels: Bestand groß „AKTUELL“, „ŞU AN“, „NÄCHSTES“, „SIRADAKİ“ (tsx:297, 302). Design „Aktuell“, „Şu an“, „Nächstes“, „Sıradaki“ (dc:52–53). Readme verbietet Großbuchstaben-Transformation (rm:15), das Design gilt.
3. Größen: D-12 nennt 64/96/144 px (lb:192). Gebetszeit im Design beginnt bei 48 px (dc:38), Uhr bei 64 px (dc:23).
4. Schließen-Button: Design 56 × 56 px (dc:19), Bestand 40 × 40 px rund (tsx:217). Readme verlangt mindestens 48 px (rm:21).
5. Hintergrund: Bestand Verlauf (tsx:205), Design einfarbig (dc:14, dc:16). Readme verbietet Verläufe (rm:22).
6. Ort: Design fest „Wetzlar, Deutschland“ (dc:18). Bestand Prop selectedLocation (tsx:211), ohne Wert in der Quelle.
7. Englisch: Das Vollbild-Design hat keine en-Option (dc:48), K-02 verlangt de, tr und en.
8. Laufbuch-Abweichungen: Plan nennt keine Komponenten (lb:155), Design importiert Icon zweimal (dc:19, 27). Längenliste nennt TR „Güneş Doğuşu“ (lb:203), Design und Bestand „Güneş“ (dc:50; tsx:85). D-16 „keinen Header“ (lb:281) gilt nicht für die eigene Kopfzeile (dc:17–20).
9. Datum: Vollbild schreibt Wochentag und Monat aus (dc:79; tsx:153–158). Readme nennt die Kurzform „Sa., 2. Aug.“ (rm:12).
10. K-08-Lücken: Restzeit fehlt, K-08 verlangt sie. Tageszeiten sind eine feste Liste (dc:49), nur das Datum wechselt. Die Uhrzeit folgt der Gerätezeit (dc:56; tsx:162), K-08 verlangt Europe/Berlin. Schriften kommen über Google Fonts (dc:11–13), obwohl K-08 Offline-Betrieb verlangt.

## OFFENE FRAGEN

1. Welche Gebetszeitenquelle zeigt die Anzeige, Import oder Berechnung, und welcher Hinweis (Beispielzeiten oder berechnet) bleibt sichtbar? (K-08, G-06)
2. Wer liefert die Tageszeiten für den neuen Tag, und wann wechseln sie um Mitternacht? (K-08)
3. Soll die Restzeit bis zum nächsten Gebet ergänzt werden? (K-08)
4. Wetter: Datenquelle festlegen oder die Zeile streichen (lb:241).
5. Wie lautet die Anzeige nach Isha in Deutsch, Türkisch und Englisch? (tsx:196)
6. Sollen die Kartenlabels groß geschrieben werden, wie im Bestand, oder klein, wie im Design?
7. Die englische Fassung fehlt in allen Quellen. Bleibt die Standardsprache auto oder fest Deutsch?
8. Welche tr- und en-Pfade gelten für /gebetszeiten/anzeige? (K-03)
9. Der Seitentitel fehlt im Design, weil kein title-Element vorhanden ist (dc:3–7).
10. Sollen Imsak und Iftar im Ramadan hervorgehoben werden? K-08 nennt das nur für die Monatsansicht.
11. Sollen die Schriften lokal abgelegt werden, damit der Offline-Betrieb funktioniert? Das weicht von D-02 ab (lb:183).

=== ENDE S03 · BEREIT ZUR RÜCKGABE ===
