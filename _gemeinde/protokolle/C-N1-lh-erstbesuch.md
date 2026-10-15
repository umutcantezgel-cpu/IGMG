# Lighthouse mobil (Median aus 3 Läufen) · Erstbesuch · 2026-10-15-14-46 · http://127.0.0.1:3221

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 91 | 100 | 96 | 100 | 1879 | 0.001 | 307 | 174.8 | (89 / 3332 ms) | 87–93 | verfehlt: TBT |
| /quran/1 | 90 | 100 | 96 | 100 | 2251 | 0 | 286 | 173.6 | (89 / 3620 ms) | 89–91 | verfehlt: TBT |
| /quran/2 | 86 | 100 | 96 | 100 | 2240 | 0 | 397 | 173.6 | (86 / 3870 ms) | 83–89 | verfehlt: Performance, TBT |
| /hadith/bukhari/1 | 90 | 100 | 96 | 100 | 2018 | 0 | 325 | 170.1 | (89 / 3493 ms) | 86–94 | verfehlt: TBT |
| /elifbe/buchstaben/be | 89 | 100 | 96 | 100 | 1940 | 0 | 359 | 168.6 | (90 / 3213 ms) | 86–90 | verfehlt: Performance, TBT |
| /lernen | 93 | 100 | 96 | 100 | 1881 | 0 | 266 | 166.3 | (92 / 3247 ms) | 91–94 | verfehlt: TBT |
| /gebetszeiten | 93 | 100 | 96 | 100 | 1867 | 0 | 274 | 179.4 | (89 / 3552 ms) | 93–94 | verfehlt: TBT |

Wiederholte Läufe nach Laufzeitfehler von Lighthouse: 1

LCP-Element je Lauf (devtools):

- /: 1946 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1859 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1879 ms section.border-b > div.mx-auto > div.flex > p.max-w-text
- /quran/1: 2251 ms div > div.leser > div.mx-auto > p.rounded-lg · 2299 ms div > div.leser > div.mx-auto > p.rounded-lg · 2243 ms div > div.leser > div.mx-auto > p.rounded-lg
- /quran/2: 2240 ms div > div.leser > div.mx-auto > p.rounded-lg · 2260 ms div > div.leser > div.mx-auto > p.rounded-lg · 2227 ms div > div.leser > div.mx-auto > p.rounded-lg
- /hadith/bukhari/1: 1854 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 2102 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 2018 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text
- /elifbe/buchstaben/be: 1937 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1966 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1940 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text
- /lernen: 1939 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1881 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1860 ms div.mx-auto > section.flex > div.flex > p.text-20
- /gebetszeiten: 1895 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1843 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1867 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/lighthouse/2026-10-15-14-46
