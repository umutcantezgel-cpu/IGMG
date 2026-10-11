# Lighthouse mobil (T7, K-12) · 2026-10-11-03-19 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 96 | 100 | 1657 | 0.002 | 22 | 172.9 | 92 / 3352 | erfüllt | errors-in-console |
| /gebetszeiten/anzeige | 96 | 100 | 96 | 100 | 1557 | 0.102 | 9 | 166.1 | 95 / 2854 | verfehlt: CLS | cumulative-layout-shift, errors-in-console |
