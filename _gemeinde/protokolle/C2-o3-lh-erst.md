# Lighthouse mobil (Median aus 3 Läufen) · Erstbesuch · 2026-10-15-17-52 · http://localhost:3100

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 91 | 100 | 96 | 100 | 1857 | 0.001 | 329 | 174.8 | (91 / 3323 ms) | 91–93 | verfehlt: TBT |
| /quran/1 | 88 | 100 | 96 | 100 | 2267 | 0 | 355 | 173.6 | (87 / 3648 ms) | 87–90 | verfehlt: Performance, TBT |
| /quran/2 | 90 | 100 | 96 | 100 | 2205 | 0 | 307 | 173.6 | (87 / 3411 ms) | 87–92 | verfehlt: TBT |
| /hadith/bukhari/1 | 93 | 100 | 96 | 100 | 1848 | 0 | 279 | 170.1 | (94 / 2878 ms) | 92–93 | verfehlt: TBT |
| /elifbe/buchstaben/be | 89 | 100 | 96 | 100 | 1876 | 0 | 386 | 168.6 | (91 / 3356 ms) | 88–92 | verfehlt: Performance, TBT |
| /lernen | 92 | 100 | 96 | 100 | 1842 | 0 | 302 | 166.3 | (92 / 3248 ms) | 91–94 | verfehlt: TBT |
| /gebetszeiten | 91 | 100 | 96 | 100 | 1835 | 0 | 336 | 179.3 | (89 / 3549 ms) | 89–93 | verfehlt: TBT |

Wiederholte Läufe nach Laufzeitfehler von Lighthouse: 1

LCP-Element je Lauf (devtools):

- /: 1927 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1857 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1845 ms section.border-b > div.mx-auto > div.flex > p.max-w-text
- /quran/1: 2238 ms div > div.leser > div.mx-auto > p.rounded-lg · 2389 ms div > div.leser > div.mx-auto > p.rounded-lg · 2267 ms div > div.leser > div.mx-auto > p.rounded-lg
- /quran/2: 2205 ms div > div.leser > div.mx-auto > p.rounded-lg · 2200 ms div > div.leser > div.mx-auto > p.rounded-lg · 2259 ms div > div.leser > div.mx-auto > p.rounded-lg
- /hadith/bukhari/1: 1831 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1862 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1848 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text
- /elifbe/buchstaben/be: 1884 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1867 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1876 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text
- /lernen: 1835 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1842 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1889 ms div.mx-auto > section.flex > div.flex > p.text-20
- /gebetszeiten: 1832 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1918 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1835 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/o3/lighthouse/2026-10-15-17-52
