# Kalibrierung „IGMG (angenähert)“ – 2026-10-28

Erzeugt mit `pnpm gebetszeiten:kalibrieren` (ADR 0048). Grundlage: IGMG-Gebetskalender-Aachen-2026-10; 31 Tage (2026-10),
Koordinaten 50.77664 N, 6.08342 E. Die Einstellung wurde nicht geändert; übernommen wird in der Verwaltung.

Nachtrag von Hand: Die Daten sind die Aachen-Tabelle aus dem Crawl von igmg.org (Abruf 13.10.2026), mit Zustimmung der IGMG
als Testdaten unter `tests/hilfen/igmg-aachen-2026-10.ts` abgelegt (E-044). Der gespeicherte Standard (`STANDARD_NAEHERUNG`,
İmsak −17 s, İkindi +360 s) liegt im selben gleich guten Temkin-Bereich wie der Vorschlag (−18 s, +359 s) und trifft gleich
viele Tage. Für Wetzlar fehlen Vergleichsdaten; im Sommer ist die Näherung nicht belegt (Warnung „ohneSommer“).

## Vorschlag

```json
{
  "fajrWinkel": 18,
  "ishaWinkel": 18,
  "temkinSek": {
    "imsak": -18,
    "gunes": -447,
    "ogle": 308,
    "ikindi": 359,
    "aksam": 507,
    "yatsi": -667
  },
  "hoheBreite": "twilightangle"
}
```

Warnungen: einMonat, ohneSommer.

### Güte des Vorschlags

| Gebet  | Tage | exakt | größte Abweichung (Min.) | mittlere Abweichung (Min.) |
| ------ | ---- | ----- | ------------------------ | -------------------------- |
| imsak  | 31   | 31    | 0                        | 0                          |
| gunes  | 31   | 31    | 0                        | 0                          |
| ogle   | 31   | 29    | 1                        | 0.06                       |
| ikindi | 31   | 30    | 1                        | 0.03                       |
| aksam  | 31   | 30    | 1                        | 0.03                       |
| yatsi  | 31   | 30    | 1                        | 0.03                       |

Kreuzprobe entfällt (nur ein Monat).

### Vorschlag im Monat 2026-10

| Gebet  | Tage | exakt | größte Abweichung (Min.) | mittlere Abweichung (Min.) |
| ------ | ---- | ----- | ------------------------ | -------------------------- |
| imsak  | 31   | 31    | 0                        | 0                          |
| gunes  | 31   | 31    | 0                        | 0                          |
| ogle   | 31   | 29    | 1                        | 0.06                       |
| ikindi | 31   | 30    | 1                        | 0.03                       |
| aksam  | 31   | 30    | 1                        | 0.03                       |
| yatsi  | 31   | 30    | 1                        | 0.03                       |

## Drift

### Gespeicherte Näherung

| Gebet  | Tage | exakt | größte Abweichung (Min.) | mittlere Abweichung (Min.) |
| ------ | ---- | ----- | ------------------------ | -------------------------- |
| imsak  | 31   | 31    | 0                        | 0                          |
| gunes  | 31   | 31    | 0                        | 0                          |
| ogle   | 31   | 29    | 1                        | 0.06                       |
| ikindi | 31   | 30    | 1                        | 0.03                       |
| aksam  | 31   | 30    | 1                        | 0.03                       |
| yatsi  | 31   | 30    | 1                        | 0.03                       |

### Methode Turkey (seventhofthenight)

| Gebet  | Tage | exakt | größte Abweichung (Min.) | mittlere Abweichung (Min.) |
| ------ | ---- | ----- | ------------------------ | -------------------------- |
| imsak  | 31   | 19    | 5                        | 0.74                       |
| gunes  | 31   | 18    | 1                        | 0.42                       |
| ogle   | 31   | 26    | 1                        | 0.16                       |
| ikindi | 31   | 0     | 2                        | 1.97                       |
| aksam  | 31   | 0     | 2                        | 1.48                       |
| yatsi  | 31   | 0     | 5                        | 4.65                       |
