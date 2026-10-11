# Lighthouse mobil (T7, K-12) · 2026-10-11-02-35 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|
| / | 95 | 100 | 96 | 100 | 3008 | 0 | 19 | 172.3 | verfehlt: LCP | largest-contentful-paint, errors-in-console |
| /veranstaltungen | 94 | 100 | 100 | 100 | 3061 | 0.002 | 0 | 175 | verfehlt: LCP | largest-contentful-paint |
| /veranstaltungen/frauenkreis-islamische-erziehung | 94 | 100 | 100 | 100 | 3076 | 0.002 | 9 | 177 | verfehlt: LCP | largest-contentful-paint |
