# Lighthouse mobil (T7, K-12) · 2026-10-11-04-30 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 100 | 100 | 1684 | 0.002 | 26 | 175.9 | 91 / 3380 | erfüllt | – |
| /veranstaltungen/arabisch-sprachkurs | 98 | 100 | 100 | 100 | 1899 | 0.002 | 11 | 181.9 | 91 / 3391 | verfehlt: JS | first-contentful-paint |
| /bildung/voranmeldung | 99 | 100 | 100 | 100 | 1605 | 0.002 | 17 | 178.6 | 92 / 3304 | erfüllt | – |
