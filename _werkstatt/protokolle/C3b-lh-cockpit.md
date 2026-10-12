# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-12-20-38 · http://127.0.0.1:3500

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /verwaltung/startklar | 82 | 100 | 100 | 66 | 2052 | 0.001 | 553 | 253 | (88 / 3518 ms) | 80–86 | verfehlt: Performance, SEO, TBT, JS |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-12-20-38
