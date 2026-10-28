/**
 * Testdaten: IGMG-Gebetskalender, Stadt „Aachen (DE)“, Oktober 2026 – die einzige Monatstabelle im Crawl von
 * https://www.igmg.org/gebetskalender/ (Abruf 13.10.2026, voreingestellte Stadt der Seite). Übernahme mit Zustimmung der
 * IGMG (Nutzerentscheidung 27.10.2026, `_lauf/ENTSCHEIDUNGEN.md` E-044 Nr. 1 und 3); nur als Testfixture für Import,
 * Plausibilität und Kalibrierung der Näherung (ADR 0048), nicht für die Anzeige. Koordinaten Aachen nach GeoNames
 * (`web/daten/geonames/orte.json`): 50,77664 N, 6,08342 E; die Koordinaten, mit denen die IGMG rechnet, sind unbekannt.
 *
 * `EINGEFUEGT` ist die Tabelle so, wie sie beim Kopieren aus der Seite ankommt (Ortsname, zweisprachiger Kopf, Zeilen mit
 * Leerzeichen); `TAGE` dieselben Werte als Datensätze.
 */
export const AACHEN = { breite: 50.77664, laenge: 6.08342 } as const;

export const EINGEFUEGT = `Aachen (DE)
Tarih	Datum	İmsak	Morgen	Güneş	S.aufgang	Öğle	Mittag	İkindi	N.mittag	Akşam	Abend	Yatsı	Nacht
01.10.2026 05:45 07:28 13:30 16:37 19:22 20:52
02.10.2026 05:47 07:30 13:30 16:36 19:20 20:50
03.10.2026 05:49 07:32 13:30 16:34 19:18 20:48
04.10.2026 05:51 07:33 13:30 16:32 19:16 20:45
05.10.2026 05:52 07:35 13:29 16:31 19:14 20:43
06.10.2026 05:54 07:36 13:29 16:29 19:11 20:41
07.10.2026 05:56 07:38 13:29 16:27 19:09 20:39
08.10.2026 05:57 07:40 13:28 16:26 19:07 20:36
09.10.2026 05:59 07:41 13:28 16:24 19:05 20:34
10.10.2026 06:01 07:43 13:28 16:23 19:03 20:32
11.10.2026 06:02 07:44 13:28 16:21 19:01 20:30
12.10.2026 06:04 07:46 13:27 16:19 18:58 20:28
13.10.2026 06:06 07:48 13:27 16:18 18:56 20:26
14.10.2026 06:07 07:49 13:27 16:16 18:54 20:24
15.10.2026 06:09 07:51 13:27 16:14 18:52 20:22
16.10.2026 06:10 07:53 13:26 16:13 18:50 20:20
17.10.2026 06:12 07:54 13:26 16:11 18:48 20:18
18.10.2026 06:14 07:56 13:26 16:09 18:46 20:16
19.10.2026 06:15 07:58 13:26 16:08 18:44 20:14
20.10.2026 06:17 07:59 13:26 16:06 18:42 20:12
21.10.2026 06:18 08:01 13:25 16:05 18:40 20:10
22.10.2026 06:20 08:03 13:25 16:03 18:38 20:08
23.10.2026 06:21 08:04 13:25 16:02 18:36 20:06
24.10.2026 06:23 08:06 13:25 16:00 18:34 20:04
25.10.2026 05:25 07:08 12:25 14:59 17:32 19:02
26.10.2026 05:26 07:09 12:25 14:57 17:30 19:01
27.10.2026 05:28 07:11 12:25 14:55 17:28 18:59
28.10.2026 05:29 07:13 12:24 14:54 17:26 18:57
29.10.2026 05:31 07:15 12:24 14:53 17:24 18:55
30.10.2026 05:32 07:16 12:24 14:51 17:22 18:54
31.10.2026 05:34 07:18 12:24 14:50 17:21 18:52`;

export const TAGE = EINGEFUEGT.split('\n')
  .slice(2)
  .map((zeile) => {
    const [datum, imsak, gunes, ogle, ikindi, aksam, yatsi] = zeile.split(' ');
    const [t, m, j] = datum.split('.');
    return { datum: `${j}-${m}-${t}`, imsak, gunes, ogle, ikindi, aksam, yatsi };
  });
