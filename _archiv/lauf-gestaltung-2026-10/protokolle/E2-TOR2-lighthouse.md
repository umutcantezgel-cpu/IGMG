# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-11-19-26 · http://127.0.0.1:3400

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 82 | 100 | 100 | 100 | 1996 | 0.002 | 656 | 173.7 | (89 / 3308 ms) | 77–85 | verfehlt: Performance, TBT |
| /ueber-uns | 86 | 100 | 100 | 100 | 1890 | 0.002 | 483 | 170.7 | (88 / 3297 ms) | 82–91 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-11-19-26
