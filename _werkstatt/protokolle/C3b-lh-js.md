# Lighthouse mobil (Median aus 1 Lauf) · 2026-10-12-18-57 · http://127.0.0.1:3500

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 82 | 100 | 100 | 100 | 2000 | 0.01 | 608 | 175.5 | (96 / 2492 ms) | 82–82 | verfehlt: Performance, TBT |
| /gebetszeiten | 87 | 100 | 100 | 100 | 2003 | 0 | 437 | 178.9 | (90 / 3500 ms) | 87–87 | verfehlt: Performance, TBT |
| /veranstaltungen | 88 | 100 | 100 | 100 | 2112 | 0 | 389 | 174.2 | (86 / 3630 ms) | 88–88 | verfehlt: Performance, TBT |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 86 | 100 | 100 | 100 | 2260 | 0 | 401 | 175 | (86 / 3839 ms) | 86–86 | verfehlt: Performance, TBT |
| /nachrichten | 82 | 100 | 100 | 100 | 2069 | 0 | 625 | 173.9 | (95 / 2734 ms) | 82–82 | verfehlt: Performance, TBT |
| /ueber-uns | 77 | 100 | 100 | 100 | 2088 | 0 | 876 | 171.7 | (94 / 3021 ms) | 77–77 | verfehlt: Performance, TBT |
| /projekte | 88 | 100 | 100 | 100 | 1969 | 0 | 406 | 171.7 | (85 / 3654 ms) | 88–88 | verfehlt: Performance, TBT |
| /organisationen/ana-teskilati | 78 | 100 | 100 | 100 | 2447 | 0 | 651 | 171.7 | (89 / 3450 ms) | 78–78 | verfehlt: Performance, TBT |
| /bildung/korankurse | 90 | 100 | 100 | 100 | 2056 | 0 | 312 | 171.3 | (91 / 3431 ms) | 90–90 | verfehlt: TBT |
| /bildung/voranmeldung | 81 | 100 | 100 | 100 | 1914 | 0 | 697 | 174.4 | (91 / 3260 ms) | 81–81 | verfehlt: Performance, TBT |
| /kontakt | 84 | 100 | 100 | 100 | 1925 | 0 | 572 | 174.8 | (90 / 3531 ms) | 84–84 | verfehlt: Performance, TBT |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-12-18-57
