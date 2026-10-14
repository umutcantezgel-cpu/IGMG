# Zusätzlicher Code für Bewegung (BUDGETS ≤ 60 KB gz) · Build fa5c005 · 2026-10-12 07:10 UTC

Bewegung läuft nur über CSS (Keyframes, Transitions, View Transitions); JavaScript nur für Auslöser. Gemessen: Quelltext der Auslöser (gzip) und der Bewegungsteil von globals.css; zur Gegenprobe die ausgelieferten Chunks, in denen die Auslöser stehen.

| Datei | Quelltext gz (Byte) |
|---|---|
| `src/components/website/SeitenUebergang.tsx` | 2028 |
| `src/components/website/ErstesSichtbarwerden.tsx` | 935 |
| `src/components/website/NachRuhe.tsx` | 485 |
| `src/lib/zeit/useNachRuhe.ts` | 602 |
| `globals.css` Keyframes und Bewegungsklassen (Zeilen mit @keyframes … bis Reduziert-Block) | 2703 |

Ausgelieferte Chunks mit den Auslösern (enthalten auch anderen Code, daher Obergrenze):

- `startViewTransition` in `0h_4419r_x0ct.js`: 11924 Byte gz
- `startViewTransition` in `2cf-1ar8micdv.js`: 73516 Byte gz
- `data-ruhe` in `0c7f577lef6ar.js`: 1891 Byte gz
- `requestIdleCallback` in `0c7f577lef6ar.js`: 1891 Byte gz
- `requestIdleCallback` in `0x-g5oyj7ffrs.js`: 10512 Byte gz
- `requestIdleCallback` in `39ppdpj0fmyhe.js`: 5670 Byte gz

Keine Bewegungsbibliothek in `web/package.json` (kein framer-motion, motion, gsap, animejs): 0 Treffer.
