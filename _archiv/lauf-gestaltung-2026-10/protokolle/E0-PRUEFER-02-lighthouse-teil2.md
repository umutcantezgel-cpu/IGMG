# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-11-17-39 · http://127.0.0.1:3100

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /nachrichten | 87 | 100 | 100 | 100 | 1886 | 0.001 | 436 | 170.5 | (89 / 3290 ms) | 83–88 | verfehlt: Performance, TBT |
| /ueber-uns | 87 | 100 | 100 | 100 | 1823 | 0.001 | 458 | 168 | (91 / 3329 ms) | 80–89 | verfehlt: Performance, TBT |
| /projekte | 92 | 100 | 100 | 100 | 1816 | 0.001 | 285 | 168 | (88 / 3430 ms) | 90–94 | verfehlt: TBT |
| /organisationen/ana-teskilati | 89 | 100 | 100 | 100 | 2263 | 0.001 | 323 | 168 | (85 / 3490 ms) | 81–91 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-11-17-39
