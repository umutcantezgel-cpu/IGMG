# JS je Route (geladene Skripte, Playwright) · http://localhost:3100 · 2026-10-15T03:59:37.164Z

Labor-Ersatz: lokaler `next start` (gzip durch Next, kein CDN). Übertragen = Rumpfgröße mit Server-Kodierung; gzip6/gzip9 = Rumpf neu gepackt. Schwelle öffentlich ≤ 180 KB gz.

| Variante | Route | HTTP | Skripte (bis load) | übertragen kB | gzip6 kB | gzip9 kB | roh kB | bis load gzip6 | nach load gzip6 | ≤ 180 |
|---|---|---|---|---|---|---|---|---|---|---|
| erstbesuch | / | 200 | 14 (12) | 168.1 | 173.7 | 173.3 | 557.6 | 169.8 | 3.9 | ja |
| erstbesuch | /quran/1 | 200 | 16 (12) | 163.5 | 189 | 188.6 | 601.7 | 167.3 | 21.7 | NEIN |
| erstbesuch | /quran/2 | 200 | 17 (12) | 162.4 | 189.9 | 189.6 | 603.5 | 167.3 | 22.7 | NEIN |
| erstbesuch | /hadith/bukhari/1 | 200 | 15 (12) | 161.1 | 181.7 | 181.3 | 580.6 | 163.8 | 17.9 | NEIN |
| erstbesuch | /elifbe/buchstaben/be | 200 | 13 (12) | 163 | 170.9 | 170.6 | 551.6 | 163.6 | 7.4 | ja |
| erstbesuch | /lernen | 200 | 12 (11) | 161.8 | 169.8 | 169.4 | 549 | 162.4 | 7.4 | ja |
| erstbesuch | /gebetszeiten | 200 | 14 (13) | 172.5 | 180.3 | 179.9 | 578 | 172.9 | 7.4 | NEIN |
| gesehen | / | 200 | 14 (12) | 168.1 | 173.7 | 173.3 | 557.6 | 169.8 | 3.9 | ja |
| gesehen | /quran/1 | 200 | 16 (12) | 163.5 | 189 | 188.6 | 601.7 | 167.3 | 21.7 | NEIN |
| gesehen | /quran/2 | 200 | 17 (12) | 164.5 | 189.9 | 189.6 | 603.5 | 167.3 | 22.7 | NEIN |
| gesehen | /hadith/bukhari/1 | 200 | 15 (12) | 161.1 | 181.7 | 181.3 | 580.6 | 163.8 | 17.9 | NEIN |
| gesehen | /elifbe/buchstaben/be | 200 | 13 (12) | 163 | 170.9 | 170.6 | 551.6 | 163.6 | 7.4 | ja |
| gesehen | /lernen | 200 | 12 (11) | 161.8 | 169.8 | 169.4 | 549 | 162.4 | 7.4 | ja |
| gesehen | /gebetszeiten | 200 | 14 (13) | 172.5 | 180.3 | 179.9 | 578 | 172.9 | 7.4 | NEIN |
