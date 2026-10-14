# Lighthouse mobil (Median aus 3 Läufen) · 2026-10-11-20-01 · http://127.0.0.1:3400

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 77 | 100 | 100 | 100 | 2162 | 0 | 764 | 176.7 | (89 / 2953 ms) | 77–85 | verfehlt: Performance, TBT |
| /gebetszeiten | 77 | 100 | 100 | 100 | 3294 | 0 | 528 | 179.1 | (88 / 3126 ms) | 69–84 | verfehlt: Performance, LCP, TBT |
| /veranstaltungen | 76 | 100 | 100 | 100 | 3334 | 0 | 598 | 175.8 | (75 / 3388 ms) | 73–78 | verfehlt: Performance, LCP, TBT |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 82 | 100 | 100 | 100 | 2375 | 0 | 532 | 176.4 | (77 / 3741 ms) | 79–88 | verfehlt: Performance, TBT |
| /nachrichten | 72 | 100 | 100 | 100 | 3419 | 0 | 683 | 175.5 | (80 / 3341 ms) | 71–76 | verfehlt: Performance, LCP, TBT |
| /nachrichten/neue-gebetszeiten-fuer-den-winter | 75 | 100 | 100 | 100 | 2333 | 0 | 719.5 | 174.2 | (74 / 3607 ms) | 0–82 | verfehlt: Performance, TBT |
| /ueber-uns | 81 | 100 | 100 | 100 | 2515 | 0 | 568 | 173.6 | (82 / 2955 ms) | 72–83 | verfehlt: Performance, LCP, TBT |
| /projekte | 77 | 100 | 100 | 100 | 2008.5 | 0 | 791.5 | 173.6 | (85 / 2826 ms) | 0–80 | verfehlt: Performance, TBT |
| /organisationen/ana-teskilati | 77 | 100 | 100 | 100 | 2415 | 0 | 658 | 171.8 | (83 / 3806 ms) | 77–86 | verfehlt: Performance, TBT |
| /bildung/korankurse | 84 | 100 | 100 | 100 | 1960 | 0 | 553 | 171.8 | (92 / 2574 ms) | 81–85 | verfehlt: Performance, TBT |
| /bildung/voranmeldung | 85 | 100 | 100 | 100 | 1959 | 0 | 508 | 175.8 | (54 / 4417 ms) | 76–90 | verfehlt: Performance, TBT |
| /kontakt | 72 | 100 | 100 | 100 | 3389 | 0 | 628 | 176.7 | (81 / 3567 ms) | 0–77 | verfehlt: Performance, LCP, TBT |
| /gibt-es-nicht | 0 | 0 | 0 | 0 | NaN | NaN | NaN | 0 | (0 / NaN ms) | 0–0 | verfehlt: Performance, Barrierefreiheit, Best Practices, SEO |

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/lighthouse/2026-10-11-20-01
