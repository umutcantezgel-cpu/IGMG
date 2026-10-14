# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-11-17-46 · http://127.0.0.1:3100

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /bildung/korankurse | 89 | 100 | 100 | 100 | 1895 | 0.001 | 367 | 168 | (90 / 3379 ms) | 88–89 | verfehlt: Performance, TBT |
| /bildung/voranmeldung | 89 | 100 | 100 | 100 | 1831 | 0.001 | 393 | 170.9 | (90 / 3572 ms) | 86–93 | verfehlt: Performance, TBT |
| /kontakt | 89 | 100 | 100 | 100 | 1895 | 0.001 | 357 | 171.4 | (90 / 3497 ms) | 83–90 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-11-17-46
