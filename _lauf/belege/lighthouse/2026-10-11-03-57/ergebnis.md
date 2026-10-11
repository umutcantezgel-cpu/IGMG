# Lighthouse mobil (T7, K-12) · 2026-10-11-03-57 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /veranstaltungen/jugendgruppe-treffen | 98 | 100 | 100 | 100 | 1878 | 0.002 | 8 | 178.7 | 92 / 3316 | erfüllt | first-contentful-paint |
| /veranstaltungen/arabisch-sprachkurs | 98 | 100 | 100 | 100 | 1878 | 0.002 | 13 | 178.7 | 92 / 3312 | erfüllt | first-contentful-paint |
