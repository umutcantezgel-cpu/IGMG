# Lighthouse mobil (T7, K-12) · 2026-10-11-04-27 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 100 | 100 | 1655 | 0.002 | 22 | 181 | 91 / 3381 | verfehlt: JS | – |
| /veranstaltungen/arabisch-sprachkurs | 99 | 100 | 100 | 100 | 1611 | 0.002 | 12 | 187 | 91 / 3387 | verfehlt: JS | – |
| /bildung/voranmeldung | 99 | 100 | 100 | 100 | 1599 | 0.002 | 24 | 183.7 | 92 / 3355 | verfehlt: JS | – |
