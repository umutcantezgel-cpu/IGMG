# Lighthouse mobil (T7, K-12) · 2026-10-11-06-17 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 100 | 100 | 1604 | 0.002 | 3 | 169.2 | 93 / 3229 | erfüllt | – |
| /gebetszeiten | 99 | 100 | 100 | 100 | 1603 | 0 | 4 | 172.5 | 93 / 3154 | erfüllt | – |
| /veranstaltungen | 99 | 100 | 100 | 100 | 1609 | 0.002 | 4 | 169.1 | 93 / 3229 | erfüllt | – |
| /nachrichten | 99 | 100 | 100 | 100 | 1615 | 0.002 | 4 | 168.9 | 93 / 3153 | erfüllt | – |
| /bildung/voranmeldung | 99 | 100 | 100 | 100 | 1593 | 0.002 | 3 | 169.2 | 93 / 3205 | erfüllt | – |
| /kontakt | 99 | 100 | 100 | 100 | 1603 | 0.002 | 4 | 169.7 | 93 / 3203 | erfüllt | – |
| /mitglied-werden | 99 | 100 | 100 | 100 | 1616 | 0.002 | 2 | 169.2 | 92 / 3355 | erfüllt | – |
| /webseite-fuer-moscheen | 99 | 100 | 100 | 100 | 1594 | 0.002 | 4 | 169.2 | 93 / 3154 | erfüllt | – |
