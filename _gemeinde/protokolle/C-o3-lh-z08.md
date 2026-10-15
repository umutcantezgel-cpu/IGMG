# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-15-03-45 · http://localhost:3100

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 94 | 100 | 96 | 100 | 1944 | 0.001 | 234 | 183.1 | (91 / 3395 ms) | 94–94 | verfehlt: TBT, JS |
| /quran/1 | 89 | 100 | 96 | 100 | 2508 | 0 | 224 | 180.6 | (87 / 3856.5 ms) | 86–90 | verfehlt: Performance, LCP, TBT, JS |
| /quran/2 | 76 | 100 | 96 | 100 | 2541 | 0 | 665 | 180.6 | (79 / 4217 ms) | 75–76 | verfehlt: Performance, LCP, TBT, JS |
| /hadith/bukhari/1 | 76 | 100 | 96 | 100 | 4393 | 0 | 260 | 177.1 | (88 / 3830 ms) | 74–77 | verfehlt: Performance, LCP, TBT |
| /elifbe/buchstaben/be | 72 | 100 | 96 | 100 | 4515 | 0 | 330 | 176.9 | (88 / 3650 ms) | 72–73 | verfehlt: Performance, LCP, TBT |
| /lernen | 95 | 100 | 96 | 100 | 1916 | 0 | 196 | 174.6 | (91 / 3323 ms) | 94–95 | erfüllt |
| /gebetszeiten | 94 | 100 | 96 | 100 | 1908 | 0 | 222 | 187.4 | (89 / 3627 ms) | 93–95 | verfehlt: TBT, JS |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/o3/lighthouse/2026-10-15-03-45
