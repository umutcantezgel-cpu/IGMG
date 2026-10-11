# Lighthouse mobil (T7, K-12) · 2026-10-11-03-17 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 96 | 100 | 1590 | 0.002 | 9 | 172.9 | 92 / 3353 | erfüllt | errors-in-console |
| /veranstaltungen | 99 | 100 | 100 | 100 | 1591 | 0.002 | 11 | 175.5 | 92 / 3355 | erfüllt | – |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 98 | 100 | 100 | 100 | 1871 | 0.002 | 6 | 177.5 | 92 / 3235 | erfüllt | first-contentful-paint |
| /gebetszeiten/anzeige | 87 | 100 | 96 | 100 | 3261 | 0.135 | 8 | 165.9 | 87 / 3305 | verfehlt: Performance, LCP, CLS | largest-contentful-paint, cumulative-layout-shift, errors-in-console |
