# Lighthouse mobil (T7, K-12) · 2026-10-11-09-07 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 98 | 100 | 100 | 100 | 1808 | 0.002 | 100 | 168 | 92 / 3308 | erfüllt | first-contentful-paint |
| /gebetszeiten | 98 | 100 | 100 | 100 | 1778 | 0 | 95 | 174.1 | 90 / 3366 | erfüllt | – |
| /veranstaltungen | 99 | 100 | 100 | 100 | 1609 | 0.002 | 18 | 170.7 | 92 / 3305 | erfüllt | – |
| /veranstaltungen/frauenkreis-islamische-erziehung | 98 | 100 | 100 | 100 | 1885 | 0.002 | 20 | 171.5 | 94 / 3014 | erfüllt | first-contentful-paint |
| /nachrichten | 99 | 100 | 100 | 100 | 1610 | 0.002 | 17 | 170.5 | 92 / 3304 | erfüllt | – |
| /bildung/voranmeldung | 99 | 100 | 100 | 100 | 1586 | 0.002 | 20 | 170.9 | 92 / 3304 | erfüllt | – |
