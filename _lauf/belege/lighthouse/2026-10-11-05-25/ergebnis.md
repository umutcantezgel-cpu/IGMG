# Lighthouse mobil (T7, K-12) · 2026-10-11-05-25 · http://localhost:3200

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 96 | 100 | 1625 | 0.002 | 12 | 166.4 | 93 / 3229 | erfüllt | errors-in-console |
| /gebetszeiten | 99 | 100 | 100 | 100 | 1596 | 0 | 4 | 172.5 | 92 / 3303 | erfüllt | – |
| /veranstaltungen | 99 | 100 | 100 | 100 | 1605 | 0.002 | 10 | 169.1 | 93 / 3229 | erfüllt | – |
| /veranstaltungen/frauenkreis-islamische-erziehung | 98 | 100 | 100 | 100 | 1877 | 0.002 | 11 | 172.4 | 91 / 3388 | erfüllt | first-contentful-paint |
| /nachrichten | 99 | 100 | 100 | 100 | 1596 | 0.002 | 11 | 168.9 | 92 / 3355 | erfüllt | – |
| /bildung/voranmeldung | 99 | 100 | 100 | 100 | 1611 | 0.002 | 17 | 169.1 | 93 / 3153 | erfüllt | – |
