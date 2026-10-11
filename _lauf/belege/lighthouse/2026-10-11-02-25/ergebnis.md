# Lighthouse mobil (T7, K-12) · 2026-10-11-02-25 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|
| / | 81 | 100 | 96 | 100 | 2901 | 0.269 | 19 | 190.3 | verfehlt: Performance, LCP, CLS, JS | largest-contentful-paint, cumulative-layout-shift, errors-in-console |
| /veranstaltungen | 79 | 100 | 100 | 100 | 3204 | 0.269 | 0 | 193 | verfehlt: Performance, LCP, CLS, JS | largest-contentful-paint, cumulative-layout-shift |
| /veranstaltungen/frauenkreis-islamische-erziehung | 81 | 100 | 100 | 100 | 3002 | 0.269 | 3 | 194.9 | verfehlt: Performance, LCP, CLS, JS | largest-contentful-paint, cumulative-layout-shift |
