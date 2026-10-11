# Lighthouse mobil (T7, K-12) · 2026-10-11-07-09 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /nachrichten | 99 | 100 | 100 | 100 | 1620 | 0.002 | 11 | 168.9 | 92 / 3355 | erfüllt | – |
| /tr/haberler | 99 | 100 | 100 | 100 | 1595 | 0.002 | 2 | 168.9 | 93 / 3153 | erfüllt | – |
