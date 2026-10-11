# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-11-17-33 · http://127.0.0.1:3100

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 89 | 100 | 100 | 100 | 1937 | 0.001 | 375 | 168 | (91 / 2886 ms) | 81–90 | verfehlt: Performance, TBT |
| /gebetszeiten | 89 | 100 | 100 | 100 | 1858 | 0 | 395 | 174.1 | (93 / 2866 ms) | 85–89 | verfehlt: Performance, TBT |
| /veranstaltungen | 89 | 100 | 100 | 100 | 1842 | 0.001 | 385 | 170.7 | (95 / 2868 ms) | 86–94 | verfehlt: Performance, TBT |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 85 | 100 | 100 | 100 | 2215 | 0.001 | 439 | 171.5 | (90 / 3430 ms) | 81–86 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-11-17-33
