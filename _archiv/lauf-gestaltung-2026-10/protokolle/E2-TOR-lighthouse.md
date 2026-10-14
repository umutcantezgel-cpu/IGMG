# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-11-18-40 · http://127.0.0.1:3300

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 90 | 100 | 100 | 100 | 1994 | 0.004 | 364 | 172.9 | (88 / 3262 ms) | 83–91 | verfehlt: TBT |
| /ueber-uns | 91 | 100 | 100 | 100 | 1861 | 0.002 | 331 | 169.8 | (87 / 3594 ms) | 85–93 | verfehlt: TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-11-18-40
