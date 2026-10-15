# JS je Route (geladene Skripte, Playwright) · http://localhost:3100 · 2026-10-15T04:34:00.927Z

Labor-Ersatz: lokaler `next start` (gzip durch Next, kein CDN). Übertragen = Rumpfgröße mit Server-Kodierung; gzip6/gzip9 = Rumpf neu gepackt. Schwelle öffentlich ≤ 180 KB gz.

| Variante | Route | HTTP | Skripte (bis load) | übertragen kB | gzip6 kB | gzip9 kB | roh kB | bis load gzip6 | nach load gzip6 | ≤ 180 |
|---|---|---|---|---|---|---|---|---|---|---|
| erstbesuch | /islamisches-wissen | 200 | 14 (13) | 179.2 | 187.2 | 186.8 | 605.4 | 179.8 | 7.4 | NEIN |
| erstbesuch |  | 200 | 14 (12) | 168.1 | 173.7 | 173.3 | 557.6 | 169.8 | 3.9 | ja |
| erstbesuch | /gebetszeiten/anzeige | 200 | 15 (13) | 176.8 | 188.9 | 188.6 | 600.9 | 178.4 | 10.5 | NEIN |
| gesehen | /islamisches-wissen | 200 | 14 (13) | 187.7 | 187.2 | 186.8 | 605.4 | 179.8 | 7.4 | NEIN |
| gesehen |  | 200 | 14 (12) | 168.1 | 173.7 | 173.3 | 557.6 | 169.8 | 3.9 | ja |
| gesehen | /gebetszeiten/anzeige | 200 | 15 (13) | 189.6 | 188.9 | 188.6 | 600.9 | 178.4 | 10.5 | NEIN |
