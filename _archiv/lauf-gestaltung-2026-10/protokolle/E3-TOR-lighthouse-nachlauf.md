# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-11-20-32 · http://127.0.0.1:3400

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /kontakt | 77 | 100 | 100 | 100 | 3297 | 0 | 529 | 176.7 | (86 / 3312 ms) | 74–82 | verfehlt: Performance, LCP, TBT |
| /nachrichten/neue-gebetszeiten-fuer-den-winter | 86 | 100 | 100 | 100 | 2358 | 0 | 387 | 174.2 | (78 / 3399 ms) | 78–87 | verfehlt: Performance, TBT |
| /projekte | 81 | 100 | 100 | 100 | 1925 | 0 | 702 | 173.6 | (84 / 3536 ms) | 76–91 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-11-20-32
