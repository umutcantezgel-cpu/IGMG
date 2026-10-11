# Lighthouse mobil (T7, K-12) · 2026-10-11-04-24 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 100 | 100 | 1654 | 0.002 | 15 | 184.6 | 91 / 3437 | verfehlt: JS | – |
| /veranstaltungen/arabisch-sprachkurs | 98 | 100 | 100 | 100 | 1892 | 0.002 | 12 | 190.6 | 91 / 3387 | verfehlt: JS | first-contentful-paint |
| /bildung/voranmeldung | 99 | 100 | 100 | 100 | 1596 | 0.002 | 14 | 187.3 | 92 / 3358 | verfehlt: JS | – |
| /nachrichten | 99 | 100 | 100 | 90 | 1612 | 0.002 | 13 | 187.1 | 92 / 3303 | verfehlt: SEO, JS | link-text |
| /gebetszeiten | 99 | 100 | 100 | 100 | 1585 | 0 | 4 | 206.4 | 92 / 3303 | verfehlt: JS | – |
