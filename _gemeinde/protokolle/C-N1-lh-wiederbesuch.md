# Lighthouse mobil (Median aus 3 Läufen) · Wiederbesuch (Merker des Konzept-Hinweises gesetzt, leerer HTTP-Cache) · 2026-10-15-14-32 · http://127.0.0.1:3221

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 89 | 100 | 96 | 100 | 1919 | 0.001 | 361 | 174.8 | (96 / 2496 ms) | 87–91 | verfehlt: Performance, TBT |
| /quran/1 | 86 | 100 | 96 | 100 | 2305 | 0 | 410 | 173.6 | (91 / 2811 ms) | 80–86 | verfehlt: Performance, TBT |
| /quran/2 | 85 | 100 | 96 | 100 | 2226 | 0 | 436 | 173.6 | (86 / 3783 ms) | 82–87 | verfehlt: Performance, TBT |
| /hadith/bukhari/1 | 89 | 100 | 96 | 100 | 1828 | 0 | 375 | 170.1 | (91 / 3254 ms) | 87–91 | verfehlt: Performance, TBT |
| /elifbe/buchstaben/be | 87 | 100 | 96 | 100 | 1871 | 0 | 448 | 168.6 | (92 / 3185 ms) | 84–89 | verfehlt: Performance, TBT |
| /lernen | 91 | 100 | 96 | 100 | 1834 | 0 | 334 | 166.3 | (94 / 2492 ms) | 89–92 | verfehlt: TBT |
| /gebetszeiten | 87 | 100 | 96 | 100 | 1934 | 0 | 435 | 179.4 | (91 / 3388 ms) | 87–89 | verfehlt: Performance, TBT |

LCP-Element je Lauf (devtools):

- /: 1919 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1871 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 2033 ms section.border-b > div.mx-auto > div.flex > p.max-w-text
- /quran/1: 2667 ms div > div.leser > div.mx-auto > p.rounded-lg · 2270 ms div > div.leser > div.mx-auto > p.rounded-lg · 2305 ms div > div.leser > div.mx-auto > p.rounded-lg
- /quran/2: 2180 ms div > div.leser > div.mx-auto > p.rounded-lg · 2226 ms div > div.leser > div.mx-auto > p.rounded-lg · 2255 ms div > div.leser > div.mx-auto > p.rounded-lg
- /hadith/bukhari/1: 1803 ms div.flex > div.flex > p.flex > span.text-tinte-2 · 1875 ms div.flex > div.flex > p.flex > span.text-tinte-2 · 1828 ms div.flex > div.flex > p.flex > span.text-tinte-2
- /elifbe/buchstaben/be: 1887 ms div.grid > section.flex > div.flex > p.text-18 · 1871 ms div.grid > section.flex > div.flex > p.text-18 · 1829 ms div.grid > section.flex > div.flex > p.text-18
- /lernen: 1834 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1886 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1830 ms div.mx-auto > section.flex > div.flex > p.text-20
- /gebetszeiten: 1972 ms div.flex > div.flex > span.breite-nach-muster > span · 1889 ms div.flex > div.flex > span.breite-nach-muster > span · 1934 ms div.flex > div.flex > span.breite-nach-muster > span

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/lighthouse/2026-10-15-14-32
