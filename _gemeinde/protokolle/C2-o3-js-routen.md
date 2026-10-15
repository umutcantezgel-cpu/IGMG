# JS je Route (geladene Skripte, Playwright) · http://localhost:3100 · 2026-10-15T18:28:57.967Z

Labor-Ersatz: lokaler `next start` (gzip durch Next, kein CDN). Übertragen = Rumpfgröße mit Server-Kodierung; gzip6/gzip9 = Rumpf neu gepackt. Schwelle öffentlich ≤ 180 KB gz.

| Variante | Route | HTTP | Skripte (bis load) | übertragen kB | gzip6 kB | gzip9 kB | roh kB | bis load gzip6 | nach load gzip6 | ≤ 180 |
|---|---|---|---|---|---|---|---|---|---|---|
| erstbesuch | / | 200 | 14 (12) | 159.8 | 165.4 | 165 | 533.3 | 161.5 | 3.9 | ja |
| erstbesuch | /quran/1 | 200 | 16 (12) | 156.5 | 182.2 | 181.8 | 581.3 | 160.3 | 21.9 | NEIN |
| erstbesuch | /quran/2 | 200 | 17 (12) | 157.6 | 183.2 | 182.9 | 583.2 | 160.3 | 22.9 | NEIN |
| erstbesuch | /hadith/bukhari/1 | 200 | 15 (12) | 154.1 | 174.8 | 174.5 | 560.2 | 156.8 | 18 | ja |
| erstbesuch | /elifbe/buchstaben/be | 200 | 13 (12) | 154.7 | 162.6 | 162.3 | 527.3 | 155.3 | 7.4 | ja |
| erstbesuch | /lernen | 200 | 12 (11) | 161.9 | 161.5 | 161.1 | 524.7 | 154.1 | 7.4 | ja |
| erstbesuch | /gebetszeiten | 200 | 14 (13) | 164.4 | 172.1 | 171.8 | 554.1 | 164.8 | 7.4 | ja |
| gesehen | / | 200 | 14 (12) | 159.8 | 165.4 | 165 | 533.3 | 161.5 | 3.9 | ja |
| gesehen | /quran/1 | 200 | 16 (12) | 156.5 | 182.2 | 181.8 | 581.3 | 160.3 | 21.9 | NEIN |
| gesehen | /quran/2 | 200 | 17 (12) | 179.1 | 183.2 | 182.9 | 583.2 | 160.3 | 22.9 | NEIN |
| gesehen | /hadith/bukhari/1 | 200 | 15 (12) | 154.1 | 174.8 | 174.5 | 560.2 | 156.8 | 18 | ja |
| gesehen | /elifbe/buchstaben/be | 200 | 13 (12) | 154.7 | 162.6 | 162.3 | 527.3 | 155.3 | 7.4 | ja |
| gesehen | /lernen | 200 | 12 (11) | 153.5 | 161.5 | 161.1 | 524.7 | 154.1 | 7.4 | ja |
| gesehen | /gebetszeiten | 200 | 14 (13) | 164.4 | 172.1 | 171.8 | 554.1 | 164.8 | 7.4 | ja |
