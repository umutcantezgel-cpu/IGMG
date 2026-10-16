# Lighthouse mobil (Median aus 3 Läufen) · Erstbesuch · 2026-10-16-10-35 · http://localhost:3163

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 95 | 100 | 96 | 100 | 1818 | 0.001 | 199 | 174.8 | (91 / 3259 ms) | 95–97 | erfüllt |
| /quran/1 | 95 | 100 | 96 | 100 | 2213 | 0 | 133 | 173.6 | (89 / 3632 ms) | 92–95 | erfüllt |
| /quran/2 | 93 | 100 | 96 | 100 | 2189 | 0 | 211 | 173.6 | (85 / 3934 ms) | 92–93 | verfehlt: TBT |
| /hadith/bukhari/1 | 91 | 100 | 96 | 100 | 1841 | 0 | 318 | 170.1 | (91 / 3398 ms) | 91–96 | verfehlt: TBT |
| /elifbe/buchstaben/be | 94 | 100 | 96 | 100 | 1836 | 0 | 221 | 168.6 | (92 / 3251 ms) | 93–96 | verfehlt: TBT |
| /lernen | 95 | 100 | 96 | 100 | 1825 | 0 | 208 | 166.3 | (91 / 3248 ms) | 95–95 | verfehlt: TBT |
| /gebetszeiten | 96 | 100 | 96 | 100 | 1839 | 0 | 174 | 179.3 | (89 / 3547 ms) | 96–96 | erfüllt |
| /suche?q=Gebet | 97 | 100 | 96 | 63 | 1802 | 0 | 155 | 166.3 | (90 / 3461 ms) | 97–98 | verfehlt: SEO |

LCP-Element je Lauf (devtools):

- /: 1848 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1818 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1803 ms section.border-b > div.mx-auto > div.flex > p.max-w-text
- /quran/1: 2192 ms div > div.leser > div.mx-auto > p.rounded-lg · 2213 ms div > div.leser > div.mx-auto > p.rounded-lg · 2240 ms div > div.leser > div.mx-auto > p.rounded-lg
- /quran/2: 2189 ms div > div.leser > div.mx-auto > p.rounded-lg · 2179 ms div > div.leser > div.mx-auto > p.rounded-lg · 2244 ms div > div.leser > div.mx-auto > p.rounded-lg
- /hadith/bukhari/1: 1812 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1841 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1863 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text
- /elifbe/buchstaben/be: 1829 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1836 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1851 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text
- /lernen: 1825 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1802 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1829 ms div.mx-auto > section.flex > div.flex > p.text-20
- /gebetszeiten: 1831 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1839 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text · 1887 ms body > dialog#konzepthinweis > div.bg-warnung-toenung > p#hinweis-text
- /suche?q=Gebet: 1809 ms div > div.mx-auto > form.flex > p#suche-hinweis · 1802 ms div > div.mx-auto > form.flex > p#suche-hinweis · 1796 ms div > div.mx-auto > form.flex > p#suche-hinweis

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c3/o3/lighthouse/2026-10-16-10-35
