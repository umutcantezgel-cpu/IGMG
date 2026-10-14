# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-12-14-54 · http://127.0.0.1:3500

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 82 | 100 | 100 | 100 | 2080 | 0.01 | 596 | 175.4 | (93 / 2953 ms) | 80–89 | verfehlt: Performance, TBT |
| /veranstaltungen | 83 | 100 | 100 | 100 | 1918 | 0 | 578 | 174.1 | (89 / 3627 ms) | 78–88 | verfehlt: Performance, TBT |
| /gebetszeiten | 84 | 100 | 100 | 100 | 1887 | 0 | 568 | 178.8 | (91 / 3314 ms) | 81–86 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-12-14-54
