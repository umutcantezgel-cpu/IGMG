# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-12-15-00 · http://127.0.0.1:3100

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 82 | 100 | 100 | 100 | 1993 | 0.003 | 629 | 168 | (90 / 3296 ms) | 81–86 | verfehlt: Performance, TBT |
| /veranstaltungen | 82 | 100 | 100 | 100 | 1881 | 0.003 | 634 | 170.7 | (89 / 3556 ms) | 81–87 | verfehlt: Performance, TBT |
| /gebetszeiten | 84 | 100 | 100 | 100 | 1905 | 0 | 559 | 174.1 | (92 / 2872 ms) | 78–84 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-12-15-00
