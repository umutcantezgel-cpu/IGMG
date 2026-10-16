# Lighthouse mobil (Median aus 3 Läufen) · Wiederbesuch (Merker des Konzept-Hinweises gesetzt, leerer HTTP-Cache) · 2026-10-16-10-48 · http://localhost:3163

Maßgeblich: Drosselung „devtools“. In Klammern „simulate“ (Lighthouse-Standard, gegen localhost zu pessimistisch). Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms, JS ≤ 180 kB (gzip).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Perf.-Spanne | Befund |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 93 | 100 | 96 | 100 | 1804 | 0.001 | 271 | 174.8 | (97 / 2491 ms) | 92–94 | verfehlt: TBT |
| /quran/1 | 92 | 100 | 96 | 100 | 2256 | 0 | 241 | 173.6 | (95 / 2796 ms) | 91–92 | verfehlt: TBT |
| /quran/2 | 92 | 100 | 96 | 100 | 2180 | 0 | 229 | 173.6 | (83 / 4288 ms) | 89–93 | verfehlt: TBT |
| /hadith/bukhari/1 | 94 | 100 | 96 | 100 | 1829 | 0 | 255 | 170.1 | (92 / 3239 ms) | 89–94 | verfehlt: TBT |
| /elifbe/buchstaben/be | 93 | 100 | 96 | 100 | 1834 | 0 | 276 | 168.6 | (89 / 3632 ms) | 92–93 | verfehlt: TBT |
| /lernen | 93 | 100 | 96 | 100 | 1820 | 0 | 269 | 166.3 | (93 / 3132 ms) | 93–95 | verfehlt: TBT |
| /gebetszeiten | 94 | 100 | 96 | 100 | 1872 | 0 | 240 | 179.3 | (96 / 2711 ms) | 92–94 | verfehlt: TBT |
| /suche?q=Gebet | 94 | 100 | 96 | 69 | 1785 | 0 | 264 | 166.3 | (93 / 3120 ms) | 90–95 | verfehlt: SEO, TBT |

Wiederholte Läufe nach Laufzeitfehler von Lighthouse: 1

LCP-Element je Lauf (devtools):

- /: 1806 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1800 ms section.border-b > div.mx-auto > div.flex > p.max-w-text · 1804 ms section.border-b > div.mx-auto > div.flex > p.max-w-text
- /quran/1: 2257 ms div > div.leser > div.mx-auto > p.rounded-lg · 2256 ms div > div.leser > div.mx-auto > p.rounded-lg · 2207 ms div > div.leser > div.mx-auto > p.rounded-lg
- /quran/2: 2180 ms div > div.leser > div.mx-auto > p.rounded-lg · 2208 ms div > div.leser > div.mx-auto > p.rounded-lg · 2173 ms div > div.leser > div.mx-auto > p.rounded-lg
- /hadith/bukhari/1: 1806 ms div.flex > div.flex > p.flex > span.text-tinte-2 · 1829 ms div.flex > div.flex > p.flex > span.text-tinte-2 · 1832 ms div.flex > div.flex > p.flex > span.text-tinte-2
- /elifbe/buchstaben/be: 1816 ms div.grid > section.flex > div.flex > p.text-18 · 1840 ms div.grid > section.flex > div.flex > p.text-18 · 1834 ms div.grid > section.flex > div.flex > p.text-18
- /lernen: 1820 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1847 ms div.mx-auto > section.flex > div.flex > p.text-20 · 1800 ms div.mx-auto > section.flex > div.flex > p.text-20
- /gebetszeiten: 1914 ms div.flex > div.flex > span.breite-nach-muster > span · 1872 ms div.flex > div.flex > span.breite-nach-muster > span · 1788 ms div.flex > div.flex > span.breite-nach-muster > span
- /suche?q=Gebet: 1783 ms div > div.mx-auto > form.flex > p#suche-hinweis · 1797 ms div > div.mx-auto > form.flex > p#suche-hinweis · 1785 ms div > div.mx-auto > form.flex > p#suche-hinweis

Vollständige Berichte (je Lauf): /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c3/o3/lighthouse/2026-10-16-10-48
