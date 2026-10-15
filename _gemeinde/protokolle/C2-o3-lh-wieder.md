# Lighthouse mobil (Median aus 3 Läufen) · Wiederbesuch (Merker des Konzept-Hinweises gesetzt, leerer HTTP-Cache) · 2026-10-15-18-05 · http://localhost:3100

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 88 | 100 | 96 | 100 | 1816 | 0.001 | 428 | 174.8 | (93 / 3126 ms) | 86–88 | verfehlt: Performance, TBT |
| /quran/1 | 87 | 100 | 96 | 100 | 2241 | 0 | 354 | 173.6 | (91 / 3427 ms) | 87–91 | verfehlt: Performance, TBT |
| /quran/2 | 88 | 100 | 96 | 100 | 2195 | 0 | 365 | 173.6 | (93 / 3118 ms) | 87–89 | verfehlt: Performance, TBT |
| /hadith/bukhari/1 | 91 | 100 | 96 | 100 | 1830 | 0 | 337 | 170.1 | (92 / 3244 ms) | 88–92 | verfehlt: TBT |
| /elifbe/buchstaben/be | 89 | 100 | 96 | 100 | 1822 | 0 | 390 | 168.6 | (92 / 3163 ms) | 88–93 | verfehlt: Performance, TBT |
| /lernen | 89 | 100 | 96 | 100 | 1815 | 0 | 390 | 166.3 | (97 / 2487 ms) | 87–91 | verfehlt: Performance, TBT |
| /gebetszeiten | 89 | 100 | 96 | 100 | 1830 | 0 | 401 | 179.3 | (95 / 2714 ms) | 87–90 | verfehlt: Performance, TBT |

LCP-Element je Lauf (devtools):

- /: 1816 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1804 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1880 ms section.border-b > div.mx-auto > div.flex > p.max-w-text
- /quran/1: 2241 ms div > div.leser > div.mx-auto > p.rounded-lg · 2321 ms div > div.leser > div.mx-auto > p.rounded-lg · 2198 ms div > div.leser > div.mx-auto > p.rounded-lg
- /quran/2: 2195 ms div > div.leser > div.mx-auto > p.rounded-lg · 2169 ms div > div.leser > div.mx-auto > p.rounded-lg · 2226 ms div > div.leser > div.mx-auto > p.rounded-lg
- /hadith/bukhari/1: 1880 ms div.flex > div.flex > p.flex > span.text-tinte-2 · 1830 ms div.flex > div.flex > p.flex > span.text-tinte-2 · 1818 ms div.flex > div.flex > p.flex > span.text-tinte-2
- /elifbe/buchstaben/be: 1822 ms div.grid > section.flex > div.flex > p.text-18 · 1808 ms div.grid > section.flex > div.flex > p.text-18 · 1829 ms div.grid > section.flex > div.flex > p.text-18
- /lernen: 1815 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1800 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1826 ms div.mx-auto > section.flex > div.flex > p.text-20
- /gebetszeiten: 1830 ms div.flex > div.flex > span.breite-nach-muster > span · 1823 ms div.flex > div.flex > span.breite-nach-muster > span · 1849 ms div.flex > div.flex > span.breite-nach-muster > span

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/o3/lighthouse/2026-10-15-18-05
