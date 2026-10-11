# Lighthouse mobil (T7, K-12) · 2026-10-11-02-57 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 96 | 100 | 1587 | 0.002 | 11 | 172.9 | 93 / 3125 | erfüllt | errors-in-console |
| /veranstaltungen | 99 | 100 | 100 | 100 | 1583 | 0.002 | 10 | 175.5 | 94 / 3079 | erfüllt | – |
| /veranstaltungen/frauenkreis-islamische-erziehung | 98 | 100 | 100 | 100 | 1869 | 0.002 | 8 | 177.5 | 94 / 3082 | erfüllt | first-contentful-paint |
