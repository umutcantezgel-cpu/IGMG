# Lighthouse mobil (T7, K-12) · 2026-10-11-04-33 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 100 | 100 | 1694 | 0.002 | 22 | 166.4 | 93 / 3229 | erfüllt | – |
| /gebetszeiten | 99 | 100 | 100 | 100 | 1596 | 0 | 4 | 188.3 | 92 / 3303 | verfehlt: JS | – |
| /veranstaltungen | 99 | 100 | 100 | 100 | 1610 | 0.002 | 11 | 169.1 | 93 / 3229 | erfüllt | – |
| /veranstaltungen/frauenkreis-islamische-erziehung | 98 | 100 | 100 | 100 | 1889 | 0.002 | 10 | 172.4 | 91 / 3384 | erfüllt | first-contentful-paint |
| /nachrichten | 99 | 100 | 100 | 90 | 1604 | 0.002 | 10 | 168.9 | 93 / 3153 | verfehlt: SEO | link-text |
| /bildung/voranmeldung | 99 | 100 | 100 | 100 | 1612 | 0.002 | 12 | 169.1 | 92 / 3354 | erfüllt | – |
