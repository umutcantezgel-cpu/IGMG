# Lighthouse mobil (T7, K-12) · 2026-10-11-07-49 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /meldung | 99 | 100 | 100 | 100 | 1625 | 0.002 | 13 | 169.2 | 92 / 3355 | erfüllt | – |
| /tr/bildirim | 99 | 100 | 100 | 100 | 1583 | 0.002 | 2 | 169.2 | 93 / 3206 | erfüllt | – |
| /kontakt | 99 | 100 | 100 | 100 | 1590 | 0.002 | 13 | 169.7 | 92 / 3355 | erfüllt | – |
| /nachrichten | 99 | 100 | 100 | 100 | 1612 | 0.002 | 12 | 168.9 | 92 / 3305 | erfüllt | – |
| / | 99 | 100 | 100 | 100 | 1605 | 0.002 | 9 | 169.2 | 93 / 3229 | erfüllt | – |
