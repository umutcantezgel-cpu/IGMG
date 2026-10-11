# ADR 0008 – Gebetszeiten-Quelle

- Status: angenommen · 2026-10-11 · P1 · Bezug: K-08, G-06, K-15, Z-01, Z-04 · Grundlage: Quellenbericht (igmg.org, Diyanet, adhan-js 4.4.6 Quelltext)

## Ziel
Gebetszeiten für Wetzlar, die (a) aus einer von der Gemeinde bestätigten Tabelle kommen können, (b) bis dahin ehrlich als „berechnet“ erscheinen, (c) Sommerzeit korrekt behandeln, (d) offline und auf dem Moschee-Bildschirm weiterlaufen.

## Befund
- IGMG führt Wetzlar im Gebetskalender (igmg.org/gebetskalender), aber ohne veröffentlichte Methode, Lizenz, Export oder API. Diyanet bietet keine Nutzungsbedingungen/API. → Kein automatischer Abruf (auch K-14: keine Drittanfragen).
- adhan-js 4.4.6 (MIT): Methode `Turkey` = Fajr 18°, Isha 17°, Anpassungen Sonnenaufgang −7, Dhuhr +5, Asr +4, Maghrib +7 Minuten; laut eigener Doku „Annäherung an Diyanet, außerhalb der Türkei ungenauer“. Für Breiten > 48° empfiehlt die Bibliothek `SeventhOfTheNight`; Ende Mai bis Mitte Juli erreicht die Sonne in Wetzlar −18°/−17° nicht.

## Wege
1. **Tabellen-Import** (CSV/JSON) als verbindliche Quelle, gepflegt in der Verwaltung.
2. **Berechnung** mit adhan als vorläufiger Ersatz.
3. **Abruf** von einem Dienst (IGMG, Diyanet, AlAdhan).

## Bewertung
Weg 3 scheidet aus (keine Lizenz/API, Drittanfrage). **Weg 1 + 2 umschaltbar** (Kern K-08): Import ist verbindlich, sobald vorhanden; sonst Berechnung mit Hinweis.

## Festlegungen
- Tabelle `gebetszeit_tag(datum date pk, imsak, gunes, ogle, ikindi, aksam, yatsi time, quelle enum('import','berechnet'), import_id null)` – Zeiten als Ortszeit Europe/Berlin (Wanduhr), da Tabellen so geliefert werden; Umrechnung für „nächstes Gebet“ über `@date-fns/tz` im Browser.
- `einstellung gebetszeiten`: `aktive_quelle ('import'|'berechnung')`, `methode` (Standard `Turkey`), `madhab` (Standard `Shafi` = asr-ı evvel, Diyanet-Praxis), `hohe_breite` (Standard `SeventhOfTheNight`), `anpassungen` (Minuten je Gebet, Standard 0 zusätzlich zur Methode), `koordinaten` (Standard 50.567 N, 8.500 E – Stadtpunkt Wetzlar; ersetzt durch die Moschee-Koordinaten nach M-010).
- **Imsak = Fajr der Berechnung** (18°, Diyanet-Angabe, ohne Temkin) – bis zur Bestätigung (M-017a).
- Import: CSV oder JSON mit Spalten `datum, imsak, gunes, ogle, ikindi, aksam, yatsi`; Zod-Prüfung (Format, Reihenfolge der Zeiten, lückenlose Tage), **Vorschau** vor dem Übernehmen, Import ersetzt den Zeitraum transaktional, Audit-Eintrag.
- Berechnung: `src/lib/gebetszeiten/berechnung.ts` erzeugt Tageszeiten je Datum (Datum explizit, nicht aus der Laufzeit), Rundung auf Minuten wie adhan; Ergebnis wird für Monate vorab in `gebetszeit_tag` geschrieben (Wartungsroute) **oder** beim Lesen berechnet und gecacht (Tag `gebetszeiten:<jjjj-mm>`).
- Anzeige: Hinweis-Badge „berechnet“ bzw. „Beispielzeiten“ nach Design, solange `quelle = 'berechnet'`; nach Bestätigung durch die Gemeinde (Schalter „Quelle bestätigt“ in der Verwaltung) entfällt der Hinweis (G-06).
- **Qibla:** `Qibla(coordinates)` aus adhan, fest berechnet zur Buildzeit: **≈ 128,3°** für Wetzlar (Bestandswert 136° entfällt). Kompass nur nach Klick (Geräteorientierung, Permission-Policy nur auf dieser Seite).
- Moschee-Bildschirm und PWA: Monatsdaten als statisches JSON (`/gebetszeiten/monat/<jjjj-mm>.json`, gecacht), Service Worker hält den laufenden und nächsten Monat vor.

## Umkehrprobe
Falsch, wenn die IGMG eine eigene, deutlich abweichende Berechnung nutzt (Hinweise auf ~20 Minuten Unterschied beim İmsak). Genau deshalb ist die Quelle umschaltbar und die Berechnung sichtbar markiert; die Gemeinde importiert ihre Tabelle.

## Folgen zweiter Ordnung
- Unit-Tests: Sommerzeitwechsel (letzter Sonntag im März/Oktober), Hochsommer ohne 18°-Dämmerung, Import-Fehlerfälle, nächstes Gebet über Mitternacht.
- MENSCHEN: M-017 (Quelle/Methode), M-017a (Imsak-Definition, Temkin), M-017b (Herkunft der Turkey-Anpassungen bestätigen oder streichen), M-010 (Koordinaten).
